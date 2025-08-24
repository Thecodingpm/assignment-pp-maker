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
import { initializeColor, applyColorToNewText, getCurrentColor } from './SimpleFormatPlugin';
import { registerEditor, unregisterEditor, setFocusedEditor } from './EditorRegistry';
import FontStatePlugin from './FontStatePlugin';
import DraggableLineIndicator from './DraggableLineIndicator';

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
      paragraph: 'mb-1 text-base',
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
    <div className="w-full h-full lexical-editor" data-editor-id={uniqueId.current}>
      <LexicalComposer key={uniqueId.current} initialConfig={initialConfig}>
        <EditorWrapper 
          onEditorMount={onEditorMount} 
          editorId={uniqueId.current} 
          onLoad={onLoad} 
          readOnly={readOnly} 
        />
        
        {/* Core Editor */}
        <div className="w-full h-full relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="w-full h-full min-h-[600px] p-3 text-gray-900 text-base leading-relaxed focus:outline-none focus:ring-0 selection:bg-blue-200 selection:text-gray-900"
                style={{
                  fontFamily: 'var(--current-font-family, "Inter", sans-serif)',
                  fontSize: 'var(--current-font-size, 16px)',
                  lineHeight: '1.5',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text',
                  caretColor: 'var(--cursor-color, #000000)',
                  outline: 'none',
                  border: 'none',
                  background: 'transparent',
                  margin: '0',
                  padding: '0',
                  transition: 'none',
                  animation: 'none',
                  transform: 'none',
                  willChange: 'auto'
                } as React.CSSProperties}
              />
            }
            placeholder={
              <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
                Start typing...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          {/* Draggable Line Indicator */}
          <DraggableLineIndicator 
            snapThreshold={50}
            lineColor="#ff6b35"
            onSnap={(isSnapped) => {
              console.log('Snap state changed:', isSnapped);
            }}
          />
          
          {/* Plugins */}
          <HistoryPlugin />
          {onChange && <OnChangePlugin onChange={onChange} />}
          {onContentChange && <OnChangePlugin onChange={(editorState) => {
            editorState.read(() => {
              const root = $getRoot();
              const content = root.getTextContent();
              onContentChange(content);
            });
          }} />}
          <ListPlugin />
          <MediaInsertionPlugin />
          <ColorPlugin />
          <FontStatePlugin />
          <InlineStylePlugin initialContent={initialContent} />
          
          {/* Focus Management */}
          <FocusManagementPlugin editorId={uniqueId.current} />
          
          {/* Initial Content */}
          <InitialContentPlugin initialContent={initialContent} />
        </div>
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
    // Register the editor with the global registry
    console.log('Registering editor:', editorId);
    registerEditor(editorId, editor);
    
    // Set as focused editor by default
    setFocusedEditor(editorId);
    
    // Call callbacks
    if (onEditorMount) onEditorMount(editor);
    if (onLoad) onLoad();
    
    // Cleanup function
    return () => {
      console.log('Unregistering editor:', editorId);
      unregisterEditor(editorId);
    };
  }, [editor, editorId, onEditorMount, onLoad]);
  
  return null;
}

// Color Plugin - Proper Lexical implementation
function ColorPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // Initialize color on mount
    initializeColor();
    
    // Listen for text input and apply current color
    const unregisterUpdateListener = editor.registerUpdateListener(() => {
      const currentColor = getCurrentColor();
      console.log('🎨 ColorPlugin: Current color is:', currentColor);
      
      if (currentColor !== '#000000') {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection) && selection.isCollapsed()) {
            const anchor = selection.anchor;
            const textNode = anchor.getNode();
            
            if ($isTextNode(textNode)) {
              const currentStyle = textNode.getStyle();
              console.log('🎨 ColorPlugin: Current text node style:', currentStyle);
              
              if (!currentStyle.includes(`color: ${currentColor}`)) {
                const styleWithoutColor = currentStyle.replace(/color:\s*[^;]+;?/g, '');
                const newStyle = styleWithoutColor ? `${styleWithoutColor}; color: ${currentColor}` : `color: ${currentColor}`;
                textNode.setStyle(newStyle.replace(/^;\s*/, ''));
                console.log('🎨 ColorPlugin: Applied new style:', newStyle);
              } else {
                console.log('🎨 ColorPlugin: Color already applied');
              }
            }
          }
        });
      }
    });

    return () => {
      unregisterUpdateListener();
    };
  }, [editor]);
  
  return null;
}

