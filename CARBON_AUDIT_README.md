# Website Carbon & Performance Audit Tool

A comprehensive tool for analyzing website environmental impact and performance metrics using CO2.js and Google Lighthouse.

## Features

### ✅ Security Improvements
- ✓ All external links use `rel="noopener noreferrer"`
- ✓ XSS prevention with proper text sanitization
- ✓ Input validation and URL sanitization
- ✓ CSRF protection with helmet.js
- ✓ Rate limiting to prevent abuse
- ✓ Content Security Policy (CSP) headers

### ✅ UX Improvements
- ✓ Request timeout handling (120 seconds)
- ✓ Cancel button for long-running audits
- ✓ Duplicate submission prevention
- ✓ Better loading states with progress indicators
- ✓ Comprehensive error messages
- ✓ Responsive design for mobile devices

### ✅ Accessibility Features
- ✓ ARIA labels and live regions
- ✓ Screen reader announcements
- ✓ Keyboard navigation support
- ✓ Semantic HTML structure
- ✓ Color contrast compliance

### ✅ API Integrations

#### Carbon Footprint (CO2.js / Website Carbon API)
- CO2 emissions per page view
- Green hosting detection
- Transfer size analysis
- Comparative metrics (cleaner than %)

#### Google Lighthouse Performance
- Performance score
- Accessibility score
- Best practices score
- SEO score
- Core Web Vitals:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Total Blocking Time (TBT)
  - Cumulative Layout Shift (CLS)
  - Speed Index

## Installation

### Prerequisites
- Node.js >= 18.0.0
- Chrome/Chromium browser (for Lighthouse)

### Steps

1. **Install dependencies:**
```bash
npm install --save \
  @tgwf/co2 \
  axios \
  chrome-launcher \
  cors \
  express \
  express-rate-limit \
  helmet \
  lighthouse \
  puppeteer
```

Or use the provided package.json:
```bash
cp carbon-audit-package.json package.json
npm install
```

2. **Create directory structure:**
```bash
mkdir -p public/reports
mkdir -p public/oleg3/assets
```

3. **Add your logo:**
Place your logo at `public/oleg3/assets/CO2e_PORTAL_4.png`

4. **Environment variables (optional):**
Create a `.env` file:
```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

## Usage

### Start the server:

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Access the tool:
Open your browser to `http://localhost:3000`

## API Endpoints

### POST /audit
Run a complete carbon and performance audit.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "carbon": {
    "co2PerPageview": 1.76,
    "green": true,
    "cleanerThan": 0.65,
    "transferSize": 1234567,
    "method": "co2js"
  },
  "lighthouse": {
    "performance": 0.92,
    "accessibility": 0.88,
    "bestPractices": 0.95,
    "seo": 0.90,
    "firstContentfulPaint": "1.2",
    "speedIndex": "2.5",
    "largestContentfulPaint": "2.1",
    "totalBlockingTime": 150,
    "cumulativeLayoutShift": 0.05
  },
  "htmlPath": "/reports/audit_example_com_1234567890.html",
  "pdfPath": "/reports/audit_example_com_1234567890.pdf",
  "timestamp": "2025-12-15T10:30:00.000Z"
}
```

### GET /audit/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-15T10:30:00.000Z",
  "services": {
    "lighthouse": "available",
    "carbon": "available"
  }
}
```

## Integration into Existing MERN App

### Option 1: Standalone Route
Add to your existing Express app:

```javascript
const auditRouter = require('./carbon-audit-backend');
app.use('/carbon-audit', auditRouter);
```

### Option 2: Integrate with MongoDB
Store audit results in your database:

```javascript
const AuditResult = require('./models/AuditResult');

// In carbon-audit-backend.js, after successful audit:
const auditResult = new AuditResult({
  url,
  carbonData,
  lighthouseData: lighthouseData.metrics,
  timestamp: new Date()
});
await auditResult.save();
```

### Option 3: Add to Existing Frontend
Copy the improved HTML content into your React/Vue component:

```jsx
// React example
import { useState } from 'react';

function CarbonAudit() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (url) => {
    setLoading(true);
    try {
      const response = await fetch('/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... component JSX
  );
}
```

## Security Considerations

1. **Rate Limiting**: Configured to 10 requests per 15 minutes per IP
2. **URL Validation**: Only HTTP/HTTPS URLs are accepted
3. **Content Security Policy**: Restricts resource loading
4. **Helmet.js**: Adds various security headers
5. **Input Sanitization**: All user inputs are sanitized before display
6. **CORS**: Configure allowed origins in production

## Performance Optimization

1. **Parallel Processing**: Carbon and Lighthouse audits run simultaneously
2. **Timeouts**: 120-second default timeout prevents hanging requests
3. **Resource Limits**: 50MB max content length for requests
4. **Caching**: Consider adding Redis for frequent URL audits
5. **Report Cleanup**: Implement cron job to delete old reports

## Troubleshooting

### Chrome/Chromium not found
```bash
# Install Chrome dependencies (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# Or use Puppeteer's bundled Chromium
npm install puppeteer
```

### Port already in use
```bash
# Change port in .env or:
PORT=3001 npm start
```

### Lighthouse fails with timeout
- Increase timeout in `carbon-audit-backend.js`
- Check if the target website is accessible
- Verify Chrome can launch in headless mode

### CO2.js calculation errors
- Falls back to Website Carbon API automatically
- Check network connectivity
- Verify target URL is accessible

## File Structure

```
├── carbon-audit-improved.html      # Frontend UI (improved)
├── carbon-audit-backend.js         # Backend API logic
├── carbon-audit-server.js          # Express server setup
├── carbon-audit-package.json       # Dependencies
├── CARBON_AUDIT_README.md         # This file
└── public/
    ├── oleg3/
    │   └── assets/
    │       └── CO2e_PORTAL_4.png  # Logo
    └── reports/                   # Generated reports
```

## Future Enhancements

- [ ] PDF report generation with Puppeteer
- [ ] Historical tracking of audits in MongoDB
- [ ] Comparison between multiple URLs
- [ ] Scheduled automated audits
- [ ] Email notifications with results
- [ ] Custom audit configurations
- [ ] API authentication for public deployment
- [ ] Webhook integrations
- [ ] CI/CD pipeline integration

## API Documentation

### CO2.js
- GitHub: https://github.com/thegreenwebfoundation/co2.js
- Docs: https://developers.thegreenwebfoundation.org/co2js/overview/

### Google Lighthouse
- GitHub: https://github.com/GoogleChrome/lighthouse
- Docs: https://developer.chrome.com/docs/lighthouse/overview/

### Website Carbon API
- Website: https://www.websitecarbon.com/
- API: https://api.websitecarbon.com/

## License

MIT License - feel free to use and modify for your projects.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub
4. Contact the development team

---

**Built with 🌍 for a greener web**
