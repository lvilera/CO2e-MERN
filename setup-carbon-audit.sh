#!/bin/bash

# Website Carbon Audit - Quick Setup Script
# This script sets up the carbon audit tool automatically

set -e  # Exit on error

echo "🌍 Website Carbon Audit - Setup Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be >= 18.0.0 (current: $(node -v))"
    exit 1
fi
print_success "Node.js version $(node -v) detected"

# Copy package.json if it doesn't exist
echo ""
echo "Setting up package.json..."
if [ ! -f "package.json" ]; then
    cp carbon-audit-package.json package.json
    print_success "package.json created"
else
    print_warning "package.json already exists, skipping..."
fi

# Install dependencies
echo ""
echo "Installing dependencies (this may take a few minutes)..."
npm install
print_success "Dependencies installed"

# Create directory structure
echo ""
echo "Creating directory structure..."
mkdir -p public/reports
mkdir -p public/oleg3/assets
print_success "Directories created"

# Check for logo
echo ""
if [ ! -f "public/oleg3/assets/CO2e_PORTAL_4.png" ]; then
    print_warning "Logo not found at public/oleg3/assets/CO2e_PORTAL_4.png"
    echo "  Please add your logo to this location before running the server"
else
    print_success "Logo found"
fi

# Check for Chrome/Chromium
echo ""
echo "Checking for Chrome/Chromium..."
if command -v chromium-browser &> /dev/null || command -v google-chrome &> /dev/null || command -v chromium &> /dev/null; then
    print_success "Chrome/Chromium detected"
else
    print_warning "Chrome/Chromium not found"
    echo "  Puppeteer will download Chromium during first run"
    echo "  Or install manually:"
    echo "    Ubuntu/Debian: sudo apt-get install chromium-browser"
    echo "    macOS: brew install chromium"
fi

# Create .env file if it doesn't exist
echo ""
echo "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration (optional)
MONGODB_URI=mongodb://localhost:27017/carbon-audit

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
EOF
    print_success ".env file created"
else
    print_warning ".env file already exists, skipping..."
fi

# Setup complete
echo ""
echo "======================================"
print_success "Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Add your logo (if not already done):"
echo "   cp /path/to/your/logo.png public/oleg3/assets/CO2e_PORTAL_4.png"
echo ""
echo "2. Start MongoDB (if using database features):"
echo "   mongod"
echo ""
echo "3. Choose your backend:"
echo "   a) Standalone (no database):"
echo "      Use: carbon-audit-backend.js"
echo "   b) With MongoDB:"
echo "      Use: carbon-audit-backend-with-db.js"
echo ""
echo "4. Start the server:"
echo "   npm start"
echo "   # Or for development with auto-reload:"
echo "   npm run dev"
echo ""
echo "5. Access the tool:"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - CARBON_AUDIT_README.md - Complete setup guide"
echo "   - IMPLEMENTATION_SUMMARY.md - Feature overview"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Chrome not found: npm install puppeteer"
echo "   - Port in use: Change PORT in .env"
echo "   - MongoDB error: Check MONGODB_URI in .env"
echo ""
print_success "Happy auditing! 🌍"
