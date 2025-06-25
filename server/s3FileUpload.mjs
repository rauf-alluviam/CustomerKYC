import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const router = express.Router();

// Use environment variables for AWS credentials
const AWS_REGION = process.env.AWS_REGION;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET;

// Validate credentials
if (!ACCESS_KEY || !SECRET_ACCESS_KEY || !S3_BUCKET || !AWS_REGION) {
  console.error('❌ Missing AWS configuration in environment variables');
  console.error('Required: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, AWS_REGION');
}

// Create S3 client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// Configure multer for file handling (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain' // Allow text files for testing
    ];
    
    // For files without proper MIME type detection, check extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      console.log(`Rejected file: ${file.originalname}, MIME: ${file.mimetype}, Extension: ${fileExtension}`);
      cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
    }
  }
});

// Function to sanitize customer name for S3 bucket path (matches frontend logic)
const sanitizeCustomerName = (customerName) => {
  if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
    return 'Unknown_Customer';
  }
  
  // Sanitize the customer name:
  // 1. Trim whitespace
  // 2. Replace spaces with underscores
  // 3. Replace special characters with underscores
  // 4. Remove consecutive underscores
  // 5. Remove leading/trailing underscores
  // 6. Ensure it's not empty after sanitization
  const sanitized = customerName
    .trim()
    .replace(/\s+/g, '_')                    // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_-]/g, '_')         // Replace special chars with underscores
    .replace(/_+/g, '_')                     // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '');               // Remove leading/trailing underscores
  
  return sanitized || 'Unknown_Customer';
};

// Function to sanitize file names
const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace special characters with underscore
    .replace(/_{2,}/g, '_'); // Replace multiple underscores with single
};

// Function to generate S3 key
const generateS3Key = (customerName, fieldName, fileName) => {
  // Sanitize customer name using the same logic as frontend
  const sanitizedCustomerName = sanitizeCustomerName(customerName);
  const sanitizedFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const fileExt = path.extname(sanitizedFileName);
  const baseName = path.basename(sanitizedFileName, fileExt);
  
  // Create S3 path: customers/{sanitized_customer_name}/{field_name}/{file}
  const s3Key = `customers/${sanitizedCustomerName}/${fieldName}/${baseName}_${timestamp}${fileExt}`;
  
  console.log(`Generated S3 key:`);
  console.log(`  - Original customer name: "${customerName}"`);
  console.log(`  - Sanitized customer name: "${sanitizedCustomerName}"`);
  console.log(`  - Field name: "${fieldName}"`);
  console.log(`  - Original file name: "${fileName}"`);
  console.log(`  - Final S3 key: "${s3Key}"`);
  
  return s3Key;
};

// Upload single file endpoint
router.post("/api/upload-file", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { customerName, fieldName } = req.body;
    
    if (!customerName || !fieldName) {
      return res.status(400).json({ message: "Missing customerName or fieldName" });
    }

    const s3Key = generateS3Key(customerName, fieldName, req.file.originalname);

    const uploadParams = {
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      // Make file publicly readable if bucket is configured for public access
      // ACL: 'public-read'
    };

    const command = new PutObjectCommand(uploadParams);
    const result = await s3.send(command);

    // Generate the public URL
    const fileUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

    res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      key: s3Key,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ 
      message: "File upload failed", 
      error: error.message 
    });
  }
});

// Upload multiple files endpoint
router.post("/api/upload-files", upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files provided" });
    }

    const { customerName, fieldName } = req.body;
    
    if (!customerName || !fieldName) {
      return res.status(400).json({ message: "Missing customerName or fieldName" });
    }

    const uploadPromises = req.files.map(async (file) => {
      const s3Key = generateS3Key(customerName, fieldName, file.originalname);

      const uploadParams = {
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Make file publicly readable if bucket is configured for public access
        // ACL: 'public-read'
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      // Generate the public URL
      const fileUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

      return {
        originalName: file.originalname,
        fileUrl: fileUrl,
        key: s3Key,
        size: file.size
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.status(200).json({
      message: "Files uploaded successfully",
      files: uploadResults,
      fileUrls: uploadResults.map(result => result.fileUrl)
    });

  } catch (error) {
    console.error('S3 multiple upload error:', error);
    res.status(500).json({ 
      message: "File upload failed", 
      error: error.message 
    });
  }
});

export default router;
