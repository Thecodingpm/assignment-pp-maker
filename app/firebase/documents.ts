import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'assignment' | 'presentation' | 'logo';
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  // S3 file storage
  s3Url?: string;
  s3Key?: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  isImported?: boolean;
}

export interface DocumentInput {
  title: string;
  content: string;
  type: 'assignment' | 'presentation' | 'logo';
  // S3 file storage
  s3Url?: string;
  s3Key?: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  isImported?: boolean;
}

// Create a new document
export const createDocument = async (userId: string, documentData: DocumentInput): Promise<string> => {
  try {
    console.log('🔥 createDocument called with:', {
      userId,
      title: documentData.title,
      type: documentData.type,
      contentLength: documentData.content?.length,
      isImported: documentData.isImported
    });

    const documentPayload = {
      userId,
      title: documentData.title,
      content: documentData.content,
      type: documentData.type,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // S3 file storage
      s3Url: documentData.s3Url || null,
      s3Key: documentData.s3Key || null,
      originalFileName: documentData.originalFileName || null,
      fileSize: documentData.fileSize || null,
      mimeType: documentData.mimeType || null,
      isImported: documentData.isImported || false
    };

    console.log('🔥 Attempting to add document to Firestore...');
    const docRef = await addDoc(collection(db, 'documents'), documentPayload);
    console.log('✅ Document added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ createDocument error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    throw new Error(`Failed to create document: ${error.message}`);
  }
};

// Update an existing document
export const updateDocument = async (documentId: string, documentData: Partial<DocumentInput>): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      ...documentData,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(`Failed to update document: ${error.message}`);
  }
};

// Soft delete (move to trash)
export const moveToTrash = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to move to trash: ${error.message}`);
  }
};

// Restore from trash
export const restoreDocument = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      isDeleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Failed to restore document: ${error.message}`);
  }
};

// Delete a document permanently
export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    await deleteDoc(docRef);
  } catch (error: any) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
};

// Get all documents for a user (excluding trashed)
export const getUserDocuments = async (userId: string): Promise<Document[]> => {
  try {
    const q = query(collection(db, 'documents'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const documents: Document[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isDeleted = data.isDeleted === true; // treat undefined as not deleted
      if (isDeleted) return;
      documents.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isDeleted: isDeleted,
        deletedAt: data.deletedAt?.toDate?.()?.toISOString() || null,
        // S3 file storage
        s3Url: data.s3Url || null,
        s3Key: data.s3Key || null,
        originalFileName: data.originalFileName || null,
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || null,
        isImported: data.isImported || false,
      });
    });

    documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return documents;
  } catch (error: any) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }
};

// Get trashed documents for a user
export const getUserTrashDocuments = async (userId: string): Promise<Document[]> => {
  try {
    const q = query(collection(db, 'documents'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const documents: Document[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isDeleted = data.isDeleted === true;
      if (!isDeleted) return;
      documents.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isDeleted: isDeleted,
        deletedAt: data.deletedAt?.toDate?.()?.toISOString() || null,
        // S3 file storage
        s3Url: data.s3Url || null,
        s3Key: data.s3Key || null,
        originalFileName: data.originalFileName || null,
        fileSize: data.fileSize || null,
        mimeType: data.mimeType || null,
        isImported: data.isImported || false,
      });
    });
    documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return documents;
  } catch (error: any) {
    throw new Error(`Failed to fetch trashed documents: ${error.message}`);
  }
};

// Get a single document by ID
export const getDocument = async (documentId: string): Promise<Document | null> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isDeleted: data.isDeleted || false,
        deletedAt: data.deletedAt?.toDate?.()?.toISOString() || null,
      };
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch document: ${error.message}`);
  }
}; 