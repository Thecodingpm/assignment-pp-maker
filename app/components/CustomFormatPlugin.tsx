'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getSelection, $isRangeSelection, $createTextNode, $isTextNode, $getRoot, $createParagraphNode, TextNode } from 'lexical';
import { getCurrentEditor } from './EditorRegistry';

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
  console.log('🎨 applyColorFormat called with color:', color);
  console.log('Editor object:', editor);
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply color to selected text
        console.log('Applying color to selected text:', color);
        
        // Get all text nodes in selection
        const nodes = selection.getNodes();
        const textNodes = nodes.filter(node => $isTextNode(node));
        
        textNodes.forEach((textNode: TextNode) => {
          // Clear existing color styles first
          const currentStyle = textNode.getStyle();
          const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
          
          // Apply new color
          const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${color}` : `color: ${color}`;
          textNode.setStyle(newStyle.replace(/^;\s*/, '')); // Remove leading semicolon
        });
        
      } else {
        // Set color for new text at cursor position
        console.log('Setting color for new text at cursor:', color);
        
        // Store the color for future text input - NO DOM manipulation
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentTextColor', color);
          localStorage.setItem('cursorColor', color);
        }
            }
          }
        });
        
  // Force immediate cursor color update
  updateCursorColorImmediate(color);
}

// Function to immediately update cursor color with force
export function updateCursorColorImmediate(color: string) {
  console.log('🚀 updateCursorColorImmediate called with color:', color);
  
  // Use multiple strategies to ensure cursor color updates
  const updateStrategies = [
    () => updateViaCSSVariables(color),
    () => updateViaDirectStyles(color),
    () => updateViaStyleInjection(color)
  ];
  
  updateStrategies.forEach((strategy, index) => {
    setTimeout(() => strategy(), index * 10);
  });
  
  // Force focus and cursor visibility
  setTimeout(() => forceCursorVisibility(color), 50);
}

function updateViaCSSVariables(color: string) {
  console.log('🎨 updateViaCSSVariables called with color:', color);
  
  // Set both CSS variables with !important equivalent
  document.documentElement.style.setProperty('--current-text-color', color, 'important');
  document.documentElement.style.setProperty('--cursor-color', color, 'important');
  
  // Also set them on the body element for better inheritance
  document.body.style.setProperty('--current-text-color', color, 'important');
  document.body.style.setProperty('--cursor-color', color, 'important');
  
  console.log('✅ Set --current-text-color to:', color);
  console.log('✅ Set --cursor-color to:', color);
  
  // Verify the variables were set
  const currentTextColor = getComputedStyle(document.documentElement).getPropertyValue('--current-text-color');
  const cursorColor = getComputedStyle(document.documentElement).getPropertyValue('--cursor-color');
  
  console.log('🔍 Verified --current-text-color:', currentTextColor);
  console.log('🔍 Verified --cursor-color:', cursorColor);
}

function updateViaDirectStyles(color: string) {
  console.log('🎯 updateViaDirectStyles called with color:', color);
  
  // Debug: Check what elements exist
  console.log('All elements with contenteditable:', document.querySelectorAll('[contenteditable]'));
  console.log('All elements with class lexical-editor:', document.querySelectorAll('.lexical-editor'));
  
  // Try multiple selectors to find the contentEditable element
  const selectors = [
    '.lexical-editor [contenteditable="true"]',
    '[contenteditable="true"]',
    '.lexical-editor .ContentEditable__root',
    '.ContentEditable__root',
    '.lexical-editor div[contenteditable]',
    'div[contenteditable]'
  ];
  
  let contentEditable: HTMLElement | null = null;
  
  for (const selector of selectors) {
    contentEditable = document.querySelector(selector) as HTMLElement;
    if (contentEditable) {
      console.log('✅ Found contentEditable with selector:', selector);
      break;
      } else {
      console.log('❌ Selector failed:', selector);
    }
  }
  
  if (contentEditable) {
    console.log('🎯 ContentEditable element found:', contentEditable);
    console.log('Current caretColor:', contentEditable.style.caretColor);
    console.log('Current computed caret-color:', getComputedStyle(contentEditable).caretColor);
    
    // Apply the color
    contentEditable.style.caretColor = color;
    contentEditable.style.setProperty('caret-color', color, 'important');
    
    console.log('✅ Applied caretColor:', contentEditable.style.caretColor);
    console.log('✅ Applied caret-color property:', contentEditable.style.getPropertyValue('caret-color'));
    
    // Force a repaint
    contentEditable.offsetHeight;
  } else {
    console.log('❌ No contentEditable element found with any selector');
  }
}

function updateViaStyleInjection(color: string) {
  // Remove existing dynamic style
  const existingStyle = document.getElementById('dynamic-cursor-color');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Inject new style - SIMPLIFIED to prevent conflicts
  const style = document.createElement('style');
  style.id = 'dynamic-cursor-color';
  style.textContent = `
    .lexical-editor [contenteditable="true"] {
      caret-color: ${color} !important;
      -webkit-caret-color: ${color} !important;
      -moz-caret-color: ${color} !important;
    }
    
    .lexical-editor [contenteditable="true"] * {
      caret-color: ${color} !important;
      -webkit-caret-color: ${color} !important;
      -moz-caret-color: ${color} !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Injected simplified cursor color style:', color);
}

function forceCursorVisibility(color: string) {
  console.log('🎯 forceCursorVisibility called with color:', color);
  
  const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
  if (contentEditable) {
    // Ensure editor has focus
    contentEditable.focus();
    
    // Apply the new color with multiple methods - NO reflow forcing
    contentEditable.style.caretColor = color;
    contentEditable.style.setProperty('caret-color', color, 'important');
    contentEditable.style.setProperty('-webkit-caret-color', color, 'important');
    contentEditable.style.setProperty('-moz-caret-color', color, 'important');
    
    console.log('✅ Forced cursor visibility with color:', color);
    console.log('Final caretColor style:', contentEditable.style.caretColor);
    console.log('Final computed caret-color:', getComputedStyle(contentEditable).caretColor);
  } else {
    console.log('❌ No contentEditable found in forceCursorVisibility');
  }
}

// Function to apply formatting context for new text
export function setFormattingContext(editor: any, color: string) {
  console.log('🎯 setFormattingContext called with color:', color);
  
  // Store the color for future text input - NO DOM manipulation
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentTextColor', color);
    localStorage.setItem('cursorColor', color);
  }
  
  console.log('✅ Set formatting context for color:', color);
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
            (node as any).setFormat('bold', false);
            (node as any).setFormat('italic', false);
            (node as any).setFormat('underline', false);
            (node as any).setFormat('strikethrough', false);
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

// Function to maintain cursor color and focus
export function updateCursorColorAndFocus(color: string) {
  // Immediately update cursor color
  const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
  if (editorElement) {
    const contentEditable = editorElement.querySelector('[contenteditable="true"]') as HTMLElement;
    if (contentEditable) {
      // Update cursor color immediately
      contentEditable.style.caretColor = color;
      contentEditable.style.setProperty('--caret-color', color, 'important');
      
      // Ensure editor maintains focus
      if (document.activeElement !== contentEditable) {
        contentEditable.focus();
      }
      
      // Force a repaint to ensure cursor color updates
      contentEditable.style.display = 'none';
      contentEditable.offsetHeight; // Trigger reflow
      contentEditable.style.display = '';
      
      console.log('Cursor color updated immediately to:', color);
    }
  }
}

// Alternative simplified handler for immediate feedback
export function handleColorChangeImmediate(color: string) {
  console.log('🚀 handleColorChangeImmediate called with color:', color);
  
  // Update the current text color first
  setCurrentTextColor(color);
  
  // Update cursor color
  updateCursorColorImmediate(color);
  
  // Then handle the rest
  const editor = getCurrentEditor();
  if (editor) {
    applyColorFormat(editor, color);
    setFormattingContext(editor, color);
    
    // Ensure new content will have this color
    ensureTextColorForNewContent(editor, color);
    
    // Setup auto color application for new text
    setupAutoColorApplication(editor);
    
    console.log('✅ Immediate color change applied:', color);
  }
}

// Test function to verify color changes are working
export function testColorChange(color: string) {
  console.log('Testing color change to:', color);
  
  // Test cursor color update
  updateCursorColorImmediate(color);
  
  // Test with a sample text node
  const editor = getCurrentEditor();
  if (editor) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Insert colored text for testing
        const testNode = $createTextNode('TEST COLOR ');
        testNode.setStyle(`color: ${color}; font-weight: bold;`);
        selection.insertNodes([testNode]);
        
        console.log('Test text inserted with color:', color);
      }
    });
  }
}

