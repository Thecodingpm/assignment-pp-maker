'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../components/AuthContext';

// Types
export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  cursor_position?: {
    x: number;
    y: number;
    elementId?: string;
  };
  last_seen?: string;
  is_active: boolean;
  is_typing?: boolean;
  typing_element_id?: string;
}

export interface DocumentOperation {
  type: 'insert' | 'update' | 'delete' | 'move';
  elementId?: string;
  element?: any;
  updates?: any;
  slideIndex?: number;
  newPosition?: any;
  timestamp: number;
}

export interface CollaborationState {
  isConnected: boolean;
  currentDocumentId: string | null;
  users: Record<string, CollaborationUser>;
  documentVersion: number;
  isTyping: boolean;
  typingUsers: Record<string, { name: string; color: string; elementId?: string }>;
  cursorPositions: Record<string, { x: number; y: number; name: string; color: string }>;
  lastOperation: DocumentOperation | null;
}

export interface CollaborationContextType {
  // State
  state: CollaborationState;
  
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  
  // Document methods
  joinDocument: (documentId: string) => void;
  leaveDocument: (documentId: string) => void;
  
  // Collaboration methods
  sendOperation: (operation: Omit<DocumentOperation, 'timestamp'>) => void;
  updateCursor: (position: { x: number; y: number; elementId?: string }) => void;
  startTyping: (elementId?: string) => void;
  stopTyping: () => void;
  
  // Utility methods
  getCurrentUsers: () => CollaborationUser[];
  getUserById: (userId: string) => CollaborationUser | undefined;
  isUserOnline: (userId: string) => boolean;
}

