import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import { Link, useLocation } from 'react-router-dom';

const MyAccount = () => {
  const { user, token, login, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    civility: user?.civility || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    const session_id = params.get('session_id');
    if (payment === 'success' && session_id && user) {
      // Récupérer le panier depuis le localStorage (clé à adapter selon ton contexte)
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const nbBillets = JSON.parse(localStorage.getItem('nbBillets') || '{}');
      // Calcul du montant total
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const montant = cart.reduce((sum: number, item: any) => sum + (item.prix * (nbBillets[item.id] || 1)), 0);
      // Construction du payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spectacles = cart.map((item: any) => ({ id: item.id, billets: nbBillets[item.id] || 1 }));
      fetch('http://localhost:5000/api/reservations/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          spectacles,
          session_id,
          montant
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast.success('Réservation enregistrée avec succès !');
            // Optionnel : vider le panier
            localStorage.removeItem('cart');
            localStorage.removeItem('nbBillets');
          } else {
            toast.error('Erreur lors de l\'enregistrement de la réservation.');
          }
        })
        .catch(() => toast.error('Erreur lors de l\'enregistrement de la réservation.'));
    } else if (payment === 'success') {
      toast.success('Paiement réussi ! Merci pour votre réservation.');
    } else if (payment === 'cancel') {
      toast.error('Paiement annulé. Votre réservation n\'a pas été finalisée.');
    }
  }, [location.search, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: user?.id,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la mise à jour du profil");
      }

      // Mettre à jour le contexte d'authentification avec les nouvelles informations
      login(data.token, data.user);
      
      toast.success("Profil mis à jour avec succès !");
      setIsEditing(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: user?.id
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression du compte");
      }

      toast.success("Compte supprimé avec succès");
      logout();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression du compte");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* En-tête de la page */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Mon Compte</h1>
              <p className="text-gray-400">Gérez vos informations personnelles</p>
            </div>
            <Link 
              to="/" 
              className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300 flex items-center space-x-2"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Retour à l'accueil</span>
            </Link>
          </div>

          {/* Carte principale */}
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-8">
            <div className="relative h-48 bg-gradient-to-r from-yellow-400 to-yellow-600">
              <div className="absolute bottom-0 left-0 p-8">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-white overflow-hidden">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-gray-200">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              {!isEditing ? (
                // Affichage des informations
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Informations Personnelles</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 mb-1">Civilité</p>
                      <p className="text-lg text-white">{user?.civility}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 mb-1">Email</p>
                      <p className="text-lg text-white">{user?.email}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 mb-1">Prénom</p>
                      <p className="text-lg text-white">{user?.firstName}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 mb-1">Nom</p>
                      <p className="text-lg text-white">{user?.lastName}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Formulaire d'édition
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Modifier mes informations</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="text-gray-400 hover:text-white transition duration-300"
                      disabled={isLoading}
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <label className="block text-gray-400 mb-2">Civilité</label>
                      <select
                        name="civility"
                        value={formData.civility}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                        disabled={isLoading}
                      >
                        <option value="M.">M.</option>
                        <option value="Mme">Mme</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <label className="block text-gray-400 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <label className="block text-gray-400 mb-2">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <label className="block text-gray-400 mb-2">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Section des réservations */}
          <div className="bg-gray-900 rounded-lg overflow-hidden mb-8">
            <div className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Mes Réservations</h3>
              <div className="text-center py-8">
                <div className="bg-gray-800 rounded-lg p-8">
                  <i className="fa-regular fa-calendar text-4xl text-gray-600 mb-4"></i>
                  <p className="text-gray-400 mb-4">Vous n'avez pas encore de réservations</p>
                  <Link 
                    to="/spectacles"
                    className="inline-block bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition duration-300"
                  >
                    Découvrir les spectacles
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Section de suppression du compte */}
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-red-500 mb-4">Supprimer mon compte</h3>
                <p className="text-gray-400 mb-6">
                  La suppression de votre compte est une action irréversible. Toutes vos données seront définitivement supprimées.
                </p>
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition duration-300"
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>

          {/* Modal de confirmation de suppression */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-2xl font-semibold text-red-500 mb-4">Confirmer la suppression</h3>
                <p className="text-gray-300 mb-6">
                  Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront définitivement supprimées.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition duration-300"
                    disabled={isDeleting}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccount; 