import React, { useState } from 'react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    name: string;
    url: string;
    size: number;
    format: string;
    uploadTime: string;
  };
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  image,
  onRename,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(image.name);

  if (!isOpen) return null;

  const handleRename = () => {
    if (newName.trim() && newName !== image.name) {
      onRename(image.id, newName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this image?')) {
      onDelete(image.id);
      onClose();
    }
    setShowMenu(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileFormat = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex-1">
            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                className="text-lg font-medium bg-transparent border-none outline-none w-full"
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-medium text-gray-900 truncate">
                {image.name}
              </h2>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Three dots menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsRenaming(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Rename
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
          <img
            src={image.url}
            alt={image.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.png';
            }}
          />
        </div>

        {/* Footer with image details */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="font-medium">{getFileFormat(image.name)}</span>
              <span>{formatFileSize(image.size)}</span>
            </div>
            <div className="text-gray-500">
              Added {image.uploadTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;


