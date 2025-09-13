'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import CursorTracker from './CursorTracker';
import { 
  createCollaborationSession, 
  joinCollaborationSession, 
  leaveCollaborationSession, 
  updateUserPresence,
  subscribeToCollaborationSession,
  subscribeToUserPresence,
  endCollaborationSession,
  getActiveCollaborationSession,
  updateUserPermission,
  updateSessionSettings,
  type Collaborator
} from '../firebase/collaboration';

interface CollaborationPluginProps {
  documentId?: string;
  onCollaborationStateChange?: (isCollaborating: boolean) => void;
  inline?: boolean; // render inside dropdown instead of fixed panel
  showJoin?: boolean; // when false, hide "Join Existing Session" UI
}

export default function CollaborationPlugin({ 
  documentId, 
  onCollaborationStateChange,
  inline = false,
  showJoin = true,
}: CollaborationPluginProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [shareLink, setShareLink] = useState('');
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [requestedPermission, setRequestedPermission] = useState<'view' | 'edit'>('view');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({
    allowViewers: true,
    allowEditing: true,
    requireApproval: false
  });

  // Use number for browser timers to avoid Node/DOM mismatch
  const presenceIntervalRef = useRef<number | null>(null);
  const cursorUpdateIntervalRef = useRef<number | null>(null);
  const cursorCleanupRef = useRef<(() => void) | null>(null);

  // Check if there's an active session for this document
  useEffect(() => {
    if (documentId && user) {
      checkActiveSession();
    }
  }, [documentId, user]);

  const checkActiveSession = async () => {
    try {
      const activeSession = await getActiveCollaborationSession(documentId!);
      if (activeSession) {
        setSessionId(activeSession.sessionId);
        try { localStorage.setItem('collab_session_id', activeSession.sessionId); } catch {}
        setCollaborators(activeSession.collaborators);
        setIsCollaborating(true);
      setShareLink(`${window.location.origin}/presentation-editor?session=${activeSession.sessionId}&collaborate=true&collab=lite`);
        onCollaborationStateChange?.(true);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const startCollaboration = async () => {
    if (!documentId || !user) {
      setError('Please save the document first and ensure you are logged in.');
      return;
    }
    
    try {
      setError('');
      setIsJoining(true);
      
      const newSessionId = await createCollaborationSession(
        documentId,
        user.id,
        user.name || 'Anonymous',
        user.email || 'anonymous@example.com',
        '👤',
        sessionSettings
      );
      
      setSessionId(newSessionId);
      try { localStorage.setItem('collab_session_id', newSessionId); } catch {}
      setIsCollaborating(true);
      const link = `${window.location.origin}/presentation-editor?session=${newSessionId}&collaborate=true&collab=lite`;
      setShareLink(link);
      try { await navigator.clipboard.writeText(link); setSuccess('Link copied to clipboard'); } catch {}
      // Navigate this tab into the session so the current user also joins the room
      router.replace(link);
      setSuccess('Collaboration session started successfully!');
      onCollaborationStateChange?.(true);
      
      // Subscribe to session changes
      subscribeToCollaborationSession(newSessionId, (session) => {
        if (session) {
          setCollaborators(session.collaborators);
          setSessionSettings(session.settings);
        }
      });
      
      // Start presence updates
      startPresenceUpdates(newSessionId);
      
    } catch (error: any) {
      setError(`Failed to start collaboration: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const joinExistingSession = async () => {
    if (!joinSessionId.trim() || !user) {
      setError('Please enter a valid session ID and ensure you are logged in.');
      return;
    }
    
    try {
      setError('');
      setIsJoining(true);
      
      const result = await joinCollaborationSession(
        joinSessionId.trim(),
        user.id,
        user.name || 'Anonymous',
        user.email || 'anonymous@example.com',
        '👤',
        requestedPermission
      );
      
      if (!result.success) {
        setError(result.message);
        return;
      }
      
      setSessionId(joinSessionId.trim());
      try { localStorage.setItem('collab_session_id', joinSessionId.trim()); } catch {}
      setIsCollaborating(true);
      const link = `${window.location.origin}/presentation-editor?session=${joinSessionId.trim()}&collaborate=true&collab=lite`;
      setShareLink(link);
      try { await navigator.clipboard.writeText(link); setSuccess('Link copied to clipboard'); } catch {}
      router.replace(link);
      setSuccess(`Successfully joined collaboration session with ${result.permission} permission!`);
      onCollaborationStateChange?.(true);
      
      // Subscribe to session changes
      subscribeToCollaborationSession(joinSessionId.trim(), (session) => {
        if (session) {
          setCollaborators(session.collaborators);
          setSessionSettings(session.settings);
        }
      });
      
      // Start presence updates
      startPresenceUpdates(joinSessionId.trim());
      
    } catch (error: any) {
      setError(`Failed to join session: ${error.message}`);
    } finally {
      setIsJoining(false);
      setJoinSessionId('');
    }
  };

  const stopCollaboration = async () => {
    if (!sessionId) return;
    
    try {
      await leaveCollaborationSession(sessionId, user?.id || '');
      setIsCollaborating(false);
      setSessionId('');
      try { localStorage.removeItem('collab_session_id'); } catch {}
      setCollaborators([]);
      setShareLink('');
      setSuccess('Left collaboration session successfully.');
      onCollaborationStateChange?.(false);
      
      // Stop presence updates
      stopPresenceUpdates();
      
    } catch (error: any) {
      setError(`Failed to leave session: ${error.message}`);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      await endCollaborationSession(sessionId);
      setIsCollaborating(false);
      setSessionId('');
      try { localStorage.removeItem('collab_session_id'); } catch {}
      setCollaborators([]);
      setShareLink('');
      setSuccess('Collaboration session ended successfully.');
      onCollaborationStateChange?.(false);
      
      // Stop presence updates
      stopPresenceUpdates();
      
    } catch (error: any) {
      setError(`Failed to end session: ${error.message}`);
    }
  };

  const startPresenceUpdates = (sessionId: string) => {
    // Update presence every 30 seconds
    presenceIntervalRef.current = window.setInterval(() => {
      if (user) {
        updateUserPresence(sessionId, user.id);
      }
    }, 30000);
    
    // Update cursor position on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (user && sessionId) {
        updateUserPresence(sessionId, user.id, { x: e.clientX, y: e.clientY });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    // Dummy interval to keep a lightweight heartbeat if needed later
    cursorUpdateIntervalRef.current = window.setInterval(() => {}, 1000);
    // Store explicit cleanup function instead of attaching to the timer id
    cursorCleanupRef.current = () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  };

  const stopPresenceUpdates = () => {
    if (presenceIntervalRef.current !== null) {
      window.clearInterval(presenceIntervalRef.current);
      presenceIntervalRef.current = null;
    }
    if (cursorUpdateIntervalRef.current !== null) {
      window.clearInterval(cursorUpdateIntervalRef.current);
      cursorUpdateIntervalRef.current = null;
    }
    if (cursorCleanupRef.current) {
      try { cursorCleanupRef.current(); } catch {}
      cursorCleanupRef.current = null;
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setSuccess('Share link copied to clipboard!');
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setSuccess('Session ID copied to clipboard!');
  };

  const updateUserPermissionHandler = async (targetUserId: string, newPermission: 'view' | 'edit' | 'admin') => {
    try {
      await updateUserPermission(sessionId, targetUserId, newPermission, user?.id || '');
      setSuccess(`Updated ${collaborators.find(c => c.userId === targetUserId)?.userName}'s permission to ${newPermission}`);
    } catch (error: any) {
      setError(`Failed to update permission: ${error.message}`);
    }
  };

  const updateSettingsHandler = async (newSettings: Partial<typeof sessionSettings>) => {
    try {
      await updateSessionSettings(sessionId, newSettings, user?.id || '');
      setSessionSettings(prev => ({ ...prev, ...newSettings }));
      setSuccess('Session settings updated successfully!');
    } catch (error: any) {
      setError(`Failed to update settings: ${error.message}`);
    }
  };

  const currentUserPermission = collaborators.find(c => c.userId === user?.id)?.permission || 'view';
  const isAdmin = currentUserPermission === 'admin';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPresenceUpdates();
    };
  }, []);

  // Auto-hide success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // If not inline, hide until opened or collaborating
  if (!inline && !showCollaborationPanel && !isCollaborating) {
    return null;
  }

  return (
    <>
      {/* Cursor Tracker for real-time cursor sharing */}
      {!inline && isCollaborating && sessionId && (
        <CursorTracker sessionId={sessionId} />
      )}
      
      <div className={
        inline
          ? 'w-96 max-w-[24rem] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 max-h-[70vh] overflow-y-auto'
          : 'fixed top-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-50 max-h-[80vh] overflow-y-auto'
      }>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Collaboration</h3>
          {!inline && (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('closeCollaboration'));
                if (!isCollaborating) {
                  setError('');
                  setSuccess('');
                }
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <p className="text-xs text-green-700 dark:text-green-400">{success}</p>
          </div>
        )}

        {!isCollaborating ? (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start New Session</h4>
              <button
                onClick={startCollaboration}
                disabled={isJoining || !documentId || !user}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Starting...' : 'Start Collaboration Session'}
              </button>
            </div>
            {/* Removed share/join UI for a cleaner panel; access via invite + session start */}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Session Info</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">Session ID:</p>
                <div className="flex items-center space-x-2">
                  <code className="text-[10px] bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded flex-1 font-mono">
                    {sessionId}
                  </code>
                  <button onClick={copySessionId} className="text-blue-600 hover:text-blue-700 text-[10px]">Copy</button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Share Link</h4>
              <div className="flex">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                />
                <button onClick={copyShareLink} className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 text-xs">Copy</button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Active Collaborators ({collaborators.length})</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center space-x-2 text-[11px]">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px]">
                      {collaborator.userAvatar}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 flex-1">{collaborator.userName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button onClick={stopCollaboration} className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium">Leave</button>
              {isAdmin && (
                <button onClick={endSession} className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium">End</button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}