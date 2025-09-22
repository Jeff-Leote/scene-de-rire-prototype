//src/components/Header.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useCart } from '@/contexts/AuthContext';
import { HeaderProps } from '@/services/types';

const Header = ({ activeItem }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  
  return (
    <>
      <header id="header" className="bg-black text-white py-4 px-6 fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-white rounded-lg p-2 md:p-3 shadow-lg">
              <img 
                src="/assets/img/logo-espace-comedie-lille.png" 
                alt="L'Espace Comédie Lille" 
                className="h-12 md:h-16 w-auto max-w-none"
              />
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${activeItem === 'Accueil' ? 'text-red-500 border-b-2 border-red-500 pb-1' : 'hover:text-red-500 transition duration-300'} cursor-pointer`}>
              Accueil
            </Link>
            <Link to="/spectacles" className={`${activeItem === 'Spectacles' ? 'text-red-500 border-b-2 border-red-500 pb-1' : 'hover:text-red-500 transition duration-300'} cursor-pointer`}>
              Programmation
            </Link>
            <Link to="/le-lieu" className={`${activeItem === 'Le lieu' ? 'text-red-500 border-b-2 border-red-500 pb-1' : 'hover:text-red-500 transition duration-300'} cursor-pointer`}>
              Le lieu
            </Link>
            <Link to="/contact" className={`${activeItem === 'Contact' ? 'text-red-500 border-b-2 border-red-500 pb-1' : 'hover:text-red-500 transition duration-300'} cursor-pointer`}>
              Contact
            </Link>
          </nav>
          
          {/* Right section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 hover:text-red-500 transition duration-300"
                >
                  <span>{user?.firstName} {user?.lastName}</span>
                  <i className={`fa-solid fa-chevron-${isUserMenuOpen ? 'up' : 'down'} text-sm`}></i>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-red-500 rounded shadow-lg py-2">
                    {user?.role === 'admin' && (
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 hover:bg-red-500 hover:text-white transition duration-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition duration-300"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            <a 
              href="https://www.billetweb.fr/multi_event.php?user=139847" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
            >
              Réserver
            </a>
            <button 
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
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
          
          {/* Logo mobile removed as requested */}
          
          <nav className="flex flex-col space-y-6 text-center">
            <Link to="/" className={`${activeItem === 'Accueil' ? 'text-red-500 text-2xl border-b-2 border-red-500 pb-1' : 'text-white text-2xl hover:text-red-500 transition duration-300'}`}>
              Accueil
            </Link>
            <Link to="/spectacles" className={`${activeItem === 'Spectacles' ? 'text-red-500 text-2xl border-b-2 border-red-500 pb-1' : 'text-white text-2xl hover:text-red-500 transition duration-300'}`}>
              Spectacles
            </Link>
            <Link to="/le-lieu" className={`${activeItem === 'Le lieu' ? 'text-red-500 text-2xl border-b-2 border-red-500 pb-1' : 'text-white text-2xl hover:text-red-500 transition duration-300'}`}>
              Le lieu
            </Link>
            {/* Lien texte Réservation (mobile) retiré */}
            <Link to="/contact" className={`${activeItem === 'Contact' ? 'text-red-500 text-2xl border-b-2 border-red-500 pb-1' : 'text-white text-2xl hover:text-red-500 transition duration-300'}`}>
              Contact
            </Link>
            <a 
              href="https://www.billetweb.fr/multi_event.php?user=139847" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-500 text-white px-6 py-3 rounded text-xl mt-4 hover:bg-red-600 transition duration-300"
            >
              Réserver
            </a>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
