import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorElement } from '../../types/editor';
import { getActiveSnapZones } from '../../utils/magneticSnapping';

interface GuideLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  length: number;
  thickness: number;
  style: 'solid' | 'dashed' | 'dotted';
  endCaps: 'rounded' | 'sharp';
  elementType: 'text' | 'shape' | 'image' | 'multiple' | 'slide-center' | 'spacing' | 'margin';
  priority: number;
}

interface DistanceBadge {
  id: string;
  x: number;
  y: number;
  distance: number;
  type: 'horizontal' | 'vertical';
}

interface GuideRendererProps {
  draggingElement: EditorElement | null;
  allElements: EditorElement[];
  selectedElementIds: string[];
  canvasSize: { width: number; height: number };
  zoom: number;
  isVisible: boolean;
}

const TOLERANCE = 8; // 8px tolerance for snap zones (matches magnetic system)

// Helper function to create guide lines with proper styling
const createGuideLine = (
  id: string,
  type: 'horizontal' | 'vertical',
  position: number,
  length: number,
  elementType: 'text' | 'shape' | 'image' | 'multiple' | 'slide-center' | 'spacing' | 'margin',
  priority: number = 1
): GuideLine => {
  const guideStyles = {
    'slide-center': { color: '#FF3366', thickness: 3, style: 'solid' as const, endCaps: 'sharp' as const },
    'text': { color: '#0066FF', thickness: 1, style: 'solid' as const, endCaps: 'sharp' as const },
    'shape': { color: '#8844FF', thickness: 2, style: 'solid' as const, endCaps: 'sharp' as const },
    'image': { color: '#FF8800', thickness: 2, style: 'solid' as const, endCaps: 'rounded' as const },
    'multiple': { color: '#00CC44', thickness: 2, style: 'dashed' as const, endCaps: 'sharp' as const },
    'spacing': { color: '#888888', thickness: 1, style: 'dotted' as const, endCaps: 'sharp' as const },
    'margin': { color: '#FFB800', thickness: 2, style: 'solid' as const, endCaps: 'sharp' as const },
  };

  const style = guideStyles[elementType];
  return {
    id,
    type,
    position,
    color: style.color,
    length,
    thickness: style.thickness,
    style: style.style,
    endCaps: style.endCaps,
    elementType,
    priority,
  };
};

export const GuideRenderer: React.FC<GuideRendererProps> = React.memo(({
  draggingElement,
  allElements,
  selectedElementIds,
  canvasSize,
  zoom,
  isVisible,
}) => {
  console.log('GuideRenderer: render check', { 
    isVisible, 
    hasDraggingElement: !!draggingElement, 
    draggingElementId: draggingElement?.id,
    allElementsCount: allElements.length 
  });
  
  // Only show guides during actual dragging, not during text box creation
  if (!isVisible || !draggingElement) {
    console.log('GuideRenderer: not visible or no dragging element, returning null');
    return null;
  }
  
  const elementToCheck = draggingElement;

  // Calculate active snap zones for visual feedback
  const activeSnapZones = useMemo(() => {
    if (!draggingElement) return { x: false, y: false, strength: 0 };
    
    const snapPoints = allElements
      .filter(element => element.id !== draggingElement.id)
      .flatMap(element => [
        { x: element.x, type: 'horizontal' as const, strength: 0.8, guideType: 'element-alignment' as const },
        { x: element.x + element.width / 2, type: 'horizontal' as const, strength: 0.7, guideType: 'element-alignment' as const },
        { x: element.x + element.width, type: 'horizontal' as const, strength: 0.8, guideType: 'element-alignment' as const },
        { y: element.y, type: 'vertical' as const, strength: 0.8, guideType: 'element-alignment' as const },
        { y: element.y + element.height / 2, type: 'vertical' as const, strength: 0.8, guideType: 'element-alignment' as const },
        { y: element.y + element.height, type: 'vertical' as const, strength: 0.8, guideType: 'element-alignment' as const },
      ]);

    // Check if dragging element is near any snap points
    let xSnap = false;
    let ySnap = false;
    let maxStrength = 0;

    snapPoints.forEach(snapPoint => {
      if (snapPoint.type === 'horizontal') {
        const distance = Math.abs(draggingElement.x - snapPoint.x);
        if (distance <= 8) { // Small snap zone
          xSnap = true;
          maxStrength = Math.max(maxStrength, snapPoint.strength);
        }
      } else if (snapPoint.type === 'vertical') {
        const distance = Math.abs(draggingElement.y - snapPoint.y);
        if (distance <= 8) { // Small snap zone
          ySnap = true;
          maxStrength = Math.max(maxStrength, snapPoint.strength);
        }
      }
    });

    return { x: xSnap, y: ySnap, strength: maxStrength };
  }, [draggingElement, allElements]);

  // Return null for now - we're using the new visual guide system instead
  return null;
});
