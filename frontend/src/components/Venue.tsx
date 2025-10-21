import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LieuImage } from "../services/lieu";
import { buildImgSrc, onImgErrorSwap } from "@/utils/image";
import OptimizedImage from "./OptimizedImage";

const Venue = () => {
  const navigate = useNavigate();
  const [mainImage, setMainImage] = useState<LieuImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMainImage = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/lieu/images/main`);
        if (!res.ok) throw new Error("Erreur lors du chargement de l'image principale du lieu");
        const data: LieuImage | null = await res.json();
        setMainImage(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchMainImage();
  }, []);

  return (
    <section id="venue" className="bg-gray-950 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-white mb-6">Notre salle</h2>
            <p className="text-gray-300 mb-6">
              En plein cœur de Lille, notre salle propose une ambiance conviviale et chaleureuse pour profiter des meilleurs humoristes dans d’excellentes conditions. Grâce à une acoustique soignée et une visibilité optimale depuis chaque place, chaque spectacle devient un moment unique.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <i className="fa-solid fa-chair text-red-500 mr-3 text-xl"></i>
                <span className="text-white">70 places assises</span>
              </div>
              <div className="flex items-center">
                <i className="fa-solid fa-martini-glass text-red-500 mr-3 text-xl"></i>
                <span className="text-white">Café - Théatre</span>
              </div>
              <div className="flex items-center">
                <i className="fa-solid fa-car text-red-500 mr-3 text-xl"></i>
                <span className="text-white">Parking à proximité</span>
              </div>
            </div>

            <span
              className="inline-block bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition duration-300 mt-4 cursor-pointer"
              onClick={() => navigate("/le-lieu")}
            >
              Comment s'y rendre
            </span>
          </div>

          <div className="md:w-1/2">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-red-500">
                  Chargement...
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center text-red-400">
                  {error}
                </div>
              ) : mainImage ? (
                <OptimizedImage
                  category="image_path"
                  filename={(mainImage.image_path || '').replace(/\.(jpe?g)$/i, '.webp')}
                  alt="comedy club interior"
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  width={1024}
                  height={768}
                  quality={75}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Aucune image principale
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                  Ouverture des portes 1 heure avant le spectacle
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Venue;
