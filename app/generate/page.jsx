'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
  const [presentationData, setPresentationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for AI-generated presentation data in localStorage
    const aiData = localStorage.getItem('aiGeneratedPresentation');
    
    if (aiData) {
      try {
        const parsedData = JSON.parse(aiData);
        setPresentationData(parsedData);
      } catch (err) {
        setError('Failed to load presentation data');
      }
    } else {
      setError('No presentation data found. Please generate a presentation first.');
    }
    
    setIsLoading(false);
  }, []);

  const handleEdit = () => {
    if (presentationData) {
      // Store the data for the presentation editor
      localStorage.setItem('aiGeneratedPresentation', JSON.stringify(presentationData));
      router.push('/presentation-editor');
    }
  };

  const handleRegenerate = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Your Presentation</h2>
          <p className="text-gray-600">AI is crafting the perfect slides for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRegenerate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate New Presentation
          </button>
        </div>
      </div>
    );
  }

  if (!presentationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Generated Presentation</h1>
              <div className="ml-3 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✓ Generated
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Generate New
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Presentation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Presentation Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {presentationData.title || 'AI Generated Presentation'}
              </h2>
              <p className="text-gray-600 text-lg">
                {presentationData.description || 'A professionally crafted presentation generated by AI'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {presentationData.slides?.length || 0} Slides
              </div>
              <div className="text-sm text-gray-500">Generated</div>
            </div>
          </div>
          
          {presentationData.tags && (
            <div className="flex flex-wrap gap-2">
              {presentationData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Slides Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Slide Preview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentationData.slides?.map((slide, index) => (
              <div
                key={slide.id || index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Slide {index + 1}</span>
                  <span className="text-xs text-gray-400">{slide.type || 'Content'}</span>
                </div>
                
                <div className="aspect-video rounded border border-gray-200 mb-3 overflow-hidden relative">
                  {slide.backgroundImage ? (
                    <div 
                      className="w-full h-full bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                    >
                      {/* Overlay for better text readability */}
                      <div className="absolute inset-0 bg-black/30"></div>
                      
                      {/* Slide content preview */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-center">
                        <h4 className="text-white font-bold text-lg mb-2 text-center drop-shadow-lg">
                          {slide.title || `Slide ${index + 1}`}
                        </h4>
                        {slide.content && (
                          <p className="text-white/90 text-sm text-center drop-shadow-md line-clamp-2">
                            {slide.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : slide.thumbnail ? (
                    <img
                      src={slide.thumbnail}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      {/* Default slide content */}
                      <div className="text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xs">Preview</p>
                      </div>
                      
                      {/* Slide title overlay */}
                      {slide.title && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="text-gray-700 font-medium text-sm truncate">
                            {slide.title}
                          </h4>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {slide.title || `Slide ${index + 1}`}
                </h4>
                
                {slide.content && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {slide.content}
                  </p>
                )}
                
                {/* Slide metadata */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{slide.type || 'Content'}</span>
                    {slide.backgroundImage && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <button
            onClick={handleEdit}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Editing Your Presentation
          </button>
          <p className="text-gray-500 mt-3">
            Customize colors, fonts, layouts, and content to make it perfect
          </p>
        </div>
      </div>
    </div>
  );
}
