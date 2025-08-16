'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
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
  title?: string;
}

function AssignmentEditorContent() {
  const [documentTitle, setDocumentTitle] = useState('Untitled Assignment');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const [editorKey, setEditorKey] = useState<number>(0);
  const [editor, setEditor] = useState<any>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [userPermission, setUserPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [pages, setPages] = useState<Page[]>([
    { id: '1', content: '', title: 'Page 1' }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

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

  // Add new page function
  const addNewPage = useCallback(() => {
    console.log('Add New Page clicked!'); // Debug log
    const newPageId = (Date.now().toString());
    const newPage: Page = {
      id: newPageId,
      content: '',
      title: `Page ${pages.length + 1}`
    };
    
    // Add new page to the end
    setPages(prevPages => [...prevPages, newPage]);
    
    // Don't increment editorKey to preserve existing content
    // setEditorKey(prev => prev + 1);
  }, [pages.length]);

  // Delete page function
  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) return; // Don't delete the last page
    
    setPageToDelete(pageId);
    setShowDeleteConfirm(true);
  }, [pages.length]);

  // Confirm delete page function
  const confirmDeletePage = useCallback(() => {
    if (!pageToDelete) return;
    
    setPages(prevPages => prevPages.filter(page => page.id !== pageToDelete));
    setShowDeleteConfirm(false);
    setPageToDelete(null);
  }, [pageToDelete]);

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

  // Duplicate page function
  const duplicatePage = useCallback((pageId: string) => {
    const pageToDuplicate = pages.find(page => page.id === pageId);
    if (pageToDuplicate) {
      const newPageId = (Date.now().toString());
      const newPage: Page = {
        id: newPageId,
        content: pageToDuplicate.content,
        title: `${pageToDuplicate.title} (Copy)`
      };
      
      setPages(prevPages => [...prevPages, newPage]);
    }
  }, [pages]);

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

  // Update page title function
  const updatePageTitle = useCallback((pageId: string, newTitle: string) => {
    setPages(prevPages => {
      const newPages = [...prevPages];
      const pageIndex = newPages.findIndex(page => page.id === pageId);
      if (pageIndex !== -1) {
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          title: newTitle
        };
      }
      return newPages;
    });
  }, []);

  // Simple editor input handler
  const handleEditorInput = useCallback(() => {
    // Basic input handling without page restrictions
  }, []);

  // Load document on mount
  useEffect(() => {
    if (!user || !urlParams.templateId) return;

    // If template is selected, load template content
    if (urlParams.templateId && !urlParams.documentId) {
      // Check if it's a Firebase template
      const urlParamsFromWindow = new URLSearchParams(window.location.search);
      const source = urlParamsFromWindow.get('source');
      
      if (source === 'firebase') {
        // Load Firebase template
        const loadFirebaseTemplate = async () => {
          try {
            const firebaseTemplate = await getTemplateById(urlParams.templateId!);
            if (firebaseTemplate && firebaseTemplate.content) {
              setDocumentTitle(firebaseTemplate.title);
              setPages([{
                id: '1',
                content: firebaseTemplate.content,
                title: 'Page 1'
              }]);
            }
          } catch (error) {
            console.error('Error loading Firebase template:', error);
          }
        };
        loadFirebaseTemplate();
        return;
      } else {
        // Load built-in template
        const template = getTemplateContent(urlParams.templateId);
        if (template) {
          setDocumentTitle(template.name);
          setPages([{
            id: '1',
            content: template.content,
            title: 'Page 1'
          }]);
          return;
        }
      }
    }

    // If document ID exists, load existing document
    if (urlParams.documentId) {
      const load = async () => {
          try {
            const doc = await fetchDocument(urlParams.documentId!);
            if (doc) {
              setDocumentTitle(doc.title || 'Untitled Assignment');
              setCurrentDocId(doc.id);
              
              // Parse saved content and reconstruct pages
              if (doc.content && doc.content.trim()) {
                const pageContents = doc.content.split('\n\n--- Page Break ---\n\n');
                const reconstructedPages = pageContents.map((content, index) => ({
                  id: (index + 1).toString(),
                  content: content.trim(),
                  title: `Page ${index + 1}`
                }));
                
                if (reconstructedPages.length > 0) {
                  setPages(reconstructedPages);
                }
              }
            }
          } catch (error) {
            console.error('Error loading document:', error);
          }
      };

      load();
    }
  }, [user, urlParams.documentId, urlParams.templateId]);

  // Auto-save functionality
  const handleSave = async () => {
    if (!urlParams.documentId) return;
    
    setIsSaving(true);
    try {
      // Get content from all pages and combine into a single content string
      const combinedContent = pages.map(page => page.content || '').join('\n\n--- Page Break ---\n\n');
      
      await updateFirebaseDocument(urlParams.documentId, { content: combinedContent });
      setAutoState('saved');
      setTimeout(() => setAutoState('idle'), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setAutoState('idle');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect - save content whenever pages change
  useEffect(() => {
    if (!urlParams.documentId || pages.length === 0) return;
    
    const autoSave = async () => {
      try {
        const combinedContent = pages.map(page => page.content || '').join('\n\n--- Page Break ---\n\n');
        await updateFirebaseDocument(urlParams.documentId!, { content: combinedContent });
        setAutoState('saved');
        setTimeout(() => setAutoState('idle'), 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    };

    // Debounce auto-save to avoid too many API calls
    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [pages, urlParams.documentId]);

  // Handle editor mount
  const handleEditorMount = useCallback((editorInstance: any) => {
    setEditor(editorInstance);
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

  return (
    <>
      <style jsx global>{`
        .editor-content {
          width: 100%;
          min-height: 200mm;
          margin: 0 auto;
          padding: 0;
          box-sizing: border-box;
          line-height: 1.0;
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
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
      `}</style>
      <style jsx>{`
        .page-toolbar button {
          transition: all 0.2s ease;
        }
        .page-toolbar button:hover {
          transform: scale(1.05);
        }
        .editor-content {
          position: relative;
          z-index: 15;
        }
        .page-container {
          position: relative;
          z-index: 15;
        }
        .page-content {
          position: relative;
          z-index: 15;
        }
      `}</style>
      
      <div className="min-h-screen text-gray-900 dark:text-gray-100">

        {/* Main Content */}
        <main className="w-full py-8 relative z-30 isolate main-content-fix" style={{ marginTop: '88px', marginLeft: '80px' }}>
          {/* Toolbar Container - Rendered once for all pages */}
          <ToolbarContainer />
          
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 editor-content">


            {/* Pages Container */}
            <div className="mt-12 space-y-10 relative z-30">
              {pages.map((page, index) => (
                <div key={page.id}>
                  <div className="page-container relative z-30">
                    {/* Page Management Toolbar */}
                    <div className="page-toolbar absolute top-2 right-2 z-50 flex items-center space-x-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
                      <button
                        onClick={() => movePageUp(page.id)}
                        disabled={index === 0}
                        className={`p-1.5 rounded-md transition-colors ${
                          index === 0 
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
                        disabled={index === pages.length - 1}
                        className={`p-1.5 rounded-md transition-colors ${
                          index === pages.length - 1 
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
                        onClick={() => deletePage(page.id)}
                        disabled={pages.length <= 1}
                        className={`p-1.5 rounded-md transition-colors ${
                          pages.length <= 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                        }`}
                        title="Delete page"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => duplicatePage(page.id)}
                        className="p-1.5 rounded-md transition-colors text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        title="Duplicate page"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v12a2 2 0 002 2 2 2 0 002-2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v12a2 2 0 002 2 2 2 0 002-2V9a2 2 0 00-2-2" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="page-content relative z-30 isolate">
                      <LexicalEditor
                        key={`editor-${page.id}`}
                        editorId={`editor-${page.id}`}
                        initialContent={page.content}
                        onChange={handleEditorInput}
                        onEditorMount={handleEditorMount}
                        onContentChange={(content) => handlePageContentChange(content, page.id)}
                      />
                    </div>
                    <div className="page-number">
                      <button
                        onClick={() => {
                          const newTitle = prompt('Enter new page title:', page.title);
                          if (newTitle && newTitle.trim()) {
                            updatePageTitle(page.id, newTitle.trim());
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

            {/* Add New Page Button - At the end of all pages */}
            <div className="flex justify-center mt-8 mb-12">
              <button
                onClick={addNewPage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Page
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

        {/* Custom Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Page</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this page? All content on this page will be permanently removed.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeletePage}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Delete Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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