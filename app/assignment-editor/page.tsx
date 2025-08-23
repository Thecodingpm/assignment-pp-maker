'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { templateContents } from '../data/templates';
import { getTemplates, Template as FirebaseTemplate } from '../firebase/templates';
import { globalTemplateStore } from '../utils/globalTemplateStore';
import TemplatePreviewModal from '../components/TemplatePreviewModal';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  preview: string;
  color: string;
  featured?: boolean;
}

const templates: Template[] = templateContents.map(template => ({
  ...template,
  preview: template.description
}));

// Template categories matching Word's interface
const templateCategories = [
  { id: 'recommended', name: 'Recommended' },
  { id: 'cvs', name: 'CVs' },
  { id: 'invoices', name: 'Invoices' },
  { id: 'papers', name: 'Papers and Reports' },
  { id: 'flyers', name: 'Flyers' },
  { id: 'meeting', name: 'Meeting Notes' },
  { id: 'letters', name: 'Letters' }
];

// Sample templates for Word-like interface
const sampleTemplates = [
  {
    id: '1',
    title: 'JACOB HANCOCK',
    type: 'CV',
    category: 'cvs',
    description: 'Professional CV template with modern design and comprehensive sections',
    fileName: 'jacob-hancock-cv.docx',
    fileSize: 2.1 * 1024 * 1024,
    uploadedAt: new Date('2024-01-15').toISOString(),
    content: 'A clean, professional CV template with modern design and comprehensive sections.',
    uploadedBy: 'admin',
    status: 'active'
  },
  {
    id: '2',
    title: 'Danielle Brasseur',
    type: 'CV',
    category: 'cvs',
    description: 'Minimalist CV template for creative professionals',
    fileName: 'danielle-brasseur-cv.docx',
    fileSize: 1.8 * 1024 * 1024,
    uploadedAt: new Date('2024-01-10').toISOString(),
    content: 'Minimalist CV template with clean design and creative layout.',
    uploadedBy: 'admin',
    status: 'active'
  },
  {
    id: '3',
    title: 'MORGAN CONNORS',
    type: 'CV',
    category: 'cvs',
    description: 'Professional CV template with blue accent design',
    fileName: 'morgan-connors-cv.docx',
    fileSize: 3.2 * 1024 * 1024,
    uploadedAt: new Date('2024-01-08').toISOString(),
    content: 'Professional CV template with blue accent design and modern layout.',
    uploadedBy: 'admin',
    status: 'active'
  },
  {
    id: '4',
    title: 'IAN HANSSON',
    type: 'CV',
    category: 'cvs',
    description: 'Teal and black CV template for executives',
    fileName: 'ian-hansson-cv.docx',
    fileSize: 1.5 * 1024 * 1024,
    uploadedAt: new Date('2024-01-05').toISOString(),
    content: 'Executive CV template with teal and black color scheme.',
    uploadedBy: 'admin',
    status: 'active'
  },
  {
    id: '5',
    title: "Women's Inter-Collegiate Swimming Championship",
    type: 'Flyer',
    category: 'flyers',
    description: 'Sports event flyer with swimmer graphics and wave patterns',
    fileName: 'swimming-championship-flyer.docx',
    fileSize: 2.5 * 1024 * 1024,
    uploadedAt: new Date('2024-01-12').toISOString(),
    content: 'Sports event flyer with dynamic design and athletic imagery.',
    uploadedBy: 'admin',
    status: 'active'
  },
  {
    id: '6',
    title: 'Itai Gerbi',
    type: 'Document',
    category: 'papers',
    description: 'Academic document template for research papers',
    fileName: 'itai-gerbi-paper.docx',
    fileSize: 1.9 * 1024 * 1024,
    uploadedAt: new Date('2024-01-07').toISOString(),
    content: 'Academic document template with proper formatting and structure.',
    uploadedBy: 'admin',
    status: 'active'
  },
  {
    id: '7',
    title: 'CRYSTAL VISIONS',
    type: 'Flyer',
    category: 'flyers',
    description: 'Art exhibition flyer with colorful gradient design',
    fileName: 'crystal-visions-flyer.docx',
    fileSize: 2.8 * 1024 * 1024,
    uploadedAt: new Date('2024-01-03').toISOString(),
    content: 'Art exhibition flyer with colorful gradients and creative design.',
    uploadedBy: 'admin',
    status: 'active'
  }
];

