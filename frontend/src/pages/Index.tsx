
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { checkPaymentStatus } from "../services/reservation";
import Header from "../components/Header";
import Hero from "../components/Hero";
import UpcomingShows from "../components/UpcomingShows";
import FeaturedArtists from "../components/FeaturedArtists";
import ShowsCalendar from "@/components/ShowsCalendar";
import Venue from "../components/Venue";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    
    if (payment === 'success' && sessionId) {
      console.log('🎯 Paiement réussi détecté, sessionId:', sessionId);
      
      // Vérifier le statut du paiement via l'API
      checkPaymentStatus(sessionId)
        .then(result => {
          console.log('✅ Résultat de la vérification:', result);
          if (result.status === 'paid') {
            toast.success('Réservation confirmée !');
            // Vider le panier
            localStorage.removeItem('cart');
            localStorage.removeItem('nbBillets');
            // Rediriger vers mon compte après 3 secondes
            setTimeout(() => {
              navigate("/mon-compte");
            }, 3000);
          } else {
            console.log('⚠️ Statut de paiement non confirmé:', result.status);
            toast.error('Paiement en attente ou échoué.');
          }
        })
        .catch((error) => {
          console.error('💥 Erreur dans le catch:', error);
          toast.error('Erreur lors de la vérification du paiement.');
        });
    } else if (payment === 'cancel') {
      toast.error('Paiement annulé. Votre réservation n\'a pas été finalisée.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Accueil" />
      <main>
        <Hero />
        <UpcomingShows />
        <FeaturedArtists />
        <ShowsCalendar />
        <Venue />
        <Testimonials />
        <Newsletter />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
