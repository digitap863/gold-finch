import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the image from the URL (server-side, no CORS issues)
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    
    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Convert WebP to JPEG for PDF compatibility (react-pdf doesn't handle WebP well)
    if (contentType.includes('webp') || url.toLowerCase().endsWith('.webp')) {
      console.log('Converting WebP to JPEG for PDF compatibility');
      const convertedBuffer = await sharp(Buffer.from(buffer))
        .jpeg({ quality: 90 })
        .toBuffer();
      
      const base64 = convertedBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      return NextResponse.json({ dataUrl });
    }
    
    // For other formats, return as-is
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;
    
    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
