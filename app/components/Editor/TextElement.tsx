'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../stores/useEditorStore';
import { TextElement as TextElementType } from '../../types/editor';
import ResizeHandles from './ResizeHandles';

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
  const { updateElement, startTextEditing, stopTextEditing, updateTextContent, setIsDraggingElement } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle text editing
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      onSelect(true);
    } else {
      // Single click - start editing if it's a text element
      if (element.type === 'text') {
        startTextEditing(element.id);
      }
      onSelect(false);
    }
  }, [element.type, element.id, startTextEditing, onSelect]);

  // Handle text changes
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    updateTextContent(element.id, newContent);
    
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
    // Add a small delay to prevent immediate blur when clicking on resize handles
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        stopTextEditing();
      }
    }, 100);
  }, [stopTextEditing]);

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
        textarea.setSelectionRange(start + 1, start + 1);
        textarea.focus();
      }, 0);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      stopTextEditing();
    }
  }, [element.content, element.id, updateTextContent, stopTextEditing]);

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Set global dragging state
    setIsDraggingElement(true);
    
    // Notify parent about drag start
    onDragStart?.(element);
    
    // Get the canvas element to calculate proper coordinates
    const canvas = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const zoom = useEditorStore.getState().zoom;
    
    // Calculate position relative to canvas with zoom
    const canvasX = (e.clientX - canvasRect.left) / zoom;
    const canvasY = (e.clientY - canvasRect.top) / zoom;
    
    setDragOffset({
      x: canvasX - element.x,
      y: canvasY - element.y,
    });
    setIsDragging(true);
  }, [element.isEditing, element.x, element.y, setIsDraggingElement, onDragStart, element]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || element.isEditing) return;
    
    const canvas = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const zoom = useEditorStore.getState().zoom;
    
    // Calculate new position relative to canvas with zoom
    const canvasX = (e.clientX - canvasRect.left) / zoom;
    const canvasY = (e.clientY - canvasRect.top) / zoom;
    
    const newX = canvasX - dragOffset.x;
    const newY = canvasY - dragOffset.y;
    
    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, 1920 - element.width));
    const constrainedY = Math.max(0, Math.min(newY, 1080 - element.height));
    
    const { slides, currentSlideIndex } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      updateElement(currentSlide.id, element.id, { 
        x: constrainedX, 
        y: constrainedY 
      });
    }
  }, [isDragging, element.isEditing, element.id, element.width, element.height, dragOffset, updateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Reset global dragging state
    setIsDraggingElement(false);
    // Notify parent about drag end
    onDragEnd?.();
  }, [setIsDraggingElement, onDragEnd]);

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (element.isEditing && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 10);
    }
  }, [element.isEditing]);

  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && isSelected) {
        e.preventDefault();
        // Delete element logic would go here
        console.log('Delete element:', element.id);
      }
    };

    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, element.id]);

  return (
    <motion.div
      ref={containerRef}
      className={`absolute select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none'
      }}
      transition={{ duration: 0.15 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Text Container */}
      <div
        className={`w-full h-full relative ${
          element.isEditing 
            ? 'border border-blue-200 bg-blue-50' 
            : isSelected 
              ? 'border border-blue-300' 
              : 'hover:border hover:border-blue-200'
        }`}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        }}
      >
        {element.isEditing ? (
          // Editable textarea
          <textarea
            ref={textareaRef}
            value={element.content}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleTextKeyDown}
            className="w-full h-full bg-transparent border-none outline-none resize-none p-2 focus:ring-2 focus:ring-blue-300"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              color: element.color,
              textAlign: element.textAlign as any,
              lineHeight: element.lineHeight,
              minHeight: '20px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'normal',
              overflow: 'auto',
              display: 'block',
              direction: 'ltr',
              flex: '1 1 auto',
              resize: 'none',
              maxWidth: '100%',
              boxSizing: 'border-box',
              height: '100%',
            }}
            placeholder="Type your text here..."
          />
        ) : (
          // Display text
          <div
            className="w-full h-full p-2 cursor-text hover:bg-blue-50 hover:bg-opacity-30 transition-colors"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              color: element.content === 'Add text' ? '#9ca3af' : element.color,
              textAlign: element.textAlign as any,
              lineHeight: element.lineHeight,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'normal',
              overflow: 'auto',
              display: 'block',
              direction: 'ltr',
              flex: '1 1 auto',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            {element.content}
          </div>
        )}
      </div>

      {/* Resize Handles */}
      {isSelected && !element.isEditing && (
        <ResizeHandles
          element={element}
          onResize={(newWidth, newHeight) => {
            const { slides, currentSlideIndex } = useEditorStore.getState();
            const currentSlide = slides[currentSlideIndex];
            if (currentSlide) {
              updateElement(currentSlide.id, element.id, {
                width: newWidth,
                height: newHeight,
              });
            }
          }}
        />
      )}
    </motion.div>
  );
};

export default TextElement;