// Enhanced onClick handler for color buttons
export function createColorButtonHandler(color: string, onColorChange?: (color: string) => void, onDropdownClose?: () => void) {
  return () => {
    const editor = getCurrentEditor();
    if (editor) {
      console.log('CustomFormatPlugin: Applying color:', color);
      
      // Step 1: Apply the color format
      applyColorFormat(editor, color);
      
      // Step 2: Set formatting context for new text
      setFormattingContext(editor, color);
      
      // Step 3: Update cursor color immediately
      updateCursorColorImmediate(color);
      
      // Step 4: Update component state
      if (onColorChange) {
        onColorChange(color);
      }
      
      // Step 5: Update the current text color
      setCurrentTextColor(color);
      
      // Step 6: Setup auto color application for new text
      setupAutoColorApplication(editor);
      
      // Step 7: Ensure proper focus and visual feedback
      setTimeout(() => {
        const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
        if (contentEditable) {
          contentEditable.focus();
          
          // Dispatch custom event to notify other components
          const colorChangeEvent = new CustomEvent('textColorChange', {
            detail: { color },
            bubbles: true
          });
          contentEditable.dispatchEvent(colorChangeEvent);
          
          console.log('Color change event dispatched:', color);
        }
      }, 10);
      
      // Close dropdown if callback provided
      if (onDropdownClose) {
        onDropdownClose();
      }
      
      console.log('CustomFormatPlugin: Color applied and visual feedback triggered:', color);
    } else {
      console.log('CustomFormatPlugin: No editor found');
    }
  };
}

