import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { EditorTemplate, TemplateCreationData, UserRole } from '../../types/document';

// GET /api/templates - Get all public templates
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET TEMPLATES API START ===');
    
    const q = query(
      collection(db, 'editorTemplates'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const templates: EditorTemplate[] = [];
    
    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        ...doc.data()
      } as EditorTemplate);
    });
    
    console.log('Found templates:', templates.length);
    console.log('=== GET TEMPLATES API SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template (admin only)
export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE TEMPLATE API START ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { templateData, userRole, userId } = body;
    
    // Check if user is admin
    if (userRole !== 'admin') {
      console.log('❌ Unauthorized: User role is not admin:', userRole);
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('✅ User is admin, proceeding with template creation');
    
    const template: Omit<EditorTemplate, 'id'> = {
      title: templateData.title,
      description: templateData.description,
      category: templateData.category,
      thumbnail: templateData.thumbnail,
      slides: templateData.slides,
      createdBy: userId,
      createdByRole: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: true,
      usageCount: 0,
      tags: templateData.tags || []
    };
    
    console.log('Adding template to Firestore...');
    const docRef = await addDoc(collection(db, 'editorTemplates'), {
      ...template,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Template created with ID:', docRef.id);
    console.log('=== CREATE TEMPLATE API SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      templateId: docRef.id
    });
  } catch (error) {
    console.error('❌ Error creating template:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}