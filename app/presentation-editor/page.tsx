'use client';

import React, { useEffect } from 'react';
import { SlideList } from '../components/Sidebar';
import { SlideCanvas } from '../components/Editor';
import { MainToolbar } from '../components/Toolbar';
import PropertyPanel from '../components/PropertyPanel';
import { useEditorStore } from '../stores/useEditorStore';
import { mapAIToEditorFormat } from '../utils/aiTemplateMapper';

export default function PresentationEditorPage() {
  const { setSlides } = useEditorStore();

  useEffect(() => {
    // Check for AI-generated presentation data in localStorage
    const aiData = localStorage.getItem('aiGeneratedPresentation');
    
    if (aiData) {
      try {
        const parsedData = JSON.parse(aiData);
        console.log('Raw AI data from localStorage:', parsedData);
        
        const mappedPresentation = mapAIToEditorFormat(parsedData);
        console.log('Mapped presentation:', mappedPresentation);
        
        // Load the AI-generated slides into the editor
        if (mappedPresentation && mappedPresentation.slides && Array.isArray(mappedPresentation.slides) && mappedPresentation.slides.length > 0) {
          console.log('Setting slides in editor store:', mappedPresentation.slides);
          setSlides(mappedPresentation.slides);
          
          // Clear the localStorage after loading to prevent reloading on refresh
          localStorage.removeItem('aiGeneratedPresentation');
          
          console.log('AI presentation loaded successfully');
        } else {
          console.warn('Invalid mapped presentation structure:', mappedPresentation);
        }
      } catch (error) {
        console.error('Failed to load AI presentation data:', error);
      }
    } else {
      console.log('No AI presentation data found in localStorage');
    }
  }, [setSlides]);

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