'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useCallback, useRef } from 'react';
import { $getSelection, $isRangeSelection, $createTextNode } from 'lexical';
import { setCurrentTextColor } from './CustomFormatPlugin';

interface CursorColorPluginProps {
  currentColor: string;
  onColorChange?: (color: string) => void;
}

export default function CursorColorPlugin({ currentColor, onColorChange }: CursorColorPluginProps) {
  const [editor] = useLexicalComposerContext();
  const colorRef = useRef(currentColor);
  const lastAppliedColor = useRef<string>('');

  // Update color ref when prop changes
  useEffect(() => {
    colorRef.current = currentColor;
    
    // Only apply if color actually changed
    if (lastAppliedColor.current !== currentColor) {
      lastAppliedColor.current = currentColor;
      applyColorToEditor(currentColor);
    }
  }, [currentColor]);

  const applyColorToEditor = useCallback((color: string) => {
    console.log('CursorColorPlugin: Applying color to editor:', color);
    
    // Strategy 1: Update cursor color immediately
    updateCursorColor(color);
    
    // Strategy 2: Store the color for future use
    setCurrentTextColor(color);
    
    // Strategy 3: Force focus and ensure editor is ready for typing
    setTimeout(() => {
      const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
      if (contentEditable) {
        contentEditable.focus();
        
        // Set cursor color with multiple methods
        contentEditable.style.caretColor = color;
        contentEditable.style.setProperty('caret-color', color, 'important');
        
        console.log('Editor focused and cursor color applied:', color);
      }
    }, 0);
    
  }, [editor]);

  const updateCursorColor = useCallback((color: string) => {
    // Method 1: CSS Custom Properties
    document.documentElement.style.setProperty('--cursor-color', color);
    
    // Method 2: Direct style application
    const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
    if (contentEditable) {
      contentEditable.style.caretColor = color;
      contentEditable.style.setProperty('caret-color', color, 'important');
      contentEditable.style.setProperty('-webkit-caret-color', color, 'important');
      contentEditable.style.setProperty('-moz-caret-color', color, 'important');
    }
    
    // Method 3: Dynamic stylesheet injection
    let dynamicStyle = document.getElementById('lexical-cursor-color') as HTMLStyleElement;
    if (!dynamicStyle) {
      dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'lexical-cursor-color';
      document.head.appendChild(dynamicStyle);
    }
    
    dynamicStyle.textContent = `
      .lexical-editor [contenteditable="true"] {
        caret-color: ${color} !important;
        -webkit-caret-color: ${color} !important;
        -moz-caret-color: ${color} !important;
      }
      
      .lexical-editor [contenteditable="true"]:focus {
        caret-color: ${color} !important;
      }
      
      .lexical-editor [contenteditable="true"]::selection {
        background-color: ${color}20;
      }
    `;
    
    console.log('Cursor color updated via all methods:', color);
  }, []);

  // Listen to editor updates and maintain color
  useEffect(() => {
    const removeListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Maintain cursor color on selection changes
          updateCursorColor(colorRef.current);
          
          // Ensure new text will have the current color
          setTimeout(() => {
            editor.update(() => {
              const newSelection = $getSelection();
              if ($isRangeSelection(newSelection) && newSelection.isCollapsed()) {
                // Set style for next input
                const style = newSelection.style || new Map();
                if (style instanceof Map) {
                  style.set('color', colorRef.current);
                  newSelection.style = Array.from(style.entries())
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('; ');
                }
              }
            });
          }, 0);
        }
      });
    });

    return removeListener;
  }, [editor, updateCursorColor]);

  // Handle keyboard input to ensure color is applied to new text
  useEffect(() => {
    const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
    if (!contentEditable) return;

    const handleInput = (e: Event) => {
      // Maintain cursor color
      setTimeout(() => {
        updateCursorColor(colorRef.current);
      }, 0);
    };

    const handleFocus = () => {
      updateCursorColor(colorRef.current);
      
      // Set up for new text input
      setTimeout(() => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const style = selection.style || new Map();
            if (style instanceof Map) {
              style.set('color', colorRef.current);
              selection.style = Array.from(style.entries())
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ');
            }
          }
        });
      }, 0);
    };

    contentEditable.addEventListener('input', handleInput);
    contentEditable.addEventListener('focus', handleFocus);
    contentEditable.addEventListener('click', handleFocus);

    // Initial setup
    handleFocus();

    return () => {
      contentEditable.removeEventListener('input', handleInput);
      contentEditable.removeEventListener('focus', handleFocus);
      contentEditable.removeEventListener('click', handleFocus);
    };
  }, [editor, updateCursorColor]);



  return null;
}
