'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../../stores/useEditorStore';
// Removed ImageElement import - using inline image component now
import { TextElement, EditorElement, ShapeElement, ChartElement, TableElement, EmbedElement } from '../../types/editor';
import TextElementComponent from './TextElement';
import { AnimatedTextElement, AnimatedElement } from '../AnimationSystem';
import ResizeHandles from './ResizeHandles';
import SelectionBox from './SelectionBox';
import TableEditor from './TableEditor';
import { snapToGuides } from '../../utils/magneticSnapping';
import ReactECharts from 'echarts-for-react';
import ChartEditor from './ChartEditor';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface SlideCanvasProps {
  width?: number;
  height?: number;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({ 
  width = 1920, 
  height = 1080 
}) => {
  const {
    slides,
    currentSlideIndex,
    selectedElementIds,
    zoom,
    canvasSize,
    addElement,
    selectElement,
    deselectAll,
    setCanvasSize,
    startTextEditing,
    isDraggingElement,
  } = useEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const currentSlide = slides[currentSlideIndex];
  const [draggingElement, setDraggingElement] = useState<EditorElement | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [visualGuides, setVisualGuides] = useState<VisualGuide[]>([]);
  const [selectedChartElement, setSelectedChartElement] = useState<ChartElement | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [isDragStarted, setIsDragStarted] = useState(false);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Visual guide types
  interface VisualGuide {
    id: string;
    type: 'horizontal' | 'vertical';
    position: number;
    color: string;
    opacity: number;
    guideType: string;
  }

  // Set canvas size on mount
  useEffect(() => {
    setCanvasSize({ width, height });
  }, [width, height, setCanvasSize]);

  // Clear visual guides when not dragging
  useEffect(() => {
    if (!draggingElement) {
      setVisualGuides([]);
    }
  }, [draggingElement]);

  // Handle chart selection
  const handleChartSelect = useCallback((element: EditorElement) => {
    if (element.type === 'chart') {
      setSelectedChartElement(element as ChartElement);
    } else {
      setSelectedChartElement(null);
    }
  }, []);

  // Improved guide generation with proper deduplication
  const generateCleanGuides = (
    mouseX: number,
    mouseY: number,
    draggingElement: EditorElement,
    allElements: EditorElement[]
  ): VisualGuide[] => {
    if (!draggingElement) return [];

    const guides: VisualGuide[] = [];
    const SNAP_THRESHOLD = 15;
    const seenPositions = new Map<string, { distance: number; guideType: string }>();

    // Helper function to add unique guide
    const addUniqueGuide = (
      type: 'horizontal' | 'vertical',
      position: number,
      distance: number,
      guideType: string,
      color: string = '#FFD700'
    ) => {
      const key = `${type}-${Math.round(position)}`;
      const existing = seenPositions.get(key);
      
      // Only add if this is closer or higher priority
      if (!existing || distance < existing.distance || 
          (distance === existing.distance && getPriority(guideType) > getPriority(existing.guideType))) {
        
        seenPositions.set(key, { distance, guideType });
        
        // Remove existing guide with same key
        const existingIndex = guides.findIndex(g => g.id === key);
        if (existingIndex >= 0) {
          guides.splice(existingIndex, 1);
        }
        
        // Add new guide
        guides.push({
          id: key,
          type,
          position: Math.round(position),
          color,
          opacity: Math.max(0.4, 1 - (distance / SNAP_THRESHOLD)),
          guideType
        });
      }
    };

    // Guide type priority (higher = more important)
    const getPriority = (guideType: string): number => {
      switch (guideType) {
        case 'slide-center': return 4;
        case 'element-alignment': return 3;
        case 'margin': return 2;
        case 'spacing': return 1;
        default: return 0;
      }
    };

    // Canvas center guides
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const elementCenterX = mouseX + draggingElement.width / 2;
    const elementCenterY = mouseY + draggingElement.height / 2;

    const centerDistanceX = Math.abs(elementCenterX - centerX);
    const centerDistanceY = Math.abs(elementCenterY - centerY);

    if (centerDistanceX <= SNAP_THRESHOLD) {
      addUniqueGuide('vertical', centerX, centerDistanceX, 'slide-center');
    }

    if (centerDistanceY <= SNAP_THRESHOLD) {
      addUniqueGuide('horizontal', centerY, centerDistanceY, 'slide-center');
    }

    // Margin guides
    const margins = [20, 40];
    margins.forEach(margin => {
      // Left margin
      if (Math.abs(mouseX - margin) <= SNAP_THRESHOLD) {
        addUniqueGuide('vertical', margin, Math.abs(mouseX - margin), 'margin');
      }
      
      // Right margin
      const rightMarginPos = canvasSize.width - margin;
      if (Math.abs(mouseX + draggingElement.width - rightMarginPos) <= SNAP_THRESHOLD) {
        addUniqueGuide('vertical', rightMarginPos, Math.abs(mouseX + draggingElement.width - rightMarginPos), 'margin');
      }
      
      // Top margin
      if (Math.abs(mouseY - margin) <= SNAP_THRESHOLD) {
        addUniqueGuide('horizontal', margin, Math.abs(mouseY - margin), 'margin');
      }
      
      // Bottom margin
      const bottomMarginPos = canvasSize.height - margin;
      if (Math.abs(mouseY + draggingElement.height - bottomMarginPos) <= SNAP_THRESHOLD) {
        addUniqueGuide('horizontal', bottomMarginPos, Math.abs(mouseY + draggingElement.height - bottomMarginPos), 'margin');
      }
    });

    // Element alignment guides
    allElements.forEach((element) => {
      if (element.id === draggingElement.id) return;

      const elementLeft = element.x;
      const elementRight = element.x + element.width;
      const elementTop = element.y;
      const elementBottom = element.y + element.height;
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;

      const draggingLeft = mouseX;
      const draggingRight = mouseX + draggingElement.width;
      const draggingTop = mouseY;
      const draggingBottom = mouseY + draggingElement.height;
      const draggingCenterX = mouseX + draggingElement.width / 2;
      const draggingCenterY = mouseY + draggingElement.height / 2;

      // Vertical alignment checks
      const alignments = [
        { pos: elementLeft, dragPos: draggingLeft, type: 'left-left' },
        { pos: elementRight, dragPos: draggingRight, type: 'right-right' },
        { pos: elementCenterX, dragPos: draggingCenterX, type: 'center-center' },
        { pos: elementLeft, dragPos: draggingRight, type: 'left-right' },
        { pos: elementRight, dragPos: draggingLeft, type: 'right-left' }
      ];

      alignments.forEach(({ pos, dragPos, type }) => {
        const distance = Math.abs(dragPos - pos);
        if (distance <= SNAP_THRESHOLD) {
          addUniqueGuide('vertical', pos, distance, 'element-alignment');
        }
      });

      // Horizontal alignment checks
      const vAlignments = [
        { pos: elementTop, dragPos: draggingTop, type: 'top-top' },
        { pos: elementBottom, dragPos: draggingBottom, type: 'bottom-bottom' },
        { pos: elementCenterY, dragPos: draggingCenterY, type: 'center-center' },
        { pos: elementTop, dragPos: draggingBottom, type: 'top-bottom' },
        { pos: elementBottom, dragPos: draggingTop, type: 'bottom-top' }
      ];

      vAlignments.forEach(({ pos, dragPos, type }) => {
        const distance = Math.abs(dragPos - pos);
        if (distance <= SNAP_THRESHOLD) {
          addUniqueGuide('horizontal', pos, distance, 'element-alignment');
        }
      });
    });

    return guides;
  };

  // Handle dragging with magnetic snapping
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingElement && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / zoom;
        const currentY = (e.clientY - rect.top) / zoom;
        
        // Check if we've moved enough to start dragging (threshold of 3 pixels)
        const deltaX = Math.abs(currentX - dragStartPosition.x);
        const deltaY = Math.abs(currentY - dragStartPosition.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (!isDragStarted && distance < 3) {
          return; // Don't start dragging until we've moved enough
        }
        
        if (!isDragStarted) {
          setIsDragStarted(true);
        }
        
        const rawX = currentX - dragOffset.x;
        const rawY = currentY - dragOffset.y;
        
        // Apply magnetic snapping using the enhanced system
        const currentSlideElements = slides[currentSlideIndex]?.elements || [];
        
        const snappedPosition = snapToGuides(
          { x: rawX, y: rawY },
          draggingElement,
          currentSlideElements.filter(el => el.id !== draggingElement.id),
          canvasSize
        );
        
        // Generate clean visual guides based on SNAPPED position
        const guides = generateCleanGuides(
          snappedPosition.x,
          snappedPosition.y,
          draggingElement,
          currentSlideElements.filter(el => el.id !== draggingElement.id)
        );
        
        setVisualGuides(guides);
        
        // Use the SNAPPED position for the element
        const finalX = snappedPosition.x;
        const finalY = snappedPosition.y;
        
        // Ensure position is within canvas bounds
        const boundedX = Math.max(0, Math.min(finalX, canvasSize.width - draggingElement.width));
        const boundedY = Math.max(0, Math.min(finalY, canvasSize.height - draggingElement.height));
        
        // Update element position in store with SNAPPED coordinates
        const { updateElement } = useEditorStore.getState();
        updateElement(currentSlide.id, draggingElement.id, { x: boundedX, y: boundedY });
        
        // Update local dragging element state with SNAPPED coordinates
        setDraggingElement({
          ...draggingElement,
          x: boundedX,
          y: boundedY
        });
      }
    };

    const handleMouseUp = () => {
      if (draggingElement) {
        setDraggingElement(null);
        setDragOffset({ x: 0, y: 0 });
        setVisualGuides([]);
        setIsDragStarted(false);
        setDragStartPosition({ x: 0, y: 0 });
      }
    };

    if (draggingElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElement, currentSlideIndex, slides, zoom, dragOffset, canvasSize, dragStartPosition, isDragStarted]);

  // Handle canvas click to create text box
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingElement) return;
    
    if (e.target === canvasRef.current) {
      deselectAll();
      
      setTimeout(() => {
        if (isDraggingElement) return;
        
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / zoom;
          const y = (e.clientY - rect.top) / zoom;
          
          const newTextElement: Omit<TextElement, 'id' | 'selected'> = {
            type: 'text',
            x,
            y,
            width: 200,
            height: 60,
            rotation: 0,
            zIndex: 1,
            content: 'Add text',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: '400',
            color: '#000000',
            textAlign: 'left',
            lineHeight: 1.2,
            isEditing: false,
          };
          
          addElement(currentSlide.id, newTextElement);
        }
      }, 50);
    }
  }, [currentSlide, zoom, addElement, deselectAll, startTextEditing, isDraggingElement]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementIds.length > 0) {
        selectedElementIds.forEach(elementId => {
          console.log('Delete element:', elementId);
        });
      }
      
      if (e.key === 'Escape') {
        deselectAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, deselectAll]);

  if (!currentSlide) {
    return <div>No slide available</div>;
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="relative">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
          <button
            onClick={() => useEditorStore.getState().setZoom(zoom + 0.1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
          >
            +
          </button>
          <button
            onClick={() => useEditorStore.getState().setZoom(zoom - 0.1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
          >
            -
          </button>
          <div className="text-xs text-center text-gray-600">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Canvas Container */}
        <motion.div
          ref={canvasRef}
          data-canvas
          className="bg-white shadow-xl rounded-lg overflow-hidden cursor-crosshair relative mx-auto"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          onClick={handleCanvasClick}
        >
          {/* Background */}
          <div 
            className="w-full h-full relative"
            style={{ 
              backgroundColor: currentSlide.backgroundColor,
              backgroundImage: currentSlide.backgroundImage ? `url(${currentSlide.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                deselectAll();
              }
            }}
          >
            {/* Elements */}
            {currentSlide.elements.map((element) => {
              if (element.type === 'text') {
                const textElement = element as TextElement;
                return (
                  <AnimatedTextElement
                    key={element.id}
                    element={textElement}
                  >
                    <TextElementComponent
                      element={textElement}
                      isSelected={selectedElementIds.includes(element.id)}
                      onSelect={(multiSelect) => selectElement(element.id, multiSelect)}
                      onDragStart={(element) => {
                        setDraggingElement(element);
                      }}
                      onDragEnd={() => {
                        setDraggingElement(null);
                      }}
                    />
                  </AnimatedTextElement>
                );
              }
              
              if (element.type === 'shape') {
                const shapeElement = element as ShapeElement;
                return (
                  <AnimatedElement key={element.id} element={element}>
                    <div
                      className={`absolute cursor-move select-none ${
                        selectedElementIds.includes(element.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(element.id, e.shiftKey);
                      }}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const canvasRect = canvasRef.current?.getBoundingClientRect();
                        if (canvasRect) {
                          const offsetX = (e.clientX - canvasRect.left) / zoom - element.x;
                          const offsetY = (e.clientY - canvasRect.top) / zoom - element.y;
                          setDragOffset({ x: offsetX, y: offsetY });
                        }
                        setDraggingElement(element);
                      }}
                    >
                    {/* Render shape types */}
                    {shapeElement.shapeType === 'rectangle' && (
                      <div
                        className="w-full h-full relative"
                        style={{
                          backgroundColor: shapeElement.fillColor,
                          border: shapeElement.strokeWidth > 0 ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` : 'none',
                          borderRadius: shapeElement.isRounded ? '1rem' : '0.5rem',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Start editing text if double-clicked
                          if (e.detail === 2) {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { isEditingText: true });
                          }
                        }}
                      >
                        {/* Text inside shape */}
                        {shapeElement.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-2 cursor-pointer"
                            style={{
                              color: shapeElement.textColor || '#9CA3AF',
                              fontSize: shapeElement.textSize || 16,
                              textAlign: shapeElement.textAlign || 'center',
                              alignItems: shapeElement.textVerticalAlign === 'top' ? 'flex-start' : 
                                         shapeElement.textVerticalAlign === 'bottom' ? 'flex-end' : 'center',
                            }}
                          >
                            {shapeElement.isEditingText ? (
                              <textarea
                                className="w-full h-full resize-none border-none outline-none bg-transparent text-center"
                                style={{
                                  color: shapeElement.textColor || '#9CA3AF',
                                  fontSize: shapeElement.textSize || 16,
                                  textAlign: shapeElement.textAlign || 'center',
                                }}
                                value={shapeElement.text}
                                onChange={(e) => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { text: e.target.value });
                                }}
                                onBlur={() => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { isEditingText: false });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const { updateElement } = useEditorStore.getState();
                                    updateElement(currentSlide.id, element.id, { isEditingText: false });
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{shapeElement.text}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {shapeElement.shapeType === 'circle' && (
                      <div
                        className="w-full h-full rounded-full relative"
                        style={{
                          backgroundColor: shapeElement.fillColor,
                          border: shapeElement.strokeWidth > 0 ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` : 'none',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Start editing text if double-clicked
                          if (e.detail === 2) {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { isEditingText: true });
                          }
                        }}
                      >
                        {/* Text inside circle */}
                        {shapeElement.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-2 cursor-pointer"
                            style={{
                              color: shapeElement.textColor || '#9CA3AF',
                              fontSize: shapeElement.textSize || 16,
                              textAlign: shapeElement.textAlign || 'center',
                              alignItems: shapeElement.textVerticalAlign === 'top' ? 'flex-start' : 
                                         shapeElement.textVerticalAlign === 'bottom' ? 'flex-end' : 'center',
                            }}
                          >
                            {shapeElement.isEditingText ? (
                              <textarea
                                className="w-full h-full resize-none border-none outline-none bg-transparent text-center"
                                style={{
                                  color: shapeElement.textColor || '#9CA3AF',
                                  fontSize: shapeElement.textSize || 16,
                                  textAlign: shapeElement.textAlign || 'center',
                                }}
                                value={shapeElement.text}
                                onChange={(e) => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { text: e.target.value });
                                }}
                                onBlur={() => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { isEditingText: false });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const { updateElement } = useEditorStore.getState();
                                    updateElement(currentSlide.id, element.id, { isEditingText: false });
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{shapeElement.text}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {shapeElement.shapeType === 'triangle' && (
                      <div
                        className="w-full h-full relative"
                        style={{
                          backgroundColor: shapeElement.fillColor,
                          border: shapeElement.strokeWidth > 0 ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` : 'none',
                          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Start editing text if double-clicked
                          if (e.detail === 2) {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { isEditingText: true });
                          }
                        }}
                      >
                        {/* Text inside triangle */}
                        {shapeElement.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-2 cursor-pointer"
                            style={{
                              color: shapeElement.textColor || '#9CA3AF',
                              fontSize: shapeElement.textSize || 16,
                              textAlign: shapeElement.textAlign || 'center',
                              alignItems: shapeElement.textVerticalAlign === 'top' ? 'flex-start' : 
                                         shapeElement.textVerticalAlign === 'bottom' ? 'flex-end' : 'center',
                            }}
                          >
                            {shapeElement.isEditingText ? (
                              <textarea
                                className="w-full h-full resize-none border-none outline-none bg-transparent text-center"
                                style={{
                                  color: shapeElement.textColor || '#9CA3AF',
                                  fontSize: shapeElement.textSize || 16,
                                  textAlign: shapeElement.textAlign || 'center',
                                }}
                                value={shapeElement.text}
                                onChange={(e) => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { text: e.target.value });
                                }}
                                onBlur={() => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { isEditingText: false });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const { updateElement } = useEditorStore.getState();
                                    updateElement(currentSlide.id, element.id, { isEditingText: false });
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{shapeElement.text}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {shapeElement.shapeType === 'diamond' && (
                      <div
                        className="w-full h-full relative"
                        style={{
                          backgroundColor: shapeElement.fillColor,
                          border: shapeElement.strokeWidth > 0 ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` : 'none',
                          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Start editing text if double-clicked
                          if (e.detail === 2) {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { isEditingText: true });
                          }
                        }}
                      >
                        {/* Text inside diamond */}
                        {shapeElement.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-2 cursor-pointer"
                            style={{
                              color: shapeElement.textColor || '#9CA3AF',
                              fontSize: shapeElement.textSize || 16,
                              textAlign: shapeElement.textAlign || 'center',
                              alignItems: shapeElement.textVerticalAlign === 'top' ? 'flex-start' : 
                                         shapeElement.textVerticalAlign === 'bottom' ? 'flex-end' : 'center',
                            }}
                          >
                            {shapeElement.isEditingText ? (
                              <textarea
                                className="w-full h-full resize-none border-none outline-none bg-transparent text-center"
                                style={{
                                  color: shapeElement.textColor || '#9CA3AF',
                                  fontSize: shapeElement.textSize || 16,
                                  textAlign: shapeElement.textAlign || 'center',
                                }}
                                value={shapeElement.text}
                                onChange={(e) => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { text: e.target.value });
                                }}
                                onBlur={() => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { isEditingText: false });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const { updateElement } = useEditorStore.getState();
                                    updateElement(currentSlide.id, element.id, { isEditingText: false });
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{shapeElement.text}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {shapeElement.shapeType === 'star' && (
                      <div
                        className="w-full h-full relative"
                        style={{
                          backgroundColor: shapeElement.fillColor,
                          border: shapeElement.strokeWidth > 0 ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` : 'none',
                          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Start editing text if double-clicked
                          if (e.detail === 2) {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { isEditingText: true });
                          }
                        }}
                      >
                        {/* Text inside star */}
                        {shapeElement.text && (
                          <div
                            className="absolute inset-0 flex items-center justify-center p-2 cursor-pointer"
                            style={{
                              color: shapeElement.textColor || '#9CA3AF',
                              fontSize: shapeElement.textSize || 16,
                              textAlign: shapeElement.textAlign || 'center',
                              alignItems: shapeElement.textVerticalAlign === 'top' ? 'flex-start' : 
                                         shapeElement.textVerticalAlign === 'bottom' ? 'flex-end' : 'center',
                            }}
                          >
                            {shapeElement.isEditingText ? (
                              <textarea
                                className="w-full h-full resize-none border-none outline-none bg-transparent text-center"
                                style={{
                                  color: shapeElement.textColor || '#9CA3AF',
                                  fontSize: shapeElement.textSize || 16,
                                  textAlign: shapeElement.textAlign || 'center',
                                }}
                                value={shapeElement.text}
                                onChange={(e) => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { text: e.target.value });
                                }}
                                onBlur={() => {
                                  const { updateElement } = useEditorStore.getState();
                                  updateElement(currentSlide.id, element.id, { isEditingText: false });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const { updateElement } = useEditorStore.getState();
                                    updateElement(currentSlide.id, element.id, { isEditingText: false });
                                  }
                                }}
                                autoFocus
                              />
                            ) : (
                              <span>{shapeElement.text}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {shapeElement.shapeType === 'line' && (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                        }}
                      >
                        <div
                          className="w-full"
                          style={{
                            height: '4px',
                            backgroundColor: shapeElement.fillColor,
                            border: shapeElement.strokeWidth > 0 ? `${shapeElement.strokeWidth}px solid ${shapeElement.strokeColor}` : 'none',
                            borderStyle: shapeElement.isDashed ? 'dashed' : 'solid',
                            position: 'relative',
                          }}
                        >
                          {/* Arrow indicators */}
                          {shapeElement.hasArrows && (
                            <>
                              <div
                                className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4"
                                style={{
                                  borderTopColor: shapeElement.fillColor,
                                  right: '-8px',
                                }}
                              />
                              {shapeElement.hasArrows && shapeElement.hasArrows.toString().includes('both') && (
                                <div
                                  className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4"
                                  style={{
                                    borderTopColor: shapeElement.fillColor,
                                    left: '-8px',
                                    transform: 'translateY(-50%) rotate(180deg)',
                                  }}
                                />
                              )}
                            </>
                          )}
                          
                          {/* Dot indicators */}
                          {shapeElement.hasDots && (
                            <>
                              <div
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: shapeElement.fillColor,
                                }}
                              />
                              {shapeElement.hasDots && shapeElement.hasDots.toString().includes('right') && (
                                <div
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: shapeElement.fillColor,
                                  }}
                                />
                              )}
                            </>
                          )}
                          
                          {/* Bar indicators */}
                          {shapeElement.hasBars && (
                            <div
                              className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6"
                              style={{
                                backgroundColor: shapeElement.fillColor,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Floating Shape Toolbar */}
                    {selectedElementIds.includes(element.id) && (
                      <div className="absolute -top-14 left-0 bg-white border border-gray-200 rounded-xl shadow-xl p-2 flex items-center space-x-2 z-20 backdrop-blur-sm">
                        {/* Fill Option */}
                        <button
                          onClick={() => {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { 
                              fillColor: shapeElement.fillColor === 'transparent' ? '#E5E7EB' : 'transparent' 
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            shapeElement.fillColor !== 'transparent' 
                              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          Fill
                        </button>

                        {/* Border Option */}
                        <button
                          onClick={() => {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { 
                              strokeWidth: shapeElement.strokeWidth > 0 ? 0 : 1 
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            shapeElement.strokeWidth > 0 
                              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          Border
                        </button>

                        {/* Border Width Input */}
                        {shapeElement.strokeWidth > 0 && (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={shapeElement.strokeWidth}
                              onChange={(e) => {
                                const { updateElement } = useEditorStore.getState();
                                updateElement(currentSlide.id, element.id, { 
                                  strokeWidth: parseInt(e.target.value) || 0 
                                });
                              }}
                              className="w-12 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {/* More Options */}
                        <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {/* Resize handles for selected shapes */}
                    {selectedElementIds.includes(element.id) && (
                      <>
                        <ResizeHandles
                          element={element}
                          onResize={(newWidth, newHeight) => {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { 
                              width: newWidth, 
                              height: newHeight 
                            });
                          }}
                        />
                        
                        {/* Rotation handle */}
                        <div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab hover:bg-blue-600 transition-colors flex items-center justify-center"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startY = e.clientY;
                            const startRotation = element.rotation;
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaY = moveEvent.clientY - startY;
                              const newRotation = startRotation + (deltaY * 0.5);
                              
                              const { updateElement } = useEditorStore.getState();
                              updateElement(currentSlide.id, element.id, { rotation: newRotation });
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </>
                    )}
                    </div>
                  </AnimatedElement>
                );
              }
              
              if (element.type === 'image') {
                console.log('🎯 Rendering image element:', {
                  id: element.id,
                  hasSrc: !!element.src,
                  srcLength: element.src?.length,
                  position: `${element.x}, ${element.y}`,
                  size: `${element.width}x${element.height}`,
                  srcPreview: element.src?.substring(0, 50)
                });
                
                // Only render image elements that have a valid src
                if (!element.src || element.src.trim() === '') {
                  console.log('⚠️ Skipping image element - no src:', element.id);
                  return null; // Don't render image elements without src
                }
                
                return (
                  <AnimatedElement key={element.id} element={element}>
                    <div
                      className={`absolute cursor-move select-none ${
                        selectedElementIds.includes(element.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(element.id, e.shiftKey);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Calculate drag offset more accurately
                        const rect = e.currentTarget.getBoundingClientRect();
                        const canvasRect = canvasRef.current?.getBoundingClientRect();
                        if (canvasRect) {
                          const mouseX = e.clientX - canvasRect.left;
                          const mouseY = e.clientY - canvasRect.top;
                          const elementX = element.x * zoom;
                          const elementY = element.y * zoom;
                          
                          const offsetX = (mouseX - elementX) / zoom;
                          const offsetY = (mouseY - elementY) / zoom;
                          
                          setDragOffset({ x: offsetX, y: offsetY });
                          setDragStartPosition({ x: mouseX / zoom, y: mouseY / zoom });
                          setIsDragStarted(false);
                        }
                        setDraggingElement(element);
                      }}
                    >
                      <img
                        src={element.src}
                        alt={element.alt || 'Image'}
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                      />
                    
                    {/* Resize handles for selected images */}
                    {selectedElementIds.includes(element.id) && (
                      <>
                        <ResizeHandles
                          element={element}
                          onResize={(newWidth, newHeight) => {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { 
                              width: newWidth, 
                              height: newHeight 
                            });
                          }}
                        />
                        
                        {/* Rotation handle */}
                        <div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab hover:bg-blue-600 transition-colors flex items-center justify-center"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startY = e.clientY;
                            const startRotation = element.rotation;
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaY = moveEvent.clientY - startY;
                              const newRotation = startRotation + (deltaY * 0.5);
                              
                              const { updateElement } = useEditorStore.getState();
                              updateElement(currentSlide.id, element.id, { rotation: newRotation });
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </>
                    )}
                    </div>
                  </AnimatedElement>
                );
              }
              
              if (element.type === 'chart') {
                const chartElement = element as ChartElement;
                return (
                  <AnimatedElement key={element.id} element={element}>
                    <div
                      className={`absolute cursor-move select-none ${
                        selectedElementIds.includes(element.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(element.id, e.shiftKey);
                        handleChartSelect(element);
                      }}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const canvasRect = canvasRef.current?.getBoundingClientRect();
                        if (canvasRect) {
                          const offsetX = (e.clientX - canvasRect.left) / zoom - element.x;
                          const offsetY = (e.clientY - canvasRect.top) / zoom - element.y;
                          setDragOffset({ x: offsetX, y: offsetY });
                        }
                        setDraggingElement(element);
                      }}
                    >
                      <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <ReactECharts
                          option={chartElement.chartOption}
                          style={{ height: '100%', width: '100%' }}
                          opts={{ renderer: 'canvas' }}
                        />
                      </div>
                    
                    {/* Resize handles for selected charts */}
                    {selectedElementIds.includes(element.id) && (
                      <>
                        <ResizeHandles
                          element={element}
                          onResize={(newWidth, newHeight) => {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { 
                              width: newWidth, 
                              height: newHeight 
                            });
                          }}
                        />
                        
                        {/* Rotation handle */}
                        <div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab hover:bg-blue-600 transition-colors flex items-center justify-center"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startY = e.clientY;
                            const startRotation = element.rotation;
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaY = moveEvent.clientY - startY;
                              const newRotation = startRotation + (deltaY * 0.5);
                              
                              const { updateElement } = useEditorStore.getState();
                              updateElement(currentSlide.id, element.id, { rotation: newRotation });
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </>
                    )}
                    </div>
                  </AnimatedElement>
                );
              }
              
              if (element.type === 'embed') {
                const embedElement = element as EmbedElement;
                return (
                  <AnimatedElement key={element.id} element={element}>
                    <div
                      className={`absolute cursor-move select-none ${
                        selectedElementIds.includes(element.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                        transform: `rotate(${element.rotation}deg)`,
                        zIndex: element.zIndex,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(element.id, e.shiftKey);
                      }}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const canvasRect = canvasRef.current?.getBoundingClientRect();
                        if (canvasRect) {
                          const offsetX = (e.clientX - canvasRect.left) / zoom - element.x;
                          const offsetY = (e.clientY - canvasRect.top) / zoom - element.y;
                          setDragOffset({ x: offsetX, y: offsetY });
                        }
                        setDraggingElement(element);
                      }}
                    >
                    <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                      {embedElement.embedType === 'youtube' && (
                        <div className="text-center p-4">
                          <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">{embedElement.title}</h3>
                          <p className="text-sm text-gray-600">YouTube Video</p>
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-full">
                            {embedElement.embedUrl}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Resize handles for selected embeds */}
                    {selectedElementIds.includes(element.id) && (
                      <>
                        <ResizeHandles
                          element={element}
                          onResize={(newWidth, newHeight) => {
                            const { updateElement } = useEditorStore.getState();
                            updateElement(currentSlide.id, element.id, { 
                              width: newWidth, 
                              height: newHeight 
                            });
                          }}
                        />
                        
                        {/* Rotation handle */}
                        <div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-grab hover:bg-blue-600 transition-colors flex items-center justify-center"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const startY = e.clientY;
                            const startRotation = element.rotation;
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const deltaY = moveEvent.clientY - startY;
                              const newRotation = startRotation + (deltaY * 0.5);
                              
                              const { updateElement } = useEditorStore.getState();
                              updateElement(currentSlide.id, element.id, { rotation: newRotation });
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        >
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h7H9a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </>
                    )}
                    </div>
                  </AnimatedElement>
                );
              }
              
              if (element.type === 'table') {
                const tableElement = element as TableElement;
                return (
                  <TableEditor 
                    key={element.id}
                    element={element}
                    tableElement={tableElement}
                    currentSlide={currentSlide}
                    selectedElementIds={selectedElementIds}
                    selectElement={selectElement}
                    setDragOffset={setDragOffset}
                    setDraggingElement={setDraggingElement}
                    zoom={zoom}
                    canvasRef={canvasRef}
                  />
                );
              }
              
              return null;
            })}
            
            {/* Clean Visual Guides - Single line system */}
            {visualGuides.map((guide) => (
              <div
                key={guide.id}
                className="absolute pointer-events-none"
                style={{
                  left: guide.type === 'vertical' ? guide.position - 1 : 0,
                  top: guide.type === 'horizontal' ? guide.position - 1 : 0,
                  width: guide.type === 'horizontal' ? canvasSize.width : 2,
                  height: guide.type === 'vertical' ? canvasSize.height : 2,
                  backgroundColor: guide.color,
                  zIndex: 1000,
                  opacity: guide.opacity,
                  boxShadow: `0 0 4px ${guide.color}80`,
                  borderRadius: '1px'
                }}
              />
            ))}
          </div>
          
          {/* Selection Box for multi-select */}
          <SelectionBox />
        </motion.div>
      </div>

      {/* Chart Editor */}
      {selectedChartElement && (
        <ChartEditor
          chartElement={selectedChartElement}
          isVisible={true}
          onClose={() => setSelectedChartElement(null)}
        />
      )}
    </div>
  );
};

export default SlideCanvas;