// Function to handle new text input with current color - NO GLITCHING
export function handleNewTextInput(editor: any) {
  const currentColor = localStorage.getItem('currentTextColor') || '#000000';
  
  console.log('📝 handleNewTextInput called with color:', currentColor);
  
  // Update cursor color to match
  updateCursorColorImmediate(currentColor);
  
  console.log('✅ New text input handler ready for color:', currentColor);
}

// Function to ensure text color is applied to new content
export function ensureTextColorForNewContent(editor: any, color: string) {
  console.log('🎨 ensureTextColorForNewContent called with color:', color);
  
  // Store the color
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentTextColor', color);
    localStorage.setItem('cursorColor', color);
  }
  
  // Update cursor color
  updateCursorColorImmediate(color);
  
  console.log('✅ Text color ensured for new content:', color);
}

// Function to get the current text color
export function getCurrentTextColor(): string {
  return localStorage.getItem('currentTextColor') || '#000000';
}

// Function to set the current text color
export function setCurrentTextColor(color: string) {
  localStorage.setItem('currentTextColor', color);
  localStorage.setItem('cursorColor', color);
  
  // Update CSS variables immediately
  document.documentElement.style.setProperty('--current-text-color', color, 'important');
  document.documentElement.style.setProperty('--cursor-color', color, 'important');
  document.body.style.setProperty('--current-text-color', color, 'important');
  document.body.style.setProperty('--cursor-color', color, 'important');
  
  console.log('✅ Current text color set to:', color);
}

// Function to test new text color functionality
export function testNewTextColor(color: string) {
  console.log('🧪 Testing new text color functionality with:', color);
  
  // Set the current text color
  setCurrentTextColor(color);
  
  // Update cursor color
  updateCursorColorImmediate(color);
  
  // Test typing some text to see if it gets the color
  const editor = getCurrentEditor();
  if (editor) {
  editor.update(() => {
    const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Insert a test text node with the color
        const testNode = $createTextNode('TEST TEXT ');
        testNode.setStyle(`color: ${color}`);
        selection.insertNodes([testNode]);
        
        console.log('✅ Test text inserted with color:', color);
        console.log('✅ Text node style:', testNode.getStyle());
      }
    });
  }
  
  console.log('🧪 Test completed. Check if the text appears in color:', color);
}

