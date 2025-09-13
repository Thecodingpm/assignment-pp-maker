'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './DraggableLineIndicator.css';

interface DraggableLineIndicatorProps {
  containerRef?: React.RefObject<HTMLElement | HTMLDivElement | null>;
  snapThreshold?: number; // Distance in pixels for snap detection
  lineColor?: string;
  lineWidth?: number;
  vibrationDuration?: number; // Duration of snap feedback vibration
  onSnap?: (isSnapped: boolean) => void; // Callback when snap state changes
  className?: string;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  draggedElement: HTMLElement | null;
}

export default function DraggableLineIndicator({
  containerRef,
  snapThreshold = 50,
  lineColor = '#ff6b35',
  lineWidth = 3,
  vibrationDuration = 150,
  onSnap,
  className = ''
}: DraggableLineIndicatorProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    draggedElement: null
  });
  
  const [linePosition, setLinePosition] = useState<{ x: number; y: number; height: number } | null>(null);
  const [isSnapped, setIsSnapped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const lineRef = useRef<HTMLDivElement>(null);
  const containerElementRef = useRef<HTMLElement | null>(null);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vibrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get container element
  useEffect(() => {
    if (containerRef?.current) {
      containerElementRef.current = containerRef.current;
    } else {
      // Fallback to finding the editor container
      containerElementRef.current = document.querySelector('.lexical-editor') || document.body;
    }
  }, [containerRef]);

  // Calculate line position and snap detection
  const calculateLinePosition = useCallback((mouseX: number, mouseY: number) => {
    if (!containerElementRef.current) return null;

    const containerRect = containerElementRef.current.getBoundingClientRect();
    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Convert mouse position to container-relative coordinates
    const relativeX = mouseX - containerLeft;
    const relativeY = mouseY - containerTop;

    // Check if mouse is within container bounds
    if (relativeX < 0 || relativeX > containerWidth || relativeY < 0 || relativeY > containerHeight) {
      return null;
    }

    // Find the closest element at the mouse position
    const elementAtPoint = document.elementFromPoint(mouseX, mouseY);
    if (!elementAtPoint) return null;

    // Find draggable elements or editor blocks
    const draggableElements = containerElementRef.current.querySelectorAll(
      '.draggable-block, [data-lexical-key], p, div, h1, h2, h3, h4, h5, h6, li'
    );

    let closestElement: Element | null = null;
    let closestDistance = Infinity;
    let closestRect: DOMRect | null = null;

    for (const element of draggableElements) {
      const rect = element.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(mouseX - elementCenterX, 2) + Math.pow(mouseY - elementCenterY, 2)
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = element;
        closestRect = rect;
      }
    }

    if (!closestElement || !closestRect) return null;

    // Check if we're close enough to snap
    const elementCenterX = closestRect.left + closestRect.width / 2;
    const distanceFromCenter = Math.abs(mouseX - elementCenterX);
    const shouldSnap = distanceFromCenter <= snapThreshold;

    // Update snap state
    if (shouldSnap !== isSnapped) {
      setIsSnapped(shouldSnap);
      onSnap?.(shouldSnap);
      
      // Trigger vibration feedback
      if (shouldSnap) {
        triggerVibrationFeedback();
      }
    }

    // Calculate line position
    const lineX = shouldSnap ? elementCenterX - containerLeft : relativeX;
    const lineY = closestRect.top - containerTop;
    const lineHeight = closestRect.height;

    return {
      x: lineX,
      y: lineY,
      height: lineHeight
    };
  }, [snapThreshold, isSnapped, onSnap]);

  // Trigger vibration feedback animation
  const triggerVibrationFeedback = useCallback(() => {
    if (lineRef.current) {
      // Add vibration class
      lineRef.current.classList.add('vibrate');
      
      // Remove vibration class after duration
      if (vibrationTimeoutRef.current) {
        clearTimeout(vibrationTimeoutRef.current);
      }
      
      vibrationTimeoutRef.current = setTimeout(() => {
        if (lineRef.current) {
          lineRef.current.classList.remove('vibrate');
        }
      }, vibrationDuration);
    }
  }, [vibrationDuration]);

  // Handle drag start
  const handleDragStart = useCallback((e: DragEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if the target is draggable
    const isDraggable = target.closest('.draggable-block') || 
                       target.closest('[data-lexical-key]') ||
                       target.matches('p, div, h1, h2, h3, h4, h5, h6, li');
    
    if (isDraggable) {
      setDragState(prev => ({
        ...prev,
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        draggedElement: target
      }));
      
      setIsVisible(true);
    }
  }, []);

  // Handle drag
  const handleDrag = useCallback((e: DragEvent) => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY
    }));

    const newLinePosition = calculateLinePosition(e.clientX, e.clientY);
    setLinePosition(newLinePosition);
  }, [dragState.isDragging, calculateLinePosition]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false,
      draggedElement: null
    }));
    
    // Animate line out
    setIsVisible(false);
    setLinePosition(null);
    setIsSnapped(false);
    onSnap?.(false);
  }, [onSnap]);

  // Set up event listeners
  useEffect(() => {
    if (!containerElementRef.current) return;

    const container = containerElementRef.current;

    // Add event listeners to the container
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('drag', handleDrag);
    container.addEventListener('dragend', handleDragEnd);
    container.addEventListener('dragover', (e) => e.preventDefault());

    return () => {
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('drag', handleDrag);
      container.removeEventListener('dragend', handleDragEnd);
      container.removeEventListener('dragover', (e) => e.preventDefault());
    };
  }, [handleDragStart, handleDrag, handleDragEnd]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
      if (vibrationTimeoutRef.current) {
        clearTimeout(vibrationTimeoutRef.current);
      }
    };
  }, []);

  // Apply custom styles if lineColor is provided
  const customStyles = lineColor !== '#ff6b35' ? {
    '--line-color': lineColor,
    '--snap-color': '#ff4500'
  } as React.CSSProperties : {};

  return (
    <>
      {linePosition && (
        <div
          ref={lineRef}
          className={`draggable-line-indicator ${isVisible ? 'visible' : ''} ${isSnapped ? 'snapped' : ''} ${lineColor !== '#ff6b35' ? 'custom-color' : ''} ${className}`}
          style={{
            left: `${linePosition.x}px`,
            top: `${linePosition.y}px`,
            height: `${linePosition.height}px`,
            ...customStyles
          }}
        >
          <div className="line" />
        </div>
      )}
    </>
  );
}
