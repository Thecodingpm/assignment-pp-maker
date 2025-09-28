'use client';

import React, { useEffect, useState } from 'react';
import { useCollaboration } from '../../contexts/CollaborationContext';

interface CursorIndicatorProps {
  containerRef: React.RefObject<HTMLElement>;
  zoom?: number;
}

export default function CursorIndicator({ containerRef, zoom = 1 }: CursorIndicatorProps) {
  const { state } = useCollaboration();
  const [cursors, setCursors] = useState<Array<{
    id: string;
    x: number;
    y: number;
    name: string;
    color: string;
  }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateCursors = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newCursors = Object.entries(state.cursorPositions).map(([userId, cursor]) => ({
        id: userId,
        x: (cursor.x * zoom) + containerRect.left,
        y: (cursor.y * zoom) + containerRect.top,
        name: cursor.name,
        color: cursor.color,
      }));

      setCursors(newCursors);
    };

    updateCursors();

    // Update cursors on scroll and resize
    const handleUpdate = () => {
      requestAnimationFrame(updateCursors);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [state.cursorPositions, containerRef, zoom]);

  if (cursors.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute transition-all duration-100 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor pointer */}
          <div
            className="w-4 h-4 relative"
            style={{ color: cursor.color }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="drop-shadow-sm"
            >
              <path d="M2.5 2.5L13.5 8L9.5 9.5L8 13.5L2.5 2.5Z" />
            </svg>
          </div>
          
          {/* User name label */}
          <div
            className="absolute top-5 left-1 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}

