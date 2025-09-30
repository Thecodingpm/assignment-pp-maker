import { PptxDocument, PptxSlide, PptxElement } from './enhancedPptxParser';
import { FontManager } from './fontManager';
import { ImageProcessor } from './imageProcessor';
import { ShapeRenderer } from './shapeRenderer';
import { FallbackRenderer } from './fallbackRenderer';

export interface RenderOptions {
  width: number;
  height: number;
  scale?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableFallbacks?: boolean;
  preserveAspectRatio?: boolean;
  fallbackOptions?: {
    enableRasterization?: boolean;
    enableWarnings?: boolean;
    quality?: 'low' | 'medium' | 'high';
    maxRasterizationSize?: number;
  };
}

export interface RenderedSlide {
  id: string;
  width: number;
  height: number;
  aspectRatio: number;
  canvas: HTMLCanvasElement;
  dataUrl: string;
  elements: RenderedElement[];
  warnings: string[];
}

export interface RenderedElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  rendered: boolean;
  fallback?: string;
  fallbackType?: 'rasterized' | 'placeholder' | 'simplified' | 'none';
  warning?: string;
}

export class HighFidelityRenderer {
  private fontManager: FontManager;
  private imageProcessor: ImageProcessor;
  private shapeRenderer: ShapeRenderer;
  private fallbackRenderer: FallbackRenderer;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.fontManager = new FontManager();
    this.imageProcessor = new ImageProcessor();
    this.shapeRenderer = new ShapeRenderer();
    this.fallbackRenderer = new FallbackRenderer();
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Render a complete presentation with high fidelity
   */
  async renderPresentation(
    document: PptxDocument, 
    options: RenderOptions
  ): Promise<RenderedSlide[]> {
    try {
      console.log('🎨 Starting high-fidelity rendering...');
      
      // Load all fonts first
      await this.fontManager.loadAllFonts(document.fonts);
      
      const renderedSlides: RenderedSlide[] = [];
      
      for (const slide of document.slides) {
        try {
          const renderedSlide = await this.renderSlide(slide, options);
          renderedSlides.push(renderedSlide);
        } catch (error) {
          console.warn(`⚠️ Failed to render slide ${slide.id}:`, error);
          // Create a placeholder slide
          renderedSlides.push(this.createPlaceholderSlide(slide.id, options));
        }
      }
      
      console.log('✅ High-fidelity rendering completed');
      return renderedSlides;
      
    } catch (error) {
      console.error('❌ Error rendering presentation:', error);
      throw new Error(`Failed to render presentation: ${error.message}`);
    }
  }

  /**
   * Render a single slide with high fidelity
   */
  async renderSlide(slide: PptxSlide, options: RenderOptions): Promise<RenderedSlide> {
    console.log(`📄 Rendering slide ${slide.id}...`);
    
    const warnings: string[] = [];
    
    // Calculate dimensions
    const scale = options.scale || 1;
    const width = Math.round(slide.width * scale);
    const height = Math.round(slide.height * scale);
    
    // Set canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Render background
    if (slide.background) {
      this.renderBackground(slide.background, width, height);
    }
    
    // Render elements with fallback support
    const renderedElements: RenderedElement[] = [];
    
    for (const element of slide.elements) {
      try {
        const renderedElement = await this.renderElement(element, scale, options);
        renderedElements.push(renderedElement);
      } catch (error) {
        console.warn(`⚠️ Failed to render element ${element.id}:`, error);
        warnings.push(`Failed to render element ${element.id}: ${error.message}`);
        
        // Try fallback rendering
        if (options.enableFallbacks) {
          try {
            const fallbackResult = await this.handleElementFallback(element, scale, options);
            if (fallbackResult.success) {
              renderedElements.push({
                id: element.id,
                type: element.type,
                x: element.x * scale,
                y: element.y * scale,
                width: element.width * scale,
                height: element.height * scale,
                rotation: element.rotation,
                zIndex: element.zIndex,
                rendered: fallbackResult.rendered,
                fallback: fallbackResult.dataUrl,
                fallbackType: fallbackResult.fallbackType,
                warning: fallbackResult.warning
              });
              continue;
            }
          } catch (fallbackError) {
            console.warn(`⚠️ Fallback rendering failed for element ${element.id}:`, fallbackError);
          }
        }
        
        // Add error element
        renderedElements.push({
          id: element.id,
          type: element.type,
          x: element.x * scale,
          y: element.y * scale,
          width: element.width * scale,
          height: element.height * scale,
          rotation: element.rotation,
          zIndex: element.zIndex,
          rendered: false,
          fallback: 'Element could not be rendered',
          fallbackType: 'none',
          warning: `Failed to render: ${error.message}`
        });
      }
    }
    
    // Sort elements by z-index
    renderedElements.sort((a, b) => a.zIndex - b.zIndex);
    
    // Generate data URL
    const dataUrl = this.canvas.toDataURL('image/png', 0.9);
    
    return {
      id: slide.id,
      width,
      height,
      aspectRatio: slide.aspectRatio,
      canvas: this.canvas,
      dataUrl,
      elements: renderedElements,
      warnings
    };
  }

