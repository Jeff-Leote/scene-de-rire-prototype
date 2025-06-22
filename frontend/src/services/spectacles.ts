// src/services/spectacleService.ts
export interface Spectacle {
  id: number;
  title: string;
  img: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  lieu: string;
  artiste_id: number;
  artiste_name: string;
  artiste_photo: string;
}

export const getSpectacles = async (): Promise<Spectacle[]> => {
  const response = await fetch("http://localhost:5000/api/spectacles");
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des spectacles");
  }
  return response.json();
};

const API_URL = "http://localhost:5000/api";

export async function fetchSpectacles() {
  const res = await fetch(`${API_URL}/spectacles/all`);
  if (!res.ok) throw new Error("Erreur lors du chargement des spectacles");
  return await res.json();
}

export async function fetchSpectacleById(id: number) {
  const res = await fetch(`${API_URL}/spectacles/${id}`);
  if (!res.ok) throw new Error("Erreur lors du chargement du spectacle");
  return await res.json();
}
