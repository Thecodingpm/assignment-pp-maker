'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TemplateDefinition, TemplateElement } from '../types/template';

interface TemplateEditorProps {
  initialTemplate?: TemplateDefinition;
  onSave?: (template: TemplateDefinition) => void;
  onCancel?: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onCancel
}) => {
  const [template, setTemplate] = useState<TemplateDefinition>(
    initialTemplate || {
      id: `template_${Date.now()}`,
      name: 'New Template',
      category: 'business',
      thumbnail: '',
      dimensions: { width: 1920, height: 1080 },
      elements: [],
      metadata: {
        author: 'User',
        createdAt: new Date(),
        tags: [],
        difficulty: 'beginner'
      }
    }
  );
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Element types available for drag & drop
  const elementTypes = [
    { type: 'text', label: 'Text', icon: 'T' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'shape', label: 'Shape', icon: '⬜' },
    { type: 'background', label: 'Background', icon: '🎨' }
  ];

  // Add new element to template
  const addElement = (type: string, position: { x: number; y: number }) => {
    const newElement: TemplateElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      position,
      size: type === 'text' ? { width: 200, height: 50 } : { width: 100, height: 100 },
      style: getDefaultStyle(type),
      content: type === 'text' ? 'New Text' : '',
      src: type === 'image' ? '/placeholder-image.jpg' : undefined
    };

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  // Get default styles for element types
  const getDefaultStyle = (type: string) => {
    switch (type) {
      case 'text':
        return {
          fontSize: 24,
          fontFamily: 'Inter',
          color: '#000000',
          textAlign: 'left'
        };
      case 'shape':
        return {
          backgroundColor: '#3b82f6',
          borderRadius: '8px'
        };
      case 'background':
        return {
          backgroundColor: '#f8fafc'
        };
      default:
        return {};
    }
  };

  // Handle canvas click to add elements
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add a text element by default on click
    addElement('text', { x, y });
  };

  // Handle element selection
  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  // Update element properties
  const updateElement = (elementId: string, updates: Partial<TemplateElement>) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    }));
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId)
    }));
    setSelectedElement(null);
  };

  // Handle drag & drop from toolbar
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('elementType', type);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!canvasRef.current) return;
    
    const elementType = e.dataTransfer.getData('elementType');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addElement(elementType, { x, y });
  };

  // Save template
  const handleSave = () => {
    onSave?.(template);
  };

  return (
    <div className="template-editor h-screen flex">
      {/* Toolbar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h3 className="text-lg font-semibold mb-4">Elements</h3>
        
        {/* Element Types */}
        <div className="space-y-2">
          {elementTypes.map(({ type, label, icon }) => (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleDragStart(e, type)}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Template Properties */}
        <div className="mt-8">
          <h4 className="font-semibold mb-3">Template Properties</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={template.category}
                onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="business">Business</option>
                <option value="education">Education</option>
                <option value="creative">Creative</option>
                <option value="technical">Technical</option>
                <option value="marketing">Marketing</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-2">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Template
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Template Editor</h2>
            <div className="text-sm text-gray-500">
              {template.dimensions.width} × {template.dimensions.height}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 p-8 overflow-auto">
          <div
            ref={canvasRef}
            className="bg-white shadow-lg mx-auto relative"
            style={{
              width: template.dimensions.width / 2,
              height: template.dimensions.height / 2,
              transform: 'scale(0.5)',
              transformOrigin: 'top left'
            }}
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Render Elements */}
            {template.elements.map(element => (
              <div
                key={element.id}
                className={`absolute cursor-pointer ${
                  selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size?.width,
                  height: element.size?.height,
                  ...element.style
                }}
                onClick={(e) => handleElementClick(element.id, e)}
              >
                {element.type === 'text' && element.content}
                {element.type === 'image' && (
                  <img 
                    src={element.src} 
                    alt="Template element"
                    className="w-full h-full object-cover"
                  />
                )}
                {element.type === 'shape' && <div className="w-full h-full" />}
                {element.type === 'background' && <div className="w-full h-full" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
          <h3 className="text-lg font-semibold mb-4">Element Properties</h3>
          
          {(() => {
            const element = template.elements.find(el => el.id === selectedElement);
            if (!element) return null;

            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position X
                  </label>
                  <input
                    type="number"
                    value={element.position.x}
                    onChange={(e) => updateElement(element.id, {
                      position: { ...element.position, x: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Y
                  </label>
                  <input
                    type="number"
                    value={element.position.y}
                    onChange={(e) => updateElement(element.id, {
                      position: { ...element.position, y: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {element.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Content
                    </label>
                    <textarea
                      value={element.content || ''}
                      onChange={(e) => updateElement(element.id, { content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                )}

                <button
                  onClick={() => deleteElement(element.id)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Element
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
