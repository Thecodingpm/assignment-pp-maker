'use client';

import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { TextDesignPopup, MediaDesignPopup, ShapeDesignPopup, ChartDesignPopup, TableDesignPopup } from './index';

const DesignButton: React.FC = () => {
  const { 
    getSelectedElement, 
    getSelectedElements, 
    showDesignPopup, 
    designPopupType, 
    setShowDesignPopup, 
    setDesignPopupType 
  } = useEditorStore();

  const handleDesignClick = () => {
    const selectedElement = getSelectedElement();
    const selectedElements = getSelectedElements();
    
    // Determine popup type based on selection
    if (selectedElements.length > 0) {
      const element = selectedElements[0];
      if (element.type === 'text') {
        setDesignPopupType('text');
      } else if (element.type === 'image') {
        setDesignPopupType('media');
      } else if (element.type === 'shape') {
        setDesignPopupType('shape');
      } else if (element.type === 'chart') {
        setDesignPopupType('chart');
      } else if (element.type === 'table') {
        setDesignPopupType('table');
      } else {
        setDesignPopupType('default');
      }
    } else {
      setDesignPopupType('default');
    }
    
    setShowDesignPopup(true);
  };

  const handleClosePopup = () => {
    setShowDesignPopup(false);
  };

  const renderPopup = () => {
    switch (designPopupType) {
      case 'text':
        return (
          <TextDesignPopup
            isVisible={showDesignPopup}
            onClose={handleClosePopup}
          />
        );
      case 'media':
        return (
          <MediaDesignPopup
            isVisible={showDesignPopup}
            onClose={handleClosePopup}
          />
        );
      case 'shape':
        return (
          <ShapeDesignPopup
            isVisible={showDesignPopup}
            onClose={handleClosePopup}
          />
        );
      case 'chart':
        return (
          <ChartDesignPopup
            isVisible={showDesignPopup}
            onClose={handleClosePopup}
          />
        );
      case 'table':
        return (
          <TableDesignPopup
            isVisible={showDesignPopup}
            onClose={handleClosePopup}
          />
        );
      default:
        return (
          <div className="fixed right-2 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-40 flex flex-col rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Design Tools</h3>
              </div>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Design Tools</h3>
                <p className="text-gray-600 mb-6">
                  Select an element to access design options, or choose from general design tools.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Add Text
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Media
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Add Shape
                  </button>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Add Chart
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors col-span-2">
                    Add Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Design Button */}
      <button
        onClick={handleDesignClick}
        className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md flex items-center justify-center transition-all shadow-md hover:shadow-lg"
        title="Design Tools"
      >
        <Palette className="w-4 h-4" />
      </button>

      {/* Dynamic Popup */}
      {showDesignPopup && renderPopup()}
    </>
  );
};

export default DesignButton;
