# Draggable Line Indicator

A modular, reusable draggable line indicator component that provides visual feedback during drag and drop operations. Features an orange vertical line that follows the mouse position and provides snap feedback with vibration animation.

## Features

- 🟠 **Orange vertical line indicator** during drag operations
- ✨ **Smooth animations** for line appearance/disappearance
- 🎯 **Snap feedback** with vibration animation when near center alignment
- 🎨 **Customizable** snap threshold, line color, and styling
- 🔧 **Modular design** for easy integration into any editor
- 📱 **Responsive** and works across different screen sizes
- 🎪 **Visual feedback** with dots at line ends and enhanced glow effects

## Components

### 1. DraggableLineIndicator

The core component that renders the orange line indicator.

```tsx
import DraggableLineIndicator from './components/DraggableLineIndicator';

<DraggableLineIndicator
  containerRef={containerRef}
  snapThreshold={50}
  lineColor="#ff6b35"
  lineWidth={3}
  vibrationDuration={150}
  onSnap={(isSnapped) => console.log('Snapped:', isSnapped)}
  className="custom-indicator"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerRef` | `React.RefObject<HTMLElement>` | `undefined` | Reference to the container element |
| `snapThreshold` | `number` | `50` | Distance in pixels for snap detection |
| `lineColor` | `string` | `"#ff6b35"` | Color of the indicator line |
| `lineWidth` | `number` | `3` | Width of the indicator line in pixels |
| `vibrationDuration` | `number` | `150` | Duration of snap feedback vibration in ms |
| `onSnap` | `(isSnapped: boolean) => void` | `undefined` | Callback when snap state changes |
| `className` | `string` | `""` | Additional CSS classes |

### 2. EnhancedDraggableBlocksPlugin

A complete drag and drop plugin that integrates the line indicator with drag functionality.

```tsx
import EnhancedDraggableBlocksPlugin from './components/EnhancedDraggableBlocksPlugin';

<EnhancedDraggableBlocksPlugin
  containerRef={containerRef}
  snapThreshold={60}
  lineColor="#ff6b35"
  onSnap={handleSnap}
  onDrop={handleDrop}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerRef` | `React.RefObject<HTMLElement>` | `undefined` | Reference to the container element |
| `snapThreshold` | `number` | `50` | Distance in pixels for snap detection |
| `lineColor` | `string` | `"#ff6b35"` | Color of the indicator line |
| `onSnap` | `(isSnapped: boolean) => void` | `undefined` | Callback when snap state changes |
| `onDrop` | `(draggedElement: HTMLElement, dropTarget: Element) => void` | `undefined` | Custom drop handler |
| `className` | `string` | `""` | Additional CSS classes |

## Usage Examples

### Basic Integration

```tsx
import React, { useRef } from 'react';
import DraggableLineIndicator from './components/DraggableLineIndicator';

function MyEditor() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="editor-container">
      {/* Your editor content */}
      <div className="draggable-block" draggable={true}>
        Draggable content
      </div>
      
      <DraggableLineIndicator
        containerRef={containerRef}
        snapThreshold={50}
        lineColor="#ff6b35"
        onSnap={(isSnapped) => {
          console.log('Snap state:', isSnapped);
        }}
      />
    </div>
  );
}
```

### Integration with Lexical Editor

```tsx
import DraggableLineIndicator from './components/DraggableLineIndicator';

export default function LexicalEditor() {
  return (
    <div className="w-full h-full lexical-editor">
      <LexicalComposer initialConfig={config}>
        <div className="w-full h-full relative">
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<div>Start typing...</div>}
          />
          
          {/* Add the draggable line indicator */}
          <DraggableLineIndicator 
            snapThreshold={50}
            lineColor="#ff6b35"
            onSnap={(isSnapped) => {
              console.log('Snap state changed:', isSnapped);
            }}
          />
          
          {/* Other plugins */}
          <HistoryPlugin />
          <ListPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}
```

### Custom Drop Handler

```tsx
import EnhancedDraggableBlocksPlugin from './components/EnhancedDraggableBlocksPlugin';

function MyComponent() {
  const handleDrop = (draggedElement: HTMLElement, dropTarget: Element) => {
    // Custom drop logic
    console.log('Dropped:', draggedElement.textContent);
    console.log('Target:', dropTarget.textContent);
    
    // Your custom reordering logic here
  };

  return (
    <EnhancedDraggableBlocksPlugin
      onDrop={handleDrop}
      onSnap={(isSnapped) => {
        // Optional: Add haptic feedback
        if (isSnapped && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }}
    />
  );
}
```

## Styling

The component includes built-in CSS with smooth animations and visual effects. You can customize the appearance by:

### Custom Colors

```tsx
<DraggableLineIndicator
  lineColor="#3b82f6" // Blue line
  snapThreshold={40}
/>
```

### Custom CSS Classes

```css
/* Custom styling */
.custom-indicator .line {
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.6);
}

.custom-indicator.snapped .line {
  background: #ff4500;
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

## How It Works

1. **Drag Detection**: Listens for `dragstart` events on draggable elements
2. **Line Positioning**: Calculates the optimal position for the line based on mouse position and nearby elements
3. **Snap Detection**: Detects when the dragged item is close to the center of another element
4. **Visual Feedback**: Shows the orange line with smooth animations and vibration feedback
5. **Drop Handling**: Provides callbacks for custom drop logic

## Browser Support

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (limited support)

## Performance Considerations

- The component uses efficient event listeners and cleanup
- Animations are hardware-accelerated using CSS transforms
- Minimal DOM manipulation for optimal performance
- Automatic cleanup of event listeners and timeouts

## Troubleshooting

### Line not appearing
- Ensure the container has `position: relative`
- Check that draggable elements have the correct classes or attributes
- Verify the container ref is properly set

### Snap not working
- Adjust the `snapThreshold` value
- Ensure elements are properly positioned
- Check for CSS conflicts that might affect positioning

### Performance issues
- Reduce the number of draggable elements
- Increase the `snapThreshold` to reduce calculations
- Consider using `React.memo` for the component if needed

## Demo

Visit `/draggable-demo` to see the component in action with sample draggable elements.

## Contributing

The component is designed to be modular and extensible. Feel free to:

- Add new animation types
- Implement additional snap behaviors
- Create new visual indicators
- Add accessibility features

## License

This component is part of the assignment-pp-maker project and follows the same licensing terms.
