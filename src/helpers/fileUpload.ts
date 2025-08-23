import { v2 as cloudinary } from 'cloudinary';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  // Add other properties as needed
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (file: File): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size (max 10MB for Cloudinary free tier)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit. Please use a smaller file or upgrade your Cloudinary plan.');
    }

    // Check if file is an image, STL, or audio
    const isImage = file.type.startsWith('image/');
    const isSTL = file.name.toLowerCase().endsWith('.stl') || 
                  file.type === 'application/octet-stream' || 
                  file.type === 'model/stl';
    const isAudio = file.type.startsWith('audio/') || 
                   file.name.toLowerCase().endsWith('.wav') ||
                   file.name.toLowerCase().endsWith('.mp3') ||
                   file.name.toLowerCase().endsWith('.m4a') ||
                   file.name.toLowerCase().endsWith('.ogg') ||
                   file.name.toLowerCase().endsWith('.webm');
    
    if (!isImage && !isSTL && !isAudio) {
      throw new Error('File must be an image, STL, or audio file');
    }

    // Decide Cloudinary resource_type explicitly for better handling
    const resourceType = isAudio ? 'video' : isSTL ? 'raw' : 'image';

    // For audio files, use streaming upload
    if (isAudio) {
      // Use direct upload method for audio files
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
          folder: 'pradaresidency',
          resource_type: resourceType,
          chunk_size: 10_000_000, // 10MB chunks
          timeout: 180000, // 3 minute timeout
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResponse);
        });

        // Failsafe timeout
        const timeout = setTimeout(() => {
          try { uploadStream.destroy(); } catch {}
          reject(new Error('Upload timeout'));
        }, 240000); // 4 minute failsafe

        uploadStream.on('finish', () => {
          clearTimeout(timeout);
        });

        uploadStream.end(buffer);
      });

      return result.secure_url;
    } else {
      // For image/raw files, use base64 method
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        cloudinary.uploader.upload(dataURI, {
          folder: 'pradaresidency',
          resource_type: resourceType,
          timeout: 60000, // 1 minute timeout for smaller files
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResponse);
        });
      });

      return result.secure_url;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error instanceof Error ? error : new Error('Failed to upload file');
  }
}; 