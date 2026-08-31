import Header from "../components/Header";
import Hero from "../components/Hero";
import UpcomingShows from "../components/UpcomingShows";
import FeaturedArtists from "../components/FeaturedArtists";
import ShowsCalendar from "@/components/ShowsCalendar";
import Venue from "../components/Venue";
import GoogleReviews from "@/components/GoogleReviews";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Accueil" />
      <main>
        <Hero />
        <GoogleReviews 
          placeId="ChIJF94WEwDVwkcRpB4gPela0dE" 
          apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? ''} 
          maxReviews={6}
        />
        <UpcomingShows />
        <FeaturedArtists />
        <ShowsCalendar />
        <Venue />
        {/* <Testimonials /> */}
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
