'use client';

import React, { useState } from 'react';
import { X, Table, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Plus, Minus } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface TableDesignPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const TableDesignPopup: React.FC<TableDesignPopupProps> = ({ isVisible, onClose }) => {
  const { getSelectedElement, updateElement, getCurrentSlide } = useEditorStore();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [headerStyle, setHeaderStyle] = useState<'bold' | 'normal'>('bold');
  const [headerBackground, setHeaderBackground] = useState('#F3F4F6');
  const [headerTextColor, setHeaderTextColor] = useState('#000000');
  const [cellBackground, setCellBackground] = useState('#FFFFFF');
  const [cellTextColor, setCellTextColor] = useState('#000000');
  const [borderColor, setBorderColor] = useState('#D1D5DB');
  const [borderWidth, setBorderWidth] = useState(1);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [alternatingRows, setAlternatingRows] = useState(false);

  const selectedElement = getSelectedElement();
  const currentSlide = getCurrentSlide();

  // Update element when properties change
  const updateTableElement = (property: string, value: any) => {
    if (selectedElement && currentSlide) {
      updateElement(currentSlide.id, selectedElement.id, { [property]: value });
    }
  };

  const colorPresets = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF',
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB'
  ];

  const generateSampleData = () => {
    const data = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        if (i === 0) {
          row.push(`Header ${j + 1}`);
        } else {
          row.push(`Data ${i}-${j + 1}`);
        }
      }
      data.push(row);
    }
    return data;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-2 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-40 flex flex-col rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Table className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Table Design</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table Structure */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Table Structure</h4>
            
            {/* Rows */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rows: {rows}</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRows(Math.max(1, rows - 1))}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => setRows(Math.min(10, rows + 1))}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Columns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Columns: {cols}</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCols(Math.max(1, cols - 1))}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => setCols(Math.min(8, cols + 1))}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
              <div className="flex space-x-2">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight }
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setTextAlign(value as 'left' | 'center' | 'right');
                      updateTableElement('textAlign', value);
                    }}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      textAlign === value 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Alternating Rows */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="alternatingRows"
                checked={alternatingRows}
                onChange={(e) => {
                  setAlternatingRows(e.target.checked);
                  updateTableElement('alternatingRows', e.target.checked);
                }}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="alternatingRows" className="text-sm text-gray-700">
                Alternating Row Colors
              </label>
            </div>
          </div>

          {/* Header Styling */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Header Styling</h4>
            
            {/* Header Background */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Background</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={headerBackground}
                  onChange={(e) => {
                    setHeaderBackground(e.target.value);
                    updateTableElement('headerBackground', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.slice(0, 6).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setHeaderBackground(color);
                        updateTableElement('headerBackground', color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Header Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={headerTextColor}
                  onChange={(e) => {
                    setHeaderTextColor(e.target.value);
                    updateTableElement('headerTextColor', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.slice(6, 12).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setHeaderTextColor(color);
                        updateTableElement('headerTextColor', color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Header Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setHeaderStyle('bold');
                    updateTableElement('headerStyle', 'bold');
                  }}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    headerStyle === 'bold' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setHeaderStyle('normal');
                    updateTableElement('headerStyle', 'normal');
                  }}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    headerStyle === 'normal' 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cell Styling */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Cell Styling</h4>
            
            {/* Cell Background */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cell Background</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={cellBackground}
                  onChange={(e) => {
                    setCellBackground(e.target.value);
                    updateTableElement('cellBackground', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.slice(0, 6).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setCellBackground(color);
                        updateTableElement('cellBackground', color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cell Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cell Text Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={cellTextColor}
                  onChange={(e) => {
                    setCellTextColor(e.target.value);
                    updateTableElement('cellTextColor', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.slice(6, 12).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setCellTextColor(color);
                        updateTableElement('cellTextColor', color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Border */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => {
                    setBorderColor(e.target.value);
                    updateTableElement('borderColor', e.target.value);
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.slice(12).map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setBorderColor(color);
                        updateTableElement('borderColor', color);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Border Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Width: {borderWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={borderWidth}
                onChange={(e) => {
                  setBorderWidth(Number(e.target.value));
                  updateTableElement('borderWidth', Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
          <div className="flex justify-center">
            <table 
              className="border-collapse"
              style={{
                border: `${borderWidth}px solid ${borderColor}`
              }}
            >
              <tbody>
                {generateSampleData().map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-2 border"
                        style={{
                          backgroundColor: rowIndex === 0 ? headerBackground : 
                            alternatingRows && rowIndex % 2 === 1 ? '#F9FAFB' : cellBackground,
                          color: rowIndex === 0 ? headerTextColor : cellTextColor,
                          fontWeight: rowIndex === 0 ? headerStyle : 'normal',
                          textAlign: textAlign,
                          border: `${borderWidth}px solid ${borderColor}`,
                          minWidth: '60px'
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              // Reset all values
              setRows(3);
              setCols(3);
              setHeaderStyle('bold');
              setHeaderBackground('#F3F4F6');
              setHeaderTextColor('#000000');
              setCellBackground('#FFFFFF');
              setCellTextColor('#000000');
              setBorderColor('#D1D5DB');
              setBorderWidth(1);
              setTextAlign('left');
              setAlternatingRows(false);
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
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableDesignPopup;
