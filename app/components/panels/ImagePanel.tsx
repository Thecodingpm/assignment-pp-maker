'use client';

import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { ImageElement } from '../../types/editor';

interface ImagePanelProps {
  element: ImageElement;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ element }) => {
  const { updateElement, getCurrentSlide } = useEditorStore();
  const currentSlide = getCurrentSlide();

  const handlePropertyChange = (property: string, value: any) => {
    if (!currentSlide) return;
    
    updateElement(currentSlide.id, element.id, {
      [property]: value,
    });
  };

  // Get current opacity and corner radius (with defaults)
  const opacity = (element as any).opacity ?? 1;
  const cornerRadius = (element as any).cornerRadius ?? 8;

  return (
    <div className="p-4 space-y-6">
      {/* Image Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Preview
        </label>
        <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
          <img
            src={element.src}
            alt={element.alt}
            className="w-full h-32 object-cover"
            style={{
              opacity: opacity,
              borderRadius: `${cornerRadius}px`,
            }}
          />
        </div>
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alt Text
        </label>
        <input
          type="text"
          value={element.alt}
          onChange={(e) => handlePropertyChange('alt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the image for accessibility"
        />
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={Math.round(opacity * 100)}
              onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value) / 100)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              min="0"
              max="100"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="font-medium">{Math.round(opacity * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Corner Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Corner Radius
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={cornerRadius}
            onChange={(e) => handlePropertyChange('cornerRadius', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={cornerRadius}
              onChange={(e) => handlePropertyChange('cornerRadius', parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              min="0"
              max="50"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0px</span>
            <span className="font-medium">{cornerRadius}px</span>
            <span>50px</span>
          </div>
        </div>
      </div>

      {/* Quick Corner Radius Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Radius
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 0, label: 'None' },
            { value: 4, label: 'Small' },
            { value: 8, label: 'Medium' },
            { value: 16, label: 'Large' },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePropertyChange('cornerRadius', preset.value)}
              className={`p-2 rounded-md text-sm font-medium transition-colors ${
                cornerRadius === preset.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Opacity Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Opacity
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 0.25, label: '25%' },
            { value: 0.5, label: '50%' },
            { value: 0.75, label: '75%' },
            { value: 1, label: '100%' },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePropertyChange('opacity', preset.value)}
              className={`p-2 rounded-md text-sm font-medium transition-colors ${
                Math.abs(opacity - preset.value) < 0.01
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Info */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Image Information</h4>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Width:</span>
            <span>{Math.round(element.width)}px</span>
          </div>
          <div className="flex justify-between">
            <span>Height:</span>
            <span>{Math.round(element.height)}px</span>
          </div>
          <div className="flex justify-between">
            <span>Source:</span>
            <span className="truncate max-w-32" title={element.src}>
              {element.src.split('/').pop() || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Image Effects Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Effects Preview
        </label>
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="text-center text-sm text-gray-600 mb-2">Current Settings</div>
          <div className="flex justify-center">
            <div
              className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center text-xs text-gray-500"
              style={{
                opacity: opacity,
                borderRadius: `${cornerRadius}px`,
                backgroundImage: `url(${element.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {opacity < 0.3 && 'Low Opacity'}
            </div>
          </div>
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

export default ImagePanel;
