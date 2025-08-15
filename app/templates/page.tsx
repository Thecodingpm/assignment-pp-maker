'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTemplates, Template } from '../firebase/templates';
import { globalTemplateStore } from '../utils/globalTemplateStore';
import TemplatePreviewModal from '../components/TemplatePreviewModal';

// Template interface is now imported from Firebase

export default function PublicTemplateLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'category'>('date');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load templates from global store first, then localStorage, then Firebase
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // First try to load from global store (where admin uploads are stored for all users)
        const globalTemplates = globalTemplateStore.getTemplates();
        if (globalTemplates && globalTemplates.length > 0) {
          console.log('Public Templates: Loaded from global store:', globalTemplates.length);
          setTemplates(globalTemplates);
          setLoading(false);
          return;
        }

        // If no global templates, try localStorage
        const localTemplates = localStorage.getItem('localTemplates');
        if (localTemplates) {
          const parsedTemplates = JSON.parse(localTemplates);
          console.log('Public Templates: Loaded from localStorage:', parsedTemplates.length);
          setTemplates(parsedTemplates);
          setLoading(false);
          return;
        }

        // If no localStorage templates, try Firebase
        try {
          const firebaseTemplates = await getTemplates();
          if (firebaseTemplates && firebaseTemplates.length > 0) {
            console.log('Public Templates: Loaded from Firebase:', firebaseTemplates.length);
            setTemplates(firebaseTemplates);
          } else {
            console.log('Public Templates: No Firebase templates, using samples');
            setTemplates([]);
          }
        } catch (firebaseError) {
          console.error('Public Templates: Firebase error:', firebaseError);
          setTemplates([]);
        }
      } catch (error) {
        console.error('Public Templates: Error loading templates:', error);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Sample templates for fallback (when no Firebase templates exist)
  const sampleTemplates: Template[] = [
    {
      id: '1',
      title: 'Modern Business Proposal',
      category: 'business',
      description: 'Professional business proposal template with modern design and comprehensive sections',
      fileName: 'business-proposal.docx',
      fileSize: 2.1 * 1024 * 1024,
      uploadedAt: new Date('2024-01-15').toISOString(),
      content: 'A clean, professional business proposal template with executive summary, problem statement, solution, and pricing sections.',
      uploadedBy: 'admin',
      status: 'active'
    },
    {
      id: '2',
      title: 'Academic Research Paper',
      category: 'academic',
      description: 'Complete research paper template with proper academic formatting and structure',
      fileName: 'research-paper.docx',
      fileSize: 1.8 * 1024 * 1024,
      uploadedAt: new Date('2024-01-10').toISOString(),
      content: 'Academic research paper template with title page, abstract, introduction, methodology, results, discussion, and references.',
      uploadedBy: 'admin',
      status: 'active'
    },
    {
      id: '3',
      title: 'Creative Portfolio Presentation',
      category: 'presentation',
      description: 'Eye-catching portfolio presentation template for creative professionals',
      fileName: 'portfolio.pptx',
      fileSize: 3.2 * 1024 * 1024,
      uploadedAt: new Date('2024-01-08').toISOString(),
      content: 'Modern portfolio presentation with creative layouts, image placeholders, and smooth transitions.',
      uploadedBy: 'admin',
      status: 'active'
    },
    {
      id: '4',
      title: 'Professional Resume Template',
      category: 'resume',
      description: 'Clean and professional resume template for job applications',
      fileName: 'resume.docx',
      fileSize: 1.5 * 1024 * 1024,
      uploadedAt: new Date('2024-01-05').toISOString(),
      content: 'Professional resume template with contact information, summary, experience, education, and skills sections.',
      uploadedBy: 'admin',
      status: 'active'
    }
  ];

  // Use Firebase templates if available, otherwise fall back to samples
  const displayTemplates = templates.length > 0 ? templates : sampleTemplates;

  // Template action handlers
  const handleTemplateClick = (template: Template) => {
    // Navigate to the assignment editor with the selected template
    router.push(`/assignment-editor/editor?templateId=${template.id}&source=firebase`);
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewTemplate(null);
  };

  // Listen for global store changes (when admin uploads new templates)
  useEffect(() => {
    const unsubscribe = globalTemplateStore.addListener(() => {
      const globalTemplates = globalTemplateStore.getTemplates();
      console.log('Public Templates: Global store updated, refreshing templates:', globalTemplates.length);
      setTemplates(globalTemplates);
    });

    return unsubscribe;
  }, []);

  // Listen for localStorage changes (when admin uploads new templates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'localTemplates' && e.newValue) {
        try {
          const newTemplates = JSON.parse(e.newValue);
          console.log('Public Templates: Storage changed, updating templates:', newTemplates.length);
          setTemplates(newTemplates);
        } catch (error) {
          console.error('Public Templates: Error parsing storage change:', error);
        }
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (same tab)
    const handleCustomStorageChange = () => {
      const localTemplates = localStorage.getItem('localTemplates');
      if (localTemplates) {
        try {
          const newTemplates = JSON.parse(localTemplates);
          console.log('Public Templates: Custom storage event, updating templates:', newTemplates.length);
          setTemplates(newTemplates);
        } catch (error) {
          console.error('Public Templates: Error parsing custom storage event:', error);
        }
      }
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📄', count: displayTemplates.length },
    { id: 'assignment', name: 'Assignment', icon: '📝', count: displayTemplates.filter(t => t.category === 'assignment').length },
    { id: 'presentation', name: 'Presentation', icon: '📊', count: displayTemplates.filter(t => t.category === 'presentation').length },
    { id: 'business', name: 'Business', icon: '💼', count: displayTemplates.filter(t => t.category === 'business').length },
    { id: 'academic', name: 'Academic', icon: '🎓', count: displayTemplates.filter(t => t.category === 'academic').length },
    { id: 'creative', name: 'Creative', icon: '🎨', count: displayTemplates.filter(t => t.category === 'creative').length },
    { id: 'resume', name: 'Resume', icon: '👔', count: displayTemplates.filter(t => t.category === 'resume').length }
  ];

  const filteredTemplates = displayTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const getCategoryIcon = (category: string) => {
    return categories.find(c => c.id === category)?.icon || '📄';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      assignment: 'bg-blue-100 text-blue-800',
      presentation: 'bg-purple-100 text-purple-800',
      business: 'bg-green-100 text-green-800',
      academic: 'bg-indigo-100 text-indigo-800',
      creative: 'bg-pink-100 text-pink-800',
      resume: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Template Library</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Professional templates for assignments, presentations, and documents
            </p>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Have a template to share? Email us at{' '}
              <a href="mailto:templates@yourdomain.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                templates@yourdomain.com
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-w-[300px]"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="downloads">Sort by Downloads</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{category.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading templates...</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your templates</p>
          </div>
        ) : sortedTemplates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or category filter</p>
          </div>
        ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedTemplates.map((template) => (
                <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Front Image or Default Icon */}
                  {template.frontImage ? (
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={template.frontImage}
                        alt={template.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-4xl font-bold">
                        {template.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    {/* Template Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-sm">
                          {template.fileName?.split('.').pop()?.toLowerCase() === 'pptx' || template.fileName?.split('.').pop()?.toLowerCase() === 'ppt' ? '📊' : '📝'}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                        {getCategoryIcon(template.category)} {template.category}
                      </span>
                    </div>

                    {/* Template Info */}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {template.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Template Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>{template.fileName?.split('.').pop()?.toUpperCase() || 'UNKNOWN'}</span>
                      <span>{template.fileSize ? (template.fileSize / 1024 / 1024).toFixed(1) + 'MB' : 'Unknown'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handlePreviewTemplate(template)}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-center py-2 px-3 rounded-lg text-xs font-medium transition-colors border border-gray-300 dark:border-gray-600"
                      >
                        👁️ Preview
                      </button>
                      <button 
                        onClick={() => handleTemplateClick(template)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Have a Great Template?</h3>
            <p className="text-blue-100 mb-6">
              Share your professional templates with our community and help others create amazing documents.
            </p>
            <a
              href="mailto:templates@yourdomain.com?subject=Template Submission"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Submit Template
            </a>
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        template={previewTemplate}
      />
    </div>
  );
} 