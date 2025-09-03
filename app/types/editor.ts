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
}

export interface TextElement extends EditorElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  isEditing: boolean;
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
}

export interface EditorState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementIds: string[];
  isEditingText: boolean;
  zoom: number;
  canvasSize: { width: number; height: number };
  isDraggingElement: boolean;
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
}

export type EditorStore = EditorState & EditorActions;