  /**
   * Render a single element
   */
  private async renderElement(
    element: PptxElement, 
    scale: number, 
    options: RenderOptions
  ): Promise<RenderedElement> {
    const x = element.x * scale;
    const y = element.y * scale;
    const width = element.width * scale;
    const height = element.height * scale;
    
    this.ctx.save();
    
    // Apply transformations
    if (element.rotation !== 0) {
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((element.rotation * Math.PI) / 180);
      this.ctx.translate(-centerX, -centerY);
    }
    
    // Apply opacity
    if (element.opacity !== 1) {
      this.ctx.globalAlpha = element.opacity;
    }
    
    // Render based on element type
    switch (element.type) {
      case 'text':
        await this.renderTextElement(element as any, x, y, width, height);
        break;
      case 'image':
        await this.renderImageElement(element as any, x, y, width, height);
        break;
      case 'shape':
        await this.renderShapeElement(element as any, x, y, width, height);
        break;
      default:
        console.warn(`⚠️ Unsupported element type: ${element.type}`);
    }
    
    this.ctx.restore();
    
    return {
      id: element.id,
      type: element.type,
      x,
      y,
      width,
      height,
      rotation: element.rotation,
      zIndex: element.zIndex,
      rendered: true
    };
  }

  /**
   * Render text element
   */
  private async renderTextElement(
    element: any, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Promise<void> {
    // Set font properties
    const fontSize = element.fontSize || 16;
    const fontFamily = element.fontFamily || 'Arial';
    const fontWeight = element.fontWeight || 'normal';
    const fontStyle = element.fontStyle || 'normal';
    
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = element.color || '#000000';
    this.ctx.textAlign = this.mapTextAlign(element.textAlign || 'left');
    this.ctx.textBaseline = this.mapTextBaseline(element.verticalAlign || 'top');
    
    // Apply letter spacing if supported
    if (element.letterSpacing && element.letterSpacing !== 0) {
      this.ctx.letterSpacing = `${element.letterSpacing}px`;
    }
    
    // Render text
    const content = element.content || '';
    const lines = content.split('\n');
    const lineHeight = fontSize * (element.lineHeight || 1.2);
    
    for (let i = 0; i < lines.length; i++) {
      const lineY = y + (i * lineHeight) + fontSize;
      this.ctx.fillText(lines[i], x, lineY);
    }
  }

  /**
   * Render image element
   */
  private async renderImageElement(
    element: any, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Promise<void> {
    try {
      // Load and process image
      const processedImage = await this.imageProcessor.processImage(element.src, {
        width,
        height,
        crop: element.crop,
        mask: element.mask,
        filters: element.filters
      });
      
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = processedImage.src;
      });
      
      // Draw image
      this.ctx.drawImage(img, x, y, width, height);
      
    } catch (error) {
      console.warn('⚠️ Failed to render image:', error);
      // Draw placeholder
      this.drawImagePlaceholder(x, y, width, height);
    }
  }

