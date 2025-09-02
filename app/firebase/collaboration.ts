import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

export interface Collaborator {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  cursorPosition?: { x: number; y: number };
  lastSeen: Date;
  isActive: boolean;
  permission: 'view' | 'edit' | 'admin';
  isTyping?: boolean;
  selection?: { start: number; end: number };
}

export interface CollaborationSession {
  documentId: string;
  sessionId: string;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  collaborators: Collaborator[];
  settings: {
    allowViewers: boolean;
    allowEditing: boolean;
    requireApproval: boolean;
  };
}

export interface CursorPosition {
  userId: string;
  userName: string;
  userAvatar: string;
  x: number;
  y: number;
  timestamp: Date;
}

export interface EditOperation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'insert' | 'delete' | 'format' | 'selection';
  position: number;
  content?: string;
  length?: number;
  format?: string;
  timestamp: Date;
  selection?: { start: number; end: number };
}

// Create a new collaboration session
export const createCollaborationSession = async (
  documentId: string, 
  ownerId: string,
  ownerName: string,
  ownerEmail: string,
  ownerAvatar: string,
  settings?: Partial<CollaborationSession['settings']>
): Promise<string> => {
  try {
    const sessionId = `session_${documentId}_${Date.now()}`;
    
    const sessionData = {
      documentId,
      sessionId,
      ownerId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        allowViewers: true,
        allowEditing: true,
        requireApproval: false,
        ...settings
      },
      collaborators: [{
        id: ownerId,
        userId: ownerId,
        userName: ownerName,
        userEmail: ownerEmail,
        userAvatar: ownerAvatar,
        lastSeen: new Date(),
        isActive: true,
        permission: 'admin'
      }]
    };

    await setDoc(doc(db, 'collaboration_sessions', sessionId), sessionData);
    
    // Create a presence document for the owner
    await setDoc(doc(db, 'presence', `${sessionId}_${ownerId}`), {
      userId: ownerId,
      userName: ownerName,
      userAvatar: ownerAvatar,
      sessionId,
      isActive: true,
      lastSeen: serverTimestamp(),
      cursorPosition: null,
      permission: 'admin'
    });

    return sessionId;
  } catch (error: any) {
    throw new Error(`Failed to create collaboration session: ${error.message}`);
  }
};

// Join a collaboration session
export const joinCollaborationSession = async (
  sessionId: string,
  userId: string,
  userName: string,
  userEmail: string,
  userAvatar: string,
  requestedPermission: 'view' | 'edit' = 'view'
): Promise<{ success: boolean; permission: string; message: string }> => {
  try {
    const sessionRef = doc(db, 'collaboration_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return { success: false, permission: 'view', message: 'Session not found' };
    }
    
    const sessionData = sessionDoc.data();
    const settings = sessionData.settings;
    
    // Determine actual permission based on session settings
    let actualPermission: 'view' | 'edit' | 'admin' = 'view';
    
    if (requestedPermission === 'edit' && settings.allowEditing) {
      actualPermission = 'edit';
    } else if (requestedPermission === 'view' && settings.allowViewers) {
      actualPermission = 'view';
    } else {
      return { 
        success: false, 
        permission: 'view', 
        message: 'Requested permission not allowed in this session' 
      };
    }
    
    // Add user to session collaborators
    const existingCollaborators = sessionData.collaborators || [];
    const userExists = existingCollaborators.find((c: Collaborator) => c.userId === userId);
    
    if (!userExists) {
      const newCollaborator = {
        id: userId,
        userId,
        userName,
        userEmail,
        userAvatar,
        lastSeen: new Date(),
        isActive: true,
        permission: actualPermission
      };
      
      await updateDoc(sessionRef, {
        collaborators: [...existingCollaborators, newCollaborator],
        updatedAt: serverTimestamp()
      });
    }

    // Create presence document for the user
    await setDoc(doc(db, 'presence', `${sessionId}_${userId}`), {
      userId,
      userName,
      userAvatar,
      sessionId,
      isActive: true,
      lastSeen: serverTimestamp(),
      cursorPosition: null,
      permission: actualPermission
    });

    return { 
      success: true, 
      permission: actualPermission, 
      message: `Joined session with ${actualPermission} permission` 
    };
  } catch (error: any) {
    throw new Error(`Failed to join collaboration session: ${error.message}`);
  }
};

