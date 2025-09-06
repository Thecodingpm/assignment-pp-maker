'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Maximize2, 
  Settings, 
  Share2, 
  Download,
  Eye,
  EyeOff,
  Grid3X3,
  Layers
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import DesignButton from '../DesignSystem/DesignButton';

interface RightCornerToolbarProps {
  onPlay?: () => void;
  onStop?: () => void;
  onFullscreen?: () => void;
  onSettings?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onToggleGrid?: () => void;
  onToggleLayers?: () => void;
}

const RightCornerToolbar: React.FC<RightCornerToolbarProps> = ({
  onPlay,
  onStop,
  onFullscreen,
  onSettings,
  onShare,
  onExport,
  onToggleGrid,
  onToggleLayers
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  
  const { 
    isPresentationMode, 
    startPresentation, 
    exitPresentationMode 
  } = useEditorStore();

  const handlePlayToggle = () => {
    if (isPresentationMode) {
      exitPresentationMode();
    } else {
      startPresentation();
    }
  };

  const handleGridToggle = () => {
    setShowGrid(!showGrid);
    onToggleGrid?.();
  };

  const handleLayersToggle = () => {
    setShowLayers(!showLayers);
    onToggleLayers?.();
  };

  return (
    <div className="fixed top-20 right-8 z-50 flex flex-col space-y-2">
      {/* Design Button */}
      <DesignButton />

      {/* Grid Toggle */}
      <button
        onClick={handleGridToggle}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-lg ${
          showGrid 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
        }`}
        title={showGrid ? 'Hide Grid' : 'Show Grid'}
      >
        <Grid3X3 className="w-5 h-5" />
      </button>

      {/* Layers Toggle */}
      <button
        onClick={handleLayersToggle}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-lg ${
          showLayers 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
        }`}
        title={showLayers ? 'Hide Layers' : 'Show Layers'}
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* Fullscreen */}
      <button
        onClick={onFullscreen}
        className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center transition-colors shadow-lg border border-gray-200"
        title="Enter Fullscreen"
      >
        <Maximize2 className="w-5 h-5" />
      </button>

      {/* Export */}
      <button
        onClick={onExport}
        className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center transition-colors shadow-lg border border-gray-200"
        title="Export Presentation"
      >
        <Download className="w-5 h-5" />
      </button>

      {/* Share */}
      <button
        onClick={onShare}
        className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center transition-colors shadow-lg border border-gray-200"
        title="Share Presentation"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Settings */}
      <button
        onClick={onSettings}
        className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center transition-colors shadow-lg border border-gray-200"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default RightCornerToolbar;
