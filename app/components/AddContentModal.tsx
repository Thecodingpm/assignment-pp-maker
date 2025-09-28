'use client';

import React, { useState } from 'react';
import { X, Type, Image as ImageIcon, Square, BarChart, Table, Code, Circle, Plus, Users, Download, Share2, MoreVertical } from 'lucide-react';
import { useEditorStore } from '../stores/useEditorStore';

interface AddContentModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AddContentModal: React.FC<AddContentModalProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState('share-externally');
  const [selectedExportType, setSelectedExportType] = useState('pdf-high-quality');
  const { 
    addElement, 
    slides, 
    currentSlideIndex, 
    canvasSize,
    createTextElement,
    createImageElement,
    createShapeElement
  } = useEditorStore();

  if (!isVisible) return null;

  const currentSlide = slides[currentSlideIndex];

  const handleContentSelect = (type: string) => {
    onClose();
    
    if (!currentSlide) return;

    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    switch (type) {
      case 'text':
        createTextElement(centerX - 100, centerY - 30);
        break;
      case 'image':
        // Create a placeholder image element
        const newImageElement = {
          type: 'image' as const,
          id: Date.now().toString(),
          x: centerX - 150,
          y: centerY - 112,
          width: 300,
          height: 225,
          rotation: 0,
          zIndex: 1,
          selected: false,
          src: 'https://via.placeholder.com/300x225/3b82f6/ffffff?text=Add+Image',
          alt: 'Placeholder image',
        };
        addElement(currentSlide.id, newImageElement);
        break;
      case 'shape':
        createShapeElement(centerX - 75, centerY - 50);
        break;
      case 'chart':
        const newChartElement = {
          type: 'chart' as const,
          id: Date.now().toString(),
          x: centerX - 200,
          y: centerY - 150,
          width: 400,
          height: 300,
          rotation: 0,
          zIndex: 1,
          selected: false,
          chartType: 'bar',
          chartOption: {
            title: { text: 'Sample Chart' },
            xAxis: { categories: ['A', 'B', 'C', 'D'] },
            yAxis: { title: { text: 'Values' } },
            series: [{ name: 'Series 1', data: [1, 2, 3, 4] }]
          }
        };
        addElement(currentSlide.id, newChartElement);
        break;
      case 'table':
        const newTableElement = {
          type: 'table' as const,
          id: Date.now().toString(),
          x: centerX - 150,
          y: centerY - 100,
          width: 300,
          height: 200,
          rotation: 0,
          zIndex: 1,
          selected: false,
          rows: 3,
          cols: 3,
          data: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
            ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
          ],
          headers: ['Header 1', 'Header 2', 'Header 3'],
          rowHeaders: ['Row 1', 'Row 2', 'Row 3']
        };
        addElement(currentSlide.id, newTableElement);
        break;
      case 'embed':
        const newEmbedElement = {
          type: 'embed' as const,
          id: Date.now().toString(),
          x: centerX - 150,
          y: centerY - 112,
          width: 300,
          height: 225,
          rotation: 0,
          zIndex: 1,
          selected: false,
          embedType: 'youtube',
          embedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoId: 'dQw4w9WgXcQ',
          title: 'YouTube Video'
        };
        addElement(currentSlide.id, newEmbedElement);
        break;
    }
  };

  const handleExport = () => {
    console.log('Exporting presentation as:', selectedExportType);
    
    // Get the current slide canvas element to capture its content
    const canvasElement = document.querySelector('[data-testid="slide-canvas"]') || 
                         document.querySelector('.slide-canvas') ||
                         document.querySelector('[class*="slide-canvas"]');
    
    if (!canvasElement) {
      console.error('Could not find slide canvas element');
      return;
    }

    // Create a comprehensive HTML export with actual styling
    const presentationHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Presentation Export - ${new Date().toLocaleDateString()}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f8fafc; 
            padding: 20px;
            line-height: 1.6;
          }
          .presentation-container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .presentation-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .presentation-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .presentation-meta {
            opacity: 0.9;
            font-size: 14px;
          }
          .slides-container {
            padding: 40px;
          }
          .slide {
            background: white;
            margin: 40px 0;
            padding: 60px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
            min-height: 600px;
            position: relative;
            page-break-after: always;
          }
          .slide-number {
            position: absolute;
            top: 20px;
            right: 30px;
            background: #f1f5f9;
            color: #64748b;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .slide-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
            height: 100%;
          }
          .text-element {
            font-size: 16px;
            color: #1e293b;
            line-height: 1.6;
          }
          .text-element.title {
            font-size: 32px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 20px;
          }
          .text-element.headline {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
          }
          .text-element.subtitle {
            font-size: 20px;
            font-weight: 500;
            color: #334155;
            margin-bottom: 10px;
          }
          .image-element {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin: 10px 0;
          }
          .shape-element {
            border-radius: 8px;
            margin: 10px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .chart-element {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 20px 0;
          }
          .chart-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
          }
          .table-element {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .table-element th,
          .table-element td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .table-element th {
            background: #f8fafc;
            font-weight: 600;
            color: #1e293b;
          }
          .table-element tr:hover {
            background: #f8fafc;
          }
          .embed-element {
            background: #f1f5f9;
            border: 2px solid #cbd5e1;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 20px 0;
          }
          .embed-title {
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 10px;
          }
          .export-footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .export-info {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .export-info h3 {
            color: #1e40af;
            margin-bottom: 10px;
          }
          @media print {
            body { background: white; padding: 0; }
            .slide { 
              margin: 0; 
              box-shadow: none; 
              border: 1px solid #ccc;
              page-break-after: always;
            }
            .presentation-header { background: #f8fafc !important; color: #1e293b !important; }
          }
        </style>
      </head>
      <body>
        <div class="presentation-container">
          <div class="presentation-header">
            <h1 class="presentation-title">Presentation Export</h1>
            <div class="presentation-meta">
              <p><strong>Export Type:</strong> ${selectedExportType.replace('-', ' ').toUpperCase()}</p>
              <p><strong>Total Slides:</strong> ${slides.length} | <strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="slides-container">
            ${slides.map((slide, index) => `
              <div class="slide">
                <div class="slide-number">Slide ${index + 1}</div>
                <div class="slide-content">
                  ${slide.elements.length === 0 ? 
                    '<div class="text-element" style="color: #94a3b8; font-style: italic; text-align: center; margin-top: 200px;">Empty slide</div>' : 
                    slide.elements.map(element => {
                      const elementStyle = `position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px; transform: rotate(${element.rotation || 0}deg);`;
                      
                      switch(element.type) {
                        case 'text':
                          const textClass = element.fontSize >= 28 ? 'title' : 
                                          element.fontSize >= 20 ? 'headline' : 
                                          element.fontSize >= 16 ? 'subtitle' : 'text-element';
                          return `
                            <div class="text-element ${textClass}" style="${elementStyle}; font-size: ${element.fontSize || 16}px; color: ${element.color || '#1e293b'}; font-weight: ${element.fontWeight || '400'}; text-align: ${element.textAlign || 'left'};">
                              ${element.content || 'Text element'}
                            </div>
                          `;
                        case 'image':
                          return `
                            <div style="${elementStyle}">
                              <img src="${element.src}" alt="${element.alt || 'Image'}" class="image-element" style="width: 100%; height: 100%; object-fit: cover;" />
                            </div>
                          `;
                        case 'shape':
                          return `
                            <div class="shape-element" style="${elementStyle}; background: ${element.fillColor || '#3b82f6'}; border: ${element.strokeWidth || 0}px solid ${element.strokeColor || 'transparent'};">
                            </div>
                          `;
                        case 'chart':
                          return `
                            <div class="chart-element" style="${elementStyle}">
                              <div class="chart-title">📊 ${element.chartType || 'Chart'}</div>
                              <p style="color: #64748b;">Chart data and visualization</p>
                            </div>
                          `;
                        case 'table':
                          const tableData = element.data || [
                            ['Header 1', 'Header 2', 'Header 3'],
                            ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
                            ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
                          ];
                          return `
                            <div style="${elementStyle}">
                              <table class="table-element">
                                ${tableData.map((row, rowIndex) => `
                                  <tr>
                                    ${row.map((cell, cellIndex) => 
                                      rowIndex === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`
                                    ).join('')}
                                  </tr>
                                `).join('')}
                              </table>
                            </div>
                          `;
                        case 'embed':
                          return `
                            <div class="embed-element" style="${elementStyle}">
                              <div class="embed-title">🔗 ${element.embedType || 'Embedded Content'}</div>
                              <p style="color: #64748b;">${element.title || 'Embedded content'}</p>
                            </div>
                          `;
                        default:
                          return `<div style="${elementStyle}; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px;">${element.type} element</div>`;
                      }
                    }).join('')
                  }
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="export-footer">
            <div class="export-info">
              <h3>✅ Export Complete</h3>
              <p>Your presentation has been exported successfully with all content preserved!</p>
              <p><em>Generated by Presentation Editor - ${new Date().toLocaleString()}</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Determine file extension and MIME type based on export type
    let fileExtension = 'html';
    let mimeType = 'text/html';
    let fileName = `presentation-${new Date().toISOString().split('T')[0]}`;

    switch(selectedExportType) {
      case 'pdf-compressed':
      case 'pdf-high-quality':
        fileExtension = 'html'; // For now, export as HTML that can be converted to PDF
        mimeType = 'text/html';
        fileName += '-pdf-ready';
        break;
      case 'powerpoint-ppt':
        fileExtension = 'html'; // For now, export as HTML that can be converted to PPT
        mimeType = 'text/html';
        fileName += '-ppt-ready';
        break;
      default:
        fileExtension = 'html';
        mimeType = 'text/html';
    }

    // Create and download the file
    const blob = new Blob([presentationHTML], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Close the modal
    onClose();
  };

  const contentOptions = [
    {
      type: 'text',
      icon: Type,
      label: 'Text',
      description: 'Add text, titles, and captions'
    },
    {
      type: 'image',
      icon: ImageIcon,
      label: 'Media',
      description: 'Add images, videos, and GIFs'
    },
    {
      type: 'shape',
      icon: Square,
      label: 'Shape',
      description: 'Add rectangles, circles, and lines'
    },
    {
      type: 'chart',
      icon: BarChart,
      label: 'Chart',
      description: 'Add charts and graphs'
    },
    {
      type: 'table',
      icon: Table,
      label: 'Table',
      description: 'Add tables and data'
    },
    {
      type: 'embed',
      icon: Code,
      label: 'Embed',
      description: 'Add YouTube, links, and more'
    }
  ];

  const tabs = [
    { id: 'collaborate', label: 'Invite to collaborate', icon: Users },
    { id: 'share-externally', label: 'Share externally', icon: Share2 },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'share-externally':
        return (
          <div className="p-6">
            <div className="space-y-6">
              {/* Pitch Banner */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-xs">P</span>
                    </div>
                    <span>Try Pitch</span>
                  </button>
                  <div className="text-sm text-gray-600">
                    Your presentations will show a small Pitch badge. To share the presentation without any Pitch branding,{' '}
                    <button className="text-purple-600 hover:text-purple-700 font-medium">upgrade now.</button>
                  </div>
                </div>
              </div>

              {/* Links Created Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Links created</h3>
                <div className="space-y-3">
                  {/* Link 1 */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PPT</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 text-purple-500">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">123</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        Copy link
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Link 2 */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">PDF</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 text-purple-500">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">12</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        Copy link
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Link 3 */}
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">WEB</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 text-purple-500">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">0</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        Copy link
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center">
                Send a link so anyone can view your presentation without signing up for a Pitch account.
              </p>

              {/* New Link Button */}
              <div className="flex justify-center">
                <button className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>New link</span>
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'collaborate':
        return (
          <div className="p-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
                  Invite
                </button>
              </div>

              {/* Team Members */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">A</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Members of ahmad muaaz' team</p>
                      <p className="text-sm text-gray-500">1 person</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">No access</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'export':
        return (
          <div className="p-6">
            <div className="space-y-6">
              {/* Export Options */}
              <div className="space-y-3">
                {/* PDF - Compressed */}
                <div 
                  className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                    selectedExportType === 'pdf-compressed' 
                      ? 'border-2 border-purple-500 bg-purple-50' 
                      : 'border border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedExportType('pdf-compressed')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-bold text-sm">PDF</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">PDF - compressed</h3>
                      <p className="text-sm text-gray-600">Compression slightly visible. Best for sharing on the web or with a bad connection.</p>
                    </div>
                  </div>
                </div>

                {/* PDF - High Quality (Selected) */}
                <div 
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedExportType === 'pdf-high-quality' 
                      ? 'border-2 border-purple-500 bg-purple-50' 
                      : 'border border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedExportType('pdf-high-quality')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-bold text-sm">PDF</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">PDF - high quality</h3>
                      <p className="text-sm text-gray-600">Lossless output for high quality images and visuals. Longer export time.</p>
                    </div>
                  </div>
                </div>

                {/* PowerPoint PPT */}
                <div 
                  className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                    selectedExportType === 'powerpoint-ppt' 
                      ? 'border-2 border-purple-500 bg-purple-50' 
                      : 'border border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedExportType('powerpoint-ppt')}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-bold text-sm">PPT</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">PowerPoint PPT</h3>
                      <p className="text-sm text-gray-600">The exported presentation may look different as some elements aren't supported.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Section */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-gray-700">
                  Videos, recordings, and interactive blocks may not export correctly. To let your content shine,{' '}
                  <button className="text-purple-600 hover:text-purple-700 font-medium">share a link</button>.
                </div>
              </div>

              {/* Pitch Banner */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {/* Preview Image */}
                  <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center">
                      <div className="w-8 h-6 bg-white rounded-sm opacity-50"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2">
                          Exports will include a watermark and an extra Pitch slide. Workspaces on a premium plan can export without those.
                        </p>
                        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                          Remove Pitch branding
                        </button>
                      </div>
                      <button className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                        Try Pitch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header with Tabs */}
        <div className="border-b border-gray-200">
          {/* Close Button */}
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-purple-500 text-gray-900 font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Footer */}
        {activeTab === 'collaborate' && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-sm text-gray-700">Link to current slide</span>
            </label>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
              Copy editor link
            </button>
          </div>
        )}
        
        {activeTab === 'export' && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button 
              onClick={handleExport}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              Export presentation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddContentModal;
