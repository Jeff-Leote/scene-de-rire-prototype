import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { api } from '@/services/api';

// 🚀 Hook optimisé pour les requêtes avec cache intelligent
export function useOptimizedQuery<TData>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<TData> => {
      return await api.get<TData>(endpoint);
    },
    // ⚡ Optimisations de performance
    staleTime: 5 * 60 * 1000, // 5 minutes - données considérées fraîches
    gcTime: 10 * 60 * 1000,   // 10 minutes - garder en cache
    retry: 2,                  // 2 tentatives en cas d'échec
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Ne pas refetch automatiquement
    refetchOnMount: false,       // Ne pas refetch au montage si en cache
    ...options
  });
}

// 🎯 Hook spécialisé pour les spectacles avec cache optimisé
export function useSpectaclesQuery(page: number = 1, limit: number = 9) {
  return useOptimizedQuery(
    ['spectacles', 'list', page.toString(), limit.toString()],
    `/api/spectacles?page=${page}&limit=${limit}`,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes pour les spectacles
      gcTime: 5 * 60 * 1000,    // 5 minutes en cache
    }
  );
}

// 🎭 Hook pour les détails d'un spectacle
export function useSpectacleQuery(id: string | number) {
  return useOptimizedQuery(
    ['spectacle', 'detail', id.toString()],
    `/api/spectacles/${id}`,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes pour les détails
      gcTime: 30 * 60 * 1000,    // 30 minutes en cache
    }
  );
}

// 🎨 Hook pour les artistes
export function useArtistsQuery() {
  return useOptimizedQuery(
    ['artists', 'list'],
    '/api/artistes',
    {
      staleTime: 15 * 60 * 1000, // 15 minutes pour les artistes
      gcTime: 60 * 60 * 1000,    // 1 heure en cache
    }
  );
}

// 🏢 Hook pour les images du lieu
export function useVenueImagesQuery() {
  return useOptimizedQuery(
    ['venue', 'images'],
    '/api/lieu/images',
    {
      staleTime: 30 * 60 * 1000, // 30 minutes pour les images
      gcTime: 2 * 60 * 60 * 1000, // 2 heures en cache
    }
  );
}
