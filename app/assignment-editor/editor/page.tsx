'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import LexicalEditor from '../../components/LexicalEditor';
import { useAuth } from '../../components/AuthContext';
import { updateDocument as updateFirebaseDocument } from '../../firebase/documents';
import { useRouter } from 'next/navigation';
import { getDocument as fetchDocument } from '../../firebase/documents';
import CollaborationPlugin from '../../components/CollaborationPlugin';
import ToolbarContainer from '../../components/ToolbarContainer';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { getTemplateContent } from '../../data/templates';
import { getTemplateById } from '../../firebase/templates';

interface Page {
  id: string;
  content: string;
  title: string;
}

function AssignmentEditorContent() {
  const [documentTitle, setDocumentTitle] = useState('Untitled Assignment');
  const [pages, setPages] = useState<Page[]>([
    { id: '1', content: '', title: 'Page 1' }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [editor, setEditor] = useState<any>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [userPermission, setUserPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastClickTimeRef = useRef<number>(0);
  const { preserveScroll, restoreScroll } = useScrollPreservation();

  const router = useRouter();
  
  // Get URL parameters safely without useSearchParams
  const [urlParams, setUrlParams] = useState<{
    documentId: string | null;
    templateId: string | null;
    sessionId: string | null;
  }>({ documentId: null, templateId: null, sessionId: null });
  
  const isCollaborateMode = false;

  const { saveDocument, loadDocument, user, loading, refreshDocuments } = useAuth();
  const [autoState, setAutoState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const lastSavedSigRef = useRef<string>('');
  const queuedHtmlRef = useRef<string>('');
  const lastInputAtRef = useRef<number>(0);
  const editorFocusedRef = useRef<boolean>(false);
  const pendingContentRef = useRef<string>('');

  // Get URL parameters once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setUrlParams({
        documentId: searchParams.get('id'),
        templateId: searchParams.get('template'),
        sessionId: searchParams.get('session')
      });
    }
  }, []);



  // Require login: if not logged in, redirect to login with return URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!loading && !user) {
      const url = new URL(window.location.href);
      window.location.href = `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
    }
  }, [user, loading]);

  // Function to handle editor commands
  const handleEditorCommand = useCallback((command: any, payload?: any) => {
    if (editor) {
      editor.dispatchCommand(command, payload);
    }
  }, [editor]);

  const applyDirection = (dir: 'ltr' | 'rtl') => {
    const editorElement = document.querySelector('.lexical-editor') as HTMLElement | null;
    if (editorElement) {
      // Apply direction and visual alignment
      editorElement.setAttribute('dir', dir);
      editorElement.style.direction = dir;
      editorElement.style.textAlign = dir === 'rtl' ? 'right' : 'left';
      // Keep current caret position; just ensure editor has focus
      editorElement.focus();
    }
  };

  // Handle editor mount
  const handleEditorMount = useCallback((editorInstance: any) => {
    setEditor(editorInstance);
  }, []);

  // Handle page content change
  const handlePageContentChange = useCallback((content: string, pageId: string) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      const pageIndex = newPages.findIndex(page => page.id === pageId);
      if (pageIndex !== -1) {
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          content
        };
      }
      return newPages;
    });
  }, []);

  // Add new page function - Fixed to prevent scroll jumping and glitchy behavior
  const addNewPage = useCallback(() => {
    const now = Date.now();
    if (isProcessing || now - lastClickTimeRef.current < 1000) return; // Increased debounce
    
    lastClickTimeRef.current = now;
    setIsProcessing(true);
    
    // Preserve current scroll position
    preserveScroll();
    
    // Preserve current editor state
    const currentEditorState = editor?.getEditorState();
    
    setPages(prevPages => {
      const newPage: Page = {
        id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: '',
        title: `Page ${prevPages.length + 1}`
      };
      return [...prevPages, newPage];
    });
    
    // Set the new page as current
    setCurrentPageIndex(prev => prev + 1);
    
    // Restore scroll position and reset processing state
    setTimeout(() => {
      restoreScroll();
      setIsProcessing(false);
      
      // Ensure editor is properly focused on the new page
      setTimeout(() => {
        const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
        if (editorElement) {
          editorElement.focus();
        }
      }, 100);
    }, 200);
    
    // Show success notification
    setShowNotification('Page added successfully!');
    setTimeout(() => setShowNotification(null), 3000);
  }, [isProcessing, preserveScroll, restoreScroll, editor]);

  // Duplicate page function - Fixed to prevent glitching
  const duplicatePage = useCallback((pageId: string) => {
    // Prevent rapid clicking
    if (isProcessing) return;
    
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1000) return; // Increased debounce
    
    lastClickTimeRef.current = now;
    setIsProcessing(true);
    
    // Preserve current scroll position
    preserveScroll();
    
    setPages(prevPages => {
      const pageToDuplicate = prevPages.find(page => page.id === pageId);
      if (!pageToDuplicate) {
        setIsProcessing(false);
        return prevPages;
      }
      
      const newPage: Page = {
        id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: pageToDuplicate.content,
        title: pageToDuplicate.title.includes('(Copy)') 
          ? `${pageToDuplicate.title} (Copy 2)`
          : `${pageToDuplicate.title} (Copy)`
      };
      
      const duplicateIndex = prevPages.findIndex(page => page.id === pageId);
      const newPages = [...prevPages];
      newPages.splice(duplicateIndex + 1, 0, newPage);
      
      return newPages;
    });
    
    // Set the duplicated page as current
    setCurrentPageIndex(prev => prev + 1);
    
    // Restore scroll position and reset processing state
    setTimeout(() => {
      restoreScroll();
      setIsProcessing(false);
      
      // Ensure editor is properly focused on the duplicated page
      setTimeout(() => {
        const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
        if (editorElement) {
          editorElement.focus();
        }
      }, 100);
    }, 200);
    
    // Show success notification
    setShowNotification('Page duplicated successfully!');
    setTimeout(() => setShowNotification(null), 3000);
  }, [isProcessing, preserveScroll, restoreScroll]);

  // Delete page function
  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) return; // Don't delete the last page
    
    setPages(prevPages => prevPages.filter(page => page.id !== pageId));
  }, [pages.length]);

  // Move page up function
  const movePageUp = useCallback((pageId: string) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      const currentIndex = newPages.findIndex(page => page.id === pageId);
      if (currentIndex > 0) {
        [newPages[currentIndex], newPages[currentIndex - 1]] = [newPages[currentIndex - 1], newPages[currentIndex]];
      }
      return newPages;
    });
  }, []);

  // Move page down function
  const movePageDown = useCallback((pageId: string) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      const currentIndex = newPages.findIndex(page => page.id === pageId);
      if (currentIndex < newPages.length - 1) {
        [newPages[currentIndex], newPages[currentIndex + 1]] = [newPages[currentIndex + 1], newPages[currentIndex]];
      }
      return newPages;
    });
  }, []);

  // Keyboard shortcuts for page management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            addNewPage();
            break;
          case 'd':
            event.preventDefault();
            if (currentPageIndex >= 0 && currentPageIndex < pages.length) {
              duplicatePage(pages[currentPageIndex].id);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addNewPage, duplicatePage, currentPageIndex, pages]);

  // Load document on mount
  useEffect(() => {
    if (!user) return;

    const loadDocument = async () => {
      console.log('=== LOADING DOCUMENT ===');
      console.log('URL params:', urlParams);
      
      // If document ID is provided, load existing document
      if (urlParams.documentId) {
        try {
          const doc = await fetchDocument(urlParams.documentId);
          if (doc && doc.content) {
            console.log('Loading existing document:', doc.title);
            setDocumentTitle(doc.title);
            setPages([{ id: '1', content: doc.content, title: 'Page 1' }]);
          }
        } catch (error) {
          console.error('Error loading document:', error);
        }
      } else if (urlParams.templateId) {
        // If template is selected, load template content
        console.log('Loading template with ID:', urlParams.templateId);
        
        const urlParamsFromWindow = new URLSearchParams(window.location.search);
        const source = urlParamsFromWindow.get('source');
        
        console.log('Template source:', source);
        
        if (source === 'firebase') {
          // Load Firebase template
          try {
            console.log('=== EDITOR: LOADING FIREBASE TEMPLATE ===');
            console.log('Template ID:', urlParams.templateId);
            
            const template = await getTemplateById(urlParams.templateId);
            console.log('Template loaded:', template);
            
            if (template && template.content) {
              console.log('Template content found, length:', template.content.length);
              console.log('Template content preview:', template.content.substring(0, 200) + '...');
              
              // Set the template content
              setPages([{ id: '1', content: template.content, title: 'Page 1' }]);
              setDocumentTitle(template.title || 'Template Document');
              
              console.log('=== EDITOR: TEMPLATE LOADED SUCCESSFULLY ===');
            } else {
              console.error('Template content is empty or missing');
              console.log('Template object:', template);
              // Set a default page if template is empty
              const fallbackContent = `
