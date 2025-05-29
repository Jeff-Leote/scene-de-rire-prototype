
const FeaturedArtists = () => {
  return (
    <section id="featured-artists" className="bg-gray-950 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8">Artistes déjà venu</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Artist 1 */}
          <div id="artist-1" className="group">
            <div className="relative overflow-hidden rounded-full aspect-square mb-4">
              <img 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/ac7097d3b8-29e38a0e47e5e188fccb.png" 
                alt="portrait of female comedian smiling, professional headshot, neutral background" 
              />
              <div className="absolute inset-0 bg-yellow-400 bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
            </div>
            <h3 className="text-xl font-bold text-white text-center">Katherine Levac</h3>
            <p className="text-gray-400 text-center">3 spectacles à venir</p>
          </div>
          
          {/* Artist 2 */}
          <div id="artist-2" className="group">
            <div className="relative overflow-hidden rounded-full aspect-square mb-4">
              <img 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/f7ea42ff17-6c63f985336e1b6190ca.png" 
                alt="portrait of male comedian with beard, professional headshot, neutral background" 
              />
              <div className="absolute inset-0 bg-yellow-400 bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
            </div>
            <h3 className="text-xl font-bold text-white text-center">Adib Alkhalidey</h3>
            <p className="text-gray-400 text-center">2 spectacles à venir</p>
          </div>
          
          {/* Artist 3 */}
          <div id="artist-3" className="group">
            <div className="relative overflow-hidden rounded-full aspect-square mb-4">
              <img 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d6fbaa5fdb-a844c7d810f723c345f0.png" 
                alt="portrait of female comedian with curly hair, professional headshot, neutral background" 
              />
              <div className="absolute inset-0 bg-yellow-400 bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
            </div>
            <h3 className="text-xl font-bold text-white text-center">Virginie Fortin</h3>
            <p className="text-gray-400 text-center">1 spectacle à venir</p>
          </div>
          
          {/* Artist 4 */}
          <div id="artist-4" className="group">
            <div className="relative overflow-hidden rounded-full aspect-square mb-4">
              <img 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/e07758f5a1-1fe899bd292eee0e4d78.png" 
                alt="portrait of male comedian laughing, professional headshot, neutral background" 
              />
              <div className="absolute inset-0 bg-yellow-400 bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
            </div>
            <h3 className="text-xl font-bold text-white text-center">Julien Lacroix</h3>
            <p className="text-gray-400 text-center">4 spectacles à venir</p>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <span className="inline-block bg-transparent border-2 border-yellow-400 text-yellow-400 px-6 py-3 rounded hover:bg-yellow-400 hover:text-black transition duration-300 cursor-pointer">
            Découvrir tous les artistes
          </span>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
