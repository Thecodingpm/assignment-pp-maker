'use client';

import { usePathname } from 'next/navigation';
import { useState, useRef } from 'react';
import TopToolbar from './TopToolbar';
import GPTModal from './GPTModal';

export default function TopToolbarWrapper() {
  const pathname = usePathname();
  const [showGPTSearch, setShowGPTSearch] = useState(false);
  const [gptResponse, setGptResponse] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const topToolbarRef = useRef<{ insertGPTResponse: (response: string) => void }>(null);
  
  // Only show TopToolbar on assignment editor pages (not presentation editor)
  const isEditorPage = pathname?.includes('/assignment-editor/editor');
  
  if (!isEditorPage) {
    return null;
  }
  
  const handleGPTSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch('/api/gpt-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGptResponse(data.response);
      } else {
        console.error('GPT search failed');
      }
    } catch (error) {
      console.error('Error during GPT search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInsertResponse = () => {
    // Insert the response into the editor using TopToolbar's function
    if (topToolbarRef.current && gptResponse) {
      topToolbarRef.current.insertGPTResponse(gptResponse);
      setShowGPTSearch(false);
      setGptResponse('');
    }
  };

  const handleClearResponse = () => {
    setGptResponse('');
  };
  
  return (
    <>
      <TopToolbar 
        ref={topToolbarRef}
        showGPTSearch={showGPTSearch}
        setShowGPTSearch={setShowGPTSearch}
        gptResponse={gptResponse}
        setGptResponse={setGptResponse}
      />
      <GPTModal
        isOpen={showGPTSearch}
        onClose={() => setShowGPTSearch(false)}
        onSearch={handleGPTSearch}
        gptResponse={gptResponse}
        onInsertResponse={handleInsertResponse}
        onClearResponse={handleClearResponse}
        isSearching={isSearching}
      />
    </>
  );
} 