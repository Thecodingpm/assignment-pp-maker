import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { EditorTemplate } from '../../../types/document';

// GET /api/templates/[id] - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== GET TEMPLATE BY ID API START ===');
    console.log('Template ID:', params.id);
    
    const templateRef = doc(db, 'editorTemplates', params.id);
    const templateSnap = await getDoc(templateRef);
    
    if (!templateSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    const template: EditorTemplate = {
      id: templateSnap.id,
      ...templateSnap.data()
    } as EditorTemplate;
    
    // Increment usage count
    await updateDoc(templateRef, {
      usageCount: (template.usageCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
    
    console.log('Template found:', template.title);
    console.log('=== GET TEMPLATE BY ID API SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a template (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== DELETE TEMPLATE API START ===');
    console.log('Template ID:', params.id);
    
    const body = await request.json();
    const { userRole } = body;
    
    // Check if user is admin
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const templateRef = doc(db, 'editorTemplates', params.id);
    await deleteDoc(templateRef);
    
    console.log('Template deleted:', params.id);
    console.log('=== DELETE TEMPLATE API SUCCESS ===');
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
