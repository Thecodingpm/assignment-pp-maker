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

interface HeadingBlockProps {
  block: DocumentBlock;
  onChange: (blockId: string, content: string, styling: DocumentBlock['styling']) => void;
  isEditing?: boolean;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, onChange, isEditing = true }) => {
  const editor = useMemo(() => createSlateEditor(), []);
  const [showToolbar, setShowToolbar] = useState(false);

  // Convert content to Slate value with default formatting
  const initialValue: Descendant[] = useMemo(() => {
    const slateValue = textToSlateValue(block.content);
    const defaultFormatting = {
      ...DEFAULT_FORMATTING,
      ...block.styling,
      fontSize: block.styling.fontSize || getDefaultHeadingSize(block.level || 1),
      fontWeight: block.styling.fontWeight || getDefaultHeadingWeight(block.level || 1),
      textAlign: (block.styling.textAlign as 'center' | 'left' | 'right' | 'justify') || 'left',
    };
    return applyDefaultFormatting(slateValue, defaultFormatting);
  }, [block.content, block.styling, block.level]);

  const handleChange = useCallback((value: Descendant[]) => {
    const content = slateValueToText(value);
    
    // Extract formatting from the first text node
    const firstTextNode = value[0]?.children?.[0];
    const formatting = firstTextNode && Text.isText(firstTextNode) ? {
      color: firstTextNode.color,
      backgroundColor: firstTextNode.backgroundColor,
      fontSize: firstTextNode.fontSize,
      fontFamily: firstTextNode.fontFamily,
      fontWeight: firstTextNode.fontWeight,
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
          fontWeight: leaf.fontWeight,
        }}
      >
        {children}
      </span>
    );
  }, []);

  const headingTag = `h${block.level || 1}` as keyof React.JSX.IntrinsicElements;
  const HeadingComponent = headingTag;

  const blockStyle: React.CSSProperties = {
    marginTop: block.styling.marginTop || '0',
    marginBottom: block.styling.marginBottom || '0',
    width: '100%',
    outline: 'none',
    border: 'none',
    padding: '0',
  };

  if (!isEditing) {
    return (
      <HeadingComponent style={blockStyle}>
        {block.content}
      </HeadingComponent>
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
          placeholder={`Heading ${block.level || 1}...`}
          spellCheck={false}
          onFocus={() => setShowToolbar(true)}
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

function getDefaultHeadingSize(level: number): string {
  const sizes = {
    1: '2.5rem',
    2: '2rem',
    3: '1.75rem',
    4: '1.5rem',
    5: '1.25rem',
    6: '1rem',
  };
  return sizes[level as keyof typeof sizes] || '1.5rem';
}

function getDefaultHeadingWeight(level: number): string {
  return level <= 3 ? 'bold' : '600';
}

export default HeadingBlock;
