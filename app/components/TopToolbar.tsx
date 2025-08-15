'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { $getSelection, $isRangeSelection, TextFormatType, ElementFormatType, $isTextNode, $createTextNode, $getRoot } from 'lexical';
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { getCurrentEditor } from './EditorRegistry';
import TranslationButton from './TranslationButton';
import { useTheme } from './ThemeProvider';

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
  const [fontSize, setFontSize] = useState('12'); // Default to 12px
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isGPTSearching, setIsGPTSearching] = useState(false);

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
      const savedFontSize = localStorage.getItem('defaultFontSize') || '12'; // Default to 12px
      
      setIsBold(savedBold);
      setIsItalic(savedItalic);
      setIsUnderline(savedUnderline);
      setIsStrikethrough(savedStrikethrough);
      setFontSize(savedFontSize);
      
      // Initialize default font size in editor if no saved size
      if (!localStorage.getItem('defaultFontSize')) {
        localStorage.setItem('defaultFontSize', '12');
      }
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
            selection.formatText('font-family', selectedFont);
            selection.formatText('font-size', fontSize + 'px');
            console.log(`TopToolbar: Applied font ${selectedFont} and size ${fontSize}px to new text`);
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
        
        // Initialize font size in editor when it's ready
        setTimeout(() => {
          try {
            ensureFontSizeForNewText();
          } catch (error) {
            console.error('Error initializing font size:', error);
          }
        }, 200);
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
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Check specific formatting types
            const bold = selection.hasFormat('bold');
            const italic = selection.hasFormat('italic');
            const underline = selection.hasFormat('underline');
            const strikethrough = selection.hasFormat('strikethrough');
            
            // Check text color from the first text node in selection
            let color = '#000000';
            if (!selection.isCollapsed()) {
              const nodes = selection.getNodes();
              for (const node of nodes) {
                if ($isTextNode(node)) {
                  try {
                    const nodeColor = (node as any).getFormat('color');
                    if (nodeColor) {
                      color = nodeColor;
                      break;
                    }
                  } catch (error) {
                    // Ignore errors, use default color
                  }
                }
              }
            }
            
            console.log(`TopToolbar: Current formatting - Bold: ${bold}, Italic: ${italic}, Underline: ${underline}, Strikethrough: ${strikethrough}, Color: ${color}`);
            
            setIsBold(bold);
            setIsItalic(italic);
            setIsUnderline(underline);
            setIsStrikethrough(strikethrough);
            setCurrentTextColor(color);
            setTextColor(color); // Update the color picker to show current color
          } else {
            // No selection - check if we can get formatting from the editor state
            console.log('TopToolbar: No range selection found, checking editor state');
            
            // Try to get formatting from the root element or check if editor has content
            const rootElement = editor.getRootElement();
            if (rootElement && rootElement.textContent && rootElement.textContent.trim().length > 0) {
              // Editor has content but no selection - reset formatting state
              console.log('TopToolbar: Editor has content but no selection, resetting formatting state');
              setIsBold(false);
              setIsItalic(false);
              setIsUnderline(false);
              setIsStrikethrough(false);
              setCurrentTextColor('#000000');
              setTextColor('#000000');
            }
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

      // Apply current formatting when user starts typing (non-control keys)
      if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
        // Small delay to ensure the text is inserted first
        setTimeout(() => {
          applyCurrentFormattingToNewText();
          ensureFontSizeForNewText(); // Ensure font size is applied to cursor position
        }, 10);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [applyCurrentFormattingToNewText]);

  // Listen for selection changes to update formatting state
  useEffect(() => {
    const editor = getCurrentEditor();
    if (editor) {
      const removeUpdateListener = editor.registerUpdateListener(() => {
        checkCurrentFormatting();
      });

      // Also listen for editor state changes (like when pages are added)
      const removeStateListener = editor.registerRootListener(() => {
        console.log('TopToolbar: Editor root changed, checking formatting state');
        setTimeout(() => {
          checkCurrentFormatting();
        }, 100);
      });

      // Listen for text input to apply current formatting
      const removeTextListener = editor.registerTextContentListener(() => {
        // Apply current formatting state to new text
        setTimeout(() => {
          applyCurrentFormattingToNewText();
        }, 50);
      });

      return () => {
        removeUpdateListener();
        removeStateListener();
        removeTextListener();
      };
    }
  }, [checkCurrentFormatting, applyCurrentFormattingToNewText]);

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
        try {
          // For now, keep buttons enabled after undo
          setCanUndo(true);
          setCanRedo(true);
        } catch (error) {
          // Fallback: keep buttons enabled
          setCanUndo(true);
          setCanRedo(true);
        }
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
        try {
          // For now, keep buttons enabled after redo
          setCanUndo(true);
          setCanRedo(true);
        } catch (error) {
          // Fallback: keep buttons enabled
          setCanUndo(true);
          setCanRedo(true);
        }
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
  const formatText = (format: TextFormatType) => {
    const editor = getCurrentEditor();
    if (editor) {
      // First ensure we have a valid selection
      ensureValidSelection();
      
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (!selection.isCollapsed()) {
            // Toggle formatting on selected text
            const hasFormat = selection.hasFormat(format);
            // Apply formatting - this will toggle it
            selection.formatText(format);
            console.log(`TopToolbar: ${format} formatting ${!hasFormat ? 'applied' : 'removed'} to selection`);
            
            // Update the formatting state immediately
            switch (format) {
              case 'bold':
                setIsBold(!hasFormat);
                break;
              case 'italic':
                setIsItalic(!hasFormat);
                break;
              case 'underline':
                setIsUnderline(!hasFormat);
                break;
              case 'strikethrough':
                setIsStrikethrough(!hasFormat);
                break;
            }
          } else {
            // No selection - always create text when editor is empty or no selection
            console.log('TopToolbar: No text selected, creating formatted text');
            
            try {
              // First try to apply formatting to the current selection position
              selection.formatText(format);
              console.log(`TopToolbar: ${format} formatting applied to current position`);
              
              // Update the formatting state
              switch (format) {
                case 'bold':
                  setIsBold(true);
                  break;
                case 'italic':
                  setIsItalic(true);
                  break;
                case 'underline':
                  setIsUnderline(true);
                  break;
                case 'strikethrough':
                  setIsStrikethrough(true);
                  break;
              }
            } catch (error) {
              console.log(`TopToolbar: Could not apply ${format} to current position, creating new text node`);
              
              // If that fails, create a new text node with formatting
              try {
                const textNode = $createTextNode('Sample text');
                textNode.setFormat(format);
                selection.insertNodes([textNode]);
                console.log(`TopToolbar: Created new text node with ${format} formatting`);
                
                // Update the formatting state
                switch (format) {
                  case 'bold':
                    setIsBold(true);
                    break;
                  case 'italic':
                    setIsItalic(true);
                    break;
                  case 'underline':
                    setIsUnderline(true);
                    break;
                  case 'strikethrough':
                    setIsStrikethrough(true);
                    break;
                }
              } catch (fallbackError) {
                console.error('TopToolbar: Error creating text node:', fallbackError);
                
                // Final fallback: try to insert a simple space with formatting
                try {
                  const spaceNode = $createTextNode(' ');
                  spaceNode.setFormat(format);
                  selection.insertNodes([spaceNode]);
                  console.log(`TopToolbar: Final fallback - inserted space with ${format} formatting`);
                  
                  // Update the formatting state
                  switch (format) {
                    case 'bold':
                      setIsBold(true);
                      break;
                    case 'italic':
                      setIsItalic(true);
                      break;
                    case 'underline':
                      setIsUnderline(true);
                      break;
                    case 'strikethrough':
                      setIsStrikethrough(true);
                      break;
                  }
                } catch (finalError) {
                  console.error('TopToolbar: All formatting attempts failed:', finalError);
                }
              }
            }
          }
        } else {
          // No range selection - this happens when editor is completely empty
          console.log('TopToolbar: No range selection - editor is completely empty, creating content');
          try {
            // Create a new text node with formatting
            const textNode = $createTextNode('Sample text');
            textNode.setFormat(format);
            
            // Get the root element and insert the text
            const rootElement = editor.getRootElement();
            if (rootElement) {
              // Clear any existing content and insert our formatted text
              rootElement.innerHTML = '';
              rootElement.appendChild(textNode);
              
              console.log(`TopToolbar: Created formatted text in empty editor: ${format}`);
              
              // Update the formatting state
              switch (format) {
                case 'bold':
                  setIsBold(true);
                  break;
                case 'italic':
                  setIsItalic(true);
                  break;
                case 'underline':
                  setIsUnderline(true);
                  break;
                case 'strikethrough':
                  setIsStrikethrough(true);
                  break;
              }
            }
          } catch (error) {
            console.error('TopToolbar: Error creating text in empty editor:', error);
            
            // Try alternative approach - use editor commands
            try {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
              console.log(`TopToolbar: Used command to apply ${format} formatting`);
              
              // Update the formatting state
              switch (format) {
                case 'bold':
                  setIsBold(true);
                  break;
                case 'italic':
                  setIsItalic(true);
                  break;
                case 'underline':
                  setIsUnderline(true);
                  break;
                case 'strikethrough':
                  setIsStrikethrough(true);
                  break;
              }
            } catch (commandError) {
              console.error('TopToolbar: Command approach also failed:', commandError);
            }
          }
        }
      });
      
      // Force a re-check of formatting state after a short delay
      setTimeout(() => {
        checkCurrentFormatting();
      }, 100);
    } else {
      console.log('TopToolbar: No editor found for text formatting');
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
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
    }
  };

     // Handle text color change
   const handleColorChange = (color: string) => {
     console.log(`TopToolbar: Text color changed to ${color}`);
     setTextColor(color);
     
     // Apply color to selection or set as default
     const editor = getCurrentEditor();
     if (editor) {
       editor.update(() => {
         const selection = $getSelection();
         if ($isRangeSelection(selection)) {
           if (!selection.isCollapsed()) {
             // Apply to selected text
             const nodes = selection.getNodes();
             let appliedCount = 0;
             nodes.forEach(node => {
               if ($isTextNode(node)) {
                 try {
                   // Set text color using setFormat
                   (node as any).setFormat('color', color);
                   appliedCount++;
                   console.log(`Applied color ${color} to text node`);
                 } catch (error) {
                   console.error('Error applying color to node:', error);
                 }
               }
             });
             console.log(`TopToolbar: Color ${color} applied to ${appliedCount} text nodes`);
           } else {
             // Set as default for new text
             if (typeof window !== 'undefined') {
               localStorage.setItem('defaultTextColor', color);
             }
             console.log(`TopToolbar: Color ${color} set as default for new text`);
           }
         }
       });
     } else {
       console.log('TopToolbar: No editor found for color change');
     }
   };

   // Apply text color to selection
   const applyTextColor = (color: string) => {
     handleColorChange(color);
   };

  // Handle font change
  const handleFontChange = (font: string) => {
    console.log(`TopToolbar: Font changed to ${font}`);
    setSelectedFont(font);
    
    // Apply font to selection or set as default
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (!selection.isCollapsed()) {
            // Apply to selected text using formatText
            try {
              selection.formatText('font-family', font);
              console.log(`TopToolbar: Font ${font} applied to selection`);
            } catch (error) {
              console.error('Error applying font to selection:', error);
              // Fallback: try to apply to individual nodes
              const nodes = selection.getNodes();
              let appliedCount = 0;
              nodes.forEach(node => {
                if ($isTextNode(node)) {
                  try {
                    (node as any).setFormat('font-family', font);
                    appliedCount++;
                  } catch (nodeError) {
                    console.error('Error applying font to node:', nodeError);
                  }
                }
              });
              console.log(`TopToolbar: Font ${font} applied to ${appliedCount} text nodes (fallback)`);
            }
          } else {
            // Set as default for new text
            if (typeof window !== 'undefined') {
              localStorage.setItem('defaultFont', font);
            }
            console.log(`TopToolbar: Font ${font} set as default for new text`);
          }
        }
      });
    } else {
      console.log('TopToolbar: No editor found for font change');
    }
  };

  // Handle font size change - simplified to prevent crashes
  const handleFontSizeChange = (size: string) => {
    try {
      console.log(`TopToolbar: Font size changed to ${size}`);
      setFontSize(size);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('defaultFontSize', size);
      }
      
      // Apply font size to selection or cursor position
      const editor = getCurrentEditor();
      if (editor) {
        editor.update(() => {
          try {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              if (!selection.isCollapsed()) {
                // Apply to selected text
                try {
                  selection.formatText('font-size', size + 'px');
                  console.log(`TopToolbar: Font size ${size}px applied to selection`);
                } catch (error) {
                  console.log('Error applying font size to selection');
                }
              } else {
                // Apply to cursor position for new text
                try {
                  selection.formatText('font-size', size + 'px');
                  console.log(`TopToolbar: Font size ${size}px applied to cursor position`);
                } catch (error) {
                  console.log('Error applying font size to cursor position');
                }
              }
            }
          } catch (error) {
            console.log('Error in font size update');
          }
        });
      }
    } catch (error) {
      console.log('Critical error in handleFontSizeChange');
      // Still update the state even if editor update fails
      setFontSize(size);
    }
  };

  // Increase font size - simplified to prevent crashes
  const increaseFontSize = () => {
    try {
      const currentSize = parseInt(fontSize);
      const newSize = Math.min(currentSize + 1, 72); // Increment by 1, max 72
      handleFontSizeChange(newSize.toString());
    } catch (error) {
      console.log('Error increasing font size');
    }
  };

  // Decrease font size - simplified to prevent crashes
  const decreaseFontSize = () => {
    try {
      const currentSize = parseInt(fontSize);
      const newSize = Math.max(currentSize - 1, 8); // Decrement by 1, min 8
      handleFontSizeChange(newSize.toString());
    } catch (error) {
      console.log('Error decreasing font size');
    }
  };

  // Clear formatting
  const clearFormatting = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && !selection.isCollapsed()) {
          // Clear all text formatting
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          
          // Clear text color
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            if ($isTextNode(node)) {
              try {
                (node as any).setFormat('color', '#000000');
              } catch (error) {
                console.error('Error clearing color from node:', error);
              }
            }
          });
        }
      });
      
      // Reset all formatting states
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsStrikethrough(false);
      setCurrentTextColor('#000000');
      setTextColor('#000000');
      setSelectedFont('Inter'); // Reset font to default
      setFontSize('12'); // Reset font size to default
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
            selection.formatText('font-family', selectedFont);
            console.log(`TopToolbar: Font ${selectedFont} set for new text`);
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
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Set the font size format for new text at the current cursor position
          try {
            selection.formatText('font-size', fontSize + 'px');
            console.log(`TopToolbar: Font size ${fontSize}px set for new text`);
          } catch (error) {
            console.error('Error setting font size for new text:', error);
          }
        }
      });
    }
  };

  // Enhanced function to ensure font size is applied to new text
  const ensureFontSizeForNewText = () => {
    try {
      const editor = getCurrentEditor();
      if (editor) {
        editor.update(() => {
          try {
            const selection = $getSelection();
            if ($isRangeSelection(selection) && selection.isCollapsed()) {
              // Only apply font size to cursor position (not to existing text)
              try {
                selection.formatText('font-size', fontSize + 'px');
                console.log(`TopToolbar: Ensured font size ${fontSize}px is set for typing position`);
              } catch (error) {
                console.log('Error ensuring font size for new text');
              }
            }
          } catch (error) {
            console.log('Error getting selection');
          }
        });
      }
    } catch (error) {
      console.log('Error in ensureFontSizeForNewText');
    }
  };

  // Force apply font size to current position - called when font size changes
  const forceApplyFontSize = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          // Only apply font size to cursor position (not to existing text)
          try {
            selection.formatText('font-size', fontSize + 'px');
            console.log(`TopToolbar: Force applied font size ${fontSize}px to current position`);
          } catch (error) {
            console.error('Error force applying font size:', error);
          }
        }
      });
    }
  };

  // Listen for text input to apply font to new text
  useEffect(() => {
    const editor = getCurrentEditor();
    if (editor) {
      const unregisterTextListener = editor.registerTextContentListener(() => {
        // Apply font to new text when content changes
        applyFontToNewText();
        applyFontSizeToNewText();
      });

      // Also ensure font size is applied when editor is ready
      const unregisterUpdateListener = editor.registerUpdateListener(() => {
        // Apply current font size to cursor position
        ensureFontSizeForNewText();
      });

      return () => {
        unregisterTextListener();
        unregisterUpdateListener();
      };
    }
  }, [selectedFont, fontSize]);

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
      type: 'bold' as TextFormatType,
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
      type: 'italic' as TextFormatType,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      label: 'Italic',
      shortcut: 'Ctrl+I'
    },
    {
      type: 'underline' as TextFormatType,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
      label: 'Underline',
      shortcut: 'Ctrl+U'
    },
    {
      type: 'strikethrough' as TextFormatType,
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
    <div className="sticky top-0 left-0 right-0 z-40 bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200/60 dark:border-gray-700/60 shadow-lg mt-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-start space-x-6 overflow-x-auto">
          
          {/* Undo/Redo Section */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="group relative p-2.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="group relative p-2.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

          {/* Text Formatting Section */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 relative">
            {/* Active format count indicator */}

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
                  className={`group relative p-2.5 rounded-md transition-all duration-200 ${
                    isActive 
                      ? 'bg-purple-400 dark:bg-purple-500 text-white shadow-md' 
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

          



          {/* Font Family Section */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Font</label>
            <select
              value={selectedFont}
              onChange={(e) => handleFontChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all duration-200"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Source Sans Pro">Source Sans Pro</option>
              <option value="Ubuntu">Ubuntu</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Merriweather">Merriweather</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
              <option value="Courier New">Courier New</option>
              <option value="Nunito">Nunito</option>
              <option value="Work Sans">Work Sans</option>
              <option value="Raleway">Raleway</option>
              <option value="Quicksand">Quicksand</option>
              <option value="Comfortaa">Comfortaa</option>
              <option value="Josefin Sans">Josefin Sans</option>
              <option value="Bebas Neue">Bebas Neue</option>
              <option value="Pacifico">Pacifico</option>
              <option value="Garamond">Garamond</option>
              <option value="Baskerville">Baskerville</option>
              <option value="Palatino">Palatino</option>
              <option value="Optima">Optima</option>
              <option value="Futura">Futura</option>
              <option value="Gill Sans">Gill Sans</option>
              <option value="Myriad Pro">Myriad Pro</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="DM Sans">DM Sans</option>
              <option value="Outfit">Outfit</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Albert Sans">Albert Sans</option>
              <option value="Onest">Onest</option>
              <option value="Geist">Geist</option>
              <option value="Cabinet Grotesk">Cabinet Grotesk</option>
              <option value="General Sans">General Sans</option>
              <option value="Libre Baskerville">Libre Baskerville</option>
              <option value="Crimson Text">Crimson Text</option>
              <option value="Lora">Lora</option>
              <option value="Source Serif Pro">Source Serif Pro</option>
              <option value="Abril Fatface">Abril Fatface</option>
              <option value="Bodoni Moda">Bodoni Moda</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Fira Code">Fira Code</option>
              <option value="Cascadia Code">Cascadia Code</option>
              <option value="Monaco">Monaco</option>
              <option value="Consolas">Consolas</option>
              <option value="Menlo">Menlo</option>
              <option value="SF Mono">SF Mono</option>
              <option value="Inconsolata">Inconsolata</option>
              <option value="Caveat">Caveat</option>
              <option value="Dancing Script">Dancing Script</option>
              <option value="Great Vibes">Great Vibes</option>
              <option value="Satisfy">Satisfy</option>
              <option value="Kaushan Script">Kaushan Script</option>
              <option value="Allura">Allura</option>
              <option value="Alex Brush">Alex Brush</option>
              <option value="Tangerine">Tangerine</option>
            </select>
          </div>

          {/* Font Size Section - Canva Style */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</label>
            <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              {/* Decrease Button */}
              <button
                onClick={decreaseFontSize}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 border-r border-gray-300 dark:border-gray-600"
                title="Decrease Font Size"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              {/* Current Size Display */}
              <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[60px] text-center">
                {fontSize}px
              </div>
              
              {/* Increase Button */}
              <button
                onClick={increaseFontSize}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 border-l border-gray-300 dark:border-gray-600"
                title="Increase Font Size"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Text Color Section */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
                title="Text Color"
              />
          </div>

          {/* Text Alignment Section */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {alignmentButtons.map((button) => (
                <button
                  key={button.type}
                  onClick={() => formatElement(button.type)}
                  className="group relative p-2.5 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  title={button.label}
                >
                  {button.icon}
                </button>
              ))}
          </div>

          {/* Additional Tools Section */}
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFormatting}
              className={`group relative p-2.5 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                (isBold || isItalic || isUnderline || isStrikethrough)
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30'
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
              onClick={forceRefreshFormatting}
              className="group relative p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title="Refresh Formatting State"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            
            <button
              onClick={insertLink}
              className="group relative p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              title="Insert Link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            
            {/* Enhanced GPT Search Button */}
            <button
              onClick={() => setShowGPTSearch(!showGPTSearch)}
              className="group relative p-2.5 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg hover:scale-105 border border-transparent hover:border-blue-200 dark:hover:border-blue-700/30"
              title="AI-Powered Search"
            >
              <div className="relative">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </button>
            
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            
            {/* Translation Button */}
            <TranslationButton variant="top" />
          </div>

        </div>
      </div>
    </div>
  );
});

export default TopToolbar; 