// Update user permission
export const updateUserPermission = async (
  sessionId: string,
  targetUserId: string,
  newPermission: 'view' | 'edit' | 'admin',
  adminUserId: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'collaboration_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    
    const sessionData = sessionDoc.data();
    const adminUser = sessionData.collaborators.find((c: Collaborator) => c.userId === adminUserId);
    
    if (!adminUser || adminUser.permission !== 'admin') {
      throw new Error('Only admins can update user permissions');
    }
    
    const updatedCollaborators = sessionData.collaborators.map((c: Collaborator) => 
      c.userId === targetUserId ? { ...c, permission: newPermission } : c
    );
    
    await updateDoc(sessionRef, {
      collaborators: updatedCollaborators,
      updatedAt: serverTimestamp()
    });
    
    // Update presence document
    const presenceRef = doc(db, 'presence', `${sessionId}_${targetUserId}`);
    await updateDoc(presenceRef, {
      permission: newPermission,
      lastSeen: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(`Failed to update user permission: ${error.message}`);
  }
};

// Leave a collaboration session
export const leaveCollaborationSession = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  try {
    // Remove presence document
    await deleteDoc(doc(db, 'presence', `${sessionId}_${userId}`));
    
    // Update session to remove user from collaborators
    const sessionRef = doc(db, 'collaboration_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      const sessionData = sessionDoc.data();
      const updatedCollaborators = sessionData.collaborators.filter(
        (collaborator: Collaborator) => collaborator.userId !== userId
      );
      
      await updateDoc(sessionRef, {
        collaborators: updatedCollaborators,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error: any) {
    throw new Error(`Failed to leave collaboration session: ${error.message}`);
  }
};

// Update user presence and cursor position
export const updateUserPresence = async (
  sessionId: string,
  userId: string,
  cursorPosition?: { x: number; y: number },
  isTyping?: boolean,
  selection?: { start: number; end: number }
): Promise<void> => {
  try {
    const presenceRef = doc(db, 'presence', `${sessionId}_${userId}`);
    await updateDoc(presenceRef, {
      lastSeen: serverTimestamp(),
      cursorPosition: cursorPosition || null,
      isTyping: isTyping || false,
      selection: selection || null
    });
  } catch (error: any) {
    console.error('Failed to update user presence:', error);
  }
};

// Subscribe to collaboration session changes
export const subscribeToCollaborationSession = (
  sessionId: string,
  callback: (session: CollaborationSession | null) => void
) => {
  return onSnapshot(
    doc(db, 'collaboration_sessions', sessionId),
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          documentId: data.documentId,
          sessionId: data.sessionId,
          ownerId: data.ownerId,
          isActive: data.isActive,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          collaborators: data.collaborators || [],
          settings: data.settings || {
            allowViewers: true,
            allowEditing: true,
            requireApproval: false
          }
        });
      } else {
        callback(null);
      }
    }
  );
};

// Subscribe to user presence changes
export const subscribeToUserPresence = (
  sessionId: string,
  callback: (presence: any[]) => void
) => {
  const presenceQuery = query(
    collection(db, 'presence'),
    where('sessionId', '==', sessionId),
    orderBy('lastSeen', 'desc')
  );

  return onSnapshot(presenceQuery, (snapshot) => {
    const presence: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      presence.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        isActive: data.isActive,
        lastSeen: data.lastSeen?.toDate() || new Date(),
        cursorPosition: data.cursorPosition,
        permission: data.permission || 'view',
        isTyping: data.isTyping || false,
        selection: data.selection
      });
    });
    callback(presence);
  });
};

// Get active collaboration sessions for a document
export const getActiveCollaborationSession = async (documentId: string): Promise<CollaborationSession | null> => {
  try {
    const sessionsQuery = query(
      collection(db, 'collaboration_sessions'),
      where('documentId', '==', documentId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(sessionsQuery);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        documentId: data.documentId,
        sessionId: data.sessionId,
        ownerId: data.ownerId,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        collaborators: data.collaborators || [],
        settings: data.settings || {
          allowViewers: true,
          allowEditing: true,
          requireApproval: false
        }
      };
    }
    return null;
  } catch (error: any) {
    throw new Error(`Failed to get collaboration session: ${error.message}`);
  }
};

// End a collaboration session
export const endCollaborationSession = async (sessionId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Mark session as inactive
    const sessionRef = doc(db, 'collaboration_sessions', sessionId);
    batch.update(sessionRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });
    
    // Remove all presence documents for this session
    const presenceQuery = query(
      collection(db, 'presence'),
      where('sessionId', '==', sessionId)
    );
    const presenceSnapshot = await getDocs(presenceQuery);
    presenceSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error: any) {
    throw new Error(`Failed to end collaboration session: ${error.message}`);
  }
};

// Real-time document synchronization
export const syncDocumentContent = async (
  sessionId: string,
  content: string,
  userId: string
): Promise<void> => {
  try {
    const syncRef = doc(db, 'document_sync', sessionId);
    await setDoc(syncRef, {
      content,
      lastUpdatedBy: userId,
      lastUpdatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error: any) {
    console.error('Failed to sync document content:', error);
  }
};

// Subscribe to document content changes
export const subscribeToDocumentContent = (
  sessionId: string,
  callback: (content: string, lastUpdatedBy: string) => void
) => {
  return onSnapshot(
    doc(db, 'document_sync', sessionId),
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.content || '', data.lastUpdatedBy || '');
      }
    }
  );
};

// Real-time editing operations
export const sendEditOperation = async (
  sessionId: string,
  operation: Omit<EditOperation, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    const operationData = {
      ...operation,
      id: `${operation.userId}_${Date.now()}_${Math.random()}`,
      timestamp: serverTimestamp()
    };
    
    await addDoc(collection(db, 'edit_operations'), {
      sessionId,
      ...operationData
    });
  } catch (error: any) {
    console.error('Failed to send edit operation:', error);
  }
};

// Subscribe to edit operations
export const subscribeToEditOperations = (
  sessionId: string,
  callback: (operations: EditOperation[]) => void
) => {
  const operationsQuery = query(
    collection(db, 'edit_operations'),
    where('sessionId', '==', sessionId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(operationsQuery, (snapshot) => {
    const operations: EditOperation[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      operations.push({
        id: data.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        type: data.type,
        position: data.position,
        content: data.content,
        length: data.length,
        format: data.format,
        timestamp: data.timestamp?.toDate() || new Date(),
        selection: data.selection
      });
    });
    callback(operations);
  });
};

// Update session settings
export const updateSessionSettings = async (
  sessionId: string,
  settings: Partial<CollaborationSession['settings']>,
  adminUserId: string
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'collaboration_sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    
    const sessionData = sessionDoc.data();
    const adminUser = sessionData.collaborators.find((c: Collaborator) => c.userId === adminUserId);
    
    if (!adminUser || adminUser.permission !== 'admin') {
      throw new Error('Only admins can update session settings');
    }
    
    await updateDoc(sessionRef, {
      settings: { ...sessionData.settings, ...settings },
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw new Error(`Failed to update session settings: ${error.message}`);
  }
}; 