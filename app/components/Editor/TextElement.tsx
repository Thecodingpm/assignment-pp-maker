'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../stores/useEditorStore';
import { TextElement as TextElementType } from '../../types/editor';
import ResizeHandles from './ResizeHandles';
import { snapToGuides, calculateVelocityReduction } from '../../utils/magneticSnapping';

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

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Start dragging immediately
    setIsDragging(true);
    setIsDraggingElement(true);
    
    // Calculate drag offset
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      setDragOffset({ x: offsetX, y: offsetY });
    }
    
    // Handle selection
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      onSelect(true);
    } else {
      // Single click - select and potentially start editing
      onSelect(false);
      
      // If it's a text element and not already editing, start editing
      if (element.type === 'text' && !element.isEditing) {
        startTextEditing(element.id);
      }
    }
    
    // Call onDragStart if provided
    onDragStart?.(element);
  }, [element, onSelect, startTextEditing, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Get canvas for proper coordinate calculation
    const canvas = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const zoom = useEditorStore.getState().zoom;
    
    // Calculate raw position
    const rawX = (e.clientX - canvasRect.left) / zoom - dragOffset.x;
    const rawY = (e.clientY - canvasRect.top) / zoom - dragOffset.y;
    
    // Get current slide and elements for magnetic snapping
    const { slides, currentSlideIndex, updateElement } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;
    
    // Calculate velocity to detect active dragging
    const deltaX = e.movementX;
    const deltaY = e.movementY;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const isActivelyDragging = velocity > 3; // Same threshold as SlideCanvas
    
    let finalX = rawX;
    let finalY = rawY;
    
    // Only apply magnetic snapping when not actively dragging
    if (!isActivelyDragging) {
      // Apply magnetic snapping with proper canvas size
      const snappedPosition = snapToGuides(
        { x: rawX, y: rawY },
        element,
        currentSlide.elements,
        { width: 1920, height: 1080 } // Default canvas size
      );
      
      // Use snapped position if available, otherwise use raw position
      finalX = snappedPosition.isSnapped ? snappedPosition.x : rawX;
      finalY = snappedPosition.isSnapped ? snappedPosition.y : rawY;
    }
    
    // Update element position
    updateElement(currentSlide.id, element.id, { x: finalX, y: finalY });
  }, [isDragging, dragOffset, element]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setIsDraggingElement(false);
      onDragEnd?.();
    }
  }, [isDragging, setIsDraggingElement, onDragEnd]);

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
          className="w-full h-full resize-none border-none outline-none bg-transparent text-black p-2 font-sans"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
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
          className="w-full h-full p-2 font-sans cursor-pointer"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
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
