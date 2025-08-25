import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { StructuredDocument } from '@/types/document';

export interface Template {
  id?: string;
  title: string;
  description: string;
  category: string;
  content: string; // Legacy HTML content for backward compatibility
  fileName: string;
  fileSize: number;
  frontImage?: string; // Base64 encoded image or URL
  originalFile?: File | ArrayBuffer | string; // Original file for DOCX rendering
  uploadedAt: any;
  uploadedBy: string;
  status: 'active' | 'inactive';
  originalFileName?: string;
  hasImages?: boolean;
  documentType?: 'formatted' | 'plain' | 'structured'; // Added structured type
  extractedImages?: string[];
  // New structured document fields
  structuredDocument?: StructuredDocument; // The new structured document format
  version?: number; // Template version for tracking changes
  lastEdited?: any; // Timestamp of last edit
  editHistory?: Array<{
    version: number;
    timestamp: any;
    editedBy: string;
    changes: string;
  }>;
}

export interface TemplateUploadData {
  title: string;
  description: string;
  category: string;
  content: string; // Legacy HTML content for backward compatibility
  fileName: string;
  fileSize: number;
  frontImage?: string; // Base64 encoded image or URL
  originalFile?: File | ArrayBuffer | string; // Optional - for local DOCX rendering only
  uploadedBy: string;
  originalFileName?: string;
  hasImages?: boolean;
  documentType?: 'formatted' | 'plain' | 'structured';
  extractedImages?: string[];
  // New structured document fields
  structuredDocument?: StructuredDocument;
  version?: number;
}

// Upload a new template
export const uploadTemplate = async (templateData: TemplateUploadData): Promise<string | null> => {
  try {
    console.log('=== FIREBASE UPLOAD START ===');
    console.log('Firebase: Template data received:', {
      title: templateData.title,
      description: templateData.description,
      category: templateData.category,
      fileName: templateData.fileName,
      fileSize: templateData.fileSize,
      contentLength: templateData.content?.length || 0,
      hasFrontImage: !!templateData.frontImage,
      uploadedBy: templateData.uploadedBy
    });
    console.log('Firebase: Adding to collection "templates"');
    
    // Remove originalFile from data to be uploaded (it can't be serialized)
    const { originalFile, ...uploadData } = templateData;
    
    const docRef = await addDoc(collection(db, 'templates'), {
      ...uploadData,
      uploadedAt: serverTimestamp(),
      status: 'active'
    });
    
    console.log('Firebase: Document added with ID:', docRef.id);
    console.log('=== FIREBASE UPLOAD SUCCESS ===');
    return docRef.id;
  } catch (error) {
    console.error('Firebase: Error uploading template:', error);
    console.error('Firebase: Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    console.log('=== FIREBASE UPLOAD FAILED ===');
    return null;
  }
};

// Get all templates
export const getTemplates = async (): Promise<Template[]> => {
  try {
    console.log('=== FIREBASE GET TEMPLATES START ===');
    console.log('Firebase: Querying collection "templates"');
    
    const q = query(
      collection(db, 'templates'),
      where('status', '==', 'active'),
      orderBy('uploadedAt', 'desc')
    );
    
    console.log('Firebase: Query created, executing...');
    const querySnapshot = await getDocs(q);
    console.log('Firebase: Query executed, docs found:', querySnapshot.size);
    
    const templates: Template[] = [];
    
    querySnapshot.forEach((doc) => {
      const templateData = {
        id: doc.id,
        ...doc.data()
      } as Template;
      templates.push(templateData);
      console.log('Firebase: Template found:', templateData.id, templateData.title);
    });
    
    console.log('Firebase: Total templates returned:', templates.length);
    console.log('=== FIREBASE GET TEMPLATES SUCCESS ===');
    return templates;
  } catch (error) {
    console.error('Firebase: Error getting templates:', error);
    console.log('=== FIREBASE GET TEMPLATES FAILED ===');
    return [];
  }
};

// Get templates by category
export const getTemplatesByCategory = async (category: string): Promise<Template[]> => {
  try {
    const q = query(
      collection(db, 'templates'),
      where('category', '==', category),
      where('status', '==', 'active'),
      orderBy('uploadedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const templates: Template[] = [];
    
    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        ...doc.data()
      } as Template);
    });
    
    return templates;
  } catch (error) {
    console.error('Error getting templates by category:', error);
    return [];
  }
};

// Update a template
export const updateTemplate = async (templateId: string, updates: Partial<Template>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'templates', templateId);
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating template:', error);
    return false;
  }
};

// Delete a template
export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'templates', templateId));
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
};

