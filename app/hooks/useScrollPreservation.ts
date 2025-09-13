import { useRef, useCallback } from 'react';

export function useScrollPreservation() {
  const scrollPositionRef = useRef<number>(0);
  
  const preserveScroll = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
  }, []);
  
  const restoreScroll = useCallback(() => {
    // Use multiple animation frames to ensure DOM has settled
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Add a longer delay to ensure React has finished rendering
        setTimeout(() => {
          window.scrollTo(0, scrollPositionRef.current);
        }, 200);
      });
    });
  }, []);
  
  return { preserveScroll, restoreScroll };
}
