
const Testimonials = () => {
  return (
    <section id="testimonials" className="bg-black py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Ce qu'en disent nos spectateurs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div id="testimonial-1" className="bg-gray-900 p-6 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="text-red-500">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
            <p className="text-gray-300 mb-6">"Ambiance incroyable, artistes de talent et organisation au top. Ma nouvelle salle préférée pour découvrir des humoristes !"</p>
            <div className="flex items-center">
              <img 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" 
                alt="Marie D." 
                className="w-10 h-10 rounded-full mr-3" 
              />
              <div>
                <h4 className="text-white font-bold">Marie D.</h4>
                <p className="text-gray-400 text-sm">Spectatrice régulière</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div id="testimonial-2" className="bg-gray-900 p-6 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="text-red-500">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star-half-alt"></i>
              </div>
            </div>
            <p className="text-gray-300 mb-6">"La billetterie en ligne est super pratique et la salle offre une proximité avec les artistes qu'on ne trouve pas ailleurs. Je recommande !"</p>
            <div className="flex items-center">
              <img 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" 
                alt="Thomas L." 
                className="w-10 h-10 rounded-full mr-3" 
              />
              <div>
                <h4 className="text-white font-bold">Thomas L.</h4>
                <p className="text-gray-400 text-sm">Fan d'humour</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div id="testimonial-3" className="bg-gray-900 p-6 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="text-red-500">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
              </div>
            </div>
            <p className="text-gray-300 mb-6">"J'ai découvert plusieurs artistes grâce à cette salle. La programmation est variée et de qualité. Un lieu incontournable pour les amateurs d'humour !"</p>
            <div className="flex items-center">
              <img 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg" 
                alt="Sophie M." 
                className="w-10 h-10 rounded-full mr-3" 
              />
              <div>
                <h4 className="text-white font-bold">Sophie M.</h4>
                <p className="text-gray-400 text-sm">Abonnée depuis 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
