'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Slide } from '../../types/editor';
import { Trash2, Copy, MoreVertical } from 'lucide-react';

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const SlideThumbnail: React.FC<SlideThumbnailProps> = ({
  slide,
  index,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer mb-3 ${
        isActive ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div
        className="w-full h-24 bg-white border border-gray-200 rounded-lg overflow-hidden relative"
        style={{ backgroundColor: slide.backgroundColor }}
      >
        {/* Slide number */}
        <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
          {index + 1}
        </div>

        {/* Elements preview */}
        <div className="w-full h-full relative">
          {slide.elements.slice(0, 3).map((element, elementIndex) => (
            <div
              key={elementIndex}
              className="absolute bg-gray-300 rounded"
              style={{
                left: (element.x / 1920) * 100 + '%',
                top: (element.y / 1080) * 100 + '%',
                width: (element.width / 1920) * 100 + '%',
                height: (element.height / 1080) * 100 + '%',
              }}
            />
          ))}
        </div>

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="w-6 h-6 bg-white hover:bg-gray-100 rounded flex items-center justify-center shadow-sm"
          title="Duplicate slide"
        >
          <Copy className="w-3 h-3 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-6 h-6 bg-white hover:bg-gray-100 rounded flex items-center justify-center shadow-sm"
          title="Delete slide"
        >
          <Trash2 className="w-3 h-3 text-red-600" />
        </button>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute inset-0 ring-2 ring-blue-500 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

export default SlideThumbnail;
