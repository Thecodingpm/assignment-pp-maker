# CV Templates Directory

This directory contains all CV/resume templates organized by category.

## 📁 Folder Structure

```
cv-templates/
├── index.json                 # Main template index
├── professional/              # Professional CV templates
│   └── rick-tang-cv.json     # Rick Tang CV template
├── creative/                  # Creative CV templates
├── modern/                    # Modern CV templates
├── executive/                 # Executive CV templates
└── README.md                  # This file
```

## 🎯 Template Categories

### Professional
- Clean, business-focused designs
- Traditional layouts
- Corporate-friendly styling

### Creative
- Artistic and design-focused
- Colorful and unique layouts
- Perfect for designers, artists, creatives

### Modern
- Contemporary designs
- Clean typography
- Tech and startup friendly

### Executive
- Sophisticated layouts
- Senior-level positioning
- Premium styling

## 📝 Adding New Templates

1. **Choose category** - Select appropriate folder
2. **Create template file** - Use existing templates as reference
3. **Update index.json** - Add template to main index
4. **Test template** - Ensure it displays correctly in editor

## 🔧 Template Format

Each template should follow this structure:

```json
{
  "id": "unique-template-id",
  "name": "Template Name",
  "description": "Template description",
  "category": "professional|creative|modern|executive",
  "preview": "preview_image_url",
  "slides": [
    {
      "id": "slide-1",
      "type": "cv-template",
      "title": "Template Title",
      "content": "Template Content",
      "layout": "cv-layout",
      "backgroundColor": "#ffffff",
      "elements": [
        // Template elements here
      ],
      "imageRequests": []
    }
  ]
}
```

## 🚀 Usage

Templates are automatically loaded by the dashboard and can be accessed through:
- Dashboard → Templates tab
- CV Templates section
- Click any template to open in editor

## 📋 TODO

- [ ] Add more professional templates
- [ ] Create creative CV templates
- [ ] Add modern CV designs
- [ ] Build executive CV templates
- [ ] Add template preview generation
- [ ] Create template upload system

