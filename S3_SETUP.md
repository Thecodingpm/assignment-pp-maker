# S3 Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# AWS S3 Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET_NAME=your-presentation-maker-bucket
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## AWS S3 Bucket Setup

1. **Create S3 Bucket**:
   - Go to AWS S3 Console
   - Create a new bucket with a unique name
   - Choose your preferred region
   - Enable public read access if needed

2. **Configure CORS**:
   Add this CORS configuration to your S3 bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **IAM User Setup**:
   - Create an IAM user with programmatic access
   - Attach a policy with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:PutObjectAcl"
         ],
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

## Folder Structure

The S3 bucket will organize files as follows:
- `templates/` - Uploaded template files
- `presentations/` - User presentation files
- `assets/` - Other assets

## Usage

Once configured, uploaded templates will be stored in S3 and the URLs will be saved in the database for easy access and management.
