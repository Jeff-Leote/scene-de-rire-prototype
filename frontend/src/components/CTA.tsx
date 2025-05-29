
const CTA = () => {
  return (
    <section id="cta" className="bg-gray-950 py-16">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Prêt à rire ?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">Découvrez notre programmation et réservez vos places pour les meilleurs spectacles d'humour.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <span className="bg-yellow-400 text-black px-8 py-4 rounded-lg hover:bg-yellow-300 transition duration-300 font-bold cursor-pointer">
            Voir les spectacles
          </span>
          <span className="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg hover:bg-yellow-400 hover:text-black transition duration-300 font-bold cursor-pointer">
            Contacter l'équipe
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTA;
