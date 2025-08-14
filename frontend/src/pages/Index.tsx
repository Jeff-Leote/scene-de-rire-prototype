


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
