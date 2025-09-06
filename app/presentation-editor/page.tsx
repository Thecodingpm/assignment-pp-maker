'use client';

import React, { useEffect } from 'react';
import { useEditorStore } from '../stores/useEditorStore';
// import { mapAIToEditorFormat } from '../utils/aiTemplateMapper';

// Import components individually to debug
import SlideList from '../components/Sidebar/SlideList';
import SlideCanvas from '../components/Editor/SlideCanvas';
import MainToolbar from '../components/Toolbar/MainToolbar';
import PropertyPanel from '../components/PropertyPanel';
import RightCornerToolbar from '../components/RightToolbar/RightCornerToolbar';
import PresentationModeModal from '../components/PresentationModeModal';
import PresentationMode from '../components/PresentationMode';
import SlidePropertiesBar from '../components/SlidePropertiesBar';

export default function PresentationEditorPage() {
  const { 
    setSlides, 
    showPresentationModal, 
    presentationModalType, 
    setShowPresentationModal, 
    enterPresentationMode,
    addSlide,
    createTextElement,
    createImageElement,
    createShapeElement
  } = useEditorStore();

  useEffect(() => {
    // Check for AI-generated presentation data in localStorage
    const aiData = localStorage.getItem('aiGeneratedPresentation');
    
    if (aiData) {
      try {
        const parsedData = JSON.parse(aiData);
        console.log('Raw AI data from localStorage:', parsedData);
        
        // const mappedPresentation = mapAIToEditorFormat(parsedData);
        const mappedPresentation = { slides: [] }; // Temporary fallback
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

  const handleAddContent = () => {
    // Add a new slide with some default content
    addSlide();
    // Add a text element to the new slide
    setTimeout(() => {
      createTextElement(100, 100);
    }, 100);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <MainToolbar />
      
      {/* Main Content - Add top padding for fixed toolbar and bottom padding for properties bar */}
      <div className="flex-1 flex overflow-hidden pt-20 pb-16 pr-20">
        {/* Left Sidebar - Slide List */}
        <SlideList />
        
        {/* Center - Slide Canvas */}
        <div className="flex-1 flex flex-col">
          <SlideCanvas />
        </div>
        
        {/* Right Sidebar - Property Panel */}
        <PropertyPanel />
      </div>
      
      {/* Right Corner Toolbar */}
      <RightCornerToolbar 
        onPlay={() => console.log('🎬 Play presentation')}
        onStop={() => console.log('⏹️ Stop presentation')}
        onFullscreen={() => console.log('🖥️ Enter fullscreen')}
        onSettings={() => console.log('⚙️ Open settings')}
        onShare={() => console.log('📤 Share presentation')}
        onExport={() => console.log('💾 Export presentation')}
        onToggleGrid={() => console.log('🔲 Toggle grid')}
        onToggleLayers={() => console.log('📚 Toggle layers')}
      />
      
      {/* Presentation Mode Modal */}
      <PresentationModeModal
        isVisible={showPresentationModal}
        modalType={presentationModalType}
        onClose={() => setShowPresentationModal(false)}
        onStartPresentation={enterPresentationMode}
        onAddContent={handleAddContent}
      />
      
      {/* Presentation Mode */}
      <PresentationMode />
      
      {/* Bottom Slide Properties Bar */}
      <SlidePropertiesBar />
    </div>
  );
}