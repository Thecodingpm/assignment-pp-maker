'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { snapToGuides } from '../../utils/magneticSnapping';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { 
  Move, 
  RotateCw, 
  Square, 
  Circle, 
  Triangle, 
  Diamond, 
  Star,
  Type,
  Image as ImageIcon,
  Palette,
  Layers,
  Grid,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

interface VisualGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  opacity: number;
}

const LogoCanvas: React.FC = () => {
  const { 
    slides, 
    currentSlideIndex, 
    selectedElementIds,
    selectElement,
    deselectAll,
    updateElement,
    deleteElement,
    duplicateElement,
    canvasSize,
    setCanvasSize
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggingElement, setDraggingElement] = useState<any>(null);
  const [visualGuides, setVisualGuides] = useState<VisualGuide[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide?.elements || [];
  const selectedElement = selectedElementIds.length > 0 ? selectedElementIds[0] : null;

  // Generate visual guides for dragging
  const generateVisualGuides = useCallback((
    mouseX: number,
    mouseY: number,
    draggingElement: any,
    allElements: any[]
  ): VisualGuide[] => {
    if (!draggingElement || !showGuides) return [];

    const guides: VisualGuide[] = [];
    const SNAP_THRESHOLD = 10;

    // Slide center guides
    const slideCenterX = canvasSize.width / 2;
    const slideCenterY = canvasSize.height / 2;

    // Check horizontal center alignment
    if (Math.abs(mouseX - slideCenterX) <= SNAP_THRESHOLD) {
      guides.push({
        id: 'slide-center-x',
        type: 'vertical',
        position: slideCenterX,
        color: '#FF4444',
        opacity: 0.8
      });
    }

    // Check vertical center alignment
    if (Math.abs(mouseY - slideCenterY) <= SNAP_THRESHOLD) {
      guides.push({
        id: 'slide-center-y',
        type: 'horizontal',
        position: slideCenterY,
        color: '#FF4444',
        opacity: 0.8
      });
    }

    // Element alignment guides
    allElements.forEach((element) => {
      if (element.id === draggingElement.id) return;

      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;

      // Horizontal alignment
      if (Math.abs(mouseX - element.x) <= SNAP_THRESHOLD) {
        guides.push({
          id: `align-left-${element.id}`,
          type: 'vertical',
          position: element.x,
          color: '#0066FF',
          opacity: 0.6
        });
      }

      if (Math.abs(mouseX - (element.x + element.width)) <= SNAP_THRESHOLD) {
        guides.push({
          id: `align-right-${element.id}`,
          type: 'vertical',
          position: element.x + element.width,
          color: '#0066FF',
          opacity: 0.6
        });
      }

      if (Math.abs(mouseX - elementCenterX) <= SNAP_THRESHOLD) {
        guides.push({
          id: `align-center-x-${element.id}`,
          type: 'vertical',
          position: elementCenterX,
          color: '#0066FF',
          opacity: 0.6
        });
      }

      // Vertical alignment
      if (Math.abs(mouseY - element.y) <= SNAP_THRESHOLD) {
        guides.push({
          id: `align-top-${element.id}`,
          type: 'horizontal',
          position: element.y,
          color: '#0066FF',
          opacity: 0.6
        });
      }

      if (Math.abs(mouseY - (element.y + element.height)) <= SNAP_THRESHOLD) {
        guides.push({
          id: `align-bottom-${element.id}`,
          type: 'horizontal',
          position: element.y + element.height,
          color: '#0066FF',
          opacity: 0.6
        });
      }

      if (Math.abs(mouseY - elementCenterY) <= SNAP_THRESHOLD) {
        guides.push({
          id: `align-center-y-${element.id}`,
          type: 'horizontal',
          position: elementCenterY,
          color: '#0066FF',
          opacity: 0.6
        });
      }
    });

    return guides;
  }, [canvasSize, showGuides]);

  // Handle element selection
  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    selectElement(elementId);
  };

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    deselectAll();
  };

  // Handle element drag start
  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element || !currentSlide) return;
    
    setIsDragging(true);
    selectElement(elementId);
    setDraggingElement(element);
    
    // Calculate drag offset
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      const elementX = element.x * zoom;
      const elementY = element.y * zoom;
      
      const offsetX = (mouseX - elementX) / zoom;
      const offsetY = (mouseY - elementY) / zoom;
      
      setDragOffset({ x: offsetX, y: offsetY });
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle element drag with magnetic snapping
  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !draggingElement) return;

    e.preventDefault();
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;
    
    const rawX = mouseX - dragOffset.x;
    const rawY = mouseY - dragOffset.y;
    
    // Apply magnetic snapping
    const snappedPosition = snapToGuides(
      { x: rawX, y: rawY },
      draggingElement,
      elements.filter(el => el.id !== draggingElement.id),
      canvasSize
    );
    
    // Generate visual guides
    const guides = generateVisualGuides(
      snappedPosition.x + draggingElement.width / 2,
      snappedPosition.y + draggingElement.height / 2,
      draggingElement,
      elements.filter(el => el.id !== draggingElement.id)
    );
    setVisualGuides(guides);
    
    // Update element position with snapped coordinates
    if (currentSlide) {
      updateElement(currentSlide.id, draggingElement.id, {
        x: Math.max(0, Math.min(snappedPosition.x, canvasSize.width - draggingElement.width)),
        y: Math.max(0, Math.min(snappedPosition.y, canvasSize.height - draggingElement.height))
      });
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDraggingElement(null);
    setVisualGuides([]);
  };

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        handleDrag(e as any);
      };

      const handleMouseUp = (e: MouseEvent) => {
        handleDragEnd(e as any);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement || !currentSlide) return;

      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteElement(currentSlide.id, element.id);
          break;
        case 'ArrowUp':
          e.preventDefault();
          updateElement(currentSlide.id, element.id, { y: element.y - step });
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateElement(currentSlide.id, element.id, { y: element.y + step });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          updateElement(currentSlide.id, element.id, { x: element.x - step });
          break;
        case 'ArrowRight':
          e.preventDefault();
          updateElement(currentSlide.id, element.id, { x: element.x + step });
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            duplicateElement(currentSlide.id, element.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, currentSlide, elements, updateElement, deleteElement, duplicateElement]);

  // Render text element
  const renderTextElement = (element: any) => (
    <div
      key={element.id}
      className={`absolute cursor-move select-none ${
        selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: element.x * zoom,
        top: element.y * zoom,
        width: element.width * zoom,
        height: element.height * zoom,
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: element.zIndex || 1,
        opacity: element.opacity || 1
      }}
      onClick={(e) => handleElementClick(e, element.id)}
      onMouseDown={(e) => handleDragStart(e, element.id)}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          fontSize: (element.fontSize || 16) * zoom,
          fontFamily: element.fontFamily || 'Inter',
          fontWeight: element.fontWeight || '400',
          color: element.color || '#000000',
          textAlign: element.textAlign || 'left',
          lineHeight: element.lineHeight || 1.2
        }}
      >
        {element.content || 'Text'}
      </div>
      
      {/* Selection handles */}
      {selectedElement === element.id && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );

  // Render shape element
  const renderShapeElement = (element: any) => {
    const getShapeStyle = () => {
      const baseStyle = {
        width: '100%',
        height: '100%',
        backgroundColor: element.fillColor || 'transparent',
        border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.strokeColor || '#9CA3AF'}` : 'none',
        borderRadius: element.shapeType === 'circle' ? '50%' : 
                     element.shapeType === 'triangle' ? '0' : 
                     element.isRounded ? '1rem' : '0.5rem'
      };

      if (element.shapeType === 'triangle') {
        return {
          ...baseStyle,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          backgroundColor: element.fillColor || 'transparent'
        };
      }

      return baseStyle;
    };

    return (
      <div
        key={element.id}
        className={`absolute cursor-move ${
          selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          left: element.x * zoom,
          top: element.y * zoom,
          width: element.width * zoom,
          height: element.height * zoom,
          transform: `rotate(${element.rotation || 0}deg)`,
          zIndex: element.zIndex || 1,
          opacity: element.opacity || 1
        }}
        onClick={(e) => handleElementClick(e, element.id)}
        onMouseDown={(e) => handleDragStart(e, element.id)}
      >
        <div 
          style={getShapeStyle()}
          className="relative"
          onClick={(e) => {
            e.stopPropagation();
            // Start editing text if double-clicked
            if (e.detail === 2) {
              const { updateElement } = useEditorStore.getState();
              updateElement(currentSlide.id, element.id, { isEditingText: true });
            }
          }}
        >
          {/* Text inside shape */}
          {element.text && (
            <div
              className="absolute inset-0 flex items-center justify-center p-2 cursor-pointer"
              style={{
                color: element.textColor || '#9CA3AF',
                fontSize: element.textSize || 16,
                textAlign: element.textAlign || 'center',
                alignItems: element.textVerticalAlign === 'top' ? 'flex-start' : 
                           element.textVerticalAlign === 'bottom' ? 'flex-end' : 'center',
              }}
            >
              {element.isEditingText ? (
                <textarea
                  className="w-full h-full resize-none border-none outline-none bg-transparent text-center"
                  style={{
                    color: element.textColor || '#9CA3AF',
                    fontSize: element.textSize || 16,
                    textAlign: element.textAlign || 'center',
                  }}
                  value={element.text}
                  onChange={(e) => {
                    const { updateElement } = useEditorStore.getState();
                    updateElement(currentSlide.id, element.id, { text: e.target.value });
                  }}
                  onBlur={() => {
                    const { updateElement } = useEditorStore.getState();
                    updateElement(currentSlide.id, element.id, { isEditingText: false });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      const { updateElement } = useEditorStore.getState();
                      updateElement(currentSlide.id, element.id, { isEditingText: false });
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span>{element.text}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Selection handles */}
        {selectedElement === element.id && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  // Render image element
  const renderImageElement = (element: any) => (
    <div
      key={element.id}
      className={`absolute cursor-move ${
        selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{
        left: element.x * zoom,
        top: element.y * zoom,
        width: element.width * zoom,
        height: element.height * zoom,
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: element.zIndex || 1,
        opacity: element.opacity || 1
      }}
      onClick={(e) => handleElementClick(e, element.id)}
      onMouseDown={(e) => handleDragStart(e, element.id)}
    >
      <img
        src={element.src || ''}
        alt={element.alt || 'Image'}
        className="w-full h-full object-contain rounded"
        draggable={false}
        onError={(e) => {
          console.error('Image load error:', e);
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Selection handles */}
      {selectedElement === element.id && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGuides(!showGuides)}
              className={`p-2 rounded ${showGuides ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              title="Toggle Guides"
            >
              {showGuides ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Canvas: {canvasSize.width} × {canvasSize.height}px
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg"
          style={{
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
            backgroundImage: showGrid ? `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            ` : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto'
          }}
          onClick={handleCanvasClick}
        >
          {/* Center guides */}
          {showGuides && (
            <>
              <div
                className="absolute top-0 bottom-0 w-px bg-red-300 opacity-50"
                style={{ left: (canvasSize.width * zoom) / 2 }}
              ></div>
              <div
                className="absolute left-0 right-0 h-px bg-red-300 opacity-50"
                style={{ top: (canvasSize.height * zoom) / 2 }}
              ></div>
            </>
          )}

          {/* Render elements */}
          {elements
            .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
            .map((element) => {
              switch (element.type) {
                case 'text':
                  return renderTextElement(element);
                case 'shape':
                  return renderShapeElement(element);
                case 'image':
                  return renderImageElement(element);
                default:
                  return null;
              }
            })}

          {/* Visual Guides for Dragging */}
          {visualGuides.map((guide) => (
            <div
              key={guide.id}
              className="absolute pointer-events-none"
              style={{
                left: guide.type === 'vertical' ? guide.position * zoom - 1 : 0,
                top: guide.type === 'horizontal' ? guide.position * zoom - 1 : 0,
                width: guide.type === 'horizontal' ? canvasSize.width * zoom : 2,
                height: guide.type === 'vertical' ? canvasSize.height * zoom : 2,
                backgroundColor: guide.color,
                opacity: guide.opacity,
                zIndex: 1000,
                boxShadow: `0 0 4px ${guide.color}80`,
                borderRadius: '1px'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoCanvas;
