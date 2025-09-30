// Note: pptx2json uses Node.js fs module which doesn't work in browser
// We'll use a different approach for browser compatibility

export interface PptxElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table' | 'chart' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  groupId?: string;
  parentId?: string;
}

export interface PptxTextElement extends PptxElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  lineHeight: number;
  letterSpacing: number;
  textDecoration: string;
}

export interface PptxImageElement extends PptxElement {
  type: 'image';
  src: string;
  alt?: string;
  originalWidth: number;
  originalHeight: number;
  aspectRatio: number;
  crop?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  mask?: {
    type: 'rectangle' | 'circle' | 'polygon' | 'path';
    path?: string;
    width?: number;
    height?: number;
  };
}

export interface PptxShapeElement extends PptxElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'path' | 'line' | 'arrow' | 'star' | 'heart' | 'cloud' | 'custom';
  path?: string;
  fill?: {
    type: 'solid' | 'gradient' | 'pattern' | 'image';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial' | 'conic';
      stops: Array<{ position: number; color: string }>;
      angle?: number;
    };
  };
  stroke?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted' | 'dashdot';
  };
}

export interface PptxSlide {
  id: string;
  title?: string;
  width: number;
  height: number;
  aspectRatio: number;
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'pattern';
    color?: string;
  };
  elements: Array<PptxTextElement | PptxImageElement | PptxShapeElement>;
}

export interface PptxDocument {
  title: string;
  author?: string;
  created: Date;
  modified: Date;
  slides: PptxSlide[];
  fonts: Array<{
    name: string;
    family: string;
    weight: string;
    style: string;
    src?: string;
    embedded?: boolean;
  }>;
}

export class EnhancedPptxParser {
  /**
   * Parse a PPTX file with high fidelity
   */
  async parsePptxFile(file: File): Promise<PptxDocument> {
    try {
      console.log('🚀 Starting enhanced PPTX parsing...');
      
      // Parse the PPTX file using pptx2json
      const pptxData = await this.parsePptxStructure(file);
      
      // Extract comprehensive document information
      const document = await this.extractDocumentInfo(pptxData);
      
      // Process slides with high fidelity
      const slides = await this.processSlides(pptxData, document);
      
      // Extract and process fonts
      const fonts = await this.extractFonts(pptxData);
      
      const result: PptxDocument = {
        ...document,
        slides,
        fonts
      };

      console.log('✅ Enhanced PPTX parsing completed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error parsing PPTX file:', error);
      throw new Error(`Failed to parse PPTX file: ${error.message}`);
    }
  }

