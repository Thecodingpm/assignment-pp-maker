'use client';

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function TextSizeStabilizerPlugin() {
  const [editor] = useLexicalComposerContext();
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Function to stabilize text size
    const stabilizeTextSize = () => {
      const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
      if (editorElement) {
        // Ensure consistent text sizing
        editorElement.style.fontSize = '16px';
        editorElement.style.lineHeight = '1.5';
        editorElement.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        // Prevent any dynamic font size changes
        editorElement.style.setProperty('font-size', '16px', 'important');
        editorElement.style.setProperty('line-height', '1.5', 'important');
      }
    };

    // Stabilize on editor mount
    stabilizeTextSize();

    // Create MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldStabilize = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          shouldStabilize = true;
        }
        if (mutation.type === 'childList') {
          shouldStabilize = true;
        }
      });
      
      if (shouldStabilize) {
        setTimeout(stabilizeTextSize, 0);
      }
    });

    // Start observing
    const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
    if (editorElement) {
      observer.observe(editorElement, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['style', 'class']
      });
    }

    observerRef.current = observer;

    // Stabilize on selection changes
    const handleSelectionChange = () => {
      setTimeout(stabilizeTextSize, 0);
    };

    // Stabilize on focus/blur
    const handleFocus = () => {
      setTimeout(stabilizeTextSize, 0);
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleFocus);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleFocus);
    };
  }, [editor]);

  // Also stabilize on editor updates
  useEffect(() => {
    return editor.registerUpdateListener(() => {
      setTimeout(() => {
        const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
        if (editorElement) {
          editorElement.style.setProperty('font-size', '16px', 'important');
          editorElement.style.setProperty('line-height', '1.5', 'important');
        }
      }, 0);
    });
  }, [editor]);

  return null;
}
