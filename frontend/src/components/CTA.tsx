
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section id="cta" className="bg-gray-950 py-16">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Prêt à rire ?</h2>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">Découvrez notre programmation et réservez vos places pour les meilleurs spectacles d'humour.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/spectacles"
            className="bg-red-500 text-white px-8 py-4 rounded-lg hover:bg-red-600 transition duration-300 font-bold cursor-pointer"
          >
            Voir les spectacles
          </Link>
          <Link 
            to="/contact"
            className="border-2 border-red-500 text-red-500 px-8 py-4 rounded-lg hover:bg-red-500 hover:text-white transition duration-300 font-bold cursor-pointer"
          >
            Contacter l'équipe
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
