'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getSelection, $isRangeSelection, $createTextNode, $isTextNode, $getRoot, $createParagraphNode } from 'lexical';

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

// Enhanced font formatting function that works with Lexical
export function applyFontFormat(editor: any, font: string) {
  console.log('Applying font format:', font);
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        console.log('Applying font to selected text');
        
        // Get all text nodes in the selection
        const textNodes = selection.getNodes();
        
        textNodes.forEach((node) => {
          if ($isTextNode(node)) {
            // Apply font family using CSS custom property approach
            node.setStyle(`font-family: ${font}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`);
            
            // Also store the font preference in the node's format
            try {
              (node as any).setFormat('font-family', font);
            } catch (error) {
              console.log('Could not set font format, using style only');
            }
          }
        });
        
        // Mark selection as dirty to trigger re-render
        selection.dirty = true;
        
      } else {
        // Set as default for new text
        console.log('Setting default font for new text:', font);
        
        // Store the font preference for future use
        if (typeof window !== 'undefined') {
          localStorage.setItem('defaultFont', font);
        }
        
        // Create a temporary text node to establish the font context
        const tempNode = $createTextNode(' ');
        tempNode.setStyle(`font-family: ${font}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`);
        
        // Insert and immediately remove to establish formatting context
        selection.insertNodes([tempNode]);
        tempNode.remove();
      }
    }
  });
}

// Enhanced font size formatting function
export function applyFontSizeFormat(editor: any, fontSize: string) {
  console.log('Applying font size format:', fontSize);
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        console.log('Applying font size to selected text');
        
        const textNodes = selection.getNodes();
        
        textNodes.forEach((node) => {
          if ($isTextNode(node)) {
            // Apply font size using CSS
            node.setStyle(`font-size: ${fontSize}px`);
            
            // Also try to set format if available
            try {
              (node as any).setFormat('font-size', fontSize + 'px');
            } catch (error) {
              console.log('Could not set font size format, using style only');
            }
          }
        });
        
        selection.dirty = true;
        
      } else {
        // Set as default for new text
        console.log('Setting default font size for new text:', fontSize);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('defaultFontSize', fontSize);
        }
        
        // Create temporary node to establish font size context
        const tempNode = $createTextNode(' ');
        tempNode.setStyle(`font-size: ${fontSize}px`);
        
        selection.insertNodes([tempNode]);
        tempNode.remove();
      }
    }
  });
}

// Enhanced color formatting function
export function applyColorFormat(editor: any, color: string) {
  console.log('Applying color format:', color);
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply color to selected text
        console.log('Applying color to selected text:', color);
        
        const textNodes = selection.getNodes();
        
        textNodes.forEach((node) => {
          if ($isTextNode(node)) {
            // Apply color using CSS
            node.setStyle(`color: ${color}`);
            
            // Also try to set format if available
            try {
              (node as any).setFormat('color', color);
            } catch (error) {
              console.log('Could not set color format, using style only');
            }
          }
        });
        
        selection.dirty = true;
        
      } else {
        // Set as default for new text
        console.log('Setting default color for new text:', color);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('defaultTextColor', color);
        }
        
        // Create temporary node to establish color context
        const tempNode = $createTextNode(' ');
        tempNode.setStyle(`color: ${color}`);
        
        selection.insertNodes([tempNode]);
        tempNode.remove();
      }
    }
  });
}

// Function to apply multiple formats at once (font, size, color)
export function applyMultipleFormats(editor: any, font?: string, fontSize?: string, color?: string) {
  console.log('Applying multiple formats:', { font, fontSize, color });
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        const textNodes = selection.getNodes();
        
        textNodes.forEach((node) => {
          if ($isTextNode(node)) {
            let style = '';
            
            if (font) {
              style += `font-family: ${font}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; `;
            }
            if (fontSize) {
              style += `font-size: ${fontSize}px; `;
            }
            if (color) {
              style += `color: ${color}; `;
            }
            
            if (style) {
              node.setStyle(style.trim());
            }
          }
        });
        
        selection.dirty = true;
        
      } else {
        // Set as default for new text
        if (font) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('defaultFont', font);
          }
        }
        if (fontSize) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('defaultFontSize', fontSize);
          }
        }
        if (color) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('defaultTextColor', color);
          }
        }
        
        // Create temporary node to establish formatting context
        const tempNode = $createTextNode(' ');
        let style = '';
        
        if (font) {
          style += `font-family: ${font}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; `;
        }
        if (fontSize) {
          style += `font-size: ${fontSize}px; `;
        }
        if (color) {
          style += `color: ${color}; `;
        }
        
        if (style) {
          tempNode.setStyle(style.trim());
        }
        
        selection.insertNodes([tempNode]);
        tempNode.remove();
      }
    }
  });
}

// Function to get current formatting from selection
export function getCurrentFormatting(editor: any) {
  let currentFont = 'Inter';
  let currentFontSize = '16';
  let currentColor = '#000000';
  
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const textNodes = selection.getNodes();
      
      for (const node of textNodes) {
        if ($isTextNode(node)) {
          const style = node.getStyle();
          
          // Extract font family
          const fontMatch = style.match(/font-family:\s*([^;]+)/);
          if (fontMatch) {
            currentFont = fontMatch[1].split(',')[0].trim().replace(/['"]/g, '');
          }
          
          // Extract font size
          const sizeMatch = style.match(/font-size:\s*(\d+)px/);
          if (sizeMatch) {
            currentFontSize = sizeMatch[1];
          }
          
          // Extract color
          const colorMatch = style.match(/color:\s*([^;]+)/);
          if (colorMatch) {
            currentColor = colorMatch[1];
          }
          
          break; // Use first node's formatting
        }
      }
    }
  });
  
  return { currentFont, currentFontSize, currentColor };
}

// Function to clear all formatting
export function clearAllFormatting(editor: any) {
  console.log('Clearing all formatting');
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const textNodes = selection.getNodes();
      
      textNodes.forEach((node) => {
        if ($isTextNode(node)) {
          // Clear all custom styles
          node.setStyle('');
          
          // Clear all formats
          try {
            node.setFormat('bold', false);
            node.setFormat('italic', false);
            node.setFormat('underline', false);
            node.setFormat('strikethrough', false);
          } catch (error) {
            console.log('Could not clear some formats');
          }
        }
      });
      
      selection.dirty = true;
    }
  });
}

// Enhanced color application function that works with Lexical
export function applyTextColor(editor: any, color: string, applyToSelection: boolean = true) {
  console.log('Applying text color:', color, 'to selection:', applyToSelection);
  
  applyColorFormat(editor, color);
}

// Function to get current text color from selection
export function getCurrentTextColor(editor: any): string {
  let currentColor = '#000000';
  
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const textNodes = selection.getNodes();
      
      for (const node of textNodes) {
        if ($isTextNode(node)) {
          const style = node.getStyle();
          const colorMatch = style.match(/color:\s*([^;]+)/);
          if (colorMatch) {
            currentColor = colorMatch[1];
            break;
          }
        }
      }
    }
  });
  
  return currentColor;
}

// Function to clear text color formatting
export function clearTextColor(editor: any) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const textNodes = selection.getNodes();
      
      textNodes.forEach((node) => {
        if ($isTextNode(node)) {
          // Remove color styling
          const currentStyle = node.getStyle();
          const newStyle = currentStyle.replace(/color:\s*[^;]+;?\s*/g, '');
          node.setStyle(newStyle);
        }
      });
      
      selection.dirty = true;
    }
  });
}

 