'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
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
  const [showNewTemplatesNotification, setShowNewTemplatesNotification] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<Array<{
    id: string;
    title: string;
    lastOpened: Date;
    type: 'template' | 'document';
  }>>([]);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (authLoading) {
      return '...';
    }
    if (user?.name) {
      return user.name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'G';
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (authLoading) {
      return '...';
    }
    if (user?.name) {
      return user.name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Guest';
  };

  // Sync templates from Firebase to global store
  const syncTemplatesFromFirebase = async () => {
    try {
      console.log('Assignment Editor: Syncing templates from Firebase to global store...');
      const templates = await getTemplates();
      if (templates && templates.length > 0) {
        templates.forEach(template => {
          const globalTemplate = {
            id: template.id || '',
            title: template.title,
            description: template.description,
            category: template.category,
            content: template.content,
            fileName: template.fileName,
            fileSize: template.fileSize,
            uploadedAt: template.uploadedAt,
            uploadedBy: template.uploadedBy,
            status: template.status,
            documentType: template.documentType,
            structuredDocument: template.structuredDocument,
            version: template.version
          };
          globalTemplateStore.addTemplate(globalTemplate);
        });
        console.log('Assignment Editor: Synced', templates.length, 'templates to global store');
      }
    } catch (error) {
      console.error('Assignment Editor: Error syncing templates:', error);
    }
  };

  // Load templates from global store first, then localStorage, then Firebase
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        console.log('=== LOADING TEMPLATES FOR ASSIGNMENT EDITOR ===');
        
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
            
            // Also add Firebase templates to global store for future use
            templates.forEach(template => {
              const globalTemplate = {
                id: template.id || '',
                title: template.title,
                description: template.description,
                category: template.category,
                content: template.content,
                fileName: template.fileName,
                fileSize: template.fileSize,
                uploadedAt: template.uploadedAt,
                uploadedBy: template.uploadedBy,
                status: template.status,
                documentType: template.documentType,
                structuredDocument: template.structuredDocument,
                version: template.version
              };
              globalTemplateStore.addTemplate(globalTemplate);
            });
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
    
    // Also sync templates from Firebase to global store
    syncTemplatesFromFirebase();
  }, []);

  // Load recent documents from localStorage
  const loadRecentDocuments = () => {
    try {
      const stored = localStorage.getItem('recentDocuments');
      if (stored) {
        const recent = JSON.parse(stored);
        setRecentDocuments(recent.map((doc: any) => ({
          ...doc,
          lastOpened: new Date(doc.lastOpened)
        })));
      }
    } catch (error) {
      console.error('Error loading recent documents:', error);
    }
  };

  // Add document to recent list
  const addToRecentDocuments = (doc: { id: string; title: string; type: 'template' | 'document' }) => {
    try {
      const recent = recentDocuments.filter(d => d.id !== doc.id);
      const newRecent = [
        { ...doc, lastOpened: new Date() },
        ...recent.slice(0, 2) // Keep only 3 most recent
      ];
      setRecentDocuments(newRecent);
      localStorage.setItem('recentDocuments', JSON.stringify(newRecent));
    } catch (error) {
      console.error('Error saving recent documents:', error);
    }
  };

  // Load recent documents on mount
  useEffect(() => {
    loadRecentDocuments();
  }, []);

  const handleTemplateSelect = (templateId: string, isFirebaseTemplate: boolean = false, documentType: 'template' | 'document' = 'template') => {
    // Add to recent documents
    const template = firebaseTemplates.find(t => t.id === templateId) || 
                    sampleTemplates.find(t => t.id === templateId);
    
    if (template) {
      addToRecentDocuments({
        id: templateId,
        title: template.title,
        type: documentType
      });
    }

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
      
      // Show notification for new templates
      if (globalTemplates.length > 0) {
        setShowNewTemplatesNotification(true);
        // Auto-hide notification after 5 seconds
        setTimeout(() => setShowNewTemplatesNotification(false), 5000);
      }
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
      cvs: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      invoices: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      papers: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      flyers: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      meeting: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      letters: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      business: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      academic: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      creative: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      resume: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="relative z-10">
            <h1 className="text-3xl font-semibold text-blue-600 mb-6">
              Welcome, {getUserDisplayName()}!
            </h1>
            <div className="flex items-center space-x-4 mb-8">
              <button 
                onClick={() => {
                  addToRecentDocuments({
                    id: 'blank-document',
                    title: 'Blank Document',
                    type: 'document'
                  });
                  router.push('/assignment-editor/editor');
                }}
                className="flex items-center space-x-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Create blank document</span>
              </button>
              <button 
                onClick={() => {
                  // Create a file input and trigger upload
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.doc,.docx,.txt,.rtf,.odt';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      addToRecentDocuments({
                        id: `uploaded-${Date.now()}`,
                        title: file.name,
                        type: 'document'
                      });
                      console.log('File selected:', file.name);
                      router.push('/assignment-editor/editor');
                    }
                  };
                  input.click();
                }}
                className="flex items-center space-x-3 bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload a file</span>
              </button>
            </div>
          </div>
        </div>

        {/* Jump back in Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Jump back in</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocuments.map((doc, index) => (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Last opened {new Date(doc.lastOpened).toLocaleDateString()}</p>
                <p className="font-medium text-gray-900 mb-3">{doc.title}</p>
                <button 
                  onClick={() => handleTemplateSelect(doc.id, doc.type === 'document')}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium">Open in Editor</span>
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 3 - recentDocuments.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 border-dashed">
                <div className="text-center text-gray-400">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm">No recent documents</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create with templates Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create with templates</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Template Categories */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6">
            {templateCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading templates...</h3>
              <p className="text-gray-600">Please wait while we fetch your templates</p>
            </div>
          ) : (
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-[4/3] bg-gray-50 relative">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">{template.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{template.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                                              <button 
                          onClick={() => handleTemplateSelect(template.id!, true, 'template')}
                          className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Use template
                        </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredTemplates.length > 0 && (
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* My documents Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My documents</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by name or person"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                <div>Name</div>
                <div>Opened</div>
                <div>Owner</div>
              </div>
            </div>
            <div className="p-6 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No documents yet</p>
              <p className="text-sm">Create your first document to get started</p>
            </div>
          </div>
        </div>
      </main>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={isPreviewOpen}
          onClose={closePreview}
          template={previewTemplate}
        />
      )}
    </div>
  );
}