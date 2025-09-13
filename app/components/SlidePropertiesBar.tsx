'use client';

import React, { useState } from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { MoreHorizontal } from 'lucide-react';

const SlidePropertiesBar: React.FC = () => {
  const { slides, currentSlideIndex, updateSlideStyle, updateSlideBackground, updateSlideBackgroundImage } = useEditorStore();
  const currentSlide = slides[currentSlideIndex];
  const [showSlideStyleMenu, setShowSlideStyleMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);

  const slideStyles = [
    { id: 'n', name: 'N', label: 'Slide style' },
    { id: 'l-light', name: 'L Light', label: 'Slide style' },
    { id: 'l-dark', name: 'L Dark', label: 'Slide style' },
    { id: 'm-light', name: 'M Light', label: 'Slide style' },
    { id: 'm-dark', name: 'M Dark', label: 'Slide style' },
  ];

  const colorOptions = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', 
    '#9ca3af', '#6b7280', '#4b5563', '#374151',
    '#1f2937', '#111827', '#000000'
  ];

  const backgroundImages = [
    {
      id: 'sand-dunes',
      name: 'Sand Dunes',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=60&fit=crop',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
    },
    {
      id: 'office',
      name: 'Office',
      thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=60&fit=crop',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop'
    },
    {
      id: 'mountains',
      name: 'Mountains',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=60&fit=crop',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
      <div className="flex items-center justify-center space-x-6">
        {/* Slide Style */}
        <div className="relative">
          <button
            onClick={() => setShowSlideStyleMenu(!showSlideStyleMenu)}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">
              N
            </div>
            <span className="text-sm text-gray-700">Slide style</span>
          </button>
          
          {showSlideStyleMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48">
              {slideStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    updateSlideStyle(style.name);
                    setShowSlideStyleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                    {style.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">{style.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Slide Color */}
        <div className="relative">
          <button
            onClick={() => setShowColorMenu(!showColorMenu)}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: currentSlide?.backgroundColor || '#ffffff' }}
            />
            <span className="text-sm text-gray-700">Slide color</span>
          </button>
          
          {showColorMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      updateSlideBackground(color);
                      setShowColorMenu(false);
                    }}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Image */}
        <div className="relative">
          <button
            onClick={() => setShowBackgroundMenu(!showBackgroundMenu)}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded border border-gray-300 overflow-hidden">
              <img
                src={backgroundImages[0].thumbnail}
                alt={backgroundImages[0].name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-gray-700">Background image</span>
          </button>
          
          {showBackgroundMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-64">
              <div className="space-y-2">
                {backgroundImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      updateSlideBackgroundImage(image.url);
                      setShowBackgroundMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-8 rounded border border-gray-300 overflow-hidden">
                      <img
                        src={image.thumbnail}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-gray-700">{image.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* More Options */}
        <button className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default SlidePropertiesBar;
