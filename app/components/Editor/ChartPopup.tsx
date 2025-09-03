'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

// Animated chart icons with flowing/moving elements
const ColumnChartIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="8" width="3" height="8" fill="currentColor">
      <animate attributeName="height" values="8;12;8" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="6" y="4" width="3" height="12" fill="currentColor">
      <animate attributeName="height" values="12;8;12" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="6" width="3" height="10" fill="currentColor">
      <animate attributeName="height" values="10;14;10" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="14" y="2" width="3" height="14" fill="currentColor">
      <animate attributeName="height" values="14;10;14" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="18" y="10" width="3" height="6" fill="currentColor">
      <animate attributeName="height" values="6;10;6" dur="2s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const BarChartIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="8" height="3" fill="currentColor">
      <animate attributeName="width" values="8;12;8" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="2" y="6" width="12" height="3" fill="currentColor">
      <animate attributeName="width" values="12;8;12" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="2" y="10" width="6" height="3" fill="currentColor">
      <animate attributeName="width" values="6;10;6" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="2" y="14" width="10" height="3" fill="currentColor">
      <animate attributeName="width" values="10;6;10" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="2" y="18" width="4" height="3" fill="currentColor">
      <animate attributeName="width" values="4;8;4" dur="2s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const LineChartIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M2 20 L6 16 L10 18 L14 12 L18 14 L22 8">
      <animate attributeName="d" values="M2 20 L6 16 L10 18 L14 12 L18 14 L22 8;M2 18 L6 14 L10 16 L14 10 L18 12 L22 6;M2 20 L6 16 L10 18 L14 12 L18 14 L22 8" dur="3s" repeatCount="indefinite" />
    </path>
    <circle cx="6" cy="16" r="1" fill="currentColor">
      <animate attributeName="r" values="1;1.5;1" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="10" cy="18" r="1" fill="currentColor">
      <animate attributeName="r" values="1;1.5;1" dur="1s" begin="0.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="14" cy="12" r="1" fill="currentColor">
      <animate attributeName="r" values="1;1.5;1" dur="1s" begin="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="18" cy="14" r="1" fill="currentColor">
      <animate attributeName="r" values="1;1.5;1" dur="1s" begin="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="22" cy="8" r="1" fill="currentColor">
      <animate attributeName="r" values="1;1.5;1" dur="1s" begin="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const PieChartIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2 A10 10 0 0 1 12 22 A10 10 0 0 1 12 2 M12 2 L12 12 L22 12 A10 10 0 0 0 12 2">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="4s" repeatCount="indefinite" />
    </path>
    <path d="M12 12 L2 12 A10 10 0 0 0 12 22 L12 12" fill="#f59e0b">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;-360 12 12" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const ScatterIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="4" cy="20" r="1.5" fill="currentColor">
      <animate attributeName="cy" values="20;18;20" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="8" cy="16" r="1.5" fill="currentColor">
      <animate attributeName="cy" values="16;14;16" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="12" cy="12" r="1.5" fill="currentColor">
      <animate attributeName="cy" values="12;10;12" dur="2s" begin="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="8" r="1.5" fill="currentColor">
      <animate attributeName="cy" values="8;6;8" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="20" cy="4" r="1.5" fill="currentColor">
      <animate attributeName="cy" values="4;2;4" dur="2s" begin="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const StackedBarIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="8" width="3" height="8" fill="#8b5cf6">
      <animate attributeName="height" values="8;10;8" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="6" y="4" width="3" height="12" fill="#10b981">
      <animate attributeName="height" values="12;14;12" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="2" width="3" height="14" fill="#f59e0b">
      <animate attributeName="height" values="14;16;14" dur="2s" begin="1s" repeatCount="indefinite" />
    </rect>
    <rect x="14" y="6" width="3" height="10" fill="#ef4444">
      <animate attributeName="height" values="10;12;10" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </rect>
    <rect x="18" y="10" width="3" height="6" fill="#06b6d4">
      <animate attributeName="height" values="6;8;6" dur="2s" begin="2s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const AreaChartIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 20 L6 16 L10 18 L14 12 L18 14 L22 8 L22 20 Z" fill="currentColor" opacity="0.3">
      <animate attributeName="d" values="M2 20 L6 16 L10 18 L14 12 L18 14 L22 8 L22 20 Z;M2 18 L6 14 L10 16 L14 10 L18 12 L22 6 L22 18 Z;M2 20 L6 16 L10 18 L14 12 L18 14 L22 8 L22 20 Z" dur="3s" repeatCount="indefinite" />
    </path>
    <path d="M2 20 L6 16 L10 18 L14 12 L18 14 L22 8" fill="none" stroke="currentColor" strokeWidth="2">
      <animate attributeName="d" values="M2 20 L6 16 L10 18 L14 12 L18 14 L22 8;M2 18 L6 14 L10 16 L14 10 L18 12 L22 6;M2 20 L6 16 L10 18 L14 12 L18 14 L22 8" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const WaterfallIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="12" width="3" height="8" fill="#5470c6">
      <animate attributeName="height" values="8;10;8" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="6" y="8" width="3" height="12" fill="#5470c6">
      <animate attributeName="height" values="12;14;12" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="14" width="3" height="6" fill="#5470c6">
      <animate attributeName="height" values="6;8;6" dur="2s" begin="1s" repeatCount="indefinite" />
    </rect>
    <rect x="14" y="6" width="3" height="14" fill="#5470c6">
      <animate attributeName="height" values="14;16;14" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </rect>
    <rect x="18" y="2" width="3" height="18" fill="#91cc75">
      <animate attributeName="height" values="18;20;18" dur="2s" begin="2s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const RadarIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" fill="none">
      <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
    </circle>
    <path d="M12 4 L12 20 M4 12 L20 12 M8.5 8.5 L15.5 15.5 M8.5 15.5 L15.5 8.5">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="4s" repeatCount="indefinite" />
    </path>
    <path d="M12 4 L12 12 L20 12" fill="currentColor" opacity="0.3">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const FunnelIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2 4 L22 4 L18 8 L18 12 L14 16 L14 20 L10 20 L10 16 L6 12 L6 8 Z">
      <animate attributeName="d" values="M2 4 L22 4 L18 8 L18 12 L14 16 L14 20 L10 20 L10 16 L6 12 L6 8 Z;M2 4 L22 4 L18 6 L18 10 L14 14 L14 18 L10 18 L10 14 L6 10 L6 6 Z;M2 4 L22 4 L18 8 L18 12 L14 16 L14 20 L10 20 L10 16 L6 12 L6 8 Z" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const GaugeIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2 A10 10 0 0 1 12 22 A10 10 0 0 1 12 2" fill="none" stroke="currentColor" strokeWidth="2">
      <animate attributeName="stroke-dasharray" values="0 62.8;31.4 31.4;0 62.8" dur="3s" repeatCount="indefinite" />
    </path>
    <path d="M12 2 A10 10 0 0 1 12 22" fill="currentColor" opacity="0.3">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;180 12 12;0 12 12" dur="3s" repeatCount="indefinite" />
    </path>
    <path d="M12 12 L16 8" stroke="currentColor" strokeWidth="3">
      <animateTransform attributeName="transform" type="rotate" values="0 12 12;180 12 12;0 12 12" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const CandlestickIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="8" width="2" height="8" fill="#ef4444">
      <animate attributeName="height" values="8;10;8" dur="2s" repeatCount="indefinite" />
    </rect>
    <line x1="4" y1="6" x2="4" y2="10" stroke="#ef4444" strokeWidth="1">
      <animate attributeName="y2" values="10;8;10" dur="2s" repeatCount="indefinite" />
    </line>
    <rect x="7" y="6" width="2" height="8" fill="#10b981">
      <animate attributeName="height" values="8;10;8" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </rect>
    <line x1="8" y1="4" x2="8" y2="12" stroke="#10b981" strokeWidth="1">
      <animate attributeName="y2" values="12;10;12" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </line>
    <rect x="11" y="10" width="2" height="6" fill="#ef4444">
      <animate attributeName="height" values="6;8;6" dur="2s" begin="1s" repeatCount="indefinite" />
    </rect>
    <line x1="12" y1="8" x2="12" y2="14" stroke="#ef4444" strokeWidth="1">
      <animate attributeName="y2" values="14;12;14" dur="2s" begin="1s" repeatCount="indefinite" />
    </line>
    <rect x="15" y="4" width="2" height="12" fill="#10b981">
      <animate attributeName="height" values="12;14;12" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </rect>
    <line x1="16" y1="2" x2="16" y2="16" stroke="#10b981" strokeWidth="1">
      <animate attributeName="y2" values="16;14;16" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </line>
    <rect x="19" y="8" width="2" height="8" fill="#10b981">
      <animate attributeName="height" values="8;10;8" dur="2s" begin="2s" repeatCount="indefinite" />
    </rect>
    <line x1="20" y1="6" x2="20" y2="10" stroke="#10b981" strokeWidth="1">
      <animate attributeName="y2" values="10;8;10" dur="2s" begin="2s" repeatCount="indefinite" />
    </line>
  </svg>
);

const HeatmapIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="4" height="4" fill="#8b5cf6">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="6" y="2" width="4" height="4" fill="#06b6d4">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.3s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="2" width="4" height="4" fill="#f59e0b">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.6s" repeatCount="indefinite" />
    </rect>
    <rect x="14" y="2" width="4" height="4" fill="#ef4444">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="0.9s" repeatCount="indefinite" />
    </rect>
    <rect x="18" y="2" width="4" height="4" fill="#10b981">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="1.2s" repeatCount="indefinite" />
    </rect>
    <rect x="2" y="6" width="4" height="4" fill="#06b6d4">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </rect>
    <rect x="6" y="6" width="4" height="4" fill="#f59e0b">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="1.8s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="6" width="4" height="4" fill="#ef4444">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="2.1s" repeatCount="indefinite" />
    </rect>
    <rect x="14" y="6" width="4" height="4" fill="#10b981">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="2.4s" repeatCount="indefinite" />
    </rect>
    <rect x="18" y="6" width="4" height="4" fill="#8b5cf6">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="2.7s" repeatCount="indefinite" />
    </rect>
    <rect x="2" y="10" width="4" height="4" fill="#f59e0b">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="3s" repeatCount="indefinite" />
    </rect>
    <rect x="6" y="10" width="4" height="4" fill="#ef4444">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="3.3s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="10" width="4" height="4" fill="#10b981">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="3.6s" repeatCount="indefinite" />
    </rect>
    <rect x="14" y="10" width="4" height="4" fill="#8b5cf6">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="3.9s" repeatCount="indefinite" />
    </rect>
    <rect x="18" y="10" width="4" height="4" fill="#06b6d4">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" begin="4.2s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const TreemapIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="8" height="8" fill="#06b6d4">
      <animate attributeName="width" values="8;10;8" dur="2s" repeatCount="indefinite" />
      <animate attributeName="height" values="8;10;8" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="10" y="2" width="12" height="6" fill="#f59e0b">
      <animate attributeName="width" values="12;14;12" dur="2s" begin="0.5s" repeatCount="indefinite" />
      <animate attributeName="height" values="6;8;6" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </rect>
    <rect x="2" y="10" width="6" height="12" fill="#10b981">
      <animate attributeName="width" values="6;8;6" dur="2s" begin="1s" repeatCount="indefinite" />
      <animate attributeName="height" values="12;14;12" dur="2s" begin="1s" repeatCount="indefinite" />
    </rect>
    <rect x="8" y="10" width="14" height="6" fill="#ef4444">
      <animate attributeName="width" values="14;16;14" dur="2s" begin="1.5s" repeatCount="indefinite" />
      <animate attributeName="height" values="6;8;6" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </rect>
    <rect x="8" y="16" width="14" height="6" fill="#8b5cf6">
      <animate attributeName="width" values="14;16;14" dur="2s" begin="2s" repeatCount="indefinite" />
      <animate attributeName="height" values="6;8;6" dur="2s" begin="2s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const SankeyIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="8" width="4" height="8" fill="#f59e0b">
      <animate attributeName="height" values="8;10;8" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="8" y="6" width="4" height="12" fill="#f59e0b">
      <animate attributeName="height" values="12;14;12" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </rect>
    <rect x="14" y="4" width="4" height="16" fill="#f59e0b">
      <animate attributeName="height" values="16;18;16" dur="2s" begin="1s" repeatCount="indefinite" />
    </rect>
    <rect x="20" y="10" width="4" height="4" fill="#f59e0b">
      <animate attributeName="height" values="4;6;4" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </rect>
    <path d="M6 12 L18 8" stroke="currentColor" strokeWidth="2">
      <animate attributeName="stroke-width" values="2;3;2" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M6 12 L18 16" stroke="currentColor" strokeWidth="2">
      <animate attributeName="stroke-width" values="2;3;2" dur="2s" begin="1s" repeatCount="indefinite" />
    </path>
  </svg>
);

