'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserPresence, updateUserPresence } from '../firebase/collaboration';

interface CursorTrackerProps {
  sessionId: string;
}

interface CursorPosition {
  userId: string;
  userName: string;
  userAvatar: string;
  x: number;
  y: number;
  timestamp: Date;
  isTyping?: boolean;
}

function isUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function CursorTracker({ sessionId }: CursorTrackerProps) {
  const { user } = useAuth();
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isActive, setIsActive] = useState(false);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!sessionId || !user) return;

    // Subscribe to user presence changes
    const unsubscribe = subscribeToUserPresence(sessionId, (presence) => {
      const otherUsers = presence.filter((p) => p.userId !== user.id);
      const cursorPositions: CursorPosition[] = otherUsers
        .filter((p) => p.cursorPosition && p.isActive)
        .map((p) => ({
          userId: p.userId,
          userName: p.userName,
          userAvatar: p.userAvatar,
          x: p.cursorPosition.x,
          y: p.cursorPosition.y,
          timestamp: p.lastSeen,
          isTyping: p.isTyping,
        }))
        .filter((cursor) => {
          // Only show cursors that are less than 5 seconds old
          const now = new Date();
          const cursorTime = new Date(cursor.timestamp);
          return now.getTime() - cursorTime.getTime() < 5000;
        });

      setCursors(cursorPositions);
    });

    // Track mouse movement for this user (to update own presence position)
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;

      // Debounce mouse movement updates
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }

      mouseMoveTimeoutRef.current = setTimeout(() => {
        updateUserPresence(sessionId, user.id, { x: e.clientX, y: e.clientY });
      }, 100);
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      unsubscribe();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [sessionId, user]);

  if (cursors.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        >
          <div className="relative flex items-center gap-1">
            {/* Cursor pointer */}
            <svg className="w-4 h-4 transform rotate-45 text-gray-800 dark:text-gray-200 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M0 0L8 8L6 10L0 4V0Z" />
            </svg>

            {/* Avatar bubble next to cursor, like Figma */}
            <div className="ml-2">{/* slight offset from pointer */}
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-900 shadow-md overflow-hidden bg-purple-500 text-white flex items-center justify-center">
                    {isUrl(cursor.userAvatar) ? (
                      // Remote avatar image
                      <img src={cursor.userAvatar} alt={cursor.userName} className="w-full h-full object-cover" />
                    ) : (
                      // Emoji or initial fallback
                      <span className="text-sm leading-none">
                        {cursor.userAvatar?.trim() || cursor.userName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Typing indicator dot */}
                  {cursor.isTyping && (
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 animate-pulse" />
                  )}
                </div>

                {/* Name chip (subtle) */}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 shadow">
                  {cursor.userName}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 