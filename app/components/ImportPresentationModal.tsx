'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parsePptxFile, convertToEditorFormat } from '../utils/pptxParser';
import { uploadPresentation } from '../lib/unifiedStorage';

interface ImportPresentationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImport: (file: File, parsedData?: any, s3Data?: any) => void;
  userId?: string;
}

const ImportPresentationModal: React.FC<ImportPresentationModalProps> = ({
  isVisible,
  onClose,
  onImport,
  userId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

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
      let parsedData = null;
      let s3Data = null;
      
      // Upload file to S3 first
      if (userId) {
        console.log('Uploading file to S3...');
        const uploadResult = await uploadPresentation(file, userId);
        
        if (uploadResult.success) {
          s3Data = {
            s3Url: uploadResult.url,
            s3Key: uploadResult.key,
            originalFileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            isImported: true
          };
          console.log('File uploaded to S3 successfully:', s3Data);
        } else {
          throw new Error(uploadResult.error || 'Failed to upload to S3');
        }
      }
      
      // Parse PPTX files for full editability
      if (fileExtension === '.pptx') {
        console.log('Parsing PPTX file for full editability...');
        const parsedPresentation = await parsePptxFile(file);
        parsedData = convertToEditorFormat(parsedPresentation);
        console.log('PPTX parsed successfully:', parsedData);
      }
      
      setUploadStatus('success');
      onImport(file, parsedData, s3Data);
      
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Import PowerPoint file</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Import a .pptx file here. Not using PowerPoint? Tools like Google Slides and Keynote can export to this format.{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">Learn more</a>
          </p>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : uploadStatus === 'success'
                ? 'border-green-500 bg-green-50'
                : uploadStatus === 'error'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            {uploadStatus === 'uploading' ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading...</h3>
                  <p className="text-gray-600">Processing your presentation</p>
                </div>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Successful!</h3>
                  <p className="text-gray-600">Your presentation has been added to "By me"</p>
                </div>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Failed</h3>
                  <p className="text-red-600">{errorMessage}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Click here or drag to upload</h3>
                  <p className="text-gray-600">Supports .pptx, .ppt, and .pdf files</p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Upload Button */}
          {uploadStatus === 'idle' && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Choose File</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {uploadStatus === 'error' && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setUploadStatus('idle');
                  setErrorMessage('');
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportPresentationModal;