// Chart configuration function
  const getChartOption = (chartType: string) => {
    const baseOption = {
    title: {
      text: chartType.charAt(0).toUpperCase() + chartType.slice(1),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '20%',
      bottom: '15%'
    }
    };

    switch (chartType) {
      case 'column':
        return {
          ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
          series: [{
            type: 'bar',
            data: [120, 200, 150, 80, 70],
          itemStyle: { color: '#3b82f6' }
        }]
      };

      case 'bar':
        return {
          ...baseOption,
          xAxis: { type: 'value' },
        yAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
          series: [{
            type: 'bar',
            data: [120, 200, 150, 80, 70],
          itemStyle: { color: '#10b981' }
        }]
      };

      case 'line':
        return {
          ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70],
          itemStyle: { color: '#06b6d4' },
            smooth: true
          }]
        };
      
    case 'line-points':
        return {
          ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70],
          itemStyle: { color: '#8b5cf6' },
          smooth: false,
            symbol: 'circle',
            symbolSize: 6
          }]
        };
      
    case 'multi-line':
      return {
        ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
        series: [
          { type: 'line', data: [120, 200, 150, 80, 70], itemStyle: { color: '#8b5cf6' }, smooth: true },
          { type: 'line', data: [80, 150, 200, 120, 100], itemStyle: { color: '#f59e0b' }, smooth: true }
        ]
      };

    case 'multi-line-points':
        return {
          ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
          series: [
          { type: 'line', data: [120, 200, 150, 80, 70], itemStyle: { color: '#8b5cf6' }, smooth: false, symbol: 'circle', symbolSize: 6 },
          { type: 'line', data: [80, 150, 200, 120, 100], itemStyle: { color: '#f59e0b' }, smooth: false, symbol: 'circle', symbolSize: 6 }
          ]
        };
      
      case 'area':
        return {
          ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
          series: [{
            type: 'line',
            data: [120, 200, 150, 80, 70],
          areaStyle: { color: '#8b5cf6', opacity: 0.3 },
          itemStyle: { color: '#8b5cf6' },
          smooth: true
          }]
        };
      
      case 'stacked-area':
        return {
          ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
          series: [
          { type: 'line', data: [120, 200, 150, 80, 70], areaStyle: { color: '#8b5cf6', opacity: 0.3 }, itemStyle: { color: '#8b5cf6' }, smooth: true, stack: 'total' },
          { type: 'line', data: [80, 150, 200, 120, 100], areaStyle: { color: '#f59e0b', opacity: 0.3 }, itemStyle: { color: '#f59e0b' }, smooth: true, stack: 'total' }
          ]
        };
      
      case 'pie':
        return {
        ...baseOption,
          series: [{
            type: 'pie',
            radius: '50%',
            data: [
            { value: 335, name: 'Direct' },
            { value: 310, name: 'Email' },
            { value: 234, name: 'Affiliate' },
            { value: 135, name: 'Video' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
        };
      
      case 'doughnut':
        return {
        ...baseOption,
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
            { value: 335, name: 'Direct' },
            { value: 310, name: 'Email' },
            { value: 234, name: 'Affiliate' },
            { value: 135, name: 'Video' }
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
          data: [[10, 8.04], [8, 6.95], [13, 7.58], [9, 8.81], [11, 8.33]],
          itemStyle: { color: '#ef4444' }
        }]
        };
      
      case 'bubble':
        return {
        ...baseOption,
          xAxis: { type: 'value' },
          yAxis: { type: 'value' },
          series: [{
            type: 'scatter',
          data: [[10, 8.04, 5], [8, 6.95, 3], [13, 7.58, 7], [9, 8.81, 4], [11, 8.33, 6]],
          symbolSize: function (data: number[]) {
            return data[2] * 3;
          },
          itemStyle: { color: '#8b5cf6' }
        }]
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
            { name: 'Development', max: 52000 }
          ]
        },
        series: [{
          type: 'radar',
          data: [{
            value: [4200, 3000, 20000, 35000, 50000],
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
            [20, 34, 10, 38], // [open, close, lowest, highest]
            [40, 35, 30, 50],
            [31, 38, 31, 44],
            [38, 15, 5, 41],
            [48, 28, 20, 48]
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
            { name: 'A' },
            { name: 'B' },
            { name: 'C' },
            { name: 'D' }
          ],
          links: [
            { source: 'A', target: 'B', value: 10 },
            { source: 'A', target: 'C', value: 20 },
            { source: 'B', target: 'D', value: 15 },
            { source: 'C', target: 'D', value: 25 }
          ]
        }]
      };

    case 'waterfall':
      return {
        ...baseOption,
        xAxis: { type: 'category', data: ['Initial', 'Product', 'Service', 'Support', 'Total'] },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [
            { value: 100, itemStyle: { color: '#5470c6' } },
            { value: 80, itemStyle: { color: '#5470c6' } },
            { value: 60, itemStyle: { color: '#5470c6' } },
            { value: 40, itemStyle: { color: '#5470c6' } },
            { value: 280, itemStyle: { color: '#91cc75' } }
          ]
        }]
      };

    case 'stacked-column':
      return {
        ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
        series: [
          { type: 'bar', stack: 'total', data: [120, 132, 101, 134, 90], itemStyle: { color: '#8b5cf6' } },
          { type: 'bar', stack: 'total', data: [220, 182, 191, 234, 290], itemStyle: { color: '#f59e0b' } }
        ]
      };

    case '100-stacked-column':
      return {
        ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value', max: 100 },
        series: [
          { type: 'bar', stack: 'total', data: [20, 30, 25, 40, 35], itemStyle: { color: '#8b5cf6' } },
          { type: 'bar', stack: 'total', data: [80, 70, 75, 60, 65], itemStyle: { color: '#f59e0b' } }
        ]
      };

    case 'stacked-bar':
      return {
        ...baseOption,
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        series: [
          { type: 'bar', stack: 'total', data: [120, 132, 101, 134, 90], itemStyle: { color: '#8b5cf6' } },
          { type: 'bar', stack: 'total', data: [220, 182, 191, 234, 290], itemStyle: { color: '#f59e0b' } }
        ]
      };

    case '100-stacked-bar':
      return {
        ...baseOption,
        xAxis: { type: 'value', max: 100 },
        yAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        series: [
          { type: 'bar', stack: 'total', data: [20, 30, 25, 40, 35], itemStyle: { color: '#8b5cf6' } },
          { type: 'bar', stack: 'total', data: [80, 70, 75, 60, 65], itemStyle: { color: '#f59e0b' } }
        ]
      };

    case '100-stacked':
      return {
        ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value', max: 100 },
        series: [
          { type: 'bar', stack: 'total', data: [20, 30, 25, 40, 35], itemStyle: { color: '#f59e0b' } },
          { type: 'bar', stack: 'total', data: [80, 70, 75, 60, 65], itemStyle: { color: '#10b981' } }
        ]
      };

    case 'range-column':
      return {
        ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [
            [10, 20], [15, 25], [20, 30], [25, 35], [30, 40]
          ],
          itemStyle: { color: '#10b981' }
        }]
      };

    case 'scatter-line':
      return {
        ...baseOption,
        xAxis: { type: 'value' },
        yAxis: { type: 'value' },
        series: [
          { type: 'scatter', data: [[10, 8.04], [8, 6.95], [13, 7.58], [9, 8.81], [11, 8.33]] },
          { type: 'line', data: [[8, 6.95], [9, 8.81], [10, 8.04], [11, 8.33], [13, 7.58]], smooth: true }
        ]
      };

    case 'exploded-pie':
      return {
        ...baseOption,
        series: [{
          type: 'pie',
          radius: '50%',
          data: [
            { value: 335, name: 'Direct' },
            { value: 310, name: 'Email' },
            { value: 234, name: 'Affiliate' },
            { value: 135, name: 'Video' }
          ],
          emphasis: {
            scale: true,
            scaleSize: 10
          }
        }]
      };

    case 'pie-labels':
      return {
        ...baseOption,
        series: [{
          type: 'pie',
          radius: '50%',
          data: [
            { value: 335, name: 'Direct' },
            { value: 310, name: 'Email' },
            { value: 234, name: 'Affiliate' },
            { value: 135, name: 'Video' }
          ],
          label: {
            show: true,
            formatter: '{b}: {c} ({d}%)'
          }
        }]
      };

    default:
      return {
        ...baseOption,
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [120, 200, 150, 80, 70],
          itemStyle: { color: '#3b82f6' }
        }]
      };
  }
};

