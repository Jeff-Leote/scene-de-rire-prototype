//pages/Shows.tsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import ShowsList from "../components/ShowsList";
import FeaturedArtists from "../components/FeaturedArtists";
import ShowsCalendar from "../components/ShowsCalendar";
import CTA from "../components/CTA";

const Shows = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Spectacles" />
      <main className="pt-24">
        <ShowsList/> 
      </main>
      <Footer />
    </div>
  );
};

export default Shows;
