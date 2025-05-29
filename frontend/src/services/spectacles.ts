// src/services/spectacleService.ts
export interface Spectacle {
  id: number;
  title: string;
  img: string;
  description: string;
  date: string;
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
