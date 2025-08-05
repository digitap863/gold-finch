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

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File size exceeds 100MB limit');
    }

    // Check if file is an image or STL
    const isImage = file.type.startsWith('image/');
    const isSTL = file.name.toLowerCase().endsWith('.stl') || 
                  file.type === 'application/octet-stream' || 
                  file.type === 'model/stl';
    
    if (!isImage && !isSTL) {
      throw new Error('File must be an image or STL file');
    }

    // For large files (especially STL), use direct upload instead of base64
    if (file.size > 10 * 1024 * 1024) { // Files larger than 10MB
      // Use direct upload method for large files
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({
          folder: 'pradaresidency',
          resource_type: 'auto',
          chunk_size: 6000000, // 6MB chunks for large files
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryResponse);
        }).end(buffer);
      });

      return result.secure_url;
    } else {
      // For smaller files, use base64 method
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        cloudinary.uploader.upload(dataURI, {
          folder: 'pradaresidency',
          resource_type: 'auto',
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