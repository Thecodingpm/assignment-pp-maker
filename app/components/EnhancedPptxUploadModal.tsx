// Enhanced PPTX Upload Modal Component
// Provides a modal interface for uploading and previewing PPTX files

'use client';

import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, Image, Shapes, Type, Loader2, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { EnhancedPptxParser, PptxDocument } from '../lib/enhancedPptxParser';
import { FontManager } from '../lib/fontManager';
import { ImageProcessor } from '../lib/imageProcessor';
import { ShapeRenderer } from '../lib/shapeRenderer';
import { HighFidelityRenderer, RenderOptions } from '../lib/highFidelityRenderer';

interface EnhancedPptxUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (presentation: PptxDocument) => void;
  onError: (error: string) => void;
}

interface UploadProgress {
  stage: string;
  progress: number;
  message: string;
}

interface PreviewData {
  slideIndex: number;
  totalSlides: number;
  slideData: any;
  renderResult: any;
  warnings: string[];
}

export default function EnhancedPptxUploadModal({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  onError 
}: EnhancedPptxUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedPresentation, setParsedPresentation] = useState<PptxDocument | null>(null);
  
  const parser = new EnhancedPptxParser();
  const fontManager = new FontManager();
  const imageProcessor = new ImageProcessor();
  const shapeRenderer = new ShapeRenderer();
  const highFidelityRenderer = new HighFidelityRenderer();

  const processPptxFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress({ stage: 'parsing', progress: 0, message: 'Parsing PPTX file...' });

      // Step 1: Parse PPTX file
      const presentation = await parser.parsePptxFile(file);
      setParsedPresentation(presentation);
      
      setUploadProgress({ stage: 'fonts', progress: 25, message: 'Loading fonts...' });

      // Step 2: Load fonts
      await fontManager.loadAllFonts(presentation.fonts);
      
      setUploadProgress({ stage: 'images', progress: 50, message: 'Processing images...' });

      // Step 3: Process images (extract from slides)
      const images = this.extractImagesFromSlides(presentation.slides);
      for (const image of images) {
        await imageProcessor.processImage(image.src, {
          width: image.width,
          height: image.height
        });
      }
      
      setUploadProgress({ stage: 'rendering', progress: 75, message: 'Rendering preview...' });

      // Step 4: Render preview
      const renderOptions: RenderOptions = {
        width: 1920,
        height: 1080,
        scale: 1,
        quality: 'high',
        enableFallbacks: true,
        preserveAspectRatio: true
      };
      
      const renderedSlides = await highFidelityRenderer.renderPresentation(presentation, renderOptions);
      const renderResult = renderedSlides[0]; // First slide
      
      setUploadProgress({ stage: 'complete', progress: 100, message: 'Upload complete!' });

      // Step 5: Set preview data
      setPreviewData({
        slideIndex: 0,
        totalSlides: presentation.slides.length,
        slideData: presentation.slides[0],
        renderResult,
        warnings: renderResult.warnings || []
      });

      // Step 6: Complete upload
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(null);
        onUploadComplete(presentation);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('❌ Error processing PPTX file:', error);
      setIsUploading(false);
      setUploadProgress(null);
      onError(error instanceof Error ? error.message : 'Failed to process PPTX file');
    }
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      onError('Please select a valid PPTX file');
      return;
    }

    await processPptxFile(file);
  }, [onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const pptxFile = files.find(file => file.name.toLowerCase().endsWith('.pptx'));
    
    if (pptxFile) {
      processPptxFile(pptxFile);
    } else {
      onError('Please drop a valid PPTX file');
    }
  }, [onError]);

  const handlePreview = useCallback(() => {
    if (parsedPresentation) {
      setShowPreview(true);
    }
  }, [parsedPresentation]);

  const handleDownload = useCallback(() => {
    if (previewData?.renderResult?.dataUrl) {
      const link = document.createElement('a');
      link.href = previewData.renderResult.dataUrl;
      link.download = 'preview.png';
      link.click();
    }
  }, [previewData]);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      onClose();
    }
  }, [isUploading, onClose]);

  // Helper method to extract images from slides
  const extractImagesFromSlides = (slides: any[]) => {
    const images: any[] = [];
    for (const slide of slides) {
      for (const element of slide.elements) {
        if (element.type === 'image') {
          images.push(element);
        }
      }
    }
    return images;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload PPTX File</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {isUploading ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-gray-900">
                  {uploadProgress?.message}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress?.progress || 0}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-500">
                {uploadProgress?.stage === 'parsing' && 'Extracting slides, elements, fonts, and images...'}
                {uploadProgress?.stage === 'fonts' && 'Loading and embedding fonts...'}
                {uploadProgress?.stage === 'images' && 'Processing and optimizing images...'}
                {uploadProgress?.stage === 'rendering' && 'Generating pixel-perfect preview...'}
                {uploadProgress?.stage === 'complete' && 'Upload complete!'}
              </div>
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">
                  Upload Complete
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <strong>{previewData.totalSlides}</strong> slides • 
                <strong> {parsedPresentation?.fonts.length || 0}</strong> fonts • 
                <strong> {extractImagesFromSlides(parsedPresentation?.slides || []).length}</strong> images
              </div>
              
              {previewData.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Rendering Notes:</strong>
                      <ul className="mt-1 space-y-1">
                        {previewData.warnings.map((warning, index) => (
                          <li key={index} className="text-xs">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4" />
                  <span>Text elements preserved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4" />
                  <span>Images optimized</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shapes className="w-4 h-4" />
                  <span>Shapes converted to SVG</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Pixel-perfect rendering</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreview}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('pptx-file-input')?.click()}
            >
              <input
                id="pptx-file-input"
                type="file"
                accept=".pptx"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Upload PPTX File
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag and drop your PowerPoint file here, or click to browse
                  </p>
                </div>
                
                <div className="text-xs text-gray-400">
                  Supports .pptx files with fonts, images, shapes, and complex layouts
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                PPTX Preview - Slide {previewData?.slideIndex! + 1} of {previewData?.totalSlides}
              </h3>
              
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {previewData?.renderResult?.dataUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewData.renderResult.dataUrl}
                    alt="Slide preview"
                    className="max-w-full h-auto shadow-lg rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
