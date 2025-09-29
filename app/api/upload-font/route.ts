import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'your-presentation-maker-bucket';

// Font file validation
const isValidFontFile = (file: File): boolean => {
  const validTypes = [
    'font/woff2',
    'font/woff',
    'font/ttf',
    'font/otf',
    'application/font-woff2',
    'application/font-woff',
    'application/x-font-ttf',
    'application/x-font-otf',
    'application/octet-stream' // Some systems don't set proper MIME type
  ];
  
  const validExtensions = ['.woff2', '.woff', '.ttf', '.otf'];
  const fileName = file.name.toLowerCase();
  
  return validTypes.includes(file.type) || 
         validExtensions.some(ext => fileName.endsWith(ext));
};

// Extract font metadata from file
const extractFontMetadata = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Basic font family name extraction (simplified)
    // In a real implementation, you'd use a proper font parsing library
    const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const fontFamily = fileName
      .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
    
    return {
      family: fontFamily,
      weight: '400', // Default weight
      style: 'normal', // Default style
      format: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    };
  } catch (error) {
    console.error('Error extracting font metadata:', error);
    return {
      family: file.name.replace(/\.[^/.]+$/, ""),
      weight: '400',
      style: 'normal',
      format: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No font files uploaded' }, { status: 400 });
    }

    const uploadedFonts = await Promise.all(
      files.map(async (file) => {
        // Validate font file
        if (!isValidFontFile(file)) {
          throw new Error(`Invalid font file: ${file.name}. Supported formats: .woff2, .woff, .ttf, .otf`);
        }

        // Extract font metadata
        const metadata = await extractFontMetadata(file);
        
        const fileName = file.name;
        const fileType = file.type || 'application/octet-stream';
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = fileName.split('.').pop();
        const s3Key = `library/fonts/${timestamp}-${randomString}.${fileExtension}`;

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to S3
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: fileType,
          Metadata: {
            'font-family': metadata.family,
            'font-weight': metadata.weight,
            'font-style': metadata.style,
            'original-name': fileName
          }
        });

        await s3Client.send(command);

        // Generate the public URL
        const fontUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

        return {
          id: s3Key,
          name: fileName,
          family: metadata.family,
          weight: metadata.weight,
          style: metadata.style,
          format: metadata.format,
          url: fontUrl,
          size: file.size,
          uploadDate: new Date().toISOString()
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      uploaded: uploadedFonts,
      message: `Successfully uploaded ${uploadedFonts.length} font(s)`
    });
  } catch (error) {
    console.error('Error uploading font:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload font' 
    }, { status: 500 });
  }
}


