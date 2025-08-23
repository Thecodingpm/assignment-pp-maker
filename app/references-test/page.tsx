'use client';

import React from 'react';
import TopToolbar from '../components/TopToolbar';
import LexicalEditor from '../components/LexicalEditor';
import { getCurrentEditor } from '../components/EditorRegistry';

export default function ReferencesTestPage() {
  const [showGPTSearch, setShowGPTSearch] = React.useState(false);
  const [gptResponse, setGptResponse] = React.useState('');
  const [editorInfo, setEditorInfo] = React.useState('No editor registered');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopToolbar
        showGPTSearch={showGPTSearch}
        setShowGPTSearch={setShowGPTSearch}
        gptResponse={gptResponse}
        setGptResponse={setGptResponse}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              References Feature Test
            </h1>
            
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                This page demonstrates the comprehensive References feature. Use the References button in the toolbar to:
              </p>
              
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• <strong>Add Sources:</strong> Books, journal articles, websites, and more</li>
                <li>• <strong>Insert Citations:</strong> APA, MLA, Chicago, Harvard, IEEE, and Vancouver styles</li>
                <li>• <strong>Generate Bibliography:</strong> Automatically formatted reference lists</li>
                <li>• <strong>Add Footnotes & Endnotes:</strong> For additional references and explanations</li>
                <li>• <strong>Manage Sources:</strong> Edit, update, and delete references</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Sample Document
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Click in the editor below and try the References feature. Start by adding a source, then insert citations throughout your text.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <LexicalEditor 
                onEditorMount={(editor) => {
                  console.log('Editor mounted:', editor);
                  setEditorInfo('Editor registered successfully');
                }}
              />
            </div>
            
            {/* Debug Info */}
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Debug Information
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Editor Status: {editorInfo}
              </p>
              <button
                onClick={() => {
                  const editor = getCurrentEditor();
                  if (editor) {
                    setEditorInfo('Editor found and working!');
                    console.log('Current editor:', editor);
                  } else {
                    setEditorInfo('No editor found - check console');
                    console.log('No editor available');
                  }
                }}
                className="mt-2 px-3 py-1 text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700"
              >
                Test Editor Connection
              </button>
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                How to Use References
              </h3>
              <ol className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>1. Click the <strong>References</strong> button in the toolbar</li>
                <li>2. Select your preferred citation style (APA, MLA, etc.)</li>
                <li>3. Click <strong>Add New Source</strong> to add your first reference</li>
                <li>4. Fill in the source details (author, title, year, etc.)</li>
                <li>5. Use <strong>Insert Citation</strong> to add citations to your text</li>
                <li>6. Click <strong>Bibliography</strong> to generate a complete reference list</li>
                <li>7. Use <strong>Footnote</strong> or <strong>Endnote</strong> for additional references</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
