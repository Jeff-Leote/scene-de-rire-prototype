import { useState } from 'react'
import { useSecurity } from '@/hooks/useSecurity'
import { secureApi } from '@/services/secureApi'
import { newsletterFormSchema } from '@/utils/security'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const {
    validateEmailField,
    isSubmitting,
    setIsSubmitting,
    clearErrors,
    errors,
    checkRateLimitForAction,
    isRateLimited,
    resetTime,
    sanitizeInput,
    handleSecurityError,
    clearSecurityError
  } = useSecurity()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Nettoyer les erreurs précédentes
    clearErrors()
    clearSecurityError()
    setMessage('')
    setMessageType('')

    // Validation côté client
    if (!email) {
      setMessage('Veuillez saisir votre adresse email')
      setMessageType('error')
      return
    }

    // Validation avec nos utilitaires de sécurité
    const isValidEmail = validateEmailField(email, 'email')
    if (!isValidEmail) {
      const emailError = errors.find(e => e.field === 'email')
      setMessage(emailError?.message || 'Email invalide')
      setMessageType('error')
      return
    }

    // Vérification du rate limiting
    if (!checkRateLimitForAction('newsletter', 10, 60 * 60 * 1000)) {
      setMessage('Trop de tentatives. Veuillez réessayer plus tard.')
      setMessageType('error')
      return
    }

    setIsSubmitting(true)

    try {
      // Sanitisation de l'email
      const sanitizedEmail = sanitizeInput(email)
      
      // Validation avec Zod
      const validatedData = newsletterFormSchema.parse({ email: sanitizedEmail })
      
      // Appel API sécurisé
      const response = await secureApi.subscribeNewsletter(validatedData.email)
      
      setMessage('Inscription réussie ! Vous recevrez bientôt nos actualités.')
      setMessageType('success')
      setEmail('')
      
    } catch (error: any) {
      if (error.name === 'ZodError') {
        setMessage('Format d\'email invalide')
        setMessageType('error')
      } else if (error.status === 429) {
        setMessage('Trop de tentatives. Veuillez réessayer plus tard.')
        setMessageType('error')
      } else {
        const errorMessage = error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.'
        setMessage(errorMessage)
        setMessageType('error')
        handleSecurityError(error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    // Validation en temps réel
    if (value) {
      validateEmailField(value, 'email')
    } else {
      clearErrors()
    }
  }

  const getRateLimitMessage = () => {
    if (!isRateLimited || !resetTime) return null
    
    const now = new Date()
    const timeLeft = Math.ceil((resetTime.getTime() - now.getTime()) / 1000 / 60)
    
    return `Trop de tentatives. Réessayez dans ${timeLeft} minute${timeLeft > 1 ? 's' : ''}.`
  }

  return (
    <section id="newsletter" className="bg-yellow-400 py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-black mb-4">
              Restez informé des prochains spectacles
            </h2>
            <p className="text-gray-800 text-lg">
              Inscrivez-vous à notre newsletter et ne manquez aucun de nos événements. 
              Promotions exclusives et nouvelles dates en avant-première.
            </p>
          </div>
          
          <div className="md:w-1/2">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <input 
                  type="email" 
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Votre adresse email" 
                  className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black placeholder-gray-500 ${
                    errors.some(e => e.field === 'email') ? 'border-2 border-red-500' : ''
                  }`}
                  disabled={isSubmitting || isRateLimited}
                />
                {errors.some(e => e.field === 'email') && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.find(e => e.field === 'email')?.message}
                  </p>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting || isRateLimited}
                className={`px-6 py-3 rounded-lg transition duration-300 whitespace-nowrap ${
                  isSubmitting || isRateLimited
                    ? 'bg-gray-600 text-white cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? 'Inscription...' : 'S\'abonner'}
              </button>
            </form>
            
            {/* Messages */}
            {message && (
              <p className={`text-sm mt-3 ${
                messageType === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message}
              </p>
            )}
            
            {/* Message de rate limiting */}
            {getRateLimitMessage() && (
              <p className="text-red-700 text-sm mt-3">
                {getRateLimitMessage()}
              </p>
            )}
            
            <p className="text-gray-700 text-sm mt-3">
              En vous inscrivant, vous acceptez notre politique de confidentialité.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
