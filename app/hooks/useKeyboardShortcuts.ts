'use client';

import { useEffect } from 'react';
import { useEditorStore } from '../stores/useEditorStore';

export const useKeyboardShortcuts = () => {
  const { 
    selectedElementIds, 
    slides, 
    currentSlideIndex, 
    deleteElement, 
    undo, 
    redo,
    duplicateElement,
    deselectAll
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key, 'KeyCode:', event.keyCode, 'Selected elements:', selectedElementIds.length);
      
      // Don't handle shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        console.log('Ignoring key press in input field');
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Delete/Backspace - Delete selected elements (handled by individual components)
      if (event.key === 'Delete' || event.key === 'Backspace' || event.keyCode === 46 || event.keyCode === 8) {
        if (selectedElementIds.length > 0) {
          event.preventDefault();
          event.stopPropagation();
          console.log('Deleting elements via main handler:', selectedElementIds);
          const currentSlide = slides[currentSlideIndex];
          if (currentSlide) {
            selectedElementIds.forEach(elementId => {
              console.log('Deleting element:', elementId);
              deleteElement(currentSlide.id, elementId);
            });
            deselectAll();
          }
        }
        return;
      }

      // Undo - Ctrl/Cmd + Z
      if (ctrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo - Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((ctrlOrCmd && event.key === 'z' && event.shiftKey) || (ctrlOrCmd && event.key === 'y')) {
        event.preventDefault();
        redo();
        return;
      }

      // Copy - Ctrl/Cmd + C
      if (ctrlOrCmd && event.key === 'c') {
        event.preventDefault();
        // TODO: Implement copy functionality
        console.log('Copy not implemented yet');
        return;
      }

      // Paste - Ctrl/Cmd + V
      if (ctrlOrCmd && event.key === 'v') {
        event.preventDefault();
        // TODO: Implement paste functionality
        console.log('Paste not implemented yet');
        return;
      }

      // Duplicate - Ctrl/Cmd + D
      if (ctrlOrCmd && event.key === 'd') {
        event.preventDefault();
        if (selectedElementIds.length > 0) {
          const currentSlide = slides[currentSlideIndex];
          if (currentSlide) {
            selectedElementIds.forEach(elementId => {
              duplicateElement(currentSlide.id, elementId);
            });
          }
        }
        return;
      }

      // Select All - Ctrl/Cmd + A
      if (ctrlOrCmd && event.key === 'a') {
        event.preventDefault();
        const currentSlide = slides[currentSlideIndex];
        if (currentSlide) {
          const allElementIds = currentSlide.elements.map(el => el.id);
          useEditorStore.getState().setSelectedElementIds(allElementIds);
        }
        return;
      }

      // Escape - Deselect all
      if (event.key === 'Escape') {
        event.preventDefault();
        deselectAll();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, slides, currentSlideIndex, deleteElement, undo, redo, duplicateElement, deselectAll]);
};
