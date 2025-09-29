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

    console.log('Delete request - Key:', key);
    console.log('Delete request - Bucket:', BUCKET_NAME);

    if (!key) {
      return NextResponse.json({ error: 'Image key is required' }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    console.log('Sending delete command to S3...');
    await s3Client.send(command);
    console.log('Image successfully deleted from S3');

    return NextResponse.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
