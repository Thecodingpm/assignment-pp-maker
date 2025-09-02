import { EditorElement } from '../types/editor';

export interface SnapPoint {
  x?: number;
  y?: number;
  type: 'horizontal' | 'vertical';
  strength: number;
  guideType: 'slide-center' | 'element-alignment' | 'spacing' | 'margin';
}

export interface SnappedPosition {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  magneticForce: { x: number; y: number };
  snapZone: boolean;
}

export interface MagneticZone {
  x?: number;
  y?: number;
  type: 'horizontal' | 'vertical';
  strength: number;
  guideType: 'slide-center' | 'element-alignment' | 'spacing' | 'margin';
  active: boolean;
}

const SNAP_ZONE_RADIUS = 8; // 8px radius for snap zone
const MAGNETIC_RELEASE_DISTANCE = 12; // 12px to release magnetic hold
const BASE_MAGNETIC_STRENGTH = 0.4; // Base lerp strength (increased for smoother snapping)
const VELOCITY_REDUCTION = 0.5; // Reduce movement speed by 50% in snap zone
const SNAP_RESISTANCE = 0.8; // Resistance factor when trying to drag away from alignment

// Linear interpolation function
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Calculate magnetic strength based on guide type
const getMagneticStrength = (guideType: string, baseStrength: number): number => {
  switch (guideType) {
    case 'slide-center':
      return baseStrength * 1.5; // Strongest pull for slide center (50% stronger)
    case 'element-alignment':
      return baseStrength * 1.0; // Medium pull for element alignment
    case 'spacing':
      return baseStrength * 0.7; // Lighter pull for spacing guides
    case 'margin':
      return baseStrength * 1.1; // Strong pull for margins
    default:
      return baseStrength;
  }
};

export const calculateSnapPoints = (
  draggingElement: EditorElement,
  allElements: EditorElement[],
  canvasSize: { width: number; height: number }
): SnapPoint[] => {
  const snapPoints: SnapPoint[] = [];
  
  const draggingBounds = {
    left: draggingElement.x,
    right: draggingElement.x + draggingElement.width,
    top: draggingElement.y,
    bottom: draggingElement.y + draggingElement.height,
    centerX: draggingElement.x + draggingElement.width / 2,
    centerY: draggingElement.y + draggingElement.height / 2,
  };

  // Slide center snap points (strongest magnetic pull)
  const slideCenterX = canvasSize.width / 2;
  const slideCenterY = canvasSize.height / 2;
  
  snapPoints.push(
    { 
      x: slideCenterX - draggingElement.width / 2, 
      type: 'horizontal', 
      strength: 1.0,
      guideType: 'slide-center'
    },
    { 
      y: slideCenterY - draggingElement.height / 2, 
      type: 'vertical', 
      strength: 1.0,
      guideType: 'slide-center'
    }
  );

  // Slide margin snap points (strong magnetic pull)
  const margins = [20, 40];
  margins.forEach(margin => {
    snapPoints.push(
      { x: margin, type: 'horizontal', strength: 0.9, guideType: 'margin' },
      { x: canvasSize.width - margin - draggingElement.width, type: 'horizontal', strength: 0.9, guideType: 'margin' },
      { y: margin, type: 'vertical', strength: 0.9, guideType: 'margin' },
      { y: canvasSize.height - margin - draggingElement.height, type: 'vertical', strength: 0.9, guideType: 'margin' }
    );
  });

  // Element-to-element snap points (medium magnetic pull)
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

    // Horizontal alignment snap points
    snapPoints.push(
      { x: elementBounds.left, type: 'horizontal', strength: 0.8, guideType: 'element-alignment' }, // Left edge
      { x: elementBounds.right - draggingElement.width, type: 'horizontal', strength: 0.8, guideType: 'element-alignment' }, // Right edge
      { x: elementBounds.centerX - draggingElement.width / 2, type: 'horizontal', strength: 0.7, guideType: 'element-alignment' } // Center
    );

    // Vertical alignment snap points
    snapPoints.push(
      { y: elementBounds.top, type: 'vertical', strength: 0.8, guideType: 'element-alignment' }, // Top edge
      { y: elementBounds.bottom - draggingElement.height, type: 'vertical', strength: 0.8, guideType: 'element-alignment' }, // Bottom edge
      { y: elementBounds.centerY - draggingElement.height / 2, type: 'vertical', strength: 0.7, guideType: 'element-alignment' } // Center
    );

    // Spacing snap points (lighter magnetic pull)
    const horizontalSpacing = Math.abs(draggingBounds.left - elementBounds.right);
    const verticalSpacing = Math.abs(draggingBounds.top - elementBounds.bottom);
    
    if (horizontalSpacing > 0 && horizontalSpacing <= 100) {
      snapPoints.push({
        x: elementBounds.right + horizontalSpacing,
        type: 'horizontal',
        strength: 0.6,
        guideType: 'spacing'
      });
    }
    
    if (verticalSpacing > 0 && verticalSpacing <= 100) {
      snapPoints.push({
        y: elementBounds.bottom + verticalSpacing,
        type: 'vertical',
        strength: 0.6,
        guideType: 'spacing'
      });
    }
  });

  return snapPoints;
};

