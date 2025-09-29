'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { loginUser, registerUser, logoutUser, getCurrentUser, resetPassword as resetPasswordFirebase, User } from '../firebase/auth';
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
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  documents: Document[];
  saveDocument: (title: string, content: string, type: 'assignment' | 'presentation') => Promise<string | null>;
  loadDocument: (id: string) => Document | null;
  deleteDocument: (id: string) => Promise<boolean>; // permanent delete
  moveToTrash: (id: string) => Promise<boolean>;
  restoreDocument: (id: string) => Promise<boolean>;
  refreshDocuments: () => Promise<void>;
  loading: boolean;
  sessionExpired: boolean;
  showSessionWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Session timeout management
  useEffect(() => {
    let sessionTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetSessionTimer = () => {
      // Clear existing timers
      if (sessionTimer) clearTimeout(sessionTimer);
      if (warningTimer) clearTimeout(warningTimer);

      if (user) {
        // Set session to expire after 24 hours (24 * 60 * 60 * 1000 ms)
        const SESSION_DURATION = 24 * 60 * 60 * 1000;
        const WARNING_TIME = 23 * 60 * 60 * 1000; // Show warning 1 hour before expiry

        // Save session start time
        localStorage.setItem('sessionStartTime', Date.now().toString());

        // Set warning timer (23 hours)
        warningTimer = setTimeout(() => {
          setShowSessionWarning(true);
        }, WARNING_TIME);

        // Set session expiry timer (24 hours)
        sessionTimer = setTimeout(() => {
          console.log('⏰ Session expired after 24 hours of inactivity');
          setSessionExpired(true);
          setUser(null);
          setDocuments([]);
          localStorage.removeItem('sessionStartTime');
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login?reason=session_expired';
          }
        }, SESSION_DURATION);
      }
    };

    // Check for existing session on mount
    const checkExistingSession = () => {
      const sessionStartTime = localStorage.getItem('sessionStartTime');
      if (sessionStartTime && user) {
        const elapsed = Date.now() - parseInt(sessionStartTime);
        const SESSION_DURATION = 24 * 60 * 60 * 1000;
        
        if (elapsed >= SESSION_DURATION) {
          // Session already expired
          console.log('⏰ Session already expired');
          setSessionExpired(true);
          setUser(null);
          setDocuments([]);
          localStorage.removeItem('sessionStartTime');
          if (typeof window !== 'undefined') {
            window.location.href = '/login?reason=session_expired';
          }
        } else {
          // Session still valid, reset timer
          resetSessionTimer();
        }
      }
    };

    if (user) {
      checkExistingSession();
    }

    // Reset timer on user activity
    const resetOnActivity = () => {
      if (user) {
        resetSessionTimer();
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity, true);
    });

    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      if (warningTimer) clearTimeout(warningTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity, true);
      });
    };
  }, [user]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 AuthContext: Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        // Determine role based on email (admin email check)
        const isAdmin = firebaseUser.email === 'ahmadmuaaz292@gmail.com';
        
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          role: isAdmin ? 'admin' : 'user'
        };
        console.log('🔄 AuthContext: Setting user data:', userData);
        setUser(userData);
        setSessionExpired(false);
        setShowSessionWarning(false);
        try {
          const userDocs = await getUserDocuments(firebaseUser.uid);
          console.log('📄 AuthContext: Loaded documents:', userDocs.length);
          setDocuments(userDocs);
        } catch (error) {
          console.error('Failed to load documents:', error);
        }
      } else {
        console.log('🔄 AuthContext: Clearing user data (no firebase user)');
        setUser(null);
        setDocuments([]);
        setSessionExpired(false);
        setShowSessionWarning(false);
        localStorage.removeItem('sessionStartTime');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try { 
      console.log('🔄 AuthContext: Starting login for:', email);
      await loginUser(email, password); 
      console.log('✅ AuthContext: Login successful for:', email);
      return true; 
    } catch (error) { 
      console.error('❌ AuthContext: Login error:', error); 
      return false; 
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try { await registerUser(email, password, name); return true; } catch (error) { console.error('Registration error:', error); return false; }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try { await resetPasswordFirebase(email); return true; } catch (error) { console.error('Password reset error:', error); return false; }
  }, []);

  const logout = useCallback(async () => {
    try { 
      console.log('🔄 AuthContext: Starting logout process...');
      console.log('🔄 AuthContext: Current user:', user);
      
      // Clear state first to prevent race conditions
      setUser(null); 
      setDocuments([]); 
      setSessionExpired(false);
      setShowSessionWarning(false);
      localStorage.removeItem('sessionStartTime');
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
  }, [user]);

  const extendSession = useCallback(() => {
    if (user) {
      setShowSessionWarning(false);
      localStorage.setItem('sessionStartTime', Date.now().toString());
      console.log('⏰ Session extended for 24 hours');
    }
  }, [user]);

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

  const contextValue = useMemo(() => ({
    user,
    login,
    register,
    resetPassword,
    logout,
    documents,
    saveDocument,
    loadDocument,
    deleteDocument,
    moveToTrash,
    restoreDocument,
    refreshDocuments,
    loading,
    sessionExpired,
    showSessionWarning,
    extendSession
  }), [
    user,
    login,
    register,
    resetPassword,
    logout,
    documents,
    saveDocument,
    loadDocument,
    deleteDocument,
    moveToTrash,
    restoreDocument,
    refreshDocuments,
    loading,
    sessionExpired,
    showSessionWarning,
    extendSession
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
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