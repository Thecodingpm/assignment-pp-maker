# 🎨 Figma Template Converter Guide

## 🚀 How to Use the Figma Template Converter

### Step 1: Find Templates in Figma Community
1. Go to [Figma Community](https://www.figma.com/community)
2. Search for "presentation templates"
3. Copy templates you like to your account

### Step 2: Get File Key from Figma
1. Open your template file in Figma
2. Copy the file key from the URL:
   ```
   https://www.figma.com/file/FILE_KEY_HERE/Template-Name
   ```
   The `FILE_KEY_HERE` is what you need!

### Step 3: Convert Template to JSON
```bash
# Run the converter
node scripts/figmaTemplateConverter.js
```

### Step 4: Update the Script
Edit `scripts/figmaTemplateConverter.js` and replace:
```javascript
const fileConfigs = [
  {
    fileKey: 'YOUR_FILE_KEY_HERE', // Replace with actual file key
    name: 'Modern Business Template',
    category: 'business',
    outputPath: path.join(__dirname, '../app/data/professionalDesignTemplates.json')
  }
];
```

## 🎯 Example File Keys
- Business templates: Use category 'business'
- Creative templates: Use category 'creative'  
- Startup templates: Use category 'startup'
- Education templates: Use category 'education'

## ✨ What Gets Converted
- **Text elements**: Fonts, sizes, colors, positioning
- **Shapes**: Rectangles, circles, colors, positioning
- **Images**: Placeholder positions and sizing
- **Layouts**: Exact positioning and spacing
- **Colors**: Background colors, text colors, accent colors

## 🔄 Workflow
1. Find template in Figma Community
2. Copy to your account
3. Get file key from URL
4. Run converter script
5. Template automatically added to AI system!

## 🎉 Result
Your AI system will now use the professional Figma templates automatically when you give commands like:
- "Create a business presentation"
- "Make a creative portfolio"
- "Generate a startup pitch"

The templates will have the exact same professional design as the Figma originals!



