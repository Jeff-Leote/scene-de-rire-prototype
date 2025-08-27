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
  const [qrCodeUrls, setQrCodeUrls] = useState<string[]>([]);

  // Générer un QR code par place
  useEffect(() => {
    const generateQRCodes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const urls: string[] = [];
        const places = Math.max(1, Number(nbPlaces) || 1);
        for (let index = 1; index <= places; index++) {
          const ticketData = {
            reservation_id: reservationId,
            ticket_index: index,
            spectacle_title: spectacleTitle,
            date_spectacle: dateSpectacle,
            heure_spectacle: heureSpectacle,
            type: 'ticket_validation',
            timestamp: new Date().toISOString(),
          };

          const qrDataUrl = await QRCode.toDataURL(JSON.stringify(ticketData), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' },
          });
          urls.push(qrDataUrl);
        }

        setQrCodeUrls(urls);
      } catch (err) {
        console.error('Erreur lors de la génération des QR codes:', err);
        setError('Erreur lors de la génération des QR codes');
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCodes();
  }, [reservationId, spectacleTitle, dateSpectacle, heureSpectacle, nbPlaces]);

  const handleDownloadQR = async (url: string, index: number) => {
    if (!url) {
      setError('QR code non disponible');
      return;
    }
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `ticket_reservation_${reservationId}_#${index}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">QR Codes - Réservation #{reservationId}</h3>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {qrCodeUrls.map((url, idx) => (
            <div key={idx} className="text-center">
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <img
                  src={url}
                  alt={`QR Code ${idx + 1} pour la réservation ${reservationId}`}
                  className="mx-auto max-w-48 h-auto"
                  onError={() => setError('Impossible de charger le QR code')}
                />
              </div>
              <button
                onClick={() => handleDownloadQR(url, idx + 1)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Télécharger QR #{idx + 1}
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-sm">
          <strong>Info :</strong> Chaque QR correspond à une place. Présentez un QR par personne à l'entrée.
        </p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
