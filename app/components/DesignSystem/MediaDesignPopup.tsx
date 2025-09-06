'use client';

import React, { useState } from 'react';
import { X, Image, Crop, RotateCw, FlipHorizontal, FlipVertical, Palette, Filter } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface MediaDesignPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const MediaDesignPopup: React.FC<MediaDesignPopupProps> = ({ isVisible, onClose }) => {
  const { getSelectedElement, updateElement, getCurrentSlide } = useEditorStore();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState('#000000');

  const selectedElement = getSelectedElement();
  const currentSlide = getCurrentSlide();

  // Update element when properties change
  const updateMediaElement = (property: string, value: any) => {
    if (selectedElement && currentSlide) {
      updateElement(currentSlide.id, selectedElement.id, { [property]: value });
    }
  };

  const filterPresets = [
    { name: 'None', brightness: 100, contrast: 100, saturation: 100, blur: 0 },
    { name: 'Bright', brightness: 120, contrast: 110, saturation: 100, blur: 0 },
    { name: 'Dark', brightness: 80, contrast: 90, saturation: 100, blur: 0 },
    { name: 'Vintage', brightness: 90, contrast: 110, saturation: 80, blur: 1 },
    { name: 'High Contrast', brightness: 100, contrast: 130, saturation: 100, blur: 0 },
    { name: 'Soft', brightness: 110, contrast: 90, saturation: 90, blur: 2 }
  ];

  const applyFilterPreset = (preset: typeof filterPresets[0]) => {
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setBlur(preset.blur);
    updateMediaElement('filters', preset);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-2 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-40 flex flex-col rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Image className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Media Design</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filters & Effects */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Filters & Effects</h4>
            
            {/* Filter Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {filterPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyFilterPreset(preset)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brightness */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brightness: {brightness}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => {
                  setBrightness(Number(e.target.value));
                  updateMediaElement('brightness', Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contrast: {contrast}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => {
                  setContrast(Number(e.target.value));
                  updateMediaElement('contrast', Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saturation: {saturation}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => {
                  setSaturation(Number(e.target.value));
                  updateMediaElement('saturation', Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blur: {blur}px
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={blur}
                onChange={(e) => {
                  setBlur(Number(e.target.value));
                  updateMediaElement('blur', Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Transform & Style */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Transform & Style</h4>
            
            {/* Rotation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotation: {rotation}°
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => {
                    setRotation(Number(e.target.value));
                    updateMediaElement('rotation', Number(e.target.value));
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => {
                    setRotation(rotation + 90);
                    updateMediaElement('rotation', rotation + 90);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Flip Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flip</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setFlipHorizontal(!flipHorizontal);
                    updateMediaElement('flipHorizontal', !flipHorizontal);
                  }}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    flipHorizontal 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setFlipVertical(!flipVertical);
                    updateMediaElement('flipVertical', !flipVertical);
                  }}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    flipVertical 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius: {borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => {
                  setBorderRadius(Number(e.target.value));
                  updateMediaElement('borderRadius', Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Border */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Width: {borderWidth}px
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={borderWidth}
                  onChange={(e) => {
                    setBorderWidth(Number(e.target.value));
                    updateMediaElement('borderWidth', Number(e.target.value));
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => {
                    setBorderColor(e.target.value);
                    updateMediaElement('borderColor', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
          <div className="flex justify-center">
            <div 
              className="w-32 h-24 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
              style={{
                borderRadius: `${borderRadius}px`,
                borderWidth: `${borderWidth}px`,
                borderColor: borderWidth > 0 ? borderColor : 'transparent',
                transform: `rotate(${rotation}deg) ${flipHorizontal ? 'scaleX(-1)' : ''} ${flipVertical ? 'scaleY(-1)' : ''}`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`
              }}
            >
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Media Effects */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800">Media Effects</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filters</label>
            <div className="grid grid-cols-3 gap-2">
              {['None', 'Blur', 'Brightness', 'Contrast', 'Saturation', 'Sepia'].map(filter => (
                <button
                  key={filter}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transform</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Scale</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  defaultValue="1"
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rotation</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  defaultValue="0"
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              // Reset all values
              setBrightness(100);
              setContrast(100);
              setSaturation(100);
              setBlur(0);
              setRotation(0);
              setFlipHorizontal(false);
              setFlipVertical(false);
              setBorderRadius(0);
              setBorderWidth(0);
              setBorderColor('#000000');
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Apply all changes and close
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaDesignPopup;