<h1>Template Not Found</h1>
<p>The template content could not be loaded.</p>
<p>Template ID: ${urlParams.templateId}</p>
<p>Source: ${source}</p>
              `.trim();
              setPages([{ id: '1', content: fallbackContent, title: 'Page 1' }]);
            }
          } catch (error) {
            console.error('Error loading Firebase template:', error);
            // Set a default page on error
            const errorContent = `
<h1>Error Loading Template</h1>
<p>There was an error loading the template content.</p>
<p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
<p>Template ID: ${urlParams.templateId}</p>
            `.trim();
            setPages([{ id: '1', content: errorContent, title: 'Page 1' }]);
          }
        } else {
          // Load local template
          console.log('Loading local template');
          const template = getTemplateContent(urlParams.templateId);
          if (template) {
            console.log('Local template found:', template);
            setPages([{ id: '1', content: template.toString(), title: 'Page 1' }]);
          } else {
            console.log('Local template not found');
            const fallbackContent = `
<h1>Local Template Not Found</h1>
<p>The local template could not be found.</p>
<p>Template ID: ${urlParams.templateId}</p>
            `.trim();
            setPages([{ id: '1', content: fallbackContent, title: 'Page 1' }]);
          }
        }
      } else {
        // No document or template ID, create blank document
        console.log('Creating blank document');
        setPages([{ id: '1', content: '<h1>Untitled Document</h1><p>Start writing your content here...</p>', title: 'Page 1' }]);
      }
    };

    loadDocument();
  }, [user, urlParams.documentId, urlParams.templateId]);

  return (
    <>
      <style jsx global>{`
        .editor-content {
          width: 100%;
          min-height: 200mm;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          line-height: 1.0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .editor-content p {
          margin: 0;
        }
        
        .editor-content h1, .editor-content h2, .editor-content h3, .editor-content h4, .editor-content h5, .editor-content h6 {
          margin: 0.2em 0 0.1em 0;
        }
        
        .lexical-editor {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .editor-container {
          margin: 0 !important;
          padding: 0 !important;
        }

        .page-container {
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 8px;
          margin-bottom: 40px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease-in-out;
          margin-left: 0;
          margin-right: auto;
        }

        .page-container:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .page-content {
          min-height: 297mm;
          padding: 40px;
          background: white;
          position: relative;
          width: 100%;
          height: 100%;
        }

        .page-number {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .page-separator {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
        }

        .page-toolbar {
          opacity: 0;
          transition: opacity 0.2s ease-in-out;
        }

        .page-container:hover .page-toolbar {
          opacity: 1;
        }

        .page-toolbar button {
          transition: all 0.2s ease-in-out;
        }

        .page-toolbar button:hover {
          transform: scale(1.05);
        }

        /* Prevent scroll interference and layout shifts */
        .page-container {
          scroll-behavior: auto;
          contain: layout style;
          transform: translateZ(0); /* Create new stacking context */
        }
        
        /* Prevent focus from interfering with scroll */
        .lexical-editor [contenteditable="true"] {
          scroll-behavior: auto;
          transform: translateZ(0); /* Prevent repaints from affecting scroll */
        }
        
        /* Prevent layout shifts during page operations */
        .pages-list {
          will-change: auto;
        }
        
        /* Prevent any automatic scrolling */
        html, body {
          scroll-behavior: auto !important;
        }
        
        /* Ensure page containers don't cause scroll jumps */
        .page-container {
          scroll-margin-top: 0;
          scroll-margin-bottom: 0;
        }

        /* Notification animations */
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .notification-enter {
          animation: slideInFromTop 0.3s ease-out;
        }
      `}</style>
      
      <div className="min-h-screen text-gray-900 dark:text-gray-100">

        {/* Main Content */}
        <main className="w-full py-8 relative z-30 isolate main-content-fix" style={{ marginTop: '60px', marginLeft: '480px', marginRight: '200px' }}>
          
          {/* Success Notification */}
          {showNotification && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 notification-enter">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {showNotification}
              </div>
            </div>
          )}
          
          {/* Debug Button */}
          <div className="fixed top-24 right-4 z-50">
            <button
              onClick={() => {
                console.log('=== DEBUG INFO ===');
                console.log('Current pages:', pages);
                console.log('Current page index:', currentPageIndex);
                console.log('URL params:', urlParams);
                console.log('Document title:', documentTitle);
                
                if (pages.length > 0) {
                  const currentPage = pages[currentPageIndex];
                  console.log('Current page content:', currentPage.content);
                  console.log('Current page content length:', currentPage.content.length);
                }
                
                // Check editor content
                const editorElement = document.querySelector('.lexical-editor [contenteditable="true"]');
                if (editorElement) {
                  console.log('Editor element found:', editorElement);
                  console.log('Editor innerHTML:', editorElement.innerHTML);
                  console.log('Editor textContent:', editorElement.textContent);
                } else {
                  console.log('Editor element not found');
                }
                
                alert('Debug info logged to console. Check browser console for details.');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Debug Info
            </button>
          </div>
          

          
          {/* Toolbar Container - Rendered once for all pages */}
          <ToolbarContainer />
          
                      <div className="max-w-5xl ml-0 mr-auto px-6 sm:px-8 lg:px-12 editor-content">

            {/* Pages Container */}
            <div className="mt-12 space-y-10 relative z-30 w-full max-w-5xl ml-0">
              {pages.map((page, index) => (
                <div key={page.id} data-page-id={page.id}>
                  <div className="page-container relative z-30">
                    {/* Page Management Toolbar */}
                    <div className="absolute top-2 right-2 z-50 flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                      <button
                        onClick={() => movePageUp(page.id)}
                        disabled={index === 0 || isProcessing}
                        className={`p-1.5 rounded-md transition-colors ${
                          index === 0 || isProcessing
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Move page up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => movePageDown(page.id)}
                        disabled={index === pages.length - 1 || isProcessing}
                        className={`p-1.5 rounded-md transition-colors ${
                          index === pages.length - 1 || isProcessing
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title="Move page down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => duplicatePage(page.id)}
                        disabled={isProcessing}
                        className={`p-1.5 rounded-md transition-colors ${
                          isProcessing 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                        title={isProcessing ? "Processing..." : "Duplicate page"}
                      >
                        {isProcessing ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v12a2 2 0 002 2 2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2 2 2 0 002-2V9a2 2 0 00-2-2" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => deletePage(page.id)}
                        disabled={pages.length <= 1 || isProcessing}
                        className={`p-1.5 rounded-md transition-colors ${
                          pages.length <= 1 || isProcessing
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                        }`}
                        title="Delete page"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="page-content relative z-30 isolate">
                      <LexicalEditor
                        key={`editor-${page.id}`}
                        editorId={`editor-${page.id}`}
                        initialContent={page.content}
                        onChange={() => {}}
                        onEditorMount={handleEditorMount}
                        onContentChange={(content) => handlePageContentChange(content, page.id)}
                      />
                    </div>
                    <div className="page-number">
                      <button
                        onClick={() => {
                          const newTitle = prompt('Enter new page title:', page.title);
                          if (newTitle && newTitle.trim()) {
                            setPages(prevPages => {
                              const newPages = [...prevPages];
                              const pageIndex = newPages.findIndex(p => p.id === page.id);
                              if (pageIndex !== -1) {
                                newPages[pageIndex] = {
                                  ...newPages[pageIndex],
                                  title: newTitle.trim()
                                };
                              }
                              return newPages;
                            });
                          }
                        }}
                        className="hover:bg-gray-100 rounded px-1 py-1 transition-colors cursor-pointer"
                        title="Click to edit page title"
                      >
                        {page.title}
                      </button>
                    </div>
                  </div>
                  {index < pages.length - 1 && (
                    <div className="page-separator">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>Page Break</span>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Page Button */}
            <div className="flex justify-center mt-8 mb-12 w-full">
              <button
                onClick={addNewPage}
                disabled={isProcessing}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg ${
                  isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Page
                  </>
                )}
              </button>
            </div>

            {/* Collaboration Plugin */}
            {showCollaborationPanel && (
              <CollaborationPlugin
                documentId={urlParams.documentId || undefined}
                onCollaborationStateChange={(collaborating) => {
                  setIsCollaborating(collaborating);
                  if (!collaborating) {
                    setUserPermission('view');
                  }
                }}
              />
            )}

          </div>
        </main>

        {/* Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 z-40">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">Assignment Editor</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-semibold">{pages.length} Page{pages.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AssignmentEditor() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssignmentEditorContent />
    </Suspense>
  );
}