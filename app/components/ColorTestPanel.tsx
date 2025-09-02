'use client';

import React, { useState } from 'react';
import { 
  testColorChange, 
  handleColorChangeImmediate, 
  createColorButtonHandler 
} from './CustomFormatPlugin';

export default function ColorTestPanel() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [testResults, setTestResults] = useState<string[]>([]);

  const testColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#FFC0CB', '#FF4500', '#9400D3'
  ];

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runBasicTest = (color: string) => {
    addTestResult(`Testing basic color change to ${color}`);
    handleColorChangeImmediate(color);
    setSelectedColor(color);
  };

  const runAdvancedTest = (color: string) => {
    addTestResult(`Running advanced test with color ${color}`);
    testColorChange(color);
    setSelectedColor(color);
  };

  const runFullTest = () => {
    addTestResult('Running full color system test...');
    
    testColors.forEach((color, index) => {
      setTimeout(() => {
        testColorChange(color);
        setSelectedColor(color);
        addTestResult(`Test ${index + 1}: Applied color ${color}`);
      }, index * 200);
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Create enhanced color button handlers
  const createTestColorHandler = (color: string) => {
    return createColorButtonHandler(
      color,
      (newColor) => {
        setSelectedColor(newColor);
        addTestResult(`Enhanced handler applied color: ${newColor}`);
      },
      () => addTestResult('Dropdown closed via enhanced handler')
    );
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">🎨 Color Test Panel</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Color: <span style={{ color: selectedColor }}>{selectedColor}</span></p>
        
        <div className="grid grid-cols-4 gap-2 mb-3">
          {testColors.slice(0, 8).map((color) => (
            <button
              key={color}
              onClick={() => runBasicTest(color)}
              className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Test ${color}`}
            />
          ))}
        </div>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => runAdvancedTest('#FF0000')}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Test Red
          </button>
          <button
            onClick={() => runAdvancedTest('#00FF00')}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Test Green
          </button>
          <button
            onClick={() => runAdvancedTest('#0000FF')}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Test Blue
          </button>
        </div>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={runFullTest}
            className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
          >
            🚀 Run Full Test
          </button>
          <button
            onClick={clearResults}
            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
          >
            Clear Results
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Enhanced Handlers Test:</h4>
        <div className="grid grid-cols-3 gap-2">
          {testColors.slice(0, 6).map((color) => (
            <button
              key={color}
              onClick={createTestColorHandler(color)}
              className="px-2 py-1 text-xs rounded border hover:scale-105 transition-transform"
              style={{ 
                backgroundColor: color, 
                color: color === '#FFFFFF' ? '#000' : '#FFF',
                borderColor: color === '#FFFFFF' ? '#000' : color
              }}
            >
              Test
            </button>
          ))}
        </div>
      </div>
      
      <div className="max-h-32 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-xs text-gray-500">No test results yet. Run some tests!</p>
        ) : (
          <div className="space-y-1">
            {testResults.slice(-10).map((result, index) => (
              <div key={index} className="text-xs text-gray-600 bg-gray-50 p-1 rounded">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-3">
        <p>💡 Use this panel to test the enhanced color system</p>
        <p>🎯 Check console for detailed logs</p>
        <p>✨ Colors should update instantly in the editor</p>
      </div>
    </div>
  );
}
