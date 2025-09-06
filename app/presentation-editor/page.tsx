'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEditorStore } from '../stores/useEditorStore';
import { getDocument } from '../firebase/documents';
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

function PresentationEditorContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  
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

  const loadImportedDocument = async (docId: string) => {
    try {
      console.log('Loading document with ID:', docId);
      const document = await getDocument(docId);
      console.log('Retrieved document:', document);
      
      if (document && document.content) {
        const parsedContent = JSON.parse(document.content);
        console.log('Parsed content:', parsedContent);
        
        // Set the slides from the imported document
        if (parsedContent.slides && Array.isArray(parsedContent.slides)) {
          console.log('📄 Slides array found:', parsedContent.slides);
          console.log('📄 Slides length:', parsedContent.slides.length);
          if (parsedContent.slides.length > 0) {
            console.log('📄 First slide:', parsedContent.slides[0]);
            console.log('📄 First slide elements:', parsedContent.slides[0].elements);
            console.log('📄 First slide elements length:', parsedContent.slides[0].elements?.length || 0);
          }
          
          // Check if slides have proper elements
          const validSlides = parsedContent.slides.filter(slide => 
            slide.elements && Array.isArray(slide.elements) && slide.elements.length > 0
          );
          
          if (validSlides.length > 0) {
            console.log('✅ Setting valid slides:', validSlides);
            setSlides(validSlides);
            console.log('✅ Slides set successfully');
          } else {
            console.log('❌ No valid slides with elements found, creating default slide');
            // Create a default slide if slides exist but have no elements
            const defaultSlide = {
              id: 'slide-1',
              elements: [{
                id: 'text-1',
                type: 'text',
                x: 100,
                y: 100,
                width: 300,
                height: 60,
                content: `📄 ${document.title || 'Imported Presentation'}`,
                fontSize: 24,
                fontFamily: 'Inter',
                fontWeight: '400',
                color: '#000000',
                textAlign: 'left',
                lineHeight: 1.2,
                isEditing: false,
                rotation: 0,
                zIndex: 1,
                selected: false
              }],
              backgroundColor: '#ffffff'
            };
            console.log('✅ Creating default slide:', defaultSlide);
            setSlides([defaultSlide]);
            console.log('✅ Default slide set successfully');
          }
        } else {
          console.log('No slides found in content, creating default slide');
          // Create a default slide if no slides found
          const defaultSlide = {
            id: 'slide-1',
            elements: [{
              id: 'text-1',
              type: 'text',
              x: 100,
              y: 100,
              width: 300,
              height: 60,
              content: `📄 ${document.title || 'Imported Presentation'}`,
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: '400',
              color: '#000000',
              textAlign: 'left',
              lineHeight: 1.2,
              isEditing: false,
              rotation: 0,
              zIndex: 1,
              selected: false
            }],
            backgroundColor: '#ffffff'
          };
          console.log('✅ Creating default slide:', defaultSlide);
          setSlides([defaultSlide]);
          console.log('✅ Default slide set successfully');
        }
      } else {
        console.log('No content found, creating default slide');
        // Create a default slide if no content
        const defaultSlide = {
          id: 'slide-1',
          elements: [{
            id: 'text-1',
            type: 'text',
            x: 100,
            y: 100,
            width: 300,
            height: 60,
            content: 'Imported Presentation',
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: '400',
            color: '#000000',
            textAlign: 'left',
            lineHeight: 1.2,
            isEditing: false,
            rotation: 0,
            zIndex: 1,
            selected: false
          }],
          backgroundColor: '#ffffff'
        };
        setSlides([defaultSlide]);
      }
    } catch (error) {
      console.error('Error loading imported document:', error);
      // Create a default slide on error
      const defaultSlide = {
        id: 'slide-1',
        elements: [{
          id: 'text-1',
          type: 'text',
          x: 100,
          y: 100,
          width: 300,
          height: 60,
          content: 'Error loading presentation',
          fontSize: 24,
          fontFamily: 'Inter',
          fontWeight: '400',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1.2,
          isEditing: false,
          rotation: 0,
          zIndex: 1,
          selected: false
        }],
        backgroundColor: '#ffffff'
      };
      setSlides([defaultSlide]);
    }
  };

  useEffect(() => {
    // Handle imported document
    if (documentId) {
      console.log('🔍 Opening imported document:', documentId);
      loadImportedDocument(documentId);
      return; // Exit early if we have a document to load
    } else {
      console.log('❌ No documentId found in URL');
    }

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
  }, [documentId, setSlides]);

  // Test: Force create a slide if none exist
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔍 Checking if slides exist...');
      // This will help us debug if slides are being set
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAddContent = () => {
    // Add a new slide with some default content
    addSlide();
    // Add a text element to the new slide
    setTimeout(() => {
      createTextElement(100, 100);
    }, 100);
  };

  const handleTestSlide = () => {
    console.log('🧪 Creating test slide...');
    const testSlide = {
      id: 'test-slide-1',
      elements: [{
        id: 'test-text-1',
        type: 'text',
        x: 200,
        y: 200,
        width: 400,
        height: 80,
        content: '🧪 TEST SLIDE - This should be visible!',
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: '600',
        color: '#FF0000',
        textAlign: 'center',
        lineHeight: 1.2,
        isEditing: false,
        rotation: 0,
        zIndex: 1,
        selected: false
      }],
      backgroundColor: '#F0F8FF'
    };
    console.log('🧪 Setting test slide:', testSlide);
    setSlides([testSlide]);
    console.log('🧪 Test slide set!');
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
      
      {/* Debug Test Button - Bottom */}
      <div className="fixed bottom-4 right-4 bg-yellow-100 p-2 rounded-lg shadow-lg border">
        <button 
          onClick={handleTestSlide}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          🧪 TEST SLIDE
        </button>
        <div className="text-xs text-gray-600 mt-1">
          ID: {documentId || 'None'}
        </div>
      </div>
    </div>
  );
}

export default function PresentationEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PresentationEditorContent />
    </Suspense>
  );
}