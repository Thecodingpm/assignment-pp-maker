export interface FontInfo {
  name: string;
  family: string;
  weight: string;
  style: string;
  src?: string;
  embedded?: boolean;
  loaded?: boolean;
}

export class FontManager {
  private loadedFonts: Map<string, FontInfo> = new Map();
  private googleFontsApiKey: string;

  constructor(googleFontsApiKey?: string) {
    this.googleFontsApiKey = googleFontsApiKey || '';
  }

  /**
   * Detect fonts used in the presentation
   */
  detectFonts(elements: any[]): FontInfo[] {
    const fonts: FontInfo[] = [];
    const fontSet = new Set<string>();

    // Extract fonts from text elements
    this.extractFontsFromElements(elements, fontSet);

    // Convert to FontInfo objects
    for (const fontName of fontSet) {
      const fontInfo = this.parseFontName(fontName);
      fonts.push(fontInfo);
    }

    return fonts;
  }

  /**
   * Load a font from Google Fonts
   */
  async loadGoogleFont(fontInfo: FontInfo): Promise<boolean> {
    try {
      if (this.loadedFonts.has(fontInfo.name)) {
        return true;
      }

      const fontUrl = this.buildGoogleFontUrl(fontInfo);
      if (!fontUrl) {
        console.warn(`⚠️ Could not build Google Font URL for ${fontInfo.name}`);
        return false;
      }

      // Load the font
      await this.loadFontFromUrl(fontInfo, fontUrl);
      
      this.loadedFonts.set(fontInfo.name, { ...fontInfo, loaded: true });
      console.log(`✅ Loaded Google Font: ${fontInfo.name}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to load Google Font ${fontInfo.name}:`, error);
      return false;
    }
  }

  /**
   * Load an embedded font
   */
  async loadEmbeddedFont(fontInfo: FontInfo, fontData: ArrayBuffer): Promise<boolean> {
    try {
      if (this.loadedFonts.has(fontInfo.name)) {
        return true;
      }

      // Convert ArrayBuffer to base64
      const base64 = this.arrayBufferToBase64(fontData);
      const fontUrl = `data:font/woff2;base64,${base64}`;

      // Load the font
      await this.loadFontFromUrl(fontInfo, fontUrl);
      
      this.loadedFonts.set(fontInfo.name, { ...fontInfo, loaded: true, embedded: true });
      console.log(`✅ Loaded embedded font: ${fontInfo.name}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to load embedded font ${fontInfo.name}:`, error);
      return false;
    }
  }

