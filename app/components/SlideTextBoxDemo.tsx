'use client';

import React, { useState, useCallback } from 'react';
import SlideTextBox, { SlideTextBoxProps } from './SlideTextBox';

interface TextBoxData {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function SlideTextBoxDemo() {
  const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([
    {
      id: '1',
      text: 'Welcome to the presentation!',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 100 }
    },
    {
      id: '2',
      text: 'This is a second text box with some content.',
      position: { x: 100, y: 250 },
      size: { width: 350, height: 120 }
    }
  ]);

  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null);
  const [nextId, setNextId] = useState(3);

  // Handle text box updates
  const handleTextBoxUpdate = useCallback((data: {
    id: string;
    text: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }) => {
    setTextBoxes(prev => 
      prev.map(box => 
        box.id === data.id 
          ? { ...box, text: data.text, position: data.position, size: data.size }
          : box
      )
    );
  }, []);

  // Handle text box selection
  const handleTextBoxSelect = useCallback((id: string) => {
    setSelectedTextBox(id);
  }, []);

  // Add new text box
  const addTextBox = useCallback(() => {
    const newTextBox: TextBoxData = {
      id: nextId.toString(),
      text: 'New text box',
      position: { x: 150, y: 150 },
      size: { width: 250, height: 100 }
    };
    
    setTextBoxes(prev => [...prev, newTextBox]);
    setSelectedTextBox(newTextBox.id);
    setNextId(prev => prev + 1);
  }, [nextId]);

  // Delete selected text box
  const deleteSelectedTextBox = useCallback(() => {
    if (selectedTextBox) {
      setTextBoxes(prev => prev.filter(box => box.id !== selectedTextBox));
      setSelectedTextBox(null);
    }
  }, [selectedTextBox]);

  // Export slide data as JSON
  const exportSlideData = useCallback(() => {
    const slideData = {
      textBoxes,
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    console.log('Slide Data:', slideData);
    return slideData;
  }, [textBoxes]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle keyboard events when typing
      }

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelectedTextBox();
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedTextBox(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedTextBox]);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">Presentation Editor</h1>
          <button
            onClick={addTextBox}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Text Box
          </button>
          {selectedTextBox && (
            <button
              onClick={deleteSelectedTextBox}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={exportSlideData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Data
          </button>
          <div className="text-sm text-gray-600">
            {textBoxes.length} text box{textBoxes.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div 
        className="flex-1 relative overflow-hidden bg-white"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
        onClick={() => setSelectedTextBox(null)}
      >
        {textBoxes.map((textBox) => (
          <SlideTextBox
            key={textBox.id}
            id={textBox.id}
            initialText={textBox.text}
            initialPosition={textBox.position}
            initialSize={textBox.size}
            onUpdate={handleTextBoxUpdate}
            onSelect={handleTextBoxSelect}
            isSelected={selectedTextBox === textBox.id}
            zIndex={selectedTextBox === textBox.id ? 10 : 1}
            bounds="parent"
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Instructions:</strong></p>
          <p>• Click to select a text box</p>
          <p>• Double-click to edit text</p>
          <p>• Drag to move, resize handles to resize</p>
          <p>• Press Delete to remove selected text box</p>
          <p>• Press Escape to deselect</p>
        </div>
      </div>
    </div>
  );
}
