'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Edit, 
  Folder, 
  Copy, 
  Bell, 
  Settings, 
  Download, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

interface PresentationMenuDropdownProps {
  isVisible: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const PresentationMenuDropdown: React.FC<PresentationMenuDropdownProps> = ({
  isVisible,
  onClose,
  position
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  // Close dropdown when pressing Escape
  useEffect(() => {
    if (!isVisible) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const menuItems = [
    {
      id: 'search',
      label: 'Search & commands',
      icon: Search,
      shortcut: '⌘ K',
      action: () => console.log('Search clicked')
    },
    {
      id: 'rename',
      label: 'Rename presentation',
      icon: Edit,
      action: () => console.log('Rename clicked')
    },
    {
      id: 'move',
      label: 'Move to folder',
      icon: Folder,
      action: () => console.log('Move to folder clicked')
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      action: () => console.log('Duplicate clicked')
    },
    {
      id: 'unsubscribe',
      label: 'Unsubscribe',
      icon: Bell,
      action: () => console.log('Unsubscribe clicked')
    },
    {
      id: 'template',
      label: 'Convert to template',
      icon: Settings,
      action: () => console.log('Convert to template clicked')
    },
    {
      id: 'export',
      label: 'Export presentation',
      icon: Download,
      action: () => console.log('Export clicked')
    },
    { type: 'divider' },
    {
      id: 'undo',
      label: 'Undo',
      icon: RotateCcw,
      shortcut: '⌘ Z',
      disabled: true,
      action: () => console.log('Undo clicked')
    },
    {
      id: 'redo',
      label: 'Redo',
      icon: RotateCw,
      shortcut: '⌘ Y',
      disabled: true,
      action: () => console.log('Redo clicked')
    },
    {
      id: 'find',
      label: 'Find & replace',
      icon: Search,
      shortcut: '⌘ F',
      action: () => console.log('Find & replace clicked')
    },
    { type: 'divider' },
    {
      id: 'deleted',
      label: 'Show deleted slides',
      icon: Trash2,
      action: () => console.log('Show deleted slides clicked')
    },
    {
      id: 'history',
      label: 'Version history',
      icon: Clock,
      action: () => console.log('Version history clicked')
    },
    {
      id: 'desktop',
      label: 'Open in desktop app',
      icon: ExternalLink,
      action: () => console.log('Open in desktop app clicked')
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
        onClick={onClose}
      />
      
      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 min-w-64 max-w-80 overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search & commands"
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2 max-h-96 overflow-y-auto">
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={`divider-${index}`} className="my-1 border-t border-gray-100" />
              );
            }

            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                  item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${item.disabled ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-gray-400 font-mono">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PresentationMenuDropdown;
