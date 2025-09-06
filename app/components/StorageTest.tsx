'use client';

import React, { useEffect, useState } from 'react';
import { getStorageInfo } from '../lib/unifiedStorage';

const StorageTest: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    const info = getStorageInfo();
    setStorageInfo(info);
  }, []);

  if (!storageInfo) {
    return <div>Loading storage configuration...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Storage Configuration</h3>
      <div className="space-y-2">
        <p><strong>Provider:</strong> {storageInfo.provider}</p>
        <p><strong>Configured:</strong> {storageInfo.configured ? '✅ Yes' : '❌ No'}</p>
        
        {storageInfo.provider === 's3' && (
          <div className="ml-4">
            <p><strong>Region:</strong> {storageInfo.config.region}</p>
            <p><strong>Bucket:</strong> {storageInfo.config.bucket}</p>
            <p><strong>Has Credentials:</strong> {storageInfo.config.hasCredentials ? '✅ Yes' : '❌ No'}</p>
          </div>
        )}
        
        {storageInfo.provider === 'firebase' && (
          <div className="ml-4">
            <p><strong>Using Firebase Storage</strong> ✅</p>
          </div>
        )}
      </div>
      
      {storageInfo.configured ? (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
          ✅ Storage is properly configured and ready to use!
        </div>
      ) : (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
          ❌ Storage configuration needs attention. Check your environment variables.
        </div>
      )}
    </div>
  );
};

export default StorageTest;
