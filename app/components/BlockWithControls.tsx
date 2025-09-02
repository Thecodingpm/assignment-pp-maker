'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  HeadingBlock, 
  ParagraphBlock, 
  ImageBlock, 
  ListBlock, 
  TableBlock 
} from './blocks';
import { DocumentBlock } from '../types/document';
import { createNewBlock } from '../utils/blockOperations';

interface BlockWithControlsProps {
  block: DocumentBlock;
  index: number;
  isEditing: boolean;
  isSelected?: boolean;
  onBlockChange: (blockId: string, content: string, styling: DocumentBlock['styling']) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockMove: (fromIndex: number, toIndex: number) => void;
  onBlockTypeChange: (blockId: string, newType: DocumentBlock['type']) => void;
  onBlockDuplicate: (blockId: string) => void;
  onBlockSplit: (blockId: string, splitIndex: number) => void;
  onBlockMerge: (blockId: string) => void;
  onAddBlock: (type: DocumentBlock['type'], index: number) => void;
  onImageReplace: (blockId: string, newImageUrl: string) => void;
  onListTypeChange: (blockId: string, listType: 'bullet' | 'numbered') => void;
  onBlockSelect: (blockId: string) => void;
}

const BlockWithControls: React.FC<BlockWithControlsProps> = ({
  block,
  index,
  isEditing,
  isSelected = false,
  onBlockChange,
  onBlockDelete,
  onBlockMove,
  onBlockTypeChange,
  onBlockDuplicate,
  onBlockSplit,
  onBlockMerge,
  onAddBlock,
  onImageReplace,
  onListTypeChange,
  onBlockSelect,
}) => {
  const [showControls, setShowControls] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSelected || !isEditing) return;

      // Delete block (Ctrl/Cmd + Delete/Backspace)
      if ((event.key === 'Delete' || event.key === 'Backspace') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onBlockDelete(block.id);
      }

      // Duplicate block (Ctrl/Cmd + D)
      if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onBlockDuplicate(block.id);
      }

      // Split block (Ctrl/Cmd + Enter)
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        onBlockSplit(block.id, block.content.length);
      }

      // Merge block (Shift + Enter)
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        onBlockMerge(block.id);
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, isEditing, block.id, block.content.length, onBlockDelete, onBlockDuplicate, onBlockSplit, onBlockMerge]);

  const renderBlock = () => {
    const commonProps = {
      block,
      onChange: onBlockChange,
      isEditing,
    };

    switch (block.type) {
      case 'heading':
        return <HeadingBlock {...commonProps} />;
      case 'paragraph':
        return <ParagraphBlock {...commonProps} />;
      case 'image':
        return <ImageBlock {...commonProps} onImageReplace={onImageReplace} />;
      case 'list':
        return <ListBlock {...commonProps} onListTypeChange={onListTypeChange} />;
      case 'table':
        return <TableBlock {...commonProps} />;
      default:
        return <ParagraphBlock {...commonProps} />;
    }
  };

  const blockTypeOptions: { value: DocumentBlock['type']; label: string }[] = [
    { value: 'heading', label: 'Heading' },
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'list', label: 'List' },
    { value: 'table', label: 'Table' },
    { value: 'image', label: 'Image' },
  ];

  const handleAddBlock = (type: DocumentBlock['type']) => {
    onAddBlock(type, index + 1);
  };

  const handleBlockClick = () => {
    if (isEditing) {
      onBlockSelect(block.id);
    }
  };

  return (
    <div
      ref={blockRef}
      style={{
        position: 'relative',
        marginBottom: '16px',
        padding: '8px',
        borderRadius: '4px',
        border: isSelected 
          ? '2px solid #007bff' 
          : showControls 
            ? '2px solid #e9ecef' 
            : '2px solid transparent',
        transition: 'all 0.2s ease',
        backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.05)' : 'transparent',
      }}
      onMouseEnter={() => isEditing && setShowControls(true)}
      onMouseLeave={() => isEditing && setShowControls(false)}
      onClick={handleBlockClick}
    >
      {/* Add Block Button (appears between blocks) */}
      {isEditing && showAddButton && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
        }}>
          <div style={{
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}>
            +
          </div>
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
            zIndex: 30,
          }}>
            {blockTypeOptions.map(option => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddBlock(option.value);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '4px 8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                  borderRadius: '2px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Block Controls */}
      {isEditing && (showControls || isSelected) && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          zIndex: 10,
        }}>
          {/* Block Type Selector */}
          <select
            value={block.type}
            onChange={(e) => onBlockTypeChange(block.id, e.target.value as DocumentBlock['type'])}
            style={{
              background: '#333',
              border: '1px solid #555',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              fontSize: '11px',
            }}
          >
            {blockTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Move Controls */}
          <button
            onClick={() => onBlockMove(index, Math.max(0, index - 1))}
            disabled={index === 0}
            style={{
              background: index === 0 ? '#666' : '#007bff',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
            }}
            title="Move Up"
          >
            ↑
          </button>
          <button
            onClick={() => onBlockMove(index, index + 1)}
            style={{
              background: '#007bff',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
            title="Move Down"
          >
            ↓
          </button>

          {/* Duplicate Button */}
          <button
            onClick={() => onBlockDuplicate(block.id)}
            style={{
              background: '#28a745',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
            title="Duplicate (Ctrl+D)"
          >
            Copy
          </button>

          {/* Split Button */}
          <button
            onClick={() => onBlockSplit(block.id, block.content.length)}
            style={{
              background: '#ffc107',
              border: 'none',
              color: 'black',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
            title="Split (Ctrl+Enter)"
          >
            Split
          </button>

          {/* Merge Button */}
          <button
            onClick={() => onBlockMerge(block.id)}
            disabled={index === 0} // Can't merge first block
            style={{
              background: index === 0 ? '#666' : '#17a2b8',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
            }}
            title="Merge with Previous (Shift+Enter)"
          >
            Merge
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onBlockDelete(block.id)}
            style={{
              background: '#dc3545',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
            title="Delete (Ctrl+Delete)"
          >
            Delete
          </button>
        </div>
      )}

      {/* Block Content */}
      <div onMouseEnter={() => setShowAddButton(true)} onMouseLeave={() => setShowAddButton(false)}>
        {renderBlock()}
      </div>

      {/* Keyboard Shortcuts Help */}
      {isEditing && isSelected && (
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '0',
          fontSize: '10px',
          color: '#666',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '4px 8px',
          borderRadius: '2px',
          border: '1px solid #dee2e6',
        }}>
          Ctrl+D: Duplicate | Ctrl+Enter: Split | Shift+Enter: Merge | Ctrl+Delete: Delete
        </div>
      )}
    </div>
  );
};

export default BlockWithControls;
