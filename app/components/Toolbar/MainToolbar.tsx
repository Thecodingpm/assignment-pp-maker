'use client';

import React from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Undo,
  Redo,
  Save
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

const MainToolbar: React.FC = () => {
  const { selectedElementIds, slides, currentSlideIndex } = useEditorStore();
  const currentSlide = slides[currentSlideIndex];
  
  // Get selected text element for formatting
  const selectedTextElement = currentSlide?.elements.find(
    element => element.type === 'text' && selectedElementIds.includes(element.id)
  ) as any;

  const handleAddText = () => {
    if (!currentSlide) return;
    
    const newTextElement = {
      type: 'text' as const,
      x: 100,
      y: 100,
      width: 200,
      height: 60,
      rotation: 0,
      zIndex: 1,
      content: 'Click to add text',
      fontSize: 24,
      fontFamily: 'Inter',
      fontWeight: '400',
      color: '#000000',
      textAlign: 'left' as const,
      lineHeight: 1.2,
      isEditing: false,
    };
    
    useEditorStore.getState().addElement(currentSlide.id, newTextElement);
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle') => {
    if (!currentSlide) return;
    
    const newShapeElement = {
      type: 'shape' as const,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 1,
      shapeType,
      fillColor: '#e5e7eb',
      strokeColor: '#9ca3af',
      strokeWidth: 1,
    };
    
    useEditorStore.getState().addElement(currentSlide.id, newShapeElement);
  };

  const handleAddImage = () => {
    if (!currentSlide) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImageElement = {
            type: 'image' as const,
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            rotation: 0,
            zIndex: 1,
            src: e.target?.result as string,
            alt: file.name,
          };
          
          useEditorStore.getState().addElement(currentSlide.id, newImageElement);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleTextFormat = (property: string, value: any) => {
    if (!selectedTextElement || !currentSlide) return;
    
    useEditorStore.getState().updateElement(currentSlide.id, selectedTextElement.id, {
      [property]: value,
    });
  };

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log('Undo');
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log('Redo');
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save');
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      {/* Left side - Insert tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddText}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Type className="w-4 h-4" />
          Text
        </button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAddShape('rectangle')}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddShape('circle')}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddShape('triangle')}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Triangle"
          >
            <Triangle className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={handleAddImage}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          Image
        </button>
      </div>

      {/* Center - Text formatting (only show when text is selected) */}
      {selectedTextElement && (
        <div className="flex items-center gap-2">
          {/* Font weight */}
          <button
            onClick={() => handleTextFormat('fontWeight', selectedTextElement.fontWeight === 'bold' ? '400' : 'bold')}
            className={`p-2 rounded transition-colors ${
              selectedTextElement.fontWeight === 'bold' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleTextFormat('fontWeight', selectedTextElement.fontWeight === '600' ? '400' : '600')}
            className={`p-2 rounded transition-colors ${
              selectedTextElement.fontWeight === '600' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Semi-bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Text alignment */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleTextFormat('textAlign', 'left')}
              className={`p-2 rounded transition-colors ${
                selectedTextElement.textAlign === 'left' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleTextFormat('textAlign', 'center')}
              className={`p-2 rounded transition-colors ${
                selectedTextElement.textAlign === 'center' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleTextFormat('textAlign', 'right')}
              className={`p-2 rounded transition-colors ${
                selectedTextElement.textAlign === 'right' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Align right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Font size */}
          <select
            value={selectedTextElement.fontSize}
            onChange={(e) => handleTextFormat('fontSize', parseInt(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {/* Color picker */}
          <input
            type="color"
            value={selectedTextElement.color}
            onChange={(e) => handleTextFormat('color', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="Text color"
          />
        </div>
      )}

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUndo}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
};

export default MainToolbar;
