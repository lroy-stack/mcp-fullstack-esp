import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { WebAdminSidebar } from './WebAdminSidebar';
import { WebAdminHeader } from './WebAdminHeader';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

// Colores Enigma para el botón flotante
const ENIGMA_COLORS = {
  primary: '#237584',
  secondary: '#9FB289',
  accent: '#CB5910'
} as const;

export const WebAdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isDesktop, isLargeDesktop } = useResponsive();
  const location = useLocation();

  // Auto-open sidebar on desktop sizes
  useEffect(() => {
    if (isDesktop || isLargeDesktop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
      // Reset collapsed state on mobile
      setSidebarCollapsed(false);
    }
  }, [isDesktop, isLargeDesktop]);

  const isPersistentSidebar = isDesktop || isLargeDesktop;

  return (
    <div className="min-h-screen bg-ios-background">
      {/* Header responsivo */}
      <WebAdminHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Sidebar */}
      <WebAdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isPersistent={isPersistentSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Container - Responsive with sidebar and header */}
      <div className={cn(
        "transition-all duration-300 pt-16",
        "pb-6 lg:pb-8",
        isPersistentSidebar ? 
          (sidebarCollapsed ? "lg:ml-20" : "lg:ml-80") : ""
      )}>
        
        {/* Page Content - Responsive padding */}
        <main className={cn(
          "px-4 sm:px-6 py-6",
          isPersistentSidebar ? "lg:px-8" : "lg:px-8",
          // Add bottom padding for mobile bottom navigation
          "pb-24 lg:pb-6"
        )}>
          <Outlet />
        </main>
      </div>
      
      {/* Botón flotante para expandir sidebar - integrado con UI actual */}
      {isPersistentSidebar && sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className={cn(
            "fixed top-20 left-6 z-40 p-3 rounded-2xl group",
            "transition-all duration-300 ease-out",
            "hover:scale-105 active:scale-95",
            "hover:bg-white/30 active:bg-white/40"
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: `
              0 8px 20px rgba(0,0,0,0.12),
              0 4px 8px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.5)
            `
          }}
          title="Expandir sidebar"
        >
          {/* Efecto de brillo sutil */}
          <div 
            className="absolute top-0 left-4 right-4 h-px opacity-60"
            style={{ 
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
            }}
          />
          
          {/* Icono con color Enigma */}
          <ChevronRight 
            className="h-5 w-5 relative z-10 transition-all duration-300 group-hover:translate-x-0.5"
            strokeWidth={2}
            style={{
              color: ENIGMA_COLORS.primary,
              filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.1))`
            }}
          />
        </button>
      )}
    </div>
  );
};