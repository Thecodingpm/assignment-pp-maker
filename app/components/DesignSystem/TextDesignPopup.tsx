'use client';

import React, { useState } from 'react';
import { X, Type, ChevronRight, ChevronDown, Lock, Unlock, Layers, MoveUp, MoveDown } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface TextDesignPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const TextDesignPopup: React.FC<TextDesignPopupProps> = ({ isVisible, onClose }) => {
  const { getSelectedElement, updateElement, getCurrentSlide } = useEditorStore();
  const [fontSize, setFontSize] = useState(96);
  const [fontFamily, setFontFamily] = useState('Lato');
  const [textColor, setTextColor] = useState('#000000');
  const [textStyle, setTextStyle] = useState('Title');
  const [fontWeight, setFontWeight] = useState('Bold');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [verticalAlign, setVerticalAlign] = useState('top');
  const [opacity, setOpacity] = useState(100);
  const [shadow, setShadow] = useState('none');
  const [isSizePositionExpanded, setIsSizePositionExpanded] = useState(false);
  const [isMoreOptionsExpanded, setIsMoreOptionsExpanded] = useState(false);

  const selectedElement = getSelectedElement();
  const currentSlide = getCurrentSlide();

  // Update element when properties change
  const updateTextElement = (property: string, value: any) => {
    if (selectedElement && currentSlide) {
      updateElement(currentSlide.id, selectedElement.id, { [property]: value });
    }
  };

  const textStyles = ['Title', 'Subtitle', 'Body', 'Caption', 'Quote'];
  const fontFamilies = ['Lato', 'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Roboto', 'Open Sans'];
  const fontWeights = ['Light', 'Normal', 'Bold', 'Extra Bold'];
  const shadowOptions = ['none', 'soft', 'regular', 'retro'];

  if (!isVisible) return null;

  return (
    <>
      <style jsx>{`
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8B5CF6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-purple::-webkit-slider-track {
          background: #E5E7EB;
          height: 8px;
          border-radius: 4px;
        }
        .slider-purple::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8B5CF6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-purple::-moz-range-track {
          background: #E5E7EB;
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
      <div className="fixed right-2 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-40 flex flex-col rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Text</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Size & Position */}
        <div className="space-y-2">
          <button
            onClick={() => setIsSizePositionExpanded(!isSizePositionExpanded)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">Size & position</span>
            <div className="flex items-center space-x-2">
              <Unlock className="w-4 h-4 text-gray-400" />
              {isSizePositionExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </button>
          {isSizePositionExpanded && (
            <div className="pl-4 space-y-2">
              <div className="text-xs text-gray-500">Size and position controls would go here</div>
            </div>
          )}
        </div>

        {/* Text Style */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Text style</label>
          <select
            value={textStyle}
            onChange={(e) => {
              setTextStyle(e.target.value);
              updateTextElement('textStyle', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          >
            {textStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        {/* Font */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Font</label>
          
          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              updateTextElement('fontFamily', e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            style={{ fontFamily: fontFamily }}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          {/* Color and Size Row */}
          <div className="flex items-center space-x-2">
            {/* Color Swatch */}
            <div className="relative">
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  updateTextElement('color', e.target.value);
                }}
                className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              />
            </div>

            {/* Font Size */}
            <div className="flex-1 flex items-center space-x-1">
              <input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(Number(e.target.value));
                  updateTextElement('fontSize', Number(e.target.value));
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                min="8"
                max="200"
              />
              <div className="flex flex-col">
                <button
                  onClick={() => setFontSize(Math.min(200, fontSize + 1))}
                  className="w-4 h-3 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700"
                >
                  ▲
                </button>
                <button
                  onClick={() => setFontSize(Math.max(8, fontSize - 1))}
                  className="w-4 h-3 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Font Weight */}
            <select
              value={fontWeight}
              onChange={(e) => {
                setFontWeight(e.target.value);
                updateTextElement('fontWeight', e.target.value.toLowerCase());
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {fontWeights.map(weight => (
                <option key={weight} value={weight}>{weight}</option>
              ))}
            </select>
          </div>
        </div>

        {/* More Text Options */}
        <div className="space-y-2">
          <button
            onClick={() => setIsMoreOptionsExpanded(!isMoreOptionsExpanded)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">More text options</span>
            {isMoreOptionsExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {isMoreOptionsExpanded && (
            <div className="pl-4 space-y-2">
              <div className="text-xs text-gray-500">Additional text options would go here</div>
            </div>
          )}
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Text alignment</label>
          <div className="flex items-center space-x-1">
            {/* Horizontal Alignment */}
            <div className="flex space-x-1">
              {[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
                { value: 'justify', label: 'Justify' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTextAlign(value as any);
                    updateTextElement('textAlign', value);
                  }}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    textAlign === value 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Vertical Alignment */}
            <select
              value={verticalAlign}
              onChange={(e) => {
                setVerticalAlign(e.target.value);
                updateTextElement('verticalAlign', e.target.value);
              }}
              className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
            <option>Use variable</option>
            <option>Static text</option>
          </select>
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Opacity</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => {
                setOpacity(Number(e.target.value));
                updateTextElement('opacity', Number(e.target.value) / 100);
              }}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple"
            />
            <span className="text-sm text-gray-600 w-12">{opacity}%</span>
          </div>
        </div>

        {/* Shadow */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Shadow</label>
          <div className="grid grid-cols-4 gap-2">
            {shadowOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setShadow(option);
                  updateTextElement('shadow', option);
                }}
                className={`p-2 rounded border-2 transition-colors ${
                  shadow === option 
                    ? 'border-purple-600 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={option.charAt(0).toUpperCase() + option.slice(1)}
              >
                <div className={`w-6 h-6 mx-auto rounded ${
                  option === 'none' ? 'bg-white border border-gray-300' :
                  option === 'soft' ? 'bg-white' :
                  option === 'regular' ? 'bg-white' :
                  'bg-white shadow-sm'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Text Effects */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Text effects</label>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Outline
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Glow
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Gradient
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Pattern
            </button>
          </div>
        </div>

        {/* Advanced Typography */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Advanced typography</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Letter spacing</span>
              <input
                type="range"
                min="-2"
                max="10"
                defaultValue="0"
                className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Line height</span>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                defaultValue="1.2"
                className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Word spacing</span>
              <input
                type="range"
                min="-2"
                max="10"
                defaultValue="0"
                className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Text Animation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Animation</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
            <option>None</option>
            <option>Fade in</option>
            <option>Slide up</option>
            <option>Slide down</option>
            <option>Typewriter</option>
            <option>Bounce</option>
          </select>
        </div>

        {/* Layering Controls */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <MoveUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">To front</span>
          </button>
          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <MoveDown className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">To back</span>
          </button>
        </div>

        {/* Additional Actions */}
        <div className="space-y-2 pt-2">
          <button className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Copy text style
          </button>
          <button className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Paste text style
          </button>
          <button className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
            Reset to default
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default TextDesignPopup;
