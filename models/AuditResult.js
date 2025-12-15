/**
 * Mongoose Schema for Website Audit Results
 * Store carbon footprint and performance metrics in MongoDB
 */

const mongoose = require('mongoose');

const auditResultSchema = new mongoose.Schema({
    // Target URL
    url: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    // Domain for easier querying
    domain: {
        type: String,
        required: true,
        index: true
    },

    // Carbon Footprint Data
    carbon: {
        co2PerPageview: {
            type: Number,
            required: true,
            min: 0
        },
        green: {
            type: Boolean,
            default: false
        },
        cleanerThan: {
            type: Number,
            min: 0,
            max: 1
        },
        transferSize: {
            type: Number,
            min: 0
        },
        method: {
            type: String,
            enum: ['co2js', 'websitecarbon-api'],
            default: 'co2js'
        }
    },

    // Lighthouse Performance Metrics
    lighthouse: {
        // Category Scores (0-1)
        performance: {
            type: Number,
            min: 0,
            max: 1
        },
        accessibility: {
            type: Number,
            min: 0,
            max: 1
        },
        bestPractices: {
            type: Number,
            min: 0,
            max: 1
        },
        seo: {
            type: Number,
            min: 0,
            max: 1
        },

        // Core Web Vitals
        firstContentfulPaint: Number, // seconds
        speedIndex: Number, // seconds
        largestContentfulPaint: Number, // seconds
        totalBlockingTime: Number, // milliseconds
        cumulativeLayoutShift: Number, // score
        interactive: Number, // seconds

        // Additional metrics
        totalSize: Number, // bytes
        requestCount: Number
    },

    // Report file paths
    reports: {
        htmlPath: String,
        pdfPath: String
    },

    // Metadata
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    error: String,
    duration: Number, // milliseconds

    // User tracking (optional)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },

    // IP address for rate limiting (optional)
    ipAddress: String,

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for common queries
auditResultSchema.index({ domain: 1, createdAt: -1 });
auditResultSchema.index({ userId: 1, createdAt: -1 });
auditResultSchema.index({ 'carbon.green': 1 });
auditResultSchema.index({ 'lighthouse.performance': -1 });

// Virtual for overall performance grade
auditResultSchema.virtual('performanceGrade').get(function() {
    if (!this.lighthouse?.performance) return 'N/A';

    const score = this.lighthouse.performance;
    if (score >= 0.9) return 'A';
    if (score >= 0.75) return 'B';
    if (score >= 0.5) return 'C';
    if (score >= 0.25) return 'D';
    return 'F';
});

// Virtual for carbon grade
auditResultSchema.virtual('carbonGrade').get(function() {
    if (!this.carbon?.co2PerPageview) return 'N/A';

    const co2 = this.carbon.co2PerPageview;
    if (co2 < 0.5) return 'A';
    if (co2 < 1.0) return 'B';
    if (co2 < 2.0) return 'C';
    if (co2 < 3.0) return 'D';
    return 'F';
});

// Method to get comparison with average
auditResultSchema.methods.compareWithAverage = async function() {
    const Model = this.constructor;

    const avgMetrics = await Model.aggregate([
        {
            $group: {
                _id: null,
                avgCO2: { $avg: '$carbon.co2PerPageview' },
                avgPerformance: { $avg: '$lighthouse.performance' },
                avgAccessibility: { $avg: '$lighthouse.accessibility' },
                avgSEO: { $avg: '$lighthouse.seo' }
            }
        }
    ]);

    if (avgMetrics.length === 0) return null;

    const avg = avgMetrics[0];
    return {
        co2Comparison: this.carbon.co2PerPageview < avg.avgCO2 ? 'better' : 'worse',
        co2Difference: ((this.carbon.co2PerPageview - avg.avgCO2) / avg.avgCO2 * 100).toFixed(2),
        performanceComparison: this.lighthouse.performance > avg.avgPerformance ? 'better' : 'worse',
        performanceDifference: ((this.lighthouse.performance - avg.avgPerformance) / avg.avgPerformance * 100).toFixed(2)
    };
};

// Static method to get domain statistics
auditResultSchema.statics.getDomainStats = async function(domain, limit = 10) {
    return this.find({ domain })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('carbon lighthouse createdAt')
        .lean();
};

// Static method to get top green websites
auditResultSchema.statics.getTopGreenWebsites = async function(limit = 10) {
    return this.find({ 'carbon.green': true })
        .sort({ 'carbon.co2PerPageview': 1 })
        .limit(limit)
        .select('url domain carbon.co2PerPageview lighthouse.performance')
        .lean();
};

// Static method to get performance leaderboard
auditResultSchema.statics.getPerformanceLeaderboard = async function(limit = 10) {
    return this.find({ status: 'completed' })
        .sort({ 'lighthouse.performance': -1 })
        .limit(limit)
        .select('url domain lighthouse.performance carbon.co2PerPageview createdAt')
        .lean();
};

// Pre-save hook to extract domain
auditResultSchema.pre('save', function(next) {
    if (this.url && !this.domain) {
        try {
            const urlObj = new URL(this.url);
            this.domain = urlObj.hostname;
        } catch (err) {
            // Domain extraction failed, skip
        }
    }
    next();
});

// Pre-save hook to update timestamp
auditResultSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const AuditResult = mongoose.model('AuditResult', auditResultSchema);

module.exports = AuditResult;
