export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
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
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    opacity?: number;
  };
}

export interface ProcessedImage {
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
  originalWidth: number;
  originalHeight: number;
  processed: boolean;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Process an image with advanced effects
   */
  async processImage(
    imageSrc: string, 
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    try {
      console.log('🖼️ Processing image:', imageSrc);
      
      // Load the image
      const image = await this.loadImage(imageSrc);
      
      // Set canvas dimensions
      const width = options.width || image.width;
      const height = options.height || image.height;
      this.canvas.width = width;
      this.canvas.height = height;
      
      // Clear canvas
      this.ctx.clearRect(0, 0, width, height);
      
      // Apply cropping if specified
      if (options.crop) {
        this.applyCrop(image, options.crop, width, height);
      } else {
        this.ctx.drawImage(image, 0, 0, width, height);
      }
      
      // Apply masking if specified
      if (options.mask) {
        this.applyMask(options.mask);
      }
      
      // Apply filters if specified
      if (options.filters) {
        this.applyFilters(options.filters);
      }
      
      // Convert to desired format
      const format = options.format || 'jpeg';
      const quality = options.quality || 0.9;
      const processedSrc = this.canvas.toDataURL(`image/${format}`, quality);
      
      return {
        src: processedSrc,
        width,
        height,
        aspectRatio: width / height,
        originalWidth: image.width,
        originalHeight: image.height,
        processed: true
      };
      
    } catch (error) {
      console.error('❌ Error processing image:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Create a masked image using SVG clipPath
   */
  async createMaskedImage(
    imageSrc: string,
    mask: ImageProcessingOptions['mask'],
    dimensions: { width: number; height: number }
  ): Promise<string> {
    try {
      const image = await this.loadImage(imageSrc);
      
      // Create SVG with clipPath
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', dimensions.width.toString());
      svg.setAttribute('height', dimensions.height.toString());
      svg.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
      
      // Create defs and clipPath
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', 'imageMask');
      
      // Create mask shape
      const maskElement = this.createMaskElement(mask!, dimensions);
      clipPath.appendChild(maskElement);
      defs.appendChild(clipPath);
      svg.appendChild(defs);
      
      // Create image element
      const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      imageElement.setAttribute('href', imageSrc);
      imageElement.setAttribute('width', dimensions.width.toString());
      imageElement.setAttribute('height', dimensions.height.toString());
      imageElement.setAttribute('clip-path', 'url(#imageMask)');
      
      svg.appendChild(imageElement);
      
      // Convert SVG to data URL
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      return svgUrl;
      
    } catch (error) {
      console.error('❌ Error creating masked image:', error);
      throw new Error(`Failed to create masked image: ${error.message}`);
    }
  }

  /**
   * Apply image cropping
   */
  private applyCrop(
    image: HTMLImageElement, 
    crop: NonNullable<ImageProcessingOptions['crop']>, 
    width: number, 
    height: number
  ): void {
    const sourceX = crop.left * image.width;
    const sourceY = crop.top * image.height;
    const sourceWidth = (crop.right - crop.left) * image.width;
    const sourceHeight = (crop.bottom - crop.top) * image.height;
    
    this.ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, width, height
    );
  }

  /**
   * Apply image masking
   */
  private applyMask(mask: NonNullable<ImageProcessingOptions['mask']>): void {
    this.ctx.save();
    
    // Create clipping path
    this.ctx.beginPath();
    
    switch (mask.type) {
      case 'rectangle':
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        break;
        
      case 'circle':
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) / 2;
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        break;
        
      case 'polygon':
        if (mask.path) {
          this.ctx.fillStyle = 'black';
          this.ctx.fill();
        }
        break;
        
      case 'path':
        if (mask.path) {
          // Parse SVG path and draw it
          this.parseAndDrawPath(mask.path);
        }
        break;
    }
    
    this.ctx.clip();
    this.ctx.restore();
  }

  /**
   * Apply image filters
   */
  private applyFilters(filters: NonNullable<ImageProcessingOptions['filters']>): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let a = data[i + 3];
      
      // Apply brightness
      if (filters.brightness !== undefined) {
        const brightness = filters.brightness;
        r = Math.max(0, Math.min(255, r + brightness));
        g = Math.max(0, Math.min(255, g + brightness));
        b = Math.max(0, Math.min(255, b + brightness));
      }
      
      // Apply contrast
      if (filters.contrast !== undefined) {
        const contrast = filters.contrast;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
        g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
        b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
      }
      
      // Apply saturation
      if (filters.saturation !== undefined) {
        const saturation = filters.saturation;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
        g = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
        b = Math.max(0, Math.min(255, gray + saturation * (b - gray)));
      }
      
      // Apply opacity
      if (filters.opacity !== undefined) {
        a = Math.max(0, Math.min(255, a * filters.opacity));
      }
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Create mask element for SVG
   */
  private createMaskElement(
    mask: NonNullable<ImageProcessingOptions['mask']>, 
    dimensions: { width: number; height: number }
  ): SVGElement {
    let maskElement: SVGElement;
    
    switch (mask.type) {
      case 'rectangle':
        maskElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        maskElement.setAttribute('width', dimensions.width.toString());
        maskElement.setAttribute('height', dimensions.height.toString());
        break;
        
      case 'circle':
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        const radius = Math.min(dimensions.width, dimensions.height) / 2;
        maskElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        maskElement.setAttribute('cx', centerX.toString());
        maskElement.setAttribute('cy', centerY.toString());
        maskElement.setAttribute('r', radius.toString());
        break;
        
      case 'polygon':
        maskElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        if (mask.path) {
          maskElement.setAttribute('points', mask.path);
        }
        break;
        
      case 'path':
        maskElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (mask.path) {
          maskElement.setAttribute('d', mask.path);
        }
        break;
        
      default:
        throw new Error(`Unsupported mask type: ${mask.type}`);
    }
    
    return maskElement;
  }

  /**
   * Parse and draw SVG path
   */
  private parseAndDrawPath(pathString: string): void {
    // Simple SVG path parser (would need more comprehensive implementation)
    const commands = pathString.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || [];
    
    for (const command of commands) {
      const type = command[0];
      const coords = command.slice(1).trim().split(/[\s,]+/).map(Number);
      
      switch (type) {
        case 'M':
        case 'm':
          this.ctx.moveTo(coords[0], coords[1]);
          break;
        case 'L':
        case 'l':
          this.ctx.lineTo(coords[0], coords[1]);
          break;
        case 'Z':
        case 'z':
          this.ctx.closePath();
          break;
        // Add more path commands as needed
      }
    }
  }

  /**
   * Load image from URL
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      
      image.src = src;
    });
  }

  /**
   * Compress image for storage
   */
  async compressImage(
    imageSrc: string, 
    maxWidth: number = 1920, 
    maxHeight: number = 1080, 
    quality: number = 0.8
  ): Promise<string> {
    try {
      const image = await this.loadImage(imageSrc);
      
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = this.calculateDimensions(
        image.width, 
        image.height, 
        maxWidth, 
        maxHeight
      );
      
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx.clearRect(0, 0, width, height);
      
      // Draw resized image
      this.ctx.drawImage(image, 0, 0, width, height);
      
      // Convert to compressed format
      return this.canvas.toDataURL('image/jpeg', quality);
      
    } catch (error) {
      console.error('❌ Error compressing image:', error);
      throw new Error(`Failed to compress image: ${error.message}`);
    }
  }

  /**
   * Calculate dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Extract image metadata
   */
  async getImageMetadata(imageSrc: string): Promise<{
    width: number;
    height: number;
    aspectRatio: number;
    format: string;
    size: number;
  }> {
    try {
      const image = await this.loadImage(imageSrc);
      
      // Get file size if possible
      let size = 0;
      try {
        const response = await fetch(imageSrc, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          size = parseInt(contentLength);
        }
      } catch (error) {
        console.warn('Could not get image size:', error);
      }
      
      return {
        width: image.width,
        height: image.height,
        aspectRatio: image.width / image.height,
        format: this.detectImageFormat(imageSrc),
        size
      };
      
    } catch (error) {
      console.error('❌ Error getting image metadata:', error);
      throw new Error(`Failed to get image metadata: ${error.message}`);
    }
  }

  /**
   * Detect image format from URL
   */
  private detectImageFormat(imageSrc: string): string {
    const extension = imageSrc.split('.').pop()?.toLowerCase();
    const formatMap: Record<string, string> = {
      'jpg': 'jpeg',
      'jpeg': 'jpeg',
      'png': 'png',
      'gif': 'gif',
      'webp': 'webp',
      'svg': 'svg'
    };
    
    return formatMap[extension || ''] || 'unknown';
  }
}