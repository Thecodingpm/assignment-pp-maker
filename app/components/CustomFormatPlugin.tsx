'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getSelection, $isRangeSelection, $createTextNode, $isTextNode } from 'lexical';

interface CustomFormatPluginProps {
  selectedFont?: string;
  selectedColor?: string;
  fontSize?: string;
}

export function CustomFormatPlugin({ selectedFont, selectedColor, fontSize }: CustomFormatPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // This plugin will handle applying custom formatting
    // The actual formatting will be applied through the toolbar functions
  }, [editor, selectedFont, selectedColor, fontSize]);

  return null;
}

// Helper function to apply font formatting
export function applyFontFormat(editor: any, font: string) {
  console.log('Applying font format:', font);
  
  // Simple approach: insert a styled span at cursor or apply to selection
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        console.log('Applying font to selected text');
        // For now, just log that we're applying the font
        // The actual implementation will be handled by CSS
      } else {
        // Set as default for new text
        console.log('Setting default font for new text:', font);
        // Store the font preference for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem('defaultFont', font);
        }
      }
    }
  });
}

// Helper function to apply color formatting
export function applyColorFormat(editor: any, color: string) {
  console.log('Applying color format:', color);
  
  // Simple approach: insert a styled span at cursor or apply to selection
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        console.log('Applying color to selected text');
        // For now, just log that we're applying the color
        // The actual implementation will be handled by CSS
      } else {
        // Set as default for new text
        console.log('Setting default color for new text:', color);
        // Store the color preference for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem('defaultColor', color);
        }
      }
    }
  });
}

// Helper function to apply font size formatting
export function applyFontSizeFormat(editor: any, size: string) {
  console.log('Applying font size format:', size);
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        console.log('Applying font size to selected text:', size);
        // Apply font size to the selected text by setting format on text nodes
        const nodes = selection.getNodes();
        nodes.forEach(node => {
          if ($isTextNode(node)) {
            (node as any).setFormat('font-size', size + 'px');
          }
        });
      } else {
        // Set as default for new text
        console.log('Setting default font size for new text:', size);
        // Store the font size preference for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem('defaultFontSize', size);
        }
        // Apply font size to the current cursor position for new text
        try {
          (selection as any).formatText('font-size', size + 'px');
          console.log('Applied font size to cursor position for new text');
        } catch (error) {
          console.error('Error applying font size to cursor position:', error);
        }
      }
    }
  });
} 