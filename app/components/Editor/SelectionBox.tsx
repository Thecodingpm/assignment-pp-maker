'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';

const SelectionBox: React.FC = () => {
  const { selectElement } = useEditorStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get canvas reference from parent
  useEffect(() => {
    const canvas = document.querySelector('[data-canvas]') as HTMLDivElement;
    if (canvas) {
      canvasRef.current = canvas;
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / useEditorStore.getState().zoom;
    const y = (e.clientY - rect.top) / useEditorStore.getState().zoom;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / useEditorStore.getState().zoom;
    const y = (e.clientY - rect.top) / useEditorStore.getState().zoom;
    
    setSelectionEnd({ x, y });
  }, [isSelecting]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    
    setIsSelecting(false);
    
    // Find elements within selection box
    const { slides, currentSlideIndex } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    
    if (!currentSlide) return;
    
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const right = Math.max(selectionStart.x, selectionEnd.x);
    const bottom = Math.max(selectionStart.y, selectionEnd.y);
    
    const selectedElements = currentSlide.elements.filter(element => {
      const elementRight = element.x + element.width;
      const elementBottom = element.y + element.height;
      
      return (
        element.x < right &&
        elementRight > left &&
        element.y < bottom &&
        elementBottom > top
      );
    });
    
    // Select all elements in the selection box
    selectedElements.forEach(element => {
      selectElement(element.id, true);
    });
  }, [isSelecting, selectionStart, selectionEnd, selectElement]);

  // Add/remove mouse event listeners
  React.useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  if (!isSelecting) return null;

  const left = Math.min(selectionStart.x, selectionEnd.x);
  const top = Math.min(selectionStart.y, selectionEnd.y);
  const width = Math.abs(selectionEnd.x - selectionStart.x);
  const height = Math.abs(selectionEnd.y - selectionStart.y);

  return (
    <div
      className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
      style={{
        left,
        top,
        width,
        height,
        zIndex: 999,
      }}
    />
  );
};

export default SelectionBox;
