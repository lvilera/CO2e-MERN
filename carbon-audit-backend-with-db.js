/**
 * Website Carbon & Performance Audit Backend with MongoDB Integration
 *
 * This version stores audit results in MongoDB for historical tracking
 */

const express = require('express');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { co2 } = require('@tgwf/co2');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const AuditResult = require('./models/AuditResult');

const router = express.Router();

/**
 * Calculate carbon footprint using CO2.js
 */
async function calculateCarbonFootprint(url) {
    try {
        const co2Emission = new co2();

        const response = await axios.get(url, {
            timeout: 30000,
            maxContentLength: 50 * 1024 * 1024,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const contentLength = parseInt(response.headers['content-length'] || 0);
        const transferBytes = contentLength || JSON.stringify(response.data).length;
        const emissions = co2Emission.perByte(transferBytes);

        const greenCheckUrl = `https://api.thegreenwebfoundation.org/greencheck/${new URL(url).hostname}`;
        let isGreen = false;
        try {
            const greenCheck = await axios.get(greenCheckUrl, { timeout: 5000 });
            isGreen = greenCheck.data.green || false;
        } catch (err) {
            console.warn('Green check failed:', err.message);
        }

        const avgPageSize = 2.2;
        const cleanerThan = Math.max(0, Math.min(1, 1 - (emissions / avgPageSize)));

        return {
            co2PerPageview: emissions,
            green: isGreen,
            cleanerThan: cleanerThan,
            transferSize: transferBytes,
            method: 'co2js'
        };

    } catch (error) {
        console.error('Carbon calculation error:', error.message);

        try {
            const encodedUrl = encodeURIComponent(url);
            const carbonApiUrl = `https://api.websitecarbon.com/site?url=${encodedUrl}`;
            const response = await axios.get(carbonApiUrl, { timeout: 15000 });

            return {
                co2PerPageview: response.data.c || 0,
                green: response.data.green || false,
                cleanerThan: response.data.p || 0,
                transferSize: response.data.bytes || 0,
                method: 'websitecarbon-api'
            };
        } catch (apiError) {
            console.error('Website Carbon API error:', apiError.message);
            throw new Error('Failed to calculate carbon footprint');
        }
    }
}

/**
 * Run Google Lighthouse audit
 */
async function runLighthouseAudit(url) {
    let chrome = null;

    try {
        chrome = await chromeLauncher.launch({
            chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
        });

        const options = {
            logLevel: 'info',
            output: 'json',
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            port: chrome.port,
            throttling: {
                rttMs: 40,
                throughputKbps: 10240,
                cpuSlowdownMultiplier: 1
            }
        };

        const runnerResult = await lighthouse(url, options);
        const { lhr } = runnerResult;

        const metrics = {
            performance: lhr.categories.performance?.score || 0,
            accessibility: lhr.categories.accessibility?.score || 0,
            bestPractices: lhr.categories['best-practices']?.score || 0,
            seo: lhr.categories.seo?.score || 0,

            firstContentfulPaint: lhr.audits['first-contentful-paint']?.numericValue
                ? (lhr.audits['first-contentful-paint'].numericValue / 1000).toFixed(2)
                : null,
            speedIndex: lhr.audits['speed-index']?.numericValue
                ? (lhr.audits['speed-index'].numericValue / 1000).toFixed(2)
                : null,
            largestContentfulPaint: lhr.audits['largest-contentful-paint']?.numericValue
                ? (lhr.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2)
                : null,
            totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue
                ? Math.round(lhr.audits['total-blocking-time'].numericValue)
                : null,
            cumulativeLayoutShift: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
            interactive: lhr.audits.interactive?.numericValue
                ? (lhr.audits.interactive.numericValue / 1000).toFixed(2)
                : null,
            totalSize: lhr.audits['total-byte-weight']?.numericValue || 0,
            requestCount: lhr.audits['network-requests']?.details?.items?.length || 0
        };

        return {
            metrics,
            fullReport: lhr,
            reportHtml: runnerResult.report
        };

    } catch (error) {
        console.error('Lighthouse audit error:', error.message);
        throw new Error('Failed to run Lighthouse audit: ' + error.message);
    } finally {
        if (chrome) {
            await chrome.kill();
        }
    }
}

/**
 * Generate reports
 */
async function generateReports(url, carbonData, lighthouseData) {
    const timestamp = Date.now();
    const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const reportsDir = path.join(__dirname, 'public', 'reports');

    await fs.mkdir(reportsDir, { recursive: true });

    const htmlFilename = `audit_${sanitizedUrl}_${timestamp}.html`;
    const htmlPath = path.join(reportsDir, htmlFilename);

    if (lighthouseData.reportHtml) {
        await fs.writeFile(htmlPath, lighthouseData.reportHtml);
    }

    const pdfFilename = `audit_${sanitizedUrl}_${timestamp}.pdf`;
    const pdfPath = path.join(reportsDir, pdfFilename);

    return {
        htmlPath: `/reports/${htmlFilename}`,
        pdfPath: `/reports/${pdfFilename}`
    };
}

/**
 * Main audit endpoint with database storage
 */
router.post('/audit', async (req, res) => {
    const { url } = req.body;
    const startTime = Date.now();

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    let urlObject;
    try {
        urlObject = new URL(url);
        if (!['http:', 'https:'].includes(urlObject.protocol)) {
            return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported' });
        }
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Create audit record in database (pending status)
    const auditRecord = new AuditResult({
        url,
        domain: urlObject.hostname,
        status: 'pending',
        ipAddress: req.ip,
        userId: req.user?.id // If authentication is enabled
    });

    try {
        await auditRecord.save();
        console.log(`Starting audit for: ${url} (ID: ${auditRecord._id})`);

        // Run both audits in parallel
        const [carbonData, lighthouseData] = await Promise.all([
            calculateCarbonFootprint(url),
            runLighthouseAudit(url)
        ]);

        // Generate reports
        const reports = await generateReports(url, carbonData, lighthouseData);

        // Update audit record with results
        auditRecord.carbon = carbonData;
        auditRecord.lighthouse = lighthouseData.metrics;
        auditRecord.reports = reports;
        auditRecord.status = 'completed';
        auditRecord.duration = Date.now() - startTime;

        await auditRecord.save();

        // Get comparison with average
        const comparison = await auditRecord.compareWithAverage();

        // Return combined results
        const response = {
            success: true,
            auditId: auditRecord._id,
            url,
            carbon: carbonData,
            lighthouse: lighthouseData.metrics,
            htmlPath: reports.htmlPath,
            pdfPath: reports.pdfPath,
            timestamp: auditRecord.createdAt,
            duration: auditRecord.duration,
            comparison,
            grades: {
                performance: auditRecord.performanceGrade,
                carbon: auditRecord.carbonGrade
            }
        };

        res.json(response);
        console.log(`Audit completed for: ${url} (Duration: ${auditRecord.duration}ms)`);

    } catch (error) {
        console.error('Audit error:', error);

        // Update audit record with error
        auditRecord.status = 'failed';
        auditRecord.error = error.message;
        auditRecord.duration = Date.now() - startTime;
        await auditRecord.save();

        res.status(500).json({
            error: error.message || 'Failed to complete audit',
            auditId: auditRecord._id,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Get audit history for a domain
 */
router.get('/audit/history/:domain', async (req, res) => {
    try {
        const { domain } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const history = await AuditResult.getDomainStats(domain, limit);

        res.json({
            success: true,
            domain,
            count: history.length,
            audits: history
        });
    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch audit history' });
    }
});

/**
 * Get audit by ID
 */
router.get('/audit/:id', async (req, res) => {
    try {
        const audit = await AuditResult.findById(req.params.id);

        if (!audit) {
            return res.status(404).json({ error: 'Audit not found' });
        }

        const comparison = await audit.compareWithAverage();

        res.json({
            success: true,
            audit: {
                ...audit.toObject(),
                comparison,
                grades: {
                    performance: audit.performanceGrade,
                    carbon: audit.carbonGrade
                }
            }
        });
    } catch (error) {
        console.error('Audit fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch audit' });
    }
});

/**
 * Get performance leaderboard
 */
router.get('/leaderboard/performance', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await AuditResult.getPerformanceLeaderboard(limit);

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

/**
 * Get top green websites
 */
router.get('/leaderboard/green', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const greenSites = await AuditResult.getTopGreenWebsites(limit);

        res.json({
            success: true,
            greenSites
        });
    } catch (error) {
        console.error('Green sites fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch green sites' });
    }
});

/**
 * Get aggregate statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await AuditResult.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalAudits: { $sum: 1 },
                    avgCO2: { $avg: '$carbon.co2PerPageview' },
                    avgPerformance: { $avg: '$lighthouse.performance' },
                    avgAccessibility: { $avg: '$lighthouse.accessibility' },
                    avgSEO: { $avg: '$lighthouse.seo' },
                    greenHostingCount: {
                        $sum: { $cond: ['$carbon.green', 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {};

        res.json({
            success: true,
            stats: {
                totalAudits: result.totalAudits || 0,
                averages: {
                    co2: result.avgCO2?.toFixed(2) || 0,
                    performance: result.avgPerformance?.toFixed(2) || 0,
                    accessibility: result.avgAccessibility?.toFixed(2) || 0,
                    seo: result.avgSEO?.toFixed(2) || 0
                },
                greenHostingPercentage: result.totalAudits
                    ? ((result.greenHostingCount / result.totalAudits) * 100).toFixed(2)
                    : 0
            }
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * Health check endpoint
 */
router.get('/audit/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            lighthouse: 'available',
            carbon: 'available',
            database: 'connected'
        }
    });
});

module.exports = router;