  /**
   * Load all fonts for a presentation
   */
  async loadAllFonts(fonts: FontInfo[]): Promise<FontInfo[]> {
    const loadedFonts: FontInfo[] = [];
    
    for (const font of fonts) {
      try {
        if (font.embedded && font.src) {
          // Load embedded font
          const response = await fetch(font.src);
          const fontData = await response.arrayBuffer();
          const success = await this.loadEmbeddedFont(font, fontData);
          if (success) loadedFonts.push(font);
        } else {
          // Load from Google Fonts
          const success = await this.loadGoogleFont(font);
          if (success) loadedFonts.push(font);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to load font ${font.name}:`, error);
      }
    }

    return loadedFonts;
  }

  /**
   * Check if a font is loaded
   */
  isFontLoaded(fontName: string): boolean {
    return this.loadedFonts.has(fontName) && this.loadedFonts.get(fontName)?.loaded === true;
  }

  /**
   * Get font CSS for rendering
   */
  getFontCSS(fontInfo: FontInfo): string {
    if (!this.isFontLoaded(fontInfo.name)) {
      return `font-family: ${fontInfo.family}, sans-serif;`;
    }

    const loadedFont = this.loadedFonts.get(fontInfo.name);
    if (!loadedFont) {
      return `font-family: ${fontInfo.family}, sans-serif;`;
    }

    return `
      font-family: "${loadedFont.name}", ${fontInfo.family}, sans-serif;
      font-weight: ${fontInfo.weight};
      font-style: ${fontInfo.style};
    `;
  }

  /**
   * Extract fonts from presentation elements
   */
  private extractFontsFromElements(elements: any[], fontSet: Set<string>): void {
    for (const element of elements) {
      if (element.type === 'text' && element.fontFamily) {
        fontSet.add(element.fontFamily);
      }
      
      if (element.type === 'shape' && element.text && element.text.fontFamily) {
        fontSet.add(element.text.fontFamily);
      }
      
      if (element.children) {
        this.extractFontsFromElements(element.children, fontSet);
      }
    }
  }

  /**
   * Parse font name to extract family, weight, and style
   */
  private parseFontName(fontName: string): FontInfo {
    // Common font parsing logic
    const parts = fontName.split(' ');
    const family = parts[0];
    
    let weight = 'normal';
    let style = 'normal';
    
    // Check for weight indicators
    if (fontName.toLowerCase().includes('bold')) {
      weight = 'bold';
    } else if (fontName.toLowerCase().includes('light')) {
      weight = '300';
    } else if (fontName.toLowerCase().includes('medium')) {
      weight = '500';
    } else if (fontName.toLowerCase().includes('black')) {
      weight = '900';
    }
    
    // Check for style indicators
    if (fontName.toLowerCase().includes('italic')) {
      style = 'italic';
    } else if (fontName.toLowerCase().includes('oblique')) {
      style = 'oblique';
    }
    
    return {
      name: fontName,
      family,
      weight,
      style,
      loaded: false
    };
  }

  /**
   * Build Google Fonts URL
   */
  private buildGoogleFontUrl(fontInfo: FontInfo): string | null {
    if (!this.googleFontsApiKey) {
      console.warn('⚠️ Google Fonts API key not provided');
      return null;
    }

    const family = fontInfo.family.replace(/\s+/g, '+');
    const weights = this.getGoogleFontWeights(fontInfo.weight);
    const styles = fontInfo.style === 'italic' ? 'ital' : '';
    
    const params = new URLSearchParams({
      family: `${family}:wght@${weights}${styles ? `:ital,wght@${weights}` : ''}`,
      display: 'swap'
    });

    return `https://fonts.googleapis.com/css2?${params.toString()}&key=${this.googleFontsApiKey}`;
  }

  /**
   * Get Google Fonts weight mapping
   */
  private getGoogleFontWeights(weight: string): string {
    const weightMap: Record<string, string> = {
      '100': '100',
      '200': '200',
      '300': '300',
      'normal': '400',
      '400': '400',
      '500': '500',
      '600': '600',
      'bold': '700',
      '700': '700',
      '800': '800',
      '900': '900'
    };
    
    return weightMap[weight] || '400';
  }

  /**
   * Load font from URL
   */
  private async loadFontFromUrl(fontInfo: FontInfo, fontUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      
      link.onload = () => {
        // Add font face rule to document
        this.addFontFaceRule(fontInfo, fontUrl);
        resolve();
      };
      
      link.onerror = () => {
        reject(new Error(`Failed to load font from ${fontUrl}`));
      };
      
      document.head.appendChild(link);
    });
  }

  /**
   * Add @font-face rule to document
   */
  private addFontFaceRule(fontInfo: FontInfo, fontUrl: string): void {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: "${fontInfo.name}";
        src: url("${fontUrl}");
        font-weight: ${fontInfo.weight};
        font-style: ${fontInfo.style};
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Preload common fonts
   */
  async preloadCommonFonts(): Promise<void> {
    const commonFonts: FontInfo[] = [
      { name: 'Arial', family: 'Arial', weight: 'normal', style: 'normal' },
      { name: 'Arial Bold', family: 'Arial', weight: 'bold', style: 'normal' },
      { name: 'Times New Roman', family: 'Times New Roman', weight: 'normal', style: 'normal' },
      { name: 'Calibri', family: 'Calibri', weight: 'normal', style: 'normal' },
      { name: 'Helvetica', family: 'Helvetica', weight: 'normal', style: 'normal' }
    ];

    for (const font of commonFonts) {
      try {
        await this.loadGoogleFont(font);
      } catch (error) {
        console.warn(`⚠️ Failed to preload font ${font.name}:`, error);
      }
    }
  }
}