'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the canvas to avoid SSR issues
const PresentationCanvas = dynamic(() => import('../components/PresentationCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-lg text-gray-600">Loading presentation editor...</div>
    </div>
  )
});

export default function PresentationCanvasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Presentation Editor</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)]">
        <PresentationCanvas />
      </main>
    </div>
  );
}
