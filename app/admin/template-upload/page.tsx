'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '../../components/AdminContext';
import AdminAuth from '../../components/AdminAuth';
import { Template } from '../../firebase/templates';
import { globalTemplateStore } from '../../utils/globalTemplateStore';
import React from 'react';
import ReactDOM from 'react-dom/client';

export default function AdminTemplateUpload() {
  const router = useRouter();
  const { isAdmin, logoutAdmin, uploadTemplate, uploadStructuredTemplate, createTestTemplate, getTemplates, updateTemplate, deleteTemplate } = useAdmin();
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
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());
  const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(new Set());
  const [originalFileViewer, setOriginalFileViewer] = useState<{template: Template, isOpen: boolean} | null>(null);
  const [isStructuredTemplate, setIsStructuredTemplate] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [uploadStartTime, setUploadStartTime] = useState<Date | null>(null);
  const [uploadEndTime, setUploadEndTime] = useState<Date | null>(null);
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
    setUploadStartTime(new Date());

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
      
      // Use appropriate template upload function based on type
      console.log('Template type:', isStructuredTemplate ? 'structured' : 'legacy');
      let success: boolean;
      
      if (isStructuredTemplate) {
        console.log('Calling uploadStructuredTemplate function...');
        success = await uploadStructuredTemplate(file, templateName, templateDescription, selectedCategory, frontImageBase64);
      } else {
        console.log('Calling uploadTemplate function...');
        success = await uploadTemplate(file, templateName, templateDescription, selectedCategory, frontImageBase64);
      }
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
        setIsStructuredTemplate(false);
        setFrontImagePreview(null);
        setFrontImageFile(null);
        setShowUploadForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Show success message
        setUploadMessage('Template uploaded successfully! (Saved locally due to Firebase connection issues)');
        setTimeout(() => setUploadMessage(''), 5000);
        
        setUploadEndTime(new Date());
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

  // Bulk selection functions
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedTemplates(new Set());
    }
  };

  const toggleTemplateSelection = (templateId: string) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  const selectAllTemplates = () => {
    const allIds = templates.map(t => t.id!);
    setSelectedTemplates(new Set(allIds));
  };

  const deselectAllTemplates = () => {
    setSelectedTemplates(new Set());
  };

  const deleteSelectedTemplates = async () => {
    if (selectedTemplates.size === 0) return;

    const confirmed = confirm(`Are you sure you want to delete ${selectedTemplates.size} template(s)?`);
    if (!confirmed) return;

    try {
      const deletePromises = Array.from(selectedTemplates).map(id => deleteTemplate(id));
      await Promise.all(deletePromises);
      
      // Refresh templates
      await refreshTemplates();
      setSelectedTemplates(new Set());
      setIsSelectMode(false);
      
      setUploadMessage(`Successfully deleted ${selectedTemplates.size} template(s)`);
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting templates:', error);
      setUploadMessage('Error deleting templates');
      setTimeout(() => setUploadMessage(''), 3000);
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

  const togglePreviewExpansion = (templateId: string) => {
    // Add loading state
    setLoadingPreviews(prev => new Set(prev).add(templateId));
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setExpandedPreviews(prev => {
        const newSet = new Set(prev);
        if (newSet.has(templateId)) {
          newSet.delete(templateId);
        } else {
          newSet.add(templateId);
        }
        return newSet;
      });
      setLoadingPreviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }, 100);
  };

  const openOriginalFile = (template: Template) => {
    setOriginalFileViewer({ template, isOpen: true });
  };

  const closeOriginalFile = () => {
    setOriginalFileViewer(null);
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
        <div class="docx-content" style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px; position: relative;">
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
        description: 'Template with proper alignment and positioning preservation',
        category: 'test',
        content: testContent,
        fileName: 'advanced-test-template.html'
      };
      
      const success = await createTestTemplate(templateData);
      if (success) {
        alert('✅ Advanced test template created successfully!');
        getTemplates(); // Refresh the list
      } else {
        alert('❌ Failed to create advanced test template');
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

  const createHtmlTestTemplate = async () => {
    try {
      console.log('Creating HTML test template with alignment preservation...');
      
      const testContent = `
        <div class="docx-content" style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">HTML Template with Alignment</h1>
          
          <!-- Different text alignments -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #34495e; margin-bottom: 15px;">Text Alignment Examples</h2>
            
            <p style="text-align: left; background: #ecf0f1; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <strong>Left Aligned:</strong> This text is aligned to the left side of the container.
            </p>
            
            <p style="text-align: center; background: #d5f4e6; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <strong>Center Aligned:</strong> This text is centered within the container.
            </p>
            
            <p style="text-align: right; background: #fdf2e9; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
              <strong>Right Aligned:</strong> This text is aligned to the right side.
            </p>
            
            <p style="text-align: justify; background: #e8f4fd; padding: 15px; border-radius: 8px;">
              <strong>Justified:</strong> This text is justified, meaning it spreads out to fill the entire width of the container, creating even margins on both sides.
            </p>
          </div>
          
          <!-- Positioned elements -->
          <div style="position: relative; height: 200px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 12px; margin-bottom: 30px; overflow: hidden;">
            <h2 style="text-align: center; color: #495057; margin: 20px 0;">Positioned Elements</h2>
            
            <div style="position: absolute; top: 20px; left: 20px; background: #007bff; color: white; padding: 10px; border-radius: 6px;">
              Top Left
            </div>
            
            <div style="position: absolute; top: 20px; right: 20px; background: #28a745; color: white; padding: 10px; border-radius: 6px;">
              Top Right
            </div>
            
            <div style="position: absolute; bottom: 20px; left: 20px; background: #dc3545; color: white; padding: 10px; border-radius: 6px;">
              Bottom Left
            </div>
            
            <div style="position: absolute; bottom: 20px; right: 20px; background: #ffc107; color: #212529; padding: 10px; border-radius: 6px;">
              Bottom Right
            </div>
            
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #6f42c1; color: white; padding: 10px; border-radius: 6px;">
              Center
            </div>
          </div>
          
          <!-- Table with alignment -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #34495e; margin-bottom: 15px;">Table Alignment</h2>
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #dee2e6;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Left Aligned</th>
                  <th style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">Center Aligned</th>
                  <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Right Aligned</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Content left</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">Content center</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Content right</td>
                </tr>
                <tr style="background: #f8f9fa;">
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">More left</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">More center</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">More right</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Mixed content -->
          <div style="background: #e9ecef; padding: 20px; border-radius: 12px; text-align: center;">
            <h2 style="color: #495057; margin-bottom: 15px;">Mixed Content Section</h2>
            <p style="margin-bottom: 20px; line-height: 1.6;">
              This section contains mixed content with different alignments and positioning.
            </p>
            <div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; gap: 15px;">
              <button style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Left Button</button>
              <button style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Center Button</button>
              <button style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Right Button</button>
            </div>
          </div>
        </div>
      `;
      
      const templateData = {
        title: 'HTML Alignment Template',
        description: 'HTML template demonstrating proper alignment and positioning preservation',
        category: 'test',
        content: testContent,
        fileName: 'html-alignment-template.html'
      };
      
      const success = await createTestTemplate(templateData);
      if (success) {
        alert('✅ HTML alignment template created successfully!');
        getTemplates(); // Refresh the list
      } else {
        alert('❌ Failed to create HTML alignment template');
      }
    } catch (error) {
      console.error('Error creating HTML alignment template:', error);
      alert('❌ Error creating HTML alignment template: ' + error);
    }
  };

  const createRawHtmlTemplate = async () => {
    try {
      console.log('Creating raw HTML template with exact preservation...');
      
      const testContent = `
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
  <h1 style="text-align: center; color: #333; margin-bottom: 30px; font-size: 32px;">Raw HTML Template</h1>
  
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Text Alignment Test</h2>
    
    <p style="text-align: left; background: #ecf0f1; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3498db;">
      <strong>Left Aligned:</strong> This text is aligned to the left side of the container.
    </p>
    
    <p style="text-align: center; background: #d5f4e6; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #27ae60;">
      <strong>Center Aligned:</strong> This text is centered within the container.
    </p>
    
    <p style="text-align: right; background: #fdf2e9; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e67e22;">
      <strong>Right Aligned:</strong> This text is aligned to the right side.
    </p>
    
    <p style="text-align: justify; background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #9b59b6;">
      <strong>Justified:</strong> This text is justified, meaning it spreads out to fill the entire width of the container, creating even margins on both sides.
    </p>
  </div>
  
  <div style="margin-top: 30px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; height: 200px;">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Positioned Elements Test</h2>
    
    <div style="position: absolute; top: 20px; left: 20px; background: #3498db; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
      Top Left
    </div>
    
    <div style="position: absolute; top: 20px; right: 20px; background: #e74c3c; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
      Top Right
    </div>
    
    <div style="position: absolute; bottom: 20px; left: 20px; background: #f39c12; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
      Bottom Left
    </div>
    
    <div style="position: absolute; bottom: 20px; right: 20px; background: #9b59b6; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
      Bottom Right
    </div>
    
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1abc9c; color: white; padding: 10px; border-radius: 6px; font-weight: bold;">
      Center
    </div>
  </div>
  
  <div style="margin-top: 30px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #2c3e50; margin-bottom: 20px;">Table Alignment Test</h2>
    <table style="width: 100%; border-collapse: collapse; border: 2px solid #bdc3c7;">
      <thead>
        <tr style="background: #ecf0f1;">
          <th style="border: 1px solid #bdc3c7; padding: 12px; text-align: left; color: #2c3e50;">Left Aligned</th>
          <th style="border: 1px solid #bdc3c7; padding: 12px; text-align: center; color: #2c3e50;">Center Aligned</th>
          <th style="border: 1px solid #bdc3c7; padding: 12px; text-align: right; color: #2c3e50;">Right Aligned</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #bdc3c7; padding: 12px; text-align: left;">Content left</td>
          <td style="border: 1px solid #bdc3c7; padding: 12px; text-align: center;">Content center</td>
          <td style="border: 1px solid #bdc3c7; padding: 12px; text-align: right;">Content right</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="border: 1px solid #bdc3c7; padding: 12px; text-align: left;">More left</td>
          <td style="border: 1px solid #bdc3c7; padding: 12px; text-align: center;">More center</td>
          <td style="border: 1px solid #bdc3c7; padding: 12px; text-align: right;">More right</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
      `;
      
      const templateData = {
        title: 'Raw HTML Template',
        description: 'Template with exact content preservation - no modifications',
        category: 'test',
        content: testContent,
        fileName: 'raw-html-template.html'
      };
      
      const success = await createTestTemplate(templateData);
      if (success) {
        alert('✅ Raw HTML template created successfully! Preview it to see exact preservation.');
        getTemplates(); // Refresh the list
      } else {
        alert('❌ Failed to create raw HTML template');
      }
    } catch (error) {
      console.error('Error creating raw HTML template:', error);
      alert('❌ Error creating raw HTML template: ' + error);
    }
  };

  const createResumeTemplate = async () => {
    try {
      console.log('Creating professional resume template...');
      
      const testContent = `
<div class="docx-enhanced" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white;">
  <!-- Header with blue background and profile picture -->
  <div style="position: relative; background: #2c3e50; color: white; padding: 30px 20px; border-radius: 8px 8px 0 0;">
    <div style="position: absolute; top: 20px; left: 20px; width: 80px; height: 80px; background: #ecf0f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #2c3e50;">
      👤
    </div>
    <div style="margin-left: 120px;">
      <h1 style="margin: 0; font-size: 32px; font-weight: bold;">ANDREA GILLIS</h1>
      <h2 style="margin: 5px 0 0 0; font-size: 18px; font-weight: normal; opacity: 0.9;">WEBSITE DESIGNER</h2>
    </div>
  </div>
  
  <!-- Tagline -->
  <div style="background: #ecf0f1; padding: 15px 20px; text-align: center; color: #7f8c8d; font-weight: bold; letter-spacing: 2px;">
    PROFESSIONAL • FOCUSED • COLLABORATIVE
  </div>
  
  <!-- Two Column Layout -->
  <div style="display: flex; gap: 20px; padding: 20px;">
    <!-- Left Column -->
    <div style="flex: 1;">
      <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">PROFESSIONAL PROFILE</h3>
      <p style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
        I am an experienced designer with a proven track record for creating and maintaining functional, attractive, and responsive websites for a range of businesses.
      </p>
      
      <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">COMPETENCIES</h3>
      <ul style="color: #34495e; line-height: 1.6; margin-bottom: 20px;">
        <li>Coding Languages Marketing software</li>
        <li>Various design programs Drawing programs</li>
        <li>UX/UI Design principles</li>
        <li>Responsive web design</li>
      </ul>
      
      <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">EDUCATIONAL TRAINING</h3>
      <div style="margin-bottom: 15px;">
        <strong style="color: #2c3e50;">ANYTOWN UNIVERSITY</strong><br>
        <span style="color: #34495e;">Master of Computer Sciences 2019</span>
      </div>
      <div style="margin-bottom: 15px;">
        <strong style="color: #2c3e50;">ANYTOWN UNIVERSITY</strong><br>
        <span style="color: #34495e;">Bachelor of Science 2017</span>
      </div>
      <div style="margin-bottom: 15px;">
        <strong style="color: #2c3e50;">ANYTOWN UNIVERSITY</strong><br>
        <span style="color: #34495e;">Associate Degree 2015</span>
      </div>
    </div>
    
    <!-- Right Column -->
    <div style="flex: 1;">
      <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">CAREER SUMMARY</h3>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #2c3e50; margin: 0 0 5px 0; font-size: 16px;">LEAD SITE DESIGNER</h4>
        <p style="color: #e74c3c; margin: 0 0 10px 0; font-weight: bold;">Anywhere Labs</p>
        <ul style="color: #34495e; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Planned site designs</li>
          <li>Lead UX Reviewer</li>
          <li>Raised UX scores by 66%</li>
        </ul>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #2c3e50; margin: 0 0 5px 0; font-size: 16px;">WEBSITE DEVELOPER</h4>
        <p style="color: #e74c3c; margin: 0 0 10px 0; font-weight: bold;">Anytown Designs</p>
        <ul style="color: #34495e; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Managed typography and branding</li>
          <li>Built wireframes & prototypes</li>
          <li>Collaborated with design teams</li>
        </ul>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #2c3e50; margin: 0 0 5px 0; font-size: 16px;">WEBSITE DEVELOPER</h4>
        <p style="color: #e74c3c; margin: 0 0 10px 0; font-weight: bold;">Anytown Designs</p>
        <ul style="color: #34495e; line-height: 1.6; margin: 0; padding-left: 20px;">
          <li>Developed responsive websites</li>
          <li>Optimized for performance</li>
          <li>Maintained existing projects</li>
        </ul>
      </div>
    </div>
  </div>
</div>
      `;
      
      const templateData = {
        title: 'Professional Resume Template',
        description: 'Professional resume template with proper styling and layout preservation',
        category: 'test',
        content: testContent,
        fileName: 'professional-resume-template.html'
      };
      
      const success = await createTestTemplate(templateData);
      if (success) {
        alert('✅ Professional Resume template created successfully! Preview it to see proper styling preservation.');
        getTemplates(); // Refresh the list
      } else {
        alert('❌ Failed to create Professional Resume template');
      }
    } catch (error) {
      console.error('Error creating Professional Resume template:', error);
      alert('❌ Error creating Professional Resume template: ' + error);
    }
  };

  const createDynamicDesignTemplate = async () => {
    try {
      console.log('Creating dynamic design template with comprehensive styling...');
      
      const testContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dynamic Design Template</title>
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Poppins', sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
      animation: rainbow 3s ease-in-out infinite;
    }
    
    @keyframes rainbow {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(100%); }
    }
    
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
      animation: fadeInUp 1s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .header p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 20px;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 20px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }
    
    .feature-card p {
      color: #666;
      line-height: 1.6;
    }
    
    .stats {
      display: flex;
      justify-content: space-around;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    
    .stat-item {
      text-align: center;
      position: relative;
    }
    
    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: block;
      animation: countUp 2s ease-out;
    }
    
    @keyframes countUp {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .stat-label {
      font-size: 1rem;
      color: #666;
      margin-top: 10px;
    }
    
    .cta-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      padding: 15px 40px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
      position: relative;
      overflow: hidden;
    }
    
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.6);
    }
    
    .cta-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    
    .cta-button:hover::before {
      left: 100%;
    }
    
    @media (max-width: 768px) {
      .header h1 {
        font-size: 2rem;
      }
      
      .stats {
        flex-direction: column;
        gap: 20px;
      }
      
      .features {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dynamic Design Template</h1>
      <p>Experience the power of modern web design with gradients, animations, and responsive layouts</p>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-palette"></i>
        </div>
        <h3>Beautiful Gradients</h3>
        <p>Stunning gradient backgrounds and text effects that create visual depth and modern appeal.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-magic"></i>
        </div>
        <h3>Smooth Animations</h3>
        <p>Elegant animations and transitions that bring your content to life with subtle motion effects.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <i class="fas fa-mobile-alt"></i>
        </div>
        <h3>Responsive Design</h3>
        <p>Fully responsive layout that adapts beautifully to all screen sizes and devices.</p>
      </div>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-number">100%</span>
        <div class="stat-label">Design Preservation</div>
      </div>
      <div class="stat-item">
        <span class="stat-number">50+</span>
        <div class="stat-label">Font Families</div>
      </div>
      <div class="stat-item">
        <span class="stat-number">∞</span>
        <div class="stat-label">Possibilities</div>
      </div>
    </div>
    
    <div class="cta-section">
      <h2 style="font-size: 2rem; margin-bottom: 20px; color: #333;">Ready to Create?</h2>
      <p style="font-size: 1.1rem; margin-bottom: 30px; color: #666;">Start building your next amazing project with our dynamic template system.</p>
      <a href="#" class="cta-button">Get Started Now</a>
    </div>
  </div>
</body>
</html>
      `;
      
      const templateData = {
        title: 'Dynamic Design Template',
        description: 'Comprehensive template demonstrating dynamic design preservation with gradients, animations, and modern styling',
        category: 'test',
        content: testContent,
        fileName: 'dynamic-design-template.html'
      };
      
      const success = await createTestTemplate(templateData);
      if (success) {
        alert('✅ Dynamic Design template created successfully! Preview it to see comprehensive design preservation.');
        getTemplates(); // Refresh the list
      } else {
        alert('❌ Failed to create Dynamic Design template');
      }
    } catch (error) {
      console.error('Error creating Dynamic Design template:', error);
      alert('❌ Error creating Dynamic Design template: ' + error);
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
                onClick={() => router.push('/admin/template-editor')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                ✏️ Edit Templates
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
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  onClick={createHtmlTestTemplate}
                >
                  📄 Create HTML Test Template
                </button>
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  onClick={createRawHtmlTemplate}
                >
                  📄 Create Raw HTML Template
                </button>
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  onClick={createResumeTemplate}
                >
                  📄 Create Resume Template
                </button>
                <button
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  onClick={createDynamicDesignTemplate}
                >
                  📄 Create Dynamic Design Template
                </button>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">✨ Comprehensive File Type Support</h3>
              <p className="text-sm text-blue-700">
                Templates now render <strong>exactly as designed</strong> - supporting HTML, DOCX, PPTX, JSON files with all original styling, fonts, and layout preserved. Like Canva's preview system!
              </p>
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
                <span className={`flex items-center ${isStructuredTemplate ? 'text-blue-600' : 'text-gray-400'}`}>
                  {isStructuredTemplate ? '✨' : '📄'} {isStructuredTemplate ? 'Structured' : 'Legacy'} Template
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
                    Template Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="templateType"
                        value="legacy"
                        checked={!isStructuredTemplate}
                        onChange={() => setIsStructuredTemplate(false)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Legacy Template
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Simple HTML content (backward compatible)
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="templateType"
                        value="structured"
                        checked={isStructuredTemplate}
                        onChange={() => setIsStructuredTemplate(true)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Structured Template ✨
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Advanced block-based editing with rich text features
                        </p>
                      </div>
                    </label>
                  </div>
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
                {/* Upload timing info */}
                {uploadStartTime && uploadEndTime && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ⏱️ Last upload completed in {Math.round((uploadEndTime.getTime() - uploadStartTime.getTime()) / 1000)}s
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* Bulk selection controls */}
                {isSelectMode && (
                  <div className="flex items-center space-x-2 mr-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTemplates.size} selected
                    </span>
                    <button
                      onClick={selectAllTemplates}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllTemplates}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                    >
                      Deselect All
                    </button>
                    <button
                      onClick={deleteSelectedTemplates}
                      disabled={selectedTemplates.size === 0}
                      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Selected ({selectedTemplates.size})
                    </button>
                  </div>
                )}
                
                <button
                  onClick={toggleSelectMode}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isSelectMode 
                      ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                  title={isSelectMode ? 'Exit selection mode' : 'Enter selection mode'}
                >
                  {isSelectMode ? '✕' : '☑️'} {isSelectMode ? 'Exit' : 'Select'}
                </button>
                
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
                <div key={template.id} className={`p-6 transition-colors ${
                  isSelectMode && selectedTemplates.has(template.id!) 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                  {/* Template Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {/* Selection Checkbox */}
                      {isSelectMode && (
                        <input
                          type="checkbox"
                          checked={selectedTemplates.has(template.id!)}
                          onChange={() => toggleTemplateSelection(template.id!)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      )}
                      {/* Front Image or Profile Photo */}
                      {template.frontImage ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={template.frontImage}
                            alt={template.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {template.title ? template.title.charAt(0).toUpperCase() : 'T'}
                        </div>
                      )}
                      
                      {/* Template Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {template.title || 'Untitled Template'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                            {template.uploadedAt ? (() => {
                              try {
                                const date = new Date(template.uploadedAt);
                                return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
                              } catch {
                                return 'Unknown';
                              }
                            })() : 'Unknown'}
                          </span>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            📝 {template.category || 'assignment'}
                          </span>
                        </div>
                        
                        {/* Content Summary */}
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center">
                            📄 {template.content?.length || 0} chars
                          </span>
                          {template.content && template.content.length > 1000 && (
                            <span className="ml-2 inline-flex items-center text-blue-600 dark:text-blue-400">
                              ⚡ Long content
                            </span>
                          )}
                        </div>
                        
                        {/* Document Metadata */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {template.documentType && (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              template.documentType === 'structured'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : template.documentType === 'formatted' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {template.documentType === 'structured' ? '✨ Structured' : 
                               template.documentType === 'formatted' ? '🎨 Formatted' : '📝 Plain'}
                            </span>
                          )}
                          {template.documentType === 'structured' && template.structuredDocument && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              📦 {template.structuredDocument.blocks?.length || 0} blocks
                            </span>
                          )}
                          {template.version && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              v{template.version}
                            </span>
                          )}
                          {template.hasImages && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              🖼️ Has Images
                            </span>
                          )}
                          {template.extractedImages && template.extractedImages.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              📸 {template.extractedImages.length} Images
                            </span>
                          )}
                          {template.originalFileName && template.originalFileName !== template.fileName && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              📁 {template.originalFileName}
                            </span>
                          )}
                        </div>
                        
                        {/* Content Preview */}
                        {template.content && template.id && !expandedPreviews.has(template.id) && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Content preview:
                            </div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                              {template.content.length > 150 && '...'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => togglePreviewExpansion(template.id!)}
                        disabled={!!(template.id && loadingPreviews.has(template.id))}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          template.id && loadingPreviews.has(template.id)
                            ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                            : template.id && expandedPreviews.has(template.id)
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                        }`}
                        title={template.id && loadingPreviews.has(template.id) ? 'Loading...' : template.id && expandedPreviews.has(template.id) ? 'Hide preview' : 'Show preview'}
                      >
                        {template.id && loadingPreviews.has(template.id) 
                          ? '⏳ Loading...' 
                          : template.id && expandedPreviews.has(template.id) 
                          ? '👁️ Hide Preview' 
                          : '👁️ Preview'
                        }
                      </button>
                      {template.fileName?.toLowerCase().endsWith('.docx') && template.originalFileName && (
                        <button
                          onClick={() => openOriginalFile(template)}
                          className="px-3 py-1 text-xs font-medium rounded-lg transition-colors bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
                          title="View original DOCX formatting"
                        >
                          📄 Original
                        </button>
                      )}
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

                  {/* Content Preview Section - Collapsible */}
                  {template.id && expandedPreviews.has(template.id) && (
                    <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Content Preview
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>Content Length: {template.content?.length || 0} chars</span>
                          <span>•</span>
                          <span>File: {template.fileName || 'Unknown'}</span>
                        </div>
                      </div>
                      
                      {/* HTML Content Preview */}
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Rendered HTML Preview
                              </span>
                              {template.documentType && (
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  template.documentType === 'formatted' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {template.documentType === 'formatted' ? '🎨 Formatted' : '📝 Plain'}
                                </span>
                              )}
                              {template.hasImages && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  🖼️ Has Images
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {template.content ? '✅ Content Available' : '❌ No Content'}
                              </span>
                              {template.content && template.content.length > 1000 && (
                                <button
                                  onClick={() => togglePreviewExpansion(template.id!)}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                >
                                  {expandedPreviews.has(template.id!) ? 'Collapse' : 'Expand'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          {template.content ? (
                            <div className={`overflow-y-auto ${expandedPreviews.has(template.id!) ? 'max-h-none' : 'max-h-64'}`}>
                              <div 
                                className={`template-content-preview prose prose-lg max-w-none ${
                                  template.documentType === 'formatted' ? 'formatted-content' : 'plain-content'
                                }`}
                                style={{ 
                                  fontFamily: template.documentType === 'formatted' 
                                    ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                    : 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                  lineHeight: '1.6',
                                  color: '#333',
                                  fontSize: '14px',
                                  padding: '16px',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb',
                                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                  ...(template.hasImages && {
                                    backgroundImage: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%), linear-gradient(-45deg, #f8fafc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f8fafc 75%), linear-gradient(-45deg, transparent 75%, #f8fafc 75%)',
                                    backgroundSize: '20px 20px',
                                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                                  })
                                }}
                                dangerouslySetInnerHTML={{ 
                                  __html: expandedPreviews.has(template.id!) 
                                    ? template.content 
                                    : (template.content.length > 1000 
                                        ? template.content.substring(0, 1000) + '...' 
                                        : template.content)
                                }}
                              />
                              {template.content.length > 1000 && !expandedPreviews.has(template.id!) && (
                                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                                  <strong>Preview truncated.</strong> Content is {template.content.length} characters long. 
                                  <button
                                    onClick={() => togglePreviewExpansion(template.id!)}
                                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
                                  >
                                    Click to expand
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              <div className="text-2xl mb-2">📄</div>
                              <p className="text-sm">No content available for preview</p>
                              <p className="text-xs mt-1">This template may not have been processed correctly</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Raw HTML Toggle */}
                      <div className="mt-3">
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                            <span className="group-open:hidden">🔽 Show Raw HTML</span>
                            <span className="hidden group-open:inline">🔼 Hide Raw HTML</span>
                          </summary>
                          <div className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg font-mono text-xs overflow-x-auto">
                            <pre className="whitespace-pre-wrap break-words">
                              {template.content || 'No content available'}
                            </pre>
                          </div>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Original File Viewer Modal */}
      {originalFileViewer && originalFileViewer.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Original DOCX Formatting
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {originalFileViewer.template.title} - {originalFileViewer.template.fileName}
                </p>
              </div>
              <button
                onClick={closeOriginalFile}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Viewer Options */}
                <div className="mb-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Viewer:</span>
                    <select 
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      defaultValue="iframe"
                    >
                      <option value="iframe">Microsoft Office Online</option>
                      <option value="google">Google Docs</option>
                      <option value="download">Download File</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      File: {originalFileViewer.template.fileName}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Size: {(originalFileViewer.template.fileSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                {/* Document Viewer */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-4xl mb-4">📄</div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        DOCX Document Viewer
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This feature allows you to view the original DOCX file with full formatting preserved.
                      </p>
                      
                      {/* Viewer Options */}
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            // Open in Microsoft Office Online
                            const fileName = originalFileViewer.template.fileName;
                            const fileUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + '/api/documents/' + fileName)}`;
                            window.open(fileUrl, '_blank');
                          }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          🌐 Open in Microsoft Office Online
                        </button>
                        
                        <button
                          onClick={() => {
                            // Open in Google Docs
                            const fileName = originalFileViewer.template.fileName;
                            const fileUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + '/api/documents/' + fileName)}&embedded=true`;
                            window.open(fileUrl, '_blank');
                          }}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          📝 Open in Google Docs
                        </button>
                        
                        <button
                          onClick={() => {
                            // Download the file
                            const fileName = originalFileViewer.template.fileName;
                            const link = document.createElement('a');
                            link.href = `/api/documents/${fileName}`;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          💾 Download Original File
                        </button>
                      </div>
                      
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Note:</strong> To view the original DOCX formatting, you'll need to either:
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 list-disc list-inside">
                          <li>Open the file in Microsoft Word or compatible software</li>
                          <li>Use Microsoft Office Online viewer</li>
                          <li>Upload to Google Docs for online viewing</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>Important:</strong> The original DOCX file must be available in the server's upload directory for this feature to work. 
                          If you see a "File not found" error, the original file may not have been preserved during upload.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 