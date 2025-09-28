'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SimpleColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const SimpleColorPicker: React.FC<SimpleColorPickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
  const colorPickerRef = useRef<HTMLDivElement>(null);

  console.log('SimpleColorPicker rendered with value:', value, 'isOpen:', isOpen);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const styleColors = [
    '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8',
    '#000000', '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'
  ];

  const allColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#E11D48'
  ];

  const handleColorSelect = (color: string) => {
    console.log('Color selected:', color);
    onChange(color);
    setIsOpen(false);
  };

  const getPopupPosition = () => {
    const button = colorPickerRef.current?.querySelector('button');
    if (button) {
      const rect = button.getBoundingClientRect();
      const position = {
        left: rect.right + 8, // Position to the right of the button
        top: rect.top - 10,   // Align with the top of the button
      };
      console.log('Popup position calculated:', position, 'button rect:', rect);
      return position;
    }
    console.log('No button found for positioning');
    return { left: '50%', top: '50%' };
  };

  return (
    <div className="relative" ref={colorPickerRef}>
      {/* Color Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Simple color picker clicked!', isOpen, 'value:', value);
          setIsOpen(!isOpen);
        }}
        className={`border border-gray-300 rounded cursor-pointer ${className}`}
        style={{ 
          background: value?.includes('gradient') ? value : undefined,
          backgroundColor: value?.includes('gradient') ? undefined : value
        }}
        title="Text color"
      />

      {/* Color Picker Popup */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {console.log('Rendering popup with portal! isOpen:', isOpen, 'document.body:', document.body)}
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[99998] bg-black bg-opacity-20"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed z-[99999] bg-white rounded-lg shadow-2xl border border-gray-200 min-w-64 max-w-72"
            style={{
              left: getPopupPosition().left,
              top: getPopupPosition().top,
            }}
          >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">Text Color</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('solid')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'solid'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => setActiveTab('gradient')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'gradient'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Gradient
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'solid' ? (
              <div className="space-y-4">
                {/* Style Colors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Style colors</span>
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      Edit style
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {styleColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          value === color
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* All Colors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">All colors</span>
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      +
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {allColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          value === color
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Gradient Options */}
                <div>
                  <span className="text-xs font-medium text-gray-700 block mb-2">Gradient presets</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                      'linear-gradient(45deg, #A8E6CF, #FFD93D)',
                      'linear-gradient(45deg, #FF8A80, #FFB74D)',
                      'linear-gradient(45deg, #81C784, #64B5F6)',
                      'linear-gradient(45deg, #F8BBD9, #E1BEE7)',
                      'linear-gradient(45deg, #FFCDD2, #F8BBD9)',
                      'linear-gradient(135deg, #667eea, #764ba2)',
                      'linear-gradient(135deg, #f093fb, #f5576c)',
                      'linear-gradient(135deg, #4facfe, #00f2fe)',
                    ].map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(gradient)}
                        className="w-16 h-12 rounded border-2 border-gray-300 hover:border-gray-400 transition-all hover:scale-105"
                        style={{ background: gradient }}
                        title={`Gradient ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default SimpleColorPicker;
