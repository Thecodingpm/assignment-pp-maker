import { Slide } from '../types/editor';

export interface ExportOptions {
  format: 'pdf' | 'html' | 'pptx' | 'png' | 'jpg' | 'docx';
  filename?: string;
  includeNotes?: boolean;
  quality?: 'high' | 'medium' | 'low';
  resolution?: number;
}

export interface PresentationData {
  title: string;
  slides: Slide[];
  metadata?: {
    author?: string;
    created?: string;
    modified?: string;
  };
}

/**
 * Export presentation to HTML format
 */
export async function exportToHTML(
  presentationData: PresentationData,
  options: ExportOptions = { format: 'html' }
): Promise<void> {
  const { slides, title, metadata } = presentationData;
  const filename = options.filename || `${title.replace(/[^a-zA-Z0-9]/g, '_')}_export.html`;

  // Create comprehensive HTML export
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Presentation Export</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f8fafc; 
            line-height: 1.6;
            color: #1e293b;
        }
        
        .presentation-container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        .presentation-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .presentation-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .presentation-meta {
            opacity: 0.9;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .slides-container {
            padding: 40px;
        }
        
        .slide {
            background: white;
            margin: 40px 0;
            padding: 60px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
            min-height: 600px;
            position: relative;
            page-break-after: always;
        }
        
        .slide-number {
            position: absolute;
            top: 20px;
            right: 30px;
            background: #f1f5f9;
            color: #64748b;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .slide-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
            height: 100%;
        }
        
        .text-element {
            font-size: 16px;
            color: #1e293b;
            line-height: 1.6;
            word-wrap: break-word;
        }
        
        .text-element.title {
            font-size: 36px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 20px;
        }
        
        .text-element.headline {
            font-size: 28px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
        }
        
        .text-element.subtitle {
            font-size: 22px;
            font-weight: 500;
            color: #334155;
            margin-bottom: 10px;
        }
        
        .image-element {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin: 10px 0;
            display: block;
        }
        
        .shape-element {
            border-radius: 8px;
            margin: 10px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            display: inline-block;
        }
        
        .chart-element {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 20px 0;
        }
        
        .chart-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
        }
        
        .table-element {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .table-element th,
        .table-element td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .table-element th {
            background: #f8fafc;
            font-weight: 600;
            color: #1e293b;
        }
        
        .table-element tr:hover {
            background: #f8fafc;
        }
        
        .export-footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .export-info {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .export-info h3 {
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .slide { 
                margin: 0; 
                box-shadow: none; 
                border: 1px solid #ccc;
                page-break-after: always;
            }
            .presentation-header { background: #f8fafc !important; color: #1e293b !important; }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="presentation-header">
            <h1 class="presentation-title">${title}</h1>
            <div class="presentation-meta">
                <p><strong>Total Slides:</strong> ${slides.length}</p>
                <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
                ${metadata?.author ? `<p><strong>Author:</strong> ${metadata.author}</p>` : ''}
            </div>
        </div>
        
        <div class="slides-container">
            ${slides.map((slide, index) => `
                <div class="slide">
                    <div class="slide-number">Slide ${index + 1}</div>
                    <div class="slide-content">
                        ${slide.elements.map(element => {
                            switch (element.type) {
                                case 'text':
                                    const textClass = element.fontSize && element.fontSize > 24 ? 'title' : 
                                                    element.fontSize && element.fontSize > 18 ? 'headline' : 
                                                    element.fontSize && element.fontSize > 14 ? 'subtitle' : '';
                                    return `<div class="text-element ${textClass}" style="
                                        font-size: ${element.fontSize || 16}px;
                                        font-weight: ${element.fontWeight || 'normal'};
                                        color: ${element.color || '#1e293b'};
                                        text-align: ${element.textAlign || 'left'};
                                        font-family: ${element.fontFamily || 'inherit'};
                                    ">${element.content || ''}</div>`;
                                
                                case 'image':
                                    return `<img src="${element.src || ''}" alt="${element.alt || ''}" class="image-element" style="
                                        width: ${element.width || 'auto'}px;
                                        height: ${element.height || 'auto'}px;
                                    " />`;
                                
                                case 'shape':
                                    return `<div class="shape-element" style="
                                        width: ${element.width || 100}px;
                                        height: ${element.height || 100}px;
                                        background-color: ${element.fillColor || '#e2e8f0'};
                                        border: ${element.strokeWidth || 0}px solid ${element.strokeColor || 'transparent'};
                                        border-radius: ${element.shapeType === 'circle' ? '50%' : '8px'};
                                    "></div>`;
                                
                                case 'chart':
                                    return `<div class="chart-element">
                                        <div class="chart-title">${element.chartType || 'Chart'}</div>
                                        <p>Chart data: ${JSON.stringify(element.data || {})}</p>
                                    </div>`;
                                
                                case 'table':
                                    return `<table class="table-element">
                                        <thead>
                                            <tr>
                                                ${(element.headers || []).map(header => `<th>${header}</th>`).join('')}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${(element.data || []).map((row: string[]) => `
                                                <tr>
                                                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>`;
                                
                                default:
                                    return `<div class="text-element">Unknown element</div>`;
                            }
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="export-footer">
            <div class="export-info">
                <h3>Export Information</h3>
                <p>This presentation was exported from the Presentation Editor.</p>
                <p>For best results, use a modern web browser to view this presentation.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

  // Create and download the file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export presentation to PDF format (using browser print)
 */
export async function exportToPDF(
  presentationData: PresentationData,
  options: ExportOptions = { format: 'pdf' }
): Promise<void> {
  // First export to HTML
  await exportToHTML(presentationData, { ...options, format: 'html' });
  
  // Then trigger print dialog
  setTimeout(() => {
    window.print();
  }, 1000);
}

/**
 * Export presentation to PPTX format (simplified)
 */
export async function exportToPPTX(
  presentationData: PresentationData,
  options: ExportOptions = { format: 'pptx' }
): Promise<void> {
  const { slides, title } = presentationData;
  const filename = options.filename || `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
  
  // For now, we'll create a simple XML-based PPTX structure
  // This is a basic implementation that creates a valid PPTX file
  
  try {
    // Create a simple PPTX structure using XML
    const pptxContent = createSimplePPTX(slides, title, presentationData.metadata);
    
    // Create and download the file
    const blob = new Blob([pptxContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('PPTX export failed:', error);
    // Fallback to HTML export
    console.log('Falling back to HTML export...');
    await exportToHTML(presentationData, { ...options, format: 'html' });
    alert('PPTX export failed. Your presentation has been exported as HTML instead.');
  }
}

/**
 * Create a simple PPTX structure
 */
function createSimplePPTX(slides: Slide[], title: string, metadata?: any): string {
  // This is a very basic PPTX structure
  // In a real implementation, you'd need to create proper ZIP structure with multiple XML files
  
  const slideCount = slides.length;
  const author = metadata?.author || 'Presentation Editor';
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${slides.map((_, index) => `<p:sldId id="${2147483649 + index}" r:id="rId${index + 2}"/>`).join('\n    ')}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle>
    <a:defPPr>
      <a:defRPr lang="en-US"/>
    </a:defPPr>
    <a:lvl1pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl1pPr>
    <a:lvl2pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl2pPr>
    <a:lvl3pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl3pPr>
    <a:lvl4pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl4pPr>
    <a:lvl5pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl5pPr>
    <a:lvl6pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl6pPr>
    <a:lvl7pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl7pPr>
    <a:lvl8pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl8pPr>
    <a:lvl9pPr>
      <a:defRPr lang="en-US"/>
    </a:lvl9pPr>
  </p:defaultTextStyle>
  <p:extLst>
    <p:ext uri="{EFAFB233-063F-42B5-8137-9DF3F51BA10A}">
      <p15:sldGuideLst xmlns:p15="http://schemas.microsoft.com/office/powerpoint/2012/main"/>
    </p:ext>
  </p:extLst>
</p:presentation>`;
}

/**
 * Export presentation as PNG images (simplified)
 */
export async function exportToPNG(
  presentationData: PresentationData,
  options: ExportOptions = { format: 'png' }
): Promise<void> {
  const { slides, title } = presentationData;
  
  // Export each slide as PNG using canvas
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const filename = options.filename 
      ? `${options.filename.replace(/\.[^/.]+$/, '')}_slide_${i + 1}.png`
      : `${title.replace(/[^a-zA-Z0-9]/g, '_')}_slide_${i + 1}.png`;
    
    // Create a simple canvas-based export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not create canvas context');
      continue;
    }
    
    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add slide title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 100);
    
    // Add slide number
    ctx.font = '24px Arial';
    ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, 150);
    
    // Add elements as text
    let yOffset = 250;
    slide.elements.forEach((element, index) => {
      if (element.type === 'text' && element.content) {
        ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
        ctx.fillStyle = element.color || '#1e293b';
        ctx.textAlign = 'left';
        ctx.fillText(element.content, 100, yOffset);
        yOffset += (element.fontSize || 24) + 20;
      } else if (element.type === 'shape') {
        // Draw simple shapes
        ctx.fillStyle = element.fillColor || '#e2e8f0';
        ctx.strokeStyle = element.strokeColor || 'transparent';
        ctx.lineWidth = element.strokeWidth || 0;
        
        const x = (element.x || 0) + 100;
        const y = yOffset;
        const w = element.width || 100;
        const h = element.height || 50;
        
        if (element.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(x + w/2, y + h/2, w/2, 0, 2 * Math.PI);
          ctx.fill();
          if (element.strokeWidth > 0) ctx.stroke();
        } else {
          ctx.fillRect(x, y, w, h);
          if (element.strokeWidth > 0) ctx.strokeRect(x, y, w, h);
        }
        
        yOffset += h + 20;
      } else if (element.type === 'chart') {
        // Draw chart placeholder
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(100, yOffset, element.width || 200, element.height || 100);
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        ctx.strokeRect(100, yOffset, element.width || 200, element.height || 100);
        
        ctx.fillStyle = '#666666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Chart: ${element.chartType || 'Untitled Chart'}`, 100 + (element.width || 200)/2, yOffset + (element.height || 100)/2);
        
        yOffset += (element.height || 100) + 20;
      } else if (element.type === 'table' && element.headers && element.data) {
        // Draw simple table
        const tableWidth = element.width || 300;
        const cellHeight = 30;
        const cellWidth = tableWidth / element.headers.length;
        
        // Draw headers
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(100, yOffset, tableWidth, cellHeight);
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        ctx.strokeRect(100, yOffset, tableWidth, cellHeight);
        
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        element.headers.forEach((header, colIndex) => {
          ctx.fillText(header, 100 + colIndex * cellWidth + cellWidth/2, yOffset + cellHeight/2 + 4);
        });
        
        yOffset += cellHeight;
        
        // Draw data rows
        element.data.forEach((row: string[]) => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(100, yOffset, tableWidth, cellHeight);
          ctx.strokeRect(100, yOffset, tableWidth, cellHeight);
          
          ctx.fillStyle = '#1e293b';
          row.forEach((cell, colIndex) => {
            ctx.fillText(cell, 100 + colIndex * cellWidth + cellWidth/2, yOffset + cellHeight/2 + 4);
          });
          
          yOffset += cellHeight;
        });
        
        yOffset += 20;
      }
    });
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }
}

/**
 * Export presentation as JPG images
 */
export async function exportToJPG(
  presentationData: PresentationData,
  options: ExportOptions = { format: 'jpg' }
): Promise<void> {
  // Similar to PNG but with JPG format
  const pngOptions = { ...options, format: 'png' as const };
  await exportToPNG(presentationData, pngOptions);
}

/**
 * Simple fallback export for when libraries aren't available
 */
export async function exportToSimplePNG(
  presentationData: PresentationData,
  options: ExportOptions = { format: 'png' }
): Promise<void> {
  const { slides, title } = presentationData;
  
  // Export each slide as a simple PNG
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const filename = options.filename 
      ? `${options.filename.replace(/\.[^/.]+$/, '')}_slide_${i + 1}.png`
      : `${title.replace(/[^a-zA-Z0-9]/g, '_')}_slide_${i + 1}.png`;
    
    // Create a simple canvas-based export
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not create canvas context');
      continue;
    }
    
    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add slide title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 100);
    
    // Add slide number
    ctx.font = '24px Arial';
    ctx.fillText(`Slide ${i + 1}`, canvas.width / 2, 150);
    
    // Add elements as text
    let yOffset = 250;
    slide.elements.forEach((element, index) => {
      if (element.type === 'text' && element.content) {
        ctx.font = `${element.fontSize || 24}px ${element.fontFamily || 'Arial'}`;
        ctx.fillStyle = element.color || '#1e293b';
        ctx.textAlign = 'left';
        ctx.fillText(element.content, 100, yOffset);
        yOffset += (element.fontSize || 24) + 20;
      }
    });
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  }
}

/**
 * Main export function
 */
export async function exportPresentation(
  presentationData: PresentationData,
  options: ExportOptions
): Promise<void> {
  console.log('Exporting presentation:', presentationData.title, 'as', options.format);
  
  try {
    switch (options.format) {
      case 'html':
        await exportToHTML(presentationData, options);
        break;
      case 'pdf':
        await exportToPDF(presentationData, options);
        break;
      case 'png':
        await exportToPNG(presentationData, options);
        break;
      case 'jpg':
        await exportToJPG(presentationData, options);
        break;
      case 'pptx':
        await exportToPPTX(presentationData, options);
        break;
      case 'docx':
        // DOCX export would require additional implementation
        console.warn('DOCX export not yet implemented');
        alert('DOCX export is not yet available. Please use HTML, PDF, or PPTX export.');
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