export const applyMagneticSnapping = (
  position: { x: number; y: number },
  snapPoints: SnapPoint[],
  draggingElement: EditorElement
): SnappedPosition => {
  let snappedX = false;
  let snappedY = false;
  let finalX = position.x;
  let finalY = position.y;
  let magneticForce = { x: 0, y: 0 };
  let snapZone = false;

  // Find the strongest snap point for X axis
  const xSnapPoints = snapPoints.filter(p => p.x !== undefined);
  let bestXSnap: SnapPoint | null = null;
  let bestXDistance = Infinity;

  xSnapPoints.forEach(snapPoint => {
    if (snapPoint.x === undefined) return;
    const distance = Math.abs(position.x - snapPoint.x);
    if (distance <= SNAP_ZONE_RADIUS && distance < bestXDistance) {
      bestXDistance = distance;
      bestXSnap = snapPoint;
    }
  });

  // Find the strongest snap point for Y axis
  const ySnapPoints = snapPoints.filter(p => p.y !== undefined);
  let bestYSnap: SnapPoint | null = null;
  let bestYDistance = Infinity;

  ySnapPoints.forEach(snapPoint => {
    if (snapPoint.y === undefined) return;
    const distance = Math.abs(position.y - snapPoint.y);
    if (distance <= SNAP_ZONE_RADIUS && distance < bestYDistance) {
      bestYDistance = distance;
      bestYSnap = snapPoint;
    }
  });

  // Apply magnetic snapping for X axis with enhanced behavior
  if (bestXSnap && bestXSnap.x !== undefined) {
    const distance = Math.abs(position.x - bestXSnap.x);

    if (distance <= SNAP_ZONE_RADIUS) {
      snapZone = true;
      const magneticStrength = getMagneticStrength(bestXSnap.guideType, BASE_MAGNETIC_STRENGTH);

      // Apply magnetic pull with smooth interpolation
      finalX = lerp(position.x, bestXSnap.x, magneticStrength);

      // Calculate magnetic force for visual feedback
      magneticForce.x = (bestXSnap.x - position.x) * magneticStrength;

      // Apply snap resistance when trying to drag away from alignment
      if (distance <= 4) {
        const resistanceFactor = 1 - (distance / 4) * (1 - SNAP_RESISTANCE);
        finalX = lerp(position.x, bestXSnap.x, resistanceFactor);
      }

      // If very close, snap completely with smooth transition
      if (distance <= 2) {
        finalX = lerp(finalX, bestXSnap.x, 0.8);
        if (distance <= 1) {
          finalX = bestXSnap.x;
          snappedX = true;
        }
      }
    }
  }

  // Apply magnetic snapping for Y axis with enhanced behavior
  if (bestYSnap && bestYSnap.y !== undefined) {
    const distance = Math.abs(position.y - bestYSnap.y);

    if (distance <= SNAP_ZONE_RADIUS) {
      snapZone = true;
      const magneticStrength = getMagneticStrength(bestYSnap.guideType, BASE_MAGNETIC_STRENGTH);

      // Apply magnetic pull with smooth interpolation
      finalY = lerp(position.y, bestYSnap.y, magneticStrength);

      // Calculate magnetic force for visual feedback
      magneticForce.y = (bestYSnap.y - position.y) * magneticStrength;

      // Apply snap resistance when trying to drag away from alignment
      if (distance <= 4) {
        const resistanceFactor = 1 - (distance / 4) * (1 - SNAP_RESISTANCE);
        finalY = lerp(position.y, bestYSnap.y, resistanceFactor);
      }

      // If very close, snap completely with smooth transition
      if (distance <= 2) {
        finalY = lerp(finalY, bestYSnap.y, 0.8);
        if (distance <= 1) {
          finalY = bestYSnap.y;
          snappedY = true;
        }
      }
    }
  }

  // Constrain to canvas bounds
  finalX = Math.max(0, Math.min(finalX, 1920 - draggingElement.width));
  finalY = Math.max(0, Math.min(finalY, 1080 - draggingElement.height));

  return {
    x: finalX,
    y: finalY,
    snappedX,
    snappedY,
    magneticForce,
    snapZone,
  };
};

