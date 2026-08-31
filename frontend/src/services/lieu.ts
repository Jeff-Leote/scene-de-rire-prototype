import { api } from './api';

export type LieuImage = {
  id: number;
  image_path: string;
  is_main: boolean;
};

export async function fetchMainLieuImage(): Promise<LieuImage | null> {
  return api.get<LieuImage>('/api/lieu/images/main');
}

export async function fetchGalleryLieuImages(): Promise<LieuImage[]> {
  return api.get<LieuImage[]>('/api/lieu/images/gallery');
}

export async function fetchAllLieuImages(): Promise<LieuImage[]> {
  return api.get<LieuImage[]>('/api/lieu/images');
}
