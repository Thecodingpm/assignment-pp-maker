'use client';

import React, { useRef, useCallback } from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { TextElement, ShapeElement, ImageElement, EditorElement } from '../types/editor';

interface CanvasProps {
  width?: number;
  height?: number;
}

const Canvas: React.FC<CanvasProps> = ({ 
  width = 1920, 
  height = 1080 
}) => {
  const {
    getCurrentSlide,
    getSelectedElement,
    selectedElementIds,
    selectElement,
    deselectAll,
    updateElement,
    createTextElement,
    createShapeElement,
    createImageElement,
    zoom,
    setZoom,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const currentSlide = getCurrentSlide();

  // Handle canvas click to create elements or deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      deselectAll();
      
      // Create a text element on double click
      if (e.detail === 2) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / zoom;
          const y = (e.clientY - rect.top) / zoom;
          createTextElement(x, y);
        }
      }
    }
  }, [deselectAll, createTextElement, zoom]);

  // Handle element click to select
  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    selectElement(elementId, e.shiftKey);
  }, [selectElement]);

  // Render text element
  const renderTextElement = (element: TextElement) => (
    <div
      key={element.id}
      className={`absolute cursor-pointer select-none ${
        selectedElementIds.includes(element.id) 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : 'hover:ring-1 hover:ring-gray-300'
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onClick={(e) => handleElementClick(e, element.id)}
    >
      <div
        className="w-full h-full flex items-center justify-start p-2"
        style={{
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.textAlign,
          lineHeight: element.lineHeight,
        }}
      >
        {element.content}
      </div>
    </div>
  );

  // Render shape element
  const renderShapeElement = (element: ShapeElement) => (
    <div
      key={element.id}
      className={`absolute cursor-pointer select-none ${
        selectedElementIds.includes(element.id) 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : 'hover:ring-1 hover:ring-gray-300'
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onClick={(e) => handleElementClick(e, element.id)}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundColor: element.fillColor,
          border: element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.strokeColor}` : 'none',
          borderRadius: element.shapeType === 'circle' ? '50%' : 
                       element.shapeType === 'rectangle' ? '8px' : '0',
          clipPath: element.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                    element.shapeType === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
        }}
      />
    </div>
  );

  // Render image element
  const renderImageElement = (element: ImageElement) => (
    <div
      key={element.id}
      className={`absolute cursor-pointer select-none ${
        selectedElementIds.includes(element.id) 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : 'hover:ring-1 hover:ring-gray-300'
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onClick={(e) => handleElementClick(e, element.id)}
    >
      <img
        src={element.src}
        alt={element.alt}
        className="w-full h-full object-cover rounded-lg"
        style={{
          opacity: (element as any).opacity || 1,
          borderRadius: (element as any).cornerRadius ? `${(element as any).cornerRadius}px` : '8px',
        }}
        draggable={false}
      />
    </div>
  );

  if (!currentSlide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Slide Available</h3>
          <p className="text-gray-500">Create a new slide to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="relative">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
          >
            +
          </button>
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
          >
            −
          </button>
          <div className="text-xs text-center text-gray-600 px-1">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Canvas Container */}
        <div
          ref={canvasRef}
          className="bg-white shadow-xl rounded-lg overflow-hidden cursor-crosshair relative"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            backgroundColor: currentSlide.backgroundColor,
          }}
          onClick={handleCanvasClick}
        >
          {/* Elements */}
          {currentSlide.elements.map((element) => {
            switch (element.type) {
              case 'text':
                return renderTextElement(element as TextElement);
              case 'shape':
                return renderShapeElement(element as ShapeElement);
              case 'image':
                return renderImageElement(element as ImageElement);
              default:
                return null;
            }
          })}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Click</span> to select • <span className="font-medium">Double-click</span> to add text
          </p>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
