'use client';

import { useState, useCallback, useRef } from 'react';
import { Slide } from '../types/editor';

interface HistoryState {
  slides: Slide[];
  timestamp: number;
  action: string;
}

export function useVersionHistory(initialSlides: Slide[]) {
  const [history, setHistory] = useState<HistoryState[]>([{
    slides: initialSlides,
    timestamp: Date.now(),
    action: 'initial'
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  const maxHistorySize = 50; // Limit history size to prevent memory issues

  const addToHistory = useCallback((slides: Slide[], action: string) => {
    if (isUndoRedo) return; // Don't add to history during undo/redo operations

    setHistory(prevHistory => {
      const newState: HistoryState = {
        slides: JSON.parse(JSON.stringify(slides)), // Deep clone
        timestamp: Date.now(),
        action
      };

      // Remove any states after current index (when branching from history)
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      newHistory.push(newState);

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }

      return newHistory;
    });

    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, isUndoRedo, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setIsUndoRedo(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsUndoRedo(false), 100);
      return history[currentIndex - 1].slides;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setIsUndoRedo(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsUndoRedo(false), 100);
      return history[currentIndex + 1].slides;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const getCurrentState = useCallback(() => {
    return history[currentIndex]?.slides || [];
  }, [history, currentIndex]);

  const clearHistory = useCallback(() => {
    const currentSlides = getCurrentState();
    setHistory([{
      slides: currentSlides,
      timestamp: Date.now(),
      action: 'clear'
    }]);
    setCurrentIndex(0);
  }, [getCurrentState]);

  const getHistoryInfo = useCallback(() => {
    return {
      currentIndex,
      totalStates: history.length,
      canUndo,
      canRedo,
      currentAction: history[currentIndex]?.action || 'unknown',
      lastAction: history[history.length - 1]?.action || 'unknown'
    };
  }, [currentIndex, history.length, canUndo, canRedo, history]);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentState,
    clearHistory,
    getHistoryInfo,
    isUndoRedo
  };
}

