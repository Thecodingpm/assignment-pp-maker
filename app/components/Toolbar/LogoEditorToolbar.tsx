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
  Circle,
  Triangle,
  Diamond,
  Star,
  Palette,
  Download,
  Save,
  Undo,
  Redo,
  Layers,
  Grid,
  Eye,
  EyeOff,
  RotateCw,
  Move,
  Crop,
  Filter,
  Sparkles
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import LogoExportModal from '../Export/LogoExportModal';

const LogoEditorToolbar: React.FC = () => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  const { 
    slides,
    currentSlideIndex,
    addElement,
    createTextElement,
    createShapeElement,
    createImageElement,
    canvasSize,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditorStore();

  const currentSlide = slides[currentSlideIndex];

  // Logo-specific tools
  const handleAddText = () => {
    if (currentSlide) {
      createTextElement(200, 200);
    }
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star') => {
    if (currentSlide) {
      createShapeElement(200, 200, shapeType);
    }
  };

  const handleAddImage = () => {
    // Trigger file input for image upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (currentSlide && event.target?.result) {
            createImageElement(200, 200, event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleUndo = () => {
    if (canUndo) {
      undo();
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
    }
  };

  const handleSave = () => {
    // Save logo functionality
    console.log('Saving logo...');
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  return (
    <div className="fixed top-2 left-2 right-2 z-50 bg-white rounded-lg shadow-lg">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-3 py-2">
        
        {/* Left Section - Logo Info */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <Home className="w-3.5 h-3.5 text-gray-600" />
            <button 
              onClick={() => setShowLayerPanel(!showLayerPanel)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Menu className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-gray-700">Logo Editor</h1>
            <span className="text-xs text-gray-600">Professional Logo Design</span>
          </div>
        </div>

        {/* Center Section - Logo Design Tools */}
        <div className="flex items-center space-x-4">
          {/* Text Tool */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleAddText}
            title="Add Text"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Type className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Text</span>
          </div>

          {/* Shape Tools */}
          <div className="flex items-center space-x-2">
            {/* Rectangle */}
            <div 
              className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
              onClick={() => handleAddShape('rectangle')}
              title="Add Rectangle"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Square className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-700 font-medium">Rect</span>
            </div>

            {/* Circle */}
            <div 
              className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
              onClick={() => handleAddShape('circle')}
              title="Add Circle"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Circle className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs text-gray-700 font-medium">Circle</span>
            </div>

            {/* Triangle */}
            <div 
              className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
              onClick={() => handleAddShape('triangle')}
              title="Add Triangle"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Triangle className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-xs text-gray-700 font-medium">Triangle</span>
            </div>

            {/* Diamond */}
            <div 
              className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
              onClick={() => handleAddShape('diamond')}
              title="Add Diamond"
            >
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <Diamond className="w-4 h-4 text-pink-600" />
              </div>
              <span className="text-xs text-gray-700 font-medium">Diamond</span>
            </div>

            {/* Star */}
            <div 
              className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
              onClick={() => handleAddShape('star')}
              title="Add Star"
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-700 font-medium">Star</span>
            </div>
          </div>

          {/* Image Tool */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={handleAddImage}
            title="Add Image"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Image</span>
          </div>

          {/* Color Picker */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color Picker"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Colors</span>
          </div>

          {/* AI Enhance */}
          <div 
            className="flex flex-col items-center space-y-0.5 cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors"
            title="AI Enhance Logo"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-gray-700 font-medium">AI Enhance</span>
          </div>
        </div>

        {/* Right Section - Actions & Tools */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <button 
            onClick={handleUndo}
            disabled={!canUndo}
            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5 text-gray-600" />
          </button>

          <button 
            onClick={handleRedo}
            disabled={!canRedo}
            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Grid Toggle */}
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Guides Toggle */}
          <button 
            onClick={() => setShowGuides(!showGuides)}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              showGuides ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle Guides"
          >
            {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Layers */}
          <button 
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              showLayerPanel ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Toggle Layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Profile Picture */}
          <div className="relative">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">A</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-xs transition-colors flex items-center space-x-1"
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>

          {/* Export Button */}
          <button 
            onClick={handleExport}
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

      {/* Color Picker Panel */}
      {showColorPicker && (
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Colors:</span>
            
            {/* Preset Colors */}
            <div className="flex items-center space-x-2">
              {[
                '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
                '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
              ].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Custom Color Picker */}
            <input
              type="color"
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              title="Custom Color"
            />
          </div>
        </div>
      )}

      {/* Layer Panel */}
      {showLayerPanel && (
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Layers</span>
            <button className="text-xs text-blue-600 hover:text-blue-800">Add Layer</button>
          </div>
          
          <div className="space-y-1">
            {currentSlide?.elements?.map((element, index) => (
              <div key={element.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-xs text-gray-700 flex-1">
                  {element.type === 'text' ? 'Text' : 
                   element.type === 'image' ? 'Image' : 
                   element.type === 'shape' ? 'Shape' : 'Element'} {index + 1}
                </span>
                <button className="text-xs text-red-600 hover:text-red-800">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Modal */}
      <LogoExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default LogoEditorToolbar;
