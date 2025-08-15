'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { uploadTemplate as firebaseUploadTemplate, getTemplates as firebaseGetTemplates, updateTemplate as firebaseUpdateTemplate, deleteTemplate as firebaseDeleteTemplate, Template, TemplateUploadData } from '../firebase/templates';
import { globalTemplateStore, GlobalTemplate } from '../utils/globalTemplateStore';

interface AdminContextType {
  isAdmin: boolean;
  adminEmail: string | null;
  loginAsAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  checkAdminStatus: () => boolean;
  isCurrentUserAdmin: () => boolean;
  uploadTemplate: (file: File, title: string, description: string, category: string) => Promise<boolean>;
  getTemplates: () => Promise<Template[]>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<boolean>;
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
      console.log('File:', file.name, 'Size:', file.size);
      console.log('Title:', title, 'Description:', description, 'Category:', category);
      
      const content = await file.text();
      console.log('File content read, size:', content.length);
      
      const templateData: TemplateUploadData = {
        title,
        description,
        category,
        content,
        fileName: file.name,
        fileSize: file.size,
        frontImage,
        uploadedBy: user?.email || 'unknown'
      };
      
      console.log('Created template data:', templateData);
      
      // Try Firebase first, fallback to localStorage
      let templateId: string | null = null;
      
      try {
        console.log('Trying Firebase upload...');
        templateId = await firebaseUploadTemplate(templateData);
        console.log('Firebase upload result:', templateId);
      } catch (firebaseError) {
        console.log('Firebase failed, using localStorage fallback');
        templateId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
        globalTemplateStore.addTemplate(newTemplate);
        console.log('Added to global store for all users');
        
        // Save to localStorage as backup
        try {
          localStorage.setItem('localTemplates', JSON.stringify(currentTemplates));
          console.log('Saved to localStorage as backup');
          
          // Dispatch custom event to notify other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('localStorageChange'));
          }
        } catch (localError) {
          console.log('localStorage save failed:', localError);
        }
        
        console.log('=== ADMINCONTEXT UPLOAD SUCCESS ===');
        return true;
      } else {
        console.log('Upload failed completely');
        return false;
      }
      
    } catch (error) {
      console.error('Error uploading template:', error);
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
    getTemplates,
    updateTemplate,
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