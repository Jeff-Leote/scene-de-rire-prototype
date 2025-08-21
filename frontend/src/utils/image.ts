export type ImageCategory = 'spectacles' | 'photo_artiste' | 'photo_featured';

export function buildImgSrc(category: ImageCategory, filename?: string): string {
  if (!filename) return '';
  // Prioritize public assets path (works in prod and dev). Fallback handled via onImgErrorSwap
  return `/assets/img/${category}/${filename}`;
}

// Swap between public assets and src assets, then fallback to placeholder
export function onImgErrorSwap(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const el = e.currentTarget;
  const current = el.getAttribute('src') || '';
  const tried = el.dataset.fallbackTried === '1';
  if (!tried) {
    el.dataset.fallbackTried = '1';
    if (current.includes('/assets/')) {
      el.src = current.replace('/assets/', '/src/assets/');
    } else if (current.includes('/src/assets/')) {
      el.src = current.replace('/src/assets/', '/assets/');
    } else {
      el.src = '/assets/placeholder.jpg';
    }
  } else {
    el.src = '/assets/placeholder.jpg';
  }
}