interface ChartPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onInsertChart: (chartType: string) => void;
}

const ChartPopup = ({ isVisible, onClose, onInsertChart }: ChartPopupProps) => {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('charts');

  if (!isVisible) return null;

  const handleChartClick = (chartType: string) => {
    // Insert chart directly without second page
    onInsertChart(chartType);
    onClose();
  };

  // Categorized charts matching the image layout
  const chartCategories = {
    "Column & bar charts": [
      { type: 'column', icon: ColumnChartIcon, name: 'Column', color: '#8b5cf6' },
      { type: 'stacked-column', icon: StackedBarIcon, name: 'Stacked Column', color: '#8b5cf6' },
      { type: '100-stacked-column', icon: StackedBarIcon, name: '100% Stacked Column', color: '#8b5cf6' },
      { type: 'bar', icon: BarChartIcon, name: 'Bar', color: '#8b5cf6' },
      { type: 'stacked-bar', icon: StackedBarIcon, name: 'Stacked Bar', color: '#8b5cf6' },
      { type: '100-stacked-bar', icon: StackedBarIcon, name: '100% Stacked Bar', color: '#8b5cf6' }
    ],
    "Line & area charts": [
      { type: 'line', icon: LineChartIcon, name: 'Line', color: '#8b5cf6' },
      { type: 'line-points', icon: LineChartIcon, name: 'Line with Points', color: '#8b5cf6' },
      { type: 'multi-line', icon: LineChartIcon, name: 'Multi-line', color: '#8b5cf6' },
      { type: 'multi-line-points', icon: LineChartIcon, name: 'Multi-line with Points', color: '#8b5cf6' },
      { type: 'area', icon: AreaChartIcon, name: 'Area', color: '#8b5cf6' },
      { type: 'stacked-area', icon: AreaChartIcon, name: 'Stacked Area', color: '#8b5cf6' }
    ],
    "Pie & doughnut charts": [
      { type: 'pie', icon: PieChartIcon, name: 'Pie', color: '#8b5cf6' },
      { type: 'doughnut', icon: PieChartIcon, name: 'Doughnut', color: '#8b5cf6' },
      { type: 'exploded-pie', icon: PieChartIcon, name: 'Exploded Pie', color: '#8b5cf6' },
      { type: 'pie-labels', icon: PieChartIcon, name: 'Pie with Labels', color: '#8b5cf6' }
    ],
    "Scatter & bubble charts": [
      { type: 'scatter', icon: ScatterIcon, name: 'Scatter', color: '#8b5cf6' },
      { type: 'bubble', icon: ScatterIcon, name: 'Bubble', color: '#8b5cf6' }
    ],
    "Specialized charts": [
      { type: 'radar', icon: RadarIcon, name: 'Radar', color: '#8b5cf6' },
      { type: 'funnel', icon: FunnelIcon, name: 'Funnel', color: '#8b5cf6' },
      { type: 'gauge', icon: GaugeIcon, name: 'Gauge', color: '#8b5cf6' },
      { type: 'candlestick', icon: CandlestickIcon, name: 'Candlestick', color: '#8b5cf6' },
      { type: 'heatmap', icon: HeatmapIcon, name: 'Heatmap', color: '#8b5cf6' },
      { type: 'treemap', icon: TreemapIcon, name: 'Treemap', color: '#8b5cf6' },
      { type: 'sankey', icon: SankeyIcon, name: 'Sankey', color: '#8b5cf6' },
      { type: 'waterfall', icon: WaterfallIcon, name: 'Waterfall', color: '#8b5cf6' }
    ]
  };

  // Filter charts based on search query
  const filteredCategories = Object.entries(chartCategories).reduce((acc, [category, charts]) => {
    const filteredCharts = charts.filter(chart => 
      chart.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredCharts.length > 0) {
      acc[category] = filteredCharts;
    }
    return acc;
  }, {} as Record<string, typeof chartCategories[keyof typeof chartCategories]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-start justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[700px] max-h-[500px] flex flex-col mt-16" onClick={(e) => e.stopPropagation()}>
        {/* Header with Search */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-800">Insert Chart</h2>
            <button
        onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search charts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-48 bg-gray-50 p-3 border-r">
            {/* Charts Section */}
            <div className={`px-2 py-1.5 rounded-md mb-2 cursor-pointer transition-colors ${
              activeCategory === 'charts' ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`} onClick={() => setActiveCategory('charts')}>
              <h3 className="text-xs font-semibold text-blue-800">Charts</h3>
            </div>

            {/* Integrations Section */}
            <div className="px-2 py-1.5 rounded-md mb-2 cursor-pointer transition-colors hover:bg-gray-100">
              <h3 className="text-xs font-semibold text-gray-700">Integrations</h3>
            </div>
            
            {/* Integration Options */}
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center space-x-2">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Import a CSV</span>
                        </div>
              <div className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center space-x-2">
                <svg className="w-3.5 h-3.5" fill="#0f9d58" viewBox="0 0 24 24">
                  <rect x="2" y="3" width="20" height="18" rx="2" ry="2" fill="none" stroke="#0f9d58" strokeWidth="2"/>
                  <path d="M7 7h10v2H7zM7 11h10v2H7zM7 15h6v2H7z" fill="#0f9d58"/>
                </svg>
                <span>Google Sheets</span>
                        </div>
              <div className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center space-x-2">
                <svg className="w-3.5 h-3.5" fill="#f9ab00" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="#f9ab00" strokeWidth="2"/>
                  <path d="M12 2v20M2 12h20" stroke="#f9ab00" strokeWidth="2"/>
                </svg>
                <span>Google Analytics</span>
                      </div>
              <div className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center space-x-2">
                <svg className="w-3.5 h-3.5" fill="#1e40af" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="#1e40af"/>
                  <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">M</text>
                </svg>
                <span>ChartMogul</span>
              </div>
              </div>
              
              {/* Feedback Section */}
            <div className="px-2 py-1.5 bg-gray-100 rounded-md mt-3">
                <p className="text-xs text-gray-600">
                  Which other apps would you like to see on this list?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Let us know</a>
                </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-3">
            {Object.entries(filteredCategories).map(([category, charts]) => (
              <div key={category} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">{category}</h3>
                <div className="grid grid-cols-3 gap-2">
                      {charts.map((chart) => (
                    <div
                          key={chart.type}
                      onClick={() => handleChartClick(chart.type)}
                      className="flex flex-col items-center p-2 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                      title={chart.name}
                    >
                      <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                        <chart.icon />
                          </div>
                      <span className="text-xs font-medium text-gray-700 mt-1.5 text-center leading-tight">
                            {chart.name}
                      </span>
                    </div>
                  ))}
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { getChartOption };
export default ChartPopup;
