'use client';

import React, { useState } from 'react';
import { X, Square, Circle, Triangle, Diamond, Star, Minus, Palette, RotateCw } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface ShapeDesignPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const ShapeDesignPopup: React.FC<ShapeDesignPopupProps> = ({ isVisible, onClose }) => {
  const { getSelectedElement, updateElement, getCurrentSlide } = useEditorStore();
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star' | 'line'>('rectangle');
  const [fillColor, setFillColor] = useState('#3B82F6');
  const [strokeColor, setStrokeColor] = useState('#1E40AF');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [isRounded, setIsRounded] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);

  const selectedElement = getSelectedElement();
  const currentSlide = getCurrentSlide();

  // Update element when properties change
  const updateShapeElement = (property: string, value: any) => {
    if (selectedElement && currentSlide) {
      updateElement(currentSlide.id, selectedElement.id, { [property]: value });
    }
  };

  const shapeTypes = [
    { type: 'rectangle', icon: Square, label: 'Rectangle' },
    { type: 'circle', icon: Circle, label: 'Circle' },
    { type: 'triangle', icon: Triangle, label: 'Triangle' },
    { type: 'diamond', icon: Diamond, label: 'Diamond' },
    { type: 'star', icon: Star, label: 'Star' },
    { type: 'line', icon: Minus, label: 'Line' }
  ];

  const colorPresets = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed right-2 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-40 flex flex-col rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Square className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Shape Design</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shape Type & Style */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Shape & Style</h4>
            
            {/* Shape Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shape Type</label>
              <div className="grid grid-cols-3 gap-2">
                {shapeTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setShapeType(type as any);
                      updateShapeElement('shapeType', type);
                    }}
                    className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-1 ${
                      shapeType === type 
                        ? 'bg-green-600 text-white border-green-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rounded Corners */}
            {shapeType === 'rectangle' && (
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
                    updateShapeElement('borderRadius', Number(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opacity: {opacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => {
                  setOpacity(Number(e.target.value));
                  updateShapeElement('opacity', Number(e.target.value) / 100);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

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
                    updateShapeElement('rotation', Number(e.target.value));
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => {
                    setRotation(rotation + 90);
                    updateShapeElement('rotation', rotation + 90);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Colors & Stroke */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Colors & Stroke</h4>
            
            {/* Fill Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fill Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => {
                    setFillColor(e.target.value);
                    updateShapeElement('fillColor', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.slice(0, 8).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setFillColor(color);
                        updateShapeElement('fillColor', color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stroke Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => {
                    setStrokeColor(e.target.value);
                    updateShapeElement('strokeColor', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.slice(8).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setStrokeColor(color);
                        updateShapeElement('strokeColor', color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stroke Width: {strokeWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={strokeWidth}
                onChange={(e) => {
                  setStrokeWidth(Number(e.target.value));
                  updateShapeElement('strokeWidth', Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* No Fill Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="noFill"
                checked={fillColor === 'transparent'}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFillColor('transparent');
                    updateShapeElement('fillColor', 'transparent');
                  } else {
                    setFillColor('#3B82F6');
                    updateShapeElement('fillColor', '#3B82F6');
                  }
                }}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="noFill" className="text-sm text-gray-700">
                No Fill (Transparent)
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
          <div className="flex justify-center">
            <div 
              className="w-24 h-24 flex items-center justify-center"
              style={{
                transform: `rotate(${rotation}deg)`,
                opacity: opacity / 100
              }}
            >
              {shapeType === 'rectangle' && (
                <div
                  className="border-2"
                  style={{
                    width: '60px',
                    height: '40px',
                    backgroundColor: fillColor,
                    borderColor: strokeColor,
                    borderWidth: `${strokeWidth}px`,
                    borderRadius: `${borderRadius}px`
                  }}
                />
              )}
              {shapeType === 'circle' && (
                <div
                  className="border-2 rounded-full"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: fillColor,
                    borderColor: strokeColor,
                    borderWidth: `${strokeWidth}px`
                  }}
                />
              )}
              {shapeType === 'triangle' && (
                <div
                  className="border-2"
                  style={{
                    width: '0',
                    height: '0',
                    borderLeft: '25px solid transparent',
                    borderRight: '25px solid transparent',
                    borderBottom: `40px solid ${fillColor}`,
                    borderTop: 'none'
                  }}
                />
              )}
              {shapeType === 'diamond' && (
                <div
                  className="border-2"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: fillColor,
                    borderColor: strokeColor,
                    borderWidth: `${strokeWidth}px`,
                    transform: 'rotate(45deg)'
                  }}
                />
              )}
              {shapeType === 'star' && (
                <div
                  className="text-4xl"
                  style={{ color: fillColor }}
                >
                  ⭐
                </div>
              )}
              {shapeType === 'line' && (
                <div
                  className="border-t-2"
                  style={{
                    width: '60px',
                    borderColor: strokeColor,
                    borderWidth: `${strokeWidth}px`
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              // Reset all values
              setShapeType('rectangle');
              setFillColor('#3B82F6');
              setStrokeColor('#1E40AF');
              setStrokeWidth(2);
              setRotation(0);
              setOpacity(100);
              setBorderRadius(0);
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
            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShapeDesignPopup;
