export type LieuImage = {
  id: number;
  image_path: string;
  is_main: boolean;
};

export async function fetchMainLieuImage(): Promise<LieuImage | null> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/api/lieu/images/main`);
  if (!res.ok) throw new Error("Erreur lors de la récupération de l'image principale du lieu");
  return await res.json();
}

export async function fetchGalleryLieuImages(): Promise<LieuImage[]> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/api/lieu/images/gallery`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des images de galerie du lieu");
  return await res.json();
}

export async function fetchAllLieuImages(): Promise<LieuImage[]> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/api/lieu/images`);
  if (!res.ok) throw new Error("Erreur lors de la récupération de toutes les images du lieu");
  return await res.json();
} 