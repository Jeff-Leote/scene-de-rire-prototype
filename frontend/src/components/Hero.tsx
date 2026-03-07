import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildImgSrc, onImgErrorSwap } from '@/utils/image';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';

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

// ---- Helpers de parsing sûrs (évite `any`) ----
const isObject = (val: unknown): val is Record<string, unknown> => (
  typeof val === 'object' && val !== null
);

const toNumber = (val: unknown): number | null => {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
};

const toStringSafe = (val: unknown, fallback = ''): string => {
  if (val == null) return fallback;
  if (typeof val === 'string') return val;
  return String(val);
};

const extractItems = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (isObject(payload)) {
    const spectacles = payload.spectacles;
    const data = (payload as Record<string, unknown>).data;
    if (Array.isArray(spectacles)) return spectacles as unknown[];
    if (isObject(spectacles) && Array.isArray((spectacles as Record<string, unknown>).data)) {
      return (spectacles as Record<string, unknown>).data as unknown[];
    }
    if (Array.isArray(data)) return data as unknown[];
  }
  return [];
};

const extractPagination = (payload: unknown): { totalPages: number; limit: number; page: number } => {
  let totalPages = 1;
  let limit = 6;
  let page = 1;
  if (isObject(payload) && isObject(payload.pagination)) {
    const p = payload.pagination as Record<string, unknown>;
    totalPages = toNumber(p.totalPages) ?? totalPages;
    limit = toNumber(p.limit) ?? limit;
    page = toNumber(p.page) ?? page;
  }
  return { totalPages, limit, page };
};

const getTitleFromUnknown = (val: unknown): string => {
  if (!isObject(val)) return '';
  return toStringSafe(val.title ?? val.nom ?? val.name ?? '');
};

