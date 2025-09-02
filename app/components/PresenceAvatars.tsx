'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { subscribeToUserPresence } from '../firebase/collaboration';

type PresenceUser = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isActive?: boolean;
  isTyping?: boolean;
};

function PresenceAvatars() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = subscribeToUserPresence(sessionId, (presence) => {
      // Sort by lastSeen (server already orders desc)
      const mapped = presence.map((p: any) => ({
        id: p.id,
        userId: p.userId,
        userName: p.userName || 'Guest',
        userAvatar: p.userAvatar,
        isActive: !!p.isActive,
        isTyping: !!p.isTyping,
      }));
      setUsers(mapped);
    });
    return () => { try { unsubscribe(); } catch {} };
  }, [sessionId]);

  if (!sessionId || users.length === 0) return null;

  const visible = users.slice(0, 5);
  const overflow = users.length - visible.length;

  return (
    <div className="hidden md:flex items-center -space-x-2">
      {visible.map((u) => (
        <div
          key={u.id}
          title={`${u.userName}${u.isTyping ? ' • typing…' : ''}`}
          className={`w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200 ${u.isActive ? 'outline outline-2 outline-green-500/70' : ''}`}
        >
          {u.userAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.userAvatar} alt={u.userName} className="w-full h-full object-cover" />
          ) : (
            <span>{(u.userName || 'U').charAt(0).toUpperCase()}</span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center justify-center">+{overflow}</div>
      )}
    </div>
  );
}

// Wrapper component to handle useSearchParams safely
function PresenceAvatarsWithSearchParams() {
  return (
    <Suspense fallback={null}>
      <PresenceAvatars />
    </Suspense>
  );
}

export default PresenceAvatarsWithSearchParams;

