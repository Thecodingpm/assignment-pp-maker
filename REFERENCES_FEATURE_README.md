# References Feature - Comprehensive Documentation

## Overview

The References feature provides a complete citation and bibliography management system similar to Microsoft Word's References functionality. It allows users to insert citations, manage sources, generate bibliographies, and add footnotes/endnotes with support for multiple citation styles.

## Features Implemented

### ✅ Core Functionality

1. **Citation Insertion**
   - Support for 6 citation styles: APA, MLA, Chicago, Harvard, IEEE, Vancouver
   - Automatic formatting based on selected style
   - In-text citation insertion with proper formatting

2. **Source Management**
   - Add new sources with comprehensive metadata
   - Support for multiple source types: Books, Journal Articles, Websites, Newspapers, Conference Papers, Theses, and Others
   - Edit and update existing sources
   - Delete sources with confirmation
   - Source tracking and management

3. **Bibliography Generation**
   - Automatic bibliography generation based on selected citation style
   - Proper formatting for different source types
   - Complete reference list insertion

4. **Footnotes and Endnotes**
   - Insert footnotes with automatic numbering
   - Insert endnotes with automatic numbering
   - Track and manage notes

5. **Citation Style Support**
   - **APA (American Psychological Association)**: `(Author, Year)` or `(Author, Year, p. Page)`
   - **MLA (Modern Language Association)**: `(Author)` or `(Author Page)`
   - **Chicago**: `(Author Year)` or `(Author Year, Page)`
   - **Harvard**: `(Author, Year)` or `(Author, Year, p. Page)`
   - **IEEE**: `[ID]` format
   - **Vancouver**: `[ID]` format

### ✅ User Interface

1. **Enhanced Toolbar Integration**
   - References button in the main toolbar
   - Dropdown menu with comprehensive options
   - Citation style selector
   - Quick action buttons

2. **Source Management Modal**
   - Clean, intuitive interface for adding/editing sources
   - Dynamic form fields based on source type
   - Validation for required fields
   - Support for extensive metadata

3. **Real-time Statistics**
   - Source count display
   - Citation count display
   - Notes count display

## Technical Implementation

### Components

1. **TopToolbar.tsx** (Enhanced)
   - Added References dropdown section
   - Integrated citation and bibliography functions
   - Source management state handling
   - Citation style selection

2. **ReferencesManager.tsx** (New)
   - Dedicated component for source management
   - Modal interface for adding/editing sources
   - Citation formatting logic
   - Bibliography generation

### Data Structures

```typescript
interface Source {
  id: string;
  type: 'book' | 'journal' | 'website' | 'newspaper' | 'conference' | 'thesis' | 'other';
  author: string;
  title: string;
  year: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  url?: string;
  doi?: string;
  isbn?: string;
}

interface Citation {
  id: string;
  sourceId: string;
  style: 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee' | 'vancouver';
  position: number;
  text: string;
  page?: string;
}

interface Footnote {
  id: string;
  content: string;
  position: number;
}

interface Endnote {
  id: string;
  content: string;
  position: number;
}
```

### Citation Formatting

The system automatically formats citations based on the selected style:

#### APA Style Examples:
- In-text: `(Smith, 2023)` or `(Smith, 2023, p. 45)`
- Bibliography: `Smith, J. (2023). Title of Book. Publisher.`

#### MLA Style Examples:
- In-text: `(Smith)` or `(Smith 45)`
- Bibliography: `Smith, John. "Title of Book." Publisher, 2023.`

#### Chicago Style Examples:
- In-text: `(Smith 2023)` or `(Smith 2023, 45)`
- Bibliography: `Smith, John. "Title of Book." Publisher, 2023.`

## Usage Instructions

### Adding Sources

1. Click the **References** button in the toolbar
2. Select your preferred citation style from the dropdown
3. Click **Add New Source**
4. Choose the source type (Book, Journal Article, Website, etc.)
5. Fill in the required fields (Author, Title, Year)
6. Add additional metadata as needed
7. Click **Add Source**

### Inserting Citations

1. Place your cursor where you want the citation
2. Click **References** → **Insert Citation**
3. The citation will be inserted in the selected style
4. Citations are automatically tracked and numbered

### Generating Bibliography

1. Place your cursor where you want the bibliography
2. Click **References** → **Bibliography**
3. A complete reference list will be generated in the selected style
4. All sources will be properly formatted and listed

### Adding Footnotes/Endnotes

1. Place your cursor where you want the note
2. Click **References** → **Footnote** or **Endnote**
3. The note marker will be inserted
4. Notes are automatically numbered

### Managing Sources

1. Click **References** → **Add New Source** to add sources
2. Use the source management interface to edit existing sources
3. Delete sources with confirmation (removes associated citations)
4. View source statistics in the References dropdown

## File Structure

```
app/
├── components/
│   ├── TopToolbar.tsx          # Enhanced with References functionality
│   ├── ReferencesManager.tsx   # New component for source management
│   └── LexicalEditor.tsx       # Main editor component
├── references-test/
│   └── page.tsx               # Test page for References feature
└── ...
```

## Testing

Visit `/references-test` to test the complete References feature:

1. **Add Sources**: Try adding different types of sources
2. **Insert Citations**: Test various citation styles
3. **Generate Bibliography**: Create complete reference lists
4. **Manage Sources**: Edit, update, and delete sources
5. **Add Notes**: Insert footnotes and endnotes

## Future Enhancements

### Potential Improvements

1. **Citation Updates**
   - Automatic citation renumbering when sources change
   - Bulk citation updates
   - Citation validation

2. **Advanced Features**
   - Import/export of reference libraries
   - Integration with citation databases (DOI lookup)
   - Citation analytics and reports

3. **Enhanced Formatting**
   - Custom citation styles
   - Advanced bibliography formatting
   - Citation placement options

4. **Collaboration**
   - Shared reference libraries
   - Citation sharing between documents
   - Version control for sources

## Technical Notes

### State Management
- All reference data is managed in component state
- Sources, citations, footnotes, and endnotes are tracked separately
- Citation style preferences are maintained

### Performance Considerations
- Efficient citation formatting with minimal re-renders
- Optimized source management with proper state updates
- Responsive UI with smooth interactions

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Clear visual feedback for all actions

## Conclusion

The References feature provides a comprehensive citation and bibliography management system that rivals commercial word processors. It offers intuitive user experience, extensive citation style support, and robust source management capabilities, making it suitable for academic and professional document creation.
