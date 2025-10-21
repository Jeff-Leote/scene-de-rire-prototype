
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import Header from "../components/Header";
import Hero from "../components/Hero";
import UpcomingShows from "../components/UpcomingShows";
import FeaturedArtists from "../components/FeaturedArtists";
import ShowsCalendar from "@/components/ShowsCalendar";
import Venue from "../components/Venue";
import GoogleReviews from "@/components/GoogleReviews";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hasProcessedPayment, setHasProcessedPayment] = useState(false);

  useEffect(() => {
    // Redirection spéciale: si unsubscribe est présent, on bascule vers /unsubscribe
    const unsubscribeFlag = searchParams.get("unsubscribe");
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    if (unsubscribeFlag && (email || token)) {
      const query = new URLSearchParams();
      if (email) query.set("email", email);
      if (token) query.set("token", token);
      navigate(`/unsubscribe?${query.toString()}`, { replace: true });
      return;
    }

    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    
    if (payment === 'success' && sessionId && !hasProcessedPayment) {
      console.log('🎯 Paiement réussi détecté, sessionId:', sessionId);
      setHasProcessedPayment(true);
      
      // Paiement réussi - vider le panier
      toast.success('Paiement confirmé !');
      localStorage.removeItem('cart');
      localStorage.removeItem('nbBillets');
      // Rediriger vers mon compte après 3 secondes
      setTimeout(() => {
        navigate("/mon-compte");
      }, 3000);
    } else if (payment === 'cancel' && !hasProcessedPayment) {
      setHasProcessedPayment(true);
      toast.error("Paiement annulé. Votre réservation n'a pas été finalisée.");
    }
  }, [searchParams, navigate, hasProcessedPayment]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Accueil" />
      <main>
        <Hero />
        <GoogleReviews 
          placeId="ChIJF94WEwDVwkcRpB4gPela0dE" 
          apiKey="AIzaSyCMiI3gv5njJC0xPkQo9CJGyLtjXE3PUoQ" 
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
