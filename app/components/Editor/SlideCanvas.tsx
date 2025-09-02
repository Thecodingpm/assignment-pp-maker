'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../stores/useEditorStore';
import { TextElement } from '../../types/editor';
import TextElementComponent from './TextElement';
import ResizeHandles from './ResizeHandles';
import SelectionBox from './SelectionBox';
import { GuideRenderer } from './GuideRenderer';

interface SlideCanvasProps {
  width?: number;
  height?: number;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({ 
  width = 1920, 
  height = 1080 
}) => {
  const {
    slides,
    currentSlideIndex,
    selectedElementIds,
    zoom,
    canvasSize,
    addElement,
    selectElement,
    deselectAll,
    setCanvasSize,
    startTextEditing,
    isDraggingElement,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[currentSlideIndex];
  const [draggingElement, setDraggingElement] = useState<EditorElement | null>(null);

  // Set canvas size on mount
  useEffect(() => {
    setCanvasSize({ width, height });
  }, [width, height, setCanvasSize]);

  // Handle canvas click to create text box
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Don't create text box if we're dragging an element
    if (isDraggingElement) return;
    
    // Add a small delay to prevent accidental creation during quick movements
    setTimeout(() => {
      if (isDraggingElement) return;
      
      if (e.target === canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        
        // Create new text element at click position
        const newTextElement: Omit<TextElement, 'id' | 'selected'> = {
          type: 'text',
          x,
          y,
          width: 200,
          height: 60,
          rotation: 0,
          zIndex: 1,
          content: 'Add text',
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1.2,
          isEditing: false,
        };
        
        addElement(currentSlide.id, newTextElement);
        deselectAll();
        
        // Automatically start editing the new text element
        setTimeout(() => {
          const newElementId = currentSlide.elements[currentSlide.elements.length - 1]?.id;
          if (newElementId) {
            startTextEditing(newElementId);
          }
        }, 100);
      }
    }, 50);
  }, [currentSlide, zoom, addElement, deselectAll, startTextEditing, isDraggingElement]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementIds.length > 0) {
        // Delete selected elements
        selectedElementIds.forEach(elementId => {
          // This would need to be implemented in the store
          console.log('Delete element:', elementId);
        });
      }
      
      if (e.key === 'Escape') {
        deselectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, deselectAll]);

  if (!currentSlide) {
    return <div>No slide available</div>;
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="relative">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <button
            onClick={() => useEditorStore.getState().setZoom(zoom + 0.1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
          >
            +
          </button>
          <button
            onClick={() => useEditorStore.getState().setZoom(zoom - 0.1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
          >
            -
          </button>
          <div className="text-xs text-center text-gray-600">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Canvas Container */}
        <motion.div
          ref={canvasRef}
          data-canvas
          className="bg-white shadow-xl rounded-lg overflow-hidden cursor-crosshair relative"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          onClick={handleCanvasClick}
        >
          {/* Invisible overlay for better click detection */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none"
          />
          {/* Background */}
          <div 
            className="w-full h-full"
            style={{ backgroundColor: currentSlide.backgroundColor }}
          >
            {/* Elements */}
            {currentSlide.elements.map((element) => {
              if (element.type === 'text') {
                return (
                  <TextElementComponent
                    key={element.id}
                    element={element}
                    isSelected={selectedElementIds.includes(element.id)}
                    onSelect={(multiSelect) => selectElement(element.id, multiSelect)}
                    onDragStart={(element) => {
                      console.log('SlideCanvas: onDragStart called', element.id);
                      setDraggingElement(element);
                    }}
                    onDragMove={(element) => {
                      console.log('SlideCanvas: onDragMove called', element.id, 'at', element.x, element.y);
                      setDraggingElement(element);
                    }}
                    onDragEnd={() => {
                      console.log('SlideCanvas: onDragEnd called');
                      setDraggingElement(null);
                      // Ensure guides are cleared when drag ends
                      console.log('SlideCanvas: clearing drag state');
                    }}
                  />
                );
              }
              return null;
            })}
          </div>
          
          {/* Smart Guides - positioned relative to canvas */}
          <GuideRenderer
            key={`guides-${draggingElement?.id || 'none'}`}
            draggingElement={draggingElement}
            allElements={currentSlide.elements}
            selectedElementIds={selectedElementIds}
            canvasSize={canvasSize}
            zoom={zoom}
            isVisible={isDraggingElement}
          />
          


          {/* Selection Box for multi-select */}
          <SelectionBox />
        </motion.div>
      </div>
    </div>
  );
};

export default SlideCanvas;
