import React, { useState } from 'react';
import { buildImgSrc, onImgErrorSwap, ImageCategory } from '../utils/image';

interface OptimizedImageProps {
  category: ImageCategory;
  filename: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  category,
  filename,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  width,
  height,
  quality = 80
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // URL de base optimisée pour le LCP
  const baseUrl = buildImgSrc(category, filename);
  const optimizedUrl = baseUrl;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onImgErrorSwap(e);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={optimizedUrl}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default OptimizedImage;
