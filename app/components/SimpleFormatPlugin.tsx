'use client';

import { $getSelection, $isRangeSelection, $isTextNode, TextNode, $getRoot } from 'lexical';
import { FORMAT_TEXT_COMMAND } from 'lexical';

// Global color state
let currentTextColor = '#000000';

// Function to update global color state
export function updateGlobalColor(color: string) {
  currentTextColor = color;
  console.log('🎨 Global color updated to:', color);
}

// Simple and direct color application
export function applySimpleColor(editor: any, color: string) {
  if (!editor) return false;

  console.log('🎨 Applying color:', color);

  // Update global color state
  currentTextColor = color;

  // Update cursor color immediately
  updateCursorColor(color);

  // Store color preference
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentTextColor', color);
  }

  // Apply color to selected text
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const nodes = selection.getNodes();
      nodes.forEach((node) => {
        if ($isTextNode(node)) {
          const currentStyle = node.getStyle();
          const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
          const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${color}` : `color: ${color}`;
          node.setStyle(newStyle.replace(/^;\s*/, ''));
        }
      });
      console.log('🎨 Color applied to selected text');
    }
  });

  return true;
}

// Apply color to all existing text nodes
export function applyColorToAllText(editor: any, color: string) {
  if (!editor) return false;

  console.log('🎨 Applying color to all text:', color);

  // Update global state
  currentTextColor = color;
  updateCursorColor(color);

  editor.update(() => {
    const root = $getRoot();
    const textNodes: TextNode[] = [];

    // Collect all text nodes
    root.getChildren().forEach((child: any) => {
      if (child.getType() === 'paragraph') {
        child.getChildren().forEach((grandChild: any) => {
          if ($isTextNode(grandChild)) {
            textNodes.push(grandChild as TextNode);
          }
        });
      }
    });

    // Apply color to all text nodes
    textNodes.forEach((textNode) => {
      const currentStyle = textNode.getStyle();
      const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
      const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${color}` : `color: ${color}`;
      textNode.setStyle(newStyle.replace(/^;\s*/, ''));
    });

    console.log('🎨 Color applied to', textNodes.length, 'text nodes');
  });

  return true;
}

// Update cursor color function
function updateCursorColor(color: string) {
  console.log('🎨 Updating cursor color to:', color);

  // Find all contenteditable elements
  const contentEditables = document.querySelectorAll('[contenteditable="true"]');

  contentEditables.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.caretColor = color;
      element.style.setProperty('--cursor-color', color, 'important');
    }
  });

  // Also update CSS custom property on document
  document.documentElement.style.setProperty('--cursor-color', color, 'important');
  document.body.style.setProperty('--cursor-color', color, 'important');

  console.log('🎨 Cursor color updated successfully');
}

// Get current color
export function getCurrentColor(): string {
  return currentTextColor;
}

