const fs = require('fs');
const path = require('path');

// Your Figma Personal Access Token (set as environment variable)
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'your-figma-token-here';

// Figma API base URL
const FIGMA_API_BASE = 'https://api.figma.com/v1';

class BatchFigmaConverter {
  constructor() {
    this.headers = {
      'X-Figma-Token': FIGMA_TOKEN,
      'Content-Type': 'application/json'
    };
  }

  // Extract file key from Figma URL
  extractFileKey(url) {
    const match = url.match(/\/design\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  // Get file data from Figma
  async getFileData(fileKey) {
    try {
      const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Figma file:', error);
      throw error;
    }
  }

  // Extract design elements from Figma nodes
  extractDesignElements(node, parentStyles = {}) {
    const elements = [];
    
    if (!node) return elements;

    // Extract text elements
    if (node.type === 'TEXT') {
      elements.push({
        id: node.id,
        type: 'text',
        content: node.characters || 'Sample Text',
        x: node.absoluteBoundingBox?.x || 0,
        y: node.absoluteBoundingBox?.y || 0,
        width: node.absoluteBoundingBox?.width || 200,
        height: node.absoluteBoundingBox?.height || 50,
        fontSize: node.style?.fontSize || 16,
        fontFamily: node.style?.fontFamily || 'Inter',
        fontWeight: node.style?.fontWeight || 'normal',
        color: this.extractColor(node.fills),
        textAlign: node.style?.textAlignHorizontal || 'left',
        zIndex: 2
      });
    }

    // Extract shape elements
    if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') {
      elements.push({
        id: node.id,
        type: 'shape',
        shapeType: node.type === 'ELLIPSE' ? 'circle' : 'rectangle',
        x: node.absoluteBoundingBox?.x || 0,
        y: node.absoluteBoundingBox?.y || 0,
        width: node.absoluteBoundingBox?.width || 100,
        height: node.absoluteBoundingBox?.height || 100,
        fillColor: this.extractColor(node.fills),
        strokeColor: this.extractColor(node.strokes),
        strokeWidth: node.strokeWeight || 0,
        zIndex: 1
      });
    }

    // Extract image elements
    if (node.type === 'RECTANGLE' && node.fills?.some(fill => fill.type === 'IMAGE')) {
      const imageFill = node.fills.find(fill => fill.type === 'IMAGE');
      elements.push({
        id: node.id,
        type: 'image',
        src: imageFill.imageRef || 'https://via.placeholder.com/400x300',
        x: node.absoluteBoundingBox?.x || 0,
        y: node.absoluteBoundingBox?.y || 0,
        width: node.absoluteBoundingBox?.width || 400,
        height: node.absoluteBoundingBox?.height || 300,
        objectFit: 'cover',
        zIndex: 1
      });
    }

    // Recursively process child nodes
    if (node.children) {
      node.children.forEach(child => {
        elements.push(...this.extractDesignElements(child, parentStyles));
      });
    }

    return elements;
  }

  // Extract color from Figma fills
  extractColor(fills) {
    if (!fills || fills.length === 0) return '#000000';
    
    const fill = fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const { r, g, b } = fill.color;
      const alpha = fill.opacity || 1;
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
    }
    
    return '#000000';
  }

  // Convert Figma file to template JSON
  async convertFileToTemplate(fileKey, templateName, category = 'business') {
    try {
      console.log(`🔄 Converting Figma file: ${fileKey}`);
      
      const fileData = await this.getFileData(fileKey);
      const slides = [];
      
      // Find pages (slides) in the Figma file
      const pages = fileData.document?.children || [];
      
      pages.forEach((page, index) => {
        if (page.name.toLowerCase().includes('slide') || page.name.toLowerCase().includes('page')) {
          const elements = this.extractDesignElements(page);
          
          // Extract background color from the page
          const backgroundColor = this.extractColor(page.fills) || '#ffffff';
          
          slides.push({
            id: `slide-${index + 1}`,
            type: index === 0 ? 'title' : 'content',
            backgroundColor: backgroundColor,
            elements: elements
          });
        }
      });

      const template = {
        id: `figma-${fileKey}`,
        name: templateName,
        description: `Professional template converted from Figma`,
        category: category,
        preview: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop&crop=center`,
        slides: slides
      };

      console.log(`✅ Converted template: ${templateName} with ${slides.length} slides`);
      return template;
      
    } catch (error) {
      console.error(`❌ Error converting file ${fileKey}:`, error);
      throw error;
    }
  }

  // Save template to JSON file
  saveTemplate(template, outputPath) {
    try {
      // Read existing templates
      let existingTemplates = { templates: [] };
      if (fs.existsSync(outputPath)) {
        const existingData = fs.readFileSync(outputPath, 'utf8');
        existingTemplates = JSON.parse(existingData);
      }

      // Add new template
      existingTemplates.templates.push(template);

      // Save updated templates
      fs.writeFileSync(outputPath, JSON.stringify(existingTemplates, null, 2));
      console.log(`💾 Saved template to: ${outputPath}`);
      
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  // Convert multiple URLs automatically
  async convertMultipleUrls(urls) {
    const results = [];
    
    for (const urlData of urls) {
      try {
        const fileKey = this.extractFileKey(urlData.url);
        if (!fileKey) {
          console.error(`❌ Could not extract file key from URL: ${urlData.url}`);
          results.push({ success: false, error: 'Invalid URL format' });
          continue;
        }

        const template = await this.convertFileToTemplate(
          fileKey,
          urlData.name,
          urlData.category
        );
        
        this.saveTemplate(template, urlData.outputPath);
        results.push({ success: true, template: template });
        
      } catch (error) {
        console.error(`Failed to convert ${urlData.name}:`, error);
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Example usage with multiple URLs
async function main() {
  const converter = new BatchFigmaConverter();
  
  // Add all your Figma URLs here - just paste the URLs!
  const urls = [
    {
      url: 'https://www.figma.com/design/IMu8xF11cVEvg8TUs6NyxD/Student-council-presentation--Community-?node-id=47-182&t=mLD43SgsMKsiAik4-0',
      name: 'Student Council Presentation',
      category: 'education',
      outputPath: path.join(__dirname, '../app/data/professionalDesignTemplates.json')
    },
    {
      url: 'https://www.figma.com/design/UceptAQkBnEk0TST8HbR7I/Resume---CV%E2%80%A8-Templates--Community-?node-id=0-1&p=f&t=gLp5BzHg9ztIPTdw-0',
      name: 'Resume CV Template',
      category: 'business',
      outputPath: path.join(__dirname, '../app/data/professionalDesignTemplates.json')
    }
    // Add more URLs here as you find them!
  ];

  try {
    console.log('🚀 Starting batch conversion...');
    const results = await converter.convertMultipleUrls(urls);
    
    console.log('\n🎉 Batch conversion complete!');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ ${urls[index].name}: Success`);
      } else {
        console.log(`❌ ${urls[index].name}: ${result.error}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Batch conversion failed:', error);
  }
}

// Export for use in other scripts
module.exports = BatchFigmaConverter;

// Run if called directly
if (require.main === module) {
  main();
}


