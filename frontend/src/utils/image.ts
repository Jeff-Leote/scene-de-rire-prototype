export type ImageCategory = 'spectacles' | 'photo_artiste' | 'photo_featured' | 'image_path' | 'photo_addictionnel';

export function buildImgSrc(category: ImageCategory, filename?: string): string {
  if (!filename) return '';
  // Accept full external URLs (e.g., Supabase public URLs)
  if (/^https?:\/\//i.test(filename)) {
    return filename;
  }
  // If the filename is already an absolute or rooted path, return as-is
  if (filename.startsWith('/')) {
    return filename;
  }
  // If it already looks like an assets path (e.g., assets/img/...), normalize with leading slash
  if (filename.startsWith('assets/')) {
    return `/${filename}`;
  }
  // Encode filename to handle spaces and special characters
  const encodedFilename = encodeURIComponent(filename);
  // Compose a path within our public assets
  return `/assets/img/${category}/${encodedFilename}`;
}

// Swap between public assets and src assets, then fallback to placeholder
export function onImgErrorSwap(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const el = e.currentTarget;
  const current = el.getAttribute('src') || '';
  const tried = el.dataset.fallbackTried === '1';
  if (!tried) {
    el.dataset.fallbackTried = '1';
    if (current.includes('/assets/')) {
      // Try src/assets path with same encoding
      el.src = current.replace('/assets/', '/src/assets/');
    } else if (current.includes('/src/assets/')) {
      // Try assets path with same encoding
      el.src = current.replace('/src/assets/', '/assets/');
    } else {
      el.src = '/assets/placeholder.jpg';
    }
  } else {
    el.src = '/assets/placeholder.jpg';
  }
}
