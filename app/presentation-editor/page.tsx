'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PresentationEditor from '../components/PresentationEditor';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../components/AuthContext';
import { updateDocument as updateFirebaseDocument } from '../firebase/documents';
import { getDocument as fetchDocument } from '../firebase/documents';

export default function PresentationEditorPage() {
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const router = useRouter();
  const { saveDocument, user, loading, refreshDocuments } = useAuth();

  // Get document ID from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get('id');
      setDocumentId(id);
      
      // Load existing document if ID is provided
      if (id && user) {
        const loadDocument = async () => {
          try {
            const doc = await fetchDocument(id);
            if (doc) {
              setPresentationTitle(doc.title);
            }
          } catch (error) {
            console.error('Error loading document:', error);
          }
        };
        loadDocument();
      }
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get editor content
      const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
      const content = editorElement ? editorElement.innerHTML : '';
      
      if (!content || content.trim() === '') {
        alert('Please add some content before saving.');
        return;
      }

      if (documentId) {
        // Update existing document
        await updateFirebaseDocument(documentId, {
          title: presentationTitle,
          content: content,
          type: 'presentation'
        });
      } else {
        // Create new document
        const newId = await saveDocument(presentationTitle, content, 'presentation');
        if (newId) {
          setDocumentId(newId);
          // Update URL with new document ID
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('id', newId);
          window.history.replaceState({}, '', newUrl.toString());
        }
      }

      await refreshDocuments();
      alert('Presentation saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save presentation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <input
                type="text"
                value={presentationTitle}
                onChange={(e) => setPresentationTitle(e.target.value)}
                className="text-xl font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 text-gray-900 dark:text-white"
                placeholder="Enter presentation title..."
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* RTL/LTR Controls */}
              <div className="hidden md:flex items-center space-x-1 mr-2">
                <button
                  className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                  title="Left-to-Right"
                  onClick={() => {
                    const editorElement = document.querySelector('.lexical-editor') as HTMLElement | null;
                    if (editorElement) {
                      editorElement.dir = 'ltr';
                      editorElement.style.textAlign = 'left';
                    }
                  }}
                >
                  LTR
                </button>
                <button
                  className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                  title="Right-to-Left"
                  onClick={() => {
                    const editorElement = document.querySelector('.lexical-editor') as HTMLElement | null;
                    if (editorElement) {
                      editorElement.dir = 'rtl';
                      editorElement.style.textAlign = 'right';
                    }
                  }}
                >
                  RTL
                </button>
              </div>

              <ThemeToggle />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span>Save</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PresentationEditor />
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span>Ready • Use Ctrl+Click to select multiple slides</span>
          <span>Slide 1 of 1 • Press ← → to navigate</span>
        </div>
      </div>
    </div>
  );
} 