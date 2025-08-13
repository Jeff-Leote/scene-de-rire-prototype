import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { validateTicket } from '../services/reservation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Clock, User, MapPin, Calendar, Ticket } from 'lucide-react';

interface TicketValidationResponse {
  valid: boolean;
  message?: string;
  error?: string;
  reservation?: {
    id: number;
    spectacle_title: string;
    date_spectacle: string;
    heure_spectacle: string;
    lieu: string;
    nb_places: number;
    user_nom: string;
    user_prenom: string;
    artiste_name?: string;
    prix?: number;
    montant_paye?: number;
  };
}

const ValidateTicket: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const [validation, setValidation] = useState<TicketValidationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reservationId) {
      validateTicketData(reservationId);
    }
  }, [reservationId]);

  const validateTicketData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await validateTicket(id);
      setValidation(result);
    } catch (err) {
      setError('Erreur lors de la validation du ticket');
      console.error('Erreur de validation:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // Format HH:MM
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validation du ticket en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.history.back()}>
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {validation.valid ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {validation.valid ? 'Ticket Valide' : 'Ticket Invalide'}
            </CardTitle>
            <Badge 
              variant={validation.valid ? "default" : "destructive"}
              className="mt-2"
            >
              {validation.valid ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ'}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {validation.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{validation.error}</p>
              </div>
            )}

            {validation.message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">{validation.message}</p>
              </div>
            )}

            {validation.reservation && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <Ticket className="h-5 w-5 mr-2" />
                    Détails du spectacle
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      {validation.reservation.spectacle_title}
                    </p>
                    {validation.reservation.artiste_name && (
                      <p className="text-gray-600">
                        Artiste: {validation.reservation.artiste_name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium text-blue-900">Date</span>
                    </div>
                    <p className="text-blue-800">
                      {formatDate(validation.reservation.date_spectacle)}
                    </p>
                    <p className="text-blue-600 text-sm">
                      {formatTime(validation.reservation.heure_spectacle)}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium text-green-900">Lieu</span>
                    </div>
                    <p className="text-green-800">{validation.reservation.lieu}</p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-medium text-purple-900">Réservé par</span>
                    </div>
                    <p className="text-purple-800">
                      {validation.reservation.user_prenom} {validation.reservation.user_nom}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Ticket className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="font-medium text-orange-900">Places</span>
                    </div>
                    <p className="text-orange-800">
                      {validation.reservation.nb_places} place(s)
                    </p>
                    {validation.reservation.montant_paye && (
                      <p className="text-orange-600 text-sm">
                        {validation.reservation.montant_paye}€ payé(s)
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="font-medium text-gray-900">Informations</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    ID de réservation: {validation.reservation.id}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Validé le: {new Date().toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="mr-2"
              >
                Retour
              </Button>
              {validation.valid && (
                <Button 
                  onClick={() => window.print()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Imprimer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidateTicket;
