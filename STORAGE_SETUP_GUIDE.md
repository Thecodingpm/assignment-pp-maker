# Storage Setup Guide

## Option 1: Firebase Storage (Recommended - Easiest)

**No additional setup needed!** Firebase Storage is already configured and ready to use.

### What you get:
- ✅ **No AWS account needed**
- ✅ **No additional credentials**
- ✅ **Already integrated with your Firebase project**
- ✅ **Automatic file management**
- ✅ **Built-in security rules**

### How it works:
- Files are uploaded to Firebase Storage
- URLs are stored in your Firestore database
- Files are automatically organized in folders

---

## Option 2: AWS S3 (If you prefer S3)

### What you need:
1. **AWS Account** (free tier available)
2. **S3 Bucket** 
3. **IAM User** with S3 permissions
4. **Access Keys**

### Setup Steps:

#### 1. Create S3 Bucket
```bash
# Go to AWS S3 Console
# Create bucket with name like: your-app-templates
# Choose region (e.g., us-east-1)
```

#### 2. Create IAM User
```bash
# Go to AWS IAM Console
# Create user with programmatic access
# Attach policy: AmazonS3FullAccess (or custom policy)
# Save Access Key ID and Secret Access Key
```

#### 3. Add Environment Variables
Create `.env.local` file:
```bash
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET_NAME=your-app-templates
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

#### 4. Update Storage Config
In `app/lib/storageConfig.ts`, change:
```typescript
provider: 's3' as 's3' | 'firebase',
```

---

## Current Configuration

The app is currently configured to use **Firebase Storage** by default.

### To check your current setup:
```typescript
import { getStorageInfo } from './lib/unifiedStorage';
console.log(getStorageInfo());
```

### To switch to S3:
1. Set up AWS credentials
2. Change `provider: 'firebase'` to `provider: 's3'` in `storageConfig.ts`

---

## File Storage Structure

### Firebase Storage:
```
gs://your-project.appspot.com/
├── templates/
│   ├── 1703123456789_abc123.pptx
│   └── 1703123456790_def456.pdf
└── presentations/
    └── user-presentations/
```

### AWS S3:
```
s3://your-bucket/
├── templates/
│   ├── 1703123456789_abc123.pptx
│   └── 1703123456790_def456.pdf
└── presentations/
    └── user-presentations/
```

---

## Recommendation

**Use Firebase Storage** - it's already set up and requires no additional configuration!
