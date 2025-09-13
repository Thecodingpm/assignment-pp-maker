'use client';

import { useEffect, useRef, useState } from 'react';
import DraggableLineIndicator from './DraggableLineIndicator';

interface EnhancedDraggableBlocksPluginProps {
  containerRef?: React.RefObject<HTMLElement | HTMLDivElement | null>;
  snapThreshold?: number;
  lineColor?: string;
  onSnap?: (isSnapped: boolean) => void;
  onDrop?: (draggedElement: HTMLElement, dropTarget: Element) => void;
  className?: string;
}

export default function EnhancedDraggableBlocksPlugin({
  containerRef,
  snapThreshold = 50,
  lineColor = '#ff6b35',
  onSnap,
  onDrop,
  className = ''
}: EnhancedDraggableBlocksPluginProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);
  const [dropTarget, setDropTarget] = useState<Element | null>(null);
  
  const containerElementRef = useRef<HTMLElement | null>(null);
  const dragDataRef = useRef<string>('');

  // Get container element
  useEffect(() => {
    if (containerRef?.current) {
      containerElementRef.current = containerRef.current;
    } else {
      containerElementRef.current = document.querySelector('.lexical-editor') || document.body;
    }
  }, [containerRef]);

  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if the target is draggable
    const isDraggable = target.closest('.draggable-block') || 
                       target.closest('[data-lexical-key]') ||
                       target.matches('p, div, h1, h2, h3, h4, h5, h6, li');
    
    if (isDraggable) {
      setIsDragging(true);
      setDraggedElement(target);
      
      // Store the dragged element's HTML
      dragDataRef.current = target.outerHTML;
      e.dataTransfer?.setData('text/html', target.outerHTML);
      e.dataTransfer?.setData('text/plain', target.textContent || '');
      
      // Add dragging class for visual feedback
      target.classList.add('dragging');
      
      // Set drag image (optional - creates a custom drag preview)
      if (e.dataTransfer?.setDragImage) {
        const dragImage = target.cloneNode(true) as HTMLElement;
        dragImage.style.opacity = '0.5';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        
        // Remove the temporary element after a short delay
        setTimeout(() => {
          try {
            if (dragImage.parentNode) {
              document.body.removeChild(dragImage);
            }
          } catch (error) {
            console.warn('Could not remove drag image:', error);
          }
        }, 100);
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    
    // Find the drop target
    const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
    if (elementAtPoint) {
      const newDropTarget = elementAtPoint.closest('.draggable-block, [data-lexical-key], p, div, h1, h2, h3, h4, h5, h6, li');
      if (newDropTarget && newDropTarget !== draggedElement) {
        setDropTarget(newDropTarget);
      }
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    
    if (!draggedElement || !dropTarget) return;

    try {
      // Call custom drop handler if provided
      if (onDrop) {
        onDrop(draggedElement, dropTarget);
      } else {
        // Default drop behavior
        const dropContainer = dropTarget.closest('[contenteditable="true"]');
        if (dropContainer && dragDataRef.current) {
          // Create a temporary container to parse the HTML
          const temp = document.createElement('div');
          temp.innerHTML = dragDataRef.current;
          
          // Remove the original dragged element
          try {
            if (draggedElement.parentNode) {
              draggedElement.remove();
            }
          } catch (error) {
            console.warn('Could not remove dragged element:', error);
          }
          
          // Insert the new element at the drop target
          const block = temp.firstChild;
          if (block) {
            dropContainer.insertBefore(block, dropTarget.nextSibling);
          }
        }
      }
    } catch (error) {
      console.error('Error during drop operation:', error);
    }
    
    // Clean up
    setIsDragging(false);
    setDraggedElement(null);
    setDropTarget(null);
    dragDataRef.current = '';
  };

  const handleDragEnd = () => {
    // Remove dragging class from all elements
    const draggingElements = document.querySelectorAll('.dragging');
    draggingElements.forEach(el => el.classList.remove('dragging'));
    
    // Clean up state
    setIsDragging(false);
    setDraggedElement(null);
    setDropTarget(null);
    dragDataRef.current = '';
  };

  // Set up event listeners
  useEffect(() => {
    if (!containerElementRef.current) return;

    const container = containerElementRef.current;

    // Add event listeners to the container
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragend', handleDragEnd);

    return () => {
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragend', handleDragEnd);
    };
  }, [draggedElement, dropTarget]);

  return (
    <DraggableLineIndicator
      containerRef={containerRef}
      snapThreshold={snapThreshold}
      lineColor={lineColor}
      onSnap={onSnap}
      className={className}
    />
  );
}
