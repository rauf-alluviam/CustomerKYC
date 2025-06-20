#!/bin/bash

echo "Testing S3 file deletion API..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"key": "test/test-file.jpg"}' \
  http://localhost:5001/api/delete-s3-file

echo -e "\n\nDone!"
