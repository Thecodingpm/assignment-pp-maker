import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export type SerializedImageNode = Spread<
  {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    shadow?: string;
    type: 'image';
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __alt: string;
  __width?: number;
  __height?: number;
  __borderRadius: number;
  __borderWidth: number;
  __borderColor: string;
  __shadow: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src, 
      node.__alt, 
      node.__width, 
      node.__height,
      node.__borderRadius,
      node.__borderWidth,
      node.__borderColor,
      node.__shadow,
      node.__key
    );
  }

  constructor(
    src: string, 
    alt: string, 
    width?: number, 
    height?: number,
    borderRadius: number = 8,
    borderWidth: number = 1,
    borderColor: string = '#e5e7eb',
    shadow: string = '0 4px 6px -1px rgba(0,0,0,0.1)',
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
    this.__borderRadius = borderRadius;
    this.__borderWidth = borderWidth;
    this.__borderColor = borderColor;
    this.__shadow = shadow;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    return span;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, alt, width, height, borderRadius, borderWidth, borderColor, shadow } = serializedNode;
    return new ImageNode(src, alt, width, height, borderRadius, borderWidth, borderColor, shadow);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      borderRadius: this.__borderRadius,
      borderWidth: this.__borderWidth,
      borderColor: this.__borderColor,
      shadow: this.__shadow,
    };
  }

  setWidth(width: number): void {
    this.__width = width;
  }

  setHeight(height: number): void {
    this.__height = height;
  }

  setBorderRadius(radius: number): void {
    this.__borderRadius = radius;
  }

  setBorderWidth(width: number): void {
    this.__borderWidth = width;
  }

  setBorderColor(color: string): void {
    this.__borderColor = color;
  }

  setShadow(shadow: string): void {
    this.__shadow = shadow;
  }

  decorate(): React.ReactElement {
    console.log('🎨 ImageNode decorating with src:', this.__src.substring(0, 50) + '...');
    console.log('🎨 ImageNode key:', this.__key);
    console.log('🎨 ImageNode type:', this.getType());
    return (
      <ImageEditor 
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        borderRadius={this.__borderRadius}
        borderWidth={this.__borderWidth}
        borderColor={this.__borderColor}
        shadow={this.__shadow}
        nodeKey={this.__key}
      />
    );
  }
}

// Image Editor Component
interface ImageEditorProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadow: string;
  nodeKey: string;
}

