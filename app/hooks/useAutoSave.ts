'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Slide } from '../types/editor';

interface UseAutoSaveProps {
  slides: Slide[];
  documentId: string;
  enabled?: boolean;
  saveInterval?: number; // in milliseconds
  onSave?: (slides: Slide[], documentId: string) => Promise<void>;
}

export function useAutoSave({
  slides,
  documentId,
  enabled = true,
  saveInterval = 2000, // 2 seconds
  onSave
}: UseAutoSaveProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const saveDocument = useCallback(async () => {
    if (!enabled || !documentId || documentId === 'new' || isSavingRef.current) {
      return;
    }

    const currentState = JSON.stringify(slides);
    if (currentState === lastSavedRef.current) {
      return; // No changes to save
    }

    try {
      isSavingRef.current = true;
      console.log('💾 Auto-saving document...', documentId);

      if (onSave) {
        await onSave(slides, documentId);
      } else {
        // Default save implementation
        const response = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slides,
            lastModified: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save document: ${response.statusText}`);
        }
      }

      lastSavedRef.current = currentState;
      console.log('✅ Document auto-saved successfully');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [slides, documentId, enabled, onSave]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDocument();
    }, saveInterval);
  }, [saveDocument, saveInterval]);

  // Auto-save when slides change
  useEffect(() => {
    if (enabled && documentId && documentId !== 'new') {
      debouncedSave();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [slides, enabled, documentId, debouncedSave]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      if (enabled && documentId && documentId !== 'new' && !isSavingRef.current) {
        // Synchronous save on unmount
        const currentState = JSON.stringify(slides);
        if (currentState !== lastSavedRef.current) {
          console.log('💾 Saving document before unmount...');
          // You might want to use a synchronous save method here
          // or at least log that there are unsaved changes
        }
      }
    };
  }, [enabled, documentId, slides]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveDocument();
  }, [saveDocument]);

  // Force save (bypass debouncing)
  const forceSave = useCallback(async () => {
    lastSavedRef.current = ''; // Force save even if no changes
    await saveDocument();
  }, [saveDocument]);

  return {
    saveNow,
    forceSave,
    isSaving: isSavingRef.current,
  };
}

