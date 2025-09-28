'use client';

import React, { useEffect, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEditorStore } from '../stores/useEditorStore';
import { getDocument } from '../firebase/documents';
import { convertToEditorFormat } from '../lib/pptxApi';
import { mapAIToEditorFormat } from '../utils/aiTemplateMapper';

// Import components individually to debug
import SlideList from '../components/Sidebar/SlideList';
import SlideCanvas from '../components/Editor/SlideCanvas';
import MainToolbar from '../components/Toolbar/MainToolbar';
import PropertyPanel from '../components/PropertyPanel';
import RightCornerToolbar from '../components/RightToolbar/RightCornerToolbar';
import PresentationModeModal from '../components/PresentationModeModal';
import PresentationMode from '../components/PresentationMode';
import SlidePropertiesBar from '../components/SlidePropertiesBar';
import { useRealtimeCollaboration } from '../hooks/useRealtimeCollaboration';
import UserPresence from '../components/Collaboration/UserPresence';
import CursorIndicator from '../components/Collaboration/CursorIndicator';

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
    createShapeElement,
    setCanvasSize
  } = useEditorStore();

  // Real-time collaboration
  const {
    isConnected,
    users,
    collaborativeAddElement,
    collaborativeUpdateElement,
    collaborativeDeleteElement,
    collaborativeMoveElement,
    handleCursorMove,
    handleTextInput,
    handleTextInputEnd,
  } = useRealtimeCollaboration({
    documentId: documentId || 'new',
    enabled: !!documentId && documentId !== 'new'
  });


  const loadImportedDocument = async (docId: string) => {
    try {
      console.log('Loading document with ID:', docId);
      
      if (!docId) {
        console.error('❌ No document ID provided');
        return;
      }
      
      const document = await getDocument(docId);
      console.log('Retrieved document:', document);
      
      if (!document) {
        console.error('❌ Document not found');
        return;
      }
      
      if (!document.content) {
        console.error('❌ Document has no content');
        return;
      }
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(document.content);
        console.log('Parsed content:', parsedContent);
      } catch (parseError) {
        console.error('❌ Error parsing document content:', parseError);
        return;
      }
      
      // Check if this is a PPTX-parsed document (has metadata.originalFileName or isImported flag)
      if (parsedContent.metadata?.originalFileName?.endsWith('.pptx') || document.isImported) {
        console.log('🎯 Loading PPTX-parsed document');
        const editorFormat = convertToEditorFormat(parsedContent);
        
        // Set dynamic canvas size based on presentation dimensions
        if (editorFormat.dimensions) {
          setCanvasSize({
            width: editorFormat.dimensions.width,
            height: editorFormat.dimensions.height
          });
          console.log('📐 Set canvas size:', editorFormat.dimensions);
        }
        
        setSlides(editorFormat.slides as any);
      } else {
        console.log('📄 Loading regular JSON document');
        loadRegularDocument(parsedContent);
      }
      
    } catch (error) {
      console.error('❌ Error loading document:', error);
    }
  };

  // Handle PPTX-parsed documents
  const loadPptxDocument = (parsedContent: any) => {
    try {
      console.log('🎯 Processing PPTX document:', parsedContent);
      
      if (parsedContent.slides && Array.isArray(parsedContent.slides)) {
        const editorSlides = parsedContent.slides.map((slide: any, index: number) => {
          console.log(`Processing PPTX slide ${index + 1}:`, slide);
          
          // Convert PPTX slide to editor format
          const editorSlide = {
            id: slide.id || `slide-${index + 1}`,
            backgroundColor: slide.background || slide.backgroundColor || '#ffffff',
            elements: []
          };
          
          if (slide.elements && Array.isArray(slide.elements)) {
            editorSlide.elements = slide.elements.map((element: any, elemIndex: number) => {
              console.log(`Converting element ${elemIndex}:`, element);
              
              // Base element properties with proper defaults
              const baseElement = {
                id: element.id || `element-${elemIndex + 1}`,
                type: element.type,
                x: typeof element.x === 'number' ? Math.max(element.x, 50) : 100,
                y: typeof element.y === 'number' ? Math.max(element.y, 50) : 100,
                width: typeof element.width === 'number' ? Math.max(element.width, 100) : 200,
                height: typeof element.height === 'number' ? Math.max(element.height, 50) : 100,
                rotation: element.rotation || 0,
                zIndex: element.zIndex || (elemIndex + 1),
                selected: false,
                isEditing: false
              };
              
              // Add type-specific properties
              if (element.type === 'text') {
                return {
                  ...baseElement,
                  type: 'text' as const,
                  content: element.content || 'Text content',
                  fontSize: typeof element.fontSize === 'number' ? Math.max(element.fontSize, 16) : 24,
                  fontFamily: element.fontFamily || 'Inter',
                  fontWeight: element.fontWeight || '600',
                  color: element.color || '#1f2937',
                  textAlign: element.textAlign || 'left',
                  lineHeight: typeof element.lineHeight === 'number' ? element.lineHeight : 1.2
                };
              }
              
              if (element.type === 'image') {
                const imageSrc = element.imageUrl || element.src || '';
                console.log(`🖼️ Image element ${elemIndex}:`, {
                  id: element.id,
                  src: imageSrc ? imageSrc.substring(0, 100) + '...' : 'NO SRC',
                  alt: element.alt,
                  x: element.x,
                  y: element.y,
                  width: element.width,
                  height: element.height
                });
                
                return {
                  ...baseElement,
                  type: 'image' as const,
                  src: imageSrc,
                  alt: element.alt || 'Image'
                };
              }
              
              if (element.type === 'shape' || element.type === 'rectangle' || element.type === 'line' || element.type === 'circle') {
                return {
                  ...baseElement,
                  type: 'shape' as const,
                  shapeType: (element.type === 'rectangle' || element.type === 'line' || element.type === 'circle') ? element.type : 
                           (element.shapeType === 'rectangle' || element.shapeType === 'circle' || element.shapeType === 'triangle' || element.shapeType === 'diamond' || element.shapeType === 'star' || element.shapeType === 'line') ? element.shapeType : 'rectangle' as const,
                  fillColor: element.fill || element.fillColor || '#3B82F6',
                  strokeColor: element.stroke || element.strokeColor || '#1E40AF',
                  strokeWidth: typeof element.strokeWidth === 'number' ? element.strokeWidth : 3
                };
              }
              
              // Default fallback for unknown types
              return {
                ...baseElement,
                type: 'text' as const,
                content: 'Unknown element type',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: '400',
                color: '#666666',
                textAlign: 'left',
                lineHeight: 1.2
              };
            });
          }
          
          console.log(`✅ Converted PPTX slide ${index + 1} with ${editorSlide.elements.length} elements`);
          return editorSlide;
        });
        
        console.log('✅ Setting PPTX slides:', editorSlides);
        console.log('🔍 First slide elements:', editorSlides[0]?.elements);
        console.log('🔍 Element types:', editorSlides[0]?.elements?.map((el: any) => ({ id: el.id, type: el.type, x: el.x, y: el.y, width: el.width, height: el.height })));
        setSlides(editorSlides);
        
      } else {
        console.log('❌ No slides found in PPTX document, creating default slide');
        createDefaultSlide('PPTX Import - No Slides');
      }
      
    } catch (error) {
      console.error('❌ Error processing PPTX document:', error);
      createDefaultSlide('PPTX Import Error');
    }
  };

  // Handle regular JSON documents (your existing logic)
  const loadRegularDocument = (parsedContent: any) => {
    try {
      console.log('📄 Processing regular document');
      
      if (parsedContent.slides && Array.isArray(parsedContent.slides)) {
        const validSlides = parsedContent.slides
          .filter((slide: any) => slide && typeof slide === 'object')
          .map((slide: any, index: number) => {
            const sanitizedSlide = {
              id: slide.id || `slide-${index + 1}`,
              backgroundColor: slide.backgroundColor || '#ffffff',
              elements: []
            };
            
            if (slide.elements && Array.isArray(slide.elements)) {
              sanitizedSlide.elements = slide.elements
                .filter((element: any) => element && typeof element === 'object' && element.type)
                .map((element: any, elemIndex: number) => {
                  const baseElement = {
                    id: element.id || `element-${elemIndex + 1}`,
                    x: typeof element.x === 'number' ? element.x : 100,
                    y: typeof element.y === 'number' ? element.y : 100,
                    width: typeof element.width === 'number' ? element.width : 300,
                    height: typeof element.height === 'number' ? element.height : 60,
                    rotation: typeof element.rotation === 'number' ? element.rotation : 0,
                    zIndex: typeof element.zIndex === 'number' ? element.zIndex : 1,
                    selected: false,
                    isEditing: false
                  };

                  if (element.type === 'text') {
                    return {
                      ...baseElement,
                      type: 'text' as const,
                      content: element.content || '',
                      fontSize: typeof element.fontSize === 'number' ? element.fontSize : 16,
                      fontFamily: element.fontFamily || 'Inter',
                      fontWeight: element.fontWeight || '400',
                      color: element.color || '#000000',
                      textAlign: element.textAlign || 'left',
                      lineHeight: typeof element.lineHeight === 'number' ? element.lineHeight : 1.2
                    };
                  }

                  if (element.type === 'image') {
                    return {
                      ...baseElement,
                      type: 'image' as const,
                      src: element.src || element.imageUrl || '',
                      alt: element.alt || 'Image'
                    };
                  }

                  if (element.type === 'shape' || element.type === 'rectangle' || element.type === 'line' || element.type === 'circle') {
                    return {
                      ...baseElement,
                      type: 'shape' as const,
                      shapeType: (element.type === 'rectangle' || element.type === 'line' || element.type === 'circle') ? element.type : 
                               (element.shapeType === 'rectangle' || element.shapeType === 'circle' || element.shapeType === 'triangle' || element.shapeType === 'diamond' || element.shapeType === 'star' || element.shapeType === 'line') ? element.shapeType : 'rectangle' as const,
                      fillColor: element.fill || element.fillColor || '#3B82F6',
                      strokeColor: element.stroke || element.strokeColor || '#1E40AF',
                      strokeWidth: typeof element.strokeWidth === 'number' ? element.strokeWidth : 2
                    };
                  }

                  // Default fallback
                  return {
                    ...baseElement,
                    type: 'text' as const,
                    content: 'Unknown element',
                    fontSize: 16,
                    fontFamily: 'Inter',
                    fontWeight: '400',
                    color: '#000000',
                    textAlign: 'left',
                    lineHeight: 1.2
                  };
                });
            }
            
            return sanitizedSlide;
          })
          .filter((slide: any) => slide.elements.length > 0);
        
        if (validSlides.length > 0) {
          console.log('✅ Setting regular slides:', validSlides);
          setSlides(validSlides);
        } else {
          console.log('❌ No valid slides found, creating default slide');
          createDefaultSlide('Regular Import');
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing regular document:', error);
      createDefaultSlide('Import Error');
    }
  };

  // Helper function for creating default slides
  const createDefaultSlide = (title: string) => {
    const defaultSlide = {
      id: 'slide-1',
      backgroundColor: '#ffffff',
      elements: [{
        id: 'text-1',
        type: 'text' as const,
        x: 100,
        y: 100,
        width: 600,
        height: 80,
        content: title,
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center' as const,
        lineHeight: 1.2,
        isEditing: false,
        rotation: 0,
        zIndex: 1,
        selected: false
      }]
    };
    
    console.log('✅ Creating default slide:', defaultSlide);
    setSlides([defaultSlide]);
    console.log('✅ Default slide set successfully');
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
        console.log('Raw AI presentation data from localStorage:', parsedData);
        
        // Create slides from AI-generated presentation data
        if (parsedData && parsedData.presentation && parsedData.presentation.slides) {
          console.log('Creating presentation slides from AI data:', parsedData.presentation.slides);
          
          const aiSlides = parsedData.presentation.slides.map((slide: any, index: number) => {
            const slideElements = [];
            
            // Add title element
            if (slide.title) {
              slideElements.push({
                id: `title-${index}`,
                type: 'text' as const,
                x: 100,
                y: 100,
                width: 600,
                height: 80,
                content: slide.title,
                fontSize: 32,
                fontFamily: 'Inter',
                fontWeight: '600',
                color: '#1f2937',
                textAlign: 'center' as const,
                lineHeight: 1.2,
                rotation: 0,
                zIndex: 1,
                selected: false,
                isEditing: false
              });
            }
            
            // Add content elements
            if (slide.content && Array.isArray(slide.content)) {
              slide.content.forEach((contentItem: string, contentIndex: number) => {
                slideElements.push({
                  id: `content-${index}-${contentIndex}`,
                  type: 'text' as const,
                  x: 100,
                  y: 200 + (contentIndex * 60),
                  width: 600,
                  height: 50,
                  content: contentItem,
                  fontSize: 18,
                  fontFamily: 'Inter',
                  fontWeight: '400',
                  color: '#374151',
                  textAlign: 'left' as const,
                  lineHeight: 1.4,
                  rotation: 0,
                  zIndex: contentIndex + 2,
                  selected: false,
                  isEditing: false
                });
              });
            }
            
            return {
              id: `slide-${index + 1}`,
              backgroundColor: '#ffffff',
              elements: slideElements
            };
          });
          
          console.log('Setting AI-generated presentation slides:', aiSlides);
          setSlides(aiSlides);
          
          // Clear the localStorage after loading to prevent reloading on refresh
          localStorage.removeItem('aiGeneratedPresentation');
          
          console.log('AI presentation loaded successfully');
        } else {
          console.warn('Invalid AI presentation structure - no slides found:', parsedData);
          createDefaultSlide('AI Presentation - Invalid Data');
        }
      } catch (error) {
        console.error('Failed to load AI presentation data:', error);
        createDefaultSlide('AI Presentation - Load Error');
      }
    } else {
      console.log('No AI presentation data found in localStorage');
    }
  }, [documentId, setSlides]);

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
      
      {/* Collaboration Status Bar */}
      {isConnected && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">
                Live Collaboration Active
              </span>
            </div>
            <UserPresence className="flex items-center" />
          </div>
          <div className="text-xs text-green-600">
            {Object.keys(users).length} user{Object.keys(users).length !== 1 ? 's' : ''} online
          </div>
        </div>
      )}
      
      {/* Main Content - Add top padding for fixed toolbar and bottom padding for properties bar */}
      <div className="flex-1 flex overflow-hidden pt-20 pb-16 pr-32 relative">
        {/* Left Sidebar - Slide List */}
        <SlideList />
        
        {/* Center - Slide Canvas */}
        <div className="flex-1 flex flex-col relative">
          <SlideCanvas />
          {/* Cursor indicators for collaboration */}
          <CursorIndicator 
            containerRef={{ current: null }}
            zoom={1}
          />
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

export default function PresentationEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PresentationEditorContent />
    </Suspense>
  );
}