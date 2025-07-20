import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, X, 
  Loader2, ChevronDown, ChevronUp, Heart,
  RefreshCcw, GlassWater, Check
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { 
  WebBeverage, WebAllergen,
  WebBeverageInsert, WebBeverageUpdate 
} from '../../types/web-database';
import { useWebBeverages, useWebAllergens } from '../../hooks/web-admin/useWebContentManagement';
import AllergenSelector from '../../components/web-admin/AllergenSelector';

const WebAdminBebidas: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use web beverages hook (already excludes wines)
  const { 
    beverages: bebidas,
    beveragesLoading,
    createBeverage,
    updateBeverage,
    deleteBeverage,
    refetchBeverages
  } = useWebBeverages();

  // Use web allergens hook for allergen selection
  const { allergens } = useWebAllergens();
  
  const [bebidaCategories, setBebidaCategories] = useState<string[]>([]);
  const isLoading = beveragesLoading;
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterAlcoholic, setFilterAlcoholic] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<'name' | 'price' | 'category'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState<Partial<WebBeverage>>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price_glass: null,
    price_bottle: null,
    alcohol_percentage: null,
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

  // Extract unique categories when bebidas data changes
  useEffect(() => {
    if (bebidas.length > 0) {
      const categories = [...new Set(bebidas.map(b => b.category))].sort();
      setBebidaCategories(categories);
    }
  }, [bebidas]);
  
  // Check for query params on initial load
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setEditingId(parseInt(idParam));
      setShowForm(true);
      loadBebidaForEdit(parseInt(idParam));
    }
  }, [searchParams]);

  // Load bebida for editing
  const loadBebidaForEdit = async (id: number) => {
    try {
      const bebida = bebidas.find(b => b.id === id);
      if (bebida) {
        setFormData({
          id: bebida.id,
          name: bebida.name,
          description: bebida.description,
          category: bebida.category,
          subcategory: bebida.subcategory,
          price_glass: bebida.price_glass,
          price_bottle: bebida.price_bottle,
          alcohol_percentage: bebida.alcohol_percentage,
          is_alcoholic: bebida.is_alcoholic,
          origin: bebida.origin,
          producer: bebida.producer,
          serving_temperature: bebida.serving_temperature,
          allergen_ids: bebida.allergen_ids || [],
          is_recommended: bebida.is_recommended,
          is_organic: bebida.is_organic,
          stock_quantity: bebida.stock_quantity,
          sort_order: bebida.sort_order,
          is_active: bebida.is_active
        });
      }
    } catch (error) {
      console.error('Error loading bebida:', error);
    }
  };
  
  // Filter and sort bebidas
  const filteredBebidas = useMemo(() => {
    return bebidas
      .filter(bebida => {
        // Search filter
        if (searchTerm && !bebida.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Category filter
        if (selectedCategory && bebida.category !== selectedCategory) {
          return false;
        }
        
        // Alcoholic filter
        if (filterAlcoholic !== null && bebida.is_alcoholic !== filterAlcoholic) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        let aValue, bValue;
        
        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.price_glass || a.price_bottle || 0;
            bValue = b.price_glass || b.price_bottle || 0;
            break;
          case 'category':
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [bebidas, searchTerm, selectedCategory, filterAlcoholic, sortField, sortDirection]);
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilterAlcoholic(null);
    setSortField('name');
    setSortDirection('asc');
  };
  
  // Toggle sort
  const handleToggleSort = (field: 'name' | 'price' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Delete bebida
  const handleDelete = async (id: number) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      setIsDeleting(id);
      setConfirmDelete(null);
      
      // Use the deleteBeverage mutation from the hook
      await deleteBeverage.mutateAsync(id);
      
      // Close form if we were editing this bebida
      if (editingId === id) {
        setEditingId(null);
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          category: '',
          subcategory: '',
          price_glass: null,
          price_bottle: null,
          alcohol_percentage: null,
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
      }
      
    } catch (error) {
      console.error('Error deleting bebida:', error);
      alert('Error al eliminar la bebida');
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name?.trim()) {
      setFormErrors({ name: 'El nombre es obligatorio' });
      return;
    }
    
    if (!formData.price_glass && !formData.price_bottle) {
      setFormErrors({ price: 'Debe incluir al menos un precio (copa o botella)' });
      return;
    }
    
    if (!formData.category?.trim()) {
      setFormErrors({ category: 'La categoría es obligatoria' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormErrors({});
      
      const submitData: WebBeverageInsert | WebBeverageUpdate = {
        name: formData.name!,
        description: formData.description,
        category: formData.category!,
        subcategory: formData.subcategory,
        price_glass: formData.price_glass,
        price_bottle: formData.price_bottle,
        alcohol_percentage: formData.alcohol_percentage,
        is_alcoholic: formData.is_alcoholic || false,
        origin: formData.origin,
        producer: formData.producer,
        serving_temperature: formData.serving_temperature,
        allergen_ids: formData.allergen_ids || [],
        is_recommended: formData.is_recommended || false,
        is_organic: formData.is_organic || false,
        stock_quantity: formData.stock_quantity || 0,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active ?? true
      };
      
      if (editingId) {
        // Update existing using hook
        await updateBeverage.mutateAsync({ id: editingId, updates: submitData });
      } else {
        // Create new using hook
        await createBeverage.mutateAsync(submitData as WebBeverageInsert);
      }
      
      // Close form
      handleFormCancel();
      
    } catch (error: any) {
      console.error('Error saving bebida:', error);
      setFormErrors({ submit: error.message || 'Error al guardar la bebida' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price_glass: null,
      price_bottle: null,
      alcohol_percentage: null,
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
    
    // Clear URL parameters
    if (searchParams.has('id')) {
      searchParams.delete('id');
      setSearchParams(searchParams);
    }
  };
  
  // Format price
  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '-';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-serif text-enigma-blue">Gestión de Bebidas</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-enigma-blue text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-opacity-90 transition-colors"
          >
            <Plus size={18} />
            Nueva Bebida
          </button>
        </div>
      </div>
      
      {/* Form for adding/editing */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif text-enigma-blue">
              {editingId ? 'Editar Bebida' : 'Nueva Bebida'}
            </h2>
            <button onClick={handleFormCancel} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {formErrors.submit}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre*
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-2 border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                  placeholder="Ej: Agua con Gas San Pellegrino"
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
              </div>
              
              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría*
                </label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full p-2 border ${formErrors.category ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                  placeholder="Ej: Bebidas sin alcohol"
                />
                {formErrors.category && <p className="mt-1 text-xs text-red-500">{formErrors.category}</p>}
              </div>
              
              {/* Subcategoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoría
                </label>
                <input
                  type="text"
                  value={formData.subcategory || ''}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="Ej: Aguas"
                />
              </div>
              
              {/* Precio Botella */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Botella (€)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_bottle || ''}
                  onChange={(e) => setFormData({ ...formData, price_bottle: parseFloat(e.target.value) || null })}
                  className={`w-full p-2 border ${formErrors.price ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                  placeholder="15.00"
                />
                {formErrors.price && <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>}
              </div>
              
              {/* Precio Copa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Copa (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_glass || ''}
                  onChange={(e) => setFormData({ ...formData, price_glass: parseFloat(e.target.value) || null })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="2.50"
                />
              </div>
              
              {/* Origen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen
                </label>
                <input
                  type="text"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="Ej: Italia"
                />
              </div>
              
              {/* Productor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Productor/Marca
                </label>
                <input
                  type="text"
                  value={formData.producer || ''}
                  onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="Ej: San Pellegrino"
                />
              </div>
              
              {/* Temperatura de servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura de Servicio
                </label>
                <input
                  type="text"
                  value={formData.serving_temperature || ''}
                  onChange={(e) => setFormData({ ...formData, serving_temperature: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="Ej: 4-6°C"
                />
              </div>
            </div>
            
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                placeholder="Descripción de la bebida..."
              />
            </div>

            {/* Allergen Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alérgenos
              </label>
              <AllergenSelector
                selectedIds={formData.allergen_ids || []}
                onChange={(ids) => setFormData({ ...formData, allergen_ids: ids })}
                disabled={isSubmitting}
                showSearch={allergens.length > 8}
                className="max-h-80"
              />
            </div>
            
            {/* Características */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_alcoholic || false}
                  onChange={(e) => setFormData({ ...formData, is_alcoholic: e.target.checked })}
                  className="w-4 h-4 text-enigma-blue border-gray-300 rounded focus:ring-enigma-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Con alcohol</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_recommended || false}
                  onChange={(e) => setFormData({ ...formData, is_recommended: e.target.checked })}
                  className="w-4 h-4 text-enigma-blue border-gray-300 rounded focus:ring-enigma-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Recomendado</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_organic || false}
                  onChange={(e) => setFormData({ ...formData, is_organic: e.target.checked })}
                  className="w-4 h-4 text-enigma-blue border-gray-300 rounded focus:ring-enigma-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Orgánico</span>
              </label>
            </div>
            
            {/* Porcentaje de alcohol (si es alcohólica) */}
            {formData.is_alcoholic && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de Alcohol (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.alcohol_percentage || ''}
                  onChange={(e) => setFormData({ ...formData, alcohol_percentage: parseFloat(e.target.value) || null })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="12.5"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleFormCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-enigma-blue text-white rounded-md hover:bg-opacity-90 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Bebida'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Buscar bebidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-enigma-blue"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue appearance-none"
              >
                <option value="">Todas las categorías</option>
                {bebidaCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 p-2 border ${
                filterAlcoholic !== null
                  ? 'border-enigma-blue text-enigma-blue'
                  : 'border-gray-300 text-gray-600'
              } rounded-md hover:bg-gray-50`}
            >
              <Filter size={16} />
              Filtros
              {filterAlcoholic !== null && (
                <span className="bg-enigma-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  1
                </span>
              )}
            </button>
            
            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 p-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <RefreshCcw size={16} />
              Resetear
            </button>
          </div>
        </div>
        
        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Filtrar por alcohol:</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterAlcoholic === true}
                      onChange={() => setFilterAlcoholic(true)}
                      className="w-4 h-4 text-enigma-blue border-gray-300 focus:ring-enigma-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700">Con alcohol</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterAlcoholic === false}
                      onChange={() => setFilterAlcoholic(false)}
                      className="w-4 h-4 text-enigma-blue border-gray-300 focus:ring-enigma-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sin alcohol</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterAlcoholic === null}
                      onChange={() => setFilterAlcoholic(null)}
                      className="w-4 h-4 text-enigma-blue border-gray-300 focus:ring-enigma-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todos</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bebidas Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-enigma-blue" />
          </div>
        ) : filteredBebidas.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No se encontraron bebidas con los criterios seleccionados.</p>
            <button 
              onClick={handleResetFilters}
              className="mt-2 text-enigma-blue hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    ID
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleToggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Nombre</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleToggleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Categoría</span>
                      {sortField === 'category' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origen
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleToggleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Precio</span>
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alérgenos
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBebidas.map((bebida) => (
                  <tr 
                    key={bebida.id} 
                    className={confirmDelete === bebida.id ? 'bg-red-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {bebida.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{bebida.name}</div>
                      {bebida.description && (
                        <div className="text-xs text-gray-500 max-w-xs truncate">{bebida.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bebida.category}</div>
                      {bebida.subcategory && (
                        <div className="text-xs text-gray-500">{bebida.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bebida.origin || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bebida.price_bottle && (
                        <div className="text-sm font-medium text-gray-900">{formatPrice(bebida.price_bottle)} botella</div>
                      )}
                      {bebida.price_glass && (
                        <div className="text-xs text-gray-500">{formatPrice(bebida.price_glass)} copa</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-24">
                        {bebida.allergen_ids && bebida.allergen_ids.length > 0 ? (
                          bebida.allergen_ids.slice(0, 3).map((allergenId) => {
                            const allergen = allergens.find(a => a.id === allergenId);
                            if (!allergen) return null;
                            return (
                              <span
                                key={allergenId}
                                className="inline-flex items-center px-1.5 py-0.5 text-xs rounded-full"
                                style={{ 
                                  backgroundColor: allergen.color + '20',
                                  color: allergen.color 
                                }}
                                title={allergen.name}
                              >
                                {allergen.icon}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400">Ninguno</span>
                        )}
                        {bebida.allergen_ids && bebida.allergen_ids.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{bebida.allergen_ids.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {bebida.is_alcoholic ? (
                          <span className="bg-amber-100 text-amber-800 p-1 rounded-full" title="Con alcohol">
                            <GlassWater size={14} />
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-800 p-1 rounded-full" title="Sin alcohol">
                            <GlassWater size={14} />
                          </span>
                        )}
                        
                        {bebida.is_recommended && (
                          <span className="bg-red-100 text-red-800 p-1 rounded-full" title="Recomendado">
                            <Heart size={14} />
                          </span>
                        )}
                        
                        {bebida.alcohol_percentage && (
                          <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {bebida.alcohol_percentage}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {confirmDelete === bebida.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs text-red-600">¿Confirmar?</span>
                          <button 
                            onClick={() => handleDelete(bebida.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            {isDeleting === bebida.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Check size={18} />
                            )}
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(null)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingId(bebida.id);
                              setShowForm(true);
                              loadBebidaForEdit(bebida.id);
                              
                              // Add id to URL
                              searchParams.set('id', bebida.id.toString());
                              setSearchParams(searchParams);
                            }}
                            className="text-enigma-blue hover:text-opacity-70"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(bebida.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebAdminBebidas;