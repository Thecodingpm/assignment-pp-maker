'use client';

import React, { useState, useEffect } from 'react';
import { TemplateDefinition, TEMPLATE_CATEGORIES } from '../types/template';
import TemplateRenderer from './TemplateRenderer';

interface TemplateGalleryProps {
  templates: TemplateDefinition[];
  onTemplateSelect?: (template: TemplateDefinition) => void;
  onTemplatePreview?: (template: TemplateDefinition) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  onTemplateSelect,
  onTemplatePreview
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');

  // Filter templates based on category and search
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
        // In a real app, you'd have popularity metrics
        return 0;
      default:
        return 0;
    }
  });

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: TEMPLATE_CATEGORIES.PRESENTATION, name: 'Presentations' },
    { id: TEMPLATE_CATEGORIES.BUSINESS, name: 'Business' },
    { id: TEMPLATE_CATEGORIES.EDUCATION, name: 'Education' },
    { id: TEMPLATE_CATEGORIES.CREATIVE, name: 'Creative' },
    { id: TEMPLATE_CATEGORIES.TECHNICAL, name: 'Technical' },
    { id: TEMPLATE_CATEGORIES.MARKETING, name: 'Marketing' },
    { id: TEMPLATE_CATEGORIES.PERSONAL, name: 'Personal' }
  ];

  return (
    <div className="template-gallery">
      {/* Header with Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Browse Templates ({sortedTemplates.length})
          </h2>
          
          <div className="flex gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {sortedTemplates.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onTemplateSelect?.(template)}
            >
              {/* Template Preview */}
              <div className="relative">
                <TemplateRenderer 
                  template={template} 
                  scale={0.3} 
                  isEditable={false}
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplatePreview?.(template);
                      }}
                      className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                    >
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateSelect?.(template);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    {template.metadata.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {template.dimensions.width}×{template.dimensions.height}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
