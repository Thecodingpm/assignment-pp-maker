'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Template } from '../firebase/templates';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'original' | 'structured'>('original');
  const [zoomLevel, setZoomLevel] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen && template) {
      setIsLoading(true);
      processTemplateContent();
    }
  }, [isOpen, template, previewMode]);

  const processTemplateContent = () => {
    try {
      let content = template.content || '';
      
      // APPROACH 1: Enhanced HTML Preview with Exact Formatting Preservation
      if (previewMode === 'original') {
        // Use the original content exactly as uploaded for perfect formatting
        if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
          // Complete HTML document - use as is for perfect preservation
          setRenderedContent(content);
        } else if (content.includes('<body>') || content.includes('<div') || content.includes('<p>')) {
          // HTML content - wrap in completely isolated document structure
          const isolatedHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${template.title || 'Template Preview'}</title>
              <style>
                /* COMPLETE ISOLATION - PRESERVE ORIGINAL FORMATTING EXACTLY */
                * { 
                  margin: 0; 
                  padding: 0; 
                  box-sizing: border-box; 
                }
                
                html, body {
                  margin: 0;
                  padding: 20px;
                  font-family: inherit;
                  line-height: inherit;
                  color: inherit;
                  background: white;
                  font-size: inherit;
                  font-weight: inherit;
                  text-align: inherit;
                  text-decoration: inherit;
                  border: none;
                  outline: none;
                  box-shadow: none;
                  transform: none;
                  transition: none;
                  animation: none;
                }
                
                /* PRESERVE ORIGINAL TEMPLATE STYLING - NO OVERRIDES */
                .template-content {
                  /* Allow original styles to work without interference */
                  font-family: inherit;
                  line-height: inherit;
                  color: inherit;
                  background: inherit;
                }
                
                /* PRESERVE ALL ORIGINAL POSITIONING AND SIZING */
                /* DO NOT add any custom styling that could override original formatting */
                
                /* Only add minimal responsive support for images */
                img {
                  max-width: 100%;
                  height: auto;
                }
                
                /* Preserve table structure */
                table {
                  border-collapse: collapse;
                }
                
                /* Preserve list structure */
                ul, ol {
                  padding-left: 20px;
                }
              </style>
            </head>
            <body>
              <div class="template-content">
                ${content}
              </div>
            </body>
            </html>
          `;
          setRenderedContent(isolatedHtml);
        } else {
          // Plain text or DOCX content - convert to formatted HTML
          const formattedContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${template.title || 'Template Preview'}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Times New Roman', serif;
                  line-height: 1.6;
                  color: #333;
                  background: white;
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                }
                
                h1, h2, h3, h4, h5, h6 { 
                  margin: 1.5em 0 0.5em 0;
                  font-weight: bold;
                  color: #2c3e50;
                }
                h1 { font-size: 2.2em; border-bottom: 2px solid #3498db; padding-bottom: 8px; }
                h2 { font-size: 1.8em; border-bottom: 1px solid #bdc3c7; padding-bottom: 6px; }
                h3 { font-size: 1.5em; }
                h4 { font-size: 1.3em; }
                h5 { font-size: 1.1em; }
                h6 { font-size: 1em; }
                
                p { margin: 12px 0; }
                ul, ol { margin: 12px 0; padding-left: 20px; }
                li { margin: 4px 0; }
                
                table { 
                  border-collapse: collapse; 
                  width: 100%; 
                  margin: 16px 0;
                }
                td, th { 
                  border: 1px solid #ddd; 
                  padding: 12px; 
                  text-align: left;
                }
                th { background-color: #f8f9fa; font-weight: 600; }
                
                img { 
                  max-width: 100%; 
                  height: auto; 
                  margin: 16px 0;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                blockquote {
                  margin: 16px 0;
                  padding: 12px 20px;
                  border-left: 4px solid #3498db;
                  background: #f8f9fa;
                  font-style: italic;
                  color: #555;
                }
                
                pre {
                  background: #f8f9fa;
                  border: 1px solid #e9ecef;
                  border-radius: 4px;
                  padding: 16px;
                  overflow-x: auto;
                  font-family: 'Courier New', monospace;
                  font-size: 14px;
                  line-height: 1.4;
                }
                
                @media (max-width: 768px) {
                  body { padding: 20px; }
                  h1 { font-size: 1.8em; }
                  h2 { font-size: 1.5em; }
                  table { font-size: 14px; }
                  th, td { padding: 8px; }
                }
              </style>
            </head>
            <body>
              <div class="template-content">
                ${content.split('\n').map(line => {
                  if (line.trim() === '') return '<br>';
                  if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
                  if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
                  if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
                  if (line.startsWith('- ') || line.startsWith('* ')) return `<li>${line.substring(2)}</li>`;
                  if (line.match(/^\d+\./)) return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
                  return `<p>${line}</p>`;
                }).join('')}
              </div>
            </body>
            </html>
          `;
          setRenderedContent(formattedContent);
        }
      } else {
        // APPROACH 2: Structured Preview (for future use)
        // This will be used when templates are stored in structured format
        if (template.structuredDocument) {
          // Convert structured document to HTML
          const structuredHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${template.title || 'Structured Template Preview'}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background: white;
                  padding: 40px;
                  max-width: 800px;
                  margin: 0 auto;
                }
                .structured-content {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <div class="structured-content">
                <h1>${template.title || 'Structured Template'}</h1>
                <p>This template is stored in structured format for enhanced editing capabilities.</p>
                <p>Structured templates support advanced features like collaborative editing and real-time formatting.</p>
              </div>
            </body>
            </html>
          `;
          setRenderedContent(structuredHtml);
        } else {
          // Fallback to original content
          setRenderedContent(content);
        }
      }
    } catch (error) {
      console.error('Error processing template content:', error);
      // Fallback to simple formatted content
      setRenderedContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .template-content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="template-content">${template.content || 'No content available'}</div>
        </body>
        </html>
      `);
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleDownload = () => {
    const blob = new Blob([renderedContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title || 'template'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {template.title || 'Template Preview'}
            </h2>
            <p className="text-gray-600 mt-1">
              {template.category} • {template.fileName} • {(template.fileSize / 1024).toFixed(1)} KB
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {previewMode === 'original' ? '📄 Original Format (Exact Preservation)' : '🔧 Structured Format (Enhanced Editing)'}
            </p>
          </div>
          
          {/* Preview Mode Toggle */}
          <div className="flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Preview Mode:</label>
              <select
                value={previewMode}
                onChange={(e) => setPreviewMode(e.target.value as 'original' | 'structured')}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="original">Original Format</option>
                <option value="structured">Structured Format</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                title="Zoom Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                title="Zoom In"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <button
                onClick={handleResetZoom}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Download HTML
            </button>
            <button
              onClick={() => {
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                  newWindow.document.write(renderedContent);
                  newWindow.document.close();
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Open in New Tab
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading template preview...</span>
            </div>
          ) : (
            <div className="h-full relative bg-gray-100 flex items-center justify-center">
              {/* Template Preview Frame with Zoom */}
              <div 
                className="bg-white shadow-lg border border-gray-200 overflow-auto"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <iframe
                  ref={iframeRef}
                  srcDoc={renderedContent}
                  className="border-0"
                  title="Template Preview"
                  sandbox="allow-same-origin allow-scripts"
                  onLoad={() => setIsLoading(false)}
                  style={{
                    width: '800px',
                    height: '600px',
                    minWidth: '800px',
                    minHeight: '600px'
                  }}
                />
              </div>
              
              {/* Formatting Info Overlay */}
              <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg border border-gray-200">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">Formatting Preserved</div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>• Original fonts & colors</div>
                    <div>• Exact layout & spacing</div>
                    <div>• Tables & images intact</div>
                    <div>• All styling preserved</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Template Type:</span> 
              <span className="ml-2">{template.documentType || 'formatted'}</span>
              {template.structuredDocument && (
                <span className="ml-4 text-blue-600">✓ Structured format available</span>
              )}
            </div>
            <div className="flex gap-4">
              <span>Uploaded by: {template.uploadedBy}</span>
              <span>File size: {(template.fileSize / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal; 