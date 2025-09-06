'use client';

import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { ShapeElement } from '../../types/editor';

interface ShapePanelProps {
  element: ShapeElement;
}

const ShapePanel: React.FC<ShapePanelProps> = ({ element }) => {
  const { updateElement, getCurrentSlide } = useEditorStore();
  const currentSlide = getCurrentSlide();

  const handlePropertyChange = (property: string, value: any) => {
    if (!currentSlide) return;
    
    updateElement(currentSlide.id, element.id, {
      [property]: value,
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Shape Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shape Type
        </label>
        <select
          value={element.shapeType}
          onChange={(e) => handlePropertyChange('shapeType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
          <option value="diamond">Diamond</option>
          <option value="star">Star</option>
          <option value="line">Line</option>
        </select>
      </div>

      {/* Fill Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fill Color
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={element.fillColor}
            onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.fillColor}
            onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="#3B82F6"
          />
        </div>
      </div>

      {/* Border Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Color
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={element.strokeColor}
            onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.strokeColor}
            onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="#1E40AF"
          />
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Width
        </label>
        <input
          type="number"
          value={element.strokeWidth}
          onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0"
          max="20"
          step="1"
        />
        <div className="text-xs text-gray-500 mt-1">
          Range: 0px - 20px (0 = no border)
        </div>
      </div>

      {/* Border Width Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Width (Slider)
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={element.strokeWidth}
          onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0px</span>
          <span className="font-medium">{element.strokeWidth}px</span>
          <span>20px</span>
        </div>
      </div>

      {/* Shape Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center h-24">
          <div
            className="w-16 h-16"
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
      </div>

      {/* Quick Color Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Colors
        </label>
        <div className="grid grid-cols-6 gap-2">
          {[
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
            '#8B5CF6', '#EC4899', '#6B7280', '#000000'
          ].map((color) => (
            <button
              key={color}
              onClick={() => handlePropertyChange('fillColor', color)}
              className={`w-8 h-8 rounded-md border-2 ${
                element.fillColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Border Style Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePropertyChange('strokeWidth', 0)}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              element.strokeWidth === 0
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No Border
          </button>
          <button
            onClick={() => handlePropertyChange('strokeWidth', 2)}
            className={`p-2 rounded-md text-sm font-medium transition-colors ${
              element.strokeWidth === 2
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Thin Border
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ShapePanel;
