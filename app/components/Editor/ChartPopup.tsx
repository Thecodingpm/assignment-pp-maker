'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  FileSpreadsheet, 
  BarChart, 
  LineChart,
  AreaChart,
  Upload,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface ChartPopupProps {
  isVisible: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const ChartPopup: React.FC<ChartPopupProps> = ({
  isVisible,
  onClose,
  position
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<'charts' | 'integrations'>('charts');
  const { addElement, canvasSize } = useEditorStore();

  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  // Close popup when pressing Escape
  useEffect(() => {
    if (!isVisible) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // ECharts configuration for different chart types
  const getChartOption = (chartType: string) => {
    const baseOption = {
      grid: { top: 10, right: 10, bottom: 20, left: 40, containLabel: true },
      xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
      yAxis: { type: 'value' },
      series: [],
      tooltip: { trigger: 'axis' },
      animation: false
    };

    switch (chartType) {
      case 'column':
        return {
          ...baseOption,
          series: [{
            type: 'bar',
            data: [120, 200, 150, 80, 70],
            itemStyle: { color: '#6366f1' }
          }]
        };
      
      case 'grouped-column':
        return {
          ...baseOption,
          series: [
            { type: 'bar', data: [120, 200, 150, 80, 70], itemStyle: { color: '#6366f1' } },
            { type: 'bar', data: [90, 150, 120, 60, 50], itemStyle: { color: '#8b5cf6' } }
          ]
        };
      
      case 'stacked-column':
        return {
          ...baseOption,
          series: [
            { type: 'bar', stack: 'total', data: [120, 200, 150, 80, 70], itemStyle: { color: '#6366f1' } },
            { type: 'bar', stack: 'total', data: [90, 150, 120, 60, 50], itemStyle: { color: '#f59e0b' } }
          ]
        };
      
      case 'bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
          series: [{
            type: 'bar',
            data: [120, 200, 150, 80, 70],
            itemStyle: { color: '#6366f1' }
          }]
        };
      
      case 'grouped-bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
          series: [
            { type: 'bar', data: [120, 200, 150, 80, 70], itemStyle: { color: '#6366f1' } },
            { type: 'bar', data: [90, 150, 120, 60, 50], itemStyle: { color: '#8b5cf6' } }
          ]
        };
      
      case 'stacked-bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
          series: [
            { type: 'bar', stack: 'total', data: [120, 200, 150, 80, 70], itemStyle: { color: '#6366f1' } },
            { type: 'bar', stack: 'total', data: [90, 150, 120, 60, 50], itemStyle: { color: '#f59e0b' } }
          ]
        };
      
      case 'line':
        return {
          ...baseOption,
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70],
            itemStyle: { color: '#6366f1' },
            smooth: true
          }]
        };
      
      case 'line-markers':
        return {
          ...baseOption,
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70],
            itemStyle: { color: '#6366f1' },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6
          }]
        };
      
      case 'multiple-lines':
        return {
          ...baseOption,
          series: [
            { type: 'line', data: [120, 200, 150, 80, 70], itemStyle: { color: '#6366f1' }, smooth: true },
            { type: 'line', data: [90, 150, 120, 60, 50], itemStyle: { color: '#f59e0b' }, smooth: true }
          ]
        };
      
      case 'area':
        return {
          ...baseOption,
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70],
            itemStyle: { color: '#6366f1' },
            smooth: true,
            areaStyle: { color: '#6366f1', opacity: 0.3 }
          }]
        };
      
      case 'stacked-area':
        return {
          ...baseOption,
          series: [
            { type: 'line', stack: 'total', data: [120, 200, 150, 80, 70], itemStyle: { color: '#6366f1' }, smooth: true, areaStyle: { color: '#6366f1', opacity: 0.3 } },
            { type: 'line', stack: 'total', data: [90, 150, 120, 60, 50], itemStyle: { color: '#f59e0b' }, smooth: true, areaStyle: { color: '#f59e0b', opacity: 0.3 } }
          ]
        };
      
      case 'pie':
        return {
          series: [{
            type: 'pie',
            radius: '50%',
            data: [
              { value: 335, name: 'Direct', itemStyle: { color: '#6366f1' } },
              { value: 310, name: 'Email', itemStyle: { color: '#8b5cf6' } },
              { value: 234, name: 'Affiliate', itemStyle: { color: '#f59e0b' } },
              { value: 135, name: 'Video', itemStyle: { color: '#10b981' } }
            ],
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'doughnut':
        return {
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 335, name: 'Direct', itemStyle: { color: '#6366f1' } },
              { value: 310, name: 'Email', itemStyle: { color: '#8b5cf6' } },
              { value: 234, name: 'Affiliate', itemStyle: { color: '#f59e0b' } },
              { value: 135, name: 'Video', itemStyle: { color: '#10b981' } }
            ],
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'scatter':
        return {
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [{
            type: 'scatter',
            data: [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40]],
            itemStyle: { color: '#6366f1' },
            symbolSize: 8
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'bubble':
        return {
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [{
            type: 'scatter',
            data: [
              [10, 20, 5], [15, 25, 8], [20, 30, 12], [25, 35, 15], [30, 40, 20]
            ],
            itemStyle: { color: '#6366f1' },
            symbolSize: function (data: any) { return data[2] * 2; }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      default:
        return baseOption;
    }
  };

  const chartTypes = {
    'Column & bar charts': [
      { name: 'Simple Column', type: 'column' },
      { name: 'Grouped Column', type: 'grouped-column' },
      { name: 'Stacked Column', type: 'stacked-column' },
      { name: 'Simple Bar', type: 'bar' },
      { name: 'Grouped Bar', type: 'grouped-bar' },
      { name: 'Stacked Bar', type: 'stacked-bar' },
      { name: '100% Stacked', type: '100-stacked' },
      { name: 'Range Column', type: 'range-column' },
      { name: 'Waterfall', type: 'waterfall' }
    ],
    'Line & area charts': [
      { name: 'Simple Line', type: 'line' },
      { name: 'Line with Markers', type: 'line-markers' },
      { name: 'Multiple Lines', type: 'multiple-lines' },
      { name: 'Area Chart', type: 'area' },
      { name: 'Stacked Area', type: 'stacked-area' },
      { name: '100% Area', type: '100-area' }
    ],
    'Pie & doughnut charts': [
      { name: 'Simple Pie', type: 'pie' },
      { name: 'Doughnut', type: 'doughnut' },
      { name: 'Exploded Pie', type: 'exploded-pie' },
      { name: 'Pie with Labels', type: 'pie-labels' }
    ],
    'Scatter & bubble charts': [
      { name: 'Simple Scatter', type: 'scatter' },
      { name: 'Bubble Chart', type: 'bubble' },
      { name: 'Scatter with Line', type: 'scatter-line' }
    ]
  };

  const integrations = [
    {
      name: 'Import a CSV',
      icon: Upload,
      description: 'Upload your data file',
      color: 'bg-blue-500'
    },
    {
      name: 'Google Sheets',
      icon: FileSpreadsheet,
      description: 'Connect to your spreadsheets',
      color: 'bg-green-500'
    },
    {
      name: 'Google Analytics',
      icon: BarChart,
      description: 'Import analytics data',
      color: 'bg-orange-500'
    },
    {
      name: 'ChartMogul',
      icon: TrendingUp,
      description: 'Business metrics & analytics',
      color: 'bg-indigo-500'
    }
  ];

  const handleChartSelect = (chartType: string) => {
    console.log('Chart selected:', chartType);
    
    // Create a new chart element and add it to the canvas
    const { slides, currentSlideIndex } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    
    if (currentSlide) {
      // Calculate center position for new chart element
      const centerX = (canvasSize.width / 2) - 200;
      const centerY = (canvasSize.height / 2) - 150;
      
      const newChartElement = {
        type: 'chart' as const,
        x: centerX,
        y: centerY,
        width: 400,
        height: 300,
        rotation: 0,
        zIndex: 1,
        chartType: chartType,
        chartOption: getChartOption(chartType),
        data: null // Will be populated when user adds data
      };
      
      addElement(currentSlide.id, newChartElement);
      console.log('Added chart to canvas:', newChartElement);
    }
    
    onClose();
  };

  const handleIntegrationSelect = (integration: string) => {
    console.log('Integration selected:', integration);
    // TODO: Implement integration logic
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
        onClick={onClose}
      />
      
      {/* Chart Popup */}
      <div
        ref={popupRef}
        className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 w-[800px] max-h-[600px] overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Charts</h3>
          <p className="text-sm text-gray-600 mt-1">Add beautiful charts to your presentation</p>
        </div>

        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-100">
            {/* Navigation */}
            <div className="p-4">
              <button
                onClick={() => setActiveSection('charts')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === 'charts' 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Charts
              </button>
            </div>

            {/* Integrations Section */}
            <div className="px-4 pb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Integrations</h4>
              <div className="space-y-2">
                {integrations.map((integration) => {
                  const Icon = integration.icon;
                  return (
                    <button
                      key={integration.name}
                      onClick={() => handleIntegrationSelect(integration.name)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${integration.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{integration.name}</div>
                          <div className="text-xs text-gray-500">{integration.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Feedback Section */}
              <div className="mt-6 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  Which other apps would you like to see on this list?{' '}
                  <button className="text-purple-600 hover:text-purple-700 font-medium">
                    Let us know
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeSection === 'charts' && (
              <div className="space-y-6">
                {Object.entries(chartTypes).map(([category, charts]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">{category}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {charts.map((chart) => (
                        <button
                          key={chart.type}
                          onClick={() => handleChartSelect(chart.type)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center group"
                        >
                          <div className="w-24 h-20 mx-auto mb-2 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                            <ReactECharts
                              option={getChartOption(chart.type)}
                              style={{ height: '100%', width: '100%' }}
                              opts={{ renderer: 'canvas' }}
                            />
                          </div>
                          <div className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                            {chart.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartPopup;