export default function TemplateSelectionPage() {
  const [selectedCategory, setSelectedCategory] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [firebaseTemplates, setFirebaseTemplates] = useState<FirebaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<FirebaseTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();

  // Load templates from global store first, then localStorage, then Firebase
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        console.log('=== LOADING TEMPLATES ===');
        
        // First try to load from global store (where admin uploads are stored for all users)
        const globalTemplates = globalTemplateStore.getTemplates();
        if (globalTemplates && globalTemplates.length > 0) {
          console.log('Assignment Editor: Loaded from global store:', globalTemplates.length);
          setFirebaseTemplates(globalTemplates);
          setLoading(false);
          return;
        }

        // If no global templates, try localStorage
        const localTemplates = localStorage.getItem('localTemplates');
        if (localTemplates) {
          try {
            const parsedTemplates = JSON.parse(localTemplates);
            console.log('Assignment Editor: Loaded from localStorage:', parsedTemplates.length);
            setFirebaseTemplates(parsedTemplates);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('Failed to parse localStorage templates:', parseError);
          }
        }

        // If no localStorage templates, try Firebase
        try {
          console.log('Assignment Editor: Trying Firebase...');
          const templates = await getTemplates();
          if (templates && templates.length > 0) {
            console.log('Assignment Editor: Loaded from Firebase:', templates.length);
            setFirebaseTemplates(templates);
          } else {
            console.log('Assignment Editor: No Firebase templates');
            setFirebaseTemplates([]);
          }
        } catch (firebaseError) {
          console.error('Assignment Editor: Firebase error (likely blocked):', firebaseError);
          console.log('Assignment Editor: Using sample templates as fallback');
          setFirebaseTemplates([]);
        }
      } catch (error) {
        console.error('Assignment Editor: Error loading templates:', error);
        setFirebaseTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string, isFirebaseTemplate: boolean = false) => {
    if (isFirebaseTemplate) {
      router.push(`/assignment-editor/editor?templateId=${templateId}&source=firebase`);
    } else {
      router.push(`/assignment-editor/editor?template=${templateId}`);
    }
  };

  const handlePreviewTemplate = (template: FirebaseTemplate) => {
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
      console.log('Assignment Editor: Global store updated, refreshing templates:', globalTemplates.length);
      setFirebaseTemplates(globalTemplates);
    });

    return unsubscribe;
  }, []);

  // Listen for localStorage changes (when admin uploads new templates)
  useEffect(() => {
    const handleCustomStorageChange = () => {
      const localTemplates = localStorage.getItem('localTemplates');
      if (localTemplates) {
        try {
          const newTemplates = JSON.parse(localTemplates);
          console.log('Assignment Editor: Custom storage event, updating templates:', newTemplates.length);
          setFirebaseTemplates(newTemplates);
        } catch (error) {
          console.error('Assignment Editor: Error parsing custom storage event:', error);
        }
      }
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Use Firebase templates if available, otherwise fall back to samples
  const displayTemplates = firebaseTemplates.length > 0 ? firebaseTemplates : sampleTemplates;

  const filteredTemplates = displayTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'recommended' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    const icons = {
      cvs: '👔',
      invoices: '💰',
      papers: '📄',
      flyers: '📢',
      meeting: '📝',
      letters: '✉️',
      business: '💼',
      academic: '🎓',
      creative: '🎨',
      resume: '👔'
    };
    return icons[category as keyof typeof icons] || '📄';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      cvs: 'bg-red-100 text-red-800',
      invoices: 'bg-green-100 text-green-800',
      papers: 'bg-blue-100 text-blue-800',
      flyers: 'bg-purple-100 text-purple-800',
      meeting: 'bg-yellow-100 text-yellow-800',
      letters: 'bg-indigo-100 text-indigo-800',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Maker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Create with templates
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                Choose from hundreds of professionally designed templates to get started quickly
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Template Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-1 overflow-x-auto pb-2">
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading templates...</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your templates</p>
          </div>
        ) : (
          <div>
            {/* Create Options - Like Word */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Create Blank Document */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Blank document</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Start from scratch</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <button 
                      onClick={() => router.push('/assignment-editor/editor')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>

                {/* Upload File */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Upload file</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Import existing document</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <button 
                      onClick={() => {
                        // Create a file input and trigger upload
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.doc,.docx,.txt,.rtf,.odt';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Handle file upload - you can implement this based on your needs
                            console.log('File selected:', file.name);
                            // For now, just redirect to editor
                            router.push('/assignment-editor/editor');
                          }
                        };
                        input.click();
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Templates</h3>
              {filteredTemplates.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-1">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-xs font-medium text-gray-900 dark:text-white leading-tight">{template.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{template.type}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                            {getCategoryIcon(template.category)} {template.category}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTemplate(template);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                        <button 
                          onClick={() => handleTemplateSelect(template.id!, true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-1.5 px-2 rounded text-xs font-medium transition-colors"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need a Custom Template?</h3>
            <p className="text-blue-100 mb-6">
              Can't find what you're looking for? Contact us to request a custom template or submit your own.
            </p>
            <a
              href="mailto:templates@yourdomain.com?subject=Template Request"
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Request Template
            </a>
          </div>
        </div>
      </main>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        template={previewTemplate}
      />
    </div>
  );
}