function ImageEditor({ 
  src, 
  alt, 
  width, 
  height, 
  borderRadius, 
  borderWidth, 
  borderColor, 
  shadow, 
  nodeKey 
}: ImageEditorProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = React.useState(false);
  const [imageWidth, setImageWidth] = React.useState(width || 300);
  const [imageHeight, setImageHeight] = React.useState(height || 200);
  
  console.log('🎨 ImageEditor rendered with src:', src.substring(0, 50) + '...');
  console.log('🎨 ImageEditor nodeKey:', nodeKey);
  
  // Position states for dragging
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, startX: 0, startY: 0 });
  
  const aspectRatio = width && height ? width / height : 1.5;
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showCoords, setShowCoords] = React.useState(false);

  // Fixed resize logic with proper calculations
  React.useEffect(() => {
    if (!isResizing || !containerRef.current) return;
    
    let startWidth = imageWidth;
    let startHeight = imageHeight;
    let startMouseX = 0;
    let startMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      
      // Use the larger delta for more responsive resizing
      const delta = Math.max(deltaX, deltaY);
      const newWidth = Math.max(50, startWidth + delta);
      const newHeight = newWidth / aspectRatio;
      
      setImageWidth(Math.round(newWidth));
      setImageHeight(Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const initResize = (e: MouseEvent) => {
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startWidth = imageWidth;
      startHeight = imageHeight;
    };

    // Initialize on first mouse move
    const initMouseMove = (e: MouseEvent) => {
      initResize(e);
      document.removeEventListener('mousemove', initMouseMove);
      document.addEventListener('mousemove', handleMouseMove);
    };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', initMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', initMouseMove);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, aspectRatio, imageWidth, imageHeight]);

  // Simplified drag logic for better reliability
  React.useEffect(() => {
    if (!isDragging) return;

    console.log('🖼️ Setting up drag listeners...');

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const newX = dragStart.startX + deltaX;
      const newY = dragStart.startY + deltaY;

      console.log('🖼️ Dragging to:', { x: newX, y: newY, deltaX, deltaY });
      setPosition({ x: newX, y: newY });
      setShowCoords(true);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🖼️ Mouse up - ending drag');
      setIsDragging(false);
      setShowCoords(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      console.log('🖼️ Drag ended at:', position);
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, position]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only start dragging if it's a left mouse button
    if (e.button !== 0) return;
    
    console.log('🖼️ Drag started!', { clientX: e.clientX, clientY: e.clientY });
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    });
    
    // Add visual feedback
    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(1.05)`;
      containerRef.current.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))';
      containerRef.current.style.zIndex = '1000';
    }
  };

  // Alternative drag method using onMouseDown
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.button !== 0) return;
    
    console.log('🖼️ Mouse down on image!', { clientX: e.clientX, clientY: e.clientY });
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    });
    
    // Add visual feedback
    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(1.05)`;
      containerRef.current.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))';
      containerRef.current.style.zIndex = '1000';
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);
  };

  const handleClickOutside = React.useCallback((e: Event) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsSelected(false);
    }
  }, []);

  React.useEffect(() => {
    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected, handleClickOutside]);

  // Container style with position and enhanced transitions
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging || isResizing ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: isSelected ? 10 : 1,
    filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'none',
    cursor: 'grab',
  };

  // Image style with enhanced drag feedback
  const imageStyle: React.CSSProperties = {
    width: imageWidth,
    height: imageHeight,
    borderRadius: `${borderRadius}px`,
    boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.4)' : shadow,
    display: 'block',
    border: `${borderWidth}px solid ${borderColor}`,
    cursor: isDragging ? 'grabbing' : (isSelected ? 'grab' : 'grab'),
    userSelect: 'none',
    pointerEvents: isResizing ? 'none' : 'auto',
    opacity: isDragging ? 0.9 : 1,
    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div 
      ref={containerRef}
      className={`image-container group ${isDragging ? 'dragging' : ''}`}
      style={containerStyle}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      onDragEnd={(e) => e.preventDefault()}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={imageStyle}
        className={`inserted-image ${isSelected ? 'selected' : ''}`}
        onMouseDown={handleMouseDown}
        onDragStart={(e) => e.preventDefault()}
        onDrag={(e) => e.preventDefault()}
        onDragEnd={(e) => e.preventDefault()}
        onClick={handleImageClick}
        onLoad={() => console.log('🖼️ Image loaded successfully:', alt, 'src:', src.substring(0, 50) + '...')}
        onError={(e) => console.error('❌ Image failed to load:', alt, 'src:', src.substring(0, 50) + '...', e)}
        draggable={false}
      />
      
      {/* Selection indicators and handles */}
      {isSelected && (
        <>
          {/* Main resize handle - bottom right */}
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute',
              right: -6,
              bottom: -6,
              width: 12,
              height: 12,
              backgroundColor: '#3b82f6',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
            title="Resize"
          />

          {/* Drag handle in center */}
          <div
            onMouseDown={handleDragStart}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 32,
              height: 32,
              background: 'rgba(59, 130, 246, 0.9)',
              borderRadius: '50%',
              border: '3px solid white',
              cursor: 'grab',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            className="hover:scale-110 transition-transform"
            title="Drag to move"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Delete button - top right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🗑️ Deleting image node:', nodeKey);
              
              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if (node) {
                  console.log('✅ Found node, removing...');
                  node.remove();
                } else {
                  console.error('❌ Node not found:', nodeKey);
                }
              });
              // Removed problematic fallback DOM removal that was causing removeChild error
            }}
            style={{
              position: 'absolute',
              right: -6,
              top: -6,
              width: 20,
              height: 20,
              backgroundColor: '#ef4444',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              fontSize: '10px',
              color: 'white',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
            className="hover:scale-110 transition-transform"
            title="Delete image"
          >
            ✕
          </button>
        </>
      )}
      
      {/* Coordinates display */}
      {showCoords && (
        <div 
          className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded font-mono pointer-events-none"
          style={{ zIndex: 25 }}
        >
          X: {Math.round(position.x)} Y: {Math.round(position.y)}
        </div>
      )}
      

      
      {/* Quick edit tooltip */}
      {!isSelected && !showCoords && (
        <div 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <div className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Click to select
          </div>
        </div>
      )}
    </div>
  );
}

export function $createImageNode(
  src: string, 
  alt: string, 
  width?: number, 
  height?: number,
  borderRadius: number = 8,
  borderWidth: number = 1,
  borderColor: string = '#e5e7eb',
  shadow: string = '0 4px 6px -1px rgba(0,0,0,0.1)'
): ImageNode {
  return new ImageNode(src, alt, width, height, borderRadius, borderWidth, borderColor, shadow);
}

export function $isImageNode(node: unknown): node is ImageNode {
  return node instanceof ImageNode;
}                                     