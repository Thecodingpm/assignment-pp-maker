'use client';

import React, { useState } from 'react';
import { 
  Home, 
  Menu, 
  Plus, 
  Bell, 
  List, 
  BarChart3, 
  Play, 
  Share2,
  Type,
  Image as ImageIcon,
  Square,
  BarChart,
  Table,
  Code,
  Circle
} from 'lucide-react';
import MediaPopup from '../Editor/MediaPopup';

const MainToolbar: React.FC = () => {
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [mediaPopupPosition, setMediaPopupPosition] = useState({ x: 0, y: 0 });

  const handleMediaClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMediaPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
    setShowMediaPopup(true);
  };

  const handleMediaSelect = (type: string) => {
    setShowMediaPopup(false);
    console.log('Media selected:', type);
    // Handle different media types here
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-3 py-2">
        
        {/* Left Section - Presentation Info */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <Home className="w-3.5 h-3.5 text-gray-600" />
            <Menu className="w-3.5 h-3.5 text-gray-600" />
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-gray-700">Untitled presentation</h1>
            <span className="text-xs text-gray-600">Private</span>
          </div>
        </div>

        {/* Center Section - Editing Tools */}
        <div className="flex items-center space-x-4">
          {/* Text Tool */}
          <div className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Type className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Text</span>
          </div>

          {/* Media Tool */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleMediaClick}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center relative">
              <div className="w-4 h-4 bg-white rounded border border-gray-400"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-2 h-2 text-gray-700 ml-0.5" />
              </div>
            </div>
            <span className="text-xs text-gray-700 font-medium">Media</span>
          </div>

          {/* Shape Tool */}
          <div className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-sm"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-600 rotate-45"></div>
            </div>
            <span className="text-xs text-gray-700 font-medium">Shape</span>
          </div>

          {/* Chart Tool */}
          <div className="flex flex-col items-center space-x-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Chart</span>
          </div>

          {/* Table Tool */}
          <div className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Table className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Table</span>
          </div>

          {/* Embed Tool */}
          <div className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Embed</span>
          </div>

          {/* Record Tool */}
          <div className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Circle className="w-2.5 h-2.5 bg-gray-600 rounded-full" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Record</span>
          </div>
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center space-x-2">
          {/* Plus Button */}
          <button className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Profile Picture with Green Dot */}
          <div className="relative">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">A</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
          </div>

          {/* Bell Icon */}
          <button className="w-6 h-6 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors">
            <Bell className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* List Icon */}
          <button className="w-6 h-6 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <List className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Activity Icon */}
          <button className="w-6 h-6 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
            <BarChart3 className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Play Button */}
          <button className="px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center space-x-1 transition-colors">
            <Play className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Play</span>
          </button>

          {/* Share Button */}
          <button className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium text-xs transition-colors">
            Share
          </button>
        </div>
      </div>
      
      {/* Media Popup */}
      <MediaPopup
        isVisible={showMediaPopup}
        onClose={() => setShowMediaPopup(false)}
        onMediaSelect={handleMediaSelect}
        position={mediaPopupPosition}
      />
    </div>
  );
};

export default MainToolbar;
