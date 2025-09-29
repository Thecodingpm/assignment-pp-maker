import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!BUCKET_NAME) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        try {
          // Generate unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExtension = file.name.split('.').pop();
          const fileName = `library/images/${timestamp}-${randomString}.${fileExtension}`;

          // Convert file to buffer
          const buffer = Buffer.from(await file.arrayBuffer());

          // Upload to S3
          const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
            // Removed ACL as bucket doesn't support it
          });

          await s3Client.send(command);

          // Generate the public URL
          const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

          return {
            id: `${timestamp}-${randomString}`,
            fileName: file.name,
            s3Key: fileName,
            url: imageUrl,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          };
        } catch (error) {
          console.error('Error uploading file:', error);
          return {
            error: `Failed to upload ${file.name}`,
            fileName: file.name,
          };
        }
      })
    );

    // Separate successful uploads from errors
    const successfulUploads = uploadResults.filter(result => !result.error);
    const errors = uploadResults.filter(result => result.error);

    return NextResponse.json({
      success: true,
      uploaded: successfulUploads,
      errors: errors,
      message: `Successfully uploaded ${successfulUploads.length} of ${files.length} files`,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}

// Generate presigned URL for direct upload (alternative method)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }

    if (!BUCKET_NAME) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
    }

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const s3Key = `library/images/${timestamp}-${randomString}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      // Removed ACL as bucket doesn't support it
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      presignedUrl,
      s3Key,
      publicUrl: `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`,
    });

  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
