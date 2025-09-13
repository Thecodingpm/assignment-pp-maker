'use client';

import React from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { TextElement, ShapeElement, ImageElement, EditorElement } from '../types/editor';

const PropertyPanel: React.FC = () => {
  const { selectedElementIds, slides, currentSlideIndex, updateElement, updateSlideBackground, updateSlideBackgroundImage, updateSlideStyle, toggleSlideNumber } = useEditorStore();
  const currentSlide = slides[currentSlideIndex];
  
  // Get the first selected element (for now, just show properties of one element)
  const selectedElement = currentSlide?.elements.find(
    element => selectedElementIds.includes(element.id)
  );

  if (!selectedElement || selectedElementIds.length === 0) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Slide</h3>
        
        {/* Slide Style */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slide style</label>
            <select 
              value={currentSlide?.style || 'L Light'}
              onChange={(e) => updateSlideStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="L Light">L Light</option>
              <option value="L Dark">L Dark</option>
              <option value="M Light">M Light</option>
              <option value="M Dark">M Dark</option>
              <option value="S Light">S Light</option>
              <option value="S Dark">S Dark</option>
            </select>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={currentSlide?.backgroundColor || '#ffffff'}
                onChange={(e) => updateSlideBackground(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <div className="flex space-x-1">
                {['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280'].map(color => (
                  <button
                    key={color}
                    onClick={() => updateSlideBackground(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Background image</label>
            <button 
              onClick={() => {
                // For now, just set a sample background image
                // In a real app, this would open a file picker or image library
                updateSlideBackgroundImage('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left"
            >
              Edit background image
            </button>
          </div>

          {/* Recording */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recording</label>
            <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left">
              Edit take 1
            </button>
          </div>

          {/* Slide Number */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Slide number</label>
            <button 
              onClick={toggleSlideNumber}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                currentSlide?.showSlideNumber ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                currentSlide?.showSlideNumber ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
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
    <div className="space-y-6">
      {/* Text Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Style
        </label>
        <select
          value={element.textStyle || 'body'}
          onChange={(e) => handlePropertyChange('textStyle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="heading">Heading</option>
          <option value="subheading">Subheading</option>
          <option value="body">Body Text</option>
          <option value="caption">Caption</option>
          <option value="quote">Quote</option>
        </select>
      </div>

      {/* Font Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font
        </label>
        <div className="space-y-3">
          <select
            value={element.fontFamily}
            onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Inter">Inter</option>
            <option value="Lato">Lato</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
          </select>
          
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={element.color}
              onChange={(e) => handlePropertyChange('color', e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded-full cursor-pointer"
            />
            <input
              type="number"
              value={element.fontSize}
              onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="8"
              max="200"
            />
            <select
              value={element.fontWeight}
              onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="300">Light</option>
              <option value="400">Regular</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
              <option value="900">Black</option>
            </select>
          </div>
          
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
            <span>More text options</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text alignment
        </label>
        <div className="space-y-2">
          <div className="flex gap-1">
            {['left', 'center', 'right', 'justify'].map((align) => (
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
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="variable">Use variable</option>
          <option value="custom">Custom text</option>
          <option value="placeholder">Placeholder</option>
        </select>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="100"
            value={element.opacity || 100}
            onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value))}
            className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <input
            type="number"
            value={element.opacity || 100}
            onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value))}
            className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
            min="0"
            max="100"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
      </div>

      {/* Shadow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shadow
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['none', 'soft', 'regular', 'retro'].map((shadow) => (
            <button
              key={shadow}
              onClick={() => handlePropertyChange('shadow', shadow)}
              className={`py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                (element.shadow || 'none') === shadow
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {shadow.charAt(0).toUpperCase() + shadow.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Layering Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => handlePropertyChange('zIndex', (element.zIndex || 1) + 1)}
          className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l5-5 5 5M3 17l5 5 5-5" />
          </svg>
          <span>To front</span>
        </button>
        <button
          onClick={() => handlePropertyChange('zIndex', Math.max(0, (element.zIndex || 1) - 1))}
          className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l5 5 5-5M3 7l5-5 5 5" />
          </svg>
          <span>To back</span>
        </button>
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
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Element type indicator */}
          <div className="pb-2 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {selectedElement.type}
            </span>
          </div>

          {/* Size & Position Section */}
          <div className="pb-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Size & position</span>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
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
