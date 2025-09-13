import { NextRequest, NextResponse } from 'next/server';
import { getTemplates } from '../../firebase/templates';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 API: Fetching templates...');
    
    const templates = await getTemplates();
    
    console.log(`✅ API: Successfully fetched ${templates.length} templates`);
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('❌ API: Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
