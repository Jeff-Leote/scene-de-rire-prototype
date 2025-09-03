import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

/**
 * 🚀 Hook de préchargement global des données critiques
 * Précharge toutes les données importantes au démarrage pour éviter les composants vides
 * Version améliorée qui ne casse pas l'affichage
 */
export function usePreloadData() {
  const queryClient = useQueryClient();
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadStatus, setPreloadStatus] = useState<{
    success: number;
    failed: number;
    total: number;
  }>({ success: 0, failed: 0, total: 0 });

  useEffect(() => {
    const preloadCriticalData = async () => {
      console.log('🚀 Préchargement des données critiques...');
      setIsPreloading(true);
      
      try {
        // 🎭 Données critiques pour la page d'accueil
        const criticalQueries = [
          // Spectacles à venir (page d'accueil)
          {
            queryKey: ['spectacles', 'upcoming'],
            endpoint: '/api/spectacles/upcoming',
            staleTime: 2 * 60 * 1000,
            gcTime: 10 * 60 * 1000
          },
          // Artiste à l'affiche
          {
            queryKey: ['artist', 'featured'],
            endpoint: '/api/artistes/featured',
            staleTime: 5 * 60 * 1000,
            gcTime: 15 * 60 * 1000
          },
          // Images du lieu (gallery)
          {
            queryKey: ['venue', 'images'],
            endpoint: '/api/lieu/images',
            staleTime: 60 * 60 * 1000,
            gcTime: 4 * 60 * 60 * 1000
          },
          // Liste des spectacles (première page)
          {
            queryKey: ['spectacles', 'list', '1', '9'],
            endpoint: '/api/spectacles?page=1&limit=9',
            staleTime: 5 * 60 * 1000,
            gcTime: 15 * 60 * 1000
          }
        ];

        let successCount = 0;
        let failedCount = 0;

        // Précharger toutes les données critiques en parallèle
        const preloadPromises = criticalQueries.map(async (query) => {
          try {
            const data = await api.get(query.endpoint);
            
            // Mettre en cache avec les bonnes options
            queryClient.setQueryData(query.queryKey, data);
            
            // Précharger dans le cache React Query
            queryClient.prefetchQuery({
              queryKey: query.queryKey,
              queryFn: () => Promise.resolve(data),
              staleTime: query.staleTime,
              gcTime: query.gcTime
            });
            
            console.log(`✅ Préchargé: ${query.queryKey.join(' -> ')}`);
            successCount++;
            return { success: true, queryKey: query.queryKey };
          } catch (error) {
            console.warn(`⚠️ Échec préchargement: ${query.queryKey.join(' -> ')}`, error);
            failedCount++;
            return { success: false, queryKey: query.queryKey, error };
          }
        });

        const results = await Promise.allSettled(preloadPromises);
        
        setPreloadStatus({
          success: successCount,
          failed: failedCount,
          total: criticalQueries.length
        });
        
        console.log(`🎯 Préchargement terminé: ${successCount}/${criticalQueries.length} succès`);
        
        if (successCount === criticalQueries.length) {
          console.log('🚀 Toutes les données critiques sont préchargées !');
        } else {
          console.warn('⚠️ Certaines données n\'ont pas pu être préchargées, mais l\'app continuera de fonctionner');
        }
        
      } catch (error) {
        console.error('❌ Erreur lors du préchargement:', error);
        // Ne pas casser l'application en cas d'erreur
      } finally {
        setIsPreloading(false);
      }
    };

    // Précharger immédiatement
    preloadCriticalData();
    
    // Précharger aussi après un délai pour s'assurer que tout est chargé
    const delayedPreload = setTimeout(preloadCriticalData, 3000);
    
    return () => clearTimeout(delayedPreload);
  }, [queryClient]);

  return { isPreloading, preloadStatus };
}

/**
 * 🎯 Hook de préchargement spécifique pour une route
 * Version améliorée qui ne casse pas l'affichage
 */
export function usePreloadRouteData(route: string) {
  const queryClient = useQueryClient();
  const [isRoutePreloading, setIsRoutePreloading] = useState(false);

  useEffect(() => {
    const preloadRouteData = async () => {
      console.log(`🚀 Préchargement des données pour la route: ${route}`);
      setIsRoutePreloading(true);
      
      try {
        switch (route) {
          case '/spectacles':
            // Précharger la liste des spectacles
            await queryClient.prefetchQuery({
              queryKey: ['spectacles', 'list', '1', '9'],
              queryFn: () => api.get('/api/spectacles?page=1&limit=9'),
              staleTime: 5 * 60 * 1000,
              gcTime: 15 * 60 * 1000
            });
            break;
            
          case '/artistes':
            // Précharger la liste des artistes
            await queryClient.prefetchQuery({
              queryKey: ['artists', 'list'],
              queryFn: () => api.get('/api/artistes'),
              staleTime: 30 * 60 * 1000,
              gcTime: 2 * 60 * 60 * 1000
            });
            break;
            
          case '/le-lieu':
            // Précharger les images du lieu
            await queryClient.prefetchQuery({
              queryKey: ['venue', 'images'],
              queryFn: () => api.get('/api/lieu/images'),
              staleTime: 60 * 60 * 1000,
              gcTime: 4 * 60 * 60 * 1000
            });
            break;
        }
        
        console.log(`✅ Préchargement route ${route} terminé`);
      } catch (error) {
        console.warn(`⚠️ Échec préchargement route ${route}:`, error);
        // Ne pas casser l'affichage en cas d'erreur
      } finally {
        setIsRoutePreloading(false);
      }
    };

    preloadRouteData();
  }, [route, queryClient]);

  return { isRoutePreloading };
}

/**
 * 🛡️ Hook de sécurité pour éviter les composants vides
 * Fournit des données par défaut si le préchargement échoue
 */
export function useSafeData<T>(
  queryKey: string[],
  endpoint: string,
  fallbackData?: T
) {
  const queryClient = useQueryClient();
  
  // Essayer de récupérer les données du cache
  const cachedData = queryClient.getQueryData(queryKey);
  
  if (cachedData) {
    return { data: cachedData, isLoading: false, error: null };
  }
  
  // Si pas de cache, retourner les données par défaut
  return { 
    data: fallbackData || null, 
    isLoading: false, 
    error: null 
  };
}
