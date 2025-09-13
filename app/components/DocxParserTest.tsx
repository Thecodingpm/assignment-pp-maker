'use client';

import React, { useState } from 'react';
import { parseDocxFile, validateDocxFile, testDocxParsing } from '../utils/docxParser';

interface TestResult {
  success: boolean;
  content?: string;
  title?: string;
  metadata?: any;
  error?: string;
  parsingTime?: number;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
  };
}

export default function DocxParserTest() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRawHtml, setShowRawHtml] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Validate file first
      const validation = validateDocxFile(file);
      if (!validation.isValid) {
        setResult({
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        });
        return;
      }

      // Parse the file
      const parseResult = await parseDocxFile(file);
      const endTime = performance.now();

      setResult({
        success: true,
        content: parseResult.content,
        title: parseResult.metadata?.title || 'Untitled',
        metadata: parseResult.metadata || {},
        error: undefined,
        parsingTime: endTime - startTime,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      });

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      await testDocxParsing(file);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          🧪 Enhanced DOCX Parser Test
        </h1>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="hidden"
              id="docx-file-input"
            />
            <label
              htmlFor="docx-file-input"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📄 Choose DOCX File
            </label>
            {file && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-medium">{file.name}</span> 
                ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {file && (
            <div className="flex space-x-4">
              <button
                onClick={handleParse}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '⏳ Parsing...' : '🔍 Parse Document'}
              </button>
              
              <button
                onClick={handleTest}
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '⏳ Testing...' : '🧪 Run Tests'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Parsing Results
          </h2>

          {/* File Information */}
          {result.fileInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📄 File Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Name:</span>
                  <div className="text-gray-900 dark:text-white">{result.fileInfo.name}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Size:</span>
                  <div className="text-gray-900 dark:text-white">
                    {(result.fileInfo.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                  <div className="text-gray-900 dark:text-white">{result.fileInfo.type}</div>
                </div>
              </div>
            </div>
          )}

          {/* Parsing Status */}
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? '✅' : '❌'}
              </span>
              <div>
                <h3 className={`font-semibold ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {result.success ? 'Parsing Successful' : 'Parsing Failed'}
                </h3>
                {result.error && (
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    {result.error}
                  </p>
                )}
                {result.parsingTime && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Parsing time: {result.parsingTime.toFixed(2)}ms
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          {result.metadata && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                📋 Document Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <div className="text-gray-900 dark:text-white">
                      {(() => {
                        if (value === null || value === undefined) return 'Not available';
                        if (typeof value === 'object') return JSON.stringify(value);
                        return String(value);
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Preview */}
          {result.content && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  👁️ Content Preview
                </h3>
                <button
                  onClick={() => setShowRawHtml(!showRawHtml)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {showRawHtml ? '👁️ Show Rendered' : '📄 Show Raw HTML'}
                </button>
              </div>

              {showRawHtml ? (
                <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-words">
                    {result.content}
                  </pre>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Rendered HTML Preview
                    </span>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div
                      className="docx-enhanced"
                      dangerouslySetInnerHTML={{ __html: result.content }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
          📖 How to Use
        </h3>
        <div className="text-blue-800 dark:text-blue-300 space-y-2 text-sm">
          <p>1. <strong>Upload a DOCX file</strong> - Click "Choose DOCX File" to select a Word document</p>
          <p>2. <strong>Parse the document</strong> - Click "Parse Document" to extract content with formatting</p>
          <p>3. <strong>Run tests</strong> - Click "Run Tests" to see detailed analysis in the console</p>
          <p>4. <strong>View results</strong> - See the parsed content, metadata, and formatting preservation</p>
        </div>
      </div>
    </div>
  );
}
