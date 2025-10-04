'use client';

import React, { useEffect, useRef } from 'react';
import { EditorElement } from '../../types/editor';

interface SlideAnimationManagerProps {
  element: EditorElement;
  isSlideActive: boolean;
  isSlideEntering: boolean;
  isSlideExiting: boolean;
  children: React.ReactNode;
}

export const SlideAnimationManager: React.FC<SlideAnimationManagerProps> = ({
  element,
  isSlideActive,
  isSlideEntering,
  isSlideExiting,
  children
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!element.animation || !elementRef.current) return;

    const { animation } = element;
    const elementNode = elementRef.current;

    // Ensure animation properties exist with defaults
    const animationProps = {
      duration: animation.duration || 500,
      easing: animation.easing || 'ease-in-out',
      properties: {
        opacity: animation.properties?.opacity !== undefined ? animation.properties.opacity : 1,
        scale: animation.properties?.scale !== undefined ? animation.properties.scale : 1,
        translateX: animation.properties?.translateX !== undefined ? animation.properties.translateX : 0,
        translateY: animation.properties?.translateY !== undefined ? animation.properties.translateY : 0,
        rotate: animation.properties?.rotate !== undefined ? animation.properties.rotate : 0,
        transform: animation.properties?.transform || ''
      }
    };

    // Set transition properties
    elementNode.style.transition = `all ${animationProps.duration}ms ${animationProps.easing}`;

    if (animation.type === 'entrance') {
      if (isSlideEntering) {
        // For entrance animations, start from the properties defined in the preset (hidden state)
        elementNode.style.opacity = animationProps.properties.opacity.toString();
        
        let initialTransform = '';
        if (animationProps.properties.scale !== 1) {
          initialTransform += `scale(${animationProps.properties.scale})`;
        }
        if (animationProps.properties.translateX !== 0) {
          initialTransform += ` translateX(${animationProps.properties.translateX}px)`;
        }
        if (animationProps.properties.translateY !== 0) {
          initialTransform += ` translateY(${animationProps.properties.translateY}px)`;
        }
        if (animationProps.properties.rotate !== 0) {
          initialTransform += ` rotate(${animationProps.properties.rotate}deg)`;
        }
        if (animationProps.properties.transform) {
          initialTransform += ` ${animationProps.properties.transform}`;
        }
        elementNode.style.transform = initialTransform || 'scale(1) translateX(0) translateY(0) rotate(0)';

        // Trigger entrance animation to visible state
        setTimeout(() => {
          elementNode.style.opacity = '1';
          elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
        }, 100);
      } else if (isSlideActive) {
        // Element is visible and in normal state
        elementNode.style.opacity = '1';
        elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
      }
    } else if (animation.type === 'exit') {
      if (isSlideActive && !isSlideExiting) {
        // Element is visible and in normal state (ready for exit)
        elementNode.style.opacity = '1';
        elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
      } else if (isSlideExiting) {
        // For exit animations, animate to the properties defined in the preset (hidden state)
        setTimeout(() => {
          elementNode.style.opacity = animationProps.properties.opacity.toString();
          
          let exitTransform = '';
          if (animationProps.properties.scale !== 1) {
            exitTransform += `scale(${animationProps.properties.scale})`;
          }
          if (animationProps.properties.translateX !== 0) {
            exitTransform += ` translateX(${animationProps.properties.translateX}px)`;
          }
          if (animationProps.properties.translateY !== 0) {
            exitTransform += ` translateY(${animationProps.properties.translateY}px)`;
          }
          if (animationProps.properties.rotate !== 0) {
            exitTransform += ` rotate(${animationProps.properties.rotate}deg)`;
          }
          if (animationProps.properties.transform) {
            exitTransform += ` ${animationProps.properties.transform}`;
          }
          elementNode.style.transform = exitTransform || 'scale(1) translateX(0) translateY(0) rotate(0)';
        }, 100);
      }
    } else if (animation.type === 'emphasis') {
      // Emphasis animations work when element is visible
      if (isSlideActive) {
        elementNode.style.opacity = '1';
        elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
        
        // Trigger emphasis animation
        setTimeout(() => {
          let transform = '';
          if (animation.properties.scale !== undefined) {
            transform += `scale(${animation.properties.scale})`;
          }
          if (animation.properties.translateX !== undefined) {
            transform += ` translateX(${animation.properties.translateX}px)`;
          }
          if (animation.properties.translateY !== undefined) {
            transform += ` translateY(${animation.properties.translateY}px)`;
          }
          if (animation.properties.rotate !== undefined) {
            transform += ` rotate(${animation.properties.rotate}deg)`;
          }
          if (animation.properties.transform) {
            transform += ` ${animation.properties.transform}`;
          }
          elementNode.style.transform = transform;
          
          // Return to normal state after emphasis
          setTimeout(() => {
            elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
          }, animation.duration);
        }, 100);
      }
    }
  }, [element.animation, isSlideActive, isSlideEntering, isSlideExiting]);

  if (!element.animation) {
    return <>{children}</>;
  }

  return (
    <div
      ref={elementRef}
      id={`element-${element.id}`}
      style={{
        // Don't override positioning - let the child component handle it
        // Only add animation-specific styles
      }}
    >
      {children}
    </div>
  );
};
