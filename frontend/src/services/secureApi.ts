import { addSecurityHeaders, validateURL, checkRateLimit, getCSRFToken, sanitizeObject } from '@/utils/security';

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://scene-de-rire-prototype.onrender.com';

// Types pour les réponses API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Classe pour gérer les erreurs API
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Configuration des limites de taux
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 tentatives en 15 minutes
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 tentatives en 1 heure
  contact: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 tentatives en 1 heure
  default: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 tentatives par minute
};

/**
 * Service API sécurisé
 */
export class SecureApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Effectue une requête HTTP sécurisée
   */
  private async request<T>(endpoint: string, options: RequestInit = {}, rateLimitKey?: string): Promise<T> {
    // Validation de l'URL
    const url = `${this.baseURL}${endpoint}`;
    if (!validateURL(url)) {
      throw new ApiError('URL invalide', 400);
    }

    // Vérification du rate limiting
    if (rateLimitKey) {
      const limit = RATE_LIMITS[rateLimitKey as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
      if (!checkRateLimit(rateLimitKey, limit.maxAttempts, limit.windowMs)) {
        throw new ApiError('Trop de tentatives. Veuillez réessayer plus tard.', 429);
      }
    }

    // Préparation des en-têtes
    const headers = addSecurityHeaders(options.headers as Record<string, string>);

    // Ajout du token CSRF si disponible
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    // Ajout du token d'authentification si disponible
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Inclure les cookies
      });

      // Gestion des erreurs HTTP
      if (!response.ok) {
        let errorMessage = 'Erreur serveur';
        let errorCode: string | undefined;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorCode = errorData.code;
        } catch {
          // Si la réponse n'est pas du JSON, utiliser le statut
          switch (response.status) {
            case 400:
              errorMessage = 'Requête invalide';
              break;
            case 401:
              errorMessage = 'Non autorisé';
              break;
            case 403:
              errorMessage = 'Accès interdit';
              break;
            case 404:
              errorMessage = 'Ressource non trouvée';
              break;
            case 429:
              errorMessage = 'Trop de requêtes';
              break;
            case 500:
              errorMessage = 'Erreur serveur interne';
              break;
            default:
              errorMessage = `Erreur ${response.status}`;
          }
        }

        throw new ApiError(errorMessage, response.status, errorCode);
      }

      // Traitement de la réponse
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return sanitizeObject(data) as T;
      } else {
        return response.text() as T;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur de connexion', 0);
    }
  }

  // ====== MÉTHODES AUTHENTIFICATION ======

  /**
   * Connexion utilisateur
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return this.request(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      'login'
    );
  }

  /**
   * Inscription utilisateur
   */
  async register(userData: any): Promise<{ token: string; user: any }> {
    return this.request(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      'register'
    );
  }

  /**
   * Vérification du token utilisateur
   */
  async verifyToken(): Promise<any> {
    return this.request('/api/auth/me');
  }

  // ====== MÉTHODES CONTACT ======

  /**
   * Envoi d'un message de contact
   */
  async sendContactMessage(contactData: any): Promise<{ message: string }> {
    return this.request(
      '/api/contact',
      {
        method: 'POST',
        body: JSON.stringify(contactData),
      },
      'contact'
    );
  }

  // ====== MÉTHODES SPECTACLES ======

  /**
   * Récupération de tous les spectacles
   */
  async getSpectacles(): Promise<any[]> {
    return this.request('/api/spectacles');
  }

  /**
   * Récupération d'un spectacle par ID
   */
  async getSpectacle(id: number): Promise<any> {
    return this.request(`/api/spectacles/${id}`);
  }

  // ====== MÉTHODES ARTISTES ======

  /**
   * Récupération de tous les artistes
   */
  async getArtists(): Promise<any[]> {
    return this.request('/api/artistes');
  }

  /**
   * Récupération d'un artiste par ID
   */
  async getArtist(id: number): Promise<any> {
    return this.request(`/api/artistes/${id}`);
  }
}

// Instance singleton du service API
export const secureApi = new SecureApiService();

// Export des types
export type { ApiResponse, ApiError };
