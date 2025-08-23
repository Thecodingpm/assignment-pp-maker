'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config';
import { auth } from '@/app/firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('inviteId') || '';
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'accepted' | 'invalid' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      // Enforce login before accepting
      if (!auth.currentUser) {
        const url = new URL(window.location.href);
        window.location.href = `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
        return;
      }
      if (!inviteId) {
        setStatus('invalid');
        setMessage('Missing invite ID');
        return;
      }
      try {
        const ref = doc(db, 'invites', inviteId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setStatus('invalid');
          setMessage('Invite not found');
          return;
        }
        const data = snap.data() as any;
        if (data.status === 'accepted') {
          setStatus('accepted');
          router.replace(`/assignment-editor/editor?id=${data.docId}&collaborate=true`);
          return;
        }
        await updateDoc(ref, { status: 'accepted', acceptedAt: serverTimestamp() });
        setStatus('accepted');
        router.replace(`/assignment-editor/editor?id=${data.docId}&collaborate=true`);
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'Failed to accept invite');
      }
    };
    run();
  }, [inviteId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <p>Accepting invite…</p>}
      {status === 'invalid' && <p>Invalid invite. {message}</p>}
      {status === 'error' && <p>Something went wrong. {message}</p>}
    </div>
  );
}

