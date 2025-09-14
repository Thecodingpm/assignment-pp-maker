'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
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

const LogoCanvas: React.FC = () => {
  const { 
    slides, 
    currentSlideIndex, 
    selectedElement, 
    setSelectedElement,
    updateElement,
    deleteElement,
    duplicateElement,
    canvasSize,
    setCanvasSize
  } = useEditorStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex];
  const elements = currentSlide?.elements || [];

  // Handle element selection
  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // Handle element drag start
  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedElement(elementId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle element drag
  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const element = elements.find(el => el.id === selectedElement);
    if (element && currentSlide) {
      updateElement(currentSlide.id, element.id, {
        x: element.x + deltaX / zoom,
        y: element.y + deltaY / zoom
      });
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

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
  }, [selectedElement, currentSlide, elements, updateElement, deleteElement, duplicateElement]);

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
        border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.strokeColor || '#000000'}` : 'none',
        borderRadius: element.shapeType === 'circle' ? '50%' : 
                     element.shapeType === 'triangle' ? '0' : '0'
      };

      if (element.shapeType === 'triangle') {
        return {
          ...baseStyle,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          backgroundColor: element.fillColor || '#3B82F6'
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
        <div style={getShapeStyle()}></div>
        
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
        className="w-full h-full object-cover rounded"
        draggable={false}
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
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
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
        </div>
      </div>
    </div>
  );
};

export default LogoCanvas;
