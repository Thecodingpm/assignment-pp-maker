// import aiTemplates from '../data/aiTemplates.json';
import { Slide, TextElement, ShapeElement, ImageElement } from '../types/editor';

interface AISlide {
  id?: string;
  type?: string;
  title?: string;
  content?: string;
  layout?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  elements?: AIElement[];
}

interface AIElement {
  id?: string;
  type?: string;
  content?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  textShadow?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  src?: string;
  alt?: string;
  credit?: string;
  originalWidth?: number;
  originalHeight?: number;
}

interface AIPresentation {
  title?: string;
  description?: string;
  tags?: string[];
  slides?: AISlide[];
}

interface MappedPresentation {
  title: string;
  description: string;
  tags: string[];
  slides: Slide[];
  metadata?: {
    generatedAt: string;
    source: string;
    version: string;
  };
}

/**
 * Maps individual AI elements to editor element format
 */
function mapElementToEditorFormat(element: AIElement, elementIndex: number, slideIndex: number): TextElement | ShapeElement | ImageElement {
  const baseElement = {
    id: element.id || `element-${slideIndex + 1}-${elementIndex + 1}`,
    x: element.x || 960,
    y: element.y || 300 + (elementIndex * 100),
    width: element.width || 800,
    height: element.height || 100,
    rotation: element.rotation || 0,
    zIndex: element.zIndex || elementIndex + 2,
    selected: false
  };

  switch (element.type) {
    case 'text':
      return {
        ...baseElement,
        type: 'text',
        content: element.content || 'Text content',
        fontSize: element.fontSize || 24,
        fontFamily: element.fontFamily || 'Inter',
        fontWeight: element.fontWeight || 'normal',
        color: element.color || '#1f2937',
        textAlign: element.textAlign || 'left',
        lineHeight: element.lineHeight || 1.2,
        isEditing: false
      } as TextElement;

    case 'shape':
      return {
        ...baseElement,
        type: 'shape',
        shapeType: element.shapeType || 'rectangle',
        fillColor: element.fillColor || '#e5e7eb',
        strokeColor: element.strokeColor || '#9ca3af',
        strokeWidth: element.strokeWidth || 2
      } as ShapeElement;

    case 'image':
      return {
        ...baseElement,
        type: 'image',
        src: element.src || '',
        alt: element.alt || 'Image',
        credit: element.credit || 'Unknown',
        originalWidth: element.originalWidth || baseElement.width,
        originalHeight: element.originalHeight || baseElement.height
      } as ImageElement;

    default:
      return {
        ...baseElement,
        type: 'text',
        content: element.content || 'Content',
        fontSize: element.fontSize || 24,
        fontFamily: element.fontFamily || 'Inter',
        fontWeight: element.fontWeight || 'normal',
        color: element.color || '#1f2937',
        textAlign: element.textAlign || 'left',
        lineHeight: element.lineHeight || 1.2,
        isEditing: false
      } as TextElement;
  }
}

/**
 * Maps AI presentation data to editor format
 */
export function mapAIToEditorFormat(aiData: AIPresentation): MappedPresentation {
  try {
    if (!aiData || !aiData.slides || !Array.isArray(aiData.slides)) {
      console.warn('Invalid AI data structure, creating default presentation');
      return createDefaultPresentation();
    }

    const mappedSlides: Slide[] = aiData.slides.map((slide, slideIndex) => {
      const mappedSlide: Slide = {
        id: slide.id || `slide-${slideIndex + 1}`,
        backgroundColor: slide.backgroundColor || '#ffffff',
        backgroundImage: slide.backgroundImage,
        elements: []
      };

      // Add overlay for slides with background images
      if (slide.backgroundImage) {
        mappedSlide.elements.push({
          id: `overlay-${slideIndex + 1}`,
          type: 'shape',
          shapeType: 'rectangle',
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          rotation: 0,
          zIndex: 1,
          selected: false,
          fillColor: 'rgba(0,0,0,0.4)',
          strokeColor: 'transparent',
          strokeWidth: 0
        } as ShapeElement);
      }

      // Map slide elements
      if (slide.elements && Array.isArray(slide.elements)) {
        const mappedElements = slide.elements.map((element, elementIndex) => {
          const mappedElement = mapElementToEditorFormat(element, elementIndex, slideIndex);
          // Ensure proper z-index for elements over overlays
          if (slide.backgroundImage) {
            mappedElement.zIndex = elementIndex + 2; // Start after overlay
          }
          return mappedElement;
        });
        mappedSlide.elements.push(...mappedElements);
      } else {
        // Create default elements if none provided
        const defaultElements = createDefaultSlideElements(slide, slideIndex);
        mappedSlide.elements.push(...defaultElements);
      }

      return mappedSlide;
    });

    return {
      slides: mappedSlides,
      title: aiData.title || 'AI Generated Presentation',
      description: aiData.description || 'Generated using AI',
      tags: aiData.tags || ['ai-generated'],
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'ai-generation',
        version: '1.0'
      }
    };
  } catch (error) {
    console.error('Error mapping AI data:', error);
    return createDefaultPresentation();
  }
}

/**
 * Creates default slide elements when AI doesn't provide them
 */
