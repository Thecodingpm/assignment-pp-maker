'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';

interface FontSizePluginProps {
  fontSize?: string;
}

export function FontSizePlugin({ fontSize }: FontSizePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!fontSize) return;

    // Simple listener to apply font size when editor updates
    const unregisterUpdateListener = editor.registerUpdateListener(() => {
      // This plugin is now simplified to prevent crashes
      // The actual font size application is handled by the TopToolbar
    });

    return () => {
      unregisterUpdateListener();
    };
  }, [editor, fontSize]);

  return null;
} 