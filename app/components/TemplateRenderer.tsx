'use client';

import React from 'react';
import { TemplateDefinition, TemplateElement } from '../types/template';

interface TemplateRendererProps {
  template: TemplateDefinition;
  onElementClick?: (elementId: string) => void;
  isEditable?: boolean;
  scale?: number;
}

// Individual Element Renderers (like Canva's component library)
const TextElement: React.FC<{ element: TemplateElement; scale?: number }> = ({ element, scale = 1 }) => {
  const style = {
    position: 'absolute' as const,
    left: element.position.x * scale,
    top: element.position.y * scale,
    width: element.size?.width ? element.size.width * scale : 'auto',
    height: element.size?.height ? element.size.height * scale : 'auto',
    ...element.style,
  };

  return (
    <div style={style} className="text-element">
      {element.content}
    </div>
  );
};

const ImageElement: React.FC<{ element: TemplateElement; scale?: number }> = ({ element, scale = 1 }) => {
  const style = {
    position: 'absolute' as const,
    left: element.position.x * scale,
    top: element.position.y * scale,
    width: element.size?.width ? element.size.width * scale : 'auto',
    height: element.size?.height ? element.size.height * scale : 'auto',
    ...element.style,
  };

  return (
    <img 
      src={element.src} 
      alt={element.content || 'Template image'}
      style={style}
      className="image-element"
    />
  );
};

const ShapeElement: React.FC<{ element: TemplateElement; scale?: number }> = ({ element, scale = 1 }) => {
  const style = {
    position: 'absolute' as const,
    left: element.position.x * scale,
    top: element.position.y * scale,
    width: element.size?.width ? element.size.width * scale : 'auto',
    height: element.size?.height ? element.size.height * scale : 'auto',
    ...element.style,
  };

  return (
    <div style={style} className="shape-element" />
  );
};

// Main Template Renderer (like Canva's canvas)
const TemplateRenderer: React.FC<TemplateRendererProps> = ({ 
  template, 
  onElementClick, 
  isEditable = false,
  scale = 1 
}) => {
  const renderElement = (element: TemplateElement) => {
    const commonProps = {
      key: element.id,
      onClick: () => onElementClick?.(element.id),
      style: { cursor: isEditable ? 'pointer' : 'default' }
    };

    switch (element.type) {
      case 'text':
        return <TextElement element={element} scale={scale} {...commonProps} />;
      case 'image':
        return <ImageElement element={element} scale={scale} {...commonProps} />;
      case 'shape':
        return <ShapeElement element={element} scale={scale} {...commonProps} />;
      default:
        return null;
    }
  };

  const canvasStyle = {
    width: template.dimensions.width * scale,
    height: template.dimensions.height * scale,
    position: 'relative' as const,
    backgroundColor: '#ffffff',
    border: isEditable ? '2px solid #e5e7eb' : 'none',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  return (
    <div className="template-renderer">
      <div style={canvasStyle} className="template-canvas">
        {template.elements.map(renderElement)}
      </div>
      
      {/* Template Info */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-600">{template.category}</p>
        <div className="flex justify-center gap-2 mt-2">
          {template.metadata.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateRenderer;
