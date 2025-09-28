'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

// Unsplash Logo Component
const UnsplashIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M7.5 6.75V0h9v6.75h-9zm0 0H0v9h7.5v-9zm0 0h9v6.75H7.5V6.75zM24 6.75h-7.5V0H24v6.75zm0 0v9h-7.5v-9H24zM16.5 24H7.5v-7.5h9V24zm0 0h7.5v-7.5h-7.5V24z"/>
  </svg>
);

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
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [imageQuality, setImageQuality] = useState<'high' | 'medium' | 'low'>('medium');

  const integrations = [
    { id: 'unsplash', name: 'Unsplash', icon: 'U', color: 'bg-black' },
    { id: 'tenor', name: 'Tenor', icon: '🎬', color: 'bg-gradient-to-r from-blue-400 via-green-400 to-red-500' },
    { id: 'stickers', name: 'Stickers', icon: '⭐', color: 'bg-purple-500' },
    { id: 'icons', name: 'Icon sets', icon: '🐦', color: 'bg-teal-400' },
    { id: 'brandfetch', name: 'Brandfetch', icon: 'B̶', color: 'bg-black' },
  ];

  const categories = [
    { name: 'Gradient', query: 'gradient', bg: 'bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400' },
    { name: 'Data', query: 'data visualization', bg: 'bg-green-800' },
    { name: 'Abstract', query: 'abstract', bg: 'bg-gradient-to-r from-purple-400 via-orange-400 to-blue-500' },
    { name: 'Tech', query: 'technology', bg: 'bg-black' },
    { name: '3D Shapes', query: '3d shapes', bg: 'bg-gradient-to-r from-blue-400 to-purple-500' },
    { name: '3D Objects', query: '3d objects', bg: 'bg-gradient-to-r from-indigo-500 to-cyan-500' },
  ];

  // Calculate adjusted position to prevent viewport overflow
  useEffect(() => {
    if (isVisible) {
      const modalWidth = 900; // Increased width to match the design
      const modalHeight = 700; // Increased height to match the design
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = position.x;
      let adjustedY = position.y;
      
      // Adjust horizontal position to prevent right overflow
      if (position.x + modalWidth > viewportWidth - 20) {
        adjustedX = Math.max(20, viewportWidth - modalWidth - 20);
      }
      
      // Adjust horizontal position to prevent left overflow
      if (position.x < 20) {
        adjustedX = 20;
      }
      
      // Adjust vertical position to prevent bottom overflow
      if (position.y + modalHeight > viewportHeight - 20) {
        adjustedY = Math.max(20, viewportHeight - modalHeight - 20);
      }
      
      // Adjust vertical position to prevent top overflow
      if (position.y < 20) {
        adjustedY = 20;
      }
      
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isVisible, position]);

  // Fetch media from APIs
  const fetchMedia = async (query: string, page: number, integrationType: string) => {
    // Clear media items immediately to prevent mixing
    setMediaItems([]);
    setLoading(true);
    
    try {
      let endpoint = '';
      let params = '';
      
      if (integrationType === 'unsplash') {
        endpoint = '/api/unsplash';
        params = `?query=${encodeURIComponent(query || 'nature')}&page=${page}&limit=12&quality=${imageQuality}`;
      } else if (integrationType === 'tenor') {
        endpoint = '/api/tenor';
        // For Tenor, use 'trending' as default query to get featured GIFs
        const searchQuery = query === 'trending' ? 'trending' : query;
        params = `?query=${encodeURIComponent(searchQuery)}&page=${page}&limit=12&quality=${imageQuality}`;
      } else {
        setLoading(false);
        return; // Handle other integrations later
      }
      
      console.log(`Fetching from ${integrationType}: ${endpoint}${params}`);
      
      const response = await fetch(`${endpoint}${params}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, text: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`${integrationType} response:`, data);
      
      // Only update state if we're still on the same integration
      if (selectedIntegration === integrationType) {
        if (integrationType === 'unsplash') {
          setMediaItems(data.images || []);
          setTotalPages(data.totalPages || 1);
        } else if (integrationType === 'tenor') {
          setMediaItems(data.gifs || []);
          setTotalPages(data.totalPages || 1);
        }
      }
      
    } catch (error) {
      console.error(`Error fetching from ${integrationType}:`, error);
      
      // Only update state if we're still on the same integration
      if (selectedIntegration === integrationType) {
        // Show fallback content for Tenor if API fails
        if (integrationType === 'tenor') {
          setMediaItems([
            {
              id: 'fallback-1',
              url: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
              thumb: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
              alt: 'Sample GIF 1',
              credit: 'Giphy',
              width: 200,
              height: 200,
              type: 'gif'
            },
            {
              id: 'fallback-2',
              url: 'https://media.giphy.com/media/26BRrSvJUa5Uid5Kw/giphy.gif',
              thumb: 'https://media.giphy.com/media/26BRrSvJUa5Uid5Kw/giphy.gif',
              alt: 'Sample GIF 2',
              credit: 'Giphy',
              width: 200,
              height: 200,
              type: 'gif'
            }
          ]);
          setTotalPages(1);
        } else {
          setMediaItems([]);
        }
      }
    } finally {
      // Only update loading state if we're still on the same integration
      if (selectedIntegration === integrationType) {
        setLoading(false);
      }
    }
  };

  // Search media
  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchMedia(searchQuery.trim(), 1, selectedIntegration);
    }
  };

  // Handle category click
  const handleCategoryClick = (category: { name: string; query: string; bg: string }) => {
    console.log('Category clicked:', category.name, 'for', selectedIntegration);
    setSearchQuery(category.query);
    setCurrentPage(1);
    
    // Load content based on the selected integration
    fetchMedia(category.query, 1, selectedIntegration);
  };

  // Handle media selection
  const handleMediaSelect = async (item: MediaItem) => {
    try {
      // Skip the POST API calls for now since they're causing 500 errors
      // and aren't necessary for adding media to the canvas
      
      // Pass media data to parent component immediately
      onMediaSelect(selectedIntegration, item);
      onClose();
    } catch (error) {
      console.error('Error selecting media:', error);
      // Even if there's an error, still try to add the media to canvas
      onMediaSelect(selectedIntegration, item);
      onClose();
    }
  };

  // Handle integration switching
  const handleIntegrationSwitch = (integrationId: string) => {
    console.log('Switching to integration:', integrationId);
    setSelectedIntegration(integrationId);
    setSearchQuery('');
    setMediaItems([]);
    setCurrentPage(1);
    setTotalPages(1);
    
    // Immediately load content for the new integration
    console.log('Loading content for:', integrationId);
    if (integrationId === 'tenor') {
      fetchMedia('trending', 1, integrationId); // Load trending GIFs for Tenor
    } else if (integrationId === 'unsplash') {
      fetchMedia('nature', 1, integrationId); // Load nature photos for Unsplash
    } else if (integrationId === 'stickers') {
      // For stickers, show a placeholder or load from a stickers API
      setMediaItems([
        {
          id: 'sticker-1',
          url: '/api/placeholder/sticker1',
          thumb: '/api/placeholder/sticker1',
          alt: 'Sample Sticker 1',
          credit: 'Sticker Pack',
          width: 100,
          height: 100,
          type: 'sticker'
        },
        {
          id: 'sticker-2',
          url: '/api/placeholder/sticker2',
          thumb: '/api/placeholder/sticker2',
          alt: 'Sample Sticker 2',
          credit: 'Sticker Pack',
          width: 100,
          height: 100,
          type: 'sticker'
        }
      ]);
    } else if (integrationId === 'icons') {
      // For icons, show a placeholder or load from an icons API
      setMediaItems([
        {
          id: 'icon-1',
          url: '/api/placeholder/icon1',
          thumb: '/api/placeholder/icon1',
          alt: 'Sample Icon 1',
          credit: 'Icon Pack',
          width: 64,
          height: 64,
          type: 'icon'
        },
        {
          id: 'icon-2',
          url: '/api/placeholder/icon2',
          thumb: '/api/placeholder/icon2',
          alt: 'Sample Icon 2',
          credit: 'Icon Pack',
          width: 64,
          height: 64,
          type: 'icon'
        }
      ]);
    } else {
      fetchMedia('', 1, integrationId); // Default for other integrations
    }
  };

  // Load initial media when popup opens
  useEffect(() => {
    if (isVisible) {
      console.log('Popup opened, loading content for:', selectedIntegration);
      if (selectedIntegration === 'tenor') {
        fetchMedia('trending', 1, selectedIntegration); // Load trending GIFs for Tenor
      } else if (selectedIntegration === 'unsplash') {
        fetchMedia('nature', 1, selectedIntegration); // Load nature photos for Unsplash
      } else if (selectedIntegration === 'stickers') {
        // For stickers, show placeholder content
        setMediaItems([
          {
            id: 'sticker-1',
            url: '/api/placeholder/sticker1',
            thumb: '/api/placeholder/sticker1',
            alt: 'Sample Sticker 1',
            credit: 'Sticker Pack',
            width: 100,
            height: 100,
            type: 'sticker'
          },
          {
            id: 'sticker-2',
            url: '/api/placeholder/sticker2',
            thumb: '/api/placeholder/sticker2',
            alt: 'Sample Sticker 2',
            credit: 'Sticker Pack',
            width: 100,
            height: 100,
            type: 'sticker'
          }
        ]);
      } else if (selectedIntegration === 'icons') {
        // For icons, show placeholder content
        setMediaItems([
          {
            id: 'icon-1',
            url: '/api/placeholder/icon1',
            thumb: '/api/placeholder/icon1',
            alt: 'Sample Icon 1',
            credit: 'Icon Pack',
            width: 64,
            height: 64,
            type: 'icon'
          },
          {
            id: 'icon-2',
            url: '/api/placeholder/icon2',
            thumb: '/api/placeholder/icon2',
            alt: 'Sample Icon 2',
            credit: 'Icon Pack',
            width: 64,
            height: 64,
            type: 'icon'
          }
        ]);
      } else {
        fetchMedia('', 1, selectedIntegration); // Default for other integrations
      }
    }
  }, [isVisible]);

  // Cleanup effect to prevent race conditions
  useEffect(() => {
    return () => {
      // Clear media items when component unmounts
      setMediaItems([]);
      setLoading(false);
    };
  }, []);

  // Handle Enter key in search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get placeholder text based on integration
  const getSearchPlaceholder = () => {
    if (selectedIntegration === 'unsplash') return 'Search Unsplash';
    if (selectedIntegration === 'tenor') return 'Search Tenor';
    if (selectedIntegration === 'stickers') return 'Search Stickers';
    if (selectedIntegration === 'icons') return 'Search Icons';
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
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 w-[800px] h-[500px] flex overflow-hidden"
            style={{
              left: adjustedPosition.x,
              top: adjustedPosition.y,
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: 'calc(100vh - 40px)',
            }}
          >
            {/* Left Sidebar */}
            <div className="w-44 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 p-4 flex flex-col flex-shrink-0">
              {/* Library Section */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">Library</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-md flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Images</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700">Videos</span>
                  </div>
                </div>
              </div>
              
              {/* Integrations Section */}
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">Integrations</h3>
                <div className="space-y-2">
                  {integrations.map((integration) => (
                    <button
                      key={integration.id}
                      onClick={() => handleIntegrationSwitch(integration.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                        selectedIntegration === integration.id 
                          ? 'bg-white shadow-md border-2 border-purple-200' 
                          : 'hover:bg-white hover:shadow-sm border-2 border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 ${integration.color} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                        {integration.id === 'unsplash' ? (
                          <UnsplashIcon className="w-5 h-5" />
                        ) : (
                          integration.icon
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{integration.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => onMediaSelect('upload')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm shadow-lg hover:shadow-xl"
              >
                <Upload className="w-4 h-4" />
                <span>Upload media</span>
              </button>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 p-4 flex flex-col bg-white min-w-0">
              
              {/* Search Bar */}
              <div className="mb-3">
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={getSearchPlaceholder()}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  {/* Quality Selector */}
                  <div className="relative">
                    <select 
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200 appearance-none pr-8"
                      value={imageQuality}
                      onChange={(e) => {
                        setImageQuality(e.target.value as 'high' | 'medium' | 'low');
                        console.log('Quality changed to:', e.target.value);
                      }}
                    >
                      <option value="low">Low Quality (Fast)</option>
                      <option value="medium">Medium Quality (Balanced)</option>
                      <option value="high">High Quality (Slow)</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category Buttons */}
              <div className="mb-3">
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium text-black whitespace-nowrap hover:scale-105 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md`}
                      style={{
                        background: category.bg.includes('gradient') 
                          ? category.bg 
                          : category.bg
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Media Results Grid */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading images...</p>
                    </div>
                  </div>
                ) : mediaItems.length > 0 ? (
                  <div className="space-y-2">

                    {/* Improved Image Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {mediaItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="relative group cursor-pointer bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                          onClick={() => handleMediaSelect(item)}
                        >
                          {/* Image Container */}
                          <div className="aspect-square relative overflow-hidden">
                            {item.type === 'gif' ? (
                              <img
                                src={item.thumb}
                                alt={item.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <img
                                src={item.thumb}
                                alt={item.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            )}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-white bg-opacity-90 rounded-full p-2">
                                  <ImageIcon className="w-5 h-5 text-gray-700" />
                                </div>
                              </div>
                            </div>

                            {/* Quality Badge */}
                            <div className="absolute top-2 right-2">
                              <div className="bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                                {imageQuality === 'high' ? 'HD' : imageQuality === 'medium' ? 'MD' : 'SD'}
                              </div>
                            </div>
                          </div>

                          {/* Image Info */}
                          <div className="p-3">
                            <div className="text-xs text-gray-600 font-medium truncate mb-1">
                              {item.credit}
                            </div>
                            <div className="text-xs text-gray-400">
                              {item.width} × {item.height}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                  currentPage === pageNum
                                    ? 'bg-purple-600 text-white'
                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-medium mb-2">No {
                      selectedIntegration === 'unsplash' ? 'photos' : 
                      selectedIntegration === 'tenor' ? 'GIFs' : 
                      selectedIntegration === 'stickers' ? 'stickers' : 
                      selectedIntegration === 'icons' ? 'icons' : 
                      'media'
                    } found</p>
                    <p className="text-xs text-gray-400">Try a different search term or browse categories</p>
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
