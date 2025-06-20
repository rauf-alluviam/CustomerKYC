#!/bin/bash

# Server Logging Configuration Options
# Choose one of the options below by uncommenting the desired line in server.js

echo "🔧 Server Logging Options"
echo "========================="

echo ""
echo "✅ CURRENT: No HTTP Request Logging"
echo "   Clean console output - no HTTP request logs"
echo "   Line in server.js: // HTTP request logging disabled"

echo ""
echo "📋 Available Options:"
echo ""

echo "1. 🚫 No Logging (Current)"
echo "   // HTTP request logging disabled"
echo ""

echo "2. 🔍 Development Only Logging"
echo "   if (process.env.NODE_ENV === 'development') {"
echo "     app.use(morgan('dev'));"
echo "   }"
echo ""

echo "3. ⚠️  Error-Only Logging"
echo "   app.use(morgan('tiny', {"
echo "     skip: (req, res) => res.statusCode < 400"
echo "   }));"
echo ""

echo "4. 📊 Full Logging (Original)"
echo "   app.use(morgan('combined'));"
echo ""

echo "5. 📝 Custom Format"
echo "   app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));"
echo ""

echo "To change logging:"
echo "1. Edit /home/jeeyaa/EXIM/CustomerKYC/server/server.js"
echo "2. Replace the current middleware section with desired option"
echo "3. Restart the server with: npm start"
echo ""

echo "✨ HTTP request logs have been removed!"
echo "Your console will now be much cleaner."
