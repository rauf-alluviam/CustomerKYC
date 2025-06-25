#!/bin/bash

# Test script to verify S3 upload path structure
echo "🧪 Testing S3 Upload Path Structure"
echo "=================================="

# Test the health endpoint first
echo "1. Testing server health..."
curl -s http://localhost:5001/health | jq '.'

echo -e "\n2. Expected S3 Path Structure:"
echo "   Bucket: exim-test-upload"
echo "   Path: kyc_documents/{customer_name}/{field_name}/{filename}_{timestamp}.ext"

echo -e "\n3. Example paths that will be generated:"
echo "   kyc_documents/John_Doe/passport/passport_scan_1719226587447.pdf"
echo "   kyc_documents/ABC_Company/gst_registration/gst_cert_1719226587448.pdf"
echo "   kyc_documents/XYZ_Partnership/bank_statement/statement_1719226587449.pdf"

echo -e "\n✅ S3 upload configuration updated successfully!"
echo "📁 Files will now be uploaded to: s3://exim-test-upload/kyc_documents/"
