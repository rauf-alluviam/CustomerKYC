import express from "express";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Use environment variables for AWS credentials
const AWS_REGION = process.env.AWS_REGION ;
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET ;

// Debug: Log environment variables (without exposing secrets)
console.log('AWS Configuration:', {
  region: AWS_REGION,
  bucket: S3_BUCKET,
  hasAccessKey: !!ACCESS_KEY,
  hasSecretKey: !!SECRET_ACCESS_KEY
});

// Validate credentials
if (!ACCESS_KEY || !SECRET_ACCESS_KEY) {
  console.error('❌ Missing AWS credentials in environment variables');
  console.error('Required: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
}

// Create S3 client with environment variables
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

router.post("/api/delete-s3-file", async (req, res) => {
  const rawKey = req.body.key;
  if (!rawKey) {
    return res.status(400).json({ message: "Missing file key" });
  }

  const key = decodeURIComponent(rawKey);

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  try {
    console.log("Deleting key:", key);
    await s3.send(command);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("S3 deletion error:", err);
    res.status(500).json({ message: "Error deleting file from S3" });
  }
});

export default router;
