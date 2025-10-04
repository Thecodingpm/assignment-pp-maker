'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useAdmin } from '../components/AdminContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import DashboardSidebar from '../components/DashboardSidebar';
import AIGenerationModal from '../components/AIGenerationModal';
import UploadModal from '../components/UploadModal';
import { moveToTrash, restoreDocument, getUserTrashDocuments, createDocument, deleteDocument } from '../firebase/documents';
import professionalTemplates from '../data/professionalDesignTemplates.json';
import cvTemplatesIndex from '../data/cv-templates/index.json';
import rickTangCV from '../data/cv-templates/professional/rick-tang-cv.json';
import minimalistCV from '../data/cv-templates/modern/minimalist-cv.json';
import creativeDesignerCV from '../data/cv-templates/creative/creative-designer-cv.json';
import executiveProfessionalCV from '../data/cv-templates/executive/executive-professional-cv.json';
import techDeveloperCV from '../data/cv-templates/modern/tech-developer-cv.json';

type TabType = 'assignments' | 'presentations' | 'logos' | 'templates' | 'links-overview' | 'recently-deleted' | 'analytics';

export default function DashboardPage() {
  const { user, documents, deleteDocument, moveToTrash, restoreDocument, refreshDocuments, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('presentations');
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [recentlyDeletedDocs, setRecentlyDeletedDocs] = useState<typeof documents>([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isAIGenerationModalOpen, setIsAIGenerationModalOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);

  const fetchRecentlyDeleted = async () => {
    if (!user) return;
    const list = await getUserTrashDocuments(user.id);
    setRecentlyDeletedDocs(list);
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Handle links-overview tab by redirecting to links overview page
  useEffect(() => {
    if (activeTab === 'links-overview') {
      router.push('/links-overview');
    }
  }, [activeTab, router]);

  useEffect(() => {
    if (user && activeTab === 'recently-deleted') {
      fetchRecentlyDeleted();
      setSelected({});
      setSelectAll(false);
    }
  }, [user, activeTab]);


  const getFilteredDocuments = () => {
    if (activeTab === 'recently-deleted') return recentlyDeletedDocs;
    return documents.filter(doc => {
      if (activeTab === 'assignments') return doc.type === 'assignment';
      if (activeTab === 'presentations') return doc.type === 'presentation';
      if (activeTab === 'logos') return doc.type === 'logo';
      return false;
    });
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const openAnalyticsModal = (doc: any) => {
    setSelectedDocument(doc);
    setShowAnalyticsModal(true);
  };

  // Function to optimize content for Firebase size limits
  const optimizeContentForFirebase = async (parsedData: any) => {
    console.log('🗜️ Optimizing content for Firebase...');
    
    // Create a copy of the data
    const optimizedData = { ...parsedData };
    
    // Count total images
    let totalImages = 0;
    if (optimizedData.slides) {
      optimizedData.slides.forEach((slide: any) => {
        if (slide.elements) {
          totalImages += slide.elements.filter((el: any) => el.type === 'image').length;
        }
      });
    }
    console.log('🖼️ Total images found:', totalImages);
    
    // Calculate current size
    const currentSize = new Blob([JSON.stringify(optimizedData)]).size / (1024 * 1024);
    console.log('📊 Current size:', currentSize.toFixed(2), 'MB');
    
    // Only optimize if size is too large (over 1MB)
    if (currentSize > 1.0) {
      console.log('⚠️ Content too large, applying smart optimization...');
      
      // Strategy 1: Compress images more aggressively instead of replacing them
      if (optimizedData.slides) {
        optimizedData.slides = optimizedData.slides.map((slide: any, slideIndex: number) => {
          if (slide.elements) {
            slide.elements = slide.elements.map((element: any) => {
              if (element.type === 'image' && element.src && element.src.startsWith('data:image')) {
                try {
                  // Extract base64 data
                  const base64Data = element.src.split(',')[1];
                  const imageData = atob(base64Data);
                  const imageSize = imageData.length / 1024; // Size in KB
                  
                  // Only compress large images (>50KB)
                  if (imageSize > 50) {
                    console.log(`🗜️ Compressing large image in slide ${slideIndex + 1} (${imageSize.toFixed(1)}KB)`);
                    
                    // Create a smaller placeholder for very large images
                    if (imageSize > 200) {
                      element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      element.alt = 'Image (optimized for size)';
                      console.log(`🔄 Replaced very large image in slide ${slideIndex + 1} with placeholder`);
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ Error processing image:', error);
                }
              }
              return element;
            });
          }
          return slide;
        });
      }
    } else {
      console.log('✅ Content size is acceptable, keeping all images');
    }
    
    return JSON.stringify(optimizedData, null, 0);
  };

  const handleUpload = async (file: File, parsedData: any) => {
    try {
      if (!user) {
        console.error('❌ User not authenticated');
        alert('Please log in to upload presentations.');
        return;
      }

      console.log('📁 Creating document for:', file.name);
      console.log('👤 User ID:', user.id);
      console.log('📄 Parsed data keys:', Object.keys(parsedData));
      console.log('📄 Parsed data title:', parsedData.title);

      // Check content size and optimize if needed
      const contentString = JSON.stringify(parsedData);
      const contentSize = new Blob([contentString]).size;
      console.log('📊 Content size:', contentSize, 'bytes');
      
      let finalContent = contentString;
      
      // If content is too large, optimize it
      if (contentSize > 1000000) { // 1MB limit
        console.log('🗜️ Content too large, optimizing...');
        finalContent = await optimizeContentForFirebase(parsedData);
        const optimizedSize = new Blob([finalContent]).size;
        console.log('📊 Optimized size:', optimizedSize, 'bytes');
      }

      // Create document in Firebase
      console.log('🔥 Attempting to create document in Firebase...');
      const documentId = await createDocument(user.id, {
        title: parsedData.title,
        content: finalContent,
        type: 'presentation',
        isImported: true,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      });

      console.log('✅ Document created with ID:', documentId);
      
      // Refresh documents to show the new one
      console.log('🔄 Refreshing documents list...');
      await refreshDocuments();
      
      console.log('✅ Upload completed successfully!');
      
    } catch (error: any) {
      console.error('❌ Error uploading presentation:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // More specific error messages
      if (error.message.includes('permission')) {
        alert('Permission denied. Please check Firebase security rules.');
      } else if (error.message.includes('network')) {
        alert('Network error. Please check your internet connection.');
      } else {
        alert(`Failed to upload presentation: ${error.message}`);
      }
    }
  };

  const handleDocumentClick = (doc: any) => {
    if (doc.type === 'presentation') {
      // Navigate to presentation editor with the document ID
      router.push(`/presentation-editor?id=${doc.id}`);
    } else if (doc.type === 'assignment') {
      // Navigate to assignment editor
      router.push(`/assignment-editor?id=${doc.id}`);
    } else if (doc.type === 'logo') {
      // Navigate to logo editor
      router.push(`/logo-editor?id=${doc.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, doc: any) => {
    e.stopPropagation(); // Prevent document click
    console.log('🗑️ Delete button clicked for document:', doc.id, doc.title);
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      console.log('🗑️ Deleting document:', documentToDelete.id, 'from tab:', activeTab);
      
      if (activeTab === 'recently-deleted') {
        // Permanent delete from recently deleted
        console.log('🗑️ Permanent delete from recently deleted');
        await deleteDocument(documentToDelete.id);
        await fetchRecentlyDeleted(); // Refresh recently deleted list
      } else {
        // Move to recently deleted (first delete)
        console.log('🗑️ Moving to recently deleted');
        await moveToTrash(documentToDelete.id);
        await refreshDocuments(); // Refresh main list
      }
      
      console.log('✅ Delete operation completed');
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleRestoreDocument = async (doc: any) => {
    try {
      await restoreDocument(doc.id);
      await fetchRecentlyDeleted(); // Refresh recently deleted list
    } catch (error) {
      console.error('Error restoring document:', error);
      alert('Failed to restore document. Please try again.');
    }
  };

  const loadCVTemplate = (templateInfo: any) => {
    try {
      // Map template IDs to imported templates
      const templateMap: { [key: string]: any } = {
        'rick-tang-cv': rickTangCV,
        'minimalist-cv': minimalistCV,
        'creative-designer-cv': creativeDesignerCV,
        'executive-professional-cv': executiveProfessionalCV,
        'tech-developer-cv': techDeveloperCV
      };
      
      return templateMap[templateInfo.id] || null;
    } catch (error) {
      console.error('Error loading CV template:', error);
      return null;
    }
  };

  const handleTemplateClick = (template: any) => {
    try {
      console.log('🎨 Opening template:', template.name);
      
      let templateData = template;
      
      // If it's a CV template, load the actual data
      if (template.file) {
        templateData = loadCVTemplate(template);
        if (!templateData) {
          alert('Failed to load template. Please try again.');
          return;
        }
      }
      
      // Store the template data in localStorage for the editor to pick up
      localStorage.setItem('aiGeneratedPresentation', JSON.stringify(templateData));
      
      // Navigate to the presentation editor
      router.push('/presentation-editor');
    } catch (error) {
      console.error('Error opening template:', error);
      alert('Failed to open template. Please try again.');
    }
  };

  const handleAIGeneration = async (type: 'presentation' | 'logo', prompt: string, options: any, generationMode?: 'single' | 'variations') => {
    try {
      console.log('🤖 AI Generation Request:', { type, prompt, options, generationMode });
      
      if (type === 'presentation') {
        // Use existing AI generation endpoint for presentations
        const response = await fetch('/api/ai-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate presentation');
        }

        const data = await response.json();
        
        // Store the AI-generated data in localStorage
        localStorage.setItem('aiGeneratedPresentation', JSON.stringify(data));
        
        // Navigate to presentation editor
        router.push('/presentation-editor');
      } else if (type === 'logo') {
        // Choose endpoint based on generation mode
        const endpoint = generationMode === 'variations' ? '/api/generate-logo-variations' : '/api/generate-logo';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, options }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate logo');
        }

        const data = await response.json();
        
        // Store the AI-generated logo data in localStorage
        localStorage.setItem('aiGeneratedLogo', JSON.stringify(data));
        
        // Navigate to logo editor
        router.push('/logo-editor');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate content. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const currentDocuments = getFilteredDocuments();

  return (
    <div className="h-screen bg-white flex">
      {/* Left Sidebar - Using separate component */}
      <DashboardSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-8">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'templates' ? 'Templates' : 
               activeTab === 'assignments' ? 'Assignments' :
               activeTab === 'logos' ? 'Logos' :
               activeTab === 'links-overview' ? 'Links Overview' :
               activeTab === 'recently-deleted' ? 'Recently Deleted' :
               activeTab === 'analytics' ? 'Analytics' : 'Recents'}
            </h1>
            
          </div>
          
          {/* Action Buttons - Pitch.com Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

            <Link href="/presentation-editor" className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Start new presentation</h3>
              <p className="text-sm text-gray-600">Start from a template or prompt</p>
            </Link>

            <Link href="/assignment-editor" className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Create new assignment</h3>
              <p className="text-sm text-gray-600">Start a new assignment project</p>
            </Link>

            <Link href="/logo-editor" className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Create new logo</h3>
              <p className="text-sm text-gray-600">Design a professional logo</p>
            </Link>

            <button 
              onClick={() => setIsAIGenerationModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-400 rounded-xl p-6 text-left hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group transform hover:scale-105"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1">AI Generate</h3>
              <p className="text-purple-100 text-sm">Create presentations with AI</p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <p className="text-xs text-purple-200">✨ Describe your idea and AI creates slides</p>
              </div>
            </button>

            <button className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Create new room</h3>
              <p className="text-sm text-gray-600">Set up a space for prospects and clients</p>
            </button>

            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Upload presentation</h3>
              <p className="text-sm text-gray-600">Import PowerPoint files</p>
            </button>
          </div>

          {/* Content Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 border border-gray-200 w-fit">
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-50 text-indigo-700">
              By me
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900">
              By everyone
            </button>
          </div>

          {/* Content Cards Grid - Pitch.com Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Generate Box - Always First (hidden on templates tab) */}
            {activeTab !== 'templates' && (
            <div 
              onClick={() => setIsAIGenerationModalOpen(true)}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl border border-purple-400 overflow-hidden hover:from-purple-600 hover:to-pink-600 transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:shadow-xl relative"
            >
              {/* New Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  NEW
                </span>
              </div>
              
              <div className="aspect-video flex items-center justify-center relative">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI Generate</h3>
                  <p className="text-purple-100 text-sm">Create presentations with AI</p>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-medium text-gray-900 mb-1">AI Presentation Generator</h3>
                <p className="text-sm text-gray-500 mb-2">Powered by OpenAI</p>
                <p className="text-xs text-gray-400">Click to start</p>
              </div>
            </div>
            )}

            {/* Professional Templates Gallery (hidden on templates tab) */}
            {activeTab !== 'templates' && (
            <div 
              onClick={() => router.push('/templates-gallery')}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl border border-blue-400 overflow-hidden hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:shadow-xl relative"
            >
              {/* Premium Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  PREMIUM
                </span>
              </div>
              
              <div className="aspect-video flex items-center justify-center relative">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Professional Templates</h3>
                  <p className="text-blue-100 text-sm">40+ Canva-style designs</p>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-medium text-gray-900 mb-1">Template Gallery</h3>
                <p className="text-sm text-gray-500 mb-2">Business • Startup • Creative • Education</p>
                <p className="text-xs text-gray-400">40+ professional designs</p>
              </div>
            </div>
            )}

            {/* Templates Section */}
            {activeTab === 'templates' && (
              <>
                {/* Template Gallery Link */}
                <div className="col-span-full mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">🎨 Template Gallery</h2>
                    <p className="text-blue-100 mb-4">Browse and use templates created by admins and the community</p>
                    <Link 
                      href="/templates-gallery"
                      className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                      Browse Templates
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* CV Templates Section */}
                <div className="col-span-full mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">📄 CV Templates</h2>
                  <p className="text-gray-600 mb-4">Professional CV templates extracted from Figma - click to edit</p>
                </div>
                
                {cvTemplatesIndex.templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group relative"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      <img 
                        src={template.preview} 
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          CV
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                          NEW
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{template.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                      <p className="text-xs text-gray-400">Click to open in editor</p>
                    </div>
                  </div>
                ))}

                {/* Professional Templates Section */}
                <div className="col-span-full mb-6 mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">🎨 Professional Templates</h2>
                  <p className="text-gray-600 mb-4">Business, creative, and presentation templates</p>
                </div>
                
                {professionalTemplates.templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group relative"
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      <img 
                        src={template.preview} 
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {template.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{template.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                      <p className="text-xs text-gray-400">Click to open in editor</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Documents Section */}
            {activeTab !== 'templates' && currentDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group relative"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    doc.type === 'assignment' ? 'bg-green-100' : 
                    doc.type === 'logo' ? 'bg-purple-100' : 'bg-indigo-100'
                  }`}>
                    <svg className={`w-8 h-8 ${
                      doc.type === 'assignment' ? 'text-green-600' : 
                      doc.type === 'logo' ? 'text-purple-600' : 'text-indigo-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {doc.type === 'logo' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                    </svg>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  {/* Action buttons - only show on hover */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Edit Assignment button for assignment documents */}
                    {doc.type === 'assignment' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/assignment-editor?id=${doc.id}`);
                        }}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center"
                        title="Edit Assignment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Edit Logo button for logo documents */}
                    {doc.type === 'logo' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/logo-editor?id=${doc.id}`);
                        }}
                        className="w-8 h-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center"
                        title="Edit Logo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </button>
                    )}
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteClick(e, doc)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                      title={activeTab === 'recently-deleted' ? 'Delete permanently' : 'Move to recently deleted'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.title || 'Untitled presentation'}</h3>
                  <p className="text-sm text-gray-500 mb-2">In Private</p>
                  <p className="text-xs text-gray-400">Updated {formatDate(doc.createdAt)}</p>
                  
                  {/* Restore button for recently deleted items */}
                  {activeTab === 'recently-deleted' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreDocument(doc);
                      }}
                      className="mt-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full transition-colors"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {/* Empty state for recently deleted */}
            {activeTab === 'recently-deleted' && currentDocuments.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No deleted items</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Your presentations and assignments will appear here after you delete them. 
                  Items will be permanently deleted after 10 days.
                </p>
              </div>
            )}
            
            {/* Demo cards like Pitch.com */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-indigo-100">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Untitled presentation</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 51 minutes ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-green-100">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Untitled room</h3>
                <p className="text-sm text-gray-500 mb-2">In Team</p>
                <p className="text-xs text-gray-400">Updated 52 minutes ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-indigo-100">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Untitled presentation</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
          </div>
        </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Impress every client</h3>
                  </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Wow clients at every step</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Improve collaboration</h3>
                  </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Level up team collaboration</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Enable your sales team</h3>
                      </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                    </div>
                      </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Help sales win more deals</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
                    </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors cursor-pointer group">
              <div className="aspect-video bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <h3 className="text-xl font-bold mb-2">Stay on brand</h3>
                </div>
                <div className="absolute bottom-2 right-2">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">Keep your team on brand</h3>
                <p className="text-sm text-gray-500 mb-2">In Private</p>
                <p className="text-xs text-gray-400">Updated 1 hour ago</p>
            </div>
          </div>
          </div>
          </div>
        </div>

      {/* AI Generation Modal */}
      <AIGenerationModal 
        isOpen={isAIGenerationModalOpen} 
        onClose={() => setIsAIGenerationModalOpen(false)}
        onGenerate={handleAIGeneration}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
                </div>
                <button 
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
          </div>

                <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium text-gray-900 capitalize">{selectedDocument.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedDocument.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && documentToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {activeTab === 'recently-deleted' ? 'Delete Permanently' : 'Move to Recently Deleted'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDocumentToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'recently-deleted' 
                      ? `Are you sure you want to permanently delete "${documentToDelete.title || 'Untitled presentation'}"? This action cannot be undone.`
                      : `Are you sure you want to move "${documentToDelete.title || 'Untitled presentation'}" to recently deleted? You can restore it later from the recently deleted section.`
                    }
                  </p>
                  
                  {activeTab === 'recently-deleted' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-red-700">
                          This will permanently remove the file from Firebase and cannot be recovered.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDocumentToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                      activeTab === 'recently-deleted' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {activeTab === 'recently-deleted' ? 'Delete Permanently' : 'Move to Recently Deleted'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
} 