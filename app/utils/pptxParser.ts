import JSZip from 'jszip';

export interface ParsedSlide {
  id: string;
  title: string;
  content: string;
  elements: SlideElement[];
  background?: string;
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
  imageUrl?: string;
  shapeType?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface ParsedPresentation {
  title: string;
  slides: ParsedSlide[];
  metadata: {
    originalFileName: string;
    slideCount: number;
    createdAt: string;
  };
}

export async function parsePptxFile(file: File): Promise<ParsedPresentation> {
  try {
    console.log('=== PPTX PARSING START ===');
    console.log('File:', file.name, 'Size:', file.size, 'bytes');
    
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Extract presentation title from filename
    const title = file.name.replace(/\.[^/.]+$/, "");
    
    // Parse slides from presentation.xml
    const slides = await parseSlides(zip);
    
    console.log('✅ PPTX parsing completed');
    console.log('Slides found:', slides.length);
    
    return {
      title,
      slides,
      metadata: {
        originalFileName: file.name,
        slideCount: slides.length,
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Error parsing PPTX file:', error);
    throw new Error(`Failed to parse PPTX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function parseSlides(zip: JSZip): Promise<ParsedSlide[]> {
  const slides: ParsedSlide[] = [];
  
  try {
    // Get slide files from ppt/slides/
    const slideFiles = Object.keys(zip.files).filter(fileName => 
      fileName.startsWith('ppt/slides/slide') && fileName.endsWith('.xml')
    );
    
    console.log('Found slide files:', slideFiles);
    
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const slideXml = await zip.file(slideFile)?.async('text');
      
      if (slideXml) {
        const slide = await parseSlideXml(slideXml, i + 1);
        slides.push(slide);
      }
    }
    
    // If no slides found, create a default slide
    if (slides.length === 0) {
      slides.push(createDefaultSlide(1));
    }
    
  } catch (error) {
    console.error('Error parsing slides:', error);
    // Return a default slide if parsing fails
    slides.push(createDefaultSlide(1));
  }
  
  return slides;
}

async function parseSlideXml(xmlContent: string, slideNumber: number): Promise<ParsedSlide> {
  try {
    // Parse XML content to extract text and elements
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Extract text content from the slide
    const textElements = xmlDoc.querySelectorAll('a\\:t, t');
    let content = '';
    const elements: SlideElement[] = [];
    
    textElements.forEach((textEl, index) => {
      const text = textEl.textContent || '';
      if (text.trim()) {
        content += text + ' ';
        
        // Create a text element for each text block
        elements.push({
          id: `text-${slideNumber}-${index}`,
          type: 'text',
          x: 100 + (index * 20),
          y: 100 + (index * 30),
          width: 300,
          height: 60,
          content: text.trim(),
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left'
        });
      }
    });
    
    return {
      id: `slide-${slideNumber}`,
      title: `Slide ${slideNumber}`,
      content: content.trim() || `Slide ${slideNumber}`,
      elements
    };
    
  } catch (error) {
    console.error('Error parsing slide XML:', error);
    return createDefaultSlide(slideNumber);
  }
}

function createDefaultSlide(slideNumber: number): ParsedSlide {
  return {
    id: `slide-${slideNumber}`,
    title: `Slide ${slideNumber}`,
    content: `Slide ${slideNumber}`,
    elements: [
      {
        id: `text-${slideNumber}-1`,
        type: 'text',
        x: 100,
        y: 100,
        width: 300,
        height: 60,
        content: `Slide ${slideNumber}`,
        fontSize: 24,
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#000000',
        textAlign: 'left'
      }
    ]
  };
}

// Convert parsed presentation to editor format
export function convertToEditorFormat(parsedPresentation: ParsedPresentation) {
  const slides = parsedPresentation.slides.map(slide => ({
    id: slide.id,
    elements: slide.elements.map(element => ({
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: 0,
      zIndex: 1,
      selected: false,
      ...(element.type === 'text' && {
        content: element.content || '',
        fontSize: element.fontSize || 16,
        fontFamily: element.fontFamily || 'Inter',
        fontWeight: element.fontWeight || '400',
        color: element.color || '#000000',
        textAlign: element.textAlign || 'left',
        lineHeight: 1.2,
        isEditing: false
      }),
      ...(element.type === 'image' && {
        src: element.imageUrl || '',
        alt: 'Image'
      }),
      ...(element.type === 'shape' && {
        shapeType: element.shapeType || 'rectangle',
        fillColor: element.fillColor || '#3B82F6',
        strokeColor: element.strokeColor || '#1E40AF',
        strokeWidth: element.strokeWidth || 2
      })
    })),
    backgroundColor: '#ffffff'
  }));
  
  return {
    title: parsedPresentation.title,
    slides,
    metadata: parsedPresentation.metadata
  };
}
