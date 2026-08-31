import { useEffect } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 15 * 60 * 1000;

export interface InitialDataShape {
  spectaclesUpcoming?: unknown;
  artistFeatured?: unknown;
  venueImages?: unknown;
  venueMain?: unknown;
  spectaclesList?: unknown;
  artistes?: unknown;
  spectaclesAll?: unknown;
}

declare global {
  interface Window {
    __INITIAL_DATA__?: InitialDataShape;
  }
}

/**
 * Remplit le cache React Query avec les données injectées côté serveur (Option B).
 * À appeler de façon synchrone au boot pour que le premier rendu ait déjà les données.
 */
export function hydrateQueryClientFromInitialData(queryClient: QueryClient, data: InitialDataShape): void {
  const opts = { staleTime: STALE_TIME, gcTime: GC_TIME };
  if (data.spectaclesUpcoming !== undefined) {
    queryClient.setQueryData(['spectacles', 'upcoming'], data.spectaclesUpcoming);
    queryClient.prefetchQuery({
      queryKey: ['spectacles', 'upcoming'],
      queryFn: () => Promise.resolve(data.spectaclesUpcoming),
      ...opts,
    });
  }
  if (data.artistFeatured !== undefined) {
    queryClient.setQueryData(['artist', 'featured'], data.artistFeatured);
    queryClient.prefetchQuery({
      queryKey: ['artist', 'featured'],
      queryFn: () => Promise.resolve(data.artistFeatured),
      ...opts,
    });
  }
  if (data.venueImages !== undefined) {
    queryClient.setQueryData(['venue', 'images'], data.venueImages);
    queryClient.prefetchQuery({
      queryKey: ['venue', 'images'],
      queryFn: () => Promise.resolve(data.venueImages),
      ...opts,
    });
  }
  if (data.venueMain !== undefined) {
    queryClient.setQueryData(['venue', 'main'], data.venueMain);
    queryClient.prefetchQuery({ queryKey: ['venue', 'main'], queryFn: () => Promise.resolve(data.venueMain), ...opts });
  }
  if (data.spectaclesList !== undefined) {
    queryClient.setQueryData(['spectacles', 'list', '1', '9'], data.spectaclesList);
    queryClient.prefetchQuery({
      queryKey: ['spectacles', 'list', '1', '9'],
      queryFn: () => Promise.resolve(data.spectaclesList),
      ...opts,
    });
  }
  if (data.artistes !== undefined) {
    queryClient.setQueryData(['artistes'], data.artistes);
    queryClient.prefetchQuery({ queryKey: ['artistes'], queryFn: () => Promise.resolve(data.artistes), ...opts });
  }
  if (data.spectaclesAll !== undefined) {
    queryClient.setQueryData(['spectacles', 'all'], data.spectaclesAll);
    queryClient.prefetchQuery({
      queryKey: ['spectacles', 'all'],
      queryFn: () => Promise.resolve(data.spectaclesAll),
      ...opts,
    });
  }
}

/**
 * Composant qui nettoie window.__INITIAL_DATA__ après hydratation (fallback si hydratation synchrone manquée).
 */
export function InitialDataHydrator() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const data = window.__INITIAL_DATA__;
    if (data) {
      hydrateQueryClientFromInitialData(queryClient, data);
      delete window.__INITIAL_DATA__;
    }
  }, [queryClient]);
  return null;
}
