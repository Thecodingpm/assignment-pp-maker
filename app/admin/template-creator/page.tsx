'use client';

import React, { useState } from 'react';
import { useAuth } from '../../components/AuthContext';
import TemplateEditor from '../../components/TemplateEditor';
import { TemplateDefinition } from '../../types/template';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

const TemplateCreatorPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle template save (like Canva's save process)
  const handleSaveTemplate = async (template: TemplateDefinition) => {
    if (!user) {
      alert('You must be logged in to save templates');
      return;
    }

    setSaving(true);
    try {
      // Add user info to template metadata
      const templateWithUser = {
        ...template,
        metadata: {
          ...template.metadata,
          author: user.email || 'Unknown',
          createdAt: new Date(),
          lastModified: new Date()
        },
        createdBy: user.id,
        isPublic: true, // Can be made configurable
        usageCount: 0,
        rating: 0,
        downloads: 0
      };

      // Save to Firebase (like Canva's database)
      const docRef = await addDoc(collection(db, 'templates'), templateWithUser);
      
      console.log('✅ Template saved to Firebase with ID:', docRef.id);
      alert('Template saved successfully!');
      
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You must be logged in to create templates.</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <TemplateEditor
        onSave={handleSaveTemplate}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Template
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Design beautiful templates using our Canva-like editor. 
            Drag and drop elements to create professional presentations, 
            documents, and more.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Drag & Drop</h3>
            <p className="text-gray-600">
              Intuitive drag and drop interface to add text, images, shapes, and backgrounds.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Preview</h3>
            <p className="text-gray-600">
              See your changes instantly as you design your template.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save to Cloud</h3>
            <p className="text-gray-600">
              Templates are automatically saved to Firebase and available to all users.
            </p>
          </div>
        </div>

        {/* Template Categories */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Template Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Business', icon: '💼', color: 'bg-blue-100' },
              { name: 'Education', icon: '📚', color: 'bg-green-100' },
              { name: 'Creative', icon: '🎨', color: 'bg-purple-100' },
              { name: 'Technical', icon: '⚙️', color: 'bg-gray-100' },
              { name: 'Marketing', icon: '📢', color: 'bg-red-100' },
              { name: 'Personal', icon: '👤', color: 'bg-yellow-100' },
              { name: 'Social Media', icon: '📱', color: 'bg-pink-100' },
              { name: 'Presentations', icon: '📊', color: 'bg-indigo-100' }
            ].map(category => (
              <div
                key={category.name}
                className={`${category.color} rounded-lg p-4 text-center cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-gray-900">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Creating */}
        <div className="text-center">
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            🚀 Start Creating Template
          </button>
          <p className="text-gray-600 mt-4">
            Click to open the template editor and start designing
          </p>
        </div>

        {/* How It Works */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Design</h3>
              <p className="text-gray-600 text-sm">
                Use the drag & drop editor to create your template
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save</h3>
              <p className="text-gray-600 text-sm">
                Save your template as JSON data to Firebase
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share</h3>
              <p className="text-gray-600 text-sm">
                Template becomes available to all users instantly
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Use</h3>
              <p className="text-gray-600 text-sm">
                Users can select and customize your template
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreatorPage;
