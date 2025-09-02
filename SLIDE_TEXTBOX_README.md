# SlideTextBox Component

A React component that provides draggable and resizable text boxes with rich-text editing capabilities using Lexical Editor, designed for presentation editors.

## Features

- ✅ **Rich Text Editing**: Powered by Lexical Editor with support for formatting, lists, and headings
- ✅ **Draggable & Resizable**: Uses react-rnd for smooth drag and resize operations
- ✅ **Multiple Instances**: Support for multiple text boxes on a single slide
- ✅ **State Management**: Complete state tracking with callback updates
- ✅ **Selection System**: Click to select, visual feedback for selected state
- ✅ **Edit Mode**: Double-click to enter text editing mode
- ✅ **JSON Export**: Export all text box data in structured JSON format
- ✅ **Keyboard Shortcuts**: Delete to remove, Escape to deselect
- ✅ **Responsive Design**: Works on different screen sizes
- ✅ **TypeScript Support**: Fully typed with comprehensive interfaces

## Installation

The component uses dependencies already available in the project:
- `react-rnd` (for draggable/resizable functionality)
- `@lexical/react` and related packages (for rich text editing)
- `lexical` (core editor)

## Basic Usage

```tsx
import SlideTextBox from './components/SlideTextBox';

function MyPresentationEditor() {
  const [textBoxes, setTextBoxes] = useState([
    {
      id: '1',
      text: 'Welcome to my presentation!',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 150 }
    }
  ]);

  const handleTextBoxUpdate = (data) => {
    // Update your state with the new data
    setTextBoxes(prev => 
      prev.map(box => 
        box.id === data.id 
          ? { ...box, text: data.text, position: data.position, size: data.size }
          : box
      )
    );
  };

  return (
    <div className="relative w-full h-screen">
      {textBoxes.map(textBox => (
        <SlideTextBox
          key={textBox.id}
          id={textBox.id}
          initialText={textBox.text}
          initialPosition={textBox.position}
          initialSize={textBox.size}
          onUpdate={handleTextBoxUpdate}
          onSelect={(id) => console.log('Selected:', id)}
          isSelected={selectedId === textBox.id}
        />
      ))}
    </div>
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier for the text box |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialText` | `string` | `'Click to edit text...'` | Initial text content |
| `initialPosition` | `{x: number, y: number}` | `{x: 100, y: 100}` | Initial position on canvas |
| `initialSize` | `{width: number, height: number}` | `{width: 300, height: 150}` | Initial size of text box |
| `onUpdate` | `(data) => void` | `undefined` | Callback when text, position, or size changes |
| `onSelect` | `(id: string) => void` | `undefined` | Callback when text box is selected |
| `isSelected` | `boolean` | `false` | Whether this text box is currently selected |
| `zIndex` | `number` | `1` | Z-index for layering |
| `bounds` | `string` | `'parent'` | Bounds for dragging (react-rnd prop) |

## Callback Data Structure

The `onUpdate` callback receives an object with the following structure:

```typescript
{
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}
```

## User Interactions

### Mouse Interactions
- **Click**: Select the text box
- **Double-click**: Enter text editing mode
- **Drag**: Move the text box around the canvas
- **Resize handles**: Resize the text box from any corner or edge
- **Click outside**: Exit editing mode

### Keyboard Shortcuts
- **Delete/Backspace**: Remove selected text box (when not editing)
- **Escape**: Deselect current text box
- **Arrow keys**: Navigate between text boxes (implement in parent component)

## Styling

The component includes default styling with Tailwind CSS classes:

- **Default state**: White background, gray border
- **Selected state**: Blue border with shadow
- **Editing state**: Blue ring around the text box
- **Hover state**: Darker border on hover

### Custom Styling

You can customize the appearance by modifying the className and style props in the component:

```tsx
// In the SlideTextBox component, modify the main div className:
<div
  className={`
    w-full h-full 
    bg-white 
    border-2 
    rounded-lg 
    shadow-sm 
    transition-all 
    duration-200 
    ${isSelected 
      ? 'border-blue-500 shadow-lg' 
      : 'border-gray-300 hover:border-gray-400'
    }
    ${isEditing ? 'ring-2 ring-blue-300' : ''}
  `}
>
```

## State Management

### Local State
The component manages its own internal state for:
- Text content
- Position (x, y coordinates)
- Size (width, height)
- Editing mode
- Selection state

### Parent State Integration
The parent component should manage:
- Array of all text boxes
- Currently selected text box
- Any additional metadata

### Example State Structure

```typescript
interface TextBoxData {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([]);
const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null);
```

## JSON Export

The component supports exporting data in JSON format for saving slides:

```typescript
const exportSlideData = () => {
  const slideData = {
    textBoxes,
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  return slideData;
};
```

## Integration with Presentation Editor

### Adding to Existing Presentation Editor

1. Import the component:
```tsx
import SlideTextBox from './components/SlideTextBox';
```

2. Add state for text boxes:
```tsx
const [slideTextBoxes, setSlideTextBoxes] = useState([]);
```

3. Render text boxes in your canvas:
```tsx
{slideTextBoxes.map(textBox => (
  <SlideTextBox
    key={textBox.id}
    id={textBox.id}
    initialText={textBox.text}
    initialPosition={textBox.position}
    initialSize={textBox.size}
    onUpdate={handleTextBoxUpdate}
    onSelect={handleTextBoxSelect}
    isSelected={selectedTextBox === textBox.id}
  />
))}
```

### Adding Text Box Tool

```tsx
const addTextBox = () => {
  const newTextBox = {
    id: generateId(),
    text: 'New text box',
    position: { x: 150, y: 150 },
    size: { width: 250, height: 100 }
  };
  
  setSlideTextBoxes(prev => [...prev, newTextBox]);
  setSelectedTextBox(newTextBox.id);
};
```

## Demo

A complete demo is available at `/slide-textbox-demo` that shows:
- Multiple text boxes on a canvas
- Add/remove functionality
- Selection system
- Export capabilities
- Keyboard shortcuts

## Performance Considerations

- The component uses `useCallback` for event handlers to prevent unnecessary re-renders
- Lexical Editor instances are properly cleaned up when components unmount
- State updates are batched to minimize re-renders

## Browser Compatibility

- Modern browsers with ES6+ support
- React 18+
- TypeScript 4.5+

## Troubleshooting

### Common Issues

1. **Text not updating**: Ensure the `onUpdate` callback is properly implemented
2. **Dragging not working**: Check that the parent container has `position: relative`
3. **Resizing issues**: Verify that `react-rnd` is properly installed
4. **Lexical errors**: Check browser console for Lexical-specific errors

### Debug Mode

Enable debug logging by adding console.log statements in the component:

```tsx
const handleTextBoxUpdate = useCallback((data) => {
  console.log('TextBox update:', data);
  // ... rest of the handler
}, []);
```

## Future Enhancements

Potential improvements for future versions:
- Text formatting toolbar
- Font size and family controls
- Text alignment options
- Color picker for text and background
- Undo/redo functionality
- Copy/paste support
- Grouping multiple text boxes
- Animation support
- Export to different formats (PDF, images)

## License

This component is part of the assignment-pp-maker project.
