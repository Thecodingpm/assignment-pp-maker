# AWS S3 Image Storage Setup Guide

## 🎯 **Overview**
Your images from the Library section will be stored in **AWS S3** (Amazon Simple Storage Service) for scalable, reliable, and cost-effective cloud storage.

## 📋 **Setup Steps**

### 1. **Create AWS S3 Bucket**
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `your-presentation-maker-images-2024`)
4. Select your preferred region (e.g., `us-east-1`)
5. **Important**: Uncheck "Block all public access" (we need public read access for images)
6. Click "Create bucket"

### 2. **Configure Bucket Permissions**
1. Go to your bucket → **Permissions** tab
2. **Bucket Policy**: Add this policy to allow public read access:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```
3. **CORS Configuration**: Add this CORS policy:
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

### 3. **Create IAM User**
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Username: `presentation-maker-s3-user`
4. Select "Programmatic access"
5. Attach policy: `AmazonS3FullAccess` (or create custom policy below)

**Custom IAM Policy** (more secure):
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
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
        }
    ]
}
```

### 4. **Get Access Keys**
1. After creating the user, go to "Security credentials" tab
2. Click "Create access key"
3. Choose "Application running outside AWS"
4. **Save the Access Key ID and Secret Access Key** (you won't see them again!)

### 5. **Update Environment Variables**
Add these to your `.env.local` file:
```bash
# AWS S3 Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET_NAME=your-presentation-maker-images-2024
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=AKIA...
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

## 📁 **File Organization**

Images will be stored in S3 with this structure:
```
your-bucket-name/
├── library/
│   └── images/
│       ├── 1703123456789-abc123def456.jpg
│       ├── 1703123456790-xyz789uvw012.png
│       └── 1703123456791-mno345pqr678.gif
```

## 🔧 **How It Works**

1. **Upload Process**:
   - User selects/drags images in the Library
   - Images are uploaded to `/api/upload-image`
   - Files are processed and uploaded to S3
   - Public URLs are generated and returned

2. **File Naming**:
   - Format: `{timestamp}-{randomString}.{extension}`
   - Example: `1703123456789-abc123def456.jpg`
   - Prevents naming conflicts

3. **Public URLs**:
   - Format: `https://{bucket}.s3.{region}.amazonaws.com/library/images/{filename}`
   - Example: `https://your-bucket.s3.us-east-1.amazonaws.com/library/images/1703123456789-abc123def456.jpg`

## 💰 **Costs**

- **Storage**: ~$0.023 per GB per month
- **Requests**: ~$0.0004 per 1,000 PUT requests
- **Data Transfer**: Free for uploads, ~$0.09 per GB for downloads
- **Example**: 1,000 images (100MB total) = ~$0.002 per month

## 🚀 **Testing**

1. Start your development server: `npm run dev`
2. Go to `/library` → Images section
3. Click "Upload images" button
4. Select some image files
5. Check your S3 bucket to see uploaded files!

## 🔒 **Security Notes**

- Images are publicly readable (needed for presentations)
- Only your app can upload/delete images
- Consider adding image optimization/resizing
- Monitor usage in AWS CloudWatch

## 🛠 **Troubleshooting**

**Common Issues**:
1. **403 Forbidden**: Check bucket policy and CORS
2. **Access Denied**: Verify IAM user permissions
3. **CORS Error**: Ensure CORS is properly configured
4. **Invalid Credentials**: Double-check environment variables

**Debug Steps**:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test S3 permissions in AWS Console
4. Check network tab for API responses