// Apply color to new text when typing
export function applyColorToNewText(editor: any) {
  if (!editor) return;

  // Prevent infinite loops
  if (editor._isApplyingColor) return;
  editor._isApplyingColor = true;

  try {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        // Get the current text node at cursor
        const anchor = selection.anchor;
        const textNode = anchor.getNode();
        
        if ($isTextNode(textNode)) {
          // Apply current color to the text node
          const currentStyle = textNode.getStyle();
          const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
          const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${currentTextColor}` : `color: ${currentTextColor}`;
          textNode.setStyle(newStyle.replace(/^;\s*/, ''));
        }
      }
    });
  } finally {
    editor._isApplyingColor = false;
  }
}

// Initialize color from localStorage
export function initializeColor() {
  if (typeof window !== 'undefined') {
    const savedColor = localStorage.getItem('currentTextColor');
    if (savedColor) {
      currentTextColor = savedColor;
      updateCursorColor(savedColor);
    }
  }
}

// Simple font application
export function applySimpleFont(editor: any, font: string) {
  if (!editor) return false;

  console.log('🎨 Applying font:', font);

  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        const nodes = selection.getNodes();
        const textNodes = nodes.filter(node => $isTextNode(node));

        textNodes.forEach((textNode: TextNode) => {
          const currentStyle = textNode.getStyle();
          const styleWithoutFont = currentStyle.replace(/font-family:\s*[^;]+;?/g, '');
          const newStyle = styleWithoutFont ? `${styleWithoutFont}; font-family: "${font}", sans-serif` : `font-family: "${font}", sans-serif`;
          textNode.setStyle(newStyle.replace(/^;\s*/, ''));
        });
        console.log('🎨 Font applied to selected text');
      } else {
        // Apply to current cursor position for new text
        const anchorNode = selection.anchor.getNode();
        if ($isTextNode(anchorNode)) {
          const currentStyle = anchorNode.getStyle();
          const styleWithoutFont = currentStyle.replace(/font-family:\s*[^;]+;?/g, '');
          const newStyle = styleWithoutFont ? `${styleWithoutFont}; font-family: "${font}", sans-serif` : `font-family: "${font}", sans-serif`;
          anchorNode.setStyle(newStyle.replace(/^;\s*/, ''));
          console.log('🎨 Font applied to current text node');
        }
      }
    }
  });

  // Store font preference
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentFont', font);
  }

  // Update global font state
  const rootElement = editor.getRootElement();
  if (rootElement) {
    rootElement.style.setProperty('--current-font-family', `"${font}", sans-serif`);
    rootElement.setAttribute('data-font-family', font);
  }

  return true;
}

// Simple font size application
export function applySimpleFontSize(editor: any, size: string) {
  if (!editor) return false;

  console.log('🎨 Applying font size:', size);

  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (!selection.isCollapsed()) {
        // Apply to selected text
        const nodes = selection.getNodes();
        const textNodes = nodes.filter(node => $isTextNode(node));

        textNodes.forEach((textNode: TextNode) => {
          const currentStyle = textNode.getStyle();
          const styleWithoutFontSize = currentStyle.replace(/font-size:\s*[^;]+;?/g, '');
          const newStyle = styleWithoutFontSize ? `${styleWithoutFontSize}; font-size: ${size}px` : `font-size: ${size}px`;
          textNode.setStyle(newStyle.replace(/^;\s*/, ''));
        });
        console.log('🎨 Font size applied to selected text');
      } else {
        // Apply to current cursor position for new text
        const anchorNode = selection.anchor.getNode();
        if ($isTextNode(anchorNode)) {
          const currentStyle = anchorNode.getStyle();
          const styleWithoutFontSize = currentStyle.replace(/font-size:\s*[^;]+;?/g, '');
          const newStyle = styleWithoutFontSize ? `${styleWithoutFontSize}; font-size: ${size}px` : `font-size: ${size}px`;
          anchorNode.setStyle(newStyle.replace(/^;\s*/, ''));
          console.log('🎨 Font size applied to current text node');
        }
      }
    }
  });

  // Store font size preference
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentFontSize', size);
  }

  // Update global font size state
  const rootElement = editor.getRootElement();
  if (rootElement) {
    rootElement.style.setProperty('--current-font-size', `${size}px`);
    rootElement.setAttribute('data-font-size', size);
  }

  return true;
}

// Simple text formatting
export function applySimpleFormat(editor: any, format: 'bold' | 'italic' | 'underline' | 'strikethrough') {
  if (!editor) return false;

  editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  return true;
}

// Get current formatting state
export function getSimpleFormatting(editor: any) {
  if (!editor) return { bold: false, italic: false, underline: false, strikethrough: false };

  let formatting = { bold: false, italic: false, underline: false, strikethrough: false };

  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      formatting = {
        bold: selection.hasFormat('bold'),
        italic: selection.hasFormat('italic'),
        underline: selection.hasFormat('underline'),
        strikethrough: selection.hasFormat('strikethrough')
      };
    }
  });

  return formatting;
}

// Get current font
export function getCurrentFont(): string {
  return 'Inter';
}

// Get current font size
export function getCurrentFontSize(): string {
  return '12';
}

// Initialize font and font size from localStorage
export function initializeFont() {
  // Font initialization logic here
}

