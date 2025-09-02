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

const SNAP_ZONE_RADIUS = 12; // Larger radius for magnetic feel
const MAGNETIC_RELEASE_DISTANCE = 15; // Distance to release magnetic hold
const BASE_MAGNETIC_STRENGTH = 0.6; // Much stronger magnetic pull
const VELOCITY_REDUCTION = 0.7; // More noticeable velocity reduction
const SNAP_RESISTANCE = 0.8; // Strong resistance when aligned

// Linear interpolation function
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * Math.max(0, Math.min(1, factor));
};

// Calculate magnetic strength based on guide type
const getMagneticStrength = (guideType: string, baseStrength: number): number => {
  const strengthMultipliers = {
    'slide-center': 2.0, // Very strong pull for slide center
    'element-alignment': 1.5, // Strong pull for element alignment
    'spacing': 1.2, // Good pull for spacing guides
    'margin': 1.8, // Very strong pull for margins
  } as const;

  return baseStrength * (strengthMultipliers[guideType as keyof typeof strengthMultipliers] || 1.0);
};

// Validate element bounds
const isValidElement = (element: EditorElement): boolean => {
  return element && 
         typeof element.x === 'number' && 
         typeof element.y === 'number' && 
         typeof element.width === 'number' && 
         typeof element.height === 'number' &&
         element.width > 0 && 
         element.height > 0;
};

