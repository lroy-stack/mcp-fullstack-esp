// =============================================================================
// PÁGINA: WebAdminDashboard
// Dashboard principal del panel de administración web
// Adaptado desde AdminDashboardV2.tsx del proyecto original
// =============================================================================

import React from 'react';
import { 
  Coffee, Wine, Tag, Utensils, Users, Image, BookOpen, Home, RefreshCcw
} from 'lucide-react';
import { useWebContentManagement } from '@/hooks/web-admin/useWebContentManagement';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { useNavigate } from 'react-router-dom';

// Componente para mostrar estadísticas
const StatCard = ({ 
  icon, 
  title, 
  value, 
  color, 
  onClick 
}: { 
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  onClick?: () => void;
}) => (
  <IOSCard 
    variant="elevated" 
    className={`ios-touch-feedback hover:scale-102 transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <IOSCardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="ios-text-footnote text-enigma-neutral-500 mb-2 font-medium uppercase tracking-wide">
            {title}
          </p>
          <h3 className="ios-text-title2 font-bold" style={{ color }}>
            {value}
          </h3>
        </div>
        <div 
          className="w-14 h-14 rounded-ios-lg flex items-center justify-center shadow-ios"
          style={{ backgroundColor: `${color}15` }}
        >
          {React.cloneElement(icon as React.ReactElement, { size: 28, color })}
        </div>
      </div>
    </IOSCardContent>
  </IOSCard>
);

export default function WebAdminDashboard() {
  const navigate = useNavigate();
  const { 
    categories, 
    allergens, 
    menuItems, 
    beverages, 
    wines, 
    pages, 
    contentStats,
    isLoading,
    errors
  } = useWebContentManagement();

  // Manejo de errores
  const hasErrors = Object.values(errors).some(error => error !== null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-ios-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {hasErrors && (
        <IOSCard variant="elevated" className="border-l-4 border-red-500 bg-red-50">
          <IOSCardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-red-600">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Error de Conexión a Base de Datos
                </h3>
                <p className="text-xs text-red-600 mt-1">
                  Algunos datos no se pudieron cargar. Verifica la conexión a la base de datos.
                </p>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-heading-2 text-enigma-neutral-900 flex items-center gap-2">
            <Home className="h-6 w-6 text-enigma-primary" />
            Dashboard Web - Enigma
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Gestión completa del contenido web del restaurante Enigma Cocina con Alma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <IOSButton
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
            title="Actualizar datos"
          >
            <RefreshCcw size={16} />
          </IOSButton>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Utensils />}
          title="Platos"
          value={menuItems?.length || 0}
          color="#237584"
          onClick={() => navigate('/panel-web-admin/platos')}
        />
        
        <StatCard
          icon={<Coffee />}
          title="Bebidas"
          value={beverages?.length || 0}
          color="#9FB289"
          onClick={() => navigate('/panel-web-admin/bebidas')}
        />

        <StatCard
          icon={<Wine />}
          title="Vinos"
          value={wines?.length || 0}
          color="#CB5910"
          onClick={() => navigate('/panel-web-admin/vinos')}
        />

        <StatCard
          icon={<Tag />}
          title="Alérgenos"
          value={allergens?.length || 0}
          color="#FF9500"
          onClick={() => navigate('/panel-web-admin/alergenos')}
        />
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard
          icon={<BookOpen />}
          title="Páginas de Contenido"
          value={pages?.length || 0}
          color="#34C759"
          onClick={() => navigate('/panel-web-admin/filosofia')}
        />

        <StatCard
          icon={<Users />}
          title="Categorías del Menú"
          value={categories?.length || 0}
          color="#007AFF"
        />
      </div>

      {/* Vista previa de contenido reciente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Platos recientes */}
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="ios-text-headline text-enigma-neutral-900">
              Platos Recientes
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-3">
            {menuItems && menuItems.length > 0 ? (
              menuItems.slice(0, 5).map(dish => (
                <div 
                  key={dish.id} 
                  className="flex justify-between items-center py-2 border-b border-enigma-neutral-100 last:border-b-0 cursor-pointer hover:bg-enigma-neutral-50 transition-colors duration-150"
                  onClick={() => navigate(`/panel-web-admin/platos?id=${dish.id}`)}
                >
                  <div className="flex-1">
                    <p className="ios-text-callout font-medium text-enigma-neutral-900">
                      {dish.name}
                    </p>
                    <p className="ios-text-caption1 text-enigma-neutral-600">
                      {dish.category?.display_name || 'Sin categoría'}
                    </p>
                  </div>
                  <span className="ios-text-callout font-bold text-enigma-primary">
                    {dish.price}€
                  </span>
                </div>
              ))
            ) : (
              <p className="ios-text-footnote text-enigma-neutral-500 text-center py-4">
                No hay platos configurados
              </p>
            )}
          </IOSCardContent>
        </IOSCard>

        {/* Bebidas recientes */}
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="ios-text-headline text-enigma-neutral-900">
              Bebidas Recientes
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-3">
            {beverages && beverages.length > 0 ? (
              beverages.slice(0, 5).map(beverage => (
                <div 
                  key={beverage.id} 
                  className="flex justify-between items-center py-2 border-b border-enigma-neutral-100 last:border-b-0 cursor-pointer hover:bg-enigma-neutral-50 transition-colors duration-150"
                  onClick={() => navigate(`/panel-web-admin/bebidas?id=${beverage.id}`)}
                >
                  <div className="flex-1">
                    <p className="ios-text-callout font-medium text-enigma-neutral-900">
                      {beverage.name}
                    </p>
                    <p className="ios-text-caption1 text-enigma-neutral-600">
                      {beverage.category}
                    </p>
                  </div>
                  <span className="ios-text-callout font-bold text-enigma-primary">
                    {beverage.price_bottle || beverage.price_glass}€
                  </span>
                </div>
              ))
            ) : (
              <p className="ios-text-footnote text-enigma-neutral-500 text-center py-4">
                No hay bebidas configuradas
              </p>
            )}
          </IOSCardContent>
        </IOSCard>

        {/* Vinos recientes */}
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="ios-text-headline text-enigma-neutral-900">
              Vinos Recientes
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-3">
            {wines && wines.length > 0 ? (
              wines.slice(0, 5).map(wine => (
                <div 
                  key={wine.id} 
                  className="flex justify-between items-center py-2 border-b border-enigma-neutral-100 last:border-b-0 cursor-pointer hover:bg-enigma-neutral-50 transition-colors duration-150"
                  onClick={() => navigate(`/panel-web-admin/vinos?id=${wine.id}`)}
                >
                  <div className="flex-1">
                    <p className="ios-text-callout font-medium text-enigma-neutral-900">
                      {wine.name}
                    </p>
                    <p className="ios-text-caption1 text-enigma-neutral-600">
                      {wine.winery} • {wine.wine_type}
                    </p>
                  </div>
                  <span className="ios-text-callout font-bold text-enigma-primary">
                    {wine.price}€
                  </span>
                </div>
              ))
            ) : (
              <p className="ios-text-footnote text-enigma-neutral-500 text-center py-4">
                No hay vinos configurados
              </p>
            )}
          </IOSCardContent>
        </IOSCard>
      </div>

      {/* Acciones rápidas */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <IOSCardTitle className="ios-text-headline text-enigma-neutral-900">
            Acciones Rápidas
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <IOSButton
              variant="outline"
              className="p-4 h-auto flex-col"
              onClick={() => navigate('/panel-web-admin/platos')}
            >
              <Utensils className="mb-2 text-enigma-primary" size={24} />
              <span className="ios-text-callout font-medium">Gestionar Platos</span>
            </IOSButton>
            
            <IOSButton
              variant="outline"
              className="p-4 h-auto flex-col"
              onClick={() => navigate('/panel-web-admin/bebidas')}
            >
              <Coffee className="mb-2 text-enigma-primary" size={24} />
              <span className="ios-text-callout font-medium">Gestionar Bebidas</span>
            </IOSButton>
            
            <IOSButton
              variant="outline"
              className="p-4 h-auto flex-col"
              onClick={() => navigate('/panel-web-admin/vinos')}
            >
              <Wine className="mb-2 text-enigma-primary" size={24} />
              <span className="ios-text-callout font-medium">Gestionar Vinos</span>
            </IOSButton>
            
          </div>
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}