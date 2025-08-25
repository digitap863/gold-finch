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
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit. Please use a smaller file or upgrade your Cloudinary plan.');
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
          chunk_size: 6_000_000, // 6MB chunks for better reliability
          timeout: 120000, // 2 minute timeout
        }, (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            if (error.message?.includes('timeout') || error.http_code === 499) {
              reject(new Error('Upload timed out. Please try again with a smaller file or check your internet connection.'));
            } else {
              reject(new Error(`Upload failed: ${error.message || 'Unknown error'}`));
            }
          } else {
            resolve(result as CloudinaryResponse);
          }
        });

        // Failsafe timeout
        const timeout = setTimeout(() => {
          try { uploadStream.destroy(); } catch {}
          reject(new Error('Upload timeout. Please try again with a smaller file.'));
        }, 180000); // 3 minute failsafe

        uploadStream.on('finish', () => {
          clearTimeout(timeout);
        });

        uploadStream.on('error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`Upload stream error: ${error.message}`));
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
          if (error) {
            console.error('Cloudinary upload error:', error);
            if (error.message?.includes('timeout') || error.http_code === 499) {
              reject(new Error('Upload timed out. Please try again with a smaller file or check your internet connection.'));
            } else {
              reject(new Error(`Upload failed: ${error.message || 'Unknown error'}`));
            }
          } else {
            resolve(result as CloudinaryResponse);
          }
        });
      });

      return result.secure_url;
    }
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