  /**
   * Parse the basic PPTX structure using backend API
   */
  private async parsePptxStructure(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5001/parse-pptx', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error parsing PPTX via backend:', error);
      throw new Error(`Failed to parse PPTX file: ${error.message}`);
    }
  }

  /**
   * Extract document metadata and information
   */
  private async extractDocumentInfo(pptxData: any): Promise<Partial<PptxDocument>> {
    const coreProps = pptxData['docProps/core.xml'] || {};
    const appProps = pptxData['docProps/app.xml'] || {};
    
    return {
      title: coreProps['dc:title'] || 'Untitled Presentation',
      author: coreProps['dc:creator'] || appProps['Author'] || 'Unknown',
      created: coreProps['dcterms:created'] ? new Date(coreProps['dcterms:created']) : new Date(),
      modified: coreProps['dcterms:modified'] ? new Date(coreProps['dcterms:modified']) : new Date()
    };
  }

  /**
   * Process all slides with high fidelity
   */
  private async processSlides(pptxData: any, document: Partial<PptxDocument>): Promise<PptxSlide[]> {
    const slides: PptxSlide[] = [];
    const slideData = pptxData['ppt/slides'] || {};
    
    for (const [slideId, slideContent] of Object.entries(slideData)) {
      try {
        const slide = await this.processSlide(slideId, slideContent as any, pptxData);
        slides.push(slide);
      } catch (error) {
        console.warn(`⚠️ Failed to process slide ${slideId}:`, error);
        // Add a placeholder slide to maintain slide count
        slides.push(this.createPlaceholderSlide(slideId));
      }
    }
    
    return slides;
  }

  /**
   * Process a single slide with comprehensive element extraction
   */
  private async processSlide(slideId: string, slideContent: any, pptxData: any): Promise<PptxSlide> {
    console.log(`📄 Processing slide ${slideId}...`);
    
    // Extract slide dimensions and properties
    const slideProps = slideContent['p:sld']['p:cSld'] || {};
    const slideSize = this.extractSlideSize(slideProps);
    
    // Extract background
    const background = this.extractBackground(slideProps);
    
    // Extract all elements
    const elements = await this.extractElements(slideProps, pptxData);
    
    return {
      id: slideId,
      width: slideSize.width,
      height: slideSize.height,
      aspectRatio: slideSize.width / slideSize.height,
      background,
      elements
    };
  }

  /**
   * Extract slide dimensions with precise mapping
   */
  private extractSlideSize(slideProps: any): { width: number; height: number } {
    const dimensions = this.getPreciseSlideDimensions(slideProps);
    return { width: dimensions.width, height: dimensions.height };
  }

  /**
   * Extract slide background
   */
  private extractBackground(slideProps: any): PptxSlide['background'] {
    const bg = slideProps['p:bg']?.['p:bgPr']?.['a:solidFill'];
    if (bg) {
      const color = this.extractColor(bg);
      return {
        type: 'solid',
        color
      };
    }
    
    return undefined;
  }

  /**
   * Extract all elements from a slide
   */
  private async extractElements(slideProps: any, pptxData: any): Promise<PptxSlide['elements']> {
    const elements: PptxSlide['elements'] = [];
    const spTree = slideProps['p:spTree'];
    
    if (!spTree) return elements;
    
    const shapes = spTree['p:sp'] || [];
    const pictures = spTree['p:pic'] || [];
    
    // Process shapes
    for (const shape of Array.isArray(shapes) ? shapes : [shapes]) {
      try {
        const element = await this.extractShapeElement(shape, pptxData);
        if (element) elements.push(element);
      } catch (error) {
        console.warn('⚠️ Failed to extract shape:', error);
      }
    }
    
    // Process pictures
    for (const picture of Array.isArray(pictures) ? pictures : [pictures]) {
      try {
        const element = await this.extractImageElement(picture, pptxData);
        if (element) elements.push(element);
      } catch (error) {
        console.warn('⚠️ Failed to extract image:', error);
      }
    }
    
    // Sort elements by z-index
    elements.sort((a, b) => a.zIndex - b.zIndex);
    
    return elements;
  }

  /**
   * Extract shape element with comprehensive styling
   */
  private async extractShapeElement(shape: any, pptxData: any): Promise<PptxShapeElement | PptxTextElement | null> {
    const nvSpPr = shape['p:nvSpPr']?.['p:cNvPr'];
    const spPr = shape['p:spPr'];
    const txBody = shape['p:txBody'];
    
    if (!spPr) return null;
    
    // Extract basic properties
    const id = nvSpPr?.['@_id'] || this.generateId();
    const position = this.extractPosition(spPr);
    const size = this.extractSize(spPr);
    
    // Check if this is a text box
    if (txBody) {
      return await this.extractTextElement(shape, pptxData, id, position, size);
    }
    
    // Extract shape properties
    const shapeType = this.extractShapeType(spPr);
    const fill = this.extractFill(spPr);
    const stroke = this.extractStroke(spPr);
    
    return {
      id,
      type: 'shape',
      ...position,
      ...size,
      rotation: this.extractRotation(spPr),
      zIndex: this.extractZIndex(shape),
      opacity: this.extractOpacity(spPr),
      visible: true,
      locked: false,
      shapeType,
      fill,
      stroke
    };
  }

  /**
   * Extract text element with comprehensive formatting
   */
  private async extractTextElement(shape: any, pptxData: any, id: string, position: any, size: any): Promise<PptxTextElement | null> {
    const txBody = shape['p:txBody'];
    if (!txBody) return null;
    
    // Extract text content and formatting
    const content = this.extractTextContent(txBody);
    const formatting = this.extractTextFormatting(txBody);
    
    return {
      id,
      type: 'text',
      ...position,
      ...size,
      rotation: this.extractRotation(shape['p:spPr']),
      zIndex: this.extractZIndex(shape),
      opacity: this.extractOpacity(shape['p:spPr']),
      visible: true,
      locked: false,
      content,
      ...formatting
    };
  }

  /**
   * Extract image element with advanced processing
   */
  private async extractImageElement(picture: any, pptxData: any): Promise<PptxImageElement | null> {
    const nvPicPr = picture['p:nvPicPr']?.['p:cNvPr'];
    const blipFill = picture['p:blipFill'];
    const spPr = picture['p:spPr'];
    
    if (!blipFill || !spPr) return null;
    
    const id = nvPicPr?.['@_id'] || this.generateId();
    const position = this.extractPosition(spPr);
    const size = this.extractSize(spPr);
    
    // Extract image source
    const blip = blipFill['a:blip'];
    const imageSrc = await this.extractImageSource(blip, pptxData);
    
    if (!imageSrc) return null;
    
    return {
      id,
      type: 'image',
      ...position,
      ...size,
      rotation: this.extractRotation(spPr),
      zIndex: this.extractZIndex(picture),
      opacity: this.extractOpacity(spPr),
      visible: true,
      locked: false,
      src: imageSrc,
      originalWidth: size.width,
      originalHeight: size.height,
      aspectRatio: size.width / size.height
    };
  }

  /**
   * Extract fonts used in the presentation
   */
  private async extractFonts(pptxData: any): Promise<PptxDocument['fonts']> {
    const fonts: PptxDocument['fonts'] = [];
    const fontData = pptxData['ppt/fonts'] || {};
    
    // Extract embedded fonts
    for (const [fontName, fontContent] of Object.entries(fontData)) {
      try {
        const fontInfo = await this.processEmbeddedFont(fontName, fontContent as any);
        if (fontInfo) fonts.push(fontInfo);
      } catch (error) {
        console.warn(`⚠️ Failed to process font ${fontName}:`, error);
      }
    }
    
    return fonts;
  }

  /**
   * Create a placeholder slide for failed processing
   */
  private createPlaceholderSlide(slideId: string): PptxSlide {
    return {
      id: slideId,
      width: 1920,
      height: 1080,
      aspectRatio: 16/9,
      elements: []
    };
  }

  // Utility methods for extracting specific properties with precise positioning
  private extractPosition(spPr: any): { x: number; y: number } {
    const position = this.calculatePrecisePosition(spPr, { width: 0, height: 0 });
    return { x: position.x, y: position.y };
  }

  private extractSize(spPr: any): { width: number; height: number } {
    const position = this.calculatePrecisePosition(spPr, { width: 0, height: 0 });
    return { width: position.width, height: position.height };
  }

  private extractRotation(spPr: any): number {
    const position = this.calculatePrecisePosition(spPr, { width: 0, height: 0 });
    return position.rotation;
  }

  private extractZIndex(element: any): number {
    // Extract z-index from element properties
    return 1; // Placeholder
  }

  private extractOpacity(spPr: any): number {
    const effectLst = spPr?.['a:effectLst'];
    if (!effectLst) return 1;
    
    // Extract opacity from effects
    return 1; // Placeholder
  }

  private extractShapeType(spPr: any): PptxShapeElement['shapeType'] {
    const prstGeom = spPr['a:prstGeom'];
    if (!prstGeom) return 'rectangle';
    
    const shapeType = prstGeom['@_prst'];
    return this.mapShapeType(shapeType);
  }

  private mapShapeType(pptxType: string): PptxShapeElement['shapeType'] {
    const shapeMap: Record<string, PptxShapeElement['shapeType']> = {
      'rect': 'rectangle',
      'ellipse': 'circle',
      'triangle': 'triangle',
      'star5': 'star',
      'heart': 'heart',
      'cloud': 'cloud',
      'line': 'line',
      'arrow': 'arrow'
    };
    
    return shapeMap[pptxType] || 'rectangle';
  }

  private extractFill(spPr: any): PptxShapeElement['fill'] {
    const solidFill = spPr['a:solidFill'];
    const gradFill = spPr['a:gradFill'];
    
    if (solidFill) {
      return {
        type: 'solid',
        color: this.extractColor(solidFill)
      };
    }
    
    if (gradFill) {
      return {
        type: 'gradient',
        gradient: this.extractGradient(gradFill)
      };
    }
    
    return undefined;
  }

  private extractStroke(spPr: any): PptxShapeElement['stroke'] {
    const ln = spPr['a:ln'];
    if (!ln) return undefined;
    
    return {
      width: this.convertEmuToPixels(parseInt(ln['@_w']) || 0),
      color: this.extractColor(ln),
      style: 'solid'
    };
  }

  private extractTextContent(txBody: any): string {
    // Extract text content from text body
    return 'Text content'; // Placeholder
  }

  private extractTextFormatting(txBody: any): Partial<PptxTextElement> {
    // Extract comprehensive text formatting
    return {
      content: 'Text content',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      textAlign: 'left',
      verticalAlign: 'top',
      lineHeight: 1.2,
      letterSpacing: 0,
      textDecoration: 'none'
    };
  }

  private async extractImageSource(blip: any, pptxData: any): Promise<string | null> {
    // Extract image source from blip
    return null; // Placeholder
  }

  private async processEmbeddedFont(fontName: string, fontContent: any): Promise<PptxDocument['fonts'][0] | null> {
    // Process embedded font
    return null; // Placeholder
  }

  private extractColor(fill: any): string {
    // Extract color from fill
    return '#000000'; // Placeholder
  }

  private extractGradient(gradFill: any): PptxShapeElement['fill']['gradient'] {
    // Extract gradient information
    return {
      type: 'linear',
      stops: []
    };
  }

  /**
   * Convert EMU (English Metric Units) to pixels with precise mapping
   */
  private convertEmuToPixels(emu: number): number {
    // 1 inch = 914400 EMU
    // 1 inch = 96 pixels (standard DPI)
    // Use precise calculation to maintain exact positioning
    return (emu / 914400) * 96;
  }

  /**
   * Convert points to pixels
   */
  private convertPointsToPixels(points: number): number {
    // 1 point = 1/72 inch
    // 1 inch = 96 pixels
    return (points / 72) * 96;
  }

  /**
   * Convert centimeters to pixels
   */
  private convertCmToPixels(cm: number): number {
    // 1 cm = 0.393701 inches
    // 1 inch = 96 pixels
    return cm * 0.393701 * 96;
  }

  /**
   * Convert inches to pixels
   */
  private convertInchesToPixels(inches: number): number {
    // 1 inch = 96 pixels (standard DPI)
    return inches * 96;
  }

  /**
   * Get precise slide dimensions with aspect ratio preservation
   */
  private getPreciseSlideDimensions(slideProps: any): { width: number; height: number; aspectRatio: number } {
    const sldSz = slideProps['p:sldSz'];
    if (!sldSz) {
      // Default to 16:9 aspect ratio
      return { width: 1920, height: 1080, aspectRatio: 16/9 };
    }

    const widthEmu = parseInt(sldSz['@_cx']) || 0;
    const heightEmu = parseInt(sldSz['@_cy']) || 0;
    
    const width = this.convertEmuToPixels(widthEmu);
    const height = this.convertEmuToPixels(heightEmu);
    const aspectRatio = width / height;
    
    return { width, height, aspectRatio };
  }

  /**
   * Calculate precise element positioning with sub-pixel accuracy
   */
  private calculatePrecisePosition(element: any, slideDimensions: { width: number; height: number }): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  } {
    const xfrm = element['a:xfrm'];
    if (!xfrm) {
      return { x: 0, y: 0, width: 100, height: 100, rotation: 0 };
    }

    const off = xfrm['a:off'];
    const ext = xfrm['a:ext'];
    const rot = xfrm['a:rot'];

    const x = off ? this.convertEmuToPixels(parseInt(off['@_x']) || 0) : 0;
    const y = off ? this.convertEmuToPixels(parseInt(off['@_y']) || 0) : 0;
    const width = ext ? this.convertEmuToPixels(parseInt(ext['@_cx']) || 100) : 100;
    const height = ext ? this.convertEmuToPixels(parseInt(ext['@_cy']) || 100) : 100;
    const rotation = rot ? (parseInt(rot['@_val']) || 0) / 60000 : 0;

    return { x, y, width, height, rotation };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}