'use client';

import React, { useState } from 'react';

export default function TemplateJSONUpload() {
  const [jsonContent, setJsonContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!jsonContent.trim()) {
      setMessage('Please paste your JSON template');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Parse and validate JSON
      const template = JSON.parse(jsonContent);
      
      // Store in localStorage for now (you can save to database later)
      const existingTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      existingTemplates.push({
        ...template,
        id: `custom-${Date.now()}`,
        uploadedAt: new Date().toISOString()
      });
      
      localStorage.setItem('customTemplates', JSON.stringify(existingTemplates));
      
      setMessage('✅ Template uploaded successfully!');
      setJsonContent('');
    } catch (error) {
      setMessage('❌ Invalid JSON format: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleTemplate = {
    "id": "my-custom-template",
    "name": "My Custom Template",
    "description": "Professional template with custom design",
    "category": "business",
    "slides": [
      {
        "id": "slide-1",
        "type": "title",
        "backgroundColor": "#1e40af",
        "backgroundImage": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop",
        "elements": [
          {
            "id": "main-title",
            "type": "text",
            "content": "Your Title Here",
            "x": 960,
            "y": 300,
            "width": 800,
            "height": 120,
            "fontSize": 48,
            "fontFamily": "Inter",
            "fontWeight": "bold",
            "color": "#ffffff",
            "textAlign": "center",
            "zIndex": 2
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Upload Custom JSON Template
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Template JSON Format:
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(exampleTemplate, null, 2)}
            </pre>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your template JSON:
            </label>
            <textarea
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste your JSON template here..."
            />
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Uploading...' : 'Upload Template'}
          </button>
        </div>
      </div>
    </div>
  );
}



