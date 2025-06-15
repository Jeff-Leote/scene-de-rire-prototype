
const Footer = () => {
  return (
    <footer id="footer" className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <i className="fa-solid fa-microphone-lines text-yellow-400 text-2xl mr-2"></i>
              <span className="text-2xl font-bold">L'espace Comedie</span>
            </div>
            <p className="text-gray-400 mb-4">La référence pour découvrir et réserver les meilleurs spectacles d'humour.</p>
            <div className="flex space-x-4">
              <span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">
                <i className="fa-brands fa-facebook-f text-xl"></i>
              </span>
              <span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">
                <i className="fa-brands fa-instagram text-xl"></i>
              </span>
              <span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">
                <i className="fa-brands fa-twitter text-xl"></i>
              </span>
              <span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">
                <i className="fa-brands fa-youtube text-xl"></i>
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Navigation</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">Accueil</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">Spectacles</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">Artistes</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">La Salle</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">À propos</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">Contact</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Informations</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">FAQ</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">Mentions légales</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">CGV</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">Politique de confidentialité</span></li>
              <li><span className="text-gray-400 hover:text-yellow-400 transition duration-300 cursor-pointer">Plan du site</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <i className="fa-solid fa-map-marker-alt text-yellow-400 mr-2"></i>
                <span className="text-gray-400">123 rue de l'Humour, 75000 Paris</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-phone text-yellow-400 mr-2"></i>
                <span className="text-gray-400">01 23 45 67 89</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-envelope text-yellow-400 mr-2"></i>
                <span className="text-gray-400">contact@humorprototype.fr</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-clock text-yellow-400 mr-2"></i>
                <span className="text-gray-400">Ouvert du mardi au samedi de 18h à 23h</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 Humor Prototype. Tous droits réservés.</p>
            <div className="flex space-x-4">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/default-placeholder.png" alt="Payment methods" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
