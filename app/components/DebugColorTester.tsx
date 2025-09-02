'use client';
import { useEffect, useState } from 'react';
import { applyColorFormat, updateCursorColorImmediate, setFormattingContext } from './CustomFormatPlugin';

export default function DebugColorTester() {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setTestResults(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testColor = (color: string) => {
    addLog(`Testing color: ${color}`);
    
    // Test 1: Direct cursor color update
    updateCursorColorImmediate(color);
    addLog(`✓ Cursor color update attempted`);
    
    // Test 2: Check if editor exists
    const editor = (window as any).getCurrentEditor?.();
    if (editor) {
      addLog(`✓ Editor found`);
      
      // Test 3: Apply color format
      try {
        applyColorFormat(editor, color);
        addLog(`✓ Color format applied`);
      } catch (error) {
        addLog(`✗ Error applying color format: ${error}`);
      }
      
      // Test 4: Set formatting context
      try {
        setFormattingContext(editor, color);
        addLog(`✓ Formatting context set`);
      } catch (error) {
        addLog(`✗ Error setting formatting context: ${error}`);
      }
    } else {
      addLog(`✗ Editor not found`);
    }
    
    // Test 5: Check DOM elements
    const contentEditable = document.querySelector('.lexical-editor [contenteditable="true"]') as HTMLElement;
    if (contentEditable) {
      addLog(`✓ ContentEditable found`);
      addLog(`Current caret-color: ${getComputedStyle(contentEditable).caretColor}`);
      
      // Force visual update
      contentEditable.style.caretColor = color;
      addLog(`✓ Direct style applied: ${color}`);
    } else {
      addLog(`✗ ContentEditable not found`);
    }
    
    // Test 6: CSS Variable check
    const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--cursor-color');
    addLog(`CSS Variable --cursor-color: ${cssVar}`);
  };

  const debugCurrentState = () => {
    addLog('=== DEBUGGING CURRENT STATE ===');
    
    // Check all possible editor elements
    const lexicalEditor = document.querySelector('.lexical-editor');
    const contentEditable = document.querySelector('[contenteditable="true"]');
    const editorInput = document.querySelector('.editor-input');
    
    addLog(`Lexical editor found: ${!!lexicalEditor}`);
    addLog(`ContentEditable found: ${!!contentEditable}`);
    addLog(`Editor input found: ${!!editorInput}`);
    
    if (contentEditable) {
      const styles = getComputedStyle(contentEditable);
      addLog(`Current caret-color: ${styles.caretColor}`);
      addLog(`Current color: ${styles.color}`);
      addLog(`Is focused: ${document.activeElement === contentEditable}`);
    }
    
    // Check for dynamic styles
    const dynamicStyle = document.getElementById('lexical-cursor-color');
    addLog(`Dynamic style exists: ${!!dynamicStyle}`);
    if (dynamicStyle) {
      addLog(`Dynamic style content: ${dynamicStyle.textContent?.slice(0, 100)}...`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      width: '300px',
      background: 'white',
      border: '1px solid #ccc',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h4>Color Debug Tester</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={debugCurrentState} style={{ marginRight: '5px' }}>
          Debug State
        </button>
        <button onClick={() => testColor('#ff0000')}>Test Red</button>
        <button onClick={() => testColor('#00ff00')}>Test Green</button>
        <button onClick={() => testColor('#0000ff')}>Test Blue</button>
      </div>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '5px', 
        fontSize: '10px',
        fontFamily: 'monospace'
      }}>
        {testResults.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
      </div>
      
      <button 
        onClick={() => setTestResults([])}
        style={{ marginTop: '5px', fontSize: '10px' }}
      >
        Clear Log
      </button>
    </div>
  );
}
