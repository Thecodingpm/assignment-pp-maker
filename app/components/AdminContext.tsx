'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Template, TemplateUploadData, uploadTemplate as firebaseUploadTemplate, uploadStructuredTemplate as firebaseUploadStructuredTemplate, getTemplates as firebaseGetTemplates, updateTemplate as firebaseUpdateTemplate, updateStructuredTemplate as firebaseUpdateStructuredTemplate, deleteTemplate as firebaseDeleteTemplate } from '../firebase/templates';
import { globalTemplateStore } from '../utils/globalTemplateStore';
import { parseDocxFile } from '../utils/docxParser';
import { parseDocumentToBlocks } from '../utils/documentParser';
import { StructuredDocument } from '../types/document';
import mammoth from 'mammoth';

interface AdminContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  loginAsAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  checkAdminStatus: () => boolean;
  isCurrentUserAdmin: () => boolean;
  uploadTemplate: (file: File, title: string, description: string, category: string) => Promise<boolean>;
  uploadStructuredTemplate: (file: File, title: string, description: string, category: string) => Promise<boolean>;

  getTemplates: () => Promise<Template[]>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<boolean>;
  updateStructuredTemplate: (id: string, structuredDocument: StructuredDocument, changes: string) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const { user } = useAuth();

  // Admin credentials
  const ADMIN_EMAIL = 'ahmadmuaaz292@gmail.com';
  const ADMIN_PASSWORD = 'Admin123';

  const checkAdminStatus = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    if (user && user.email === ADMIN_EMAIL) {
      const authenticated = localStorage.getItem('admin_authenticated');
      const sessionTime = localStorage.getItem('admin_session_time');
      const storedEmail = localStorage.getItem('admin_email');
      
      if (authenticated && sessionTime && storedEmail === ADMIN_EMAIL) {
        const now = Date.now();
        const sessionAge = now - parseInt(sessionTime);
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge <= maxSessionAge) {
          setIsAdmin(true);
          setAdminEmail(user.email);
          return true;
        }
      }
    }
    
    setIsAdmin(false);
    setAdminEmail(null);
    return false;
  };

  const loginAsAdmin = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      if (user && user.email === ADMIN_EMAIL) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_session_time', Date.now().toString());
        localStorage.setItem('admin_email', email);
        
        setIsAdmin(true);
        setAdminEmail(email);
        
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/template-upload';
        }
        
        return true;
      } else {
        return false;
      }
    }
    
    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session_time');
    localStorage.removeItem('admin_email');
    
    setIsAdmin(false);
    setAdminEmail(null);
  };

  const isCurrentUserAdmin = (): boolean => {
    return user?.email === ADMIN_EMAIL && isAdmin;
  };

  const uploadTemplate = async (file: File, title: string, description: string, category: string, frontImage?: string): Promise<boolean> => {
    try {
      console.log('=== ADMINCONTEXT UPLOAD START ===');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Title:', title, 'Description:', description, 'Category:', category);
      
      // Validate inputs
      if (!file || !title || !description || !category) {
        console.error('Missing required fields:', { file: !!file, title: !!title, description: !!description, category: !!category });
        return false;
      }
      
      let content: string;
      let extractedTitle = title;
      let originalFile: File | ArrayBuffer | string | undefined;
      
      // Check if this is a DOCX file
      const isDocxFile = file.name.toLowerCase().endsWith('.docx');
      
      if (isDocxFile) {
        // For DOCX files, store the original file for exact rendering
        console.log('DOCX file detected - storing original file for exact formatting');
        originalFile = file;
        
        // Also parse for basic content extraction with error handling
        try {
          console.log('Parsing DOCX file for content extraction...');
          const parsedDoc = await parseDocxFile(file);
          content = parsedDoc.content;
          console.log('DOCX content extracted successfully');
          console.log('DOCX content length:', content.length);
          console.log('DOCX content preview (first 500 chars):', content.substring(0, 500));
          console.log('DOCX content preview (last 200 chars):', content.substring(Math.max(0, content.length - 200)));
          console.log('DOCX content contains HTML tags:', content.includes('<') && content.includes('>'));
          console.log('DOCX content contains styling:', content.includes('style=') || content.includes('class='));
          
          if (parsedDoc.metadata?.title && title === file.name.replace(/\.[^/.]+$/, '')) {
            extractedTitle = parsedDoc.metadata.title;
            console.log('Title extracted from DOCX:', extractedTitle);
          }
        } catch (parseError) {
          console.error('Failed to parse DOCX file:', parseError);
          // Still proceed with original file for rendering
          content = `<p>DOCX Template: ${file.name}</p><p>Note: Content extraction failed, but original file is preserved for exact rendering.</p>`;
        }
      } else {
        // Parse all other file types using the universal parser
        console.log('Processing file with universal parser...');
        
        try {
          const parsedDoc = await parseDocxFile(file);
          
          content = parsedDoc.content;
          if (parsedDoc.metadata?.title && title === file.name.replace(/\.[^/.]+$/, '')) {
            extractedTitle = parsedDoc.metadata.title;
          }
          
          console.log('File content extracted, length:', content.length);
          console.log('Extracted title:', extractedTitle);
          console.log('Content preview (first 500 chars):', content.substring(0, 500));
          console.log('Content preview (last 200 chars):', content.substring(Math.max(0, content.length - 200)));
          console.log('Content contains HTML tags:', content.includes('<') && content.includes('>'));
          console.log('Content contains styling:', content.includes('style=') || content.includes('class='));
          
        } catch (parseError) {
          console.error('Failed to parse file:', parseError);
          return false;
        }
      }
      
      // Get additional metadata from parsed document
      let hasImages = false;
      let documentType: 'formatted' | 'plain' = 'plain';
      let extractedImages: string[] = [];
      
      if (isDocxFile) {
        try {
          const parsedDoc = await parseDocxFile(file);
          // For DOCX files, we can't extract these properties from the ParsedDocument
          // They would need to be extracted differently or set to defaults
          hasImages = false;
          documentType = 'formatted';
          extractedImages = [];
        } catch (error) {
          console.log('Could not extract additional metadata from DOCX:', error);
        }
      } else {
        try {
          const parsedDoc = await parseDocxFile(file);
          // For non-DOCX files, we can't extract these properties from the ParsedDocument
          // They would need to be extracted differently or set to defaults
          hasImages = false;
          documentType = 'plain';
          extractedImages = [];
        } catch (error) {
          console.log('Could not extract additional metadata:', error);
        }
      }
      
      const templateData: TemplateUploadData = {
        title: extractedTitle,
        description,
        category,
        content,
        fileName: file.name,
        fileSize: file.size,
        frontImage,
        uploadedBy: user?.email || 'unknown',
        originalFileName: file.name,
        hasImages: hasImages,
        documentType: documentType,
        extractedImages: extractedImages
        // Note: originalFile is not included in Firebase upload as it can't be serialized
        // It will be stored locally for DOCX rendering
      };
      
      console.log('=== TEMPLATE DATA TO BE STORED ===');
      console.log('Template title:', templateData.title);
      console.log('Template description:', templateData.description);
      console.log('Template category:', templateData.category);
      console.log('Template content length:', templateData.content.length);
      console.log('Template content preview (first 1000 chars):', templateData.content.substring(0, 1000));
      console.log('Template content preview (last 500 chars):', templateData.content.substring(Math.max(0, templateData.content.length - 500)));
      console.log('Template file name:', templateData.fileName);
      console.log('Template file size:', templateData.fileSize);
      console.log('Template uploaded by:', templateData.uploadedBy);
      console.log('📊 Template Metadata:');
      console.log('   Original file name:', templateData.originalFileName);
      console.log('   Has images:', templateData.hasImages);
      console.log('   Document type:', templateData.documentType);
      console.log('   Extracted images count:', templateData.extractedImages?.length || 0);
      console.log('Full template data object:', templateData);
      
      // Store original file locally for DOCX rendering if needed
      if (isDocxFile && originalFile) {
        try {
          // Store the original file in localStorage for DOCX rendering
          const fileKey = `docx_file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(fileKey, JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            uploadTime: Date.now()
          }));
          console.log('Original DOCX file reference stored locally:', fileKey);
        } catch (localStorageError) {
          console.warn('Could not store DOCX file reference locally:', localStorageError);
        }
      }
      
      // Try Firebase upload FIRST - this is the primary storage
      let templateId: string | null = null;
      let firebaseError: any = null;
      
      try {
        console.log('Attempting Firebase upload...');
        templateId = await firebaseUploadTemplate(templateData);
        console.log('Firebase upload successful, ID:', templateId);
        
        if (templateId) {
          // Clear any Firebase blocked flag
          localStorage.removeItem('firebase_blocked');
          console.log('Firebase upload successful, cleared blocked flag');
        }
        
      } catch (error: any) {
        firebaseError = error;
        console.error('Firebase upload failed:', error);
        
        // Set Firebase blocked flag
        localStorage.setItem('firebase_blocked', Date.now().toString());
        
        // Check specific error types
        if (error.code === 'permission-denied') {
          console.error('Firebase permission denied - check rules');
          alert('❌ Firebase permission denied. Please check Firebase security rules.');
          return false;
        } else if (error.code === 'quota-exceeded') {
          console.error('Firebase quota exceeded');
          alert('❌ Firebase quota exceeded. Please upgrade your Firebase plan.');
          return false;
        } else if (error.code === 'resource-exhausted') {
          console.error('Firebase resource exhausted');
          alert('❌ Firebase storage full. Please clear some data or upgrade plan.');
          return false;
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          console.error('Network error - Firebase might be blocked');
          alert('❌ Network error. Firebase might be blocked by browser or network.');
        }
        
        console.log('Firebase failed, will try localStorage fallback...');
      }
      
      // If Firebase failed, try localStorage fallback with quota management
      if (!templateId) {
        console.log('Creating local template ID...');
        templateId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        try {
          // Check localStorage quota before attempting to save
          const templateSize = JSON.stringify(templateData).length;
          console.log('Template data size:', templateSize, 'bytes');
          
          // Try to estimate available space
          let availableSpace = 0;
          try {
            // Test localStorage capacity
            const testKey = 'storage_test_' + Date.now();
            const testData = 'x'.repeat(1024); // 1KB test
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            availableSpace = 1024; // At least 1KB available
          } catch (quotaError) {
            console.error('localStorage quota check failed:', quotaError);
            availableSpace = 0;
          }
          
          if (availableSpace < templateSize) {
            // Try to clear old templates to make space
            console.log('localStorage space low, clearing old templates...');
            try {
              const existingTemplates = localStorage.getItem('localTemplates');
              if (existingTemplates) {
                const templates = JSON.parse(existingTemplates);
                // Keep only the 5 most recent templates
                const recentTemplates = templates.slice(-5);
                localStorage.setItem('localTemplates', JSON.stringify(recentTemplates));
                console.log('Cleared old templates, kept 5 most recent');
              }
            } catch (clearError) {
              console.error('Failed to clear old templates:', clearError);
            }
          }
          
          const existingTemplates = localStorage.getItem('localTemplates');
          const templates = existingTemplates ? JSON.parse(existingTemplates) : [];
          
          const newTemplate = {
            id: templateId,
            ...templateData,
            uploadedAt: new Date().toISOString(),
            status: 'active'
          };
          
          templates.push(newTemplate);
          localStorage.setItem('localTemplates', JSON.stringify(templates));
          console.log('Template saved to localStorage as fallback');
          
          // Show warning to user
          if (firebaseError) {
            alert(`⚠️ Template saved locally because Firebase failed:\n\n${firebaseError.message}\n\nTemplate is only available on this device.`);
          }
          
        } catch (localStorageError: any) {
          console.error('localStorage fallback failed:', localStorageError);
          
          // Check if it's a quota error
          if (localStorageError.name === 'QuotaExceededError' || 
              localStorageError.message?.includes('quota') ||
              localStorageError.message?.includes('exceeded')) {
            
            alert('❌ Storage quota exceeded. Please:\n\n1. Clear browser data\n2. Try uploading a smaller template\n3. Check if Firebase is working');
            
            // Try to clear all localStorage and retry once
            try {
              console.log('Attempting to clear all localStorage and retry...');
              localStorage.clear();
              const newTemplate = {
                id: templateId,
                ...templateData,
                uploadedAt: new Date().toISOString(),
                status: 'active'
              };
              localStorage.setItem('localTemplates', JSON.stringify([newTemplate]));
              console.log('Successfully saved after clearing localStorage');
              
              if (firebaseError) {
                alert(`⚠️ Template saved locally (after clearing storage) because Firebase failed:\n\n${firebaseError.message}\n\nTemplate is only available on this device.`);
              }
              
            } catch (retryError) {
              console.error('Even clearing localStorage failed:', retryError);
              alert('❌ Failed to save template. Storage is completely full. Please clear browser data or try a smaller template.');
              return false;
            }
          } else {
            alert('❌ Failed to save template locally: ' + localStorageError.message);
            return false;
          }
        }
      }
      
      if (templateId) {
        console.log('Template uploaded successfully with ID:', templateId);
        
        // Add to local state immediately
        const newTemplate: Template = {
          id: templateId,
          ...templateData,
          uploadedAt: new Date().toISOString(),
          status: 'active'
        };
        
        const currentTemplates = [...templates, newTemplate];
        setTemplates(currentTemplates);
        
        // Add to global store for all users to access
        globalTemplateStore.addTemplate({
          ...newTemplate,
          id: newTemplate.id || templateId // Ensure id is always a string
        });
        console.log('Added to global store for all users');
        
        // Only save to localStorage as backup if Firebase succeeded
        if (!firebaseError) {
          try {
            const existingTemplates = localStorage.getItem('localTemplates');
            const localTemplates = existingTemplates ? JSON.parse(existingTemplates) : [];
            
            // Remove any existing template with same ID to avoid duplicates
            const filteredTemplates = localTemplates.filter((t: any) => t.id !== templateId);
            filteredTemplates.push(newTemplate);
            
            localStorage.setItem('localTemplates', JSON.stringify(filteredTemplates));
            console.log('Saved to localStorage as backup');
          } catch (localStorageError) {
            console.error('Failed to save to localStorage backup:', localStorageError);
            // Don't fail the upload if backup fails
          }
        }
        
        console.log('=== ADMINCONTEXT UPLOAD SUCCESS ===');
        return true;
      } else {
        console.error('Failed to get template ID from upload');
        return false;
      }
      
    } catch (error) {
      console.error('=== ADMINCONTEXT UPLOAD FAILED ===', error);
      return false;
    }
  };

  // Upload a structured document template
  const uploadStructuredTemplate = async (file: File, title: string, description: string, category: string, frontImage?: string): Promise<boolean> => {
    try {
      console.log('=== ADMINCONTEXT STRUCTURED TEMPLATE UPLOAD START ===');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Title:', title, 'Description:', description, 'Category:', category);
      
      // Validate inputs
      if (!file || !title || !description || !category) {
        console.error('Missing required fields:', { file: !!file, title: !!title, description: !!description, category: !!category });
        return false;
      }
      
      // Parse file to structured document format
      console.log('Parsing file to structured document format...');
      let structuredDocument: StructuredDocument;
      let originalContent = '';
      
      try {
        structuredDocument = await parseDocumentToBlocks(file, file.name);
        console.log('File parsed successfully to structured document');
        console.log('Structured document blocks:', structuredDocument.blocks.length);
        console.log('Document title:', structuredDocument.title);
        
        // Also extract original content for exact formatting preservation
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // For DOCX files, convert to HTML to preserve formatting
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          originalContent = result.value;
        } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
          // For HTML files, use the content directly
          originalContent = await file.text();
        } else {
          // For other files, use the text content
          originalContent = await file.text();
        }
        
        console.log('Original content extracted for formatting preservation');
      } catch (parseError) {
        console.error('Failed to parse file to structured document:', parseError);
        return false;
      }
      
      const templateData: TemplateUploadData = {
        title: structuredDocument.title || title,
        description,
        category,
        content: originalContent, // Store original content for exact formatting preservation
        fileName: file.name,
        fileSize: file.size,
        frontImage,
        uploadedBy: user?.email || 'unknown',
        originalFileName: file.name,
        hasImages: structuredDocument.blocks.some(block => block.type === 'image'),
        documentType: 'structured',
        structuredDocument: structuredDocument,
        version: 1
      };
      
      console.log('=== STRUCTURED TEMPLATE DATA TO BE STORED ===');
      console.log('Template title:', templateData.title);
      console.log('Template description:', templateData.description);
      console.log('Template category:', templateData.category);
      console.log('Structured document blocks:', templateData.structuredDocument?.blocks.length);
      console.log('Template file name:', templateData.fileName);
      console.log('Template file size:', templateData.fileSize);
      console.log('Template uploaded by:', templateData.uploadedBy);
      console.log('Document type:', templateData.documentType);
      
      // Try Firebase upload FIRST - this is the primary storage
      let templateId: string | null = null;
      let firebaseError: any = null;
      
      try {
        console.log('Attempting Firebase structured template upload...');
        templateId = await firebaseUploadStructuredTemplate(templateData);
        console.log('Firebase structured template upload successful, ID:', templateId);
        
        if (templateId) {
          // Clear any Firebase blocked flag
          localStorage.removeItem('firebase_blocked');
          console.log('Firebase structured template upload successful, cleared blocked flag');
        }
        
      } catch (error: any) {
        firebaseError = error;
        console.error('Firebase structured template upload failed:', error);
        
        // Set Firebase blocked flag
        localStorage.setItem('firebase_blocked', Date.now().toString());
        
        // Check specific error types
        if (error.code === 'permission-denied') {
          console.error('Firebase permission denied - check rules');
          alert('❌ Firebase permission denied. Please check Firebase security rules.');
          return false;
        } else if (error.code === 'quota-exceeded') {
          console.error('Firebase quota exceeded');
          alert('❌ Firebase quota exceeded. Please upgrade your Firebase plan.');
          return false;
        } else if (error.code === 'resource-exhausted') {
          console.error('Firebase resource exhausted');
          alert('❌ Firebase storage full. Please clear some data or upgrade plan.');
          return false;
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          console.error('Network error - Firebase might be blocked');
          alert('❌ Network error. Firebase might be blocked by browser or network.');
        }
        
        console.log('Firebase failed for structured template, will try localStorage fallback...');
      }
      
      // If Firebase failed, try localStorage fallback
      if (!templateId) {
        console.log('Creating local structured template ID...');
        templateId = 'local_structured_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        try {
          const existingTemplates = localStorage.getItem('localTemplates');
          const localTemplates = existingTemplates ? JSON.parse(existingTemplates) : [];
          
          // Check storage quota
          try {
            const testKey = 'quota_test_' + Date.now();
            const testValue = 'x'.repeat(1024); // 1KB test
            localStorage.setItem(testKey, testValue);
            localStorage.removeItem(testKey);
          } catch (quotaError) {
            alert('❌ Local storage is full. Please clear some data and try again.');
            return false;
          }
          
          // Remove any existing template with same ID to avoid duplicates
          const filteredTemplates = localTemplates.filter((t: any) => t.id !== templateId);
          filteredTemplates.push({
            id: templateId,
            ...templateData,
            uploadedAt: new Date().toISOString(),
            status: 'active'
          });
          
          localStorage.setItem('localTemplates', JSON.stringify(filteredTemplates));
          console.log('Structured template saved to localStorage as fallback');
          
        } catch (localStorageError: any) {
          console.error('Failed to save structured template to localStorage:', localStorageError);
          
          if (localStorageError.name === 'QuotaExceededError') {
            alert('❌ Local storage is full. Please clear some data and try again.');
            return false;
          } else {
            alert('❌ Failed to save structured template locally: ' + localStorageError.message);
            return false;
          }
        }
      }
      
      if (templateId) {
        console.log('Structured template uploaded successfully with ID:', templateId);
        
        // Add to local state immediately
        const newTemplate: Template = {
          id: templateId,
          ...templateData,
          uploadedAt: new Date().toISOString(),
          status: 'active'
        };
        
        const currentTemplates = [...templates, newTemplate];
        setTemplates(currentTemplates);
        
        // Add to global store for all users to access
        globalTemplateStore.addTemplate({
          ...newTemplate,
          id: newTemplate.id || templateId // Ensure id is always a string
        });
        console.log('Added structured template to global store for all users');
        
        // Only save to localStorage as backup if Firebase succeeded
        if (!firebaseError) {
          try {
            const existingTemplates = localStorage.getItem('localTemplates');
            const localTemplates = existingTemplates ? JSON.parse(existingTemplates) : [];
            
            // Remove any existing template with same ID to avoid duplicates
            const filteredTemplates = localTemplates.filter((t: any) => t.id !== templateId);
            filteredTemplates.push(newTemplate);
            
            localStorage.setItem('localTemplates', JSON.stringify(filteredTemplates));
            console.log('Saved structured template to localStorage as backup');
          } catch (localStorageError) {
            console.error('Failed to save structured template to localStorage backup:', localStorageError);
            // Don't fail the upload if backup fails
          }
        }
        
        console.log('=== ADMINCONTEXT STRUCTURED TEMPLATE UPLOAD SUCCESS ===');
        return true;
      } else {
        console.error('Failed to get structured template ID from upload');
        return false;
      }
      
    } catch (error) {
      console.error('=== ADMINCONTEXT STRUCTURED TEMPLATE UPLOAD FAILED ===', error);
      return false;
    }
  };



  const getTemplates = async (): Promise<Template[]> => {
    try {
      console.log('getTemplates called, trying Firebase first...');
      const firebaseTemplates = await firebaseGetTemplates();
      console.log('Firebase templates:', firebaseTemplates);
      
      if (firebaseTemplates && firebaseTemplates.length > 0) {
        setTemplates(firebaseTemplates);
        return firebaseTemplates;
      } else {
        // Try global store first, then localStorage as fallback
        console.log('No Firebase templates, trying global store...');
        const globalTemplates = globalTemplateStore.getTemplates();
        if (globalTemplates && globalTemplates.length > 0) {
          console.log('Found global store templates:', globalTemplates.length);
          setTemplates(globalTemplates);
          return globalTemplates;
        }
        
        // Try localStorage as fallback
        console.log('No global store templates, trying localStorage...');
        const localTemplates = localStorage.getItem('localTemplates');
        if (localTemplates) {
          const parsedTemplates = JSON.parse(localTemplates);
          console.log('Found localStorage templates:', parsedTemplates);
          setTemplates(parsedTemplates);
          return parsedTemplates;
        }
      }
      
      return templates;
    } catch (error) {
      console.error('Error getting templates from Firebase:', error);
      
      // Try global store first, then localStorage as fallback
      try {
        const globalTemplates = globalTemplateStore.getTemplates();
        if (globalTemplates && globalTemplates.length > 0) {
          console.log('Using global store fallback:', globalTemplates.length);
          setTemplates(globalTemplates);
          return globalTemplates;
        }
        
        const localTemplates = localStorage.getItem('localTemplates');
        if (localTemplates) {
          const parsedTemplates = JSON.parse(localTemplates);
          console.log('Using localStorage fallback:', parsedTemplates);
          setTemplates(parsedTemplates);
          return parsedTemplates;
        }
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
      }
      
      return templates;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>): Promise<boolean> => {
    try {
      console.log('Updating template:', id, updates);
      
      // Update in Firebase if possible
      let success = false;
      try {
        success = await firebaseUpdateTemplate(id, updates);
      } catch (firebaseError) {
        console.log('Firebase update failed, using localStorage');
      }
      
      if (success) {
        console.log('Template updated in Firebase successfully');
      }
      
      // Update local state
      const updatedTemplates = templates.map(template => 
        template.id === id ? { ...template, ...updates } : template
      );
      setTemplates(updatedTemplates);
      
      // Update global store
      const templateToUpdate = templates.find(t => t.id === id);
      if (templateToUpdate) {
        globalTemplateStore.updateTemplate(id, updates);
        console.log('Updated template in global store');
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('localTemplates', JSON.stringify(updatedTemplates));
        
        // Dispatch custom event to notify other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('localStorageChange'));
        }
      } catch (localError) {
        console.log('localStorage save failed:', localError);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  };

  const updateStructuredTemplate = async (id: string, structuredDocument: StructuredDocument, changes: string): Promise<boolean> => {
    try {
      console.log('Updating structured template:', id);
      console.log('Changes:', changes);
      console.log('Structured document blocks:', structuredDocument.blocks.length);
      
      // Update in Firebase if possible
      let success = false;
      try {
        success = await firebaseUpdateStructuredTemplate(id, structuredDocument, user?.email || 'unknown', changes);
      } catch (firebaseError) {
        console.log('Firebase structured template update failed, using localStorage');
      }
      
      if (success) {
        console.log('Structured template updated in Firebase successfully');
      }
      
      // Update local state
      const updatedTemplates = templates.map(template => 
        template.id === id ? { 
          ...template, 
          structuredDocument: structuredDocument,
          version: (template.version || 1) + 1,
          lastEdited: new Date().toISOString()
        } : template
      );
      setTemplates(updatedTemplates);
      
      // Update global store
      const templateToUpdate = templates.find(t => t.id === id);
      if (templateToUpdate) {
        globalTemplateStore.updateTemplate(id, {
          structuredDocument: structuredDocument,
          version: (templateToUpdate.version || 1) + 1,
          lastEdited: new Date().toISOString()
        });
        console.log('Updated structured template in global store');
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('localTemplates', JSON.stringify(updatedTemplates));
        
        // Dispatch custom event to notify other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('localStorageChange'));
        }
      } catch (localError) {
        console.log('localStorage save failed:', localError);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error updating structured template:', error);
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      console.log('Deleting template:', id);
      
      // Delete from Firebase if possible
      try {
        await firebaseDeleteTemplate(id);
      } catch (firebaseError) {
        console.log('Firebase delete failed, using localStorage');
      }
      
      // Update local state
      const updatedTemplates = templates.filter(template => template.id !== id);
      setTemplates(updatedTemplates);
      
      // Remove from global store
      globalTemplateStore.removeTemplate(id);
      console.log('Removed template from global store');
      
      // Save to localStorage
      try {
        localStorage.setItem('localTemplates', JSON.stringify(updatedTemplates));
        
        // Dispatch custom event to notify other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('localStorageChange'));
        }
      } catch (localError) {
        console.log('localStorage save failed:', localError);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  };

  useEffect(() => {
    checkAdminStatus();
    
    if (user) {
      getTemplates();
    }
  }, [user]);

  const value: AdminContextType = {
    isAdmin,
    adminEmail,
    loginAsAdmin,
    logoutAdmin,
    checkAdminStatus,
    isCurrentUserAdmin,
    uploadTemplate,
    uploadStructuredTemplate,

    getTemplates,
    updateTemplate,
    updateStructuredTemplate,
    deleteTemplate
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
} 