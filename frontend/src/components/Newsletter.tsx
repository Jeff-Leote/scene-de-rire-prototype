
const Newsletter = () => {
  return (
    <section id="newsletter" className="bg-yellow-400 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-black mb-4">Restez informé des prochains spectacles</h2>
            <p className="text-gray-800 text-lg">Inscrivez-vous à notre newsletter et ne manquez aucun de nos événements. Promotions exclusives et nouvelles dates en avant-première.</p>
          </div>
          
          <div className="md:w-1/2">
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="flex-grow px-4 py-3 rounded-lg focus:outline-none" 
              />
              <button 
                type="submit" 
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 whitespace-nowrap"
              >
                S'abonner
              </button>
            </form>
            <p className="text-gray-700 text-sm mt-3">En vous inscrivant, vous acceptez notre politique de confidentialité.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
