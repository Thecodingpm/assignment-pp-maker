'use client';

import React, { useState } from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { SlideCanvas } from '../components/Editor';
import { MainToolbar } from '../components/Toolbar';

export default function ShapesTestPage() {
  const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore();
  const [testShape, setTestShape] = useState<string>('');

  const addTestShape = (shapeType: string) => {
    const currentSlide = slides[currentSlideIndex];
    
    if (currentSlide) {
      // Use default position instead of center - user can drag to desired location
      const defaultX = 100;
      const defaultY = 100;
      
      let mappedShapeType: 'rectangle' | 'circle' | 'triangle';
      let width = 150;
      let height = 100;
      
      switch (shapeType) {
        case 'rectangle':
          mappedShapeType = 'rectangle';
          width = 150;
          height = 100;
          break;
        case 'circle':
          mappedShapeType = 'circle';
          width = 120;
          height = 120;
          break;
        case 'triangle':
          mappedShapeType = 'triangle';
          width = 120;
          height = 100;
          break;
        default:
          mappedShapeType = 'rectangle';
          width = 150;
          height = 100;
          break;
      }
      
      const newShapeElement = {
        type: 'shape' as const,
        x: defaultX,
        y: defaultY,
        width,
        height,
        rotation: 0,
        zIndex: 1,
        shapeType: mappedShapeType,
        fillColor: '#3b82f6',
        strokeColor: '#1d4ed8',
        strokeWidth: 2,
      };
      
      addElement(currentSlide.id, newShapeElement);
      setTestShape(`Added ${shapeType} shape`);
      
      // Clear message after 2 seconds
      setTimeout(() => setTestShape(''), 2000);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <MainToolbar />
      
      {/* Test Controls */}
      <div className="fixed top-16 left-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
        <h3 className="text-lg font-semibold mb-3">Shapes Test</h3>
        <div className="space-y-2">
          <button
            onClick={() => addTestShape('rectangle')}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Rectangle
          </button>
          <button
            onClick={() => addTestShape('circle')}
            className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Circle
          </button>
          <button
            onClick={() => addTestShape('triangle')}
            className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Add Triangle
          </button>
        </div>
        {testShape && (
          <div className="mt-3 p-2 bg-green-100 text-green-800 rounded text-sm">
            {testShape}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Center - Slide Canvas */}
        <div className="flex-1 flex flex-col">
          <SlideCanvas />
        </div>
      </div>
    </div>
  );
}
