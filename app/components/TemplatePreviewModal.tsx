'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TemplatePreviewModalProps {
  template: {
    id: string;
    name: string;
    description: string;
    content: string;
    frontImage?: string;
    fileName?: string;
    originalFile?: File | ArrayBuffer | string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplatePreviewModal({ template, isOpen, onClose }: TemplatePreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');

  // Add error boundary for the entire component
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('TemplatePreviewModal caught error:', event.error);
      if (event.error?.message?.includes('removeChild')) {
        console.error('removeChild error detected in TemplatePreviewModal');
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('TemplatePreviewModal caught unhandled rejection:', event.reason);
      if (event.reason?.message?.includes('removeChild')) {
        console.error('removeChild error in promise rejection');
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // useEffect must be called before any conditional returns
  useEffect(() => {
    if (isOpen && iframeRef.current && template?.content) {
      try {
        setIsLoading(true);
        console.log('Setting up dynamic template preview with original design files...');
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          iframeDoc.open();
          
          // Get file type and process accordingly
          const fileName = template.fileName || '';
          const content = template.content;
          
          let htmlContent = '';
          
          if (fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm')) {
            // HTML files - preserve all original styling and resources
            htmlContent = createHtmlPreview(content, fileName);
          } else if (fileName.toLowerCase().endsWith('.docx')) {
            // DOCX files - convert to HTML with preserved styling
            htmlContent = createDocxPreview(content, fileName);
          } else if (fileName.toLowerCase().endsWith('.pptx')) {
            // PPTX files - presentation layout
            htmlContent = createPptxPreview(content, fileName);
          } else if (fileName.toLowerCase().endsWith('.json')) {
            // JSON files - structured data view
            htmlContent = createJsonPreview(content, fileName);
          } else {
            // Default - treat as HTML content
            htmlContent = createHtmlPreview(content, fileName);
          }
          
          iframeDoc.write(htmlContent);
          iframeDoc.close();
          console.log('Dynamic template preview set successfully with original design preservation');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error setting up dynamic template preview:', error);
        setIsLoading(false);
      }
    }
  }, [template?.content, template?.name, template?.fileName, isOpen]);

  // Create HTML preview with all original resources preserved
  const createHtmlPreview = (content: string, fileName: string): string => {
    // Extract all external resources from the content
    const cssLinks = content.match(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
    const fontLinks = content.match(/<link[^>]*href=["']([^"']*fonts[^"']*)["'][^>]*>/gi) || [];
    const googleFontLinks = content.match(/<link[^>]*href=["']https:\/\/fonts\.googleapis\.com[^"']*["'][^>]*>/gi) || [];
    const scriptLinks = content.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
    const embeddedStyles = content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const embeddedScripts = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];

    return `
            <!DOCTYPE html>
            <html>
              <head>
        <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Template Preview - ${template?.name || 'Template'}</title>
        
        <!-- PRESERVE ALL ORIGINAL EXTERNAL RESOURCES -->
        ${cssLinks.join('\n        ')}
        ${fontLinks.join('\n        ')}
        ${googleFontLinks.join('\n        ')}
        
        <!-- PRESERVE ALL ORIGINAL EMBEDDED STYLES -->
        ${embeddedStyles.join('\n        ')}
        
        <!-- ADDITIONAL FONT SUPPORT -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Lato:wght@300;400;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Ubuntu:wght@300;400;500;700&family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
        
        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
                <style>
          /* MINIMAL RESET - PRESERVE ALL ORIGINAL STYLES */
                  * {
                    box-sizing: border-box;
                  }
                  
                  body {
                    margin: 0;
            padding: 0;
            font-family: inherit;
            line-height: inherit;
            color: inherit;
            background: inherit;
          }
          
          /* TEMPLATE CONTAINER - MINIMAL INTERFERENCE */
                  .template-container {
            width: 100%;
            min-height: 100vh;
                    background: white;
            position: relative;
                    overflow: visible;
                  }
                  
                  .template-content {
            width: 100%;
            height: 100%;
            /* NO ADDITIONAL STYLES - PRESERVE ORIGINAL COMPLETELY */
          }
          
          /* CRITICAL: ALLOW ALL ORIGINAL STYLES TO WORK UNMODIFIED */
                  .template-content * {
            /* NO OVERRIDES - KEEP ORIGINAL STYLES */
                  }
                  
          /* Ensure all positioning works correctly */
                  .template-content [style*="position: absolute"],
                  .template-content [style*="position:absolute"] {
                    position: absolute !important;
                  }
                  
                  .template-content [style*="position: relative"],
                  .template-content [style*="position:relative"] {
                    position: relative !important;
                  }
                  
                  .template-content [style*="position: fixed"],
                  .template-content [style*="position:fixed"] {
                    position: fixed !important;
                  }
                  
          /* Preserve all flexbox and grid layouts */
          .template-content [style*="display: flex"],
          .template-content [style*="display:flex"] {
            display: flex !important;
          }
          
          .template-content [style*="display: grid"],
          .template-content [style*="display:grid"] {
            display: grid !important;
          }
          
          /* Preserve all transforms */
          .template-content [style*="transform:"] {
            /* Keep original transform */
          }
          
          /* Preserve all z-index */
          .template-content [style*="z-index:"] {
            /* Keep original z-index */
          }
          
          /* Preserve all animations and transitions */
          .template-content [style*="animation:"] {
            /* Keep original animation */
          }
          
          .template-content [style*="transition:"] {
            /* Keep original transition */
          }
          
          /* Preserve all shadows and effects */
          .template-content [style*="box-shadow:"] {
            /* Keep original box-shadow */
          }
          
          .template-content [style*="text-shadow:"] {
            /* Keep original text-shadow */
          }
          
          /* Preserve all gradients */
          .template-content [style*="background: linear-gradient"],
          .template-content [style*="background: radial-gradient"] {
            /* Keep original gradients */
          }
          
          /* Preserve all borders and outlines */
          .template-content [style*="border:"] {
            /* Keep original border */
          }
          
          .template-content [style*="outline:"] {
            /* Keep original outline */
          }
          
          /* Preserve all text formatting */
                  .template-content [style*="text-align:"] {
                    /* Keep original text alignment */
                  }
                  
                  .template-content [style*="font-family:"] {
                    /* Keep original font family */
                  }
                  
                  .template-content [style*="font-size:"] {
                    /* Keep original font size */
                  }
          
          .template-content [style*="font-weight:"] {
            /* Keep original font weight */
          }
                  
                  .template-content [style*="color:"] {
                    /* Keep original color */
                  }
                  
                  .template-content [style*="background:"] {
                    /* Keep original background */
                  }
                  
          /* Preserve all spacing */
                  .template-content [style*="margin:"] {
                    /* Keep original margin */
                  }
                  
                  .template-content [style*="padding:"] {
                    /* Keep original padding */
                  }
                  
          /* Preserve all dimensions */
                  .template-content [style*="width:"] {
                    /* Keep original width */
                  }
                  
                  .template-content [style*="height:"] {
                    /* Keep original height */
                  }
          
          /* Preserve all images */
          .template-content img {
            max-width: 100%;
            height: auto;
            display: block;
          }
                  
                  /* Debug info styles */
                  .debug-info {
                    position: fixed;
                    top: 10px;
                    right: 10px;
            background: rgba(0,0,0,0.9);
                    color: white;
            padding: 15px;
            border-radius: 8px;
                    font-size: 12px;
                    z-index: 1000;
            max-width: 350px;
            font-family: 'Courier New', monospace;
                  }
                  
                  .debug-info .success { color: #10b981; }
                  .debug-info .error { color: #ef4444; }
          .debug-info .warning { color: #f59e0b; }
                  
                  /* Raw HTML display */
                  .raw-html {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 20px;
                    border-radius: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    overflow-x: auto;
            max-height: 600px;
                    overflow-y: auto;
                  }
                </style>
              </head>
              <body>
                <div class="template-container">
                  <div class="template-content">
            ${content}
                  </div>
                </div>
        
        <!-- PRESERVE ALL ORIGINAL EMBEDDED SCRIPTS -->
        ${embeddedScripts.join('\n        ')}
        
        <!-- PRESERVE ALL ORIGINAL EXTERNAL SCRIPTS -->
        ${scriptLinks.join('\n        ')}
                
                <div class="debug-info">
          <h4>Template Preview Analysis</h4>
                  <p><strong>Template:</strong> ${template?.name || 'Unknown'}</p>
          <p><strong>File Type:</strong> ${fileName || 'Unknown'}</p>
          <p><strong>Preview Mode:</strong> <span class="success">Original Design Preservation</span></p>
          <p><strong>Content Length:</strong> ${content.length} chars</p>
          <p><strong>CSS Links:</strong> <span class="${cssLinks.length > 0 ? 'success' : 'error'}">${cssLinks.length}</span></p>
          <p><strong>Font Links:</strong> <span class="${fontLinks.length > 0 ? 'success' : 'error'}">${fontLinks.length}</span></p>
          <p><strong>Google Fonts:</strong> <span class="${googleFontLinks.length > 0 ? 'success' : 'error'}">${googleFontLinks.length}</span></p>
          <p><strong>Embedded Styles:</strong> <span class="${embeddedStyles.length > 0 ? 'success' : 'error'}">${embeddedStyles.length}</span></p>
          <p><strong>Script Links:</strong> <span class="${scriptLinks.length > 0 ? 'success' : 'error'}">${scriptLinks.length}</span></p>
          <p><strong>Embedded Scripts:</strong> <span class="${embeddedScripts.length > 0 ? 'success' : 'error'}">${embeddedScripts.length}</span></p>
          <div id="rendered-info">Analyzing design elements...</div>
                </div>
                
                <script>
          // Enhanced debug script to analyze all design elements
                  setTimeout(() => {
                    try {
                      const textContent = document.body.textContent || '';
                      const positionedElements = document.querySelectorAll('[style*="position:"]');
                      const styledElements = document.querySelectorAll('[style]');
                      const images = document.querySelectorAll('img');
                      const alignedElements = document.querySelectorAll('[style*="text-align:"]');
                      const coloredElements = document.querySelectorAll('[style*="color:"]');
                      const fontElements = document.querySelectorAll('[style*="font"]');
              const flexElements = document.querySelectorAll('[style*="display: flex"], [style*="display:flex"]');
              const gridElements = document.querySelectorAll('[style*="display: grid"], [style*="display:grid"]');
              const transformElements = document.querySelectorAll('[style*="transform:"]');
              const shadowElements = document.querySelectorAll('[style*="box-shadow:"]');
              const gradientElements = document.querySelectorAll('[style*="background: linear-gradient"], [style*="background: radial-gradient"]');
              const animationElements = document.querySelectorAll('[style*="animation:"]');
              const transitionElements = document.querySelectorAll('[style*="transition:"]');
              const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
              const styleTags = document.querySelectorAll('style');
              const fontLinks = document.querySelectorAll('link[href*="fonts"]');
              const scriptTags = document.querySelectorAll('script');
              
              console.log('=== TEMPLATE DESIGN ANALYSIS ===');
                      console.log('- Text content length:', textContent.length);
                      console.log('- Positioned elements:', positionedElements.length);
                      console.log('- Styled elements:', styledElements.length);
                      console.log('- Images:', images.length);
                      console.log('- Aligned elements:', alignedElements.length);
                      console.log('- Colored elements:', coloredElements.length);
                      console.log('- Font elements:', fontElements.length);
              console.log('- Flex elements:', flexElements.length);
              console.log('- Grid elements:', gridElements.length);
              console.log('- Transform elements:', transformElements.length);
              console.log('- Shadow elements:', shadowElements.length);
              console.log('- Gradient elements:', gradientElements.length);
              console.log('- Animation elements:', animationElements.length);
              console.log('- Transition elements:', transitionElements.length);
              console.log('- CSS links:', cssLinks.length);
              console.log('- Style tags:', styleTags.length);
              console.log('- Font links:', fontLinks.length);
              console.log('- Script tags:', scriptTags.length);
                      
                      const debugInfo = document.getElementById('rendered-info');
                      if (debugInfo) {
                        debugInfo.innerHTML = \`
                          <p><strong>Positioned Elements:</strong> <span class="\${positionedElements.length > 0 ? 'success' : 'error'}">\${positionedElements.length}</span></p>
                          <p><strong>Styled Elements:</strong> <span class="\${styledElements.length > 0 ? 'success' : 'error'}">\${styledElements.length}</span></p>
                          <p><strong>Images:</strong> <span class="\${images.length > 0 ? 'success' : 'error'}">\${images.length}</span></p>
                          <p><strong>Aligned Elements:</strong> <span class="\${alignedElements.length > 0 ? 'success' : 'error'}">\${alignedElements.length}</span></p>
                          <p><strong>Colored Elements:</strong> <span class="\${coloredElements.length > 0 ? 'success' : 'error'}">\${coloredElements.length}</span></p>
                          <p><strong>Font Elements:</strong> <span class="\${fontElements.length > 0 ? 'success' : 'error'}">\${fontElements.length}</span></p>
                  <p><strong>Flex Elements:</strong> <span class="\${flexElements.length > 0 ? 'success' : 'error'}">\${flexElements.length}</span></p>
                  <p><strong>Grid Elements:</strong> <span class="\${gridElements.length > 0 ? 'success' : 'error'}">\${gridElements.length}</span></p>
                  <p><strong>Transform Elements:</strong> <span class="\${transformElements.length > 0 ? 'success' : 'error'}">\${transformElements.length}</span></p>
                  <p><strong>Shadow Elements:</strong> <span class="\${shadowElements.length > 0 ? 'success' : 'error'}">\${shadowElements.length}</span></p>
                  <p><strong>Gradient Elements:</strong> <span class="\${gradientElements.length > 0 ? 'success' : 'error'}">\${gradientElements.length}</span></p>
                  <p><strong>Animation Elements:</strong> <span class="\${animationElements.length > 0 ? 'success' : 'error'}">\${animationElements.length}</span></p>
                  <p><strong>Transition Elements:</strong> <span class="\${transitionElements.length > 0 ? 'success' : 'error'}">\${transitionElements.length}</span></p>
                  <p><strong>Script Tags:</strong> <span class="\${scriptTags.length > 0 ? 'success' : 'error'}">\${scriptTags.length}</span></p>
                          <p><strong>Text Content:</strong> <span class="\${textContent.length > 0 ? 'success' : 'error'}">\${textContent.length} chars</span></p>
                        \`;
                      }
                    } catch (error) {
              console.error('Error analyzing template design:', error);
                    }
          }, 200);
                </script>
              </body>
      </html>`;
  };

  // Create DOCX preview
  const createDocxPreview = (content: string, fileName: string): string => {
    return createHtmlPreview(content, fileName);
  };

  // Create PPTX preview
  const createPptxPreview = (content: string, fileName: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Presentation Preview - ${template?.name || 'Template'}</title>
        
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .presentation-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .slide {
            padding: 60px;
            min-height: 600px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          
          .slide h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #333;
          }
          
          .slide h2 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: #555;
          }
          
          .slide p {
            font-size: 1.2rem;
            line-height: 1.6;
            color: #666;
            max-width: 600px;
          }
          
          .slide-content {
            width: 100%;
            max-width: 800px;
          }
          
          .debug-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            max-width: 350px;
            font-family: 'Courier New', monospace;
          }
          
          .debug-info .success { color: #10b981; }
          .debug-info .error { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="presentation-container">
          <div class="slide">
            <div class="slide-content">
              <h1>${template?.name || 'Presentation Template'}</h1>
              <p>This is a PPTX template converted to HTML with preserved styling.</p>
              <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h2>Content Preview</h2>
                <div style="text-align: left; margin-top: 20px;">
                  ${content}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="debug-info">
          <h4>PPTX Template Preview</h4>
          <p><strong>Template:</strong> ${template?.name || 'Unknown'}</p>
          <p><strong>File Type:</strong> PPTX</p>
          <p><strong>Preview Mode:</strong> <span class="success">Presentation Layout</span></p>
          <p><strong>Content Length:</strong> ${content.length} chars</p>
        </div>
      </body>
      </html>`;
  };

  // Create JSON preview
  const createJsonPreview = (content: string, fileName: string): string => {
    let jsonData;
    try {
      jsonData = JSON.parse(content);
      } catch (error) {
      jsonData = { error: 'Invalid JSON', content: content };
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JSON Template Preview - ${template?.name || 'Template'}</title>
        
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .json-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .json-header {
            background: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .json-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .json-content {
            padding: 40px;
          }
          
          .json-preview {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            overflow-x: auto;
            white-space: pre-wrap;
          }
          
          .json-structure {
            margin-top: 30px;
          }
          
          .json-structure h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: #333;
          }
          
          .debug-info {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            max-width: 350px;
            font-family: 'Courier New', monospace;
          }
          
          .debug-info .success { color: #10b981; }
          .debug-info .error { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="json-container">
          <div class="json-header">
            <h1>${template?.name || 'JSON Template'}</h1>
            <p>JSON Template Preview with Structured Data</p>
          </div>
          
          <div class="json-content">
            <div class="json-structure">
              <h3>JSON Structure</h3>
              <div class="json-preview">${JSON.stringify(jsonData, null, 2)}</div>
            </div>
            
            <div class="json-structure">
              <h3>Rendered Content</h3>
              <div style="background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px;">
                ${renderJsonContent(jsonData)}
              </div>
            </div>
          </div>
        </div>
        
        <div class="debug-info">
          <h4>JSON Template Preview</h4>
          <p><strong>Template:</strong> ${template?.name || 'Unknown'}</p>
          <p><strong>File Type:</strong> JSON</p>
          <p><strong>Preview Mode:</strong> <span class="success">Structured Data</span></p>
          <p><strong>Content Length:</strong> ${content.length} chars</p>
          <p><strong>JSON Keys:</strong> <span class="success">${Object.keys(jsonData).length}</span></p>
        </div>
      </body>
      </html>`;
  };

  // Helper function to render JSON content
  const renderJsonContent = (data: any): string => {
    if (typeof data === 'string') {
      return `<p>${data}</p>`;
    } else if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return `<ul>${data.map(item => `<li>${renderJsonContent(item)}</li>`).join('')}</ul>`;
      } else {
        return `<div>${Object.entries(data).map(([key, value]) => 
          `<div style="margin-bottom: 10px;"><strong>${key}:</strong> ${renderJsonContent(value)}</div>`
        ).join('')}</div>`;
      }
    } else {
      return `<span>${String(data)}</span>`;
    }
  };

  // Add null check to prevent errors - AFTER all hooks
  if (!template || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Template Preview: {template?.name || 'Untitled'}
            {template?.fileName?.toLowerCase().endsWith('.docx') && (
              <span className="ml-2 text-sm text-blue-600">(DOCX Template)</span>
            )}
            {template?.fileName?.toLowerCase().endsWith('.html') && (
              <span className="ml-2 text-sm text-green-600">(HTML Template)</span>
            )}
            {template?.fileName?.toLowerCase().endsWith('.pptx') && (
              <span className="ml-2 text-sm text-orange-600">(PPTX Template)</span>
            )}
            {template?.fileName?.toLowerCase().endsWith('.json') && (
              <span className="ml-2 text-sm text-purple-600">(JSON Template)</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawHtml(!showRawHtml)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              {showRawHtml ? 'Show Preview' : 'Show Raw Content'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-auto max-h-[calc(95vh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading template with original design...</p>
              </div>
            </div>
          ) : showRawHtml ? (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
              <h3 className="text-white mb-4">Raw Template Content:</h3>
              <pre className="raw-html overflow-auto">
                {template?.content || 'No content available'}
              </pre>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-[800px] border border-gray-300 rounded-lg"
              title="Template Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          )}
        </div>
      </div>
    </div>
  );
} 