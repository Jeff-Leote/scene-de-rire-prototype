
const Hero = () => {
  return (
    <section id="hero" className="bg-black pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="relative overflow-hidden rounded-lg h-[500px] mb-12">
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/b5c2ee300c-9f1e29bf1f9341ba67b1.png" 
            alt="comedian performing on stage with spotlights, dark background, dramatic lighting" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3">
            <div className="flex items-center mb-4">
              <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold uppercase">À l'affiche</span>
              <span className="ml-3 text-white text-sm">Vendredi 16 mai 2025 · 20h30</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Julien Lacroix: <span className="text-yellow-400">Le Grand Retour</span></h1>
            <p className="text-gray-300 mb-6 text-lg">Un spectacle déjanté où l'humour noir rencontre l'absurde pour une soirée inoubliable.</p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-yellow-400 text-black px-6 py-3 rounded hover:bg-yellow-300 transition duration-300 flex items-center cursor-pointer">
                <i className="fa-solid fa-ticket-alt mr-2"></i>
                Réserver maintenant
              </span>
              <span className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded hover:bg-yellow-400 hover:text-black transition duration-300 flex items-center cursor-pointer">
                <i className="fa-solid fa-circle-info mr-2"></i>
                Plus d'infos
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
