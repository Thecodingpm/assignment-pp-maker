import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorElement } from '../../types/editor';

interface GuideLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  length: number;
  start: number;
  end: number;
}

interface DistanceBadge {
  id: string;
  x: number;
  y: number;
  distance: number;
  type: 'horizontal' | 'vertical';
}

interface SmartGuidesProps {
  draggingElement: EditorElement | null;
  allElements: EditorElement[];
  canvasSize: { width: number; height: number };
  zoom: number;
  isVisible: boolean;
}

const TOLERANCE = 5; // 5px tolerance for snapping
const SNAP_DISTANCE = 10; // Distance within which snapping occurs

const SmartGuidesComponent: React.FC<SmartGuidesProps> = ({
  draggingElement,
  allElements,
  canvasSize,
  zoom,
  isVisible,
}) => {
  const guides = useMemo(() => {
    if (!draggingElement || !isVisible) return { lines: [], badges: [] };

    const lines: GuideLine[] = [];
    const badges: DistanceBadge[] = [];
    
    const draggingBounds = {
      left: draggingElement.x,
      right: draggingElement.x + draggingElement.width,
      top: draggingElement.y,
      bottom: draggingElement.y + draggingElement.height,
      centerX: draggingElement.x + draggingElement.width / 2,
      centerY: draggingElement.y + draggingElement.height / 2,
    };

    // Slide center guides (red)
    const slideCenterX = canvasSize.width / 2;
    const slideCenterY = canvasSize.height / 2;

    // Check horizontal slide center alignment
    if (Math.abs(draggingBounds.centerX - slideCenterX) <= TOLERANCE) {
      lines.push({
        id: 'slide-center-x',
        type: 'vertical',
        position: slideCenterX,
        color: '#FF4444',
        length: canvasSize.height,
        start: 0,
        end: canvasSize.height,
      });
    }

    // Check vertical slide center alignment
    if (Math.abs(draggingBounds.centerY - slideCenterY) <= TOLERANCE) {
      lines.push({
        id: 'slide-center-y',
        type: 'horizontal',
        position: slideCenterY,
        color: '#FF4444',
        length: canvasSize.width,
        start: 0,
        end: canvasSize.width,
      });
    }

    // Slide margin guides (20px and 40px from edges)
    const margins = [20, 40];
    margins.forEach(margin => {
      // Left margin
      if (Math.abs(draggingBounds.left - margin) <= TOLERANCE) {
        lines.push({
          id: `left-margin-${margin}`,
          type: 'vertical',
          position: margin,
          color: '#FF4444',
          length: canvasSize.height,
          start: 0,
          end: canvasSize.height,
        });
      }

      // Right margin
      if (Math.abs(draggingBounds.right - (canvasSize.width - margin)) <= TOLERANCE) {
        lines.push({
          id: `right-margin-${margin}`,
          type: 'vertical',
          position: canvasSize.width - margin,
          color: '#FF4444',
          length: canvasSize.height,
          start: 0,
          end: canvasSize.height,
        });
      }

      // Top margin
      if (Math.abs(draggingBounds.top - margin) <= TOLERANCE) {
        lines.push({
          id: `top-margin-${margin}`,
          type: 'horizontal',
          position: margin,
          color: '#FF4444',
          length: canvasSize.width,
          start: 0,
          end: canvasSize.width,
        });
      }

      // Bottom margin
      if (Math.abs(draggingBounds.bottom - (canvasSize.height - margin)) <= TOLERANCE) {
        lines.push({
          id: `bottom-margin-${margin}`,
          type: 'horizontal',
          position: canvasSize.height - margin,
          color: '#FF4444',
          length: canvasSize.width,
          start: 0,
          end: canvasSize.width,
        });
      }
    });

    // Element-to-element alignment guides (blue)
    allElements.forEach((element) => {
      if (element.id === draggingElement.id) return;

      const elementBounds = {
        left: element.x,
        right: element.x + element.width,
        top: element.y,
        bottom: element.y + element.height,
        centerX: element.x + element.width / 2,
        centerY: element.y + element.height / 2,
      };

      // Horizontal alignment checks
      if (Math.abs(draggingBounds.left - elementBounds.left) <= TOLERANCE) {
        lines.push({
          id: `align-left-${element.id}`,
          type: 'vertical',
          position: elementBounds.left,
          color: '#0066FF',
          length: canvasSize.height,
          start: 0,
          end: canvasSize.height,
        });
      }

      if (Math.abs(draggingBounds.right - elementBounds.right) <= TOLERANCE) {
        lines.push({
          id: `align-right-${element.id}`,
          type: 'vertical',
          position: elementBounds.right,
          color: '#0066FF',
          length: canvasSize.height,
          start: 0,
          end: canvasSize.height,
        });
      }

      if (Math.abs(draggingBounds.centerX - elementBounds.centerX) <= TOLERANCE) {
        lines.push({
          id: `align-center-x-${element.id}`,
          type: 'vertical',
          position: elementBounds.centerX,
          color: '#0066FF',
          length: canvasSize.height,
          start: 0,
          end: canvasSize.height,
        });
      }

      // Vertical alignment checks
      if (Math.abs(draggingBounds.top - elementBounds.top) <= TOLERANCE) {
        lines.push({
          id: `align-top-${element.id}`,
          type: 'horizontal',
          position: elementBounds.top,
          color: '#0066FF',
          length: canvasSize.width,
          start: 0,
          end: canvasSize.width,
        });
      }

      if (Math.abs(draggingBounds.bottom - elementBounds.bottom) <= TOLERANCE) {
        lines.push({
          id: `align-bottom-${element.id}`,
          type: 'horizontal',
          position: elementBounds.bottom,
          color: '#0066FF',
          length: canvasSize.width,
          start: 0,
          end: canvasSize.width,
        });
      }

      if (Math.abs(draggingBounds.centerY - elementBounds.centerY) <= TOLERANCE) {
        lines.push({
          id: `align-center-y-${element.id}`,
          type: 'horizontal',
          position: elementBounds.centerY,
          color: '#0066FF',
          length: canvasSize.width,
          start: 0,
          end: canvasSize.width,
        });
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
      }
    });

    return { lines, badges };
  }, [draggingElement, allElements, canvasSize, zoom, isVisible]);

  if (!isVisible || !draggingElement) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {guides.lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute"
            style={{
              left: line.type === 'vertical' ? line.position : 0,
              top: line.type === 'horizontal' ? line.position : 0,
              width: line.type === 'horizontal' ? line.length : 1,
              height: line.type === 'vertical' ? line.length : 1,
              backgroundColor: line.color,
            }}
          />
        ))}
      </AnimatePresence>

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
            }}
          >
            {badge.distance}px
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const SmartGuides = React.memo(SmartGuidesComponent);
