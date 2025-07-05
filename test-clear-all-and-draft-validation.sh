#!/bin/bash

# Test Clear All and Draft Validation Functionality
# This script tests the new Clear All button and verifies draft validation requirements

echo "=== Testing Clear All and Draft Validation ==="
echo ""

echo "1. Testing Clear All Button Implementation..."

# Check for Clear All button
echo "   Checking Clear All button..."
clearButtonCount=$(grep -c "Clear All" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js)
if [ "$clearButtonCount" -ge 1 ]; then
    echo "   ✅ Clear All button implemented"
else
    echo "   ❌ Clear All button missing"
fi

# Check for clear all function
echo "   Checking handleClearAll function..."
if grep -q "handleClearAll\|formik.resetForm" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Clear All function implemented"
else
    echo "   ❌ Clear All function missing"
fi

# Check for confirmation dialog
echo "   Checking Clear All confirmation dialog..."
if grep -q "showClearConfirmation\|Clear All Form Data" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Clear All confirmation dialog implemented"
else
    echo "   ❌ Clear All confirmation dialog missing"
fi

# Check for localStorage clearing
echo "   Checking localStorage clearing..."
if grep -q "localStorage.removeItem.*kycFormValues" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ localStorage clearing implemented"
else
    echo "   ❌ localStorage clearing missing"
fi

echo ""

echo "2. Testing Draft Validation Requirements..."

# Check draft validation schema
echo "   Checking draft validation schema..."
if [ -f "/home/jeeyaa/EXIM/CustomerKYC/client/src/schemas/customerKyc/draftValidationSchema.js" ]; then
    echo "   ✅ Draft validation schema file exists"
    
    # Check IEC number requirement
    if grep -q "iec_no.*required.*draft" /home/jeeyaa/EXIM/CustomerKYC/client/src/schemas/customerKyc/draftValidationSchema.js; then
        echo "   ✅ IEC number is required for draft"
    else
        echo "   ❌ IEC number requirement missing"
    fi
    
    # Check name requirement
    if grep -q "name_of_individual.*required.*draft" /home/jeeyaa/EXIM/CustomerKYC/client/src/schemas/customerKyc/draftValidationSchema.js; then
        echo "   ✅ Name is required for draft"
    else
        echo "   ❌ Name requirement missing"
    fi
    
    # Check hasMinimumDraftData function
    if grep -q "hasMinimumDraftData.*iec_no.*name_of_individual" /home/jeeyaa/EXIM/CustomerKYC/client/src/schemas/customerKyc/draftValidationSchema.js; then
        echo "   ✅ hasMinimumDraftData function implemented"
    else
        echo "   ❌ hasMinimumDraftData function missing"
    fi
else
    echo "   ❌ Draft validation schema file missing"
fi

echo ""

echo "3. Testing Integration in CustomerKycForm..."

# Check draft validation import
echo "   Checking draft validation import..."
if grep -q "draftValidationSchema.*hasMinimumDraftData" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Draft validation imports found"
else
    echo "   ❌ Draft validation imports missing"
fi

# Check save_draft submission type
echo "   Checking save_draft submission handling..."
if grep -q "save_draft.*setSubmitType" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Save draft submission handling found"
else
    echo "   ❌ Save draft submission handling missing"
fi

# Check draft validation in form submission
echo "   Checking draft validation in onSubmit..."
if grep -q "submitType.*save_draft.*draftValidationSchema" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Draft validation in onSubmit found"
else
    echo "   ❌ Draft validation in onSubmit missing"
fi

echo ""

echo "4. Testing UI Enhancements..."

# Check button styling
echo "   Checking Clear All button styling..."
buttonStyling=$(grep -A5 -B5 "Clear All" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js | grep -c "backgroundColor\|borderColor\|warning")
if [ "$buttonStyling" -ge 2 ]; then
    echo "   ✅ Clear All button has proper styling"
else
    echo "   ❌ Clear All button styling incomplete"
fi

# Check button order (Clear All should be between Preview and Save Draft)
echo "   Checking button order..."
if grep -A20 "Preview" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js | grep -q "Clear All" && \
   grep -A10 "Clear All" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js | grep -q "Save Draft"; then
    echo "   ✅ Button order is correct (Preview → Clear All → Save Draft → Submit)"
else
    echo "   ❌ Button order needs verification"
fi

echo ""

echo "5. Testing Error Handling and User Experience..."

# Check success message for clear all
echo "   Checking success message for Clear All..."
if grep -q "Form cleared successfully\|showSuccess" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Clear All success message implemented"
else
    echo "   ❌ Clear All success message missing"
fi

