'use client';

import React from 'react';
import Link from 'next/link';

export default function PresentationDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Presentation Editor Demo
        </h1>
        <p className="text-gray-600 mb-8">
          A Pitch.com-like slide presentation editor built with React, TypeScript, and modern web technologies.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/presentation-editor"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Open Editor
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Features:</p>
            <ul className="mt-2 space-y-1">
              <li>• Instant text box creation on click</li>
              <li>• Drag & drop slide reordering</li>
              <li>• 8-point resize handles</li>
              <li>• Real-time formatting tools</li>
              <li>• Property panel for fine-tuning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
