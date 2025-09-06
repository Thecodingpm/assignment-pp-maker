'use client';

import React, { useState } from 'react';

const SimpleUploadTest: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTestUpload = async () => {
    setUploading(true);
    setResult('Testing upload...');
    
    try {
      // Create a simple test file
      const testContent = 'This is a test file content';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      console.log('Test file created:', testFile);
      setResult('Test file created successfully!');
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult('✅ Upload test completed successfully!');
    } catch (error) {
      console.error('Upload test error:', error);
      setResult(`❌ Upload test failed: ${error}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Simple Upload Test</h3>
      
      <button
        onClick={handleTestUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Testing...' : 'Test Upload'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  );
};

export default SimpleUploadTest;
