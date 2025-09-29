import React, { useRef, useState } from 'react';

interface UploadFontsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fonts: any[]) => void; // Callback for successful upload
}

const UploadFontsModal: React.FC<UploadFontsModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload-font', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUpload(result.uploaded);
        // Show success message
        alert(`Successfully uploaded ${result.uploaded.length} font(s)!`);
        onClose();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload fonts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Fonts</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={uploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <p className="text-gray-600 mb-6">
          Upload your custom font files. Supported formats: WOFF2, WOFF, TTF, OTF
        </p>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed ${
            dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'
          } rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={uploading ? undefined : handleClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto mb-4 relative">
              {/* Font icon */}
              <div className="absolute inset-0 bg-purple-500 rounded-lg flex items-center justify-center transform rotate-3 shadow-md">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              {/* Text icon overlay */}
              <div className="absolute inset-0 border-2 border-white rounded-lg flex items-center justify-center transform -rotate-3 opacity-75">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
          )}
          
          <p className="text-gray-700 font-medium mt-4">
            {uploading ? 'Uploading fonts...' : 'Click here or drag to upload'}
          </p>
          {!uploading && (
            <p className="text-gray-500 text-sm mt-2">
              Multiple files supported
            </p>
          )}
        </div>

        {/* Supported Formats */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Supported: WOFF2, WOFF, TTF, OTF
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadFontsModal;


