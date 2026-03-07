// Interfaces pour les utilisateurs
export interface User {
  id: number;
  email: string;
  civility: string;
  firstName: string;
  lastName: string;
  role: string;
  birthDate?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

// Interfaces pour les spectacles
export interface Spectacle {
  id: number;
  title: string;
  img: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  lieu: string;
  artiste_name: string;
  artiste_photo: string;
  artiste_id: number;
  places_disponibles?: number;
  lien_spectacle?: string;
}

// Interfaces pour les artistes
export interface Artist {
  id: number;
  name: string;
  photo: string;
  upcoming_shows: number;
}

export interface ArtistFormData {
  name: string;
  photo: string;
}

// Interfaces pour les réservations
export interface Reservation {
  reservation_id: number;
  nb_places: number;
  reservation_date: string;
  spectacle_id: number;
  title: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  lieu: string;
  img: string;
  artiste_name: string;
  artiste_photo: string;
  montant_paye?: number;
  paiement_statut?: boolean;
  date_paiement?: string;
}


// Interface pour les props du composant Header
export interface HeaderProps {
  activeItem?: string;
}

// Interface pour les props du composant ProtectedRoute
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

// Interfaces pour les avis
export interface Avis {
  id: number;
  user_id: number;
  spectacle_id: number;
  message: string;
  date: string;
  user_name?: string;
  spectacle_title?: string;
}

// Interfaces pour les paiements
export interface Paiement {
  id: number;
  montant: number;
  statut: boolean;
  date: string;
}

// Interfaces pour les formulaires
export interface SpectacleFormData {
  title: string;
  img: string;
  description: string;
  date_spectacle: string;
  heure_spectacle: string;
  prix: number;
  artiste_id: string;
  lieu: string;
  places_disponibles?: number;
}

// Interfaces spécifiques pages sponsorisées
export interface SponsoriseData {
  title: string;
  img: string;
  description: string;
  schedule: string;
  lieu: string;
  lien_spectacle: string;
  videoUrl?: string;
}

// Photo additionnelle (par catégorie)
export interface AdditionalPhoto {
  id: number;
  image_path: string;
}

// Interfaces pour les réponses API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Interfaces pour les contextes
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Interface pour l'artiste à l'affiche (Hero)
export interface FeaturedArtist {
  id: number;
  name: string;
  photo: string;
  next_show?: {
    id: number;
    date: string;
    time: string;
    title: string;
    image: string;
  };
}

// Interface pour la réponse du statut de paiement
export interface PaymentStatusResponse {
  status: 'paid' | 'failed' | 'pending';
  message: string;
  sessionId?: string;
}

export interface AvailabilityResponse {
  spectacle_id: number;
  spectacle_title: string;
  places_total: number;
  places_reservees: number;
  places_restantes: number;
  disponible: boolean;
}

// Interfaces pour les codes promo
export interface PromoCode {
  id: number;
  code: string;
  type: 'percentage' | 'fixed' | 'free_ticket';
  value: number; // Pourcentage de réduction, montant fixe, ou nombre de tickets gratuits
  description: string;
  is_active: boolean;
  max_uses?: number;
  current_uses: number;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeFormData {
  code: string;
  type: 'percentage' | 'fixed' | 'free_ticket';
  value: string;
  description: string;
  is_active: boolean;
  max_uses?: string;
  valid_from?: string;
  valid_until?: string;
} 