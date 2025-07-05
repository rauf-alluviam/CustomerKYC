#!/bin/bash

# Test script to verify draft validation in CustomerKYC form
# This script will open the browser and provide instructions for manual testing

echo "🧪 KYC Draft Validation Test Script"
echo "=================================="
echo ""
echo "This script will help you test the draft validation functionality."
echo ""
echo "📋 Test Steps:"
echo "1. Navigate to the Customer KYC form"
echo "2. Fill ONLY the IEC Number and Name fields"
echo "3. Click 'Save Draft' button"
echo "4. Verify that the draft saves successfully without validation errors"
echo "5. Try clicking 'Submit' with minimal data and verify it shows validation errors"
echo ""
echo "🔍 Expected Results:"
echo "✅ Save Draft: Should work with only IEC Number + Name"
echo "❌ Submit: Should fail and show validation errors for missing required fields"
echo ""
echo "💡 Test Data to Use:"
echo "IEC Number: ABCD1234EF"
echo "Name: Test Company Draft"
echo ""

# Ask if user wants to start the development server
read -p "🚀 Do you want to start the development server? (y/n): " start_server

if [[ $start_server =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting development server..."
    echo "The application will be available at: http://localhost:3000"
    echo ""
    echo "Navigate to: Customer KYC Form"
    echo ""
    
    # Navigate to the project directory and start the server
    cd "/home/jeeyaa/EXIM/CustomerKYC/client"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Start the development server
    npm start
else
    echo ""
    echo "Manual testing instructions:"
    echo "1. Navigate to http://localhost:3000"
    echo "2. Go to Customer KYC Form"
    echo "3. Follow the test steps above"
    echo ""
    echo "🔧 If the server isn't running, start it with:"
    echo "cd /home/jeeyaa/EXIM/CustomerKYC/client && npm start"
fi
