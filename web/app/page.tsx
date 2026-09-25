import {
  getUpcomingSpectaclesByTitle,
  getNextUpcomingOccurrences,
  getAllSpectaclesForCalendar,
} from '@/lib/spectacles';
import { getMainLieuImage } from '@/lib/lieu';
import { getFeaturedArtistes } from '@/lib/artistes';
import Hero from '@/components/home/Hero';
import GoogleReviews from '@/components/home/GoogleReviews';
import UpcomingShows from '@/components/home/UpcomingShows';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import ShowsCalendar from '@/components/home/ShowsCalendar';
import VenueTeaser from '@/components/home/VenueTeaser';
import CTA from '@/components/CTA';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [heroSlides, upcomingShows, artistes, allSpectacles, mainLieuImage] = await Promise.all([
    getUpcomingSpectaclesByTitle(10),
    getNextUpcomingOccurrences(3),
    getFeaturedArtistes(4),
    getAllSpectaclesForCalendar(),
    getMainLieuImage(),
  ]);

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
