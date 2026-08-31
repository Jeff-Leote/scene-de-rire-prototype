import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Cours = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Cours" />
      <main className="pt-24">
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Cours</h1>
            <p className="text-gray-300 max-w-3xl">
              Découvrez prochainement nos cours, ateliers et formations dédiés à l'humour et à la scène. Cette page
              présentera les contenus, horaires et modalités d'inscription.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cours;
