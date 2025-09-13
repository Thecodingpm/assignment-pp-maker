'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image, File, FileImage } from 'lucide-react';
import { exportPresentation, ExportOptions, PresentationData } from '../utils/presentationExport';
import { useEditorStore } from '../stores/useEditorStore';

interface ExportModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isVisible, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'html' | 'pdf' | 'png' | 'jpg' | 'pptx' | 'docx'>('html');
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const { slides } = useEditorStore();

  const exportFormats = [
    {
      id: 'html' as const,
      name: 'HTML',
      description: 'Web-friendly format, viewable in any browser',
      icon: FileText,
      color: 'bg-blue-500',
      recommended: true
    },
    {
      id: 'pdf' as const,
      name: 'PDF',
      description: 'Print-ready format, perfect for sharing',
      icon: File,
      color: 'bg-red-500',
      recommended: true
    },
    {
      id: 'pptx' as const,
      name: 'PowerPoint',
      description: 'Microsoft PowerPoint format - fully editable',
      icon: FileImage,
      color: 'bg-orange-500',
      recommended: true
    },
    {
      id: 'png' as const,
      name: 'PNG Images',
      description: 'High-quality images of each slide',
      icon: Image,
      color: 'bg-green-500',
      recommended: false
    },
    {
      id: 'jpg' as const,
      name: 'JPG Images',
      description: 'Compressed images of each slide',
      icon: Image,
      color: 'bg-purple-500',
      recommended: false
    },
    {
      id: 'docx' as const,
      name: 'Word Document',
      description: 'Microsoft Word format (coming soon)',
      icon: FileText,
      color: 'bg-indigo-500',
      recommended: false,
      disabled: true
    }
  ];

  const handleExport = async () => {
    if (!slides || slides.length === 0) {
      alert('No slides to export!');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Create presentation data
      const presentationData: PresentationData = {
        title: filename || 'My Presentation',
        slides: slides,
        metadata: {
          author: 'Presentation Editor User',
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        }
      };

      // Export options
      const options: ExportOptions = {
        format: selectedFormat,
        filename: filename || undefined,
        includeNotes: false,
        quality: 'high'
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Perform export
      await exportPresentation(presentationData, options);
      
      setExportProgress(100);
      
      // Show success message
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        onClose();
        alert('Presentation exported successfully!');
      }, 500);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
      alert('Export failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Export Presentation</h2>
                  <p className="text-sm text-gray-500">Choose format and download your presentation</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isExporting}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Filename Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filename
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="My Presentation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isExporting}
                />
              </div>

              {/* Export Formats */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    const isSelected = selectedFormat === format.id;
                    const isDisabled = format.disabled || isExporting;
                    
                    return (
                      <button
                        key={format.id}
                        onClick={() => !isDisabled && setSelectedFormat(format.id)}
                        disabled={isDisabled}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 ${format.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{format.name}</h3>
                              {format.recommended && (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Recommended
                                </span>
                              )}
                              {format.disabled && (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{format.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Export Progress */}
              {isExporting && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Exporting...</span>
                    <span className="text-sm text-gray-500">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Export Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Export Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Total slides: {slides.length}</li>
                  <li>• Format: {exportFormats.find(f => f.id === selectedFormat)?.name}</li>
                  <li>• Quality: High resolution</li>
                  {selectedFormat === 'html' && (
                    <li>• HTML format is viewable in any web browser</li>
                  )}
                  {selectedFormat === 'pdf' && (
                    <li>• PDF format is perfect for printing and sharing</li>
                  )}
                  {selectedFormat === 'pptx' && (
                    <li>• PowerPoint format is fully editable in Microsoft PowerPoint</li>
                  )}
                  {selectedFormat === 'png' && (
                    <li>• PNG format provides high-quality images of each slide</li>
                  )}
                  {selectedFormat === 'jpg' && (
                    <li>• JPG format provides compressed images of each slide</li>
                  )}
                  {selectedFormat === 'docx' && (
                    <li>• Word format is coming soon</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClose}
                disabled={isExporting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || !slides || slides.length === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;