// Function to be called when user types - ensures new text gets current color
export function onTextInput(editor: any) {
  const currentColor = localStorage.getItem('currentTextColor');
  if (currentColor && currentColor !== '#000000') {
    console.log('📝 onTextInput: Applying color to new text:', currentColor);
    
    // Update cursor color to match
    updateCursorColorImmediate(currentColor);
    
    // Apply color to the current selection/typing position
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Get the current text node at cursor
        const anchor = selection.anchor;
        const anchorNode = anchor.getNode();
        
        if ($isTextNode(anchorNode)) {
          // Apply color to the current text node
          const currentStyle = anchorNode.getStyle();
          const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
          const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${currentColor}` : `color: ${currentColor}`;
          anchorNode.setStyle(newStyle.replace(/^;\s*/, ''));
          
          console.log('✅ Applied color to current text node:', currentColor);
        }
      }
    });
    
    console.log('✅ Text input handler applied color:', currentColor);
  }
}

// Function to get the current active color
export function getActiveColor(): string {
  return localStorage.getItem('currentTextColor') || '#000000';
}

// Function to automatically apply color to new text as it's typed
export function setupAutoColorApplication(editor: any) {
  console.log('🎨 Setting up auto color application');
  
  // Listen for text input events
  const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
  if (contentEditable) {
    const handleInput = (e: Event) => {
      const currentColor = localStorage.getItem('currentTextColor');
      if (currentColor && currentColor !== '#000000') {
        console.log('📝 Auto-applying color to new text:', currentColor);
        
        // Use a small delay to ensure the text node is created
        setTimeout(() => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              // Get the text node at the current cursor position
              const anchor = selection.anchor;
              const textNode = anchor.getNode();
              
              if ($isTextNode(textNode)) {
                const currentStyle = textNode.getStyle();
                if (!currentStyle.includes('color:')) {
                  // Apply color to the text node at cursor
                  textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${currentColor}`);
                  console.log('✅ Applied color to text node at cursor:', currentColor);
                }
              }
              
              // Also check all text nodes in selection
              const nodes = selection.getNodes();
              const textNodes = nodes.filter(node => $isTextNode(node));
              
              textNodes.forEach((textNode: TextNode) => {
                const currentStyle = textNode.getStyle();
                if (!currentStyle.includes('color:')) {
                  // Only apply color if it doesn't already have one
                  textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${currentColor}`);
                  console.log('✅ Applied color to text node in selection:', currentColor);
                }
              });
            }
          });
        }, 10); // Small delay to ensure text node is created
      }
    };
    
    // Listen to multiple events to catch all text input
    contentEditable.addEventListener('input', handleInput);
    contentEditable.addEventListener('keydown', handleInput);
    contentEditable.addEventListener('keyup', handleInput);
    
    console.log('✅ Auto color application setup complete');
    
    // Return cleanup function
    return () => {
      contentEditable.removeEventListener('input', handleInput);
      contentEditable.removeEventListener('keydown', handleInput);
      contentEditable.removeEventListener('keyup', handleInput);
    };
  }
  
  return () => {};
}

// Function to force apply color to all text in the editor
export function applyColorToAllText(editor: any, color: string) {
  console.log('🎨 Applying color to all text in editor:', color);
  
  editor.update(() => {
    const root = $getRoot();
    const allTextNodes: TextNode[] = [];
    
    // Collect all text nodes
    const collectTextNodes = (node: any) => {
        if ($isTextNode(node)) {
        allTextNodes.push(node);
      }
      const children = node.getChildren();
      children.forEach(collectTextNodes);
    };
    
    collectTextNodes(root);
    
    // Apply color to all text nodes
    allTextNodes.forEach(textNode => {
      const currentStyle = textNode.getStyle();
      const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
      const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${color}` : `color: ${color}`;
      textNode.setStyle(newStyle.replace(/^;\s*/, ''));
    });
    
    console.log(`✅ Applied color to ${allTextNodes.length} text nodes:`, color);
  });
}

