
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, Facebook, Instagram, Globe, Phone, Mail, MapPin, Clock } from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  privacy: boolean;
};

const Contact = () => {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<FormData>();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Pré-remplir les champs si l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  const toggleFAQ = (id: string) => {
    if (openFaq === id) {
      setOpenFaq(null);
    } else {
      setOpenFaq(id);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!privacyAccepted) {
      toast.error("Vous devez accepter la politique de confidentialité pour envoyer le message");
      return;
    }

    try {
      const { api } = await import('@/services/api');
      const json = await api.post('/api/contact', data);
      toast.success("Message envoyé ! Merci pour votre message, nous reviendrons vers vous rapidement.");
      reset();
      setPrivacyAccepted(false); // Réinitialiser la case à cocher après envoi
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeItem="Contact" />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 pt-28 md:pt-32">
        {/* Introduction Section */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Contactez-nous</h1>
          <p className="text-xl text-gray-600">Une question ? Une suggestion ? Nous sommes à votre écoute.</p>
        </section>

        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Contact Information */}
          <section className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-red-500">Nous joindre</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="text-red-500 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Téléphone</h3>
                      <span className="text-red-500 hover:underline cursor-pointer">0667160943</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-red-500 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:lespacecomedie@gmail.com" className="text-red-500 hover:underline cursor-pointer">lespacecomedie@gmail.com</a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-red-500 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Adresse</h3>
                    <p>136 rue Solférino<br />59000 Lille</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-red-500 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Horaires d'ouverture</h3>
                    <p>Lundi–Vendredi : 18h–23h<br />Samedi–Dimanche : 16h–22h</p>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-10">
                <h3 className="font-semibold mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <a href="https://share.google/wyNIUTlnM8Zr7oszq" target="_blank" rel="noreferrer" className="bg-black bg-opacity-10 hover:bg-opacity-20 text-red-500 p-3 rounded-full transition duration-300 cursor-pointer" aria-label="Google">
                    <Globe className="h-5 w-5" />
                  </a>
                  <a href="https://www.facebook.com/share/1FYTKaxZrB/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="bg-black bg-opacity-10 hover:bg-opacity-20 text-red-500 p-3 rounded-full transition duration-300 cursor-pointer" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="https://www.instagram.com/lespacecomedie?igsh=MTBrNXcydjZmYzhhaA==" target="_blank" rel="noreferrer" className="bg-black bg-opacity-10 hover:bg-opacity-20 text-red-500 p-3 rounded-full transition duration-300 cursor-pointer" aria-label="Instagram">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
          
          {/* Contact Form */}
          <section className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-red-500">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <Input
                      id="firstName"
                      {...register("firstName", { required: true })}
                      className={`w-full ${errors.firstName ? 'border-red-500' : ''} ${user ? 'bg-gray-100' : ''}`}
                      readOnly={!!user}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-500">Ce champ est requis</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <Input
                      id="lastName"
                      {...register("lastName", { required: true })}
                      className={`w-full ${errors.lastName ? 'border-red-500' : ''} ${user ? 'bg-gray-100' : ''}`}
                      readOnly={!!user}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-500">Ce champ est requis</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse e-mail</label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                    className={`w-full ${errors.email ? 'border-red-500' : ''} ${user ? 'bg-gray-100' : ''}`}
                    readOnly={!!user}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">Veuillez entrer une adresse email valide</p>}
                  {user && <p className="mt-1 text-sm text-gray-500">Email pré-rempli depuis votre compte</p>}
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <select
                    id="subject"
                    {...register("subject", { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="spectacle">Spectacle</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea
                    id="message"
                    {...register("message", { required: true })}
                    rows={5}
                    className={`w-full ${errors.message ? 'border-red-500' : ''}`}
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-500">Ce champ est requis</p>}
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <Checkbox 
                      id="privacy" 
                      {...register("privacy", { required: true })}
                      checked={privacyAccepted}
                      onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="privacy" className="text-sm text-gray-600">
                      <span className="text-red-500 mr-1">*</span>
                      J'accepte que mes données soient traitées conformément à la <span className="text-red-500 hover:underline cursor-pointer">politique de confidentialité</span>.
                    </label>
                    {errors.privacy && <p className="mt-1 text-sm text-red-500">Vous devez accepter la politique de confidentialité</p>}
                  </div>
                </div>
                
                <div className="text-right relative group">
                  <Button 
                    type="submit" 
                    disabled={!privacyAccepted}
                    className={`px-8 py-3 rounded-md font-medium transition duration-300 ${
                      privacyAccepted 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Envoyer
                  </Button>
                  {!privacyAccepted && (
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Veuillez accepter la politique de confidentialité pour envoyer le message
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </section>
        </div>
        
        {/* FAQ Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-red-500">Questions fréquentes</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-1')}
                >
                  Où se situe l’Espace Comédie ?
                  <ChevronDown className={`text-red-500 transition-transform ${openFaq === 'faq-1' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-1' ? '' : 'hidden'}`}>
                  <p>L’Espace Comédie se trouve au 136 rue Solférino, en plein cœur de Lille. La salle se trouve au sous-sol du Jager, l’entrée se fait directement par le Jager. Un parking est à proximité pour se garer facilement.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-2')}
                >
                  Faut-il réserver ?
                  <ChevronDown className={`text-red-500 transition-transform ${openFaq === 'faq-2' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-2' ? '' : 'hidden'}`}>
                  <p>Oui, on recommande de réserver en ligne sur notre billetterie sécurisée. Vous recevrez vos billets par e-mail, il suffira de les présenter à l’entrée (version papier ou sur téléphone). Il est parfois possible de payer sur place si des places restent disponibles.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-3')}
                >
                  Est-il possible de boire et/ou manger sur place ?
                  <ChevronDown className={`text-red-500 transition-transform ${openFaq === 'faq-3' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-3' ? '' : 'hidden'}`}>
                  <p>Oui ! A l’Espace Comédie vous pouvez profiter de boissons et de planches apéritives pendant, avant ou après les spectacles. Les boissons sont servies et facturées exclusivement par le Jager, titulaire de la licence IV.</p>
                </div>
              </div>
              
              <div className="pb-2">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-4')}
                >
                  L’Espace Comédie est-il accessible aux personnes à mobilité réduite (PMR) ?
                  <ChevronDown className={`text-red-500 transition-transform ${openFaq === 'faq-4' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-4' ? '' : 'hidden'}`}>
                  <p>Notre salle se situe au sous-sol, sans ascenseur. L’accès peut donc être difficile pour certaines personnes à mobilité réduite. Nous avons déjà accueilli des spectateurs en fauteuil, aidés par notre équipe pour descendre les escaliers. Si vous êtes concerné, n’hésitez pas à nous contacter en amont afin que nous puissions vous accompagner dans les meilleures conditions possibles.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
