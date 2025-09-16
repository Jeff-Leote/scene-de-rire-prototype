
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="footer" className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center mb-4">
              <i className="fa-solid fa-microphone-lines text-red-500 text-2xl mr-2"></i>
              <span className="text-2xl font-bold">L'Espace Comédie Lille</span>
            </div>
            <p className="text-gray-400 mb-4">La référence pour découvrir et réserver les meilleurs spectacles d'humour.</p>
            <div className="flex space-x-4">
              <a href="https://share.google/wyNIUTlnM8Zr7oszq" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">
                <i className="fa-brands fa-google text-xl"></i>
              </a>
              <a href="https://www.facebook.com/share/1FYTKaxZrB/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">
                <i className="fa-brands fa-facebook-f text-xl"></i>
              </a>
              <a href="https://www.instagram.com/lespacecomedie?igsh=MTBrNXcydjZmYzhhaA==" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Accueil</Link></li>
              <li><Link to="/spectacles" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Spectacles</Link></li>
              <li><Link to="/le-lieu" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Le lieu</Link></li>
              <li><Link to="/reservation" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Réservation</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Contact</Link></li>
              <li><Link to="/connexion" className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Connexion</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text:white">Informations</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">FAQ</span></li>
              <li><span className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Mentions légales</span></li>
              <li><span className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">CGV</span></li>
              <li><span className="text-gray-400 hover:text-red-500 transition duration-300 cursor-pointer">Politique de confidentialité</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <i className="fa-solid fa-map-marker-alt text-red-500 mr-2"></i>
                <span className="text-gray-400">136 rue Solférino, 59000 Lille</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-phone text-red-500 mr-2"></i>
                <span className="text-gray-400">0667160943</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-envelope text-red-500 mr-2"></i>
                <span className="text-gray-400">contact@lespacecomedie.fr</span>
              </li>
              <li className="flex items-center">
                <i className="fa-solid fa-clock text-red-500 mr-2"></i>
                <span className="text-gray-400">Lundi–Vendredi : 18h–23h • Samedi–Dimanche : 16h–22h</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2025 Humor Prototype. Tous droits réservés.</p>
            <div className="flex items-center space-x-6">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/default-placeholder.png" alt="Payment methods" className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
