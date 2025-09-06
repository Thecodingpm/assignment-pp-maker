'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface SimpleImportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const SimpleImportModal: React.FC<SimpleImportModalProps> = ({
  isVisible,
  onClose,
  onImport
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ['.pptx', '.ppt', '.pdf'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setErrorMessage('Please select a valid PowerPoint file (.pptx, .ppt) or PDF file');
      setUploadStatus('error');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size must be less than 50MB');
      setUploadStatus('error');
      return;
    }

    setErrorMessage('');
    setUploadStatus('uploading');
    
    try {
      // Simulate quick processing (no actual upload)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadStatus('success');
      onImport(file);
      
      // Close modal after successful import
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setErrorMessage('');
      }, 1500);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage('Failed to process the file. Please try a different file.');
      setUploadStatus('error');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Import PowerPoint file</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Import your .pptx files to get started. We support files from Google Slides, Keynote, and other tools.
          </p>

          {/* Drag and Drop Area */}
          <div
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl mb-6 cursor-pointer hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pptx,.ppt,.pdf"
              onChange={handleFileInputChange}
            />
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Drag & drop your file here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">(.pptx, .ppt, .pdf up to 50MB)</p>
          </div>

          {uploadStatus === 'uploading' && (
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-700">Processing file...</span>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <span className="text-green-700">File processed successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center p-4 bg-red-50 rounded-lg mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <span className="text-red-700">{errorMessage}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleImportModal;