// Create context
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// WebSocket server URL
const WS_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    currentDocumentId: null,
    users: {},
    documentVersion: 0,
    isTyping: false,
    typingUsers: {},
    cursorPositions: {},
    lastOperation: null,
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socket?.connected || !user) return;

    const newSocket = io(WS_SERVER_URL, {
      auth: {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Connected to collaboration server');
      setState(prev => ({ ...prev, isConnected: true }));
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from collaboration server');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // User events
    newSocket.on('user_joined', (data: { user: CollaborationUser; document_id: string }) => {
      console.log('👤 User joined:', data.user.name);
      setState(prev => ({
        ...prev,
        users: {
          ...prev.users,
          [data.user.id]: data.user,
        },
      }));
    });

    newSocket.on('user_left', (data: { user_id: string; document_id: string }) => {
      console.log('👤 User left:', data.user_id);
      setState(prev => {
        const newUsers = { ...prev.users };
        delete newUsers[data.user_id];
        
        const newTypingUsers = { ...prev.typingUsers };
        delete newTypingUsers[data.user_id];
        
        const newCursorPositions = { ...prev.cursorPositions };
        delete newCursorPositions[data.user_id];
        
        return {
          ...prev,
          users: newUsers,
          typingUsers: newTypingUsers,
          cursorPositions: newCursorPositions,
        };
      });
    });

    // Document events
    newSocket.on('document_state', (data: {
      content: any;
      version: number;
      users: Record<string, CollaborationUser>;
      last_modified?: string;
    }) => {
      console.log('📄 Document state received:', data.version);
      setState(prev => ({
        ...prev,
        documentVersion: data.version,
        users: data.users,
      }));
    });

    newSocket.on('document_updated', (data: {
      operation: DocumentOperation;
      version: number;
      user_id: string;
      timestamp: string;
    }) => {
      console.log('📝 Document updated by:', data.user_id);
      setState(prev => ({
        ...prev,
        documentVersion: data.version,
        lastOperation: data.operation,
      }));
    });

    // Cursor events
    newSocket.on('cursor_moved', (data: {
      user_id: string;
      position: { x: number; y: number };
      user_name: string;
      user_color: string;
    }) => {
      setState(prev => ({
        ...prev,
        cursorPositions: {
          ...prev.cursorPositions,
          [data.user_id]: {
            x: data.position.x,
            y: data.position.y,
            name: data.user_name,
            color: data.user_color,
          },
        },
      }));
    });

    // Typing events
    newSocket.on('user_typing', (data: {
      user_id: string;
      user_name: string;
      user_color: string;
      element_id?: string;
    }) => {
      setState(prev => ({
        ...prev,
        typingUsers: {
          ...prev.typingUsers,
          [data.user_id]: {
            name: data.user_name,
            color: data.user_color,
            elementId: data.element_id,
          },
        },
      }));
    });

    newSocket.on('user_stopped_typing', (data: { user_id: string }) => {
      setState(prev => {
        const newTypingUsers = { ...prev.typingUsers };
        delete newTypingUsers[data.user_id];
        return {
          ...prev,
          typingUsers: newTypingUsers,
        };
      });
    });

    setSocket(newSocket);
  }, [user]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setState(prev => ({
        ...prev,
        isConnected: false,
        currentDocumentId: null,
        users: {},
        typingUsers: {},
        cursorPositions: {},
      }));
    }
  }, [socket]);

  // Join a document
  const joinDocument = useCallback((documentId: string) => {
    if (!socket?.connected || !user) return;

    console.log('📄 Joining document:', documentId);
    socket.emit('join_document', {
      document_id: documentId,
      user_name: user.name,
      user_email: user.email,
    });

    setState(prev => ({ ...prev, currentDocumentId: documentId }));
  }, [socket, user]);

  // Leave a document
  const leaveDocument = useCallback((documentId: string) => {
    if (!socket?.connected) return;

    console.log('📄 Leaving document:', documentId);
    socket.emit('leave_document', { document_id: documentId });
    setState(prev => ({ ...prev, currentDocumentId: null }));
  }, [socket]);

  // Send document operation
  const sendOperation = useCallback((operation: Omit<DocumentOperation, 'timestamp'>) => {
    if (!socket?.connected || !state.currentDocumentId) return;

    const fullOperation: DocumentOperation = {
      ...operation,
      timestamp: Date.now(),
    };

    console.log('📝 Sending operation:', fullOperation);
    socket.emit('document_change', {
      document_id: state.currentDocumentId,
      operation: fullOperation,
    });
  }, [socket, state.currentDocumentId]);

  // Update cursor position
  const updateCursor = useCallback((position: { x: number; y: number; elementId?: string }) => {
    if (!socket?.connected || !state.currentDocumentId) return;

    // Throttle cursor updates
    if (cursorUpdateTimeoutRef.current) {
      clearTimeout(cursorUpdateTimeoutRef.current);
    }

    cursorUpdateTimeoutRef.current = setTimeout(() => {
      socket.emit('cursor_move', {
        document_id: state.currentDocumentId,
        position,
      });
    }, 50);
  }, [socket, state.currentDocumentId]);

  // Start typing
  const startTyping = useCallback((elementId?: string) => {
    if (!socket?.connected || !state.currentDocumentId || state.isTyping) return;

    setState(prev => ({ ...prev, isTyping: true }));
    socket.emit('typing_start', {
      document_id: state.currentDocumentId,
      element_id: elementId,
    });

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, state.currentDocumentId, state.isTyping]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (!socket?.connected || !state.currentDocumentId || !state.isTyping) return;

    setState(prev => ({ ...prev, isTyping: false }));
    socket.emit('typing_stop', {
      document_id: state.currentDocumentId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [socket, state.currentDocumentId, state.isTyping]);

  // Utility methods
  const getCurrentUsers = useCallback(() => {
    return Object.values(state.users);
  }, [state.users]);

  const getUserById = useCallback((userId: string) => {
    return state.users[userId];
  }, [state.users]);

  const isUserOnline = useCallback((userId: string) => {
    return userId in state.users;
  }, [state.users]);

  // Auto-connect when user is available
  useEffect(() => {
    if (user && !socket) {
      connect();
    }
  }, [user, socket, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (cursorUpdateTimeoutRef.current) {
        clearTimeout(cursorUpdateTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  const contextValue: CollaborationContextType = {
    state,
    connect,
    disconnect,
    joinDocument,
    leaveDocument,
    sendOperation,
    updateCursor,
    startTyping,
    stopTyping,
    getCurrentUsers,
    getUserById,
    isUserOnline,
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}

