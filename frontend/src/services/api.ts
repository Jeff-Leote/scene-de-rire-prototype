import { getCSRFToken } from '@/utils/security';

// Base URL déduite intelligemment:
// - En production: utiliser VITE_API_URL si défini
// - En développement (vite, localhost/lan): cibler automatiquement le backend sur :5000
const getDefaultBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.');
    if (isLocal) {
      return `${protocol}//localhost:5000`;
    }
  }

  // Fallback production
  return 'https://scene-de-rire-prototype.onrender.com';
};

const API_BASE_URL = getDefaultBaseUrl();

/**
 * Service API centralisé avec gestion automatique des tokens CSRF
 */
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Effectue une requête HTTP avec gestion automatique des tokens CSRF
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Récupérer automatiquement le token CSRF
    const csrfToken = getCSRFToken();

    // Préparer les en-têtes avec le token CSRF
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...(options.headers as Record<string, string>),
    };

    // Ajouter le token d'authentification si disponible
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
        let errorDetails: any = {};

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData;
        } catch {
          // Si la réponse n'est pas du JSON, utiliser le statut
          switch (response.status) {
            case 400:
              errorMessage = 'Requête invalide';
              break;
            case 401:
              errorMessage = 'Non autorisé - Veuillez vous reconnecter';
              break;
            case 403:
              errorMessage = 'Accès interdit - Token CSRF manquant ou invalide';
              break;
            case 404:
              errorMessage = 'Ressource non trouvée';
              break;
            case 429:
              errorMessage = 'Trop de requêtes - Veuillez ralentir';
              break;
            case 500:
              errorMessage = 'Erreur serveur interne';
              break;
            default:
              errorMessage = `Erreur ${response.status}`;
          }
        }

        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).details = errorDetails;
        throw error;
      }

      // Traitement de la réponse
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return (await response.text()) as T;
      }
    } catch (error) {
      // Re-lancer l'erreur avec plus de contexte
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion inconnue');
    }
  }

  // ====== MÉTHODES GET ======

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // ====== MÉTHODES POST ======

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ====== MÉTHODES PUT ======

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ====== MÉTHODES DELETE ======

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ====== MÉTHODES PATCH ======

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // ====== MÉTHODES SPÉCIALISÉES ======

  /**
   * Upload de fichier avec gestion CSRF
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const csrfToken = getCSRFToken();
    const headers: Record<string, string> = {
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
    };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Erreur upload: ${response.status}`);
    }

    return response.json();
  }
}

// Instance singleton du service API
export const api = new ApiService();

// Export des types pour TypeScript
export type { ApiService };
