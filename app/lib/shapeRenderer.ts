export interface ShapeRenderOptions {
  width: number;
  height: number;
  fill?: {
    type: 'solid' | 'gradient' | 'pattern';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      stops: Array<{ position: number; color: string }>;
    };
  };
  stroke?: {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface RenderedShape {
  svg: string;
  width: number;
  height: number;
}

export class ShapeRenderer {
  /**
   * Render a shape as SVG with high fidelity
   */
  renderShape(shapeType: string, options: ShapeRenderOptions): RenderedShape {
    try {
      console.log('🎨 Rendering shape:', shapeType);
      
      const svg = this.createSVGElement(shapeType, options);
      const svgString = new XMLSerializer().serializeToString(svg);
      
      return {
        svg: svgString,
        width: options.width,
        height: options.height
      };
      
    } catch (error) {
      console.error('❌ Error rendering shape:', error);
      throw new Error(`Failed to render shape: ${error.message}`);
    }
  }

  /**
   * Create SVG element for the shape
   */
  private createSVGElement(shapeType: string, options: ShapeRenderOptions): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', options.width.toString());
    svg.setAttribute('height', options.height.toString());
    svg.setAttribute('viewBox', `0 0 ${options.width} ${options.height}`);
    
    // Create the shape element
    const shapeElement = this.createShapeElement(shapeType, options);
    svg.appendChild(shapeElement);
    
    return svg;
  }

  /**
   * Create the actual shape element
   */
  private createShapeElement(shapeType: string, options: ShapeRenderOptions): SVGElement {
    let shapeElement: SVGElement;
    
    switch (shapeType) {
      case 'rectangle':
        shapeElement = this.createRectangleElement(options);
        break;
      case 'circle':
        shapeElement = this.createCircleElement(options);
        break;
      case 'triangle':
        shapeElement = this.createTriangleElement(options);
        break;
      case 'line':
        shapeElement = this.createLineElement(options);
        break;
      case 'arrow':
        shapeElement = this.createArrowElement(options);
        break;
      case 'star':
        shapeElement = this.createStarElement(options);
        break;
      default:
        shapeElement = this.createRectangleElement(options);
    }
    
    // Apply styling
    this.applyShapeStyling(shapeElement, options);
    
    return shapeElement;
  }

  /**
   * Create rectangle element
   */
  private createRectangleElement(options: ShapeRenderOptions): SVGElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', options.width.toString());
    rect.setAttribute('height', options.height.toString());
    return rect;
  }

  /**
   * Create circle element
   */
  private createCircleElement(options: ShapeRenderOptions): SVGElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const centerX = options.width / 2;
    const centerY = options.height / 2;
    const radius = Math.min(options.width, options.height) / 2;
    
    circle.setAttribute('cx', centerX.toString());
    circle.setAttribute('cy', centerY.toString());
    circle.setAttribute('r', radius.toString());
    return circle;
  }

  /**
   * Create triangle element
   */
  private createTriangleElement(options: ShapeRenderOptions): SVGElement {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = [
      `${options.width / 2},0`,
      `0,${options.height}`,
      `${options.width},${options.height}`
    ].join(' ');
    
    polygon.setAttribute('points', points);
    return polygon;
  }

  /**
   * Create line element
   */
  private createLineElement(options: ShapeRenderOptions): SVGElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', options.height / 2);
    line.setAttribute('x2', options.width);
    line.setAttribute('y2', options.height / 2);
    return line;
  }

  /**
   * Create arrow element
   */
  private createArrowElement(options: ShapeRenderOptions): SVGElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const arrowPath = this.generateArrowPath(options.width, options.height);
    path.setAttribute('d', arrowPath);
    return path;
  }

  /**
   * Create star element
   */
  private createStarElement(options: ShapeRenderOptions): SVGElement {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = this.generateStarPoints(5, options.width, options.height);
    polygon.setAttribute('points', points);
    return polygon;
  }

  /**
   * Apply styling to shape element
   */
  private applyShapeStyling(element: SVGElement, options: ShapeRenderOptions): void {
    // Apply fill
    if (options.fill) {
      if (options.fill.type === 'solid' && options.fill.color) {
        element.setAttribute('fill', options.fill.color);
      }
    }
    
    // Apply stroke
    if (options.stroke) {
      element.setAttribute('stroke', options.stroke.color);
      element.setAttribute('stroke-width', options.stroke.width.toString());
      
      if (options.stroke.style !== 'solid') {
        const dashArray = this.getDashArray(options.stroke.style, options.stroke.width);
        element.setAttribute('stroke-dasharray', dashArray);
      }
    }
  }

  // Helper methods for generating shape paths
  private generateArrowPath(width: number, height: number): string {
    const arrowHeadSize = Math.min(width, height) * 0.3;
    const shaftWidth = height * 0.1;
    
    return `M 0,${height/2} L ${width - arrowHeadSize},${height/2} L ${width - arrowHeadSize},${height/2 - shaftWidth/2} L ${width},${height/2} L ${width - arrowHeadSize},${height/2 + shaftWidth/2} Z`;
  }

  private generateStarPoints(points: number, width: number, height: number): string {
    const starPoints: string[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius * 0.4;
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      starPoints.push(`${x},${y}`);
    }
    
    return starPoints.join(' ');
  }

  private getDashArray(style: string, width: number): string {
    switch (style) {
      case 'dashed':
        return `${width * 3},${width}`;
      case 'dotted':
        return `${width},${width}`;
      default:
        return 'none';
    }
  }
}