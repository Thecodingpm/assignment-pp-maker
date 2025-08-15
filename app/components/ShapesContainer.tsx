'use client';

import { useState, useCallback } from 'react';
import DraggableShape from './DraggableShape';

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'hexagon';
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ShapesContainerProps {
  shapes: Shape[];
  onShapesChange: (shapes: Shape[]) => void;
}

export default function ShapesContainer({ shapes, onShapesChange }: ShapesContainerProps) {
  const removeShape = useCallback((id: string) => {
    const updatedShapes = shapes.filter(shape => shape.id !== id);
    onShapesChange(updatedShapes);
  }, [shapes, onShapesChange]);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    const updatedShapes = shapes.map(shape => 
      shape.id === id ? { ...shape, ...updates } : shape
    );
    onShapesChange(updatedShapes);
  }, [shapes, onShapesChange]);

  return (
    <>
      {shapes.map((shape) => (
        <DraggableShape
          key={shape.id}
          type={shape.type}
          initialPosition={shape.position}
          initialSize={shape.size}
          onRemove={() => removeShape(shape.id)}
        />
      ))}
    </>
  );
} 