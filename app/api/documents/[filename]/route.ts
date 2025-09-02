import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Security: Only allow DOCX files
    if (!filename.toLowerCase().endsWith('.docx')) {
      return NextResponse.json({ error: 'Only DOCX files are allowed' }, { status: 400 });
    }
    
    // Construct the file path - you'll need to adjust this based on where you store the original files
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'templates', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read the file
    const fileBuffer = await fs.readFile(filePath);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
