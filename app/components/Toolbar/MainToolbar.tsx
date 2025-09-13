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
  Settings,
  Diamond,
  Download
} from 'lucide-react';
import MediaPopup from '../Editor/MediaPopup';
import ShapePopup from '../Editor/ShapePopup';
import ToolbarTextPopup from '../Editor/ToolbarTextPopup';
import PresentationMenuDropdown from '../Editor/PresentationMenuDropdown';
import ChartPopup, { getChartOption } from '../Editor/ChartPopup';
import TablePopup from '../Editor/TablePopup';
import EmbedPopup from '../Editor/EmbedPopup';
// import SlideTransitionPanel from '../Editor/SlideTransitionPanel';
import PresentationModeModal from '../PresentationModeModal';
import PresentationMode from '../PresentationMode';
import DesignButton from '../DesignSystem/DesignButton';
import AddContentModal from '../AddContentModal';
import ExportModal from '../ExportModal';
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
  const [showEmbedPopup, setShowEmbedPopup] = useState(false);
  const [embedPopupPosition, setEmbedPopupPosition] = useState({ x: 0, y: 0 });
  const [showSlideTransitionPanel, setShowSlideTransitionPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Presentation mode state
  const { 
    showPresentationModal, 
    presentationModalType, 
    setShowPresentationModal, 
    enterPresentationMode,
    isPresentationMode,
    startPresentation,
    exitPresentationMode,
    addSlide,
    createTextElement,
    showAddContentModal,
    setShowAddContentModal
  } = useEditorStore();

  // Presentation handlers
  const handlePlayClick = () => {
    if (isPresentationMode) {
      exitPresentationMode();
    } else {
      startPresentation();
    }
  };

  const handleAddContent = () => {
    // Add a new slide with some default content
    addSlide();
    // Add a text element to the new slide
    setTimeout(() => {
      createTextElement(100, 100);
    }, 100);
  };

  const handlePlusClick = () => {
    setShowAddContentModal(true);
  };

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

  const handleChartInsert = (chartType: string) => {
    setShowChartPopup(false);
    console.log('Chart selected:', chartType);
    
    // Add the chart to the canvas
    const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore.getState();
    const currentSlide = slides[currentSlideIndex];
    
    if (currentSlide) {
      // Calculate center position for new chart element
      const centerX = (canvasSize.width / 2) - 200;
      const centerY = (canvasSize.height / 2) - 150;
      
      const newChartElement = {
        type: 'chart' as const,
        x: centerX,
        y: centerY,
        width: 400,
        height: 300,
        rotation: 0,
        zIndex: 1,
        chartType: chartType,
        chartOption: getChartOption(chartType)
      };
      
      addElement(currentSlide.id, newChartElement);
      console.log('Added chart to canvas:', newChartElement);
    }
  };

  const handleEmbed = (type: string, url: string) => {
    setShowEmbedPopup(false);
    console.log('Embed selected:', type, url);
    
    // Handle different embedding types
    if (type === 'youtube') {
      // Extract video ID from YouTube URL
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        // Add the embedded video to the canvas
        const { slides, currentSlideIndex, addElement, canvasSize } = useEditorStore.getState();
        const currentSlide = slides[currentSlideIndex];
        
        if (currentSlide) {
          const centerX = (canvasSize.width / 2) - 150;
          const centerY = (canvasSize.height / 2) - 112;
          
          const newEmbedElement = {
            type: 'embed' as const,
            x: centerX,
            y: centerY,
            width: 300,
            height: 225,
            rotation: 0,
            zIndex: 1,
            embedType: 'youtube',
            embedUrl: url,
            videoId: videoId,
            title: 'YouTube Video',
          };
          
          addElement(currentSlide.id, newEmbedElement);
          console.log('Added YouTube embed to canvas:', newEmbedElement);
        }
      } else {
        console.error('Invalid YouTube URL');
        // You could show an error message to the user here
      }
    }
    // Add more embedding types here as needed
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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

  const handleEmbedClick = (e: React.MouseEvent) => {
    console.log('🔗 Embed button clicked!');
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate position to center the popup on screen
    const popupWidth = 700;
    const popupHeight = 600;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const position = {
      x: Math.max(20, Math.min(screenWidth - popupWidth - 20, rect.left - popupWidth / 2)),
      y: Math.max(20, rect.bottom + 10)
    };
    
    console.log('📍 Setting embed popup position:', position);
    setEmbedPopupPosition(position);
    setShowEmbedPopup(true);
    console.log('✅ showEmbedPopup set to true');
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
      // Map shape types to editor shape types with proper dimensions
      let mappedShapeType: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star' | 'line';
      let width = 150;
      let height = 100;
      
      switch (shapeType) {
        // Basic shapes
        case 'square-filled':
        case 'square-outline':
        case 'rounded-square-filled':
        case 'rounded-square-outline':
          mappedShapeType = 'rectangle';
          width = 120;
          height = 120;
          break;
        case 'circle-filled':
        case 'circle-outline':
          mappedShapeType = 'circle';
          width = 120;
          height = 120;
          break;
        case 'triangle-filled':
        case 'triangle-outline':
          mappedShapeType = 'triangle';
          width = 120;
          height = 100;
          break;
        case 'diamond-filled':
        case 'diamond-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'star-filled':
        case 'star-outline':
          mappedShapeType = 'star';
          width = 120;
          height = 120;
          break;
        
        // Geometric shapes
        case 'hexagon-filled':
        case 'hexagon-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'octagon-filled':
        case 'octagon-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'pentagon-filled':
        case 'pentagon-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'ellipse-filled':
        case 'ellipse-outline':
          mappedShapeType = 'circle';
          width = 150;
          height = 100;
          break;
        case 'cross-filled':
        case 'cross-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'plus-filled':
        case 'plus-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        
        // Flowchart shapes
        case 'rectangle-flowchart':
        case 'rectangle-flowchart-outline':
          mappedShapeType = 'rectangle';
          width = 150;
          height = 100;
          break;
        case 'diamond-flowchart':
        case 'diamond-flowchart-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'oval-flowchart':
        case 'oval-flowchart-outline':
          mappedShapeType = 'circle';
          width = 150;
          height = 100;
          break;
        case 'parallelogram-flowchart':
        case 'parallelogram-flowchart-outline':
          mappedShapeType = 'diamond';
          width = 150;
          height = 100;
          break;
        case 'cylinder-flowchart':
        case 'cylinder-flowchart-outline':
          mappedShapeType = 'circle';
          width = 120;
          height = 120;
          break;
        case 'document-flowchart':
        case 'document-flowchart-outline':
          mappedShapeType = 'rectangle';
          width = 120;
          height = 150;
          break;
        
        // Decorative shapes
        case 'heart-filled':
        case 'heart-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'cloud-filled':
        case 'cloud-outline':
          mappedShapeType = 'circle';
          width = 150;
          height = 100;
          break;
        case 'sun-filled':
        case 'sun-outline':
          mappedShapeType = 'circle';
          width = 120;
          height = 120;
          break;
        case 'moon-filled':
        case 'moon-outline':
          mappedShapeType = 'circle';
          width = 120;
          height = 120;
          break;
        case 'flower-filled':
        case 'flower-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 120;
          break;
        case 'leaf-filled':
        case 'leaf-outline':
          mappedShapeType = 'diamond';
          width = 120;
          height = 100;
          break;
        
        // Lines
        case 'line-solid':
        case 'line-dashed':
          mappedShapeType = 'line';
          width = 200;
          height = 4;
          break;
        case 'line-arrow-right':
        case 'line-dashed-arrow-right':
          mappedShapeType = 'line';
          width = 200;
          height = 4;
          break;
        case 'line-arrow-both':
        case 'line-dashed-arrow-both':
          mappedShapeType = 'line';
          width = 200;
          height = 4;
          break;
        case 'line-arrow-left-dot':
        case 'line-dashed-arrow-left-dot':
          mappedShapeType = 'line';
          width = 200;
          height = 4;
          break;
        case 'line-dot-arrow-right':
        case 'line-dashed-dot-arrow-right':
          mappedShapeType = 'line';
          width = 200;
          height = 4;
          break;
        case 'line-bar-arrow-right':
        case 'line-dashed-bar-arrow-right':
          mappedShapeType = 'line';
          width = 200;
          height = 4;
          break;
        
        // Default
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
        // Add specific properties for different shapes
        isRounded: shapeType.includes('rounded'),
        hasArrows: shapeType.includes('arrow'),
        hasDots: shapeType.includes('dot'),
        hasBars: shapeType.includes('bar'),
        isDashed: shapeType.includes('dashed'),
        lineStyle: shapeType.includes('dashed') ? 'dashed' : 'solid',
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
    <div className="fixed top-2 left-2 right-2 z-50 bg-white rounded-lg shadow-lg">
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
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleEmbedClick}
            title="Click to open embed popup"
          >
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

          {/* Slide Transition Tool */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={() => setShowSlideTransitionPanel(true)}
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Diamond className="w-4 h-4 text-gray-700" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Transitions</span>
          </div>
        </div>

        {/* Right Section - User Actions */}
        <div className="flex items-center space-x-2">
          {/* Plus Button */}
          <button 
            onClick={handlePlusClick}
            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            title="Add content"
          >
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

          {/* Design Button */}
          <div className="ml-2">
            <DesignButton />
          </div>

          {/* Play Button */}
          <button 
            onClick={handlePlayClick}
            className={`px-2 py-1 border rounded-lg flex items-center space-x-1 transition-colors ${
              isPresentationMode 
                ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' 
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
            }`}
            title={isPresentationMode ? 'Stop Presentation' : 'Play Presentation'}
          >
            {isPresentationMode ? (
              <Square className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {isPresentationMode ? 'Stop' : 'Play'}
            </span>
          </button>

          {/* Export Button */}
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-xs transition-colors flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
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
        onInsertChart={handleChartInsert}
      />

      {/* Table Popup */}
      <TablePopup
        isVisible={showTablePopup}
        onClose={() => setShowTablePopup(false)}
        position={tablePopupPosition}
      />

      {/* Embed Popup */}
      <EmbedPopup
        isVisible={showEmbedPopup}
        onClose={() => setShowEmbedPopup(false)}
        onEmbed={handleEmbed}
        position={embedPopupPosition}
      />

      {/* Slide Transition Panel */}
      {/* <SlideTransitionPanel
        isVisible={showSlideTransitionPanel}
        onClose={() => setShowSlideTransitionPanel(false)}
      /> */}

      {/* Presentation Mode Modal */}
      <PresentationModeModal
        isVisible={showPresentationModal}
        modalType={presentationModalType}
        onClose={() => setShowPresentationModal(false)}
        onStartPresentation={enterPresentationMode}
        onAddContent={handleAddContent}
      />
      
      {/* Presentation Mode */}
      <PresentationMode />

      {/* Add Content Modal */}
      <AddContentModal
        isVisible={showAddContentModal}
        onClose={() => setShowAddContentModal(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isVisible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default MainToolbar;
