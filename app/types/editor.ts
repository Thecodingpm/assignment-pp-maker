export interface EditorElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'chart' | 'table' | 'embed';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  selected: boolean;
  // Animation properties
  animation?: {
    type: 'entrance' | 'emphasis' | 'exit';
    preset: string;
    duration: number;
    easing: string;
    properties: {
      transform?: string;
      opacity?: number;
      scale?: number;
      translateX?: number;
      translateY?: number;
      rotate?: number;
    };
    isActive: boolean;
  };
}

export interface TextElement extends EditorElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  isEditing: boolean;
  // New properties
  textStyle?: 'heading' | 'subheading' | 'body' | 'caption' | 'quote';
  opacity?: number;
  shadow?: 'none' | 'soft' | 'regular' | 'retro';
}

export interface ShapeElement extends EditorElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star' | 'line';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  // Additional properties for enhanced shapes
  isRounded?: boolean;
  hasArrows?: boolean;
  hasDots?: boolean;
  hasBars?: boolean;
  isDashed?: boolean;
  lineStyle?: 'solid' | 'dashed';
}

export interface ImageElement extends EditorElement {
  type: 'image';
  src: string;
  alt: string;
  credit?: string;
  originalWidth?: number;
  originalHeight?: number;
}

export interface ChartElement extends EditorElement {
  type: 'chart';
  chartType: string;
  chartOption: any; // ECharts option object
  data: any; // Chart data
}

export interface TableElement extends EditorElement {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][]; // 2D array of cell content
  headers: string[]; // Column headers
  rowHeaders: string[]; // Row headers
}

export interface EmbedElement extends EditorElement {
  type: 'embed';
  embedType: string; // 'youtube', 'vimeo', etc.
  embedUrl: string;
  videoId?: string; // For video platforms
  title: string;
  thumbnail?: string;
}

export interface Slide {
  id: string;
  elements: (TextElement | ShapeElement | ImageElement | ChartElement | TableElement | EmbedElement)[];
  backgroundColor: string;
  backgroundImage?: string;
  style?: string;
  showSlideNumber?: boolean;
}

export interface EditorState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementIds: string[];
  isEditingText: boolean;
  zoom: number;
  canvasSize: { width: number; height: number };
  isDraggingElement: boolean;
  isPresentationMode: boolean;
  showPresentationModal: boolean;
  presentationModalType: string;
  showAddContentModal: boolean;
  showDesignPopup: boolean;
  designPopupType: 'text' | 'media' | 'shape' | 'chart' | 'table' | 'default';
  showAnimationPopup: boolean;
  showAnimationManager: boolean;
}

export interface EditorActions {
  setSlides: (slides: Slide[]) => void;
  addSlide: () => void;
  deleteSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setCurrentSlide: (index: number) => void;
  
  addElement: (slideId: string, element: Omit<EditorElement, 'id' | 'selected'>) => void;
  updateElement: (slideId: string, elementId: string, updates: Partial<EditorElement>) => void;
  deleteElement: (slideId: string, elementId: string) => void;
  selectElement: (elementId: string, multiSelect?: boolean) => void;
  deselectAll: () => void;
  
  setZoom: (zoom: number) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  
  // Text editing
  startTextEditing: (elementId: string) => void;
  stopTextEditing: () => void;
  updateTextContent: (elementId: string, content: string) => void;
  
  // Dragging state management
  setIsDraggingElement: (isDragging: boolean) => void;
  
  // Utility functions for the new clean architecture
  getCurrentSlide: () => Slide | null;
  getSelectedElement: () => EditorElement | null;
  getSelectedElements: () => EditorElement[];
  updateSelectedElements: (updates: Partial<EditorElement>) => void;
  updateSlideBackground: (backgroundColor: string) => void;
  updateSlideBackgroundImage: (backgroundImage: string) => void;
  updateSlideStyle: (style: string) => void;
  toggleSlideNumber: () => void;
  
  // Element creation helpers
  createTextElement: (x: number, y: number) => void;
  createShapeElement: (x: number, y: number, shapeType?: ShapeElement['shapeType']) => void;
  createImageElement: (x: number, y: number, src: string) => void;
  
  // Presentation mode management
  setPresentationMode: (isPresentationMode: boolean) => void;
  setShowPresentationModal: (show: boolean) => void;
  setPresentationModalType: (type: string) => void;
  setShowAddContentModal: (show: boolean) => void;
  determinePresentationModalType: () => string;
  startPresentation: () => void;
  
  // Design popup management
  setShowDesignPopup: (show: boolean) => void;
  setDesignPopupType: (type: 'text' | 'media' | 'shape' | 'chart' | 'table' | 'default') => void;
  triggerDesignPopup: (elementType: 'text' | 'media' | 'shape' | 'chart' | 'table' | 'default') => void;
  
  // Animation popup management
  setShowAnimationPopup: (show: boolean) => void;
  setShowAnimationManager: (show: boolean) => void;
  enterPresentationMode: () => void;
  exitPresentationMode: () => void;
  nextSlide: () => void;
  previousSlide: () => void;
}

export type EditorStore = EditorState & EditorActions;
