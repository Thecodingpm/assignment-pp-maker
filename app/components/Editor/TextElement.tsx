'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../stores/useEditorStore';
import { TextElement as TextElementType } from '../../types/editor';
import ResizeHandles from './ResizeHandles';
import { snapToGuides } from '../../utils/magneticSnapping';
import TextStylesPopup from './TextStylesPopup';

// Linear interpolation function for smooth magnetic snapping
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
  onSelect: (multiSelect: boolean) => void;
  onDragStart?: (element: TextElementType) => void;
  onDragMove?: (element: TextElementType) => void;
  onDragEnd?: () => void;
}

const TextElement: React.FC<TextElementProps> = ({ 
  element, 
  isSelected, 
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd
}) => {
  const { updateElement, startTextEditing, stopTextEditing, updateTextContent, setIsDraggingElement } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [snapState, setSnapState] = useState({ isSnapped: false, strength: 0 });
  const [showTextStyles, setShowTextStyles] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Handle text editing
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select mode
      onSelect(true);
    } else {
      // Single click - show text styles popup
      if (element.type === 'text') {
        // Use viewport coordinates since popup uses fixed positioning
        setPopupPosition({
          x: e.clientX,
          y: e.clientY + 20
        });
        setShowTextStyles(true);
        console.log('TextElement: showing text styles popup at', { x: e.clientX, y: e.clientY + 20 });
      }
      onSelect(false);
    }
  }, [element.type, element.id, onSelect]);

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

  // Handle text style selection
  const handleStyleSelect = useCallback((style: string) => {
    setShowTextStyles(false);
    
    if (style === 'edit') {
      startTextEditing(element.id);
      return;
    }
    
    // Apply text style
    const { slides, currentSlideIndex } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      const updates: Partial<TextElementType> = {};
      
      switch (style) {
        case 'title':
          updates.fontSize = 32;
          updates.fontWeight = 'bold';
          break;
        case 'headline':
          updates.fontSize = 24;
          updates.fontWeight = 'bold';
          break;
        case 'subheadline':
          updates.fontSize = 20;
          updates.fontWeight = 'bold';
          break;
        case 'normal':
          updates.fontSize = 16;
          updates.fontWeight = 'normal';
          break;
        case 'small':
          updates.fontSize = 14;
          updates.fontWeight = 'normal';
          break;
        case 'bullet':
          updates.content = '• ' + element.content;
          break;
        case 'number':
          updates.content = '1. ' + element.content;
          break;
      }
      
      if (Object.keys(updates).length > 0) {
        updateElement(currentSlide.id, element.id, updates);
      }
    }
  }, [element.id, element.content, startTextEditing, updateElement]);

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
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
    
    // Start dragging immediately - the restrictive check was preventing normal dragging
    setIsDragging(true);
    setIsDraggingElement(true);
    onDragStart?.(element);
    console.log('TextElement: drag start', element.id);
  }, [element.isEditing, element.x, element.y, setIsDraggingElement, onDragStart, element]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || element.isEditing) return;

    const canvas = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const zoom = useEditorStore.getState().zoom;

    // Calculate raw mouse position relative to canvas with zoom
    const canvasX = (e.clientX - canvasRect.left) / zoom;
    const canvasY = (e.clientY - canvasRect.top) / zoom;

    const rawX = canvasX - dragOffset.x;
    const rawY = canvasY - dragOffset.y;

    // Get all elements for smart guides and magnetic snapping
    const { slides, currentSlideIndex, canvasSize } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide) return;

    // Call snapToGuides to get snapped coordinates
    const snappedCoords = snapToGuides(
      { x: rawX, y: rawY },
      element,
      currentSlide.elements,
      canvasSize
    );

    // Use snapped coordinates instead of raw mouse coordinates
    const finalX = snappedCoords.x;
    const finalY = snappedCoords.y;
    
    // Update snap state for visual feedback
    setSnapState({
      isSnapped: snappedCoords.isSnapped,
      strength: snappedCoords.snapStrength
    });

    // Smooth position interpolation for magnetic snapping
    if (snappedCoords.isSnapped && snapState.isSnapped) {
      // Use requestAnimationFrame for smooth interpolation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        // Interpolate between current and snapped position
        const interpolatedX = lerp(element.x, finalX, 0.8);
        const interpolatedY = lerp(element.y, finalY, 0.8);
        
        // Update element with interpolated position
        updateElement(currentSlide.id, element.id, { 
          x: interpolatedX, 
          y: interpolatedY 
        });
        
        // Notify parent about drag move with interpolated element
        const updatedElement = { ...element, x: interpolatedX, y: interpolatedY };
        onDragMove?.(updatedElement);
      });
    } else {
      // Direct update for non-snapped movement
      updateElement(currentSlide.id, element.id, { 
        x: finalX, 
        y: finalY 
      });
      
      // Notify parent about drag move with updated element
      const updatedElement = { ...element, x: finalX, y: finalY };
      onDragMove?.(updatedElement);
    }

    // Debug logging: raw mouse position vs snapped position
    if (snappedCoords.isSnapped) {
      console.log('TextElement: SNAPPED TO GUIDES', {
        elementId: element.id,
        rawMousePos: { x: rawX, y: rawY },
        snappedPos: { x: finalX, y: finalY },
        snapStrength: snappedCoords.snapStrength,
        isSnapped: true
      });
    } else {
      console.log('TextElement: normal dragging', element.id, 'raw:', { x: rawX, y: rawY }, 'final:', { x: finalX, y: finalY });
    }
  }, [isDragging, element.isEditing, element.id, element.width, element.height, dragOffset, updateElement, onDragMove, element, snapState.isSnapped]);

  const handleMouseUp = useCallback(() => {
    console.log('TextElement: mouse up', element.id, 'isDragging:', isDragging);
    if (isDragging) {
      console.log('TextElement: drag end', element.id);
      setIsDragging(false);
      
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      
      // Reset snap state
      setSnapState({ isSnapped: false, strength: 0 });
      
      // Reset global dragging state
      setIsDraggingElement(false);
      
      // Notify parent about drag end
      onDragEnd?.();
    }
  }, [isDragging, element.id, setIsDraggingElement, onDragEnd]);

  // Add/remove mouse event listeners
  useEffect(() => {
    console.log('TextElement: useEffect for mouse listeners, isDragging:', isDragging);
    if (isDragging) {
      console.log('TextElement: adding mouse event listeners');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        console.log('TextElement: removing mouse event listeners');
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
    <>
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
          boxShadow: isDragging 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
            : snapState.isSnapped 
              ? `0 0 8px ${snapState.strength > 0.5 ? '#00ff00' : '#ffff00'}, 0 0 16px ${snapState.strength > 0.5 ? '#00ff0040' : '#ffff0040'}`
              : 'none'
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
      
      {/* Debug: Snap State Overlay */}
      {snapState.isSnapped && (
        <div className="absolute -top-8 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded z-50 whitespace-nowrap">
          SNAPPED: {Math.round(snapState.strength * 100)}%
        </div>
      )}
    </motion.div>
    
    {/* Text Styles Popup - positioned outside the motion.div for proper overlay */}
    <TextStylesPopup
      isVisible={showTextStyles}
      onClose={() => setShowTextStyles(false)}
      onStyleSelect={handleStyleSelect}
      position={popupPosition}
    />
    </>
  );
};

export default TextElement;
