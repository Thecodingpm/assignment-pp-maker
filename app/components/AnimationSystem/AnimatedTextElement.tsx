'use client';

import React, { useEffect, useRef } from 'react';
import { TextElement } from '../../types/editor';

interface AnimatedTextElementProps {
  element: TextElement;
  children: React.ReactNode;
}

export const AnimatedTextElement: React.FC<AnimatedTextElementProps> = ({
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
      // For entrance animations, start from the initial state
      if (animation.properties.opacity !== undefined) {
        elementNode.style.opacity = animation.properties.opacity.toString();
      }
      
      if (animation.properties.scale !== undefined) {
        elementNode.style.transform = `scale(${animation.properties.scale})`;
      }
      
      if (animation.properties.translateX !== undefined) {
        elementNode.style.transform += ` translateX(${animation.properties.translateX}px)`;
      }
      
      if (animation.properties.translateY !== undefined) {
        elementNode.style.transform += ` translateY(${animation.properties.translateY}px)`;
      }
      
      if (animation.properties.rotate !== undefined) {
        elementNode.style.transform += ` rotate(${animation.properties.rotate}deg)`;
      }
    } else if (animation.type === 'exit') {
      // For exit animations, start from normal state
      elementNode.style.opacity = '1';
      elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
    } else {
      // For emphasis animations, start from normal state
      elementNode.style.opacity = '1';
      elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
    }

    // Trigger animation when element becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && animation.isActive) {
            if (animation.type === 'exit') {
              // For exit animations, animate to exit state
              setTimeout(() => {
                elementNode.style.opacity = '0';
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
                elementNode.style.transform = transform || 'scale(1) translateX(0) translateY(0) rotate(0)';
              }, 100);
            } else {
              // For entrance and emphasis animations, animate to final state
              setTimeout(() => {
                elementNode.style.opacity = '1';
                elementNode.style.transform = 'scale(1) translateX(0) translateY(0) rotate(0)';
              }, 100);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(elementNode);

    return () => {
      observer.disconnect();
    };
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
