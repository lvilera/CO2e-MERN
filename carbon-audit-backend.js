/**
 * Website Carbon & Performance Audit Backend
 *
 * This module integrates:
 * - CO2.js or Website Carbon API for carbon footprint calculation
 * - Google Lighthouse for performance metrics
 */

const express = require('express');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { co2 } = require('@tgwf/co2'); // CO2.js library
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

/**
 * Calculate carbon footprint using CO2.js
 * Alternative: Use Website Carbon API (https://api.websitecarbon.com/site?url=...)
 */
async function calculateCarbonFootprint(url) {
    try {
        // Method 1: Using CO2.js library (more accurate, recommended)
        const co2Emission = new co2();

        // Fetch the page to get transfer size
        const response = await axios.get(url, {
            timeout: 30000,
            maxContentLength: 50 * 1024 * 1024, // 50MB max
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Calculate bytes transferred
        const contentLength = parseInt(response.headers['content-length'] || 0);
        const transferBytes = contentLength || JSON.stringify(response.data).length;

        // Calculate CO2 emissions (in grams)
        const emissions = co2Emission.perByte(transferBytes);

        // Check if hosted on green energy (using The Green Web Foundation API)
        const greenCheckUrl = `https://api.thegreenwebfoundation.org/greencheck/${new URL(url).hostname}`;
        let isGreen = false;
        try {
            const greenCheck = await axios.get(greenCheckUrl, { timeout: 5000 });
            isGreen = greenCheck.data.green || false;
        } catch (err) {
            console.warn('Green check failed:', err.message);
        }

        // Calculate cleaner than percentage (simplified model)
        const avgPageSize = 2.2; // Average page produces 2.2g CO2
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

        // Method 2: Fallback to Website Carbon API
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
        // Launch Chrome
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

        // Run Lighthouse
        const runnerResult = await lighthouse(url, options);

        // Extract key metrics
        const { lhr } = runnerResult;

        const metrics = {
            performance: lhr.categories.performance?.score || 0,
            accessibility: lhr.categories.accessibility?.score || 0,
            bestPractices: lhr.categories['best-practices']?.score || 0,
            seo: lhr.categories.seo?.score || 0,

            // Core Web Vitals
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

            // Additional metrics
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
 * Generate reports (HTML and PDF)
 */
async function generateReports(url, carbonData, lighthouseData) {
    const timestamp = Date.now();
    const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const reportsDir = path.join(__dirname, 'public', 'reports');

    // Ensure reports directory exists
    await fs.mkdir(reportsDir, { recursive: true });

    const htmlFilename = `audit_${sanitizedUrl}_${timestamp}.html`;
    const htmlPath = path.join(reportsDir, htmlFilename);

    // Save Lighthouse HTML report
    if (lighthouseData.reportHtml) {
        await fs.writeFile(htmlPath, lighthouseData.reportHtml);
    }

    // Generate combined PDF report (using puppeteer or similar)
    // This is a placeholder - implement PDF generation as needed
    const pdfFilename = `audit_${sanitizedUrl}_${timestamp}.pdf`;
    const pdfPath = path.join(reportsDir, pdfFilename);

    // You can use puppeteer to generate PDF from HTML
    // const puppeteer = require('puppeteer');
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto(`file://${htmlPath}`);
    // await page.pdf({ path: pdfPath, format: 'A4' });
    // await browser.close();

    return {
        htmlPath: `/reports/${htmlFilename}`,
        pdfPath: `/reports/${pdfFilename}` // Optional, if PDF generation is implemented
    };
}

/**
 * Main audit endpoint
 */
router.post('/audit', async (req, res) => {
    const { url } = req.body;

    // Validate URL
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Validate URL format
        const urlObject = new URL(url);
        if (!['http:', 'https:'].includes(urlObject.protocol)) {
            return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported' });
        }
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    try {
        console.log(`Starting audit for: ${url}`);

        // Run both audits in parallel
        const [carbonData, lighthouseData] = await Promise.all([
            calculateCarbonFootprint(url),
            runLighthouseAudit(url)
        ]);

        // Generate reports
        const reports = await generateReports(url, carbonData, lighthouseData);

        // Return combined results
        res.json({
            success: true,
            url,
            carbon: carbonData,
            lighthouse: lighthouseData.metrics,
            htmlPath: reports.htmlPath,
            pdfPath: reports.pdfPath,
            timestamp: new Date().toISOString()
        });

        console.log(`Audit completed for: ${url}`);

    } catch (error) {
        console.error('Audit error:', error);
        res.status(500).json({
            error: error.message || 'Failed to complete audit',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
            carbon: 'available'
        }
    });
});

module.exports = router;
