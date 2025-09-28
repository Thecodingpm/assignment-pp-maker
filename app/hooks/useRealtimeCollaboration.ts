'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useEditorStore } from '../stores/useEditorStore';

interface UseRealtimeCollaborationProps {
  documentId: string;
  enabled?: boolean;
}

export function useRealtimeCollaboration({ 
  documentId, 
  enabled = true 
}: UseRealtimeCollaborationProps) {
  const {
    state,
    joinDocument,
    leaveDocument,
    sendOperation,
    updateCursor,
    startTyping,
    stopTyping,
  } = useCollaboration();

  const {
    slides,
    setSlides,
    updateElement,
    addElement,
    deleteElement,
    updateSlideBackground,
  } = useEditorStore();

  const isInitialized = useRef(false);
  const lastOperationRef = useRef<any>(null);

  // Join document when enabled and documentId changes
  useEffect(() => {
    if (enabled && documentId && !isInitialized.current) {
      console.log('🔄 Joining document for collaboration:', documentId);
      joinDocument(documentId);
      isInitialized.current = true;
    }

    return () => {
      if (enabled && documentId && isInitialized.current) {
        console.log('🔄 Leaving document:', documentId);
        leaveDocument(documentId);
        isInitialized.current = false;
      }
    };
  }, [enabled, documentId, joinDocument, leaveDocument]);

  // Handle incoming operations
  useEffect(() => {
    if (!state.lastOperation || !enabled) return;

    const operation = state.lastOperation;
    console.log('📝 Applying remote operation:', operation);

    try {
      switch (operation.type) {
        case 'insert':
          if (operation.element && operation.slideIndex !== undefined) {
            // Add element to specific slide
            const slideId = slides[operation.slideIndex]?.id;
            if (slideId) {
              addElement(slideId, operation.element);
            }
          }
          break;

        case 'update':
          if (operation.elementId && operation.updates) {
            // Find and update element across all slides
            slides.forEach((slide) => {
              const element = slide.elements.find(el => el.id === operation.elementId);
              if (element) {
                updateElement(slide.id, operation.elementId, operation.updates);
              }
            });
          }
          break;

        case 'delete':
          if (operation.elementId) {
            // Find and delete element across all slides
            slides.forEach((slide) => {
              const element = slide.elements.find(el => el.id === operation.elementId);
              if (element) {
                deleteElement(slide.id, operation.elementId);
              }
            });
          }
          break;

        case 'move':
          if (operation.elementId && operation.newPosition) {
            // Update element position
            slides.forEach((slide) => {
              const element = slide.elements.find(el => el.id === operation.elementId);
              if (element) {
                updateElement(slide.id, operation.elementId, operation.newPosition);
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error('❌ Error applying remote operation:', error);
    }
  }, [state.lastOperation, slides, addElement, updateElement, deleteElement, enabled]);

  // Send operation when local changes occur
  const sendLocalOperation = useCallback((
    type: 'insert' | 'update' | 'delete' | 'move',
    elementId?: string,
    element?: any,
    updates?: any,
    slideIndex?: number,
    newPosition?: any
  ) => {
    if (!enabled || !state.isConnected) return;

    const operation = {
      type,
      elementId,
      element,
      updates,
      slideIndex,
      newPosition,
    };

    // Avoid sending duplicate operations
    if (JSON.stringify(operation) === JSON.stringify(lastOperationRef.current)) {
      return;
    }

    lastOperationRef.current = operation;
    sendOperation(operation);
  }, [enabled, state.isConnected, sendOperation]);

  // Wrapper functions for editor operations
  const collaborativeAddElement = useCallback((
    slideId: string, 
    element: any
  ) => {
    addElement(slideId, element);
    
    // Find slide index
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    if (slideIndex !== -1) {
      sendLocalOperation('insert', element.id, element, undefined, slideIndex);
    }
  }, [addElement, slides, sendLocalOperation]);

  const collaborativeUpdateElement = useCallback((
    slideId: string,
    elementId: string,
    updates: any
  ) => {
    updateElement(slideId, elementId, updates);
    sendLocalOperation('update', elementId, undefined, updates);
  }, [updateElement, sendLocalOperation]);

  const collaborativeDeleteElement = useCallback((
    slideId: string,
    elementId: string
  ) => {
    deleteElement(slideId, elementId);
    sendLocalOperation('delete', elementId);
  }, [deleteElement, sendLocalOperation]);

  const collaborativeMoveElement = useCallback((
    slideId: string,
    elementId: string,
    newPosition: any
  ) => {
    updateElement(slideId, elementId, newPosition);
    sendLocalOperation('move', elementId, undefined, undefined, undefined, newPosition);
  }, [updateElement, sendLocalOperation]);

  // Cursor tracking
  const handleCursorMove = useCallback((event: MouseEvent) => {
    if (!enabled || !state.isConnected) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    updateCursor({ x, y });
  }, [enabled, state.isConnected, updateCursor]);

  // Typing detection
  const handleTextInput = useCallback((elementId: string) => {
    if (!enabled || !state.isConnected) return;

    startTyping(elementId);
  }, [enabled, state.isConnected, startTyping]);

  const handleTextInputEnd = useCallback(() => {
    if (!enabled || !state.isConnected) return;

    stopTyping();
  }, [enabled, state.isConnected, stopTyping]);

  // Auto-save functionality
  useEffect(() => {
    if (!enabled || !state.isConnected || slides.length === 0) return;

    const autoSaveTimeout = setTimeout(() => {
      // Auto-save logic would go here
      console.log('💾 Auto-saving document...');
      // You would typically call your save API here
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(autoSaveTimeout);
  }, [slides, enabled, state.isConnected]);

  return {
    // State
    isConnected: state.isConnected,
    users: state.users,
    typingUsers: state.typingUsers,
    cursorPositions: state.cursorPositions,
    
    // Collaborative operations
    collaborativeAddElement,
    collaborativeUpdateElement,
    collaborativeDeleteElement,
    collaborativeMoveElement,
    
    // Event handlers
    handleCursorMove,
    handleTextInput,
    handleTextInputEnd,
    
    // Utility
    getCurrentUsers: () => Object.values(state.users),
  };
}

