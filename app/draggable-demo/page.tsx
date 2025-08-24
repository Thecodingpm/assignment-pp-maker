'use client';

import React, { useRef } from 'react';
import DraggableLineIndicator from '../components/DraggableLineIndicator';
import EnhancedDraggableBlocksPlugin from '../components/EnhancedDraggableBlocksPlugin';

export default function DraggableDemoPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSnap = (isSnapped: boolean) => {
    console.log('Snap feedback:', isSnapped ? 'Snapped!' : 'Not snapped');
  };

  const handleDrop = (draggedElement: HTMLElement, dropTarget: Element) => {
    console.log('Drop event:', {
      dragged: draggedElement.textContent,
      target: dropTarget.textContent
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Draggable Line Indicator Demo
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Orange vertical line indicator during drag operations</li>
            <li>• Smooth animations for line appearance/disappearance</li>
            <li>• Snap feedback with vibration animation when near center alignment</li>
            <li>• Customizable snap threshold and line color</li>
            <li>• Modular design for easy integration</li>
          </ul>
        </div>

        <div 
          ref={containerRef}
          className="bg-white rounded-lg shadow-lg p-6 min-h-[400px] relative"
        >
          <h2 className="text-xl font-semibold mb-4">Try Dragging These Elements</h2>
          
          {/* Sample draggable elements */}
          <div className="space-y-4">
            <div 
              className="draggable-block p-4 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 transition-colors"
              draggable={true}
            >
              <h3 className="font-semibold text-blue-900">Draggable Block 1</h3>
              <p className="text-blue-700 mt-2">This is a sample draggable block. Try dragging it around!</p>
            </div>

            <div 
              className="draggable-block p-4 bg-green-100 border border-green-300 rounded cursor-move hover:bg-green-200 transition-colors"
              draggable={true}
            >
              <h3 className="font-semibold text-green-900">Draggable Block 2</h3>
              <p className="text-green-700 mt-2">Another draggable element with different styling.</p>
            </div>

            <div 
              className="draggable-block p-4 bg-purple-100 border border-purple-300 rounded cursor-move hover:bg-purple-200 transition-colors"
              draggable={true}
            >
              <h3 className="font-semibold text-purple-900">Draggable Block 3</h3>
              <p className="text-purple-700 mt-2">Watch for the orange line indicator and snap feedback!</p>
            </div>

            <div 
              className="draggable-block p-4 bg-orange-100 border border-orange-300 rounded cursor-move hover:bg-orange-200 transition-colors"
              draggable={true}
            >
              <h3 className="font-semibold text-orange-900">Draggable Block 4</h3>
              <p className="text-orange-700 mt-2">The line will snap to center when you're close enough.</p>
            </div>
          </div>

          {/* Enhanced Draggable Plugin with Line Indicator */}
          <EnhancedDraggableBlocksPlugin
            containerRef={containerRef}
            snapThreshold={60}
            lineColor="#ff6b35"
            onSnap={handleSnap}
            onDrop={handleDrop}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Customization Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Props</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><code>containerRef</code> - Reference to container element</li>
                <li><code>snapThreshold</code> - Distance for snap detection (px)</li>
                <li><code>lineColor</code> - Color of the indicator line</li>
                <li><code>lineWidth</code> - Width of the indicator line</li>
                <li><code>vibrationDuration</code> - Snap feedback duration (ms)</li>
                <li><code>onSnap</code> - Callback when snap state changes</li>
                <li><code>onDrop</code> - Custom drop handler</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Features</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Automatic element detection</li>
                <li>• Smooth animations</li>
                <li>• Visual snap feedback</li>
                <li>• Customizable styling</li>
                <li>• Event callbacks</li>
                <li>• TypeScript support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
