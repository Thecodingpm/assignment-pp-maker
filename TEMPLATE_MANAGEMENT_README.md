# Role-Based Template Management System

This document describes the role-based template management system implemented in the presentation editor.

## Overview

The system provides two distinct user roles with different capabilities:

- **Admin Users**: Can create, save, and manage templates
- **Regular Users**: Can browse and use templates created by admins

## Features

### 1. User Roles

#### Admin Role
- **Email**: `ahmadmuaaz292@gmail.com`
- **Capabilities**:
  - Create and save templates from the editor
  - Access to "Save as Template" button in the editor toolbar
  - All templates are automatically marked as public
  - Can delete templates (via API)

#### User Role
- **All other users**
- **Capabilities**:
  - Browse templates in the Template Gallery
  - Load templates into the editor
  - Cannot save templates (no "Save as Template" button)

### 2. Template Creation (Admin Only)

#### In the Editor
1. Admin creates a design in the presentation editor
2. Clicks the "Save as Template" button (green button in toolbar)
3. Fills out the template creation modal:
   - Title (required)
   - Description
   - Category (dropdown selection)
   - Tags (optional)
4. Template is saved to Firebase Firestore
5. Template becomes immediately available to all users

#### Template Data Structure
```typescript
interface EditorTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  slides: any[]; // Editor slides from useEditorStore
  createdBy: string;
  createdByRole: 'admin';
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
}
```

### 3. Template Gallery (All Users)

#### Access
- Dashboard → Templates tab → "Browse Templates" button
- Direct URL: `/templates-gallery`

#### Features
- **Search**: Search by title or description
- **Filter**: Filter by category
- **Preview**: Visual preview of templates
- **Usage Stats**: Shows how many times template has been used
- **Load Template**: Click to load template into editor

#### Template Loading Process
1. User clicks on a template in the gallery
2. Template data is fetched from API
3. Slides are loaded into the editor store
4. User is redirected to the editor with the template loaded
5. Usage count is incremented

### 4. API Endpoints

#### GET `/api/templates`
- **Purpose**: Fetch all public templates
- **Access**: All users
- **Returns**: Array of `EditorTemplate` objects

#### POST `/api/templates`
- **Purpose**: Create a new template
- **Access**: Admin only
- **Body**: 
  ```json
  {
    "templateData": {
      "title": "string",
      "description": "string", 
      "category": "string",
      "slides": "array",
      "tags": "array"
    },
    "userRole": "admin",
    "userId": "string"
  }
  ```

#### GET `/api/templates/[id]`
- **Purpose**: Get specific template and increment usage count
- **Access**: All users
- **Returns**: Single `EditorTemplate` object

#### DELETE `/api/templates/[id]`
- **Purpose**: Delete a template
- **Access**: Admin only
- **Body**: `{ "userRole": "admin" }`

### 5. Database Structure

#### Firestore Collection: `editorTemplates`
```javascript
{
  title: "Template Title",
  description: "Template description",
  category: "General",
  thumbnail: "base64_or_url",
  slides: [...], // Editor slide data
  createdBy: "user_id",
  createdByRole: "admin",
  createdAt: "timestamp",
  updatedAt: "timestamp", 
  isPublic: true,
  usageCount: 0,
  tags: ["tag1", "tag2"]
}
```

### 6. User Flows

#### Admin Flow
1. **Login** as admin (`ahmadmuaaz292@gmail.com`)
2. **Create Design** in the presentation editor
3. **Save Template** using "Save as Template" button
4. **Fill Details** in the template creation modal
5. **Template Saved** and available to all users

#### User Flow
1. **Login** as regular user
2. **Browse Templates** via Dashboard → Templates → Browse Templates
3. **Search/Filter** templates as needed
4. **Select Template** by clicking on it
5. **Edit Template** in the presentation editor
6. **Save as Project** (not as template - users can't save templates)

### 7. Security

#### Role-Based Access Control
- **Frontend**: UI elements (buttons, modals) are conditionally rendered based on user role
- **Backend**: API endpoints validate user role before allowing operations
- **Database**: Templates are stored with role information for audit purposes

#### Admin Authentication
- Admin role is determined by email address (`ahmadmuaaz292@gmail.com`)
- Role is set during login/registration
- Role is checked both in frontend and backend

### 8. File Structure

```
app/
├── api/templates/
│   ├── route.ts              # GET all templates, POST create template
│   └── [id]/route.ts         # GET specific template, DELETE template
├── components/
│   ├── SaveTemplateModal.tsx # Template creation modal
│   └── Toolbar/MainToolbar.tsx # Updated with Save as Template button
├── templates-gallery/
│   └── page.tsx              # Template gallery page
├── types/
│   └── document.ts           # Updated with role and template types
└── firebase/
    └── auth.ts               # Updated with role support
```

### 9. Usage Examples

#### Creating a Template (Admin)
```typescript
// In the editor, admin clicks "Save as Template"
const handleSaveTemplate = () => {
  setShowSaveTemplateModal(true);
};

// Modal collects template data
const handleTemplateSave = async (templateData) => {
  const response = await fetch('/api/templates', {
    method: 'POST',
    body: JSON.stringify({
      templateData: { ...templateData, slides: currentSlides },
      userRole: user.role,
      userId: user.id
    })
  });
};
```

#### Loading a Template (User)
```typescript
// In template gallery
const loadTemplate = async (templateId) => {
  const response = await fetch(`/api/templates/${templateId}`);
  const data = await response.json();
  
  if (data.success) {
    setSlides(data.template.slides);
    router.push('/presentation-editor?id=new');
  }
};
```

### 10. Future Enhancements

- **Template Categories**: More granular categorization
- **Template Ratings**: User rating system
- **Template Comments**: User feedback system
- **Template Versioning**: Track template changes
- **Bulk Operations**: Admin bulk template management
- **Template Analytics**: Usage statistics and insights
- **Template Sharing**: Share templates with specific users
- **Template Approval**: Review process for user-submitted templates

## Testing

To test the system:

1. **Admin Testing**:
   - Login with `ahmadmuaaz292@gmail.com`
   - Create a presentation in the editor
   - Click "Save as Template" button
   - Fill out the template creation form
   - Verify template appears in gallery

2. **User Testing**:
   - Login with any other email
   - Go to Dashboard → Templates → Browse Templates
   - Search and filter templates
   - Click on a template to load it
   - Verify template loads in editor
   - Verify no "Save as Template" button is visible

## Troubleshooting

### Common Issues

1. **"Save as Template" button not visible**
   - Check if user is logged in as admin
   - Verify admin role is properly set

2. **Template not saving**
   - Check browser console for API errors
   - Verify Firebase connection
   - Check user permissions

3. **Template not loading**
   - Check template ID in URL
   - Verify template exists in database
   - Check network connectivity

4. **Template gallery empty**
   - Check if templates exist in database
   - Verify API endpoint is working
   - Check for JavaScript errors in console


