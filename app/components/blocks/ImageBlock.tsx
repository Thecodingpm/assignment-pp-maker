'use client';

import React, { useState, useRef } from 'react';
import { DocumentBlock } from '../../types/document';

interface ImageBlockProps {
  block: DocumentBlock;
  onChange: (blockId: string, content: string, styling: DocumentBlock['styling']) => void;
  onImageReplace?: (blockId: string, newImageUrl: string) => void;
  isEditing?: boolean;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ 
  block, 
  onChange, 
  onImageReplace, 
  isEditing = true 
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageReplace) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageReplace(block.id, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResize = (direction: 'width' | 'height', value: string) => {
    const newStyling = { ...block.styling } as any;
    if (direction === 'width') {
      newStyling.width = value;
    } else {
      newStyling.height = value;
    }
    onChange(block.id, block.content, newStyling);
  };

  const imageStyle: React.CSSProperties = {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '10px 0',
    ...((block.styling as any).width && { width: (block.styling as any).width }),
    ...((block.styling as any).height && { height: (block.styling as any).height }),
    ...(block.styling.marginTop && { marginTop: block.styling.marginTop }),
    ...(block.styling.marginBottom && { marginBottom: block.styling.marginBottom }),
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...(isEditing && {
      border: showControls ? '2px dashed #007bff' : '2px dashed transparent',
      borderRadius: '4px',
      padding: '4px',
    }),
  };

  if (!block.imageUrl) {
    return (
      <div style={containerStyle}>
        <div style={{
          width: '200px',
          height: '150px',
          border: '2px dashed #ccc',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '14px',
        }}>
          {isEditing ? 'No image' : 'Image not available'}
        </div>
      </div>
    );
  }

  return (
    <div 
      style={containerStyle}
      onMouseEnter={() => isEditing && setShowControls(true)}
      onMouseLeave={() => isEditing && setShowControls(false)}
    >
      <img
        src={block.imageUrl}
        alt={block.content || 'Document image'}
        style={imageStyle}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      
      {isEditing && showControls && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '0',
          right: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#007bff',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Replace
          </button>
          
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <label style={{ fontSize: '11px' }}>W:</label>
            <input
              type="text"
              placeholder="auto"
              value={(block.styling as any).width || ''}
              onChange={(e) => handleResize('width', e.target.value)}
              style={{
                width: '50px',
                fontSize: '11px',
                padding: '2px',
                border: '1px solid #ccc',
                borderRadius: '2px',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <label style={{ fontSize: '11px' }}>H:</label>
            <input
              type="text"
              placeholder="auto"
              value={(block.styling as any).height || ''}
              onChange={(e) => handleResize('height', e.target.value)}
              style={{
                width: '50px',
                fontSize: '11px',
                padding: '2px',
                border: '1px solid #ccc',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageReplace}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageBlock;
