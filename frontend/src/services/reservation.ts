import { PaymentStatusResponse } from './types';

export async function createReservationCheckout(data: {
  spectacles: {
    id: number;
    billets: number;
  }[];
  prenom?: string;
  nom?: string;
  email?: string;
  promoCode?: {
    id: number;
    code: string;
    type: 'percentage' | 'fixed' | 'free_ticket';
    value: number;
  } | null;
}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com'}/api/reservations/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur API");
  return await res.json();
}

export async function checkPaymentStatus(sessionId: string): Promise<PaymentStatusResponse> {
  console.log('🔍 Vérification du statut de paiement pour session:', sessionId);
  
  const url = `${import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com'}/api/reservations/status/${sessionId}`;
  console.log('🌐 URL de l\'API:', url);
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    console.log('📡 Statut de la réponse:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Erreur API:', errorText);
      throw new Error(`Erreur API: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Données reçues:', data);
    return data;
  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error);
    throw error;
  }
}

export async function getUserReservations(userId: number) {
const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com'}/api/reservations/user/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Erreur API");
  return await res.json();
}

// Nouvelle fonction pour récupérer le QR code d'une réservation
export async function getReservationQRCode(reservationId: number, token?: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com'}/api/reservations/${reservationId}/qrcode`, {
    method: "GET",
    headers,
  });
  
  if (!res.ok) throw new Error("Erreur lors de la récupération du QR code");
  return await res.blob();
}

// Nouvelle fonction pour vérifier la disponibilité d'un spectacle
export async function checkSpectacleAvailability(spectacleId: number) {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com'}/api/reservations/availability/${spectacleId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) throw new Error("Erreur lors de la vérification de la disponibilité");
  return await res.json();
}

// Fonction pour valider un ticket
export async function validateTicket(reservationId: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com'}/api/reservations/validate/${reservationId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) throw new Error("Erreur lors de la validation du ticket");
  return await res.json();
}

// Fonction pour générer des QR codes pour les réservations existantes