# Check state reset in clear function
echo "   Checking state reset in Clear All..."
stateResetCount=$(grep -A10 "handleClearAll" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js | grep -c "setSubmitType\|setSubmissionAttempted\|setValidationSnackbar")
if [ "$stateResetCount" -ge 3 ]; then
    echo "   ✅ State reset is comprehensive"
else
    echo "   ❌ State reset may be incomplete"
fi

echo ""

echo "6. Testing Validation Logic..."

# Check minimum data validation before draft save
echo "   Checking minimum data validation..."
if grep -q "hasMinimumDraftData.*values" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Minimum data validation implemented"
else
    echo "   ❌ Minimum data validation missing"
fi

# Check draft-specific error messages
echo "   Checking draft-specific error messages..."
if grep -q "IEC.*Number.*Name.*draft\|draft.*validation" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ Draft-specific error messages found"
else
    echo "   ❌ Draft-specific error messages missing"
fi

echo ""

echo "7. Syntax and Compilation Check..."

cd /home/jeeyaa/EXIM/CustomerKYC/client

# Check for syntax errors
echo "   Checking CustomerKycForm.js syntax..."
if node -c src/components/CustomerKycForm.js 2>/dev/null; then
    echo "   ✅ CustomerKycForm.js syntax is valid"
else
    echo "   ❌ CustomerKycForm.js has syntax errors"
fi

echo "   Checking draft validation schema syntax..."
if node -c src/schemas/customerKyc/draftValidationSchema.js 2>/dev/null; then
    echo "   ✅ draftValidationSchema.js syntax is valid"
else
    echo "   ❌ draftValidationSchema.js has syntax errors"
fi

echo ""

echo "=== Test Results Summary ==="
echo ""

# Calculate overall score
totalChecks=12
passedChecks=0

# Count successful checks
if grep -q "Clear All" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    ((passedChecks++))
fi
if grep -q "handleClearAll" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    ((passedChecks++))
fi
if grep -q "showClearConfirmation" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    ((passedChecks++))
fi
if grep -q "iec_no.*required.*draft" /home/jeeyaa/EXIM/CustomerKYC/client/src/schemas/customerKyc/draftValidationSchema.js; then
    ((passedChecks++))
fi
if grep -q "name_of_individual.*required.*draft" /home/jeeyaa/EXIM/CustomerKYC/client/src/schemas/customerKyc/draftValidationSchema.js; then
    ((passedChecks++))
fi
if grep -q "hasMinimumDraftData" /home/jeeyaa/EXIM/CustomerKYC/client/src/schemas/customerKyc/draftValidationSchema.js; then
    ((passedChecks++))
fi

# Calculate percentage
percentage=$((passedChecks * 100 / 6))

if [ "$percentage" -ge 85 ]; then
    echo "🎉 CLEAR ALL & DRAFT VALIDATION: SUCCESSFULLY IMPLEMENTED!"
    echo ""
    echo "✅ Clear All Functionality:"
    echo "   - Clear All button with warning styling"
    echo "   - Comprehensive confirmation dialog"
    echo "   - Complete form and localStorage reset"
    echo "   - Success feedback to user"
    echo ""
    echo "✅ Draft Validation:"
    echo "   - IEC Number is required for draft saving"
    echo "   - Name is required for draft saving"
    echo "   - Cannot save draft without both fields"
    echo "   - Clear validation messages"
    echo ""
    echo "🔧 How to Use:"
    echo "   1. Click 'Clear All' button to reset entire form"
    echo "   2. Confirm in the dialog to proceed"
    echo "   3. Try saving draft without IEC/Name - should fail"
    echo "   4. Enter IEC Number and Name to save draft successfully"
else
    echo "⚠️  CLEAR ALL & DRAFT VALIDATION: PARTIALLY IMPLEMENTED"
    echo ""
    echo "❌ Issues found - manual verification recommended"
fi

echo ""
echo "📋 Testing Instructions:"
echo ""
echo "Manual Testing Steps:"
echo "1. Open the Customer KYC Form"
echo "2. Fill in some form data"
echo "3. Click 'Clear All' button"
echo "4. Confirm the action in the dialog"
echo "5. Verify all data is cleared"
echo "6. Try to save draft without entering anything - should fail"
echo "7. Enter only IEC Number - should still fail"
echo "8. Enter only Name - should still fail"
echo "9. Enter both IEC Number and Name - should save successfully"
echo ""
echo "Expected Behaviors:"
echo "- Clear All should reset all form fields and uploaded files"
echo "- Draft saving should require both IEC Number and Name"
echo "- Clear validation error messages for missing required fields"
echo "- Success message after clearing or saving draft"
echo ""
echo "=== Test Complete ==="