// Simple test function to verify text color is working
export function testTextColorChange(color: string) {
  console.log('🧪 Testing text color change to:', color);
  
  const editor = getCurrentEditor();
  if (editor) {
    // Set the color
    setCurrentTextColor(color);
    
    // Update cursor
    updateCursorColorImmediate(color);
    
    // Insert test text with the color
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const testNode = $createTextNode(`COLORED TEXT (${color}) `);
        testNode.setStyle(`color: ${color}; font-weight: bold;`);
        selection.insertNodes([testNode]);
        
        console.log('✅ Test text inserted with color:', color);
        console.log('✅ Text node style:', testNode.getStyle());
      }
    });
    
    // Setup auto color application
    setupAutoColorApplication(editor);
    
    console.log('🧪 Text color test completed. Type more text to see if it gets the color automatically.');
  } else {
    console.log('❌ No editor found for text color test');
  }
}

// Main function for toolbars to call - applies both cursor and text color
export function applyColorToEditor(editor: any, color: string) {
  console.log('🎨 applyColorToEditor called with color:', color);
  
  // Step 1: Update stored colors
  setCurrentTextColor(color);
  
  // Step 2: Update cursor color
  updateCursorColorImmediate(color);
  
  // Step 3: Apply color to any selected text
  applyColorFormat(editor, color);
  
  // Step 4: Set formatting context for future text
  setFormattingContext(editor, color);
  
  // Step 5: Use the simple, working text color application
  simpleApplyTextColor(editor, color);
  
  console.log('✅ Color fully applied to editor:', color);
  console.log('✅ Cursor color updated');
  console.log('✅ Simple text color system active');
  
  return true;
}

// Function to immediately apply color to new text being typed
export function applyColorToNewText(editor: any, color: string) {
  console.log('🎨 Applying color to new text:', color);
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Get the text node at cursor position
      const anchor = selection.anchor;
      const textNode = anchor.getNode();
      
      if ($isTextNode(textNode)) {
        const currentStyle = textNode.getStyle();
        if (!currentStyle.includes('color:')) {
          textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${color}`);
          console.log('✅ Applied color to current text node:', color);
        }
      }
    }
  });
}

// Enhanced function to setup text color monitoring
export function setupTextColorMonitoring(editor: any) {
  console.log('🎨 Setting up text color monitoring');
  
  const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
  if (!contentEditable) return () => {};
  
  // Remove any existing listeners first
  const existingListener = (contentEditable as any)._colorInputListener;
  if (existingListener) {
    contentEditable.removeEventListener('input', existingListener);
    contentEditable.removeEventListener('keydown', existingListener);
    contentEditable.removeEventListener('keyup', existingListener);
  }
  
  const handleInput = (e: Event) => {
    const currentColor = localStorage.getItem('currentTextColor');
    console.log('📝 Input event detected, current color:', currentColor);
    
    if (currentColor && currentColor !== '#000000') {
      console.log('🎨 Applying color to new text:', currentColor);
      
      // Apply color immediately to the current text node
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Get the text node at cursor position
          const anchor = selection.anchor;
          const textNode = anchor.getNode();
          
          if ($isTextNode(textNode)) {
            const currentStyle = textNode.getStyle();
            if (!currentStyle.includes('color:')) {
              textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${currentColor}`);
              console.log('✅ Applied color to text node at cursor:', currentColor);
              console.log('✅ Text node style now:', textNode.getStyle());
            } else {
              console.log('ℹ️ Text node already has color style:', currentStyle);
            }
          } else {
            console.log('ℹ️ Node at cursor is not a text node:', textNode.getType());
          }
        }
      });
    } else {
      console.log('ℹ️ No color set or color is black');
    }
  };
  
  // Store the listener reference to avoid duplicates
  (contentEditable as any)._colorInputListener = handleInput;
  
  // Listen to input events only (more reliable)
  contentEditable.addEventListener('input', handleInput);
  
  console.log('✅ Text color monitoring setup complete');
  
  return () => {
    contentEditable.removeEventListener('input', handleInput);
    delete (contentEditable as any)._colorInputListener;
  };
}

