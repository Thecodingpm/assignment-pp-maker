'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { $getSelection, $isRangeSelection, TextFormatType, ElementFormatType, $isTextNode, $createTextNode, $getRoot, $createParagraphNode, $createRangeSelection, $setSelection } from 'lexical';
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { getCurrentEditor } from './EditorRegistry';
import TranslationButton from './TranslationButton';
import { useTheme } from './ThemeProvider';
import ReferencesManager from './ReferencesManager';

// Add TypeScript support for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { 
  applySimpleColor, 
  applySimpleFontSize, 
  applySimpleFormat, 
  getSimpleFormatting, 
  getCurrentColor, 
  applySimpleFont, 
  getCurrentFont, 
  getCurrentFontSize, 
  initializeFont, 
  applyColorToAllText,
  updateGlobalColor
} from './SimpleFormatPlugin';

interface TopToolbarProps {
  showGPTSearch: boolean;
  setShowGPTSearch: (show: boolean) => void;
  gptResponse: string;
  setGptResponse: (response: string) => void;
}

const TopToolbar = forwardRef<{ insertGPTResponse: (response: string) => void }, TopToolbarProps>(({
  showGPTSearch,
  setShowGPTSearch,
  gptResponse,
  setGptResponse
}, ref) => {

  const [textColor, setTextColor] = useState('#000000');
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('12');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isGPTSearching, setIsGPTSearching] = useState(false);
  
  // Heading and List dropdown states
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [currentHeadingStyle, setCurrentHeadingStyle] = useState<'h1' | 'h2' | 'h3' | 'sub' | 'body' | 'caption' | null>(null);
  const [currentListStyle, setCurrentListStyle] = useState<string>('No List');
  
  // Voice input state
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Find & Replace state
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [findResults, setFindResults] = useState(0);
  const [findStatus, setFindStatus] = useState('');
  const [currentFindIndex, setCurrentFindIndex] = useState(0);
  
  // Highlight state
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState<string | null>(null);
  
  // Color dropdown state
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  
  // Reference state
  const [showReferenceDropdown, setShowReferenceDropdown] = useState(false);
  const [sources, setSources] = useState<Array<{
    id: string;
    type: 'book' | 'journal' | 'website' | 'newspaper' | 'conference' | 'thesis' | 'other';
    author: string;
    title: string;
    year: string;
    publisher?: string;
    journal?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    url?: string;
    doi?: string;
    isbn?: string;
  }>>([]);
  const [citations, setCitations] = useState<Array<{
    id: string;
    sourceId: string;
    style: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver';
    position: number;
    text: string;
    page?: string;
  }>>([]);
  const [footnotes, setFootnotes] = useState<Array<{
    id: string;
    content: string;
    position: number;
  }>>([]);
  const [endnotes, setEndnotes] = useState<Array<{
    id: string;
    content: string;
    position: number;
  }>>([]);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [citationCount, setCitationCount] = useState(1);
  const [footnoteCount, setFootnoteCount] = useState(1);
  const [endnoteCount, setEndnoteCount] = useState(1);
  const [selectedCitationStyle, setSelectedCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver'>('apa');
  
  // Line spacing state
  const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState(false);
  const [currentLineSpacing, setCurrentLineSpacing] = useState<number>(1);

  // Expose insertGPTResponse function to parent component
  useImperativeHandle(ref, () => ({
    insertGPTResponse
  }));

  // Text formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  // Store formatting state in localStorage to persist across page changes
  useEffect(() => {
    // Load saved formatting state from localStorage
    if (typeof window !== 'undefined') {
      const savedBold = localStorage.getItem('formatting_bold') === 'true';
      const savedItalic = localStorage.getItem('formatting_italic') === 'true';
      const savedUnderline = localStorage.getItem('formatting_underline') === 'true';
      const savedStrikethrough = localStorage.getItem('formatting_strikethrough') === 'true';
      const savedFontSize = localStorage.getItem('defaultFontSize') || '12';
      const savedFont = localStorage.getItem('defaultFont') || 'Inter';
      const savedColor = localStorage.getItem('currentTextColor') || '#000000';
      
      setIsBold(savedBold);
      setIsItalic(savedItalic);
      setIsUnderline(savedUnderline);
      setIsStrikethrough(savedStrikethrough);
      setFontSize(savedFontSize);
      setSelectedFont(savedFont);
      setCurrentTextColor(savedColor);
      setTextColor(savedColor);
      
      // Initialize the formatting plugin
      initializeFont();
    }
  }, []);

  // Save formatting state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('formatting_bold', isBold.toString());
      localStorage.setItem('formatting_italic', isItalic.toString());
      localStorage.setItem('formatting_strikethrough', isStrikethrough.toString());
      localStorage.setItem('formatting_underline', isUnderline.toString());
      localStorage.setItem('defaultFontSize', fontSize);
    }
  }, [isBold, isItalic, isUnderline, isStrikethrough, fontSize]);

  // Apply current formatting state to new text being typed
  const applyCurrentFormattingToNewText = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Only apply formatting if we're actually typing, not during copy operations
          // Check if there's a recent text change to avoid interfering with copy/paste
          const hasRecentTextChange = editor.getEditorState().read(() => {
            // This is a simple check to see if we should apply formatting
            return true; // We'll be more conservative about when to apply
          });
          
          if (!hasRecentTextChange) return;
          
          // Apply all active formatting to the current position
          if (isBold) {
            try {
              selection.formatText('bold');
            } catch (error) {
              console.log('Could not apply bold to new text');
            }
          }
          if (isItalic) {
            try {
              selection.formatText('italic');
            } catch (error) {
              console.log('Could not apply italic to new text');
            }
          }
          if (isUnderline) {
            try {
              selection.formatText('underline');
            } catch (error) {
              console.log('Could not apply underline to new text');
            }
          }
          if (isStrikethrough) {
            try {
              selection.formatText('strikethrough');
            } catch (error) {
              console.log('Could not apply strikethrough to new text');
            }
          }
          
          // Apply current font and font size
          try {
            // Note: font-family formatting is handled differently in Lexical
            // For now, we'll skip font family application to prevent errors
            console.log(`TopToolbar: Font ${selectedFont} would be applied to new text`);
            
            // Apply font size to cursor position for new text
            try {
              // Store the font size preference for new text
              if (typeof window !== 'undefined') {
                localStorage.setItem('defaultFontSize', fontSize);
              }
              console.log(`TopToolbar: Font size ${fontSize}px set for new text position`);
            } catch (error) {
              console.log('Could not set font size for new text position');
            }
          } catch (error) {
            console.log('Could not apply font or font size to new text');
          }
          
          console.log('TopToolbar: Applied current formatting state to new text position');
        }
      });
    }
  };

  // Track undo/redo state and text formatting state from the editor
  useEffect(() => {
    const updateEditorState = () => {
      const editor = getCurrentEditor();
      if (editor) {
        // For now, we'll enable undo/redo buttons when editor exists
        // This ensures the buttons are always clickable
        setCanUndo(true);
        setCanRedo(true);
        

      } else {
        setCanUndo(false);
        setCanRedo(false);
      }
    };

    // Update state initially
    updateEditorState();

    // Set up interval to check editor state
    const interval = setInterval(updateEditorState, 500);

    // Also listen for editor updates
    const editor = getCurrentEditor();
    if (editor) {
      const unregister = editor.registerUpdateListener(() => {
        updateEditorState();
        // Check current formatting state
        checkCurrentFormatting();
      });
      
      return () => {
        clearInterval(interval);
        unregister();
      };
    }

    return () => clearInterval(interval);
  }, []);

  // Check current text formatting state
  const checkCurrentFormatting = () => {
    const editor = getCurrentEditor();
    if (editor) {
      try {
        // Use the simple formatting detection
        const formatting = getSimpleFormatting(editor);
        const currentFont = getCurrentFont(); // Get actual current font
        const currentFontSize = getCurrentFontSize(); // Get actual current font size
        const currentColor = getCurrentColor(); // Get actual current color
        
        // Update font and font size state
        setSelectedFont(currentFont);
        setFontSize(currentFontSize);
        setCurrentTextColor(currentColor);
        setTextColor(currentColor);
        
        // Check specific formatting types
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const bold = selection.hasFormat('bold');
            const italic = selection.hasFormat('italic');
            const underline = selection.hasFormat('underline');
            const strikethrough = selection.hasFormat('strikethrough');
            
            console.log(`TopToolbar: Current formatting - Font: ${currentFont}, Size: ${currentFontSize}, Color: ${currentColor}, Bold: ${bold}, Italic: ${italic}, Underline: ${underline}, Strikethrough: ${strikethrough}`);
            
            setIsBold(bold);
            setIsItalic(italic);
            setIsUnderline(underline);
            setIsStrikethrough(strikethrough);
          }
        });
      } catch (error) {
        console.log('TopToolbar: Error checking formatting state:', error);
        // Reset formatting state on error
        setIsBold(false);
        setIsItalic(false);
        setIsUnderline(false);
        setIsStrikethrough(false);
        setCurrentTextColor('#000000');
        setTextColor('#000000');
        setSelectedFont('Inter');
        setFontSize('12');
      }
    } else {
      console.log('TopToolbar: No editor found for formatting check');
      // Reset formatting state when no editor
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsStrikethrough(false);
      setCurrentTextColor('#000000');
      setTextColor('#000000');
      setSelectedFont('Inter');
      setFontSize('12');
    }
  };

  // Add keyboard shortcuts for undo/redo and text formatting
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            if (!event.shiftKey) {
              event.preventDefault();
              handleUndo();
            } else {
              event.preventDefault();
              handleRedo();
            }
            break;
          case 'y':
            event.preventDefault();
            handleRedo();
            break;
          case 'b':
            event.preventDefault();
            formatText('bold');
            break;
          case 'i':
            event.preventDefault();
            formatText('italic');
            break;
          case 'u':
            event.preventDefault();
            formatText('underline');
            break;
        }
      }
      
      // Handle strikethrough shortcut (Ctrl+Shift+S)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        formatText('strikethrough');
      }

      // Handle font size shortcuts (Ctrl+Plus, Ctrl+Minus)
      if ((event.ctrlKey || event.metaKey) && event.key === '=') {
        event.preventDefault();
        increaseFontSize();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        decreaseFontSize();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for selection changes to update formatting state
  useEffect(() => {
    const editor = getCurrentEditor();
    if (editor) {
      const removeUpdateListener = editor.registerUpdateListener(() => {
        checkCurrentFormatting();
      });

      return () => {
        removeUpdateListener();
      };
    }
  }, [checkCurrentFormatting]);

  // Handle undo operation
  const handleUndo = () => {
    const editor = getCurrentEditor();
    if (editor) {
      console.log('Undo clicked');
      // Add visual feedback
      const undoButton = document.querySelector('[title="Undo (Ctrl+Z)"]');
      if (undoButton) {
        undoButton.classList.add('bg-green-100', 'dark:bg-green-900/20');
        setTimeout(() => {
          undoButton.classList.remove('bg-green-100', 'dark:bg-green-900/20');
        }, 200);
      }
      
      editor.dispatchCommand(UNDO_COMMAND, undefined);
      // Update state after undo
      setTimeout(() => {
        checkCurrentFormatting();
        // Check if undo/redo are available
        const historyState = editor.getEditorState().read(() => {
          // This is a simplified check - in a real implementation you'd track history
          return { canUndo: true, canRedo: true };
        });
        setCanUndo(historyState.canUndo);
        setCanRedo(historyState.canRedo);
      }, 50);
    } else {
      console.log('Editor not found for undo');
    }
  };

  // Handle redo operation
  const handleRedo = () => {
    const editor = getCurrentEditor();
    if (editor) {
      console.log('Redo clicked');
      // Add visual feedback
      const redoButton = document.querySelector('[title="Redo (Ctrl+Y)"]');
      if (redoButton) {
        redoButton.classList.add('bg-green-100', 'dark:bg-green-900/20');
        setTimeout(() => {
          redoButton.classList.remove('bg-green-100', 'dark:bg-green-900/20');
        }, 200);
      }
      
      editor.dispatchCommand(REDO_COMMAND, undefined);
      // Update state after redo
      setTimeout(() => {
        checkCurrentFormatting();
        // Check if undo/redo are available
        const historyState = editor.getEditorState().read(() => {
          // This is a simplified check - in a real implementation you'd track history
          return { canUndo: true, canRedo: true };
        });
        setCanUndo(historyState.canUndo);
        setCanRedo(historyState.canRedo);
      }, 50);
    } else {
      console.log('Editor not found for redo');
    }
  };



    // Insert GPT response into editor
  const insertGPTResponse = (response: string) => {
    if (!response) return;
    
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Insert the GPT response at the current selection
          selection.insertText(response);
        }
      });
    }
  };

  // Format text (bold, italic, underline, strikethrough)
  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    console.log(`=== FORMAT TEXT CALLED: ${format} ===`);
    console.log('Current state - Bold:', isBold, 'Italic:', isItalic, 'Underline:', isUnderline, 'Strikethrough:', isStrikethrough);
    
    const editor = getCurrentEditor();
    console.log('Editor from getCurrentEditor():', editor);
    
    if (editor) {
      console.log(`✅ Editor found! Formatting text: ${format}`);
      
      try {
        editor.update(() => {
        const selection = $getSelection();
        console.log('Selection:', selection);
        
        if ($isRangeSelection(selection)) {
          console.log('Is range selection:', true);
          console.log('Is collapsed:', selection.isCollapsed());
          
          if (!selection.isCollapsed()) {
            // Apply formatting to selected text
            const hasFormat = selection.hasFormat(format);
            console.log(`Has format ${format}:`, hasFormat);
            
            selection.formatText(format);
            console.log(`${format} formatting ${!hasFormat ? 'applied' : 'removed'} to selection`);
            
            // Update the formatting state
            switch (format) {
              case 'bold':
                setIsBold(!hasFormat);
                console.log('Setting bold to:', !hasFormat);
                break;
              case 'italic':
                setIsItalic(!hasFormat);
                console.log('Setting italic to:', !hasFormat);
                break;
              case 'underline':
                setIsUnderline(!hasFormat);
                console.log('Setting underline to:', !hasFormat);
                break;
              case 'strikethrough':
                setIsStrikethrough(!hasFormat);
                console.log('Setting strikethrough to:', !hasFormat);
                break;
            }
          } else {
            // No selection - apply formatting to current position
            console.log('No selection, applying to current position');
              selection.formatText(format);
            console.log(`${format} formatting applied to current position`);
              
              // Update the formatting state
              switch (format) {
                case 'bold':
                  setIsBold(true);
                console.log('Setting bold to: true');
                  break;
                case 'italic':
                  setIsItalic(true);
                console.log('Setting italic to: true');
                  break;
                case 'underline':
                  setIsUnderline(true);
                console.log('Setting underline to: true');
                  break;
                case 'strikethrough':
                  setIsStrikethrough(true);
                console.log('Setting strikethrough to: true');
                  break;
            }
          }
        } else {
          console.log('❌ Not a range selection');
        }
      });
      
      // Force refresh formatting state after a short delay
      setTimeout(() => {
        console.log('Checking current formatting...');
        checkCurrentFormatting();
      }, 100);
      } catch (error) {
        console.error('❌ Error in formatText:', error);
      }
    } else {
      console.log('❌ No editor found for text formatting');
    }
  };

  // Force refresh formatting state - useful when editor state changes
  const forceRefreshFormatting = () => {
    console.log('TopToolbar: Force refreshing formatting state');
    setTimeout(() => {
      checkCurrentFormatting();
    }, 200);
  };

  // Ensure editor has a valid selection - useful for empty editors
  const ensureValidSelection = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if (!selection || !$isRangeSelection(selection)) {
          console.log('TopToolbar: No valid selection found, creating one');
          // Try to create a selection at the beginning of the editor
          try {
            const rootElement = editor.getRootElement();
            if (rootElement) {
              // Create a text node if editor is empty
              if (!rootElement.textContent || rootElement.textContent.trim().length === 0) {
                const textNode = $createTextNode(' ');
                // Apply current formatting state to the new text node
                if (isBold) textNode.setFormat('bold');
                if (isItalic) textNode.setFormat('italic');
                if (isUnderline) textNode.setFormat('underline');
                if (isStrikethrough) textNode.setFormat('strikethrough');
                rootElement.appendChild(textNode);
                console.log('TopToolbar: Created placeholder text node with current formatting');
              }
            }
          } catch (error) {
            console.error('TopToolbar: Error ensuring valid selection:', error);
          }
        }
      });
    }
  };

  // Format element alignment
  const formatElement = (format: ElementFormatType) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Get the current selection range
          const anchor = selection.anchor;
          const focus = selection.focus;
          
          if (!selection.isCollapsed()) {
            // Apply alignment to the selected text by wrapping it in a paragraph with the desired alignment
            const nodes = selection.getNodes();
            const textContent = selection.getTextContent();
            
            // Create a new paragraph element with the desired alignment
            const paragraph = $createParagraphNode();
            paragraph.setFormat(format);
            
            // Insert the paragraph at the start of selection
            selection.insertNodes([paragraph]);
            
                         // Move the selection inside the paragraph and restore the text
             const newSelection = $getSelection();
             if ($isRangeSelection(newSelection)) {
               // Find the paragraph we just created
               const insertedNodes = newSelection.getNodes();
               const paragraphNode = insertedNodes.find(node => node.getType() === 'paragraph');
               
               if (paragraphNode) {
                 // Create a text node with the original content
                 const textNode = $createTextNode(textContent);
                 // Use insertNodes to add the text node to the paragraph
                 paragraphNode.insertAfter(textNode);
                 
                 // Select the text content
                 textNode.select();
               }
             }
          } else {
            // No selection - apply alignment to the current paragraph
            const anchorNode = anchor.getNode();
            const parentElement = anchorNode.getParent();
            
            if (parentElement && parentElement.getType() === 'paragraph') {
              parentElement.setFormat(format);
            } else {
              // If no paragraph parent, create one with the desired alignment
              const paragraph = $createParagraphNode();
              paragraph.setFormat(format);
              
              // Insert the paragraph at the current position
              selection.insertNodes([paragraph]);
            }
          }
        } else {
          // Fallback to command-based formatting
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
        }
      });
    }
  };

  // Insert heading function
  const insertHeading = (level: 1 | 2 | 3) => {
    console.log(`📝 Inserting heading level ${level}`);
    
    const editor = getCurrentEditor();
    if (editor) {
      try {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const textContent = selection.getTextContent();
            
            // Create heading text
            const headingText = textContent || `Heading ${level}`;
            
            // Create a paragraph with heading styling
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(headingText);
            
            // Apply heading styles using CSS
            const fontSize = level === 1 ? '32px' : level === 2 ? '24px' : '20px';
            const fontWeight = level === 1 ? '700' : '600';
            const color = level === 1 ? '#111827' : level === 2 ? '#1f2937' : '#374151';
            
            // Use CSS styling approach
            const style = `font-size: ${fontSize}; font-weight: ${fontWeight}; color: ${color}; margin: 0; padding: 0;`;
            (textNode as any).setStyle(style);
            paragraph.append(textNode);
            
            // Insert the heading
            if (selection.isCollapsed()) {
              selection.insertNodes([paragraph]);
            } else {
              selection.insertNodes([paragraph]);
            }
            
            setCurrentHeadingStyle(`h${level}`);
            console.log(`✅ Heading ${level} inserted successfully`);
          }
        });
      } catch (error) {
        console.error('❌ Error inserting heading:', error);
      }
    } else {
      console.log('❌ No editor found for heading insertion');
    }
  };

  // Insert list function
  const insertList = (type: 'ul' | 'ol') => {
    console.log(`📝 Inserting ${type} list`);
    
    const editor = getCurrentEditor();
    if (editor) {
      try {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const textContent = selection.getTextContent();
            
            // Create a paragraph with list styling
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(`${type === 'ul' ? '•' : '1.'} ${textContent || 'List item'}`);
            
            // Apply list styling
            const style = `margin: 0; padding: 0; list-style: none;`;
            (textNode as any).setStyle(style);
            paragraph.append(textNode);
            
            // Insert the list item
            if (selection.isCollapsed()) {
              selection.insertNodes([paragraph]);
            } else {
              selection.insertNodes([paragraph]);
            }
            
            setCurrentListStyle(type === 'ul' ? 'bullet' : 'numbered');
            console.log(`✅ ${type} list item inserted successfully`);
          }
        });
      } catch (error) {
        console.error('❌ Error inserting list:', error);
      }
    } else {
      console.log('❌ No editor found for list insertion');
    }
  };

  // Apply line spacing - Enhanced implementation
  const applyLineSpacing = (spacing: number) => {
    console.log(`📏 Applying line spacing: ${spacing}`);
    
    const editor = getCurrentEditor();
    if (editor) {
      try {
        // Method 1: Apply to editor root element via CSS custom property
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.style.setProperty('--line-spacing', spacing.toString());
          rootElement.setAttribute('data-line-spacing', spacing.toString());
          console.log(`📏 Set CSS custom property --line-spacing: ${spacing}`);
        }

        // Method 2: Apply to selected text via editor update
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (!selection.isCollapsed()) {
              // Apply to selected text by creating new paragraph with spacing
              const selectedText = selection.getTextContent();
              const paragraph = $createParagraphNode();
              const textNode = $createTextNode(selectedText);
              paragraph.append(textNode);
              
              // Apply line spacing using CSS style
              const style = `line-height: ${spacing}; margin: 0; padding: 0;`;
              (paragraph as any).setStyle(style);
              
              // Replace selection with new paragraph
              selection.insertNodes([paragraph]);
              console.log(`📏 Applied line-height: ${spacing} to selected text`);
            } else {
              // Apply to current paragraph
              const anchorNode = selection.anchor.getNode();
              const parentElement = anchorNode.getParent();
              if (parentElement && parentElement.getType() === 'paragraph') {
                const style = `line-height: ${spacing}; margin: 0; padding: 0;`;
                (parentElement as any).setStyle(style);
                console.log(`📏 Applied line-height: ${spacing} to current paragraph`);
              } else {
                // Create new paragraph with spacing if no parent paragraph
                const paragraph = $createParagraphNode();
                const textNode = $createTextNode(' ');
                paragraph.append(textNode);
                
                const style = `line-height: ${spacing}; margin: 0; padding: 0;`;
                (paragraph as any).setStyle(style);
                
                selection.insertNodes([paragraph]);
                console.log(`📏 Created new paragraph with line-height: ${spacing}`);
              }
            }
            setCurrentLineSpacing(spacing);
            console.log(`✅ Line spacing ${spacing} applied successfully`);
          }
        });

        // Method 3: Inject CSS to ensure line spacing works globally
        const styleId = 'lexical-line-spacing';
        let existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Override global CSS line-height */
          .lexical-editor [contenteditable="true"] {
            line-height: ${spacing} !important;
          }
          .lexical-editor [data-lexical-editor="true"] {
            line-height: ${spacing} !important;
          }
          .lexical-editor p {
            line-height: ${spacing} !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .lexical-editor span {
            line-height: ${spacing} !important;
          }
          .lexical-editor div {
            line-height: ${spacing} !important;
          }
          .lexical-editor [data-lexical-text="true"] {
            line-height: ${spacing} !important;
          }
          /* Force line-height on all elements */
          .lexical-editor * {
            line-height: ${spacing} !important;
          }
          /* Specific override for contenteditable */
          .lexical-editor [contenteditable="true"],
          .lexical-editor [contenteditable="true"] * {
            line-height: ${spacing} !important;
          }
        `;
        document.head.appendChild(style);
        console.log(`📏 Injected CSS for line-height: ${spacing}`);

        // Method 4: Apply to all existing paragraphs
        editor.update(() => {
          const root = $getRoot();
          const allNodes = root.getChildren();
          
          allNodes.forEach((node) => {
            if (node.getType() === 'paragraph') {
              const currentStyle = (node as any).getStyle() || '';
              const styleWithoutLineHeight = currentStyle.replace(/line-height:\s*[^;]+;?/g, '');
              const newStyle = styleWithoutLineHeight ? `${styleWithoutLineHeight}; line-height: ${spacing}` : `line-height: ${spacing}`;
              (node as any).setStyle(newStyle.replace(/^;\s*/, ''));
            }
          });
          console.log(`📏 Applied line-height: ${spacing} to all existing paragraphs`);
        });

      } catch (error) {
        console.error('❌ Error applying line spacing:', error);
      }
    } else {
      console.log('❌ No editor found for line spacing');
      }
    };

    // Reset line spacing to default
    const resetLineSpacing = () => {
      console.log('📏 Resetting line spacing to default');
      
      const editor = getCurrentEditor();
      if (editor) {
        try {
          // Remove injected CSS
          const styleId = 'lexical-line-spacing';
          const existingStyle = document.getElementById(styleId);
          if (existingStyle) {
            existingStyle.remove();
            console.log('📏 Removed injected CSS');
          }

          // Reset to default spacing
          setCurrentLineSpacing(1.5);
          
          // Remove data attribute from root element
          const rootElement = editor.getRootElement();
          if (rootElement) {
            rootElement.removeAttribute('data-line-spacing');
            rootElement.style.removeProperty('--line-spacing');
          }
          
          console.log('📏 Reset line spacing to 1.5');
        } catch (error) {
          console.error('❌ Error resetting line spacing:', error);
        }
      } else {
        console.log('❌ No editor found for line spacing reset');
    }
  };

     // Handle text color change
   const handleColorChange = (color: string) => {
    console.log(`🎨 TopToolbar: Text color changed to ${color}`);
    
    const editor = getCurrentEditor();
    if (editor) {
        try {
          // Update global color state first
          if (typeof window !== 'undefined') {
            localStorage.setItem('currentTextColor', color);
          }
          
          // Update cursor color immediately
          const contentEditables = document.querySelectorAll('[contenteditable="true"]');
          contentEditables.forEach((element) => {
            if (element instanceof HTMLElement) {
              element.style.caretColor = color;
              element.style.setProperty('--cursor-color', color, 'important');
            }
          });
          
          // Apply color to selected text if any
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
              console.log(`🎨 Color applied to selected text: ${color}`);
            }
          });
      
      // Update component state
      setTextColor(color);
      setCurrentTextColor(color);
          
          // Update global color state in SimpleFormatPlugin
          updateGlobalColor(color);
      
      console.log(`🎨 TopToolbar: Color ${color} applied successfully`);
        } catch (error) {
          console.error('🎨 TopToolbar: Error applying color:', error);
       }
    } else {
      console.log('🎨 TopToolbar: No editor found for color change');
    }
  };

   // Apply text color to selection
   const applyTextColor = (color: string) => {
     handleColorChange(color);
   };

  // Enhanced font handling with state
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [fontSearchTerm, setFontSearchTerm] = useState('');
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Comprehensive font list with categories
  const fontCategories = {
    popular: [
      'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Ubuntu'
    ],
    system: [
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New'
    ],
    modern: [
      'DM Sans', 'Outfit', 'Plus Jakarta Sans', 'Albert Sans', 'Onest', 'Geist', 'Cabinet Grotesk', 'General Sans'
    ],
    serif: [
      'Playfair Display', 'Merriweather', 'Libre Baskerville', 'Crimson Text', 'Lora', 'Source Serif Pro', 'Abril Fatface', 'Bodoni Moda'
    ],
    display: [
      'Bebas Neue', 'Pacifico', 'Garamond', 'Baskerville', 'Palatino', 'Optima', 'Futura', 'Gill Sans'
    ],
    monospace: [
      'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Consolas', 'Menlo', 'SF Mono', 'Inconsolata'
    ],
    handwriting: [
      'Caveat', 'Dancing Script', 'Great Vibes', 'Satisfy', 'Kaushan Script', 'Allura', 'Alex Brush', 'Tangerine'
    ],
    premium: [
      'Nunito', 'Work Sans', 'Raleway', 'Quicksand', 'Comfortaa', 'Josefin Sans', 'Myriad Pro', 'Segoe UI'
    ]
  };

  // All fonts flattened
  const allFonts = Object.values(fontCategories).flat();

  // Filter fonts based on search
  useEffect(() => {
    if (fontSearchTerm.trim() === '') {
      setFilteredFonts(allFonts);
    } else {
      const filtered = allFonts.filter(font => 
        font.toLowerCase().includes(fontSearchTerm.toLowerCase())
      );
      setFilteredFonts(filtered);
    }
  }, [fontSearchTerm, allFonts]);

  // Initialize font from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFont = localStorage.getItem('currentFont');
      const savedFontSize = localStorage.getItem('currentFontSize');
      
      if (savedFont) {
        setSelectedFont(savedFont);
        console.log('🎨 Loaded saved font:', savedFont);
      }
      
      if (savedFontSize) {
        setFontSize(savedFontSize);
        console.log('🎨 Loaded saved font size:', savedFontSize);
      }
    }
  }, []);

  // Handle font change - Enhanced implementation
  const handleFontChange = (font: string) => {
    console.log(`🎨 TopToolbar: Font changed to ${font}`);
    setSelectedFont(font);
    setShowFontDropdown(false);
    setFontSearchTerm('');
    
    // Store font preference immediately
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentFont', font);
    }
    
    // Apply font to selection or set as default
    const editor = getCurrentEditor();
    if (editor) {
      try {
        // Method 1: Apply to selected text or current position
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (!selection.isCollapsed()) {
              // Apply to selected text
              const nodes = selection.getNodes();
              nodes.forEach((node) => {
                if ($isTextNode(node)) {
                  const currentStyle = node.getStyle() || '';
                  const styleWithoutFontFamily = currentStyle.replace(/font-family:\s*[^;]+;?/g, '');
                  const newStyle = styleWithoutFontFamily ? `${styleWithoutFontFamily}; font-family: "${font}", sans-serif` : `font-family: "${font}", sans-serif`;
                  node.setStyle(newStyle.replace(/^;\s*/, ''));
                }
              });
              console.log(`🎨 Applied font-family: ${font} to selected text`);
            } else {
              // Apply to current cursor position for new text
              const anchorNode = selection.anchor.getNode();
              if ($isTextNode(anchorNode)) {
                const currentStyle = anchorNode.getStyle() || '';
                const styleWithoutFontFamily = currentStyle.replace(/font-family:\s*[^;]+;?/g, '');
                const newStyle = styleWithoutFontFamily ? `${styleWithoutFontFamily}; font-family: "${font}", sans-serif` : `font-family: "${font}", sans-serif`;
                anchorNode.setStyle(newStyle.replace(/^;\s*/, ''));
                console.log(`🎨 Applied font-family: ${font} to current text node`);
              }
            }
          }
        });

        // Method 2: Use the simple font formatting function
        applySimpleFont(editor, font);
        
        // Method 3: Update CSS custom property for global font
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.style.setProperty('--current-font-family', `"${font}", sans-serif`);
          rootElement.setAttribute('data-font-family', font);
        }

        // Method 4: Inject CSS to ensure font works globally
        const styleId = 'lexical-font-family';
        let existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .lexical-editor[data-font-family="${font}"] [contenteditable="true"] {
            font-family: "${font}", sans-serif !important;
          }
          .lexical-editor[data-font-family="${font}"] p {
            font-family: "${font}", sans-serif !important;
          }
          .lexical-editor[data-font-family="${font}"] span {
            font-family: "${font}", sans-serif !important;
          }
          .lexical-editor[data-font-family="${font}"] div {
            font-family: "${font}", sans-serif !important;
          }
        `;
        document.head.appendChild(style);
        
      // Store the font preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('defaultFont', font);
      }
      
        console.log(`🎨 TopToolbar: Font ${font} applied successfully`);
      } catch (error) {
        console.error('❌ Error applying font:', error);
      }
    } else {
      console.log('❌ No editor found for font change');
    }
  };



  // Handle font size change - Enhanced implementation
  const handleFontSizeChange = (size: string) => {
    const newSize = parseInt(size);
    if (isNaN(newSize) || newSize < 8 || newSize > 72) return;
    
    setFontSize(size);
    
    // Store the font size preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('defaultFontSize', size);
    }
    
    const editor = getCurrentEditor();
    if (editor) {
      try {
        // Method 1: Apply to selected text or current position
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            if (!selection.isCollapsed()) {
              // Apply to selected text
              const nodes = selection.getNodes();
              nodes.forEach((node) => {
                if ($isTextNode(node)) {
                  const currentStyle = node.getStyle() || '';
                  const styleWithoutFontSize = currentStyle.replace(/font-size:\s*[^;]+;?/g, '');
                  const newStyle = styleWithoutFontSize ? `${styleWithoutFontSize}; font-size: ${size}px` : `font-size: ${size}px`;
                  node.setStyle(newStyle.replace(/^;\s*/, ''));
                }
              });
              console.log(`📝 Applied font-size: ${size}px to selected text`);
            } else {
              // Apply to current cursor position for new text
              const anchorNode = selection.anchor.getNode();
              if ($isTextNode(anchorNode)) {
                const currentStyle = anchorNode.getStyle() || '';
                const styleWithoutFontSize = currentStyle.replace(/font-size:\s*[^;]+;?/g, '');
                const newStyle = styleWithoutFontSize ? `${styleWithoutFontSize}; font-size: ${size}px` : `font-size: ${size}px`;
                anchorNode.setStyle(newStyle.replace(/^;\s*/, ''));
                console.log(`📝 Applied font-size: ${size}px to current text node`);
              }
            }
          }
        });

        // Method 2: Use the simple font size formatting function
              applySimpleFontSize(editor, size);
        
        // Method 3: Update CSS custom property for global font size
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.style.setProperty('--current-font-size', size + 'px');
          rootElement.setAttribute('data-font-size', size);
        }

        // Method 4: Inject CSS to ensure font size works globally
        const styleId = 'lexical-font-size';
        let existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .lexical-editor[data-font-size="${size}"] [contenteditable="true"] {
            font-size: ${size}px !important;
          }
          .lexical-editor[data-font-size="${size}"] p {
            font-size: ${size}px !important;
          }
          .lexical-editor[data-font-size="${size}"] span {
            font-size: ${size}px !important;
          }
          .lexical-editor[data-font-size="${size}"] div {
            font-size: ${size}px !important;
          }
        `;
        document.head.appendChild(style);
        
        console.log(`📝 TopToolbar: Font size ${size}px applied successfully`);
      } catch (error) {
        console.error('❌ Error applying font size:', error);
      }
    } else {
      console.log('❌ No editor found for font size change');
    }
  };

  // Increase font size - Enhanced
  const increaseFontSize = () => {
    const currentSize = parseInt(fontSize);
    const newSize = Math.min(currentSize + 1, 72);
    
    if (newSize !== currentSize) {
    handleFontSizeChange(newSize.toString());
      console.log(`📝 Font size increased from ${currentSize}px to ${newSize}px`);
      
      // Visual feedback
      const button = document.querySelector('[title="Increase Font Size"]');
      if (button) {
        button.classList.add('bg-green-100', 'dark:bg-green-900/20');
        setTimeout(() => {
          button.classList.remove('bg-green-100', 'dark:bg-green-900/20');
        }, 200);
      }
    } else {
      console.log('📝 Font size already at maximum (72px)');
    }
  };

  // Decrease font size - Enhanced
  const decreaseFontSize = () => {
    const currentSize = parseInt(fontSize);
    const newSize = Math.max(currentSize - 1, 8);
    
    if (newSize !== currentSize) {
    handleFontSizeChange(newSize.toString());
      console.log(`📝 Font size decreased from ${currentSize}px to ${newSize}px`);
      
      // Visual feedback
      const button = document.querySelector('[title="Decrease Font Size"]');
      if (button) {
        button.classList.add('bg-green-100', 'dark:bg-green-900/20');
        setTimeout(() => {
          button.classList.remove('bg-green-100', 'dark:bg-green-900/20');
        }, 200);
      }
    } else {
      console.log('📝 Font size already at minimum (8px)');
    }
  };

  // Reset font to default
  const resetFont = () => {
    console.log('🎨 Resetting font to default');
    
    const editor = getCurrentEditor();
    if (editor) {
      try {
        // Remove injected CSS
        const styleId = 'lexical-font-family';
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
          console.log('🎨 Removed injected font CSS');
        }

        // Reset to default font
        setSelectedFont('Inter');
        
        // Remove data attribute from root element
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.removeAttribute('data-font-family');
          rootElement.style.removeProperty('--current-font-family');
        }
        
        console.log('🎨 Reset font to Inter');
      } catch (error) {
        console.error('❌ Error resetting font:', error);
      }
    } else {
      console.log('❌ No editor found for font reset');
    }
  };

  // Reset font size to default
  const resetFontSize = () => {
    console.log('📝 Resetting font size to default');
    
    const editor = getCurrentEditor();
    if (editor) {
      try {
        // Remove injected CSS
        const styleId = 'lexical-font-size';
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
          console.log('📝 Removed injected font size CSS');
        }

        // Reset to default size
        setFontSize('16');
        
        // Remove data attribute from root element
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.removeAttribute('data-font-size');
          rootElement.style.removeProperty('--current-font-size');
        }
        
        console.log('📝 Reset font size to 16px');
      } catch (error) {
        console.error('❌ Error resetting font size:', error);
      }
    } else {
      console.log('❌ No editor found for font size reset');
    }
  };

  // Clear formatting
  const clearFormatting = () => {
    const editor = getCurrentEditor();
    if (editor) {
      // Use the enhanced clear formatting function
      import('./CustomFormatPlugin').then(({ clearAllFormatting }) => {
        clearAllFormatting(editor);
      });
      
      // Reset all formatting states
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsStrikethrough(false);
      setCurrentTextColor('#000000');
      setTextColor('#000000');
      setSelectedFont('Inter'); // Reset font to default
      setFontSize('16'); // Reset font size to default (more standard)
      
      // Reset font size specifically
      resetFontSize();
      
      console.log('TopToolbar: All formatting cleared successfully');
    }
  };

  // Apply selected font to new text being typed
  const applyFontToNewText = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Set the font format for new text at the current cursor position
          try {
            // Note: font-family formatting is handled differently in Lexical
            // For now, we'll skip font family application to prevent errors
            console.log(`TopToolbar: Font ${selectedFont} would be set for new text`);
          } catch (error) {
            console.error('Error setting font for new text:', error);
          }
        }
      });
    }
  };

  // Apply selected font size to new text being typed
  const applyFontSizeToNewText = () => {
    const editor = getCurrentEditor();
    if (editor) {
      // Update the CSS custom property for the editor
      const rootElement = editor.getRootElement();
      if (rootElement) {
        rootElement.style.setProperty('--current-font-size', fontSize + 'px');
      }
      
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Set the font size format for new text at the current cursor position
          try {
            // Store the font size preference for new text
            if (typeof window !== 'undefined') {
              localStorage.setItem('defaultFontSize', fontSize);
            }
            console.log(`TopToolbar: Font size ${fontSize}px set for new text`);
          } catch (error) {
            console.error('Error setting font size for new text:', error);
          }
        }
      });
    }
  };



  // Simplified formatting application - removed problematic listener to prevent crashes

  // Close dropdowns when clicking outside - Enhanced
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside font dropdown
      const isOutsideFontDropdown = !target.closest('.font-dropdown-container');
      
      if (isOutsideFontDropdown) {
        setShowFontDropdown(false);
        setFontSearchTerm('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFontDropdown(false);
        setFontSearchTerm('');
        setShowHighlightDropdown(false);
        setShowReferenceDropdown(false);
        setShowLineSpacingDropdown(false);
        // Also stop voice recognition on Escape
        if (isListening) {
          stopVoiceRecognition();
        }
      }
      
      // Font dropdown keyboard navigation
      if (showFontDropdown) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const fontButtons = document.querySelectorAll('.font-dropdown-container button[style*="font-family"]');
          const currentFocus = document.activeElement;
          const currentIndex = Array.from(fontButtons).indexOf(currentFocus as Element);
          
          if (event.key === 'ArrowDown') {
            const nextIndex = (currentIndex + 1) % fontButtons.length;
            (fontButtons[nextIndex] as HTMLElement)?.focus();
          } else if (event.key === 'ArrowUp') {
            const prevIndex = currentIndex <= 0 ? fontButtons.length - 1 : currentIndex - 1;
            (fontButtons[prevIndex] as HTMLElement)?.focus();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening, showFontDropdown]);

  // Close voice input status when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside voice input section
      const isOutsideVoiceInput = !target.closest('.voice-input-section');
      
      if (isOutsideVoiceInput && isListening) {
        // Don't stop recognition, just hide the status panel
        // This allows users to continue speaking while the panel is hidden
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isListening]);

  // Removed heading/list insertion helpers

  // Voice input functions
  const ensureEditorFocus = () => {
    // Try to find and focus the editor
    const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]');
    if (editorElement) {
      (editorElement as HTMLElement).focus();
      console.log('Editor focused for voice input');
      return true;
    }
    
    // If no editor found, try to find any contenteditable element
    const anyEditor = document.querySelector('[contenteditable="true"]');
    if (anyEditor) {
      (anyEditor as HTMLElement).focus();
      console.log('Alternative editor focused for voice input');
      return true;
    }
    
    console.log('No editor found to focus');
    return false;
  };

  // Alternative text input method when speech recognition fails
  const showTextInputFallback = () => {
    const text = prompt('Speech recognition not available. Please type your text here:');
    if (text && text.trim()) {
      insertVoiceText(text.trim());
    }
  };

  const startVoiceRecognition = () => {
    // First ensure the editor is focused
    if (!ensureEditorFocus()) {
      alert('Please click in the text area first, then try voice input again.');
      return;
    }
    
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    // Try to start recognition with better error handling
    const startRecognition = () => {
      try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        // Add timeout for no speech detection
        let speechTimeout: NodeJS.Timeout;
        let errorCount = 0;
        const maxErrors = 3;
        
        const resetSpeechTimeout = () => {
          if (speechTimeout) clearTimeout(speechTimeout);
          speechTimeout = setTimeout(() => {
            if (isListening) {
              console.log('No speech detected for 10 seconds, stopping recognition');
              stopVoiceRecognition();
              alert('No speech detected. Voice recognition stopped. Please try again.');
            }
          }, 10000); // 10 seconds
        };
        
        const restartRecognition = () => {
          if (errorCount < maxErrors && isListening) {
            console.log(`Restarting speech recognition (attempt ${errorCount + 1}/${maxErrors})`);
            errorCount++;
            setTimeout(() => {
              try {
                recognition.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
                stopVoiceRecognition();
              }
            }, 1000);
          } else {
            console.log('Too many errors, stopping recognition');
            stopVoiceRecognition();
          }
        };
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
          console.log('Voice recognition started');
          resetSpeechTimeout();
          
          // Show user feedback
          const button = document.querySelector('.voice-input-section button');
          if (button) {
            button.classList.add('ring-2', 'ring-green-300', 'ring-offset-2');
          }
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
            console.log('Final transcript:', finalTranscript);
          insertVoiceText(finalTranscript);
          setTranscript('');
            resetSpeechTimeout(); // Reset timeout after successful recognition
            
            // Show success feedback
            const button = document.querySelector('.voice-input-section button');
            if (button) {
              button.classList.add('bg-green-200', 'dark:bg-green-700');
              setTimeout(() => {
                button.classList.remove('bg-green-200', 'dark:bg-green-700');
              }, 500);
            }
        } else {
          setTranscript(interimTranscript);
            resetSpeechTimeout(); // Reset timeout when interim results come in
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
          
          // Don't immediately stop on network errors - they're often false positives
          if (event.error === 'network') {
            console.log('Network error detected, but continuing recognition...');
            // Show a subtle notification instead of stopping
            const button = document.querySelector('.voice-input-section button');
            if (button) {
              button.classList.add('bg-yellow-100', 'dark:bg-yellow-800/30');
              setTimeout(() => {
                button.classList.remove('bg-yellow-100', 'dark:bg-yellow-800/30');
              }, 2000);
            }
            return;
          }
          
          // For recoverable errors, try to restart
          if (['aborted', 'no-speech'].includes(event.error)) {
            console.log(`Recoverable error: ${event.error}, continuing...`);
            return;
          }
          
          // For serious errors, stop and show message
        setIsListening(false);
          setTranscript('');
          
          // Show error feedback
          const button = document.querySelector('.voice-input-section button');
          if (button) {
            button.classList.remove('ring-2', 'ring-green-300', 'ring-offset-2');
            button.classList.add('bg-red-100', 'dark:bg-red-800/30');
            setTimeout(() => {
              button.classList.remove('bg-red-100', 'dark:bg-red-800/30');
            }, 1000);
          }
          
          // Show user-friendly error message with options
          if (event.error === 'not-allowed') {
            const choice = confirm('Microphone access denied. Would you like to try the text input alternative instead?');
            if (choice) {
              showTextInputFallback();
            }
          } else if (event.error === 'audio-capture') {
            const choice = confirm('Microphone not found. Would you like to try the text input alternative instead?');
            if (choice) {
              showTextInputFallback();
            }
          } else if (event.error === 'service-not-allowed') {
            const choice = confirm('Speech recognition service not allowed. Would you like to try the text input alternative instead?');
            if (choice) {
              showTextInputFallback();
            }
          } else {
            console.log('Speech recognition error:', event.error);
            // Only show alert for serious errors, not minor ones
            if (!['network', 'aborted', 'no-speech'].includes(event.error)) {
              const choice = confirm(`Voice recognition error: ${event.error}. Would you like to try the text input alternative instead?`);
              if (choice) {
                showTextInputFallback();
              }
            }
          }
      };
      
      recognition.onend = () => {
          console.log('Voice recognition ended');
        setIsListening(false);
          setTranscript('');
          
          // Clear speech timeout
          if (speechTimeout) {
            clearTimeout(speechTimeout);
          }
          
          // Remove visual feedback
          const button = document.querySelector('.voice-input-section button');
          if (button) {
            button.classList.remove('ring-2', 'ring-green-300', 'ring-offset-2');
          }
        };
        
        try {
      recognition.start();
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          setIsListening(false);
          alert('Failed to start voice recognition. Please try again.');
        }
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        alert('Failed to start voice recognition. Please try again.');
      }
    };
    
    startRecognition();
  };

  const stopVoiceRecognition = () => {
    setIsListening(false);
    setTranscript('');
    console.log('Voice recognition stopped manually');
  };

  const insertVoiceText = (text: string) => {
    if (!text || text.trim() === '') return;
    
    console.log('Inserting voice text:', text);
    
    // Try multiple methods to get the editor
    let editor = getCurrentEditor();
    
    // If no editor from registry, try to find it in the DOM
    if (!editor) {
      console.log('No editor from registry, trying DOM search...');
      const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]');
      if (editorElement) {
        // Try to get the editor from the DOM element
        const editorKey = Object.keys(editorElement).find(key => key.includes('__lexical'));
        if (editorKey) {
          editor = (editorElement as any)[editorKey];
          console.log('Found editor from DOM element');
        }
      }
    }
    
    if (!editor) {
      console.error('No editor found for voice text insertion');
      alert('Editor not found. Please click in the text area first and try again.');
      return;
    }
    
    console.log('Editor found, attempting to insert text...');
    
    // Method 1: Try using editor.update with proper selection
    try {
      editor.update(() => {
        const selection = $getSelection();
        console.log('Current selection:', selection);
        
        if ($isRangeSelection(selection)) {
          console.log('Valid range selection found, inserting text...');
          // Insert text at current cursor position
          const textNode = $createTextNode(text + ' ');
          selection.insertNodes([textNode]);
          
          // Move cursor to end of inserted text
          const newSelection = $createRangeSelection();
          newSelection.anchor.set(textNode.getKey(), text.length + 1, 'text');
          newSelection.focus.set(textNode.getKey(), text.length + 1, 'text');
          $setSelection(newSelection);
          
          console.log('Voice text inserted successfully via selection');
        } else {
          console.log('No valid selection, creating new content...');
          // If no selection, create one at the beginning
          const root = $getRoot();
          const textNode = $createTextNode(text + ' ');
          root.append(textNode);
          
          // Create selection at the end of inserted text
          const newSelection = $createRangeSelection();
          newSelection.anchor.set(textNode.getKey(), text.length + 1, 'text');
          newSelection.focus.set(textNode.getKey(), text.length + 1, 'text');
          $setSelection(newSelection);
          
          console.log('Voice text inserted at root level');
        }
      });
      
      console.log('Text insertion completed successfully');
      
      // Force editor to focus after insertion
      setTimeout(() => {
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.focus();
          console.log('Editor focused after text insertion');
        }
      }, 100);
      
    } catch (error) {
      console.error('Error inserting voice text via editor.update:', error);
      
      // Method 2: Try using insertText command directly
      try {
        console.log('Trying insertText command...');
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(text + ' ');
            console.log('Text inserted via insertText command');
          }
        });
      } catch (insertTextError) {
        console.error('insertText command failed:', insertTextError);
        
        // Method 3: Try to create new content from scratch
        try {
          console.log('Trying to create new content from scratch...');
          editor.update(() => {
            const root = $getRoot();
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(text + ' ');
            paragraph.append(textNode);
            root.append(paragraph);
            
            // Set selection to the new text
            const newSelection = $createRangeSelection();
            newSelection.anchor.set(textNode.getKey(), text.length + 1, 'text');
            newSelection.focus.set(textNode.getKey(), text.length + 1, 'text');
            $setSelection(newSelection);
            
            console.log('New content created successfully');
          });
        } catch (createError) {
          console.error('Creating new content failed:', createError);
          
          // Method 4: Last resort - try to insert via DOM manipulation
          try {
            console.log('Trying DOM manipulation as last resort...');
            const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]');
            if (editorElement) {
              // Insert text at cursor position
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode(text + ' ');
                range.insertNode(textNode);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                console.log('Text inserted via DOM manipulation');
              } else {
                // No selection, append to end using Lexical methods instead of direct DOM manipulation
                try {
                  const root = $getRoot();
                  const lastChild = root.getLastChild();
                  if (lastChild && lastChild.getType() === 'paragraph') {
                    const textNode = $createTextNode(text + ' ');
                    lastChild.append(textNode);
                    textNode.select();
                  } else {
                    const paragraph = $createParagraphNode();
                    const textNode = $createTextNode(text + ' ');
                    paragraph.append(textNode);
                    root.append(paragraph);
                    textNode.select();
                  }
                  console.log('Text appended using Lexical methods');
                } catch (lexicalError) {
                  console.error('Lexical insertion failed:', lexicalError);
                  // Fallback: try to use editor commands
                  try {
                    editor.dispatchCommand(INSERT_TEXT_COMMAND, text + ' ');
                    console.log('Text inserted via editor command');
                  } catch (commandError) {
                    console.error('Editor command failed:', commandError);
                    alert('Failed to insert voice text. Please try typing manually or refresh the page.');
                  }
                }
              }
            }
          } catch (domError) {
            console.error('All insertion methods failed:', domError);
            alert('Failed to insert voice text. Please try typing manually or refresh the page.');
          }
        }
      }
    }
  };

  // Enhanced Find & Replace functions
  const findAllMatches = () => {
    if (!findText) {
      setFindResults(0);
      setFindStatus('');
      return;
    }

    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        
        let searchText = findText;
        let contentText = textContent;
        
        // Apply case sensitivity
        if (!caseSensitive) {
          searchText = searchText.toLowerCase();
          contentText = contentText.toLowerCase();
        }
        
        // Apply whole word matching
        if (wholeWord) {
          const wordBoundaryRegex = new RegExp(`\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
          const matches = contentText.match(wordBoundaryRegex);
          setFindResults(matches ? matches.length : 0);
        } else {
          const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
          const matches = contentText.match(regex);
          setFindResults(matches ? matches.length : 0);
        }
        
        if (findResults > 0) {
          setFindStatus(`Found ${findResults} match${findResults > 1 ? 'es' : ''}`);
        } else {
          setFindStatus('No matches found');
        }
      });
    }
  };

  const findNext = () => {
    if (!findText) return;
    
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const root = $getRoot();
          const textContent = root.getTextContent();
          const currentIndex = selection.anchor.offset;
          
          let searchText = findText;
          let contentText = textContent;
          
          // Apply case sensitivity
          if (!caseSensitive) {
            searchText = searchText.toLowerCase();
            contentText = contentText.toLowerCase();
          }
          
          let nextIndex = -1;
          
          if (wholeWord) {
            // Find next whole word match
            const wordBoundaryRegex = new RegExp(`\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
            let match;
            while ((match = wordBoundaryRegex.exec(contentText)) !== null) {
              if (match.index > currentIndex) {
                nextIndex = match.index;
                break;
              }
            }
          } else {
            // Find next simple match
            nextIndex = contentText.indexOf(searchText, currentIndex + 1);
          }
          
          if (nextIndex !== -1) {
            const newSelection = $createRangeSelection();
            newSelection.anchor.set('root', nextIndex, 'text');
            newSelection.focus.set('root', nextIndex + findText.length, 'text');
            $setSelection(newSelection);
            
            // Update status
            const matchNumber = Math.floor((nextIndex / textContent.length) * findResults) + 1;
            setFindStatus(`Match ${matchNumber} of ${findResults}`);
            setCurrentFindIndex(matchNumber);
            
            // Scroll to the found text
            const editorElement = editor.getRootElement();
            if (editorElement) {
              const textNodes = editorElement.querySelectorAll('[data-lexical-text="true"]');
              if (textNodes.length > 0) {
                const targetNode = textNodes[0] as HTMLElement;
                targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          } else {
            setFindStatus('No more matches found');
          }
        }
      });
    }
  };

  const findPrevious = () => {
    if (!findText) return;
    
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const root = $getRoot();
          const textContent = root.getTextContent();
          const currentIndex = selection.anchor.offset;
          
          let searchText = findText;
          let contentText = textContent;
          
          // Apply case sensitivity
          if (!caseSensitive) {
            searchText = searchText.toLowerCase();
            contentText = contentText.toLowerCase();
          }
          
          let lastIndex = -1;
          
          if (wholeWord) {
            // Find previous whole word match
            const wordBoundaryRegex = new RegExp(`\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
            let match;
            const matches = [];
            while ((match = wordBoundaryRegex.exec(contentText)) !== null) {
              matches.push(match.index);
            }
            
            for (let i = matches.length - 1; i >= 0; i--) {
              if (matches[i] < currentIndex) {
                lastIndex = matches[i];
                break;
              }
            }
          } else {
            // Find previous simple match
            let searchIndex = 0;
            while (true) {
              const index = contentText.indexOf(searchText, searchIndex);
              if (index === -1 || index >= currentIndex) break;
              lastIndex = index;
              searchIndex = index + 1;
            }
          }
          
          if (lastIndex !== -1) {
            const newSelection = $createRangeSelection();
            newSelection.anchor.set('root', lastIndex, 'text');
            newSelection.focus.set('root', lastIndex + findText.length, 'text');
            $setSelection(newSelection);
            setFindStatus(`Match ${currentFindIndex - 1 > 0 ? currentFindIndex - 1 : findResults} of ${findResults}`);
            setCurrentFindIndex(prev => prev > 1 ? prev - 1 : findResults);
          } else {
            setFindStatus('No more matches found');
          }
        }
      });
    }
  };

  const replaceCurrent = () => {
    if (!findText || !replaceText) return;
    
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const selectedText = selection.getTextContent();
          
          // Check if selected text matches the search criteria
          let isMatch = false;
          if (caseSensitive) {
            isMatch = selectedText === findText;
          } else {
            isMatch = selectedText.toLowerCase() === findText.toLowerCase();
          }
          
          if (wholeWord) {
            const wordBoundaryRegex = new RegExp(`\\b${findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
            isMatch = wordBoundaryRegex.test(selectedText);
          }
          
          if (isMatch) {
            try {
              // Method 1: Try direct text replacement
              selection.removeText();
              selection.insertText(replaceText);
              setFindStatus('Replaced current match');
              findAllMatches(); // Update results count
            } catch (error) {
              console.error('Replace error:', error);
              setFindStatus('Error during replace');
            }
          } else {
            setFindStatus('No match at current selection');
          }
        } else {
          setFindStatus('No text selected');
        }
      });
    }
  };

  const replaceAll = () => {
    if (!findText || !replaceText) return;
    
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const root = $getRoot();
        const textContent = root.getTextContent();
        
        let searchText = findText;
        let replacementText = replaceText;
        
        let regex;
        if (wholeWord) {
          regex = new RegExp(`\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi');
        } else {
          regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
        }
        
        // Find all matches and replace them one by one to preserve formatting
        let match;
        let replacedCount = 0;
        
        // Create a temporary array to store all matches with their positions
        const matches = [];
        while ((match = regex.exec(textContent)) !== null) {
          matches.push({
            index: match.index,
            length: match[0].length,
            text: match[0]
          });
        }
        
        // Replace matches in reverse order to maintain correct indices
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i];
          const selection = $createRangeSelection();
          selection.anchor.set('root', match.index, 'text');
          selection.focus.set('root', match.index + match.length, 'text');
          $setSelection(selection);
          
          // Clear the selection and insert the replacement text
          selection.removeText();
          selection.insertText(replacementText);
          replacedCount++;
        }
        
        setFindStatus(`Replaced ${replacedCount} match${replacedCount > 1 ? 'es' : ''}`);
        setFindResults(0);
        setCurrentFindIndex(0);
      });
    }
  };

  // Update find results when search text changes
  useEffect(() => {
    if (findText) {
      findAllMatches();
    } else {
      setFindResults(0);
      setFindStatus('');
      setCurrentFindIndex(0);
    }
  }, [findText, caseSensitive, wholeWord]);

  // Close find/replace dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside find/replace section
      const isOutsideFindReplace = !target.closest('.find-replace-section');
      
      if (isOutsideFindReplace && showFindReplace) {
        setShowFindReplace(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFindReplace]);

  // Highlight functions
  const applyHighlight = (color: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Apply background color using CSS
          const rootElement = editor.getRootElement();
          if (rootElement) {
            const style = document.createElement('style');
            style.textContent = `
              .highlight-${color.replace('#', '')} {
                background-color: ${color} !important;
              }
            `;
            document.head.appendChild(style);
            
            // Apply the highlight class to selected text
            const textNode = $createTextNode(selection.getTextContent());
            textNode.setFormat('highlight');
            selection.insertNodes([textNode]);
          }
        }
      });
    }
    setCurrentHighlight(color);
  };

  const removeHighlight = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Remove highlight formatting
          const textNode = $createTextNode(selection.getTextContent());
          selection.insertNodes([textNode]);
        }
      });
    }
    setCurrentHighlight(null);
  };

  // Reference functions
  const insertCitation = (style: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // If no sources exist, prompt user to add one
          if (sources.length === 0) {
            setShowSourceModal(true);
            return;
          }
          
          // Create citation text based on style
          let citationText = '';
          const source = sources[0]; // Use first source for now
          
          switch (style) {
            case 'apa':
              citationText = `(${source.author}, ${source.year})`;
              break;
            case 'mla':
              citationText = `(${source.author} ${source.year})`;
              break;
            case 'chicago':
              citationText = `(${source.author} ${source.year}, ${source.pages || 'n.p.'})`;
              break;
            case 'harvard':
              citationText = `(${source.author}, ${source.year})`;
              break;
            case 'ieee':
              citationText = `[${source.id}]`;
              break;
            case 'vancouver':
              citationText = `[${source.id}]`;
              break;
            default:
              citationText = `(${source.author}, ${source.year})`;
          }
          
          const textNode = $createTextNode(citationText);
          selection.insertNodes([textNode]);
          
          // Add citation to tracking
          const newCitation = {
            id: Date.now().toString(),
            sourceId: source.id,
            style: style as any,
            position: citationCount,
            text: citationText
          };
          setCitations([...citations, newCitation]);
          setCitationCount(prev => prev + 1);
        }
      });
    }
  };

  const insertReference = (type: string) => {
    // Open source modal to add new reference
    setEditingSource({ type });
    setShowSourceModal(true);
  };

  const insertBibliography = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (sources.length === 0) {
            const textNode = $createTextNode('\n\nReferences\n\nNo sources added yet. Use the Reference dropdown to add sources.');
            selection.insertNodes([textNode]);
            return;
          }
          
          let bibliographyText = '\n\nReferences\n\n';
          
          sources.forEach((source, index) => {
            switch (selectedCitationStyle) {
              case 'apa':
                switch (source.type) {
            case 'book':
                    bibliographyText += `${source.author}. (${source.year}). ${source.title}. ${source.publisher || 'Unknown Publisher'}.\n`;
              break;
            case 'journal':
                    bibliographyText += `${source.author}. (${source.year}). ${source.title}. ${source.journal || 'Unknown Journal'}, ${source.volume || ''}${source.issue ? `(${source.issue})` : ''}, ${source.pages || 'n.p.'}.\n`;
              break;
            case 'website':
                    bibliographyText += `${source.author}. (${source.year}). ${source.title}. Retrieved from ${source.url || 'Unknown URL'}\n`;
              break;
            default:
                    bibliographyText += `${source.author}. (${source.year}). ${source.title}.\n`;
                }
                break;
              case 'mla':
                switch (source.type) {
                  case 'book':
                    bibliographyText += `${source.author}. "${source.title}." ${source.publisher || 'Unknown Publisher'}, ${source.year}.\n`;
                    break;
                  case 'journal':
                    bibliographyText += `${source.author}. "${source.title}." ${source.journal || 'Unknown Journal'}, vol. ${source.volume || ''}, no. ${source.issue || ''}, ${source.year}, pp. ${source.pages || 'n.p.'}.\n`;
                    break;
                  case 'website':
                    bibliographyText += `${source.author}. "${source.title}." ${source.url || 'Unknown URL'}, ${source.year}.\n`;
                    break;
                  default:
                    bibliographyText += `${source.author}. "${source.title}." ${source.year}.\n`;
                }
                break;
              case 'chicago':
                switch (source.type) {
                  case 'book':
                    bibliographyText += `${source.author}. "${source.title}." ${source.publisher || 'Unknown Publisher'}, ${source.year}.\n`;
                    break;
                  case 'journal':
                    bibliographyText += `${source.author}. "${source.title}." ${source.journal || 'Unknown Journal'} ${source.volume || ''}, no. ${source.issue || ''} (${source.year}): ${source.pages || 'n.p.'}.\n`;
                    break;
                  case 'website':
                    bibliographyText += `${source.author}. "${source.title}." ${source.url || 'Unknown URL'}. Accessed ${new Date().toISOString().split('T')[0]}.\n`;
                    break;
                  default:
                    bibliographyText += `${source.author}. "${source.title}." ${source.year}.\n`;
                }
                break;
              case 'harvard':
                switch (source.type) {
                  case 'book':
                    bibliographyText += `${source.author} (${source.year}) ${source.title}, ${source.publisher || 'Unknown Publisher'}.\n`;
                    break;
                  case 'journal':
                    bibliographyText += `${source.author} (${source.year}) '${source.title}', ${source.journal || 'Unknown Journal'}, ${source.volume || ''}(${source.issue || ''}), pp. ${source.pages || 'n.p.'}.\n`;
                    break;
                  case 'website':
                    bibliographyText += `${source.author} (${source.year}) ${source.title}, ${source.url || 'Unknown URL'}.\n`;
                    break;
                  default:
                    bibliographyText += `${source.author} (${source.year}) ${source.title}.\n`;
                }
                break;
              case 'ieee':
                bibliographyText += `[${index + 1}] ${source.author}, "${source.title}," ${source.journal || source.publisher || 'Unknown'}, ${source.year}.\n`;
                break;
              case 'vancouver':
                bibliographyText += `${index + 1}. ${source.author}. ${source.title}. ${source.journal || source.publisher || 'Unknown'}. ${source.year}.\n`;
                break;
              default:
                bibliographyText += `${source.author}. (${source.year}). ${source.title}.\n`;
            }
          });
          
          const textNode = $createTextNode(bibliographyText);
          selection.insertNodes([textNode]);
        }
      });
    }
  };

  const insertFootnote = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const footnoteText = `¹ `;
          const textNode = $createTextNode(footnoteText);
          selection.insertNodes([textNode]);
          
          // Add footnote to tracking
          const newFootnote = {
            id: Date.now().toString(),
            content: '',
            position: footnoteCount
          };
          setFootnotes([...footnotes, newFootnote]);
          setFootnoteCount(prev => prev + 1);
        }
      });
    }
  };

  const insertEndnote = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const endnoteText = `[${endnoteCount}] `;
          const textNode = $createTextNode(endnoteText);
            selection.insertNodes([textNode]);
          
          // Add endnote to tracking
          const newEndnote = {
            id: Date.now().toString(),
            content: '',
            position: endnoteCount
          };
          setEndnotes([...endnotes, newEndnote]);
          setEndnoteCount(prev => prev + 1);
        }
      });
    }
  };

  const addSource = (sourceData: any) => {
    const newSource = {
      id: Date.now().toString(),
      ...sourceData
    };
    setSources(prev => [...prev, newSource]);
    setShowSourceModal(false);
    setEditingSource(null);
  };

  const updateSource = (sourceId: string, updatedData: any) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId ? { ...source, ...updatedData } : source
    ));
    setShowSourceModal(false);
    setEditingSource(null);
  };

  const deleteSource = (sourceId: string) => {
    if (confirm('Are you sure you want to delete this source? This will also remove all citations referencing it.')) {
      setSources(prev => prev.filter(source => source.id !== sourceId));
      setCitations(prev => prev.filter(citation => citation.sourceId !== sourceId));
    }
  };

  const formatCitation = (source: any, style: string) => {
    switch (style) {
      case 'apa':
        return `${source.author}. (${source.year}). ${source.title}. ${source.publisher || 'Unknown Publisher'}.`;
      case 'mla':
        return `${source.author}. "${source.title}." ${source.publisher || 'Unknown Publisher'}, ${source.year}.`;
      case 'chicago':
        return `${source.author}. "${source.title}." ${source.publisher || 'Unknown Publisher'}, ${source.year}.`;
      default:
        return `${source.author}. (${source.year}). ${source.title}.`;
    }
  };



  // Data arrays
  const highlightColors = [
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Green', value: '#90EE90' },
    { name: 'Blue', value: '#87CEEB' },
    { name: 'Pink', value: '#FFB6C1' },
    { name: 'Orange', value: '#FFA500' },
    { name: 'Purple', value: '#DDA0DD' },
    { name: 'Red', value: '#FF6B6B' },
    { name: 'Gray', value: '#D3D3D3' }
  ];



  const insertSubheading = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const textContent = selection.getTextContent();
          const paragraphNode = $createParagraphNode();
          const textNode = $createTextNode(textContent || 'Subheading');
          textNode.setStyle('font-size: 18px; font-weight: 600; color: #6b7280;');
          paragraphNode.append(textNode);
          
          if (selection.isCollapsed()) {
            selection.insertNodes([paragraphNode]);
          } else {
            selection.insertNodes([paragraphNode]);
          }
          
          setCurrentHeadingStyle('sub');
        }
      });
    }
  };

  const insertBody = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const textContent = selection.getTextContent();
          const paragraphNode = $createParagraphNode();
          const textNode = $createTextNode(textContent || 'Body text');
          textNode.setStyle('font-size: 16px; font-weight: normal;');
          paragraphNode.append(textNode);
          
          if (selection.isCollapsed()) {
            selection.insertNodes([paragraphNode]);
          } else {
            selection.insertNodes([paragraphNode]);
          }
          
          setCurrentHeadingStyle('body');
        }
      });
    }
  };

  const insertCaption = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const textContent = selection.getTextContent();
          const paragraphNode = $createParagraphNode();
          const textNode = $createTextNode(textContent || 'Caption');
          textNode.setStyle('font-size: 14px; font-weight: normal; color: #9ca3af;');
          paragraphNode.append(textNode);
          
          if (selection.isCollapsed()) {
            selection.insertNodes([paragraphNode]);
          } else {
            selection.insertNodes([paragraphNode]);
          }
          
          setCurrentHeadingStyle('caption');
        }
      });
    }
  };

  // List functions
  const insertListWithStyle = (style: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const textContent = selection.getTextContent();
          
          // Create list item text
          let listText = '';
          switch (style) {
            case 'bullet':
              listText = `• ${textContent || 'List item'}`;
              break;
            case 'numbered':
              listText = `1. ${textContent || 'List item'}`;
              break;
            case 'lettered':
              listText = `A. ${textContent || 'List item'}`;
              break;
            case 'harvard':
              listText = `I. ${textContent || 'List item'}`;
              break;
            case 'dash':
              listText = `- ${textContent || 'List item'}`;
              break;
            case 'note-taking':
              listText = `☐ ${textContent || 'List item'}`;
              break;
            case 'image':
              listText = `📷 ${textContent || 'List item'}`;
              break;
            default:
              listText = `• ${textContent || 'List item'}`;
          }
          
          const textNode = $createTextNode(listText);
          
          if (selection.isCollapsed()) {
            selection.insertNodes([textNode]);
          } else {
            selection.insertNodes([textNode]);
          }
          
          setCurrentListStyle(style);
        }
      });
    }
  };

  // Debug logging removed for heading/list

  const lineSpacingOptions = [
    { value: 1, label: 'Single', description: '1.0' },
    { value: 1.15, label: '1.15', description: '1.15' },
    { value: 1.5, label: '1.5', description: '1.5' },
    { value: 2, label: 'Double', description: '2.0' },
    { value: 2.5, label: '2.5', description: '2.5' },
    { value: 3, label: '3.0', description: '3.0' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside dropdowns
      const isOutsideHeadingDropdown = !target.closest('.heading-dropdown-container');
      const isOutsideListDropdown = !target.closest('.list-dropdown-container');
      const isOutsideHighlightDropdown = !target.closest('.highlight-dropdown-container');
      const isOutsideReferenceDropdown = !target.closest('.reference-dropdown-container');
      const isOutsideLineSpacingDropdown = !target.closest('.line-spacing-dropdown-container');
      const isOutsideColorDropdown = !target.closest('.color-dropdown-container');
      
      if (isOutsideHeadingDropdown) {
        setShowHeadingDropdown(false);
      }
      if (isOutsideListDropdown) {
        setShowListDropdown(false);
      }
      if (isOutsideHighlightDropdown) {
        setShowHighlightDropdown(false);
      }
      if (isOutsideReferenceDropdown) {
        setShowReferenceDropdown(false);
      }
      if (isOutsideLineSpacingDropdown) {
        setShowLineSpacingDropdown(false);
      }
      if (isOutsideColorDropdown) {
        setShowColorDropdown(false);
      }
    };

    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHeadingDropdown(false);
        setShowListDropdown(false);
        setShowHighlightDropdown(false);
        setShowReferenceDropdown(false);
        setShowLineSpacingDropdown(false);
        setShowColorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const editor = getCurrentEditor();
      if (editor) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Create link text
            const linkText = `[${url}](${url})`;
            selection.insertText(linkText);
          }
        });
      }
    }
  };











  // Format button configurations
  const formatButtons = [
    {
      type: 'bold' as 'bold' | 'italic' | 'underline' | 'strikethrough',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      ),
      label: 'Bold',
      shortcut: 'Ctrl+B'
    },
    {
      type: 'italic' as 'bold' | 'italic' | 'underline' | 'strikethrough',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      label: 'Italic',
      shortcut: 'Ctrl+I'
    },
    {
      type: 'underline' as 'bold' | 'italic' | 'underline' | 'strikethrough',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      label: 'Underline',
      shortcut: 'Ctrl+U'
    },
    {
      type: 'strikethrough' as 'bold' | 'italic' | 'underline' | 'strikethrough',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H4M12 4v16" />
        </svg>
      ),
      label: 'Strikethrough',
      shortcut: 'Ctrl+Shift+S'
    }
  ];

  // Alignment button configurations
  const alignmentButtons = [
    {
      type: 'left' as ElementFormatType,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      label: 'Align Left'
    },
    {
      type: 'center' as ElementFormatType,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h12" />
        </svg>
      ),
      label: 'Align Center'
    },
    {
      type: 'right' as ElementFormatType,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
        </svg>
      ),
      label: 'Align Right'
    }
  ];

  return (
          <div className="sticky top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-900 border-b border-slate-200 dark:border-slate-700 shadow-sm" style={{ zIndex: 100, minHeight: '80px' }}>
      {/* References Manager Modal */}
      <ReferencesManager
        sources={sources}
        setSources={setSources}
        citations={citations}
        setCitations={setCitations}
        footnotes={footnotes}
        setFootnotes={setFootnotes}
        endnotes={endnotes}
        setEndnotes={setEndnotes}
        showSourceModal={showSourceModal}
        setShowSourceModal={setShowSourceModal}
        editingSource={editingSource}
        setEditingSource={setEditingSource}
      />

      
      {/* Main Toolbar */}
      <div className="px-6 py-3 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/30 dark:to-indigo-900/30">
        <div className="flex items-center justify-start space-x-2 overflow-visible" style={{ minHeight: '48px' }}>
          
          {/* Clipboard Group - Word Style */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="group relative p-2 rounded-md transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="group relative p-2 rounded-md transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Font Group - Word Style */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
            {formatButtons.map((button) => {
              let isActive = false;
              switch (button.type) {
                case 'bold':
                  isActive = isBold;
                  break;
                case 'italic':
                  isActive = isItalic;
                  break;
                case 'underline':
                  isActive = isUnderline;
                  break;
                case 'strikethrough':
                  isActive = isStrikethrough;
                  break;
              }
              
              return (
                <button
                  key={button.type}
                  onClick={() => formatText(button.type)}
                  className={`group relative p-2 rounded-md transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}

                  title={`${button.label} (${button.shortcut})`}
                >
                  <span className={`${isActive ? 'text-white' : ''}`}>
                    {button.icon}
                  </span>
                </button>
              );
            })}
          </div>

          



          {/* Enhanced Font Family Section */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600 relative">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-1">Font</label>
            <button
              onClick={() => {
                console.log('🎨 Font button clicked, current state:', showFontDropdown);
                setShowFontDropdown(!showFontDropdown);
              }}
              className="flex items-center justify-between px-2 py-1 min-w-[120px] text-sm bg-transparent text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-all duration-200"
            >
              <span style={{ fontFamily: selectedFont }} className="truncate">
                {selectedFont}
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showFontDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Enhanced Font Dropdown */}
            {showFontDropdown && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[99999] max-h-96 overflow-hidden font-dropdown-container" style={{ left: '0', minWidth: '320px' }}>
                {/* Search Header with Navigation */}
                <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="relative mb-2">
                    <input
                      type="text"
                      placeholder="Search fonts..."
                      value={fontSearchTerm}
                      onChange={(e) => setFontSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Category Navigation */}
                  {fontSearchTerm.trim() === '' && (
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(fontCategories).map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            const element = document.querySelector(`[data-category="${category}"]`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Font List with Enhanced Scrolling */}
                <div 
                  className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 relative"
                  style={{ scrollBehavior: 'smooth' }}
                  onScroll={(e) => {
                    const target = e.target as HTMLElement;
                    setShowScrollToTop(target.scrollTop > 100);
                  }}
                >
                  {/* Scroll to Top Button */}
                  {showScrollToTop && (
                    <button
                      onClick={() => {
                        const scrollContainer = document.querySelector('.font-dropdown-container .overflow-y-auto') as HTMLElement;
                        if (scrollContainer) {
                          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="absolute bottom-4 right-4 z-10 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      title="Scroll to top"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  )}
                                      {fontSearchTerm.trim() === '' ? (
                      // Show categorized fonts when no search
                      Object.entries(fontCategories).map(([category, fonts]) => (
                        <div key={category} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0" data-category={category}>
                          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            {category} ({fonts.length})
                          </div>
                        <div className="p-1">
                          {fonts.map((font) => (
                            <button
                              key={font}
                              onClick={() => handleFontChange(font)}
                              className={`w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200 group ${
                                selectedFont === font ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                              }`}
                              style={{ fontFamily: font }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{font}</span>
                                {selectedFont === font && (
                                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Show filtered fonts when searching
                    <div className="p-1">
                      {filteredFonts.length > 0 ? (
                        filteredFonts.map((font) => (
                          <button
                            key={font}
                            onClick={() => handleFontChange(font)}
                            className={`w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200 group ${
                              selectedFont === font ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                            }`}
                            style={{ fontFamily: font }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{font}</span>
                              {selectedFont === font && (
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No fonts found matching "{fontSearchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Font Size Section - Word Style */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">Size</label>
            <div className="flex items-center overflow-hidden">
              {/* Decrease Button */}
              <button
                onClick={decreaseFontSize}
                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                title="Decrease Font Size"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              {/* Current Size Display */}
              <div className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[50px] text-center">
                {fontSize}
              </div>
              
              {/* Increase Button */}
              <button
                onClick={increaseFontSize}
                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                title="Increase Font Size"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Heading Styles Section - Word Style */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600 relative heading-dropdown-container">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">Heading</label>
            <button
              onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
              className="flex items-center justify-between px-3 py-1 min-w-[100px] text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
            >
              <span>{currentHeadingStyle === 'h1' ? 'Heading 1' : 
                     currentHeadingStyle === 'h2' ? 'Heading 2' : 
                     currentHeadingStyle === 'h3' ? 'Heading 3' : 
                     currentHeadingStyle === 'sub' ? 'Subheading' : 
                     currentHeadingStyle === 'body' ? 'Body Text' : 
                     currentHeadingStyle === 'caption' ? 'Caption' : 
                     'Normal'}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showHeadingDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Heading Dropdown */}
            {showHeadingDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-[99999]">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      insertHeading(1);
                      setShowHeadingDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Heading 1</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">32px, Bold</div>
                  </button>
                  <button
                    onClick={() => {
                      insertHeading(2);
                      setShowHeadingDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Heading 2</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">24px, Semibold</div>
                  </button>
                  <button
                    onClick={() => {
                      insertHeading(3);
                      setShowHeadingDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Heading 3</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">20px, Medium</div>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <button
                    onClick={() => {
                      insertSubheading();
                      setShowHeadingDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all duration-200"
                  >
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Subheading</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">18px, Semibold</div>
                  </button>
                  <button
                    onClick={() => {
                      insertBody();
                      setShowHeadingDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-all duration-200"
                  >
                    <div className="text-sm font-normal text-gray-900 dark:text-gray-100">Body Text</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">16px, Normal</div>
                  </button>
                  <button
                    onClick={() => {
                      insertCaption();
                      setShowHeadingDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-all duration-200"
                  >
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">Caption</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">14px, Normal</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* List Styles Section - Word Style */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600 relative list-dropdown-container">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">List</label>
            <button
              onClick={() => setShowListDropdown(!showListDropdown)}
              className="flex items-center justify-between px-3 py-1 min-w-[100px] text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
            >
              <span>{currentListStyle === 'bullet' ? 'Bullet List' : 
                     currentListStyle === 'numbered' ? 'Numbered List' : 
                     currentListStyle === 'lettered' ? 'Lettered List' : 
                     currentListStyle === 'harvard' ? 'Harvard List' : 
                     currentListStyle === 'dash' ? 'Dash List' : 
                     currentListStyle === 'note-taking' ? 'Note Taking' : 
                     currentListStyle === 'image' ? 'Image List' : 
                     'No List'}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showListDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* List Dropdown */}
            {showListDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-[99999]">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      insertListWithStyle('bullet');
                      setShowListDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Bullet List</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Simple bullet points</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      insertListWithStyle('numbered');
                      setShowListDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Numbered List</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">1, 2, 3... format</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      insertListWithStyle('lettered');
                      setShowListDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Lettered List</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">A, B, C... format</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      insertListWithStyle('harvard');
                      setShowListDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Harvard List</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">I, II, III... format</div>
                      </div>
                    </div>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  <button
                    onClick={() => {
                      insertListWithStyle('dash');
                      setShowListDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 12h14"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Dash List</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Dash-separated items</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      insertListWithStyle('note-taking');
                      setShowListDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Note Taking</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Checkbox-style items</div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      insertListWithStyle('image');
                      setShowListDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900/30 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-pink-600 dark:text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Image List</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Image-based bullets</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* Text Color Section - Dynamic Word Style */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600 relative color-dropdown-container">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">Color</label>
            
            {/* Current Color Display - Dynamic */}
            <button
              onClick={() => setShowColorDropdown(!showColorDropdown)}
              className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group"
            >
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-500 shadow-sm transition-all duration-200 group-hover:scale-110"
                style={{ 
                  backgroundColor: textColor,
                  boxShadow: `0 0 0 2px ${textColor === '#000000' ? 'transparent' : textColor}20`
                }}
              />
              <svg className="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Color Dropdown - Enhanced */}
            {showColorDropdown && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[9999] p-4">
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Preset Colors</div>
                  <div className="grid grid-cols-8 gap-2">
                    {[
                      '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                      '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#808080', '#000080', '#FFD700',
                      '#FF6347', '#32CD32', '#9370DB', '#20B2AA', '#FF69B4', '#CD853F', '#4169E1', '#DC143C',
                      '#00CED1', '#FF1493', '#32CD32', '#FF4500', '#9400D3', '#00FA9A', '#FFD700', '#FF69B4'
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          handleColorChange(color);
                          setShowColorDropdown(false);
                        }}
                        className={`w-8 h-8 rounded border-2 transition-all duration-200 hover:scale-110 ${
                          textColor === color 
                            ? 'border-blue-500 scale-110 shadow-lg' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }`}
                        style={{ 
                          backgroundColor: color,
                          boxShadow: textColor === color ? `0 0 0 2px ${color}40` : 'none'
                        }}
                        title={`Color: ${color}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Custom Color</div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-10 h-10 border-0 rounded cursor-pointer transition-all duration-200 hover:scale-110 shadow-sm"
                      title="Custom Color"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                
                {/* Current Color Preview */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Current Color</div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: textColor }}
                    />
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{textColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Paragraph Group - Word Style */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
              {alignmentButtons.map((button) => (
                <button
                  key={button.type}
                  onClick={() => formatElement(button.type)}
                className="group relative p-2 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  title={button.label}
                >
                  <span className={`${button.type === 'left' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {button.icon}
                  </span>
              </button>
            ))}
          </div>

          {/* Line Spacing Section - Word Style */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600 relative line-spacing-dropdown-container">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2">Spacing</label>
            <button
              onClick={() => setShowLineSpacingDropdown(!showLineSpacingDropdown)}
              className="flex items-center justify-between px-3 py-1 min-w-[80px] text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200"
            >
              <span>{currentLineSpacing === 1 ? 'Single' : 
                     currentLineSpacing === 1.15 ? '1.15' : 
                     currentLineSpacing === 1.5 ? '1.5' : 
                     currentLineSpacing === 2 ? 'Double' : 
                     currentLineSpacing === 2.5 ? '2.5' : 
                     currentLineSpacing === 3 ? '3.0' : 
                     'Single'}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showLineSpacingDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Line Spacing Dropdown */}
            {showLineSpacingDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[9999]">
                <div className="p-2 space-y-1">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 mb-2">Line Spacing</div>
                  {lineSpacingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        applyLineSpacing(option.value);
                        setShowLineSpacingDropdown(false);
                      }}
                      className={`w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200 text-sm ${
                        currentLineSpacing === option.value 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                      </div>
                </button>
              ))}
                </div>
              </div>
            )}
          </div>

                      {/* Additional Tools Section - Word Style */}
            <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
              <button
                onClick={clearFormatting}
                className={`group relative p-2 rounded-md transition-all duration-200 ${
                  (isBold || isItalic || isUnderline || isStrikethrough)
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                title="Clear Formatting"
                disabled={!(isBold || isItalic || isUnderline || isStrikethrough)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            
            <button
              onClick={insertLink}
              className="group relative p-2 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title="Insert Link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </div>
            
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            
          {/* AI Tools Section - Word Style */}
          <div className="flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-1 border border-blue-200 dark:border-blue-700/30">
            <button
              onClick={() => setShowGPTSearch(!showGPTSearch)}
              className="group relative p-2 rounded-md transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              title="AI-Powered Search"
            >
              <div className="relative">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </button>
            
            {/* Translation Button */}
            <div className="flex-shrink-0">
              <TranslationButton variant="top" />
            </div>
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

          {/* Voice Input Section - Word Style */}
          <div className="voice-input-section flex items-center space-x-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-1 border border-green-200 dark:border-green-700/30 relative">
            <button
              onClick={() => {
                if (isListening) {
                  stopVoiceRecognition();
                } else {
                  startVoiceRecognition();
                }
              }}
              className={`group relative p-2 rounded-md transition-all duration-200 ${
                isListening 
                  ? 'bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-300 ring-2 ring-green-300 ring-offset-2' 
                  : 'hover:bg-green-100 dark:hover:bg-green-800/30 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
              }`}
              title={isListening ? "Stop Voice Input (Click to stop)" : "Start Voice Input (Click to speak)"}
            >
              <div className="relative">
                <svg className={`w-4 h-4 transition-transform duration-300 ${isListening ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isListening && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
        </div>
            </button>
            
            {/* Alternative text input button */}
            <button
              onClick={showTextInputFallback}
              className="group relative p-2 rounded-md transition-all duration-200 hover:bg-green-100 dark:hover:bg-green-800/30 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              title="Quick Text Input (Alternative to voice)"
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {/* Voice Input Status - Fixed positioning to prevent layout disruption */}
            {isListening && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-600 rounded-lg shadow-lg p-3 min-w-[250px] z-[9999]">
                <div className="flex items-center space-x-2 mb-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Listening...</span>
                  <button
                    onClick={stopVoiceRecognition}
                    className="ml-auto text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                    title="Stop listening"
                  >
                    Stop
                  </button>
                </div>
                {transcript ? (
                  <div className="border-t border-green-200 dark:border-green-600 pt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Speaking:</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded border">
                    "{transcript}"
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-green-200 dark:border-green-600 pt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Start speaking to see your words appear here...
                    </div>
                  </div>
                )}
                
                {/* Debug: Test text insertion */}
                <div className="border-t border-green-200 dark:border-green-600 pt-2 mt-2">
                  <button
                    onClick={() => insertVoiceText('Test voice input working!')}
                    className="w-full text-xs bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700/40 transition-colors"
                    title="Test if text insertion is working"
                  >
                    Test Text Insertion
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

          {/* Find & Replace Section - Word/Canva Style */}
          <div className="find-replace-section flex items-center space-x-1 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-1 border border-orange-200 dark:border-orange-700/30 relative">
            <button
              onClick={() => setShowFindReplace(!showFindReplace)}
              className={`group relative p-2 rounded-md transition-all duration-200 ${
                showFindReplace 
                  ? 'bg-orange-100 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300' 
                  : 'hover:bg-orange-100 dark:hover:bg-orange-800/30 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300'
              }`}
              title="Find & Replace"
            >
              <div className="relative">
                <svg className={`w-4 h-4 transition-transform duration-300 ${showFindReplace ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {showFindReplace && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            
            {/* Find & Replace Dropdown Panel - Word/Canva Style */}
            {showFindReplace && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-600 rounded-lg shadow-lg p-4 min-w-[320px] z-[9999]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Find & Replace</h3>
                  <button
                    onClick={() => setShowFindReplace(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Find Section */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Find what:</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter text to find..."
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.shiftKey ? findPrevious() : findNext();
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <div className="absolute right-2 top-2 flex items-center space-x-1">
                      <button
                        onClick={findPrevious}
                        className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        title="Find Previous (Shift+Enter)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={findNext}
                        className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        title="Find Next (Enter)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replace Section */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Replace with:</label>
                  <input
                    type="text"
                    placeholder="Enter replacement text..."
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Options */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => setCaseSensitive(e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">Match case</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={wholeWord}
                        onChange={(e) => setWholeWord(e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">Whole word</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={replaceCurrent}
                      disabled={!findText || !replaceText}
                      className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      onClick={replaceAll}
                      disabled={!findText || !replaceText}
                      className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Replace All
                    </button>
                  </div>
                  
                  {/* Results Counter */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {findResults > 0 ? `${findResults} found` : 'No results'}
                  </div>
                </div>

                {/* Status Messages */}
                {findStatus && (
                  <div className="mt-3 p-2 text-xs rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                    {findStatus}
                  </div>
                )}

                {/* Debug Section - Remove in production */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            const selectedText = selection.getTextContent();
                            console.log('Selected text:', selectedText);
                            console.log('Find text:', findText);
                            console.log('Replace text:', replaceText);
                            alert(`Selected: "${selectedText}"\nFind: "${findText}"\nReplace: "${replaceText}"`);
                          }
                        });
                      }
                    }}
                    className="w-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Debug: Check Selection
                  </button>
                  
                  <button
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            try {
                              // Simple test: replace selected text with "TEST"
                              selection.removeText();
                              selection.insertText("TEST");
                              setFindStatus('Test replace completed');
                            } catch (error) {
                              console.error('Test replace error:', error);
                              setFindStatus('Test replace failed: ' + (error as Error).message);
                            }
                          } else {
                            setFindStatus('No text selected for test');
                          }
                        });
                      }
                    }}
                    className="w-full text-xs bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-600 transition-colors mt-1"
                  >
                    Test: Replace with "TEST"
                  </button>
                  
                  <button
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          console.log('Selection type:', selection ? selection.constructor.name : 'No selection');
                          console.log('Is range selection:', $isRangeSelection(selection));
                          if ($isRangeSelection(selection)) {
                            console.log('Selected text:', selection.getTextContent());
                            console.log('Selection anchor:', selection.anchor);
                            console.log('Selection focus:', selection.focus);
                          }
                        });
                      }
                    }}
                    className="w-full text-xs bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors mt-1"
                  >
                    Debug: Log Selection Info
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

          {/* Highlight Section - Word Style */}
          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-1 border border-yellow-200 dark:border-yellow-700/30 relative highlight-dropdown-container">
            <button
              onClick={() => setShowHighlightDropdown(!showHighlightDropdown)}
              className={`group relative p-2 rounded-md transition-all duration-200 ${
                showHighlightDropdown 
                  ? 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-700 dark:text-yellow-300' 
                  : 'hover:bg-yellow-100 dark:hover:bg-yellow-800/30 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300'
              }`}
              title="Text Highlight"
            >
              <div className="relative">
                <svg className={`w-4 h-4 transition-transform duration-300 ${showHighlightDropdown ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {showHighlightDropdown && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            
            {/* Highlight Dropdown */}
            {showHighlightDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-600 rounded-lg shadow-xl z-[9999]">
                <div className="p-2 space-y-1">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 mb-2">Highlight Colors</div>
                  <div className="grid grid-cols-4 gap-2">
                    {highlightColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          applyHighlight(color.value);
                          setShowHighlightDropdown(false);
                        }}
                        className="w-8 h-8 rounded border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  <button
                    onClick={() => {
                      removeHighlight();
                      setShowHighlightDropdown(false);
                    }}
                    className="w-full p-2 text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-all duration-200 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove Highlight
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

          {/* Reference Section - Word Style */}
          <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-1 border border-purple-200 dark:border-purple-700/30 relative reference-dropdown-container">
            <button
              onClick={() => setShowReferenceDropdown(!showReferenceDropdown)}
              className={`group relative p-2 rounded-md transition-all duration-200 ${
                showReferenceDropdown 
                  ? 'bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300' 
                  : 'hover:bg-purple-100 dark:hover:bg-purple-800/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
              }`}
              title="References & Citations"
            >
              <div className="relative">
                <svg className={`w-4 h-4 transition-transform duration-300 ${showReferenceDropdown ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {showReferenceDropdown && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            
            {/* Reference Dropdown - Microsoft Word Style */}
            {showReferenceDropdown && (
              <div className="absolute top-full right-0 mt-1 w-96 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-600 rounded-lg shadow-xl z-[99999]">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">References & Citations</h3>
                    <button
                      onClick={() => setShowReferenceDropdown(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Citation Style Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Citation Style
                    </label>
                    <select
                      value={selectedCitationStyle}
                      onChange={(e) => setSelectedCitationStyle(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="apa">APA - American Psychological Association</option>
                      <option value="mla">MLA - Modern Language Association</option>
                      <option value="chicago">Chicago - Chicago Manual of Style</option>
                      <option value="harvard">Harvard - Harvard Referencing</option>
                      <option value="ieee">IEEE - Institute of Electrical and Electronics Engineers</option>
                      <option value="vancouver">Vancouver - Vancouver Style</option>
                    </select>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Quick Actions</div>
                    <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                          insertCitation(selectedCitationStyle);
                        setShowReferenceDropdown(false);
                      }}
                        className="p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all duration-200 group border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Insert Citation</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Add citation</div>
                          </div>
                        </div>
                    </button>
                      
                    <button
                      onClick={() => {
                          insertBibliography();
                        setShowReferenceDropdown(false);
                      }}
                        className="p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all duration-200 group border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                  </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Bibliography</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Generate list</div>
                          </div>
                        </div>
                      </button>
                      
                    <button
                      onClick={() => {
                          insertFootnote();
                        setShowReferenceDropdown(false);
                      }}
                        className="p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all duration-200 group border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Footnote</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Add footnote</div>
                          </div>
                        </div>
                    </button>
                      
                    <button
                      onClick={() => {
                          insertEndnote();
                        setShowReferenceDropdown(false);
                      }}
                        className="p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all duration-200 group border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Endnote</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Add endnote</div>
                          </div>
                        </div>
                    </button>
                    </div>
                  </div>

                  {/* Source Management */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Source Management</div>
                    <div className="space-y-2">
                    <button
                      onClick={() => {
                          setShowSourceModal(true);
                        setShowReferenceDropdown(false);
                      }}
                        className="w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-all duration-200 group border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                  </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Add New Source</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Books, articles, websites, etc.</div>
                          </div>
                        </div>
                      </button>
                      
                      {sources.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recent Sources ({sources.length})</div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {sources.slice(0, 3).map((source) => (
                              <div key={source.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{source.title}</div>
                                  <div className="text-gray-500 dark:text-gray-400 truncate">{source.author} ({source.year})</div>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => {
                                      insertCitation(selectedCitationStyle);
                      setShowReferenceDropdown(false);
                    }}
                                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30"
                  >
                                    Cite
                  </button>
                                </div>
                              </div>
                            ))}
                </div>
              </div>
            )}
                    </div>
          </div>

                  {/* Statistics */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{sources.length}</div>
                        <div className="text-gray-500 dark:text-gray-400">Sources</div>
        </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{citations.length}</div>
                        <div className="text-gray-500 dark:text-gray-400">Citations</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{footnotes.length + endnotes.length}</div>
                        <div className="text-gray-500 dark:text-gray-400">Notes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

export default TopToolbar; 