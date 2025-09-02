'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShapePopupProps {
  isVisible: boolean;
  onClose: () => void;
  onShapeSelect: (shapeType: string) => void;
  position: { x: number; y: number };
}

const ShapePopup: React.FC<ShapePopupProps> = ({
  isVisible,
  onClose,
  onShapeSelect,
  position
}) => {
  const [selectedCategory, setSelectedCategory] = useState('essential');

  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.shape-popup')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  const categories = [
    { id: 'essential', label: 'Essential' },
    { id: 'lines', label: 'Lines' },
    { id: 'buttons', label: 'Buttons and labels' },
    { id: 'process', label: 'Process' }
  ];

  const essentialShapes = [
    // First row - Filled shapes
    { id: 'square-filled', label: 'Square', icon: '■', type: 'filled' },
    { id: 'rounded-square-filled', label: 'Rounded Square', icon: '▣', type: 'filled' },
    { id: 'circle-filled', label: 'Circle', icon: '●', type: 'filled' },
    { id: 'triangle-filled', label: 'Triangle', icon: '▲', type: 'filled' },
    { id: 'diamond-filled', label: 'Diamond', icon: '◆', type: 'filled' },
    { id: 'star-filled', label: 'Star', icon: '★', type: 'filled' },
    // Second row - Outlined shapes
    { id: 'square-outline', label: 'Square Outline', icon: '□', type: 'outline' },
    { id: 'rounded-square-outline', label: 'Rounded Square Outline', icon: '▢', type: 'outline' },
    { id: 'circle-outline', label: 'Circle Outline', icon: '○', type: 'outline' },
    { id: 'triangle-outline', label: 'Triangle Outline', icon: '△', type: 'outline' },
    { id: 'diamond-outline', label: 'Diamond Outline', icon: '◇', type: 'outline' },
    { id: 'star-outline', label: 'Star Outline', icon: '☆', type: 'outline' }
  ];

  const lineStyles = [
    // First row - Solid lines
    { id: 'line-solid', label: 'Simple Line', icon: '━', type: 'solid' },
    { id: 'line-arrow-right', label: 'Arrow Right', icon: '━━▶', type: 'solid' },
    { id: 'line-arrow-both', label: 'Arrow Both', icon: '◀━━▶', type: 'solid' },
    { id: 'line-arrow-left-dot', label: 'Arrow Left + Dot', icon: '◀━━●', type: 'solid' },
    { id: 'line-dot-arrow-right', label: 'Dot + Arrow Right', icon: '●━━▶', type: 'solid' },
    { id: 'line-bar-arrow-right', label: 'Bar + Arrow Right', icon: '┃━━▶', type: 'solid' },
    // Second row - Dashed lines
    { id: 'line-dashed', label: 'Dashed Line', icon: '┅', type: 'dashed' },
    { id: 'line-dashed-arrow-right', label: 'Dashed Arrow Right', icon: '┅┅▶', type: 'dashed' },
    { id: 'line-dashed-arrow-both', label: 'Dashed Arrow Both', icon: '◀┅┅▶', type: 'dashed' },
    { id: 'line-dashed-arrow-left-dot', label: 'Dashed Arrow Left + Dot', icon: '◀┅┅●', type: 'dashed' },
    { id: 'line-dashed-dot-arrow-right', label: 'Dashed Dot + Arrow Right', icon: '●┅┅▶', type: 'dashed' },
    { id: 'line-dashed-bar-arrow-right', label: 'Dashed Bar + Arrow Right', icon: '┃┅┅▶', type: 'dashed' }
  ];

  const renderShapes = () => {
    if (selectedCategory === 'essential') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filled Shapes</h4>
            <div className="grid grid-cols-6 gap-3">
              {essentialShapes.slice(0, 6).map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => onShapeSelect(shape.id)}
                  className="w-12 h-12 flex items-center justify-center text-2xl text-gray-800 hover:bg-gray-100 hover:scale-105 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                  title={shape.label}
                >
                  {shape.icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Outlined Shapes</h4>
            <div className="grid grid-cols-6 gap-3">
              {essentialShapes.slice(6, 12).map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => onShapeSelect(shape.id)}
                  className="w-12 h-12 flex items-center justify-center text-2xl text-gray-800 hover:bg-gray-100 hover:scale-105 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400"
                  title={shape.label}
                >
                  {shape.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (selectedCategory === 'lines') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Solid Lines</h4>
            <div className="grid grid-cols-6 gap-3">
              {lineStyles.slice(0, 6).map((line) => (
                <button
                  key={line.id}
                  onClick={() => onShapeSelect(line.id)}
                  className="w-12 h-12 flex items-center justify-center text-lg text-black hover:bg-gray-100 hover:scale-105 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                  title={line.label}
                >
                  {line.icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Dashed Lines</h4>
            <div className="grid grid-cols-6 gap-3">
              {lineStyles.slice(6, 12).map((line) => (
                <button
                  key={line.id}
                  onClick={() => onShapeSelect(line.id)}
                  className="w-12 h-12 flex items-center justify-center text-lg text-black hover:bg-gray-100 hover:scale-105 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                  title={line.label}
                >
                  {line.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="text-center text-gray-500 py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <p className="text-lg font-medium">Coming soon...</p>
        <p className="text-sm text-gray-400 mt-1">More categories will be available soon</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 min-w-[600px] max-w-[700px] shape-popup"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-800">Shapes</h3>
              <button 
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
                onClick={() => {
                  console.log('Edit shapes functionality coming soon...');
                  // TODO: Implement shape editing functionality
                }}
              >
                Edit
              </button>
            </div>
            
            {/* Content */}
            <div className="flex">
              {/* Left Sidebar - Categories */}
              <div className="w-48 border-r border-gray-100 bg-gray-50">
                <div className="p-4">
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-sm'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Shapes/Lines */}
              <div className="flex-1 p-6 bg-white">
                {renderShapes()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShapePopup;