// Focus Management Plugin
function FocusManagementPlugin({ editorId }: { editorId: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    const unregister = editor.registerUpdateListener(() => {
      // Check if this editor is currently focused
      const rootElement = editor.getRootElement();
      if (rootElement && document.activeElement === rootElement.querySelector('[contenteditable="true"]')) {
        setFocusedEditor(editorId);
      }
    });
    
    return unregister;
  }, [editor, editorId]);
  
  return null;
}

// Enhanced Initial Content Plugin with proper HTML parsing
function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const contentSetRef = useRef(false);
  
  useEffect(() => {
    console.log('=== ENHANCED INITIAL CONTENT PLUGIN ===');
    console.log('Initial content received:', initialContent);
    
    if (initialContent !== undefined && !contentSetRef.current) {
      console.log('Setting up enhanced content initialization...');
      
      // Use a delay to ensure editor is fully initialized
      const timer = setTimeout(() => {
        editor.update(() => {
          const root = $getRoot();
          const currentContent = root.getTextContent();
          
          console.log('Current editor content:', currentContent);
          console.log('Initial content to set:', initialContent);
          
          // Check if we should set the content
          const shouldSetContent = initialContent && initialContent.trim() && 
            (currentContent.trim() === '' || !contentSetRef.current);
          
          if (shouldSetContent) {
            console.log('Setting enhanced initial content...');
            contentSetRef.current = true;
            
            try {
              // Clear existing content first
              root.clear();
              
              // Use Lexical's built-in HTML parser for better results
              const parser = new DOMParser();
              const doc = parser.parseFromString(initialContent, 'text/html');
              
              console.log('Parsed HTML document:', doc.body.innerHTML);
              
              // Convert the parsed HTML to Lexical nodes
              const nodes = $generateNodesFromDOM(editor, doc);
              
              if (nodes && nodes.length > 0) {
                console.log('Generated Lexical nodes:', nodes.length);
                nodes.forEach(node => {
                  root.append(node);
                });
              } else {
                console.log('No nodes generated, falling back to text content');
                // Fallback: create a simple paragraph with the text content
                const textContent = initialContent.replace(/<[^>]*>/g, '').trim();
                if (textContent) {
                  const paragraphNode = $createParagraphNode();
                  paragraphNode.append($createTextNode(textContent));
                  root.append(paragraphNode);
                }
              }
              
              console.log('Enhanced initial content set successfully');
              
            } catch (error) {
              console.error('Error setting enhanced initial content:', error);
              
              // Fallback: create a simple paragraph with the text content
              const textContent = initialContent.replace(/<[^>]*>/g, '').trim();
              if (textContent) {
                const paragraphNode = $createParagraphNode();
                paragraphNode.append($createTextNode(textContent));
                root.append(paragraphNode);
              }
            }
          }
        });
      }, 200); // Increased delay for better initialization
      
      return () => clearTimeout(timer);
    }
  }, [editor, initialContent]);
  
  return null;
}

// Inline Style Plugin to handle HTML styling
function InlineStylePlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (initialContent && initialContent.includes('style=')) {
      console.log('=== INLINE STYLE PLUGIN ===');
      console.log('Processing inline styles in content');
      
      // Apply styles after content is loaded
      const timer = setTimeout(() => {
        editor.update(() => {
          const root = $getRoot();
          const selection = $getSelection();
          
          // Find text nodes and apply styles
          root.getChildren().forEach((node) => {
            if (node.getType() === 'heading') {
              // Apply heading styles
              const headingElement = document.querySelector(`[data-lexical-key="${node.getKey()}"]`);
              if (headingElement) {
                headingElement.style.color = '#2563eb';
                headingElement.style.textAlign = 'center';
                headingElement.style.marginBottom = '20px';
              }
            } else if (node.getType() === 'paragraph') {
              // Apply paragraph styles
              const paragraphElement = document.querySelector(`[data-lexical-key="${node.getKey()}"]`);
              if (paragraphElement) {
                paragraphElement.style.fontSize = '16px';
                paragraphElement.style.lineHeight = '1.6';
                paragraphElement.style.marginBottom = '15px';
              }
            }
          });
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [editor, initialContent]);
  
  return null;
}

