'use client';

import React, { useState } from 'react';
import TemplateBrowser from '../components/TemplateBrowser';
import { Template } from '../firebase/templates';
import Link from 'next/link';

const TemplatesPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // Navigate to assignment editor with the selected template
            window.location.href = `/presentation-editor?templateId=${template.id}`;
  };

  const handleTemplatePreview = (template: Template) => {
    // Preview is handled by TemplateBrowser component
    console.log('Template preview requested:', template.title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Template Gallery</h1>
              <p className="mt-2 text-gray-600">
                Browse and select templates with exact formatting preservation
              </p>
            </div>
            
            {/* Admin Link */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin/template-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Template
              </Link>
            </div>
          </div>
          
          {/* Dual Storage System Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  🎯 Perfect Template Preview System
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• <strong>Original Format:</strong> Templates preview exactly as uploaded with perfect formatting</div>
                  <div>• <strong>Structured Format:</strong> Advanced templates support enhanced editing capabilities</div>
                  <div>• <strong>Dual Storage:</strong> Both formats automatically created during upload for maximum compatibility</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Browser */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplateBrowser
          onTemplateSelect={handleTemplateSelect}
          onTemplatePreview={handleTemplatePreview}
          showFormatInfo={true}
        />
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Original Format</h3>
              <p className="text-sm text-gray-600">
                Templates are preserved exactly as uploaded, ensuring perfect formatting, fonts, colors, and layout in the preview.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Structured Format</h3>
              <p className="text-sm text-gray-600">
                Advanced templates include structured data for enhanced editing capabilities, collaborative features, and real-time formatting.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⚡ Dual Storage</h3>
              <p className="text-sm text-gray-600">
                Every template is automatically processed for both formats, providing maximum compatibility and the best user experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage; 