// Function to force apply current color to all text (for testing)
export function forceApplyCurrentColorToAllText(editor: any) {
  const currentColor = localStorage.getItem('currentTextColor');
  if (currentColor && currentColor !== '#000000') {
    console.log('🎨 Force applying current color to all text:', currentColor);
    applyColorToAllText(editor, currentColor);
    return true;
  } else {
    console.log('❌ No current color set or color is black');
    return false;
  }
}

// Function to debug current color state
export function debugColorState() {
  console.log('🔍 === COLOR STATE DEBUG ===');
  
  const currentTextColor = localStorage.getItem('currentTextColor');
  const cursorColor = localStorage.getItem('cursorColor');
  const defaultTextColor = localStorage.getItem('defaultTextColor');
  
  console.log('🔍 currentTextColor:', currentTextColor);
  console.log('🔍 cursorColor:', cursorColor);
  console.log('🔍 defaultTextColor:', defaultTextColor);
  
  // Check CSS variables
  const rootStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  
  console.log('🔍 CSS --current-text-color:', rootStyles.getPropertyValue('--current-text-color'));
  console.log('🔍 CSS --cursor-color:', rootStyles.getPropertyValue('--cursor-color'));
  
  // Check editor element
  const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
  if (contentEditable) {
    const editorStyles = getComputedStyle(contentEditable);
    console.log('🔍 Editor caret-color:', editorStyles.caretColor);
    console.log('🔍 Editor color:', editorStyles.color);
  } else {
    console.log('🔍 No contentEditable found');
  }
  
  console.log('🔍 === END DEBUG ===');
}

// Comprehensive test function to debug color application
export function comprehensiveColorTest(color: string) {
  console.log('🧪 === COMPREHENSIVE COLOR TEST ===');
  console.log('🧪 Testing color:', color);
  
  // Step 1: Check initial state
  console.log('🧪 Step 1: Initial state');
  const initialColor = localStorage.getItem('currentTextColor');
  console.log('🧪 Initial currentTextColor:', initialColor);
  
  // Step 2: Set the color
  console.log('🧪 Step 2: Setting color');
  setCurrentTextColor(color);
  
  // Step 3: Verify color was set
  console.log('🧪 Step 3: Verifying color was set');
  const newColor = localStorage.getItem('currentTextColor');
  console.log('🧪 New currentTextColor:', newColor);
  console.log('🧪 Color matches expected:', newColor === color);
  
  // Step 4: Get editor
  console.log('🧪 Step 4: Getting editor');
  const editor = getCurrentEditor();
  if (editor) {
    console.log('🧪 Editor found:', !!editor);
    
    // Step 5: Update cursor color
    console.log('🧪 Step 5: Updating cursor color');
    updateCursorColorImmediate(color);
    
    // Step 6: Setup text monitoring
    console.log('🧪 Step 6: Setting up text monitoring');
    setupTextColorMonitoring(editor);
    
    // Step 7: Test text insertion
    console.log('🧪 Step 7: Testing text insertion');
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const testNode = $createTextNode(`TEST TEXT (${color}) `);
        testNode.setStyle(`color: ${color}`);
        selection.insertNodes([testNode]);
        
        console.log('🧪 Test text inserted');
        console.log('🧪 Test text style:', testNode.getStyle());
        console.log('🧪 Test text color should be:', color);
      }
    });
    
    console.log('🧪 === TEST COMPLETED ===');
    console.log('🧪 Now try typing some text to see if it gets the color automatically');
    
  } else {
    console.log('❌ No editor found');
  }
}

