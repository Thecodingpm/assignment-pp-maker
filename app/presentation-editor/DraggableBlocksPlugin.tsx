'use client';

import { useEffect } from 'react';

export default function DraggableBlocksPlugin() {
  useEffect(() => {
    const contentEditable = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (!contentEditable) return;

    const dragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
    };

    const dragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.draggable-block')) {
        e.dataTransfer?.setData('text/plain', target.outerHTML);
        target.classList.add('dragging');
      }
    };

    const dragEnd = () => {
      const dragging = document.querySelector('.dragging');
      if (dragging) {
        dragging.classList.remove('dragging');
      }
    };

    const drop = (e: DragEvent) => {
      e.preventDefault();
      const html = e.dataTransfer?.getData('text/plain');
      if (!html) return;

      const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
      const dropContainer = dropTarget?.closest('[contenteditable="true"]');
      if (dropContainer && html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        const dragging = document.querySelector('.dragging');
        if (dragging) dragging.remove();

        const block = temp.firstChild;
        if (block) {
          dropContainer.insertBefore(block, dropTarget?.parentElement?.nextSibling || null);
        }
      }
    };

    contentEditable.addEventListener('dragover', dragOver);
    contentEditable.addEventListener('drop', drop);
    contentEditable.addEventListener('dragstart', dragStart);
    contentEditable.addEventListener('dragend', dragEnd);

    return () => {
      contentEditable.removeEventListener('dragover', dragOver);
      contentEditable.removeEventListener('drop', drop);
      contentEditable.removeEventListener('dragstart', dragStart);
      contentEditable.removeEventListener('dragend', dragEnd);
    };
  }, []);

  return null;
}