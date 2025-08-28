import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { User, AuthContextType, CartItem, CartContextType } from '../services/types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    console.log('🚪 Déconnexion en cours...');
    
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    
    // Réinitialiser l'état immédiatement
    setToken(null);
    setUser(null);
    
    console.log('✅ Déconnexion terminée');
  };

  useEffect(() => {
    const verifyToken = async () => {
      console.log('🔍 Vérification du token...');
      
      if (!token) {
        console.log('❌ Aucun token trouvé');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🌐 Vérification auprès de l\'API...');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com'}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        });

        if (!response.ok) {
          console.log('❌ Token invalide, réponse:', response.status);
          throw new Error("Session expirée ou utilisateur supprimé");
        }

        const userData = await response.json();
        console.log('✅ Token valide, utilisateur:', userData.email);
        setUser(userData);
      } catch (err) {
        console.log('❌ Erreur lors de la vérification du token:', err);
        toast.error("Votre session a expiré ou votre compte a été supprimé.");
        logout();
      } finally {
        // Ajouter un délai pour éviter les flashs en production
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    };

    verifyToken();
  }, [token]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Panier (Cart) Context

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Vider le panier quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
    }
  }, [isAuthenticated]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };
  const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
