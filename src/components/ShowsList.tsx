
const ShowsList = () => {
  return (
    <section id="prochains-spectacles" className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Prochains spectacles</h2>
          <span className="text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center cursor-pointer">
            Voir le calendrier complet
            <i className="fa-solid fa-arrow-right ml-2"></i>
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Show Card 1 */}
          <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition duration-300">
            <div className="relative h-64">
              <img className="w-full h-full object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/353906ae61-ae1b7cc35b916c2be87d.png" alt="comedy show performance with colorful stage lighting, standup comedian on stage" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Marie Dubois</h3>
              <p className="text-gray-400 mb-4">Un one-woman show hilarant qui revisite les classiques de la comédie française avec une touche moderne.</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="flex items-center">
                    <i className="fa-regular fa-calendar mr-2 text-yellow-400"></i>
                    <span className="text-gray-300">10 mai 2025</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <i className="fa-regular fa-clock mr-2 text-yellow-400"></i>
                    <span className="text-gray-300">20h30</span>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">25€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center cursor-pointer">
                  Réserver
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </div>
          
          {/* Show Card 2 */}
          <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition duration-300">
            <div className="relative h-64">
              <img className="w-full h-full object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d50e7849bd-2b0ca0d76d858e5f2573.png" alt="improvisation comedy show with actors on stage, theatrical lighting" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Les Improvisateurs</h3>
              <p className="text-gray-400 mb-4">Une soirée d'improvisation où le public devient scénariste. Des situations inattendues et des fous rires garantis.</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="flex items-center">
                    <i className="fa-regular fa-calendar mr-2 text-yellow-400"></i>
                    <span className="text-gray-300">15 mai 2025</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <i className="fa-regular fa-clock mr-2 text-yellow-400"></i>
                    <span className="text-gray-300">19h00</span>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">20€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center cursor-pointer">
                  Réserver
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </div>
          
          {/* Show Card 3 */}
          <div className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition duration-300">
            <div className="relative h-64">
              <img className="w-full h-full object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/6759eaddcd-9880073697ce2de74db0.png" alt="musical comedy performance with actors singing on stage, professional lighting" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Thomas Laurent</h3>
              <p className="text-gray-400 mb-4">Entre humour et chanson, Thomas nous emmène dans son univers décalé pour un spectacle musical unique.</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="flex items-center">
                    <i className="fa-regular fa-calendar mr-2 text-yellow-400"></i>
                    <span className="text-gray-300">22 mai 2025</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <i className="fa-regular fa-clock mr-2 text-yellow-400"></i>
                    <span className="text-gray-300">21h00</span>
                  </div>
                </div>
                <span className="text-white font-bold text-lg">28€</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center cursor-pointer">
                  Réserver
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowsList;
