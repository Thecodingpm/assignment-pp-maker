'use client';

import React, { useState, useEffect, useRef } from 'react';

interface GPTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  gptResponse?: string;
  onInsertResponse: () => void;
  onClearResponse: () => void;
  isSearching?: boolean;
}

export default function GPTModal({
  isOpen,
  onClose,
  onSearch,
  gptResponse,
  onInsertResponse,
  onClearResponse,
  isSearching = false
}: GPTModalProps) {
  const [gptQuery, setGptQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset query when modal opens
  useEffect(() => {
    if (isOpen) {
      setGptQuery('');
      setCopied(false);
    }
  }, [isOpen]);

  // Add a small delay for the animation to work properly
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle click outside to close modal and ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

      // Focus management
  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the input when modal opens
    const input = modalRef.current?.querySelector('textarea');
    if (input) {
      // Focus the textarea immediately
      setTimeout(() => {
        input.focus();
        input.click();
      }, 50);
    }
  }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSearch = () => {
    if (gptQuery.trim()) {
      onSearch(gptQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleCopy = async () => {
    if (gptResponse) {
      try {
        await navigator.clipboard.writeText(gptResponse);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // Detect if response contains Urdu text
  const containsUrdu = gptResponse && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(gptResponse);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Glassy modal container */}
      <div 
        ref={modalRef}
        className={`w-full max-w-2xl bg-white/10 dark:bg-gray-900/20 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-2xl overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* Glassy header */}
        <div className="px-8 py-6 border-b border-white/10 dark:border-gray-700/30 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/80 to-purple-600/80 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white dark:text-gray-100">AI Assistant</h2>
                <p className="text-white/70 dark:text-gray-400 text-sm">Describe your request</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-xl backdrop-blur-sm"
              title="Close (ESC)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content with glassy effects */}
        <div className="p-8">
          {/* Search input with glassy design */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-white/80 dark:text-gray-300 mb-4 px-1">What would you like me to help you with?</h3>
            <div className="relative">
              <textarea
                value={gptQuery}
                onChange={(e) => setGptQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onClick={(e) => {
                  e.stopPropagation();
                  e.currentTarget.focus();
                }}
                placeholder="Describe what you want to change or create..."
                className="w-full p-5 bg-white/10 dark:bg-gray-800/20 text-white dark:text-gray-100 placeholder-white/50 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-white/20 dark:focus:bg-gray-700/30 border border-white/20 dark:border-gray-700/30 rounded-2xl transition-all duration-300 resize-none backdrop-blur-sm"
                rows={4}
                autoFocus
                disabled={isSearching}
              />
            </div>
          </div>

          {/* Generate button with glassy effect */}
          <button
            onClick={handleSearch}
            disabled={!gptQuery.trim() || isSearching}
            className={`w-full py-4 px-8 rounded-2xl font-medium transition-all duration-300 backdrop-blur-sm border ${
              gptQuery.trim() && !isSearching
                ? 'bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white border-blue-400/30 shadow-xl hover:shadow-2xl hover:scale-[1.02]' 
                : 'bg-white/10 dark:bg-gray-700/20 text-white/50 dark:text-gray-400 border-white/20 dark:border-gray-700/30 cursor-not-allowed'
            }`}
          >
            {isSearching ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </div>
            ) : (
              'Generate'
            )}
          </button>
        </div>

        {/* Response section with glassy design */}
        {gptResponse && (
          <div className="border-t border-white/10 dark:border-gray-700/30">
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white/80 dark:text-gray-300 mb-4 px-1">Response</h3>
                <div 
                  className={`bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 text-sm text-white dark:text-gray-200 leading-relaxed border border-white/20 dark:border-gray-700/30 ${
                    containsUrdu ? 'urdu-text' : ''
                  }`}
                  dir={containsUrdu ? 'rtl' : 'ltr'}
                >
                  {gptResponse}
                </div>
              </div>
              
              {/* Action buttons with glassy effects */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className={`px-5 py-3 text-sm rounded-xl transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border ${
                      copied 
                        ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                        : 'bg-white/10 dark:bg-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-600/30 text-white/80 dark:text-gray-300 border-white/20 dark:border-gray-700/30'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={onClearResponse}
                    className="px-5 py-3 text-sm bg-white/10 dark:bg-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-600/30 text-white/80 dark:text-gray-300 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-700/30"
                  >
                    Clear
                  </button>
                </div>
                <button
                  onClick={onInsertResponse}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] backdrop-blur-sm border border-blue-400/30"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 