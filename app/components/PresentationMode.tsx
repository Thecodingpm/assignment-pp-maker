'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { X, ChevronLeft, ChevronRight, Square } from 'lucide-react';
import { AnimatedElement } from './AnimationSystem/AnimatedElement';
import { SlideAnimationManager } from './AnimationSystem/SlideAnimationManager';

const PresentationMode: React.FC = () => {
  const {
    slides,
    currentSlideIndex,
    isPresentationMode,
    exitPresentationMode,
    nextSlide,
    previousSlide,
  } = useEditorStore();

  const slideRef = useRef<HTMLDivElement>(null);
  const [isSlideTransitioning, setIsSlideTransitioning] = useState(false);
  const [slideTransitionDirection, setSlideTransitionDirection] = useState<'entering' | 'exiting' | null>(null);

  const currentSlide = slides[currentSlideIndex];

  // Handle slide transitions with animations
  const handleSlideTransition = (direction: 'next' | 'previous') => {
    if (isSlideTransitioning) return;
    
    setIsSlideTransitioning(true);
    setSlideTransitionDirection('exiting');
    
    // Wait for exit animations to complete
    setTimeout(() => {
      if (direction === 'next') {
        nextSlide();
      } else {
        previousSlide();
      }
      
      // Start entrance animations
      setSlideTransitionDirection('entering');
      
      // Reset transition state after entrance animations
      setTimeout(() => {
        setIsSlideTransitioning(false);
        setSlideTransitionDirection(null);
      }, 1000); // Adjust timing based on your animation durations
    }, 500); // Adjust timing based on your exit animation durations
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isPresentationMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          exitPresentationMode();
          break;
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          handleSlideTransition('next');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleSlideTransition('previous');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, exitPresentationMode, handleSlideTransition]);

  // Handle click navigation
  const handleSlideClick = (event: React.MouseEvent) => {
    const rect = slideRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = event.clientX - rect.left;
    const slideWidth = rect.width;
    
    // Click on right side to go next, left side to go previous
    if (clickX > slideWidth / 2) {
      handleSlideTransition('next');
    } else {
      handleSlideTransition('previous');
    }
  };

  if (!isPresentationMode || !currentSlide) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center space-x-4">
          <button
            onClick={exitPresentationMode}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Exit Presentation (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSlideTransition('previous')}
            disabled={currentSlideIndex === 0 || isSlideTransitioning}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Slide (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleSlideTransition('next')}
            disabled={currentSlideIndex === slides.length - 1 || isSlideTransitioning}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Slide (→ or Space)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div 
        ref={slideRef}
        className="flex-1 flex items-center justify-center p-8 cursor-pointer"
        onClick={handleSlideClick}
        style={{ backgroundColor: currentSlide.backgroundColor }}
      >
        <div className="max-w-6xl max-h-full w-full h-full relative">
          {currentSlide.elements.map((element) => {
            const style: React.CSSProperties = {
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation}deg)`,
              zIndex: element.zIndex,
            };

            switch (element.type) {
              case 'text':
                return (
                  <SlideAnimationManager 
                    key={element.id} 
                    element={element}
                    isSlideActive={!isSlideTransitioning}
                    isSlideEntering={slideTransitionDirection === 'entering'}
                    isSlideExiting={slideTransitionDirection === 'exiting'}
                  >
                    <div
                      style={{
                        ...style,
                        fontSize: element.fontSize,
                        fontFamily: element.fontFamily,
                        fontWeight: element.fontWeight,
                        color: element.color,
                        textAlign: element.textAlign,
                        lineHeight: element.lineHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: element.textAlign === 'center' ? 'center' : 
                                       element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {element.content}
                    </div>
                  </SlideAnimationManager>
                );

              case 'image':
                return (
                  <SlideAnimationManager 
                    key={element.id} 
                    element={element}
                    isSlideActive={!isSlideTransitioning}
                    isSlideEntering={slideTransitionDirection === 'entering'}
                    isSlideExiting={slideTransitionDirection === 'exiting'}
                  >
                    <img
                      src={element.src}
                      alt={element.alt}
                      style={style}
                      className="object-contain"
                    />
                  </SlideAnimationManager>
                );

              case 'shape':
                const shapeStyle: React.CSSProperties = {
                  ...style,
                  backgroundColor: element.fillColor,
                  border: `${element.strokeWidth}px solid ${element.strokeColor}`,
                };

                if (element.shapeType === 'circle') {
                  shapeStyle.borderRadius = '50%';
                } else if (element.shapeType === 'triangle') {
                  shapeStyle.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                } else if (element.shapeType === 'diamond') {
                  shapeStyle.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
                }

                return (
                  <SlideAnimationManager 
                    key={element.id} 
                    element={element}
                    isSlideActive={!isSlideTransitioning}
                    isSlideEntering={slideTransitionDirection === 'entering'}
                    isSlideExiting={slideTransitionDirection === 'exiting'}
                  >
                    <div
                      style={shapeStyle}
                    />
                  </SlideAnimationManager>
                );

              case 'chart':
                return (
                  <SlideAnimationManager 
                    key={element.id} 
                    element={element}
                    isSlideActive={!isSlideTransitioning}
                    isSlideEntering={slideTransitionDirection === 'entering'}
                    isSlideExiting={slideTransitionDirection === 'exiting'}
                  >
                    <div
                      style={{
                        ...style,
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '14px',
                      }}
                    >
                      📊 Chart
                    </div>
                  </SlideAnimationManager>
                );

              case 'table':
                return (
                  <SlideAnimationManager 
                    key={element.id} 
                    element={element}
                    isSlideActive={!isSlideTransitioning}
                    isSlideEntering={slideTransitionDirection === 'entering'}
                    isSlideExiting={slideTransitionDirection === 'exiting'}
                  >
                    <div
                      style={{
                        ...style,
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '14px',
                      }}
                    >
                      📋 Table
                    </div>
                  </SlideAnimationManager>
                );

              case 'embed':
                return (
                  <SlideAnimationManager 
                    key={element.id} 
                    element={element}
                    isSlideActive={!isSlideTransitioning}
                    isSlideEntering={slideTransitionDirection === 'entering'}
                    isSlideExiting={slideTransitionDirection === 'exiting'}
                  >
                    <div
                      style={{
                        ...style,
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '14px',
                      }}
                    >
                      🔗 Embed
                    </div>
                  </SlideAnimationManager>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black bg-opacity-50 text-white text-center">
        <p className="text-sm text-gray-300">
          Click left/right sides to navigate • Press Esc to exit • Use arrow keys to navigate
        </p>
      </div>
    </div>
  );
};

export default PresentationMode;
