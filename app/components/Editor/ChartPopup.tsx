'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  BarChart3, LineChart, PieChart, Scatter, TrendingUp, 
  Activity, Target, Zap, Layers, Hexagon, Circle, 
  Square, Triangle, Sparkles 
} from 'lucide-react';

interface ChartPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onInsertChart: (chartType: string, chartOption: any) => void;
}

const ChartPopup: React.FC<ChartPopupProps> = ({
  isVisible,
  onClose,
  onInsertChart
}) => {
  const [selectedChartType, setSelectedChartType] = useState<string>('');

  if (!isVisible) return null;

  const getChartOption = (chartType: string) => {
    const baseOption = {
      title: {
        text: chartType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };

    switch (chartType) {
      case 'column':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: [120, 200, 150, 80, 70, 110, 130] }]
        };
      case 'bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          series: [{ type: 'bar', data: [120, 200, 150, 80, 70, 110, 130] }]
        };
      case 'line':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value' },
          series: [{ type: 'line', data: [120, 200, 150, 80, 70, 110, 130] }]
        };
      case 'area':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value' },
          series: [{ type: 'line', areaStyle: {}, data: [120, 200, 150, 80, 70, 110, 130] }]
        };
      case 'pie':
        return {
          ...baseOption,
          series: [{
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1048, name: 'Search Engine' },
              { value: 735, name: 'Direct' },
              { value: 580, name: 'Email' },
              { value: 484, name: 'Union Ads' },
              { value: 300, name: 'Video Ads' }
            ]
          }]
        };
      case 'doughnut':
        return {
          ...baseOption,
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: 1048, name: 'Search Engine' },
              { value: 735, name: 'Direct' },
              { value: 580, name: 'Email' },
              { value: 484, name: 'Union Ads' },
              { value: 300, name: 'Video Ads' }
            ]
          }]
        };
      case 'scatter':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [{
            type: 'scatter',
            data: [[10, 8.04], [8, 6.95], [13, 7.58], [9, 8.81], [11, 8.33]]
          }]
        };
      case 'bubble':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [{
            type: 'scatter',
            symbolSize: function (data: any) {
              return Math.sqrt(data[2]) * 5;
            },
            data: [[10, 8.04, 5], [8, 6.95, 3], [13, 7.58, 8], [9, 8.81, 2], [11, 8.33, 6]]
          }]
        };
      case '100-stacked':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value', max: 100 },
          series: [
            { type: 'bar', stack: 'total', data: [20, 30, 25, 15, 10, 20, 25] },
            { type: 'bar', stack: 'total', data: [30, 25, 20, 25, 20, 15, 20] },
            { type: 'bar', stack: 'total', data: [50, 45, 55, 60, 70, 65, 55] }
          ]
        };
      case 'range-column':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value' },
          series: [{
            type: 'bar',
            data: [
              [10, 20], [15, 25], [12, 18], [8, 15], [20, 30], [25, 35], [18, 28]
            ]
          }]
        };
      case 'waterfall':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Initial', 'Development', 'Testing', 'Deployment', 'Total'] },
          yAxis: { type: 'value' },
          series: [{
            type: 'bar',
            data: [100, 80, 60, 40, 280],
            itemStyle: {
              color: function(params: any) {
                return params.dataIndex === 4 ? '#91cc75' : '#5470c6';
              }
            }
          }]
        };
      case '100-area':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
          yAxis: { type: 'value', max: 100 },
          series: [
            { type: 'line', areaStyle: {}, stack: 'total', data: [20, 30, 25, 15, 10, 20, 25] },
            { type: 'line', areaStyle: {}, stack: 'total', data: [30, 25, 20, 25, 20, 15, 20] },
            { type: 'line', areaStyle: {}, stack: 'total', data: [50, 45, 55, 60, 70, 65, 55] }
          ]
        };
      case 'exploded-pie':
        return {
          ...baseOption,
          series: [{
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1048, name: 'Search Engine' },
              { value: 735, name: 'Direct' },
              { value: 580, name: 'Email' },
              { value: 484, name: 'Union Ads' },
              { value: 300, name: 'Video Ads' }
            ],
            selectedMode: 'single',
            selectedOffset: 30
          }]
        };
      case 'pie-labels':
        return {
          ...baseOption,
          series: [{
            type: 'pie',
            radius: '50%',
            label: {
              show: true,
              formatter: '{b}: {c} ({d}%)'
            },
            data: [
              { value: 1048, name: 'Search Engine' },
              { value: 735, name: 'Direct' },
              { value: 580, name: 'Email' },
              { value: 484, name: 'Union Ads' },
              { value: 300, name: 'Video Ads' }
            ]
          }]
        };
      case 'scatter-line':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [
            { type: 'scatter', data: [[10, 8.04], [8, 6.95], [13, 7.58], [9, 8.81], [11, 8.33]] },
            { type: 'line', data: [[8, 6.95], [13, 7.58], [9, 8.81], [11, 8.33]] }
          ]
        };
      case 'radar':
        return {
          ...baseOption,
          radar: {
            indicator: [
              { name: 'Sales', max: 6500 },
              { name: 'Administration', max: 16000 },
              { name: 'Information Technology', max: 30000 },
              { name: 'Customer Support', max: 38000 },
              { name: 'Development', max: 52000 },
              { name: 'Marketing', max: 25000 }
            ]
          },
          series: [{
            type: 'radar',
            data: [{
              value: [4200, 3000, 20000, 35000, 50000, 18000],
              name: 'Allocated Budget'
            }]
          }]
        };
      case 'funnel':
        return {
          ...baseOption,
          series: [{
            type: 'funnel',
            left: '10%',
            width: '80%',
            height: '80%',
            data: [
              { value: 100, name: 'Visit' },
              { value: 80, name: 'Inquiry' },
              { value: 60, name: 'Order' },
              { value: 40, name: 'Payment' },
              { value: 20, name: 'Delivery' }
            ]
          }]
        };
      case 'gauge':
        return {
          ...baseOption,
          series: [{
            type: 'gauge',
            progress: { show: true },
            detail: { valueAnimation: true, formatter: '{value}%' },
            data: [{ value: 70, name: 'Completion Rate' }]
          }]
        };
      case 'candlestick':
        return {
          ...baseOption,
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
          yAxis: { type: 'value' },
          series: [{
            type: 'candlestick',
            data: [
              [20, 34, 10, 38],
              [40, 35, 30, 50],
              [31, 38, 31, 44],
              [38, 15, 5, 42],
              [48, 28, 20, 49]
            ]
          }]
        };
      case 'heatmap':
        return {
          ...baseOption,
          visualMap: {
            min: 0,
            max: 10,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%',
            inRange: {
              color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
          },
          xAxis: { type: 'category', data: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a'] },
          yAxis: { type: 'category', data: ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Sunday'] },
          series: [{
            type: 'heatmap',
            data: [
              [0, 0, 5], [0, 1, 7], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0],
              [1, 0, 0], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0],
              [2, 0, 0], [2, 1, 0], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0],
              [3, 0, 0], [3, 1, 0], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0],
              [4, 0, 0], [4, 1, 0], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 0], [4, 6, 0],
              [5, 0, 0], [5, 1, 0], [5, 2, 0], [5, 3, 0], [5, 4, 0], [5, 5, 0], [5, 6, 0],
              [6, 0, 0], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0],
              [7, 0, 0], [7, 1, 0], [7, 2, 0], [7, 3, 0], [7, 4, 0], [7, 5, 0], [7, 6, 0],
              [8, 0, 0], [8, 1, 0], [8, 2, 0], [8, 3, 0], [8, 4, 0], [8, 5, 0], [8, 6, 0],
              [9, 0, 0], [9, 1, 0], [9, 2, 0], [9, 3, 0], [9, 4, 0], [9, 5, 0], [9, 6, 0],
              [10, 0, 0], [10, 1, 0], [10, 2, 0], [10, 3, 0], [10, 4, 0], [10, 5, 0], [10, 6, 0],
              [11, 0, 0], [11, 1, 0], [11, 2, 0], [11, 3, 0], [11, 4, 0], [11, 5, 0], [11, 6, 0]
            ]
          }]
        };
      case 'treemap':
        return {
          ...baseOption,
          series: [{
            type: 'treemap',
            data: [
              { name: 'nodeA', value: 10, children: [
                { name: 'nodeAa', value: 4 },
                { name: 'nodeAb', value: 6 }
              ]},
              { name: 'nodeB', value: 20, children: [
                { name: 'nodeBa', value: 20, children: [
                  { name: 'nodeBa1', value: 20 }
                ]}
              ]}
            ]
          }]
        };
      case 'sankey':
        return {
          ...baseOption,
          series: [{
            type: 'sankey',
            data: [
              { name: 'Category A' },
              { name: 'Category B' },
              { name: 'Category C' },
              { name: 'Category D' }
            ],
            links: [
              { source: 'Category A', target: 'Category B', value: 10 },
              { source: 'Category A', target: 'Category C', value: 20 },
              { source: 'Category B', target: 'Category D', value: 15 },
              { source: 'Category C', target: 'Category D', value: 25 }
            ]
          }]
        };
      default:
        return baseOption;
    }
  };

  const chartTypes = {
    "Column & Bar Charts": {
      column: { icon: BarChart3, color: '#3b82f6' },
      bar: { icon: BarChart3, color: '#10b981' },
      '100-stacked': { icon: Layers, color: '#8b5cf6' },
      'range-column': { icon: Target, color: '#f59e0b' },
      waterfall: { icon: TrendingUp, color: '#ef4444' }
    },
    "Line & Area Charts": {
      line: { icon: LineChart, color: '#06b6d4' },
      area: { icon: TrendingUp, color: '#84cc16' },
      '100-area': { icon: Layers, color: '#ec4899' },
      'scatter-line': { icon: Activity, color: '#f97316' }
    },
    "Pie & Doughnut Charts": {
      pie: { icon: PieChart, color: '#8b5cf6' },
      doughnut: { icon: Circle, color: '#06b6d4' },
      'exploded-pie': { icon: Sparkles, color: '#f59e0b' },
      'pie-labels': { icon: Target, color: '#10b981' }
    },
    "Scatter & Bubble Charts": {
      scatter: { icon: Scatter, color: '#ef4444' },
      bubble: { icon: Zap, color: '#8b5cf6' }
    },
    "Specialized Charts": {
      radar: { icon: Target, color: '#06b6d4' },
      funnel: { icon: Triangle, color: '#f59e0b' },
      gauge: { icon: Circle, color: '#10b981' },
      candlestick: { icon: BarChart3, color: '#ef4444' },
      heatmap: { icon: Square, color: '#8b5cf6' },
      treemap: { icon: Hexagon, color: '#06b6d4' },
      sankey: { icon: Sparkles, color: '#f59e0b' }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
        onClick={onClose}
      />
      
      {/* Chart Popup */}
      <div className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 w-[900px] max-h-[700px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Insert Chart</h2>
              <p className="text-sm text-gray-600 mt-1">Choose from a variety of chart types to visualize your data</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex overflow-y-auto max-h-[600px]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-100 bg-gray-50 p-4">
            <div className="space-y-4">
              {Object.entries(chartTypes).map(([category, charts]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {Object.entries(charts).map(([chartType, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <button
                          key={chartType}
                          onClick={() => setSelectedChartType(chartType)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                            selectedChartType === chartType
                              ? 'bg-blue-100 border border-blue-300'
                              : 'hover:bg-white hover:shadow-sm'
                          }`}
                        >
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: config.color + '20' }}
                          >
                            <IconComponent 
                              className="w-4 h-4" 
                              style={{ color: config.color }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {chartType.replace(/-/g, ' ')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 p-6">
            {selectedChartType ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">
                    {selectedChartType.replace(/-/g, ' ')} Preview
                  </h3>
                  <button
                    onClick={() => onInsertChart(selectedChartType, getChartOption(selectedChartType))}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Insert Chart
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <ReactECharts
                    option={getChartOption(selectedChartType)}
                    style={{ height: '400px' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a chart type to preview</p>
                  <p className="text-sm">Choose from the sidebar to see how your chart will look</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartPopup;
