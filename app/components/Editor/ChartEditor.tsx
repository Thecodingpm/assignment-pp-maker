'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Palette, BarChart3 } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { ChartElement } from '../../types/editor';

interface ChartEditorProps {
  chartElement: ChartElement;
  isVisible: boolean;
  onClose: () => void;
}

const ChartEditor: React.FC<ChartEditorProps> = ({
  chartElement,
  isVisible,
  onClose
}) => {
  const { updateElement, slides, currentSlideIndex } = useEditorStore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'data' | 'styling'>('data');

  useEffect(() => {
    if (chartElement && chartElement.chartOption) {
      // Extract data from chart option
      const option = chartElement.chartOption;
      
      if (option.series && option.series.length > 0) {
        const firstSeries = option.series[0];
        if (firstSeries.data) {
          setChartData(Array.isArray(firstSeries.data[0]) ? firstSeries.data : [firstSeries.data]);
        }
      }
      
      if (option.xAxis && option.xAxis.data) {
        setLabels(option.xAxis.data);
      }
      
      // Extract colors from series
      const seriesColors = option.series?.map((s: any) => s.itemStyle?.color || '#6366f1') || [];
      setColors(seriesColors);
    }
  }, [chartElement]);

  const updateChart = (newData: any[], newLabels: string[], newColors: string[]) => {
    if (!chartElement) return;

    const { slides, currentSlideIndex } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    
    if (!currentSlide) return;

    // Create new chart option with updated data
    const newOption = { ...chartElement.chartOption };
    
    if (newOption.series && newOption.series.length > 0) {
      newOption.series = newOption.series.map((series: any, index: number) => ({
        ...series,
        data: newData[index] || newData[0] || [],
        itemStyle: { ...series.itemStyle, color: newColors[index] || newColors[0] || '#6366f1' }
      }));
    }
    
    if (newOption.xAxis) {
      newOption.xAxis.data = newLabels;
    }
    
    if (newOption.yAxis && newOption.yAxis.type === 'category') {
      newOption.yAxis.data = newLabels;
    }

    // Update the chart element
    updateElement(currentSlide.id, chartElement.id, {
      chartOption: newOption
    });
  };

  const addDataSeries = () => {
    const newSeries = Array(labels.length).fill(0).map(() => Math.floor(Math.random() * 200) + 50);
    const newColors = [...colors, `#${Math.floor(Math.random()*16777215).toString(16)}`];
    
    setChartData([...chartData, newSeries]);
    setColors(newColors);
    updateChart([...chartData, newSeries], labels, newColors);
  };

  const removeDataSeries = (index: number) => {
    const newData = chartData.filter((_, i) => i !== index);
    const newColors = colors.filter((_, i) => i !== index);
    
    setChartData(newData);
    setColors(newColors);
    updateChart(newData, labels, newColors);
  };

  const updateDataValue = (seriesIndex: number, labelIndex: number, value: number) => {
    const newData = [...chartData];
    if (newData[seriesIndex]) {
      newData[seriesIndex][labelIndex] = value;
      setChartData(newData);
      updateChart(newData, labels, colors);
    }
  };

  const updateLabel = (index: number, label: string) => {
    const newLabels = [...labels];
    newLabels[index] = label;
    setLabels(newLabels);
    updateChart(chartData, newLabels, colors);
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
    updateChart(chartData, labels, newColors);
  };

  const addLabel = () => {
    const newLabels = [...labels, `Label ${labels.length + 1}`];
    const newData = chartData.map(series => [...series, Math.floor(Math.random() * 200) + 50]);
    
    setLabels(newLabels);
    setChartData(newData);
    updateChart(newData, newLabels, colors);
  };

  const removeLabel = (index: number) => {
    const newLabels = labels.filter((_, i) => i !== index);
    const newData = chartData.map(series => series.filter((_, i) => i !== index));
    
    setLabels(newLabels);
    setChartData(newData);
    updateChart(newData, newLabels, colors);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Chart Editor</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'data' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Data
        </button>
        <button
          onClick={() => setActiveTab('styling')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'styling' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Styling
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Labels Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Labels</h4>
                <button
                  onClick={addLabel}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-2">
                {labels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => updateLabel(index, e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeLabel(index)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Series Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Data Series</h4>
                <button
                  onClick={addDataSeries}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {chartData.map((series, seriesIndex) => (
                  <div key={seriesIndex} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Series {seriesIndex + 1}</span>
                      {chartData.length > 1 && (
                        <button
                          onClick={() => removeDataSeries(seriesIndex)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {series.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">
                            {labels[valueIndex] || `Value ${valueIndex + 1}`}
                          </label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => updateDataValue(seriesIndex, valueIndex, Number(e.target.value))}
                            className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'styling' && (
          <div className="space-y-4">
            {/* Colors Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Series Colors</h4>
              <div className="space-y-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Series {index + 1}</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Type Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Chart Type</h4>
              <p className="text-xs text-gray-600">
                Current: <span className="font-medium">{chartElement.chartType}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To change chart type, delete this chart and create a new one from the chart menu.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartEditor;
