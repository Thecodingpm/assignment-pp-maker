'use client';

import { useState } from 'react';
import { X, Edit3, RefreshCw, Download, ExternalLink } from 'lucide-react';

interface LogoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  logoData: {
    imageUrl: string;
    prompt: string;
    model: string;
    cost: string;
    advanced?: boolean;
  };
  onOpenInEditor: () => void;
  onRegenerate: () => void;
}

export default function LogoPreviewModal({ 
  isOpen, 
  onClose, 
  logoData, 
  onOpenInEditor, 
  onRegenerate 
}: LogoPreviewModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  console.log('🎨 LogoPreviewModal props:', { isOpen, logoData });

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Logo Generated!</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Logo Preview */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
            <img
              src={logoData.imageUrl}
              alt="Generated Logo"
              className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Logo Details */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Logo Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Prompt:</span>
              <span className="text-gray-900 font-medium">{logoData.prompt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="text-gray-900 font-medium">{logoData.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost:</span>
              <span className="text-gray-900 font-medium">{logoData.cost}</span>
            </div>
            {logoData.advanced && (
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="text-blue-600 font-medium">🚀 Advanced AI</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isRegenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </>
            )}
          </button>
          
          <button
            onClick={onOpenInEditor}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Open in Editor
          </button>
        </div>
      </div>
    </div>
  );
}
