'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

export default function SelectionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        // Remove previous selection classes
        const editorElement = document.querySelector('[contenteditable="true"]') as HTMLElement;
        if (editorElement) {
          const selectedElements = editorElement.querySelectorAll('.selected');
          selectedElements.forEach(element => {
            element.classList.remove('selected');
          });
        }

        // Selection highlighting is simplified for now
        // We'll implement this feature later if needed
      });
    });

    return removeUpdateListener;
  }, [editor]);

  return null;
} 