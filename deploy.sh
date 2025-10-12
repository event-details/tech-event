#!/bin/bash

echo "🚀 Preparing Tech Meet Event App for Deployment"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    print_error "This script must be run from the root of the tech-meet-event project"
    exit 1
fi

print_status "Starting deployment preparation..."

# 1. Clean up old build artifacts
print_status "Cleaning up old build artifacts..."
rm -rf client/dist
rm -rf .vite
rm -rf server/logs
print_success "Build artifacts cleaned"

# 2. Install dependencies
print_status "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install server dependencies"
    exit 1
fi
print_success "Server dependencies installed"

cd ../client
print_status "Installing client dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install client dependencies"
    exit 1
fi
print_success "Client dependencies installed"

# 3. Run security audit
print_status "Running security audit..."
npm audit --audit-level high
if [ $? -ne 0 ]; then
    print_warning "Security vulnerabilities found. Consider running 'npm audit fix'"
fi

# 4. Build client for production
print_status "Building client for production..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Client build failed"
    exit 1
fi
print_success "Client built successfully"

cd ..

# 5. Run quick tests to ensure everything works
print_status "Running quick functionality tests..."

# Start server in background
cd server
node index.js &
SERVER_PID=$!
sleep 3

# Test server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server started successfully (PID: $SERVER_PID)"
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    
    # Test leaderboard endpoint
    LEADERBOARD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/leaderboard)
    if [ "$LEADERBOARD_RESPONSE" = "200" ]; then
        print_success "Leaderboard API working"
    else
        print_warning "Leaderboard API returned status: $LEADERBOARD_RESPONSE"
    fi
    
    # Test chat endpoint
    CHAT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/chat -H "Content-Type: application/json" -d '{"userMessage": "hello"}')
    if [ "$CHAT_RESPONSE" = "200" ]; then
        print_success "Chat API working"
    else
        print_warning "Chat API returned status: $CHAT_RESPONSE"
    fi
    
    # Kill test server
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null
    print_success "Test server stopped"
else
    print_error "Failed to start server for testing"
    exit 1
fi

cd ..

# 6. Create deployment checklist
print_status "Creating deployment checklist..."
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Deployment Checklist

## Pre-Deployment
- [ ] Environment variables configured (SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_PASSWORD)
- [ ] Supabase database schema updated with category column (see SUPABASE_SETUP.md)
- [ ] Domain/SSL certificate configured (if applicable)
- [ ] Backup of current production data (if updating existing deployment)

## Features Included
- [x] Advanced NLP chatbot with lemmatization and fuzzy search
- [x] Vulnerability detection system with Break Bot modal
- [x] Leaderboard with **NEW CATEGORY FIELD** showing vulnerability types
- [x] Supabase-only data storage (no local file dependencies)
- [x] Responsive design for all devices
- [x] Admin authentication and management

## Database Schema Update Required
Run this SQL in your Supabase dashboard if updating existing installation:
```sql
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS category VARCHAR(200) DEFAULT 'Unknown';
```

## Deployment Steps
1. Deploy server to your hosting platform (Heroku, Railway, etc.)
2. Deploy client build files to static hosting (Vercel, Netlify, etc.)
3. Update environment variables in production
4. Run database migration (schema update above)
5. Test all functionality in production

## Post-Deployment Testing
- [ ] Chat functionality working
- [ ] Vulnerability detection triggering Break Bot modal
- [ ] Leaderboard displaying with categories
- [ ] Admin functions working (clear leaderboard, manage data)
- [ ] Mobile responsiveness verified

## New in This Version
- **Category tracking**: Leaderboard now shows the vulnerability category (DAN, Admin/Control, etc.) for each entry
- **Enhanced data model**: Better tracking of how users broke the bot
- **Improved UX**: Category badges in leaderboard for better visualization
EOF

print_success "Deployment checklist created"

# 7. Final summary
echo ""
echo "✅ DEPLOYMENT PREPARATION COMPLETE!"
echo "=================================="
echo ""
echo "📁 Built files location: client/dist/"
echo "📋 Deployment checklist: DEPLOYMENT_CHECKLIST.md"
echo "🗄️  Database setup: SUPABASE_SETUP.md"
echo "📖 Full documentation: README.md"
echo ""
echo "🚀 Your app is ready for deployment!"
echo ""
echo "Key features included:"
echo "  • Advanced NLP chatbot with fuzzy search"
echo "  • Vulnerability detection system"
echo "  • Leaderboard with category tracking (NEW!)"
echo "  • Supabase-only data storage"
echo "  • Responsive design"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Set environment variables in production"
echo "  2. Run the database migration for category column"
echo "  3. Test all functionality after deployment"
echo ""