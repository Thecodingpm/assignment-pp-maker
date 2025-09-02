'use client';

import React from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEditorStore } from '../../stores/useEditorStore';
import SlideThumbnail from './SlideThumbnail';
import { Plus, Trash2, Copy } from 'lucide-react';

const SlideList: React.FC = () => {
  const {
    slides,
    currentSlideIndex,
    addSlide,
    deleteSlide,
    duplicateSlide,
    setCurrentSlide,
    reorderSlides,
  } = useEditorStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(slide => slide.id === active.id);
      const newIndex = slides.findIndex(slide => slide.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSlides(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Slides</h2>
        <p className="text-sm text-gray-500 mt-1">
          {slides.length} slide{slides.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Slide List */}
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map(slide => slide.id)}
            strategy={verticalListSortingStrategy}
          >
            {slides.map((slide, index) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={index}
                isActive={index === currentSlideIndex}
                onSelect={() => setCurrentSlide(index)}
                onDelete={() => deleteSlide(slide.id)}
                onDuplicate={() => duplicateSlide(slide.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add Slide Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={addSlide}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>
    </div>
  );
};

export default SlideList;
