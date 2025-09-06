'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode } from '@lexical/rich-text';
import { EditorState, $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import { MoreHorizontal } from 'lucide-react';
import { useEditorStore } from '../stores/useEditorStore';

interface SlideTextBoxWithToolbarProps {
  id: string;
  initialText?: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onUpdate?: (data: {
    id: string;
    text: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  zIndex?: number;
  bounds?: string;
  showToolbar?: boolean;
}

interface TextBoxState {
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function SlideTextBoxWithToolbar({
  id,
  initialText = 'Click to edit text...',
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 300, height: 150 },
  onUpdate,
  onSelect,
  isSelected = false,
  zIndex = 1,
  bounds = 'parent',
  showToolbar = true
}: SlideTextBoxWithToolbarProps) {
  const [state, setState] = useState<TextBoxState>({
    text: initialText,
    position: initialPosition,
    size: initialSize
  });

  const [isEditing, setIsEditing] = useState(false);
  const rndRef = useRef<Rnd>(null);

  // Lexical configuration
  const initialConfig = {
    namespace: `SlideTextBox-${id}`,
    onError: (error: Error) => {
      console.error('SlideTextBox Lexical Error:', error);
    },
    nodes: [ListNode, ListItemNode, HeadingNode],
    theme: {
      paragraph: 'mb-1 text-base leading-relaxed',
      heading: {
        h1: 'text-2xl font-bold mb-2',
        h2: 'text-xl font-semibold mb-1',
        h3: 'text-lg font-semibold mb-1',
      },
      list: {
        ul: 'list-disc list-inside mb-1 ml-4',
        ol: 'list-decimal list-inside mb-1 ml-4',
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

  // Handle position and size updates
  const handleDragStop = useCallback((e: any, d: any) => {
    const newPosition = { x: d.x, y: d.y };
    setState(prev => ({ ...prev, position: newPosition }));
    
    if (onUpdate) {
      onUpdate({
        id,
        text: state.text,
        position: newPosition,
        size: state.size
      });
    }
  }, [id, state.text, state.size, onUpdate]);

  const handleResizeStop = useCallback((e: any, direction: any, ref: any, delta: any, position: any) => {
    const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
    const newPosition = { x: position.x, y: position.y };
    
    setState(prev => ({ 
      ...prev, 
      size: newSize, 
      position: newPosition 
    }));
    
    if (onUpdate) {
      onUpdate({
        id,
        text: state.text,
        position: newPosition,
        size: newSize
      });
    }
  }, [id, state.text, onUpdate]);

  // Handle text content updates
  const handleTextChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const newText = root.getTextContent();
      setState(prev => ({ ...prev, text: newText }));
      
      if (onUpdate) {
        onUpdate({
          id,
          text: newText,
          position: state.position,
          size: state.size
        });
      }
    });
  }, [id, state.position, state.size, onUpdate]);

  // Handle click to select
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(id);
    }
  }, [id, onSelect]);

  // Handle double click to edit
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    
    // Don't select all text by default - let user click where they want cursor
    // The DoubleClickSelectPlugin will handle actual double-click selection within the editor
  }, []);

  // Handle click outside to stop editing
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isEditing && !rndRef.current?.resizableElement?.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  return (
    <Rnd
      ref={rndRef}
      bounds={bounds}
      size={state.size}
      position={state.position}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true
      }}
      dragGrid={[5, 5]}
      resizeGrid={[5, 5]}
      style={{
        zIndex: isSelected ? zIndex + 10 : zIndex,
        cursor: isEditing ? 'text' : 'move'
      }}
      className={`slide-text-box ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={`
          w-full h-full 
          bg-white 
          border-2 
          rounded-lg 
          shadow-sm 
          transition-all 
          duration-200 
          ${isSelected 
            ? 'border-blue-500 shadow-lg' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isEditing ? 'ring-2 ring-blue-300' : ''}
        `}
        style={{
          minHeight: '60px',
          minWidth: '100px'
        }}
      >
        {/* Formatting Toolbar */}
        {isEditing && showToolbar && (
          <div className="absolute -top-10 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-1 flex items-center space-x-1 z-20">
            <FormatToolbar elementId={id} />
          </div>
        )}

        <LexicalComposer initialConfig={initialConfig}>
          <div className="w-full h-full relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className={`
                    w-full h-full 
                    p-3 
                    text-gray-900 
                    text-base 
                    leading-relaxed 
                    focus:outline-none 
                    focus:ring-0 
                    selection:bg-blue-200 
                    selection:text-gray-900
                    ${isEditing ? 'cursor-text' : 'cursor-move'}
                  `}
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    userSelect: isEditing ? 'text' : 'none',
                    WebkitUserSelect: isEditing ? 'text' : 'none',
                    MozUserSelect: isEditing ? 'text' : 'none',
                    msUserSelect: isEditing ? 'text' : 'none',
                    outline: 'none',
                    border: 'none',
                    background: 'transparent',
                    margin: '0',
                    padding: '0',
                    resize: 'none',
                    overflow: 'auto'
                  } as React.CSSProperties}
                  onClick={(e) => {
                    // Allow natural cursor positioning
                    e.stopPropagation();
                  }}
                />
              }
              placeholder={
                <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
                  {(state.text === initialText || state.text === '' || state.text === 'Click to edit text...') ? 
                    (isEditing ? 'Start typing...' : 'Double-click to edit') : 
                    ''
                  }
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin onChange={handleTextChange} />
            <DoubleClickSelectPlugin />
            
            {/* Initial content plugin */}
            <InitialContentPlugin initialContent={initialText} />
          </div>
        </LexicalComposer>
      </div>
    </Rnd>
  );
}

// Formatting Toolbar Component
function FormatToolbar({ elementId }: { elementId: string }) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const { setSelectedElementIds } = useEditorStore();

  const formatText = useCallback((format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor]);

  const formatElement = useCallback((format: 'left' | 'center' | 'right' | 'justify') => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  }, [editor]);

  const handleDesignClick = useCallback(() => {
    // Set the current text element as selected to trigger the design popup
    setSelectedElementIds([elementId]);
  }, [setSelectedElementIds, elementId]);

  // Update toolbar state based on selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
        }
      });
    });
  }, [editor]);

  return (
    <>
      {/* Text Formatting */}
      <button
        onClick={() => formatText('bold')}
        className={`p-1 rounded ${isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        title="Bold"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.6 11.3c.7-.1 1.3-.8 1.3-1.6 0-.9-.7-1.6-1.6-1.6H8v8h4.3c.9 0 1.6-.7 1.6-1.6 0-.8-.6-1.5-1.3-1.6zM8 6h3.4c.9 0 1.6-.7 1.6-1.6S12.3 3 11.4 3H8v3z"/>
        </svg>
      </button>
      
      <button
        onClick={() => formatText('italic')}
        className={`p-1 rounded ${isItalic ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        title="Italic"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
        </svg>
      </button>
      
      <button
        onClick={() => formatText('underline')}
        className={`p-1 rounded ${isUnderline ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        title="Underline"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M16 9A6 6 0 1 1 4 9V1a1 1 0 1 1 2 0v8a4 4 0 1 0 8 0V1a1 1 0 1 1 2 0v8zM2 17a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0v-1z"/>
        </svg>
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      {/* Text Alignment */}
      <button
        onClick={() => formatElement('left')}
        className="p-1 rounded hover:bg-gray-100"
        title="Align Left"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1z"/>
        </svg>
      </button>
      
      <button
        onClick={() => formatElement('center')}
        className="p-1 rounded hover:bg-gray-100"
        title="Align Center"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1z"/>
        </svg>
      </button>
      
      <button
        onClick={() => formatElement('right')}
        className="p-1 rounded hover:bg-gray-100"
        title="Align Right"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1z"/>
        </svg>
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1"></div>

      {/* Three Dots - Design Options */}
      <button
        onClick={handleDesignClick}
        className="p-1 rounded hover:bg-gray-100"
        title="More Design Options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </>
  );
}

// Error Boundary for Lexical
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full">{children}</div>;
}

// Plugin to handle double-click selection
function DoubleClickSelectPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      editor.update(() => {
        const rootNode = $getRoot();
        const allText = rootNode.getTextContent();
        
        // Select all text on double-click
        if (allText && allText.trim() !== '') {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.selectAll();
          }
        }
      });
    };

    const contentEditable = editor.getRootElement();
    if (contentEditable) {
      contentEditable.addEventListener('dblclick', handleDoubleClick);
      
      return () => {
        contentEditable.removeEventListener('dblclick', handleDoubleClick);
      };
    }
  }, [editor]);

  return null;
}

// Plugin to set initial content
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (initialContent && initialContent !== 'Click to edit text...' && initialContent.trim() !== '') {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        const textNode = $createTextNode(initialContent);
        paragraph.append(textNode);
        root.append(paragraph);
      });
    }
  }, [editor, initialContent]);

  return null;
}

// Export the component and types
export type { SlideTextBoxWithToolbarProps, TextBoxState };
