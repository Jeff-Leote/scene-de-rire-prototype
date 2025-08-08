// src/services/spectacleService.ts
import { Spectacle } from './types';

export const getSpectacles = async (): Promise<Spectacle[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/spectacles`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des spectacles");
  }
  return response.json();
};

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchSpectacles() {
  const res = await fetch(`${API_URL}/api/spectacles/all`);
  if (!res.ok) throw new Error("Erreur lors du chargement des spectacles");
  return await res.json();
}

export async function fetchSpectacleById(id: number) {
  const res = await fetch(`${API_URL}/api/spectacles/${id}`);
  if (!res.ok) throw new Error("Erreur lors du chargement du spectacle");
  return await res.json();
}
