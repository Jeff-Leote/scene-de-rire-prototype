
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";

const formSchema = z.object({
  civility: z.enum(["monsieur", "madame"], {
    required_error: "Veuillez sélectionner une civilité",
  }),
  firstName: z.string().min(2, {
    message: "Le prénom doit contenir au moins 2 caractères",
  }),
  lastName: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  birthDate: z.date({
    required_error: "Veuillez sélectionner une date de naissance",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  password: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      civility: undefined,
      firstName: "",
      lastName: "",
      birthDate: undefined,
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    // Simuler l'envoi des données d'inscription (remplacer par une vraie API)
    setTimeout(() => {
      setIsLoading(false);
      console.log(values);
      toast.success("Inscription réussie ! Vous allez recevoir un email de confirmation.");
      form.reset();
    }, 1500);
  };

  return (
    <>
      <Header activeItem="Connexion" />
      
      <section id="register-page" className="min-h-[100vh] bg-black flex flex-col items-center justify-center py-8 px-4 relative overflow-hidden">
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
            <Link to="/connexion" className="text-yellow-400 hover:text-yellow-300 transition flex items-center cursor-pointer">
              <i className="fa-solid fa-arrow-left mr-2"></i>
              <span>Retour à la connexion</span>
            </Link>
            <div className="text-white font-bold text-xl">L'espace comedie</div>
          </div>
        </div>

        {/* Registration form card */}
        <div id="register-card" className="w-full max-w-md bg-gray-900 rounded-lg shadow-2xl p-8 border border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Créez votre compte</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Civility field */}
              <FormField
                control={form.control}
                name="civility"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-300">Civilité</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monsieur" id="monsieur" className="border-gray-700 text-yellow-400" />
                          <label htmlFor="monsieur" className="text-white cursor-pointer">Monsieur</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="madame" id="madame" className="border-gray-700 text-yellow-400" />
                          <label htmlFor="madame" className="text-white cursor-pointer">Madame</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              {/* First name & Last name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Prénom</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre prénom" 
                          className="bg-gray-800 border border-gray-700 text-white focus:ring-yellow-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Nom</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Votre nom" 
                          className="bg-gray-800 border border-gray-700 text-white focus:ring-yellow-400"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Birth date field */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-300">Date de naissance</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full bg-gray-800 border border-gray-700 text-left font-normal",
                              !field.value && "text-gray-500"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Sélectionnez une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border border-gray-700" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="p-3 bg-gray-800 text-white pointer-events-auto"
                          classNames={{
                            day_selected: "bg-yellow-400 text-black hover:bg-yellow-400",
                            day_today: "bg-gray-700 text-white",
                            day: "hover:bg-gray-700"
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="votre@email.com" 
                        type="email"
                        className="bg-gray-800 border border-gray-700 text-white focus:ring-yellow-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              {/* Password field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password"
                        className="bg-gray-800 border border-gray-700 text-white focus:ring-yellow-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              {/* Confirm Password field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password"
                        className="bg-gray-800 border border-gray-700 text-white focus:ring-yellow-400"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              {/* Submit button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-md transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Inscription...
                  </>
                ) : 'Créer mon compte'}
              </Button>
            </form>
          </Form>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-700"></div>
            <span className="px-3 text-sm text-gray-500">ou</span>
            <div className="flex-grow h-px bg-gray-700"></div>
          </div>
          
          {/* Social signup options */}
          <div id="social-login" className="space-y-3">
            <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
              <i className="fa-brands fa-google mr-3 text-yellow-400"></i>
              S'inscrire avec Google
            </Button>
            <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center">
              <i className="fa-brands fa-facebook mr-3 text-yellow-400"></i>
              S'inscrire avec Facebook
            </Button>
          </div>
          
          {/* Already have account */}
          <div className="mt-6 text-center text-gray-400">
            Vous avez déjà un compte ?{' '}
            <Link to="/connexion" className="text-yellow-400 hover:text-yellow-300">
              Connectez-vous
            </Link>
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
    </>
  );
};

export default Register;
