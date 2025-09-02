// src/services/spectacleService.ts
import { Spectacle } from './types';
import { api } from './api';

export const getSpectacles = async (): Promise<Spectacle[]> => {
  return api.get<Spectacle[]>('/api/spectacles');
};

export async function fetchSpectacles() {
  return api.get<Spectacle[]>('/api/spectacles/all');
}

export async function fetchSpectacleById(id: number) {
  return api.get<Spectacle>(`/api/spectacles/${id}`);
}
