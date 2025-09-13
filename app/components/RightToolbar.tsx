'use client';

import React, { useState, useEffect } from 'react';
// EditorRegistry removed
// Mock function to replace getCurrentEditor
const getCurrentEditor = () => null;
// Lexical imports removed

// Custom command constants
const INSERT_TABLE_COMMAND = 'INSERT_TABLE_COMMAND';
// ImageNode removed

interface LeftToolbarProps {
  // No props needed
}

export default function LeftToolbar({}: LeftToolbarProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const insertTextBlock = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('New text block'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertHeading = (level: 1 | 2 | 3) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const heading = new HeadingNode(`h${level}`);
          heading.append($createTextNode(`Heading ${level}`));
          selection.insertNodes([heading]);
        }
      });
    }
  };

  const insertList = (type: 'ul' | 'ol') => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(type === 'ul' ? '• List item' : '1. List item'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            const editor = getCurrentEditor();
            if (editor) {
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, result);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const insertVideo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            const editor = getCurrentEditor();
            if (editor) {
              editor.dispatchCommand(INSERT_VIDEO_COMMAND, result);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const insertTable = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: 3, columns: 3 });
    }
  };

  const insertShape = (shape: 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond' | 'hexagon') => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          const text = $createTextNode(`[${shape.charAt(0).toUpperCase() + shape.slice(1)} Shape]`);
          paragraph.append(text);
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertDivider = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('───────────────'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertQuote = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('"Quote text here"'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertCode = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('console.log("Hello World");'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertChecklist = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('☐ Checklist item'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertCallout = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('💡 Important note: Your text here'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertMath = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('E = mc²'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertLink = () => {
    const editor = getCurrentEditor();
    if (editor) {
      const url = prompt('Enter URL:');
      const text = prompt('Enter link text:') || url || '';
      if (url) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(text));
            selection.insertNodes([paragraph]);
          }
        });
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const text = $createTextNode(emoji);
          selection.insertNodes([text]);
        }
      });
    }
  };

  const changeTextDirection = (direction: 'ltr' | 'rtl') => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach(node => {
            if (node.getParent()) {
              node.getParent()?.setDirection(direction);
            }
          });
        }
      });
    }
  };

  const tabs = [
    {
      id: 'content',
      label: 'Content',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'shapes',
      label: 'Shapes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      )
    },
    {
      id: 'media',
      label: 'Media',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💡', '⭐', '🚀', '🎯', '💪', '🌟', '🎨', '📚', '💻', '🎵'];

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-white dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-700/60 shadow-2xl z-20 overflow-hidden">
      {/* Header */}
      <div className="relative h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Editor Tools</h2>
            <p className="text-blue-100 text-xs">Create amazing content</p>
          </div>
        </div>
        
        {/* Search Button */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors duration-200"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools and elements..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 py-3">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pb-4 h-[calc(100vh-120px)] overflow-y-auto">
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Text Elements</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">12</span>
            </div>
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={insertTextBlock}
                className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Text Block</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Paragraph</div>
              </button>

              <button
                onClick={insertLink}
                className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:scale-105"
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-green-800 dark:text-green-200">Link</div>
                <div className="text-xs text-green-600 dark:text-green-400">Hyperlink</div>
              </button>
            </div>

            {/* Headings */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Headings</h5>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => insertHeading(level as 1 | 2 | 3)}
                    className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-center group"
                  >
                    <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">H{level}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Heading</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lists */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Lists</h5>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => insertList('ul')}
                  className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors duration-200 text-center"
                >
                  <div className="text-lg mb-1">•</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Bullet List</div>
                </button>
                <button
                  onClick={() => insertList('ol')}
                  className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors duration-200 text-center"
                >
                  <div className="text-lg mb-1">1.</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Numbered</div>
                </button>
              </div>
            </div>

            {/* Special Elements */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Special Elements</h5>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={insertQuote}
                  className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800/30 transition-colors duration-200 text-center"
                >
                  <div className="text-lg mb-1">"</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Quote</div>
                </button>
                <button
                  onClick={insertCode}
                  className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-center"
                >
                  <div className="text-lg mb-1">{'<>'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Code</div>
                </button>
                <button
                  onClick={insertChecklist}
                  className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-800/30 transition-colors duration-200 text-center"
                >
                  <div className="text-lg mb-1">☐</div>
                  <div className="text-xs text-teal-600 dark:text-teal-400">Checklist</div>
                </button>
                <button
                  onClick={insertCallout}
                  className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors duration-200 text-center"
                >
                  <div className="text-lg mb-1">💡</div>
                  <div className="text-xs text-amber-600 dark:text-amber-400">Callout</div>
                </button>
              </div>
            </div>

            {/* Math & Divider */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={insertMath}
                className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition-colors duration-200 text-center"
              >
                <div className="text-lg mb-1">∑</div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400">Math</div>
              </button>
              <button
                onClick={insertDivider}
                className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-center"
              >
                <div className="text-lg mb-1">─</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Divider</div>
              </button>
            </div>

            {/* Emojis */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Quick Emojis</h5>
              <div className="grid grid-cols-4 gap-2">
                {emojis.slice(0, 8).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-center hover:scale-110"
                  >
                    <span className="text-lg">{emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shapes Tab */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Geometric Shapes</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">6</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {['rectangle', 'circle', 'triangle', 'star', 'diamond', 'hexagon'].map((shape) => (
                <button
                  key={shape}
                  onClick={() => insertShape(shape as any)}
                  className="group p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800/30 dark:hover:to-purple-800/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-105"
                >
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    {shape === 'rectangle' && (
                      <div className="w-8 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded group-hover:scale-110 transition-transform duration-300"></div>
                    )}
                    {shape === 'circle' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                    )}
                    {shape === 'triangle' && (
                      <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-amber-500 group-hover:border-b-amber-600 transition-colors"></div>
                    )}
                    {shape === 'star' && (
                      <div className="w-8 h-8 bg-yellow-500 group-hover:bg-yellow-600 transition-colors text-white flex items-center justify-center text-lg">★</div>
                    )}
                    {shape === 'diamond' && (
                      <div className="w-8 h-8 bg-pink-500 group-hover:bg-pink-600 transition-colors transform rotate-45"></div>
                    )}
                    {shape === 'hexagon' && (
                      <div className="w-8 h-8 bg-teal-500 group-hover:bg-teal-600 transition-colors text-white flex items-center justify-center text-lg">⬡</div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 capitalize">{shape}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Media Elements</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">4</span>
            </div>
            
            <button
              onClick={insertImage}
              className="w-full p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-800/30 dark:hover:to-teal-800/30 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-emerald-800 dark:text-emerald-200">Image</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">Insert from file</div>
                </div>
              </div>
            </button>

            <button
              onClick={insertTable}
              className="w-full p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-purple-800 dark:text-purple-200">Table</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">3x3 grid</div>
                </div>
              </div>
            </button>

            {/* Additional Media Options */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={insertVideo}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-200 text-center"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Video</div>
              </button>
              <button className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800/30 transition-colors duration-200 text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Audio</div>
              </button>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Text Tools</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">3</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => changeTextDirection('ltr')}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-center"
              >
                <div className="text-lg mb-1">→</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Left to Right</div>
              </button>
              <button
                onClick={() => changeTextDirection('rtl')}
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 text-center"
              >
                <div className="text-lg mb-1">←</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Right to Left</div>
              </button>
            </div>

            {/* Additional Tools */}
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors duration-200 text-center">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-red-800 dark:text-red-200">Clear Format</div>
              </button>
              <button className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800/30 transition-colors duration-200 text-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Refresh</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 