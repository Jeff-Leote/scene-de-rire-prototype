import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Veuillez saisir votre adresse email');
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Veuillez saisir une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Inscription réussie ! Vous recevrez bientôt nos actualités.');
        setEmail('');
      } else {
        setMessage(data.error || 'Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } catch (error) {
      setMessage('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="bg-yellow-400 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-black mb-4">Restez informé des prochains spectacles</h2>
            <p className="text-gray-800 text-lg">Inscrivez-vous à notre newsletter et ne manquez aucun de nos événements. Promotions exclusives et nouvelles dates en avant-première.</p>
          </div>
          
          <div className="md:w-1/2">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email" 
                className="flex-grow px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder-gray-500" 
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg transition duration-300 whitespace-nowrap ${
                  isSubmitting 
                    ? 'bg-gray-600 text-white cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? 'Inscription...' : 'S\'abonner'}
              </button>
            </form>
            {message && (
              <p className={`text-sm mt-3 ${
                message.includes('réussie') ? 'text-green-700' : 'text-red-700'
              }`}>
                {message}
              </p>
            )}
            <p className="text-gray-700 text-sm mt-3">En vous inscrivant, vous acceptez notre politique de confidentialité.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
