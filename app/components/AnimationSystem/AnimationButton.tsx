'use client';

import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { AnimationPopup } from './AnimationPopup';

const AnimationButton: React.FC = () => {
  const { 
    getSelectedElement, 
    getSelectedElements, 
    showAnimationPopup, 
    setShowAnimationPopup 
  } = useEditorStore();

  const handleAnimationClick = () => {
    const selectedElement = getSelectedElement();
    const selectedElements = getSelectedElements();
    
    // Show animation popup if any element is selected
    if (selectedElements.length > 0) {
      setShowAnimationPopup(true);
    } else {
      // Show a message or do nothing if no element is selected
      console.log('Please select an element to add animations');
    }
  };

  const handleClosePopup = () => {
    setShowAnimationPopup(false);
  };

  return (
    <>
      {/* Animation Button */}
      <button
        onClick={handleAnimationClick}
        className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
        title="Add Animations"
      >
        <Zap className="w-5 h-5" />
      </button>

      {/* Animation Popup */}
      {showAnimationPopup && (
        <AnimationPopup
          isVisible={showAnimationPopup}
          onClose={handleClosePopup}
        />
      )}
    </>
  );
};

export default AnimationButton;