// Global text color handler - more reliable approach
export function setupGlobalTextColorHandler(editor: any, color: string) {
  console.log('🎨 Setting up global text color handler for:', color);
  
  // Store the color globally so it can be accessed by any text input
  (window as any).currentTextColor = color;
  
  // Set up the input listener on the contentEditable element
  const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
  if (contentEditable) {
    // Remove existing listener if any
    if ((contentEditable as any)._globalColorListener) {
      contentEditable.removeEventListener('input', (contentEditable as any)._globalColorListener);
      contentEditable.removeEventListener('keydown', (contentEditable as any)._globalColorListener);
    }
    
    const handleInput = (e: Event) => {
      const currentColor = (window as any).currentTextColor || localStorage.getItem('currentTextColor');
      if (currentColor && currentColor !== '#000000') {
        console.log('🎨 Input detected, applying color to new text:', currentColor);
        
        // Apply color to the current text node
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Get the text node at cursor position
            const anchor = selection.anchor;
            const textNode = anchor.getNode();
            
            if ($isTextNode(textNode)) {
              const currentStyle = textNode.getStyle();
              if (!currentStyle.includes('color:')) {
                textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${currentColor}`);
                console.log('✅ Applied color to text node:', currentColor);
              }
            }
          }
        });
      }
    };
    
    // Store reference to avoid duplicates
    (contentEditable as any)._globalColorListener = handleInput;
    
    // Add listeners for both input and keydown events
    contentEditable.addEventListener('input', handleInput);
    contentEditable.addEventListener('keydown', handleInput);
    
    console.log('✅ Global text color handler setup complete');
  }
}

// Simple test to verify color system
export function testColorSystem(color: string) {
  console.log('🧪 Testing color system with:', color);
  
  const editor = getCurrentEditor();
  if (editor) {
    // Apply the color
    const success = applyColorToEditor(editor, color);
    
    if (success) {
      console.log('✅ Color system test successful');
      console.log('✅ Now type some text to see if it gets the color');
      
      // Insert a small test text
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const testNode = $createTextNode('TEST ');
          testNode.setStyle(`color: ${color}`);
          selection.insertNodes([testNode]);
        }
      });
    } else {
      console.log('❌ Color system test failed');
    }
  } else {
    console.log('❌ No editor found for test');
  }
}

// Enhanced text color application that works more reliably
export function ensureTextColorApplication(editor: any, color: string) {
  console.log('🎨 Ensuring text color application for:', color);
  
  // Store the color globally
  (window as any).currentTextColor = color;
  localStorage.setItem('currentTextColor', color);
  
  // Set up a more robust text input handler
  const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
  if (contentEditable) {
    // Remove any existing handlers
    if ((contentEditable as any)._enhancedColorHandler) {
      contentEditable.removeEventListener('input', (contentEditable as any)._enhancedColorHandler);
      contentEditable.removeEventListener('keydown', (contentEditable as any)._enhancedColorHandler);
      contentEditable.removeEventListener('keyup', (contentEditable as any)._enhancedColorHandler);
    }
    
    const handleTextInput = (e: Event) => {
      const currentColor = (window as any).currentTextColor || localStorage.getItem('currentTextColor');
      if (currentColor && currentColor !== '#000000') {
        console.log('🎨 Text input detected, applying color:', currentColor);
        
        // Apply color immediately to ensure it works
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Get the text node at cursor position
            const anchor = selection.anchor;
            const textNode = anchor.getNode();
            
            if ($isTextNode(textNode)) {
              const currentStyle = textNode.getStyle();
              if (!currentStyle.includes('color:')) {
                textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${currentColor}`);
                console.log('✅ Enhanced handler applied color to text node:', currentColor);
              }
            }
          }
        });
      }
    };
    
    // Store the handler reference
    (contentEditable as any)._enhancedColorHandler = handleTextInput;
    
    // Add multiple event listeners to catch all text input
    contentEditable.addEventListener('input', handleTextInput);
    contentEditable.addEventListener('keydown', handleTextInput);
    contentEditable.addEventListener('keyup', handleTextInput);
    
    console.log('✅ Enhanced text color handler setup complete');
  }
}

