// Storage Configuration - Choose between S3 and Firebase Storage

export const STORAGE_CONFIG = {
  // Set to 's3' for AWS S3 or 'firebase' for Firebase Storage
  provider: 's3' as 's3' | 'firebase',
  
  // S3 Configuration (only needed if provider is 's3')
  s3: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'your-bucket-name',
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
  
  // Firebase Storage Configuration (only needed if provider is 'firebase')
  firebase: {
    // Uses existing Firebase config from firebase/config.ts
    // No additional configuration needed
  }
};

// Helper function to check if S3 is configured
export function isS3Configured(): boolean {
  return !!(
    STORAGE_CONFIG.s3.accessKeyId &&
    STORAGE_CONFIG.s3.secretAccessKey &&
    STORAGE_CONFIG.s3.bucket &&
    STORAGE_CONFIG.s3.region
  );
}

// Helper function to get current storage provider
export function getStorageProvider(): 's3' | 'firebase' {
  if (STORAGE_CONFIG.provider === 's3' && isS3Configured()) {
    return 's3';
  }
  return 'firebase';
}
