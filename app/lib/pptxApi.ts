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
          content: element.content || element.text || '',
          fontSize: Math.max(element.fontSize || 24, 8),
          fontFamily: element.fontFamily || 'Inter',
          fontWeight: element.fontWeight || 'normal',
          color: element.color || '#000000',
          textAlign: element.textAlign || 'left',
          lineHeight: element.lineHeight || 1.2,
          isEditing: false,
          // Preserve original positioning
          x: element.x || 0,
          y: element.y || 0,
          width: element.width || 200,
          height: element.height || 50,
          // Add animation data if present
          animation: element.animation || null,
          // Add additional text properties
          textDecoration: element.textDecoration || 'none',
          fontStyle: element.fontStyle || 'normal',
          letterSpacing: element.letterSpacing || 'normal'
        };
        console.log('📝 Created text element:', {
          id: textElement.id,
          content: textElement.content?.substring(0, 50),
          fontSize: textElement.fontSize,
          fontFamily: textElement.fontFamily,
          fontWeight: textElement.fontWeight,
          color: textElement.color,
          textAlign: textElement.textAlign,
          hasAnimation: !!textElement.animation,
          position: `${textElement.x}, ${textElement.y}`,
          size: `${textElement.width}x${textElement.height}`
        });
        return textElement;
      }
      
      if (element.type === 'image') {
        // Try multiple possible image source properties
        const imageSrc = element.src || element.imageUrl || element.imageSrc || element.data || element.base64 || '';
        
        console.log('🔍 Processing image element from backend:', {
          id: element.id,
          type: element.type,
          hasSrc: !!element.src,
          srcLength: element.src?.length,
          srcPreview: element.src?.substring(0, 100),
          allProperties: Object.keys(element),
          element: element
        });
        
        const imageElement = {
          ...baseElement,
          src: imageSrc,
          alt: element.alt || element.imageAlt || 'Image',
          // Preserve original positioning and sizing
          x: element.x || 0,
          y: element.y || 0,
          width: element.width || 200,
          height: element.height || 150,
          // Add animation data if present
          animation: element.animation || null,
          // Add any additional image properties
          imageData: element.imageData || null,
          imageFormat: element.imageFormat || 'png',
          // Add fallback for missing images
          hasImage: !!imageSrc,
          isPlaceholder: !imageSrc
        };
        
        // If no image source, create a placeholder
        if (!imageSrc) {
          console.warn('⚠️ No image source found for element:', element);
          imageElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWOTBIODBWNjBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik05MCA3MEgxMTBWODBIOTBWNzBaIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K';
          imageElement.isPlaceholder = true;
        }
        
        console.log('🖼️ Created image element:', {
          id: imageElement.id,
          hasSrc: !!imageElement.src,
          srcLength: imageElement.src?.length,
          srcPreview: imageElement.src?.substring(0, 100),
          position: `${imageElement.x}, ${imageElement.y}`,
          size: `${imageElement.width}x${imageElement.height}`,
          hasAnimation: !!imageElement.animation,
          isPlaceholder: imageElement.isPlaceholder,
          fullElement: imageElement
        });
        return imageElement;
      }
      
      if (element.type === 'shape') {
        return {
          ...baseElement,
          shapeType: element.shapeType || 'rectangle',
          fillColor: element.fillColor || element.fill || '#3B82F6',
          strokeColor: element.strokeColor || element.stroke || '#1E40AF',
          strokeWidth: element.strokeWidth || 2,
          // Preserve original positioning
          x: element.x || 0,
          y: element.y || 0,
          width: element.width || 200,
          height: element.height || 100,
          // Add animation data if present
          animation: element.animation || null,
          // Add additional shape properties
          borderRadius: element.borderRadius || 0,
          opacity: element.opacity || 1
        };
      }
      
      return baseElement;
    });
    
    return {
      id: slide.id,
      elements,
      backgroundColor: slide.background || slide.backgroundColor || '#ffffff',
      // Preserve slide-level properties
      backgroundImage: slide.backgroundImage || null,
      backgroundSize: slide.backgroundSize || 'cover',
      backgroundPosition: slide.backgroundPosition || 'center',
      // Add slide-level animations if present
      slideAnimation: slide.slideAnimation || null,
      // Add slide dimensions
      width: slide.width || 1920,
      height: slide.height || 1080
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
