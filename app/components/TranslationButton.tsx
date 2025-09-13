'use client';

import React, { useState, useRef, useEffect } from 'react';
// Lexical imports removed
import { translationService } from '../utils/translationService';

interface TranslationButtonProps {
  variant?: 'top' | 'left';
  className?: string;
}

export default function TranslationButton({ variant = 'top', className = '' }: TranslationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [selectedPage, setSelectedPage] = useState('Page 1 (Current page)');
  const [translateExisting, setTranslateExisting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ensure LibreTranslate is used as the default provider
  useEffect(() => {
    translationService.useLibreTranslate();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTranslate = async () => {
    if (!targetLanguage) {
      alert('Please select a target language');
      return;
    }

    const editor = getCurrentEditor();
    if (!editor) {
      console.error('Editor not found');
      return;
    }

    setIsTranslating(true);
    
    try {
      // Get the entire editor content instead of requiring selection
      let editorContent = '';
      
      editor.update(() => {
        const root = $getRoot();
        editorContent = root.getTextContent();
      });

      if (!editorContent.trim()) {
        alert('No content found to translate. Please add some content to the editor first.');
        setIsTranslating(false);
        return;
      }

      // Use the translation service to actually translate the content
      const translationResponse = await translationService.translate({
        text: editorContent,
        targetLanguage: targetLanguage,
        sourceLanguage: 'en' // Assuming source is English
      });

      const translatedText = translationResponse.translatedText;
      
      // Handle translation based on checkbox selection
      if (translateExisting) {
        // Replace content on existing page
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const translatedParagraph = $createParagraphNode();
          const translatedTextNode = $createTextNode(translatedText);
          translatedParagraph.append(translatedTextNode);
          root.append(translatedParagraph);
        });
      } else {
        // Create new page with translation (preserve existing content)
        editor.update(() => {
          const root = $getRoot();
          
          // Add a page separator
          const separatorParagraph = $createParagraphNode();
          const separatorText = $createTextNode('─'.repeat(50));
          separatorParagraph.append(separatorText);
          root.append(separatorParagraph);
          
          // Add page indicator
          const pageIndicatorParagraph = $createParagraphNode();
          const pageIndicatorText = $createTextNode(`[${targetLanguage.toUpperCase()} Translation]`);
          pageIndicatorParagraph.append(pageIndicatorText);
          root.append(pageIndicatorParagraph);
          
          // Add the translated text
          const translatedParagraph = $createParagraphNode();
          const translatedTextNode = $createTextNode(translatedText);
          translatedParagraph.append(translatedTextNode);
          root.append(translatedParagraph);
        });
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const buttonContent = variant === 'top' ? (
    <div className="flex items-center justify-center relative w-full h-full">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-75"></div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-1">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span className="text-xs">Translate</span>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => {
          setIsModalOpen(!isModalOpen);
        }}
        className={`group relative p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 ${
          isModalOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700/30' : ''
        } ${
          variant === 'top' ? 'flex items-center justify-center' : 'flex flex-col items-center gap-1'
        }`}
        title="Translate text to any language"
        disabled={isTranslating}
        style={{ width: '40px', height: '32px', zIndex: 1000, position: 'relative' }}
      >
        {isTranslating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Translating...</span>
          </div>
        ) : (
          buttonContent
        )}
      </button>

      {isModalOpen && (
        <div className={`fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] min-w-[360px] max-w-[420px] overflow-hidden ${
          variant === 'top' ? 'top-20 left-1/2 transform -translate-x-1/2' : 'left-full ml-2 top-0'
        }`} style={{ zIndex: 9999 }}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Translate</h3>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Translate to Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Translate to</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px'
                }}
              >
                <option value="">Select language</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="fa">فارسی (Persian)</option>
                <option value="he">עברית (Hebrew)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="tr">Türkçe (Turkish)</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
                <option value="it">Italiano (Italian)</option>
                <option value="pt">Português (Portuguese)</option>
                <option value="ru">Русский (Russian)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="nl">Nederlands (Dutch)</option>
                <option value="pl">Polski (Polish)</option>
                <option value="sv">Svenska (Swedish)</option>
                <option value="da">Dansk (Danish)</option>
                <option value="no">Norsk (Norwegian)</option>
                <option value="fi">Suomi (Finnish)</option>
                <option value="cs">Čeština (Czech)</option>
                <option value="hu">Magyar (Hungarian)</option>
                <option value="ro">Română (Romanian)</option>
                <option value="bg">Български (Bulgarian)</option>
                <option value="hr">Hrvatski (Croatian)</option>
                <option value="sk">Slovenčina (Slovak)</option>
                <option value="sl">Slovenščina (Slovenian)</option>
                <option value="et">Eesti (Estonian)</option>
                <option value="lv">Latviešu (Latvian)</option>
                <option value="lt">Lietuvių (Lithuanian)</option>
                <option value="mt">Malti (Maltese)</option>
                <option value="el">Ελληνικά (Greek)</option>
                <option value="th">ไทย (Thai)</option>
                <option value="vi">Tiếng Việt (Vietnamese)</option>
                <option value="id">Bahasa Indonesia (Indonesian)</option>
                <option value="ms">Bahasa Melayu (Malay)</option>
                <option value="fil">Filipino</option>
                <option value="sw">Kiswahili (Swahili)</option>
              </select>
            </div>
            
            {/* Apply to page Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Apply to page</label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px'
                }}
              >
                <option value="Page 1 (Current page)">Page 1 (Current page)</option>
                <option value="All pages">All pages</option>
                <option value="Selected pages">Selected pages</option>
              </select>
            </div>
            
            {/* Checkbox Option */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={translateExisting}
                  onChange={(e) => setTranslateExisting(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Translate existing design without creating a copy</span>
              </label>
            </div>
            
            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !targetLanguage}
              className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg text-base font-medium transition-colors duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 