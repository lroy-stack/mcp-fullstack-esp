import React, { createContext, useContext, useEffect } from 'react';
import { useNotificationIntegration } from '@/hooks/useNotificationIntegration';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationSystemContextType {
  emitConfigurationChange: (
    changeType: 'hours' | 'capacity' | 'policy' | 'menu',
    changeData: any
  ) => void;
  checkTimeBasedEvents: () => Promise<void>;
  testNotificationSystem: () => Promise<void>;
}

const NotificationSystemContext = createContext<NotificationSystemContextType | undefined>(undefined);

interface NotificationSystemProviderProps {
  children: React.ReactNode;
}

export function NotificationSystemProvider({ children }: NotificationSystemProviderProps) {
  const { user } = useAuth();
  const {
    emitConfigurationChange,
    checkTimeBasedEvents,
  } = useNotificationIntegration();
  
  // Inicializar sistema de notificaciones en tiempo real
  const { testNotificationSystem } = useRealtimeNotifications();

  // Inicializar el sistema de notificaciones cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      console.log('🔔 Sistema de notificaciones inicializado para usuario:', user.email);
      
      // Ejecutar verificación inicial de eventos basados en tiempo
      checkTimeBasedEvents();
      
      // Log para confirmar que el sistema en tiempo real está activo
      console.log('🔄 Sistema de notificaciones en tiempo real activado');
    }
  }, [user, checkTimeBasedEvents]);

  const value = {
    emitConfigurationChange,
    checkTimeBasedEvents,
    testNotificationSystem,
  };

  return (
    <NotificationSystemContext.Provider value={value}>
      {children}
    </NotificationSystemContext.Provider>
  );
}

export function useNotificationSystem() {
  const context = useContext(NotificationSystemContext);
  if (context === undefined) {
    throw new Error('useNotificationSystem must be used within a NotificationSystemProvider');
  }
  return context;
}