'use client';

import { useState, useEffect } from 'react';
import LexicalEditor from './LexicalEditor';

interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'image';
}

export default function PresentationEditor() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: 'Title Slide',
      content: 'Welcome to your presentation',
      type: 'title'
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'edit' | 'sorter'>('edit');
  const [selectedSlides, setSelectedSlides] = useState<Set<number>>(new Set());
  const [newlyAddedSlideId, setNewlyAddedSlideId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle keyboard events when typing
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1));
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlideIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlideIndex(slides.length - 1);
          break;
        case 'Delete':
          e.preventDefault();
          if (selectedSlides.size > 0) {
            deleteSelectedSlides();
          } else {
            deleteSlide(currentSlideIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedSlides(new Set());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, selectedSlides]);

  const addSlide = () => {
    console.log('Adding new slide...');
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `New Slide ${slides.length + 1}`,
      content: '',
      type: 'content'
    };
    console.log('New slide created:', newSlide);
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setNewlyAddedSlideId(newSlide.id); // Mark as newly added
    setShowSuccessMessage(true); // Show success message
    console.log('Slide added successfully. Total slides:', newSlides.length);
    
    // Switch to the new slide after a short delay to make it visible
    setTimeout(() => {
      setCurrentSlideIndex(newSlides.length - 1);
    }, 100);
    
    // Clear the newly added indicator after 3 seconds
    setTimeout(() => {
      setNewlyAddedSlideId(null);
    }, 3000);
    
    // Clear success message after 2 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);
  };

  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (currentSlideIndex >= newSlides.length) {
        setCurrentSlideIndex(newSlides.length - 1);
      }
    }
  };

  const deleteSelectedSlides = () => {
    if (selectedSlides.size === 0) return;
    
    const newSlides = slides.filter((_, i) => !selectedSlides.has(i));
    setSlides(newSlides);
    setSelectedSlides(new Set());
    
    // Adjust current slide index
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1));
    }
  };

  const duplicateSlide = (index: number) => {
    const slideToDuplicate = slides[index];
    const newSlide: Slide = {
      ...slideToDuplicate,
      id: Date.now().toString(),
      title: `${slideToDuplicate.title} (Copy)`
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
  };

  const duplicateSelectedSlides = () => {
    if (selectedSlides.size === 0) return;
    
    const newSlides = [...slides];
    const selectedIndices = Array.from(selectedSlides).sort((a, b) => b - a);
    
    selectedIndices.forEach(index => {
      const slideToDuplicate = slides[index];
      const newSlide: Slide = {
        ...slideToDuplicate,
        id: Date.now().toString(),
        title: `${slideToDuplicate.title} (Copy)`
      };
      newSlides.splice(index + 1, 0, newSlide);
    });
    
    setSlides(newSlides);
    setSelectedSlides(new Set());
  };

  const updateSlideTitle = (index: number, title: string) => {
    const newSlides = [...slides];
    newSlides[index].title = title;
    setSlides(newSlides);
  };

  const updateSlideContent = (index: number, content: string) => {
    console.log(`Updating slide ${index} content:`, content.substring(0, 100) + '...');
    const newSlides = [...slides];
    newSlides[index].content = content;
    setSlides(newSlides);
    console.log(`Slide ${index} content updated successfully`);
  };

  const handleSlideClick = (index: number, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      const newSelected = new Set(selectedSlides);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      setSelectedSlides(newSelected);
    } else if (e.shiftKey && selectedSlides.size > 0) {
      // Range select
      const selectedArray = Array.from(selectedSlides);
      const min = Math.min(...selectedArray, index);
      const max = Math.max(...selectedArray, index);
      const newSelected = new Set<number>();
      for (let i = min; i <= max; i++) {
        newSelected.add(i);
      }
      setSelectedSlides(newSelected);
    } else {
      // Single select
      setCurrentSlideIndex(index);
      setSelectedSlides(new Set([index]));
    }
  };



  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Main Editor Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 h-full flex flex-col">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {viewMode === 'edit' ? 'Slide Editor' : 'Slide Sorter'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'edit'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewMode('sorter')}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === 'sorter'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Sorter
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                title="Previous Slide (←)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                {currentSlideIndex + 1} of {slides.length}
              </span>
              <button
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                title="Next Slide (→)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content Area */}
          {viewMode === 'edit' ? (
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-8 flex items-center justify-center">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg shadow-lg z-10 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">New slide added successfully!</span>
                  </div>
                </div>
              )}
              
              <div className="w-full max-w-2xl">
                <input
                  type="text"
                  value={currentSlide.title}
                  onChange={(e) => updateSlideTitle(currentSlideIndex, e.target.value)}
                  className="w-full text-3xl font-bold text-center bg-transparent border-none outline-none mb-8 text-gray-800 dark:text-white"
                  placeholder="Slide Title"
                />
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm min-h-[300px]">
                  <LexicalEditor 
                    onContentChange={(content) => updateSlideContent(currentSlideIndex, content)}
                    initialContent={currentSlide.content}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
              <div className="grid grid-cols-3 gap-4">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer transition-all ${
                      selectedSlides.has(index)
                        ? 'ring-2 ring-purple-500 scale-105'
                        : index === currentSlideIndex
                        ? 'ring-2 ring-blue-500'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={(e) => handleSlideClick(index, e)}
                  >
                    <div className="p-4 h-48 flex flex-col">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Slide {index + 1}
                      </div>
                      <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2 truncate">
                        {slide.title}
                      </h3>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex-1">
                        {slide.content ? `${slide.content.substring(0, 100)}...` : 'Empty slide'}
                      </div>
                    </div>
                    {selectedSlides.has(index) && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Thumbnails Panel */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Slides</h3>
          <div className="flex gap-2">
            <button
              onClick={addSlide}
              className="p-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              title="Add Slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {selectedSlides.size > 0 && (
              <>
                <button
                  onClick={duplicateSelectedSlides}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Duplicate Selected"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={deleteSelectedSlides}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Delete Selected"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                newlyAddedSlideId === slide.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 animate-pulse'
                  : selectedSlides.has(index)
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : index === currentSlideIndex
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={(e) => handleSlideClick(index, e)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Slide {index + 1}</span>
                <div className="flex gap-1">
                  {newlyAddedSlideId === slide.id && (
                    <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                      New
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Duplicate"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {slide.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {slide.content ? `${slide.content.substring(0, 50)}...` : 'Empty slide'}
              </div>
            </div>
          ))}
        </div>
        
        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Keyboard Shortcuts</h4>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>← → Navigate slides</div>
            <div>Ctrl+Click Multi-select</div>
            <div>Shift+Click Range select</div>
            <div>Delete Remove selected</div>
            <div>Esc Clear selection</div>
          </div>
        </div>
      </div>
    </div>
  );
} 