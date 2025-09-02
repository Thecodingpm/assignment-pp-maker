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
}

const TextElement: React.FC<TextElementProps> = ({ 
  element, 
  isSelected, 
  onSelect 
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
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    
    // Update element height
    const { slides, currentSlideIndex } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      updateElement(currentSlide.id, element.id, { 
        height: Math.max(60, textarea.scrollHeight + 20) 
      });
    }
  }, [element.id, updateTextContent, updateElement]);

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
      stopTextEditing();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      stopTextEditing();
    }
  }, [stopTextEditing]);

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Set global dragging state
    setIsDraggingElement(true);
    
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
  }, [element.isEditing, element.x, element.y, setIsDraggingElement]);

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
  }, [setIsDraggingElement]);

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
              ? 'ring-2 ring-green-500 bg-green-50 bg-opacity-30' 
              : isSelected 
                ? 'border-2 border-purple-500 border-dashed' 
                : 'hover:border hover:border-purple-300 hover:border-dashed'
          }`}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
        {element.isEditing ? (
          // Editable textarea
          <textarea
            ref={textareaRef}
            value={element.content}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleTextKeyDown}
            className="w-full h-full bg-transparent border-none outline-none resize-none p-2 text-center focus:ring-2 focus:ring-blue-300"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              color: element.color,
              textAlign: element.textAlign as any,
              lineHeight: element.lineHeight,
              minHeight: '20px',
            }}
            placeholder="Type your text here..."
          />
        ) : (
          // Display text
          <div
            className="w-full h-full flex items-center justify-center p-2 cursor-text hover:bg-blue-50 hover:bg-opacity-30 transition-colors"
            style={{
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              fontWeight: element.fontWeight,
              color: element.content === 'Add text' ? '#9ca3af' : element.color,
              textAlign: element.textAlign as any,
              lineHeight: element.lineHeight,
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
