import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";

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
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* En-tête de la page */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Mon Compte</h1>
            <p className="text-gray-400">Gérez vos informations personnelles</p>
          </div>

          {/* Carte principale */}
          <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-yellow-400">
            {!isEditing ? (
              // Affichage des informations
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-yellow-400">Informations Personnelles</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-300"
                  >
                    Modifier
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 mb-1">Civilité</p>
                    <p className="text-lg">{user?.civility}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Email</p>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Prénom</p>
                    <p className="text-lg">{user?.firstName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Nom</p>
                    <p className="text-lg">{user?.lastName}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Formulaire d'édition
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-yellow-400">Modifier mes informations</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-white transition duration-300"
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-1">Civilité</label>
                    <select
                      name="civility"
                      value={formData.civility}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-yellow-400"
                      disabled={isLoading}
                    >
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-yellow-400"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-yellow-400"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-yellow-400"
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

          {/* Section des réservations */}
          <div className="mt-12 bg-gray-900 rounded-lg shadow-xl p-8 border border-yellow-400">
            <h2 className="text-2xl font-semibold text-yellow-400 mb-6">Mes Réservations</h2>
            <div className="text-center text-gray-400">
              <p>Vous n'avez pas encore de réservations</p>
              <button className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded hover:bg-yellow-300 transition duration-300">
                Réserver un spectacle
              </button>
            </div>
          </div>

          {/* Section de suppression du compte */}
          <div className="mt-12 bg-gray-900 rounded-lg shadow-xl p-8 border border-red-600">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">Supprimer mon compte</h2>
              <p className="text-gray-400 mb-6">
                La suppression de votre compte est une action irréversible. Toutes vos données seront définitivement supprimées.
              </p>
              <button
                onClick={() => setShowDeleteConfirmation(true)}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition duration-300"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>

          {/* Modal de confirmation de suppression */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 p-8 rounded-lg border border-red-600 max-w-md w-full mx-4">
                <h3 className="text-2xl font-semibold text-red-600 mb-4">Confirmer la suppression</h3>
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
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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