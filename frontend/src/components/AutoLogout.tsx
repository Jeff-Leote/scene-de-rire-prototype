import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

interface AutoLogoutProps {
  timeout?: number;
}

const AutoLogout = ({ timeout = 5 * 60 * 1000 }: AutoLogoutProps) => {
  const { logout, token } = useAuth();
  const timer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
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
  };

  useEffect(() => {
    if (!token) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timer.current) clearTimeout(timer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return null;
};

export default AutoLogout;
