 import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { checkPaymentStatus } from "../services/reservation";
import { toast } from "@/components/ui/sonner";
import { PaymentStatusResponse } from "../services/types";

// Fonction pour enregistrer une réservation annulée
const registerCancelledReservation = async (sessionId: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reservations/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'enregistrement de la réservation annulée');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("loading");
  const [message, setMessage] = useState<string>("Vérification du paiement...");
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionIdParam = searchParams.get("session_id");

    if (payment === "success" && sessionIdParam) {
      setSessionId(sessionIdParam);
      checkStatus(sessionIdParam);
    } else if (payment === "cancel") {
      setStatus("cancelled");
      setMessage("Paiement annulé");
      toast.error("Paiement annulé");
      
      // Enregistrer la réservation annulée si on a un session_id
      if (sessionIdParam) {
        setSessionId(sessionIdParam);
        registerCancelledReservation(sessionIdParam)
          .then(() => {
            console.log("Réservation annulée enregistrée");
          })
          .catch((error) => {
            console.error("Erreur lors de l'enregistrement:", error);
          });
      }
      
      // Rediriger vers la page mon compte après 3 secondes
      setTimeout(() => {
        navigate("/mon-compte");
      }, 5000);
    } else {
      navigate("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, navigate]);

  const checkStatus = async (sessionId: string) => {
    try {
      const result = await checkPaymentStatus(sessionId);
      setStatus(result.status);
      setMessage(result.message);
      
      // Afficher les toasts appropriés et rediriger
      if (result.status === 'paid') {
        toast.success("Réservation confirmée !");
        // Rediriger vers les réservations après 3 secondes
        setTimeout(() => {
          navigate("/mon-compte");
        }, 3000);
      } else if (result.status === 'failed') {
        toast.error("Échec de la réservation");
        // Rediriger vers la page de réservation après 3 secondes
        setTimeout(() => {
          navigate("/reservation");
        }, 3000);
      } else if (result.status === 'pending') {
        toast.info("Paiement en cours de traitement...");
        // Rediriger vers les réservations après 3 secondes
        setTimeout(() => {
          navigate("/mon-compte");
        }, 3000);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      setStatus("error");
      setMessage("Erreur lors de la vérification du paiement");
      toast.error("Erreur lors de la vérification du paiement");
      // Rediriger vers la page de réservation après 3 secondes
      setTimeout(() => {
        navigate("/reservation");
      }, 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "paid":
        return "fa-check-circle text-green-400";
      case "cancelled":
        return "fa-times-circle text-red-400";
      case "error":
        return "fa-exclamation-triangle text-yellow-400";
      default:
        return "fa-spinner fa-spin text-blue-400";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "paid":
        return "bg-green-900";
      case "cancelled":
        return "bg-red-900";
      case "error":
        return "bg-yellow-900";
      default:
        return "bg-blue-900";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header activeItem="Réservation" />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-md mx-auto text-center">
            <div className={`${getStatusColor()} rounded-lg p-8`}>
              <i className={`fa-solid ${getStatusIcon()} text-6xl mb-4`}></i>
              <h2 className="text-2xl font-bold mb-4">
                {status === "paid" && "Paiement Confirmé !"}
                {status === "cancelled" && "Paiement Annulé"}
                {status === "error" && "Erreur"}
                {status === "loading" && "Vérification..."}
              </h2>
              <p className="text-gray-300 mb-6">{message}</p>
              
              {sessionId && (
                <div className="bg-gray-800 rounded p-3 mb-4">
                  <p className="text-sm text-gray-400">Session ID:</p>
                  <p className="text-xs font-mono">{sessionId}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full transition"
                  onClick={() => navigate("/")}
                >
                  Retour à l'accueil
                </button>
                
                {status === "paid" && (
                  <button
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition"
                    onClick={() => navigate("/mon-compte")}
                  >
                    Voir mes réservations
                  </button>
                )}
                
                {status === "cancelled" && (
                  <button
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition"
                    onClick={() => navigate("/mon-compte")}
                  >
                    Voir mes réservations
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentStatus; 