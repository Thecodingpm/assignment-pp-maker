'use client';

import React, { useState } from 'react';
import { X, BarChart3, PieChart, LineChart, TrendingUp, Palette, Settings } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface ChartDesignPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChartDesignPopup: React.FC<ChartDesignPopupProps> = ({ isVisible, onClose }) => {
  const { getSelectedElement, updateElement, getCurrentSlide } = useEditorStore();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [title, setTitle] = useState('Chart Title');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [colorScheme, setColorScheme] = useState('default');
  const [dataLabels, setDataLabels] = useState(true);
  const [animation, setAnimation] = useState(true);

  const selectedElement = getSelectedElement();
  const currentSlide = getCurrentSlide();

  // Update element when properties change
  const updateChartElement = (property: string, value: any) => {
    if (selectedElement && currentSlide) {
      updateElement(currentSlide.id, selectedElement.id, { [property]: value });
    }
  };

  const chartTypes = [
    { type: 'bar', icon: BarChart3, label: 'Bar Chart' },
    { type: 'line', icon: LineChart, label: 'Line Chart' },
    { type: 'pie', icon: PieChart, label: 'Pie Chart' },
    { type: 'area', icon: TrendingUp, label: 'Area Chart' }
  ];

  const colorSchemes = [
    { name: 'Default', colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'] },
    { name: 'Pastel', colors: ['#A5B4FC', '#FCA5A5', '#86EFAC', '#FDE68A', '#C4B5FD'] },
    { name: 'Dark', colors: ['#1E40AF', '#DC2626', '#059669', '#D97706', '#7C3AED'] },
    { name: 'Monochrome', colors: ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6'] }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed right-2 top-16 h-[500px] w-64 bg-white shadow-xl z-40 flex flex-col rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">Chart Design</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart Type & Data */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Chart Type & Data</h4>
            
            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <div className="grid grid-cols-2 gap-2">
                {chartTypes.map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setChartType(type as any);
                      updateChartElement('chartType', type);
                    }}
                    className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-1 ${
                      chartType === type 
                        ? 'bg-orange-600 text-white border-orange-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  updateChartElement('title', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter chart title"
              />
            </div>

            {/* Sample Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sample Data</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm">Q1: 120</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm">Q2: 150</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm">Q3: 180</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Q4: 200</span>
                </div>
              </div>
              <button className="mt-2 text-sm text-orange-600 hover:text-orange-700">
                Edit Data
              </button>
            </div>
          </div>

          {/* Appearance & Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Appearance & Settings</h4>
            
            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
              <div className="space-y-2">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.name}
                    onClick={() => {
                      setColorScheme(scheme.name.toLowerCase());
                      updateChartElement('colorScheme', scheme.colors);
                    }}
                    className={`w-full p-2 rounded-lg border transition-colors flex items-center justify-between ${
                      colorScheme === scheme.name.toLowerCase()
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{scheme.name}</span>
                    <div className="flex space-x-1">
                      {scheme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show Legend</label>
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => {
                    setShowLegend(e.target.checked);
                    updateChartElement('showLegend', e.target.checked);
                  }}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show Grid</label>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => {
                    setShowGrid(e.target.checked);
                    updateChartElement('showGrid', e.target.checked);
                  }}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Data Labels</label>
                <input
                  type="checkbox"
                  checked={dataLabels}
                  onChange={(e) => {
                    setDataLabels(e.target.checked);
                    updateChartElement('dataLabels', e.target.checked);
                  }}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Animation</label>
                <input
                  type="checkbox"
                  checked={animation}
                  onChange={(e) => {
                    setAnimation(e.target.checked);
                    updateChartElement('animation', e.target.checked);
                  }}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
          <div className="flex justify-center">
            <div className="w-64 h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xs text-gray-400">{chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => {
              // Reset all values
              setChartType('bar');
              setTitle('Chart Title');
              setShowLegend(true);
              setShowGrid(true);
              setColorScheme('default');
              setDataLabels(true);
              setAnimation(true);
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
            className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartDesignPopup;
