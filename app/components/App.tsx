'use client';

import React from 'react';
import Canvas from './Canvas';
import Sidebar from './Sidebar';

const App: React.FC = () => {
  return (
    <div className="h-screen flex bg-gray-100">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar Area (optional - can be added later) */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <h1 className="text-xl font-semibold text-gray-900">Presentation Editor</h1>
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Clean Architecture Demo
            </div>
          </div>
        </div>
        
        {/* Canvas */}
        <Canvas />
      </div>

      {/* Right Sidebar */}
      <Sidebar />
    </div>
  );
};

export default App;
