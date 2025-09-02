'use client';

import React from 'react';
import { SlideList } from '../components/Sidebar';
import { SlideCanvas } from '../components/Editor';
import { MainToolbar } from '../components/Toolbar';
import PropertyPanel from '../components/PropertyPanel';

export default function PresentationEditorPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <MainToolbar />
      
      {/* Main Content - Add top padding for fixed toolbar */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Left Sidebar - Slide List */}
        <SlideList />
        
        {/* Center - Slide Canvas */}
        <div className="flex-1 flex flex-col">
          <SlideCanvas />
        </div>
        
        {/* Right Sidebar - Property Panel */}
        <PropertyPanel />
      </div>
    </div>
  );
} 