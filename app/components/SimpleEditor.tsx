'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { ImageNode } from './ImageNode';
import CursorVisibilityPlugin from './CursorVisibilityPlugin';
import CursorFocusManager from './CursorFocusManager';
import { EditorState } from 'lexical';
import { useEffect, useState } from 'react';

interface EditorProps {
  onChange?: (editorState: EditorState) => void;
  onEditorReady?: (getContent: () => string) => void;
  initialContent?: string;
}

export default function SimpleEditor({ onChange, onEditorReady, initialContent }: EditorProps) {
  const [isEditorReady, setIsEditorReady] = useState(false);

  const initialConfig = {
    namespace: 'MyEditor',
    theme: {
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
    },
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [ImageNode, ListNode, ListItemNode, HeadingNode],
  };

  const getEditorContent = () => {
    const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
    if (editorElement) {
      return editorElement.innerHTML;
    }
    return '';
  };

  useEffect(() => {
    if (onEditorReady && !isEditorReady) {
      onEditorReady(getEditorContent);
      setIsEditorReady(true);
    }
  }, [onEditorReady, isEditorReady]);

  useEffect(() => {
    if (initialContent && initialContent.trim() !== '') {
      const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
      if (editorElement) {
        editorElement.innerHTML = initialContent;
      }
    }
  }, [initialContent]);

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <LexicalComposer initialConfig={initialConfig}>
          <div className="editor-container">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="lexical-editor min-h-[500px] w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              }

            />
            <HistoryPlugin />
            <ListPlugin />
            <CursorVisibilityPlugin />
            <CursorFocusManager />
            {onChange && <OnChangePlugin onChange={onChange} />}
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}