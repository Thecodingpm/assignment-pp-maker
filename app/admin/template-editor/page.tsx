'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../components/AdminContext';
import DocumentEditor from '../../components/DocumentEditor';
import { Template } from '../../firebase/templates';
import { StructuredDocument } from '../../types/document';

export default function TemplateEditor() {
  const router = useRouter();
  const { isAdmin, getTemplates, updateStructuredTemplate } = useAdmin();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (isAdmin) {
      loadTemplates();
    }
  }, [isAdmin]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const loadedTemplates = await getTemplates();
      // Filter for structured templates only
      const structuredTemplates = loadedTemplates.filter(
        template => template.documentType === 'structured' && template.structuredDocument
      );
      setTemplates(structuredTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSave = async (structuredDocument: StructuredDocument) => {
    if (!selectedTemplate) return;

    try {
      setSaveStatus('saving');
      
      const changes = `Updated template with ${structuredDocument.blocks.length} blocks`;
      const success = await updateStructuredTemplate(
        selectedTemplate.id!,
        structuredDocument,
        changes
      );

      if (success) {
        setSaveStatus('saved');
        // Update local state
        setSelectedTemplate({
          ...selectedTemplate,
          structuredDocument: structuredDocument,
          version: (selectedTemplate.version || 1) + 1,
          lastEdited: new Date().toISOString()
        });
        
        // Reload templates to get updated data
        await loadTemplates();
        
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleBack = () => {
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be logged in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
      }}>
        Loading templates...
      </div>
    );
  }

  if (isEditing && selectedTemplate) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
              Editing Template: {selectedTemplate.title}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
              {selectedTemplate.description}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {saveStatus === 'saving' && (
              <span style={{ color: '#007bff', fontSize: '14px' }}>Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span style={{ color: '#28a745', fontSize: '14px' }}>Saved!</span>
            )}
            {saveStatus === 'error' && (
              <span style={{ color: '#dc3545', fontSize: '14px' }}>Save failed</span>
            )}
            <button
              onClick={handleBack}
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
              Back to Templates
            </button>
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <DocumentEditor
            document={selectedTemplate.structuredDocument!}
            onSave={handleSave}
            onExport={() => {}}
            autoSaveInterval={30000} // 30 seconds
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', color: '#333' }}>
            Template Editor
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
            Edit structured document templates
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/template-upload')}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Upload New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px dashed #dee2e6',
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#666' }}>
            No Structured Templates Found
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#666' }}>
            Upload a document to create your first structured template.
          </p>
          <button
            onClick={() => router.push('/admin/template-upload')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Upload Template
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
        }}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onClick={() => handleTemplateSelect(template)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#333',
                  fontWeight: 'bold',
                }}>
                  {template.title}
                </h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}>
                    Structured
                  </span>
                  {template.version && (
                    <span style={{
                      background: '#f3e5f5',
                      color: '#7b1fa2',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}>
                      v{template.version}
                    </span>
                  )}
                </div>
              </div>

              <p style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.4',
              }}>
                {template.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#666',
              }}>
                <span>Category: {template.category}</span>
                <span>
                  {template.structuredDocument?.blocks.length || 0} blocks
                </span>
              </div>

              {template.lastEdited && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666',
                }}>
                  Last edited: {new Date(template.lastEdited).toLocaleDateString()}
                </div>
              )}

              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#666',
              }}>
                <strong>Click to edit</strong> this template using the structured document editor.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
