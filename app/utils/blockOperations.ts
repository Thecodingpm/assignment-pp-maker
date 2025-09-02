import { DocumentBlock, StructuredDocument } from '../types/document';

// Block operation types for undo/redo
export interface BlockOperation {
  type: 'add' | 'delete' | 'move' | 'duplicate' | 'changeType' | 'split' | 'merge' | 'update';
  blockId?: string;
  index?: number;
  newIndex?: number;
  block?: DocumentBlock;
  oldBlock?: DocumentBlock;
  newType?: DocumentBlock['type'];
  splitIndex?: number;
  mergeWithIndex?: number;
  content?: string;
  styling?: DocumentBlock['styling'];
  timestamp: number;
}

// History management
export interface DocumentHistory {
  operations: BlockOperation[];
  currentIndex: number;
  maxHistory: number;
}

// Helper function to create a new block
export function createNewBlock(
  type: DocumentBlock['type'] = 'paragraph',
  content: string = '',
  styling?: Partial<DocumentBlock['styling']>
): DocumentBlock {
  const defaultStyling: DocumentBlock['styling'] = {
    fontSize: type === 'heading' ? '24px' : '16px',
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    textAlign: 'left',
    ...styling,
  };

  const block: DocumentBlock = {
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    styling: defaultStyling,
  };

  // Add type-specific properties
  if (type === 'heading') {
    block.level = 2;
  } else if (type === 'list') {
    block.listType = 'bullet';
  }

  return block;
}

