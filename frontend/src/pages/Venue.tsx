
import Header from "../components/Header";
import Footer from "../components/Footer";
import CTA from "../components/CTA";
import React, { useEffect, useState } from "react";
import { fetchGalleryLieuImages, LieuImage } from "../services/lieu";
import { buildImgSrc, onImgErrorSwap } from "@/utils/image";

const Venue = () => {
  const [imagesList, setImages] = useState<LieuImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { api } = await import('@/services/api');
        const data: LieuImage[] = await api.get('/api/lieu/images/gallery');
        setImages(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Le lieu" />
      <main>
        {/* Hero Section */}
        <section id="hero-banner" className="relative h-[500px] w-full overflow-hidden">
          <img 
            className="absolute w-full h-full object-cover opacity-80" 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/5f3d63cee9-148001036a85859b318f.png" 
            alt="comedy club theater interior with stage lights, audience seating, moody atmospheric lighting, cinematic" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="container mx-auto px-4 md:px-8 relative h-full flex flex-col justify-end pb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-red-500 mb-4">
              Bienvenue à L'Espace Comédie
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl text-white">
              Votre destination incontournable pour des soirées de rire au cœur de la ville
            </p>
          </div>
        </section>

        {/* Bloc description courte */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                Situé en plein cœur de la ville, L'Espace Comédie vous accueille pour des soirées de rire et de découvertes humoristiques dans une ambiance conviviale et intimiste.
              </p>
              <div className="flex items-center justify-center text-red-500 text-xl">
                <i className="fa-solid fa-location-dot text-3xl mr-3"></i>
                <p className="text-lg md:text-xl">136 rue Solférino, 59800 Lille</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc galerie */}
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-red-500 mb-10 text-center">Découvrez notre espace</h2>
            {loading ? (
              <div className="text-center text-red-500">Chargement des images...</div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imagesList.map((img) => (
                  <div key={img.id} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      src={buildImgSrc('image_path', img.image_path)}
                      alt="photo du lieu"
                      onError={onImgErrorSwap}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bloc accès / transports */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-red-500 mb-8 flex items-center">
                <i className="fa-solid fa-route mr-3"></i>Comment venir ?
              </h2>
              
              <p className="text-lg mb-8 leading-relaxed">
                À deux pas du centre-ville, L'Espace Comédie est facilement accessible en transports en commun ou à pied.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-500 mb-4 flex items-center">
                    <i className="fa-solid fa-train-subway mr-2"></i>Transports en commun
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fa-solid fa-subway mt-1 mr-3 text-red-500"></i>
                      <span>Métro : République – Beaux-Arts (Ligne M1) - 6 min à pied</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-bus mt-1 mr-3 text-red-500"></i>
                      <span>Bus : L1, L5, 18, CITL (arrêts Wazemmes, Nationale, Porte de Douai)</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-train mt-1 mr-3 text-red-500"></i>
                      <span>Train : Depuis Lille Flandres/Europe via métro ou bus</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-bicycle mt-1 mr-3 text-red-500"></i>
                      <span>Vélo : Stations V'Lille à proximité</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-500 mb-4 flex items-center">
                    <i className="fa-solid fa-car mr-2"></i>En voiture
                  </h3>
                  <ul className="space-y-3">
                  <li className="flex items-start">
                      <i className="fa-solid fa-road mt-1 mr-3 text-red-500"></i>
                      <span>Stationnement payant dans les rues avoisinantes</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-parking mt-1 mr-3 text-red-500"></i>
                      <span>Parking gratuit le samedi et dimanche et en semaine à partir de 19h </span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-info-circle mt-1 mr-3 text-red-500"></i>
                      <span>Pensez à venir en avance les soirs de forte affluence</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc carte interactive */}
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-red-500 mb-8 text-center">
                <i className="fa-solid fa-map-location-dot mr-3"></i>Nous situer
              </h2>
              <div className="rounded-lg overflow-hidden h-[400px] mb-6 relative">
                <iframe
                  title="Google Map - L'Espace Comédie"
                  src="https://www.google.com/maps?q=136+rue+Solférino,+59800+Lille&output=embed"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-500 text-white font-bold px-4 py-2 rounded-full animate-pulse opacity-90">
                    L'Espace Comédie
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=136+rue+Solférino,+59800+Lille"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full flex items-center transition cursor-pointer"
                >
                  <i className="fa-solid fa-directions mr-2"></i>
                  Itinéraire depuis votre position
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc infos pratiques */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-red-500 mb-12 text-center">Infos pratiques</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-500 mb-4 flex items-center">
                    <i className="fa-solid fa-clock mr-2"></i>Horaires
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span>Ouverture</span>
                      <span>18h00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Fermeture</span>
                      <span>23h00</span>
                    </li>
                    <li className="text-red-500 text-sm mt-4">
                      Les horaires peuvent varier selon les événements
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-500 mb-4 flex items-center">
                    <i className="fa-solid fa-building-user mr-2"></i>Notre espace
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span>Accessibilité PMR</span>
                      <span>Non</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Toilette</span>
                      <span>Gratuit</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* FAQ */}
              <div className="bg-gray-900 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-red-500 mb-6 flex items-center">
                  <i className="fa-solid fa-circle-question mr-2"></i>Questions fréquentes
                </h3>
                <div className="space-y-6">
                  <div className="border-b border-gray-800 pb-4">
                    <h4 className="text-lg font-medium mb-2">Où se situe l’Espace Comédie ?</h4>
                    <p className="text-gray-300">L’Espace Comédie se trouve au 136 rue Solférino, en plein cœur de Lille. La salle se trouve au sous-sol du Jager, l’entrée se fait directement par le Jager. Un parking est à proximité pour se garer facilement.</p>
                  </div>
                  <div className="border-b border-gray-800 pb-4">
                    <h4 className="text-lg font-medium mb-2">Faut-il réserver ?</h4>
                    <p className="text-gray-300">Oui, on recommande de réserver en ligne sur notre billetterie sécurisée. Vous recevrez vos billets par e-mail, il suffira de les présenter à l’entrée (version papier ou sur téléphone). Il est parfois possible de payer sur place si des places restent disponibles.</p>
                  </div>
                  <div className="border-b border-gray-800 pb-4">
                    <h4 className="text-lg font-medium mb-2">Est-il possible de boire et/ou manger sur place ?</h4>
                    <p className="text-gray-300">Oui ! A l’Espace Comédie vous pouvez profiter de boissons et de planches apéritives pendant, avant ou après les spectacles. Les boissons sont servies et facturées exclusivement par le Jager, titulaire de la licence IV.</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium mb-2">L’Espace Comédie est-il accessible aux personnes à mobilité réduite (PMR) ?</h4>
                    <p className="text-gray-300">Notre salle se situe au sous-sol, sans ascenseur. L’accès peut donc être difficile pour certaines personnes à mobilité réduite. Nous avons déjà accueilli des spectateurs en fauteuil, aidés par notre équipe pour descendre les escaliers. Si vous êtes concerné, n’hésitez pas à nous contacter en amont afin que nous puissions vous accompagner dans les meilleures conditions possibles.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

       {/* Témoignages
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-red-500 mb-10 text-center">Ce qu'en disent nos spectateurs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-black p-6 rounded-lg">
                <div className="text-red-500 mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="italic mb-4">"Une salle à taille humaine qui permet une véritable proximité avec les artistes. On s'y sent comme chez soi !"</p>
                <p className="text-red-500 font-medium">Marie T.</p>
              </div>
              
              <div className="bg-black p-6 rounded-lg">
                <div className="text-red-500 mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="italic mb-4">"Le bar est super sympa, parfait pour prolonger la soirée après le spectacle et discuter avec d'autres spectateurs."</p>
                <p className="text-red-500 font-medium">Thomas B.</p>
              </div>
              
              <div className="bg-black p-6 rounded-lg">
                <div className="text-red-500 mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star-half-alt"></i>
                </div>
                <p className="italic mb-4">"Facile d'accès, une programmation variée et des découvertes à chaque fois. Un incontournable !"</p>
                <p className="text-red-500 font-medium">Sophie M.</p>
              </div>
            </div>
          </div>
        </section> */}

        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Venue;
