
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import { toast } from "@/hooks/use-toast";
import { ChevronDown, Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin, Clock } from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  privacy: boolean;
};

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    if (openFaq === id) {
      setOpenFaq(null);
    } else {
      setOpenFaq(id);
    }
  };

  const onSubmit = (data: FormData) => {
    // Here you would normally send the form data to your server

    
    toast({
      title: "Message envoyé",
      description: "Merci pour votre message, nous reviendrons vers vous rapidement.",
      duration: 5000,
    });
    
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeItem="Contact" />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 pt-24">
        {/* Introduction Section */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Contactez-nous</h1>
          <p className="text-xl text-gray-600">Une question ? Une suggestion ? Nous sommes à votre écoute.</p>
        </section>

        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Contact Information */}
          <section className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">Nous joindre</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="text-yellow-400 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Téléphone</h3>
                    <span className="text-yellow-400 hover:underline cursor-pointer">01 23 45 67 89</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-yellow-400 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Email</h3>
                    <span className="text-yellow-400 hover:underline cursor-pointer">contact@espacecomedia.fr</span>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="text-yellow-400 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Adresse</h3>
                    <p>123 Avenue de la Comédie<br />Quartier des Arts<br />75000 Paris</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-yellow-400 mt-1 w-6 h-6" />
                  <div className="ml-4">
                    <h3 className="font-semibold mb-1">Horaires d'ouverture</h3>
                    <p>Du mardi au samedi<br />13h30 - 19h30</p>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-10">
                <h3 className="font-semibold mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <span className="bg-black bg-opacity-10 hover:bg-opacity-20 text-yellow-400 p-3 rounded-full transition duration-300 cursor-pointer">
                    <Facebook className="h-5 w-5" />
                  </span>
                  <span className="bg-black bg-opacity-10 hover:bg-opacity-20 text-yellow-400 p-3 rounded-full transition duration-300 cursor-pointer">
                    <Instagram className="h-5 w-5" />
                  </span>
                  <span className="bg-black bg-opacity-10 hover:bg-opacity-20 text-yellow-400 p-3 rounded-full transition duration-300 cursor-pointer">
                    <Twitter className="h-5 w-5" />
                  </span>
                  <span className="bg-black bg-opacity-10 hover:bg-opacity-20 text-yellow-400 p-3 rounded-full transition duration-300 cursor-pointer">
                    <Youtube className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </section>
          
          {/* Contact Form */}
          <section className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <Input
                      id="firstName"
                      {...register("firstName", { required: true })}
                      className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-500">Ce champ est requis</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <Input
                      id="lastName"
                      {...register("lastName", { required: true })}
                      className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
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
                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">Veuillez entrer une adresse email valide</p>}
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <select
                    id="subject"
                    {...register("subject", { required: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="reservation">Réservation</option>
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
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="privacy" className="text-sm text-gray-600">
                      J'accepte que mes données soient traitées conformément à la <span className="text-yellow-400 hover:underline cursor-pointer">politique de confidentialité</span>.
                    </label>
                    {errors.privacy && <p className="mt-1 text-sm text-red-500">Vous devez accepter la politique de confidentialité</p>}
                  </div>
                </div>
                
                <div className="text-right">
                  <Button 
                    type="submit" 
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-md font-medium transition duration-300"
                  >
                    Envoyer
                  </Button>
                </div>
              </form>
            </div>
          </section>
        </div>
        
        {/* FAQ Section */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-yellow-400">Questions fréquentes</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-1')}
                >
                  Comment puis-je réserver des billets ?
                  <ChevronDown className={`text-yellow-400 transition-transform ${openFaq === 'faq-1' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-1' ? '' : 'hidden'}`}>
                  <p>Vous pouvez réserver vos billets directement sur notre site web en cliquant sur "Réserver", par téléphone ou au guichet de l'Espace Comédie pendant les heures d'ouverture.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-2')}
                >
                  Quelle est la politique d'annulation ?
                  <ChevronDown className={`text-yellow-400 transition-transform ${openFaq === 'faq-2' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-2' ? '' : 'hidden'}`}>
                  <p>Les billets peuvent être remboursés jusqu'à 48h avant le spectacle. Passé ce délai, aucun remboursement ne sera possible sauf cas exceptionnels.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-3')}
                >
                  L'Espace Comédie est-il accessible aux personnes à mobilité réduite ?
                  <ChevronDown className={`text-yellow-400 transition-transform ${openFaq === 'faq-3' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-3' ? '' : 'hidden'}`}>
                  <p>Oui, notre établissement est entièrement accessible aux personnes à mobilité réduite. Des places adaptées sont disponibles dans la salle et tous les espaces sont accessibles.</p>
                </div>
              </div>
              
              <div className="pb-2">
                <button 
                  className="flex justify-between items-center w-full text-left font-medium text-lg"
                  onClick={() => toggleFAQ('faq-4')}
                >
                  Peut-on louer l'Espace Comédie pour des événements privés ?
                  <ChevronDown className={`text-yellow-400 transition-transform ${openFaq === 'faq-4' ? 'transform rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 text-gray-600 ${openFaq === 'faq-4' ? '' : 'hidden'}`}>
                  <p>Oui, l'Espace Comédie peut être loué pour des événements privés, des soirées d'entreprise ou des conférences. Contactez-nous par email ou téléphone pour plus d'informations sur les disponibilités et tarifs.</p>
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
