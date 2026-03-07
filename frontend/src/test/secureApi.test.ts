import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SecureApiService } from '@/services/secureApi'

// Mock de fetch
global.fetch = vi.fn()

// Mock des utilitaires de sécurité
vi.mock('@/utils/security', () => ({
  addSecurityHeaders: vi.fn(() => ({
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  })),
  validateURL: vi.fn(() => true),
  checkRateLimit: vi.fn(() => true),
  getCSRFToken: vi.fn(() => null),
  sanitizeObject: vi.fn((obj) => obj)
}))

describe('SecureApiService', () => {
  let apiService: SecureApiService

  beforeEach(() => {
    vi.clearAllMocks()
    apiService = new SecureApiService('http://localhost:5000')
  })

  describe('Request Method', () => {
    it('should make successful requests', async () => {
      const mockResponse = { success: true, data: { id: 1 } }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService['request']('/test')
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should handle API errors', async () => {
      const mockError = { error: 'Bad Request' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockError)
      })

      await expect(apiService['request']('/test')).rejects.toThrow('Bad Request')
    })

    it('should handle network errors', async () => {
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(apiService['request']('/test')).rejects.toThrow('Erreur de connexion')
    })

    it('should handle rate limiting', async () => {
      const { checkRateLimit } = await import('@/utils/security')
      ;(checkRateLimit as any).mockReturnValueOnce(false)

      await expect(apiService['request']('/test', {}, 'login')).rejects.toThrow('Trop de tentatives')
    })

    it('should handle invalid URLs', async () => {
      const { validateURL } = await import('@/utils/security')
      ;(validateURL as any).mockReturnValueOnce(false)

      await expect(apiService['request']('/test')).rejects.toThrow('URL invalide')
    })
  })

  describe('Authentication Methods', () => {
    it('should login successfully', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1, email: 'test@example.com' } }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.login('test@example.com', 'password123')
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      )
    })

    it('should register successfully', async () => {
      const mockResponse = { token: 'test-token', user: { id: 1, email: 'test@example.com' } }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }

      const result = await apiService.register(userData)
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData)
        })
      )
    })

    it('should verify token successfully', async () => {
      const mockResponse = { id: 1, email: 'test@example.com' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.verifyToken()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/auth/me',
        expect.any(Object)
      )
    })
  })

  describe('Newsletter Methods', () => {
    it('should subscribe to newsletter', async () => {
      const mockResponse = { message: 'Inscription réussie' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.subscribeNewsletter('test@example.com')
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/newsletter/subscribe',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' })
        })
      )
    })

    it('should unsubscribe from newsletter', async () => {
      const mockResponse = { message: 'Désinscription réussie' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.unsubscribeNewsletter('test@example.com', 'token123')
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/newsletter/unsubscribe',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', token: 'token123' })
        })
      )
    })
  })

  describe('Contact Methods', () => {
    it('should send contact message', async () => {
      const mockResponse = { message: 'Message envoyé' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const contactData = {
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Hello world'
      }

      const result = await apiService.sendContactMessage(contactData)
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/contact',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(contactData)
        })
      )
    })
  })

  describe('Spectacle Methods', () => {
    it('should get all spectacles', async () => {
      const mockResponse = [{ id: 1, title: 'Show 1' }, { id: 2, title: 'Show 2' }]
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.getSpectacles()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/spectacles',
        expect.any(Object)
      )
    })

    it('should get spectacle by ID', async () => {
      const mockResponse = { id: 1, title: 'Show 1', description: 'Description' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.getSpectacle(1)
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/spectacles/1',
        expect.any(Object)
      )
    })
  })

  describe('Artist Methods', () => {
    it('should get all artists', async () => {
      const mockResponse = [{ id: 1, name: 'Artist 1' }, { id: 2, name: 'Artist 2' }]
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.getArtists()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/artistes',
        expect.any(Object)
      )
    })

    it('should get artist by ID', async () => {
      const mockResponse = { id: 1, name: 'Artist 1', biography: 'Bio' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.getArtist(1)
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/artistes/1',
        expect.any(Object)
      )
    })
  })

  describe('Admin Methods', () => {
    it('should get newsletter subscribers', async () => {
      const mockResponse = [{ email: 'test1@example.com' }, { email: 'test2@example.com' }]
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.getNewsletterSubscribers()
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/admin/newsletter/subscribers',
        expect.any(Object)
      )
    })

    it('should send newsletter email', async () => {
      const mockResponse = { message: 'Email envoyé' }
      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(mockResponse)
      })

      const emailData = {
        subject: 'Newsletter',
        message: 'Hello subscribers',
        recipients: ['test@example.com']
      }

      const result = await apiService.sendNewsletterEmail(emailData)
      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/admin/newsletter/send',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(emailData)
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle 400 errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad Request' })
      })

      await expect(apiService.login('test@example.com', 'password')).rejects.toThrow('Bad Request')
    })

    it('should handle 401 errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(apiService.verifyToken()).rejects.toThrow('Non autorisé')
    })

    it('should handle 403 errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403
      })

      await expect(apiService.getNewsletterSubscribers()).rejects.toThrow('Accès interdit')
    })

    it('should handle 404 errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(apiService.getSpectacle(999)).rejects.toThrow('Ressource non trouvée')
    })

    it('should handle 429 errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429
      })

      await expect(apiService.login('test@example.com', 'password')).rejects.toThrow('Trop de requêtes')
    })

    it('should handle 500 errors', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(apiService.getSpectacles()).rejects.toThrow('Erreur serveur interne')
    })

    it('should handle unknown status codes', async () => {
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 418
      })

      await expect(apiService.getSpectacles()).rejects.toThrow('Erreur 418')
    })
  })
})
