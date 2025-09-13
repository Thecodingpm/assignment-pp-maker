import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun, ExternalHyperlink } from 'docx';
import { StructuredDocument, DocumentBlock } from '../types/document';

// Export options interface
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html';
  filename?: string;
  includeMetadata?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Default export options
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'pdf',
  filename: 'document',
  includeMetadata: true,
  pageSize: 'A4',
  orientation: 'portrait',
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
};

// Convert document to HTML with embedded styles
export function documentToHtml(document: StructuredDocument, options: ExportOptions = DEFAULT_EXPORT_OPTIONS): string {
  const { includeMetadata = true } = options;
  
  const htmlContent = document.blocks.map((block: DocumentBlock) => {
    switch (block.type) {
      case 'heading':
        return `<h${block.level || 1} style="${generateInlineStyles(block.styling)}">${escapeHtml(block.content)}</h${block.level || 1}>`;
      
      case 'paragraph':
        return `<p style="${generateInlineStyles(block.styling)}">${escapeHtml(block.content)}</p>`;
      
      case 'list':
        const listType = block.listType === 'numbered' ? 'ol' : 'ul';
        const items = block.content.split('\n').filter((item: string) => item.trim());
        const listItems = items.map((item: string) => 
          `<li style="${generateInlineStyles(block.styling)}">${escapeHtml(item.replace(/^[•\-\d+\.]\s*/, ''))}</li>`
        ).join('');
        return `<${listType} style="${generateInlineStyles(block.styling)}">${listItems}</${listType}>`;
      
      case 'table':
        try {
          const tableData = JSON.parse(block.content);
          if (tableData.rows && tableData.rows.length > 0) {
            const headers = tableData.headers || tableData.rows[0].map((_: any, i: number) => `Column ${i + 1}`);
            const headerRow = `<tr>${headers.map((header: string) => 
              `<th style="${generateInlineStyles(block.styling)}">${escapeHtml(header)}</th>`
            ).join('')}</tr>`;
            
            const dataRows = tableData.rows.map((row: string[]) => 
              `<tr>${row.map(cell => 
                `<td style="${generateInlineStyles(block.styling)}">${escapeHtml(cell)}</td>`
              ).join('')}</tr>`
            ).join('');
            
            return `<table style="${generateInlineStyles(block.styling)}; border-collapse: collapse; width: 100%;">
              <thead>${headerRow}</thead>
              <tbody>${dataRows}</tbody>
            </table>`;
          }
        } catch {
          // Fallback for invalid table data
          return `<p style="${generateInlineStyles(block.styling)}">${escapeHtml(block.content)}</p>`;
        }
        return `<p style="${generateInlineStyles(block.styling)}">${escapeHtml(block.content)}</p>`;
      
      case 'image':
        if (block.imageUrl) {
          return `<img src="${block.imageUrl}" alt="${escapeHtml(block.content)}" style="${generateInlineStyles(block.styling)}; max-width: 100%; height: auto;" />`;
        }
        return `<p style="${generateInlineStyles(block.styling)}">[Image: ${escapeHtml(block.content)}]</p>`;
      
      default:
        return `<p style="${generateInlineStyles(block.styling)}">${escapeHtml(block.content)}</p>`;
    }
  }).join('\n');

  const metadata = includeMetadata ? `
    <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <h2 style="margin: 0 0 10px 0; color: #333;">Document Information</h2>
      <p style="margin: 5px 0;"><strong>Title:</strong> ${escapeHtml(document.title)}</p>
      <p style="margin: 5px 0;"><strong>Original File:</strong> ${escapeHtml(document.metadata.originalFileName)}</p>
      <p style="margin: 5px 0;"><strong>Created:</strong> ${new Date(document.metadata.createdAt).toLocaleString()}</p>
      <p style="margin: 5px 0;"><strong>Last Modified:</strong> ${new Date(document.metadata.lastModified).toLocaleString()}</p>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(document.title)}</title>
      <style>
        ${getPrintStyles()}
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
          margin-top: 20px;
          margin-bottom: 10px;
          color: #333;
        }
        p {
          margin-bottom: 15px;
        }
        ul, ol {
          margin-bottom: 15px;
          padding-left: 20px;
        }
        li {
          margin-bottom: 5px;
        }
        table {
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        img {
          display: block;
          margin: 20px auto;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center; margin-bottom: 30px; color: #333;">${escapeHtml(document.title)}</h1>
      ${metadata}
      <div class="document-content">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;
}

// Generate inline styles from block styling
function generateInlineStyles(styling: DocumentBlock['styling']): string {
  const styles: string[] = [];
  
  if (styling.fontSize) styles.push(`font-size: ${styling.fontSize}`);
  if (styling.fontFamily) styles.push(`font-family: ${styling.fontFamily}`);
  if (styling.color) styles.push(`color: ${styling.color}`);
  if (styling.backgroundColor) styles.push(`background-color: ${styling.backgroundColor}`);
  if (styling.textAlign) styles.push(`text-align: ${styling.textAlign}`);
  if (styling.fontWeight) styles.push(`font-weight: ${styling.fontWeight}`);
  if (styling.marginTop) styles.push(`margin-top: ${styling.marginTop}`);
  if (styling.marginBottom) styles.push(`margin-bottom: ${styling.marginBottom}`);
  
  return styles.join('; ');
}

// Escape HTML special characters
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get print-friendly CSS styles
function getPrintStyles(): string {
  return `
    @media print {
      @page {
        margin: 20mm;
        size: A4;
      }
      
      body {
        font-size: 12pt;
        line-height: 1.4;
        color: black;
        background: white;
      }
      
      h1 { font-size: 18pt; }
      h2 { font-size: 16pt; }
      h3 { font-size: 14pt; }
      h4, h5, h6 { font-size: 12pt; }
      
      p, li {
        margin-bottom: 8pt;
      }
      
      table {
        page-break-inside: avoid;
      }
      
      img {
        max-width: 100%;
        height: auto;
        page-break-inside: avoid;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .no-break {
        page-break-inside: avoid;
      }
    }
  `;
}

// Export to PDF using jsPDF and html2canvas
export async function exportToPdf(structuredDocument: StructuredDocument, options: ExportOptions = DEFAULT_EXPORT_OPTIONS): Promise<void> {
  const { pageSize = 'A4', orientation = 'portrait', margins = { top: 20, bottom: 20, left: 20, right: 20 } } = options;
  
  // Create temporary HTML element
  const htmlContent = documentToHtml(structuredDocument, options);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '800px';
  document.body.appendChild(tempDiv);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      useCORS: true,
      allowTaint: true,
      background: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    });

    const imgWidth = pdf.internal.pageSize.getWidth() - margins.left - margins.right;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', margins.left, margins.top, imgWidth, imgHeight);
    heightLeft -= (pdf.internal.pageSize.getHeight() - margins.top - margins.bottom);

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', margins.left, position + margins.top, imgWidth, imgHeight);
      heightLeft -= (pdf.internal.pageSize.getHeight() - margins.top - margins.bottom);
    }

    // Save PDF
    const filename = `${options.filename || structuredDocument.title || 'document'}.pdf`;
    pdf.save(filename);

  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
}

// Export to HTML
export function exportToHtml(document: StructuredDocument, options: ExportOptions = DEFAULT_EXPORT_OPTIONS): void {
  const htmlContent = documentToHtml(document, options);
  const filename = `${options.filename || document.title || 'document'}.html`;
  
  // Create and download file
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to DOCX using the docx library
export async function exportToDocx(document: StructuredDocument, options: ExportOptions = DEFAULT_EXPORT_OPTIONS): Promise<void> {
  const children: any[] = [];

  // Add title
  children.push(
    new Paragraph({
      text: document.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
        before: 400,
      },
    })
  );

  // Add metadata if requested
  if (options.includeMetadata) {
    children.push(
      new Paragraph({
        text: `Original File: ${document.metadata.originalFileName}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Created: ${new Date(document.metadata.createdAt).toLocaleString()}`,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: `Last Modified: ${new Date(document.metadata.lastModified).toLocaleString()}`,
        spacing: { after: 400 },
      })
    );
  }

  // Process blocks
  for (const block of document.blocks) {
    switch (block.type) {
      case 'heading':
        const headingLevel = block.level === 1 ? HeadingLevel.HEADING_1 :
                           block.level === 2 ? HeadingLevel.HEADING_2 :
                           block.level === 3 ? HeadingLevel.HEADING_3 :
                           block.level === 4 ? HeadingLevel.HEADING_4 :
                           block.level === 5 ? HeadingLevel.HEADING_5 :
                           HeadingLevel.HEADING_6;
        
        children.push(
          new Paragraph({
            text: block.content,
            heading: headingLevel,
            spacing: {
              after: 200,
              before: 200,
            },
          })
        );
        break;

      case 'paragraph':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.content,
                size: block.styling.fontSize ? parseInt(block.styling.fontSize) * 2 : 24, // Convert px to half-points
                font: block.styling.fontFamily || 'Arial',
                color: block.styling.color || '000000',
              }),
            ],
            spacing: { after: 200 },
          })
        );
        break;

      case 'list':
        const items = block.content.split('\n').filter((item: string) => item.trim());
        for (const item of items) {
          const cleanItem = item.replace(/^[•\-\d+\.]\s*/, '');
          children.push(
            new Paragraph({
              text: cleanItem,
              bullet: {
                level: 0,
              },
              spacing: { after: 100 },
            })
          );
        }
        break;

      case 'table':
        try {
          const tableData = JSON.parse(block.content);
          if (tableData.rows && tableData.rows.length > 0) {
            const headers = tableData.headers || tableData.rows[0].map((_: any, i: number) => `Column ${i + 1}`);
            
            // Create table rows
            const tableRows = [];
            
            // Header row
            const headerRow = new TableRow({
              children: headers.map((header: string) =>
                new TableCell({
                  children: [new Paragraph({ text: header })],
                  width: {
                    size: 100 / headers.length,
                    type: WidthType.PERCENTAGE,
                  },
                })
              ),
            });
            tableRows.push(headerRow);

            // Data rows
            for (const row of tableData.rows) {
              const tableRow = new TableRow({
                children: row.map((cell: string) =>
                  new TableCell({
                    children: [new Paragraph({ text: cell })],
                    width: {
                      size: 100 / row.length,
                      type: WidthType.PERCENTAGE,
                    },
                  })
                ),
              });
              tableRows.push(tableRow);
            }

            children.push(
              new Table({
                rows: tableRows,
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
              })
            );
          }
        } catch {
          // Fallback for invalid table data
          children.push(
            new Paragraph({
              text: block.content,
              spacing: { after: 200 },
            })
          );
        }
        break;

      case 'image':
        if (block.imageUrl) {
          children.push(
            new Paragraph({
              text: `[Image: ${block.content}]`,
              spacing: { after: 200 },
            })
          );
        }
        break;

      default:
        children.push(
          new Paragraph({
            text: block.content,
            spacing: { after: 200 },
          })
        );
    }
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // Generate and download file
  const buffer = await Packer.toBuffer(doc);
  const filename = `${options.filename || document.title || 'document'}.docx`;
  
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Main export function
export async function exportDocument(document: StructuredDocument, options: ExportOptions): Promise<void> {
  switch (options.format) {
    case 'pdf':
      await exportToPdf(document, options);
      break;
    case 'docx':
      await exportToDocx(document, options);
      break;
    case 'html':
      exportToHtml(document, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// Utility function to get file extension
export function getFileExtension(format: string): string {
  switch (format) {
    case 'pdf': return '.pdf';
    case 'docx': return '.docx';
    case 'html': return '.html';
    default: return '.txt';
  }
}

// Utility function to get MIME type
export function getMimeType(format: string): string {
  switch (format) {
    case 'pdf': return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'html': return 'text/html';
    default: return 'text/plain';
  }
}
