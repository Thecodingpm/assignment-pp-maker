'use client';

import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Image, 
  FileText, 
  Palette,
  Monitor,
  Smartphone,
  Printer,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface LogoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoExportModal: React.FC<LogoExportModalProps> = ({ isOpen, onClose }) => {
  const { slides, currentSlideIndex, canvasSize } = useEditorStore();
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'svg' | 'pdf'>('png');
  const [exportSize, setExportSize] = useState<'original' | 'web' | 'print' | 'social'>('original');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [transparent, setTransparent] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentSlide = slides[currentSlideIndex];

  const getExportDimensions = () => {
    switch (exportSize) {
      case 'web':
        return { width: 800, height: 600 };
      case 'print':
        return { width: 2400, height: 1800 };
      case 'social':
        return { width: 1080, height: 1080 };
      default:
        return { width: canvasSize.width, height: canvasSize.height };
    }
  };

  const handleExport = async () => {
    const dimensions = getExportDimensions();
    console.log('Exporting logo:', {
      format: exportFormat,
      size: exportSize,
      dimensions,
      backgroundColor: transparent ? 'transparent' : backgroundColor
    });

    // Here you would implement the actual export logic
    // For now, we'll just show a success message
    alert(`Logo exported as ${exportFormat.toUpperCase()} (${dimensions.width}x${dimensions.height})`);
    onClose();
  };

  const handleCopyToClipboard = async () => {
    try {
      // Here you would implement copying the logo to clipboard
      await navigator.clipboard.writeText('Logo copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Download className="w-6 h-6 text-blue-600" />
            Export Logo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { format: 'png', label: 'PNG', icon: Image, desc: 'Best for web, supports transparency' },
                { format: 'jpg', label: 'JPG', icon: Image, desc: 'Smaller file size, no transparency' },
                { format: 'svg', label: 'SVG', icon: FileText, desc: 'Vector format, scalable' },
                { format: 'pdf', label: 'PDF', icon: FileText, desc: 'Print-ready format' }
              ].map(({ format, label, icon: Icon, desc }) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format as any)}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    exportFormat === format
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Size</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { size: 'original', label: 'Original', icon: Monitor, desc: `${canvasSize.width} × ${canvasSize.height}px` },
                { size: 'web', label: 'Web', icon: Monitor, desc: '800 × 600px' },
                { size: 'print', label: 'Print', icon: Printer, desc: '2400 × 1800px (300 DPI)' },
                { size: 'social', label: 'Social Media', icon: Smartphone, desc: '1080 × 1080px' }
              ].map(({ size, label, icon: Icon, desc }) => (
                <button
                  key={size}
                  onClick={() => setExportSize(size as any)}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    exportSize === size
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <p className="text-sm text-gray-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Background Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Background</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="transparent"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="transparent" className="text-sm text-gray-700">
                  Transparent background
                </label>
              </div>

              {!transparent && (
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-700">Background color:</label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-center">
                <div className="inline-block bg-white border border-gray-200 rounded p-4 shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">
                    {exportFormat.toUpperCase()} • {getExportDimensions().width} × {getExportDimensions().height}px
                  </div>
                  <div className="text-xs text-gray-400">
                    Logo preview will appear here
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoExportModal;
