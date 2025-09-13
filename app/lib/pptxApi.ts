// Backend PPTX parsing API service

const BACKEND_URL = 'http://localhost:5001';

export interface ParsedPresentation {
  title: string;
  slides: ParsedSlide[];
  metadata: {
    originalFileName: string;
    slideCount: number;
    createdAt: string;
    slide_width?: number;
    slide_height?: number;
    presentation_width?: number;
    presentation_height?: number;
  };
}

export interface ParsedSlide {
  id: string;
  title: string;
  content: string;
  elements: SlideElement[];
  background: string;
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: string;
  src?: string;
  imageUrl?: string;
  alt?: string;
  shapeType?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export async function parsePptxFile(file: File): Promise<ParsedPresentation> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Send to backend
    const response = await fetch(`${BACKEND_URL}/api/parse-pptx`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    throw new Error(`Failed to parse PPTX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Convert parsed presentation to editor format
export function convertToEditorFormat(parsedPresentation: ParsedPresentation) {
  console.log('🔄 Converting to editor format:', parsedPresentation);
  
  const slides = parsedPresentation.slides.map((slide) => {
    console.log('📄 Processing slide:', slide.id);
    const elements = slide.elements.map((element) => {
      console.log('🎯 Processing element:', element.type, element);
      
      const baseElement = {
        id: element.id,
        type: element.type,
        x: Math.max(element.x, 50),
        y: Math.max(element.y, 50),
        width: Math.max(element.width, 200),
        height: Math.max(element.height, 60),
        rotation: 0,
        zIndex: 1,
        selected: false,
      };
      
      if (element.type === 'text') {
        const textElement = {
          ...baseElement,
          content: element.content || '',
          fontSize: Math.max(element.fontSize || 24, 8),
          fontFamily: element.fontFamily || 'Inter',
          fontWeight: element.fontWeight || 'normal',
          color: element.color || '#000000',
          textAlign: element.textAlign || 'left',
          lineHeight: 1.2,
          isEditing: false
        };
        console.log('📝 Created text element:', {
          id: textElement.id,
          content: textElement.content?.substring(0, 50),
          fontSize: textElement.fontSize,
          fontFamily: textElement.fontFamily,
          fontWeight: textElement.fontWeight,
          color: textElement.color,
          textAlign: textElement.textAlign
        });
        return textElement;
      }
      
      if (element.type === 'image') {
        const imageElement = {
          ...baseElement,
          src: element.src || element.imageUrl || '',
          alt: element.alt || 'Image'
        };
        console.log('🖼️ Created image element:', {
          id: imageElement.id,
          hasSrc: !!imageElement.src,
          srcLength: imageElement.src?.length,
          srcPreview: imageElement.src?.substring(0, 100),
          position: `${imageElement.x}, ${imageElement.y}`,
          size: `${imageElement.width}x${imageElement.height}`,
          fullElement: imageElement
        });
        return imageElement;
      }
      
      if (element.type === 'shape') {
        return {
          ...baseElement,
          shapeType: element.shapeType || 'rectangle',
          fillColor: element.fillColor || '#3B82F6',
          strokeColor: element.strokeColor || '#1E40AF',
          strokeWidth: element.strokeWidth || 2
        };
      }
      
      return baseElement;
    });
    
    return {
      id: slide.id,
      elements,
      backgroundColor: slide.background || '#ffffff'
    };
  });
  
  return {
    title: parsedPresentation.title,
    slides,
    metadata: parsedPresentation.metadata,
    dimensions: {
      width: parsedPresentation.metadata.presentation_width || 960,
      height: parsedPresentation.metadata.presentation_height || 540
    }
  };
}