// Get template by ID
export const getTemplateById = async (templateId: string): Promise<Template | null> => {
  try {
    console.log('=== FIREBASE GET TEMPLATE BY ID START ===');
    console.log('Looking for template ID:', templateId);
    
    const docRef = doc(db, 'templates', templateId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const templateData = {
        id: docSnap.id,
        ...docSnap.data()
      } as Template;
      console.log('Template found:', templateData.title);
      console.log('Template content length:', templateData.content?.length || 0);
      console.log('=== FIREBASE GET TEMPLATE BY ID SUCCESS ===');
      return templateData;
    } else {
      console.log('Template not found with ID:', templateId);
      console.log('=== FIREBASE GET TEMPLATE BY ID NOT FOUND ===');
      return null;
    }
  } catch (error) {
    console.error('=== FIREBASE GET TEMPLATE BY ID FAILED ===', error);
    return null;
  }
};

// Upload a structured document template
export const uploadStructuredTemplate = async (templateData: TemplateUploadData): Promise<string | null> => {
  try {
    console.log('=== FIREBASE STRUCTURED TEMPLATE UPLOAD START ===');
    console.log('Firebase: Structured template data received:', {
      title: templateData.title,
      description: templateData.description,
      category: templateData.category,
      fileName: templateData.fileName,
      fileSize: templateData.fileSize,
      hasStructuredDocument: !!templateData.structuredDocument,
      uploadedBy: templateData.uploadedBy
    });
    
    // Remove originalFile from data to be uploaded (it can't be serialized)
    const { originalFile, ...uploadData } = templateData;
    
    const docRef = await addDoc(collection(db, 'templates'), {
      ...uploadData,
      documentType: 'structured',
      version: 1,
      uploadedAt: serverTimestamp(),
      lastEdited: serverTimestamp(),
      status: 'active'
    });
    
    console.log('Firebase: Structured template added with ID:', docRef.id);
    console.log('=== FIREBASE STRUCTURED TEMPLATE UPLOAD SUCCESS ===');
    return docRef.id;
  } catch (error) {
    console.error('Firebase: Error uploading structured template:', error);
    console.log('=== FIREBASE STRUCTURED TEMPLATE UPLOAD FAILED ===');
    return null;
  }
};

// Update a structured document template
export const updateStructuredTemplate = async (
  templateId: string, 
  structuredDocument: StructuredDocument, 
  editedBy: string,
  changes: string
): Promise<boolean> => {
  try {
    console.log('=== FIREBASE STRUCTURED TEMPLATE UPDATE START ===');
    console.log('Firebase: Updating template:', templateId);
    
    // Get current template to update version and history
    const templateRef = doc(db, 'templates', templateId);
    const templateDoc = await getDoc(templateRef);
    
    if (!templateDoc.exists()) {
      console.error('Template not found:', templateId);
      return false;
    }
    
    const currentTemplate = templateDoc.data() as Template;
    const newVersion = (currentTemplate.version || 1) + 1;
    
    // Create edit history entry
    const editEntry = {
      version: currentTemplate.version || 1,
      timestamp: serverTimestamp(),
      editedBy: editedBy,
      changes: changes
    };
    
    const editHistory = currentTemplate.editHistory || [];
    editHistory.push(editEntry);
    
    // Update template
    await updateDoc(templateRef, {
      structuredDocument: structuredDocument,
      version: newVersion,
      lastEdited: serverTimestamp(),
      editHistory: editHistory.slice(-10) // Keep only last 10 versions
    });
    
    console.log('Firebase: Structured template updated successfully');
    console.log('=== FIREBASE STRUCTURED TEMPLATE UPDATE SUCCESS ===');
    return true;
  } catch (error) {
    console.error('Firebase: Error updating structured template:', error);
    console.log('=== FIREBASE STRUCTURED TEMPLATE UPDATE FAILED ===');
    return false;
  }
};

// Get structured document templates only
export const getStructuredTemplates = async (): Promise<Template[]> => {
  try {
    console.log('=== FIREBASE GET STRUCTURED TEMPLATES START ===');
    
    const q = query(
      collection(db, 'templates'),
      where('documentType', '==', 'structured'),
      where('status', '==', 'active'),
      orderBy('uploadedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Firebase: Found', querySnapshot.size, 'structured templates');
    
    const templates: Template[] = [];
    querySnapshot.forEach((doc) => {
      const templateData = {
        id: doc.id,
        ...doc.data()
      } as Template;
      templates.push(templateData);
    });
    
    console.log('=== FIREBASE GET STRUCTURED TEMPLATES SUCCESS ===');
    return templates;
  } catch (error) {
    console.error('Firebase: Error getting structured templates:', error);
    console.log('=== FIREBASE GET STRUCTURED TEMPLATES FAILED ===');
    return [];
  }
}; 