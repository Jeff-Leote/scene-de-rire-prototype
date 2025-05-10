
import { useState } from 'react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <>
      <header id="header" className="bg-black text-white py-4 px-6 fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <i className="fa-solid fa-microphone-lines text-yellow-400 text-2xl mr-2"></i>
            <span className="text-2xl font-bold tracking-tight">L'espace comedie</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <span className="text-yellow-400 border-b-2 border-yellow-400 pb-1 cursor-pointer">Accueil</span>
            <span className="hover:text-yellow-400 transition duration-300 cursor-pointer">Spectacles</span>
            <span className="hover:text-yellow-400 transition duration-300 cursor-pointer">Le lieu</span>
            <span className="hover:text-yellow-400 transition duration-300 cursor-pointer">Réservation</span>
            <span className="hover:text-yellow-400 transition duration-300 cursor-pointer">Contact</span>
          </nav>
          
          {/* Right section */}
          <div className="flex items-center space-x-4">
            <span className="hover:text-yellow-400 transition duration-300 hidden md:block cursor-pointer">Connexion</span>
            <span className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300 hidden md:block cursor-pointer">Réserver</span>
            <button 
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div id="mobile-menu" className={`fixed inset-0 bg-black bg-opacity-95 z-40 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="h-full flex flex-col justify-center items-center">
          <button 
            className="absolute top-6 right-6 text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
          <nav className="flex flex-col space-y-6 text-center">
            <span className="text-yellow-400 text-2xl border-b-2 border-yellow-400 pb-1">Accueil</span>
            <span className="text-white text-2xl hover:text-yellow-400 transition duration-300">Spectacles</span>
            <span className="text-white text-2xl hover:text-yellow-400 transition duration-300">Le lieu</span>
            <span className="text-white text-2xl hover:text-yellow-400 transition duration-300">Réservation</span>
            <span className="text-white text-2xl hover:text-yellow-400 transition duration-300">Contact</span>
            <span className="text-white text-2xl hover:text-yellow-400 transition duration-300">Connexion</span>
            <span className="bg-yellow-400 text-black px-6 py-3 rounded text-xl mt-4 hover:bg-yellow-300 transition duration-300">Réserver</span>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
