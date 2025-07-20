import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, X, 
  Loader2, ChevronDown, ChevronUp, Leaf, Heart,
  RefreshCcw, Wine, Check, Eye, EyeOff, Grid3X3, List, AlertTriangle,
  Package, Thermometer, Zap, FlowerIcon as Flower
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { 
  WebWine, WebWineInsert, WebWineUpdate 
} from '../../types/web-database';
import { useWebWines, useWebDishes, useWebAllergens } from '../../hooks/web-admin/useWebContentManagement';
import AllergenSelector from '../../components/web-admin/AllergenSelector';
import { supabase } from '../../integrations/supabase/client';

const WINE_TYPES = ['tinto', 'blanco', 'rosado', 'espumoso'] as const;

const WebAdminVinos: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use dedicated wines hook
  const { 
    wines, 
    winesLoading,
    winesError,
    createWine,
    updateWine,
    deleteWine,
    toggleWineAvailability,
    refetchWines
  } = useWebWines();

  // Use dishes hook for dish pairing
  const { dishes } = useWebDishes();

  // Use allergens hook for allergen selection
  const { allergens } = useWebAllergens();

  
  const isLoading = winesLoading;
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('');
  const [filterEcologico, setFilterEcologico] = useState<boolean>(false);
  const [filterRecomendado, setFilterRecomendado] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'name' | 'price' | 'winery' | 'wine_type'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState<Partial<WebWineInsert>>({
    name: '',
    winery: '',
    wine_type: 'tinto',
    vintage: '',
    grape_variety: '',
    denomination_origin: '',
    region: '',
    price: 0,
    price_glass: 0,
    alcohol_percentage: 0,
    tasting_notes: '',
    description: '',
    image_url: '',
    allergen_ids: [],
    is_organic: false,
    is_recommended: false,
    is_available: true,
    stock_quantity: 0,
    serving_temperature_min: 0,
    serving_temperature_max: 0,
    pairing_notes: '',
    awards: '',
    sort_order: 0,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check for editing from URL parameter
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam && !isNaN(Number(idParam))) {
      const id = Number(idParam);
      setEditingId(id);
      setShowForm(true);
      loadVinoForEdit(id);
    }
  }, [searchParams, wines]);

  // Load vino for editing
  const loadVinoForEdit = (id: number) => {
    const vino = wines.find(v => v.id === id);
    if (vino) {
      setFormData({
        name: vino.name,
        winery: vino.winery,
        wine_type: vino.wine_type,
        vintage: vino.vintage || '',
        grape_variety: vino.grape_variety || '',
        denomination_origin: vino.denomination_origin || '',
        region: vino.region || '',
        price: vino.price,
        price_glass: vino.price_glass || 0,
        alcohol_percentage: vino.alcohol_percentage || 0,
        tasting_notes: vino.tasting_notes || '',
        description: vino.description || '',
        image_url: vino.image_url || '',
        allergen_ids: vino.allergen_ids || [],
        is_organic: vino.is_organic,
        is_recommended: vino.is_recommended,
        is_available: vino.is_available,
        stock_quantity: vino.stock_quantity || 0,
        serving_temperature_min: vino.serving_temperature_min || 0,
        serving_temperature_max: vino.serving_temperature_max || 0,
        pairing_notes: vino.pairing_notes || '',
        awards: vino.awards || '',
        sort_order: vino.sort_order,
        is_active: vino.is_active
      });
    }
  };

  // Filter and sort wines
  const filteredAndSortedVinos = useMemo(() => {
    let filtered = wines.filter(vino => {
      // Search filter
      const matchesSearch = !searchTerm || 
        vino.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vino.winery.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vino.region && vino.region.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Type filter
      const matchesType = !selectedTipo || vino.wine_type === selectedTipo;
      
      // Other filters
      const matchesEcologico = !filterEcologico || vino.is_organic;
      const matchesRecomendado = !filterRecomendado || vino.is_recommended;
      
      return matchesSearch && matchesType && matchesEcologico && matchesRecomendado;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [wines, searchTerm, selectedTipo, filterEcologico, filterRecomendado, sortField, sortDirection]);

  // Form handlers
  const handleInputChange = (field: keyof WebWineInsert, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.winery?.trim()) errors.winery = 'La bodega es obligatoria';
    if (!formData.price || formData.price <= 0) errors.price = 'El precio debe ser mayor a 0';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Clean up form data to remove undefined values
      const cleanFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key as keyof WebWineInsert] = value;
        }
        return acc;
      }, {} as Partial<WebWineInsert>);
      
      if (editingId) {
        await updateWine.mutateAsync({ 
          id: editingId, 
          updates: cleanFormData as WebWineUpdate
        });
      } else {
        await createWine.mutateAsync(cleanFormData as WebWineInsert);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving wine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      winery: '',
      wine_type: 'tinto',
      vintage: '',
      grape_variety: '',
      denomination_origin: '',
      region: '',
      price: 0,
      price_glass: 0,
      alcohol_percentage: 0,
      tasting_notes: '',
      description: '',
      image_url: '',
      allergen_ids: [],
      is_organic: false,
      is_recommended: false,
      is_available: true,
      stock_quantity: 0,
      serving_temperature_min: 0,
      serving_temperature_max: 0,
      pairing_notes: '',
      awards: '',
      sort_order: 0,
      is_active: true
    });
    setFormErrors({});
    searchParams.delete('id');
    setSearchParams(searchParams);
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteWine.mutateAsync(id);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting wine:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleAvailability = async (id: number, available: boolean) => {
    try {
      await toggleWineAvailability.mutateAsync({ id, available });
    } catch (error) {
      console.error('Error toggling wine availability:', error);
    }
  };

  const getWineTypeColor = (type: string) => {
    switch (type) {
      case 'tinto': return 'ios-badge bg-red-600 text-white border-red-700';
      case 'blanco': return 'ios-badge bg-yellow-300 text-yellow-900 border-yellow-400';
      case 'rosado': return 'ios-badge bg-pink-400 text-white border-pink-500';
      case 'espumoso': return 'ios-badge bg-blue-500 text-white border-blue-600';
      default: return 'ios-badge ios-badge-neutral';
    }
  };

  const getWineTypeIcon = (type: string) => {
    switch (type) {
      case 'tinto': return <Wine className="h-3 w-3" />;
      case 'blanco': return <div className="w-3 h-3 rounded-full bg-current" />;
      case 'rosado': return <Flower className="h-3 w-3" />;
      case 'espumoso': return <Zap className="h-3 w-3" />;
      default: return <Wine className="h-3 w-3" />;
    }
  };

  const getWineTypeIconLarge = (type: string) => {
    switch (type) {
      case 'tinto': return <Wine className="h-6 w-6 text-white" />;
      case 'blanco': return <div className="w-6 h-6 rounded-full bg-white" />;
      case 'rosado': return <Flower className="h-6 w-6 text-white" />;
      case 'espumoso': return <Zap className="h-6 w-6 text-white" />;
      default: return <Wine className="h-6 w-6 text-white" />;
    }
  };

  const getWineTypeGradient = (type: string) => {
    switch (type) {
      case 'tinto': return 'from-red-500 to-red-700';
      case 'blanco': return 'from-yellow-200 to-yellow-400';
      case 'rosado': return 'from-pink-300 to-pink-500';
      case 'espumoso': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with iOS design */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-heading-2 text-enigma-neutral-900 flex items-center gap-2">
            <Wine className="h-6 w-6 text-enigma-primary" />
            Gestión de Vinos
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Administra la carta de vinos del restaurante
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
            onClick={() => refetchWines()}
            className="ios-button ios-button-sm ios-button-secondary"
          >
            <RefreshCcw size={16} />
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="ios-button ios-button-primary"
          >
            <Plus size={16} />
            Nuevo Vino
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
                placeholder="Buscar vinos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ios-input pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="ios-input"
            >
              <option value="">Todos los tipos</option>
              {WINE_TYPES.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>

            {/* Organic Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterEcologico}
                onChange={(e) => setFilterEcologico(e.target.checked)}
                className="ios-checkbox"
              />
              <Leaf size={16} className="text-green-600" />
              <span className="text-body text-enigma-neutral-900">Ecológicos</span>
            </label>

            {/* Recommended Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterRecomendado}
                onChange={(e) => setFilterRecomendado(e.target.checked)}
                className="ios-checkbox"
              />
              <Heart size={16} className="text-red-500" />
              <span className="text-body text-enigma-neutral-900">Recomendados</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-enigma-neutral-600">Ordenar por:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as 'name' | 'price' | 'winery' | 'wine_type')}
                className="ios-input-sm"
              >
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
                <option value="winery">Bodega</option>
                <option value="wine_type">Tipo</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="ios-button-sm ios-button-secondary"
              >
                {sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTipo('');
                setFilterEcologico(false);
                setFilterRecomendado(false);
                setSortField('name');
                setSortDirection('asc');
              }}
              className="ios-button ios-button-sm ios-button-secondary"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="text-caption text-enigma-neutral-600">
            {filteredAndSortedVinos.length} de {wines.length} vinos
          </div>
        </div>
      </div>


      {/* Wines Display */}
      {viewMode === 'grid' ? (
        // Grid View
        <div className="ios-grid">
          {filteredAndSortedVinos.map((vino) => (
            <div
              key={vino.id}
              className={`ios-card-product flex flex-col h-full ${
                !vino.is_active ? 'opacity-60 bg-gray-50 border-gray-300' : ''
              }`}
            >
            {/* Card Header with Image and Wine Type Indicator */}
            <div className="card-header relative">
              {/* Wine Type Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getWineTypeGradient(vino.wine_type)} opacity-10 pointer-events-none`} />
              {vino.image_url ? (
                <img 
                  src={vino.image_url} 
                  alt={vino.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-enigma-neutral-100">
                  <Wine className="h-16 w-16 text-enigma-neutral-300" />
                </div>
              )}
              
              {/* Wine Type Badge */}
              <div className="absolute top-3 left-3">
                <span className={`${getWineTypeColor(vino.wine_type)} text-xs font-bold px-3 py-1 shadow-lg flex items-center gap-1`}>
                  {getWineTypeIcon(vino.wine_type)} {vino.wine_type.toUpperCase()}
                </span>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`ios-badge text-xs font-medium px-2 py-1 ${
                  vino.is_active 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {vino.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="card-body flex-1 flex flex-col">
              {/* Title and Category */}
              <div className="mb-3">
                <h3 className="card-title text-lg font-semibold text-enigma-neutral-900 mb-1">
                  {vino.name}
                </h3>
                <p className="text-sm text-enigma-neutral-600">
                  {vino.winery}
                  {vino.vintage && ` • ${vino.vintage}`}
                </p>
              </div>
              
              {/* Price Section */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-enigma-accent">
                  €{vino.price.toFixed(2)}
                </div>
                {vino.price_glass && vino.price_glass > 0 && (
                  <p className="text-sm text-enigma-neutral-600">
                    Copa: €{vino.price_glass.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Secondary Info with Temperature */}
              <div className="text-sm text-enigma-neutral-600 mb-3 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${getWineTypeColor(vino.wine_type)} text-xs px-2 py-1 flex items-center gap-1`}>
                    {getWineTypeIcon(vino.wine_type)} {vino.wine_type.charAt(0).toUpperCase() + vino.wine_type.slice(1)}
                  </span>
                  {(vino.serving_temperature_min || vino.serving_temperature_max) && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Thermometer className="h-3 w-3" /> {vino.serving_temperature_min || 0}-{vino.serving_temperature_max || 0}°C
                    </span>
                  )}
                </div>
                {vino.denomination_origin && <p>D.O.: {vino.denomination_origin}</p>}
                {vino.region && <p>Región: {vino.region}</p>}
                {vino.grape_variety && <p>Uva: {vino.grape_variety}</p>}
                {vino.alcohol_percentage && vino.alcohol_percentage > 0 && (
                  <p className="font-medium text-enigma-accent">
                    {vino.alcohol_percentage}% alcohol
                  </p>
                )}
                <p className="mt-1">Stock: {vino.stock_quantity || 0} botellas</p>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {vino.is_organic && (
                  <span className="ios-badge ios-badge-secondary text-xs">
                    <Leaf className="h-3 w-3 mr-1" />
                    Ecológico
                  </span>
                )}
                {vino.is_recommended && (
                  <span className="ios-badge ios-badge-accent text-xs">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                    Recomendado
                  </span>
                )}
                {vino.awards && (
                  <span className="ios-badge ios-badge-warning text-xs">
                    Premiado
                  </span>
                )}

                {vino.allergen_ids && vino.allergen_ids.length > 0 && (
                  <div className="group relative">
                    <span className="ios-badge ios-badge-warning text-xs cursor-help">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {vino.allergen_ids.length} alérgenos
                    </span>
                    {/* Allergen Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                      <div className="bg-enigma-neutral-900 text-white text-xs rounded-lg p-2 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {vino.allergen_ids.map((allergenId) => {
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
                          await updateWine.mutateAsync({
                            id: vino.id,
                            updates: { is_recommended: !vino.is_recommended }
                          });
                        } catch (error) {
                          console.error('Error updating recommendation:', error);
                        }
                      }}
                      className={`ios-button-quick ${
                        vino.is_recommended 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={vino.is_recommended ? 'Quitar recomendación' : 'Marcar como recomendado'}
                    >
                      <Heart className={`h-4 w-4 ${vino.is_recommended ? 'fill-current' : ''}`} />
                    </button>

                    {/* Toggle Available */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await toggleWineAvailability.mutateAsync({ 
                            id: vino.id, 
                            available: !vino.is_available 
                          });
                        } catch (error) {
                          console.error('Error updating availability:', error);
                        }
                      }}
                      className={`ios-button-quick ${
                        vino.is_available 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={vino.is_available ? 'Marcar como no disponible' : 'Marcar como disponible'}
                    >
                      {vino.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Primary Actions Right */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(vino.id);
                        setShowForm(true);
                        loadVinoForEdit(vino.id);
                      }}
                      className="ios-button ios-button-sm ios-button-ghost"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Editar</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(vino.id);
                      }}
                      className="ios-button-quick ios-button-danger"
                      title="Eliminar vino"
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
          {filteredAndSortedVinos.map((vino) => (
            <div
              key={vino.id}
              className={`ios-card p-4 hover:shadow-ios-xl transition-shadow duration-150 ${
                !vino.is_active ? 'opacity-60 bg-gray-50 border-gray-300' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Image Thumbnail with Wine Type Border */}
                <div className="flex-shrink-0 relative">
                  {vino.image_url ? (
                    <img 
                      src={vino.image_url} 
                      alt={vino.name}
                      className={`w-16 h-16 rounded-ios object-cover border-4 ${
                        vino.wine_type === 'tinto' ? 'border-red-500' :
                        vino.wine_type === 'blanco' ? 'border-yellow-400' :
                        vino.wine_type === 'rosado' ? 'border-pink-400' :
                        vino.wine_type === 'espumoso' ? 'border-blue-500' :
                        'border-gray-400'
                      }`}
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-ios bg-gradient-to-br ${getWineTypeGradient(vino.wine_type)} flex items-center justify-center border-4 ${
                      vino.wine_type === 'tinto' ? 'border-red-500' :
                      vino.wine_type === 'blanco' ? 'border-yellow-400' :
                      vino.wine_type === 'rosado' ? 'border-pink-400' :
                      vino.wine_type === 'espumoso' ? 'border-blue-500' :
                      'border-gray-400'
                    }`}>
                      {getWineTypeIconLarge(vino.wine_type)}
                    </div>
                  )}
                  
                  {/* Small wine type indicator */}
                  <div className="absolute -bottom-1 -right-1">
                    <span className={`${getWineTypeColor(vino.wine_type)} text-xs px-1 py-0.5 rounded-full shadow-md flex items-center justify-center`}>
                      {getWineTypeIcon(vino.wine_type)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-enigma-neutral-900">
                          {vino.name}
                        </h3>
                        <span className={`${getWineTypeColor(vino.wine_type)} text-xs font-bold flex items-center gap-1`}>
                          {getWineTypeIcon(vino.wine_type)} {vino.wine_type.charAt(0).toUpperCase() + vino.wine_type.slice(1)}
                        </span>
                        {vino.vintage && (
                          <span className="text-sm text-enigma-neutral-500">
                            {vino.vintage}
                          </span>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="mt-1 text-lg font-bold text-enigma-accent">
                        €{vino.price.toFixed(2)}
                        {vino.price_glass && vino.price_glass > 0 && (
                          <span className="text-sm font-normal text-enigma-neutral-600 ml-2">
                            (Copa: €{vino.price_glass.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`ios-badge text-xs ${
                      vino.is_active 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {vino.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  {/* Info Row with Temperature */}
                  <div className="flex items-center gap-4 mb-3 text-sm text-enigma-neutral-600 flex-wrap">
                    <div>
                      <span className="text-enigma-neutral-500">Bodega:</span>{' '}
                      <span className="font-medium text-enigma-neutral-700">{vino.winery}</span>
                    </div>
                    {(vino.serving_temperature_min || vino.serving_temperature_max) && (
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Thermometer className="h-3 w-3" /> Servir a {vino.serving_temperature_min || 0}-{vino.serving_temperature_max || 0}°C
                      </div>
                    )}
                    {vino.denomination_origin && (
                      <div>
                        <span className="text-enigma-neutral-500">D.O.:</span>{' '}
                        <span className="font-medium text-enigma-neutral-700">{vino.denomination_origin}</span>
                      </div>
                    )}
                    {vino.region && (
                      <div>
                        <span className="text-enigma-neutral-500">Región:</span>{' '}
                        <span className="font-medium text-enigma-neutral-700">{vino.region}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-enigma-neutral-500">Stock:</span>{' '}
                      <span className="font-medium text-enigma-neutral-700">{vino.stock_quantity || 0}</span>
                    </div>
                    {vino.alcohol_percentage && vino.alcohol_percentage > 0 && (
                      <div className="font-medium text-enigma-accent">
                        {vino.alcohol_percentage}% alcohol
                      </div>
                    )}
                  </div>

                  {/* Badges and Actions Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {vino.is_organic && (
                        <span className="ios-badge ios-badge-secondary text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Ecológico
                        </span>
                      )}
                      {vino.is_recommended && (
                        <span className="ios-badge ios-badge-accent text-xs">
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                          Recomendado
                        </span>
                      )}
                      {vino.awards && (
                        <span className="ios-badge ios-badge-warning text-xs">
                          Premiado
                        </span>
                      )}
                      {vino.allergen_ids && vino.allergen_ids.length > 0 && (
                        <div className="group relative">
                          <span className="ios-badge ios-badge-warning text-xs cursor-help">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {vino.allergen_ids.length} alérgenos
                          </span>
                          {/* Allergen Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 pointer-events-none">
                            <div className="bg-enigma-neutral-900 text-white text-xs rounded-lg p-2 max-w-xs shadow-lg">
                              <div className="flex flex-wrap gap-2">
                                {vino.allergen_ids.map((allergenId) => {
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
                            await updateWine.mutateAsync({
                              id: vino.id,
                              updates: { is_recommended: !vino.is_recommended }
                            });
                          } catch (error) {
                            console.error('Error updating recommendation:', error);
                          }
                        }}
                        className={`ios-button ios-button-sm ${
                          vino.is_recommended 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 border-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                        }`}
                        title={vino.is_recommended ? 'Quitar recomendación' : 'Marcar como recomendado'}
                      >
                        <Heart className={`h-4 w-4 ${vino.is_recommended ? 'fill-current' : ''}`} />
                        <span className="ml-1 hidden lg:inline">
                          {vino.is_recommended ? 'Recomendado' : 'Recomendar'}
                        </span>
                      </button>

                      {/* Toggle Available */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await toggleWineAvailability.mutateAsync({
                              id: vino.id,
                              available: !vino.is_available
                            });
                          } catch (error) {
                            console.error('Error updating availability:', error);
                          }
                        }}
                        className={`ios-button ios-button-sm ${
                          vino.is_available 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200 border-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                        }`}
                        title={vino.is_available ? 'Marcar como no disponible' : 'Marcar como disponible'}
                      >
                        {vino.is_available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span className="ml-1 hidden lg:inline">
                          {vino.is_available ? 'Disponible' : 'No disponible'}
                        </span>
                      </button>

                      <div className="w-px h-6 bg-enigma-neutral-200 mx-1" />

                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditingId(vino.id);
                          setShowForm(true);
                          loadVinoForEdit(vino.id);
                        }}
                        className="ios-button ios-button-sm ios-button-ghost"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Editar</span>
                      </button>
                      
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(vino.id);
                        }}
                        className="ios-button ios-button-sm ios-button-danger"
                        title="Eliminar vino"
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
      {filteredAndSortedVinos.length === 0 && (
        <div className="text-center py-12 ios-card">
          <Wine className="mx-auto h-12 w-12 text-enigma-neutral-400 mb-4" />
          <h3 className="text-heading-3 text-enigma-neutral-900 mb-2">
            No se encontraron vinos
          </h3>
          <p className="text-body text-enigma-neutral-600 mb-4">
            {searchTerm || selectedTipo || filterEcologico || filterRecomendado
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer vino a la carta'
            }
          </p>
          {!searchTerm && !selectedTipo && !filterEcologico && !filterRecomendado && (
            <button
              onClick={() => setShowForm(true)}
              className="ios-button ios-button-primary"
            >
              <Plus size={16} />
              Crear Primer Vino
            </button>
          )}
        </div>
      )}

      {/* Wine Form Modal - Custom Implementation */}
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
                      {editingId ? 'Editar Vino' : 'Nuevo Vino'}
                    </h2>
                    <p className="text-sm text-enigma-neutral-600 mt-1">
                      {editingId ? 'Modifica los datos del vino seleccionado' : 'Añade un nuevo vino a la carta'}
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
                          Nombre del Vino *
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`ios-input ${formErrors.name ? 'border-red-300' : ''}`}
                          placeholder="Ej: Marqués de Riscal Reserva"
                        />
                        {formErrors.name && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Bodega/Productor *
                        </label>
                        <input
                          type="text"
                          value={formData.winery || ''}
                          onChange={(e) => handleInputChange('winery', e.target.value)}
                          className={`ios-input ${formErrors.winery ? 'border-red-300' : ''}`}
                          placeholder="Ej: Bodegas Marqués de Riscal"
                        />
                        {formErrors.winery && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.winery}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Tipo de Vino *
                        </label>
                        <select
                          value={formData.wine_type || 'tinto'}
                          onChange={(e) => handleInputChange('wine_type', e.target.value)}
                          className="ios-input"
                        >
                          {WINE_TYPES.map(tipo => (
                            <option key={tipo} value={tipo}>
                              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="ios-label">
                            Añada/Vintage
                          </label>
                          <input
                            type="text"
                            value={formData.vintage || ''}
                            onChange={(e) => handleInputChange('vintage', e.target.value)}
                            className="ios-input"
                            placeholder="2019"
                          />
                        </div>

                        <div>
                          <label className="ios-label">
                            Graduación (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formData.alcohol_percentage || ''}
                            onChange={(e) => handleInputChange('alcohol_percentage', parseFloat(e.target.value) || 0)}
                            className="ios-input"
                            placeholder="14.0"
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
                            Precio Botella (€) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price || ''}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                            className={`ios-input ${formErrors.price ? 'border-red-300' : ''}`}
                            placeholder="28.50"
                          />
                          {formErrors.price && (
                            <p className="text-caption text-red-600 mt-1">{formErrors.price}</p>
                          )}
                        </div>

                        <div>
                          <label className="ios-label">
                            Precio Copa (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price_glass || ''}
                            onChange={(e) => handleInputChange('price_glass', parseFloat(e.target.value) || 0)}
                            className="ios-input"
                            placeholder="7.50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Technical Information */}
                    <div className="space-y-4">
                      <h3 className="text-heading-3 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2">
                        Información Técnica
                      </h3>
                  
                      <div>
                        <label className="ios-label">
                          Variedad de Uva
                        </label>
                        <input
                          type="text"
                          value={formData.grape_variety || ''}
                          onChange={(e) => handleInputChange('grape_variety', e.target.value)}
                          className="ios-input"
                          placeholder="Ej: Tempranillo, Graciano, Mazuelo"
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Denominación de Origen
                        </label>
                        <input
                          type="text"
                          value={formData.denomination_origin || ''}
                          onChange={(e) => handleInputChange('denomination_origin', e.target.value)}
                          className="ios-input"
                          placeholder="Ej: D.O.Ca. Rioja"
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Región
                        </label>
                        <input
                          type="text"
                          value={formData.region || ''}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className="ios-input"
                          placeholder="Ej: La Rioja"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="ios-label">
                            Temperatura Mín. (°C)
                          </label>
                          <input
                            type="number"
                            value={formData.serving_temperature_min || ''}
                            onChange={(e) => handleInputChange('serving_temperature_min', parseInt(e.target.value) || 0)}
                            className="ios-input"
                            placeholder="16"
                          />
                        </div>

                        <div>
                          <label className="ios-label">
                            Temperatura Máx. (°C)
                          </label>
                          <input
                            type="number"
                            value={formData.serving_temperature_max || ''}
                            onChange={(e) => handleInputChange('serving_temperature_max', parseInt(e.target.value) || 0)}
                            className="ios-input"
                            placeholder="18"
                          />
                        </div>
                      </div>
                      
                      {/* Characteristics */}
                      <h4 className="text-heading-4 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2 mt-6">
                        Características
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_organic || false}
                            onChange={(e) => handleInputChange('is_organic', e.target.checked)}
                            className="ios-checkbox"
                          />
                          <Leaf size={16} className="text-green-600" />
                          <span className="text-body text-enigma-neutral-900">Ecológico</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_recommended || false}
                            onChange={(e) => handleInputChange('is_recommended', e.target.checked)}
                            className="ios-checkbox"
                          />
                          <Heart size={16} className="text-red-500" />
                          <span className="text-body text-enigma-neutral-900">Recomendado</span>
                        </label>
                      </div>

                      {/* Stock and Display */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="ios-label">
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.stock_quantity || 0}
                            onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
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
                            onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                            className="ios-input"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_available || false}
                          onChange={(e) => handleInputChange('is_available', e.target.checked)}
                          className="ios-checkbox"
                        />
                        <Eye size={16} className="text-blue-600" />
                        <span className="text-body text-enigma-neutral-900">Disponible</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active !== false}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                          className="ios-checkbox"
                        />
                        <span className="text-body text-enigma-neutral-900">Vino activo</span>
                      </label>
                    </div>
                  </div>

                  {/* Descriptions - Full Width */}
                  <div className="col-span-1 lg:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2 mb-4">
                      Descripciones y Notas
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="ios-label">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className="ios-input resize-none"
                          rows={3}
                          placeholder="Descripción general del vino..."
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Notas de Cata
                        </label>
                        <textarea
                          value={formData.tasting_notes || ''}
                          onChange={(e) => handleInputChange('tasting_notes', e.target.value)}
                          className="ios-input resize-none"
                          rows={3}
                          placeholder="Color, aroma, sabor, final..."
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Notas de Maridaje
                        </label>
                        <textarea
                          value={formData.pairing_notes || ''}
                          onChange={(e) => handleInputChange('pairing_notes', e.target.value)}
                          className="ios-input resize-none"
                          rows={3}
                          placeholder="Maridajes recomendados..."
                        />
                      </div>

                      {/* Dish Pairing Recommendations */}
                      <div>
                        <label className="ios-label">
                          Platos Recomendados
                        </label>
                        <div className="space-y-2">
                          <select
                            className="ios-input"
                            onChange={(e) => {
                              if (e.target.value) {
                                const dishName = e.target.value;
                                const currentPairing = formData.pairing_notes || '';
                                const dishSection = currentPairing.includes('Platos recomendados:') 
                                  ? currentPairing
                                  : currentPairing + (currentPairing ? '\n\n' : '') + 'Platos recomendados: ';
                                
                                if (!dishSection.includes(dishName)) {
                                  const newPairing = dishSection.includes('Platos recomendados: ')
                                    ? dishSection.replace('Platos recomendados: ', `Platos recomendados: ${dishName}, `)
                                    : dishSection + dishName + ', ';
                                  
                                  handleInputChange('pairing_notes', newPairing.replace(/, $/, ''));
                                }
                                e.target.value = '';
                              }
                            }}
                          >
                            <option value="">Seleccionar plato para agregar...</option>
                            {dishes
                              .filter(dish => dish.is_active)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((dish) => (
                                <option key={dish.id} value={dish.name}>
                                  {dish.name} ({dish.category_display_name || 'Sin categoría'})
                                </option>
                              ))}
                          </select>
                          <p className="text-xs text-enigma-neutral-500">
                            Los platos seleccionados se agregarán automáticamente a las notas de maridaje
                          </p>
                        </div>
                      </div>

                      {/* URL de Imagen */}
                      <div>
                        <label className="ios-label">
                          URL de Imagen
                        </label>
                        <input
                          type="url"
                          value={formData.image_url || ''}
                          onChange={(e) => handleInputChange('image_url', e.target.value)}
                          className="ios-input"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Allergens Section - Full Width */}
                  <div className="col-span-1 lg:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2 mb-4">
                      Alérgenos
                    </h3>
                    <AllergenSelector
                      selectedIds={formData.allergen_ids || []}
                      onChange={(ids) => handleInputChange('allergen_ids', ids)}
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
                            {editingId ? 'Actualizar Vino' : 'Crear Vino'}
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
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-enigma-neutral-900">
                      Eliminar Vino
                    </h3>
                    <p className="text-sm text-enigma-neutral-600 mt-1">
                      ¿Estás seguro de que quieres eliminar este vino? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="ios-button ios-button-secondary"
                    disabled={isDeleting === confirmDelete}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => confirmDelete && handleDelete(confirmDelete)}
                    className="ios-button ios-button-danger"
                    disabled={isDeleting === confirmDelete}
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

export default WebAdminVinos;