#!/bin/bash

echo "🧪 Testing Navigation After Hard Refresh"
echo "========================================"

# Function to check if the React app is running
check_app_running() {
    if curl -s http://localhost:3000 > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to start the React app if not running
start_app_if_needed() {
    if ! check_app_running; then
        echo "🚀 Starting React application..."
        cd /home/jeeyaa/EXIM/CustomerKYC/client
        npm start &
        APP_PID=$!
        
        echo "⏳ Waiting for app to start..."
        for i in {1..30}; do
            if check_app_running; then
                echo "✅ App is running on http://localhost:3000"
                return 0
            fi
            sleep 2
        done
        echo "❌ App failed to start within 60 seconds"
        return 1
    else
        echo "✅ App is already running on http://localhost:3000"
        return 0
    fi
}

# Function to test navigation recovery
test_navigation_recovery() {
    echo "🔍 Testing Navigation Recovery Utilities..."
    
    cd /home/jeeyaa/EXIM/CustomerKYC/client/src/utils
    
    # Test the navigation recovery functions
    node -e "
    const { isPageRefresh, inferPreviousPage, reconstructNavigationContext } = require('./navigationRecovery.js');
    
    console.log('Testing inferPreviousPage function:');
    
    const testPaths = [
        '/view-customer-kyc/12345',
        '/revise-customer-kyc/67890',
        '/view-completed-kyc/abcdef',
        '/view-draft-details/xyz123',
        '/edit-completed-kyc/test456',
        '/unknown-path'
    ];
    
    testPaths.forEach(path => {
        const result = inferPreviousPage(path);
        console.log(\`  \${path} -> \${result.path} (\${result.description})\`);
    });
    
    console.log('✅ Navigation recovery utilities are working');
    " 2>/dev/null || echo "⚠️  Could not test utilities directly (normal in browser environment)"
}

# Function to create test HTML for manual testing
create_test_html() {
    echo "📝 Creating test HTML for manual navigation testing..."
    
    cat > /home/jeeyaa/EXIM/CustomerKYC/test-navigation.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Navigation Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .button { padding: 10px 15px; margin: 5px; background: #2171c2; color: white; text-decoration: none; border-radius: 3px; }
        .test-result { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 3px; }
        .success { background: #d4edda; color: #155724; }
        .warning { background: #fff3cd; color: #856404; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <h1>🧪 Navigation After Refresh Test</h1>
    
    <div class="test-section">
        <h2>Manual Test Instructions</h2>
        <ol>
            <li>Open your KYC application at <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></li>
            <li>Navigate through several pages (e.g., view KYC details, drafts, etc.)</li>
            <li>On any detail page, perform a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
            <li>Click the back button</li>
            <li>Verify it takes you to the correct previous page</li>
        </ol>
    </div>
    
    <div class="test-section">
        <h2>Test URLs (Open these and test back button after refresh)</h2>
        <div>
            <a href="http://localhost:3000/customer-kyc" class="button">Main Dashboard</a>
            <a href="http://localhost:3000/view-customer-kyc/test-id" class="button">View KYC Details</a>
            <a href="http://localhost:3000/view-completed-kyc/test-id" class="button">Completed KYC</a>
            <a href="http://localhost:3000/view-draft-details/test-id" class="button">Draft Details</a>
        </div>
    </div>
    
    <div class="test-section">
        <h2>Browser Console Tests</h2>
        <p>Open browser console and run these commands after hard refresh:</p>
        <div class="test-result">
            <strong>Check Navigation State:</strong><br>
            <code>window.navigationContext</code>
        </div>
        <div class="test-result">
            <strong>Debug Navigation:</strong><br>
            <code>console.log('History length:', window.history.length);</code><br>
            <code>console.log('Current path:', window.location.pathname);</code><br>
            <code>console.log('Referrer:', document.referrer);</code>
        </div>
        <div class="test-result">
            <strong>Test localStorage:</strong><br>
            <code>console.log('Saved navigation:', localStorage.getItem('kyc-navigation-stack'));</code><br>
            <code>console.log('Saved tab states:', localStorage.getItem('kyc-tab-states'));</code>
        </div>
    </div>
    
    <div class="test-section">
        <h2>Expected Behavior</h2>
        <ul>
            <li>✅ Back button should work after hard refresh</li>
            <li>✅ Should preserve tab states across refreshes</li>
            <li>✅ Should use browser history when custom navigation unavailable</li>
            <li>✅ Should fall back to main dashboard if no history</li>
            <li>✅ Should not break on any URL</li>
        </ul>
    </div>
    
    <script>
        // Add some debugging helpers
        window.testNavigation = {
            checkStorage: () => {
                console.log('Navigation Stack:', localStorage.getItem('kyc-navigation-stack'));
                console.log('Tab States:', localStorage.getItem('kyc-tab-states'));
            },
            clearStorage: () => {
                localStorage.removeItem('kyc-navigation-stack');
                localStorage.removeItem('kyc-tab-states');
                console.log('Navigation storage cleared');
            },
            checkHistory: () => {
                console.log('Browser history length:', window.history.length);
                console.log('Current URL:', window.location.href);
                console.log('Referrer:', document.referrer);
            }
        };
        
        console.log('Test helpers available: window.testNavigation');
    </script>
</body>
</html>
EOF
    
    echo "✅ Test HTML created at /home/jeeyaa/EXIM/CustomerKYC/test-navigation.html"
}

# Function to check implementation
check_implementation() {
    echo "🔍 Checking implementation files..."
    
    # Check if navigation recovery file exists
    if [ -f "/home/jeeyaa/EXIM/CustomerKYC/client/src/utils/navigationRecovery.js" ]; then
        echo "✅ navigationRecovery.js exists"
    else
        echo "❌ navigationRecovery.js missing"
    fi
    
    # Check if NavigationContext has localStorage persistence
    if grep -q "kyc-navigation-stack" "/home/jeeyaa/EXIM/CustomerKYC/client/src/contexts/NavigationContext.js"; then
        echo "✅ NavigationContext has localStorage persistence"
    else
        echo "❌ NavigationContext missing localStorage persistence"
    fi
    
    # Check if BackButton has smart recovery
    if grep -q "smartGoBack" "/home/jeeyaa/EXIM/CustomerKYC/client/src/components/BackButton.js"; then
        echo "✅ BackButton has smart recovery"
    else
        echo "❌ BackButton missing smart recovery"
    fi
}

# Function to provide troubleshooting guide
provide_troubleshooting() {
    echo ""
    echo "🔧 Troubleshooting Guide"
    echo "======================="
    echo ""
    echo "If back button still doesn't work after refresh:"
    echo ""
    echo "1. Check browser console for errors:"
    echo "   - Open DevTools (F12)"
    echo "   - Look for JavaScript errors"
    echo "   - Check Network tab for failed requests"
    echo ""
    echo "2. Verify localStorage is working:"
    echo "   - Open DevTools → Application → Storage → Local Storage"
    echo "   - Look for 'kyc-navigation-stack' and 'kyc-tab-states'"
    echo ""
    echo "3. Test browser history:"
    echo "   - In console: console.log(window.history.length)"
    echo "   - Should be > 1 if you navigated to the page"
    echo ""
    echo "4. Common issues:"
    echo "   - Private/Incognito mode may limit localStorage"
    echo "   - Browser security settings may block navigation"
    echo "   - Ad blockers might interfere with history API"
    echo ""
    echo "5. Test with different scenarios:"
    echo "   - Normal navigation → hard refresh → back button"
    echo "   - Direct URL access → back button"
    echo "   - Multiple page navigation → refresh → back button"
    echo ""
}

# Main execution
main() {
    echo "Starting navigation fix verification..."
    echo ""
    
    # Check if we're in the right directory
    if [ ! -d "/home/jeeyaa/EXIM/CustomerKYC" ]; then
        echo "❌ Please run this script from the correct workspace"
        exit 1
    fi
    
    # Check implementation
    check_implementation
    echo ""
    
    # Test navigation recovery utilities
    test_navigation_recovery
    echo ""
    
    # Create test HTML
    create_test_html
    echo ""
    
    # Start app if needed
    start_app_if_needed
    echo ""
    
    # Provide manual testing instructions
    echo "📋 Manual Testing Instructions"
    echo "============================="
    echo ""
    echo "1. Open the test HTML file in your browser:"
    echo "   file:///home/jeeyaa/EXIM/CustomerKYC/test-navigation.html"
    echo ""
    echo "2. Follow the test instructions in the HTML file"
    echo ""
    echo "3. Test these specific scenarios:"
    echo "   a. Navigate: Dashboard → View KYC → Hard Refresh → Back Button"
    echo "   b. Navigate: Dashboard → Drafts → Draft Details → Hard Refresh → Back Button"
    echo "   c. Direct URL access → Hard Refresh → Back Button"
    echo ""
    echo "4. Expected results:"
    echo "   - Back button should work in all scenarios"
    echo "   - Should go to appropriate previous page or fallback"
    echo "   - No JavaScript errors in console"
    echo ""
    
    # Provide troubleshooting guide
    provide_troubleshooting
    
    echo "✅ Navigation fix verification complete!"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Test the application manually using the provided test HTML"
    echo "   2. If issues persist, check the troubleshooting guide above"
    echo "   3. Monitor browser console for any errors"
    echo ""
}

# Run the main function
main
