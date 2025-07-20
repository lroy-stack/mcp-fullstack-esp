import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, X, 
  Loader2, ChevronDown, ChevronUp, AlertTriangle,
  RefreshCcw, Tag, Check, Info, BarChart3, 
  Package, Wine, Utensils, Eye, EyeOff
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WebAllergen } from '../../types/web-database';
import { useWebAllergens } from '../../hooks/web-admin/useWebContentManagement';
import ModalBase from '../../components/ui/ModalBase';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Colores predefinidos para alérgenos
const ALLERGEN_COLORS = [
  '#FFB74D', '#81C784', '#FFF176', '#64B5F6', '#F48FB1',
  '#BCAAA4', '#AED581', '#90A4AE', '#A5D6A7', '#C8E6C9',
  '#FFEB3B', '#DCEDC8', '#B39DDB', '#FFCC02', '#FF8A65'
];

// Función para renderizar círculo con letra inicial del código
const renderAllergenCircle = (code: string, color: string, size: number = 20) => {
  return (
    <div 
      className="rounded-full flex items-center justify-center font-bold text-white text-xs"
      style={{ 
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: size * 0.4
      }}
    >
      {code.charAt(0)}
    </div>
  );
};

interface AllergenUsageStats {
  allergen_id: number;
  allergen_name: string;
  allergen_code: string;
  dishes_count: number;
  beverages_count: number;
  wines_count: number;
  total_usage: number;
}

interface ProductByAllergen {
  product_type: 'dish' | 'beverage' | 'wine';
  product_id: number;
  product_name: string;
  category_name: string;
}

