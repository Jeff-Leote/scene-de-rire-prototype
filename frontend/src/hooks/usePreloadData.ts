import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

/**
 * 🚀 Hook de préchargement global des données critiques
 * Précharge toutes les données importantes au démarrage pour éviter les composants vides
 */
export function usePreloadData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const preloadCriticalData = async () => {
      console.log('🚀 Préchargement des données critiques...');
      
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
            return { success: true, queryKey: query.queryKey };
          } catch (error) {
            console.warn(`⚠️ Échec préchargement: ${query.queryKey.join(' -> ')}`, error);
            return { success: false, queryKey: query.queryKey, error };
          }
        });

        const results = await Promise.allSettled(preloadPromises);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
        const total = results.length;
        
        console.log(`🎯 Préchargement terminé: ${successful}/${total} succès`);
        
        if (successful === total) {
          console.log('🚀 Toutes les données critiques sont préchargées !');
        } else {
          console.warn('⚠️ Certaines données n\'ont pas pu être préchargées');
        }
        
      } catch (error) {
        console.error('❌ Erreur lors du préchargement:', error);
      }
    };

    // Précharger immédiatement
    preloadCriticalData();
    
    // Précharger aussi après un délai pour s'assurer que tout est chargé
    const delayedPreload = setTimeout(preloadCriticalData, 2000);
    
    return () => clearTimeout(delayedPreload);
  }, [queryClient]);
}

/**
 * 🎯 Hook de préchargement spécifique pour une route
 */
export function usePreloadRouteData(route: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const preloadRouteData = async () => {
      console.log(`🚀 Préchargement des données pour la route: ${route}`);
      
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
      }
    };

    preloadRouteData();
  }, [route, queryClient]);
}
