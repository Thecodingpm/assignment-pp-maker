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

  // Add error boundary for the entire component
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('TemplatePreviewModal caught error:', event.error);
      if (event.error?.message?.includes('removeChild')) {
        console.error('removeChild error detected in TemplatePreviewModal');
        // Prevent the error from crashing the app
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
        console.log('Setting up iframe content...');
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          iframeDoc.open();
          
          // Create a completely raw HTML document - NO PROCESSING
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Template Preview - ${template?.name || 'Template'}</title>
                <style>
                  /* ENHANCED STYLES FOR BETTER TEMPLATE DISPLAY */
                  body {
                    margin: 0;
                    padding: 20px;
                    background: #f5f5f5;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                  }
                  
                  .template-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    position: relative;
                  }
                  
                  .template-content {
                    padding: 30px;
                    position: relative;
                    z-index: 1;
                    font-family: inherit;
                    line-height: 1.6;
                    color: #333;
                  }
                  
                  /* PRESERVE ALL ORIGINAL STYLES */
                  .template-content * {
                    /* Allow all original styles to take precedence */
                  }
                  
                  /* Enhanced typography */
                  .template-content h1 {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 16px;
                    color: #1a1a1a;
                  }
                  
                  .template-content h2 {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 12px;
                    color: #1f2937;
                  }
                  
                  .template-content h3 {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #374151;
                  }
                  
                  .template-content p {
                    margin-bottom: 12px;
                    line-height: 1.6;
                  }
                  
                  .template-content ul {
                    margin-bottom: 12px;
                    padding-left: 20px;
                  }
                  
                  .template-content li {
                    margin-bottom: 6px;
                  }
                  
                  .template-content strong {
                    font-weight: bold;
                    color: #1f2937;
                  }
                  
                  /* Preserve text alignment */
                  .text-center { text-align: center; }
                  .text-left { text-align: left; }
                  .text-right { text-align: right; }
                  .text-justify { text-align: justify; }
                  
                  /* Debug info styles */
                  .debug-info {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    z-index: 1000;
                    max-width: 300px;
                  }
                  
                  .debug-info .success { color: #10b981; }
                  .debug-info .error { color: #ef4444; }
                </style>
              </head>
              <body>
                <div class="template-container">
                  <div class="template-content">
                    ${template?.content || 'No content available'}
                  </div>
                </div>
                
                <div class="debug-info">
                  <h4>Template Debug Info</h4>
                  <p><strong>Template:</strong> ${template?.name || 'Unknown'}</p>
                  <p><strong>Content Length:</strong> ${template?.content?.length || 0} chars</p>
                  <p><strong>File Type:</strong> ${template?.fileName || 'Unknown'}</p>
                  <p><strong>Has Front Image:</strong> ${template?.frontImage ? 'Yes' : 'No'}</p>
                  <div id="rendered-info">Analyzing content...</div>
                </div>
                
                <script>
                  // Debug script to analyze the rendered content
                  setTimeout(() => {
                    try {
                      const textContent = document.body.textContent || '';
                      const positionedElements = document.querySelectorAll('[style*="position:"]');
                      const styledElements = document.querySelectorAll('[style]');
                      const images = document.querySelectorAll('img');
                      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                      const paragraphs = document.querySelectorAll('p');
                      const lists = document.querySelectorAll('ul, ol');
                      
                      console.log('Template content analysis:');
                      console.log('- Text content length:', textContent.length);
                      console.log('- Positioned elements:', positionedElements.length);
                      console.log('- Styled elements:', styledElements.length);
                      console.log('- Images:', images.length);
                      console.log('- Headings:', headings.length);
                      console.log('- Paragraphs:', paragraphs.length);
                      console.log('- Lists:', lists.length);
                      
                      const debugInfo = document.getElementById('rendered-info');
                      if (debugInfo) {
                        debugInfo.innerHTML = \`
                          <p><strong>Headings:</strong> <span class="\${headings.length > 0 ? 'success' : 'error'}">\${headings.length}</span></p>
                          <p><strong>Paragraphs:</strong> <span class="\${paragraphs.length > 0 ? 'success' : 'error'}">\${paragraphs.length}</span></p>
                          <p><strong>Lists:</strong> <span class="\${lists.length > 0 ? 'success' : 'error'}">\${lists.length}</span></p>
                          <p><strong>Styled Elements:</strong> <span class="\${styledElements.length > 0 ? 'success' : 'error'}">\${styledElements.length}</span></p>
                          <p><strong>Images:</strong> <span class="\${images.length > 0 ? 'success' : 'error'}">\${images.length}</span></p>
                          <p><strong>Text Content:</strong> <span class="\${textContent.length > 0 ? 'success' : 'error'}">\${textContent.length} chars</span></p>
                        \`;
                      }
                    } catch (error) {
                      console.error('Error analyzing template content:', error);
                    }
                  }, 100);
                </script>
              </body>
            </html>
          `;
          
          iframeDoc.write(htmlContent);
          iframeDoc.close();
          console.log('Iframe content set successfully');
        }
      } catch (error) {
        console.error('Error setting up iframe content:', error);
      }
    }
  }, [template?.content, template?.name, isOpen]);

  // Add null check to prevent errors - AFTER all hooks
  if (!template || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Template Preview: {template?.name || 'Untitled'}
            {template?.fileName?.toLowerCase().endsWith('.docx') && (
              <span className="ml-2 text-sm text-blue-600">(DOCX Template)</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawHtml(!showRawHtml)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              {showRawHtml ? 'Show Preview' : 'Show Raw HTML'}
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
        
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {showRawHtml ? (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg">
              <h3 className="text-white mb-4">Raw HTML Content:</h3>
              <pre className="raw-html overflow-auto">
                {template?.content || 'No content available'}
              </pre>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-[700px] border border-gray-300 rounded-lg"
              title="Template Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
} 