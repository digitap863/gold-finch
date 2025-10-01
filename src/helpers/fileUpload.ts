import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Minimal response shape for compatibility with previous return type
interface S3UploadResult {
  url: string;
}

// Configure S3 client
const s3Region = process.env.AWS_REGION as string;
const s3Bucket = process.env.AWS_S3_BUCKET as string;
const s3PublicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL || '';


if (!s3Region || !s3Bucket) {
  // Do not throw on import; throw lazily on first use to avoid build-time issues
}

const s3Client = new S3Client({
  region: s3Region,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export const uploadFile = async (file: File): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 10MB for Cloudinary free tier)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit. Please use a smaller file or upgrade your Cloudinary plan.');
    }

    // Check if file is an image or audio
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/') || 
                   file.name.toLowerCase().endsWith('.wav') ||
                   file.name.toLowerCase().endsWith('.mp3') ||
                   file.name.toLowerCase().endsWith('.m4a') ||
                   file.name.toLowerCase().endsWith('.ogg') ||
                   file.name.toLowerCase().endsWith('.webm');
    
    if (!isImage && !isAudio) {
      throw new Error('File must be an image or audio file');
    }

    // Decide content grouping for S3 key prefix
    const typeFolder = isAudio ? 'audio' : 'images';

    // Prepare body buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);

    // Build S3 object key
    const sanitizedName = (file.name || 'file')
      .replace(/\s+/g, '_')
      .replace(/[^A-Za-z0-9._-]/g, '');
    const key = `goldfinch/${typeFolder}/${Date.now()}_${sanitizedName}`;

    // Ensure env is configured
    if (!s3Region || !s3Bucket) {
      throw new Error('S3 configuration missing. Please set AWS_REGION and AWS_S3_BUCKET.');
    }

    // Perform multipart upload using AWS SDK v3 Upload helper
    const uploader = new Upload({
      client: s3Client,
      params: {
        Bucket: s3Bucket,
        Key: key,
        Body: body,
        ContentType: file.type || 'application/octet-stream',
        // Note: ACL removed as modern S3 buckets often have ACLs disabled
        // Make bucket public through bucket policy instead
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5MB
      leavePartsOnError: false,
    });

    try {
      await uploader.done();
    } catch (err: unknown) {
      console.error('S3 upload error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('timeout')) {
        throw new Error('Upload timed out. Please try again with a smaller file or check your internet connection.');
      }
      throw new Error(`Upload failed: ${message}`);
    }

    // Construct public URL
    const url = s3PublicBaseUrl
      ? `${s3PublicBaseUrl.replace(/\/$/, '')}/${key}`
      : `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`;

    const result: S3UploadResult = { url };
    return result.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Upload timed out. Please try again with a smaller file or check your internet connection.');
      } else if (error.message.includes('size')) {
        throw new Error('File is too large. Please use a file smaller than 10MB.');
      } else {
        throw error;
      }
    } else {
      throw new Error('Failed to upload file. Please try again.');
    }
  }
}; 