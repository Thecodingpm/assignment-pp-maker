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
import { EditorState, $getRoot, $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection, $isTextNode, $createHeadingNode, $createListItemNode } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { initializeColor, applyColorToNewText, getCurrentColor } from './SimpleFormatPlugin';
import { registerEditor, unregisterEditor, setFocusedEditor } from './EditorRegistry';
import FontStatePlugin from './FontStatePlugin';

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
        <div className="w-full h-full">
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

// Simple Initial Content Plugin
function InitialContentPlugin({ initialContent }: { initialContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const contentSetRef = useRef(false);
  
  useEffect(() => {
    console.log('=== INITIAL CONTENT PLUGIN ===');
    console.log('Initial content received:', initialContent);
    console.log('Initialized ref:', initializedRef.current);
    console.log('Content set ref:', contentSetRef.current);
    
    if (initialContent !== undefined && !contentSetRef.current) {
      console.log('Setting up content initialization...');
      
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
            console.log('Setting initial content...');
            contentSetRef.current = true;
            
            try {
              // Clear existing content first
              root.clear();
              
              // Create a temporary container to parse HTML
              const tempContainer = document.createElement('div');
              tempContainer.innerHTML = initialContent;
              
              console.log('Parsed HTML container:', tempContainer.innerHTML);
              
              // Process each child node and create appropriate Lexical nodes
              Array.from(tempContainer.children).forEach((child) => {
                const tagName = child.tagName.toLowerCase();
                const textContent = child.textContent || '';
                const innerHTML = child.innerHTML;
                
                console.log('Processing element:', tagName, textContent);
                
                if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
                  const headingNode = $createHeadingNode(tagName as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');
                  headingNode.append($createTextNode(textContent));
                  root.append(headingNode);
                  
                  // Apply styles after node is created
                  setTimeout(() => {
                    const headingElement = document.querySelector(`[data-lexical-key="${headingNode.getKey()}"]`);
                    if (headingElement) {
                      headingElement.style.color = '#2563eb';
                      headingElement.style.textAlign = 'center';
                      headingElement.style.marginBottom = '20px';
                    }
                  }, 100);
                  
                } else if (tagName === 'p') {
                  const paragraphNode = $createParagraphNode();
                  paragraphNode.append($createTextNode(textContent));
                  root.append(paragraphNode);
                  
                  // Apply paragraph styles
                  setTimeout(() => {
                    const paragraphElement = document.querySelector(`[data-lexical-key="${paragraphNode.getKey()}"]`);
                    if (paragraphElement) {
                      paragraphElement.style.fontSize = '16px';
                      paragraphElement.style.lineHeight = '1.6';
                      paragraphElement.style.marginBottom = '15px';
                      
                      // Apply specific styles based on content
                      if (textContent.includes('bold')) {
                        paragraphElement.style.fontWeight = 'bold';
                        paragraphElement.style.color = '#059669';
                      }
                      if (textContent.includes('centered')) {
                        paragraphElement.style.textAlign = 'center';
                        paragraphElement.style.fontStyle = 'italic';
                        paragraphElement.style.color = '#6b7280';
                      }
                      if (textContent.includes('right-aligned')) {
                        paragraphElement.style.textAlign = 'right';
                        paragraphElement.style.fontWeight = 'bold';
                        paragraphElement.style.color = '#ea580c';
                      }
                    }
                  }, 100);
                  
                } else if (tagName === 'ul') {
                  // Handle unordered lists
                  Array.from(child.children).forEach((listItem) => {
                    if (listItem.tagName.toLowerCase() === 'li') {
                      const listItemNode = $createListItemNode();
                      listItemNode.append($createTextNode(listItem.textContent || ''));
                      root.append(listItemNode);
                    }
                  });
                  
                } else if (tagName === 'ol') {
                  // Handle ordered lists
                  Array.from(child.children).forEach((listItem) => {
                    if (listItem.tagName.toLowerCase() === 'li') {
                      const listItemNode = $createListItemNode();
                      listItemNode.append($createTextNode(listItem.textContent || ''));
                      root.append(listItemNode);
                    }
                  });
                  
                } else if (tagName === 'div') {
                  // Handle div elements (like the note box)
                  const paragraphNode = $createParagraphNode();
                  paragraphNode.append($createTextNode(textContent));
                  root.append(paragraphNode);
                  
                  // Apply div styles
                  setTimeout(() => {
                    const divElement = document.querySelector(`[data-lexical-key="${paragraphNode.getKey()}"]`);
                    if (divElement) {
                      divElement.style.backgroundColor = '#f3f4f6';
                      divElement.style.padding = '15px';
                      divElement.style.borderRadius = '8px';
                      divElement.style.borderLeft = '4px solid #3b82f6';
                      divElement.style.margin = '20px 0';
                      divElement.style.color = '#374151';
                    }
                  }, 100);
                  
                } else {
                  // Default to paragraph for unknown elements
                  const paragraphNode = $createParagraphNode();
                  paragraphNode.append($createTextNode(textContent));
                  root.append(paragraphNode);
                }
              });
              
              console.log('Content set successfully with manual parsing and styling');
              
            } catch (error) {
              console.warn('Failed to parse initial content:', error);
              
              // Fallback to plain text
              const textContent = initialContent.replace(/<[^>]*>/g, '').trim();
              console.log('Error occurred, using plain text fallback:', textContent);
              if (textContent) {
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(textContent));
                root.append(paragraph);
                console.log('Content set successfully with error fallback');
              }
            }
          } else {
            console.log('Skipping content set - conditions not met');
          }
        });
      }, 300); // Increased delay to ensure editor is fully ready
      
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

