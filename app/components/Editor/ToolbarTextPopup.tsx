'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Plus } from 'lucide-react';

interface ToolbarTextPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onStyleSelect: (style: string) => void;
  position: { x: number; y: number };
}

const ToolbarTextPopup: React.FC<ToolbarTextPopupProps> = ({
  isVisible,
  onClose,
  onStyleSelect,
  position
}) => {
  console.log('ToolbarTextPopup render:', { isVisible, position });
  
  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.toolbar-text-popup')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);
  
  const textStyles = [
    { id: 'title', label: 'Title', className: 'text-lg font-bold', description: 'Large heading text' },
    { id: 'headline', label: 'Headline', className: 'text-base font-bold', description: 'Medium heading text' },
    { id: 'subheadline', label: 'Subheadline', className: 'text-sm font-bold', description: 'Small heading text' },
    { id: 'normal', label: 'Normal text', className: 'text-sm font-normal', description: 'Standard paragraph text' },
    { id: 'small', label: 'Small text', className: 'text-xs font-normal', description: 'Caption or small text' },
    { id: 'bullet', label: '• Bullet list', className: 'text-sm font-normal', description: 'Unordered list item' },
    { id: 'number', label: '1. Number list', className: 'text-sm font-normal', description: 'Ordered list item' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with higher z-index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
            onClick={onClose}
          />
          
          {/* Popup with highest z-index */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-white rounded-lg shadow-2xl border-2 border-blue-300 min-w-48 max-w-56 toolbar-text-popup"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-blue-200 bg-blue-50">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">Text styles</span>
              </div>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                onClick={() => onStyleSelect('custom')}
              >
                Custom
              </button>
            </div>
            
            {/* Quick Add Section */}
            <div className="px-3 py-2 border-b border-gray-100">
              <button
                onClick={() => onStyleSelect('add-text')}
                className="w-full flex items-center justify-center space-x-2 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium border border-gray-200 text-sm"
              >
                <Plus className="w-3 h-3" />
                <span>Add New Text Element</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-1.5">
                Select existing text first to apply styles
              </p>
            </div>
            
            {/* Style Options */}
            <div className="py-1">
              {/* Selection Status */}
              <div className="px-3 py-1.5 mb-1 bg-blue-50 border-l-4 border-blue-400">
                <p className="text-xs text-blue-800">
                  ✨ <strong>Click any style below</strong> to create a new text element with that formatting applied.
                </p>
              </div>
              
              {textStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onStyleSelect(style.id)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-l-2 border-transparent hover:border-blue-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`${style.className} text-gray-700 block`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5 block">
                        {style.description}
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ToolbarTextPopup;
