'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import CollaborationPlugin from './CollaborationPlugin';
import InvitePanel from './InvitePanel';
import dynamic from 'next/dynamic';
const LanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), { ssr: false });
import { useAuth } from './AuthContext';
import { useAdmin } from './AdminContext';
import { updateDocument as updateFirebaseDocument } from '../firebase/documents';

function Navbar() {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentId, setDocumentId] = useState<string>('');
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedContent, setLastSavedContent] = useState<string>('');
  const [lastSavedTitle, setLastSavedTitle] = useState<string>('');
  const [lastSig, setLastSig] = useState<number>(0);
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>('ltr');
  const pathname = usePathname();
  const router = useRouter();

  const { saveDocument, user, logout, refreshDocuments } = useAuth();
  const { isAdmin, logoutAdmin } = useAdmin();

  // Check if we're on an editor page
  const isEditorPage = pathname?.includes('/presentation-editor');
  const searchParams = useSearchParams();

  // Helper function to find all text nodes in the editor
  const findTextNodes = (element: HTMLElement): Text[] => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Text | null;
    while (node = walker.nextNode() as Text | null) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node);
      }
    }
    
    return textNodes;
  };

  const applyDirection = (dir: 'ltr' | 'rtl') => {
    const editorElement = document.querySelector('.lexical-editor') as HTMLElement | null;
    if (editorElement) {
      // Apply direction and visual alignment
      editorElement.setAttribute('dir', dir);
      editorElement.style.direction = dir;
      editorElement.style.textAlign = dir === 'rtl' ? 'right' : 'left';
      
      // Handle cursor positioning for RTL/LTR - Immediate approach
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection) {
          // Clear any existing selection
          selection.removeAllRanges();
          
          // Find the contenteditable element
          const contentEditable = editorElement.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            const range = document.createRange();
            
            if (dir === 'rtl') {
              // For RTL, place cursor at the end
              range.selectNodeContents(contentEditable);
              range.collapse(false); // false = collapse to end
            } else {
              // For LTR, place cursor at the beginning
              range.selectNodeContents(contentEditable);
              range.collapse(true); // true = collapse to start
            }
            
            selection.addRange(range);
            
            // Force focus and ensure cursor is visible
            contentEditable.focus();
            
            // Force cursor to blink by triggering a focus event
            contentEditable.dispatchEvent(new Event('focus', { bubbles: true }));
            
            // Additional focus trigger
            contentEditable.click();
          }
        }
      }, 100); // Small delay to ensure DOM updates are complete
    }
    setTextDirection(dir);
  };

  useEffect(() => {
    // Prefer URL id; do not carry-over title when starting fresh
    try {
      const qid = searchParams?.get('id');
      if (qid) {
        setDocumentId(qid);
      } else {
        setDocumentId('');
        setDocumentTitle('Untitled Document');
      }
    } catch {}
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      if (y > lastY + 10) setHideOnScroll(true);
      else if (y < lastY - 10) setHideOnScroll(false);
      setLastY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get content from any textarea or contenteditable elements
      let allContent = '';
      const textareas = document.querySelectorAll('textarea');
      const contentEditables = document.querySelectorAll('[contenteditable="true"]');
      
      if (textareas.length > 0) {
        allContent = Array.from(textareas).map(ta => ta.value).join('\n\n');
      } else if (contentEditables.length > 0) {
        allContent = Array.from(contentEditables).map(ce => ce.textContent || '').join('\n\n');
      }
      
      if (!allContent || allContent.trim() === '') {
        alert('Please add some content before saving.');
        return;
      }
      
      if (documentId) {
        await updateFirebaseDocument(documentId, { title: documentTitle, content: allContent, type: 'assignment' });
        console.log('Document updated successfully');
      } else {
        const newId = await saveDocument(documentTitle, allContent, 'assignment');
        if (newId) {
          setDocumentId(newId);
          try { localStorage.setItem('dm_current_doc_id', newId); } catch {}
          // Update URL with new document ID
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('id', newId);
          window.history.replaceState({}, '', newUrl.toString());
          console.log('New document created with ID:', newId);
        }
      }
      
      try { await refreshDocuments(); } catch {}
      setLastSavedContent(allContent);
      setLastSavedTitle(documentTitle);
      
      // Show success feedback
      setAutoSaveState('saved');
      setTimeout(() => setAutoSaveState('idle'), 2000);
      
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Autosave disabled in Navbar

  const shareDocument = () => {
    if (navigator.share) {
      navigator.share({
        title: documentTitle || 'Document',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    setShowAccountMenu(false);
  };

  // Monitor content changes to update export button state
  useEffect(() => {
    if (!isEditorPage) return;
    
    const checkContent = () => {
      // Force re-render to update button state
      setShowExportMenu(false);
    };
    
    // Check content every 2 seconds when on editor page
    const interval = setInterval(checkContent, 2000);
    
    // Also check when user types (debounced)
    const handleInput = debounce(checkContent, 500);
    document.addEventListener('input', handleInput);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('input', handleInput);
    };
  }, [isEditorPage]);

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Check if there's content to export
  const hasContentToExport = useCallback(() => {
    console.log('Checking for content to export...');
    
    // Method 1: Check for lexical-editor elements
    const editorElements = document.querySelectorAll('.lexical-editor') as NodeListOf<HTMLElement>;
    console.log('Found .lexical-editor elements:', editorElements.length);
    
    if (editorElements && editorElements.length > 0) {
      for (let i = 0; i < editorElements.length; i++) {
        const editorElement = editorElements[i];
        const content = editorElement.innerHTML;
        console.log(`Editor ${i} HTML content length:`, content.length);
        
        if (content && content.trim()) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          const pageText = tempDiv.textContent || tempDiv.innerText || '';
          const cleanText = pageText.replace(/\s+/g, ' ').trim();
          console.log(`Editor ${i} clean text: "${cleanText}" (length: ${cleanText.length})`);
          
          if (cleanText && cleanText.length > 0) {
            console.log('Content found in editor element');
            return true;
          }
        }
      }
    }
    
    // Method 2: Check for contenteditable elements
    const contentEditableElements = document.querySelectorAll('[contenteditable="true"]') as NodeListOf<HTMLElement>;
    console.log('Found contenteditable elements:', contentEditableElements.length);
    
    for (let i = 0; i < contentEditableElements.length; i++) {
      const element = contentEditableElements[i];
      const textContent = element.textContent || element.innerText || '';
      const cleanText = textContent.replace(/\s+/g, ' ').trim();
      console.log(`Contenteditable ${i} text: "${cleanText}" (length: ${cleanText.length})`);
      
      if (cleanText && cleanText.length > 0) {
        console.log('Content found in contenteditable element');
        return true;
      }
    }
    
    // Method 3: Check for any text content in the document
    const allText = document.body.textContent || document.body.innerText || '';
    const cleanAllText = allText.replace(/\s+/g, ' ').trim();
    console.log('All document text length:', cleanAllText.length);
    
    if (cleanAllText.length > 100) { // If there's substantial text content
      console.log('Substantial text content found in document');
      return true;
    }
    
    console.log('No content found for export');
    return false;
  }, []);

  // Close dropdowns when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.export-menu') && !target.closest('.account-menu') && !target.closest('.team-menu')) {
      setShowExportMenu(false);
      setShowAccountMenu(false);
      setShowTeamMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const doExport = useCallback(async (format: string) => {
    // Get all lexical editors on the page (for multi-page documents)
    const editorElements = document.querySelectorAll('.lexical-editor') as NodeListOf<HTMLElement>;
    console.log('Found editor elements:', editorElements.length);
    
    if (!editorElements || editorElements.length === 0) { 
      alert('No content to export.'); 
      return; 
    }

    // Collect content from all pages
    let allContent = '';
    let allTextContent = '';
    let hasActualContent = false;
    
    editorElements.forEach((editorElement, index) => {
      const content = editorElement.innerHTML;
      console.log(`Editor ${index} content:`, content);
      
      if (content && content.trim()) {
        // Check if there's actual text content (not just HTML structure)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const pageText = tempDiv.textContent || tempDiv.innerText || '';
        const cleanText = pageText.replace(/\s+/g, ' ').trim();
        
        console.log(`Editor ${index} text content:`, cleanText);
        
        if (cleanText && cleanText.length > 0) {
          hasActualContent = true;
          
          // Add page separator if not the first page
          if (index > 0) {
            allContent += '<div style="page-break-before: always; margin-top: 40px; border-top: 2px solid #e5e7eb; padding-top: 20px;"></div>';
            allTextContent += '\n\n--- Page Break ---\n\n';
          }
          
          allContent += content;
          allTextContent += cleanText;
        }
      }
    });

    console.log('Has actual content:', hasActualContent);
    console.log('All content length:', allContent.length);
    console.log('All text content length:', allTextContent.length);

    if (!hasActualContent || !allContent || allContent.trim() === '' || allTextContent.trim() === '') { 
      alert('Please add some content before exporting.'); 
      return; 
    }

    const download = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      // Safe removal with error handling
      try {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
      } catch (error) {
        console.warn('Could not remove download link:', error);
      }
      URL.revokeObjectURL(url);
    };

    try {
      if (format === 'pdf') {
        const html2pdf = (await import('html2pdf.js')).default;
        const pdfContainer = document.createElement('div');
        pdfContainer.style.padding = '24px';
        pdfContainer.style.fontFamily = 'Inter, Arial, sans-serif';
        pdfContainer.style.lineHeight = '1.6';
        pdfContainer.style.color = '#000';
        pdfContainer.innerHTML = allContent;
        
        const opt = {
          margin: 0.5,
          filename: `${documentTitle || 'document'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        html2pdf().from(pdfContainer).set(opt).save();
      } else if (format === 'png') {
        // For PNG, we'll export the first page as a representative image
        const firstEditor = editorElements[0];
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(firstEditor, { 
          useCORS: true, 
          logging: false,
          background: '#ffffff',
          allowTaint: true,
          width: firstEditor.offsetWidth * 2,
          height: firstEditor.offsetHeight * 2
        });
        canvas.toBlob((blob) => { 
          if (blob) download(blob, `${documentTitle || 'document'}.png`); 
        }, 'image/png');
      } else if (format === 'md') {
        download(new Blob([allTextContent], { type: 'text/markdown' }), `${documentTitle || 'document'}.md`);
      } else if (format === 'docx') {
        download(new Blob([allTextContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), `${documentTitle || 'document'}.docx`);
      } else if (format === 'html') {
        download(new Blob([allContent], { type: 'text/html' }), `${documentTitle || 'document'}.html`);
      } else if (format === 'txt') {
        download(new Blob([allTextContent], { type: 'text/plain' }), `${documentTitle || 'document'}.txt`);
      } else if (format === 'epub') {
        // EPUB export temporarily disabled due to Node.js dependencies
        alert('EPUB export is temporarily unavailable. Please use PDF or other formats.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    }
    
    setShowExportMenu(false);
  }, [documentTitle]);

  return (
    <nav className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-50 shadow-lg transform transition-transform duration-300 ${hideOnScroll ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 md:py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span>Document Maker</span>
          </Link>

          {!isEditorPage ? (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Dashboard</Link>
              <Link href="/templates" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Templates</Link>
              <Link href="/presentation-demo" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Presentation Editor</Link>

              {isAdmin ? (
                <Link href="/admin/template-upload" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Admin Panel</Link>
              ) : (
                <Link href="/admin/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Admin</Link>
              )}
              <Link href="/about" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">About</Link>
              <Link href="/contact" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contact</Link>
            </div>
          ) : (
            <div className="flex-1 max-w-md md:max-w-lg mx-2 md:mx-8">
              <input type="text" value={documentTitle} onChange={(e) => { setDocumentTitle(e.target.value); try { localStorage.setItem('dm_current_title', e.target.value); } catch {} }} placeholder="Untitled Document" className="w-full px-4 py-2 bg-white/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-600/60 rounded-lg text-sm md:text-base font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all duration-200" />
            </div>
          )}

          <div className="flex items-center space-x-3 md:space-x-4">
            {isEditorPage && (
              <>
                {/* RTL/LTR segmented toggle in header (prominent) */}
                <div className="flex items-center">
                  <div className="inline-flex items-center rounded-full border-2 border-blue-200 dark:border-blue-700 bg-white/95 dark:bg-gray-800/95 shadow-md ring-1 ring-blue-100/70 dark:ring-blue-900/20 overflow-hidden">
                    <button
                      type="button"
                      title="Left-to-Right"
                      className={`px-3 py-1.5 text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                        textDirection === 'ltr' 
                          ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.45)]' 
                          : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                      }`}
                      onClick={() => applyDirection('ltr')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h12M4 10h8M4 14h10M4 18h6" /></svg>
                      <span className="hidden sm:inline">LTR</span>
                    </button>
                <button
                      type="button"
                      title="Right-to-Left"
                      className={`px-3 py-1.5 text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                        textDirection === 'rtl' 
                          ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.45)]' 
                          : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                      }`}
                      onClick={() => applyDirection('rtl')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6H8M20 10h-8M20 14H10M20 18h-6" /></svg>
                      <span className="hidden sm:inline">RTL</span>
                </button>
                  </div>
                </div>

                {/* Team Up (Collaboration) */}
                <div className="relative team-menu hidden sm:inline-flex">
                  <button
                    onClick={() => { setShowExportMenu(false); setShowAccountMenu(false); setShowTeamMenu(prev => !prev); }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>Team Up</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showTeamMenu && (
                    <div className="absolute right-0 top-full mt-2 w-[26rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-[9999]">
                      <div className="mb-3">
                        <CollaborationPlugin documentId={documentId || undefined} inline showJoin={false} onCollaborationStateChange={() => {}} />
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <InvitePanel docId={documentId || 'new'} onDone={() => setShowTeamMenu(false)} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {isEditorPage && (
              <>
                <div className="relative export-menu hidden sm:block">
                  <button 
                    onClick={() => {
                      console.log('Export button clicked!');
                      console.log('hasContentToExport():', hasContentToExport());
                      console.log('Editor elements found:', document.querySelectorAll('.lexical-editor').length);
                      
                      // Always allow export menu to open for debugging
                      setShowExportMenu(!showExportMenu);
                      
                      // If no content, show alert
                      if (!hasContentToExport()) {
                        alert('No content detected. Please add some text to the editor first.');
                      }
                    }} 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                    title="Export document"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span>Export</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-[9999] overflow-hidden">
                      <ul className="py-1">
                        <li>
                          <button onClick={() => doExport('pdf')} className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100">
                            <span>PDF</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">.pdf</span>
                          </button>
                        </li>
                        <li>
                          <button onClick={() => doExport('docx')} className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100">
                            <span>Word</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">.docx</span>
                          </button>
                        </li>
                        <li>
                          <button onClick={() => doExport('html')} className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100">
                            <span>HTML</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">.html</span>
                          </button>
                        </li>
                        <li>
                          <button onClick={() => doExport('md')} className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100">
                            <span>Markdown</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">.md</span>
                          </button>
                        </li>
                        <li>
                          <button onClick={() => doExport('txt')} className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100">
                            <span>Plain text</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">.txt</span>
                          </button>
                        </li>
                        <li>
                          <button onClick={() => doExport('png')} className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100">
                            <span>Image</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">.png</span>
                          </button>
                        </li>
                        <li>
                          <button onClick={() => doExport('epub')} className="w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100">
                            <span>EPUB</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">.epub</span>
                  </button>
                        </li>
                      </ul>
                </div>
              )}
                </div>
                {/* Save button with loading/complete states */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-md transition-all disabled:opacity-60 ${
                      autoSaveState === 'saved' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : autoSaveState === 'saved' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"/>
                        </svg>
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {user ? (
              <div className="relative account-menu">
                <button onClick={() => setShowAccountMenu(!showAccountMenu)} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.name || user.email}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-[70]">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700"><p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p><p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p></div>
                    <button onClick={shareDocument} className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Share Document</button>
                    <button onClick={async () => { try { await logout(); } finally { setShowAccountMenu(false); router.push('/login'); } }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
                </div>
              )}
            </div>
            ) : (
              <>
                {isAdmin ? (
                  <button
                    onClick={logoutAdmin}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Admin Logout
                  </button>
                ) : (
                  <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')}`} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-100">Login</Link>
                )}
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Wrapper component to handle useSearchParams safely
function NavbarWithSearchParams() {
  return (
    <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"></div>}>
      <Navbar />
    </Suspense>
  );
}

export default NavbarWithSearchParams;