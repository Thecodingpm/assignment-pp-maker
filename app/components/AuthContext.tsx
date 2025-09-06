'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { loginUser, registerUser, logoutUser, getCurrentUser, User } from '../firebase/auth';
import { 
  createDocument, 
  updateDocument, 
  deleteDocument as deleteFirebaseDocument, 
  getUserDocuments, 
  getDocument,
  moveToTrash as moveToTrashApi,
  restoreDocument as restoreDocumentApi,
  getUserTrashDocuments,
  Document 
} from '../firebase/documents';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  documents: Document[];
  saveDocument: (title: string, content: string, type: 'assignment' | 'presentation') => Promise<string | null>;
  loadDocument: (id: string) => Document | null;
  deleteDocument: (id: string) => Promise<boolean>; // permanent delete
  moveToTrash: (id: string) => Promise<boolean>;
  restoreDocument: (id: string) => Promise<boolean>;
  refreshDocuments: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 AuthContext: Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User'
        };
        console.log('🔄 AuthContext: Setting user data:', userData);
        setUser(userData);
        try {
          const userDocs = await getUserDocuments(firebaseUser.uid);
          setDocuments(userDocs);
        } catch (error) {
          console.error('Failed to load documents:', error);
        }
      } else {
        console.log('🔄 AuthContext: Clearing user data (no firebase user)');
        setUser(null);
        setDocuments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try { await loginUser(email, password); return true; } catch (error) { console.error('Login error:', error); return false; }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try { await registerUser(email, password, name); return true; } catch (error) { console.error('Registration error:', error); return false; }
  };

  const logout = async () => {
    try { 
      console.log('🔄 AuthContext: Starting logout process...');
      console.log('🔄 AuthContext: Current user:', user);
      
      // Clear state first to prevent race conditions
      setUser(null); 
      setDocuments([]); 
      console.log('✅ AuthContext: State cleared');
      
      // Then logout from Firebase
      await logoutUser(); 
      console.log('✅ AuthContext: Firebase logout successful');
      
      // Force a hard redirect to ensure logout
      if (typeof window !== 'undefined') {
        console.log('🔄 AuthContext: Redirecting to landing page...');
        // Use a more aggressive redirect with multiple fallbacks
        try {
          window.location.href = '/';
        } catch (e) {
          console.log('🔄 AuthContext: First redirect failed, trying replace...');
          window.location.replace('/');
        }
        
        // Force redirect after a short delay
        setTimeout(() => {
          try {
            window.location.href = '/';
          } catch (e) {
            window.location.replace('/');
          }
        }, 50);
      }
    } catch (error) { 
      console.error('❌ AuthContext: Logout error:', error); 
      // Even if there's an error, try to redirect
      if (typeof window !== 'undefined') {
        try {
          window.location.href = '/';
        } catch (e) {
          window.location.replace('/');
        }
      }
      throw error; // Re-throw to handle in component
    }
  };

  const refreshDocuments = async () => {
    if (!user) return;
    try { const list = await getUserDocuments(user.id); setDocuments(list); } catch (e) { console.error(e); }
  };

  const saveDocument = async (title: string, content: string, type: 'assignment' | 'presentation'): Promise<string | null> => {
    if (!user) return null;
    try {
      const documentId = await createDocument(user.id, { title, content, type });
      const newDocument: Document = {
        id: documentId,
        userId: user.id,
        title,
        content,
        type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        deletedAt: null,
      };
      setDocuments(prev => [newDocument, ...prev]);
      return documentId;
    } catch (error) {
      console.error('Save document error:', error);
      return null;
    }
  };

  const loadDocument = (id: string): Document | null => {
    return documents.find(doc => doc.id === id) || null;
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      await deleteFirebaseDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return true;
    } catch (error) {
      console.error('Delete document error:', error);
      return false;
    }
  };

  const moveToTrash = async (id: string): Promise<boolean> => {
    try {
      await moveToTrashApi(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      return true;
    } catch (e) {
      console.error('Move to trash error:', e);
      return false;
    }
  };

  const restoreDocument = async (id: string): Promise<boolean> => {
    try {
      await restoreDocumentApi(id);
      await refreshDocuments();
      return true;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      documents,
      saveDocument,
      loadDocument,
      deleteDocument,
      moveToTrash,
      restoreDocument,
      refreshDocuments,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 