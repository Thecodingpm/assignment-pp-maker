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
import { EditorState, $getRoot, $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection, $isTextNode } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { registerEditor, unregisterEditor, setFocusedEditor } from './EditorRegistry';
import { CustomFormatPlugin } from './CustomFormatPlugin';
import { FontSizePlugin } from './FontSizePlugin';
import { getCurrentEditor } from './EditorRegistry';

// Error Boundary component for Lexical
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

interface LexicalEditorProps {
  onChange?: (editorState: EditorState) => void;
  initialContent?: string;
  onEditorMount?: (editor: any) => void;
  onContentChange?: (content: string) => void;
  editorId?: string;
  readOnly?: boolean;
  onLoad?: () => void;
}

export default function LexicalEditor({ onChange, initialContent, onEditorMount, onContentChange, editorId, readOnly = false, onLoad }: LexicalEditorProps) {
  const uniqueId = useRef(editorId || `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const contentChangeRef = useRef<string>('');
  
  const initialConfig = {
    namespace: 'MyEditor',
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [ImageNode, VideoNode, ListNode, ListItemNode, HeadingNode],
    theme: {
      paragraph: 'mb-2',
      heading: {
        h1: 'font-bold mb-4 text-gray-900 dark:text-white',
        h2: 'font-semibold mb-3 text-gray-800 dark:text-gray-100',
        h3: 'font-semibold mb-2 text-gray-700 dark:text-gray-200',
      },
      list: {
        ul: 'list-disc list-inside mb-2 ml-4',
        ol: 'list-decimal list-inside mb-2 ml-4',
        listitem: 'mb-1',
      },
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
    },
  };

  return (
    <div className="relative min-h-full" data-editor-id={uniqueId.current}>
      {/* Enhanced CSS for headings with proper specificity */}
      <style jsx>{`
        /* Base editor styles */
        .lexical-editor {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        /* H1 Styles - Largest */
        .lexical-editor h1,
        .lexical-editor [data-lexical-editor] h1,
        .lexical-editor h1 span,
        .lexical-editor h1 [data-lexical-text="true"] {
          font-size: 2rem !important; /* 32px */
          font-weight: 700 !important;
          color: #111827 !important;
          line-height: 1.25 !important;
          margin: 0.5em 0 !important;
          display: block !important;
        }
        
        /* H2 Styles - Medium */
        .lexical-editor h2,
        .lexical-editor [data-lexical-editor] h2,
        .lexical-editor h2 span,
        .lexical-editor h2 [data-lexical-text="true"] {
          font-size: 1.5rem !important; /* 24px */
          font-weight: 600 !important;
          color: #1f2937 !important;
          line-height: 1.3 !important;
          margin: 0.5em 0 !important;
          display: block !important;
        }
        
        /* H3 Styles - Smaller */
        .lexical-editor h3,
        .lexical-editor [data-lexical-editor] h3,
        .lexical-editor h3 span,
        .lexical-editor h3 [data-lexical-text="true"] {
          font-size: 1.25rem !important; /* 20px */
          font-weight: 600 !important;
          color: #374151 !important;
          line-height: 1.4 !important;
          margin: 0.5em 0 !important;
          display: block !important;
        }
        
        /* Override any conflicting inline styles */
        .lexical-editor h1[style*="font-size"] *,
        .lexical-editor h2[style*="font-size"] *,
        .lexical-editor h3[style*="font-size"] * {
          font-size: inherit !important;
        }
        
        /* Ensure proper block display */
        .lexical-editor h1,
        .lexical-editor h2,
        .lexical-editor h3 {
          display: block !important;
          width: 100% !important;
        }
        
        /* Additional fallback for deeply nested selectors */
        [data-lexical-editor] h1,
        [data-lexical-editor] h2,
        [data-lexical-editor] h3 {
          font-size: inherit !important;
          font-weight: inherit !important;
          color: inherit !important;
          line-height: inherit !important;
        }
      `}</style>
      
      <LexicalComposer key={uniqueId.current} initialConfig={initialConfig}>
        <EditorWrapper onEditorMount={onEditorMount} editorId={uniqueId.current} onLoad={onLoad} />
        
        {/* Custom Format Plugin */}
        <CustomFormatPlugin />
        
        {/* Font Size Plugin */}
        <FontSizePlugin fontSize="12" />
        

        
        {/* Simple Editor */}
        <div className="mt-0 ml-0 w-full relative z-30 isolate">
          <div className="min-h-[700px] cursor-align-fix relative z-30 isolate" style={{ padding: '0', margin: '0' }}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className={`lexical-editor w-full bg-transparent text-gray-700 dark:text-gray-300 outline-none min-h-[700px] p-0 m-0 ${readOnly ? 'cursor-default select-none' : ''}`}
                  style={{
                    fontSize: '12px',
                    lineHeight: '1.0',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    padding: '0 !important',
                    margin: '0 !important',
                    textAlign: 'left',
                    textIndent: '0',
                    boxSizing: 'border-box',
                    position: 'relative',
                    top: '0',
                    left: '0',
                    verticalAlign: 'top',
                    display: 'block',
                    pointerEvents: readOnly ? 'none' : 'auto',
                    zIndex: '30',
                  }}
                />
              }
              placeholder={
                <div className="text-gray-400 dark:text-gray-500 pointer-events-none" style={{ lineHeight: '1.0', margin: '0', padding: '0', transform: 'translateY(0.5em)' }}>
                  <div className="text-2xl font-semibold text-gray-300 dark:text-gray-600" style={{ lineHeight: '1.0', margin: '0', padding: '0' }}>
                    Start writing your assignment...
                  </div>
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>

                          <HistoryPlugin />
        <ListPlugin />
        <MediaInsertionPlugin />
          {onChange && <OnChangePlugin onChange={onChange} />}
        {onContentChange && <OnChangePlugin onChange={(editorState) => {
          // Use a more reliable way to get content without interfering with editor state
          editorState.read(() => {
            const root = $getRoot();
            const content = root.getTextContent();
            // Only call onContentChange if content has actually changed
            if (content !== contentChangeRef.current) {
              setTimeout(() => {
                const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
                const htmlContent = editorElement ? editorElement.innerHTML : '';
                onContentChange(htmlContent);
              }, 100);
            }
          });
        }} />}
        <InitialContentPlugin initialContent={initialContent} />
      </LexicalComposer>
    </div>
  );
}

// Editor wrapper to get the editor instance
function EditorWrapper({ onEditorMount, editorId, onLoad }: { onEditorMount?: (editor: any) => void; editorId: string; onLoad?: () => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // Register this editor with the global registry
    registerEditor(editorId, editor);
    
    // Set this as the focused editor when it's mounted
    setFocusedEditor(editorId);
    
    // Listen for focus events to update the focused editor
    const handleFocus = () => {
      setFocusedEditor(editorId);
    };
    
    // Add focus listener to the editor element
    const editorElement = document.querySelector(`[data-editor-id="${editorId}"]`) || 
                         document.querySelector('.lexical-editor');
    if (editorElement) {
      editorElement.addEventListener('focus', handleFocus);
    }
    
    if (onEditorMount) {
      onEditorMount(editor);
    }
    
    // Call onLoad when editor is ready
    if (onLoad) {
      onLoad();
    }
    
    // Cleanup: unregister when component unmounts
    return () => {
      unregisterEditor(editorId);
      if (editorElement) {
        editorElement.removeEventListener('focus', handleFocus);
      }
    };
  }, [editor, onEditorMount, editorId, onLoad]);
  
  return null;
}

// Plugin to initialize editor with initial content
function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const lastContentRef = useRef<string>('');
  const hasBeenEditedRef = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(true);
  const manuallyClearedRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (initialContent && initialContent.trim() && initialContent !== lastContentRef.current && !hasBeenEditedRef.current && !manuallyClearedRef.current) {
      lastContentRef.current = initialContent;
      
      const timer = setTimeout(() => {
        editor.update(() => {
          const root = $getRoot();
          const currentContent = root.getTextContent();
          
          // Only set content if editor is empty and hasn't been manually edited or cleared
          if (currentContent.trim() === '' && !hasBeenEditedRef.current && !manuallyClearedRef.current) {
            try {
              console.log('Attempting to load template content:', initialContent);
              
              // Create a temporary div to parse HTML
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = initialContent;
              
              console.log('Parsed HTML:', tempDiv.innerHTML);
              
              // Convert HTML to Lexical nodes using the div's ownerDocument
              const nodes = $generateNodesFromDOM(editor, tempDiv.ownerDocument);
              
              console.log('Generated Lexical nodes:', nodes);
              
              // Clear existing content and append new nodes
              root.clear();
              root.append(...nodes);
              
              console.log('Template content loaded successfully:', initialContent);
            } catch (error) {
              console.warn('Failed to parse initial content:', error);
              
              // Fallback: create simple text content
              const textContent = initialContent.replace(/<[^>]*>/g, '').trim();
              if (textContent) {
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(textContent));
                root.append(paragraph);
              }
            }
          }
        });
      }, 300); // Increased delay to ensure editor is ready
      
      return () => clearTimeout(timer);
    }
    
    // Mark initialization as complete after first run
    if (isInitializingRef.current) {
      isInitializingRef.current = false;
    }
  }, [editor, initialContent]);
  
  // Listen for user edits to prevent content restoration
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // If this is not the initial load and there are actual changes
      if (!isInitializingRef.current && (dirtyElements.size > 0 || dirtyLeaves.size > 0)) {
        hasBeenEditedRef.current = true;
        
        // Check if content was manually cleared (user deleted everything)
        editorState.read(() => {
          const root = $getRoot();
          const currentContent = root.getTextContent();
          if (currentContent.trim() === '' && hasBeenEditedRef.current) {
            manuallyClearedRef.current = true;
          }
        });
      }
    });
    
    return unregister;
  }, [editor]);
  
  return null;
}