function createDefaultSlideElements(slide: AISlide, slideIndex: number): (TextElement | ShapeElement | ImageElement)[] {
  const elements: (TextElement | ShapeElement | ImageElement)[] = [];
  const hasBackground = !!slide.backgroundImage;

  // Add title element
  elements.push({
    id: `title-${slideIndex + 1}`,
    type: 'text',
    content: slide.title || `Slide ${slideIndex + 1}`,
    x: 960,
    y: 200,
    width: 800,
    height: 80,
    rotation: 0,
    zIndex: hasBackground ? 2 : 1,
    selected: false,
    fontSize: 36,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: hasBackground ? '#ffffff' : '#1f2937',
    textAlign: 'center',
    lineHeight: 1.2,
    isEditing: false
  } as TextElement);

  // Add content element
  if (slide.content) {
    elements.push({
      id: `content-${slideIndex + 1}`,
      type: 'text',
      content: slide.content,
      x: 960,
      y: 350,
      width: 700,
      height: 200,
      rotation: 0,
      zIndex: hasBackground ? 3 : 2,
      selected: false,
      fontSize: 24,
      fontFamily: 'Inter',
      fontWeight: 'normal',
      color: hasBackground ? '#f3f4f6' : '#374151',
      textAlign: 'left',
      lineHeight: 1.4,
      isEditing: false
    } as TextElement);
  }

  // Add a placeholder image for content slides (only if no background image)
  if (slide.type === 'content' && !hasBackground) {
    elements.push({
      id: `placeholder-image-${slideIndex + 1}`,
      type: 'image',
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center',
      alt: 'Content visualization',
      credit: 'Unsplash',
      originalWidth: 400,
      originalHeight: 300,
      x: 1200,
      y: 300,
      width: 400,
      height: 300,
      rotation: 0,
      zIndex: 3,
      selected: false
    } as ImageElement);
  }

  // Add decorative elements for title slides
  if (slide.type === 'title') {
    elements.push({
      id: `accent-line-${slideIndex + 1}`,
      type: 'shape',
      shapeType: 'rectangle',
      x: 960,
      y: 280,
      width: 200,
      height: 4,
      rotation: 0,
      zIndex: hasBackground ? 4 : 3,
      selected: false,
      fillColor: '#3b82f6',
      strokeColor: 'transparent',
      strokeWidth: 0
    } as ShapeElement);
  }

  return elements;
}

/**
 * Creates a default presentation when AI data is invalid
 */
function createDefaultPresentation(): MappedPresentation {
  return {
    slides: [
      {
        id: 'slide-1',
        backgroundColor: '#ffffff',
        backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop&crop=center',
        elements: [
          {
            id: 'overlay-1',
            type: 'shape',
            shapeType: 'rectangle',
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            rotation: 0,
            zIndex: 1,
            selected: false,
            fillColor: 'rgba(0,0,0,0.5)',
            strokeColor: 'transparent',
            strokeWidth: 0
          } as ShapeElement,
          {
            id: 'title-1',
            type: 'text',
            content: 'Your Presentation Title',
            x: 960,
            y: 300,
            width: 800,
            height: 120,
            rotation: 0,
            zIndex: 2,
            selected: false,
            fontSize: 48,
            fontFamily: 'Inter',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.2,
            isEditing: false
          } as TextElement,
          {
            id: 'subtitle-1',
            type: 'text',
            content: 'Click to edit and start building your slides',
            x: 960,
            y: 450,
            width: 600,
            height: 80,
            rotation: 0,
            zIndex: 3,
            selected: false,
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 'normal',
            color: '#f3f4f6',
            textAlign: 'center',
            lineHeight: 1.2,
            isEditing: false
          } as TextElement
        ]
      }
    ],
    title: 'Default Presentation',
    description: 'Start building your presentation',
    tags: ['default'],
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'default',
      version: '1.0'
    }
  };
}

/**
 * Gets a template by ID from the AI templates
 */
export function getAITemplate(templateId: string): MappedPresentation | null {
  try {
    // Temporarily disabled due to JSON import issues
    // const template = (aiTemplates as any).templates?.find((t: any) => t.id === templateId);
    // if (template) {
    //   return mapAIToEditorFormat(template);
    // }
    return null;
  } catch (error) {
    console.error('Error getting AI template:', error);
    return null;
  }
}

/**
 * Gets all available AI templates
 */
export function getAllAITemplates() {
  try {
    // Temporarily disabled due to JSON import issues
    // return (aiTemplates as any).templates?.map((template: any) => ({
    //   id: template.id,
    //   name: template.name,
    //   description: template.description,
    //   category: template.category,
    //   slideCount: template.slides?.length || 0
    // })) || [];
    return [];
  } catch (error) {
    console.error('Error getting all AI templates:', error);
    return [];
  }
}

/**
 * Gets default settings from AI templates
 */
export function getDefaultSettings() {
  try {
    // Temporarily disabled due to JSON import issues
    // return (aiTemplates as any).defaultSettings || {};
    return {};
  } catch (error) {
    console.error('Error getting default settings:', error);
    return {};
  }
}

/**
 * Validates and cleans AI-generated data
 */
export function validateAIData(aiData: AIPresentation): boolean {
  if (!aiData) return false;
  
  if (!Array.isArray(aiData.slides) || aiData.slides.length === 0) {
    return false;
  }
  
  return true;
}
