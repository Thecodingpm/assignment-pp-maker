'use client';

import React, { useCallback, useState } from 'react';
import { EditorElement } from '../../types/editor';
import { useEditorStore } from '../../stores/useEditorStore';

interface ResizeHandlesProps {
  element: EditorElement;
  onResize: (newWidth: number, newHeight: number, newX?: number, newY?: number) => void;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ element, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [lastResizeTime, setLastResizeTime] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get canvas for proper coordinate calculation
    const canvas = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const zoom = useEditorStore.getState().zoom;
    
    // Store canvas coordinates
    const canvasX = (e.clientX - canvasRect.left) / zoom;
    const canvasY = (e.clientY - canvasRect.top) / zoom;
    
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: canvasX,
      y: canvasY,
      width: element.width,
      height: element.height,
    });
  }, [element.width, element.height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;
    
    // Throttle resize updates for smoother performance
    const now = Date.now();
    if (now - lastResizeTime < 16) { // ~60fps max
      return;
    }
    setLastResizeTime(now);
    
    // Get canvas for proper coordinate calculation
    const canvas = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const zoom = useEditorStore.getState().zoom;
    
    // Calculate current mouse position in canvas coordinates
    const currentCanvasX = (e.clientX - canvasRect.left) / zoom;
    const currentCanvasY = (e.clientY - canvasRect.top) / zoom;
    
    // Calculate deltas from start position with reduced sensitivity
    const deltaX = (currentCanvasX - resizeStart.x) * 0.5; // Reduce sensitivity by half
    const deltaY = (currentCanvasY - resizeStart.y) * 0.5; // Reduce sensitivity by half
    
    // Add minimum threshold to prevent tiny movements from causing large changes
    const minDeltaThreshold = 2; // Minimum pixels to trigger resize
    if (Math.abs(deltaX) < minDeltaThreshold && Math.abs(deltaY) < minDeltaThreshold) {
      return; // Don't resize for tiny movements
    }
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    let newX = element.x;
    let newY = element.y;
    
    switch (resizeHandle) {
      case 'top-left':
        newWidth = Math.max(50, resizeStart.width - deltaX);
        newHeight = Math.max(30, resizeStart.height - deltaY);
        // No position change - just resize
        break;
      case 'top-center':
        newHeight = Math.max(30, resizeStart.height - deltaY);
        // No position change - just resize
        break;
      case 'top-right':
        newWidth = Math.max(50, resizeStart.width + deltaX);
        newHeight = Math.max(30, resizeStart.height - deltaY);
        // No position change - just resize
        break;
      case 'middle-left':
        newWidth = Math.max(50, resizeStart.width - deltaX);
        // No position change - just resize
        break;
      case 'middle-right':
        newWidth = Math.max(50, resizeStart.width + deltaX);
        break;
      case 'bottom-left':
        newWidth = Math.max(50, resizeStart.width - deltaX);
        newHeight = Math.max(30, resizeStart.height + deltaY);
        // No position change - just resize
        break;
      case 'bottom-center':
        newHeight = Math.max(30, resizeStart.height + deltaY);
        break;
      case 'bottom-right':
        newWidth = Math.max(50, resizeStart.width + deltaX);
        newHeight = Math.max(30, resizeStart.height + deltaY);
        break;
    }
    
    onResize(newWidth, newHeight);
  }, [isResizing, resizeHandle, resizeStart, element.x, element.y, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Add/remove mouse event listeners
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleSize = 16; // Width
  const handleHeight = 10; // Height
  const handleOffsetX = handleSize / 2;
  const handleOffsetY = handleHeight / 2;

  const handles = [
    { position: 'top-left', x: -handleOffsetX, y: -handleOffsetY, cursor: 'nw-resize' },
    { position: 'top-center', x: element.width / 2 - handleOffsetX, y: -handleOffsetY, cursor: 'n-resize' },
    { position: 'top-right', x: element.width - handleOffsetX, y: -handleOffsetY, cursor: 'ne-resize' },
    { position: 'middle-left', x: -handleOffsetX, y: element.height / 2 - handleOffsetY, cursor: 'w-resize' },
    { position: 'middle-right', x: element.width - handleOffsetX, y: element.height / 2 - handleOffsetY, cursor: 'e-resize' },
    { position: 'bottom-left', x: -handleOffsetX, y: element.height - handleOffsetY, cursor: 'sw-resize' },
    { position: 'bottom-center', x: element.width / 2 - handleOffsetX, y: element.height - handleOffsetY, cursor: 's-resize' },
    { position: 'bottom-right', x: element.width - handleOffsetX, y: element.height - handleOffsetY, cursor: 'se-resize' },
  ];

  return (
    <>
      {handles.map(({ position, x, y, cursor }) => (
        <div
          key={position}
          className="absolute bg-white border border-blue-300 rounded-full shadow-sm"
          style={{
            left: x,
            top: y,
            width: handleSize,
            height: handleHeight,
            cursor,
            zIndex: 1000,
          }}
          onMouseDown={(e) => handleMouseDown(e, position)}
        />
      ))}
    </>
  );
};

export default ResizeHandles;
