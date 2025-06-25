# S3 File Upload Configuration

## ✅ **Updated S3 Path Structure**

### **Bucket Configuration:**
- **Bucket Name:** `exim-test-upload`
- **Base Path:** `kyc_documents/`
- **Full Path Structure:** `kyc_documents/{customer_name}/{field_name}/{filename}_{timestamp}.{ext}`

### **Example File Paths:**
```
s3://exim-test-upload/kyc_documents/John_Doe/passport/passport_scan_1719226587447.pdf
s3://exim-test-upload/kyc_documents/ABC_Company/gst_registration/gst_cert_1719226587448.pdf
s3://exim-test-upload/kyc_documents/XYZ_Partnership/bank_statement/statement_1719226587449.pdf
s3://exim-test-upload/kyc_documents/Individual_Exporter/aadhar_card/aadhar_front_1719226587450.jpg
```

### **API Endpoints:**
- **Single File Upload:** `POST /api/upload-file`
- **Multiple Files Upload:** `POST /api/upload-files`

### **Request Parameters:**
- `file` or `files` - The file(s) to upload
- `customerName` - Name of the customer (used for folder organization)
- `fieldName` - Type of document (passport, gst_registration, etc.)

### **Response Format:**
```json
{
  "message": "File uploaded successfully",
  "fileUrl": "https://exim-test-upload.s3.ap-south-1.amazonaws.com/kyc_documents/John_Doe/passport/passport_scan_1719226587447.pdf",
  "key": "kyc_documents/John_Doe/passport/passport_scan_1719226587447.pdf",
  "originalName": "passport_scan.pdf",
  "size": 1024576
}
```

### **Benefits:**
- ✅ **Organized Structure** - Files organized by customer and document type
- ✅ **Unique Filenames** - Timestamp prevents name conflicts
- ✅ **Direct S3 URLs** - No more blob URLs or base64 data
- ✅ **Public Access** - Files can be viewed directly via S3 URLs
- ✅ **Scalable** - Easy to manage thousands of documents

### **Security:**
- Files are stored in a public S3 bucket for easy access
- Filenames are sanitized to prevent security issues
- Timestamps ensure unique file paths
