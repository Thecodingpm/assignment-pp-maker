'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { applyFontSizeFormat } from './CustomFormatPlugin';

interface FontSizePluginProps {
  fontSize?: string;
}

export function FontSizePlugin({ fontSize }: FontSizePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!fontSize) return;

    // Apply font size when the plugin receives a new fontSize prop
    const unregisterUpdateListener = editor.registerUpdateListener(() => {
      // Font size changes are now handled by the enhanced formatting system
      // This plugin just ensures the editor is aware of font size changes
    });

    return () => {
      unregisterUpdateListener();
    };
  }, [editor, fontSize]);

  return null;
}
