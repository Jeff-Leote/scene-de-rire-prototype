import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { ArrowLeft, Mic, Lightbulb, Mail, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  // Récupérer l'URL de redirection depuis les paramètres
  const redirectUrl = searchParams.get('redirect');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, remember: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { api } = await import('@/services/api');
      const data = await api.post<{ token: string; user: any }>('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Utiliser le contexte d'authentification pour stocker les informations
      login(data.token, data.user);

      toast.success('Connexion réussie !');

      // Rediriger vers l'URL spécifiée ou la page d'accueil
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="login-page"
      className="min-h-[100vh] bg-black flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden"
    >
      {/* Background effect elements */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] opacity-10 pointer-events-none">
        <div className="absolute bottom-10 left-10 transform rotate-12">
          <Mic className="w-[120px] h-[120px] text-red-500" />
        </div>
        <div className="absolute bottom-20 right-20 transform -rotate-6">
          <Lightbulb className="w-[100px] h-[100px] text-red-500" />
        </div>
      </div>

      {/* Minimal header */}
      <div id="minimal-header" className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-red-500 hover:text-red-400 transition flex items-center cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Retour aux spectacles</span>
          </Link>
          <div className="text-white font-bold text-xl">L'espace comedie</div>
        </div>
      </div>

      {/* Login form card */}
      <div id="login-card" className="w-full max-w-md bg-gray-900 rounded-lg shadow-2xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Se connecter à votre espace</h1>

        {redirectUrl && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-200">Vous devez être connecté pour accéder à cette page.</p>
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white focus:ring-red-500"
              placeholder="votre@email.com"
            />
          </div>

          {/* Password field */}
          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-300 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full bg-gray-800 border border-gray-700 text-white focus:ring-red-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center mb-6">
            <Checkbox
              id="remember"
              checked={formData.remember}
              onCheckedChange={handleCheckboxChange}
              className="w-4 h-4 bg-gray-800 border-gray-700 text-red-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
              Rester connecté
            </label>
            <span className="ml-auto text-sm text-red-500 hover:text-red-400 cursor-pointer">
              Mot de passe oublié ?
            </span>
          </div>

          {/* Login button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mb-6 flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">ou</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        {/* Create account button */}
        <Link to="/inscription">
          <Button className="w-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mb-6 bg-transparent">
            Créer un compte
          </Button>
        </Link>

        {/* Social login options */}
        <div id="social-login" className="space-y-3 mb-4">
          <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
            <Mail className="w-5 h-5 mr-3 text-red-500" />
            Continuer avec Google
          </Button>
          <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
            <Mail className="w-5 h-5 mr-3 text-red-500" />
            Continuer avec Facebook
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div id="footer" className="mt-8 text-center text-sm text-gray-500">
        <div className="flex justify-center space-x-4 mb-2">
          <span className="hover:text-gray-300 transition-colors cursor-pointer">Mentions légales</span>
          <span>•</span>
          <span className="hover:text-gray-300 transition-colors cursor-pointer">CGU</span>
          <span>•</span>
          <span className="hover:text-gray-300 transition-colors cursor-pointer">Politique de confidentialité</span>
        </div>
        <p>© 2025 L'espace comedie. Tous droits réservés.</p>
      </div>
    </section>
  );
};

export default Login;