const Hero = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const MAX_SLIDES = 10;
  const CACHE_KEY = 'heroSlides:v1';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
  const PAGE_FETCH_CAP = 5; // au plus 5 pages
  const FAST_FALLBACK_MS = 1800; // si >1.8s, basculer sur fallback/upcoming

  const formatTime = (time: string) => {
    return time.split(':').slice(0, 2).join(':');
  };

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        setError(null);

        // 0) Données initiales (SSR / Option B): utiliser le cache React Query pour éviter le premier fetch client
        const initialUpcoming = queryClient.getQueryData(['spectacles', 'upcoming']);
        if (initialUpcoming != null) {
          const upItems = extractItems(initialUpcoming);
          if (Array.isArray(upItems) && upItems.length > 0) {
            const fastNormalized: SpectacleItem[] = upItems.map((val: unknown) => {
              const it = isObject(val) ? val : {};
              const idCandidate = it.id ?? it.spectacle_id ?? it._id;
              const idNum = toNumber(idCandidate) ?? -1;
              return {
                id: idNum,
                title: toStringSafe(it.title ?? it.nom ?? it.name ?? ''),
                img: toStringSafe(it.img ?? it.image ?? it.photo ?? ''),
                date_spectacle: toStringSafe(it.date_spectacle ?? it.date ?? it.dateSpectacle ?? ''),
                heure_spectacle: toStringSafe(it.heure_spectacle ?? it.heure ?? it.time ?? it.heureSpectacle ?? '00:00:00'),
                lieu: toStringSafe(it.lieu ?? it.venue ?? ''),
                lien_spectacle: toStringSafe(it.lien_spectacle ?? it.link ?? it.bookingUrl ?? ''),
              };
            }).filter(it => it.id > 0 && it.title && it.date_spectacle);
            const order: string[] = [];
            const groups = new Map<string, SpectacleItem[]>();
            for (const s of fastNormalized) {
              if (!groups.has(s.title)) order.push(s.title);
              groups.set(s.title, [...(groups.get(s.title) || []), s]);
            }
            const nowFast = new Date();
            const perShowNextFast: Slide[] = [];
            for (const title of order) {
              const items = (groups.get(title) || []).map(it => ({ ...it, dt: new Date(`${it.date_spectacle}T${it.heure_spectacle}`) }));
              items.sort((a, b) => a.dt.getTime() - b.dt.getTime());
              const next = items.find(it => it.dt >= nowFast) || items[0];
              if (next) perShowNextFast.push({ id: next.id, title: next.title, img: next.img, nextDate: next.date_spectacle, nextTime: next.heure_spectacle });
            }
            const fastSlides = perShowNextFast.slice(0, MAX_SLIDES);
            if (fastSlides.length) {
              setSlides(fastSlides);
              setIndex(0);
              setLoading(false);
              return;
            }
          }
        }

        const { api } = await import('@/services/api');
        const startedAt = Date.now();

        // 1) Cache sessionStorage: essayer d'utiliser une version en cache récente
        try {
          const cachedRaw = sessionStorage.getItem(CACHE_KEY);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw) as { ts: number; slides: Slide[] };
            if (cached && Array.isArray(cached.slides) && (startedAt - cached.ts) < CACHE_TTL_MS) {
              setSlides(cached.slides.slice(0, MAX_SLIDES));
              setIndex(0);
              setLoading(false);
              return;
            }
          }
        } catch {}
        // 1) Essayer d'agréger plusieurs pages de /api/spectacles pour obtenir plusieurs titres distincts
        const aggregate: unknown[] = [];
        try {
          // Course entre la 1ère page et un timeout pour réduire le ressenti
          const timeout = new Promise<unknown>((_, rej) => setTimeout(() => rej(new Error('first_page_timeout')), FAST_FALLBACK_MS));
          const first = await Promise.race([api.get('/api/spectacles'), timeout]).catch(async (e) => {
            if ((e as Error)?.message === 'first_page_timeout') {
              // si timeout, tenter directement upcoming pour affichage immédiat
              const upFast = await api.get('/api/spectacles/upcoming');
              const upItemsFast = extractItems(upFast);
              if (upItemsFast.length) {
                const fastNormalized: SpectacleItem[] = upItemsFast.map((val: unknown) => {
                  const it = isObject(val) ? val : {};
                  const idCandidate = it.id ?? it.spectacle_id ?? it._id;
                  const idNum = toNumber(idCandidate) ?? -1;
                  return {
                    id: idNum,
                    title: toStringSafe(it.title ?? it.nom ?? it.name ?? ''),
                    img: toStringSafe(it.img ?? it.image ?? it.photo ?? ''),
                    date_spectacle: toStringSafe(it.date_spectacle ?? it.date ?? it.dateSpectacle ?? ''),
                    heure_spectacle: toStringSafe(it.heure_spectacle ?? it.heure ?? it.time ?? it.heureSpectacle ?? '00:00:00'),
                    lieu: toStringSafe(it.lieu ?? it.venue ?? ''),
                    lien_spectacle: toStringSafe(it.lien_spectacle ?? it.link ?? it.bookingUrl ?? ''),
                  };
                }).filter(it => it.id > 0 && it.title && it.date_spectacle);

                const order: string[] = [];
                const groups = new Map<string, SpectacleItem[]>();
                for (const s of fastNormalized) {
                  if (!groups.has(s.title)) order.push(s.title);
                  groups.set(s.title, [...(groups.get(s.title) || []), s]);
                }
                const nowFast = new Date();
                const perShowNextFast: Slide[] = [];
                for (const title of order) {
                  const items = (groups.get(title) || []).map(it => ({ ...it, dt: new Date(`${it.date_spectacle}T${it.heure_spectacle}`) }));
                  items.sort((a, b) => a.dt.getTime() - b.dt.getTime());
                  const next = items.find(it => it.dt >= nowFast) || items[0];
                  if (next) perShowNextFast.push({ id: next.id, title: next.title, img: next.img, nextDate: next.date_spectacle, nextTime: next.heure_spectacle });
                }
                const fastSlides = perShowNextFast.slice(0, MAX_SLIDES);
                if (fastSlides.length) {
                  setSlides(fastSlides);
                  setIndex(0);
                }
              }
              // continuer ensuite avec l’agrégation normale en arrière-plan
              return api.get('/api/spectacles');
            }
            throw e;
          });
          const firstItems = extractItems(first);
          const { totalPages, limit } = extractPagination(first);
          const { page: firstPage } = extractPagination(first);
          aggregate.push(...firstItems);

          // 1.b) Récupérer les autres pages en parallèle (borne supérieure pour éviter surfetch)
          const pagesToFetch: number[] = [];
          const maxPages = Math.min(totalPages, firstPage + (PAGE_FETCH_CAP - 1)); // au plus PAGE_FETCH_CAP pages
          for (let p = firstPage + 1; p <= maxPages; p++) pagesToFetch.push(p);

          if (pagesToFetch.length > 0) {
            const results = await Promise.allSettled(
              pagesToFetch.map(p => api.get(`/api/spectacles?page=${p}&limit=${limit}`))
            );
            for (const r of results) {
              if (r.status === 'fulfilled') {
                const items = extractItems(r.value);
                if (Array.isArray(items) && items.length > 0) aggregate.push(...items);
              }
            }
          }
        } catch (e) {
          console.warn('Pagination aggregation failed, will try upcoming fallback.', e);
        }

        let rawList: unknown[] = aggregate;
        if (!Array.isArray(rawList) || rawList.length === 0) {
          // 2) Fallback sur upcoming si l'agrégation a échoué
          const up = await api.get('/api/spectacles/upcoming');
          rawList = extractItems(up);
        }
        if (!Array.isArray(rawList) || rawList.length === 0) { setSlides([]); return; }

        // Normaliser pour tolérer champs manquants/incohérents
        const normalized: SpectacleItem[] = rawList.map((val: unknown) => {
          const it = isObject(val) ? val : {};
          const idCandidate = it.id ?? it.spectacle_id ?? it._id;
          const idNum = toNumber(idCandidate);
          const title = toStringSafe(it.title ?? it.nom ?? it.name ?? '');
          const img = toStringSafe(it.img ?? it.image ?? it.photo ?? '');
          const date_spectacle = toStringSafe(it.date_spectacle ?? it.date ?? it.dateSpectacle ?? '');
          const heure_spectacle = toStringSafe(it.heure_spectacle ?? it.heure ?? it.time ?? it.heureSpectacle ?? '00:00:00');
          const lieu = toStringSafe(it.lieu ?? it.venue ?? '');
          const lien_spectacle = toStringSafe(it.lien_spectacle ?? it.link ?? it.bookingUrl ?? '');
          return {
            id: idNum ?? -1,
            title,
            img,
            date_spectacle,
            heure_spectacle,
            lieu,
            lien_spectacle,
          };
        }).filter((it: SpectacleItem) => Number.isFinite(it.id) && it.id > 0 && !!it.title && !!it.date_spectacle);
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
        const finalSlides = perShowNext.slice(0, MAX_SLIDES);
        setSlides(prev => {
          // éviter update si identique (minimise re-render)
          const sameLength = prev.length === finalSlides.length;
          const same = sameLength && prev.every((s, i) =>
            s.id === finalSlides[i].id && s.title === finalSlides[i].title && s.img === finalSlides[i].img && s.nextDate === finalSlides[i].nextDate && s.nextTime === finalSlides[i].nextTime
          );
          return same ? prev : finalSlides;
        });
        setIndex(0);

        // 5) Écrire en cache
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), slides: finalSlides }));
        } catch {}
      } catch (error) {
        console.error('Erreur lors du chargement des spectacles:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    // Abort si démontage pour éviter setState après unmount
    let alive = true;
    (async () => { if (alive) await fetchSlides(); })();
    return () => { alive = false; };
  }, [queryClient]);

  // Auto-advance avec réinitialisation
  useEffect(() => {
    if (slides.length <= 1) return;
    
    let timer: NodeJS.Timeout;
    
    const startTimer = () => {
      timer = setInterval(() => setIndex(prev => (prev + 1) % slides.length), 6000);
    };
    
    const resetTimer = () => {
      if (timer) clearInterval(timer);
      startTimer();
    };
    
    // Démarrer le timer initial
    startTimer();
    
    // Fonction pour réinitialiser le timer (sera exposée via ref)
    (window as any).resetCarouselTimer = resetTimer;
    
    return () => {
      if (timer) clearInterval(timer);
      delete (window as any).resetCarouselTimer;
    };
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
    <section id="hero" className="hero-section">
      <div className="hero-container">
        <div className="hero-image mb-12">
          <img
            src={buildImgSrc('spectacles', slides[index].img)}
            alt={slides[index].title}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          {/* Controls */}
          {slides.length > 1 && (
            <>
              <button
                aria-label="Précédent"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => {
                  setIndex((prev) => (prev - 1 + slides.length) % slides.length);
                  (window as any).resetCarouselTimer?.();
                }}
              >
                ‹
              </button>
              <button
                aria-label="Suivant"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => {
                  setIndex((prev) => (prev + 1) % slides.length);
                  (window as any).resetCarouselTimer?.();
                }}
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
                    onClick={() => {
                      setIndex(i);
                      (window as any).resetCarouselTimer?.();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section de présentation textuelle pour l'indexation Google */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            L'Espace Comédie Lille
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto">
            La référence pour découvrir et réserver les meilleurs spectacles d'humour à Lille
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
            Située en plein cœur de la ville, notre salle offre une expérience intime et chaleureuse pour apprécier les meilleurs humoristes dans des conditions optimales. Stand-up, comédies et soirées exceptionnelles vous attendent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/spectacles"
              className="bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 transition duration-300 font-medium text-lg"
            >
              <i className="fa-solid fa-calendar-alt mr-2"></i>
              Voir la programmation
            </Link>
            <Link 
              to="/le-lieu"
              className="border border-red-500 text-red-500 px-8 py-4 rounded-lg hover:bg-red-500 hover:text-white transition duration-300 font-medium text-lg"
            >
              <i className="fa-solid fa-map-marker-alt mr-2"></i>
              Découvrir le lieu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
