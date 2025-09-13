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
    { id: 'geometric', label: 'Geometric' },
    { id: 'lines', label: 'Lines & Arrows' },
    { id: 'flowchart', label: 'Flowchart' },
    { id: 'decorative', label: 'Decorative' }
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

  const geometricShapes = [
    // First row - Filled geometric shapes
    { id: 'hexagon-filled', label: 'Hexagon', icon: '⬡', type: 'filled' },
    { id: 'octagon-filled', label: 'Octagon', icon: '⬢', type: 'filled' },
    { id: 'pentagon-filled', label: 'Pentagon', icon: '⬟', type: 'filled' },
    { id: 'ellipse-filled', label: 'Ellipse', icon: '⬭', type: 'filled' },
    { id: 'cross-filled', label: 'Cross', icon: '✚', type: 'filled' },
    { id: 'plus-filled', label: 'Plus', icon: '➕', type: 'filled' },
    // Second row - Outlined geometric shapes
    { id: 'hexagon-outline', label: 'Hexagon Outline', icon: '⬡', type: 'outline' },
    { id: 'octagon-outline', label: 'Octagon Outline', icon: '⬢', type: 'outline' },
    { id: 'pentagon-outline', label: 'Pentagon Outline', icon: '⬟', type: 'outline' },
    { id: 'ellipse-outline', label: 'Ellipse Outline', icon: '⬭', type: 'outline' },
    { id: 'cross-outline', label: 'Cross Outline', icon: '✚', type: 'outline' },
    { id: 'plus-outline', label: 'Plus Outline', icon: '➕', type: 'outline' }
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

  const flowchartShapes = [
    // First row - Filled flowchart shapes
    { id: 'rectangle-flowchart', label: 'Rectangle', icon: '▭', type: 'filled' },
    { id: 'diamond-flowchart', label: 'Diamond', icon: '⬥', type: 'filled' },
    { id: 'oval-flowchart', label: 'Oval', icon: '⬭', type: 'filled' },
    { id: 'parallelogram-flowchart', label: 'Parallelogram', icon: '▱', type: 'filled' },
    { id: 'cylinder-flowchart', label: 'Cylinder', icon: '⬡', type: 'filled' },
    { id: 'document-flowchart', label: 'Document', icon: '📄', type: 'filled' },
    // Second row - Outlined flowchart shapes
    { id: 'rectangle-flowchart-outline', label: 'Rectangle Outline', icon: '▭', type: 'outline' },
    { id: 'diamond-flowchart-outline', label: 'Diamond Outline', icon: '⬥', type: 'outline' },
    { id: 'oval-flowchart-outline', label: 'Oval Outline', icon: '⬭', type: 'outline' },
    { id: 'parallelogram-flowchart-outline', label: 'Parallelogram Outline', icon: '▱', type: 'outline' },
    { id: 'cylinder-flowchart-outline', label: 'Cylinder Outline', icon: '⬡', type: 'outline' },
    { id: 'document-flowchart-outline', label: 'Document Outline', icon: '📄', type: 'outline' }
  ];

  const decorativeShapes = [
    // First row - Filled decorative shapes
    { id: 'heart-filled', label: 'Heart', icon: '❤️', type: 'filled' },
    { id: 'cloud-filled', label: 'Cloud', icon: '☁️', type: 'filled' },
    { id: 'sun-filled', label: 'Sun', icon: '☀️', type: 'filled' },
    { id: 'moon-filled', label: 'Moon', icon: '🌙', type: 'filled' },
    { id: 'flower-filled', label: 'Flower', icon: '🌸', type: 'filled' },
    { id: 'leaf-filled', label: 'Leaf', icon: '🍃', type: 'filled' },
    // Second row - Outlined decorative shapes
    { id: 'heart-outline', label: 'Heart Outline', icon: '💙', type: 'outline' },
    { id: 'cloud-outline', label: 'Cloud Outline', icon: '☁️', type: 'outline' },
    { id: 'sun-outline', label: 'Sun Outline', icon: '☀️', type: 'outline' },
    { id: 'moon-outline', label: 'Moon Outline', icon: '🌙', type: 'outline' },
    { id: 'flower-outline', label: 'Flower Outline', icon: '🌸', type: 'outline' },
    { id: 'leaf-outline', label: 'Leaf Outline', icon: '🍃', type: 'outline' }
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
    } else if (selectedCategory === 'geometric') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filled Geometric</h4>
            <div className="grid grid-cols-6 gap-3">
              {geometricShapes.slice(0, 6).map((shape) => (
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
            <h4 className="text-sm font-medium text-gray-700 mb-3">Outlined Geometric</h4>
            <div className="grid grid-cols-6 gap-3">
              {geometricShapes.slice(6, 12).map((shape) => (
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
    } else if (selectedCategory === 'flowchart') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filled Flowchart</h4>
            <div className="grid grid-cols-6 gap-3">
              {flowchartShapes.slice(0, 6).map((shape) => (
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
            <h4 className="text-sm font-medium text-gray-700 mb-3">Outlined Flowchart</h4>
            <div className="grid grid-cols-6 gap-3">
              {flowchartShapes.slice(6, 12).map((shape) => (
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
    } else if (selectedCategory === 'decorative') {
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filled Decorative</h4>
            <div className="grid grid-cols-6 gap-3">
              {decorativeShapes.slice(0, 6).map((shape) => (
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
              <h4 className="text-sm font-medium text-gray-700 mb-3">Outlined Decorative</h4>
              <div className="grid grid-cols-6 gap-3">
                {decorativeShapes.slice(6, 12).map((shape) => (
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
