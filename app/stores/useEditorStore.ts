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
  isPresentationMode: false,
  showPresentationModal: false,
  presentationModalType: 'default',
  showAddContentModal: false,
  showDesignPopup: false,
  designPopupType: 'default',
  showAnimationPopup: false,
  showAnimationManager: false,

  // Slide management
  setSlides: (newSlides: Slide[]) => {
    set({
      slides: newSlides,
      currentSlideIndex: 0,
      selectedElementIds: [],
      isEditingText: false,
    });
  },

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
    
    if (slideIndex === -1) {
      console.warn('Store: updateElement - slide not found', { slideId, elementId });
      return;
    }
    
    const newSlides = [...slides];
    const elementIndex = newSlides[slideIndex].elements.findIndex(el => el.id === elementId);
    
    if (elementIndex === -1) {
      console.warn('Store: updateElement - element not found', { slideId, elementId, slideElements: newSlides[slideIndex].elements.length });
      return;
    }
    
    const oldElement = newSlides[slideIndex].elements[elementIndex];
    const updatedElement = { ...oldElement, ...updates };
    
    console.log('Store: updateElement', { 
      slideId, 
      elementId, 
      oldPosition: { x: oldElement.x, y: oldElement.y },
      newPosition: { x: updatedElement.x, y: updatedElement.y },
      updates 
    });
    
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      elements: newSlides[slideIndex].elements.map((el, index) =>
        index === elementIndex ? updatedElement : el
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

  // Utility functions for the new clean architecture
  getCurrentSlide: () => {
    const { slides, currentSlideIndex } = get();
    return slides[currentSlideIndex] || null;
  },

  getSelectedElement: () => {
    const { selectedElementIds, slides, currentSlideIndex } = get();
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || selectedElementIds.length === 0) return null;
    
    return currentSlide.elements.find(element => 
      selectedElementIds.includes(element.id)
    ) || null;
  },

  getSelectedElements: () => {
    const { selectedElementIds, slides, currentSlideIndex } = get();
    const currentSlide = slides[currentSlideIndex];
    if (!currentSlide || selectedElementIds.length === 0) return [];
    
    return currentSlide.elements.filter(element => 
      selectedElementIds.includes(element.id)
    );
  },

  // Batch operations for multiple selected elements
  updateSelectedElements: (updates: Partial<EditorElement>) => {
    const { selectedElementIds, slides, currentSlideIndex, updateElement } = get();
    const currentSlide = slides[currentSlideIndex];
    
    if (!currentSlide) return;
    
    selectedElementIds.forEach(elementId => {
      updateElement(currentSlide.id, elementId, updates);
    });
  },

  // Slide background management
  updateSlideBackground: (backgroundColor: string) => {
    const { slides, currentSlideIndex } = get();
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      backgroundColor
    };
    set({ slides: newSlides });
  },

  updateSlideBackgroundImage: (backgroundImage: string) => {
    const { slides, currentSlideIndex } = get();
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      backgroundImage
    };
    set({ slides: newSlides });
  },

  updateSlideStyle: (style: string) => {
    const { slides, currentSlideIndex } = get();
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      style
    };
    set({ slides: newSlides });
  },

  toggleSlideNumber: () => {
    const { slides, currentSlideIndex } = get();
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      showSlideNumber: !newSlides[currentSlideIndex].showSlideNumber
    };
    set({ slides: newSlides });
  },

  // Element creation helpers
  createTextElement: (x: number, y: number) => {
    const { addElement, getCurrentSlide } = get();
    const currentSlide = getCurrentSlide();
    if (!currentSlide) return;

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
  },

  createShapeElement: (x: number, y: number, shapeType: ShapeElement['shapeType'] = 'rectangle') => {
    const { addElement, getCurrentSlide } = get();
    const currentSlide = getCurrentSlide();
    if (!currentSlide) return;

    const newShapeElement: Omit<ShapeElement, 'id' | 'selected'> = {
      type: 'shape',
      x,
      y,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 1,
      shapeType,
      fillColor: '#3B82F6',
      strokeColor: '#1E40AF',
      strokeWidth: 2,
    };

    addElement(currentSlide.id, newShapeElement);
  },

  createImageElement: (x: number, y: number, src: string) => {
    const { addElement, getCurrentSlide } = get();
    const currentSlide = getCurrentSlide();
    if (!currentSlide) return;

    const newImageElement: Omit<ImageElement, 'id' | 'selected'> = {
      type: 'image',
      x,
      y,
      width: 200,
      height: 150,
      rotation: 0,
      zIndex: 1,
      src,
      alt: 'Image',
    };

    addElement(currentSlide.id, newImageElement);
  },

  // Presentation mode management
  setPresentationMode: (isPresentationMode: boolean) => {
    set({ isPresentationMode });
  },

  setShowPresentationModal: (show: boolean) => {
    set({ showPresentationModal: show });
  },

  setPresentationModalType: (type: string) => {
    set({ presentationModalType: type });
  },

  // Add content modal
  setShowAddContentModal: (show: boolean) => {
    set({ showAddContentModal: show });
  },

  // Determine which popup to show based on conditions
  determinePresentationModalType: () => {
    const { slides, currentSlideIndex } = get();
    const currentSlide = slides[currentSlideIndex];
    
    if (!currentSlide) return 'default';
    
    const slideCount = slides.length;
    const elementCount = currentSlide.elements.length;
    const hasText = currentSlide.elements.some(el => el.type === 'text');
    const hasImages = currentSlide.elements.some(el => el.type === 'image');
    const hasShapes = currentSlide.elements.some(el => el.type === 'shape');
    
    // Condition 1: Empty presentation
    if (slideCount === 1 && elementCount === 0) {
      return 'empty';
    }
    
    // Condition 2: Single slide with minimal content
    if (slideCount === 1 && elementCount <= 2 && !hasImages) {
      return 'minimal';
    }
    
    // Condition 3: Rich content presentation
    if (hasImages && hasShapes && hasText) {
      return 'rich';
    }
    
    // Condition 4: Text-heavy presentation
    if (hasText && !hasImages && !hasShapes) {
      return 'text-heavy';
    }
    
    // Condition 5: Default/ready to present
    return 'ready';
  },

  // Start presentation with modal
  startPresentation: () => {
    const { determinePresentationModalType } = get();
    const modalType = determinePresentationModalType();
    
    set({
      showPresentationModal: true,
      presentationModalType: modalType,
    });
  },

  // Start actual presentation mode
  enterPresentationMode: () => {
    set({
      isPresentationMode: true,
      showPresentationModal: false,
      currentSlideIndex: 0,
    });
  },

  // Exit presentation mode
  exitPresentationMode: () => {
    set({
      isPresentationMode: false,
      showPresentationModal: false,
    });
  },

  // Navigate slides in presentation mode
  nextSlide: () => {
    const { slides, currentSlideIndex, isPresentationMode } = get();
    if (!isPresentationMode) return;
    
    const nextIndex = Math.min(currentSlideIndex + 1, slides.length - 1);
    set({ currentSlideIndex: nextIndex });
  },

  previousSlide: () => {
    const { currentSlideIndex, isPresentationMode } = get();
    if (!isPresentationMode) return;
    
    const prevIndex = Math.max(currentSlideIndex - 1, 0);
    set({ currentSlideIndex: prevIndex });
  },

  // Design popup management
  setShowDesignPopup: (show: boolean) => {
    set({ showDesignPopup: show });
  },

  setDesignPopupType: (type: 'text' | 'media' | 'shape' | 'chart' | 'table' | 'default') => {
    set({ designPopupType: type });
  },

  // Animation popup management
  setShowAnimationPopup: (show: boolean) => {
    set({ showAnimationPopup: show });
  },

  setShowAnimationManager: (show: boolean) => {
    set({ showAnimationManager: show });
  },

  triggerDesignPopup: (elementType: 'text' | 'media' | 'shape' | 'chart' | 'table' | 'default') => {
    set({ 
      designPopupType: elementType,
      showDesignPopup: true 
    });
  },
}));
