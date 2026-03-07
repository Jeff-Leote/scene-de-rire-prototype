import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Hero from "../components/Hero";
import UpcomingShows from "../components/UpcomingShows";
import FeaturedArtists from "../components/FeaturedArtists";
import ShowsCalendar from "@/components/ShowsCalendar";
import Venue from "../components/Venue";
import GoogleReviews from "@/components/GoogleReviews";
import Newsletter from "../components/Newsletter";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection si lien de désinscription newsletter
    const unsubscribeFlag = searchParams.get("unsubscribe");
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    if (unsubscribeFlag && (email || token)) {
      const query = new URLSearchParams();
      if (email) query.set("email", email);
      if (token) query.set("token", token);
      navigate(`/unsubscribe?${query.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

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
        <Newsletter />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
