import React, { useState, useEffect, useRef } from 'react';

interface FontPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onFontSelect: (font: any) => void;
  position: { x: number; y: number };
  currentFont?: string;
}

const FontPicker: React.FC<FontPickerProps> = ({
  isVisible,
  onClose,
  onFontSelect,
  position,
  currentFont = 'Arial'
}) => {
  const [selectedTab, setSelectedTab] = useState<'uploaded' | 'google'>('uploaded');
  const [uploadedFonts, setUploadedFonts] = useState<any[]>([]);
  const [googleFonts, setGoogleFonts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const popupRef = useRef<HTMLDivElement>(null);

  // Calculate adjusted position to prevent viewport overflow
  useEffect(() => {
    if (isVisible) {
      const modalWidth = 400;
      const modalHeight = 500;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = position.x;
      let adjustedY = position.y;
      
      // Adjust horizontal position to prevent right overflow
      if (position.x + modalWidth > viewportWidth - 20) {
        adjustedX = Math.max(20, viewportWidth - modalWidth - 20);
      }
      
      // Adjust vertical position to prevent bottom overflow
      if (position.y + modalHeight > viewportHeight - 20) {
        adjustedY = Math.max(20, viewportHeight - modalHeight - 20);
      }
      
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isVisible, position]);

  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  // Fetch fonts when popup opens
  useEffect(() => {
    if (isVisible) {
      if (selectedTab === 'uploaded') {
        fetchUploadedFonts();
      } else {
        fetchGoogleFonts();
      }
    }
  }, [isVisible, selectedTab]);

  const fetchUploadedFonts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-fonts');
      const data = await response.json();
      if (data.success) {
        setUploadedFonts(data.fonts);
      }
    } catch (error) {
      console.error('Error fetching uploaded fonts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogleFonts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: 'popularity',
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`/api/google-fonts?${params}`);
      const data = await response.json();
      if (data.success) {
        setGoogleFonts(data.fonts);
      }
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFontSelect = (font: any) => {
    onFontSelect(font);
    onClose();
  };

  const loadGoogleFont = (font: any) => {
    // Load Google Font dynamically
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };

  const getFilteredFonts = () => {
    const fonts = selectedTab === 'uploaded' ? uploadedFonts : googleFonts;
    if (!searchQuery.trim()) {
      return fonts;
    }
    return fonts.filter(font => 
      font.family.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (!isVisible) return null;

  return (
    <div
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        width: '400px',
        maxHeight: '500px'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Font</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search fonts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('uploaded')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            selectedTab === 'uploaded'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Fonts ({uploadedFonts.length})
        </button>
        <button
          onClick={() => setSelectedTab('google')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            selectedTab === 'google'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Google Fonts
        </button>
      </div>

      {/* Font List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="p-2">
            {getFilteredFonts().map((font) => (
              <div
                key={font.id}
                onClick={() => {
                  if (selectedTab === 'google') {
                    loadGoogleFont(font);
                  }
                  handleFontSelect(font);
                }}
                className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div
                      className="text-lg font-medium text-gray-900 mb-1"
                      style={{ 
                        fontFamily: font.family,
                        fontWeight: font.weight || '400',
                        fontStyle: font.style || 'normal'
                      }}
                    >
                      {font.family}
                    </div>
                    <div
                      className="text-sm text-gray-600"
                      style={{ 
                        fontFamily: font.family,
                        fontWeight: font.weight || '400',
                        fontStyle: font.style || 'normal'
                      }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </div>
                  </div>
                  {selectedTab === 'uploaded' && (
                    <div className="ml-4 text-xs text-gray-500">
                      {font.format?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {getFilteredFonts().length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'No fonts found matching your search' : 'No fonts available'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {selectedTab === 'uploaded' 
            ? 'Upload custom fonts in the Library section'
            : 'Google Fonts are loaded from Google Fonts API'
          }
        </div>
      </div>
    </div>
  );
};

export default FontPicker;


