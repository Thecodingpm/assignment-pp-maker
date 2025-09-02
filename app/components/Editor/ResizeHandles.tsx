'use client';

import React, { useCallback, useState } from 'react';
import { EditorElement } from '../../types/editor';
import { useEditorStore } from '../../stores/useEditorStore';

interface ResizeHandlesProps {
  element: EditorElement;
  onResize: (newWidth: number, newHeight: number) => void;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ element, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

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
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    
    switch (resizeHandle) {
      case 'top-left':
        newWidth = Math.max(50, resizeStart.width - deltaX);
        newHeight = Math.max(30, resizeStart.height - deltaY);
        break;
      case 'top-center':
        newHeight = Math.max(30, resizeStart.height - deltaY);
        break;
      case 'top-right':
        newWidth = Math.max(50, resizeStart.width + deltaX);
        newHeight = Math.max(30, resizeStart.height - deltaY);
        break;
      case 'middle-left':
        newWidth = Math.max(50, resizeStart.width - deltaX);
        break;
      case 'middle-right':
        newWidth = Math.max(50, resizeStart.width + deltaX);
        break;
      case 'bottom-left':
        newWidth = Math.max(50, resizeStart.width - deltaX);
        newHeight = Math.max(30, resizeStart.height + deltaY);
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
  }, [isResizing, resizeHandle, resizeStart, onResize]);

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
          className="absolute bg-white border border-gray-400 rounded-full shadow-sm"
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
