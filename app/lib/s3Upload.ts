import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_CONFIG } from './s3Config';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
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
 * Upload a file to S3 bucket
 */
export async function uploadToS3(
  file: File,
  folder: string = 'templates',
  metadata?: FileMetadata
): Promise<UploadResult> {
  try {
    // Generate unique key for the file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const key = `${S3_BUCKET_CONFIG.folders[folder as keyof typeof S3_BUCKET_CONFIG.folders]}${timestamp}_${randomId}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare metadata
    const fileMetadata: FileMetadata = {
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      ...metadata,
    };

    // Upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_CONFIG.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        fileSize: file.size.toString(),
        mimeType: file.type,
        uploadedAt: fileMetadata.uploadedAt,
        userId: metadata?.userId || '',
      },
      // Make file publicly readable (optional)
      ACL: 'public-read',
    });

    // Upload file
    await s3Client.send(uploadCommand);

    // Generate public URL
    const url = `https://${S3_BUCKET_CONFIG.bucketName}.s3.${S3_BUCKET_CONFIG.region}.amazonaws.com/${key}`;

    console.log('File uploaded successfully to S3:', {
      key,
      url,
      size: file.size,
      type: file.type,
    });

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a signed URL for downloading a file from S3
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_CONFIG.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_CONFIG.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log('File deleted successfully from S3:', key);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
}

/**
 * Upload template file to S3
 */
export async function uploadTemplate(
  file: File,
  userId: string,
  templateName?: string
): Promise<UploadResult> {
  const metadata: FileMetadata = {
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
    userId,
  };

  return uploadToS3(file, 'templates', metadata);
}

/**
 * Upload presentation file to S3
 */
export async function uploadPresentation(
  file: File,
  userId: string,
  presentationName?: string
): Promise<UploadResult> {
  const metadata: FileMetadata = {
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
    userId,
  };

  return uploadToS3(file, 'presentations', metadata);
}

/**
 * Get file metadata from S3
 */
export async function getFileMetadata(key: string): Promise<FileMetadata | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_CONFIG.bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (response.Metadata) {
      return {
        originalName: response.Metadata.originalname || '',
        fileSize: parseInt(response.Metadata.filesize || '0'),
        mimeType: response.Metadata.mimetype || '',
        uploadedAt: response.Metadata.uploadedat || new Date().toISOString(),
        userId: response.Metadata.userid || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
}
