import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { toast } from "@/components/ui/sonner";

interface AutoLogoutProps {
  timeout?: number;
}

const AutoLogout = ({ timeout = 5 * 60 * 1000 }: AutoLogoutProps) => {
  const { logout, token, user } = useAuth();
  const { maintenanceEnabled } = useMaintenance();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    // Si l'admin est en mode maintenance, ne pas activer le timeout
    if (maintenanceEnabled && user?.role === 'admin') {
      return;
    }

    if (timer.current) clearTimeout(timer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);

    // Toast 10s avant la fin
    warningTimer.current = setTimeout(() => {
      toast.warning("Vous allez être déconnecté pour inactivité dans 10 secondes.");
    }, timeout - 10_000);

    // Déconnexion
    timer.current = setTimeout(() => {
      logout();
      toast.error("Déconnecté pour inactivité.");
    }, timeout);
  }, [timeout, logout, maintenanceEnabled, user?.role]);

  useEffect(() => {
    if (!token) return;

    // Si l'admin est en mode maintenance, désactiver complètement le timeout
    if (maintenanceEnabled && user?.role === 'admin') {
      // Nettoyer les timers existants
      if (timer.current) clearTimeout(timer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timer.current) clearTimeout(timer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, [token, logout, timeout, resetTimer, maintenanceEnabled, user?.role]);

  return null;
};

export default AutoLogout;
