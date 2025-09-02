'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function CursorVisibilityPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Function to ensure cursor is always visible
    const ensureCursorVisibility = () => {
      // Find all possible editor elements
      const editorElements = document.querySelectorAll('.lexical-editor, [contenteditable="true"]') as NodeListOf<HTMLElement>;
      
      editorElements.forEach(editorElement => {
        if (editorElement) {
          // Force cursor to be visible with multiple approaches
          editorElement.style.caretColor = '#000000';
          editorElement.style.setProperty('-webkit-caret-color', '#000000', 'important');
          editorElement.style.setProperty('-moz-caret-color', '#000000', 'important');
          
          // Also set on the element itself and all child elements
          const allElements = [editorElement, ...Array.from(editorElement.querySelectorAll('*'))];
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.caretColor = '#000000';
              el.style.setProperty('-webkit-caret-color', '#000000', 'important');
              el.style.setProperty('-moz-caret-color', '#000000', 'important');
            }
          });
          
          // Handle RTL/LTR cursor positioning
          const direction = editorElement.getAttribute('dir') || 'ltr';
          const selection = window.getSelection();
          
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;
            
            if (textNode.nodeType === Node.TEXT_NODE) {
              const text = textNode.textContent || '';
              const offset = range.startOffset;
              
              if (direction === 'rtl') {
                // For RTL, ensure cursor is positioned correctly
                if (offset === 0 && text.length > 0) {
                  // If cursor is at the beginning in RTL, move it to the end
                  range.setStart(textNode, text.length);
                  range.setEnd(textNode, text.length);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              } else {
                // For LTR, ensure cursor is positioned correctly
                if (offset > text.length) {
                  // If cursor is beyond text length in LTR, move it to the end
                  range.setStart(textNode, text.length);
                  range.setEnd(textNode, text.length);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
          }
          
          // Only force cursor visibility, don't force blinking when not focused
          const isFocused = document.activeElement === editorElement || editorElement.contains(document.activeElement);
          if (!isFocused) {
            // When not focused, ensure cursor is visible but not blinking
            editorElement.style.setProperty('--cursor-blink', 'none');
          }
          
          // Only focus the editor if no UI element is currently focused
          const activeElement = document.activeElement;
          const isUIElementActive = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT' ||
            activeElement.closest('.search') ||
            activeElement.closest('.search-box') ||
            activeElement.closest('.dropdown') ||
            activeElement.closest('.modal') ||
            activeElement.closest('.popup') ||
            activeElement.closest('.GPTModal') ||
            activeElement.closest('.font-controls') ||
            activeElement.closest('.text-controls') ||
            activeElement.closest('.alignment-controls') ||
            activeElement.closest('.color-picker') ||
            activeElement.closest('.format-controls')
          );
          
          if (!isUIElementActive && document.activeElement !== editorElement && editorElement.getAttribute('contenteditable') === 'true') {
            editorElement.focus();
          }
        }
      });
    };

    // Function to handle cursor visibility on various events
    const handleCursorVisibility = () => {
      setTimeout(ensureCursorVisibility, 0);
    };

    // Set up event listeners to maintain cursor visibility
    const events = ['click', 'mousedown', 'mouseup', 'keydown', 'keyup', 'input', 'focus', 'blur'];
    
    events.forEach(event => {
      document.addEventListener(event, handleCursorVisibility, true);
    });

    // Initial cursor visibility with multiple attempts
    ensureCursorVisibility();
    setTimeout(ensureCursorVisibility, 50);
    setTimeout(ensureCursorVisibility, 100);
    setTimeout(ensureCursorVisibility, 200);

    // Set up an interval to continuously ensure cursor visibility
    const intervalId = setInterval(ensureCursorVisibility, 100);

    // Set up MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      ensureCursorVisibility();
    });

    // Observe changes to the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleCursorVisibility, true);
      });
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [editor]);

  // Additional effect to handle editor state changes
  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // Ensure cursor is visible after any editor update
      setTimeout(() => {
        const editorElements = document.querySelectorAll('.lexical-editor, [contenteditable="true"]') as NodeListOf<HTMLElement>;
        
        editorElements.forEach(editorElement => {
          if (editorElement) {
            // Force cursor to be visible
            editorElement.style.caretColor = '#000000';
            editorElement.style.setProperty('-webkit-caret-color', '#000000', 'important');
            editorElement.style.setProperty('-moz-caret-color', '#000000', 'important');
            
            // Also set on all child elements
            const allElements = [editorElement, ...Array.from(editorElement.querySelectorAll('*'))];
            allElements.forEach(el => {
              if (el instanceof HTMLElement) {
                el.style.caretColor = '#000000';
                el.style.setProperty('-webkit-caret-color', '#000000', 'important');
                el.style.setProperty('-moz-caret-color', '#000000', 'important');
              }
            });
          }
        });
      }, 0);
    });

    return removeUpdateListener;
  }, [editor]);

  return null;
}
