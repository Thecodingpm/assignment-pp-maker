'use client';

import React from 'react';
import { X, Play, Plus, Image, Type, Shapes, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface PresentationModeModalProps {
  isVisible: boolean;
  modalType: string;
  onClose: () => void;
  onStartPresentation: () => void;
  onAddContent: () => void;
}

const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isVisible,
  modalType,
  onClose,
  onStartPresentation,
  onAddContent,
}) => {
  if (!isVisible) return null;

  const renderModalContent = () => {
    switch (modalType) {
      case 'empty':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Empty Presentation</h3>
            <p className="text-gray-600 mb-6">
              Your presentation is empty. Add some content before presenting to make it more engaging.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onAddContent}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Content</span>
              </button>
              <button
                onClick={onStartPresentation}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Present Anyway</span>
              </button>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Minimal Content</h3>
            <p className="text-gray-600 mb-6">
              Your presentation has minimal content. Consider adding more slides or elements to create a richer experience.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onAddContent}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Content</span>
              </button>
              <button
                onClick={onStartPresentation}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Presentation</span>
              </button>
            </div>
          </div>
        );

      case 'rich':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Rich Content Detected</h3>
            <p className="text-gray-600 mb-6">
              Great! Your presentation has a good mix of text, images, and shapes. This will create an engaging presentation experience.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onStartPresentation}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Presentation</span>
              </button>
              <button
                onClick={onAddContent}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Content</span>
              </button>
            </div>
          </div>
        );

      case 'text-heavy':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Type className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Text-Heavy Presentation</h3>
            <p className="text-gray-600 mb-6">
              Your presentation is mostly text-based. Consider adding images, shapes, or charts to make it more visually appealing.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onAddContent}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Image className="w-4 h-4" />
                <span>Add Visual Elements</span>
              </button>
              <button
                onClick={onStartPresentation}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Present as Text</span>
              </button>
            </div>
          </div>
        );

      case 'ready':
      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Present</h3>
            <p className="text-gray-600 mb-6">
              Your presentation looks good! You're ready to start presenting to your audience.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onStartPresentation}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Presentation</span>
              </button>
              <button
                onClick={onAddContent}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Content</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {renderModalContent()}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Use arrow keys or click to navigate during presentation
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresentationModeModal;
