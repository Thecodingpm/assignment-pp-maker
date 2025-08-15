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
      const input = modalRef.current?.querySelector('input');
      if (input) {
        setTimeout(() => input.focus(), 100);
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
    if (e.key === 'Enter') {
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
    <div className={`fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Glassy modal with enhanced design */}
      <div 
        ref={modalRef}
        className={`w-full max-w-[600px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/20 dark:border-gray-700/30 overflow-hidden transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Enhanced header with glassy effect */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-700/30 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Assistant
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200 rounded-xl group hover:scale-110 hover:rotate-90"
            title="Close (ESC)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Enhanced search input section */}
        <div className="p-6">
          <div className="relative mb-6">
            <input
              type="text"
              value={gptQuery}
              onChange={(e) => setGptQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isSearching ? "Searching..." : "Ask me anything... (e.g., 'explain ML in Urdu')"}
              className="w-full pl-12 pr-16 py-4 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-2xl transition-all duration-300 backdrop-blur-sm hover:border-blue-300/70 dark:hover:border-blue-500/70 hover:shadow-lg"
              autoFocus
              disabled={isSearching}
            />
            {/* Enhanced search icon */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Enhanced search button or loading */}
            {isSearching ? (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <button
                onClick={handleSearch}
                disabled={!gptQuery.trim()}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2.5 rounded-xl transition-all duration-200 ${
                  gptQuery.trim() 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-110' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Enhanced help text */}
          <div className="text-center mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Press Enter to search • ESC to close
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Ask for Urdu responses naturally - e.g., "explain AI in Urdu"
            </div>
          </div>
        </div>

        {/* Enhanced response section - inline */}
        {gptResponse && (
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-gray-50/80 to-blue-50/80 dark:from-gray-800/80 dark:to-blue-900/20 rounded-2xl p-6 border border-white/30 dark:border-gray-600/30 shadow-lg">
              <div 
                className={`text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-6 ${
                  containsUrdu ? 'urdu-text' : ''
                }`}
                dir={containsUrdu ? 'rtl' : 'ltr'}
              >
                {gptResponse}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 text-xs rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                      copied 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:scale-105'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={onClearResponse}
                    className="px-4 py-2 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    Clear
                  </button>
                </div>
                <button
                  onClick={onInsertResponse}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-medium rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  Insert Response
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 