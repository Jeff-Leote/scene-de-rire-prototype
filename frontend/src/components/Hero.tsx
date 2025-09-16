import { useState, useEffect } from 'react';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { Link } from 'react-router-dom';

type SpectacleItem = {
  id: number;
  title: string;
  img?: string;
  date_spectacle: string;
  heure_spectacle: string;
  lieu?: string;
  lien_spectacle?: string;
};

type Slide = {
  id: number; // spectacle occurrence id
  title: string;
  img: string;
  nextDate: string; // YYYY-MM-DD
  nextTime: string; // HH:mm:ss
};

const Hero = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);

  const formatTime = (time: string) => {
    return time.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        setError(null);
        const { api } = await import('@/services/api');
        // 1) Essayer d'agréger plusieurs pages de /api/spectacles pour obtenir plusieurs titres distincts
        const aggregate: any[] = [];
        try {
          const first: any = await api.get<any>('/api/spectacles');
          const firstItems: any[] = Array.isArray(first) ? first : (Array.isArray(first?.spectacles) ? first.spectacles : (Array.isArray(first?.data) ? first.data : (Array.isArray(first?.spectacles?.data) ? first.spectacles.data : [])));
          const totalPages: number = parseInt(first?.pagination?.totalPages ?? '1', 10) || 1;
          const limit: number = parseInt(first?.pagination?.limit ?? '6', 10) || 6;
          let page = parseInt(first?.pagination?.page ?? '1', 10) || 1;
          aggregate.push(...firstItems);

          const getDistinctCount = (arr: any[]) => new Set(arr.map(x => x.title)).size;
          while (page < totalPages && getDistinctCount(aggregate) < 10) {
            page += 1;
            const next: any = await api.get<any>(`/api/spectacles?page=${page}&limit=${limit}`);
            const nextItems: any[] = Array.isArray(next) ? next : (Array.isArray(next?.spectacles) ? next.spectacles : (Array.isArray(next?.data) ? next.data : (Array.isArray(next?.spectacles?.data) ? next.spectacles.data : [])));
            if (!Array.isArray(nextItems) || nextItems.length === 0) break;
            aggregate.push(...nextItems);
          }
        } catch {}

        let rawList: any[] = aggregate;
        if (!Array.isArray(rawList) || rawList.length === 0) {
          // 2) Fallback sur upcoming si l'agrégation a échoué
          const up: any = await api.get<any>('/api/spectacles/upcoming');
          if (Array.isArray(up)) rawList = up;
          else if (Array.isArray(up?.spectacles)) rawList = up.spectacles;
          else if (Array.isArray(up?.data)) rawList = up.data;
          else if (Array.isArray(up?.spectacles?.data)) rawList = up.spectacles.data;
          else rawList = [];
        }
        if (!Array.isArray(rawList) || rawList.length === 0) { setSlides([]); return; }

        // Normaliser pour tolérer champs manquants/incohérents
        const normalized: SpectacleItem[] = rawList.map((it: any) => {
          const id = it.id ?? it.spectacle_id ?? it._id;
          const title = it.title ?? it.nom ?? it.name ?? '';
          const img = it.img ?? it.image ?? it.photo ?? '';
          const date_spectacle = (it.date_spectacle ?? it.date ?? it.dateSpectacle ?? '').toString();
          const heure_spectacle = (it.heure_spectacle ?? it.heure ?? it.time ?? it.heureSpectacle ?? '00:00:00').toString();
          const lieu = it.lieu ?? it.venue ?? '';
          const lien_spectacle = it.lien_spectacle ?? it.link ?? it.bookingUrl ?? '';
          return { id, title, img, date_spectacle, heure_spectacle, lieu, lien_spectacle } as SpectacleItem;
        }).filter((it: SpectacleItem) => it.id && it.title && it.date_spectacle);
        if (normalized.length === 0) { setSlides([]); return; }

        const now = new Date();
        // 1) Préserver l'ordre de la base: utiliser l'ordre d'apparition du titre
        const order: string[] = [];
        const groups = new Map<string, SpectacleItem[]>();
        for (const s of normalized) {
          if (!s.title) continue;
          if (!groups.has(s.title)) order.push(s.title);
          groups.set(s.title, [...(groups.get(s.title) || []), s]);
        }

        // 2) Pour chaque spectacle (titre), choisir la prochaine date >= now
        const perShowNext: Slide[] = [];
        for (const title of order) {
          const items = (groups.get(title) || []).map(it => ({
            ...it,
            dt: new Date(`${it.date_spectacle}T${it.heure_spectacle}`)
          }));
          // Trier par date croissante à l'intérieur du spectacle
          items.sort((a, b) => a.dt.getTime() - b.dt.getTime());
          const next = items.find(it => it.dt >= now);
          if (next) {
            perShowNext.push({
              id: next.id,
              title: next.title,
              img: next.img,
              nextDate: next.date_spectacle,
              nextTime: next.heure_spectacle,
            });
          }
          // Fallback si pas de date future: prendre la première occurrence (plus proche dans l'ordre DB)
          else if (items[0]) {
            const first = items[0];
            perShowNext.push({
              id: first.id,
              title: first.title,
              img: first.img,
              nextDate: first.date_spectacle,
              nextTime: first.heure_spectacle,
            });
          }
        }

        // Respect strict: 1 slide par spectacle (ordre DB), prochaine date disponible
        setSlides(perShowNext);
        setIndex(0);
        setIndex(0);
      } catch (error) {
        console.error('Erreur lors du chargement des spectacles:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex(prev => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <section id="hero" className="bg-black pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg h-[700px] mb-12 bg-gray-800 animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="hero" className="bg-black pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg h-[700px] mb-12 bg-gray-800 flex items-center justify-center">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <section id="hero" className="bg-black pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg h-[700px] mb-12 bg-gray-800 flex items-center justify-center">
            <p className="text-gray-400 text-center">Aucun spectacle disponible pour le moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="bg-black pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-lg h-[700px] mb-12">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={buildImgSrc('spectacles', slides[index].img)}
            alt={slides[index].title}
            onError={onImgErrorSwap}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          {/* Controls */}
          {slides.length > 1 && (
            <>
              <button
                aria-label="Précédent"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              >
                ‹
              </button>
              <button
                aria-label="Suivant"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
              >
                ›
              </button>
            </>
          )}
          <div className="absolute bottom-0 left-0 p-4 sm:p-6 lg:p-8 w-full">
            {/* Badge et informations de date/heure */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase w-fit">
                À venir
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-white text-sm sm:text-base">
                  {new Date(`${slides[index].nextDate}T${slides[index].nextTime}`).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
                <span className="text-red-500 text-sm sm:text-base font-medium">
                  {formatTime(slides[index].nextTime)}
                </span>
              </div>
            </div>

            {/* Titre principal avec meilleure hiérarchie */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
                {slides[index].title}
              </h1>
            </div>

            {/* Boutons d'action avec responsive amélioré */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                to={`/spectacles/${slides[index].id}`}
                className="bg-red-500 text-white px-4 sm:px-6 py-3 rounded hover:bg-red-600 transition duration-300 flex items-center justify-center sm:justify-start font-medium"
              >
                <i className="fa-solid fa-ticket-alt mr-2"></i>
                Réserver maintenant
              </Link>
              <Link 
                to={`/spectacles/${slides[index].id}`}
                className="border border-red-500 text-red-500 px-4 sm:px-6 py-3 rounded hover:bg-red-500 hover:text-white transition duration-300 flex items-center justify-center sm:justify-start font-medium"
              >
                <i className="fa-solid fa-circle-info mr-2"></i>
                Plus d'infos
              </Link>
            </div>

            {slides.length > 1 && (
              <div className="mt-6 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Aller au slide ${i + 1}`}
                    className={`h-2 w-2 rounded-full ${i === index ? 'bg-red-500' : 'bg-gray-600'}`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
