import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/sonner";
import { Spectacle, SponsoriseData, AdditionalPhoto } from "../services/types";
import { getSpectacles } from "@/services/spectacles";
import { api } from "@/services/api";

// Les types sont désormais centralisés dans services/types.ts

const Sponsorise = () => {
  const { slug } = useParams();
  const [data, setData] = useState<SponsoriseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extraPhotos, setExtraPhotos] = useState<AdditionalPhoto[]>([]);

  // Données des spectacles sponsorisés (fallback local)
  const sponsoriseData: Record<string, SponsoriseData> = {
    'tchatcheur-comedy-club': {
      title: 'Tchatcheur Comedy Club',
      img: '/assets/img/spectacles/Tchatcheur comedy club.webp',
      description: 'Premier Comedy Club de stand-up à Lille, qui depuis 2017 a vu défiler des stars de l\'humour comme Paul Mirabel, Ilyes Djadel, Fanny Ruwet...\n\nVéritable révélateur de talents, depuis sa création en 2017, le Tchatcheur comedy club est le temple du stand up à Lille. On ne compte plus les nombreuses stars de l\'humour actuelles qui sont venues fouler notre scène. A chaque séance plusieurs humoristes se succèdent : certains sont connus, d\'autres n\'attendent qu\'à se faire connaître, mais une chose est sûre : ils sont tous talentueux et vous feront rire aux éclats !.\n\nIls ont déjà joué au Tchatcheur comedy club : Paul Mirabel, Inès Reg, Ilyes Djadel, Fanny Ruwet, David Voinson, Lilia Benchabane, Nordine Ganso, Tareek, Amine Radi, Mahé etc. .\n\nÀ savoir :\n- Le billet comporte une consommation incluse. \n- Durée du spectcale : 70 minutes. \n- Toutes les séances sont en libre participation pour rémunérer les artistes (espèces, Lydia ou PayPal), les artistes ne sont rémunérés que par le public à la fin du spectacle.\n- Les séances du Tchatcheur Comedy Club proposent entre 5 et 7 humoristes par séance, qui changent à chaque fois. Nous ne divulguons pas le nom des artistes programmés, préférant laisser la surprise au public de les découvrir le jour J.\n- La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.\n- Vous avez la possibilité de consommer des planches apéritives sur place, pendant, avant ou après le spectacle.',
      schedule: ' les lundis, mardis, mercredis, vendredis 20h, les samedis 17h30, 19h00 et 20h30.',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/tchatcheur-comedy-club1',
      videoUrl: 'https://youtu.be/bjQdOh830G4'
    },
    'un-ado-peut-en-cacher-un-autre': {
      title: 'Un Ado peut en cacher un autre',
      img: '/assets/img/spectacles/Un Ado peut en cacher un autre.webp',
      description: 'Marina vit seule. Enfin presque seule. Elle est accompagnée de Sandro, son seul et unique enfant qui entre dans l\'adolescence.\nMarina a du mal avec ce gamin. Tout ce qu\'il regarde, tout ce qu\'il écoute, tout ce qui l\'intéresse lui semble incohérent et sans intérêt. Les ados n\'étaient pas comme ça de son temps. Selon elle, ils étaient bien plus raisonnables et sérieux...\n\nSauf qu\'un jour Sandro est projeté de l\'autre côté du miroir. Il se retrouve au début des années 90, avec sa mère... Redevenue adolescente. Et elle était loin d\'être si raisonnable qu\'elle le disait...\n\nAttention toute ressemblance avec des personnages existants ou ayant existé serait purement fortuites.\n\nA savoir :\n . Durée du spectcale : 70 minutes\n . A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n . La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.',
      schedule: 'Le dimanche à 17h00',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/un-ado-peut-en-cacher-un-autre18'
    },
    'cheri-je-tai-trompe': {
      title: 'Chéri je t\'ai trompé (et c\'est pas ça le pire...)',
      img: '/assets/img/spectacles/Chéri je t\'ai trompé (et c\'est pas ça le pire...).webp',
      description: 'Un fonctionnaire raciste va vivre le pire cauchemar de sa vie : sa conjointe le trompe avec un sans-papiers...\nÉric, un haut fonctionnaire raciste va vivre le pire cauchemar de sa vie lorsqu\'il va découvrir que sa conjointe, Eva, le trompe avec Lahcen, un sans-papiers maghrébin embauché pour faire des travaux dans leur appartement. \n\nRésultat : une comédie déjantée, une situation hilarante, beaucoup de rire mais aussi un suspens et des rebondissements incroyables. \n\nLe saviez-vous ?\nUne comédie qui a déjà cumulé plus de 500 000 spectateurs. \nChéri je t\'ai trompé a reçu plusieurs prix, et est actuellement en tournée dans toute la France. \nGrand succès au Festival d\'Avignon.\n\nA savoir : \n. Durée du spectcale : 75 minutes \n. A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.\n. La salle est parfaitement climatisée, afin de vous garantir une température agréable pour apprécier le show.',
      schedule: 'Le dimanche à 18h30',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/cheri-je-tai-trompe-et-cest-pas-ca-le-pire2'
    },
    'kaci-dans-la-connerie-humaine': {
      title: 'Kaci dans La connerie humaine',
      img: '/assets/img/spectacles/Kaci dans la connerie humaine.webp',
      description: 'Autant vous prévenir... Il vaut mieux aimer rire de tout pour espérer passer un bon moment dans ce spectacle.\nAvec une écriture cynique et finement provocatrice, Kaci prend un malin plaisir à aborder tous les sujets dont il n\'est pas très moral de rire... À première vue.\n\nRenversant le politiquement correct, les tabous et les bien-pensant, voici enfin un spectacle qui fait du bien là où ça fait mal !\n\nLe Saviez-vous ?\nOn a pu apercevoir Kaci en première partie d\'Ahmed Sylla. Kaci est actuellement en tournée dans toute la France et chaque année au festival d\'Avignon.\n\nA savoir :\n.  Durée du spectcale : 70 minutes\n . A l\'Espace comédie vous avez aussi la possibilité de consommer des boissons et des planches apéritives pendant, avant ou après les spectacles.',
      schedule: 'Le dimanche à 20h00',
      lieu: 'L\'espace Comédie',
      lien_spectacle: 'https://www.billetweb.fr/kaci-dans-la-connerie-humaine'
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setError('Page non trouvée');
        setLoading(false);
        return;
      }

      // 1) Base locale par défaut
      const base = sponsoriseData[slug];
      if (!base) {
        setError('Spectacle non trouvé');
        setLoading(false);
        return;
      }

      // 2) Tenter de compléter avec la base de données publique
      try {
        const spectacles = await getSpectacles();

        // Chercher par titre exact (plus robuste que par slug côté DB)
        const match = Array.isArray(spectacles)
          ? spectacles.find(s => (s.title || '').trim().toLowerCase() === base.title.trim().toLowerCase())
          : undefined;

        if (match) {
          setData({
            // Utiliser au maximum les champs DB, fallback sur le JSON si manquant
            title: match.title || base.title,
            img: match.img || base.img,
            description: match.description || base.description,
            schedule: base.schedule, // La programmation récurrente reste fournie par le JSON
            lieu: match.lieu || base.lieu,
            lien_spectacle: match.lien_spectacle || base.lien_spectacle,
            videoUrl: base.videoUrl,
          });

          // Charger les photos additionnelles par catégorie via l'id du spectacle
          try {
            const photos = await api.get<AdditionalPhoto[]>(`/api/photos/spectacle/${match.id}`);
            if (Array.isArray(photos) && photos.length > 0) {
              setExtraPhotos(photos.slice(0, 3));
            }
          } catch {}
        } else {
          setData(base);
          // Fallback local des photos additionnelles selon le slug
          const fallbackPhotos: Record<string, string[]> = {
            'tchatcheur-comedy-club': [
              '/assets/img/photo_additionnel/B971A2EB-FE1F-47A0-B534-4D7B850D6AF4.webp',
              '/assets/img/photo_additionnel/TCC paul mi.webp',
              '/assets/img/photo_additionnel/D3D99BEC-6EB9-4B02-9019-137DA801E2DB.webp',
            ],
            'un-ado-peut-en-cacher-un-autre': [
              '/assets/img/photo_additionnel/Ado 234.webp',
              '/assets/img/photo_additionnel/Ado 1356.webp',
              '/assets/img/photo_additionnel/Ado 123.webp',
            ],
            'cheri-je-tai-trompe': [],
            'kaci-dans-la-connerie-humaine': [],
          };
          const imgs = fallbackPhotos[slug] || [];
          setExtraPhotos(imgs.map((p, idx) => ({ id: idx + 1, image_path: p })));
        }
      } catch (e) {
        // En cas d'erreur API, fallback JSON
        setData(base);
        // Fallback local photos
        const fallbackPhotos: Record<string, string[]> = {
          'tchatcheur-comedy-club': [
            '/assets/img/photo_additionnel/B971A2EB-FE1F-47A0-B534-4D7B850D6AF4.webp',
            '/assets/img/photo_additionnel/TCC paul mi.webp',
            '/assets/img/photo_additionnel/D3D99BEC-6EB9-4B02-9019-137DA801E2DB.webp',
          ],
          'un-ado-peut-en-cacher-un-autre': [
            '/assets/img/photo_additionnel/Ado 234.webp',
            '/assets/img/photo_additionnel/Ado 1356.webp',
            '/assets/img/photo_additionnel/Ado 123.webp',
          ],
          'cheri-je-tai-trompe': [],
          'kaci-dans-la-connerie-humaine': [],
        };
        const imgs = fallbackPhotos[slug] || [];
        setExtraPhotos(imgs.map((p, idx) => ({ id: idx + 1, image_path: p })));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const toYouTubeEmbed = (url?: string) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url || '';
    }
  };

  const handleReserve = () => {
    if (!data) return;
    
    if (data.lien_spectacle) {
      window.location.href = data.lien_spectacle;
      return;
    }
    
    toast.error("Lien de billetterie indisponible pour ce spectacle.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto" />
          </div>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6 text-center">
            <p className="text-red-500">{error || "Spectacle non trouvé"}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="bg-black py-12">
          <div className="container mx-auto px-6">
            {/* Header Section: Affiche (gauche) + Infos (droite) */}
            <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Affiche */}
                <div className="w-full">
                  <div className="relative w-full overflow-hidden rounded-lg bg-black">
                    <img
                      src={buildImgSrc('spectacles', (data.img || '').replace(/\.(jpe?g)$/i, '.webp')) || "/assets/placeholder.jpg"}
                      alt={data.title}
                      className="w-full h-auto object-contain"
                      onError={onImgErrorSwap}
                    />
                  </div>
                </div>
                {/* Infos sur le côté */}
                <div className="md:col-span-2">
                  <div className="mb-3">
                    <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      Spectacle récurrent
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                    {data.title}
                  </h1>
                  <div className="mt-4 space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4 flex items-start">
                      <i className="fa-regular fa-calendar mr-4 text-red-500 text-2xl"></i>
                      <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wide">Programmation</div>
                        <div className="text-white mt-1">
                          {data.schedule}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 flex items-start">
                      <i className="fa-solid fa-location-dot mr-4 text-red-500 text-2xl"></i>
                      <div>
                        <div className="text-gray-400 text-xs uppercase tracking-wide">Lieu</div>
                        <div className="text-white mt-1">{data.lieu}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2">

                {/* Description */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                  <p className="text-gray-300 whitespace-pre-line">{data.description}</p>
                </div>

              {/* Photos additionnelles */}
              {extraPhotos.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Photos additionnelles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {extraPhotos.map((p) => (
                      <div key={p.id} className="rounded-lg overflow-hidden bg-black">
                        <img
                          src={buildImgSrc('photo_addictionnel', (p.image_path || '').replace(/\.(jpe?g)$/i, '.webp'))}
                          alt={`Photo additionnelle ${p.id}`}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                          onError={onImgErrorSwap}
                        />
                      </div>
                    ))}
                  </div>
                  {data.videoUrl && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-white mb-4">Vidéo</h3>
                      <div className="aspect-video w-full rounded overflow-hidden bg-black">
                        <iframe
                          src={toYouTubeEmbed(data.videoUrl)}
                          title="Vidéo YouTube"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <a
                        href={data.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-red-400 hover:text-red-300"
                      >
                        Ouvrir sur YouTube
                      </a>
                    </div>
                  )}
                </div>
              )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-white mb-4">Réserver</h2>
                  <p className="text-gray-300 mb-6">
                    Ne manquez pas ce spectacle exceptionnel ! Réservez vos places dès maintenant.
                  </p>
                  <button
                    onClick={handleReserve}
                    className="w-full font-bold py-3 px-6 rounded transition duration-300 flex items-center justify-center bg-red-500 text-white hover:bg-red-600"
                  >
                    <i className="fa-solid fa-ticket-alt mr-2"></i>
                    Réserver maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsorise;
