import mammoth from 'mammoth';
import { DocumentBlock, StructuredDocument } from '../types/document';

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'image';
  content: string;
  level?: number;
  listType?: 'bullet' | 'numbered';
  styling: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
    fontWeight?: string;
    marginTop?: string;
    marginBottom?: string;
  };
  imageData?: {
    base64: string;
    alt: string;
    width?: string;
    height?: string;
  };
}

export async function parseDocumentToBlocks(
  file: File,
  originalFileName: string
): Promise<StructuredDocument> {
  const blocks: DocumentBlock[] = [];
  const now = new Date().toISOString();

  try {
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Parse DOCX file
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ 
        arrayBuffer
      });
      
      // Extract title from the first heading or use filename
      const title = extractTitle(result.value) || originalFileName.replace(/\.[^/.]+$/, '');
      
      // Parse the HTML content into structured blocks
      const parsedElements = parseHtmlToElements(result.value);
      
      // Convert parsed elements to DocumentBlock format
      blocks.push(...parsedElements.map((element, index) => ({
        id: generateBlockId(index),
        type: element.type,
        content: element.content,
        styling: element.styling,
        level: element.level,
        listType: element.listType,
        imageUrl: element.imageData?.base64,
      })));

      return {
        id: generateDocumentId(),
        title,
        blocks,
        metadata: {
          originalFileName,
          createdAt: now,
          lastModified: now,
        },
      };
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      // Handle HTML files directly
      const htmlContent = await file.text();
      const title = extractTitle(htmlContent) || originalFileName.replace(/\.[^/.]+$/, '');
      
      // Parse the HTML content into structured blocks
      const parsedElements = parseHtmlToElements(htmlContent);
      
      // Convert parsed elements to DocumentBlock format
      blocks.push(...parsedElements.map((element, index) => ({
        id: generateBlockId(index),
        type: element.type,
        content: element.content,
        styling: element.styling,
        level: element.level,
        listType: element.listType,
        imageUrl: element.imageData?.base64,
      })));

      return {
        id: generateDocumentId(),
        title,
        blocks,
        metadata: {
          originalFileName,
          createdAt: now,
          lastModified: now,
        },
      };
    } else {
      // Handle other file types (plain text, etc.)
      const text = await file.text();
      const title = originalFileName.replace(/\.[^/.]+$/, '');
      
      // Split text into paragraphs and create blocks
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
      
      blocks.push(...paragraphs.map((paragraph, index) => ({
        id: generateBlockId(index),
        type: 'paragraph' as const,
        content: paragraph.trim(),
        styling: {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          textAlign: 'left',
        },
      })));

      return {
        id: generateDocumentId(),
        title,
        blocks,
        metadata: {
          originalFileName,
          createdAt: now,
          lastModified: now,
        },
      };
    }
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTitle(html: string): string | null {
  // Look for the first h1-h6 tag
  const headingMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
  if (headingMatch) {
    return stripHtmlTags(headingMatch[1]);
  }
  return null;
}

function parseHtmlToElements(html: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Process each child node
  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const parsed = parseElement(element);
      if (parsed) {
        elements.push(parsed);
      }
    }
  });
  
  return elements;
}

function parseElement(element: Element): ParsedElement | null {
  const tagName = element.tagName.toLowerCase();
  const content = element.innerHTML; // Keep HTML content for better formatting preservation
  
  if (!content.trim()) return null;
  
  const styling = extractStyling(element);
  
  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        content,
        level: parseInt(tagName.charAt(1)),
        styling,
      };
      
    case 'p':
      return {
        type: 'paragraph',
        content,
        styling,
      };
      
    case 'ul':
    case 'ol':
      const listType = tagName === 'ul' ? 'bullet' : 'numbered';
      return {
        type: 'list',
        content,
        listType,
        styling,
      };
      
    case 'img':
      const src = element.getAttribute('src');
      const alt = element.getAttribute('alt') || '';
      const width = element.getAttribute('width') || undefined;
      const height = element.getAttribute('height') || undefined;
      
      if (src) {
        return {
          type: 'image',
          content: alt,
          styling,
          imageData: {
            base64: src.startsWith('data:') ? src : '', // Handle base64 images
            alt,
            width,
            height,
          },
        };
      }
      break;
      
    case 'li':
      // Handle list items as paragraphs for now
      return {
        type: 'paragraph',
        content: `• ${content}`,
        styling,
      };
      
    case 'div':
    case 'section':
    case 'article':
      // Handle div-like elements as paragraphs
      return {
        type: 'paragraph',
        content,
        styling,
      };
      
    case 'blockquote':
      return {
        type: 'paragraph',
        content: `<blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin: 16px 0;">${content}</blockquote>`,
        styling,
      };
  }
  
  return null;
}

function extractStyling(element: Element): ParsedElement['styling'] {
  const style = element.getAttribute('style') || '';
  const computedStyle = window.getComputedStyle ? window.getComputedStyle(element) : null;
  
  const styling: ParsedElement['styling'] = {};
  
  // Extract inline styles
  if (style) {
    const stylePairs = style.split(';').filter(pair => pair.trim());
    stylePairs.forEach(pair => {
      const [property, value] = pair.split(':').map(s => s.trim());
      if (property && value) {
        switch (property) {
          case 'font-size':
            styling.fontSize = value;
            break;
          case 'font-family':
            styling.fontFamily = value;
            break;
          case 'color':
            styling.color = value;
            break;
          case 'background-color':
            styling.backgroundColor = value;
            break;
          case 'text-align':
            styling.textAlign = value;
            break;
          case 'font-weight':
            styling.fontWeight = value;
            break;
          case 'margin-top':
            styling.marginTop = value;
            break;
          case 'margin-bottom':
            styling.marginBottom = value;
            break;
        }
      }
    });
  }
  
  // Extract computed styles if available
  if (computedStyle) {
    if (!styling.fontSize) styling.fontSize = computedStyle.fontSize;
    if (!styling.fontFamily) styling.fontFamily = computedStyle.fontFamily;
    if (!styling.color) styling.color = computedStyle.color;
    if (!styling.backgroundColor) styling.backgroundColor = computedStyle.backgroundColor;
    if (!styling.textAlign) styling.textAlign = computedStyle.textAlign;
    if (!styling.fontWeight) styling.fontWeight = computedStyle.fontWeight;
  }
  
  return styling;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function generateBlockId(index: number): string {
  return `block_${Date.now()}_${index}`;
}

function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to convert image to base64
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Utility function to handle image uploads separately
export async function uploadImageToStorage(imageFile: File): Promise<string> {
  // This would typically upload to your storage service (Firebase, AWS, etc.)
  // For now, we'll convert to base64
  return imageToBase64(imageFile);
}
