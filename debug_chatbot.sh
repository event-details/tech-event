#!/bin/bash

echo "🔍 CHATBOT TROUBLESHOOTING SCRIPT"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Check if we can reach the production URL
read -p "Enter your production URL (e.g., https://your-app.onrender.com): " PROD_URL

if [ -z "$PROD_URL" ]; then
    print_error "Production URL is required"
    exit 1
fi

echo ""
print_status "Testing chatbot on: $PROD_URL"
echo ""

# Step 1: Check debug status
print_status "Step 1: Checking system status..."
DEBUG_RESPONSE=$(curl -s "$PROD_URL/api/debug/status" 2>/dev/null)

if [ $? -eq 0 ]; then
    print_success "Debug endpoint accessible"
    echo "Debug Response:"
    echo "$DEBUG_RESPONSE" | jq . 2>/dev/null || echo "$DEBUG_RESPONSE"
    echo ""
    
    # Check if Supabase is connected
    if echo "$DEBUG_RESPONSE" | grep -q '"status":"Connected"'; then
        print_success "Supabase is connected"
    else
        print_error "Supabase connection issue detected"
    fi
    
    # Check if chatbot data is loaded
    if echo "$DEBUG_RESPONSE" | grep -q '"loaded":true'; then
        print_success "Chatbot data is loaded"
    else
        print_error "Chatbot data is NOT loaded - this is the problem!"
    fi
else
    print_error "Cannot access debug endpoint. Check if your server is running."
fi

echo ""

# Step 2: Test actual chatbot
print_status "Step 2: Testing chatbot with 'hi' message..."
CHAT_RESPONSE=$(curl -s -X POST "$PROD_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"userMessage": "hi"}' 2>/dev/null)

if [ $? -eq 0 ]; then
    print_success "Chat endpoint accessible"
    echo "Chat Response:"
    echo "$CHAT_RESPONSE" | jq . 2>/dev/null || echo "$CHAT_RESPONSE"
    echo ""
    
    # Check if it's giving fallback response
    if echo "$CHAT_RESPONSE" | grep -q "I'm sorry, I couldn't understand"; then
        print_error "ISSUE CONFIRMED: Chatbot is giving fallback response"
        echo ""
        print_warning "This means the chatbot data is not loading from Supabase"
        print_warning "You need to run the database migration from PRODUCTION_FIX_GUIDE.md"
    elif echo "$CHAT_RESPONSE" | grep -q "Welcome to TECH MEETUP"; then
        print_success "Chatbot is working correctly!"
    else
        print_warning "Unexpected response format"
    fi
else
    print_error "Cannot access chat endpoint"
fi

echo ""

# Step 3: Test other keywords
print_status "Step 3: Testing other keywords..."

keywords=("hello" "schedule" "venue" "speakers")
for keyword in "${keywords[@]}"; do
    print_status "Testing keyword: '$keyword'"
    RESPONSE=$(curl -s -X POST "$PROD_URL/api/chat" \
        -H "Content-Type: application/json" \
        -d "{\"userMessage\": \"$keyword\"}" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q "I'm sorry, I couldn't understand"; then
        print_error "  ❌ Fallback response for '$keyword'"
    else
        print_success "  ✅ Proper response for '$keyword'"
    fi
done

echo ""
echo "🎯 DIAGNOSIS COMPLETE"
echo "===================="
echo ""

if echo "$CHAT_RESPONSE" | grep -q "I'm sorry, I couldn't understand"; then
    print_error "PROBLEM CONFIRMED: Database schema mismatch"
    echo ""
    echo "SOLUTION STEPS:"
    echo "1. Go to your Supabase dashboard"
    echo "2. Open SQL Editor"
    echo "3. Copy and paste the migration SQL from PRODUCTION_FIX_GUIDE.md"
    echo "4. Run the migration"
    echo "5. Test again with this script"
    echo ""
    echo "The migration SQL starts with:"
    echo "-- PRODUCTION MIGRATION SCRIPT"
    echo "ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS category..."
else
    print_success "Chatbot appears to be working correctly!"
fi

echo ""
echo "For detailed fix instructions, see: PRODUCTION_FIX_GUIDE.md"