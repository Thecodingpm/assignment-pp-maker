'use client';

import React, { useState, useEffect } from 'react';
import { Template } from '../firebase/templates';
import TemplateRenderer from './TemplateRenderer';
import TemplatePreviewModal from './TemplatePreviewModal';

interface TemplateBrowserProps {
  onTemplateSelect?: (template: Template) => void;
  onTemplatePreview?: (template: Template) => void;
  category?: string;
  limit?: number;
  showFormatInfo?: boolean;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  onTemplateSelect,
  onTemplatePreview,
  category,
  limit: maxLimit = 20,
  showFormatInfo = true
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Filter templates based on category and search term
    let filtered = templates;
    
    if (category && category !== 'all') {
      filtered = filtered.filter(template => template.category === category);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'size':
          return b.fileSize - a.fileSize;
        case 'date':
        default:
          return new Date(b.uploadedAt?.toDate?.() || b.uploadedAt || 0).getTime() - 
                 new Date(a.uploadedAt?.toDate?.() || a.uploadedAt || 0).getTime();
      }
    });
    
    setFilteredTemplates(filtered.slice(0, maxLimit));
  }, [templates, category, searchTerm, sortBy, maxLimit]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        console.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleTemplatePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
    if (onTemplatePreview) {
      onTemplatePreview(template);
    }
  };

  const getFormatBadge = (template: Template) => {
    if (template.structuredDocument) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
            📄 Original
          </span>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
            🔧 Structured
          </span>
        </div>
      );
    } else {
      return (
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          📄 Original Only
        </span>
      );
    }
  };

  const getFileTypeIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.docx')) {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zm2-2V4h6v2H6v12z"/>
        </svg>
      );
    } else if (fileName.toLowerCase().endsWith('.html') || fileName.toLowerCase().endsWith('.htm')) {
      return (
        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6l-4-4H4v16zm2-2V4h6v2H6v12z"/>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 18h12V6l-4-4H4v16zm2-2V4h6v2H6v12z"/>
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
        <p className="text-gray-600">Upload some templates to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'size')}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredTemplates.length} of {templates.length} templates
        </p>
        {showFormatInfo && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
              <span>Original Format</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
              <span>Structured Format</span>
            </div>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border border-gray-200"
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Preview */}
              <div className="relative">
                {/* File Type Badge */}
                <div className="absolute top-2 left-2 z-10">
                  {getFileTypeIcon(template.fileName)}
                </div>
                
                {/* Format Status Badge */}
                {showFormatInfo && (
                  <div className="absolute top-2 right-2 z-10">
                    {getFormatBadge(template)}
                  </div>
                )}
                
                {/* Template Content Preview */}
                <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
                  {template.content ? (
                    <div 
                      className="w-full h-full overflow-hidden text-xs text-gray-600"
                      dangerouslySetInnerHTML={{ 
                        __html: template.content.length > 500 
                          ? template.content.substring(0, 500) + '...' 
                          : template.content 
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No preview available</p>
                    </div>
                  )}
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplatePreview(template);
                      }}
                      className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 shadow-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                  {template.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {template.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {template.category}
                    </span>
                    <span>{(template.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {template.uploadedAt ? 
                        new Date(template.uploadedAt?.toDate?.() || template.uploadedAt).toLocaleDateString() 
                        : 'Unknown date'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
  );
};

export default TemplateBrowser;
