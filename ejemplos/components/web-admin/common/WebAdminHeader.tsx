import React from 'react';
import { Globe, ArrowLeft, Menu } from 'lucide-react';
import { IOSButton } from '@/components/ui/ios-button';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface WebAdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

export const WebAdminHeader: React.FC<WebAdminHeaderProps> = ({
  onMenuClick,
  sidebarOpen,
  sidebarCollapsed
}) => {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const shouldShowMenuButton = !isDesktop;
  const isPersistentSidebar = isDesktop;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-enigma-neutral-200",
      "h-16 px-4 sm:px-6 lg:px-8",
      "transition-all duration-300 ease-in-out"
    )}>
      <div 
        className="flex items-center justify-between h-full transition-all duration-300"
        style={{ 
          paddingLeft: isPersistentSidebar ? (sidebarCollapsed ? '5rem' : '20rem') : undefined 
        }}
      >
        <div className="flex items-center gap-4">
          {/* Botón de toggle del sidebar para tablet/mobile */}
          {shouldShowMenuButton && (
            <button
              onClick={onMenuClick}
              className={cn(
                "p-2 rounded-ios hover:bg-enigma-neutral-100 transition-colors",
                "touch-manipulation",
                isMobile ? "mr-1" : "mr-2"
              )}
              aria-label="Abrir menú"
            >
              <Menu size={20} className="text-enigma-neutral-600" />
            </button>
          )}

          {/* Título y breadcrumb */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Globe 
                size={isDesktop ? 24 : 20} 
                className="text-enigma-primary" 
              />
              <h1 className={cn(
                "font-bold text-enigma-primary",
                isDesktop ? "text-xl" : "text-lg"
              )}>
                Web Admin
              </h1>
            </div>
          </div>
        </div>

        {/* Botón de volver al sistema principal */}
        <IOSButton
          variant="secondary"
          size={isMobile ? "sm" : "md"}
          onClick={() => window.close()}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {!isMobile && "Volver al Sistema"}
        </IOSButton>
      </div>
    </header>
  );
};