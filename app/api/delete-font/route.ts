import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'your-presentation-maker-bucket';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Font key is required' }, { status: 400 });
    }

    console.log('Deleting font with key:', key);
    console.log('From bucket:', BUCKET_NAME);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log('Font deleted successfully from S3');

    return NextResponse.json({ 
      success: true, 
      message: 'Font deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting font from S3:', error);
    return NextResponse.json({ 
      error: 'Failed to delete font' 
    }, { status: 500 });
  }
}


