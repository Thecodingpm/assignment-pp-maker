export interface FallbackOptions {
  enableRasterization?: boolean;
  enableWarnings?: boolean;
  quality?: 'low' | 'medium' | 'high';
  maxRasterizationSize?: number;
}

export interface FallbackResult {
  success: boolean;
  rendered: boolean;
  fallbackType: 'rasterized' | 'placeholder' | 'simplified' | 'none';
  warning?: string;
  dataUrl?: string;
  width?: number;
  height?: number;
}

export class FallbackRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: FallbackOptions;

  constructor(options: FallbackOptions = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.options = {
      enableRasterization: true,
      enableWarnings: true,
      quality: 'medium',
      maxRasterizationSize: 2048,
      ...options
    };
  }

  /**
   * Handle unsupported features with appropriate fallbacks
   */
  async handleUnsupportedFeature(
    featureType: string,
    element: any,
    dimensions: { width: number; height: number }
  ): Promise<FallbackResult> {
    console.warn(`⚠️ Unsupported feature detected: ${featureType}`);

    switch (featureType) {
      case 'smartart':
        return this.handleSmartArt(element, dimensions);
      case 'chart':
        return this.handleChart(element, dimensions);
      case 'animation':
        return this.handleAnimation(element, dimensions);
      case 'complex_shape':
        return this.handleComplexShape(element, dimensions);
      case 'advanced_effect':
        return this.handleAdvancedEffect(element, dimensions);
      default:
        return this.handleGenericUnsupported(element, dimensions);
    }
  }

  /**
   * Handle SmartArt elements
   */
  private async handleSmartArt(element: any, dimensions: { width: number; height: number }): Promise<FallbackResult> {
    if (this.options.enableWarnings) {
      console.warn('📊 SmartArt detected - rendering as static image');
    }

    if (this.options.enableRasterization) {
      try {
        const rasterized = await this.rasterizeElement(element, dimensions);
        return {
          success: true,
          rendered: true,
          fallbackType: 'rasterized',
          warning: 'SmartArt was rasterized as a static image',
          dataUrl: rasterized.dataUrl,
          width: rasterized.width,
          height: rasterized.height
        };
      } catch (error) {
        console.error('Failed to rasterize SmartArt:', error);
      }
    }

    return this.createPlaceholder('SmartArt', dimensions);
  }

  /**
   * Handle chart elements
   */
  private async handleChart(element: any, dimensions: { width: number; height: number }): Promise<FallbackResult> {
    if (this.options.enableWarnings) {
      console.warn('📈 Chart detected - rendering as static image');
    }

    if (this.options.enableRasterization) {
      try {
        const rasterized = await this.rasterizeElement(element, dimensions);
        return {
          success: true,
          rendered: true,
          fallbackType: 'rasterized',
          warning: 'Chart was rasterized as a static image',
          dataUrl: rasterized.dataUrl,
          width: rasterized.width,
          height: rasterized.height
        };
      } catch (error) {
        console.error('Failed to rasterize chart:', error);
      }
    }

    return this.createPlaceholder('Chart', dimensions);
  }

  /**
   * Handle animation elements
   */
  private handleAnimation(element: any, dimensions: { width: number; height: number }): FallbackResult {
    if (this.options.enableWarnings) {
      console.warn('🎬 Animation detected - rendering static frame');
    }

    // For animations, we render the first frame
    return {
      success: true,
      rendered: true,
      fallbackType: 'simplified',
      warning: 'Animation was converted to static frame'
    };
  }

  /**
   * Handle complex shapes
   */
  private async handleComplexShape(element: any, dimensions: { width: number; height: number }): Promise<FallbackResult> {
    if (this.options.enableWarnings) {
      console.warn('🔷 Complex shape detected - simplifying');
    }

    // Try to simplify the shape first
    const simplified = this.simplifyShape(element);
    if (simplified) {
      return {
        success: true,
        rendered: true,
        fallbackType: 'simplified',
        warning: 'Complex shape was simplified'
      };
    }

    // If simplification fails, rasterize
    if (this.options.enableRasterization) {
      try {
        const rasterized = await this.rasterizeElement(element, dimensions);
        return {
          success: true,
          rendered: true,
          fallbackType: 'rasterized',
          warning: 'Complex shape was rasterized',
          dataUrl: rasterized.dataUrl,
          width: rasterized.width,
          height: rasterized.height
        };
      } catch (error) {
        console.error('Failed to rasterize complex shape:', error);
      }
    }

    return this.createPlaceholder('Shape', dimensions);
  }

  /**
   * Handle advanced effects
   */
  private async handleAdvancedEffect(element: any, dimensions: { width: number; height: number }): Promise<FallbackResult> {
    if (this.options.enableWarnings) {
      console.warn('✨ Advanced effect detected - rendering without effect');
    }

    // Remove advanced effects and render simplified version
    const simplified = this.removeAdvancedEffects(element);
    if (simplified) {
      return {
        success: true,
        rendered: true,
        fallbackType: 'simplified',
        warning: 'Advanced effects were removed'
      };
    }

    return this.createPlaceholder('Element', dimensions);
  }

  /**
   * Handle generic unsupported features
   */
  private createPlaceholder(type: string, dimensions: { width: number; height: number }): FallbackResult {
    const placeholder = this.createPlaceholderImage(type, dimensions);
    
    return {
      success: true,
      rendered: true,
      fallbackType: 'placeholder',
      warning: `${type} was replaced with placeholder`,
      dataUrl: placeholder.dataUrl,
      width: placeholder.width,
      height: placeholder.height
    };
  }

  /**
   * Rasterize an element to an image
   */
  private async rasterizeElement(
    element: any, 
    dimensions: { width: number; height: number }
  ): Promise<{ dataUrl: string; width: number; height: number }> {
    // This would involve rendering the element to a canvas
    // For now, create a placeholder
    return this.createPlaceholderImage('Rasterized', dimensions);
  }

  /**
   * Simplify a complex shape
   */
  private simplifyShape(element: any): any {
    // Remove complex properties and keep basic ones
    const simplified = { ...element };
    
    // Remove complex effects
    if (simplified.effects) {
      delete simplified.effects;
    }
    
    // Simplify fill
    if (simplified.fill?.type === 'gradient') {
      simplified.fill = {
        type: 'solid',
        color: simplified.fill.gradient?.stops?.[0]?.color || '#000000'
      };
    }
    
    // Simplify stroke
    if (simplified.stroke) {
      simplified.stroke.style = 'solid';
    }
    
    return simplified;
  }

  /**
   * Remove advanced effects from element
   */
  private removeAdvancedEffects(element: any): any {
    const cleaned = { ...element };
    
    // Remove effects
    if (cleaned.effects) {
      delete cleaned.effects;
    }
    
    // Remove shadows
    if (cleaned.shadow) {
      delete cleaned.shadow;
    }
    
    // Simplify gradients
    if (cleaned.fill?.type === 'gradient') {
      cleaned.fill = {
        type: 'solid',
        color: cleaned.fill.gradient?.stops?.[0]?.color || '#000000'
      };
    }
    
    return cleaned;
  }

  /**
   * Create placeholder image
   */
  private createPlaceholderImage(type: string, dimensions: { width: number; height: number }): {
    dataUrl: string;
    width: number;
    height: number;
  } {
    const { width, height } = this.constrainDimensions(dimensions);
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw placeholder background
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw border
    this.ctx.strokeStyle = '#dee2e6';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // Draw icon
    this.drawPlaceholderIcon(type, width, height);
    
    // Draw text
    this.ctx.fillStyle = '#6c757d';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(type, width / 2, height / 2 + 20);
    
    return {
      dataUrl: this.canvas.toDataURL('image/png', 0.8),
      width,
      height
    };
  }

  /**
   * Draw placeholder icon based on type
   */
  private drawPlaceholderIcon(type: string, width: number, height: number): void {
    const iconSize = Math.min(width, height) * 0.3;
    const centerX = width / 2;
    const centerY = height / 2 - 10;
    
    this.ctx.fillStyle = '#adb5bd';
    this.ctx.strokeStyle = '#adb5bd';
    this.ctx.lineWidth = 2;
    
    switch (type.toLowerCase()) {
      case 'smartart':
        this.drawSmartArtIcon(centerX, centerY, iconSize);
        break;
      case 'chart':
        this.drawChartIcon(centerX, centerY, iconSize);
        break;
      case 'animation':
        this.drawAnimationIcon(centerX, centerY, iconSize);
        break;
      case 'shape':
        this.drawShapeIcon(centerX, centerY, iconSize);
        break;
      default:
        this.drawGenericIcon(centerX, centerY, iconSize);
    }
  }

  /**
   * Draw SmartArt icon
   */
  private drawSmartArtIcon(centerX: number, centerY: number, size: number): void {
    const rectSize = size / 3;
    const spacing = rectSize * 0.2;
    
    // Draw three connected rectangles
    for (let i = 0; i < 3; i++) {
      const x = centerX - size/2 + i * (rectSize + spacing);
      const y = centerY - rectSize/2;
      this.ctx.fillRect(x, y, rectSize, rectSize);
    }
    
    // Draw connecting lines
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - size/2 + rectSize + spacing/2, centerY);
    this.ctx.lineTo(centerX - size/2 + rectSize + spacing + spacing/2, centerY);
    this.ctx.stroke();
  }

  /**
   * Draw chart icon
   */
  private drawChartIcon(centerX: number, centerY: number, size: number): void {
    const barWidth = size / 6;
    const barSpacing = barWidth * 0.5;
    const maxHeight = size * 0.8;
    
    // Draw bars
    for (let i = 0; i < 4; i++) {
      const x = centerX - size/2 + i * (barWidth + barSpacing);
      const barHeight = maxHeight * (0.3 + Math.random() * 0.7);
      const y = centerY + maxHeight/2 - barHeight;
      
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  /**
   * Draw animation icon
   */
  private drawAnimationIcon(centerX: number, centerY: number, size: number): void {
    const radius = size / 4;
    
    // Draw play button
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw play triangle
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - radius/2, centerY - radius/2);
    this.ctx.lineTo(centerX + radius/2, centerY);
    this.ctx.lineTo(centerX - radius/2, centerY + radius/2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw shape icon
   */
  private drawShapeIcon(centerX: number, centerY: number, size: number): void {
    // Draw a simple rectangle
    const rectSize = size * 0.6;
    this.ctx.fillRect(
      centerX - rectSize/2, 
      centerY - rectSize/2, 
      rectSize, 
      rectSize
    );
  }

  /**
   * Draw generic icon
   */
  private drawGenericIcon(centerX: number, centerY: number, size: number): void {
    // Draw a simple circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, size/2, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * Constrain dimensions to maximum size
   */
  private constrainDimensions(dimensions: { width: number; height: number }): { width: number; height: number } {
    const maxSize = this.options.maxRasterizationSize || 2048;
    const aspectRatio = dimensions.width / dimensions.height;
    
    let width = dimensions.width;
    let height = dimensions.height;
    
    if (width > maxSize) {
      width = maxSize;
      height = width / aspectRatio;
    }
    
    if (height > maxSize) {
      height = maxSize;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Get quality setting for rendering
   */
  private getQuality(): number {
    switch (this.options.quality) {
      case 'low': return 0.6;
      case 'medium': return 0.8;
      case 'high': return 0.9;
      default: return 0.8;
    }
  }
}