// Add a new block at a specific index
export function addBlock(
  document: StructuredDocument,
  block: DocumentBlock,
  index: number
): { document: StructuredDocument; operation: BlockOperation } {
  const newBlocks = [...document.blocks];
  newBlocks.splice(index, 0, block);

  const operation: BlockOperation = {
    type: 'add',
    blockId: block.id,
    index,
    block,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// Delete a block by ID
export function deleteBlock(
  document: StructuredDocument,
  blockId: string
): { document: StructuredDocument; operation: BlockOperation } {
  const index = document.blocks.findIndex(block => block.id === blockId);
  if (index === -1) {
    throw new Error(`Block with ID ${blockId} not found`);
  }

  const deletedBlock = document.blocks[index];
  const newBlocks = document.blocks.filter(block => block.id !== blockId);

  const operation: BlockOperation = {
    type: 'delete',
    blockId,
    index,
    block: deletedBlock,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// Move a block from one index to another
export function moveBlock(
  document: StructuredDocument,
  fromIndex: number,
  toIndex: number
): { document: StructuredDocument; operation: BlockOperation } {
  if (fromIndex === toIndex) {
    throw new Error('Source and destination indices are the same');
  }

  const newBlocks = [...document.blocks];
  const [movedBlock] = newBlocks.splice(fromIndex, 1);
  newBlocks.splice(toIndex, 0, movedBlock);

  const operation: BlockOperation = {
    type: 'move',
    blockId: movedBlock.id,
    index: fromIndex,
    newIndex: toIndex,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// Duplicate a block
export function duplicateBlock(
  document: StructuredDocument,
  blockId: string
): { document: StructuredDocument; operation: BlockOperation } {
  const index = document.blocks.findIndex(block => block.id === blockId);
  if (index === -1) {
    throw new Error(`Block with ID ${blockId} not found`);
  }

  const originalBlock = document.blocks[index];
  const duplicatedBlock: DocumentBlock = {
    ...originalBlock,
    id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content: originalBlock.content + ' (copy)',
  };

  const newBlocks = [...document.blocks];
  newBlocks.splice(index + 1, 0, duplicatedBlock);

  const operation: BlockOperation = {
    type: 'duplicate',
    blockId: originalBlock.id,
    index,
    block: duplicatedBlock,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// Change block type
export function changeBlockType(
  document: StructuredDocument,
  blockId: string,
  newType: DocumentBlock['type']
): { document: StructuredDocument; operation: BlockOperation } {
  const index = document.blocks.findIndex(block => block.id === blockId);
  if (index === -1) {
    throw new Error(`Block with ID ${blockId} not found`);
  }

  const oldBlock = document.blocks[index];
  const newBlock: DocumentBlock = {
    ...oldBlock,
    type: newType,
  };

  // Add type-specific properties
  if (newType === 'heading' && !newBlock.level) {
    newBlock.level = 2;
  } else if (newType === 'list' && !newBlock.listType) {
    newBlock.listType = 'bullet';
  }

  // Remove type-specific properties that don't apply
  if (newType !== 'heading') {
    delete newBlock.level;
  }
  if (newType !== 'list') {
    delete newBlock.listType;
  }
  if (newType !== 'image') {
    delete newBlock.imageUrl;
  }

  const newBlocks = [...document.blocks];
  newBlocks[index] = newBlock;

  const operation: BlockOperation = {
    type: 'changeType',
    blockId,
    index,
    oldBlock,
    newType,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// Split a block at a specific character index
export function splitBlock(
  document: StructuredDocument,
  blockId: string,
  splitIndex: number
): { document: StructuredDocument; operation: BlockOperation } {
  const index = document.blocks.findIndex(block => block.id === blockId);
  if (index === -1) {
    throw new Error(`Block with ID ${blockId} not found`);
  }

  const originalBlock = document.blocks[index];
  const beforeSplit = originalBlock.content.substring(0, splitIndex);
  const afterSplit = originalBlock.content.substring(splitIndex);

  const newBlock = createNewBlock(originalBlock.type, afterSplit, originalBlock.styling);
  if (originalBlock.level) newBlock.level = originalBlock.level;
  if (originalBlock.listType) newBlock.listType = originalBlock.listType;
  if (originalBlock.imageUrl) newBlock.imageUrl = originalBlock.imageUrl;

  const newBlocks = [...document.blocks];
  newBlocks[index] = { ...originalBlock, content: beforeSplit };
  newBlocks.splice(index + 1, 0, newBlock);

  const operation: BlockOperation = {
    type: 'split',
    blockId,
    index,
    splitIndex,
    block: newBlock,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// Merge a block with the next block
export function mergeBlock(
  document: StructuredDocument,
  blockId: string
): { document: StructuredDocument; operation: BlockOperation } {
  const index = document.blocks.findIndex(block => block.id === blockId);
  if (index === -1) {
    throw new Error(`Block with ID ${blockId} not found`);
  }
  if (index === document.blocks.length - 1) {
    throw new Error('Cannot merge the last block');
  }

  const currentBlock = document.blocks[index];
  const nextBlock = document.blocks[index + 1];
  
  // Merge content with appropriate separator
  const separator = currentBlock.type === 'list' || nextBlock.type === 'list' ? '\n' : ' ';
  const mergedContent = currentBlock.content + separator + nextBlock.content;

  const mergedBlock: DocumentBlock = {
    ...currentBlock,
    content: mergedContent,
  };

  const newBlocks = [...document.blocks];
  newBlocks[index] = mergedBlock;
  newBlocks.splice(index + 1, 1);

  const operation: BlockOperation = {
    type: 'merge',
    blockId,
    index,
    mergeWithIndex: index + 1,
    block: nextBlock,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// Update block content and styling
export function updateBlock(
  document: StructuredDocument,
  blockId: string,
  content?: string,
  styling?: DocumentBlock['styling']
): { document: StructuredDocument; operation: BlockOperation } {
  const index = document.blocks.findIndex(block => block.id === blockId);
  if (index === -1) {
    throw new Error(`Block with ID ${blockId} not found`);
  }

  const oldBlock = document.blocks[index];
  const newBlock: DocumentBlock = {
    ...oldBlock,
    ...(content !== undefined && { content }),
    ...(styling !== undefined && { styling }),
  };

  const newBlocks = [...document.blocks];
  newBlocks[index] = newBlock;

  const operation: BlockOperation = {
    type: 'update',
    blockId,
    index,
    oldBlock,
    content,
    styling,
    timestamp: Date.now(),
  };

  return {
    document: {
      ...document,
      blocks: newBlocks,
      metadata: {
        ...document.metadata,
        lastModified: new Date().toISOString(),
      },
    },
    operation,
  };
}

// History management functions
export function createHistory(maxHistory: number = 50): DocumentHistory {
  return {
    operations: [],
    currentIndex: -1,
    maxHistory,
  };
}

export function addToHistory(
  history: DocumentHistory,
  operation: BlockOperation
): DocumentHistory {
  // Remove any operations after current index (when undoing and then making new changes)
  const operations = history.operations.slice(0, history.currentIndex + 1);
  
  // Add new operation
  operations.push(operation);
  
  // Limit history size
  if (operations.length > history.maxHistory) {
    operations.shift();
  }

  return {
    operations,
    currentIndex: operations.length - 1,
    maxHistory: history.maxHistory,
  };
}

export function canUndo(history: DocumentHistory): boolean {
  return history.currentIndex >= 0;
}

export function canRedo(history: DocumentHistory): boolean {
  return history.currentIndex < history.operations.length - 1;
}

// Apply operation to document (for undo/redo)
export function applyOperation(
  document: StructuredDocument,
  operation: BlockOperation
): StructuredDocument {
  switch (operation.type) {
    case 'add':
      if (operation.block && operation.index !== undefined) {
        const newBlocks = [...document.blocks];
        newBlocks.splice(operation.index, 0, operation.block);
        return { ...document, blocks: newBlocks };
      }
      break;

    case 'delete':
      if (operation.blockId) {
        return {
          ...document,
          blocks: document.blocks.filter(block => block.id !== operation.blockId),
        };
      }
      break;

    case 'move':
      if (operation.index !== undefined && operation.newIndex !== undefined) {
        const newBlocks = [...document.blocks];
        const [movedBlock] = newBlocks.splice(operation.index, 1);
        newBlocks.splice(operation.newIndex, 0, movedBlock);
        return { ...document, blocks: newBlocks };
      }
      break;

    case 'duplicate':
      if (operation.block && operation.index !== undefined) {
        const newBlocks = [...document.blocks];
        newBlocks.splice(operation.index + 1, 0, operation.block);
        return { ...document, blocks: newBlocks };
      }
      break;

    case 'changeType':
      if (operation.blockId && operation.oldBlock && operation.index !== undefined) {
        const newBlocks = [...document.blocks];
        newBlocks[operation.index] = operation.oldBlock;
        return { ...document, blocks: newBlocks };
      }
      break;

    case 'split':
      if (operation.index !== undefined) {
        const newBlocks = [...document.blocks];
        // Remove the split block and restore original
        newBlocks.splice(operation.index + 1, 1);
        return { ...document, blocks: newBlocks };
      }
      break;

    case 'merge':
      if (operation.block && operation.index !== undefined && operation.mergeWithIndex !== undefined) {
        const newBlocks = [...document.blocks];
        newBlocks.splice(operation.mergeWithIndex, 0, operation.block);
        return { ...document, blocks: newBlocks };
      }
      break;

    case 'update':
      if (operation.blockId && operation.oldBlock && operation.index !== undefined) {
        const newBlocks = [...document.blocks];
        newBlocks[operation.index] = operation.oldBlock;
        return { ...document, blocks: newBlocks };
      }
      break;
  }

  return document;
}

// Keyboard shortcut helpers
export function handleKeyboardShortcut(
  event: KeyboardEvent,
  document: StructuredDocument,
  selectedBlockId: string | null,
  callbacks: {
    onDelete?: (blockId: string) => void;
    onDuplicate?: (blockId: string) => void;
    onSplit?: (blockId: string, splitIndex: number) => void;
    onMerge?: (blockId: string) => void;
    onUndo?: () => void;
    onRedo?: () => void;
  }
): boolean {
  // Delete block
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedBlockId && (event.ctrlKey || event.metaKey)) {
      callbacks.onDelete?.(selectedBlockId);
      return true;
    }
  }

  // Duplicate block
  if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
    if (selectedBlockId) {
      callbacks.onDuplicate?.(selectedBlockId);
      return true;
    }
  }

  // Split block (Enter key)
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    if (selectedBlockId) {
      // This would need to be implemented with cursor position
      callbacks.onSplit?.(selectedBlockId, 0);
      return true;
    }
  }

  // Merge block (Shift + Enter)
  if (event.key === 'Enter' && event.shiftKey) {
    if (selectedBlockId) {
      callbacks.onMerge?.(selectedBlockId);
      return true;
    }
  }

  // Undo
  if (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
    callbacks.onUndo?.();
    return true;
  }

  // Redo
  if (event.key === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
    callbacks.onRedo?.();
    return true;
  }

  return false;
}
