import { PaymentStatusResponse } from './types';

export async function createReservationCheckout(data: {
  spectacles: {
    id: number;
    billets: number;
  }[];
  prenom?: string;
  nom?: string;
  email?: string;
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


