'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Transformer, Rect } from 'react-konva';
import { useEditorStore } from '../stores/useEditorStore';
import SimpleColorPicker from './SimpleColorPicker';

interface TextElement {
  id: string;
  type: 'heading' | 'subheading' | 'body';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  isEditing: boolean;
}

interface PresentationCanvasProps {
  width?: number;
  height?: number;
}

const PresentationCanvas: React.FC<PresentationCanvasProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  // Add new text element
  const addTextElement = (type: 'heading' | 'subheading' | 'body') => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100 + elements.length * 80,
      width: type === 'heading' ? 400 : type === 'subheading' ? 350 : 300,
      height: type === 'heading' ? 60 : type === 'subheading' ? 50 : 40,
      text: type === 'heading' ? 'Add heading' : type === 'subheading' ? 'Add subheading' : 'Add body',
      fontSize: type === 'heading' ? 32 : type === 'subheading' ? 24 : 16,
      fontFamily: 'Inter',
      fontWeight: type === 'heading' ? 'bold' : type === 'subheading' ? '600' : 'normal',
      color: '#000000',
      isEditing: true
    };

    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
    setEditingId(newElement.id);

    // Auto-start editing after a short delay
    setTimeout(() => {
      const textNode = stageRef.current?.findOne(`#${newElement.id}`);
      if (textNode) {
        textNode.editable(true);
        textNode.focus();
        textNode.selectText();
      }
    }, 100);
  };

  // Update element
  const updateElement = (id: string, updates: Partial<TextElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
    setEditingId(null);
  };

  // Handle element selection
  const handleElementClick = (id: string) => {
    setSelectedId(id);
    setEditingId(null);
  };

  // Handle double click to start editing
  const handleElementDblClick = (id: string) => {
    setEditingId(id);
    setSelectedId(id);
  };

  // Handle text change
  const handleTextChange = (id: string, newText: string) => {
    updateElement(id, { text: newText });
  };

  // Handle text editing finish
  const handleTextEditFinish = (id: string) => {
    setEditingId(null);
    updateElement(id, { isEditing: false });
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedId) {
      deleteElement(selectedId);
    }
    if (e.key === 'Escape' && editingId) {
      handleTextEditFinish(editingId);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingId]);

  // Update transformer when selection changes
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stageRef.current?.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-4">
        <div className="flex space-x-2">
          <button
            onClick={() => addTextElement('heading')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Heading
          </button>
          <button
            onClick={() => addTextElement('subheading')}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Add Subheading
          </button>
          <button
            onClick={() => addTextElement('body')}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Add Body
          </button>
        </div>
        
        {selectedId && (
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <span className="text-sm text-gray-600 font-medium">Format:</span>
            
            <select
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              onChange={(e) => updateElement(selectedId, { fontSize: parseInt(e.target.value) })}
              value={elements.find(el => el.id === selectedId)?.fontSize || 16}
            >
              <option value={12}>12px</option>
              <option value={14}>14px</option>
              <option value={16}>16px</option>
              <option value={18}>18px</option>
              <option value={20}>20px</option>
              <option value={24}>24px</option>
              <option value={28}>28px</option>
              <option value={32}>32px</option>
              <option value={36}>36px</option>
              <option value={48}>48px</option>
            </select>
            
            <button
              onClick={() => {
                const currentWeight = elements.find(el => el.id === selectedId)?.fontWeight;
                updateElement(selectedId, { 
                  fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' 
                });
              }}
              className={`px-3 py-1 border rounded text-sm font-bold transition-colors ${
                elements.find(el => el.id === selectedId)?.fontWeight === 'bold' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              B
            </button>
            
            <button
              onClick={() => {
                const currentWeight = elements.find(el => el.id === selectedId)?.fontWeight;
                updateElement(selectedId, { 
                  fontWeight: currentWeight === 'italic' ? 'normal' : 'italic' 
                });
              }}
              className={`px-3 py-1 border rounded text-sm italic transition-colors ${
                elements.find(el => el.id === selectedId)?.fontWeight === 'italic' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              I
            </button>
            
            <button
              onClick={() => {
                const currentWeight = elements.find(el => el.id === selectedId)?.fontWeight;
                updateElement(selectedId, { 
                  fontWeight: currentWeight === 'underline' ? 'normal' : 'underline' 
                });
              }}
              className={`px-3 py-1 border rounded text-sm underline transition-colors ${
                elements.find(el => el.id === selectedId)?.fontWeight === 'underline' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              U
            </button>
            
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Color:</span>
              {console.log('Rendering SimpleColorPicker with selectedId:', selectedId, 'elements:', elements)}
              <SimpleColorPicker
                value={elements.find(el => el.id === selectedId)?.color || '#000000'}
                onChange={(color) => {
                  console.log('Color changed to:', color, 'for element:', selectedId);
                  updateElement(selectedId, { color });
                }}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            onClick={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
                setEditingId(null);
              }
            }}
          >
            <Layer>
              {elements.map((element) => (
                <Text
                  key={element.id}
                  id={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  text={element.text}
                  fontSize={element.fontSize}
                  fontFamily={element.fontFamily}
                  fontWeight={element.fontWeight}
                  fill={element.text.includes('Add ') ? '#9ca3af' : element.color}
                  align="left"
                  verticalAlign="top"
                  padding={8}
                  draggable
                  editable={editingId === element.id}
                  stroke={selectedId === element.id ? '#3b82f6' : 'transparent'}
                  strokeWidth={selectedId === element.id ? 1 : 0}
                  onClick={() => handleElementClick(element.id)}
                  onDblClick={() => handleElementDblClick(element.id)}
                  onDragEnd={(e) => {
                    updateElement(element.id, {
                      x: e.target.x(),
                      y: e.target.y()
                    });
                  }}
                  onTransformEnd={() => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    updateElement(element.id, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(50, node.width() * scaleX),
                      height: Math.max(20, node.height() * scaleY)
                    });
                  }}
                  onTextChange={(e) => {
                    const newText = e.target.text();
                    handleTextChange(element.id, newText);
                  }}
                  onBlur={() => {
                    if (editingId === element.id) {
                      handleTextEditFinish(element.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.evt.key === 'Enter' && !e.evt.shiftKey) {
                      e.evt.preventDefault();
                      handleTextEditFinish(element.id);
                    }
                    if (e.evt.key === 'Escape') {
                      e.evt.preventDefault();
                      handleTextEditFinish(element.id);
                    }
                  }}
                />
              ))}
              
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  return newBox.width < 5 ? oldBox : newBox;
                }}
                enabledAnchors={['middle-left', 'middle-right', 'top-center', 'bottom-center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']}
                rotateEnabled={false}
                keepRatio={false}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
};

export default PresentationCanvas;
