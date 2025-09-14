'use client';

import React, { useState } from 'react';
import { 
  Type, 
  Palette, 
  Move, 
  RotateCw, 
  Square, 
  Circle, 
  Triangle, 
  Diamond, 
  Star,
  Image as ImageIcon,
  Layers,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Sparkles
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

const LogoPropertyPanel: React.FC = () => {
  const { 
    slides, 
    currentSlideIndex, 
    selectedElement, 
    updateElement,
    deleteElement,
    duplicateElement
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];
  const element = selectedElement ? currentSlide?.elements?.find(el => el.id === selectedElement) : null;

  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Logo Properties</h3>
          <p className="text-sm text-gray-500">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    if (element && currentSlide) {
      updateElement(currentSlide.id, element.id, { [property]: value });
    }
  };

  const handleDelete = () => {
    if (element && currentSlide) {
      deleteElement(currentSlide.id, element.id);
    }
  };

  const handleDuplicate = () => {
    if (element && currentSlide) {
      duplicateElement(currentSlide.id, element.id);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Properties</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDuplicate}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {element.type === 'text' ? 'Text Element' : 
           element.type === 'image' ? 'Image Element' : 
           element.type === 'shape' ? 'Shape Element' : 'Element'}
        </p>
      </div>

      {/* Position & Size */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Move className="w-4 h-4 mr-2" />
          Position & Size
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X Position</label>
            <input
              type="number"
              value={element.x}
              onChange={(e) => handlePropertyChange('x', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y Position</label>
            <input
              type="number"
              value={element.y}
              onChange={(e) => handlePropertyChange('y', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={element.width}
              onChange={(e) => handlePropertyChange('width', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={element.height}
              onChange={(e) => handlePropertyChange('height', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-xs text-gray-600 mb-1">Rotation</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="360"
              value={element.rotation || 0}
              onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-600 w-12">
              {element.rotation || 0}°
            </span>
          </div>
        </div>
      </div>

      {/* Text Properties */}
      {element.type === 'text' && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Type className="w-4 h-4 mr-2" />
            Text Properties
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Text Content</label>
              <textarea
                value={element.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                <input
                  type="number"
                  value={element.fontSize || 16}
                  onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 16)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                <select
                  value={element.fontFamily || 'Inter'}
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
              <select
                value={element.fontWeight || '400'}
                onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Text Align</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePropertyChange('textAlign', 'left')}
                  className={`p-2 rounded ${element.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePropertyChange('textAlign', 'center')}
                  className={`p-2 rounded ${element.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePropertyChange('textAlign', 'right')}
                  className={`p-2 rounded ${element.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={element.color || '#000000'}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={element.color || '#000000'}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shape Properties */}
      {element.type === 'shape' && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Square className="w-4 h-4 mr-2" />
            Shape Properties
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Shape Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'rectangle', icon: Square },
                  { type: 'circle', icon: Circle },
                  { type: 'triangle', icon: Triangle },
                  { type: 'diamond', icon: Diamond },
                  { type: 'star', icon: Star }
                ].map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handlePropertyChange('shapeType', type)}
                    className={`p-2 rounded flex items-center justify-center ${
                      element.shapeType === type ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Fill Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={element.fillColor || '#3B82F6'}
                  onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={element.fillColor || '#3B82F6'}
                  onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Stroke Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={element.strokeColor || '#1E40AF'}
                  onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={element.strokeColor || '#1E40AF'}
                  onChange={(e) => handlePropertyChange('strokeColor', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Stroke Width</label>
              <input
                type="range"
                min="0"
                max="20"
                value={element.strokeWidth || 0}
                onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>{element.strokeWidth || 0}px</span>
                <span>20</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Properties */}
      {element.type === 'image' && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Image Properties
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Image Source</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={element.src || ''}
                  onChange={(e) => handlePropertyChange('src', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Image URL"
                />
                <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                  Upload
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Alt Text</label>
              <input
                type="text"
                value={element.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alternative text"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="100"
                value={element.opacity || 100}
                onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>{element.opacity || 100}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layer Properties */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Layer Properties
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Z-Index (Layer Order)</label>
            <input
              type="number"
              value={element.zIndex || 1}
              onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value) || 1)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Visible</span>
            <button
              onClick={() => handlePropertyChange('visible', !element.visible)}
              className={`p-1 rounded ${element.visible !== false ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              {element.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Locked</span>
            <button
              onClick={() => handlePropertyChange('locked', !element.locked)}
              className={`p-1 rounded ${element.locked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
            >
              {element.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* AI Enhance */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
          <Sparkles className="w-4 h-4" />
          <span>AI Enhance Element</span>
        </button>
      </div>
    </div>
  );
};

export default LogoPropertyPanel;
