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
  updateDoc 
} from 'firebase/firestore';

export interface Template {
  id?: string;
  title: string;
  description: string;
  category: string;
  content: string;
  fileName: string;
  fileSize: number;
  frontImage?: string; // Base64 encoded image or URL
  uploadedAt: any;
  uploadedBy: string;
  status: 'active' | 'inactive';
}

export interface TemplateUploadData {
  title: string;
  description: string;
  category: string;
  content: string;
  fileName: string;
  fileSize: number;
  frontImage?: string; // Base64 encoded image or URL
  uploadedBy: string;
}

// Upload a new template
export const uploadTemplate = async (templateData: TemplateUploadData): Promise<string | null> => {
  try {
    console.log('=== FIREBASE UPLOAD START ===');
    console.log('Firebase: Template data received:', templateData);
    console.log('Firebase: Adding to collection "templates"');
    
    const docRef = await addDoc(collection(db, 'templates'), {
      ...templateData,
      uploadedAt: serverTimestamp(),
      status: 'active'
    });
    
    console.log('Firebase: Document added with ID:', docRef.id);
    console.log('=== FIREBASE UPLOAD SUCCESS ===');
    return docRef.id;
  } catch (error) {
    console.error('Firebase: Error uploading template:', error);
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
    const docSnap = await getDocs(query(collection(db, 'templates'), where('__name__', '==', templateId)));
    
    if (!docSnap.empty) {
      const doc = docSnap.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Template;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting template by ID:', error);
    return null;
  }
}; 