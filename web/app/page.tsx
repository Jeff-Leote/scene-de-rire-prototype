import {
  getUpcomingSpectaclesByTitle,
  getNextUpcomingOccurrences,
  getAllSpectaclesForCalendar,
  getSpectaclesByIds,
} from '@/lib/spectacles';
import { getMainLieuImage } from '@/lib/lieu';
import { getFeaturedArtistes } from '@/lib/artistes';
import { getPublishedPageVersion, type CarrouselContent } from '@/lib/pages';
import Hero from '@/components/home/Hero';
import GoogleReviews from '@/components/home/GoogleReviews';
import UpcomingShows from '@/components/home/UpcomingShows';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import ShowsCalendar from '@/components/home/ShowsCalendar';
import VenueTeaser from '@/components/home/VenueTeaser';
import CTA from '@/components/CTA';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [accueilVersion, upcomingShows, artistes, allSpectacles, mainLieuImage] = await Promise.all([
    getPublishedPageVersion('accueil'),
    getNextUpcomingOccurrences(3),
    getFeaturedArtistes(4),
    getAllSpectaclesForCalendar(),
    getMainLieuImage(),
  ]);

  // Bloc carrousel : si Jeff a sélectionné des séances, on les affiche dans l'ordre ;
  // sinon repli sur la sélection automatique (prochaine séance par titre).
  const carrouselBlock = accueilVersion?.blocks.find((b) => b.type === 'carrousel' && b.visible);
  const featuredIds = (carrouselBlock?.content as CarrouselContent | undefined)?.spectacleIds ?? [];

  const heroSlides =
    featuredIds.length > 0 ? await getSpectaclesByIds(featuredIds) : await getUpcomingSpectaclesByTitle(10);

  return (
    <>
      <Hero slides={heroSlides} />
      <GoogleReviews />
      <UpcomingShows shows={upcomingShows} />
      <FeaturedArtists artistes={artistes} />
      <ShowsCalendar spectacles={allSpectacles} />
      <VenueTeaser mainImage={mainLieuImage} />
      <CTA />
    </>
  );
}
