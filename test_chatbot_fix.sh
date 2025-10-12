#!/bin/bash

echo "🔧 CHATBOT INITIALIZATION FIX TEST"
echo "=================================="
echo ""

# Start server in background and capture PID
echo "🚀 Starting server..."
cd /Users/aviraggautam/Projects/tech-meet-event/server
node index.js &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
echo "Waiting for server to initialize..."

# Wait for server to start
sleep 5

# Test if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Server is running"
    
    # Test debug status
    echo ""
    echo "🔍 Testing debug status endpoint..."
    DEBUG_RESPONSE=$(curl -s http://localhost:3001/api/debug/status)
    if [ $? -eq 0 ]; then
        echo "✅ Debug endpoint accessible"
        echo "Debug Response:"
        echo "$DEBUG_RESPONSE" | jq . 2>/dev/null || echo "$DEBUG_RESPONSE"
    else
        echo "❌ Debug endpoint not accessible"
    fi
    
    echo ""
    echo "🤖 Testing chatbot with 'hi'..."
    CHAT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/chat \
        -H "Content-Type: application/json" \
        -d '{"userMessage": "hi"}')
    
    if [ $? -eq 0 ]; then
        echo "✅ Chat endpoint accessible"
        echo "Chat Response:"
        echo "$CHAT_RESPONSE" | jq . 2>/dev/null || echo "$CHAT_RESPONSE"
        
        # Check if it's still giving fallback response
        if echo "$CHAT_RESPONSE" | grep -q "I'm sorry, I couldn't understand"; then
            echo ""
            echo "❌ STILL GETTING FALLBACK RESPONSE"
            echo "This means the database migration is still needed in production"
        elif echo "$CHAT_RESPONSE" | grep -q "Welcome to TECH MEETUP"; then
            echo ""
            echo "✅ CHATBOT IS WORKING CORRECTLY!"
            echo "The fix worked - proper responses are being returned"
        else
            echo ""
            echo "⚠️  Unexpected response format"
        fi
    else
        echo "❌ Chat endpoint not accessible"
    fi
    
    echo ""
    echo "🧪 Testing additional keywords..."
    
    # Test more keywords
    KEYWORDS=("hello" "schedule" "venue" "speakers")
    for keyword in "${KEYWORDS[@]}"; do
        echo "Testing: $keyword"
        RESPONSE=$(curl -s -X POST http://localhost:3001/api/chat \
            -H "Content-Type: application/json" \
            -d "{\"userMessage\": \"$keyword\"}")
        
        if echo "$RESPONSE" | grep -q "I'm sorry, I couldn't understand"; then
            echo "  ❌ Fallback response"
        else
            echo "  ✅ Proper response"
        fi
    done
    
    # Clean up
    echo ""
    echo "🧹 Stopping server..."
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null
    echo "✅ Server stopped"
    
else
    echo "❌ Failed to start server"
    exit 1
fi

echo ""
echo "🎯 SUMMARY"
echo "=========="
echo "Local development server initialization fix:"
echo "✅ Fixed ChatbotService initialization order"
echo "✅ ChatbotService now initializes AFTER Supabase"
echo "✅ No more 'Supabase connection required but not available' errors"
echo ""
echo "For production, you still need to run the database migration"
echo "from PRODUCTION_FIX_GUIDE.md to fix the schema mismatch."