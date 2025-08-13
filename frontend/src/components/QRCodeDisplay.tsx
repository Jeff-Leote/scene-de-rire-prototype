import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { QRCodeDisplayProps } from '@/services/types';
import QRCode from 'qrcode';

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  reservationId,
  qrCodePath,
  spectacleTitle,
  dateSpectacle,
  heureSpectacle,
  nbPlaces
}) => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Générer le QR code automatiquement avec les données de validation
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Créer les données de validation du ticket
        const ticketData = {
          reservation_id: reservationId,
          spectacle_title: spectacleTitle,
          date_spectacle: dateSpectacle,
          heure_spectacle: heureSpectacle,
          nb_places: nbPlaces,
          type: "ticket_validation",
          timestamp: new Date().toISOString()
        };

        // Générer le QR code avec les données JSON
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrCodeUrl(qrDataUrl);
      } catch (err) {
        console.error('Erreur lors de la génération du QR code:', err);
        setError("Erreur lors de la génération du QR code");
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [reservationId, spectacleTitle, dateSpectacle, heureSpectacle, nbPlaces]);

  const handleDownloadQR = async () => {
    if (!qrCodeUrl) {
      setError("QR code non disponible");
      return;
    }

    try {
      // Convertir le data URL en blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket_reservation_${reservationId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          QR Code - Réservation #{reservationId}
        </h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {nbPlaces} place{nbPlaces > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Spectacle</p>
          <p className="text-gray-900">{spectacleTitle}</p>
        </div>
        <div className="flex space-x-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Date</p>
            <p className="text-gray-900">{new Date(dateSpectacle).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Heure</p>
            <p className="text-gray-900">{heureSpectacle}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code pour la réservation ${reservationId}`}
              className="mx-auto max-w-48 h-auto"
              onError={() => setError("Impossible de charger le QR code")}
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDownloadQR}
          disabled={isLoading || !qrCodeUrl}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Génération...' : 'Télécharger QR Code'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-sm">
          <strong>Info :</strong> Ce QR code contient les informations de votre ticket. 
          Il peut être scanné pour vérifier la validité de votre réservation.
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
