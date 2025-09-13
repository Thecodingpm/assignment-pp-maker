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

    // Set transition properties
    elementNode.style.transition = `all ${animation.duration}ms ${animation.easing}`;

    if (animation.type === 'entrance') {
      if (isSlideEntering) {
        // For entrance animations, start from the properties defined in the preset (hidden state)
        if (animation.properties.opacity !== undefined) {
          elementNode.style.opacity = animation.properties.opacity.toString();
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
        elementNode.style.transform = initialTransform;

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
          if (animation.properties.opacity !== undefined) {
            elementNode.style.opacity = animation.properties.opacity.toString();
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
          elementNode.style.transform = exitTransform;
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
