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
        isActive ? 'ring-2 ring-blue-300' : 'hover:ring-1 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div
        className="w-full h-20 bg-white border border-gray-200 rounded-lg overflow-hidden relative"
        style={{ 
          backgroundColor: slide.backgroundColor,
          backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Slide number */}
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-purple-600 text-sm font-medium">
          {index + 1}
        </div>

        {/* Elements preview */}
        <div className="w-full h-full relative">
          {/* Dark overlay for background images */}
          {slide.backgroundImage && (
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          )}
          
          {slide.elements.slice(0, 5).map((element, elementIndex) => {
            const left = (element.x / 1920) * 100;
            const top = (element.y / 1080) * 100;
            const width = (element.width / 1920) * 100;
            const height = (element.height / 1080) * 100;
            
            return (
              <div
                key={elementIndex}
                className="absolute rounded text-xs overflow-hidden"
                style={{
                  left: left + '%',
                  top: top + '%',
                  width: width + '%',
                  height: height + '%',
                }}
              >
                {element.type === 'text' ? (
                  <div 
                    className="w-full h-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-medium"
                    style={{ fontSize: '8px' }}
                  >
                    T
                  </div>
                ) : element.type === 'image' ? (
                  <div className="w-full h-full bg-green-100 border border-green-200 flex items-center justify-center text-green-600 font-medium" style={{ fontSize: '8px' }}>
                    📷
                  </div>
                ) : element.type === 'shape' ? (
                  <div className="w-full h-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 font-medium" style={{ fontSize: '8px' }}>
                    ⬜
                  </div>
                ) : element.type === 'chart' ? (
                  <div className="w-full h-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-medium" style={{ fontSize: '8px' }}>
                    📊
                  </div>
                ) : element.type === 'table' ? (
                  <div className="w-full h-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-medium" style={{ fontSize: '8px' }}>
                    ⚏
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-medium" style={{ fontSize: '8px' }}>
                    ?
                  </div>
                )}
              </div>
            );
          })}
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
