'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextStylesPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onStyleSelect: (style: string) => void;
  position: { x: number; y: number };
}

const TextStylesPopup: React.FC<TextStylesPopupProps> = ({
  isVisible,
  onClose,
  onStyleSelect,
  position
}) => {
  console.log('TextStylesPopup render:', { isVisible, position });
  
  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.text-styles-popup')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);
  
  const textStyles = [
    { id: 'title', label: 'Title', className: 'text-lg font-bold' },
    { id: 'headline', label: 'Headline', className: 'text-base font-bold' },
    { id: 'subheadline', label: 'Subheadline', className: 'text-sm font-bold' },
    { id: 'normal', label: 'Normal text', className: 'text-sm font-normal' },
    { id: 'small', label: 'Small text', className: 'text-xs font-normal' },
    { id: 'bullet', label: '• Bullet list', className: 'text-sm font-normal' },
    { id: 'number', label: '1. Number list', className: 'text-sm font-normal' },
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
            className="fixed z-[9999] bg-white rounded-lg shadow-2xl border-2 border-blue-300 min-w-56 text-styles-popup"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 bg-blue-50">
              <span className="text-sm font-semibold text-gray-800">Text styles</span>
              <button 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                onClick={() => onStyleSelect('edit')}
              >
                Edit
              </button>
            </div>
            
            {/* Style Options */}
            <div className="py-2">
              {textStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onStyleSelect(style.id)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-l-2 border-transparent hover:border-blue-300"
                >
                  <span className={`${style.className} text-gray-700`}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TextStylesPopup;
