import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export type SerializedVideoNode = Spread<
  {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    shadow?: string;
    type: 'video';
    version: 1;
  },
  SerializedLexicalNode
>;

export class VideoNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __alt: string;
  __width?: number;
  __height?: number;
  __borderRadius: number;
  __borderWidth: number;
  __borderColor: string;
  __shadow: string;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
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

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { src, alt, width, height, borderRadius, borderWidth, borderColor, shadow } = serializedNode;
    return new VideoNode(src, alt, width, height, borderRadius, borderWidth, borderColor, shadow);
  }

  exportJSON(): SerializedVideoNode {
    return {
      type: 'video',
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
    console.log('🎬 VideoNode decorating with src:', this.__src.substring(0, 50) + '...');
    return (
      <VideoEditor 
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

// Video Editor Component
interface VideoEditorProps {
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

function VideoEditor({ 
  src, 
  alt, 
  width, 
  height, 
  borderRadius, 
  borderWidth, 
  borderColor, 
  shadow, 
  nodeKey 
}: VideoEditorProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = React.useState(false);
  const [videoWidth, setVideoWidth] = React.useState(width || 400);
  const [videoHeight, setVideoHeight] = React.useState(height || 225);
  const [isPlaying, setIsPlaying] = React.useState(false);
  
  // Position states for dragging
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, startX: 0, startY: 0 });
  
  const aspectRatio = width && height ? width / height : 16/9;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showCoords, setShowCoords] = React.useState(false);
  const [alignmentGuides, setAlignmentGuides] = React.useState({ horizontal: false, vertical: false });
  const [snapPosition, setSnapPosition] = React.useState({ x: 0, y: 0 });
  
  // Drag helpers
  const dragFrameRef = React.useRef<number | null>(null);
  const dragBaseRef = React.useRef<{offsetX: number; offsetY: number; pageX: number; pageY: number}>({
    offsetX: 0,
    offsetY: 0,
    pageX: 0,
    pageY: 0,
  });

  // Fixed resize logic with proper calculations
  React.useEffect(() => {
    if (!isResizing || !containerRef.current) return;
    
    let startWidth = videoWidth;
    let startHeight = videoHeight;
    let startMouseX = 0;
    let startMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      
      // Use the larger delta for more responsive resizing
      const delta = Math.max(deltaX, deltaY);
      const newWidth = Math.max(100, startWidth + delta);
      const newHeight = newWidth / aspectRatio;
      
      setVideoWidth(Math.round(newWidth));
      setVideoHeight(Math.round(newHeight));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const initResize = (e: MouseEvent) => {
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startWidth = videoWidth;
      startHeight = videoHeight;
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
  }, [isResizing, aspectRatio, videoWidth, videoHeight]);

  // Enhanced drag logic with Pages-like visual feedback and alignment guides
  React.useEffect(() => {
    if (!isDragging) return;

    // Cache editor container and its rect to convert viewport to editor coords
    const editorEl = document.querySelector('.lexical-editor') as HTMLElement | null;
    const editorRect = editorEl?.getBoundingClientRect();

    const calcNext = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Base new position
      let newX = dragStart.startX + deltaX;
      let newY = dragStart.startY + deltaY;

      // All other videos for alignment (within the editor only)
      const allVideos = (editorEl ?? document).querySelectorAll('.video-container');
      let horizontalGuide = false;
      let verticalGuide = false;
      let snappedX = newX;
      let snappedY = newY;

      allVideos.forEach((otherVideo) => {
        if (otherVideo === containerRef.current) return;
        const otherRect = otherVideo.getBoundingClientRect();

        // Convert other video rect into editor coordinate space if we have editor rect
        const otherLeft = editorRect ? otherRect.left - editorRect.left : otherRect.left;
        const otherTop = editorRect ? otherRect.top - editorRect.top : otherRect.top;
        const otherCenterX = otherLeft + otherRect.width / 2;
        const otherCenterY = otherTop + otherRect.height / 2;
        const otherRight = otherLeft + otherRect.width;
        const otherBottom = otherTop + otherRect.height;

        // Current positions already in our editor space
        const currentCenterX = newX + videoWidth / 2;
        const currentLeft = newX;
        const currentRight = newX + videoWidth;
        const currentCenterY = newY + videoHeight / 2;
        const currentTop = newY;
        const currentBottom = newY + videoHeight;

        // Horizontal snapping: center, left, right
        if (Math.abs(currentCenterX - otherCenterX) < 10) {
          horizontalGuide = true;
          snappedX = otherCenterX - videoWidth / 2;
        } else if (Math.abs(currentLeft - otherLeft) < 10) {
          horizontalGuide = true;
          snappedX = otherLeft;
        } else if (Math.abs(currentRight - otherRight) < 10) {
          horizontalGuide = true;
          snappedX = otherRight - videoWidth;
        }

        // Vertical snapping: center, top, bottom
        if (Math.abs(currentCenterY - otherCenterY) < 10) {
          verticalGuide = true;
          snappedY = otherCenterY - videoHeight / 2;
        } else if (Math.abs(currentTop - otherTop) < 10) {
          verticalGuide = true;
          snappedY = otherTop;
        } else if (Math.abs(currentBottom - otherBottom) < 10) {
          verticalGuide = true;
          snappedY = otherBottom - videoHeight;
        }
      });

      // Update alignment guides
      setAlignmentGuides({ horizontal: horizontalGuide, vertical: verticalGuide });

      // Use snapped position if guides are active
      const finalX = horizontalGuide ? snappedX : newX;
      const finalY = verticalGuide ? snappedY : newY;

      setPosition({ x: finalX, y: finalY });
      setSnapPosition({ x: finalX, y: finalY });
      setShowCoords(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (dragFrameRef.current) cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = requestAnimationFrame(() => calcNext(e));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShowCoords(false);
      setAlignmentGuides({ horizontal: false, vertical: false });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Add a subtle "drop" animation
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(1.02)`;
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(1)`;
          }
        }, 150);
      }
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (dragFrameRef.current) cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    };
  }, [isDragging, dragStart, videoWidth, videoHeight]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    });
    
    // Add Pages-like drag start effect
    if (containerRef.current) {
      containerRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(1.05)`;
      containerRef.current.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))';
      containerRef.current.style.zIndex = '1000';
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
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
  };

  // Video style with enhanced drag feedback
  const videoStyle: React.CSSProperties = {
    width: videoWidth,
    height: videoHeight,
    borderRadius: `${borderRadius}px`,
    boxShadow: isDragging ? '0 12px 24px rgba(0,0,0,0.4)' : shadow,
    display: 'block',
    border: `${borderWidth}px solid ${borderColor}`,
    cursor: isDragging ? 'grabbing' : (isSelected ? 'grab' : 'pointer'),
    userSelect: 'none',
    pointerEvents: isResizing ? 'none' : 'auto',
    opacity: isDragging ? 0.9 : 1,
    transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div 
      ref={containerRef}
      className="video-container group"
      style={containerStyle}
    >
      <video
        ref={videoRef}
        src={src}
        controls
        style={videoStyle}
        className={`inserted-video ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onMouseDown={handleDragStart}
        onClick={handleVideoClick}
        onLoadStart={() => console.log('🎬 Video loading started:', alt)}
        onLoadedData={() => console.log('🎬 Video loaded successfully:', alt)}
        onError={(e) => console.error('❌ Video failed to load:', alt, e)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
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

          {/* Play/Pause button - top left */}
          <button
            onClick={handlePlayPause}
            style={{
              position: 'absolute',
              left: -6,
              top: -6,
              width: 20,
              height: 20,
              backgroundColor: '#10b981',
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
              e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
            className="hover:scale-110 transition-transform"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Delete button - top right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🗑️ Deleting video node:', nodeKey);
              
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
            title="Delete video"
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
      
      {/* Alignment Guides */}
      {alignmentGuides.horizontal && (
        <div 
          className="absolute left-0 right-0 h-0.5 bg-blue-500 pointer-events-none"
          style={{ 
            top: '50%', 
            transform: 'translateY(-50%)',
            zIndex: 1000,
            boxShadow: '0 0 4px rgba(59, 130, 246, 0.8)'
          }}
        />
      )}
      
      {alignmentGuides.vertical && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 pointer-events-none"
          style={{ 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 1000,
            boxShadow: '0 0 4px rgba(59, 130, 246, 0.8)'
          }}
        />
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

export function $createVideoNode(
  src: string, 
  alt: string, 
  width?: number, 
  height?: number,
  borderRadius: number = 8,
  borderWidth: number = 1,
  borderColor: string = '#e5e7eb',
  shadow: string = '0 4px 6px -1px rgba(0,0,0,0.1)'
): VideoNode {
  return new VideoNode(src, alt, width, height, borderRadius, borderWidth, borderColor, shadow);
}

export function $isVideoNode(node: unknown): node is VideoNode {
  return node instanceof VideoNode;
} 