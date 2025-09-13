'use client';

import React, { useEffect, useRef } from 'react';
import { EditorElement } from '../../types/editor';

interface AnimatedElementProps {
  element: EditorElement;
  children: React.ReactNode;
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  element,
  children
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only apply animations if the element has animation properties
    if (!element.animation || !elementRef.current) return;

    const { animation } = element;
    const elementNode = elementRef.current;

    // Set transition properties first
    elementNode.style.transition = `all ${animation.duration}ms ${animation.easing}`;

    // Set initial animation state based on animation type
    if (animation.type === 'entrance') {
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

      // Trigger entrance animation immediately when element is rendered
      setTimeout(() => {
        elementNode.style.opacity = '1';
        elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
      }, 100);
    } else if (animation.type === 'exit') {
      // For exit animations, start from normal state (visible)
      elementNode.style.opacity = '1';
      elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
      
      // Exit animations will be triggered by slide transitions or manual triggers
    } else {
      // For emphasis animations, start from normal state
      elementNode.style.opacity = '1';
      elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
      
      // Trigger emphasis animation when element becomes visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && animation.isActive) {
              // For emphasis animations, animate to emphasis state and back
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
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(elementNode);

      return () => {
        observer.disconnect();
      };
    }
  }, [element.animation]);

  // If no animation, just return children directly
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