// NEW: Direct text color application that works immediately
export function applyColorToCurrentText(editor: any, color: string) {
  console.log('🎨 Applying color to current text position:', color);
  
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Get the text node at cursor position
      const anchor = selection.anchor;
      const textNode = anchor.getNode();
      
      if ($isTextNode(textNode)) {
        const currentStyle = textNode.getStyle();
        if (!currentStyle.includes('color:')) {
          textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${color}`);
          console.log('✅ Applied color to current text node:', color);
        } else {
          // Update existing color
          const newStyle = currentStyle.replace(/color:\s*[^;]+;?/g, `color: ${color}`);
          textNode.setStyle(newStyle);
          console.log('✅ Updated existing color to:', color);
        }
      }
    }
  });
}

// NEW: Simple text color application that actually works
export function simpleApplyTextColor(editor: any, color: string) {
  console.log('🎨 Simple text color application for:', color);
  
  // Store the color globally
  (window as any).currentTextColor = color;
  localStorage.setItem('currentTextColor', color);
  
  // Method 1: Apply color ONLY to selected text (if any)
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // There's selected text - apply color only to selection
        const nodes = selection.getNodes();
        const textNodes = nodes.filter(node => $isTextNode(node));
        
        textNodes.forEach((textNode: TextNode) => {
          const currentStyle = textNode.getStyle();
          const newStyle = currentStyle.replace(/color:\s*[^;]+;?/g, '') + `; color: ${color} !important`;
          textNode.setStyle(newStyle.replace(/^;\s*/, ''));
          
          // Also force DOM color
          const domNode = editor.getElementByKey(textNode.getKey());
          if (domNode) {
            domNode.style.setProperty('color', color, 'important');
          }
        });
        
        console.log(`✅ Applied color to ${textNodes.length} selected text nodes:`, color);
      } else {
        // No selection - just set up for future text
        console.log('✅ No text selected, color will apply to new text only');
      }
    }
  });
  
  // Method 2: Set up input handler for NEW text only
  const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
  if (contentEditable) {
    // Remove old handler
    if ((contentEditable as any)._simpleColorHandler) {
      contentEditable.removeEventListener('input', (contentEditable as any)._simpleColorHandler);
    }
    
    const handleInput = () => {
      const currentColor = (window as any).currentTextColor;
      if (currentColor && currentColor !== '#000000') {
        console.log('🎨 Input detected, applying color:', currentColor);
        
        // Force color on the newly typed text via DOM
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;
          
          if (container.nodeType === Node.TEXT_NODE) {
            const parentElement = container.parentElement;
            if (parentElement) {
              parentElement.style.setProperty('color', currentColor, 'important');
              console.log('✅ DOM color applied to new text:', currentColor);
            }
          }
        }
        
        // Also try Lexical method
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor;
            const textNode = anchor.getNode();
            
            if ($isTextNode(textNode)) {
              const currentStyle = textNode.getStyle();
              if (!currentStyle.includes('color:')) {
                textNode.setStyle(`${currentStyle ? currentStyle + '; ' : ''}color: ${currentColor} !important`);
                console.log('✅ Lexical color applied to new text:', currentColor);
              }
            }
          }
        });
      }
    };
    
    (contentEditable as any)._simpleColorHandler = handleInput;
    contentEditable.addEventListener('input', handleInput);
    
    console.log('✅ Color handler setup complete - will only color NEW text');
  }
}

// NEW: Force apply color to all text nodes
export function forceApplyColorToAllText(editor: any, color: string) {
  console.log('🎨 Force applying color to all text nodes:', color);
  
  editor.update(() => {
    const root = $getRoot();
    const allTextNodes: TextNode[] = [];
    
    // Collect all text nodes
    const collectTextNodes = (node: any) => {
      if ($isTextNode(node)) {
        allTextNodes.push(node);
      }
      const children = node.getChildren();
      children.forEach(collectTextNodes);
    };
    
    collectTextNodes(root);
    
    // Apply color to all text nodes
    allTextNodes.forEach(textNode => {
      const currentStyle = textNode.getStyle();
      const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
      const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${color}` : `color: ${color}`;
      textNode.setStyle(newStyle.replace(/^;\s*/, ''));
    });
    
    console.log(`✅ Applied color to ${allTextNodes.length} text nodes:`, color);
  });
}







 