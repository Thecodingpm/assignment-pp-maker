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

interface ListBlockProps {
  block: DocumentBlock;
  onChange: (blockId: string, content: string, styling: DocumentBlock['styling']) => void;
  onListTypeChange?: (blockId: string, listType: 'bullet' | 'numbered') => void;
  isEditing?: boolean;
}

const ListBlock: React.FC<ListBlockProps> = ({ 
  block, 
  onChange, 
  onListTypeChange, 
  isEditing = true 
}) => {
  const editor = useMemo(() => createSlateEditor(), []);
  const [isFocused, setIsFocused] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Convert content to Slate value with default formatting
  const initialValue: Descendant[] = useMemo(() => {
    const items = block.content.split('\n').filter(item => item.trim());
    const listItems = items.map(item => ({
      type: ELEMENT_TYPES.LIST_ITEM,
      children: [{ text: item.replace(/^[•\-\d+\.]\s*/, '') }],
    }));
    
    const defaultFormatting = {
      ...DEFAULT_FORMATTING,
      ...block.styling,
      textAlign: (block.styling.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
    };
    return applyDefaultFormatting(listItems, defaultFormatting);
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

  const handleListTypeChange = (newType: 'bullet' | 'numbered') => {
    if (onListTypeChange) {
      onListTypeChange(block.id, newType);
    }
  };

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case ELEMENT_TYPES.LIST_ITEM:
        return (
          <li
            {...props.attributes}
            style={{
              marginBottom: '4px',
              textAlign: props.element.textAlign || 'left',
            }}
          >
            {props.children}
          </li>
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
    ...(isFocused && {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      borderRadius: '4px',
      padding: '8px',
    }),
  };

  const listType = block.listType || 'bullet';
  const ListComponent = listType === 'bullet' ? 'ul' : 'ol';

  if (!isEditing) {
    const items = block.content.split('\n').filter(item => item.trim());
    return (
      <ListComponent style={blockStyle}>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: '4px' }}>
            {item.replace(/^[•\-\d+\.]\s*/, '')}
          </li>
        ))}
      </ListComponent>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {isEditing && (
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <button
            onClick={() => handleListTypeChange('bullet')}
            style={{
              background: listType === 'bullet' ? '#007bff' : '#666',
              border: 'none',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            •
          </button>
          <button
            onClick={() => handleListTypeChange('numbered')}
            style={{
              background: listType === 'numbered' ? '#007bff' : '#666',
              border: 'none',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            1.
          </button>
        </div>
      )}

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
          placeholder="Type list items..."
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

export default ListBlock;
