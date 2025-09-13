import { S3Client } from '@aws-sdk/client-s3';

// S3 Configuration
export const s3Config = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'presentation-maker-templates',
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
};

// Create S3 client
export const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId || '',
    secretAccessKey: s3Config.secretAccessKey || '',
  },
});

// S3 bucket configuration
export const S3_BUCKET_CONFIG = {
  bucketName: s3Config.bucket,
  region: s3Config.region,
  // Folder structure for organizing files
  folders: {
    templates: 'templates/',
    presentations: 'presentations/',
    assets: 'assets/',
  },
};
