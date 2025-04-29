import { Suspense } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

const ImageLoader = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <div className="relative w-full h-full">
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={false}
      loading="lazy"
    />
  </div>
);

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  if (!width || !height) {
    return (
      <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse" />}>
        <ImageLoader src={src} alt={alt} className={className} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse" />}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={quality}
        sizes={sizes}
      />
    </Suspense>
  );
} 