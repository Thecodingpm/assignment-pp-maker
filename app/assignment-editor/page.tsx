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

const categories = [
  { id: 'all', name: 'All Templates', icon: '📄' },
  { id: 'recent', name: 'Recent', icon: '🕒' },
  { id: 'Basic', name: 'Basic', icon: '📝' },
  { id: 'Academic', name: 'Academic', icon: '🎓' },
  { id: 'Business', name: 'Business', icon: '💼' },
  { id: 'Creative', name: 'Creative', icon: '🎨' },
  { id: 'Resume', name: 'Resume', icon: '👔' },
  { id: 'Newsletter', name: 'Newsletter', icon: '📰' },
  { id: 'Reports', name: 'Reports', icon: '📊' }
];

export default function TemplateSelectionPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
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
          const parsedTemplates = JSON.parse(localTemplates);
          console.log('Assignment Editor: Loaded from localStorage:', parsedTemplates.length);
          setFirebaseTemplates(parsedTemplates);
          setLoading(false);
          return;
        }

        // If no localStorage templates, try Firebase
        try {
          const templates = await getTemplates();
          if (templates && templates.length > 0) {
            console.log('Assignment Editor: Loaded from Firebase:', templates.length);
            setFirebaseTemplates(templates);
          } else {
            console.log('Assignment Editor: No Firebase templates');
            setFirebaseTemplates([]);
          }
        } catch (firebaseError) {
          console.error('Assignment Editor: Firebase error:', firebaseError);
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

  // Generate profile photo based on template name
  const generateProfilePhoto = (templateName: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'];
    const initials = templateName.split(' ').map(word => word[0]).join('').toUpperCase();
    const colorIndex = templateName.length % colors.length;
    
    return (
      <div className={`w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm`}>
        {initials}
      </div>
    );
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Templates header restored without RTL/LTR controls */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Templates</h1>
          {/* Right side intentionally minimal; removed RTL/LTR and other controls */}
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                    selectedCategory === category.id ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-base">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-6">
            {selectedCategory === 'all' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Featured Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {templates.filter(t => t.featured).map((template) => (
                    <div key={template.id} onClick={() => handleTemplateSelect(template.id)} className="group cursor-pointer">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-48 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 group-hover:shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {generateProfilePhoto(template.name)}
                            <span className="text-lg">{template.icon}</span>
                          </div>
                          {template.featured && (<span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded font-medium">Featured</span>)}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{template.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded px-2 py-1 line-clamp-2">{template.preview}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Firebase Templates Section */}
            {firebaseTemplates.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Uploaded Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {firebaseTemplates.map((template) => (
                    <div key={template.id} className="group">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 group-hover:shadow-xl">
                        {/* Front Image or Default Icon */}
                        {template.frontImage ? (
                          <div className="h-24 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <img
                              src={template.frontImage}
                              alt={template.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        ) : (
                          <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <div className="text-white text-2xl font-bold">
                              {template.title?.charAt(0).toUpperCase() || 'T'}
                            </div>
                          </div>
                        )}
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <span className="text-sm">
                                  {template.fileName?.split('.').pop()?.toLowerCase() === 'pptx' || template.fileName?.split('.').pop()?.toLowerCase() === 'ppt' ? '📊' : '📝'}
                                </span>
                              </div>
                            </div>
                            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded font-medium">Uploaded</span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{template.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded px-2 py-1 line-clamp-2 mb-3">{template.content}</div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewTemplate(template);
                              }}
                              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-center py-2 px-3 rounded-lg text-xs font-medium transition-colors border border-gray-300 dark:border-gray-600"
                            >
                              👁️ Preview
                            </button>
                            <button 
                              onClick={() => handleTemplateSelect(template.id!, true)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                            >
                              Use Template
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{selectedCategory === 'all' ? 'All Templates' : `${selectedCategory} Templates`}<span className="text-gray-500 dark:text-gray-400 text-sm font-normal ml-2">({filteredTemplates.length} templates)</span></h2>
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No templates found</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Try adjusting your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} onClick={() => handleTemplateSelect(template.id)} className="group cursor-pointer">
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-48 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 group-hover:shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {generateProfilePhoto(template.name)}
                            <span className="text-lg">{template.icon}</span>
                          </div>
                          {template.featured && (<span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded font-medium">Featured</span>)}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{template.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded px-2 py-1 line-clamp-2">{template.preview}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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