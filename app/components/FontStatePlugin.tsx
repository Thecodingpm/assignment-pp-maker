'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createTextNode, $isTextNode } from 'lexical';

export default function FontStatePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Function to apply current font to new text
    const applyCurrentFontToNewText = () => {
      const currentFont = localStorage.getItem('currentFont') || 'Inter';
      const currentFontSize = localStorage.getItem('currentFontSize') || '16';
      
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // When user starts typing, apply the current font to the new text node
          const anchorNode = selection.anchor.getNode();
          if ($isTextNode(anchorNode)) {
            const currentStyle = anchorNode.getStyle() || '';
            const styleWithoutFont = currentStyle.replace(/font-family:\s*[^;]+;?/g, '').replace(/font-size:\s*[^;]+;?/g, '');
            const newStyle = styleWithoutFont 
              ? `${styleWithoutFont}; font-family: "${currentFont}", sans-serif; font-size: ${currentFontSize}px` 
              : `font-family: "${currentFont}", sans-serif; font-size: ${currentFontSize}px`;
            anchorNode.setStyle(newStyle.replace(/^;\s*/, ''));
          }
        }
      });
    };

    // Listen for text input events
    const handleTextInput = () => {
      setTimeout(applyCurrentFontToNewText, 0);
    };

    // Listen for keydown events (typing)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
        setTimeout(applyCurrentFontToNewText, 0);
      }
    };

    // Add event listeners
    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener('input', handleTextInput);
      rootElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        rootElement.removeEventListener('input', handleTextInput);
        rootElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editor]);

  return null;
}
