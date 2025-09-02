'use client';

import React from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { TextElement, ShapeElement, ImageElement, EditorElement } from '../types/editor';

const PropertyPanel: React.FC = () => {
  const { selectedElementIds, slides, currentSlideIndex, updateElement } = useEditorStore();
  const currentSlide = slides[currentSlideIndex];
  
  // Get the first selected element (for now, just show properties of one element)
  const selectedElement = currentSlide?.elements.find(
    element => selectedElementIds.includes(element.id)
  );

  if (!selectedElement || selectedElementIds.length === 0) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
        <p className="text-gray-500 text-sm">Select an element to view its properties</p>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    if (!currentSlide) return;
    
    updateElement(currentSlide.id, selectedElement.id, {
      [property]: value,
    });
  };

  const renderTextProperties = (element: TextElement) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={element.content}
          onChange={(e) => handlePropertyChange('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Family
        </label>
        <select
          value={element.fontFamily}
          onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size
        </label>
        <input
          type="number"
          value={element.fontSize}
          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="8"
          max="200"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Weight
        </label>
        <select
          value={element.fontWeight}
          onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="300">Light</option>
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semi Bold</option>
          <option value="700">Bold</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Color
        </label>
        <input
          type="color"
          value={element.color}
          onChange={(e) => handlePropertyChange('color', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Align
        </label>
        <div className="flex gap-2">
          {['left', 'center', 'right'].map((align) => (
            <button
              key={align}
              onClick={() => handlePropertyChange('textAlign', align)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                element.textAlign === align
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShapeProperties = (element: ShapeElement) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shape Type
        </label>
        <select
          value={element.shapeType}
          onChange={(e) => handlePropertyChange('shapeType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fill Color
        </label>
        <input
          type="color"
          value={element.fillColor}
          onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stroke Color
        </label>
        <input
          type="color"
          value={element.strokeColor}
          onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stroke Width
        </label>
        <input
          type="number"
          value={element.strokeWidth}
          onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          max="20"
        />
      </div>
    </div>
  );

  const renderImageProperties = (element: ImageElement) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={element.alt}
          onChange={(e) => handlePropertyChange('alt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Image description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image Preview
        </label>
        <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
          <img
            src={element.src}
            alt={element.alt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );

  const renderCommonProperties = () => (
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position X
        </label>
        <input
          type="number"
          value={Math.round(selectedElement.x)}
          onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Position Y
        </label>
        <input
          type="number"
          value={Math.round(selectedElement.y)}
          onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Width
        </label>
        <input
          type="number"
          value={Math.round(selectedElement.width)}
          onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="10"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Height
        </label>
        <input
          type="number"
          value={Math.round(selectedElement.height)}
          onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="10"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rotation
        </label>
        <input
          type="number"
          value={selectedElement.rotation}
          onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          max="360"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Z-Index
        </label>
        <input
          type="number"
          value={selectedElement.zIndex}
          onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
        />
      </div>
    </div>
  );

  return (
    <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
        
        <div className="space-y-4">
          {/* Element type indicator */}
          <div className="pb-2 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {selectedElement.type}
            </span>
          </div>
          
          {/* Type-specific properties */}
          {selectedElement.type === 'text' && renderTextProperties(selectedElement as TextElement)}
          {selectedElement.type === 'shape' && renderShapeProperties(selectedElement as ShapeElement)}
          {selectedElement.type === 'image' && renderImageProperties(selectedElement as ImageElement)}
          
          {/* Common properties */}
          {renderCommonProperties()}
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
