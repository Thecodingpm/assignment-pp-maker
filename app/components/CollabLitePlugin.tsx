'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { subscribeToDocumentContent, syncDocumentContent } from '@/app/firebase/collaboration';

export default function CollabLitePlugin({ sessionId }: { sessionId: string }) {
  const [editor] = useLexicalComposerContext();
  const lastPushedHtmlRef = useRef<string>('');
  const pushTimerRef = useRef<number | null>(null);
  const applyingRemoteRef = useRef<boolean>(false);
  const clientId = useMemo(() => `${Math.random().toString(36).slice(2)}-${Date.now()}`, []);

  // Push local edits to Firestore
  useEffect(() => {
    if (!sessionId) return;
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      if (applyingRemoteRef.current) return; // avoid echo loop
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        // Skip if identical or if selection is composing to avoid text loss during IME/composition
        if (html === lastPushedHtmlRef.current) return;
        lastPushedHtmlRef.current = html;
        if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
        pushTimerRef.current = window.setTimeout(() => {
          syncDocumentContent(sessionId, html, clientId);
        }, 200);
      });
    });
    return unregister;
  }, [editor, sessionId]);

  // Apply remote content
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = subscribeToDocumentContent(sessionId, (content, lastUpdatedBy) => {
      if (!content) return;
      if (lastUpdatedBy === clientId) return; // ignore our own updates
      // If identical to last pushed, ignore
      if (content === lastPushedHtmlRef.current) return;
      applyingRemoteRef.current = true;
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
      // release after microtask
      queueMicrotask(() => { applyingRemoteRef.current = false; });
    });
    return unsubscribe;
  }, [editor, sessionId, clientId]);

  return null;
}

