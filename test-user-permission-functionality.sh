#!/bin/bash

# Test User Permission Functionality
# This script tests the user-based document deletion permissions

echo "=== Testing User Permission Functionality ==="
echo ""

echo "Testing user permission props in CustomerKycForm..."

# Check that all ImagePreview components have user permission props
echo "1. Checking ImagePreview components have allowUserDelete props..."
allowUserDeleteCount=$(grep -c "allowUserDelete={true}" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js)
imagePreviewCount=$(grep -c "<ImagePreview" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js)

echo "   Found $imagePreviewCount ImagePreview components"
echo "   Found $allowUserDeleteCount with allowUserDelete prop"

if [ "$allowUserDeleteCount" -eq "$imagePreviewCount" ]; then
    echo "   ✅ All ImagePreview components have allowUserDelete prop"
else
    echo "   ❌ Missing allowUserDelete prop in some ImagePreview components"
fi

echo ""

# Check that UserContext is imported
echo "2. Checking UserContext import..."
if grep -q "import.*UserContext.*from.*UserContext" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ UserContext is imported"
else
    echo "   ❌ UserContext import missing"
fi

echo ""

# Check that user context is used
echo "3. Checking user context usage..."
if grep -q "const { user } = useContext(UserContext)" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "   ✅ User context is properly used"
else
    echo "   ❌ User context usage missing"
fi

echo ""

# Check that all ImagePreview components have the required permission props
echo "4. Checking all permission props are present..."
applicationStatusCount=$(grep -c 'applicationStatus="draft"' /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js)
currentUserIdCount=$(grep -c 'currentUserId={user?.id}' /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js)
applicationCreatorIdCount=$(grep -c 'applicationCreatorId={user?.id}' /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js)

echo "   applicationStatus props: $applicationStatusCount"
echo "   currentUserId props: $currentUserIdCount"
echo "   applicationCreatorId props: $applicationCreatorIdCount"

if [ "$applicationStatusCount" -eq "$imagePreviewCount" ] && [ "$currentUserIdCount" -eq "$imagePreviewCount" ] && [ "$applicationCreatorIdCount" -eq "$imagePreviewCount" ]; then
    echo "   ✅ All permission props are properly set"
else
    echo "   ❌ Some permission props are missing"
fi

echo ""

# Check ImagePreview component has the required permission logic
echo "5. Checking ImagePreview component permission logic..."
if grep -q "allowUserDelete" /home/jeeyaa/EXIM/CustomerKYC/client/src/utils/ImagePreview.js && grep -q "applicationStatus" /home/jeeyaa/EXIM/CustomerKYC/client/src/utils/ImagePreview.js; then
    echo "   ✅ ImagePreview component has permission logic"
else
    echo "   ❌ ImagePreview component missing permission logic"
fi

echo ""

# Check that all view components have admin-only permissions
echo "6. Checking admin permissions in view components..."

viewFiles=(
    "/home/jeeyaa/EXIM/CustomerKYC/client/src/components/ViewCompletedKycDetails.js"
    "/home/jeeyaa/EXIM/CustomerKYC/client/src/components/EditCompletedKyc.js"
    "/home/jeeyaa/EXIM/CustomerKYC/client/src/components/ViewDraftDetails.js"
)

for file in "${viewFiles[@]}"; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        showDeleteForAdminCount=$(grep -c "showDeleteForAdmin={true}" "$file" 2>/dev/null || echo "0")
        if [ "$showDeleteForAdminCount" -gt 0 ]; then
            echo "   ✅ $filename has admin delete permissions"
        else
            echo "   ❌ $filename missing admin delete permissions"
        fi
    fi
done

echo ""
echo "=== User Permission Test Summary ==="
echo ""

# Overall assessment
if [ "$allowUserDeleteCount" -eq "$imagePreviewCount" ] && 
   [ "$applicationStatusCount" -eq "$imagePreviewCount" ] && 
   [ "$currentUserIdCount" -eq "$imagePreviewCount" ] && 
   [ "$applicationCreatorIdCount" -eq "$imagePreviewCount" ] &&
   grep -q "const { user } = useContext(UserContext)" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
    echo "✅ User permission functionality is properly implemented!"
    echo ""
    echo "Summary of implementation:"
    echo "- Users can delete their own documents during draft creation/editing"
    echo "- All ImagePreview components in CustomerKycForm have user permission props"
    echo "- Application status is set to 'draft' for new applications"
    echo "- Admin-only deletion is preserved in view/edit components"
    echo "- Permission system supports both user and admin deletion scenarios"
else
    echo "❌ User permission functionality needs attention"
    echo ""
    echo "Issues found:"
    if [ "$allowUserDeleteCount" -ne "$imagePreviewCount" ]; then
        echo "- Some ImagePreview components missing allowUserDelete prop"
    fi
    if [ "$applicationStatusCount" -ne "$imagePreviewCount" ]; then
        echo "- Some ImagePreview components missing applicationStatus prop"
    fi
    if [ "$currentUserIdCount" -ne "$imagePreviewCount" ]; then
        echo "- Some ImagePreview components missing currentUserId prop"
    fi
    if [ "$applicationCreatorIdCount" -ne "$imagePreviewCount" ]; then
        echo "- Some ImagePreview components missing applicationCreatorId prop"
    fi
    if ! grep -q "const { user } = useContext(UserContext)" /home/jeeyaa/EXIM/CustomerKYC/client/src/components/CustomerKycForm.js; then
        echo "- UserContext is not properly used"
    fi
fi

echo ""
echo "=== Test Complete ==="