export const calculateSnapPoints = (
  draggingElement: EditorElement,
  allElements: EditorElement[],
  canvasSize: { width: number; height: number }
): SnapPoint[] => {
  if (!isValidElement(draggingElement) || !canvasSize || canvasSize.width <= 0 || canvasSize.height <= 0) {
    console.warn('Invalid dragging element or canvas size');
    return [];
  }

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
      type: 'vertical', // Fixed: horizontal lines are for vertical movement
      strength: 1.0,
      guideType: 'slide-center'
    },
    { 
      y: slideCenterY - draggingElement.height / 2, 
      type: 'horizontal', // Fixed: vertical lines are for horizontal movement
      strength: 1.0,
      guideType: 'slide-center'
    }
  );

  // Slide margin snap points
  const margins = [20, 40, 60]; // Added more margin options
  margins.forEach(margin => {
    // Left and right margins
    snapPoints.push(
      { x: margin, type: 'vertical', strength: 0.9, guideType: 'margin' },
      { x: canvasSize.width - margin - draggingElement.width, type: 'vertical', strength: 0.9, guideType: 'margin' }
    );
    
    // Top and bottom margins
    snapPoints.push(
      { y: margin, type: 'horizontal', strength: 0.9, guideType: 'margin' },
      { y: canvasSize.height - margin - draggingElement.height, type: 'horizontal', strength: 0.9, guideType: 'margin' }
    );
  });

  // Element-to-element snap points
  const validElements = allElements.filter(element => 
    element.id !== draggingElement.id && isValidElement(element)
  );

  validElements.forEach((element) => {
    const elementBounds = {
      left: element.x,
      right: element.x + element.width,
      top: element.y,
      bottom: element.y + element.height,
      centerX: element.x + element.width / 2,
      centerY: element.y + element.height / 2,
    };

    // Horizontal alignment snap points (vertical guides)
    snapPoints.push(
      { x: elementBounds.left, type: 'vertical', strength: 0.8, guideType: 'element-alignment' }, // Left edge
      { x: elementBounds.right - draggingElement.width, type: 'vertical', strength: 0.8, guideType: 'element-alignment' }, // Right edge
      { x: elementBounds.centerX - draggingElement.width / 2, type: 'vertical', strength: 0.9, guideType: 'element-alignment' } // Center
    );

    // Vertical alignment snap points (horizontal guides)
    snapPoints.push(
      { y: elementBounds.top, type: 'horizontal', strength: 0.8, guideType: 'element-alignment' }, // Top edge
      { y: elementBounds.bottom - draggingElement.height, type: 'horizontal', strength: 0.8, guideType: 'element-alignment' }, // Bottom edge
      { y: elementBounds.centerY - draggingElement.height / 2, type: 'horizontal', strength: 0.9, guideType: 'element-alignment' } // Center
    );

    // Spacing snap points with better logic
    const commonSpacing = [8, 16, 24, 32, 48]; // Common spacing values
    
    // Horizontal spacing (element to the right)
    if (elementBounds.right < draggingBounds.left) {
      commonSpacing.forEach(spacing => {
        snapPoints.push({
          x: elementBounds.right + spacing,
          type: 'vertical',
          strength: 0.7,
          guideType: 'spacing'
        });
      });
    }
    
    // Vertical spacing (element below)
    if (elementBounds.bottom < draggingBounds.top) {
      commonSpacing.forEach(spacing => {
        snapPoints.push({
          y: elementBounds.bottom + spacing,
          type: 'horizontal',
          strength: 0.7,
          guideType: 'spacing'
        });
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
  if (!isValidElement(draggingElement) || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return {
      x: position?.x || 0,
      y: position?.y || 0,
      snappedX: false,
      snappedY: false,
      magneticForce: { x: 0, y: 0 },
      snapZone: false,
    };
  }

  let snappedX = false;
  let snappedY = false;
  let finalX = position.x;
  let finalY = position.y;
  let magneticForce = { x: 0, y: 0 };
  let snapZone = false;

  // Find the strongest snap point for X axis
  const xSnapPoints = snapPoints.filter(p => p.x !== undefined && typeof p.x === 'number');
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
  const ySnapPoints = snapPoints.filter(p => p.y !== undefined && typeof p.y === 'number');
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

  // Apply magnetic snapping for X axis
  if (bestXSnap && bestXSnap.x !== undefined) {
    const distance = Math.abs(position.x - bestXSnap.x);

    if (distance <= SNAP_ZONE_RADIUS) {
      snapZone = true;
      const magneticStrength = getMagneticStrength(bestXSnap.guideType, BASE_MAGNETIC_STRENGTH);
      
      // Progressive magnetic pull based on distance
      const pullFactor = 1 - (distance / SNAP_ZONE_RADIUS);
      const adjustedStrength = magneticStrength * pullFactor;
      
      finalX = lerp(position.x, bestXSnap.x, adjustedStrength);
      magneticForce.x = (bestXSnap.x - position.x) * adjustedStrength;

      // Snap completely when very close
      if (distance <= 2) {
        finalX = bestXSnap.x;
        snappedX = true;
      }
    }
  }

  // Apply magnetic snapping for Y axis
  if (bestYSnap && bestYSnap.y !== undefined) {
    const distance = Math.abs(position.y - bestYSnap.y);

    if (distance <= SNAP_ZONE_RADIUS) {
      snapZone = true;
      const magneticStrength = getMagneticStrength(bestYSnap.guideType, BASE_MAGNETIC_STRENGTH);
      
      // Progressive magnetic pull based on distance
      const pullFactor = 1 - (distance / SNAP_ZONE_RADIUS);
      const adjustedStrength = magneticStrength * pullFactor;
      
      finalY = lerp(position.y, bestYSnap.y, adjustedStrength);
      magneticForce.y = (bestYSnap.y - position.y) * adjustedStrength;

      // Snap completely when very close
      if (distance <= 2) {
        finalY = bestYSnap.y;
        snappedY = true;
      }
    }
  }

  // Constrain to canvas bounds with proper validation
  const canvasWidth = 1920; // Consider making this configurable
  const canvasHeight = 1080; // Consider making this configurable
  
  finalX = Math.max(0, Math.min(finalX, canvasWidth - draggingElement.width));
  finalY = Math.max(0, Math.min(finalY, canvasHeight - draggingElement.height));

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
  if (!position || !Array.isArray(snapPoints)) {
    return 1.0;
  }

  let inSnapZone = false;
  let maxStrength = 0;

  snapPoints.forEach(snapPoint => {
    if (snapPoint.x !== undefined && typeof snapPoint.x === 'number') {
      const distance = Math.abs(position.x - snapPoint.x);
      if (distance <= SNAP_ZONE_RADIUS) {
        inSnapZone = true;
        maxStrength = Math.max(maxStrength, snapPoint.strength);
      }
    }
    if (snapPoint.y !== undefined && typeof snapPoint.y === 'number') {
      const distance = Math.abs(position.y - snapPoint.y);
      if (distance <= SNAP_ZONE_RADIUS) {
        inSnapZone = true;
        maxStrength = Math.max(maxStrength, snapPoint.strength);
      }
    }
  });

  // Apply stronger velocity reduction for stronger snap points
  return inSnapZone ? VELOCITY_REDUCTION * (1 - maxStrength * 0.2) : 1.0;
};

// Detect active snap zones for visual feedback
export const getActiveSnapZones = (
  position: { x: number; y: number },
  snapPoints: SnapPoint[]
): { x: boolean; y: boolean; strength: number } => {
  if (!position || !Array.isArray(snapPoints)) {
    return { x: false, y: false, strength: 0 };
  }

  let xZone = false;
  let yZone = false;
  let maxStrength = 0;

  snapPoints.forEach(snapPoint => {
    if (snapPoint.x !== undefined && typeof snapPoint.x === 'number') {
      const distance = Math.abs(position.x - snapPoint.x);
      if (distance <= SNAP_ZONE_RADIUS) {
        xZone = true;
        const strength = (1 - (distance / SNAP_ZONE_RADIUS)) * snapPoint.strength;
        maxStrength = Math.max(maxStrength, strength);
      }
    }
    if (snapPoint.y !== undefined && typeof snapPoint.y === 'number') {
      const distance = Math.abs(position.y - snapPoint.y);
      if (distance <= SNAP_ZONE_RADIUS) {
        yZone = true;
        const strength = (1 - (distance / SNAP_ZONE_RADIUS)) * snapPoint.strength;
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
  // Input validation
  if (!mousePosition || !isValidElement(draggingElement) || !canvasSize) {
    return {
      x: mousePosition?.x || 0,
      y: mousePosition?.y || 0,
      isSnapped: false,
      snapStrength: 0
    };
  }

  try {
    // Calculate snap points
    const snapPoints = calculateSnapPoints(draggingElement, allElements || [], canvasSize);
    
    // Apply magnetic snapping
    const snappedPosition = applyMagneticSnapping(mousePosition, snapPoints, draggingElement);
    
    // Determine if we're in a snap zone and calculate strength
    const isSnapped = snappedPosition.snapZone;
    const snapStrength = isSnapped ? 
      Math.max(Math.abs(snappedPosition.magneticForce.x), Math.abs(snappedPosition.magneticForce.y)) : 0;
    
    return {
      x: snappedPosition.x,
      y: snappedPosition.y,
      isSnapped,
      snapStrength
    };
  } catch (error) {
    console.error('Error in snapToGuides:', error);
    return {
      x: mousePosition.x,
      y: mousePosition.y,
      isSnapped: false,
      snapStrength: 0
    };
  }
};
