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
import { VideoNode } from './VideoNode';
import MediaInsertionPlugin from './MediaInsertionPlugin';
import { EditorState, $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { registerEditor, unregisterEditor, setFocusedEditor } from './EditorRegistry';

interface LexicalEditorProps {
  onChange?: (editorState: EditorState) => void;
  initialContent?: string;
  onEditorMount?: (editor: any) => void;
  onContentChange?: (content: string) => void;
  editorId?: string;
  readOnly?: boolean;
  onLoad?: () => void;
}

export default function LexicalEditor({ 
  onChange, 
  initialContent, 
  onEditorMount, 
  onContentChange, 
  editorId, 
  readOnly = false, 
  onLoad 
}: LexicalEditorProps) {
  const uniqueId = useRef(editorId || `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  const initialConfig = {
    namespace: 'MyEditor',
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error);
    },
    nodes: [ImageNode, VideoNode, ListNode, ListItemNode, HeadingNode],
    theme: {
      paragraph: 'mb-1',
      heading: {
        h1: 'text-3xl font-bold mb-2 text-gray-900',
        h2: 'text-2xl font-semibold mb-1 text-gray-800',
        h3: 'text-xl font-semibold mb-1 text-gray-700',
      },
      list: {
        ul: 'list-disc list-inside mb-1 ml-6',
        ol: 'list-decimal list-inside mb-1 ml-6',
        listitem: 'mb-0',
      },
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
      },
    },
  };

  return (
    <div className="w-full h-full" data-editor-id={uniqueId.current}>
      <LexicalComposer key={uniqueId.current} initialConfig={initialConfig}>
        <EditorWrapper 
          onEditorMount={onEditorMount} 
          editorId={uniqueId.current} 
          onLoad={onLoad} 
          readOnly={readOnly} 
        />
        
        {/* Core Editor */}
        <div className="w-full h-full">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className={`
                  w-full h-full min-h-[600px] p-3 
                  text-gray-900 text-base leading-relaxed
                  focus:outline-none
                  ${readOnly ? 'cursor-default select-none' : 'cursor-text'}
                `}
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.3',
                }}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                <div className="text-lg font-medium">
                  Start writing your assignment...
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  Use the toolbar above to format your text
                </div>
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        {/* Essential Plugins */}
        <HistoryPlugin />
        <ListPlugin />
        <MediaInsertionPlugin />
        
        {/* Change Handlers */}
        {onChange && <OnChangePlugin onChange={onChange} />}
        {onContentChange && <OnChangePlugin onChange={(editorState) => {
          editorState.read(() => {
            const root = $getRoot();
            const content = root.getTextContent();
            onContentChange(content);
          });
        }} />}
        
        {/* Initial Content */}
        <InitialContentPlugin initialContent={initialContent} />
      </LexicalComposer>
    </div>
  );
}

// Simple Error Boundary
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full">{children}</div>;
}

// Clean Editor Wrapper
function EditorWrapper({ 
  onEditorMount, 
  editorId, 
  onLoad, 
  readOnly 
}: { 
  onEditorMount?: (editor: any) => void; 
  editorId: string; 
  onLoad?: () => void; 
  readOnly?: boolean; 
}) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // Register editor
    registerEditor(editorId, editor);
    setFocusedEditor(editorId);
    
    // Call callbacks
    if (onEditorMount) onEditorMount(editor);
    if (onLoad) onLoad();
    
    // Cleanup
    return () => unregisterEditor(editorId);
  }, [editor, onEditorMount, editorId, onLoad, readOnly]);
  
  return null;
}

// Simple Initial Content Plugin
function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (initialContent && initialContent.trim() && !initializedRef.current) {
      initializedRef.current = true;
      
      setTimeout(() => {
        editor.update(() => {
          const root = $getRoot();
          const currentContent = root.getTextContent();
          
          if (currentContent.trim() === '') {
            try {
              // Parse HTML content
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = initialContent;
              
              const nodes = $generateNodesFromDOM(editor, tempDiv.ownerDocument);
              root.clear();
              root.append(...nodes);
            } catch (error) {
              console.warn('Failed to parse initial content:', error);
              
              // Fallback to plain text
              const textContent = initialContent.replace(/<[^>]*>/g, '').trim();
              if (textContent) {
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(textContent));
                root.append(paragraph);
              }
            }
          }
        });
      }, 100);
    }
  }, [editor, initialContent]);
  
  return null;
}

