
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, remember: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call (replace with actual authentication)
    setTimeout(() => {
      setIsLoading(false);
      
      if (!formData.email || !formData.password) {
        toast.error("Veuillez remplir tous les champs");
      } else {
        // Successful login would redirect here
        // window.location.href = '/dashboard';
        toast.error("Fonctionnalité de démonstration uniquement");
      }
    }, 1500);
  };

  return (
    <section id="login-page" className="min-h-[100vh] bg-black flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden">
      {/* Background effect elements */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] opacity-10 pointer-events-none">
        <div className="absolute bottom-10 left-10 transform rotate-12">
          <i className="fa-solid fa-microphone text-[120px] text-yellow-400"></i>
        </div>
        <div className="absolute bottom-20 right-20 transform -rotate-6">
          <i className="fa-solid fa-spotlight text-[100px] text-yellow-400"></i>
        </div>
      </div>
      
      {/* Minimal header */}
      <div id="minimal-header" className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-yellow-400 hover:text-yellow-300 transition flex items-center cursor-pointer">
            <i className="fa-solid fa-arrow-left mr-2"></i>
            <span>Retour aux spectacles</span>
          </Link>
          <div className="text-white font-bold text-xl">L'espace comedie</div>
        </div>
      </div>

      {/* Login form card */}
      <div id="login-card" className="w-full max-w-md bg-gray-900 rounded-lg shadow-2xl p-8 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Se connecter à votre espace</h1>
        
        <form id="login-form" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
            <Input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white focus:ring-yellow-400"
              placeholder="votre@email.com"
            />
          </div>
          
          {/* Password field */}
          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-300 mb-2">Mot de passe</label>
            <Input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white focus:ring-yellow-400"
              placeholder="••••••••"
            />
          </div>
          
          {/* Remember me checkbox */}
          <div className="flex items-center mb-6">
            <Checkbox 
              id="remember" 
              checked={formData.remember}
              onCheckedChange={handleCheckboxChange}
              className="w-4 h-4 bg-gray-800 border-gray-700 text-yellow-400"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-300">Rester connecté</label>
            <span className="ml-auto text-sm text-yellow-400 hover:text-yellow-300 cursor-pointer">Mot de passe oublié ?</span>
          </div>
          
          {/* Login button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-md transition-colors duration-200 mb-6 flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Connexion...
              </>
            ) : 'Se connecter'}
          </Button>
        </form>
        
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-sm text-gray-500">ou</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>
        
        {/* Create account button */}
        <Button className="w-full border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-medium py-3 px-4 rounded-md transition-colors duration-200 mb-6 bg-transparent">
          Créer un compte
        </Button>
        
        {/* Social login options */}
        <div id="social-login" className="space-y-3 mb-4">
          <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
            <i className="fa-brands fa-google mr-3 text-yellow-400"></i>
            Continuer avec Google
          </Button>
          <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
            <i className="fa-brands fa-facebook mr-3 text-yellow-400"></i>
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
