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
  MessageSquare,
  Target,
  Zap,
  Layers,
  Hexagon,
  Star,
  Circle,
  Square,
  Triangle,
  Diamond,
  Heart,
  Sparkles,
  Rocket,
  Crown,
  Trophy,
  Lightning,
  Flame,
  Leaf,
  Cloud,
  Sun,
  Moon,
  Cube,
  Box,
  Globe
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useEditorStore } from '../../stores/useEditorStore';

// Import echarts-gl for 3D charts
import 'echarts-gl';

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

  // Enhanced ECharts configuration for different chart types
  const getChartOption = (chartType: string) => {
    const baseOption = {
      grid: { top: 10, right: 10, bottom: 20, left: 40, containLabel: true },
      xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
      yAxis: { type: 'value' },
      series: [],
      tooltip: { trigger: 'axis' },
      animation: false
    };

    // Common 3D configuration for better performance and appearance
    const base3DOption = {
      grid3D: {
        viewControl: {
          projection: 'orthographic',
          autoRotate: true,
          autoRotateSpeed: 10,
          distance: 200,
          alpha: 20,
          beta: 40
        },
        light: {
          main: {
            intensity: 1.2,
            shadow: true
          },
          ambient: {
            intensity: 0.3
          }
        },
        environment: '#000',
        shading: 'realistic'
      }
    };

    switch (chartType) {
      case 'column':
        return {
          ...baseOption,
          series: [{
            type: 'bar',
            data: [120, 200, 150, 80, 70, 110],
            itemStyle: { color: '#6366f1' }
          }]
        };
      
      case 'grouped-column':
        return {
          ...baseOption,
          series: [
            { type: 'bar', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' } },
            { type: 'bar', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#8b5cf6' } }
          ]
        };
      
      case 'stacked-column':
        return {
          ...baseOption,
          series: [
            { type: 'bar', stack: 'total', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' } },
            { type: 'bar', stack: 'total', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#f59e0b' } }
          ]
        };
      
      case '100-stacked':
        return {
          ...baseOption,
          series: [
            { type: 'bar', stack: 'total', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' } },
            { type: 'bar', stack: 'total', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#f59e0b' } }
          ]
        };
      
      case 'range-column':
        return {
          ...baseOption,
          series: [{
            type: 'bar',
            data: [[120, 180], [200, 250], [150, 200], [80, 120], [70, 100], [110, 160]],
            itemStyle: { color: '#6366f1' }
          }]
        };
      
      case 'waterfall':
        return {
          ...baseOption,
          series: [{
            type: 'bar',
            data: [120, 80, -50, -30, -10, 40],
            itemStyle: {
              color: function(params: any) {
                return params.data >= 0 ? '#10b981' : '#ef4444';
              }
            }
          }]
        };
      
      case 'bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
          series: [{
            type: 'bar',
            data: [120, 200, 150, 80, 70, 110],
            itemStyle: { color: '#6366f1' }
          }]
        };
      
      case 'grouped-bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
          series: [
            { type: 'bar', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' } },
            { type: 'bar', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#8b5cf6' } }
          ]
        };
      
      case 'stacked-bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
          series: [
            { type: 'bar', stack: 'total', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' } },
            { type: 'bar', stack: 'total', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#f59e0b' } }
          ]
        };
      
      case 'line':
        return {
          ...baseOption,
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70, 110],
            itemStyle: { color: '#6366f1' },
            smooth: true
          }]
        };
      
      case 'line-markers':
        return {
          ...baseOption,
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70, 110],
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
            { type: 'line', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' }, smooth: true },
            { type: 'line', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#f59e0b' }, smooth: true }
          ]
        };
      
      case 'area':
        return {
          ...baseOption,
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70, 110],
            itemStyle: { color: '#6366f1' },
            smooth: true,
            areaStyle: { color: '#6366f1', opacity: 0.3 }
          }]
        };
      
      case 'stacked-area':
        return {
          ...baseOption,
          series: [
            { type: 'line', stack: 'total', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' }, smooth: true, areaStyle: { color: '#6366f1', opacity: 0.3 } },
            { type: 'line', stack: 'total', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#f59e0b' }, smooth: true, areaStyle: { color: '#f59e0b', opacity: 0.3 } }
          ]
        };
      
      case '100-area':
        return {
          ...baseOption,
          series: [
            { type: 'line', stack: 'total', data: [120, 200, 150, 80, 70, 110], itemStyle: { color: '#6366f1' }, smooth: true, areaStyle: { color: '#6366f1', opacity: 0.3 } },
            { type: 'line', stack: 'total', data: [90, 150, 120, 60, 50, 80], itemStyle: { color: '#f59e0b' }, smooth: true, areaStyle: { color: '#f59e0b', opacity: 0.3 } }
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
              { value: 135, name: 'Video', itemStyle: { color: '#10b981' } },
              { value: 148, name: 'Social', itemStyle: { color: '#ef4444' } }
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
              { value: 135, name: 'Video', itemStyle: { color: '#10b981' } },
              { value: 148, name: 'Social', itemStyle: { color: '#ef4444' } }
            ],
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'exploded-pie':
        return {
          series: [{
            type: 'pie',
            radius: '50%',
            data: [
              { value: 335, name: 'Direct', itemStyle: { color: '#6366f1' } },
              { value: 310, name: 'Email', itemStyle: { color: '#8b5cf6' } },
              { value: 234, name: 'Affiliate', itemStyle: { color: '#f59e0b' } },
              { value: 135, name: 'Video', itemStyle: { color: '#10b981' } },
              { value: 148, name: 'Social', itemStyle: { color: '#ef4444' } }
            ],
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
            selectedOffset: 30
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'pie-labels':
        return {
          series: [{
            type: 'pie',
            radius: '50%',
            data: [
              { value: 335, name: 'Direct', itemStyle: { color: '#6366f1' } },
              { value: 310, name: 'Email', itemStyle: { color: '#8b5cf6' } },
              { value: 234, name: 'Affiliate', itemStyle: { color: '#f59e0b' } },
              { value: 135, name: 'Video', itemStyle: { color: '#10b981' } },
              { value: 148, name: 'Social', itemStyle: { color: '#ef4444' } }
            ],
            label: { show: true, position: 'outside' },
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
            data: [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40], [35, 45]],
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
              [10, 20, 5], [15, 25, 8], [20, 30, 12], [25, 35, 15], [30, 40, 20], [35, 45, 25]
            ],
            itemStyle: { color: '#6366f1' },
            symbolSize: function (data: any) { return data[2] * 2; }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'scatter-line':
        return {
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [
            {
              type: 'scatter',
              data: [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40], [35, 45]],
              itemStyle: { color: '#6366f1' },
              symbolSize: 8
            },
            {
              type: 'line',
              data: [[10, 20], [15, 25], [20, 30], [25, 35], [30, 40], [35, 45]],
              itemStyle: { color: '#8b5cf6' },
              smooth: true
            }
          ],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'radar':
        return {
          radar: {
            indicator: [
              { name: 'Sales', max: 100 },
              { name: 'Marketing', max: 100 },
              { name: 'Development', max: 100 },
              { name: 'Support', max: 100 },
              { name: 'Design', max: 100 }
            ]
          },
          series: [{
            type: 'radar',
            data: [{
              value: [80, 70, 90, 60, 85],
              itemStyle: { color: '#6366f1' }
            }]
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'funnel':
        return {
          series: [{
            type: 'funnel',
            data: [
              { value: 100, name: 'Leads' },
              { value: 80, name: 'Qualified' },
              { value: 60, name: 'Proposals' },
              { value: 40, name: 'Negotiation' },
              { value: 20, name: 'Closed' }
            ],
            itemStyle: { color: '#6366f1' }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'gauge':
        return {
          series: [{
            type: 'gauge',
            progress: { show: true },
            detail: { valueAnimation: true, formatter: '{value}%' },
            data: [{ value: 70, name: 'Completion' }],
            itemStyle: { color: '#6366f1' }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'candlestick':
        return {
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
            ],
            itemStyle: {
              color: '#10b981',
              color0: '#ef4444',
              borderColor: '#10b981',
              borderColor0: '#ef4444'
            }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'heatmap':
        return {
          xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
          yAxis: { type: 'category', data: ['Morning', 'Afternoon', 'Evening'] },
          visualMap: {
            min: 0,
            max: 10,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '5%',
            inRange: {
              color: ['#e0f2fe', '#0ea5e9', '#0369a1']
            }
          },
          series: [{
            type: 'heatmap',
            data: [
              [0, 0, 5], [0, 1, 7], [0, 2, 3],
              [1, 0, 6], [1, 1, 8], [1, 2, 4],
              [2, 0, 4], [2, 1, 6], [2, 2, 2],
              [3, 0, 8], [3, 1, 9], [3, 2, 5],
              [4, 0, 3], [4, 1, 5], [4, 2, 1]
            ]
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'treemap':
        return {
          series: [{
            type: 'treemap',
            data: [
              { name: 'Category A', value: 40, itemStyle: { color: '#6366f1' } },
              { name: 'Category B', value: 30, itemStyle: { color: '#8b5cf6' } },
              { name: 'Category C', value: 25, itemStyle: { color: '#f59e0b' } },
              { name: 'Category D', value: 20, itemStyle: { color: '#10b981' } },
              { name: 'Category E', value: 15, itemStyle: { color: '#ef4444' } }
            ],
            breadcrumb: { show: false },
            label: { show: true, position: 'inside' }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case 'sankey':
        return {
          series: [{
            type: 'sankey',
            data: [
              { name: 'Source A' },
              { name: 'Source B' },
              { name: 'Target A' },
              { name: 'Target B' }
            ],
            links: [
              { source: 'Source A', target: 'Target A', value: 5 },
              { source: 'Source A', target: 'Target B', value: 3 },
              { source: 'Source B', target: 'Target A', value: 4 },
              { source: 'Source B', target: 'Target B', value: 2 }
            ],
            itemStyle: { color: '#6366f1' }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-bar':
        return {
          ...base3DOption,
          xAxis3D: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
          yAxis3D: { type: 'category', data: ['Product A', 'Product B', 'Product C'] },
          zAxis3D: { type: 'value' },
          series: [{
            type: 'bar3D',
            data: [
              [0, 0, 120], [1, 0, 200], [2, 0, 150], [3, 0, 80], [4, 0, 70],
              [0, 1, 90], [1, 1, 150], [2, 1, 120], [3, 1, 60], [4, 1, 50],
              [0, 2, 110], [1, 2, 180], [2, 2, 140], [3, 2, 100], [4, 2, 90]
            ],
            itemStyle: { color: '#6366f1' },
            shading: 'realistic'
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-scatter':
        return {
          ...base3DOption,
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'value' },
          zAxis3D: { type: 'value' },
          series: [{
            type: 'scatter3D',
            data: [
              [10, 20, 30], [15, 25, 35], [20, 30, 40], [25, 35, 45], [30, 40, 50],
              [35, 45, 55], [40, 50, 60], [45, 55, 65], [50, 60, 70], [55, 65, 75]
            ],
            itemStyle: { color: '#6366f1' },
            symbolSize: 8
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-surface':
        return {
          ...base3DOption,
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'value' },
          zAxis3D: { type: 'value' },
          series: [{
            type: 'surface',
            data: (() => {
              const data = [];
              for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                  const x = i - 5;
                  const y = j - 5;
                  const z = Math.sin(Math.sqrt(x * x + y * y)) / Math.sqrt(x * x + y * y + 0.1);
                  data.push([x, y, z]);
                }
              }
              return data;
            })(),
            itemStyle: { color: '#6366f1' },
            shading: 'realistic',
            wireframe: {
              show: true,
              lineStyle: {
                color: '#6366f1',
                opacity: 0.3
              }
            }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-line':
        return {
          ...base3DOption,
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'value' },
          zAxis3D: { type: 'value' },
          series: [{
            type: 'line3D',
            data: [
              [0, 0, 0], [1, 1, 1], [2, 4, 2], [3, 9, 3], [4, 16, 4],
              [5, 25, 5], [6, 36, 6], [7, 49, 7], [8, 64, 8], [9, 81, 9]
            ],
            itemStyle: { color: '#6366f1' },
            lineStyle: { width: 3 }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-pie':
        return {
          ...base3DOption,
          series: [{
            type: 'pie3D',
            radius: '50%',
            data: [
              { value: 335, name: 'Direct', itemStyle: { color: '#6366f1' } },
              { value: 310, name: 'Email', itemStyle: { color: '#8b5cf6' } },
              { value: 234, name: 'Affiliate', itemStyle: { color: '#f59e0b' } },
              { value: 135, name: 'Video', itemStyle: { color: '#10b981' } },
              { value: 148, name: 'Social', itemStyle: { color: '#ef4444' } }
            ],
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#fff'
            }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-funnel':
        return {
          ...base3DOption,
          series: [{
            type: 'funnel3D',
            data: [
              { value: 100, name: 'Leads' },
              { value: 80, name: 'Qualified' },
              { value: 60, name: 'Proposals' },
              { value: 40, name: 'Negotiation' },
              { value: 20, name: 'Closed' }
            ],
            itemStyle: { color: '#6366f1' },
            emphasis: {
              itemStyle: {
                color: '#8b5cf6'
              }
            }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-scatter-cube':
        return {
          ...base3DOption,
          series: [{
            type: 'scatter3D',
            data: [
              [10, 20, 30], [15, 25, 35], [20, 30, 40], [25, 35, 45], [30, 40, 50],
              [35, 45, 55], [40, 50, 60], [45, 55, 65], [50, 60, 70], [55, 65, 75]
            ],
            itemStyle: { color: '#6366f1' },
            symbol: 'cube',
            symbolSize: 6
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-bar-horizontal':
        return {
          ...base3DOption,
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
          zAxis3D: { type: 'category', data: ['Product A', 'Product B', 'Product C'] },
          series: [{
            type: 'bar3D',
            data: [
              [120, 0, 0], [200, 1, 0], [150, 2, 0], [80, 3, 0], [70, 4, 0],
              [90, 0, 1], [150, 1, 1], [120, 2, 1], [60, 3, 1], [50, 4, 1],
              [110, 0, 2], [180, 1, 2], [140, 2, 2], [100, 3, 2], [90, 4, 2]
            ],
            itemStyle: { color: '#8b5cf6' },
            shading: 'realistic'
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-area':
        return {
          ...base3DOption,
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'value' },
          zAxis3D: { type: 'value' },
          series: [{
            type: 'surface',
            data: (() => {
              const data = [];
              for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                  const x = i - 4;
                  const y = j - 4;
                  const z = Math.cos(x * 0.5) * Math.sin(y * 0.5) * 2;
                  data.push([x, y, z]);
                }
              }
              return data;
            })(),
            itemStyle: { color: '#10b981' },
            shading: 'realistic',
            wireframe: {
              show: true,
              lineStyle: {
                color: '#10b981',
                opacity: 0.2
              }
            }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      case '3d-mathematical':
        return {
          ...base3DOption,
          xAxis3D: { type: 'value' },
          yAxis3D: { type: 'value' },
          zAxis3D: { type: 'value' },
          series: [{
            type: 'surface',
            data: (() => {
              const data = [];
              for (let i = 0; i < 12; i++) {
                for (let j = 0; j < 12; j++) {
                  const x = (i - 6) * 0.5;
                  const y = (j - 6) * 0.5;
                  const z = Math.sin(Math.sqrt(x * x + y * y)) / (Math.sqrt(x * x + y * y + 0.1)) + 
                           Math.cos(x) * Math.sin(y) * 0.5;
                  data.push([x, y, z]);
                }
              }
              return data;
            })(),
            itemStyle: { color: '#8b5cf6' },
            shading: 'realistic',
            wireframe: {
              show: true,
              lineStyle: {
                color: '#8b5cf6',
                opacity: 0.3
              }
            }
          }],
          tooltip: { trigger: 'item' },
          animation: false
        };
      
      default:
        return baseOption;
    }
  };

  // Enhanced chart types with better categorization and more options
  const chartTypes = {
    'Column & Bar Charts': [
      { name: 'Simple Column', type: 'column', icon: BarChart3, color: '#6366f1' },
      { name: 'Grouped Column', type: 'grouped-column', icon: Layers, color: '#8b5cf6' },
      { name: 'Stacked Column', type: 'stacked-column', icon: BarChart, color: '#f59e0b' },
      { name: '100% Stacked', type: '100-stacked', icon: Target, color: '#10b981' },
      { name: 'Range Column', type: 'range-column', icon: Activity, color: '#ef4444' },
      { name: 'Waterfall', type: 'waterfall', icon: TrendingUp, color: '#06b6d4' },
      { name: 'Simple Bar', type: 'bar', icon: BarChart3, color: '#8b5cf6' },
      { name: 'Grouped Bar', type: 'grouped-bar', icon: Layers, color: '#f59e0b' },
      { name: 'Stacked Bar', type: 'stacked-bar', icon: Target, color: '#10b981' }
    ],
    'Line & Area Charts': [
      { name: 'Simple Line', type: 'line', icon: TrendingUp, color: '#6366f1' },
      { name: 'Line with Markers', type: 'line-markers', icon: Target, color: '#8b5cf6' },
      { name: 'Multiple Lines', type: 'multiple-lines', icon: Layers, color: '#f59e0b' },
      { name: 'Area Chart', type: 'area', icon: AreaChart, color: '#10b981' },
      { name: 'Stacked Area', type: 'stacked-area', icon: Layers, color: '#ef4444' },
      { name: '100% Area', type: '100-area', icon: Target, color: '#06b6d4' }
    ],
    'Pie & Doughnut Charts': [
      { name: 'Simple Pie', type: 'pie', icon: PieChart, color: '#6366f1' },
      { name: 'Doughnut', type: 'doughnut', icon: Circle, color: '#8b5cf6' },
      { name: 'Exploded Pie', type: 'exploded-pie', icon: Zap, color: '#f59e0b' },
      { name: 'Pie with Labels', type: 'pie-labels', icon: Target, color: '#10b981' }
    ],
    'Scatter & Bubble Charts': [
      { name: 'Simple Scatter', type: 'scatter', icon: Target, color: '#6366f1' },
      { name: 'Bubble Chart', type: 'bubble', icon: Circle, color: '#8b5cf6' },
      { name: 'Scatter with Line', type: 'scatter-line', icon: TrendingUp, color: '#f59e0b' }
    ],
    'Specialized Charts': [
      { name: 'Radar Chart', type: 'radar', icon: Target, color: '#10b981' },
      { name: 'Funnel Chart', type: 'funnel', icon: Triangle, color: '#ef4444' },
      { name: 'Gauge Chart', type: 'gauge', icon: Circle, color: '#06b6d4' },
      { name: 'Candlestick', type: 'candlestick', icon: BarChart, color: '#8b5cf6' },
      { name: 'Heatmap', type: 'heatmap', icon: Square, color: '#f59e0b' },
      { name: 'Treemap', type: 'treemap', icon: Hexagon, color: '#10b981' },
      { name: 'Sankey Diagram', type: 'sankey', icon: TrendingUp, color: '#6366f1' }
    ],
    '3D Charts': [
      { name: '3D Bar Chart', type: '3d-bar', icon: Cube, color: '#6366f1' },
      { name: '3D Scatter Plot', type: '3d-scatter', icon: Target, color: '#8b5cf6' },
      { name: '3D Surface Plot', type: '3d-surface', icon: Box, color: '#f59e0b' },
      { name: '3D Line Chart', type: '3d-line', icon: TrendingUp, color: '#10b981' },
      { name: '3D Pie Chart', type: '3d-pie', icon: Globe, color: '#ef4444' },
      { name: '3D Funnel', type: '3d-funnel', icon: Triangle, color: '#06b6d4' },
      { name: '3D Cube Scatter', type: '3d-scatter-cube', icon: Cube, color: '#8b5cf6' },
      { name: '3D Horizontal Bar', type: '3d-bar-horizontal', icon: BarChart, color: '#f59e0b' },
      { name: '3D Area Chart', type: '3d-area', icon: AreaChart, color: '#10b981' },
      { name: '3D Mathematical', type: '3d-mathematical', icon: Box, color: '#8b5cf6' }
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
        className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 w-[900px] max-h-[700px] overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Charts</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add beautiful charts to your presentation • Now with 3D charts powered by echarts-gl
          </p>
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            💡 3D charts feature auto-rotation, realistic lighting, and interactive camera controls
          </div>
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

          {/* Main Content with Scroll */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
            {activeSection === 'charts' && (
              <div className="space-y-8">
                {Object.entries(chartTypes).map(([category, charts]) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      {category}
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {charts.map((chart) => {
                        const Icon = chart.icon;
                        return (
                          <button
                            key={chart.type}
                            onClick={() => handleChartSelect(chart.type)}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center group hover:shadow-md"
                          >
                            <div className="w-28 h-24 mx-auto mb-3 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                              <ReactECharts
                                option={getChartOption(chart.type)}
                                style={{ height: '100%', width: '100%' }}
                                opts={{ renderer: 'canvas' }}
                                onEvents={{
                                  error: (params: any) => {
                                    console.warn('Chart render error:', params);
                                  }
                                }}
                                notMerge={true}
                                lazyUpdate={true}
                                {...(chart.type.startsWith('3d') && {
                                  style: { height: '100%', width: '100%' },
                                  opts: { 
                                    renderer: 'canvas',
                                    useDirtyRect: false
                                  }
                                })}
                              />
                            </div>
                            <div className="flex items-center justify-center mb-2">
                              <div className="w-6 h-6 flex items-center justify-center">
                                {chart.type === 'column' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="8" width="3" height="12" fill={chart.color} rx="1"/>
                                    <rect x="9" y="12" width="3" height="8" fill={chart.color} rx="1"/>
                                    <rect x="14" y="6" width="3" height="14" fill={chart.color} rx="1"/>
                                    <rect x="19" y="10" width="3" height="10" fill={chart.color} rx="1"/>
                                  </svg>
                                )}
                                {chart.type === 'grouped-column' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="8" width="2" height="12" fill={chart.color} rx="1"/>
                                    <rect x="6" y="8" width="2" height="12" fill="#8b5cf6" rx="1"/>
                                    <rect x="9" y="12" width="2" height="8" fill={chart.color} rx="1"/>
                                    <rect x="12" y="12" width="2" height="8" fill="#8b5cf6" rx="1"/>
                                    <rect x="15" y="6" width="2" height="14" fill={chart.color} rx="1"/>
                                    <rect x="18" y="6" width="2" height="14" fill="#8b5cf6" rx="1"/>
                                  </svg>
                                )}
                                {chart.type === 'stacked-column' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="8" width="3" height="6" fill={chart.color} rx="1"/>
                                    <rect x="4" y="14" width="3" height="6" fill="#f59e0b" rx="1"/>
                                    <rect x="9" y="12" width="3" height="4" fill={chart.color} rx="1"/>
                                    <rect x="9" y="16" width="3" height="4" fill="#f59e0b" rx="1"/>
                                    <rect x="14" y="6" width="3" height="7" fill={chart.color} rx="1"/>
                                    <rect x="14" y="13" width="3" height="7" fill="#f59e0b" rx="1"/>
                                  </svg>
                                )}
                                {chart.type === '100-stacked' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="8" width="3" height="8" fill={chart.color} rx="1"/>
                                    <rect x="4" y="16" width="3" height="8" fill="#f59e0b" rx="1"/>
                                    <rect x="9" y="12" width="3" height="6" fill={chart.color} rx="1"/>
                                    <rect x="9" y="18" width="3" height="6" fill="#f59e0b" rx="1"/>
                                    <rect x="14" y="10" width="3" height="7" fill={chart.color} rx="1"/>
                                    <rect x="14" y="17" width="3" height="7" fill="#f59e0b" rx="1"/>
                                  </svg>
                                )}
                                {chart.type === 'range-column' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <line x1="6" y1="6" x2="6" y2="18" stroke={chart.color} strokeWidth="2"/>
                                    <line x1="6" y1="12" x2="18" y2="12" stroke={chart.color} strokeWidth="2"/>
                                    <line x1="18" y1="8" x2="18" y2="16" stroke={chart.color} strokeWidth="2"/>
                                    <circle cx="6" cy="12" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'waterfall' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="12" width="3" height="8" fill="#10b981" rx="1"/>
                                    <rect x="9" y="14" width="3" height="6" fill="#ef4444" rx="1"/>
                                    <rect x="14" y="16" width="3" height="4" fill="#10b981" rx="1"/>
                                    <rect x="19" y="18" width="3" height="2" fill="#10b981" rx="1"/>
                                  </svg>
                                )}
                                {chart.type === 'bar' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="8" y="4" width="12" height="3" fill={chart.color} rx="1"/>
                                    <rect x="8" y="9" width="8" height="3" fill={chart.color} rx="1"/>
                                    <rect x="8" y="14" width="16" height="3" fill={chart.color} rx="1"/>
                                    <rect x="8" y="19" width="6" height="3" fill={chart.color} rx="1"/>
                                  </svg>
                                )}
                                {chart.type === 'grouped-bar' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="8" y="4" width="6" height="3" fill={chart.color} rx="1"/>
                                    <rect x="15" y="4" width="6" height="3" fill="#8b5cf6" rx="1"/>
                                    <rect x="8" y="9" width="4" height="3" fill={chart.color} rx="1"/>
                                    <rect x="15" y="9" width="4" height="3" fill="#8b5cf6" rx="1"/>
                                    <rect x="8" y="14" width="8" height="3" fill={chart.color} rx="1"/>
                                    <rect x="15" y="14" width="8" height="3" fill="#8b5cf6" rx="1"/>
                                  </svg>
                                )}
                                {chart.type === 'stacked-bar' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="8" y="4" width="8" height="3" fill={chart.color} rx="1"/>
                                    <rect x="16" y="4" width="6" height="3" fill="#f59e0b" rx="1"/>
                                    <rect x="8" y="9" width="6" height="3" fill={chart.color} rx="1"/>
                                    <rect x="14" y="9" width="4" height="3" fill="#f59e0b" rx="1"/>
                                    <rect x="8" y="14" width="12" height="3" fill={chart.color} rx="1"/>
                                    <rect x="20" y="14" width="4" height="3" fill="#f59e0b" rx="1"/>
                                  </svg>
                                )}
                                {chart.type === 'line' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 18L8 14L12 16L16 10L20 12" stroke={chart.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="8" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="20" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'line-markers' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 18L8 14L12 16L16 10L20 12" stroke={chart.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="8" cy="14" r="3" fill={chart.color}/>
                                    <circle cx="12" cy="16" r="3" fill={chart.color}/>
                                    <circle cx="16" cy="10" r="3" fill={chart.color}/>
                                    <circle cx="20" cy="12" r="3" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'multiple-lines' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 18L8 14L12 16L16 10L20 12" stroke={chart.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M4 16L8 12L12 14L16 8L20 10" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="8" cy="14" r="1.5" fill={chart.color}/>
                                    <circle cx="12" cy="16" r="1.5" fill={chart.color}/>
                                    <circle cx="16" cy="10" r="1.5" fill={chart.color}/>
                                    <circle cx="20" cy="12" r="1.5" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'area' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 18L8 14L12 16L16 10L20 12L20 20L4 20Z" fill={chart.color} fillOpacity="0.3"/>
                                    <path d="M4 18L8 14L12 16L16 10L20 12" stroke={chart.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                                {chart.type === 'stacked-area' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 18L8 14L12 16L16 10L20 12L20 20L4 20Z" fill={chart.color} fillOpacity="0.3"/>
                                    <path d="M4 16L8 12L12 14L16 8L20 10L20 20L4 20Z" fill="#f59e0b" fillOpacity="0.3"/>
                                    <path d="M4 18L8 14L12 16L16 10L20 12" stroke={chart.color} strokeWidth="2" fill="none"/>
                                    <path d="M4 16L8 12L12 14L16 8L20 10" stroke="#f59e0b" strokeWidth="2" fill="none"/>
                                  </svg>
                                )}
                                {chart.type === '100-area' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 20L8 16L12 18L16 12L20 14L20 20L4 20Z" fill={chart.color} fillOpacity="0.3"/>
                                    <path d="M4 20L8 16L12 18L16 12L20 14L20 20L4 20Z" fill="#f59e0b" fillOpacity="0.3"/>
                                  </svg>
                                )}
                                {chart.type === 'pie' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke={chart.color} strokeWidth="2"/>
                                    <path d="M12 2A10 10 0 0 1 22 12L12 12Z" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'doughnut' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke={chart.color} strokeWidth="2"/>
                                    <circle cx="12" cy="12" r="6" fill="white"/>
                                    <path d="M12 2A10 10 0 0 1 22 12L12 12Z" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'exploded-pie' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke={chart.color} strokeWidth="2"/>
                                    <path d="M12 2A10 10 0 0 1 22 12L12 12Z" fill={chart.color}/>
                                    <path d="M12 2L12 0" stroke={chart.color} strokeWidth="2"/>
                                    <path d="M22 12L24 12" stroke={chart.color} strokeWidth="2"/>
                                  </svg>
                                )}
                                {chart.type === 'pie-labels' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke={chart.color} strokeWidth="2"/>
                                    <path d="M12 2A10 10 0 0 1 22 12L12 12Z" fill={chart.color}/>
                                    <text x="24" y="12" fontSize="8" fill={chart.color}>A</text>
                                    <text x="12" y="2" fontSize="8" fill={chart.color}>B</text>
                                  </svg>
                                )}
                                {chart.type === 'scatter' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'bubble' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="1.5" fill={chart.color} fillOpacity="0.7"/>
                                    <circle cx="12" cy="14" r="2.5" fill={chart.color} fillOpacity="0.7"/>
                                    <circle cx="18" cy="10" r="3.5" fill={chart.color} fillOpacity="0.7"/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color} fillOpacity="0.7"/>
                                    <circle cx="16" cy="12" r="3" fill={chart.color} fillOpacity="0.7"/>
                                  </svg>
                                )}
                                {chart.type === 'scatter-line' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 18L8 14L12 16L16 10L20 12" stroke={chart.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    <circle cx="8" cy="14" r="1.5" fill={chart.color}/>
                                    <circle cx="12" cy="16" r="1.5" fill={chart.color}/>
                                    <circle cx="16" cy="10" r="1.5" fill={chart.color}/>
                                    <circle cx="20" cy="12" r="1.5" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === 'radar' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <polygon points="12,2 15,8 22,8 17,12 19,20 12,16 5,20 7,12 2,8 9,8" fill={chart.color} fillOpacity="0.3" stroke={chart.color} strokeWidth="1"/>
                                    <polygon points="12,6 14,10 18,10 16,12 17,16 12,14 7,16 8,12 6,10 10,10" fill={chart.color} fillOpacity="0.6"/>
                                  </svg>
                                )}
                                {chart.type === 'funnel' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4L20 4L16 8L16 12L12 16L12 20L8 20L8 16L4 12L4 8Z" fill={chart.color} fillOpacity="0.3" stroke={chart.color} strokeWidth="1"/>
                                  </svg>
                                )}
                                {chart.type === 'gauge' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                                    <path d="M12 2A10 10 0 0 1 22 12L12 12Z" fill={chart.color}/>
                                    <circle cx="12" cy="12" r="2" fill="white"/>
                                  </svg>
                                )}
                                {chart.type === 'candlestick' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <line x1="8" y1="8" x2="8" y2="16" stroke={chart.color} strokeWidth="1"/>
                                    <rect x="6" y="10" width="4" height="4" fill="#10b981"/>
                                    <line x1="16" y1="6" x2="16" y2="18" stroke={chart.color} strokeWidth="1"/>
                                    <rect x="14" y="8" width="4" height="4" fill="#ef4444"/>
                                  </svg>
                                )}
                                {chart.type === 'heatmap' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="4" width="3" height="3" fill="#e0f2fe"/>
                                    <rect x="8" y="4" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="12" y="4" width="3" height="3" fill="#0369a1"/>
                                    <rect x="4" y="8" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="8" y="8" width="3" height="3" fill="#0369a1"/>
                                    <rect x="12" y="8" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="4" y="12" width="3" height="3" fill="#0369a1"/>
                                    <rect x="8" y="12" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="12" y="12" width="3" height="3" fill="#e0f2fe"/>
                                  </svg>
                                )}
                                {chart.type === 'treemap' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="4" width="8" height="6" fill={chart.color} fillOpacity="0.8"/>
                                    <rect x="13" y="4" width="7" height="6" fill="#8b5cf6" fillOpacity="0.8"/>
                                    <rect x="4" y="11" width="6" height="9" fill="#f59e0b" fillOpacity="0.8"/>
                                    <rect x="11" y="11" width="9" height="9" fill="#10b981" fillOpacity="0.8"/>
                                  </svg>
                                )}
                                {chart.type === 'sankey' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="2" y="8" width="4" height="8" fill={chart.color} fillOpacity="0.8"/>
                                    <rect x="18" y="8" width="4" height="8" fill="#8b5cf6" fillOpacity="0.8"/>
                                    <path d="M6 12L18 12" stroke={chart.color} strokeWidth="3" fill="none"/>
                                    <path d="M6 10L18 10" stroke="#8b5cf6" strokeWidth="2" fill="none"/>
                                    <path d="M6 14L18 14" stroke="#f59e0b" strokeWidth="1" fill="none"/>
                                  </svg>
                                )}
                                {chart.type === '3d-bar' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="4" width="3" height="3" fill="#e0f2fe"/>
                                    <rect x="8" y="4" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="12" y="4" width="3" height="3" fill="#0369a1"/>
                                    <rect x="4" y="8" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="8" y="8" width="3" height="3" fill="#0369a1"/>
                                    <rect x="12" y="8" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="4" y="12" width="3" height="3" fill="#0369a1"/>
                                    <rect x="8" y="12" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="12" y="12" width="3" height="3" fill="#e0f2fe"/>
                                  </svg>
                                )}
                                {chart.type === '3d-scatter' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === '3d-surface' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <rect x="4" y="4" width="3" height="3" fill="#e0f2fe"/>
                                    <rect x="8" y="4" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="12" y="4" width="3" height="3" fill="#0369a1"/>
                                    <rect x="4" y="8" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="8" y="8" width="3" height="3" fill="#0369a1"/>
                                    <rect x="12" y="8" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="4" y="12" width="3" height="3" fill="#0369a1"/>
                                    <rect x="8" y="12" width="3" height="3" fill="#0ea5e9"/>
                                    <rect x="12" y="12" width="3" height="3" fill="#e0f2fe"/>
                                  </svg>
                                )}
                                {chart.type === '3d-line' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === '3d-pie' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke={chart.color} strokeWidth="2"/>
                                    <path d="M12 2A10 10 0 0 1 22 12L12 12Z" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === '3d-funnel' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4L20 4L16 8L16 12L12 16L12 20L8 20L8 16L4 12L4 8Z" fill={chart.color} fillOpacity="0.3" stroke={chart.color} strokeWidth="1"/>
                                  </svg>
                                )}
                                {chart.type === '3d-scatter-cube' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === '3d-bar-horizontal' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === '3d-area' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                                {chart.type === '3d-mathematical' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    <circle cx="6" cy="18" r="2" fill={chart.color}/>
                                    <circle cx="12" cy="14" r="2" fill={chart.color}/>
                                    <circle cx="18" cy="10" r="2" fill={chart.color}/>
                                    <circle cx="10" cy="16" r="2" fill={chart.color}/>
                                    <circle cx="16" cy="12" r="2" fill={chart.color}/>
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                              {chart.name}
                            </div>
                          </button>
                        );
                      })}
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