const WebAdminAlergenos: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Use web allergens hook
  const { 
    allergens,
    allergensLoading,
    createAllergen,
    updateAllergen,
    refetchAllergens
  } = useWebAllergens();
  
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [selectedAllergenStats, setSelectedAllergenStats] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<WebAllergen>>({
    code: '',
    name: '',
    description: '',
    icon: 'Tag',
    color: '#FFB74D',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch usage statistics
  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ['allergen-usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_allergen_usage_stats');
      if (error) throw error;
      return data as AllergenUsageStats[];
    },
    enabled: showStats,
    staleTime: 30000,
  });

  // Fetch products by allergen
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products-by-allergen', selectedAllergenStats],
    queryFn: async () => {
      if (!selectedAllergenStats) return [];
      const { data, error } = await supabase.rpc('get_products_by_allergen', { 
        p_allergen_id: selectedAllergenStats 
      });
      if (error) throw error;
      return data as ProductByAllergen[];
    },
    enabled: !!selectedAllergenStats,
  });

  // Check for query params on initial load
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setEditingId(parseInt(idParam));
      setShowForm(true);
      loadAllergenForEdit(parseInt(idParam));
    }
  }, [searchParams]);

  // Load allergen for editing
  const loadAllergenForEdit = async (id: number) => {
    try {
      const allergen = allergens.find(a => a.id === id);
      if (allergen) {
        setFormData({
          id: allergen.id,
          code: allergen.code,
          name: allergen.name,
          description: allergen.description || '',
          icon: allergen.icon || 'TAG',
          color: allergen.color || '#FFB74D',
          is_active: allergen.is_active
        });
      }
    } catch (error) {
      console.error('Error loading allergen for edit:', error);
    }
  };

  // Use allergens directly - no filtering needed for 14 items
  const activeAllergens = useMemo(() => {
    return allergens.filter(allergen => allergen.is_active);
  }, [allergens]);

  // Form handlers
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.code?.trim()) {
      errors.code = 'Código es requerido';
    } else if (formData.code.length > 10) {
      errors.code = 'Código debe tener máximo 10 caracteres';
    }
    
    if (!formData.name?.trim()) {
      errors.name = 'Nombre es requerido';
    } else if (formData.name.length > 100) {
      errors.name = 'Nombre debe tener máximo 100 caracteres';
    }

    // Check for duplicates
    const existingAllergen = allergens.find(a => 
      a.id !== editingId && 
      (a.code.toLowerCase() === formData.code?.toLowerCase() || 
       a.name.toLowerCase() === formData.name?.toLowerCase())
    );
    
    if (existingAllergen) {
      if (existingAllergen.code.toLowerCase() === formData.code?.toLowerCase()) {
        errors.code = 'Ya existe un alérgeno con este código';
      }
      if (existingAllergen.name.toLowerCase() === formData.name?.toLowerCase()) {
        errors.name = 'Ya existe un alérgeno con este nombre';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await updateAllergen.mutateAsync({
          id: editingId,
          updates: {
            code: formData.code,
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
            is_active: formData.is_active
          }
        });
      } else {
        await createAllergen.mutateAsync({
          code: formData.code!,
          name: formData.name!,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          is_active: formData.is_active ?? true
        });
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving allergen:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      icon: 'TAG',
      color: '#FFB74D',
      is_active: true
    });
    setFormErrors({});
    searchParams.delete('id');
    setSearchParams(searchParams);
  };

  const handleEdit = (allergen: WebAllergen) => {
    setEditingId(allergen.id);
    setFormData({
      id: allergen.id,
      code: allergen.code,
      name: allergen.name,
      description: allergen.description || '',
      icon: allergen.icon || '🏷️',
      color: allergen.color || '#FFB74D',
      is_active: allergen.is_active
    });
    setShowForm(true);
    searchParams.set('id', allergen.id.toString());
    setSearchParams(searchParams);
  };

  const handleDelete = async (id: number) => {
    try {
      // Check if allergen is in use before deleting
      const usageData = await supabase.rpc('get_products_by_allergen', { p_allergen_id: id });
      
      if (usageData.data && usageData.data.length > 0) {
        alert(`No se puede eliminar este alérgeno porque está siendo usado en ${usageData.data.length} producto(s).`);
        return;
      }

      const { error } = await supabase.rpc('delete_web_allergen', { p_id: id });
      
      if (error) throw error;
      
      await refetchAllergens();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting allergen:', error);
    }
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'dish': return <Utensils size={16} />;
      case 'beverage': return <Package size={16} />;
      case 'wine': return <Wine size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'dish': return 'Plato';
      case 'beverage': return 'Bebida';
      case 'wine': return 'Vino';
      default: return 'Producto';
    }
  };

  // Remove filter logic - not needed for 14 items

  // Loading skeleton component
  const AllergenSkeleton = () => (
    <div className="ios-card divide-y divide-enigma-neutral-100">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-enigma-neutral-200 rounded-ios animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-4 bg-enigma-neutral-200 rounded animate-pulse w-32" />
                <div className="h-5 bg-enigma-neutral-200 rounded-ios animate-pulse w-12" />
              </div>
              <div className="h-3 bg-enigma-neutral-200 rounded animate-pulse w-48" />
              <div className="h-3 bg-enigma-neutral-200 rounded animate-pulse w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-enigma-neutral-200 rounded-ios animate-pulse" />
            <div className="w-8 h-8 bg-enigma-neutral-200 rounded-ios animate-pulse" />
            <div className="w-8 h-8 bg-enigma-neutral-200 rounded-ios animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  if (allergensLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 bg-enigma-neutral-200 rounded animate-pulse w-48 mb-2" />
            <div className="h-4 bg-enigma-neutral-200 rounded animate-pulse w-72" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 bg-enigma-neutral-200 rounded-ios animate-pulse w-24" />
            <div className="h-10 bg-enigma-neutral-200 rounded-ios animate-pulse w-32" />
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="ios-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-enigma-neutral-200 rounded animate-pulse w-40" />
            <div className="h-8 bg-enigma-neutral-200 rounded-ios animate-pulse w-20" />
          </div>
          <div className="h-12 bg-enigma-neutral-200 rounded-ios animate-pulse w-full" />
        </div>

        {/* List Skeleton */}
        <AllergenSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-enigma-neutral-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-enigma-primary" />
            Gestión de Alérgenos
          </h1>
          <p className="text-enigma-neutral-600 mt-1">
            Administra los alérgenos del menú y sus relaciones con productos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`ios-button ${showStats ? 'ios-button-primary' : 'ios-button-secondary'} ios-text-callout`}
          >
            <BarChart3 size={16} />
            {showStats ? 'Ocultar Stats' : 'Ver Stats'}
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="ios-button ios-button-primary ios-text-callout"
          >
            <Plus size={16} />
            Nuevo Alérgeno
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="ios-card-elevated space-y-6">
          <div className="p-6 border-b border-enigma-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-ios-title3 font-semibold text-enigma-neutral-900">
                  Estadísticas de Uso
                </h3>
                <p className="text-ios-footnote text-enigma-neutral-600 mt-1">
                  Análisis de uso de alérgenos en productos
                </p>
              </div>
              <button
                onClick={() => setShowStats(false)}
                className="ios-button-quick bg-enigma-neutral-100 text-enigma-neutral-600 hover:bg-enigma-neutral-200"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-enigma-primary mb-3" />
                <p className="text-ios-footnote text-enigma-neutral-600">Cargando estadísticas...</p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Quick Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-enigma-neutral-50 rounded-ios p-4 text-center">
                  <div className="text-ios-title2 font-bold text-enigma-primary">
                    {usageStats?.reduce((acc, stat) => acc + stat.total_usage, 0) || 0}
                  </div>
                  <div className="text-ios-footnote text-enigma-neutral-600">
                    Total de relaciones
                  </div>
                </div>
                <div className="bg-enigma-neutral-50 rounded-ios p-4 text-center">
                  <div className="text-ios-title2 font-bold text-enigma-secondary">
                    {usageStats?.filter(stat => stat.total_usage > 0).length || 0}
                  </div>
                  <div className="text-ios-footnote text-enigma-neutral-600">
                    Alérgenos en uso
                  </div>
                </div>
                <div className="bg-enigma-neutral-50 rounded-ios p-4 text-center">
                  <div className="text-ios-title2 font-bold text-enigma-accent">
                    {usageStats?.length || 0}
                  </div>
                  <div className="text-ios-footnote text-enigma-neutral-600">
                    Total alérgenos
                  </div>
                </div>
              </div>

              {/* Allergens Usage List */}
              <div className="space-y-2">
                <h4 className="text-ios-headline font-semibold text-enigma-neutral-900">
                  Uso por Alérgeno
                </h4>
                <div className="divide-y divide-enigma-neutral-100 border border-enigma-neutral-200 rounded-ios overflow-hidden">
                  {usageStats?.sort((a, b) => b.total_usage - a.total_usage).map((stat) => {
                    const allergen = allergens.find(a => a.id === stat.allergen_id);
                    const isExpanded = selectedAllergenStats === stat.allergen_id;
                    
                    return (
                      <div key={stat.allergen_id}>
                        <div 
                          className="flex items-center justify-between p-4 hover:bg-enigma-neutral-50 cursor-pointer transition-colors duration-150"
                          onClick={() => setSelectedAllergenStats(
                            selectedAllergenStats === stat.allergen_id ? null : stat.allergen_id
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {/* Allergen Circle */}
                            {allergen && (
                              <div 
                                className="w-8 h-8 rounded-ios flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: allergen.color }}
                              >
                                {renderAllergenCircle(allergen.code, allergen.color, 20)}
                              </div>
                            )}
                            
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-ios-body font-semibold text-enigma-neutral-900">
                                  {stat.allergen_name}
                                </span>
                                <span className="ios-badge bg-enigma-neutral-100 text-enigma-neutral-600 text-xs font-mono">
                                  {stat.allergen_code}
                                </span>
                              </div>
                              
                              {/* Usage breakdown */}
                              <div className="flex items-center gap-4 text-ios-caption1 text-enigma-neutral-600">
                                <div className="flex items-center gap-1">
                                  <Utensils size={12} />
                                  <span>{stat.dishes_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Package size={12} />
                                  <span>{stat.beverages_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wine size={12} />
                                  <span>{stat.wines_count}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-ios-headline font-bold text-enigma-primary">
                                {stat.total_usage}
                              </div>
                              <div className="text-ios-caption2 text-enigma-neutral-500">
                                productos
                              </div>
                            </div>
                            
                            <ChevronDown 
                              size={16} 
                              className={`text-enigma-neutral-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Products List */}
                        {isExpanded && (
                          <div className="border-t border-enigma-neutral-100 bg-enigma-neutral-50">
                            <div className="p-4">
                              <h5 className="text-ios-footnote font-semibold text-enigma-neutral-700 mb-3">
                                Productos que contienen {stat.allergen_name}:
                              </h5>
                              
                              {productsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-4 w-4 animate-spin text-enigma-primary mr-2" />
                                  <span className="text-ios-caption1 text-enigma-neutral-600">Cargando productos...</span>
                                </div>
                              ) : productsData && productsData.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {productsData.map((product, index) => (
                                    <div 
                                      key={index} 
                                      className="flex items-center gap-3 p-3 bg-white rounded-ios border border-enigma-neutral-200"
                                    >
                                      <div className="flex-shrink-0 text-enigma-neutral-600">
                                        {getProductTypeIcon(product.product_type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-ios-footnote font-medium text-enigma-neutral-900 truncate">
                                          {product.product_name}
                                        </div>
                                        <div className="text-ios-caption2 text-enigma-neutral-500">
                                          {getProductTypeLabel(product.product_type)} • {product.category_name}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6">
                                  <Info className="mx-auto h-6 w-6 text-enigma-neutral-400 mb-2" />
                                  <p className="text-ios-footnote text-enigma-neutral-600">
                                    No se encontraron productos para este alérgeno
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simple Summary */}
      <div className="ios-card">
        <div className="flex items-center justify-between p-4">
          <div className="text-ios-body text-enigma-neutral-700">
            <strong>{activeAllergens.length}</strong> alérgenos activos de <strong>{allergens.length}</strong> totales
          </div>
          <button
            onClick={() => refetchAllergens()}
            className="ios-button-quick bg-enigma-neutral-100 text-enigma-neutral-700 hover:bg-enigma-neutral-200"
            title="Actualizar"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Allergens List */}
      {allergens.length === 0 ? (
        <div className="ios-card text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-enigma-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-enigma-neutral-900 mb-2">
            No hay alérgenos registrados
          </h3>
          <p className="text-enigma-neutral-600 mb-4">
            Comienza creando tu primer alérgeno
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="ios-button ios-button-primary"
          >
            <Plus size={16} />
            Crear Alérgeno
          </button>
        </div>
      ) : (
        <div className="ios-card divide-y divide-enigma-neutral-100">
          {allergens.map((allergen) => (
            <div
              key={allergen.id}
              className="flex items-center justify-between p-4 hover:bg-enigma-neutral-50 transition-colors duration-150"
            >
              {/* Left side: Icon + Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Allergen Circle */}
                <div 
                  className="w-10 h-10 rounded-ios flex items-center justify-center shadow-ios-sm flex-shrink-0"
                  style={{ backgroundColor: allergen.color }}
                >
                  {renderAllergenCircle(allergen.code, allergen.color, 24)}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-ios-body font-semibold text-enigma-neutral-900 truncate">
                      {allergen.name}
                    </h3>
                    <span 
                      className="ios-badge font-mono text-xs px-2 py-1 rounded-ios flex-shrink-0"
                      style={{ 
                        backgroundColor: allergen.color + '20',
                        color: allergen.color,
                        borderColor: allergen.color + '40'
                      }}
                    >
                      {allergen.code}
                    </span>
                    {!allergen.is_active && (
                      <span className="ios-badge bg-enigma-neutral-100 text-enigma-neutral-600 text-xs flex-shrink-0">
                        Inactivo
                      </span>
                    )}
                  </div>
                  
                  {allergen.description && (
                    <p className="text-ios-footnote text-enigma-neutral-600 truncate">
                      {allergen.description}
                    </p>
                  )}
                  
                  <p className="text-ios-caption1 text-enigma-neutral-500 mt-1">
                    Creado: {new Date(allergen.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {/* Right side: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Active/Inactive Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAllergen.mutate({
                      id: allergen.id,
                      updates: { is_active: !allergen.is_active }
                    });
                  }}
                  className={`ios-button-quick-toggle ${
                    allergen.is_active 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200 border border-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                  title={allergen.is_active ? 'Desactivar alérgeno' : 'Activar alérgeno'}
                >
                  {allergen.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(allergen);
                  }}
                  className="ios-button-quick bg-enigma-neutral-100 text-enigma-neutral-700 hover:bg-enigma-neutral-200"
                  title="Editar alérgeno"
                >
                  <Edit size={16} />
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(allergen.id);
                  }}
                  className="ios-button-quick bg-red-100 text-red-600 hover:bg-red-200"
                  title="Eliminar alérgeno"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal - Using Project Standard Pattern */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCloseForm}
          />
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="relative w-full max-w-4xl bg-white rounded-ios-xl shadow-ios-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full" style={{ maxHeight: '90vh' }}>
                {/* Header - Sticky */}
                <div className="flex items-center justify-between p-6 border-b border-enigma-neutral-200 bg-enigma-neutral-50">
                  <div>
                    <h2 className="text-2xl font-bold text-enigma-neutral-900">
                      {editingId ? 'Editar Alérgeno' : 'Nuevo Alérgeno'}
                    </h2>
                    <p className="text-sm text-enigma-neutral-600 mt-1">
                      {editingId ? 'Modifica los datos del alérgeno seleccionado' : 'Añade un nuevo alérgeno al sistema'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="ios-button ios-button-sm ios-button-ghost"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-heading-3 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2">
                        Información Básica
                      </h3>
                      
                      <div>
                        <label className="ios-label">
                          Código *
                        </label>
                        <input
                          type="text"
                          value={formData.code || ''}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          className={`ios-input font-mono ${formErrors.code ? 'border-red-300' : ''}`}
                          placeholder="ej: GLU"
                          maxLength={10}
                        />
                        {formErrors.code && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.code}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`ios-input ${formErrors.name ? 'border-red-300' : ''}`}
                          placeholder="ej: Gluten"
                          maxLength={100}
                        />
                        {formErrors.name && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="ios-textarea"
                          placeholder="Descripción detallada del alérgeno..."
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Color
                        </label>
                        <div className="space-y-3">
                          {/* Color presets */}
                          <div className="flex flex-wrap gap-2">
                            {ALLERGEN_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`w-8 h-8 rounded-ios border-2 transition-all duration-200 active:scale-95 ${
                                  formData.color === color 
                                    ? 'border-enigma-neutral-900 ring-2 ring-enigma-neutral-900/20' 
                                    : 'border-enigma-neutral-300 hover:border-enigma-neutral-400'
                                }`}
                                style={{ backgroundColor: color }}
                                title={`Seleccionar color ${color}`}
                              />
                            ))}
                          </div>
                          
                          {/* Custom color picker */}
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={formData.color || '#FFB74D'}
                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                              className="w-16 h-10 border border-enigma-neutral-300 rounded-ios cursor-pointer"
                            />
                            <span className="text-ios-footnote text-enigma-neutral-600 font-mono">
                              {formData.color || '#FFB74D'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active || false}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="ios-checkbox"
                        />
                        <label htmlFor="is_active" className="ios-label">
                          Activo
                        </label>
                      </div>
                    </div>

                    {/* Preview Column */}
                    <div className="space-y-4">
                      <h3 className="text-heading-3 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2">
                        Vista Previa
                      </h3>
                      
                      <div className="bg-enigma-neutral-50 rounded-ios p-4 space-y-3">
                        {/* Large preview */}
                        <div className="text-center">
                          <div 
                            className="w-16 h-16 mx-auto rounded-ios shadow-ios flex items-center justify-center mb-3"
                            style={{ backgroundColor: formData.color || '#FFB74D' }}
                          >
                            {renderAllergenCircle(formData.code || 'COD', formData.color || '#FFB74D', 36)}
                          </div>
                          <h5 className="text-ios-body font-semibold text-enigma-neutral-900">
                            {formData.name || 'Nombre del alérgeno'}
                          </h5>
                          <p className="text-ios-caption1 text-enigma-neutral-600 mt-1">
                            {formData.description || 'Descripción del alérgeno'}
                          </p>
                        </div>

                        {/* How it looks in lists */}
                        <div>
                          <h6 className="text-ios-caption1 font-semibold text-enigma-neutral-700 mb-2">
                            Vista en lista:
                          </h6>
                          
                          {/* List item preview */}
                          <div className="bg-white rounded-ios border border-enigma-neutral-200 p-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-6 h-6 rounded-ios flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: formData.color || '#FFB74D' }}
                              >
                                {renderAllergenCircle(formData.code || 'COD', formData.color || '#FFB74D', 16)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-ios-footnote font-medium">
                                    {formData.name || 'Nombre'}
                                  </span>
                                  <span 
                                    className="text-xs px-1.5 py-0.5 rounded font-mono"
                                    style={{ 
                                      backgroundColor: (formData.color || '#FFB74D') + '20',
                                      color: formData.color || '#FFB74D'
                                    }}
                                  >
                                    {formData.code || 'COD'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Badge preview */}
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: (formData.color || '#FFB74D') + '20',
                              color: formData.color || '#FFB74D',
                              border: `1px solid ${(formData.color || '#FFB74D')}40`
                            }}
                          >
                            🏷️ {formData.name || 'Nombre'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions - Inside scrollable content */}
                  <div className="mt-8 pt-6 border-t border-enigma-neutral-200">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseForm}
                        className="ios-button ios-button-secondary"
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="ios-button ios-button-primary min-w-[140px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Check size={16} className="mr-2" />
                            {editingId ? 'Actualizar Alérgeno' : 'Crear Alérgeno'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Eliminar Alérgeno"
        message="¿Estás seguro de que quieres eliminar este alérgeno? Esta acción no se puede deshacer."
        type="danger"
        confirmText="Eliminar"
      />
    </div>
  );
};

export default WebAdminAlergenos;