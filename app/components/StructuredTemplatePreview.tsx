'use client';

import React, { useState } from 'react';
import { Template } from '../firebase/templates';
import { StructuredDocument } from '../types/document';
import { documentToHtml } from '../utils/exportUtils';

interface StructuredTemplatePreviewProps {
  template: Template;
  onEdit?: (template: Template) => void;
  onClose?: () => void;
}

const StructuredTemplatePreview: React.FC<StructuredTemplatePreviewProps> = ({
  template,
  onEdit,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [useOriginalFormat, setUseOriginalFormat] = useState(true);

  // Generate preview content with original formatting preservation
  React.useEffect(() => {
    if (useOriginalFormat && template.content) {
      // Use original content directly for exact formatting preservation (like Canva/Word)
      setPreviewContent(template.content);
    } else if (template.structuredDocument) {
      // Use structured format for editing capabilities
      try {
        const htmlContent = documentToHtml(template.structuredDocument, {
          format: 'html',
          includeMetadata: false
        });
        setPreviewContent(htmlContent);
      } catch (error) {
        console.error('Error generating structured preview:', error);
        setPreviewContent('<p>Error generating preview</p>');
      }
    } else if (template.content) {
      // Fallback to original content
      setPreviewContent(template.content);
    } else {
      setPreviewContent('<p>No content available</p>');
    }
  }, [template, useOriginalFormat]);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(template);
    }
  };

  const isStructuredTemplate = template.documentType === 'structured' && template.structuredDocument;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        width: '1000px',
        height: '700px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>
              {template.title}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
              {template.description}
            </p>
            {isStructuredTemplate && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  Structured Document ({template.structuredDocument?.blocks.length} blocks)
                </span>
                {template.version && (
                  <span style={{
                    background: '#f3e5f5',
                    color: '#7b1fa2',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}>
                    v{template.version}
                  </span>
                )}
                {/* Format Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#666' }}>
                    <input
                      type="checkbox"
                      checked={useOriginalFormat}
                      onChange={(e) => setUseOriginalFormat(e.target.checked)}
                      style={{ marginRight: '4px' }}
                    />
                    Original Format
                  </label>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isStructuredTemplate && onEdit && (
              <button
                onClick={handleEdit}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Edit Template
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          backgroundColor: '#fafafa',
        }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}>
              <div>Loading preview...</div>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: previewContent }}
              style={{
                fontFamily: 'Arial, sans-serif',
                lineHeight: '1.6',
                color: '#333',
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                minHeight: '100%',
                // Preserve original formatting exactly
                ...(useOriginalFormat && {
                  fontFamily: 'inherit',
                  lineHeight: 'inherit',
                  color: 'inherit',
                  backgroundColor: 'transparent',
                  padding: '0',
                  borderRadius: '0',
                  boxShadow: 'none',
                })
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#666',
        }}>
          <div>
            <span>Category: {template.category}</span>
            <span style={{ marginLeft: '16px' }}>
              Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
            </span>
            {template.lastEdited && (
              <span style={{ marginLeft: '16px' }}>
                Last edited: {new Date(template.lastEdited).toLocaleDateString()}
              </span>
            )}
          </div>
          <div>
            <span>File: {template.fileName}</span>
            <span style={{ marginLeft: '16px' }}>
              Size: {(template.fileSize / 1024).toFixed(1)} KB
            </span>
            {useOriginalFormat && (
              <span style={{ marginLeft: '16px', color: '#28a745', fontWeight: 'bold' }}>
                ✓ Original Format
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructuredTemplatePreview;
