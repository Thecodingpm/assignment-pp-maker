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
        { x: element.x, y: undefined, type: 'vertical' as const, strength: 1, guideType: 'element-alignment' as const },
        { x: element.x + element.width, y: undefined, type: 'vertical' as const, strength: 1, guideType: 'element-alignment' as const },
        { x: element.x + element.width / 2, y: undefined, type: 'vertical' as const, strength: 1, guideType: 'element-alignment' as const },
        { x: undefined, y: element.y, type: 'horizontal' as const, strength: 1, guideType: 'element-alignment' as const },
        { x: undefined, y: element.y + element.height, type: 'horizontal' as const, strength: 1, guideType: 'element-alignment' as const },
        { x: undefined, y: element.y + element.height / 2, type: 'horizontal' as const, strength: 1, guideType: 'element-alignment' as const },
      ]);
    
    // Add slide center snap points
    snapPoints.push(
      { x: canvasSize.width / 2, y: undefined, type: 'vertical' as const, strength: 1, guideType: 'element-alignment' as const },
      { x: undefined, y: canvasSize.height / 2, type: 'horizontal' as const, strength: 1, guideType: 'element-alignment' as const }
    );
    
    return getActiveSnapZones(
      { x: draggingElement.x + draggingElement.width / 2, y: draggingElement.y + draggingElement.height / 2 },
      snapPoints
    );
  }, [draggingElement, allElements, canvasSize]);

  const guides = useMemo(() => {
    console.log('GuideRenderer: calculating guides', { draggingElement: draggingElement?.id, isVisible, allElements: allElements.length, selectedCount: selectedElementIds.length });
    if (!draggingElement) return { lines: [], badges: [] };
    
    const elementToCheck = draggingElement;
    
    // Detect if we're dragging multiple elements
    const isMultipleSelection = selectedElementIds.length > 1 && selectedElementIds.includes(draggingElement.id);
    
    const draggingBounds = {
      left: elementToCheck.x,
      right: elementToCheck.x + elementToCheck.width,
      top: elementToCheck.y,
      bottom: elementToCheck.y + elementToCheck.height,
      centerX: elementToCheck.x + elementToCheck.width / 2,
      centerY: elementToCheck.y + elementToCheck.height / 2,
    };
    
    const lines: GuideLine[] = [];
    const badges: DistanceBadge[] = [];

    // Slide center guides (red)
    const slideCenterX = canvasSize.width / 2;
    const slideCenterY = canvasSize.height / 2;

    console.log('Guide detection:', {
      elementCenter: { x: draggingBounds.centerX, y: draggingBounds.centerY },
      slideCenter: { x: slideCenterX, y: slideCenterY },
      tolerance: TOLERANCE,
      elementBounds: draggingBounds
    });

    // Check horizontal slide center alignment
    if (Math.abs(draggingBounds.centerX - slideCenterX) <= TOLERANCE) {
      console.log('Horizontal center alignment detected!');
      lines.push(createGuideLine(
        'slide-center-x',
        'vertical',
        slideCenterX,
        canvasSize.height,
        'slide-center',
        10
      ));
    }

    // Check vertical slide center alignment
    if (Math.abs(draggingBounds.centerY - slideCenterY) <= TOLERANCE) {
      lines.push(createGuideLine(
        'slide-center-y',
        'horizontal',
        slideCenterY,
        canvasSize.width,
        'slide-center',
        10
      ));
    }

    // Slide margin guides (20px and 40px from edges)
    const margins = [20, 40];
    margins.forEach(margin => {
      // Left margin
      if (Math.abs(draggingBounds.left - margin) <= TOLERANCE) {
        lines.push(createGuideLine(
          `left-margin-${margin}`,
          'vertical',
          margin,
          canvasSize.height,
          'margin',
          8
        ));
      }

      // Right margin
      if (Math.abs(draggingBounds.right - (canvasSize.width - margin)) <= TOLERANCE) {
        lines.push(createGuideLine(
          `right-margin-${margin}`,
          'vertical',
          canvasSize.width - margin,
          canvasSize.height,
          'margin',
          8
        ));
      }

      // Top margin
      if (Math.abs(draggingBounds.top - margin) <= TOLERANCE) {
        lines.push(createGuideLine(
          `top-margin-${margin}`,
          'horizontal',
          margin,
          canvasSize.width,
          'margin',
          8
        ));
      }

      // Bottom margin
      if (Math.abs(draggingBounds.bottom - (canvasSize.height - margin)) <= TOLERANCE) {
        lines.push(createGuideLine(
          `bottom-margin-${margin}`,
          'horizontal',
          margin,
          canvasSize.width,
          'margin',
          8
        ));
      }
    });

    // Element-to-element alignment guides (blue)
    allElements.forEach((element) => {
      if (element.id === elementToCheck.id) return;

      const elementBounds = {
        left: element.x,
        right: element.x + element.width,
        top: element.y,
        bottom: element.y + element.height,
        centerX: element.x + element.width / 2,
        centerY: element.y + element.height / 2,
      };

      // Determine element type for guide styling
      let elementType: 'text' | 'shape' | 'image' | 'multiple' = 'text';
      
      if (isMultipleSelection) {
        elementType = 'multiple';
      } else if (element.type === 'text') {
        elementType = 'text';
      } else if (element.type === 'shape') {
        elementType = 'shape';
      } else {
        elementType = 'image';
      }
      
      // Horizontal alignment checks
      if (Math.abs(draggingBounds.left - elementBounds.left) <= TOLERANCE) {
        lines.push(createGuideLine(
          `align-left-${element.id}`,
          'vertical',
          elementBounds.left,
          canvasSize.height,
          elementType,
          5
        ));
      }

      if (Math.abs(draggingBounds.right - elementBounds.right) <= TOLERANCE) {
        lines.push(createGuideLine(
          `align-right-${element.id}`,
          'vertical',
          elementBounds.right,
          canvasSize.height,
          elementType,
          5
        ));
      }

      if (Math.abs(draggingBounds.centerX - elementBounds.centerX) <= TOLERANCE) {
        lines.push(createGuideLine(
          `align-center-x-${element.id}`,
          'vertical',
          elementBounds.centerX,
          canvasSize.height,
          elementType,
          5
        ));
      }

      // Vertical alignment checks
      if (Math.abs(draggingBounds.top - elementBounds.top) <= TOLERANCE) {
        lines.push(createGuideLine(
          `align-top-${element.id}`,
          'horizontal',
          elementBounds.top,
          canvasSize.width,
          elementType,
          5
        ));
      }

      if (Math.abs(draggingBounds.bottom - elementBounds.bottom) <= TOLERANCE) {
        lines.push(createGuideLine(
          `align-bottom-${element.id}`,
          'horizontal',
          elementBounds.bottom,
          canvasSize.width,
          elementType,
          5
        ));
      }

      if (Math.abs(draggingBounds.centerY - elementBounds.centerY) <= TOLERANCE) {
        lines.push(createGuideLine(
          `align-center-y-${element.id}`,
          'horizontal',
          elementBounds.centerY,
          canvasSize.width,
          elementType,
          5
        ));
      }

      // Distance measurements
      const horizontalDistance = Math.abs(draggingBounds.left - elementBounds.right);
      const verticalDistance = Math.abs(draggingBounds.top - elementBounds.bottom);

      if (horizontalDistance > 0 && horizontalDistance <= 100) {
        const badgeX = Math.min(draggingBounds.left, elementBounds.right) + horizontalDistance / 2;
        const badgeY = Math.max(draggingBounds.bottom, elementBounds.bottom) + 20;
        
        badges.push({
          id: `distance-h-${element.id}`,
          x: badgeX,
          y: badgeY,
          distance: Math.round(horizontalDistance),
          type: 'horizontal',
        });
        
        // Add equal spacing guide if there are 3+ elements
        if (allElements.length >= 3) {
          lines.push(createGuideLine(
            `spacing-h-${element.id}`,
            'vertical',
            Math.min(draggingBounds.left, elementBounds.right) + horizontalDistance / 2,
            canvasSize.height,
            'spacing',
            3
          ));
        }
      }

      if (verticalDistance > 0 && verticalDistance <= 100) {
        const badgeX = Math.max(draggingBounds.right, elementBounds.right) + 20;
        const badgeY = Math.min(draggingBounds.top, elementBounds.bottom) + verticalDistance / 2;
        
        badges.push({
          id: `distance-v-${element.id}`,
          x: badgeX,
          y: badgeY,
          distance: Math.round(verticalDistance),
          type: 'vertical',
        });
        
        // Add equal spacing guide if there are 3+ elements
        if (allElements.length >= 3) {
          lines.push(createGuideLine(
            `spacing-v-${element.id}`,
            'horizontal',
            Math.min(draggingBounds.top, elementBounds.bottom) + verticalDistance / 2,
            canvasSize.width,
            'spacing',
            3
          ));
        }
      }
    });

    console.log('GuideRenderer: calculated guides', { 
      linesCount: lines.length, 
      badgesCount: badges.length,
      lines: lines.map(l => ({ type: l.type, position: l.position, color: l.color })),
      badges: badges.map(b => ({ type: b.type, distance: b.distance }))
    });
    
    return { lines, badges };
  }, [draggingElement, allElements, canvasSize, zoom, isVisible]);



  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        zIndex: 5, // Above canvas but below cursor
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
    >
      {/* Debug: Show guide count during dragging */}
      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 z-50">
        GUIDES: {guides.lines.length} lines, {guides.badges.length} badges
      </div>
      
      {/* Debug: Show current element position */}
      <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1 z-50">
        Element: {elementToCheck.id} at ({Math.round(elementToCheck.x)}, {Math.round(elementToCheck.y)})
      </div>
      
      {/* Debug: Show magnetic zones */}
      <div className="absolute top-8 left-0 bg-purple-500 text-white text-xs px-2 py-1 z-50">
        Magnetic Zones: {guides.lines.filter(l => l.color === '#FF4444').length} center, {guides.lines.filter(l => l.color === '#0066FF').length} alignment
      </div>
      
      {/* Magnetic Snap Zone Status */}
      <div className="absolute top-8 right-0 bg-green-500 text-white text-xs px-2 py-1 z-50">
        Snap Zone: {activeSnapZones.x || activeSnapZones.y ? 'ACTIVE' : 'Inactive'} 
        Strength: {Math.round(activeSnapZones.strength * 100)}%
      </div>
      
      {/* Guide Lines */}
      <AnimatePresence>
        {guides.lines.map((line) => {
          // Check if this guide is in an active snap zone
          const isInSnapZone = (line.type === 'vertical' && activeSnapZones.x) || 
                              (line.type === 'horizontal' && activeSnapZones.y);
          
          return (
            <motion.div
              key={line.id}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isInSnapZone ? 1 : 0.7,
                scale: isInSnapZone ? 1.1 : 1,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute"
              style={{
                left: line.type === 'vertical' ? line.position : 0,
                top: line.type === 'horizontal' ? line.position : 0,
                width: line.type === 'horizontal' ? line.length : line.thickness,
                height: line.type === 'vertical' ? line.length : line.thickness,
                backgroundColor: line.color,
                zIndex: 6,
                borderStyle: line.style,
                borderRadius: line.endCaps === 'rounded' ? '2px' : '0',
                boxShadow: isInSnapZone 
                  ? `0 0 8px ${line.color}, 0 0 16px ${line.color}60` 
                  : `0 0 4px ${line.color}40`,
                transform: isInSnapZone ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          );
        })}
      </AnimatePresence>
      
      {/* Crosshair for Slide Center Guides */}
      <AnimatePresence>
        {guides.lines
          .filter(line => line.elementType === 'slide-center')
          .map((line) => (
            <motion.div
              key={`crosshair-${line.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute w-3 h-3 rounded-full border-2 border-white"
              style={{
                left: line.type === 'vertical' ? line.position - 6 : 0,
                top: line.type === 'horizontal' ? line.position - 6 : 0,
                backgroundColor: line.color,
                zIndex: 7,
                boxShadow: `0 0 8px ${line.color}`,
              }}
            />
          ))}
      </AnimatePresence>
      
      {/* Magnetic Snap Zone Indicators */}
      <AnimatePresence>
        {guides.lines.map((line) => (
          <motion.div
            key={`zone-${line.id}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute rounded-full"
            style={{
              left: line.type === 'vertical' ? line.position - 4 : 0,
              top: line.type === 'horizontal' ? line.position - 4 : 0,
              width: line.type === 'vertical' ? 8 : line.length,
              height: line.type === 'horizontal' ? 8 : line.length,
              backgroundColor: line.color,
              opacity: 0.1,
              zIndex: 5,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Distance Badges */}
      <AnimatePresence>
        {guides.badges.map((badge) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute bg-white text-xs text-gray-700 px-2 py-1 rounded shadow-sm border border-gray-200"
            style={{
              left: badge.x,
              top: badge.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 7,
            }}
          >
            {badge.distance}px
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
