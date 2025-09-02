'use client';

import React, { useState } from 'react';
import { snapToGuides, calculateSnapPoints } from '../utils/magneticSnapping';
import { EditorElement } from '../types/editor';

export default function MagneticTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const testMagneticSnapping = () => {
    const results: string[] = [];
    
    // Test 1: Basic snap points calculation
    const testElement: EditorElement = {
      id: 'test-1',
      type: 'shape',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 1,
      selected: false,
      shapeType: 'rectangle',
      fillColor: '#ff0000',
      strokeColor: '#000000',
      strokeWidth: 2
    };

    const canvasSize = { width: 1920, height: 1080 };
    const allElements: EditorElement[] = [
      {
        id: 'other-1',
        type: 'shape',
        x: 300,
        y: 100,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: 1,
        selected: false,
        shapeType: 'rectangle',
        fillColor: '#00ff00',
        strokeColor: '#000000',
        strokeWidth: 2
      }
    ];

    try {
      // Test snap points calculation
      const snapPoints = calculateSnapPoints(testElement, allElements, canvasSize);
      results.push(`✅ Snap points calculated: ${snapPoints.length} points`);
      results.push(`   - Slide center: ${snapPoints.filter(p => p.guideType === 'slide-center').length} points`);
      results.push(`   - Margins: ${snapPoints.filter(p => p.guideType === 'margin').length} points`);
      results.push(`   - Element alignment: ${snapPoints.filter(p => p.guideType === 'element-alignment').length} points`);

      // Test magnetic snapping
      const mousePosition = { x: 150, y: 150 };
      const snappedPosition = snapToGuides(mousePosition, testElement, allElements, canvasSize);
      
      results.push(`✅ Magnetic snapping result:`);
      results.push(`   - Original: (${mousePosition.x}, ${mousePosition.y})`);
      results.push(`   - Snapped: (${snappedPosition.x}, ${snappedPosition.y})`);
      results.push(`   - Is snapped: ${snappedPosition.isSnapped}`);
      results.push(`   - Snap strength: ${snappedPosition.snapStrength}`);

      // Test with position near slide center
      const centerPosition = { x: 960, y: 540 }; // Near slide center
      const centerSnapped = snapToGuides(centerPosition, testElement, allElements, canvasSize);
      
      results.push(`✅ Center snapping test:`);
      results.push(`   - Near center: (${centerPosition.x}, ${centerPosition.y})`);
      results.push(`   - Snapped: (${centerSnapped.x}, ${centerSnapped.y})`);
      results.push(`   - Is snapped: ${centerSnapped.isSnapped}`);
      results.push(`   - Snap strength: ${centerSnapped.snapStrength}`);

    } catch (error) {
      results.push(`❌ Error: ${error}`);
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Magnetic Snapping Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <button
            onClick={testMagneticSnapping}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Run Magnetic Snapping Tests
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Canvas Size</h3>
              <p className="text-sm text-gray-600">1920 x 1080 pixels</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Test Element</h3>
              <p className="text-sm text-gray-600">100x100 rectangle at (100, 100)</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Expected Behavior</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>Element should snap to slide center (960, 540)</li>
                <li>Element should snap to margins (20px, 40px from edges)</li>
                <li>Element should snap to other elements for alignment</li>
                <li>Snap strength should be higher near snap points</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
