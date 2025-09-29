import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'your-presentation-maker-bucket';

export async function GET(request: NextRequest) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'library/fonts/', // Only list objects in the 'library/fonts/' folder
    });

    const { Contents } = await s3Client.send(command);

    const fonts = Contents?.filter(obj => obj.Key !== 'library/fonts/') // Filter out the folder itself
      .map(obj => {
        const fileName = obj.Key?.split('/').pop() || '';
        const fontUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${obj.Key}`;
        
        // Extract metadata from S3 object metadata
        const metadata = obj.Metadata || {};
        
        return {
          id: obj.Key || '',
          name: fileName,
          family: metadata['font-family'] || fileName.replace(/\.[^/.]+$/, ""),
          weight: metadata['font-weight'] || '400',
          style: metadata['font-style'] || 'normal',
          format: fileName.split('.').pop()?.toLowerCase() || 'unknown',
          url: fontUrl,
          size: obj.Size || 0,
          uploadDate: obj.LastModified?.toISOString() || new Date().toISOString()
        };
      }) || [];

    return NextResponse.json({ success: true, fonts });
  } catch (error) {
    console.error('Error fetching fonts from S3:', error);
    return NextResponse.json({ error: 'Failed to fetch fonts' }, { status: 500 });
  }
}