  /**
   * Render shape element
   */
  private async renderShapeElement(
    element: any, 
    x: number, 
    y: number, 
    width: number, 
    height: number
  ): Promise<void> {
    try {
      // Render shape as SVG
      const renderedShape = this.shapeRenderer.renderShape(element.shapeType, {
        width,
        height,
        fill: element.fill,
        stroke: element.stroke
      });
      
      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([renderedShape.svg], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgUrl;
      });
      
      // Draw shape
      this.ctx.drawImage(img, x, y, width, height);
      
      // Clean up
      URL.revokeObjectURL(svgUrl);
      
    } catch (error) {
      console.warn('⚠️ Failed to render shape:', error);
      // Draw placeholder
      this.drawShapePlaceholder(element.shapeType, x, y, width, height);
    }
  }

  /**
   * Render slide background
   */
  private renderBackground(background: any, width: number, height: number): void {
    switch (background.type) {
      case 'solid':
        if (background.color) {
          this.ctx.fillStyle = background.color;
          this.ctx.fillRect(0, 0, width, height);
        }
        break;
      case 'gradient':
        if (background.gradient) {
          this.renderGradientBackground(background.gradient, width, height);
        }
        break;
      case 'image':
        if (background.image) {
          this.renderImageBackground(background.image, width, height);
        }
        break;
    }
  }

  /**
   * Render gradient background
   */
  private renderGradientBackground(gradient: any, width: number, height: number): void {
    let gradientObj: CanvasGradient;
    
    if (gradient.type === 'linear') {
      gradientObj = this.ctx.createLinearGradient(0, 0, width, 0);
    } else {
      gradientObj = this.ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    }
    
    for (const stop of gradient.stops) {
      gradientObj.addColorStop(stop.position / 100, stop.color);
    }
    
    this.ctx.fillStyle = gradientObj;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Render image background
   */
  private async renderImageBackground(image: any, width: number, height: number): Promise<void> {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image.src;
      });
      
      // Apply fit mode
      switch (image.fit) {
        case 'fill':
          this.ctx.drawImage(img, 0, 0, width, height);
          break;
        case 'fit':
          this.drawImageToFit(img, 0, 0, width, height);
          break;
        case 'stretch':
          this.ctx.drawImage(img, 0, 0, width, height);
          break;
        case 'tile':
          this.drawImageTiled(img, 0, 0, width, height);
          break;
      }
    } catch (error) {
      console.warn('⚠️ Failed to render image background:', error);
    }
  }

  /**
   * Draw image to fit within bounds
   */
  private drawImageToFit(img: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    const aspectRatio = img.width / img.height;
    const targetAspectRatio = width / height;
    
    let drawWidth = width;
    let drawHeight = height;
    let drawX = x;
    let drawY = y;
    
    if (aspectRatio > targetAspectRatio) {
      drawHeight = width / aspectRatio;
      drawY = y + (height - drawHeight) / 2;
    } else {
      drawWidth = height * aspectRatio;
      drawX = x + (width - drawWidth) / 2;
    }
    
    this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  /**
   * Draw image tiled
   */
  private drawImageTiled(img: HTMLImageElement, x: number, y: number, width: number, height: number): void {
    const pattern = this.ctx.createPattern(img, 'repeat');
    if (pattern) {
      this.ctx.fillStyle = pattern;
      this.ctx.fillRect(x, y, width, height);
    }
  }

  /**
   * Draw image placeholder
   */
  private drawImagePlaceholder(x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(x, y, width, height);
    
    this.ctx.strokeStyle = '#ccc';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
    
    this.ctx.fillStyle = '#999';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Image', x + width/2, y + height/2);
  }

  /**
   * Draw shape placeholder
   */
  private drawShapePlaceholder(shapeType: string, x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 1;
    
    switch (shapeType) {
      case 'rectangle':
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);
        break;
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + height/2, Math.min(width, height)/2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        break;
      default:
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Create placeholder slide
   */
  private createPlaceholderSlide(slideId: string, options: RenderOptions): RenderedSlide {
    const width = options.width;
    const height = options.height;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw placeholder background
    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fillRect(0, 0, width, height);
    
    this.ctx.fillStyle = '#999';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Slide could not be rendered', width/2, height/2);
    
    return {
      id: slideId,
      width,
      height,
      aspectRatio: width / height,
      canvas: this.canvas,
      dataUrl: this.canvas.toDataURL('image/png', 0.9),
      elements: [],
      warnings: [`Slide ${slideId} could not be rendered`]
    };
  }

  /**
   * Map text align values
   */
  private mapTextAlign(align: string): CanvasTextAlign {
    const alignMap: Record<string, CanvasTextAlign> = {
      'left': 'left',
      'center': 'center',
      'right': 'right',
      'justify': 'left'
    };
    return alignMap[align] || 'left';
  }

  /**
   * Handle element fallback rendering
   */
  private async handleElementFallback(
    element: PptxElement, 
    scale: number, 
    options: RenderOptions
  ): Promise<{
    success: boolean;
    rendered: boolean;
    fallbackType: 'rasterized' | 'placeholder' | 'simplified' | 'none';
    warning?: string;
    dataUrl?: string;
    width?: number;
    height?: number;
  }> {
    const dimensions = {
      width: element.width * scale,
      height: element.height * scale
    };

    // Determine fallback type based on element
    let fallbackType = 'none';
    if (element.type === 'chart') {
      fallbackType = 'chart';
    } else if (element.type === 'shape' && (element as any).shapeType === 'smartart') {
      fallbackType = 'smartart';
    } else if ((element as any).effects || (element as any).shadow) {
      fallbackType = 'advanced_effect';
    } else if (element.type === 'shape' && (element as any).path) {
      fallbackType = 'complex_shape';
    }

    // Configure fallback renderer
    this.fallbackRenderer = new FallbackRenderer(options.fallbackOptions);

    // Handle the unsupported feature
    return await this.fallbackRenderer.handleUnsupportedFeature(
      fallbackType,
      element,
      dimensions
    );
  }

  /**
   * Map text baseline values
   */
  private mapTextBaseline(baseline: string): CanvasTextBaseline {
    const baselineMap: Record<string, CanvasTextBaseline> = {
      'top': 'top',
      'middle': 'middle',
      'bottom': 'bottom'
    };
    return baselineMap[baseline] || 'top';
  }
}