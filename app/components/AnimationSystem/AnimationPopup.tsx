'use client';

import React, { useState } from 'react';
import { X, Play, Square, RotateCcw, Move, Eye, Zap } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface AnimationPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

interface AnimationPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'entrance' | 'emphasis' | 'exit';
  duration: number;
  easing: string;
  properties: {
    transform?: string;
    opacity?: number;
    scale?: number;
    translateX?: number;
    translateY?: number;
    rotate?: number;
  };
}

const animationPresets: AnimationPreset[] = [
  {
    id: 'fade-in',
    name: 'Fade In',
    icon: <Eye className="w-4 h-4" />,
    type: 'entrance',
    duration: 800,
    easing: 'ease-out',
    properties: {
      opacity: 0,
      transform: 'translateY(20px)'
    }
  },
  {
    id: 'slide-in-left',
    name: 'Slide In Left',
    icon: <Move className="w-4 h-4" />,
    type: 'entrance',
    duration: 600,
    easing: 'ease-out',
    properties: {
      translateX: -100,
      opacity: 0
    }
  },
  {
    id: 'slide-in-right',
    name: 'Slide In Right',
    icon: <Move className="w-4 h-4" />,
    type: 'entrance',
    duration: 600,
    easing: 'ease-out',
    properties: {
      translateX: 100,
      opacity: 0
    }
  },
  {
    id: 'bounce-in',
    name: 'Bounce In',
    icon: <Zap className="w-4 h-4" />,
    type: 'entrance',
    duration: 1000,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: {
      scale: 0.3,
      opacity: 0
    }
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    icon: <Move className="w-4 h-4" />,
    type: 'entrance',
    duration: 500,
    easing: 'ease-out',
    properties: {
      scale: 0.5,
      opacity: 0
    }
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    icon: <RotateCcw className="w-4 h-4" />,
    type: 'entrance',
    duration: 800,
    easing: 'ease-out',
    properties: {
      rotate: -180,
      opacity: 0
    }
  },
  {
    id: 'pulse',
    name: 'Pulse',
    icon: <Play className="w-4 h-4" />,
    type: 'emphasis',
    duration: 1000,
    easing: 'ease-in-out',
    properties: {
      scale: 1.1
    }
  },
  {
    id: 'shake',
    name: 'Shake',
    icon: <Move className="w-4 h-4" />,
    type: 'emphasis',
    duration: 500,
    easing: 'ease-in-out',
    properties: {
      translateX: 10
    }
  },
  {
    id: 'wobble',
    name: 'Wobble',
    icon: <Move className="w-4 h-4" />,
    type: 'emphasis',
    duration: 1000,
    easing: 'ease-in-out',
    properties: {
      rotate: 5
    }
  },
  {
    id: 'glow',
    name: 'Glow',
    icon: <Zap className="w-4 h-4" />,
    type: 'emphasis',
    duration: 1500,
    easing: 'ease-in-out',
    properties: {
      scale: 1.05
    }
  },
  // Exit Animations
  {
    id: 'fade-out',
    name: 'Fade Out',
    icon: <Eye className="w-4 h-4" />,
    type: 'exit',
    duration: 600,
    easing: 'ease-in',
    properties: {
      opacity: 0
    }
  },
  {
    id: 'slide-out-left',
    name: 'Slide Out Left',
    icon: <Move className="w-4 h-4" />,
    type: 'exit',
    duration: 500,
    easing: 'ease-in',
    properties: {
      translateX: -100,
      opacity: 0
    }
  },
  {
    id: 'slide-out-right',
    name: 'Slide Out Right',
    icon: <Move className="w-4 h-4" />,
    type: 'exit',
    duration: 500,
    easing: 'ease-in',
    properties: {
      translateX: 100,
      opacity: 0
    }
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    icon: <Move className="w-4 h-4" />,
    type: 'exit',
    duration: 400,
    easing: 'ease-in',
    properties: {
      scale: 0.3,
      opacity: 0
    }
  },
  {
    id: 'bounce-out',
    name: 'Bounce Out',
    icon: <Zap className="w-4 h-4" />,
    type: 'exit',
    duration: 800,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    properties: {
      scale: 1.2,
      opacity: 0
    }
  },
  // More Entrance Animations
  {
    id: 'slide-in-up',
    name: 'Slide In Up',
    icon: <Move className="w-4 h-4" />,
    type: 'entrance',
    duration: 600,
    easing: 'ease-out',
    properties: {
      translateY: 50,
      opacity: 0
    }
  },
  {
    id: 'slide-in-down',
    name: 'Slide In Down',
    icon: <Move className="w-4 h-4" />,
    type: 'entrance',
    duration: 600,
    easing: 'ease-out',
    properties: {
      translateY: -50,
      opacity: 0
    }
  },
  {
    id: 'flip-in',
    name: 'Flip In',
    icon: <RotateCcw className="w-4 h-4" />,
    type: 'entrance',
    duration: 700,
    easing: 'ease-out',
    properties: {
      rotate: 180,
      scale: 0.8,
      opacity: 0
    }
  },
  {
    id: 'elastic-in',
    name: 'Elastic In',
    icon: <Zap className="w-4 h-4" />,
    type: 'entrance',
    duration: 1200,
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    properties: {
      scale: 0.1,
      opacity: 0
    }
  }
];

