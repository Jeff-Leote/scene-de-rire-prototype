import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userCheck, setUserCheck] = useState<{
    hasAccount: boolean;
    isSubscribed: boolean;
    email: string;
  } | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      checkUserAccount(emailParam);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const checkUserAccount = async (emailToCheck: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/newsletter/check-user/${encodeURIComponent(emailToCheck)}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserCheck(data);
        
        // Si l'utilisateur a un compte mais n'est pas connecté, rediriger vers la connexion
        if (data.hasAccount && !isAuthenticated) {
          const currentUrl = window.location.href;
          navigate(`/connexion?redirect=${encodeURIComponent(currentUrl)}`);
          return;
        }
        
        // Si l'utilisateur n'est pas inscrit à la newsletter
        if (!data.isSubscribed) {
          setIsUnsubscribed(true);
          toast.success('Cet email n\'était pas inscrit à la newsletter');
          return;
        }

        // Si l'utilisateur n'a pas de compte, désabonner directement
        if (!data.hasAccount) {
          await handleDirectUnsubscribe(emailToCheck);
          return;
        }

        // Si l'utilisateur a un compte et est connecté, afficher la page de confirmation
        setIsLoading(false);
      } else {
        toast.error('Erreur lors de la vérification de l\'email');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Erreur de connexion lors de la vérification');
      setIsLoading(false);
    }
  };

  const handleDirectUnsubscribe = async (emailToUnsubscribe: string) => {
    try {
      setIsUnsubscribing(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUnsubscribe }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsUnsubscribed(true);
        toast.success('Désabonnement direct réussi !');
      } else if (response.status === 403 && data.hasAccount) {
        // L'utilisateur a un compte, rediriger vers la connexion
        const currentUrl = window.location.href;
        navigate(`/connexion?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      } else {
        toast.error(data.error || 'Erreur lors du désabonnement');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsUnsubscribing(false);
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email) {
      toast.error('Email requis');
      return;
    }

    await handleDirectUnsubscribe(email);
  };

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de votre compte...</p>
        </div>
      </div>
    );
  }

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12 pt-24">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Désabonnement réussi !
            </h1>
            <p className="text-gray-600 mb-6">
              L'adresse <strong>{email}</strong> a été supprimée de notre liste de diffusion.
            </p>
            <p className="text-sm text-gray-500">
              Vous ne recevrez plus nos newsletters. Si vous changez d'avis, vous pouvez vous réabonner à tout moment.
            </p>
            <div className="mt-8">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition duration-300"
              >
                Retour à l'accueil
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-12 pt-24">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Se désabonner de la newsletter
            </h1>
            <p className="text-gray-600">
              Nous sommes désolés de vous voir partir. Confirmez votre désabonnement ci-dessous.
            </p>
            {user && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Connecté en tant que : <strong>{user.email}</strong>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="votre@email.com"
                disabled={!!searchParams.get('email')}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Attention
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      En vous désabonnant, vous ne recevrez plus nos newsletters avec les dernières actualités, 
                      les nouveaux spectacles et les offres spéciales d'Espace Comédie.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleUnsubscribe}
                disabled={isUnsubscribing || !email}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-medium py-3 px-6 rounded-lg transition duration-300"
              >
                {isUnsubscribing ? 'Désabonnement...' : 'Se désabonner'}
              </button>
              <a
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg text-center transition duration-300"
              >
                Annuler
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Unsubscribe;
