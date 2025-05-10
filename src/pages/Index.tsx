
import Header from "../components/Header";
import Hero from "../components/Hero";
import UpcomingShows from "../components/UpcomingShows";
import FeaturedArtists from "../components/FeaturedArtists";
import Calendar from "../components/Calendar";
import Venue from "../components/Venue";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
        <UpcomingShows />
        <FeaturedArtists />
        <Calendar />
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
