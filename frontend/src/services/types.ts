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
