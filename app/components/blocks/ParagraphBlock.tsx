'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { Descendant, Element as SlateElement, Text } from 'slate';
import { Slate, Editable } from 'slate-react';
import { DocumentBlock } from '../../types/document';
import {
  createSlateEditor,
  textToSlateValue,
  slateValueToText,
  applyDefaultFormatting,
  DEFAULT_FORMATTING,
  ELEMENT_TYPES,
  MARK_TYPES,
  KeyboardShortcuts,
} from '../../utils/slateConfig';
import RichTextToolbar from '../RichTextToolbar';

interface ParagraphBlockProps {
  block: DocumentBlock;
  onChange: (blockId: string, content: string, styling: DocumentBlock['styling']) => void;
  isEditing?: boolean;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ block, onChange, isEditing = true }) => {
  const editor = useMemo(() => createSlateEditor(), []);
  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Convert content to Slate value with default formatting
  const initialValue: Descendant[] = useMemo(() => {
    const slateValue = textToSlateValue(block.content);
    const defaultFormatting = {
      ...DEFAULT_FORMATTING,
      ...block.styling,
      textAlign: (block.styling.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
    };
    return applyDefaultFormatting(slateValue, defaultFormatting);
  }, [block.content, block.styling]);

  const handleChange = useCallback((value: Descendant[]) => {
    const content = slateValueToText(value);
    
    // Extract formatting from the first text node
    const firstTextNode = value[0]?.children?.[0];
    const formatting = firstTextNode && Text.isText(firstTextNode) ? {
      color: firstTextNode.color,
      backgroundColor: firstTextNode.backgroundColor,
      fontSize: firstTextNode.fontSize,
      fontFamily: firstTextNode.fontFamily,
      textAlign: value[0]?.textAlign,
    } : block.styling;
    
    onChange(block.id, content, formatting);
  }, [block.id, block.styling, onChange]);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case ELEMENT_TYPES.PARAGRAPH:
        return (
          <p
            {...props.attributes}
            style={{
              textAlign: props.element.textAlign || 'left',
            }}
          >
            {props.children}
          </p>
        );
      case ELEMENT_TYPES.LINK:
        return (
          <a
            {...props.attributes}
            href={props.element.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            {props.children}
          </a>
        );
      default:
        return <div {...props.attributes}>{props.children}</div>;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    let { attributes, children, leaf } = props;

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    if (leaf.strikethrough) {
      children = <del>{children}</del>;
    }

    if (leaf.code) {
      children = <code style={{ backgroundColor: '#f1f3f4', padding: '2px 4px', borderRadius: '3px' }}>{children}</code>;
    }

    return (
      <span
        {...attributes}
        style={{
          color: leaf.color,
          backgroundColor: leaf.backgroundColor,
          fontSize: leaf.fontSize,
          fontFamily: leaf.fontFamily,
        }}
      >
        {children}
      </span>
    );
  }, []);

  const blockStyle: React.CSSProperties = {
    marginTop: block.styling.marginTop || '0',
    marginBottom: block.styling.marginBottom || '0',
    width: '100%',
    outline: 'none',
    border: 'none',
    padding: '8px 0',
    lineHeight: '1.6',
    minHeight: '1.2em',
    ...(isFocused && {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: '4px',
      padding: '8px',
    }),
  };

  if (!isEditing) {
    return (
      <p style={blockStyle}>
        {block.content}
      </p>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {showToolbar && (
        <RichTextToolbar
          editor={editor}
          onFormatChange={() => {
            // Trigger change to update content
            const value = editor.children;
            handleChange(value);
          }}
        />
      )}
      
      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          style={blockStyle}
          placeholder="Type your paragraph here..."
          spellCheck={true}
          onFocus={() => {
            setIsFocused(true);
            setShowToolbar(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(event) => {
            const handled = KeyboardShortcuts.handleKeyDown(event.nativeEvent, editor);
            if (handled) {
              event.preventDefault();
            }
          }}
        />
      </Slate>
    </div>
  );
};

export default ParagraphBlock;
