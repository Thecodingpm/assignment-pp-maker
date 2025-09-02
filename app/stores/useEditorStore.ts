import { create } from 'zustand';
import { EditorStore, Slide, TextElement, ShapeElement, ImageElement, EditorElement } from '../types/editor';

const createDefaultSlide = (): Slide => ({
  id: Date.now().toString(),
  elements: [],
  backgroundColor: '#ffffff',
});

const createDefaultTextElement = (x: number, y: number): TextElement => ({
  id: Date.now().toString(),
  type: 'text',
  x,
  y,
  width: 200,
  height: 60,
  rotation: 0,
  zIndex: 1,
  selected: false,
  content: 'Add text',
  fontSize: 24,
  fontFamily: 'Inter',
  fontWeight: '400',
  color: '#000000',
  textAlign: 'left',
  lineHeight: 1.2,
  isEditing: false,
});

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  slides: [createDefaultSlide()],
  currentSlideIndex: 0,
  selectedElementIds: [],
  isEditingText: false,
  zoom: 1,
  canvasSize: { width: 1920, height: 1080 },
  isDraggingElement: false,

  // Slide management
  addSlide: () => {
    const { slides, currentSlideIndex } = get();
    const newSlide = createDefaultSlide();
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    
    set({
      slides: newSlides,
      currentSlideIndex: currentSlideIndex + 1,
      selectedElementIds: [],
    });
  },

  deleteSlide: (slideId: string) => {
    const { slides, currentSlideIndex } = get();
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    
    if (slideIndex === -1) return;
    
    const newSlides = slides.filter(slide => slide.id !== slideId);
    
    if (newSlides.length === 0) {
      newSlides.push(createDefaultSlide());
    }
    
    let newCurrentIndex = currentSlideIndex;
    if (slideIndex <= currentSlideIndex) {
      newCurrentIndex = Math.max(0, currentSlideIndex - 1);
    }
    
    set({
      slides: newSlides,
      currentSlideIndex: newCurrentIndex,
      selectedElementIds: [],
    });
  },

  duplicateSlide: (slideId: string) => {
    const { slides, currentSlideIndex } = get();
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    
    if (slideIndex === -1) return;
    
    const originalSlide = slides[slideIndex];
    const duplicatedSlide: Slide = {
      ...originalSlide,
      id: Date.now().toString(),
      elements: originalSlide.elements.map(element => ({
        ...element,
        id: Date.now().toString() + Math.random(),
        selected: false,
      })) as (TextElement | ShapeElement | ImageElement)[],
    };
    
    const newSlides = [...slides];
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide);
    
    set({
      slides: newSlides,
      currentSlideIndex: slideIndex + 1,
      selectedElementIds: [],
    });
  },

  reorderSlides: (fromIndex: number, toIndex: number) => {
    const { slides, currentSlideIndex } = get();
    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    
    // Update current slide index
    let newCurrentIndex = currentSlideIndex;
    if (fromIndex === currentSlideIndex) {
      newCurrentIndex = toIndex;
    } else if (fromIndex < currentSlideIndex && toIndex >= currentSlideIndex) {
      newCurrentIndex = currentSlideIndex - 1;
    } else if (fromIndex > currentSlideIndex && toIndex <= currentSlideIndex) {
      newCurrentIndex = currentSlideIndex + 1;
    }
    
    set({
      slides: newSlides,
      currentSlideIndex: newCurrentIndex,
    });
  },

  setCurrentSlide: (index: number) => {
    const { slides } = get();
    if (index >= 0 && index < slides.length) {
      set({
        currentSlideIndex: index,
        selectedElementIds: [],
        isEditingText: false,
      });
    }
  },

  // Element management
  addElement: (slideId: string, elementData: Omit<EditorElement, 'id' | 'selected'>) => {
    const { slides } = get();
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    
    if (slideIndex === -1) return;
    
    const newElement = {
      ...elementData,
      id: Date.now().toString(),
      selected: false,
    } as TextElement | ShapeElement | ImageElement;
    
    console.log('Store: addElement called', { 
      slideId, 
      elementData, 
      newElement: { 
        id: newElement.id, 
        type: newElement.type, 
        isEditing: newElement.type === 'text' ? (newElement as any).isEditing : 'N/A'
      } 
    });
    
    const newSlides = [...slides];
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      elements: [...newSlides[slideIndex].elements, newElement],
    };
    
    set({ slides: newSlides });
  },

  updateElement: (slideId: string, elementId: string, updates: Partial<EditorElement>) => {
    const { slides } = get();
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    
    if (slideIndex === -1) return;
    
    const newSlides = [...slides];
    const elementIndex = newSlides[slideIndex].elements.findIndex(el => el.id === elementId);
    
    if (elementIndex === -1) return;
    
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      elements: newSlides[slideIndex].elements.map((el, index) =>
        index === elementIndex ? { ...el, ...updates } : el
      ) as (TextElement | ShapeElement | ImageElement)[],
    };
    
    set({ slides: newSlides });
  },

  deleteElement: (slideId: string, elementId: string) => {
    const { slides } = get();
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    
    if (slideIndex === -1) return;
    
    const newSlides = [...slides];
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      elements: newSlides[slideIndex].elements.filter(el => el.id !== elementId),
    };
    
    set({
      slides: newSlides,
      selectedElementIds: get().selectedElementIds.filter(id => id !== elementId),
    });
  },

  selectElement: (elementId: string, multiSelect = false) => {
    const { selectedElementIds } = get();
    
    if (multiSelect) {
      const isSelected = selectedElementIds.includes(elementId);
      if (isSelected) {
        set({
          selectedElementIds: selectedElementIds.filter(id => id !== elementId),
        });
      } else {
        set({
          selectedElementIds: [...selectedElementIds, elementId],
        });
      }
    } else {
      set({ selectedElementIds: [elementId] });
    }
  },

  deselectAll: () => {
    set({ selectedElementIds: [] });
  },

  // Canvas controls
  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.1, Math.min(3, zoom)) });
  },

  setCanvasSize: (size: { width: number; height: number }) => {
    set({ canvasSize: size });
  },

  // Text editing
  startTextEditing: (elementId: string) => {
    set({ isEditingText: true });
    
    // Update the specific element to show editing state
    const { slides, currentSlideIndex } = get();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      const element = currentSlide.elements.find(el => el.id === elementId);
      if (element && element.type === 'text') {
        get().updateElement(currentSlide.id, elementId, { 
          ...element,
          isEditing: true 
        } as TextElement);
      }
    }
  },

  stopTextEditing: () => {
    set({ isEditingText: false });
    
    // Update all elements to stop editing
    const { slides, currentSlideIndex } = get();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      currentSlide.elements.forEach(element => {
        if (element.type === 'text') {
          get().updateElement(currentSlide.id, element.id, { 
            ...element,
            isEditing: false 
          } as TextElement);
        }
      });
    }
  },

  updateTextContent: (elementId: string, content: string) => {
    const { slides, currentSlideIndex } = get();
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      const element = currentSlide.elements.find(el => el.id === elementId);
      if (element && element.type === 'text') {
        get().updateElement(currentSlide.id, elementId, { 
          ...element,
          content 
        } as TextElement);
      }
    }
  },

  // Dragging state management
  setIsDraggingElement: (isDragging: boolean) => {
    set({ isDraggingElement: isDragging });
  },
}));
