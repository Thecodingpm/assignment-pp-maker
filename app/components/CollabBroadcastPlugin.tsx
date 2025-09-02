'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

export default function CollabBroadcastPlugin({ sessionId }: { sessionId: string }) {
  const [editor] = useLexicalComposerContext();
  const applyingRemoteRef = useRef<boolean>(false);
  const channel = useMemo(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
    return new BroadcastChannel(`lexical-collab-${sessionId}`);
  }, [sessionId]);

  const clientId = useMemo(() => `${Math.random().toString(36).slice(2)}-${Date.now()}`, []);

  useEffect(() => {
    if (!channel) return;
    const onMessage = (e: MessageEvent) => {
      const msg = e.data as { origin: string; html: string };
      if (!msg || msg.origin === clientId || !msg.html) return;
      applyingRemoteRef.current = true;
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(msg.html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
      queueMicrotask(() => { applyingRemoteRef.current = false; });
    };
    channel.addEventListener('message', onMessage as any);
    return () => channel.removeEventListener('message', onMessage as any);
  }, [channel, editor, clientId]);

  useEffect(() => {
    if (!channel) return;
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      if (applyingRemoteRef.current) return; // avoid echo
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        channel.postMessage({ origin: clientId, html });
      });
    });
    return unregister;
  }, [channel, editor, clientId]);

  return null;
}

