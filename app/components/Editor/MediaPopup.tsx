'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface MediaPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onMediaSelect: (type: string, imageData?: any) => void;
  position: { x: number; y: number };
}

interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  credit: string;
  downloadUrl: string;
  width: number;
  height: number;
}

interface GiphyGif {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  credit: string;
  width: number;
  height: number;
  type: 'gif';
}

type MediaItem = UnsplashImage | GiphyGif;

const MediaPopup: React.FC<MediaPopupProps> = ({
  isVisible,
  onClose,
  onMediaSelect,
  position
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState('unsplash');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const integrations = [
    { id: 'unsplash', name: 'Unsplash', icon: 'U', color: 'bg-black' },
    { id: 'giphy', name: 'Giphy', icon: 'G', color: 'bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500' },
    { id: 'icons', name: 'Icon sets', icon: '🐦', color: 'bg-teal-400' },
    { id: 'brandfetch', name: 'Brandfetch', icon: 'B', color: 'bg-black' },
    { id: 'stickers', name: 'Stickers', icon: '↘️', color: 'bg-purple-500' },
  ];

  const categories = [
    { name: 'Gradient', query: 'gradient', bg: 'bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400' },
    { name: 'Data', query: 'data visualization', bg: 'bg-green-800' },
    { name: 'Abstract', query: 'abstract', bg: 'bg-gradient-to-r from-blue-400 to-purple-500' },
    { name: 'Tech', query: 'technology', bg: 'bg-black' },
    { name: '3D Shapes', query: '3d shapes', bg: 'bg-gradient-to-r from-blue-400 to-purple-500' },
  ];

  // Fetch media from APIs
  const fetchMedia = async (query: string = '', page: number = 1) => {
    setLoading(true);
    try {
      let response;
      let apiUrl = '';
      
      if (selectedIntegration === 'unsplash') {
        const searchTerm = query || 'nature';
        apiUrl = `/api/unsplash?query=${encodeURIComponent(searchTerm)}&page=${page}&per_page=12`;
      } else if (selectedIntegration === 'giphy') {
        const searchTerm = query || 'trending';
        apiUrl = `/api/giphy?query=${encodeURIComponent(searchTerm)}&page=${page - 1}&limit=12`;
      } else {
        setLoading(false);
        return;
      }

      console.log(`Fetching from ${selectedIntegration}:`, apiUrl);
      response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        console.log(`${selectedIntegration} API response:`, data);
        
        if (selectedIntegration === 'unsplash') {
          setMediaItems(data.images || []);
          setTotalPages(data.totalPages || 1);
        } else if (selectedIntegration === 'giphy') {
          setMediaItems(data.gifs || []);
          setTotalPages(data.totalPages || 1);
        }
        setCurrentPage(page);
      } else {
        console.error(`Failed to fetch from ${selectedIntegration}:`, response.status);
      }
    } catch (error) {
      console.error(`Error fetching from ${selectedIntegration}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Search media
  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchMedia(searchQuery.trim(), 1);
    }
  };

  // Handle category click
  const handleCategoryClick = (category: any) => {
    setSearchQuery(category.query);
    fetchMedia(category.query, 1);
  };

  // Handle media selection
  const handleMediaSelect = async (item: MediaItem) => {
    try {
      if (selectedIntegration === 'unsplash') {
        // Trigger download for Unsplash compliance
        await fetch('/api/unsplash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId: item.id }),
        });
      } else if (selectedIntegration === 'giphy') {
        // Get GIF details for Giphy
        await fetch('/api/giphy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gifId: item.id }),
        });
      }
      
      // Pass media data to parent component
      onMediaSelect(selectedIntegration, item);
      onClose();
    } catch (error) {
      console.error('Error selecting media:', error);
    }
  };

  // Handle integration switching
  const handleIntegrationSwitch = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setSearchQuery('');
    setMediaItems([]);
    setCurrentPage(1);
    // Load initial content for the new integration
    setTimeout(() => {
      fetchMedia('', 1);
    }, 100);
  };

  // Load initial media when integration changes
  useEffect(() => {
    if (isVisible) {
      fetchMedia('', 1);
    }
  }, [selectedIntegration, isVisible]);

  // Handle Enter key in search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get placeholder text based on integration
  const getSearchPlaceholder = () => {
    if (selectedIntegration === 'unsplash') return 'Search Unsplash';
    if (selectedIntegration === 'giphy') return 'Search Giphy';
    return `Search ${selectedIntegration}`;
  };

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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
            }}
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 w-96 h-96 flex"
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 9999,
              backgroundColor: 'white',
              width: '24rem',
              height: '24rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          >
            {/* Left Sidebar */}
            <div className="w-32 bg-gray-50 border-r border-gray-200 p-3 flex flex-col">
              {/* Library Section */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Library</h3>
                <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">A</span>
                  </div>
                  <span className="text-xs text-gray-700">Images</span>
                </div>
              </div>
              
              {/* Integrations Section */}
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-gray-600 mb-2">Integrations</h3>
                <div className="space-y-1">
                  {integrations.map((integration) => (
                    <button
                      key={integration.id}
                      onClick={() => handleIntegrationSwitch(integration.id)}
                      className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors text-left ${
                        selectedIntegration === integration.id 
                          ? 'bg-gray-200' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-5 h-5 ${integration.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
                        {integration.icon}
                      </div>
                      <span className="text-xs text-gray-700">{integration.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => onMediaSelect('upload')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-xs"
              >
                <Upload className="w-3 h-3" />
                <span>Upload media</span>
              </button>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 p-4 flex flex-col">
              {/* Integration Header */}
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded ${selectedIntegration === 'unsplash' ? 'bg-black' : 'bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedIntegration === 'unsplash' ? 'Unsplash Photos' : 'Giphy GIFs'}
                  </span>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getSearchPlaceholder()}
                    className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              {/* Category Buttons */}
              <div className="mb-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-white whitespace-nowrap ${category.bg} hover:opacity-80 transition-opacity`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Media Results Grid */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : mediaItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="relative group cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleMediaSelect(item)}
                      >
                        {item.type === 'gif' ? (
                          <img
                            src={item.thumb}
                            alt={item.alt}
                            className="w-full h-20 object-cover rounded-lg"
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src={item.thumb}
                            alt={item.alt}
                            className="w-full h-20 object-cover rounded-lg"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-70 text-white text-xs p-1 rounded">
                          {item.credit}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No media found. Try a different search term.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MediaPopup;
