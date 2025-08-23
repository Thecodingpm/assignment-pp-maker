'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TemplatePreviewModalProps {
  template: {
    id: string;
    name: string;
    description: string;
    content: string;
    frontImage?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplatePreviewModal({ template, isOpen, onClose }: TemplatePreviewModalProps) {
  const [useIframe, setUseIframe] = useState(true); // Default to iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (useIframe && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Template Preview</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                  background: #f5f5f5;
                }
                .template-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .template-content {
                  padding: 20px;
                  position: relative;
                }
                .template-content * {
                  box-sizing: border-box;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
                /* Ensure positioning works */
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
              </style>
            </head>
            <body>
              <div class="template-container">
                <div class="template-content">
                  ${template.content}
                </div>
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  }, [template.content, useIframe]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style jsx>{`
        .template-preview-container {
          position: relative;
          width: 100%;
          min-height: 400px;
          overflow: visible;
        }
        
        .template-content {
          position: relative !important;
          width: 100% !important;
          min-height: 400px !important;
          overflow: visible !important;
          /* Create a clean slate */
          font-family: initial;
          font-size: initial;
          font-weight: initial;
          color: initial;
          line-height: initial;
          text-align: initial;
          background: initial;
          border: initial;
          margin: initial;
          padding: initial;
          box-sizing: border-box;
        }
        
        /* Remove ALL global CSS interference */
        .template-content * {
          /* Reset to browser defaults */
          font-family: initial !important;
          font-size: initial !important;
          font-weight: initial !important;
          color: initial !important;
          line-height: initial !important;
          text-align: initial !important;
          background: initial !important;
          border: initial !important;
          margin: initial !important;
          padding: initial !important;
          position: initial !important;
          top: initial !important;
          left: initial !important;
          right: initial !important;
          bottom: initial !important;
          z-index: initial !important;
          transform: initial !important;
          box-sizing: border-box !important;
          transition: none !important;
          animation: none !important;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Template Preview: {template.name}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseIframe(!useIframe)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {useIframe ? 'Use Direct Preview' : 'Use Iframe Preview'}
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
          {useIframe ? (
            <iframe
              ref={iframeRef}
              className="w-full h-[600px] border border-gray-300 rounded-lg"
              title="Template Preview"
            />
          ) : (
            <div className="template-preview-container">
              <div 
                className="template-content"
                style={{
                  position: 'relative',
                  minHeight: '400px',
                  width: '100%',
                  overflow: 'visible'
                }}
                dangerouslySetInnerHTML={{ __html: template.content }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 