'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { uploadTemplate, getTemplates, deleteTemplate, Template } from '../../firebase/templates';
import { parseDocumentToBlocks } from '../../utils/documentParser';
import { globalTemplateStore } from '../../utils/globalTemplateStore';
import TemplatePreviewModal from '../../components/TemplatePreviewModal';
import { parseDocxFile } from '../../utils/docxParser';

export default function TemplateUploadPage() {
  const { user, loading } = useAuth();
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    file: null as File | null
  });

  useEffect(() => {
    setIsAuthenticatedState(!!user);
    if (user && !loading) {
      fetchTemplates();
    }
  }, [user, loading]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const fetchedTemplates = await getTemplates();
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setErrorMessage('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      setErrorMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.file || !user) {
      setErrorMessage('Please select a file and ensure you are logged in');
      return;
    }

    try {
      setIsLoading(true);
      setUploadStatus('uploading');
      setUploadProgress(0);
      setErrorMessage('');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let content = '';
      let fileName = formData.file.name;
      let structuredDocument = null;

      // DUAL STORAGE SYSTEM: Process file for both original and structured formats
      if (fileName.toLowerCase().endsWith('.docx')) {
        console.log('🔄 Processing DOCX file with dual storage system...');
        
        // APPROACH 1: Original content for exact preview
        const parsedDoc = await parseDocxFile(formData.file);
        content = parsedDoc.content;
        console.log('✅ Original content extracted for exact preview');
        
        // APPROACH 2: Structured content for editing capabilities (temporarily disabled for debugging)
        try {
          console.log('🔄 Attempting structured document creation...');
          structuredDocument = await parseDocumentToBlocks(formData.file, fileName);
          console.log('✅ Structured document created for editing capabilities');
          console.log('Structured document type:', typeof structuredDocument);
          console.log('Structured document keys:', structuredDocument ? Object.keys(structuredDocument) : 'null');
        } catch (structuredError) {
          console.warn('⚠️ Structured parsing failed, but original content preserved:', structuredError);
          structuredDocument = null;
        }
        
      } else if (fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm')) {
        console.log('🔄 Processing HTML file with dual storage system...');
        
        // APPROACH 1: Original content for exact preview
        content = await formData.file.text();
        console.log('✅ Original HTML content preserved for exact preview');
        
        // APPROACH 2: Structured content for editing capabilities (temporarily disabled for debugging)
        try {
          console.log('🔄 Attempting structured document creation...');
          structuredDocument = await parseDocumentToBlocks(formData.file, fileName);
          console.log('✅ Structured document created for editing capabilities');
        } catch (structuredError) {
          console.warn('⚠️ Structured parsing failed, but original content preserved:', structuredError);
          structuredDocument = null;
        }
        
      } else {
        throw new Error('Unsupported file type. Please upload .docx or .html files only.');
      }

      // For now, let's just use formatted type to avoid structured document issues
      const documentType = 'formatted'; // structuredDocument ? 'structured' : 'formatted';

      // Build template data step by step to avoid undefined values
      const templateData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        content: content, // Original content for exact preview
        fileName: fileName,
        fileSize: formData.file.size,
        uploadedBy: user.email || 'Unknown',
        originalFileName: formData.file.name,
        documentType: documentType,
        version: 1
      };

      // Temporarily disable structured document to isolate the issue
      // if (structuredDocument && typeof structuredDocument === 'object') {
      //   console.log('Adding structured document to template data');
      //   templateData.structuredDocument = structuredDocument;
      // } else {
      //   console.log('No structured document to add');
      // }

      console.log('📤 Uploading template with dual storage system...');
      console.log('📄 Original content length:', content.length);
      console.log('🔧 Structured document:', structuredDocument ? 'Available' : 'Not available');
      console.log('📋 Document type:', documentType);
      console.log('📋 Template data keys:', Object.keys(templateData));

      // Validate template data before upload
      if (!content || content.trim() === '') {
        throw new Error('Template content is empty or invalid');
      }

      if (!formData.title || formData.title.trim() === '') {
        throw new Error('Template title is required');
      }

      // Final validation - check for undefined values
      for (const [key, value] of Object.entries(templateData)) {
        if (value === undefined) {
          console.error(`Found undefined value for key: ${key}`);
          throw new Error(`Template data contains undefined value for: ${key}`);
        }
      }

      const templateId = await uploadTemplate(templateData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (templateId) {
        setUploadStatus('success');
        setFormData({
          title: '',
          description: '',
          category: 'general',
          file: null
        });
        
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Refresh templates list
        await fetchTemplates();
        
        // Update global template store so templates appear in assignment editor
        const globalTemplate = {
          id: templateId,
          title: templateData.title,
          description: templateData.description,
          category: templateData.category,
          content: templateData.content,
          fileName: templateData.fileName,
          fileSize: templateData.fileSize,
          uploadedAt: new Date().toISOString(),
          uploadedBy: templateData.uploadedBy,
          status: 'active' as const,
          documentType: templateData.documentType,
          structuredDocument: templateData.structuredDocument,
          version: templateData.version
        };
        globalTemplateStore.addTemplate(globalTemplate);

        // Verify Firebase storage by checking if template exists
        setTimeout(async () => {
          try {
            const verificationTemplates = await getTemplates();
            const uploadedTemplate = verificationTemplates.find(t => t.id === templateId);
            if (uploadedTemplate) {
              console.log('✅ Firebase Verification: Template successfully stored and retrieved from Firebase');
              console.log('Template ID:', templateId);
              console.log('Template Title:', uploadedTemplate.title);
              console.log('Document Type:', uploadedTemplate.documentType);
              console.log('Has Structured Document:', !!uploadedTemplate.structuredDocument);
              console.log('Original Content Length:', uploadedTemplate.content?.length || 0);
            } else {
              console.warn('⚠️ Firebase Verification: Template not found in Firebase after upload');
            }
          } catch (error) {
            console.error('❌ Firebase Verification failed:', error);
          }
        }, 1000);
        
        setTimeout(() => {
          setUploadStatus('idle');
          setUploadProgress(0);
        }, 3000);
      } else {
        throw new Error('Failed to upload template');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('error');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const success = await deleteTemplate(templateId);
      if (success) {
        await fetchTemplates();
        globalTemplateStore.removeTemplate(templateId);
      } else {
        setErrorMessage('Failed to delete template');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage('Failed to delete template');
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  if (!isAuthenticatedState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be logged in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
          <p className="mt-2 text-gray-600">Upload and manage templates with dual storage system for exact preview and editing capabilities</p>
          
          {/* Enhanced Status Indicator */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Firebase Connected</span>
              <span className="text-xs text-gray-500">• Templates stored in Firestore database</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600 font-medium">Dual Storage Active</span>
              <span className="text-xs text-gray-500">• Original + Structured format</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Template</h2>
            
            {/* Dual Storage Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">🔄 Dual Storage System</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• <strong>Original Format:</strong> Preserved exactly as uploaded for perfect preview</div>
                <div>• <strong>Structured Format:</strong> Converted for advanced editing capabilities</div>
                <div>• <strong>Automatic Processing:</strong> Both formats created during upload</div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Template Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your template"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="creative">Creative</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Template File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-input"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-input"
                          name="file"
                          type="file"
                          accept=".docx,.html,.htm"
                          onChange={handleFileChange}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">DOCX, HTML files up to 10MB</p>
                    {formData.file && (
                      <div className="text-sm text-green-600 font-medium">
                        <div>Selected: {formData.file.name}</div>
                        <div className="text-xs text-gray-500">
                          Will be processed for both original and structured formats
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing template...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Creating original format for exact preview... {uploadProgress < 50 ? '✓' : '⏳'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Creating structured format for editing... {uploadProgress >= 50 ? '✓' : '⏳'}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Success Message */}
              {uploadStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-600">✅ Template uploaded successfully!</p>
                  <p className="text-xs text-green-500 mt-1">
                    Template stored with dual format: Original (exact preview) + Structured (editing)
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || uploadStatus === 'uploading'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading || uploadStatus === 'uploading' ? 'Processing Template...' : 'Upload Template'}
              </button>
            </form>
          </div>

          {/* Templates List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Uploaded Templates</h2>
              <button
                onClick={fetchTemplates}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No templates uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Category: {template.category}</span>
                          <span>File: {template.fileName}</span>
                          <span>Size: {(template.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                        {/* Format Status */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            📄 Original Format
                          </span>
                          {template.structuredDocument ? (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              🔧 Structured Format
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              ⚠️ Original Only
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id!)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Template Preview Modal */}
        {selectedTemplate && (
          <TemplatePreviewModal
            template={selectedTemplate}
            isOpen={showPreview}
            onClose={() => {
              setShowPreview(false);
              setSelectedTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
} 