'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../components/AdminContext';
import AdminAuth from '../../components/AdminAuth';
import { Template } from '../../firebase/templates';
import { globalTemplateStore } from '../../utils/globalTemplateStore';
import React from 'react';
import ReactDOM from 'react-dom/client';

export default function AdminTemplateUpload() {
  const { isAdmin, logoutAdmin, uploadTemplate, createTestTemplate, getTemplates, updateTemplate, deleteTemplate } = useAdmin();
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
  console.log('localStorage templates:', typeof window !== 'undefined' ? localStorage.getItem('localTemplates') : 'Not available');
  console.log('=== END DEBUG ===');

  const clearAllLocalStorage = () => {
    try {
      localStorage.clear();
      alert('✅ All localStorage data cleared successfully!');
      // Refresh the page to update the template list
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      alert('❌ Failed to clear localStorage: ' + error);
    }
  };

  const checkStorageQuota = () => {
    try {
      const testKey = 'quota_test_' + Date.now();
      const testData = 'x'.repeat(1024 * 10); // 10KB test
      
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      
      // Estimate current usage
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      }
      
      alert(`📊 Storage Status:\n\nAvailable: ✅ (10KB+ test passed)\nCurrent Usage: ~${Math.round(totalSize / 1024)}KB\n\nlocalStorage is working properly.`);
      
    } catch (error) {
      console.error('Storage quota check failed:', error);
      alert('❌ Storage quota exceeded or localStorage not available.\n\nPlease clear browser data and try again.');
    }
  };

  const testFirebaseConnection = async () => {
    try {
      console.log('=== COMPREHENSIVE FIREBASE TEST ===');
      
      // Test 1: Check if Firebase is initialized
      const { db } = await import('../../firebase/config');
      console.log('✅ Firebase config loaded');
      
      // Test 2: Check if we can access Firestore
      const { collection, getDocs, addDoc, serverTimestamp } = await import('firebase/firestore');
      console.log('✅ Firestore imports successful');
      
      // Test 3: Try to read from templates collection
      const templatesRef = collection(db, 'templates');
      console.log('✅ Templates collection reference created');
      
      const snapshot = await getDocs(templatesRef);
      console.log('✅ Firestore read successful, found', snapshot.size, 'documents');
      
      // Test 4: Try to write a test document
      const testData = {
        title: 'Firebase Test Template',
        description: 'Testing Firebase connection and upload functionality',
        category: 'test',
        content: '<p>This is a test template for Firebase connectivity testing.</p>',
        fileName: 'test-template.html',
        fileSize: 150,
        uploadedBy: 'test@test.com',
        uploadedAt: serverTimestamp(),
        status: 'active'
      };
      
      const docRef = await addDoc(templatesRef, testData);
      console.log('✅ Firebase write successful, document ID:', docRef.id);
      
      // Test 5: Delete the test document
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'templates', docRef.id));
      console.log('✅ Test document deleted successfully');
      
      alert('✅ Firebase connection is working perfectly!\n\nAll tests passed:\n- Config loaded\n- Firestore accessible\n- Read operation successful\n- Write operation successful\n- Delete operation successful\n\nTemplates should now save to Firebase properly.');
      
    } catch (error: any) {
      console.error('❌ Firebase test failed:', error);
      
      let errorMessage = 'Firebase connection failed:\n\n';
      
      if (error.code === 'permission-denied') {
        errorMessage += '❌ Permission denied\n- Check Firebase security rules\n- Make sure you are authenticated';
      } else if (error.code === 'unavailable') {
        errorMessage += '❌ Service unavailable\n- Check internet connection\n- Firebase might be down';
      } else if (error.code === 'unauthenticated') {
        errorMessage += '❌ Not authenticated\n- You need to be logged in';
      } else if (error.message?.includes('network')) {
        errorMessage += '❌ Network error\n- Check internet connection\n- Firebase might be blocked';
      } else {
        errorMessage += `❌ Unknown error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const createSimpleTestTemplate = async () => {
    try {
      console.log('Creating simple test template...');
      
      const testContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Simple Test Template</h1>
          
          <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
            <h2 style="color: #1e293b; margin-bottom: 15px; font-size: 18px;">✅ Test Content</h2>
            <p style="color: #475569; margin-bottom: 10px; line-height: 1.6;">
              This is a simple test template to verify that upload and preview work without any errors.
            </p>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
              No problematic libraries or DOM manipulation involved.
            </p>
          </div>
          
          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin-bottom: 10px; font-size: 16px;">🎯 Test Features</h3>
            <ul style="color: #92400e; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Simple HTML content</li>
              <li>Basic styling</li>
              <li>No external dependencies</li>
              <li>Safe DOM operations</li>
            </ul>
          </div>
          
          <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px;">
            <h3 style="color: #065f46; margin-bottom: 10px; font-size: 16px;">✨ Expected Results</h3>
            <p style="color: #065f46; margin: 0;">
              This template should upload successfully and preview without any removeChild errors.
            </p>
          </div>
        </div>
      `;
      
      const templateData = {
        title: 'Simple Test Template',
        description: 'A simple test template to verify upload and preview functionality',
        category: 'assignment',
        content: testContent,
        fileName: 'simple-test.html',
        fileSize: testContent.length,
        uploadedBy: 'test@test.com'
      };
      
      console.log('Template data created:', templateData);
      
      // Try to upload using the new test template function
      const success = await createTestTemplate(templateData);
      
      if (success) {
        console.log('Template created successfully, refreshing list...');
        
        // Add a small delay to ensure Firebase operations complete
        setTimeout(async () => {
          // Refresh the templates list
          await refreshTemplates();
        }, 1000);
        
        alert('✅ Simple test template created successfully!\n\nNow:\n1. Go to template selection\n2. Find "Simple Test Template"\n3. Click Preview\n4. Should work without any errors');
      } else {
        alert('❌ Failed to create test template. Check console for details.');
      }
      
    } catch (error) {
      console.error('Error creating simple test template:', error);
      alert('❌ Error creating test template: ' + error);
    }
  };

  const createAdvancedTestTemplate = async () => {
    try {
      console.log('Creating advanced test template with positioning...');
      
      const testContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; position: relative;">
          <!-- Header with background image and overlaid text -->
          <div style="position: relative; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; margin-bottom: 30px; overflow: hidden;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: white; z-index: 2;">
              <h1 style="font-size: 36px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Advanced Test Template</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0; opacity: 0.9;">With Proper Positioning & Alignment</p>
            </div>
            <!-- Decorative elements -->
            <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.15); border-radius: 50%;"></div>
          </div>
          
          <!-- Content sections with different alignments -->
          <div style="display: flex; gap: 20px; margin-bottom: 30px;">
            <!-- Left column -->
            <div style="flex: 1; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px;">
              <h2 style="color: #1e293b; margin-bottom: 15px; text-align: center; font-size: 24px;">Left Column</h2>
              <p style="color: #475569; margin-bottom: 10px; line-height: 1.6; text-align: justify;">
                This is the left column content with justified text alignment. It demonstrates how text flows and aligns within the container.
              </p>
              <div style="text-align: right; margin-top: 15px;">
                <span style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px;">Right Aligned Button</span>
              </div>
            </div>
            
            <!-- Right column -->
            <div style="flex: 1; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 25px;">
              <h2 style="color: #92400e; margin-bottom: 15px; text-align: center; font-size: 24px;">Right Column</h2>
              <p style="color: #92400e; margin-bottom: 10px; line-height: 1.6; text-align: left;">
                This is the right column with left-aligned text. It shows different alignment options.
              </p>
              <div style="text-align: center; margin-top: 15px;">
                <span style="background: #f59e0b; color: white; padding: 8px 16px; border-radius: 6px; font-size: 14px;">Center Aligned Button</span>
              </div>
            </div>
          </div>
          
          <!-- Floating elements with absolute positioning -->
          <div style="position: relative; height: 150px; background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h2 style="color: #065f46; margin-bottom: 15px; text-align: center; font-size: 24px;">Floating Elements</h2>
            
            <!-- Floating element 1 -->
            <div style="position: absolute; top: 20px; left: 20px; background: #10b981; color: white; padding: 10px; border-radius: 8px; font-size: 14px; z-index: 3;">
              Top Left
            </div>
            
            <!-- Floating element 2 -->
            <div style="position: absolute; top: 20px; right: 20px; background: #ef4444; color: white; padding: 10px; border-radius: 8px; font-size: 14px; z-index: 3;">
              Top Right
            </div>
            
            <!-- Floating element 3 -->
            <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: #8b5cf6; color: white; padding: 10px; border-radius: 8px; font-size: 14px; z-index: 3;">
              Bottom Center
            </div>
          </div>
          
          <!-- Grid layout with different alignments -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
            <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; text-align: left;">
              <h3 style="color: #991b1b; margin-bottom: 10px; font-size: 18px;">Left Aligned</h3>
              <p style="color: #7f1d1d; font-size: 14px; line-height: 1.5;">This content is left-aligned within its container.</p>
            </div>
            
            <div style="background: #f0f9ff; border: 2px solid #bae6fd; border-radius: 8px; padding: 20px; text-align: center;">
              <h3 style="color: #0c4a6e; margin-bottom: 10px; font-size: 18px;">Center Aligned</h3>
              <p style="color: #0c4a6e; font-size: 14px; line-height: 1.5;">This content is center-aligned within its container.</p>
            </div>
            
            <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: right;">
              <h3 style="color: #14532d; margin-bottom: 10px; font-size: 18px;">Right Aligned</h3>
              <p style="color: #14532d; font-size: 14px; line-height: 1.5;">This content is right-aligned within its container.</p>
            </div>
          </div>
          
          <!-- Footer with mixed content -->
          <div style="background: #1e293b; color: white; border-radius: 12px; padding: 25px; text-align: center;">
            <h2 style="margin-bottom: 15px; font-size: 24px;">Footer Section</h2>
            <p style="margin-bottom: 20px; opacity: 0.9; line-height: 1.6;">
              This footer demonstrates mixed content with proper alignment and positioning.
            </p>
            <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 15px;">
              <div style="background: #3b82f6; padding: 10px 20px; border-radius: 6px; font-size: 14px;">Button 1</div>
              <div style="background: #10b981; padding: 10px 20px; border-radius: 6px; font-size: 14px;">Button 2</div>
              <div style="background: #f59e0b; padding: 10px 20px; border-radius: 6px; font-size: 14px;">Button 3</div>
            </div>
          </div>
        </div>
      `;
      
      const templateData = {
        title: 'Advanced Test Template',
        description: 'A comprehensive test template with positioning, alignment, and styling',
        category: 'assignment',
        content: testContent,
        fileName: 'advanced-test.html',
        fileSize: testContent.length,
        uploadedBy: 'test@test.com'
      };
      
      console.log('Advanced template data created:', templateData);
      
      // Try to upload using the new test template function
      const success = await createTestTemplate(templateData);
      
      if (success) {
        console.log('Template created successfully, refreshing list...');
        
        // Add a small delay to ensure Firebase operations complete
        setTimeout(async () => {
          // Refresh the templates list
          await refreshTemplates();
        }, 1000);
        
        alert('✅ Advanced test template created successfully!\n\nThis template includes:\n• Absolute positioning\n• Different text alignments\n• Floating elements\n• Grid layouts\n• Mixed styling\n\nPreview it to see if all formatting is preserved!');
      } else {
        alert('❌ Failed to create advanced test template. Check console for details.');
      }
      
    } catch (error) {
      console.error('Error creating advanced test template:', error);
      alert('❌ Error creating advanced test template: ' + error);
    }
  };

  const downloadTestTemplateFile = () => {
    try {
      console.log('Creating downloadable test template file...');
      
      const testContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Test Template</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            position: relative;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        .header h1 {
            font-size: 36px;
            font-weight: bold;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            font-size: 18px;
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .two-columns {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        .column {
            flex: 1;
            padding: 25px;
            border-radius: 12px;
        }
        .left-column {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
        }
        .right-column {
            background: #fef3c7;
            border: 2px solid #f59e0b;
        }
        .floating-container {
            position: relative;
            height: 150px;
            background: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
        }
        .floating-element {
            position: absolute;
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            color: white;
        }
        .top-left {
            top: 20px;
            left: 20px;
            background: #10b981;
        }
        .top-right {
            top: 20px;
            right: 20px;
            background: #ef4444;
        }
        .bottom-center {
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #8b5cf6;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .grid-item {
            padding: 20px;
            border-radius: 8px;
            border: 2px solid;
        }
        .grid-left {
            background: #fef2f2;
            border-color: #fecaca;
            text-align: left;
        }
        .grid-center {
            background: #f0f9ff;
            border-color: #bae6fd;
            text-align: center;
        }
        .grid-right {
            background: #f0fdf4;
            border-color: #bbf7d0;
            text-align: right;
        }
        .footer {
            background: #1e293b;
            color: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
        }
        .button-group {
            display: flex;
            justify-content: space-around;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 20px;
        }
        .button {
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 14px;
            color: white;
            text-decoration: none;
        }
        .btn-blue { background: #3b82f6; }
        .btn-green { background: #10b981; }
        .btn-orange { background: #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>Advanced Test Template</h1>
                <p>With Proper Positioning & Alignment</p>
            </div>
        </div>
        
        <div class="content">
            <div class="two-columns">
                <div class="column left-column">
                    <h2 style="color: #1e293b; margin-bottom: 15px; text-align: center; font-size: 24px;">Left Column</h2>
                    <p style="color: #475569; margin-bottom: 10px; line-height: 1.6; text-align: justify;">
                        This is the left column content with justified text alignment. It demonstrates how text flows and aligns within the container.
                    </p>
                    <div style="text-align: right; margin-top: 15px;">
                        <span class="button btn-blue">Right Aligned Button</span>
                    </div>
                </div>
                
                <div class="column right-column">
                    <h2 style="color: #92400e; margin-bottom: 15px; text-align: center; font-size: 24px;">Right Column</h2>
                    <p style="color: #92400e; margin-bottom: 10px; line-height: 1.6; text-align: left;">
                        This is the right column with left-aligned text. It shows different alignment options.
                    </p>
                    <div style="text-align: center; margin-top: 15px;">
                        <span class="button btn-orange">Center Aligned Button</span>
                    </div>
                </div>
            </div>
            
            <div class="floating-container">
                <h2 style="color: #065f46; margin-bottom: 15px; text-align: center; font-size: 24px;">Floating Elements</h2>
                <div class="floating-element top-left">Top Left</div>
                <div class="floating-element top-right">Top Right</div>
                <div class="floating-element bottom-center">Bottom Center</div>
            </div>
            
            <div class="grid">
                <div class="grid-item grid-left">
                    <h3 style="color: #991b1b; margin-bottom: 10px; font-size: 18px;">Left Aligned</h3>
                    <p style="color: #7f1d1d; font-size: 14px; line-height: 1.5;">This content is left-aligned within its container.</p>
                </div>
                
                <div class="grid-item grid-center">
                    <h3 style="color: #0c4a6e; margin-bottom: 10px; font-size: 18px;">Center Aligned</h3>
                    <p style="color: #0c4a6e; font-size: 14px; line-height: 1.5;">This content is center-aligned within its container.</p>
                </div>
                
                <div class="grid-item grid-right">
                    <h3 style="color: #14532d; margin-bottom: 10px; font-size: 18px;">Right Aligned</h3>
                    <p style="color: #14532d; font-size: 14px; line-height: 1.5;">This content is right-aligned within its container.</p>
                </div>
            </div>
            
            <div class="footer">
                <h2 style="margin-bottom: 15px; font-size: 24px;">Footer Section</h2>
                <p style="margin-bottom: 20px; opacity: 0.9; line-height: 1.6;">
                    This footer demonstrates mixed content with proper alignment and positioning.
                </p>
                <div class="button-group">
                    <span class="button btn-blue">Button 1</span>
                    <span class="button btn-green">Button 2</span>
                    <span class="button btn-orange">Button 3</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
      
      // Create a blob with the HTML content
      const blob = new Blob([testContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = 'advanced-test-template.html';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      try {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
      } catch (error) {
        console.warn('Could not remove download link:', error);
      }
      URL.revokeObjectURL(url);
      
      alert('✅ Advanced test template file downloaded!\n\nNow:\n1. Upload this HTML file using the "Upload Template" button\n2. Give it a name and description\n3. Preview it to see if formatting is preserved\n4. This will test the file upload and preview system');
      
    } catch (error) {
      console.error('Error creating downloadable template:', error);
      alert('❌ Error creating downloadable template: ' + error);
    }
  };


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
                onClick={testFirebaseConnection}
              >
                🔥 Test Firebase
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
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                onClick={checkStorageQuota}
              >
                📊 Check Storage
              </button>
              
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={clearAllLocalStorage}
              >
                🗑️ Clear Storage
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
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                onClick={() => {
                  // Create a simple HTML file for testing
                  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Test Template</title>
</head>
<body>
    <div style="position: relative; width: 100%; height: 300px; background: #1a1a2e; border-radius: 10px; overflow: hidden;">
      
      <!-- Background Image -->
      <img src="https://via.placeholder.com/600x300/4a90e2/ffffff?text=Background+Image" 
           style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" alt="Background">
      
      <!-- Dark overlay -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4);"></div>
      
      <!-- Main title positioned over image -->
      <h1 style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 32px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); text-align: center;">
        STORIES OF THE NIGHT SKY
      </h1>
      
      <!-- Subtitle positioned over image -->
      <p style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); color: white; font-size: 18px; font-weight: bold; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
        AHMAD
      </p>
      
      <!-- Test text in corners -->
      <div style="position: absolute; top: 20px; left: 20px; color: white; font-size: 14px; background: rgba(255,0,0,0.8); padding: 5px 10px; border-radius: 5px;">
        TOP LEFT
      </div>
      
      <div style="position: absolute; top: 20px; right: 20px; color: white; font-size: 14px; background: rgba(0,255,0,0.8); padding: 5px 10px; border-radius: 5px;">
        TOP RIGHT
      </div>
      
      <div style="position: absolute; bottom: 20px; left: 20px; color: white; font-size: 14px; background: rgba(0,0,255,0.8); padding: 5px 10px; border-radius: 5px;">
        BOTTOM LEFT
      </div>
      
      <div style="position: absolute; bottom: 20px; right: 20px; color: white; font-size: 14px; background: rgba(255,255,0,0.8); padding: 5px 10px; border-radius: 5px;">
        BOTTOM RIGHT
      </div>
      
    </div>

    <div style="margin-top: 20px; text-align: center;">
      <p style="color: #333; font-size: 16px;">
        If you can see <span style="color: red; font-weight: bold;">red text</span>, 
        <span style="color: blue; font-weight: bold;">blue text</span>, and 
        <span style="color: green; font-weight: bold;">green text</span>, 
        then the preview is working correctly!
      </p>
    </div>
</body>
</html>`;
                    
                    // Create and download the HTML file
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'test-template.html';
                    document.body.appendChild(a);
                    a.click();
                    // Safe removal with error handling
                    try {
                      if (a.parentNode) {
                        document.body.removeChild(a);
                      }
                    } catch (error) {
                      console.warn('Could not remove download link:', error);
                    }
                    URL.revokeObjectURL(url);
                    
                    alert('✅ Test HTML file created and downloaded!\n\nNow:\n1. Upload this HTML file\n2. Preview it\n3. It should show EXACTLY the same as the file\n\nThis will test if raw HTML preservation is working.');
                  }}
                >
                  📄 Create Test HTML File
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    // Create a test DOCX file for testing
                    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
                    
                    const doc = new Document({
                      sections: [{
                        properties: {},
                        children: [
                          new Paragraph({
                            text: "STORIES OF THE NIGHT SKY",
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "STORIES OF THE NIGHT SKY",
                                bold: true,
                                size: 32,
                                color: "000000"
                              })
                            ]
                          }),
                          new Paragraph({
                            text: "A Novel by AHMAD",
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: "A Novel by AHMAD",
                                italic: true,
                                size: 18,
                                color: "666666"
                              })
                            ]
                          }),
                          new Paragraph({
                            text: "",
                            spacing: { before: 400 }
                          }),
                          new Paragraph({
                            text: "This is a test DOCX template with proper formatting.",
                            children: [
                              new TextRun({
                                text: "This is a test DOCX template with ",
                                size: 14
                              }),
                              new TextRun({
                                text: "proper formatting",
                                bold: true,
                                color: "0000FF",
                                size: 14
                              }),
                              new TextRun({
                                text: ".",
                                size: 14
                              })
                            ]
                          }),
                          new Paragraph({
                            text: "Features:",
                            children: [
                              new TextRun({
                                text: "Features:",
                                bold: true,
                                size: 16,
                                color: "FF0000"
                              })
                            ]
                          }),
                          new Paragraph({
                            text: "• Exact font preservation",
                            children: [
                              new TextRun({
                                text: "• Exact font preservation",
                                size: 12
                              })
                            ]
                          }),
                          new Paragraph({
                            text: "• Color and styling",
                            children: [
                              new TextRun({
                                text: "• Color and styling",
                                size: 12
                              })
                            ]
                          }),
                          new Paragraph({
                            text: "• Layout and alignment",
                            children: [
                              new TextRun({
                                text: "• Layout and alignment",
                                size: 12
                              })
                            ]
                          })
                        ]
                      }]
                    });
                    
                    // Generate the DOCX file
                    Packer.toBlob(doc).then(blob => {
                      // Create download link
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'test-template.docx';
                      document.body.appendChild(a);
                      a.click();
                      // Safe removal with error handling
                      try {
                        if (a.parentNode) {
                          document.body.removeChild(a);
                        }
                      } catch (error) {
                        console.warn('Could not remove download link:', error);
                      }
                      URL.revokeObjectURL(url);
                      
                      alert('✅ Test DOCX file created and downloaded!\n\nNow:\n1. Upload this DOCX file\n2. Preview it\n3. It should show EXACT formatting with fonts, colors, and layout\n\nThis will test the DOCX preview functionality.');
                    });
                  }}
                >
                  📄 Create Test DOCX File
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  onClick={createSimpleTestTemplate}
                >
                  🧪 Create Simple Test Template
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  onClick={createAdvancedTestTemplate}
                >
                  🧪 Create Advanced Test Template
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={refreshTemplates}
                >
                  🔄 Refresh Templates
                </button>
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  onClick={downloadTestTemplateFile}
                >
                  📥 Download Test Template
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