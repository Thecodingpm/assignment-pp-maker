'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { TextElement as TextElementType } from '../../types/editor';
import ResizeHandles from './ResizeHandles';
import SimpleColorPicker from '../SimpleColorPicker';

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
  onSelect: (multiSelect: boolean) => void;
  onDragStart?: (element: TextElementType) => void;
  onDragEnd?: () => void;
}

const TextElement: React.FC<TextElementProps> = ({ 
  element, 
  isSelected, 
  onSelect,
  onDragStart,
  onDragEnd
}) => {
  const { updateElement, startTextEditing, stopTextEditing, updateTextContent, selectElement, triggerDesignPopup, deselectAll, slides, currentSlideIndex, deleteElement } = useEditorStore();
  const currentSlide = slides[currentSlideIndex];
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle container click - just select the element, don't start editing
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't handle clicks on the textarea or text div - let them handle their own clicks
    if (e.target === textareaRef.current || e.target === e.currentTarget.querySelector('.text-content')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      onSelect(true);
    } else {
      // Single click - just select the element
      onSelect(false);
    }
  }, [onSelect]);

  // Handle clicking on the text content - start text editing
  const handleTextClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      onSelect(true);
    } else {
      // Single click - start text editing mode
      startTextEditing(element.id);
      onSelect(false);
    }
  }, [onSelect, startTextEditing, element.id]);

  // Handle text changes
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const newCursorPosition = e.target.selectionStart || 0;
    
    updateTextContent(element.id, newContent);
    setCursorPosition(newCursorPosition);
    
    // Only auto-resize when content actually needs more height
    const textarea = e.target;
    const currentHeight = textarea.scrollHeight;
    const containerHeight = textarea.clientHeight;
    
    // Only resize if content is overflowing or significantly under-utilizing space
    if (currentHeight > containerHeight + 10 || currentHeight < containerHeight - 20) {
      const newHeight = Math.max(60, currentHeight + 20);
      
      // Update element height only if it actually changed
      const { slides, currentSlideIndex } = useEditorStore.getState();
      const currentSlide = slides[currentSlideIndex];
      if (currentSlide && newHeight !== element.height) {
        updateElement(currentSlide.id, element.id, { 
          height: newHeight 
        });
      }
    }
  }, [element.id, element.height, updateTextContent, updateElement]);

  const handleTextBlur = useCallback((e: React.FocusEvent) => {
    // Save cursor position before blurring
    const textarea = e.target as HTMLTextAreaElement;
    setCursorPosition(textarea.selectionStart || 0);
    
    // Add a small delay to prevent immediate blur when clicking on resize handles
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        stopTextEditing();
      }
    }, 100);
  }, [stopTextEditing]);

  const handleTextareaClick = useCallback((e: React.MouseEvent) => {
    // Don't prevent default - let the textarea handle cursor placement naturally
    e.stopPropagation();
  }, []);

  const handleDesignClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Set the current text element as selected
    selectElement(element.id, false);
    // Trigger the global design popup for text
    triggerDesignPopup('text');
  }, [selectElement, element.id, triggerDesignPopup]);

  const handleAlignmentChange = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      updateElement(currentSlide.id, element.id, { textAlign: alignment } as any);
    }
  }, [element.id]);

  const handleFontWeightToggle = useCallback(() => {
    const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      const newWeight = element.fontWeight === 'bold' || element.fontWeight === '700' ? 'normal' : 'bold';
      updateElement(currentSlide.id, element.id, { fontWeight: newWeight } as any);
    }
  }, [element.id, element.fontWeight]);

  const handleFontSizeIncrease = useCallback(() => {
    const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      const newSize = Math.min(element.fontSize + 2, 200); // Max size 200
      
      // Calculate new height based on font size (roughly 1.5x font size for line height)
      const newHeight = Math.max(newSize * 1.5 + 20, 60); // Minimum height of 60px
      
      // Calculate new width based on font size (roughly 8x font size for character width)
      const newWidth = Math.max(newSize * 8, 100); // Minimum width of 100px
      
      updateElement(currentSlide.id, element.id, { 
        fontSize: newSize,
        height: newHeight,
        width: newWidth
      } as any);
      
      // Don't auto-deselect to prevent glitchy behavior
    }
  }, [element.id, element.fontSize, element.height, element.width]);

  const handleFontSizeDecrease = useCallback(() => {
    const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      const newSize = Math.max(element.fontSize - 2, 8); // Min size 8
      
      // Calculate new height based on font size (roughly 1.5x font size for line height)
      const newHeight = Math.max(newSize * 1.5 + 20, 60); // Minimum height of 60px
      
      // Calculate new width based on font size (roughly 8x font size for character width)
      const newWidth = Math.max(newSize * 8, 100); // Minimum width of 100px
      
      updateElement(currentSlide.id, element.id, { 
        fontSize: newSize,
        height: newHeight,
        width: newWidth
      } as any);
      
      // Don't auto-deselect to prevent glitchy behavior
    }
  }, [element.id, element.fontSize, element.height, element.width]);

  const handleItalicToggle = useCallback(() => {
    const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      // Toggle italic by checking if fontFamily includes italic
      const isItalic = element.fontFamily.includes('italic') || element.fontFamily.includes('Italic');
      const newFontFamily = isItalic ? 'Inter' : 'Inter Italic';
      updateElement(currentSlide.id, element.id, { fontFamily: newFontFamily } as any);
    }
  }, [element.id, element.fontFamily]);

  const handleTextStyleChange = useCallback((style: string) => {
    const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      let updates: any = {};
      
      switch (style) {
        case 'Title':
          updates = { 
            fontSize: 48, 
            fontWeight: 'bold', 
            textStyle: 'heading',
            height: Math.max(48 * 1.5 + 20, 60),
            width: Math.max(48 * 8, 100)
          };
          break;
        case 'Subtitle':
          updates = { 
            fontSize: 32, 
            fontWeight: '600', 
            textStyle: 'subheading',
            height: Math.max(32 * 1.5 + 20, 60),
            width: Math.max(32 * 8, 100)
          };
          break;
        case 'Body':
          updates = { 
            fontSize: 16, 
            fontWeight: 'normal', 
            textStyle: 'body',
            height: Math.max(16 * 1.5 + 20, 60),
            width: Math.max(16 * 8, 100)
          };
          break;
        case 'Caption':
          updates = { 
            fontSize: 12, 
            fontWeight: 'normal', 
            textStyle: 'caption',
            height: Math.max(12 * 1.5 + 20, 60),
            width: Math.max(12 * 8, 100)
          };
          break;
        case 'Quote':
          updates = { 
            fontSize: 18, 
            fontWeight: 'normal', 
            textStyle: 'quote', 
            fontFamily: 'Inter Italic',
            height: Math.max(18 * 1.5 + 20, 60),
            width: Math.max(18 * 8, 100)
          };
          break;
        default:
          updates = { textStyle: 'custom' };
      }
      
      updateElement(currentSlide.id, element.id, updates);
      
      // Don't auto-deselect to prevent glitchy behavior
    }
    
    // Close the dropdown after selection
    setShowStyleDropdown(false);
  }, [element.id]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStyleDropdown(false);
      }
    };

    if (showStyleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStyleDropdown]);

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Insert a new line instead of stopping editing
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = element.content.substring(0, start) + '\n' + element.content.substring(end);
      
      // Update content and set cursor position after the new line
      updateTextContent(element.id, newContent);
      
      // Set cursor position after the new line
      setTimeout(() => {
        const newPosition = start + 1;
        textarea.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
        textarea.focus();
      }, 0);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      stopTextEditing();
    }
  }, [element.content, element.id, updateTextContent, stopTextEditing]);

  // Handle key up to track cursor position
  const handleTextKeyUp = useCallback((e: React.KeyboardEvent) => {
    const textarea = e.target as HTMLTextAreaElement;
    setCursorPosition(textarea.selectionStart || 0);
  }, []);

  // Handle mouse up to track cursor position after clicking
  const handleTextareaMouseUp = useCallback((e: React.MouseEvent) => {
    const textarea = e.target as HTMLTextAreaElement;
    setTimeout(() => {
      setCursorPosition(textarea.selectionStart || 0);
    }, 0);
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle selection first
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      onSelect(true);
    } else {
      // Single click - just select, don't start editing automatically
      onSelect(false);
    }
    
    // Call onDragStart if provided - this will trigger the SlideCanvas dragging system
    onDragStart?.(element);
  }, [element, onSelect, onDragStart]);

  // Note: Dragging is now handled by SlideCanvas, not here

  // Focus textarea when editing starts
  useEffect(() => {
    if (element.isEditing && textareaRef.current) {
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          // Only set cursor position if it's the first time editing (cursorPosition is 0)
          // Otherwise, let the user click where they want the cursor
          if (cursorPosition === 0) {
            const position = textarea.value.length;
            textarea.setSelectionRange(position, position);
            setCursorPosition(position);
          }
        }
      }, 10);
    }
  }, [element.isEditing, cursorPosition]);

  // Handle double-click to select all text
  const handleTextareaDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const textarea = e.target as HTMLTextAreaElement;
    // Select all text
    textarea.select();
    setCursorPosition(textarea.selectionStart || 0);
  }, []);

  // Handle delete key - only when box is selected but NOT editing text
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only delete the entire element if:
      // 1. The element is selected
      // 2. We're NOT currently editing text
      // 3. The target is not a text input/textarea
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          isSelected && 
          !element.isEditing &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Deleting text element:', element.id);
        if (currentSlide) {
          deleteElement(currentSlide.id, element.id);
        }
      }
    };

    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, element.isEditing, element.id, currentSlide, deleteElement]);

  return (
    <motion.div
      ref={containerRef}
      className={`absolute cursor-move select-none ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {element.isEditing ? (
        <textarea
          ref={textareaRef}
          value={element.content}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          onKeyUp={handleTextKeyUp}
          onClick={handleTextareaClick}
          onMouseUp={handleTextareaMouseUp}
          onDoubleClick={handleTextareaDoubleClick}
          className="w-full h-full resize-none border-none outline-none bg-transparent text-black p-2 font-sans"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color?.includes('gradient') ? 'transparent' : element.color,
            background: element.color?.includes('gradient') ? element.color : undefined,
            WebkitBackgroundClip: element.color?.includes('gradient') ? 'text' : undefined,
            WebkitTextFillColor: element.color?.includes('gradient') ? 'transparent' : undefined,
            textAlign: element.textAlign,
            lineHeight: element.lineHeight,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'normal',
            height: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            display: 'block',
            flex: '1 1 auto',
            direction: 'ltr',
            overflow: 'auto'
          }}
        />
      ) : (
        <div
          className="w-full h-full p-2 font-sans cursor-text text-content"
          onClick={handleTextClick}
          style={{
            caretColor: 'transparent',
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color?.includes('gradient') ? 'transparent' : element.color,
            background: element.color?.includes('gradient') ? element.color : undefined,
            WebkitBackgroundClip: element.color?.includes('gradient') ? 'text' : undefined,
            WebkitTextFillColor: element.color?.includes('gradient') ? 'transparent' : undefined,
            textAlign: element.textAlign,
            lineHeight: element.lineHeight,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'normal',
            height: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            display: 'block',
            flex: '1 1 auto',
            direction: 'ltr'
          }}
        >
          {element.content}
        </div>
      )}
      
      {/* Floating Text Toolbar */}
      {isSelected && (
        <div className="absolute -top-16 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 flex items-center space-x-1.5 z-20 backdrop-blur-sm">
          {/* Text Style Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setShowStyleDropdown(!showStyleDropdown)}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Type className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {element.textStyle === 'heading' ? 'Title' : 
                 element.textStyle === 'subheading' ? 'Subtitle' :
                 element.textStyle === 'body' ? 'Body' :
                 element.textStyle === 'caption' ? 'Caption' :
                 element.textStyle === 'quote' ? 'Quote' : 'Title'}
              </span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Dropdown Menu */}
            {showStyleDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-32">
                <button 
                  onClick={() => handleTextStyleChange('Title')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
                >
                  Title
                </button>
                <button 
                  onClick={() => handleTextStyleChange('Subtitle')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Subtitle
                </button>
                <button 
                  onClick={() => handleTextStyleChange('Body')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Body
                </button>
                <button 
                  onClick={() => handleTextStyleChange('Caption')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  Caption
                </button>
                <button 
                  onClick={() => handleTextStyleChange('Quote')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
                >
                  Quote
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200"></div>

          {/* Font Size */}
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors">
            <span className="text-sm font-medium text-gray-700">{element.fontSize}</span>
            <div className="flex flex-col">
              <button 
                onClick={handleFontSizeIncrease}
                className="w-3 h-2 text-gray-400 hover:text-gray-700 transition-colors"
                title="Increase font size"
              >
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button 
                onClick={handleFontSizeDecrease}
                className="w-3 h-2 text-gray-400 hover:text-gray-700 transition-colors"
                title="Decrease font size"
              >
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200"></div>

          {/* Text Color */}
          <div className="p-1 rounded-md hover:bg-gray-50 transition-colors">
            <SimpleColorPicker
              value={element.color || '#000000'}
              onChange={(color) => {
                console.log('TextElement color changed to:', color);
                if (currentSlide) {
                  updateElement(currentSlide.id, element.id, { color } as Partial<TextElementType>);
                }
              }}
              className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200"></div>

          {/* Alignment Buttons */}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => handleAlignmentChange('left')}
              className={`p-1 rounded-md transition-colors ${element.textAlign === 'left' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleAlignmentChange('center')}
              className={`p-1 rounded-md transition-colors ${element.textAlign === 'center' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleAlignmentChange('right')}
              className={`p-1 rounded-md transition-colors ${element.textAlign === 'right' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleAlignmentChange('justify')}
              className={`p-1 rounded-md transition-colors ${element.textAlign === 'justify' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50'}`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200"></div>

          {/* Bold Button */}
          <button 
            onClick={handleFontWeightToggle}
            className={`p-1 rounded-md transition-colors ${element.fontWeight === 'bold' || element.fontWeight === '700' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'hover:bg-gray-50'}`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic Button */}
          <button 
            onClick={handleItalicToggle}
            className={`p-1 rounded-md transition-colors ${
              element.fontFamily.includes('italic') || element.fontFamily.includes('Italic')
                ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200"></div>

          {/* Three Dots - Design Options */}
          <button
            onClick={handleDesignClick}
            className="p-1 rounded-md hover:bg-gray-50 transition-colors"
            title="More Design Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Resize handles for selected text elements */}
      {isSelected && (
        <ResizeHandles
          element={element}
          onResize={(newWidth, newHeight) => {
            const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
            const currentSlide = slides[currentSlideIndex];
            if (currentSlide) {
              updateElement(currentSlide.id, element.id, { 
                width: newWidth, 
                height: newHeight 
              });
            }
          }}
        />
      )}
    </motion.div>
  );
};

export default TextElement;
