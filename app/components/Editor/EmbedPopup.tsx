'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmbedPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onEmbed: (type: string, url: string) => void;
  position: { x: number; y: number };
}

const EmbedPopup: React.FC<EmbedPopupProps> = ({
  isVisible,
  onClose,
  onEmbed,
  position
}) => {
  const [selectedSource, setSelectedSource] = useState('youtube');
  const [embedUrl, setEmbedUrl] = useState('');

  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.embed-popup')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  const handleEmbed = () => {
    if (embedUrl.trim()) {
      onEmbed(selectedSource, embedUrl.trim());
      onClose();
      setEmbedUrl('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEmbed();
    }
  };

  const embeddingSources = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      color: 'text-red-600'
    },
    {
      id: 'vimeo',
      name: 'Vimeo',
      icon: (
        <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">v</span>
        </div>
      ),
      color: 'text-blue-600'
    },
    {
      id: 'loom',
      name: 'Loom',
      icon: (
        <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">*</span>
        </div>
      ),
      color: 'text-purple-600'
    },
    {
      id: 'graphy',
      name: 'Graphy',
      icon: (
        <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">//</span>
        </div>
      ),
      color: 'text-black'
    },
    {
      id: 'link',
      name: 'Any link',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v6h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z"/>
        </svg>
      ),
      color: 'text-gray-600'
    }
  ];

  const renderContent = () => {
    if (selectedSource === 'youtube') {
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">YouTube</h2>
            <p className="text-sm text-gray-600 mt-1">
              Embed YouTube videos directly into your slides.
            </p>
          </div>
          
          {/* YouTube Video Preview */}
          <div className="border-2 border-red-500 rounded-lg p-4 bg-white">
            <div className="flex space-x-3">
              {/* Main Video */}
              <div className="flex-1 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-lg relative h-32 flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              
              {/* Playlist */}
              <div className="w-20 space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-200 rounded h-8 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Input Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              YouTube URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {embedUrl && (
                <button
                  onClick={() => setEmbedUrl('')}
                  className="px-2 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEmbed}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              Embed
            </button>
          </div>
        </div>
      );
    }
    
    // Placeholder for other sources
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{selectedSource}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Embed content from {selectedSource} into your presentation.
          </p>
        </div>
        
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <p className="text-lg font-medium">Coming soon...</p>
          <p className="text-sm text-gray-400 mt-1">This embedding source will be available soon</p>
        </div>
      </div>
    );
  };

  console.log('🔍 EmbedPopup render:', { isVisible, selectedSource, embedUrl });
  
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-white rounded-xl shadow-2xl border-2 border-red-500 w-[700px] max-h-[600px] embed-popup"
            style={{
              left: position.x,
              top: position.y,
            }}
            data-position={`x: ${position.x}, y: ${position.y}`}
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center border-b border-gray-100 bg-gray-50 rounded-t-xl">
              {['Text', 'Media', 'Shape', 'Chart', 'Table', 'Embed', 'Record'].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    tab === 'Embed'
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Main Content */}
            <div className="flex">
              {/* Left Sidebar - Embedding Sources */}
              <div className="w-48 border-r border-gray-100 bg-gray-50">
                <div className="p-4">
                  <div className="space-y-1">
                    {embeddingSources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => setSelectedSource(source.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                          selectedSource === source.id
                            ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-sm'
                        }`}
                      >
                        <div className={source.color}>
                          {source.icon}
                        </div>
                        <span>{source.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Separator line */}
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  {/* Feedback Section */}
                  <div className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-sm cursor-pointer transition-all duration-200 flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs font-bold">?</span>
                    </div>
                    <span>Feedback</span>
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Content */}
              <div className="flex-1 p-6 bg-white">
                {renderContent()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmbedPopup;
