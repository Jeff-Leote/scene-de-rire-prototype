
const UpcomingShows = () => {
  return (
    <section id="upcoming-shows" className="bg-black py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">Prochains spectacles</h2>
          <span className="text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center cursor-pointer">
            Voir le calendrier complet
            <i className="fa-solid fa-arrow-right ml-2"></i>
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show Card 1 */}
          <div id="show-card-1" className="w-[300px] bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition duration-300">
            <div className="relative h-64">
              <img 
                className="w-full h-full object-cover" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/f14790a161-1dd2ab43578de3fadacc.png" 
                alt="female comedian on stage with microphone, laughing audience, dark comedy club atmosphere" 
              />
              <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                16 MAI
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Katherine Levac</h3>
              <p className="text-gray-400 mb-4">Un mélange d'observations fines et d'anecdotes hilarantes sur la vie quotidienne.</p>
              <div className="flex items-center justify-between">
                <span className="text-white">20h30 · 25€</span>
                <span className="text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center cursor-pointer">
                  Réserver
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </div>
          
          {/* Show Card 2 */}
          <div id="show-card-2" className="w-[300px] bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition duration-300">
            <div className="relative h-64">
              <img 
                className="w-full h-full object-cover" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/4af276394f-b2acae8abc28d2dd2b9e.png" 
                alt="male comedian with expressive face, performing stand-up comedy, spotlight focused on him" 
              />
              <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                23 MAI
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Adib Alkhalidey</h3>
              <p className="text-gray-400 mb-4">Un regard unique sur notre société avec un humour intelligent et percutant.</p>
              <div className="flex items-center justify-between">
                <span className="text-white">21h00 · 28€</span>
                <span className="text-yellow-400 hover:text-yellow-300 transition duration-300 flex items-center cursor-pointer">
                  Réserver
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </span>
              </div>
            </div>
          </div>
          
          {/* Show Card 3 */}
          <div id="show-card-3" className="w-[300px] bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-[1.02] transition duration-300">
            <div className="relative h-64">
              <img 
                className="w-full h-full object-cover" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/656615cbc5-fcb405c69aac617508e7.png" 
                alt="energetic comedian in colorful outfit, dynamic pose, comedy stage lighting" 
              />
              <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                30 MAI
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Virginie Fortin</h3>
              <p className="text-gray-400 mb-4">Un spectacle surréaliste qui vous fera rire et réfléchir en même temps.</p>
              <div className="flex items-center justify-between">
                <span className="text-white">20h00 · 22€</span>
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

export default UpcomingShows;
