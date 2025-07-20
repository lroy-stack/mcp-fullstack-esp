import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, Coffee, Wine, Tag, Image, Phone, 
  FileText, BookOpen, Utensils, Glasses, Calendar, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

// Colores Enigma para cada sección
const ENIGMA_COLORS = {
  primary: '#237584',
  secondary: '#9FB289',
  accent: '#CB5910',
  analytics: '#007AFF'
} as const;

interface WebAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isPersistent?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigation = [
  {
    name: 'Inicio',
    href: '/panel-web-admin',
    icon: Home,
    description: 'Panel principal',
    color: ENIGMA_COLORS.primary
  },
  {
    name: 'Platos',
    href: '/panel-web-admin/platos',
    icon: Utensils,
    description: 'Menú de comidas',
    color: ENIGMA_COLORS.secondary
  },
  {
    name: 'Bebidas',
    href: '/panel-web-admin/bebidas',
    icon: Coffee,
    description: 'Carta de bebidas',
    color: ENIGMA_COLORS.accent
  },
  {
    name: 'Vinos',
    href: '/panel-web-admin/vinos',
    icon: Wine,
    description: 'Carta de vinos',
    color: ENIGMA_COLORS.analytics
  },
  {
    name: 'Alergenos',
    href: '/panel-web-admin/alergenos',
    icon: Tag,
    description: 'Gestión de alergenos',
    color: ENIGMA_COLORS.primary
  },
  {
    name: 'Filosofía',
    href: '/panel-web-admin/filosofia',
    icon: BookOpen,
    description: 'Nuestra historia',
    color: ENIGMA_COLORS.accent
  },
  {
    name: 'Contacto',
    href: '/panel-web-admin/contacto',
    icon: Phone,
    description: 'Información de contacto',
    color: ENIGMA_COLORS.analytics
  },
  {
    name: 'Reservas',
    href: '/panel-web-admin/reservas',
    icon: Calendar,
    description: 'Gestión de reservas',
    color: ENIGMA_COLORS.primary
  }
];

