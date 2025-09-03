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
  Circle,
  Mic,
  Settings
} from 'lucide-react';
import MediaPopup from '../Editor/MediaPopup';
import ShapePopup from '../Editor/ShapePopup';
import ToolbarTextPopup from '../Editor/ToolbarTextPopup';
import PresentationMenuDropdown from '../Editor/PresentationMenuDropdown';
import ChartPopup from '../Editor/ChartPopup';
import TablePopup from '../Editor/TablePopup';
import { useEditorStore } from '../../stores/useEditorStore';

const MainToolbar: React.FC = () => {
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [mediaPopupPosition, setMediaPopupPosition] = useState({ x: 0, y: 0 });
  const [showShapePopup, setShowShapePopup] = useState(false);
  const [shapePopupPosition, setShapePopupPosition] = useState({ x: 0, y: 0 });
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [textPopupPosition, setTextPopupPosition] = useState({ x: 0, y: 0 });
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showChartPopup, setShowChartPopup] = useState(false);
  const [chartPopupPosition, setChartPopupPosition] = useState({ x: 0, y: 0 });
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [tablePopupPosition, setTablePopupPosition] = useState({ x: 0, y: 0 });

  const handleMediaClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMediaPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
    setShowMediaPopup(true);
  };

  const handleShapeClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setShapePopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
    setShowShapePopup(true);
  };

  const handleTextClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTextPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
    setShowTextPopup(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    console.log('🎯 Menu button clicked!');
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.bottom + 5
    };
    console.log('📍 Setting menu position:', position);
    setMenuPosition(position);
    setShowMenuDropdown(true);
    console.log('✅ showMenuDropdown set to true');
  };

  const handleChartClick = (e: React.MouseEvent) => {
    console.log('📊 Chart button clicked!');
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: Math.max(0, rect.left - 400), // Center the popup
      y: rect.bottom + 10
    };
    console.log('📍 Setting chart popup position:', position);
    setChartPopupPosition(position);
    setShowChartPopup(true);
    console.log('✅ showChartPopup set to true');
  };

  const handleTableClick = (e: React.MouseEvent) => {
    console.log('📋 Table button clicked!');
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: Math.max(0, rect.left - 160), // Center the popup (table popup is 320px wide)
      y: rect.bottom + 10
    };
    console.log('📍 Setting table popup position:', position);
    setTablePopupPosition(position);
    setShowTablePopup(true);
    console.log('✅ showTablePopup set to true');
  };

  const handleMediaSelect = (type: string, mediaData?: any) => {
    setShowMediaPopup(false);
    console.log('Media selected:', type, mediaData);
    
    if (type === 'unsplash' && mediaData) {
      // Handle Unsplash image selection
      console.log('Selected Unsplash image:', {
        id: mediaData.id,
        url: mediaData.url,
        alt: mediaData.alt,
        credit: mediaData.credit,
        width: mediaData.width,
        height: mediaData.height
      });
      
      // Add the image to the canvas
      const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore.getState();
      const currentSlide = slides[currentSlideIndex];
      
      if (currentSlide) {
        // Calculate center position for new image element
        const centerX = (canvasSize.width / 2) - 150; // Larger offset for bigger images
        const centerY = (canvasSize.height / 2) - 112; // Larger offset for bigger images
        
        const newImageElement = {
          type: 'image' as const,
          x: centerX,
          y: centerY,
          width: 300, // Increased from 200 to 300
          height: 225, // Increased from 150 to 225 (maintains aspect ratio)
          rotation: 0,
          zIndex: 1,
          src: mediaData.url,
          alt: mediaData.alt,
          credit: mediaData.credit,
          originalWidth: mediaData.width,
          originalHeight: mediaData.height,
        };
        
        addElement(currentSlide.id, newImageElement);
        console.log('Added Unsplash image to canvas:', newImageElement);
      }
      
    } else if (type === 'tenor' && mediaData) {
      // Handle Tenor GIF selection
      console.log('Selected Tenor GIF:', {
        id: mediaData.id,
        url: mediaData.url,
        alt: mediaData.alt,
        credit: mediaData.credit,
        width: mediaData.width,
        height: mediaData.height,
        type: mediaData.type
      });
      
      // Add the GIF to the canvas as an image element
      const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore.getState();
      const currentSlide = slides[currentSlideIndex];
      
      if (currentSlide) {
        // Calculate center position for new GIF element
        const centerX = (canvasSize.width / 2) - 150; // Larger offset for bigger GIFs
        const centerY = (canvasSize.height / 2) - 112; // Larger offset for bigger GIFs
        
        const newGifElement = {
          type: 'image' as const, // Treat GIFs as images
          x: centerX,
          y: centerY,
          width: 300, // Increased from 200 to 300
          height: 225, // Increased from 150 to 225 (maintains aspect ratio)
          rotation: 0,
          zIndex: 1,
          src: mediaData.url,
          alt: mediaData.alt,
          credit: mediaData.credit,
          originalWidth: mediaData.width,
          originalHeight: mediaData.height,
        };
        
        addElement(currentSlide.id, newGifElement);
        console.log('Added Tenor GIF to canvas as image:', newGifElement);
      }
    }
    
    // Handle other media types here
  };

  const handleShapeSelect = (shapeType: string) => {
    setShowShapePopup(false);
    console.log('Shape selected:', shapeType);

    // Get current slide and canvas size
    const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    
    if (currentSlide) {
      // Map shape types to editor shape types
      let mappedShapeType: 'rectangle' | 'circle' | 'triangle';
      let width = 150;
      let height = 100;
      
      switch (shapeType) {
        case 'rectangle':
          mappedShapeType = 'rectangle';
          width = 150;
          height = 100;
          break;
        case 'circle':
          mappedShapeType = 'circle';
          width = 120;
          height = 120;
          break;
        case 'triangle':
          mappedShapeType = 'triangle';
          width = 120;
          height = 100;
          break;
        case 'line':
          mappedShapeType = 'rectangle';
          width = 200;
          height = 4;
          break;
        default:
          mappedShapeType = 'rectangle';
          width = 150;
          height = 100;
          break;
      }
      
      // Use a default position instead of center - user can drag to desired location
      const defaultX = 100; // Start at a reasonable position
      const defaultY = 100;
      
      const newShapeElement = {
        type: 'shape' as const,
        x: defaultX,
        y: defaultY,
        width,
        height,
        rotation: 0,
        zIndex: 1,
        shapeType: mappedShapeType,
        fillColor: shapeType.includes('filled') ? '#3b82f6' : 'transparent',
        strokeColor: shapeType.includes('outline') ? '#000000' : '#3b82f6',
        strokeWidth: shapeType.includes('outline') ? 2 : 0,
      };
      
      addElement(currentSlide.id, newShapeElement);
      console.log('Added shape to canvas:', newShapeElement);
    }
  };

  const handleTextSelect = (textType: string) => {
    setShowTextPopup(false);
    console.log('Text style selected:', textType);
    
    // Handle different text style selections
    if (textType === 'add-text') {
      // Create a new text element on the canvas
      const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore.getState();
      const currentSlide = slides[currentSlideIndex];
      
      if (currentSlide) {
        // Use a default position instead of center - user can drag to desired location
        const defaultX = 100; // Start at a reasonable position
        const defaultY = 100;
        
        const newTextElement = {
          type: 'text' as const,
          x: defaultX,
          y: defaultY,
          width: 200,
          height: 60,
          rotation: 0,
          zIndex: 1,
          content: 'Add text',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left' as const,
          lineHeight: 1.2,
          isEditing: false,
        };
        
        addElement(currentSlide.id, newTextElement);
        console.log('Created new text element at default position');
      }
      return;
    }
    
    if (textType === 'custom') {
      // Handle custom text styling
      console.log('Custom text styling requested');
      return;
    }
    
    // For regular text styles (title, headline, etc.), create new text element with that style
    const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    
    if (currentSlide) {
      // Calculate center position for new text element
      const centerX = (canvasSize.width / 2) - 100;
      const centerY = (canvasSize.height / 2) - 30;
      
      // Define text style properties
      let textContent = 'Add text';
      let fontSize = 16;
      let fontWeight = '400';
      
      switch (textType) {
        case 'title':
          textContent = 'Title';
          fontSize = 32;
          fontWeight = 'bold';
          break;
        case 'headline':
          textContent = 'Headline';
          fontSize = 24;
          fontWeight = 'bold';
          break;
        case 'subheadline':
          textContent = 'Subheadline';
          fontSize = 20;
          fontWeight = 'bold';
          break;
        case 'normal':
          textContent = 'Normal text';
          fontSize = 16;
          fontWeight = 'normal';
          break;
        case 'small':
          textContent = 'Small text';
          fontSize = 14;
          fontWeight = 'normal';
          break;
        case 'bullet':
          textContent = '• Bullet point';
          fontSize = 16;
          fontWeight = 'normal';
          break;
        case 'number':
          textContent = '1. Numbered item';
          fontSize = 16;
          fontWeight = 'normal';
          break;
      }
      
      const newTextElement = {
        type: 'text' as const,
        x: centerX,
        y: centerY,
        width: 200,
        height: 60,
        rotation: 0,
        zIndex: 1,
        content: textContent,
        fontSize,
        fontFamily: 'Inter',
        fontWeight,
        color: '#000000',
        textAlign: 'left' as const,
        lineHeight: 1.2,
        isEditing: false,
      };
      
      addElement(currentSlide.id, newTextElement);
      console.log('Created new text element with style:', textType, 'at center of canvas');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-3 py-2">
        
        {/* Left Section - Presentation Info */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <Home className="w-3.5 h-3.5 text-gray-600" />
            <button 
              onClick={handleMenuClick}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Menu className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-gray-700">Untitled presentation</h1>
            <span className="text-xs text-gray-600">Private</span>
          </div>
        </div>

        {/* Center Section - Editing Tools */}
        <div className="flex items-center space-x-4">
          {/* Text Tool */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleTextClick}
          >
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
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleShapeClick}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center space-x-0.5">
              <div className="w-1 h-1 bg-gray-600 rounded-sm"></div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-600 rotate-45"></div>
            </div>
            <span className="text-xs text-gray-700 font-medium">Shape</span>
          </div>

          {/* Chart Tool */}
          <div 
            className="flex flex-col items-center space-x-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleChartClick}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Chart</span>
          </div>

          {/* Table Tool */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleTableClick}
          >
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

      {/* Shape Popup */}
      <ShapePopup
        isVisible={showShapePopup}
        onClose={() => setShowShapePopup(false)}
        onShapeSelect={handleShapeSelect}
        position={shapePopupPosition}
      />

      {/* Text Styles Popup */}
      <ToolbarTextPopup
        isVisible={showTextPopup}
        onClose={() => setShowTextPopup(false)}
        onStyleSelect={handleTextSelect}
        position={textPopupPosition}
      />

      {/* Presentation Menu Dropdown */}
      <PresentationMenuDropdown
        isVisible={showMenuDropdown}
        onClose={() => setShowMenuDropdown(false)}
        position={menuPosition}
      />

      {/* Chart Popup */}
      <ChartPopup
        isVisible={showChartPopup}
        onClose={() => setShowChartPopup(false)}
        position={chartPopupPosition}
      />

      {/* Table Popup */}
      <TablePopup
        isVisible={showTablePopup}
        onClose={() => setShowTablePopup(false)}
        position={tablePopupPosition}
      />
    </div>
  );
};

export default MainToolbar;
