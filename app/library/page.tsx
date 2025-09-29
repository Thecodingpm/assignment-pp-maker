'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LibraryPage() {
  const [activeSection, setActiveSection] = useState('templates');

  const sections = [
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'fonts', label: 'Fonts', icon: 'T' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'videos', label: 'Videos', icon: '🎥' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'templates':
        return (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-blue-50 rounded-2xl flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Build with professional templates</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Choose from our collection of professionally designed templates. Your library makes it easy for anyone to create stunning presentations.
            </p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Browse templates
            </button>
          </div>
        );
      case 'fonts':
        return (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-green-50 rounded-2xl flex items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">T</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Typography that tells your story</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Access a curated collection of fonts. Your library makes it easy for anyone to find the perfect typeface for their presentations.
            </p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Browse fonts
            </button>
          </div>
        );
      case 'images':
        return (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-purple-50 rounded-2xl flex items-center justify-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Visuals that make an impact</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Discover high-quality images and graphics. Your library makes it easy for anyone to add compelling visuals to their presentations.
            </p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Browse images
            </button>
          </div>
        );
      case 'videos':
        return (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-blue-50 rounded-2xl flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center relative">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Set the scene for your story</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Put high-quality, reusable videos at everyone's fingertips. Your library makes it easy for anyone to add them to presentations.
            </p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Discover premium plans
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 h-screen">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            
            <h1 className="text-lg font-semibold text-gray-900 mb-6">Manage library</h1>
            
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-3 ${
                    activeSection === section.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-4 h-4 flex items-center justify-center text-sm">
                    {section.icon}
                  </span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {activeSection}
              </h1>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload {activeSection}</span>
              </button>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
