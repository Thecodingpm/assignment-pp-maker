import mammoth from 'mammoth';

export interface ParsedDocument {
  content: string;
  title?: string;
  error?: string;
}

export async function parseFile(file: File): Promise<ParsedDocument> {
  try {
    console.log('=== FILE PARSER START ===');
    console.log('Parsing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const fileName = file.name.toLowerCase();
    
    // Handle different file types
    if (fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await parseDocxFile(file);
    } else if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      return await parsePdfFile(file);
    } else if (fileName.endsWith('.txt') || file.type === 'text/plain') {
      return await parseTextFile(file);
    } else if (fileName.endsWith('.html') || file.type === 'text/html') {
      return await parseHtmlFile(file);
    } else {
      // For unknown file types, try to read as text
      return await parseTextFile(file);
    }
  } catch (error) {
    console.error('File parsing error:', error);
    return {
      content: `<h1>Error</h1><p>Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}</p>`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function parseDocxFile(file: File): Promise<ParsedDocument> {
  try {
    console.log('=== DOCX PARSER START ===');
    console.log('Parsing DOCX file:', file.name, 'Size:', file.size);
    
    // Check file size - very small files might not be valid DOCX
    if (file.size < 100) {
      console.warn('DOCX file is very small, might not be valid');
      return {
        content: `<h1>Warning</h1><p>This file appears to be too small to be a valid DOCX file.</p><p>File size: ${file.size} bytes</p>`,
        title: file.name.replace(/\.docx$/i, ''),
        error: 'File too small'
      };
    }
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse DOCX using mammoth with HTML conversion to preserve formatting
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    console.log('DOCX parsing result:', result);
    
    if (result.messages && result.messages.length > 0) {
      console.log('DOCX parsing messages:', result.messages);
    }
    
    if (result.value) {
      // The result.value now contains HTML with formatting preserved
      const htmlContent = result.value;
      
      console.log('Converted HTML content:', htmlContent);
      console.log('=== DOCX PARSER SUCCESS ===');
      
      return {
        content: htmlContent,
        title: extractTitleFromHtml(htmlContent)
      };
    } else {
      console.error('No content extracted from DOCX');
      console.log('=== DOCX PARSER FAILED ===');
      return {
        content: '<h1>Error</h1><p>Could not extract content from the DOCX file. The file might be corrupted or not a valid DOCX format.</p>',
        error: 'No content extracted'
      };
    }
  } catch (error) {
    console.error('DOCX parsing error:', error);
    console.log('=== DOCX PARSER ERROR ===');
    
    // Provide more helpful error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('end of central directory')) {
        errorMessage = 'This file is not a valid DOCX format. Please ensure you are uploading a real Word document (.docx file).';
      } else if (error.message.includes('zip')) {
        errorMessage = 'The DOCX file appears to be corrupted or not a valid ZIP archive.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      content: `<h1>Error</h1><p>Failed to parse DOCX file: ${errorMessage}</p><p>Please try uploading a different DOCX file or convert your document to a different format.</p>`,
      error: errorMessage
    };
  }
}

async function parsePdfFile(file: File): Promise<ParsedDocument> {
  try {
    console.log('=== PDF PARSER START ===');
    console.log('Parsing PDF file:', file.name, 'Size:', file.size);
    
    // For PDF files, we'll create a simple placeholder since PDF parsing requires additional libraries
    const title = file.name.replace(/\.pdf$/i, '');
    
    console.log('=== PDF PARSER SUCCESS ===');
    
    return {
      content: `
<h1>${title}</h1>
<p><strong>PDF Document</strong></p>
<p>This is a PDF file: ${file.name}</p>
<p>File size: ${(file.size / 1024).toFixed(1)} KB</p>
<p><em>Note: PDF content extraction requires additional processing. The actual content would be extracted here.</em></p>
      `.trim(),
      title: title
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      content: `<h1>Error</h1><p>Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown error'}</p>`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function parseTextFile(file: File): Promise<ParsedDocument> {
  try {
    console.log('=== TEXT PARSER START ===');
    console.log('Parsing text file:', file.name, 'Size:', file.size);
    
    const text = await file.text();
    const htmlContent = convertTextToHtml(text);
    const title = extractTitle(text);
    
    console.log('=== TEXT PARSER SUCCESS ===');
    
    return {
      content: htmlContent,
      title: title
    };
  } catch (error) {
    console.error('Text parsing error:', error);
    return {
      content: `<h1>Error</h1><p>Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}</p>`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function parseHtmlFile(file: File): Promise<ParsedDocument> {
  try {
    console.log('=== HTML PARSER START ===');
    console.log('Parsing HTML file:', file.name, 'Size:', file.size);
    
    const html = await file.text();
    const title = extractTitleFromHtml(html);
    
    // PRESERVE RAW HTML EXACTLY - NO CLEANING
    console.log('Raw HTML content (first 500 chars):', html.substring(0, 500));
    console.log('=== HTML PARSER SUCCESS ===');
    
    return {
      content: html, // Return raw HTML without any cleaning
      title: title
    };
  } catch (error) {
    console.error('HTML parsing error:', error);
    return {
      content: `<h1>Error</h1><p>Failed to parse HTML file: ${error instanceof Error ? error.message : 'Unknown error'}</p>`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function cleanHtmlContent(html: string): string {
  // Only remove dangerous content, preserve ALL original styling
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
  
  let cleanedHtml = html;
  
  // Remove dangerous tags and their content
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
    cleanedHtml = cleanedHtml.replace(regex, '');
  });
  
  // Remove script tags that might be self-closing
  cleanedHtml = cleanedHtml.replace(/<script[^>]*\/?>/gi, '');
  
  // Only remove dangerous attributes, preserve ALL styling
  cleanedHtml = cleanedHtml
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .trim();
  
  // Preserve ALL original styles exactly as they are
  return cleanedHtml;
}

function convertTextToHtml(text: string): string {
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim());
  
  // Convert to HTML
  const htmlLines = lines.map(line => {
    const trimmedLine = line.trim();
    
    // Check if it's a heading (all caps or starts with numbers)
    if (trimmedLine.length > 0 && trimmedLine.length < 100) {
      if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3) {
        return `<h1>${trimmedLine}</h1>`;
      }
      
      // Check for numbered headings (e.g., "1. Introduction", "2. Background")
      const numberedHeadingMatch = trimmedLine.match(/^(\d+\.)\s+(.+)$/);
      if (numberedHeadingMatch) {
        return `<h2>${trimmedLine}</h2>`;
      }
      
      // Check for short lines that might be headings
      if (trimmedLine.length < 50 && !trimmedLine.includes('.') && !trimmedLine.includes(',')) {
        return `<h3>${trimmedLine}</h3>`;
      }
    }
    
    // Regular paragraph
    return `<p>${trimmedLine}</p>`;
  });
  
  return htmlLines.join('\n');
}

function extractTitle(text: string): string {
  // Try to extract title from first line
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length > 0 && firstLine.length < 100) {
      return firstLine;
    }
  }
  return 'Untitled Document';
}

function extractTitleFromHtml(html: string): string {
  // Try to extract title from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  return 'Untitled Document';
}
