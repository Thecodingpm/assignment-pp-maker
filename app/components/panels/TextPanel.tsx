'use client';

import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { TextElement } from '../../types/editor';

interface TextPanelProps {
  element: TextElement;
}

const TextPanel: React.FC<TextPanelProps> = ({ element }) => {
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
      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size
        </label>
        <input
          type="number"
          value={element.fontSize}
          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 12)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="8"
          max="200"
          step="1"
        />
        <div className="text-xs text-gray-500 mt-1">
          Range: 8px - 200px
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Color
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={element.color}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={element.color}
            onChange={(e) => handlePropertyChange('color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Family
        </label>
        <select
          value={element.fontFamily}
          onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
        </select>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Weight
        </label>
        <select
          value={element.fontWeight}
          onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="300">Light (300)</option>
          <option value="400">Regular (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semi Bold (600)</option>
          <option value="700">Bold (700)</option>
          <option value="800">Extra Bold (800)</option>
          <option value="900">Black (900)</option>
        </select>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Alignment
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'left', icon: '⬅️', label: 'Left' },
            { value: 'center', icon: '↔️', label: 'Center' },
            { value: 'right', icon: '➡️', label: 'Right' },
            { value: 'justify', icon: '⬌', label: 'Justify' },
          ].map((align) => (
            <button
              key={align.value}
              onClick={() => handlePropertyChange('textAlign', align.value)}
              className={`p-2 rounded-md text-sm font-medium transition-colors ${
                element.textAlign === align.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={align.label}
            >
              <div className="text-lg">{align.icon}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Height
        </label>
        <input
          type="range"
          min="0.8"
          max="3"
          step="0.1"
          value={element.lineHeight}
          onChange={(e) => handlePropertyChange('lineHeight', parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.8</span>
          <span className="font-medium">{element.lineHeight}</span>
          <span>3.0</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Content
        </label>
        <textarea
          value={element.content}
          onChange={(e) => handlePropertyChange('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Enter your text here..."
        />
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div 
          className="p-4 border border-gray-200 rounded-md bg-gray-50"
          style={{
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            color: element.color,
            textAlign: element.textAlign,
            lineHeight: element.lineHeight,
          }}
        >
          {element.content || 'Preview text...'}
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

export default TextPanel;
