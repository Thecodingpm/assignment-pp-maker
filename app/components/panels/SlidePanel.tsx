'use client';

import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { Slide } from '../../types/editor';

interface SlidePanelProps {
  slide: Slide | null;
}

const SlidePanel: React.FC<SlidePanelProps> = ({ slide }) => {
  const { updateSlideBackground, getCurrentSlide } = useEditorStore();
  const currentSlide = slide || getCurrentSlide();

  const handleBackgroundChange = (backgroundColor: string) => {
    updateSlideBackground(backgroundColor);
  };

  if (!currentSlide) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          <p>No slide available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Color
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={currentSlide.backgroundColor}
            onChange={(e) => handleBackgroundChange(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <input
            type="text"
            value={currentSlide.backgroundColor}
            onChange={(e) => handleBackgroundChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="#FFFFFF"
          />
        </div>
      </div>

      {/* Quick Background Colors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Colors
        </label>
        <div className="grid grid-cols-6 gap-2">
          {[
            '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', 
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#000000', '#1F2937'
          ].map((color) => (
            <button
              key={color}
              onClick={() => handleBackgroundChange(color)}
              className={`w-8 h-8 rounded-md border-2 ${
                currentSlide.backgroundColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Background Style Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Styles
        </label>
        <div className="space-y-2">
          {[
            { 
              name: 'Clean White', 
              color: '#FFFFFF',
              description: 'Professional and clean'
            },
            { 
              name: 'Light Gray', 
              color: '#F8FAFC',
              description: 'Subtle and modern'
            },
            { 
              name: 'Blue Gradient', 
              color: '#3B82F6',
              description: 'Corporate and trustworthy'
            },
            { 
              name: 'Dark Theme', 
              color: '#1F2937',
              description: 'Modern and sleek'
            },
          ].map((style) => (
            <button
              key={style.name}
              onClick={() => handleBackgroundChange(style.color)}
              className={`w-full p-3 rounded-md border text-left transition-colors ${
                currentSlide.backgroundColor === style.color
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: style.color }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{style.name}</div>
                  <div className="text-xs text-gray-500">{style.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Slide Information */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Slide Information</h4>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Slide ID:</span>
            <span className="font-mono">{currentSlide.id.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span>Elements:</span>
            <span>{currentSlide.elements.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Background:</span>
            <span className="font-mono">{currentSlide.backgroundColor}</span>
          </div>
        </div>
      </div>

      {/* Background Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Preview
        </label>
        <div 
          className="w-full h-24 rounded-md border border-gray-200 flex items-center justify-center"
          style={{ backgroundColor: currentSlide.backgroundColor }}
        >
          <div className="text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-md">
            {currentSlide.backgroundColor === '#FFFFFF' ? 'White Background' : 
             currentSlide.backgroundColor === '#000000' ? 'Black Background' :
             currentSlide.backgroundColor === '#1F2937' ? 'Dark Background' :
             'Custom Background'}
          </div>
        </div>
      </div>

      {/* Slide Actions */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Slide Actions</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleBackgroundChange('#FFFFFF')}
            className="w-full p-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Reset to White
          </button>
          <button
            onClick={() => handleBackgroundChange('#F8FAFC')}
            className="w-full p-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            Reset to Light Gray
          </button>
        </div>
      </div>

      {/* Accessibility Note */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
          <div className="font-medium text-blue-800 mb-1">💡 Tip</div>
          <div>
            Choose background colors that provide good contrast with your text and elements for better readability.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidePanel;
