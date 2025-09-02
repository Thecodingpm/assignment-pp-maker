'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function SimpleFocusManager() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Simple focus management without aggressive restoration
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Only restore focus for specific toolbar buttons, not everything
      if (target.closest('button') && 
          (target.closest('.bold') || 
           target.closest('.italic') || 
           target.closest('.underline'))) {
        
        setTimeout(() => {
          const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
          if (editorElement) {
            editorElement.focus();
          }
        }, 50);
      }
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [editor]);

  return null;
}

