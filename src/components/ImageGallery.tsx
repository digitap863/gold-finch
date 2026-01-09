"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Thumbnail Navigation - Left Side */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-2 lg:gap-3 order-2 lg:order-1">
          {/* Scroll Up Button */}
          {images.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 lg:w-full lg:h-8 lg:mb-2"
              onClick={() => {
                const container = document.getElementById('thumbnail-container');
                if (container) {
                  container.scrollBy({ top: -80, behavior: 'smooth' });
                }
              }}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          
          {/* Thumbnails Container */}
          <div 
            id="thumbnail-container"
            className="flex lg:flex-col gap-2 lg:gap-3 max-h-80 lg:max-h-96 overflow-y-auto scrollbar-hide"
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedImageIndex === index
                    ? 'border-black ring-2 ring-black/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Scroll Down Button */}
          {images.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 lg:w-full lg:h-8 lg:mt-2"
              onClick={() => {
                const container = document.getElementById('thumbnail-container');
                if (container) {
                  container.scrollBy({ top: 80, behavior: 'smooth' });
                }
              }}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Main Image Display */}
      <div className="flex-1 max-w-md order-1 lg:order-2">
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden group">
          <Image
            src={images[selectedImageIndex]}
            alt={`${title} image ${selectedImageIndex + 1}`}
            fill
            className={`object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            priority
          />
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}


          {/* Zoom Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-4 right-4 w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-md"
            onClick={handleZoomToggle}
          >
            <ZoomIn className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Navigation Arrows for Mobile */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-md lg:hidden"
                onClick={handlePreviousImage}
              >
                <ChevronUp className="h-5 w-5 text-gray-600 rotate-90" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow-md lg:hidden"
                onClick={handleNextImage}
              >
                <ChevronDown className="h-5 w-5 text-gray-600 rotate-90" />
              </Button>
            </>
          )}

          {/* Zoom Overlay */}
          {isZoomed && (
            <div 
              className="absolute inset-0 bg-black/20 cursor-zoom-out"
              onClick={handleZoomToggle}
            />
          )}
        </div>

        {/* Image Navigation Dots for Mobile */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 lg:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  selectedImageIndex === index
                    ? 'bg-black w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
