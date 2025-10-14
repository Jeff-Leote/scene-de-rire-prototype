import React, { createContext, useContext, useEffect, useState } from 'react';

interface MaintenanceContextType {
  maintenanceEnabled: boolean;
  setMaintenanceEnabled: (enabled: boolean) => void;
  isLoading: boolean;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
  maintenanceEnabled: false,
  setMaintenanceEnabled: () => {},
  isLoading: true,
});

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/settings/maintenance`, { credentials: 'include' });
        const data = await res.json();
        setMaintenanceEnabled(Boolean(data?.maintenance_enabled));
      } catch {
        setMaintenanceEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkMaintenance();
  }, []);

  return (
    <MaintenanceContext.Provider value={{ maintenanceEnabled, setMaintenanceEnabled, isLoading }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => useContext(MaintenanceContext);
