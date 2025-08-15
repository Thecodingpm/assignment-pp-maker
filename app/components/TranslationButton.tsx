'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getCurrentEditor } from './EditorRegistry';
import { $getSelection, $isRangeSelection } from 'lexical';

interface TranslationButtonProps {
  variant?: 'top' | 'left';
  className?: string;
}

export default function TranslationButton({ variant = 'top', className = '' }: TranslationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const editor = getCurrentEditor();
    if (!editor) {
      console.error('Editor not found');
      return;
    }

    const selection = $getSelection();
    if (!$isRangeSelection(selection) || selection.isCollapsed()) {
      alert('Please select some text to translate');
      return;
    }

    const text = selection.getTextContent();
    if (!text.trim()) {
      alert('Please select some text to translate');
      return;
    }

    setIsTranslating(true);
    
    try {
      // Simple translation logic - you can enhance this later
      const translatedText = `[${targetLanguage.toUpperCase()}: ${text}]`;
      
      editor.update(() => {
        const newSelection = $getSelection();
        if ($isRangeSelection(newSelection)) {
          newSelection.insertText(translatedText);
        }
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const buttonContent = variant === 'top' ? (
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span>Translate</span>
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
          console.log('Translation button clicked, current state:', isModalOpen);
          setIsModalOpen(!isModalOpen);
        }}
        className={`group relative p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
          variant === 'top' ? 'flex items-center gap-2' : 'flex flex-col items-center gap-1'
        }`}
        title="Translate text to any language"
        disabled={isTranslating}
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
        <div className={`fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[9999] min-w-[320px] max-w-[400px] overflow-hidden ${
          variant === 'top' ? 'top-20 left-1/2 transform -translate-x-1/2' : 'left-full ml-2 top-0'
        }`} style={{ zIndex: 9999 }}>
          {console.log('Modal is rendering, isModalOpen:', isModalOpen)}
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Translate</h3>
              </div>
            </div>
            
            {/* Translate to Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Translate to</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200"
              >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isTranslating ? 'Translating...' : 'Translate'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 