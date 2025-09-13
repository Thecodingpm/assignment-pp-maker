'use client';

import React, { useState, useRef, useEffect } from 'react';
import { parsePptxFile, convertToEditorFormat } from '../lib/pptxApi';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, parsedData: any) => Promise<void>;
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent default drag and drop behavior on the entire page when modal is open
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    if (isOpen) {
      document.addEventListener('dragover', preventDefaults);
      document.addEventListener('drop', preventDefaults);
      document.addEventListener('dragenter', preventDefaults);
      document.addEventListener('dragleave', preventDefaults);
    }

    return () => {
      document.removeEventListener('dragover', preventDefaults);
      document.removeEventListener('drop', preventDefaults);
      document.removeEventListener('dragenter', preventDefaults);
      document.removeEventListener('dragleave', preventDefaults);
    };
  }, [isOpen]);

  if (!isOpen) {
    console.log('🚫 UploadModal is closed');
    return null;
  }
  
  console.log('✅ UploadModal is open');

  const handleFileSelect = async (file: File) => {
    if (!file) {
      console.log('❌ No file provided to handleFileSelect');
      return;
    }

    console.log('🎯 handleFileSelect called with file:', file.name, 'size:', file.size);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('📁 Starting upload for:', file.name);
      
      let parsedData = null;
      
      // If it's a PPTX file, parse it with the backend
      if (file.name.toLowerCase().endsWith('.pptx')) {
        console.log('📄 Parsing PPTX with backend...');
        setUploadProgress(25);
        
        try {
          const backendResult = await parsePptxFile(file);
          console.log('📄 Backend parsing result:', backendResult);
          
          // Enhanced debugging for image elements
          console.log('🔍 PPTX Response Analysis:');
          const imageEls = backendResult.slides?.flatMap(s => s.elements?.filter(e => e.type === 'image') || []);
          console.log('🖼️ Image elements found:', imageEls?.length || 0);
          console.log('📊 Image elements details:', imageEls?.map(img => ({
            id: img.id,
            hasSrc: !!(img as any).src,
            srcLength: (img as any).src?.length,
            srcPreview: (img as any).src?.substring(0, 100),
            position: `${img.x}, ${img.y}`,
            size: `${img.width}x${img.height}`
          })) || []);
          
          setUploadProgress(50);
          
          // Convert to editor format
          parsedData = convertToEditorFormat(backendResult);
          console.log('📄 Editor format:', parsedData);
          
          // Debug editor format image elements
          const editorImageEls = parsedData.slides?.flatMap(s => s.elements?.filter(e => e.type === 'image') || []);
          console.log('🎯 Editor format image elements:', editorImageEls?.length || 0);
          console.log('📊 Editor image details:', editorImageEls?.map(img => ({
            id: img.id,
            hasSrc: !!(img as any).src,
            srcLength: (img as any).src?.length,
            srcPreview: (img as any).src?.substring(0, 100),
            position: `${img.x}, ${img.y}`,
            size: `${img.width}x${img.height}`
          })) || []);
          
          setUploadProgress(75);
        } catch (error) {
          console.error('❌ Backend parsing failed:', error);
          // Create fallback data
          parsedData = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            slides: [{
              id: 'slide-1',
              elements: [{
                id: 'text-1',
                type: 'text',
                x: 100,
                y: 100,
                width: 400,
                height: 80,
                content: `Parsed: ${file.name.replace(/\.[^/.]+$/, "")}`,
                fontSize: 24,
                fontFamily: 'Inter',
                fontWeight: '600',
                color: '#1f2937',
                textAlign: 'left',
                lineHeight: 1.2,
                isEditing: false,
                rotation: 0,
                zIndex: 1,
                selected: false
              }],
              backgroundColor: '#ffffff'
            }],
            metadata: {
              originalFileName: file.name,
              slideCount: 1,
              createdAt: new Date().toISOString(),
              parsedByBackend: false
            }
          };
        }
      } else {
        // For non-PPTX files, create basic structure
        parsedData = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          slides: [{
            id: 'slide-1',
            elements: [{
              id: 'text-1',
              type: 'text',
              x: 100,
              y: 100,
              width: 400,
              height: 80,
              content: `Imported: ${file.name.replace(/\.[^/.]+$/, "")}`,
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: '600',
              color: '#1f2937',
              textAlign: 'left',
              lineHeight: 1.2,
              isEditing: false,
              rotation: 0,
              zIndex: 1,
              selected: false
            }],
            backgroundColor: '#ffffff'
          }],
          metadata: {
            originalFileName: file.name,
            slideCount: 1,
            createdAt: new Date().toISOString(),
            parsedByBackend: false
          }
        };
      }

      setUploadProgress(90);
      
      // Call the upload handler
      await onUpload(file, parsedData);
      
      setUploadProgress(100);
      
      // Close modal after successful upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Upload failed. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    console.log('🎯 Drop event triggered');
    console.log('📁 Files dropped:', e.dataTransfer.files.length);
    console.log('📁 DataTransfer types:', e.dataTransfer.types);
    console.log('📁 DataTransfer items:', e.dataTransfer.items.length);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log('📄 Processing dropped file:', files[0].name, 'type:', files[0].type, 'size:', files[0].size);
      handleFileSelect(files[0]);
    } else {
      console.log('❌ No files found in drop event');
      // Try to get files from items
      const items = Array.from(e.dataTransfer.items);
      console.log('📁 Items found:', items.length);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`📁 Item ${i}:`, item.kind, item.type);
        
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            console.log('📄 Found file from item:', file.name, 'type:', file.type, 'size:', file.size);
            handleFileSelect(file);
            return;
          }
        }
      }
      
      // If no files found, show a helpful message
      console.log('❌ No valid files found in drop event');
      alert('Please drag a valid file from your computer, not from within the browser.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
    console.log('🎯 Drag over event triggered');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragActive to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragActive(false);
      console.log('🎯 Drag leave event triggered - leaving drop zone');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('📁 File input changed:', files?.length || 0, 'files');
    if (files && files.length > 0) {
      console.log('📄 File selected via input:', files[0].name);
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Presentation</h2>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!isUploading ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Drag enter event triggered');
              }}
              onClick={() => {
                console.log('🖱️ Drop zone clicked');
                fileInputRef.current?.click();
              }}
              style={{ minHeight: '200px' }}
            >
              <div className="mb-4">
                <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {dragActive ? 'Drop your file now!' : 'Drop your file here'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {dragActive ? 'Release to upload' : 'or click to browse'}
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Choose File
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx,.ppt"
                onChange={handleFileInputChange}
                className="hidden"
                multiple={false}
              />
              
              <p className="text-sm text-gray-500 mt-4">
                Supports PowerPoint files (.pptx, .ppt)
              </p>
              <p className="text-xs text-gray-400 mt-2">
                💡 Drag files from your computer, not from within the browser
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing your file...
              </h3>
              
              <p className="text-gray-600 mb-4">
                Parsing presentation content
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">
                {uploadProgress}% complete
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
