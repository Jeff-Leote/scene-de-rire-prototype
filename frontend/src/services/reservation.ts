export async function createReservationCheckout(data: {
  spectacles: {
    id: number;
    billets: number;
  }[];
  prenom?: string;
  nom?: string;
  email?: string;
}) {
  const res = await fetch("/api/reservations/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur API");
  return await res.json();
} 