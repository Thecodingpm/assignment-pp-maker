import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';

export async function GET(request: NextRequest) {
  try {
    if (!BUCKET_NAME) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
    }

    // List objects in the library/images/ folder
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'library/images/',
      MaxKeys: 100, // Limit to 100 images
    });

    const response = await s3Client.send(command);
    
    const images = (response.Contents || []).map((object) => {
      const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'eu-north-1'}.amazonaws.com/${object.Key}`;
      
      return {
        id: object.Key || '', // Use full S3 key as ID for deletion
        key: object.Key || '',
        url: imageUrl,
        name: object.Key?.split('/').pop() || '',
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
      };
    });

    return NextResponse.json({
      success: true,
      images: images,
      count: images.length,
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
