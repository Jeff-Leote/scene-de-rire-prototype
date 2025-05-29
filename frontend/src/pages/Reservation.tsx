
import Header from "../components/Header";
import Footer from "../components/Footer";

const Reservation = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header activeItem="Réservation" />
      <main className="pt-24 pb-16 min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4">
          {/* Progress Bar */}
          <div id="progress-bar" className="mb-8">
            <div className="flex justify-between">
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-yellow-400 rounded-full text-black flex items-center justify-center">
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <div className="text-xs mt-2">Choix des places</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-gray-700 rounded-full text-white flex items-center justify-center">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">Informations</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <div className="relative">
                  <div className="w-10 h-10 mx-auto bg-gray-700 rounded-full text-white flex items-center justify-center">
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                  <div className="text-xs mt-2 text-gray-400">Paiement</div>
                </div>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-700"></div>
              <div className="absolute top-0 left-0 w-1/3 h-1 bg-yellow-400"></div>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column (2/3 width) */}
            <div id="booking-main-content" className="md:col-span-2">
              {/* Spectacle Info */}
              <div id="spectacle-info" className="bg-gray-900 rounded-lg p-4 mb-6 flex items-center">
                <div className="mr-4 w-24 h-32 overflow-hidden rounded-md">
                  <img className="w-full h-full object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/c63886b888-26d16bbc43c9935ea9a3.png" alt="comedy show performer on stage with microphone, dramatic lighting, professional photography" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-yellow-400">Gad Elmaleh - D'ailleurs</h1>
                  <p className="text-gray-300">One-man show • 1h30 • Tout public</p>
                  <div className="flex items-center mt-2">
                    <i className="fa-solid fa-star text-yellow-400"></i>
                    <i className="fa-solid fa-star text-yellow-400"></i>
                    <i className="fa-solid fa-star text-yellow-400"></i>
                    <i className="fa-solid fa-star text-yellow-400"></i>
                    <i className="fa-solid fa-star-half-alt text-yellow-400"></i>
                    <span className="ml-2 text-sm text-gray-300">(128 avis)</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Choose Date & Time */}
              <div id="step1-date-selection" className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fa-solid fa-calendar-days mr-2 text-yellow-400"></i>
                  Choisissez une date
                </h2>
                
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-4">
                  <button className="text-gray-400 hover:text-white">
                    <i className="fa-solid fa-chevron-left mr-1"></i>
                    Avril
                  </button>
                  <h3 className="text-lg font-medium">Mai 2025</h3>
                  <button className="text-gray-400 hover:text-white">
                    Juin
                    <i className="fa-solid fa-chevron-right ml-1"></i>
                  </button>
                </div>
                
                {/* Dates Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                  <button className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 text-center">
                    <div className="text-sm text-gray-400">Mer</div>
                    <div className="text-lg font-bold">7</div>
                    <div className="text-xs text-gray-400">20h00</div>
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 text-center">
                    <div className="text-sm text-gray-400">Jeu</div>
                    <div className="text-lg font-bold">8</div>
                    <div className="text-xs text-gray-400">20h00</div>
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 text-center">
                    <div className="text-sm text-gray-400">Ven</div>
                    <div className="text-lg font-bold">9</div>
                    <div className="text-xs text-gray-400">20h30</div>
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 text-center">
                    <div className="text-sm text-gray-400">Sam</div>
                    <div className="text-lg font-bold">10</div>
                    <div className="text-xs text-gray-400">20h30</div>
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 text-center">
                    <div className="text-sm text-gray-400">Dim</div>
                    <div className="text-lg font-bold">11</div>
                    <div className="text-xs text-gray-400">18h00</div>
                  </button>
                  <button className="bg-yellow-400 text-black rounded-md p-3 text-center relative">
                    <div className="text-sm">Mer</div>
                    <div className="text-lg font-bold">14</div>
                    <div className="text-xs">20h00</div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                      Promo
                    </div>
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 text-center">
                    <div className="text-sm text-gray-400">Jeu</div>
                    <div className="text-lg font-bold">15</div>
                    <div className="text-xs text-gray-400">20h00</div>
                  </button>
                  <button className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 text-center">
                    <div className="text-sm text-gray-400">Ven</div>
                    <div className="text-lg font-bold">16</div>
                    <div className="text-xs text-gray-400">20h30</div>
                  </button>
                </div>
              </div>

              {/* Step 2: Ticket Quantity */}
              <div id="step2-ticket-selection" className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fa-solid fa-ticket mr-2 text-yellow-400"></i>
                  Sélectionnez vos billets
                </h2>
                
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                    <div>
                      <div className="font-medium">Tarif plein</div>
                      <div className="text-sm text-gray-400">Adulte (18 ans et +)</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xl font-bold mr-4">25 €</div>
                      <div className="flex items-center">
                        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="mx-4 w-6 text-center">2</span>
                        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                    <div>
                      <div className="font-medium">Tarif réduit</div>
                      <div className="text-sm text-gray-400">Étudiant, -25 ans, chômeur</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xl font-bold mr-4">18 €</div>
                      <div className="flex items-center">
                        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="mx-4 w-6 text-center">0</span>
                        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Tarif groupe</div>
                      <div className="text-sm text-gray-400">À partir de 10 personnes</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xl font-bold mr-4">15 €</div>
                      <div className="flex items-center">
                        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="mx-4 w-6 text-center">0</span>
                        <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seat Selection (Optional) */}
              <div id="seat-selection" className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fa-solid fa-couch mr-2 text-yellow-400"></i>
                  Choisissez vos places (optionnel)
                </h2>
                
                <div className="bg-gray-900 rounded-lg p-6 text-center">
                  <div className="w-full mx-auto mb-6 relative">
                    <div className="w-3/4 h-8 bg-yellow-400 mx-auto rounded-t-3xl flex items-center justify-center text-black font-medium">
                      SCÈNE
                    </div>
                    
                    <div className="mt-8 grid grid-cols-12 gap-1 max-w-md mx-auto">
                      {/* Row 1 */}
                      <div className="col-span-12 text-xs text-gray-500 mb-1">Rangée A</div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-yellow-400 rounded-sm"></div>
                      <div className="w-5 h-5 bg-yellow-400 rounded-sm"></div>
                      <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
                      <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
                      <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      
                      {/* Row 2 */}
                      <div className="col-span-12 text-xs text-gray-500 my-1">Rangée B</div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
                      <div className="w-5 h-5 bg-red-500 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                      <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
                    </div>
                    
                    <div className="flex justify-center mt-6 space-x-6 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-800 rounded-sm mr-2"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-400 rounded-sm mr-2"></div>
                        <span>Sélectionné</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                        <span>Occupé</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="mt-4 text-gray-400 hover:text-white text-sm flex items-center mx-auto">
                    <i className="fa-solid fa-expand mr-1"></i>
                    Agrandir le plan de salle
                  </button>
                </div>
              </div>
              
              {/* Continue Button */}
              <div className="text-center mt-8">
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full text-lg transition">
                  Continuer
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>

            {/* Right Column (1/3 width) - Order Summary */}
            <div id="order-summary" className="md:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <i className="fa-solid fa-receipt mr-2 text-yellow-400"></i>
                  Résumé de votre commande
                </h2>
                
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex justify-between mb-2">
                    <div className="text-gray-300">Spectacle</div>
                    <div>Gad Elmaleh - D'ailleurs</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="text-gray-300">Date</div>
                    <div>Mercredi 14 mai 2025</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-gray-300">Heure</div>
                    <div>20h00</div>
                  </div>
                </div>
                
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex justify-between mb-2">
                    <div>Tarif plein × 2</div>
                    <div>50,00 €</div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div>Tarif réduit × 0</div>
                    <div>0,00 €</div>
                  </div>
                  <div className="flex justify-between">
                    <div>Tarif groupe × 0</div>
                    <div>0,00 €</div>
                  </div>
                </div>
                
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex justify-between">
                    <div className="text-gray-300">Frais de service</div>
                    <div>2,00 €</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center font-bold text-lg">
                  <div>Total</div>
                  <div className="text-yellow-400">52,00 €</div>
                </div>
                
                <div className="mt-6 text-sm text-gray-400">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-shield-halved mr-2"></i>
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-ticket-simple mr-2"></i>
                    E-billet envoyé par email
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-mobile-screen-button mr-2"></i>
                    Présentation sur mobile acceptée
                  </div>
                </div>
                
                <div className="mt-6 flex items-center">
                  <input type="text" placeholder="Code promo" className="bg-gray-800 border border-gray-700 rounded-l-md py-2 px-3 focus:outline-none focus:border-yellow-400 flex-grow" />
                  <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-r-md">
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Help Section */}
          <div id="help-section" className="mt-12 bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Besoin d'aide ?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
                <i className="fa-solid fa-phone text-yellow-400 text-2xl mb-2"></i>
                <h3 className="font-medium mb-1">Par téléphone</h3>
                <p className="text-sm text-gray-400">01 23 45 67 89<br/>Lun-Ven, 10h-19h</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
                <i className="fa-solid fa-envelope text-yellow-400 text-2xl mb-2"></i>
                <h3 className="font-medium mb-1">Par email</h3>
                <p className="text-sm text-gray-400">billetterie@comedieclub.fr<br/>Réponse sous 24h</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
                <i className="fa-solid fa-circle-question text-yellow-400 text-2xl mb-2"></i>
                <h3 className="font-medium mb-1">FAQ</h3>
                <p className="text-sm text-gray-400">Consultez notre aide en ligne<br/>et questions fréquentes</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reservation;
