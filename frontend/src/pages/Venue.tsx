
import Header from "../components/Header";
import Footer from "../components/Footer";
import CTA from "../components/CTA";

const Venue = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Le lieu" />
      <main>
        {/* Hero Section */}
        <section id="hero-banner" className="relative h-[500px] w-full overflow-hidden">
          <img 
            className="absolute w-full h-full object-cover opacity-80" 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/5f3d63cee9-148001036a85859b318f.png" 
            alt="comedy club theater interior with stage lights, audience seating, moody atmospheric lighting, cinematic" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div className="container mx-auto px-4 md:px-8 relative h-full flex flex-col justify-end pb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-yellow-400 mb-4">
              Bienvenue à L'Espace Comédie
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl text-white">
              Votre destination incontournable pour des soirées de rire au cœur de la ville
            </p>
          </div>
        </section>

        {/* Bloc description courte */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                Situé en plein cœur de la ville, L'Espace Comédie vous accueille pour des soirées de rire et de découvertes humoristiques dans une ambiance conviviale et intimiste.
              </p>
              <div className="flex items-center justify-center text-yellow-400 text-xl">
                <i className="fa-solid fa-location-dot text-3xl mr-3"></i>
                <p className="text-lg md:text-xl">123 rue de l'Humour, 75000 Paris</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc galerie */}
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-10 text-center">Découvrez notre espace</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover hover:scale-105 transition duration-500" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/be007dea67-2e01f6d407e07032c9e1.png" alt="entrance of a comedy club at night, neon sign, urban setting" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover hover:scale-105 transition duration-500" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/721bdc13c4-a24fa372794dffaf407d.png" alt="interior view of comedy club theater with red seats, stage lighting, intimate atmosphere" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover hover:scale-105 transition duration-500" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/bee416dcc6-04f48b566173114bd144.png" alt="comedy club stage with spotlight, microphone stand, brick wall background" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover hover:scale-105 transition duration-500" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/0e349654aa-6f8455e6169c7c1e3404.png" alt="cozy bar area in comedy club with bottles display, warm lighting, people chatting" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover hover:scale-105 transition duration-500" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/46cb8e9ed3-d167adbd5d5c14775578.png" alt="audience laughing at comedy show, diverse crowd, atmospheric lighting" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img className="w-full h-full object-cover hover:scale-105 transition duration-500" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/e4d0a855a9-40974d9391816a52bdb3.png" alt="comedy show posters and promotional materials on wall, colorful, artistic" />
              </div>
            </div>
          </div>
        </section>

        {/* Bloc accès / transports */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-yellow-400 mb-8 flex items-center">
                <i className="fa-solid fa-route mr-3"></i>Comment venir ?
              </h2>
              
              <p className="text-lg mb-8 leading-relaxed">
                À deux pas du centre-ville, L'Espace Comédie est facilement accessible en transports en commun ou à pied.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
                    <i className="fa-solid fa-train-subway mr-2"></i>Transports en commun
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fa-solid fa-subway mt-1 mr-3 text-yellow-400"></i>
                      <span>Métro : Station Saint-Michel (Ligne 4)</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-bus mt-1 mr-3 text-yellow-400"></i>
                      <span>Bus : Lignes 27, 38 et 85 (arrêt Saint-André-des-Arts)</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-bicycle mt-1 mr-3 text-yellow-400"></i>
                      <span>Stations Vélib' à proximité</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
                    <i className="fa-solid fa-car mr-2"></i>En voiture
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <i className="fa-solid fa-parking mt-1 mr-3 text-yellow-400"></i>
                      <span>Parking Saint-Michel (payant)</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-road mt-1 mr-3 text-yellow-400"></i>
                      <span>Stationnement payant dans les rues avoisinantes</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fa-solid fa-info-circle mt-1 mr-3 text-yellow-400"></i>
                      <span>Pensez à venir en avance les soirs de forte affluence</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc carte interactive */}
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">
                <i className="fa-solid fa-map-location-dot mr-3"></i>Nous situer
              </h2>
              
              <div className="rounded-lg overflow-hidden h-[400px] mb-6 relative">
                <img className="w-full h-full object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/41b6942021-dd24234583396c1fd68b.png" alt="stylized map with highlighted location pin at city center, street layout visible" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-full animate-pulse">
                    L'Espace Comédie
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <span className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-6 rounded-full flex items-center transition cursor-pointer">
                  <i className="fa-solid fa-directions mr-2"></i>
                  Itinéraire depuis votre position
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bloc infos pratiques */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-yellow-400 mb-12 text-center">Infos pratiques</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
                    <i className="fa-solid fa-clock mr-2"></i>Horaires
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span>Ouverture du bar</span>
                      <span>19h00</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Début des spectacles</span>
                      <span>20h30</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Fermeture</span>
                      <span>00h00</span>
                    </li>
                    <li className="text-yellow-400 text-sm mt-4">
                      Les horaires peuvent varier selon les événements
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
                    <i className="fa-solid fa-building-user mr-2"></i>Notre espace
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span>Capacité de la salle</span>
                      <span>120 places</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Places numérotées</span>
                      <span>Non</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Accessibilité PMR</span>
                      <span>Oui</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Vestiaire</span>
                      <span>Gratuit</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* FAQ */}
              <div className="bg-gray-900 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-400 mb-6 flex items-center">
                  <i className="fa-solid fa-circle-question mr-2"></i>Questions fréquentes
                </h3>
                
                <div className="space-y-6">
                  <div className="border-b border-gray-800 pb-4">
                    <h4 className="text-lg font-medium mb-2">Peut-on venir en groupe ?</h4>
                    <p className="text-gray-300">Bien sûr ! Pour les groupes de plus de 8 personnes, nous vous conseillons de réserver à l'avance pour garantir des places côte à côte.</p>
                  </div>
                  
                  <div className="border-b border-gray-800 pb-4">
                    <h4 className="text-lg font-medium mb-2">Le bar est-il ouvert avant et après le spectacle ?</h4>
                    <p className="text-gray-300">Oui, notre bar vous accueille 1h30 avant le début du spectacle et reste ouvert après la représentation pour prolonger votre soirée.</p>
                  </div>
                  
                  <div className="border-b border-gray-800 pb-4">
                    <h4 className="text-lg font-medium mb-2">Peut-on manger sur place ?</h4>
                    <p className="text-gray-300">Nous proposons une carte de snacking et de tapas à partager. Il n'est pas possible d'apporter sa propre nourriture.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-2">Y a-t-il un âge minimum pour assister aux spectacles ?</h4>
                    <p className="text-gray-300">La plupart de nos spectacles sont accessibles à partir de 12 ans. L'âge recommandé est indiqué sur la page de chaque spectacle.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-10 text-center">Ce qu'en disent nos spectateurs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-black p-6 rounded-lg">
                <div className="text-yellow-400 mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="italic mb-4">"Une salle à taille humaine qui permet une véritable proximité avec les artistes. On s'y sent comme chez soi !"</p>
                <p className="text-yellow-400 font-medium">Marie T.</p>
              </div>
              
              <div className="bg-black p-6 rounded-lg">
                <div className="text-yellow-400 mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="italic mb-4">"Le bar est super sympa, parfait pour prolonger la soirée après le spectacle et discuter avec d'autres spectateurs."</p>
                <p className="text-yellow-400 font-medium">Thomas B.</p>
              </div>
              
              <div className="bg-black p-6 rounded-lg">
                <div className="text-yellow-400 mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star-half-alt"></i>
                </div>
                <p className="italic mb-4">"Facile d'accès, une programmation variée et des découvertes à chaque fois. Un incontournable !"</p>
                <p className="text-yellow-400 font-medium">Sophie M.</p>
              </div>
            </div>
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Venue;
