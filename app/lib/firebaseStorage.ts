import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata 
} from 'firebase/storage';
import { storage } from '../firebase/config';

export interface UploadResult {
  success: boolean;
  url?: string;
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
 * Upload a file to Firebase Storage
 */
export async function uploadToFirebaseStorage(
  file: File,
  folder: string = 'templates',
  metadata?: FileMetadata
): Promise<UploadResult> {
  try {
    // Generate unique path for the file
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomId}.${fileExtension}`;
    const path = `${folder}/${fileName}`;

    // Create storage reference
    const storageRef = ref(storage, path);

    // Convert file to blob if needed
    const fileBlob = new Blob([file], { type: file.type });

    // Upload file
    const uploadResult = await uploadBytes(storageRef, fileBlob, {
      customMetadata: {
        originalName: file.name,
        fileSize: file.size.toString(),
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        userId: metadata?.userId || '',
      }
    });

    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    console.log('File uploaded successfully to Firebase Storage:', {
      path,
      url: downloadURL,
      size: file.size,
      type: file.type,
    });

    return {
      success: true,
      url: downloadURL,
      path,
    };
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFromFirebaseStorage(path: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('File deleted successfully from Firebase Storage:', path);
    return true;
  } catch (error) {
    console.error('Error deleting from Firebase Storage:', error);
    return false;
  }
}

/**
 * Get file metadata from Firebase Storage
 */
export async function getFirebaseStorageMetadata(path: string): Promise<FileMetadata | null> {
  try {
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    
    return {
      originalName: metadata.customMetadata?.originalName || '',
      fileSize: parseInt(metadata.customMetadata?.fileSize || '0'),
      mimeType: metadata.customMetadata?.mimeType || metadata.contentType || '',
      uploadedAt: metadata.customMetadata?.uploadedAt || new Date().toISOString(),
      userId: metadata.customMetadata?.userId || '',
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
}

/**
 * Upload template file to Firebase Storage
 */
export async function uploadTemplateToFirebase(
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

  return uploadToFirebaseStorage(file, 'templates', metadata);
}

/**
 * Upload presentation file to Firebase Storage
 */
export async function uploadPresentationToFirebase(
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

  return uploadToFirebaseStorage(file, 'presentations', metadata);
}
