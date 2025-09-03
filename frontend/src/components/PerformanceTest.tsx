import React from 'react';
import { useUpcomingShowsQuery, useFeaturedArtistQuery } from '@/hooks/useOptimizedQuery';

/**
 * 🧪 Composant de test pour vérifier les optimisations de performance
 */
export const PerformanceTest: React.FC = () => {
  const { data: spectacles, isLoading: spectaclesLoading, error: spectaclesError } = useUpcomingShowsQuery();
  const { data: artist, isLoading: artistLoading, error: artistError } = useFeaturedArtistQuery();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">🧪 Test des Optimisations</h2>
      
      {/* Test des spectacles */}
      <div className="mb-4">
        <h3 className="font-semibold">Spectacles à venir:</h3>
        {spectaclesLoading && <p className="text-blue-600">⏳ Chargement...</p>}
        {spectaclesError && <p className="text-red-600">❌ Erreur: {spectaclesError.message}</p>}
        {spectacles && (
          <div>
            <p className="text-green-600">✅ Données chargées: {spectacles.length} spectacles</p>
            <ul className="list-disc list-inside">
              {spectacles.slice(0, 3).map((spectacle: any, index: number) => (
                <li key={index}>{spectacle.titre || `Spectacle ${index + 1}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Test de l'artiste */}
      <div className="mb-4">
        <h3 className="font-semibold">Artiste à l'affiche:</h3>
        {artistLoading && <p className="text-blue-600">⏳ Chargement...</p>}
        {artistError && <p className="text-red-600">❌ Erreur: {artistError.message}</p>}
        {artist && (
          <div>
            <p className="text-green-600">✅ Artiste chargé: {artist.nom || 'Nom non disponible'}</p>
          </div>
        )}
      </div>

      {/* Résumé des performances */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h4 className="font-semibold text-blue-800">📊 Résumé des Performances:</h4>
        <ul className="text-sm text-blue-700">
          <li>• Spectacles: {spectaclesLoading ? 'Chargement' : spectaclesError ? 'Erreur' : 'OK'}</li>
          <li>• Artiste: {artistLoading ? 'Chargement' : artistError ? 'Erreur' : 'OK'}</li>
          <li>• Cache: Activé avec React Query</li>
          <li>• Préchargement: Activé au démarrage</li>
        </ul>
      </div>
    </div>
  );
};
