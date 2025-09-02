'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import BlockWithControls from './BlockWithControls';
import ExportDialog from './ExportDialog';
import { DocumentBlock, StructuredDocument } from '../types/document';
import { parseDocumentToBlocks } from '../utils/documentParser';
import {
  createNewBlock,
  addBlock,
  deleteBlock,
  moveBlock,
  duplicateBlock,
  changeBlockType,
  splitBlock,
  mergeBlock,
  updateBlock,
  createHistory,
  addToHistory,
  canUndo,
  canRedo,
  applyOperation,
  handleKeyboardShortcut,
  type BlockOperation,
  type DocumentHistory,
} from '../utils/blockOperations';

interface DocumentEditorProps {
  document: StructuredDocument;
  onSave: (document: StructuredDocument) => void;
  onExport?: (document: StructuredDocument) => void;
  autoSaveInterval?: number; // in milliseconds
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document: initialDocument,
  onSave,
  onExport,
  autoSaveInterval = 30000, // 30 seconds
}) => {
  const [currentDocument, setCurrentDocument] = useState<StructuredDocument>(initialDocument);
  const [isEditing, setIsEditing] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [history, setHistory] = useState<DocumentHistory>(createHistory(50));
  const [showExportDialog, setShowExportDialog] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, autoSaveInterval]);

  const handleBlockChange = useCallback((blockId: string, content: string, styling: DocumentBlock['styling']) => {
    const result = updateBlock(currentDocument, blockId, content, styling);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  const handleBlockDelete = useCallback((blockId: string) => {
    const result = deleteBlock(currentDocument, blockId);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
    setSelectedBlockId(null);
  }, [currentDocument]);

  const handleBlockMove = useCallback((fromIndex: number, toIndex: number) => {
    const result = moveBlock(currentDocument, fromIndex, toIndex);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  const handleBlockTypeChange = useCallback((blockId: string, newType: DocumentBlock['type']) => {
    const result = changeBlockType(currentDocument, blockId, newType);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  const handleImageReplace = useCallback((blockId: string, newImageUrl: string) => {
    const result = updateBlock(currentDocument, blockId, undefined, { ...currentDocument.blocks.find(b => b.id === blockId)?.styling });
    const updatedDocument = {
      ...result.document,
      blocks: result.document.blocks.map((block: any) =>
        block.id === blockId ? { ...block, imageUrl: newImageUrl } : block
      ),
    };
    setCurrentDocument(updatedDocument);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  const handleListTypeChange = useCallback((blockId: string, listType: 'bullet' | 'numbered') => {
    const result = updateBlock(currentDocument, blockId, undefined, { ...currentDocument.blocks.find(b => b.id === blockId)?.styling });
    const updatedDocument = {
      ...result.document,
      blocks: result.document.blocks.map((block: any) =>
        block.id === blockId ? { ...block, listType } : block
      ),
    };
    setCurrentDocument(updatedDocument);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const fromIndex = result.source.index;
    const toIndex = result.destination.index;

    if (fromIndex !== toIndex) {
      handleBlockMove(fromIndex, toIndex);
    }
  }, [handleBlockMove]);

  const handleAddBlock = useCallback((type: DocumentBlock['type'] = 'paragraph', index?: number) => {
    const newBlock = createNewBlock(type);
    const insertIndex = index !== undefined ? index : currentDocument.blocks.length;
    const result = addBlock(currentDocument, newBlock, insertIndex);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
    setSelectedBlockId(newBlock.id);
  }, [currentDocument]);

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      await onSave(currentDocument);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentDocument, onSave, hasUnsavedChanges]);

  const handleExport = useCallback(() => {
    setShowExportDialog(true);
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedDocument = await parseDocumentToBlocks(file, file.name);
      setCurrentDocument(parsedDocument);
      setHistory(createHistory(50));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Failed to parse uploaded file:', error);
    }
  }, []);

  // New block operation handlers
  const handleBlockDuplicate = useCallback((blockId: string) => {
    const result = duplicateBlock(currentDocument, blockId);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  const handleBlockSplit = useCallback((blockId: string, splitIndex: number) => {
    const result = splitBlock(currentDocument, blockId, splitIndex);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  const handleBlockMerge = useCallback((blockId: string) => {
    const result = mergeBlock(currentDocument, blockId);
    setCurrentDocument(result.document);
    setHistory(prev => addToHistory(prev, result.operation));
    setHasUnsavedChanges(true);
  }, [currentDocument]);

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (canUndo(history)) {
      const operation = history.operations[history.currentIndex];
      const newDocument = applyOperation(currentDocument, operation);
      setCurrentDocument(newDocument);
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
      }));
      setHasUnsavedChanges(true);
    }
  }, [history, currentDocument]);

  const handleRedo = useCallback(() => {
    if (canRedo(history)) {
      const operation = history.operations[history.currentIndex + 1];
      const newDocument = applyOperation(currentDocument, operation);
      setCurrentDocument(newDocument);
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
      setHasUnsavedChanges(true);
    }
  }, [history, currentDocument]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isEditing) return;

      const handled = handleKeyboardShortcut(event, currentDocument, selectedBlockId, {
        onDelete: handleBlockDelete,
        onDuplicate: handleBlockDuplicate,
        onSplit: handleBlockSplit,
        onMerge: handleBlockMerge,
        onUndo: handleUndo,
        onRedo: handleRedo,
      });

      if (handled) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, currentDocument, selectedBlockId, handleBlockDelete, handleBlockDuplicate, handleBlockSplit, handleBlockMerge, handleUndo, handleRedo]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Document Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            {currentDocument.title}
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            Last saved: {lastSaved.toLocaleTimeString()}
            {hasUnsavedChanges && ' (unsaved changes)'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Undo/Redo Buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={handleUndo}
              disabled={!canUndo(history)}
              style={{
                background: canUndo(history) ? '#6c757d' : '#e9ecef',
                color: canUndo(history) ? 'white' : '#6c757d',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: canUndo(history) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo(history)}
              style={{
                background: canRedo(history) ? '#6c757d' : '#e9ecef',
                color: canRedo(history) ? 'white' : '#6c757d',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: canRedo(history) ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
              title="Redo (Ctrl+Shift+Z)"
            >
              ↷
            </button>
          </div>

          {/* File Upload */}
          <input
            type="file"
            accept=".docx,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            style={{
              background: '#6c757d',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Upload File
          </label>

          {/* Add Block Button */}
          <select
            onChange={(e) => handleAddBlock(e.target.value as DocumentBlock['type'])}
            value=""
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              fontSize: '14px',
            }}
          >
            <option value="">Add Block...</option>
            <option value="heading">Heading</option>
            <option value="paragraph">Paragraph</option>
            <option value="list">List</option>
            <option value="table">Table</option>
            <option value="image">Image</option>
          </select>

          {/* Edit/View Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: isEditing ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isEditing ? 'View' : 'Edit'}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            style={{
              background: hasUnsavedChanges ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
              fontSize: '14px',
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        padding: '20px',
        minHeight: '600px',
      }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{ minHeight: '100px' }}
              >
                {currentDocument.blocks.map((block, index) => (
                  <Draggable
                    key={block.id}
                    draggableId={block.id}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.8 : 1,
                        }}
                      >
                        <BlockWithControls
                          block={block}
                          index={index}
                          isEditing={isEditing}
                          isSelected={selectedBlockId === block.id}
                          onBlockChange={handleBlockChange}
                          onBlockDelete={handleBlockDelete}
                          onBlockMove={handleBlockMove}
                          onBlockTypeChange={handleBlockTypeChange}
                          onBlockDuplicate={handleBlockDuplicate}
                          onBlockSplit={handleBlockSplit}
                          onBlockMerge={handleBlockMerge}
                          onAddBlock={handleAddBlock}
                          onImageReplace={handleImageReplace}
                          onListTypeChange={handleListTypeChange}
                          onBlockSelect={setSelectedBlockId}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Empty State */}
        {currentDocument.blocks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666',
          }}>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>
              No content yet. Start by adding a block or uploading a document.
            </p>
            <button
              onClick={() => handleAddBlock('paragraph')}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Add First Block
            </button>
          </div>
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        document={currentDocument}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  );
};

export default DocumentEditor;