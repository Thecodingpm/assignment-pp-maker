'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload } from 'lucide-react';

interface MediaPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onMediaSelect: (type: string) => void;
  position: { x: number; y: number };
}

const MediaPopup: React.FC<MediaPopupProps> = ({
  isVisible,
  onClose,
  onMediaSelect,
  position
}) => {
  const integrations = [
    { id: 'unsplash', name: 'Unsplash', icon: 'U', color: 'bg-black' },
    { id: 'giphy', name: 'Giphy', icon: 'G', color: 'bg-gradient-to-r from-pink-400 via-green-400 to-blue-400' },
    { id: 'icons', name: 'Icon sets', icon: '🐦', color: 'bg-teal-500' },
    { id: 'brandfetch', name: 'Brandfetch', icon: 'B', color: 'bg-black' },
    { id: 'stickers', name: 'Stickers', icon: '↘️', color: 'bg-purple-500' },
  ];

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
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-80"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for logos, photos, or other images"
                  className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Library Section */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Library</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-sm text-gray-700">Images</span>
              </div>
            </div>
            
            {/* Integrations Section */}
            <div className="p-4 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700 mb-3 block">Integrations</span>
              <div className="space-y-2">
                {integrations.map((integration) => (
                  <button
                    key={integration.id}
                    onClick={() => onMediaSelect(integration.id)}
                    className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`w-6 h-6 ${integration.color} rounded flex items-center justify-center text-white text-xs font-bold`}>
                      {integration.icon}
                    </div>
                    <span className="text-sm text-gray-700">{integration.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Upload Button */}
            <div className="p-4">
              <button
                onClick={() => onMediaSelect('upload')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload media</span>
              </button>
            </div>
            
            {/* Central Illustration */}
            <div className="p-4 bg-gray-50 rounded-lg mx-4 mb-4">
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  {/* Folder */}
                  <div className="w-16 h-12 bg-blue-300 rounded-t-lg relative">
                    <div className="absolute -top-1 left-1 w-4 h-1 bg-blue-400 rounded"></div>
                  </div>
                  {/* Cards behind folder */}
                  <div className="absolute -bottom-2 -right-2 w-12 h-8 bg-purple-400 rounded transform rotate-12"></div>
                  <div className="absolute -bottom-1 -right-1 w-12 h-8 bg-white rounded transform rotate-6 border border-gray-200"></div>
                  <div className="absolute -bottom-3 -right-3 w-12 h-8 bg-purple-600 rounded transform rotate-12"></div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Upload images to your library so everyone on your team can use them.
                </p>
                <button 
                  onClick={() => onMediaSelect('library')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Go to library
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MediaPopup;
