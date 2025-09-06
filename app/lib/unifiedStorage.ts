import { STORAGE_CONFIG, getStorageProvider } from './storageConfig';
import { uploadPresentation as uploadToS3 } from './s3Upload';
import { uploadPresentationToFirebase } from './firebaseStorage';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  path?: string;
  error?: string;
}

export interface FileMetadata {
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  userId?: string;
}

/**
 * Upload a presentation file using the configured storage provider
 */
export async function uploadPresentation(
  file: File,
  userId: string,
  presentationName?: string
): Promise<UploadResult> {
  const provider = getStorageProvider();
  
  console.log(`Uploading to ${provider} storage...`);
  
  try {
    if (provider === 's3') {
      return await uploadToS3(file, userId, presentationName);
    } else {
      return await uploadPresentationToFirebase(file, userId, presentationName);
    }
  } catch (error) {
    console.error(`Error uploading to ${provider}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get storage provider info for debugging
 */
export function getStorageInfo() {
  const provider = getStorageProvider();
  return {
    provider,
    configured: provider === 's3' ? STORAGE_CONFIG.s3.bucket !== 'your-bucket-name' : true,
    config: provider === 's3' ? {
      region: STORAGE_CONFIG.s3.region,
      bucket: STORAGE_CONFIG.s3.bucket,
      hasCredentials: !!(STORAGE_CONFIG.s3.accessKeyId && STORAGE_CONFIG.s3.secretAccessKey)
    } : {
      usingFirebase: true
    }
  };
}