// Calculate velocity reduction when in snap zone
export const calculateVelocityReduction = (
  position: { x: number; y: number },
  snapPoints: SnapPoint[]
): number => {
  let inSnapZone = false;

  snapPoints.forEach(snapPoint => {
    if (snapPoint.x !== undefined) {
      const distance = Math.abs(position.x - snapPoint.x);
      if (distance <= SNAP_ZONE_RADIUS) inSnapZone = true;
    }
    if (snapPoint.y !== undefined) {
      const distance = Math.abs(position.y - snapPoint.y);
      if (distance <= SNAP_ZONE_RADIUS) inSnapZone = true;
    }
  });

  return inSnapZone ? VELOCITY_REDUCTION : 1.0;
};

// Detect active snap zones for visual feedback
export const getActiveSnapZones = (
  position: { x: number; y: number },
  snapPoints: SnapPoint[]
): { x: boolean; y: boolean; strength: number } => {
  let xZone = false;
  let yZone = false;
  let maxStrength = 0;

  snapPoints.forEach(snapPoint => {
    if (snapPoint.x !== undefined) {
      const distance = Math.abs(position.x - snapPoint.x);
      if (distance <= SNAP_ZONE_RADIUS) {
        xZone = true;
        const strength = 1 - (distance / SNAP_ZONE_RADIUS);
        maxStrength = Math.max(maxStrength, strength);
      }
    }
    if (snapPoint.y !== undefined) {
      const distance = Math.abs(position.y - snapPoint.y);
      if (distance <= SNAP_ZONE_RADIUS) {
        yZone = true;
        const strength = 1 - (distance / SNAP_ZONE_RADIUS);
        maxStrength = Math.max(maxStrength, strength);
      }
    }
  });

  return { x: xZone, y: yZone, strength: maxStrength };
};

// Main snap-to-guides function that returns snapped coordinates
export const snapToGuides = (
  mousePosition: { x: number; y: number },
  draggingElement: EditorElement,
  allElements: EditorElement[],
  canvasSize: { width: number; height: number }
): { x: number; y: number; isSnapped: boolean; snapStrength: number } => {
  // Calculate snap points
  const snapPoints = calculateSnapPoints(draggingElement, allElements, canvasSize);
  
  // Apply magnetic snapping
  const snappedPosition = applyMagneticSnapping(mousePosition, snapPoints, draggingElement);
  
  // Determine if we're in a snap zone
  const isSnapped = snappedPosition.snapZone;
  const snapStrength = isSnapped ? 
    Math.max(Math.abs(snappedPosition.magneticForce.x), Math.abs(snappedPosition.magneticForce.y)) : 0;
  
  return {
    x: snappedPosition.x,
    y: snappedPosition.y,
    isSnapped,
    snapStrength
  };
};
