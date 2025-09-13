'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';

interface DraggableShapeProps {
  type: 'rectangle' | 'circle' | 'triangle' | 'hexagon';
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onRemove?: () => void;
}

export default function DraggableShape({ 
  type, 
  initialPosition = { x: 100, y: 100 }, 
  initialSize = { width: 150, height: 100 },
  onRemove 
}: DraggableShapeProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const shapeRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === resizeHandleRef.current) return;
    
    setIsDragging(true);
    setIsSelected(true);
    const rect = shapeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.preventDefault();
  };

  // Handle mouse down for resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setIsSelected(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Get canvas for proper coordinate calculation
        const canvas = document.querySelector('[data-canvas]') as HTMLElement;
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        const zoom = useEditorStore.getState()?.zoom || 1;
        
        // Calculate position relative to canvas
        const newX = (e.clientX - canvasRect.left) / zoom - dragOffset.x;
        const newY = (e.clientY - canvasRect.top) / zoom - dragOffset.y;
        
        setPosition({ x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        setSize({
          width: Math.max(50, resizeStart.width + deltaX),
          height: Math.max(50, resizeStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shapeRef.current && !shapeRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle double click to edit text
  const handleDoubleClick = () => {
    const shape = shapeRef.current;
    if (shape) {
      const textElement = shape.querySelector('.shape-text') as HTMLElement;
      if (textElement) {
        textElement.contentEditable = 'true';
        textElement.focus();
        // Select all text in contentEditable element
        const range = document.createRange();
        range.selectNodeContents(textElement);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  // Handle text editing
  const handleTextBlur = () => {
    const shape = shapeRef.current;
    if (shape) {
      const textElement = shape.querySelector('.shape-text') as HTMLElement;
      if (textElement) {
        textElement.contentEditable = 'false';
      }
    }
  };

  // Generate shape content based on type
  const getShapeContent = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      textAlign: 'center' as const,
      userSelect: 'none' as const,
      cursor: 'move'
    };

    switch (type) {
      case 'rectangle':
        return (
          <div 
            style={{
              ...baseStyle,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
            className="shape-text"
            onBlur={handleTextBlur}
          >
            Rectangle
          </div>
        );
      case 'circle':
        return (
          <div 
            style={{
              ...baseStyle,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
            className="shape-text"
            onBlur={handleTextBlur}
          >
            Circle
          </div>
        );
      case 'triangle':
        return (
          <div 
            style={{
              ...baseStyle,
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
            className="shape-text"
            onBlur={handleTextBlur}
          >
            Triangle
          </div>
        );
      case 'hexagon':
        return (
          <div 
            style={{
              ...baseStyle,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
            className="shape-text"
            onBlur={handleTextBlur}
          >
            Hexagon
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={shapeRef}
      className={`absolute ${isSelected ? 'z-50' : 'z-40'}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {getShapeContent()}
      
      {/* Resize handle */}
      <div
        ref={resizeHandleRef}
        className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}
        style={{
          transform: 'translate(50%, 50%)',
          zIndex: 1000
        }}
      />
      
      {/* Remove button */}
      {isSelected && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors z-50"
          style={{ zIndex: 1001 }}
        >
          ×
        </button>
      )}
    </div>
  );
} 