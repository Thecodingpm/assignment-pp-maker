'use client';

import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../stores/useEditorStore';
import { X, ChevronLeft, ChevronRight, Square } from 'lucide-react';

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

  const currentSlide = slides[currentSlideIndex];

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
          nextSlide();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          previousSlide();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, exitPresentationMode, nextSlide, previousSlide]);

  // Handle click navigation
  const handleSlideClick = (event: React.MouseEvent) => {
    const rect = slideRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = event.clientX - rect.left;
    const slideWidth = rect.width;
    
    // Click on right side to go next, left side to go previous
    if (clickX > slideWidth / 2) {
      nextSlide();
    } else {
      previousSlide();
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
            onClick={previousSlide}
            disabled={currentSlideIndex === 0}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Slide (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
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
                  <div
                    key={element.id}
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
                );

              case 'image':
                return (
                  <img
                    key={element.id}
                    src={element.src}
                    alt={element.alt}
                    style={style}
                    className="object-contain"
                  />
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
                  <div
                    key={element.id}
                    style={shapeStyle}
                  />
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