export function WebAdminSidebar({ 
  isOpen, 
  onClose, 
  isPersistent = false, 
  isCollapsed = false, 
  onToggleCollapse 
}: WebAdminSidebarProps) {
  const location = useLocation();
  const { isDesktop } = useResponsive();

  // Bloquear scroll del body cuando sidebar está abierto en modo no persistente
  useEffect(() => {
    if (!isPersistent && isOpen) {
      const scrollY = window.scrollY;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, isPersistent]);

  // Only render when explicitly opened or persistent
  if (!isOpen && !isPersistent) return null;

  return (
    <>
      {/* Overlay solo para modo no persistente */}
      {!isPersistent && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md transition-all duration-300"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            touchAction: 'none',
            overscrollBehavior: 'none'
          }}
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      {/* Sidebar con glassmorphismo */}
      <div 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 transform transition-all duration-300 ease-out",
          isPersistent && isCollapsed ? "w-20" : "w-80",
          !isPersistent && "max-w-[85vw]",
          isPersistent ? "translate-x-0" : (isOpen ? "translate-x-0" : "-translate-x-full")
        )}
        style={{
          touchAction: !isPersistent ? 'pan-y' : 'auto',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(40px) saturate(180%) brightness(110%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%) brightness(110%)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: `
            0 25px 50px rgba(0,0,0,0.2),
            0 10px 20px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.6)
          `
        }}
      >
        {/* Efecto de brillo lateral */}
        <div 
          className="absolute top-0 left-0 bottom-0 w-px opacity-40"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.8), transparent)'
          }}
        />
        
        {/* Gradiente de fondo dinámico */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            background: `
              radial-gradient(circle at 50% 20%, ${ENIGMA_COLORS.primary}40 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, ${ENIGMA_COLORS.secondary}40 0%, transparent 50%)
            `
          }}
        />

        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="h-16 border-b border-white/10 backdrop-blur-xl relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `
                  radial-gradient(circle at 20% 50%, #23758440 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, #9FB28940 0%, transparent 50%)
                `
              }}
            />
            <div className="flex items-center justify-between h-full px-6 relative z-10">
              <h2 className={cn(
                "font-bold bg-gradient-to-r from-enigma-primary to-enigma-secondary bg-clip-text text-transparent transition-all duration-200",
                isCollapsed ? "text-sm" : "text-lg"
              )}>
                {isCollapsed ? "WA" : "Web Admin"}
              </h2>
              {isPersistent && onToggleCollapse ? (
                <button
                  onClick={onToggleCollapse}
                  className="p-2 rounded-2xl hover:bg-white/10 transition-all duration-200 group"
                  title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                  ) : (
                    <ChevronLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                  )}
                </button>
              ) : !isPersistent && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-2xl hover:bg-white/10 transition-all duration-200 group"
                >
                  <X className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 overflow-y-auto space-y-1",
            isCollapsed ? "px-2 py-4" : "px-3 py-6"
          )}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                             (item.href !== '/panel-web-admin' && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center rounded-2xl transition-all duration-200 relative overflow-hidden mx-1",
                    "active:scale-95 hover:scale-102",
                    isActive && "transform -translate-x-1",
                    isCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3"
                  )}
                  style={{
                    background: isActive 
                      ? `linear-gradient(135deg, ${item.color}25, ${item.color}15)`
                      : 'transparent',
                    backdropFilter: isActive ? 'blur(10px)' : undefined,
                    border: isActive ? `1px solid ${item.color}30` : '1px solid transparent'
                  }}
                  onClick={onClose}
                >
                  {/* Efectos de resplandor para activo */}
                  {isActive && (
                    <>
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-20"
                        style={{ 
                          background: `radial-gradient(circle at center, ${item.color}60, transparent 70%)`,
                          filter: 'blur(8px)'
                        }}
                      />
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-10"
                        style={{ 
                          background: `linear-gradient(45deg, ${item.color}40, transparent, ${item.color}40)`
                        }}
                      />
                    </>
                  )}
                  
                  <div className={cn(
                    "relative z-10 flex items-center w-full",
                    isCollapsed && "justify-center"
                  )}>
                    {/* Icono */}
                    <div 
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden",
                        "group-active:scale-90",
                        !isCollapsed && "mr-4"
                      )}
                      style={{
                        backgroundColor: isActive ? item.color : `${item.color}15`,
                        boxShadow: isActive ? `0 4px 12px ${item.color}40` : 'none'
                      }}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {isActive && (
                        <div 
                          className="absolute inset-0 rounded-xl opacity-30"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      
                      <item.icon 
                        className={cn(
                          "h-5 w-5 transition-all duration-200 relative z-10",
                          isActive ? "text-white drop-shadow-lg" : "text-gray-600"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                        style={{
                          filter: isActive ? `drop-shadow(0 0 4px ${item.color}60)` : 'none'
                        }}
                      />
                    </div>
                    
                    {/* Contenido del texto */}
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 min-w-0">
                          <div 
                            className={cn(
                              "font-semibold text-base transition-all duration-200 truncate",
                              isActive ? "opacity-100" : "opacity-90"
                            )}
                            style={{
                              color: isActive ? item.color : '#374151'
                            }}
                          >
                            {item.name}
                          </div>
                          <div className={cn(
                            "text-sm mt-0.5 truncate transition-all duration-200",
                            isActive ? "opacity-80" : "opacity-60"
                          )}
                          style={{
                            color: isActive ? item.color : '#6B7280'
                          }}>
                            {item.description}
                          </div>
                        </div>

                        {/* Indicador activo */}
                        {isActive && (
                          <div className="ml-3">
                            <div 
                              className="w-2 h-8 rounded-full opacity-80"
                              style={{ 
                                background: `linear-gradient(180deg, ${item.color}, ${item.color}80)`,
                                boxShadow: `0 0 8px ${item.color}60`
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>

        </div>
      </div>
    </>
  );
}