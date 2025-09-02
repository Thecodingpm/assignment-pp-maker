'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function CursorFocusManager() {
  const [editor] = useLexicalComposerContext();
  const lastFocusTime = useRef<number>(0);
  const focusRestorationTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Function to restore editor focus and cursor blinking
    const restoreEditorFocus = () => {
      // Check if user is currently typing in a search box or input field
      const activeElement = document.activeElement;
      if (activeElement && 
          (activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' ||
           activeElement.closest('.search') ||
           activeElement.closest('.search-box') ||
           activeElement.closest('.input-field') ||
           activeElement.closest('.GPTModal') ||
           activeElement.closest('.modal') ||
           activeElement.closest('.search-modal') ||
           activeElement.closest('.dropdown-menu') ||
           activeElement.closest('.popup') ||
           activeElement.closest('[role="searchbox"]') ||
           activeElement.closest('[role="textbox"]') ||
           activeElement.closest('[data-testid*="search"]') ||
           activeElement.closest('[aria-label*="search"]'))) {
        // User is typing in a search box or using a search interface, do NOT restore editor focus
        return;
      }
      
      const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
      if (editorElement) {
        const contentEditable = editorElement.querySelector('[contenteditable="true"]') as HTMLElement;
        if (contentEditable) {
          // Restore focus to the editor
          contentEditable.focus();
          
          // Ensure cursor is visible and blinking with current color preference
          const currentColor = localStorage.getItem('defaultTextColor') || '#000000';
          contentEditable.style.caretColor = currentColor;
          contentEditable.style.setProperty('-webkit-caret-color', currentColor, 'important');
          contentEditable.style.setProperty('-moz-caret-color', currentColor, 'important');
          
          // Force cursor to blink by triggering focus events
          contentEditable.dispatchEvent(new Event('focus', { bubbles: true }));
          contentEditable.dispatchEvent(new Event('click', { bubbles: true }));
          
          // Update last focus time
          lastFocusTime.current = Date.now();
        }
      }
    };

    // Function to handle toolbar interactions
    const handleToolbarInteraction = () => {
      // Check if user is currently typing in any input field
      const activeElement = document.activeElement;
      if (activeElement && 
          (activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' ||
           activeElement.closest('.search') ||
           activeElement.closest('.search-box') ||
           activeElement.closest('.input-field') ||
           activeElement.closest('.GPTModal') ||
           activeElement.closest('.modal') ||
           activeElement.closest('.search-modal') ||
           activeElement.closest('.dropdown-menu') ||
           activeElement.closest('.popup') ||
           activeElement.closest('[role="searchbox"]') ||
           activeElement.closest('[role="textbox"]') ||
           activeElement.closest('[data-testid*="search"]') ||
           activeElement.closest('[aria-label*="search"]'))) {
        // User is typing in a search box or using a search interface, do NOT restore editor focus
        return;
      }
      
      // Clear any existing timeout
      if (focusRestorationTimeout.current) {
        clearTimeout(focusRestorationTimeout.current);
      }
      
      // Restore focus after a short delay to allow toolbar action to complete
      focusRestorationTimeout.current = setTimeout(() => {
        restoreEditorFocus();
      }, 100);
    };

    // Listen for toolbar button clicks - ONLY formatting buttons, not search boxes
    const handleDocumentClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if click is on a toolbar formatting element (NOT search boxes)
      if (target.closest('.toolbar') || 
          target.closest('[role="button"]') || 
          target.closest('button') ||
          target.closest('.font-controls') ||
          target.closest('.text-controls') ||
          target.closest('.alignment-controls') ||
          target.closest('.color-picker') ||
          target.closest('.format-controls') ||
          target.closest('.bold') ||
          target.closest('.italic') ||
          target.closest('.underline') ||
          target.closest('.bullet') ||
          target.closest('.numbering') ||
          target.closest('.align-left') ||
          target.closest('.align-center') ||
          target.closest('.align-right')) {
        
        // This is a formatting toolbar interaction, restore focus after it completes
        handleToolbarInteraction();
      }
      
      // DO NOT restore focus for search boxes, input fields, or other text inputs
      if (target.closest('input') || 
          target.closest('textarea') || 
          target.closest('[contenteditable="true"]') ||
          target.closest('.search') ||
          target.closest('.search-box') ||
          target.closest('.input-field') ||
          target.closest('.GPTModal') ||
          target.closest('.modal') ||
          target.closest('.search-modal') ||
          target.closest('.dropdown-menu') ||
          target.closest('.popup') ||
          target.closest('[role="searchbox"]') ||
          target.closest('[role="textbox"]') ||
          target.closest('[data-testid*="search"]') ||
          target.closest('[aria-label*="search"]')) {
        // This is a text input or search interface, do NOT restore editor focus
        return;
      }
    };

    // Listen for clicks on the document
    document.addEventListener('click', handleDocumentClick, true);

    // Also listen for mousedown events
    document.addEventListener('mousedown', handleDocumentClick, true);

    // Restore focus when editor loses focus - but only for formatting actions
    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // Only restore focus if we're moving to a formatting toolbar element
      if (target.closest('.lexical-editor') && 
          relatedTarget && 
          (relatedTarget.closest('.toolbar') || 
           relatedTarget.closest('button') ||
           relatedTarget.closest('.font-controls') ||
           relatedTarget.closest('.text-controls') ||
           relatedTarget.closest('.alignment-controls') ||
           relatedTarget.closest('.color-picker') ||
           relatedTarget.closest('.format-controls'))) {
        
        // This is a formatting toolbar interaction, restore focus after it completes
        setTimeout(() => {
          restoreEditorFocus();
        }, 100);
      }
      
      // DO NOT restore focus if moving to search boxes, input fields, or other text inputs
      if (relatedTarget && 
          (relatedTarget.closest('input') || 
           relatedTarget.closest('textarea') || 
           relatedTarget.closest('.search') ||
           relatedTarget.closest('.search-box') ||
           relatedTarget.closest('.input-field') ||
           relatedTarget.closest('.GPTModal') ||
           relatedTarget.closest('.modal') ||
           relatedTarget.closest('.search-modal') ||
           relatedTarget.closest('.dropdown-menu') ||
           relatedTarget.closest('.popup') ||
           relatedTarget.closest('[role="searchbox"]') ||
           relatedTarget.closest('[role="textbox"]') ||
           relatedTarget.closest('[data-testid*="search"]') ||
           relatedTarget.closest('[aria-label*="search"]'))) {
        // This is a text input or search interface, do NOT restore editor focus
        return;
      }
    };

    document.addEventListener('focusout', handleFocusOut, true);
    
    // Add global keydown listener to prevent editor from capturing keystrokes when search boxes are active
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if we're typing in a UI element that should capture keystrokes
      const isUIElement = target.closest('input') || 
                          target.closest('textarea') || 
                          target.closest('select') ||
                          target.closest('.search') ||
                          target.closest('.search-box') ||
                          target.closest('.dropdown') ||
                          target.closest('.dropdown-menu') ||
                          target.closest('.modal') ||
                          target.closest('.popup') ||
                          target.closest('.GPTModal') ||
                          target.closest('.font-controls') ||
                          target.closest('.text-controls') ||
                          target.closest('.alignment-controls') ||
                          target.closest('.color-picker') ||
                          target.closest('.format-controls');
      
      if (isUIElement) {
        // We're in a UI element, allow normal typing behavior
        return;
      }
      
      // Check if we're in the Lexical editor
      const isInEditor = target.closest('.lexical-editor');
      if (!isInEditor) {
        // We're not in the editor, prevent keystrokes from reaching it
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      document.removeEventListener('mousedown', handleDocumentClick, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      
      if (focusRestorationTimeout.current) {
        clearTimeout(focusRestorationTimeout.current);
      }
    };
  }, [editor]);

  return null;
}
