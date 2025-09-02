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

interface SlideTextBoxProps {
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
}

interface TextBoxState {
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function SlideTextBox({
  id,
  initialText = 'Click to edit text...',
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 300, height: 150 },
  onUpdate,
  onSelect,
  isSelected = false,
  zIndex = 1,
  bounds = 'parent'
}: SlideTextBoxProps) {
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

  // Export state as JSON
  const exportState = useCallback(() => {
    return {
      id,
      text: state.text,
      position: state.position,
      size: state.size,
      type: 'textBox'
    };
  }, [id, state]);

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
                />
              }
              placeholder={
                <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
                  {isEditing ? 'Start typing...' : 'Double-click to edit'}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin onChange={handleTextChange} />
            
            {/* Initial content plugin */}
            <InitialContentPlugin initialContent={initialText} />
          </div>
        </LexicalComposer>
      </div>
    </Rnd>
  );
}

// Error Boundary for Lexical
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full">{children}</div>;
}

// Plugin to set initial content
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (initialContent && initialContent !== 'Click to edit text...') {
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
export type { SlideTextBoxProps, TextBoxState };
