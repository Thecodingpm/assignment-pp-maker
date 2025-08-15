'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  subscribeToEditOperations, 
  sendEditOperation, 
  subscribeToDocumentContent,
  syncDocumentContent,
  updateUserPresence
} from '../firebase/collaboration';
import type { EditOperation } from '../firebase/collaboration';

interface RealTimeEditorProps {
  sessionId: string;
  initialContent: string;
  userPermission: 'view' | 'edit' | 'admin';
  onContentChange?: (content: string) => void;
}

export default function RealTimeEditor({ 
  sessionId, 
  initialContent, 
  userPermission,
  onContentChange 
}: RealTimeEditorProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
  const [pendingOperations, setPendingOperations] = useState<EditOperation[]>([]);
  const [lastCursorPosition, setLastCursorPosition] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const operationsRef = useRef<EditOperation[]>([]);

  // Subscribe to document content changes
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToDocumentContent(sessionId, (newContent, lastUpdatedBy) => {
      if (lastUpdatedBy !== user?.uid) {
        setContent(newContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = newContent;
        }
      }
    });

    return unsubscribe;
  }, [sessionId, user?.uid]);

  // Subscribe to edit operations
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToEditOperations(sessionId, (operations) => {
      operationsRef.current = operations;
      applyRemoteOperations(operations);
    });

    return unsubscribe;
  }, [sessionId]);

  // Apply remote operations to local content
  const applyRemoteOperations = useCallback((operations: EditOperation[]) => {
    if (!editorRef.current || userPermission === 'view') return;

    const remoteOperations = operations.filter(op => 
      op.userId !== user?.uid && 
      new Date().getTime() - op.timestamp.getTime() < 5000 // Only recent operations
    );

    remoteOperations.forEach(operation => {
      applyOperation(operation);
    });
  }, [user?.uid, userPermission]);

  // Apply a single operation to the content
  const applyOperation = useCallback((operation: EditOperation) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    const textNode = editorRef.current.firstChild || editorRef.current;
    
    try {
      switch (operation.type) {
        case 'insert':
          if (operation.content) {
            const textContent = textNode.textContent || '';
            const insertPosition = Math.min(operation.position, textContent.length);
            
            if (textNode.nodeType === Node.TEXT_NODE) {
              const newText = textContent.slice(0, insertPosition) + 
                            operation.content + 
                            textContent.slice(insertPosition);
              textNode.textContent = newText;
            }
          }
          break;

        case 'delete':
          if (operation.length) {
            const textContent = textNode.textContent || '';
            const deletePosition = Math.min(operation.position, textContent.length);
            const endPosition = Math.min(deletePosition + operation.length, textContent.length);
            
            if (textNode.nodeType === Node.TEXT_NODE) {
              const newText = textContent.slice(0, deletePosition) + 
                            textContent.slice(endPosition);
              textNode.textContent = newText;
            }
          }
          break;

        case 'format':
          if (operation.format && operation.selection) {
            const { start, end } = operation.selection;
            const textContent = textNode.textContent || '';
            
            if (start < end && end <= textContent.length) {
              // Apply formatting (simplified - you can expand this)
              const before = textContent.slice(0, start);
              const selected = textContent.slice(start, end);
              const after = textContent.slice(end);
              
              let formattedText = selected;
              switch (operation.format) {
                case 'bold':
                  formattedText = `<strong>${selected}</strong>`;
                  break;
                case 'italic':
                  formattedText = `<em>${selected}</em>`;
                  break;
                case 'underline':
                  formattedText = `<u>${selected}</u>`;
                  break;
              }
              
              if (textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = before + formattedText + after;
              }
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error applying operation:', error);
    }
  }, []);

  // Send local operation to other users
  const sendOperation = useCallback((operation: Omit<EditOperation, 'id' | 'timestamp'>) => {
    if (!sessionId || !user || userPermission === 'view') return;

    const fullOperation: EditOperation = {
      ...operation,
      id: `${user.uid}_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    };

    sendEditOperation(sessionId, operation);
    setPendingOperations(prev => [...prev, fullOperation]);
  }, [sessionId, user, userPermission]);

  // Handle input events
  const handleInput = useCallback((event: Event) => {
    if (userPermission === 'view') return;

    const target = event.target as HTMLDivElement;
    const newContent = target.innerHTML;
    setContent(newContent);

    // Update typing status
    setIsTyping(true);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      updateUserPresence(sessionId, user?.uid || '', undefined, false);
    }, 1000);

    setTypingTimeout(newTimeout);
    updateUserPresence(sessionId, user?.uid || '', undefined, true);

    // Sync content
    syncDocumentContent(sessionId, newContent, user?.uid || '');
    onContentChange?.(newContent);
  }, [userPermission, sessionId, user?.uid, onContentChange]);

  // Handle key events for real-time editing
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (userPermission === 'view') return;

    const target = event.target as HTMLDivElement;
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    // Handle different key events
    switch (event.key) {
      case 'Backspace':
        if (startOffset === endOffset && startOffset > 0) {
          sendOperation({
            userId: user?.uid || '',
            userName: user?.displayName || 'Anonymous',
            userAvatar: user?.photoURL || '👤',
            type: 'delete',
            position: startOffset - 1,
            length: 1
          });
        } else if (startOffset !== endOffset) {
          sendOperation({
            userId: user?.uid || '',
            userName: user?.displayName || 'Anonymous',
            userAvatar: user?.photoURL || '👤',
            type: 'delete',
            position: startOffset,
            length: endOffset - startOffset
          });
        }
        break;

      case 'Delete':
        if (startOffset === endOffset) {
          const textContent = target.textContent || '';
          if (startOffset < textContent.length) {
            sendOperation({
              userId: user?.uid || '',
              userName: user?.displayName || 'Anonymous',
              userAvatar: user?.photoURL || '👤',
              type: 'delete',
              position: startOffset,
              length: 1
            });
          }
        }
        break;

      default:
        // Handle regular text input
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          sendOperation({
            userId: user?.uid || '',
            userName: user?.displayName || 'Anonymous',
            userAvatar: user?.photoURL || '👤',
            type: 'insert',
            position: startOffset,
            content: event.key
          });
        }
        break;
    }
  }, [userPermission, user, sendOperation]);

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    if (userPermission === 'view') return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    if (startOffset !== lastCursorPosition) {
      setLastCursorPosition(startOffset);
      updateUserPresence(sessionId, user?.uid || '', undefined, undefined, {
        start: startOffset,
        end: endOffset
      });
    }
  }, [userPermission, sessionId, user?.uid, lastCursorPosition]);

  // Set up event listeners
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    editor.addEventListener('input', handleInput);
    editor.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleInput, handleKeyDown, handleSelectionChange]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable={userPermission !== 'view'}
        className={`w-full min-h-[500px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          userPermission === 'view' 
            ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed' 
            : 'bg-white dark:bg-gray-900'
        }`}
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: '1.8'
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      {/* Permission indicator */}
      <div className="absolute top-2 right-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        {userPermission === 'view' && '👁️ View Only'}
        {userPermission === 'edit' && '✏️ Can Edit'}
        {userPermission === 'admin' && '👑 Admin'}
      </div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {user?.displayName || 'Anonymous'} is typing...
        </div>
      )}
    </div>
  );
} 