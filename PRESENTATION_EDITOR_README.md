# Presentation Editor

A Pitch.com-like slide presentation editor built with React, TypeScript, and modern web technologies.

## Features

### Core Functionality
- **Instant Text Box Creation**: Single click on empty canvas creates text box with blinking cursor
- **Drag & Drop**: Smooth 60fps drag and drop with @dnd-kit
- **8-Point Resize**: Elements have 8 resize handles (corners + sides)
- **Multi-Select**: Ctrl+click or drag selection box for multiple elements
- **Real-time Editing**: Double-click text to edit, click outside to finish

### Layout Structure
- **Left Sidebar (250px)**: Slide thumbnails with drag & drop reordering
- **Center Canvas**: Active slide editing area with zoom controls
- **Top Toolbar**: Formatting tools (text, shapes, images, animations)
- **Right Panel**: Element properties when selected

### Element Types
- **Text Elements**: Editable text boxes with font controls
- **Shapes**: Rectangle, circle, triangle with fill/stroke options
- **Images**: Upload and insert images with alt text

### Slide Management
- Add new slides with + button
- Drag slides to reorder
- Right-click slide for duplicate/delete options
- Slide thumbnails update in real-time

## Technology Stack

- **Frontend**: React 18, TypeScript, Next.js 14
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## File Structure

```
app/
├── components/
│   ├── Editor/
│   │   ├── SlideCanvas.tsx      # Main editing area
│   │   ├── TextElement.tsx      # Editable text boxes
│   │   ├── ResizeHandles.tsx    # 8-point resize system
│   │   └── SelectionBox.tsx     # Multi-select area
│   ├── Sidebar/
│   │   ├── SlideList.tsx        # Thumbnail navigation
│   │   └── SlideThumbnail.tsx   # Individual slide preview
│   ├── Toolbar/
│   │   └── MainToolbar.tsx      # Top formatting bar
│   └── PropertyPanel.tsx        # Right sidebar properties
├── stores/
│   └── useEditorStore.ts        # Zustand state management
├── types/
│   └── editor.ts                # TypeScript interfaces
└── presentation-editor/
    └── page.tsx                 # Main editor page
```

## Usage

1. Navigate to `/presentation-demo` to see the demo
2. Click "Open Editor" to access the full editor
3. Click anywhere on the canvas to create text boxes
4. Use the toolbar to add shapes, images, and format text
5. Drag elements to reposition, use handles to resize
6. Use the sidebar to manage slides

## Keyboard Shortcuts

- **Delete**: Remove selected elements
- **Escape**: Exit text editing mode
- **Ctrl+Click**: Multi-select elements
- **Arrow Keys**: Nudge selected elements (planned)

## Future Enhancements

- Undo/redo system with command pattern
- Auto-save every 3 seconds
- Real-time collaborative editing
- Export to PDF/PPTX
- Animation system
- Template library
- Mobile responsive with touch gestures

## Development

The editor is built with a modular architecture:

- **State Management**: Centralized Zustand store for all editor state
- **Component Composition**: Reusable components for different element types
- **Type Safety**: Full TypeScript coverage with strict typing
- **Performance**: Optimized rendering with React.memo and useCallback

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is part of the Document Maker application.
