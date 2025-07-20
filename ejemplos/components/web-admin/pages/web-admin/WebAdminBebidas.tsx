import React, { useState, useEffect, useMemo } from 'react';
// import { motion } from 'framer-motion'; // Removed to minimize animations
import { 
  Plus, Search, Filter, Edit, Trash2, X, 
  Loader2, ChevronDown, ChevronUp, Heart,
  RefreshCcw, GlassWater, Check, Leaf, 
  Flame, Clock, Users, Eye, EyeOff, Grid3X3, List, Package, AlertTriangle
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { 
  WebBeverage, WebBeverageInsert, WebBeverageUpdate 
} from '../../types/web-database';
import { useWebBeverages, useWebAllergens } from '../../hooks/web-admin/useWebContentManagement';
import AllergenSelector from '../../components/web-admin/AllergenSelector';

const WebAdminBebidas: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use web beverages hook
  const { 
    beverages,
    beveragesLoading,
    createBeverage,
    updateBeverage,
    deleteBeverage,
    refetchBeverages
  } = useWebBeverages();

  // Use web allergens hook for allergen selection
  const { allergens } = useWebAllergens();
  
  const isLoading = beveragesLoading;
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showInactive, setShowInactive] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterAlcoholic, setFilterAlcoholic] = useState<boolean | null>(null);
  const [filterRecommended, setFilterRecommended] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<'name' | 'price' | 'category'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState<Partial<WebBeverageInsert>>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price_glass: 0,
    price_bottle: 0,
    alcohol_percentage: 0,
    is_alcoholic: false,
    origin: '',
    producer: '',
    serving_temperature: '',
    allergen_ids: [],
    is_recommended: false,
    is_organic: false,
    stock_quantity: 0,
    sort_order: 0,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check for query params on initial load
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setEditingId(parseInt(idParam));
      setShowForm(true);
      loadBeverageForEdit(parseInt(idParam));
    }
  }, [searchParams]);

  // Load beverage for editing
  const loadBeverageForEdit = async (id: number) => {
    try {
      const beverage = beverages.find(b => b.id === id);
      if (beverage) {
        setFormData({
          id: beverage.id,
          name: beverage.name,
          description: beverage.description,
          category: beverage.category,
          subcategory: beverage.subcategory,
          price_glass: beverage.price_glass,
          price_bottle: beverage.price_bottle,
          alcohol_percentage: beverage.alcohol_percentage,
          is_alcoholic: beverage.is_alcoholic,
          origin: beverage.origin,
          producer: beverage.producer,
          serving_temperature: beverage.serving_temperature,
          allergen_ids: beverage.allergen_ids || [],
          is_recommended: beverage.is_recommended,
          is_organic: beverage.is_organic,
          stock_quantity: beverage.stock_quantity,
          sort_order: beverage.sort_order,
          is_active: beverage.is_active
        });
      }
    } catch (error) {
      console.error('Error loading beverage for edit:', error);
    }
  };
  
  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(beverages.map(b => b.category).filter(Boolean))].sort();
  }, [beverages]);

  // Filter and sort beverages
  const filteredBeverages = useMemo(() => {
    let filtered = beverages.filter(beverage => {
      const matchesSearch = !searchTerm || 
        beverage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beverage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beverage.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || beverage.category === selectedCategory;
      const matchesAlcoholic = filterAlcoholic === null || beverage.is_alcoholic === filterAlcoholic;
      const matchesRecommended = filterRecommended === null || beverage.is_recommended === filterRecommended;
      const matchesActiveFilter = showInactive || beverage.is_active;
      
      return matchesSearch && matchesCategory && matchesAlcoholic && matchesRecommended && matchesActiveFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price_glass || a.price_bottle || 0;
          bValue = b.price_glass || b.price_bottle || 0;
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      const comparison = (aValue as number) - (bValue as number);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [beverages, searchTerm, selectedCategory, filterAlcoholic, filterRecommended, sortField, sortDirection]);

  // Form handlers
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Nombre es requerido';
    }
    
    if (!formData.category?.trim()) {
      errors.category = 'Categoría es requerida';
    }
    
    if (formData.price_glass !== null && formData.price_glass < 0) {
      errors.price_glass = 'El precio por copa no puede ser negativo';
    }
    
    if (formData.price_bottle !== null && formData.price_bottle < 0) {
      errors.price_bottle = 'El precio por botella no puede ser negativo';
    }
    
    if (formData.alcohol_percentage !== null && (formData.alcohol_percentage < 0 || formData.alcohol_percentage > 100)) {
      errors.alcohol_percentage = 'El porcentaje de alcohol debe estar entre 0 y 100';
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
        await updateBeverage.mutateAsync({
          id: editingId,
          updates: {
            name: formData.name!,
            description: formData.description,
            category: formData.category!,
            subcategory: formData.subcategory,
            price_glass: formData.price_glass,
            price_bottle: formData.price_bottle,
            alcohol_percentage: formData.alcohol_percentage,
            is_alcoholic: formData.is_alcoholic!,
            origin: formData.origin,
            producer: formData.producer,
            serving_temperature: formData.serving_temperature,
            allergen_ids: formData.allergen_ids || [],
            is_recommended: formData.is_recommended!,
            is_organic: formData.is_organic!,
            stock_quantity: formData.stock_quantity!,
            sort_order: formData.sort_order!,
            is_active: formData.is_active!
          }
        });
      } else {
        await createBeverage.mutateAsync({
          name: formData.name!,
          description: formData.description,
          category: formData.category!,
          subcategory: formData.subcategory,
          price_glass: formData.price_glass,
          price_bottle: formData.price_bottle,
          alcohol_percentage: formData.alcohol_percentage,
          is_alcoholic: formData.is_alcoholic!,
          origin: formData.origin,
          producer: formData.producer,
          serving_temperature: formData.serving_temperature,
          allergen_ids: formData.allergen_ids || [],
          is_recommended: formData.is_recommended!,
          is_organic: formData.is_organic!,
          stock_quantity: formData.stock_quantity!,
          sort_order: formData.sort_order!,
          is_active: formData.is_active!
        });
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving beverage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price_glass: 0,
      price_bottle: 0,
      alcohol_percentage: 0,
      is_alcoholic: false,
      origin: '',
      producer: '',
      serving_temperature: '',
      allergen_ids: [],
      is_recommended: false,
      is_organic: false,
      stock_quantity: 0,
      sort_order: 0,
      is_active: true
    });
    setFormErrors({});
    searchParams.delete('id');
    setSearchParams(searchParams);
  };

  const handleEdit = (beverage: WebBeverage) => {
    setEditingId(beverage.id);
    loadBeverageForEdit(beverage.id);
    setShowForm(true);
    searchParams.set('id', beverage.id.toString());
    setSearchParams(searchParams);
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteBeverage.mutateAsync(id);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting beverage:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilterAlcoholic(null);
    setFilterRecommended(null);
    setSortField('name');
    setSortDirection('asc');
    setShowInactive(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-enigma-primary mb-4" />
          <p className="text-enigma-neutral-600">Cargando bebidas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with iOS design */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-heading-2 text-enigma-neutral-900 flex items-center gap-2">
            <GlassWater className="h-6 w-6 text-enigma-primary" />
            Gestión de Bebidas
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Administra el catálogo de bebidas del restaurante
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="ios-card flex p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`ios-button ios-button-sm ${
                viewMode === 'grid' ? 'ios-button-primary' : 'ios-button-ghost'
              }`}
              title="Vista en cuadrícula"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`ios-button ios-button-sm ${
                viewMode === 'list' ? 'ios-button-primary' : 'ios-button-ghost'
              }`}
              title="Vista en lista"
            >
              <List size={16} />
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ios-button ios-button-sm ${
              showFilters ? 'ios-button-primary' : 'ios-button-secondary'
            }`}
          >
            <Filter size={16} />
            Filtros
          </button>
          
          <button
            onClick={() => refetchBeverages()}
            className="ios-button ios-button-sm ios-button-secondary"
          >
            <RefreshCcw size={16} />
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="ios-button ios-button-primary"
          >
            <Plus size={16} />
            Nueva Bebida
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className={`overflow-hidden ios-card ${showFilters ? 'block' : 'hidden'}`}
      >
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400" />
              <input
                type="text"
                placeholder="Buscar bebidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ios-input pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="ios-input"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Alcoholic Filter */}
            <select
              value={filterAlcoholic === null ? '' : filterAlcoholic.toString()}
              onChange={(e) => setFilterAlcoholic(e.target.value === '' ? null : e.target.value === 'true')}
              className="ios-input"
            >
              <option value="">Todas las bebidas</option>
              <option value="true">Solo alcohólicas</option>
              <option value="false">Solo sin alcohol</option>
            </select>

            {/* Recommended Filter */}
            <select
              value={filterRecommended === null ? '' : filterRecommended.toString()}
              onChange={(e) => setFilterRecommended(e.target.value === '' ? null : e.target.value === 'true')}
              className="ios-input"
            >
              <option value="">Todas</option>
              <option value="true">Solo recomendadas</option>
              <option value="false">No recomendadas</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-enigma-neutral-600">Ordenar por:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as 'name' | 'price' | 'category')}
                className="ios-input-sm"
              >
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
                <option value="category">Categoría</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="ios-button-sm ios-button-secondary"
              >
                {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            
            <button
              onClick={clearFilters}
              className="ios-button ios-button-sm ios-button-secondary"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-caption text-enigma-neutral-600">
              {filteredBeverages.length} de {beverages.length} bebidas
              {beverages.filter(b => !b.is_active).length > 0 && (
                <span className="ml-2 text-enigma-neutral-500">
                  ({beverages.filter(b => !b.is_active).length} inactivas)
                </span>
              )}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="ios-checkbox"
              />
              <span className="text-body-sm text-enigma-neutral-700">Mostrar inactivas</span>
            </label>
          </div>
        </div>
      </div>

      {/* Beverages Display */}
      {viewMode === 'grid' ? (
        // Grid View
        <div className="ios-grid">
          {filteredBeverages.map((beverage) => (
            <div
              key={beverage.id}
              className="ios-card-product flex flex-col h-full"
            >
              {/* Card Header with Image */}
              <div className="card-header relative">
                {beverage.image_url ? (
                  <img 
                    src={beverage.image_url} 
                    alt={beverage.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-enigma-neutral-100">
                    <GlassWater className="h-16 w-16 text-enigma-neutral-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`ios-badge text-xs font-medium px-2 py-1 ${
                    beverage.is_active 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {beverage.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body flex-1 flex flex-col">
                {/* Title and Category */}
                <div className="mb-3">
                  <h3 className="card-title text-lg font-semibold text-enigma-neutral-900 mb-1">
                    {beverage.name}
                  </h3>
                  <p className="text-sm text-enigma-neutral-600">
                    {beverage.category}
                    {beverage.subcategory && ` • ${beverage.subcategory}`}
                  </p>
                </div>
                
                {/* Price Section */}
                <div className="mb-3">
                  <div className="text-2xl font-bold text-enigma-accent">
                    {beverage.price_glass ? (
                      <>€{beverage.price_glass.toFixed(2)}</>
                    ) : beverage.price_bottle ? (
                      <>€{beverage.price_bottle.toFixed(2)}</>
                    ) : (
                      <span className="text-enigma-neutral-400">Sin precio</span>
                    )}
                  </div>
                  {beverage.price_glass && beverage.price_bottle && (
                    <p className="text-sm text-enigma-neutral-600">
                      Botella: €{beverage.price_bottle.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Secondary Info */}
                <div className="text-sm text-enigma-neutral-600 mb-3 flex-1">
                  {beverage.origin && <p>Origen: {beverage.origin}</p>}
                  {beverage.producer && <p>Productor: {beverage.producer}</p>}
                  {beverage.is_alcoholic && (
                    <p className="font-medium text-enigma-accent">
                      {beverage.alcohol_percentage}% alcohol
                    </p>
                  )}
                  <p className="mt-1">Stock: {beverage.stock_quantity || 0} unidades</p>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {beverage.is_organic && (
                    <span className="ios-badge ios-badge-secondary text-xs">
                      <Leaf className="h-3 w-3 mr-1" />
                      Ecológica
                    </span>
                  )}
                  {beverage.is_recommended && (
                    <span className="ios-badge ios-badge-accent text-xs">
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      Recomendada
                    </span>
                  )}
                  {beverage.allergen_ids && beverage.allergen_ids.length > 0 && (
                    <div className="group relative">
                      <span className="ios-badge ios-badge-warning text-xs cursor-help">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {beverage.allergen_ids.length} alérgenos
                      </span>
                      {/* Allergen Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                        <div className="bg-enigma-neutral-900 text-white text-xs rounded-lg p-2 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {beverage.allergen_ids.map((allergenId) => {
                              const allergen = allergens.find(a => a.id === allergenId);
                              if (!allergen) return null;
                              return (
                                <span key={allergenId} className="inline-flex items-center">
                                  <span
                                    className="w-4 h-4 rounded-full flex items-center justify-center mr-1"
                                    style={{ backgroundColor: allergen.color }}
                                  >
                                    {allergen.code.charAt(0)}
                                  </span>
                                  {allergen.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Bar - Bottom of card */}
                <div className="card-actions border-t border-enigma-neutral-100 pt-3 -mx-4 px-4 mt-auto">
                  <div className="flex items-center justify-between">
                    {/* Quick Actions Left */}
                    <div className="flex items-center gap-2">
                      {/* Toggle Recommended */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateBeverage.mutateAsync({
                              id: beverage.id,
                              updates: { is_recommended: !beverage.is_recommended }
                            });
                          } catch (error) {
                            console.error('Error updating recommendation:', error);
                          }
                        }}
                        className={`ios-button-quick ${
                          beverage.is_recommended 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={beverage.is_recommended ? 'Quitar recomendación' : 'Marcar como recomendada'}
                      >
                        <Heart className={`h-4 w-4 ${beverage.is_recommended ? 'fill-current' : ''}`} />
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateBeverage.mutateAsync({
                              id: beverage.id,
                              updates: { is_active: !beverage.is_active }
                            });
                          } catch (error) {
                            console.error('Error updating status:', error);
                          }
                        }}
                        className={`ios-button-quick ${
                          beverage.is_active 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={beverage.is_active ? 'Marcar como inactiva' : 'Marcar como activa'}
                      >
                        {beverage.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Primary Actions Right */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(beverage)}
                        className="ios-button ios-button-sm ios-button-ghost"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Editar</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(beverage.id);
                        }}
                        className="ios-button-quick ios-button-danger"
                        title="Eliminar bebida"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-2">
          {filteredBeverages.map((beverage) => (
            <div
              key={beverage.id}
              className="ios-card p-4 hover:shadow-ios-xl transition-shadow duration-150"
            >
              <div className="flex items-start gap-4">
                {/* Image Thumbnail */}
                <div className="flex-shrink-0">
                  {beverage.image_url ? (
                    <img 
                      src={beverage.image_url} 
                      alt={beverage.name}
                      className="w-16 h-16 rounded-ios object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-ios bg-enigma-neutral-100 flex items-center justify-center">
                      <GlassWater className="h-8 w-8 text-enigma-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-enigma-neutral-900">
                          {beverage.name}
                        </h3>
                        <span className="ios-badge ios-badge-primary text-xs">
                          {beverage.category}
                        </span>
                        {beverage.subcategory && (
                          <span className="text-sm text-enigma-neutral-500">
                            {beverage.subcategory}
                          </span>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="mt-1 text-lg font-bold text-enigma-accent">
                        {beverage.price_glass ? (
                          <>€{beverage.price_glass.toFixed(2)}</>
                        ) : beverage.price_bottle ? (
                          <>€{beverage.price_bottle.toFixed(2)}</>
                        ) : (
                          <span className="text-enigma-neutral-400">Sin precio</span>
                        )}
                        {beverage.price_glass && beverage.price_bottle && (
                          <span className="text-sm font-normal text-enigma-neutral-600 ml-2">
                            (Botella: €{beverage.price_bottle.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`ios-badge text-xs ${
                      beverage.is_active 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {beverage.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  
                  {/* Info Row */}
                  <div className="flex items-center gap-4 mb-3 text-sm text-enigma-neutral-600 flex-wrap">
                    {beverage.origin && (
                      <div>
                        <span className="text-enigma-neutral-500">Origen:</span>{' '}
                        <span className="font-medium text-enigma-neutral-700">{beverage.origin}</span>
                      </div>
                    )}
                    {beverage.producer && (
                      <div>
                        <span className="text-enigma-neutral-500">Productor:</span>{' '}
                        <span className="font-medium text-enigma-neutral-700">{beverage.producer}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-enigma-neutral-500">Stock:</span>{' '}
                      <span className="font-medium text-enigma-neutral-700">{beverage.stock_quantity || 0}</span>
                    </div>
                    {beverage.is_alcoholic && (
                      <div className="font-medium text-enigma-accent">
                        {beverage.alcohol_percentage}% alcohol
                      </div>
                    )}
                  </div>

                  {/* Badges and Actions Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {beverage.is_organic && (
                        <span className="ios-badge ios-badge-secondary text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Ecológica
                        </span>
                      )}
                      {beverage.is_recommended && (
                        <span className="ios-badge ios-badge-accent text-xs">
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                          Recomendada
                        </span>
                      )}
                      {beverage.allergen_ids && beverage.allergen_ids.length > 0 && (
                        <div className="group relative">
                          <span className="ios-badge ios-badge-warning text-xs cursor-help">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {beverage.allergen_ids.length} alérgenos
                          </span>
                          {/* Allergen Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 pointer-events-none">
                            <div className="bg-enigma-neutral-900 text-white text-xs rounded-lg p-2 max-w-xs shadow-lg">
                              <div className="flex flex-wrap gap-2">
                                {beverage.allergen_ids.map((allergenId) => {
                                  const allergen = allergens.find(a => a.id === allergenId);
                                  if (!allergen) return null;
                                  return (
                                    <span key={allergenId} className="inline-flex items-center">
                                      <span
                                        className="w-4 h-4 rounded-full flex items-center justify-center mr-1"
                                        style={{ backgroundColor: allergen.color }}
                                      >
                                        {allergen.code.charAt(0)}
                                      </span>
                                      {allergen.name}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Toggle Recommended */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateBeverage.mutateAsync({
                              id: beverage.id,
                              updates: { is_recommended: !beverage.is_recommended }
                            });
                          } catch (error) {
                            console.error('Error updating recommendation:', error);
                          }
                        }}
                        className={`ios-button ios-button-sm ${
                          beverage.is_recommended 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 border-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                        }`}
                        title={beverage.is_recommended ? 'Quitar recomendación' : 'Marcar como recomendada'}
                      >
                        <Heart className={`h-4 w-4 ${beverage.is_recommended ? 'fill-current' : ''}`} />
                        <span className="ml-1 hidden lg:inline">
                          {beverage.is_recommended ? 'Recomendada' : 'Recomendar'}
                        </span>
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateBeverage.mutateAsync({
                              id: beverage.id,
                              updates: { is_active: !beverage.is_active }
                            });
                          } catch (error) {
                            console.error('Error updating status:', error);
                          }
                        }}
                        className={`ios-button ios-button-sm ${
                          beverage.is_active 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200 border-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                        }`}
                        title={beverage.is_active ? 'Marcar como inactiva' : 'Marcar como activa'}
                      >
                        {beverage.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span className="ml-1 hidden lg:inline">
                          {beverage.is_active ? 'Activa' : 'Activar'}
                        </span>
                      </button>

                      <div className="w-px h-6 bg-enigma-neutral-200 mx-1" />

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(beverage)}
                        className="ios-button ios-button-sm ios-button-ghost"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Editar</span>
                      </button>
                      
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(beverage.id);
                        }}
                        className="ios-button ios-button-sm ios-button-danger"
                        title="Eliminar bebida"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredBeverages.length === 0 && (
        <div className="text-center py-12 ios-card">
          <GlassWater className="mx-auto h-12 w-12 text-enigma-neutral-400 mb-4" />
          <h3 className="text-heading-3 text-enigma-neutral-900 mb-2">
            No se encontraron bebidas
          </h3>
          <p className="text-body text-enigma-neutral-600 mb-4">
            {searchTerm || selectedCategory || filterAlcoholic !== null || filterRecommended !== null
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primera bebida al catálogo'
            }
          </p>
          {!searchTerm && !selectedCategory && filterAlcoholic === null && filterRecommended === null && (
            <button
              onClick={() => setShowForm(true)}
              className="ios-button ios-button-primary"
            >
              <Plus size={16} />
              Crear Primera Bebida
            </button>
          )}
        </div>
      )}

      {/* Beverage Form Modal - Custom Implementation */}
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
                      {editingId ? 'Editar Bebida' : 'Nueva Bebida'}
                    </h2>
                    <p className="text-sm text-enigma-neutral-600 mt-1">
                      {editingId ? 'Modifica los datos de la bebida seleccionada' : 'Añade una nueva bebida al catálogo'}
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
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`ios-input ${formErrors.name ? 'border-red-300' : ''}`}
                        placeholder="Nombre de la bebida"
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
                        className="ios-input resize-none"
                        rows={3}
                        placeholder="Descripción de la bebida"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="ios-label">
                          Categoría *
                        </label>
                        <input
                          type="text"
                          value={formData.category || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className={`ios-input ${formErrors.category ? 'border-red-300' : ''}`}
                          placeholder="ej: Refrescos, Zumos, Cervezas"
                          list="categories"
                        />
                        <datalist id="categories">
                          {categories.map((category) => (
                            <option key={category} value={category} />
                          ))}
                        </datalist>
                        {formErrors.category && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.category}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Subcategoría
                        </label>
                        <input
                          type="text"
                          value={formData.subcategory || ''}
                          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                          className="ios-input"
                          placeholder="Subcategoría específica"
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <h4 className="text-heading-4 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2 mt-6">
                      Precios
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="ios-label">
                          Precio por Copa (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price_glass || ''}
                          onChange={(e) => setFormData({ ...formData, price_glass: e.target.value ? parseFloat(e.target.value) : null })}
                          className={`ios-input ${formErrors.price_glass ? 'border-red-300' : ''}`}
                          placeholder="0.00"
                        />
                        {formErrors.price_glass && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.price_glass}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Precio por Botella (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price_bottle || ''}
                          onChange={(e) => setFormData({ ...formData, price_bottle: e.target.value ? parseFloat(e.target.value) : null })}
                          className={`ios-input ${formErrors.price_bottle ? 'border-red-300' : ''}`}
                          placeholder="0.00"
                        />
                        {formErrors.price_bottle && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.price_bottle}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-4">
                    <h3 className="text-heading-3 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2">
                      Detalles Adicionales
                    </h3>

                    {/* Alcohol */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_alcoholic || false}
                          onChange={(e) => setFormData({ ...formData, is_alcoholic: e.target.checked })}
                          className="ios-checkbox"
                        />
                        <span className="text-body text-enigma-neutral-900">Bebida alcohólica</span>
                      </label>
                      
                      {formData.is_alcoholic && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.alcohol_percentage || ''}
                            onChange={(e) => setFormData({ ...formData, alcohol_percentage: e.target.value ? parseFloat(e.target.value) : null })}
                            className={`ios-input-sm w-20 ${formErrors.alcohol_percentage ? 'border-red-300' : ''}`}
                            placeholder="0.0"
                          />
                          <span className="text-body-sm text-enigma-neutral-600">% vol</span>
                        </div>
                      )}
                    </div>
                    {formErrors.alcohol_percentage && (
                      <p className="text-caption text-red-600">{formErrors.alcohol_percentage}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="ios-label">
                          Origen
                        </label>
                        <input
                          type="text"
                          value={formData.origin || ''}
                          onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                          className="ios-input"
                          placeholder="País o región de origen"
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Productor/Marca
                        </label>
                        <input
                          type="text"
                          value={formData.producer || ''}
                          onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                          className="ios-input"
                          placeholder="Nombre del productor"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="ios-label">
                        Temperatura de Servicio
                      </label>
                      <input
                        type="text"
                        value={formData.serving_temperature || ''}
                        onChange={(e) => setFormData({ ...formData, serving_temperature: e.target.value })}
                        className="ios-input"
                        placeholder="ej: Muy fría (2-4°C), Fresca (8-10°C)"
                      />
                    </div>

                    {/* Characteristics */}
                    <h4 className="text-heading-4 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2 mt-6">
                      Características
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_recommended || false}
                          onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                          className="ios-checkbox"
                        />
                        <Heart size={16} className="text-red-500" />
                        <span className="text-body text-enigma-neutral-900">Recomendada</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_organic || false}
                          onChange={(e) => setFormData({ ...formData, is_organic: e.target.checked })}
                          className="ios-checkbox"
                        />
                        <Leaf size={16} className="text-green-600" />
                        <span className="text-body text-enigma-neutral-900">Orgánica</span>
                      </label>
                    </div>

                    {/* Stock */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="ios-label">
                          Stock
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock_quantity || 0}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                          className="ios-input"
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Orden de Visualización
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.sort_order || 0}
                          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                          className="ios-input"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active ?? true}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="ios-checkbox"
                      />
                      <span className="text-body text-enigma-neutral-900">Bebida activa</span>
                    </label>
                  </div>
                </div>

                  {/* Allergens Section - Full Width */}
                  <div className="col-span-1 lg:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2 mb-4">
                      Alérgenos
                    </h3>
                    <AllergenSelector
                      selectedIds={formData.allergen_ids || []}
                      onChange={(ids) => setFormData({ ...formData, allergen_ids: ids })}
                      disabled={isSubmitting}
                      showSearch={allergens.length > 8}
                    />
                  </div>

                  {/* Form Actions - Inside scrollable content */}
                  <div className="col-span-1 lg:col-span-2 mt-8 pt-6 border-t border-enigma-neutral-200">
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
                            {editingId ? 'Actualizar Bebida' : 'Crear Bebida'}
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

      {/* Delete Confirmation Modal - Custom Implementation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div
              className="relative bg-white rounded-ios-xl shadow-ios-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle size={24} className="text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-enigma-neutral-900">
                      ¿Eliminar bebida?
                    </h3>
                    <p className="text-sm text-enigma-neutral-600 mt-1">
                      Esta acción no se puede deshacer. La bebida se eliminará permanentemente del catálogo.
                    </p>
                  </div>
                </div>
                
                {/* Find the beverage name to show */}
                {(() => {
                  const beverage = beverages.find(b => b.id === confirmDelete);
                  return beverage ? (
                    <div className="bg-enigma-neutral-50 rounded-ios p-4 mb-6">
                      <p className="text-sm font-medium text-enigma-neutral-900">
                        {beverage.name}
                      </p>
                      <p className="text-sm text-enigma-neutral-600">
                        {beverage.category} • {beverage.price_glass ? `€${beverage.price_glass.toFixed(2)}` : `€${beverage.price_bottle?.toFixed(2) || '0.00'}`}
                      </p>
                    </div>
                  ) : null;
                })()}
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="ios-button ios-button-secondary flex-1"
                    disabled={isDeleting === confirmDelete}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    disabled={isDeleting === confirmDelete}
                    className="ios-button ios-button-danger flex-1"
                  >
                    {isDeleting === confirmDelete ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} className="mr-2" />
                        Eliminar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebAdminBebidas;