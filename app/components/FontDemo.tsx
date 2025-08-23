'use client';

import React, { useState } from 'react';

export default function FontDemo() {
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#000000');
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');

  const fonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
    'Playfair Display', 'Merriweather', 'Arial', 'Helvetica', 'Times New Roman',
    'Georgia', 'Verdana', 'Nunito', 'Work Sans', 'Raleway', 'Quicksand',
    'DM Sans', 'Outfit', 'Geist', 'Libre Baskerville', 'Crimson Text',
    'JetBrains Mono', 'Fira Code', 'Caveat', 'Dancing Script'
  ];

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB',
    '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb',
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
  ];

  const fontSizes = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64', '72'];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Enhanced Font Functionality Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Experience professional typography like Canva and Pages
        </p>
      </div>

      {/* Font Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Font Family */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Font Family
          </label>
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fonts.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Font Size
          </label>
          <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => {
                const current = parseInt(fontSize);
                if (current > 8) setFontSize((current - 1).toString());
              }}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors border-r border-gray-300 dark:border-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[60px] text-center">
              {fontSize}px
            </div>
            <button
              onClick={() => {
                const current = parseInt(fontSize);
                if (current < 72) setFontSize((current + 1).toString());
              }}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors border-l border-gray-300 dark:border-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Text Color
          </label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-full h-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
          />
        </div>
      </div>

      {/* Sample Text Display */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Sample Text
        </label>
        <textarea
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Type your sample text here..."
        />
      </div>

      {/* Live Preview */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Live Preview
        </label>
        <div 
          className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[120px] flex items-center justify-center"
          style={{
            fontFamily: selectedFont,
            fontSize: `${fontSize}px`,
            color: textColor
          }}
        >
          {sampleText || 'Your text will appear here...'}
        </div>
      </div>

      {/* Quick Color Palette */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Color Palette
        </label>
        <div className="grid grid-cols-12 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setTextColor(color)}
              className="w-8 h-8 rounded border-2 border-gray-200 dark:border-gray-300 hover:scale-110 transition-all duration-200 shadow-sm"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Font Categories */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Font Categories
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Web Fonts', fonts: ['Inter', 'Roboto', 'Open Sans', 'Lato'] },
            { name: 'System Fonts', fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia'] },
            { name: 'Premium Fonts', fonts: ['Nunito', 'Work Sans', 'Raleway', 'Quicksand'] },
            { name: 'Creative Fonts', fonts: ['Caveat', 'Dancing Script', 'Playfair Display', 'Merriweather'] }
          ].map((category) => (
            <div key={category.name} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{category.name}</h4>
              <div className="space-y-1">
                {category.fonts.map((font) => (
                  <button
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    className={`block w-full text-left text-xs p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      selectedFont === font ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                    }`}
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features List */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          ✨ Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>50+ Professional Fonts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Font Size Range: 8px - 72px</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Full Color Spectrum Support</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Real-time Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Font Categories & Search</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Professional Color Palettes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
