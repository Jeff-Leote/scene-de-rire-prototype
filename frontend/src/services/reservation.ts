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

const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur API");
  return await res.json();
}

export async function checkPaymentStatus(sessionId: string): Promise<PaymentStatusResponse> {
const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations/status/${sessionId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Erreur API");
  return await res.json();
}

export async function getUserReservations(userId: number) {
const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reservations/user/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Erreur API");
  return await res.json();
} 