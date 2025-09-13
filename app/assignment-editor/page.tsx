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

function AssignmentEditorContent() {
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


  const loadImportedDocument = async (docId: string) => {
    try {
      console.log('Loading assignment document with ID:', docId);
      
      if (!docId) {
        console.error('❌ No document ID provided');
        return;
      }
      
      const document = await getDocument(docId);
      console.log('Retrieved assignment document:', document);
      
      if (!document) {
        console.error('❌ Assignment document not found');
        return;
      }
      
      if (!document.content) {
        console.error('❌ Assignment document has no content');
        return;
      }
      
      let parsedContent;
      try {
        parsedContent = JSON.parse(document.content);
        console.log('Parsed assignment content:', parsedContent);
      } catch (parseError) {
        console.error('❌ Error parsing assignment document content:', parseError);
        return;
      }
      
      // Check if this is a PPTX-parsed document (has metadata.originalFileName or isImported flag)
      if (parsedContent.metadata?.originalFileName?.endsWith('.pptx') || document.isImported) {
        console.log('🎯 Loading PPTX-parsed assignment document');
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
        console.log('📄 Loading regular JSON assignment document');
        loadRegularDocument(parsedContent);
      }
      
    } catch (error) {
      console.error('❌ Error loading assignment document:', error);
    }
  };

  // Handle PPTX-parsed documents
  const loadPptxDocument = (parsedContent: any) => {
    try {
      console.log('🎯 Processing PPTX assignment document:', parsedContent);
      
      if (parsedContent.slides && Array.isArray(parsedContent.slides)) {
        const editorSlides = parsedContent.slides.map((slide: any, index: number) => {
          console.log(`Processing PPTX assignment slide ${index + 1}:`, slide);
          
          // Convert PPTX slide to editor format
          const editorSlide = {
            id: slide.id || `slide-${index + 1}`,
            backgroundColor: slide.background || slide.backgroundColor || '#ffffff',
            elements: []
          };
          
          if (slide.elements && Array.isArray(slide.elements)) {
            editorSlide.elements = slide.elements.map((element: any, elemIndex: number) => {
              console.log(`Converting assignment element ${elemIndex}:`, element);
              
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
                  content: element.content || 'Assignment Text',
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
                console.log(`🖼️ Assignment image element ${elemIndex}:`, {
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
                  alt: element.alt || 'Assignment Image'
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
                content: 'Assignment content',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: '400',
                color: '#666666',
                textAlign: 'left',
                lineHeight: 1.2
              };
            });
          }
          
          console.log(`✅ Converted PPTX assignment slide ${index + 1} with ${editorSlide.elements.length} elements`);
          return editorSlide;
        });
        
        console.log('✅ Setting PPTX assignment slides:', editorSlides);
        console.log('🔍 First assignment slide elements:', editorSlides[0]?.elements);
        console.log('🔍 Assignment element types:', editorSlides[0]?.elements?.map((el: any) => ({ id: el.id, type: el.type, x: el.x, y: el.y, width: el.width, height: el.height })));
        setSlides(editorSlides);
        
      } else {
        console.log('❌ No slides found in PPTX assignment document, creating default slide');
        createDefaultSlide('Assignment - No Slides');
      }
      
    } catch (error) {
      console.error('❌ Error processing PPTX assignment document:', error);
      createDefaultSlide('Assignment Import Error');
    }
  };

  // Handle regular JSON documents (your existing logic)
  const loadRegularDocument = (parsedContent: any) => {
    try {
      console.log('📄 Processing regular assignment document');
      
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
                      alt: element.alt || 'Assignment Image'
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
                    content: 'Assignment content',
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
          console.log('✅ Setting regular assignment slides:', validSlides);
          setSlides(validSlides);
    } else {
          console.log('❌ No valid slides found, creating default assignment slide');
          createDefaultSlide('Assignment Import');
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing regular assignment document:', error);
      createDefaultSlide('Assignment Import Error');
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
    
    console.log('✅ Creating default assignment slide:', defaultSlide);
    setSlides([defaultSlide]);
    console.log('✅ Default assignment slide set successfully');
  };

  useEffect(() => {
    // Handle imported document
    if (documentId) {
      console.log('🔍 Opening imported assignment document:', documentId);
      loadImportedDocument(documentId);
      return; // Exit early if we have a document to load
    } else {
      console.log('❌ No documentId found in URL');
    }

    // Check for AI-generated assignment data in localStorage
    const aiData = localStorage.getItem('aiGeneratedAssignment');
    
    if (aiData) {
      try {
        const parsedData = JSON.parse(aiData);
        console.log('Raw AI assignment data from localStorage:', parsedData);
        
        // The AI data is already in the correct format for the editor
        console.log('AI assignment data:', parsedData);
        
        // Load the AI-generated slides into the editor
        if (parsedData && parsedData.slides && Array.isArray(parsedData.slides) && parsedData.slides.length > 0) {
          console.log('Setting assignment slides in editor store:', parsedData.slides);
          setSlides(parsedData.slides);
          
          // Clear the localStorage after loading to prevent reloading on refresh
          localStorage.removeItem('aiGeneratedAssignment');
          
          console.log('AI assignment loaded successfully');
        } else {
          console.warn('Invalid AI assignment structure:', parsedData);
        }
      } catch (error) {
        console.error('Failed to load AI assignment data:', error);
      }
    } else {
      console.log('No AI assignment data found in localStorage');
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
      
      {/* Main Content - Add top padding for fixed toolbar and bottom padding for properties bar */}
      <div className="flex-1 flex overflow-hidden pt-20 pb-16 pr-32">
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
        onPlay={() => console.log('🎬 Play assignment')}
        onStop={() => console.log('⏹️ Stop assignment')}
        onFullscreen={() => console.log('🖥️ Enter fullscreen')}
        onSettings={() => console.log('⚙️ Open settings')}
        onShare={() => console.log('📤 Share assignment')}
        onExport={() => console.log('💾 Export assignment')}
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

export default function AssignmentEditorPage() {
  return (
    <Suspense fallback={<div>Loading Assignment Editor...</div>}>
      <AssignmentEditorContent />
    </Suspense>
  );
}
