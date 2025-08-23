'use client';
import * as React from 'react';
import { db } from '@/app/firebase/config';
import { useAuth } from './AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function InvitePanel({ docId, onDone }: { docId: string; onDone?: () => void }) {
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'editor' | 'viewer'>('editor');
  const [sending, setSending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const { user } = useAuth();

  const invite = async () => {
    if (!email) return;
    setSending(true);
    setMessage(null);
    try {
      if (!user) {
        setMessage('Please login first.');
        return;
      }
      if (!docId || docId === 'new') {
        setMessage('Please save the document first to generate an invite link.');
        return;
      }
      const docRef = await addDoc(collection(db, 'invites'), {
        docId,
        email: email.toLowerCase(),
        role,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: user.id,
        createdByEmail: user.email,
      });

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || '';
      const acceptUrl = `${baseUrl}/invite/accept?inviteId=${docRef.id}`;
      // Fire-and-forget email send; show message on failure but do not block
      try {
        const res = await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteId: docRef.id, toEmail: email.toLowerCase(), acceptUrl }),
        });
        const json = await res.json();
        if (!json.ok) {
          setMessage('Invite saved. Email not configured (set RESEND_API_KEY or SMTP_*). Copy link: ' + acceptUrl);
        } else {
          if (json.previewUrl) {
            setMessage('Invite sent (dev preview). Open: ' + json.previewUrl);
          } else {
            setMessage('Invite emailed successfully.');
          }
        }
      } catch (e) {
        setMessage('Invite saved. Email send failed. Copy link: ' + acceptUrl);
      }
      setEmail('');
      if (onDone) onDone();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to create invite');
    } finally {
      setSending(false);
    }
  };

  const generateLink = async () => {
    setMessage(null);
    try {
      if (!user) {
        setMessage('Please login first.');
        return;
      }
      if (!docId || docId === 'new') {
        setMessage('Please save the document first to generate an invite link.');
        return;
      }
      const docRef = await addDoc(collection(db, 'invites'), {
        docId,
        email: (email || 'link-only').toLowerCase(),
        role,
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: user.id,
        createdByEmail: user.email,
      });
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || '';
      const acceptUrl = `${baseUrl}/invite/accept?inviteId=${docRef.id}`;
      await navigator.clipboard.writeText(acceptUrl);
      setMessage('Invite link copied to clipboard. Share it: ' + acceptUrl);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to generate link');
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-900 dark:text-white">Invite collaborators</div>
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="person@example.com"
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
          className="px-2 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          onClick={invite}
          disabled={sending || !email}
          className="px-3 py-2 bg-purple-600 text-white rounded text-sm disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Invite'}
        </button>
        {/* Removed Get Link button per request */}
      </div>
      {message && <div className="text-xs text-gray-600 dark:text-gray-300">{message}</div>}
    </div>
  );
}

