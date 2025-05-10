
const Venue = () => {
  return (
    <section id="venue" className="bg-gray-950 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-white mb-6">Notre salle</h2>
            <p className="text-gray-300 mb-6">Située en plein cœur de la ville, notre salle offre une expérience intime et chaleureuse pour apprécier les meilleurs humoristes dans des conditions optimales. Avec une acoustique parfaite et une visibilité exceptionnelle depuis chaque siège, chaque spectacle devient un moment privilégié.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <i className="fa-solid fa-chair text-yellow-400 mr-3 text-xl"></i>
                <span className="text-white">120 places assises</span>
              </div>
              <div className="flex items-center">
                <i className="fa-solid fa-martini-glass text-yellow-400 mr-3 text-xl"></i>
                <span className="text-white">Bar & snacks</span>
              </div>
              <div className="flex items-center">
                <i className="fa-solid fa-wheelchair text-yellow-400 mr-3 text-xl"></i>
                <span className="text-white">Accès PMR</span>
              </div>
              <div className="flex items-center">
                <i className="fa-solid fa-car text-yellow-400 mr-3 text-xl"></i>
                <span className="text-white">Parking à proximité</span>
              </div>
            </div>
            
            <span className="inline-block bg-yellow-400 text-black px-6 py-3 rounded hover:bg-yellow-300 transition duration-300 mt-4 cursor-pointer">
              Comment s'y rendre
            </span>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <img 
                className="w-full h-full object-cover" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/0bbda7f6c6-004acca7fa7db15dae6a.png" 
                alt="comedy club interior with stage and seating, warm lighting, intimate atmosphere" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="absolute bottom-6 right-6">
                <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold">
                  Ouverture des portes 30 min avant le spectacle
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Venue;
