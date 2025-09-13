'use client';

import React from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { TextElement, ShapeElement, ImageElement } from '../types/editor';

// Import panels (we'll create these next)
import TextPanel from './panels/TextPanel';
import ShapePanel from './panels/ShapePanel';
import ImagePanel from './panels/ImagePanel';
import SlidePanel from './panels/SlidePanel';

const Sidebar: React.FC = () => {
  const { getSelectedElement, getCurrentSlide } = useEditorStore();
  const selectedElement = getSelectedElement();
  const currentSlide = getCurrentSlide();

  // Determine which panel to show based on selection
  const renderPanel = () => {
    if (!selectedElement) {
      // No element selected - show slide panel
      return <SlidePanel slide={currentSlide} />;
    }

    switch (selectedElement.type) {
      case 'text':
        return <TextPanel element={selectedElement as TextElement} />;
      case 'shape':
        return <ShapePanel element={selectedElement as ShapeElement} />;
      case 'image':
        return <ImagePanel element={selectedElement as ImageElement} />;
      default:
        return <SlidePanel slide={currentSlide} />;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedElement ? `${selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties` : 'Slide Properties'}
        </h2>
        {selectedElement && (
          <p className="text-sm text-gray-500 mt-1">
            Element ID: {selectedElement.id.slice(-8)}
          </p>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {renderPanel()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {selectedElement ? 'Modify the selected element' : 'Customize your slide'}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
