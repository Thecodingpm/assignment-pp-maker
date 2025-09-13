'use client';

import React from 'react';
import { X, Play, Trash2, Edit3 } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface AnimationManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AnimationManager: React.FC<AnimationManagerProps> = ({
  isVisible,
  onClose
}) => {
  const { 
    getCurrentSlide, 
    getSelectedElement, 
    updateElement,
    showAnimationPopup,
    setShowAnimationPopup 
  } = useEditorStore();

  const currentSlide = getCurrentSlide();
  const selectedElement = getSelectedElement();

  const handleRemoveAnimation = (elementId: string) => {
    if (!currentSlide) return;
    
    const element = currentSlide.elements.find(el => el.id === elementId);
    if (!element) return;

    updateElement(currentSlide.id, elementId, {
      ...element,
      animation: undefined
    } as any);
  };

  const handleEditAnimation = (elementId: string) => {
    // Select the element and open animation popup
    // This would require additional store methods to select elements by ID
    setShowAnimationPopup(true);
  };

  const handlePreviewAnimation = (elementId: string) => {
    const element = document.getElementById(`element-${elementId}`);
    if (!element || !currentSlide) return;

    const slideElement = currentSlide.elements.find(el => el.id === elementId);
    if (!slideElement?.animation) return;

    const animation = slideElement.animation;
    
    // Apply temporary animation for preview
    element.style.transition = `all ${animation.duration}ms ${animation.easing}`;
    
    // Apply initial state
    if (animation.properties.opacity !== undefined) {
      element.style.opacity = animation.properties.opacity.toString();
    }
    if (animation.properties.scale !== undefined) {
      element.style.transform = `scale(${animation.properties.scale})`;
    }
    if (animation.properties.translateX !== undefined) {
      element.style.transform += ` translateX(${animation.properties.translateX}px)`;
    }
    if (animation.properties.translateY !== undefined) {
      element.style.transform += ` translateY(${animation.properties.translateY}px)`;
    }
    if (animation.properties.rotate !== undefined) {
      element.style.transform += ` rotate(${animation.properties.rotate}deg)`;
    }

    // Trigger animation
    setTimeout(() => {
      if (animation.type === 'exit') {
        element.style.opacity = '0';
      } else {
        element.style.opacity = '1';
        element.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
      }
    }, 50);

    // Reset after animation
    setTimeout(() => {
      element.style.transition = '';
      element.style.opacity = '';
      element.style.transform = '';
    }, animation.duration + 100);
  };

  if (!isVisible) return null;

  const animatedElements = currentSlide?.elements.filter(el => el.animation) || [];

  return (
    <div className="fixed right-2 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-40 flex flex-col rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Play className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">Animation Manager</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {animatedElements.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Animations</h3>
            <p className="text-gray-600">
              No animations have been applied to elements on this slide.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Animations ({animatedElements.length})
            </h4>
            
            {animatedElements.map((element) => (
              <div
                key={element.id}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedElement?.id === element.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      element.animation?.type === 'entrance' ? 'bg-green-500' :
                      element.animation?.type === 'emphasis' ? 'bg-yellow-500' :
                      element.animation?.type === 'exit' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-700">
                      {element.type === 'text' 
                        ? (element as any).content?.substring(0, 20) || 'Text Element'
                        : element.type === 'image'
                        ? 'Image Element'
                        : element.type === 'shape'
                        ? 'Shape Element'
                        : `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} Element`
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePreviewAnimation(element.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Preview Animation"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditAnimation(element.id)}
                      className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                      title="Edit Animation"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveAnimation(element.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove Animation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{element.animation?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preset:</span>
                    <span className="capitalize">{element.animation?.preset?.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{element.animation?.duration}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
