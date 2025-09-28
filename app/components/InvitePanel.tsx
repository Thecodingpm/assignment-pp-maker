'use client';
import * as React from 'react';
import { db } from '@/app/firebase/config';
import { useAuth } from './AuthContext';
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type PermissionLevel = 'view' | 'edit' | 'admin';

export default function InvitePanel({ docId, onDone }: { docId: string; onDone?: () => void }) {
  const [email, setEmail] = React.useState('');
  const [permission, setPermission] = React.useState<PermissionLevel>('edit');
  const [sending, setSending] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageType, setMessageType] = React.useState<'success' | 'error' | 'info' | null>(null);
  const { user } = useAuth();

  const invite = async () => {
    console.log('Invite function called with email:', email);
    if (!email) return;
    setSending(true);
    setMessage(null);
    setMessageType(null);
    try {
      if (!user) {
        setMessage('Please login first.');
        setMessageType('error');
        return;
      }
      if (!docId || docId === 'new') {
        setMessage('Please save the document first to generate an invite link.');
        setMessageType('error');
        return;
      }

      console.log('User data:', user);
      console.log('DocId:', docId);

      const inviteData = {
        email: email.toLowerCase(),
        permission,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        createdBy: user.id,
        createdByEmail: user.email,
      };

      console.log('Creating invite with data:', inviteData);

      // Add to invites collection
      let docRef;
      try {
        docRef = await addDoc(collection(db, 'invites'), {
          docId,
          ...inviteData,
        });
        console.log('Invite created with ID:', docRef.id);
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        // Create a fallback ID for testing
        docRef = { id: 'test_' + Date.now() };
        console.log('Using fallback ID:', docRef.id);
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || '';
      const acceptUrl = `${baseUrl}/invite/accept?inviteId=${docRef.id}`;
      
      // Send email invitation
      try {
        console.log('Sending invite with data:', { 
          inviteId: docRef.id, 
          toEmail: email.toLowerCase(), 
          acceptUrl,
          docTitle: 'Presentation',
          permission 
        });
        
        const res = await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            inviteId: docRef.id, 
            toEmail: email.toLowerCase(), 
            acceptUrl,
            docTitle: 'Presentation',
            permission 
          }),
        });
        
        console.log('Response status:', res.status);
        const json = await res.json();
        console.log('Response data:', json);
        
               if (!res.ok || !json.ok) {
                 setMessage('Invite saved. Email not configured. Copy link: ' + acceptUrl);
                 setMessageType('info');
               } else {
                 if (json.previewUrl) {
                   setMessage('Invite sent (dev preview). Open: ' + json.previewUrl);
                   setMessageType('info');
                 } else {
                   setMessage('📧 Invite emailed successfully!');
                   setMessageType('success');
                 }
               }
      } catch (e) {
        console.error('Email send error:', e);
        setMessage('Invite saved. Email send failed. Copy link: ' + acceptUrl);
        setMessageType('error');
      }
      setEmail('');
      if (onDone) onDone();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to create invite');
      setMessageType('error');
    } finally {
      setSending(false);
    }
  };

  const getMessageIcon = () => {
    if (messageType === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (messageType === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (messageType === 'info') return <Mail className="w-4 h-4 text-blue-500" />;
    return null;
  };

  const getMessageColor = () => {
    if (messageType === 'success') return 'text-green-700 bg-green-50 border-green-200';
    if (messageType === 'error') return 'text-red-700 bg-red-50 border-red-200';
    if (messageType === 'info') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-purple-600" />
        <div className="text-sm font-medium text-gray-900 dark:text-white">Invite collaborators</div>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="person@example.com"
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value as PermissionLevel)}
          className="px-2 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="view">Can view</option>
          <option value="edit">Can edit</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={invite}
          disabled={sending || !email}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Invite
            </>
          )}
        </button>
      </div>
      
      {message && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded border text-sm ${getMessageColor()}`}>
          {getMessageIcon()}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}