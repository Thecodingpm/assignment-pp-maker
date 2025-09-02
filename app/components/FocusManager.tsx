'use client';

import React, { useEffect, useRef } from 'react';

interface FocusManagerProps {
  children: React.ReactNode;
}

export default function FocusManager({ children }: FocusManagerProps) {
  const focusManagerRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Track the last active element
    const handleFocusIn = (e: FocusEvent) => {
      lastActiveElement.current = e.target as HTMLElement;
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if click is on a UI element that should capture focus
      const isUIElement = target.closest('input') || 
                          target.closest('textarea') || 
                          target.closest('select') ||
                          target.closest('.search') ||
                          target.closest('.search-box') ||
                          target.closest('.dropdown') ||
                          target.closest('.dropdown-menu') ||
                          target.closest('.modal') ||
                          target.closest('.popup') ||
                          target.closest('.toolbar') ||
                          target.closest('button') ||
                          target.closest('[role="button"]') ||
                          target.closest('[role="searchbox"]') ||
                          target.closest('[role="textbox"]') ||
                          target.closest('[data-testid*="search"]') ||
                          target.closest('[aria-label*="search"]') ||
                          target.closest('.GPTModal') ||
                          target.closest('.font-controls') ||
                          target.closest('.text-controls') ||
                          target.closest('.alignment-controls') ||
                          target.closest('.color-picker') ||
                          target.closest('.format-controls') ||
                          target.closest('.export-menu') ||
                          target.closest('.account-menu') ||
                          target.closest('.team-menu');

      if (isUIElement) {
        // This is a UI element, ensure any active text boxes are deactivated
        const activeTextBoxes = document.querySelectorAll('.canvas-text-box:focus');
        activeTextBoxes.forEach(textBox => {
          (textBox as HTMLElement).blur();
        });
        
        // Don't stop propagation - let the UI element handle its own click
        return;
      }
      
      // If clicking on canvas (not on a text box), deactivate all text boxes
      const isCanvasClick = target.closest('.canvas-background') && !target.closest('.canvas-text-box');
      if (isCanvasClick) {
        const activeTextBoxes = document.querySelectorAll('.canvas-text-box:focus');
        activeTextBoxes.forEach(textBox => {
          (textBox as HTMLElement).blur();
        });
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Always allow typing in UI elements
      const isUIElement = target.closest('input') || 
                          target.closest('textarea') || 
                          target.closest('select') ||
                          target.closest('.search') ||
                          target.closest('.search-box') ||
                          target.closest('.dropdown') ||
                          target.closest('.dropdown-menu') ||
                          target.closest('.modal') ||
                          target.closest('.popup') ||
                          target.closest('.toolbar') ||
                          target.closest('button') ||
                          target.closest('[role="button"]') ||
                          target.closest('[role="searchbox"]') ||
                          target.closest('[role="textbox"]') ||
                          target.closest('[data-testid*="search"]') ||
                          target.closest('[aria-label*="search"]') ||
                          target.closest('.GPTModal') ||
                          target.closest('.font-controls') ||
                          target.closest('.text-controls') ||
                          target.closest('.alignment-controls') ||
                          target.closest('.color-picker') ||
                          target.closest('.format-controls') ||
                          target.closest('.export-menu') ||
                          target.closest('.account-menu') ||
                          target.closest('.team-menu');

      if (isUIElement) {
        // Allow typing in UI elements - don't interfere
        return;
      }
      
      // Check if we're in a text box
      const isInTextBox = target.closest('.canvas-text-box');
      if (!isInTextBox) {
        // We're not in a text box and not in a UI element, ignore keystrokes
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Additional safety check: if any input is focused, prevent text box interference
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== target && 
          (activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           activeElement.tagName === 'SELECT')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    // Add global event listeners
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('keydown', handleGlobalKeyDown, true);

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, []);

  return (
    <div ref={focusManagerRef} className="w-full h-full">
      {children}
    </div>
  );
}