export const AnimationPopup: React.FC<AnimationPopupProps> = ({
  isVisible,
  onClose
}) => {
  const { getSelectedElement, updateElement, getCurrentSlide } = useEditorStore();
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customDuration, setCustomDuration] = useState<number>(800);

  const selectedElement = getSelectedElement();

  const handleAnimationSelect = (animationId: string) => {
    setSelectedAnimation(animationId);
  };

  const handleApplyAnimation = () => {
    if (!selectedAnimation || !selectedElement) return;

    const animation = animationPresets.find(a => a.id === selectedAnimation);
    if (!animation) return;

    const currentSlide = getCurrentSlide();
    if (!currentSlide) return;

     // Apply animation to the selected element
     updateElement(currentSlide.id, selectedElement.id, {
       ...selectedElement,
       animation: {
         type: animation.type,
         preset: selectedAnimation,
         duration: customDuration,
         easing: 'ease-out',
         properties: animation.properties,
         isActive: true
       }
     } as any);

    onClose();
  };

  const handlePreviewAnimation = () => {
    if (!selectedAnimation || !selectedElement) return;

    const animation = animationPresets.find(a => a.id === selectedAnimation);
    if (!animation) return;

    setIsPlaying(true);

     // Apply temporary animation for preview
     const element = document.getElementById(`element-${selectedElement.id}`);
     if (element) {
       element.style.transition = `all ${customDuration}ms ease-out`;
      
       // Set initial state based on animation type
       if (animation.type === 'entrance') {
         // For entrance animations, start from the properties defined in the preset (hidden state)
         if (animation.properties.opacity !== undefined) {
           element.style.opacity = animation.properties.opacity.toString();
         }
         
         let initialTransform = '';
         if (animation.properties.scale !== undefined) {
           initialTransform += `scale(${animation.properties.scale})`;
         }
         if (animation.properties.translateX !== undefined) {
           initialTransform += ` translateX(${animation.properties.translateX}px)`;
         }
         if (animation.properties.translateY !== undefined) {
           initialTransform += ` translateY(${animation.properties.translateY}px)`;
         }
         if (animation.properties.rotate !== undefined) {
           initialTransform += ` rotate(${animation.properties.rotate}deg)`;
         }
         if (animation.properties.transform) {
           initialTransform += ` ${animation.properties.transform}`;
         }
         element.style.transform = initialTransform;
       } else if (animation.type === 'exit') {
         // For exit animations, start from normal state (visible)
         element.style.opacity = '1';
         element.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
       } else {
         // For emphasis animations, start from normal state
         element.style.opacity = '1';
         element.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
       }

       // Trigger animation
       setTimeout(() => {
         if (animation.type === 'exit') {
           // Exit animation: animate to the properties defined in the preset (hidden state)
           if (animation.properties.opacity !== undefined) {
             element.style.opacity = animation.properties.opacity.toString();
           }
           
           let exitTransform = '';
           if (animation.properties.scale !== undefined) {
             exitTransform += `scale(${animation.properties.scale})`;
           }
           if (animation.properties.translateX !== undefined) {
             exitTransform += ` translateX(${animation.properties.translateX}px)`;
           }
           if (animation.properties.translateY !== undefined) {
             exitTransform += ` translateY(${animation.properties.translateY}px)`;
           }
           if (animation.properties.rotate !== undefined) {
             exitTransform += ` rotate(${animation.properties.rotate}deg)`;
           }
           if (animation.properties.transform) {
             exitTransform += ` ${animation.properties.transform}`;
           }
           element.style.transform = exitTransform;
         } else {
           // Entrance and emphasis animations: animate to visible state
           element.style.opacity = '1';
           element.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
         }
       }, 50);

      // Reset after animation
      setTimeout(() => {
        element.style.transition = '';
        element.style.opacity = '';
        element.style.transform = '';
        setIsPlaying(false);
      }, customDuration + 100);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-2 top-16 h-[500px] w-64 bg-white shadow-xl z-40 flex flex-col rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-medium text-gray-900">Animation</h3>
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
        {!selectedElement ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Element Selected</h3>
            <p className="text-gray-600">
              Please select an element to add animations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Element Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">Selected Element</h4>
              <p className="text-xs text-blue-700">
                {selectedElement.type === 'text' 
                  ? (selectedElement as any).content?.substring(0, 50) || 'Text Element'
                  : selectedElement.type === 'image'
                  ? 'Image Element'
                  : selectedElement.type === 'shape'
                  ? 'Shape Element'
                  : selectedElement.type === 'chart'
                  ? 'Chart Element'
                  : selectedElement.type === 'table'
                  ? 'Table Element'
                  : `${selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Element`
                }
              </p>
            </div>

             {/* Animation Categories */}
             <div className="space-y-4">
               {/* Entrance Animations */}
               <div>
                 <div className="flex items-center space-x-2 mb-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <h4 className="text-sm font-medium text-gray-700">Entrance</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-1">
                   {animationPresets.filter(a => a.type === 'entrance').map((animation) => (
                     <button
                       key={animation.id}
                       onClick={() => handleAnimationSelect(animation.id)}
                       className={`p-2 rounded border transition-all ${
                         selectedAnimation === animation.id
                           ? 'border-green-500 bg-green-50'
                           : 'border-gray-200 hover:border-gray-300 bg-white'
                       }`}
                     >
                       <div className="flex flex-col items-center space-y-1">
                         <div className="text-green-600 text-sm">{animation.icon}</div>
                         <span className="text-xs text-gray-700 text-center leading-tight">
                           {animation.name}
                         </span>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Emphasis Animations */}
               <div>
                 <div className="flex items-center space-x-2 mb-2">
                   <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                   <h4 className="text-sm font-medium text-gray-700">Emphasis</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-1">
                   {animationPresets.filter(a => a.type === 'emphasis').map((animation) => (
                     <button
                       key={animation.id}
                       onClick={() => handleAnimationSelect(animation.id)}
                       className={`p-2 rounded border transition-all ${
                         selectedAnimation === animation.id
                           ? 'border-yellow-500 bg-yellow-50'
                           : 'border-gray-200 hover:border-gray-300 bg-white'
                       }`}
                     >
                       <div className="flex flex-col items-center space-y-1">
                         <div className="text-yellow-600 text-sm">{animation.icon}</div>
                         <span className="text-xs text-gray-700 text-center leading-tight">
                           {animation.name}
                         </span>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               {/* Exit Animations */}
               <div>
                 <div className="flex items-center space-x-2 mb-2">
                   <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                   <h4 className="text-sm font-medium text-gray-700">Exit</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-1">
                   {animationPresets.filter(a => a.type === 'exit').map((animation) => (
                     <button
                       key={animation.id}
                       onClick={() => handleAnimationSelect(animation.id)}
                       className={`p-2 rounded border transition-all ${
                         selectedAnimation === animation.id
                           ? 'border-red-500 bg-red-50'
                           : 'border-gray-200 hover:border-gray-300 bg-white'
                       }`}
                     >
                       <div className="flex flex-col items-center space-y-1">
                         <div className="text-red-600 text-sm">{animation.icon}</div>
                         <span className="text-xs text-gray-700 text-center leading-tight">
                           {animation.name}
                         </span>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>
             </div>

             {/* Duration Control */}
             {selectedAnimation && (
               <div className="pt-4 border-t border-gray-200">
                 <div>
                   <label className="block text-xs font-medium text-gray-600 mb-2">
                     Duration: {customDuration}ms
                   </label>
                   <input
                     type="range"
                     min="100"
                     max="3000"
                     step="100"
                     value={customDuration}
                     onChange={(e) => setCustomDuration(Number(e.target.value))}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <div className="flex justify-between text-xs text-gray-500 mt-1">
                     <span>Fast (100ms)</span>
                     <span>Slow (3000ms)</span>
                   </div>
                 </div>
               </div>
             )}

            {/* Action Buttons */}
            {selectedAnimation && (
              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={handlePreviewAnimation}
                  disabled={isPlaying}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{isPlaying ? 'Playing...' : 'Preview'}</span>
                </button>
                <button
                  onClick={handleApplyAnimation}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Apply</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
