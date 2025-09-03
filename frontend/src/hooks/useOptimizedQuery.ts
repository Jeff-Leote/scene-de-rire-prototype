import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { api } from '@/services/api';

// 🚀 Hook optimisé pour les requêtes avec cache intelligent et fallbacks
export function useOptimizedQuery<TData>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<TData> => {
      try {
        return await api.get<TData>(endpoint);
      } catch (error) {
        console.error(`❌ Erreur API pour ${endpoint}:`, error);
        throw error;
      }
    },
    // ⚡ OPTIMISATIONS AGGRESSIVES POUR LA PRODUCTION
    staleTime: 10 * 60 * 1000, // 10 minutes - données considérées fraîches
    gcTime: 30 * 60 * 1000,    // 30 minutes - garder en cache plus longtemps
    retry: 3,                   // 3 tentatives en cas d'échec
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10s
    refetchOnWindowFocus: false, // Ne pas refetch automatiquement
    refetchOnMount: false,       // Ne pas refetch au montage si en cache
    refetchOnReconnect: false,   // Ne pas refetch à la reconnexion
    
    // 🎯 FALLBACKS POUR ÉVITER LES COMPOSANTS VIDES
    placeholderData: (previousData) => previousData, // Garder les anciennes données
    initialData: undefined,      // Pas de données initiales
    
    ...options
  });
}

// 🎯 Hook spécialisé pour les spectacles avec cache ultra-optimisé
export function useSpectaclesQuery(page: number = 1, limit: number = 9) {
  return useOptimizedQuery(
    ['spectacles', 'list', page.toString(), limit.toString()],
    `/api/spectacles?page=${page}&limit=${limit}`,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes pour les spectacles
      gcTime: 15 * 60 * 1000,   // 15 minutes en cache
      retry: 5,                  // 5 tentatives pour les spectacles
      // 🛡️ Fallback pour éviter les composants vides
      placeholderData: (previousData: any) => {
        if (previousData) return previousData;
        // Retourner un tableau vide si pas de données précédentes
        return { spectacles: [], pagination: { total: 0 } };
      }
    }
  );
}

// 🎭 Hook pour les détails d'un spectacle avec cache long
export function useSpectacleQuery(id: string | number) {
  return useOptimizedQuery(
    ['spectacle', 'detail', id.toString()],
    `/api/spectacles/${id}`,
    {
      staleTime: 15 * 60 * 1000, // 15 minutes pour les détails
      gcTime: 60 * 60 * 1000,    // 1 heure en cache
      retry: 3,                   // 3 tentatives
      // 🛡️ Fallback pour éviter les composants vides
      placeholderData: (previousData: any) => previousData
    }
  );
}

// 🎨 Hook pour les artistes avec cache très long
export function useArtistsQuery() {
  return useOptimizedQuery(
    ['artists', 'list'],
    '/api/artistes',
    {
      staleTime: 30 * 60 * 1000, // 30 minutes pour les artistes
      gcTime: 2 * 60 * 60 * 1000, // 2 heures en cache
      retry: 3,                   // 3 tentatives
      // 🛡️ Fallback pour éviter les composants vides
      placeholderData: (previousData: any) => {
        if (previousData) return previousData;
        // Retourner un tableau vide si pas de données précédentes
        return [];
      }
    }
  );
}

// 🏢 Hook pour les images du lieu avec cache ultra-long
export function useVenueImagesQuery() {
  return useOptimizedQuery(
    ['venue', 'images'],
    '/api/lieu/images',
    {
      staleTime: 60 * 60 * 1000, // 1 heure pour les images
      gcTime: 4 * 60 * 60 * 1000, // 4 heures en cache
      retry: 2,                   // 2 tentatives seulement
      // 🛡️ Fallback pour éviter les composants vides
      placeholderData: (previousData: any) => {
        if (previousData) return previousData;
        // Retourner un tableau vide si pas de données précédentes
        return [];
      }
    }
  );
}

// 🚀 Hook pour les spectacles à venir (page d'accueil)
export function useUpcomingShowsQuery() {
  return useOptimizedQuery(
    ['spectacles', 'upcoming'],
    '/api/spectacles/upcoming',
    {
      staleTime: 2 * 60 * 1000,  // 2 minutes pour les spectacles à venir
      gcTime: 10 * 60 * 1000,    // 10 minutes en cache
      retry: 5,                   // 5 tentatives (critique pour la page d'accueil)
      // 🛡️ Fallback pour éviter les composants vides
      placeholderData: (previousData: any) => {
        if (previousData) return previousData;
        // Retourner un tableau vide si pas de données précédentes
        return [];
      }
    }
  );
}

// 🎭 Hook pour l'artiste à l'affiche
export function useFeaturedArtistQuery() {
  return useOptimizedQuery(
    ['artist', 'featured'],
    '/api/artistes/featured',
    {
      staleTime: 5 * 60 * 1000,  // 5 minutes pour l'artiste à l'affiche
      gcTime: 15 * 60 * 1000,    // 15 minutes en cache
      retry: 5,                   // 5 tentatives (critique pour la page d'accueil)
      // 🛡️ Fallback pour éviter les composants vides
      placeholderData: (previousData: any) => {
        if (previousData) return previousData;
        // Retourner null si pas de données précédentes
        return null;
      }
    }
  );
}

// 🛡️ Hook de sécurité avec données par défaut
export function useSafeQuery<TData>(
  queryKey: string[],
  endpoint: string,
  fallbackData: TData,
  options?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, Error> {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<TData> => {
      try {
        return await api.get<TData>(endpoint);
      } catch (error) {
        console.warn(`⚠️ Erreur API pour ${endpoint}, utilisation des données par défaut:`, error);
        // Retourner les données par défaut en cas d'erreur
        return fallbackData;
      }
    },
    // ⚡ Optimisations de base
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1, // Une seule tentative puis fallback
    
    ...options
  });
}
