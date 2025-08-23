'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../components/AdminContext';
import AdminAuth from '../../components/AdminAuth';
import { Template } from '../../firebase/templates';
import { globalTemplateStore } from '../../utils/globalTemplateStore';

export default function AdminTemplateUpload() {
  const { isAdmin, logoutAdmin, uploadTemplate, getTemplates, updateTemplate, deleteTemplate } = useAdmin();
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('assignment');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('assignment');
  const [editFrontImagePreview, setEditFrontImagePreview] = useState<string | null>(null);
  const [editFrontImageFile, setEditFrontImageFile] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate profile photo based on template name
  const generateProfilePhoto = (templateName: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'];
    const initials = templateName.split(' ').map(word => word[0]).join('').toUpperCase();
    const colorIndex = templateName.length % colors.length;
    
    return (
      <div className={`w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-xs`}>
        {initials}
      </div>
    );
  };

  useEffect(() => {
    console.log('useEffect triggered - isAdmin:', isAdmin);
    setIsAuthenticatedState(isAdmin);
    
    // Load templates when component mounts
    if (isAdmin) {
      const loadTemplates = async () => {
        try {
          setIsLoadingTemplates(true);
          console.log('Calling getTemplates...');
          const loadedTemplates = await getTemplates();
          console.log('Templates loaded:', loadedTemplates);
          setTemplates(loadedTemplates);
        } catch (error) {
          console.error('Error loading templates:', error);
        } finally {
          setIsLoadingTemplates(false);
        }
      };
      loadTemplates();
    } else {
      setIsLoadingTemplates(false);
    }
  }, [isAdmin]); // Remove getTemplates dependency

  const categories = [
    { id: 'assignment', name: 'Assignment Templates', icon: '📝', color: 'bg-blue-100 text-blue-800' },
    { id: 'presentation', name: 'Presentation Templates', icon: '📊', color: 'bg-purple-100 text-purple-800' },
    { id: 'business', name: 'Business Templates', icon: '💼', color: 'bg-green-100 text-green-800' },
    { id: 'academic', name: 'Academic Templates', icon: '🎓', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'creative', name: 'Creative Templates', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
    { id: 'resume', name: 'Resume Templates', icon: '👔', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
      setShowUploadForm(true);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return;
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
        setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
        setShowUploadForm(true);
      }
    }
  };

  const handleFrontImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB for images)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setFrontImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFrontImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFrontImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB for images)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setEditFrontImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditFrontImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      console.error('No file selected');
      setUploadMessage('Please select a file to upload.');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    const file = fileInputRef.current.files[0];
    
    // Validate file
    if (!templateName.trim()) {
      console.error('Template name is required');
      setUploadMessage('Please enter a template name.');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }
    
    if (!templateDescription.trim()) {
      console.error('Template description is required');
      setUploadMessage('Please enter a template description.');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('=== UPLOAD PROCESS START ===');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('Template name:', templateName);
      console.log('Description:', templateDescription);
      console.log('Category:', selectedCategory);
      
      // Convert front image to base64 if exists
      let frontImageBase64 = null;
      if (frontImageFile) {
        console.log('Processing front image...');
        const reader = new FileReader();
        reader.onload = (e) => {
          frontImageBase64 = e.target?.result as string;
        };
        reader.readAsDataURL(frontImageFile);
        
        // Wait for the reader to complete
        await new Promise((resolve) => {
          reader.onloadend = resolve;
        });
        console.log('Front image processed');
      }
      
      // Use real template upload function
      console.log('Calling uploadTemplate function...');
      const success = await uploadTemplate(file, templateName, templateDescription, selectedCategory, frontImageBase64);
      console.log('Upload result:', success);
      
      if (success) {
        console.log('Upload successful, refreshing templates...');
        setUploadProgress(100);
        
        // Refresh templates list using manual refresh
        await refreshTemplates();
        
        // Reset form
        setTemplateName('');
        setTemplateDescription('');
        setSelectedCategory('assignment');
        setFrontImagePreview(null);
        setFrontImageFile(null);
        setShowUploadForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Show success message
        setUploadMessage('Template uploaded successfully! (Saved locally due to Firebase connection issues)');
        setTimeout(() => setUploadMessage(''), 5000);
        
        console.log('=== UPLOAD PROCESS COMPLETE ===');
      } else {
        console.error('Upload returned false');
        setUploadMessage('Failed to upload template. Please try again or check your browser settings.');
        setTimeout(() => setUploadMessage(''), 5000);
      }
      
    } catch (error) {
      console.error('Upload failed with error:', error);
      setUploadMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setUploadMessage(''), 5000);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setEditName(template.title);
    setEditDescription(template.description);
    setEditCategory(template.category);
    setEditFrontImagePreview(template.frontImage || null);
    setEditFrontImageFile(null);
    setShowEditForm(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;

    try {
      // Convert edit front image to base64 if exists
      let editFrontImageBase64 = editingTemplate.frontImage; // Keep existing image by default
      if (editFrontImageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          editFrontImageBase64 = e.target?.result as string;
        };
        reader.readAsDataURL(editFrontImageFile);
        
        // Wait for the reader to complete
        await new Promise((resolve) => {
          reader.onloadend = resolve;
        });
      }

      // Update template in Firebase (you'll need to add this function to AdminContext)
      const success = await updateTemplate(editingTemplate.id, {
        title: editName,
        description: editDescription,
        category: editCategory,
        frontImage: editFrontImageBase64
      });

      if (success) {
        // Refresh templates list using manual refresh
        await refreshTemplates();
        setUploadMessage('Template updated successfully!');
        setTimeout(() => setUploadMessage(''), 3000);
        
        // Close edit form
        setShowEditForm(false);
        setEditingTemplate(null);
        setEditFrontImagePreview(null);
        setEditFrontImageFile(null);
      } else {
        setUploadMessage('Failed to update template. Please try again.');
        setTimeout(() => setUploadMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      setUploadMessage('Failed to update template. Please try again.');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      const success = await deleteTemplate(templateId);
      if (success) {
        // Refresh templates list using manual refresh
        await refreshTemplates();
        setUploadMessage('Template deleted successfully!');
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        setUploadMessage('Failed to delete template. Please try again.');
        setTimeout(() => setUploadMessage(''), 3000);
      }
    }
  };

  // Manual refresh function
  const refreshTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const updatedTemplates = await getTemplates();
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error refreshing templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Debug logging
  console.log('=== TEMPLATE STATE DEBUG ===');
  console.log('Current templates state:', templates);
  console.log('Templates length:', templates.length);
  console.log('Filtered templates:', filteredTemplates);
  console.log('Filtered templates length:', filteredTemplates.length);
  console.log('Search query:', searchQuery);
  console.log('isAdmin:', isAdmin);
  console.log('isAuthenticatedState:', isAuthenticatedState);
  console.log('isLoadingTemplates:', isLoadingTemplates);
  console.log('localStorage templates:', localStorage.getItem('localTemplates'));
  console.log('=== END DEBUG ===');



  if (!isAuthenticatedState) {
    return <AdminAuth onAuth={() => setIsAuthenticatedState(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Template Manager</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Upload and manage templates for your platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                + Upload Template
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                onClick={async () => {
                  try {
                    console.log('=== TESTING FIREBASE CONNECTION ===');
                    const testData = {
                      title: 'Test Template',
                      description: 'Test description',
                      category: 'test',
                      content: '<p>Test content</p>',
                      fileName: 'test.html',
                      fileSize: 100,
                      uploadedBy: 'test@test.com'
                    };
                    
                    const { uploadTemplate: firebaseUpload } = await import('../../firebase/templates');
                    const result = await firebaseUpload(testData);
                    
                    if (result) {
                      alert('✅ Firebase connection working! Template uploaded successfully.');
                      console.log('Firebase test successful, ID:', result);
                    } else {
                      alert('❌ Firebase connection failed. Templates will be saved locally.');
                      console.log('Firebase test failed');
                    }
                  } catch (error: any) {
                    alert('❌ Firebase connection failed: ' + error.message + '\n\nTemplates will be saved locally.');
                    console.error('Firebase test error:', error);
                  }
                }}
              >
                Test Firebase Connection
              </button>
              
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                onClick={() => {
                  // Clear Firebase cache and retry
                  if (typeof window !== 'undefined') {
                    // Clear any cached Firebase data
                    localStorage.removeItem('firebase_cache');
                    sessionStorage.clear();
                    
                    // Reload the page to reset Firebase connection
                    window.location.reload();
                  }
                }}
              >
                🔄 Clear Cache & Retry
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('Creating simple test template...');
                    const testContent = 'This is a simple test template content for debugging purposes.';
                    const testFile = new File([testContent], 'test-template.txt', { type: 'text/plain' });
                    
                    console.log('Test file created:', testFile.name, testFile.size, testFile.type);
                    
                    const success = await uploadTemplate(
                      testFile, 
                      'Test Template', 
                      'This is a test template for debugging', 
                      'assignment'
                    );
                    
                    if (success) {
                      console.log('Test template created successfully!');
                      alert('Test template created successfully!');
                      // Refresh the list
                      const updatedTemplates = await getTemplates();
                      setTemplates(updatedTemplates);
                    } else {
                      console.error('Test template creation failed');
                      alert('Test template creation failed');
                    }
                  } catch (error) {
                    console.error('Test template creation failed:', error);
                    alert(`Test template creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Create Test Template
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('=== CREATING DEBUG TEMPLATE ===');
                    
                    // Create a test template that mimics the user's book cover
                    const debugContent = `
<div style="position: relative; width: 100%; height: 500px; background: linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460); border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
  
  <!-- Background Image (Starry Sky) -->
  <img src="https://via.placeholder.com/800x500/1a1a2e/ffffff?text=Starry+Night+Sky" 
       style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" alt="Starry Sky">
  
  <!-- Dark overlay for better text readability -->
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.2);"></div>
  
  <!-- Tree silhouette at bottom -->
  <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 150px; background: linear-gradient(to top, #000000, transparent);"></div>
  
  <!-- "A Novel" text at top -->
  <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); text-align: center;">
    <p style="color: white; font-family: 'Georgia', serif; font-size: 18px; font-style: italic; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
      A Novel
    </p>
  </div>
  
  <!-- Main title "STORIES OF THE NIGHT SKY" -->
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
    <h1 style="color: white; font-family: 'Arial Black', 'Helvetica Bold', sans-serif; font-size: 36px; font-weight: 900; margin: 0; text-shadow: 3px 3px 6px rgba(0,0,0,0.8); line-height: 1.2; letter-spacing: 2px;">
      STORIES<br>OF THE<br>NIGHT SKY
    </h1>
  </div>
  
  <!-- Author name "AHMAD" at bottom -->
  <div style="position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); text-align: center;">
    <p style="color: white; font-family: 'Arial', sans-serif; font-size: 24px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.7); letter-spacing: 1px;">
      AHMAD
    </p>
  </div>
  
  <!-- Decorative stars -->
  <div style="position: absolute; top: 100px; right: 80px; color: white; font-size: 20px;">⭐</div>
  <div style="position: absolute; top: 150px; left: 60px; color: white; font-size: 16px;">✨</div>
  <div style="position: absolute; top: 200px; right: 120px; color: white; font-size: 18px;">🌟</div>
  
</div>
                    `.trim();
                    
                    console.log('Debug content created:', debugContent);
                    
                    // Create a file with this content
                    const testFile = new File([debugContent], 'debug-template.html', { type: 'text/html' });
                    
                    console.log('Test file created:', testFile.name, testFile.size, testFile.type);
                    
                    const success = await uploadTemplate(
                      testFile, 
                      'Debug Template', 
                      'This is a debug template to test loading functionality', 
                      'assignment'
                    );
                    
                    if (success) {
                      console.log('Debug template created successfully!');
                      alert('Debug template created successfully! Check the template library.');
                      // Refresh the list
                      const updatedTemplates = await getTemplates();
                      setTemplates(updatedTemplates);
                    } else {
                      console.error('Debug template creation failed');
                      alert('Debug template creation failed');
                    }
                  } catch (error) {
                    console.error('Debug template creation failed:', error);
                    alert(`Debug template creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Create Debug Template
              </button>
              <button
                onClick={() => {
                  console.log('Manual template creation...');
                  const testTemplate = {
                    id: 'manual_test_' + Date.now(),
                    title: 'Manual Test Template',
                    description: 'This template was created manually for testing',
                    category: 'assignment',
                    content: 'Manual test content',
                    fileName: 'manual-test.txt',
                    fileSize: 1024,
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: 'admin',
                    status: 'active'
                  };
                  
                  const newTemplates = [...templates, testTemplate];
                  setTemplates(newTemplates);
                  
                  // Save to localStorage
                  try {
                    localStorage.setItem('localTemplates', JSON.stringify(newTemplates));
                    console.log('Saved manual template to localStorage');
                  } catch (error) {
                    console.error('Failed to save to localStorage:', error);
                  }
                  
                  alert('Manual test template created!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Manual Test Template
              </button>
              <button
                onClick={() => {
                  console.log('=== FIREBASE TROUBLESHOOTING ===');
                  console.log('1. Check if Firebase is blocked by browser extensions');
                  console.log('2. Try disabling ad blockers or privacy extensions');
                  console.log('3. Check if Brave Shields are blocking Firebase');
                  console.log('4. Try using a different browser (Chrome, Firefox)');
                  
                  alert(`Firebase Connection Troubleshooting:

1. Disable Brave Shields for this site
2. Disable ad blockers or privacy extensions
3. Try using Chrome or Firefox instead
4. Check if your firewall is blocking Firebase

The template will still be saved locally and work in your browser.`);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                🔧 Firebase Troubleshooting
              </button>
              <button
                onClick={() => {
                  try {
                    console.log('=== CLEARING OLD TEMPLATES ===');
                    
                    // Clear localStorage templates
                    localStorage.removeItem('localTemplates');
                    
                    // Clear global store
                    globalTemplateStore.clearTemplates();
                    
                    // Reset state
                    setTemplates([]);
                    
                    console.log('Old templates cleared successfully');
                    alert('Old templates cleared! Now upload new templates to use the improved parser.');
                  } catch (error) {
                    console.error('Failed to clear templates:', error);
                    alert('Failed to clear templates: ' + error);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                🗑️ Clear Old Templates
              </button>
              <button
                onClick={logoutAdmin}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('=== TESTING FILE PARSER ===');
                    
                    // Create test files of different types
                    const testFiles = [
                      {
                        name: 'test.txt',
                        content: 'This is a test text file.\n\nIt has multiple lines.\n\nAnd some formatting.',
                        type: 'text/plain'
                      },
                      {
                        name: 'test.html',
                        content: '<h1>Test HTML File</h1><p>This is a test HTML file with <strong>formatting</strong>.</p><ul><li>Item 1</li><li>Item 2</li></ul>',
                        type: 'text/html'
                      }
                    ];
                    
                    for (const testFile of testFiles) {
                      console.log(`Testing parser with ${testFile.name}...`);
                      
                      const file = new File([testFile.content], testFile.name, { type: testFile.type });
                      
                      // Import the parser dynamically
                      const { parseFile } = await import('../../utils/docxParser');
                      const result = await parseFile(file);
                      
                      console.log(`Parser result for ${testFile.name}:`, result);
                      
                      if (result.error) {
                        console.error(`Parser failed for ${testFile.name}:`, result.error);
                      } else {
                        console.log(`Parser succeeded for ${testFile.name}. Content length:`, result.content.length);
                      }
                    }
                    
                    alert('File parser test completed! Check console for results.');
                  } catch (error) {
                    console.error('File parser test failed:', error);
                    alert('File parser test failed: ' + error);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                🧪 Test File Parser
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Message */}
        {uploadMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            uploadMessage.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {uploadMessage}
          </div>
        )}

        {/* Edit Form */}
        {showEditForm && editingTemplate && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Template</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingTemplate(null);
                  setEditFrontImagePreview(null);
                  setEditFrontImageFile(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your template..."
                />
              </div>
            </div>

            {/* Cover Photo Section */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Photo (Optional)
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditFrontImageSelect}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editFrontImagePreview && (
                  <div className="relative">
                    <img
                      src={editFrontImagePreview}
                      alt="Cover photo preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      onClick={() => setEditFrontImagePreview(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload a new image to replace the current cover photo, or leave empty to keep the existing one.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingTemplate(null);
                  setEditFrontImagePreview(null);
                  setEditFrontImageFile(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload New Template</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Uploading template...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Form Validation Status */}
            <div className="mb-6">
              <div className="flex items-center space-x-4 text-sm">
                <span className={`flex items-center ${templateName ? 'text-green-600' : 'text-gray-400'}`}>
                  {templateName ? '✅' : '⭕'} Template Name
                </span>
                <span className={`flex items-center ${templateDescription ? 'text-green-600' : 'text-gray-400'}`}>
                  {templateDescription ? '✅' : '⭕'} Description
                </span>
                <span className={`flex items-center ${fileInputRef.current?.files?.[0] ? 'text-green-600' : 'text-gray-400'}`}>
                  {fileInputRef.current?.files?.[0] ? '✅' : '⭕'} File Selected
                </span>
                <span className={`flex items-center ${frontImageFile ? 'text-green-600' : 'text-blue-400'}`}>
                  {frontImageFile ? '✅' : '🖼️'} Cover Photo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template File
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pptx,.pdf,.doc,.ppt,.txt,.html"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="text-gray-400 dark:text-gray-500">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-sm font-medium">Click to select or drag and drop</p>
                    <p className="text-xs mt-1">DOCX, PPTX, PDF, DOC, PPT, TXT, HTML</p>
                    <p className="text-xs mt-2 text-blue-500">Drop your file here or click to browse</p>
                  </div>
                </div>
              </div>

              {/* Template Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your template..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🖼️ Cover Photo (Optional)
                  </label>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFrontImageSelect}
                        className="hidden"
                        id="cover-photo-upload"
                      />
                      <label htmlFor="cover-photo-upload" className="cursor-pointer">
                        <div className="text-gray-400 dark:text-gray-500">
                          <div className="text-2xl mb-2">📷</div>
                          <p className="text-sm font-medium">Click to select cover photo</p>
                          <p className="text-xs mt-1 text-blue-500">JPEG, PNG, GIF (max 5MB)</p>
                        </div>
                      </label>
                    </div>
                    {frontImagePreview && (
                      <div className="relative">
                        <img
                          src={frontImagePreview}
                          alt="Cover photo preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          onClick={() => setFrontImagePreview(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Add a cover photo to make your template stand out in the template library.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Form Validation Status */}
            <div className="mt-4 text-sm">
              <div className="flex items-center space-x-4">
                <span className={`flex items-center ${templateName ? 'text-green-600' : 'text-gray-400'}`}>
                  {templateName ? '✅' : '⭕'} Template Name
                </span>
                <span className={`flex items-center ${templateDescription ? 'text-green-600' : 'text-gray-400'}`}>
                  {templateDescription ? '✅' : '⭕'} Description
                </span>
                <span className={`flex items-center ${fileInputRef.current?.files?.[0] ? 'text-green-600' : 'text-gray-400'}`}>
                  {fileInputRef.current?.files?.[0] ? '✅' : '⭕'} File Selected
                </span>
                <span className={`flex items-center ${frontImageFile ? 'text-green-600' : 'text-blue-400'}`}>
                  {frontImageFile ? '✅' : '🖼️'} Cover Photo
                </span>
              </div>
            </div>

            {/* Upload Button */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || !templateName || !templateDescription || !fileInputRef.current?.files?.[0]}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Template'}
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                {templates.length} total template{templates.length !== 1 ? 's' : ''}
              </span>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                {filteredTemplates.length} showing
              </span>
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Template Library</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage all uploaded templates
                </p>
              </div>
              <button
                onClick={refreshTemplates}
                disabled={isLoadingTemplates}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh templates"
              >
                {isLoadingTemplates ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          </div>

          {isLoadingTemplates ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading templates...</h3>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your templates</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates uploaded yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by uploading your first template to get started
              </p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Upload Your First Template
              </button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates match your search</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search terms or browse all templates
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Front Image or Profile Photo */}
                      {template.frontImage ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={template.frontImage}
                            alt={template.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {template.title ? template.title.charAt(0).toUpperCase() : 'T'}
                        </div>
                      )}
                      
                      {/* Template Info */}
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {template.title || 'Untitled Template'}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {template.description || 'No description'}
                        </p>
                        
                        {/* Template Details */}
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {template.fileName ? template.fileName.split('.').pop()?.toUpperCase() || 'TXT' : 'TXT'}
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {template.fileSize ? (template.fileSize / 1024).toFixed(1) + 'KB' : 'Unknown'}
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {template.uploadedAt ? new Date(template.uploadedAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            📝 {template.category || 'assignment'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit template"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete template"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 