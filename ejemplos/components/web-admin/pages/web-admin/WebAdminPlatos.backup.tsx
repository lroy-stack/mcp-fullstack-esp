import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, X, 
  Loader2, ChevronDown, ChevronUp, Heart,
  RefreshCcw, Utensils, Check, Leaf, 
  Flame, Clock, Users, Eye, EyeOff
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { 
  WebDish, WebDishWithCategory, WebCategory,
  WebDishInsert, WebDishUpdate 
} from '../../types/web-database';
import { useWebDishes, useWebWines, useWebAllergens } from '../../hooks/web-admin/useWebContentManagement';
import AllergenSelector from '../../components/web-admin/AllergenSelector';

const WebAdminPlatos: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use web dishes hook
  const { 
    dishes,
    categories,
    dishesLoading,
    categoriesLoading,
    createDish,
    updateDish,
    deleteDish,
    refetchDishes
  } = useWebDishes();

  // Use web wines hook for wine pairing
  const { wines } = useWebWines();

  // Use web allergens hook for allergen selection
  const { allergens } = useWebAllergens();
  
  const isLoading = dishesLoading || categoriesLoading;
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterVegetarian, setFilterVegetarian] = useState<boolean | null>(null);
  const [filterRecommended, setFilterRecommended] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<'name' | 'price' | 'category'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState<Partial<WebDish>>({
    name: '',
    description: '',
    category_id: undefined,
    price: 0,
    allergen_ids: [],
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_recommended: false,
    is_spicy: false,
    spice_level: 0,
    preparation_time: undefined,
    calories: undefined,
    ingredients: [],
    cooking_method: '',
    portion_size: '',
    wine_pairing: '',
    chef_notes: '',
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
      loadDishForEdit(parseInt(idParam));
    }
  }, [searchParams]);

  // Load dish for editing
  const loadDishForEdit = async (id: number) => {
    try {
      const dish = dishes.find(d => d.id === id);
      if (dish) {
        setFormData({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          category_id: dish.category_id,
          price: dish.price,
          image_url: dish.image_url,
          allergen_ids: dish.allergen_ids || [],
          is_vegetarian: dish.is_vegetarian,
          is_vegan: dish.is_vegan,
          is_gluten_free: dish.is_gluten_free,
          is_recommended: dish.is_recommended,
          is_spicy: dish.is_spicy,
          spice_level: dish.spice_level,
          preparation_time: dish.preparation_time,
          calories: dish.calories,
          ingredients: dish.ingredients || [],
          cooking_method: dish.cooking_method,
          portion_size: dish.portion_size,
          wine_pairing: dish.wine_pairing,
          chef_notes: dish.chef_notes,
          stock_quantity: dish.stock_quantity,
          sort_order: dish.sort_order,
          is_active: dish.is_active
        });
      }
    } catch (error) {
      console.error('Error loading dish:', error);
    }
  };
  
  // Filter and sort dishes
  const filteredDishes = useMemo(() => {
    return dishes
      .filter(dish => {
        // Search filter
        if (searchTerm && !dish.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Category filter
        if (selectedCategory && dish.category_name !== selectedCategory) {
          return false;
        }
        
        // Vegetarian filter
        if (filterVegetarian !== null && dish.is_vegetarian !== filterVegetarian) {
          return false;
        }
        
        // Recommended filter
        if (filterRecommended !== null && dish.is_recommended !== filterRecommended) {
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
            aValue = a.price;
            bValue = b.price;
            break;
          case 'category':
            aValue = a.category_display_name?.toLowerCase() || '';
            bValue = b.category_display_name?.toLowerCase() || '';
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
  }, [dishes, searchTerm, selectedCategory, filterVegetarian, filterRecommended, sortField, sortDirection]);
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilterVegetarian(null);
    setFilterRecommended(null);
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
  
  // Delete dish
  const handleDelete = async (id: number) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }

    try {
      setIsDeleting(id);
      setConfirmDelete(null);
      
      // Use the deleteDish mutation from the hook
      await deleteDish.mutateAsync(id);
      
      // Close form if we were editing this dish
      if (editingId === id) {
        handleFormCancel();
      }
      
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Error al eliminar el plato');
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
    
    if (!formData.price || formData.price <= 0) {
      setFormErrors({ price: 'El precio debe ser mayor que 0' });
      return;
    }
    
    if (!formData.category_id) {
      setFormErrors({ category: 'La categoría es obligatoria' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormErrors({});
      
      const submitData: WebDishInsert | WebDishUpdate = {
        name: formData.name!,
        description: formData.description,
        category_id: formData.category_id!,
        price: formData.price!,
        image_url: formData.image_url,
        allergen_ids: formData.allergen_ids || [],
        is_vegetarian: formData.is_vegetarian || false,
        is_vegan: formData.is_vegan || false,
        is_gluten_free: formData.is_gluten_free || false,
        is_recommended: formData.is_recommended || false,
        is_spicy: formData.is_spicy || false,
        spice_level: formData.spice_level || 0,
        preparation_time: formData.preparation_time,
        calories: formData.calories,
        ingredients: formData.ingredients || [],
        cooking_method: formData.cooking_method,
        portion_size: formData.portion_size,
        wine_pairing: formData.wine_pairing,
        chef_notes: formData.chef_notes,
        stock_quantity: formData.stock_quantity || 0,
        sort_order: formData.sort_order || 0,
        is_active: formData.is_active ?? true
      };
      
      if (editingId) {
        // Update existing using hook
        await updateDish.mutateAsync({ id: editingId, updates: submitData });
      } else {
        // Create new using hook
        await createDish.mutateAsync(submitData as WebDishInsert);
      }
      
      // Close form
      handleFormCancel();
      
    } catch (error: any) {
      console.error('Error saving dish:', error);
      setFormErrors({ submit: error.message || 'Error al guardar el plato' });
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
      category_id: undefined,
      price: 0,
      allergen_ids: [],
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_recommended: false,
      is_spicy: false,
      spice_level: 0,
      preparation_time: undefined,
      calories: undefined,
      ingredients: [],
      cooking_method: '',
      portion_size: '',
      wine_pairing: '',
      chef_notes: '',
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
  const formatPrice = (price: number) => {
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
        <h1 className="text-2xl font-serif text-enigma-blue">Gestión de Platos</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            className="bg-enigma-blue text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-opacity-90 transition-colors"
          >
            <Plus size={18} />
            Nuevo Plato
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
              {editingId ? 'Editar Plato' : 'Nuevo Plato'}
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
                  placeholder="Ej: Jamón Ibérico de Bellota"
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
              </div>
              
              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría*
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) || undefined })}
                  className={`w-full p-2 border ${formErrors.category ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.display_name}
                    </option>
                  ))}
                </select>
                {formErrors.category && <p className="mt-1 text-xs text-red-500">{formErrors.category}</p>}
              </div>
              
              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (€)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className={`w-full p-2 border ${formErrors.price ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                  placeholder="24.50"
                />
                {formErrors.price && <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>}
              </div>
              
              {/* Tiempo de preparación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Preparación (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.preparation_time || ''}
                  onChange={(e) => setFormData({ ...formData, preparation_time: parseInt(e.target.value) || undefined })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="25"
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
                placeholder="Descripción del plato..."
              />
            </div>

            {/* Wine Pairing & Cooking Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wine Pairing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maridaje Recomendado
                </label>
                <select
                  value={formData.wine_pairing || ''}
                  onChange={(e) => setFormData({ ...formData, wine_pairing: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                >
                  <option value="">Sin maridaje específico</option>
                  <optgroup label="Vinos Tintos">
                    {wines.filter(wine => wine.wine_type === 'tinto' && wine.is_active).map((wine) => (
                      <option key={wine.id} value={wine.name}>
                        {wine.name} - {wine.winery}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Vinos Blancos">
                    {wines.filter(wine => wine.wine_type === 'blanco' && wine.is_active).map((wine) => (
                      <option key={wine.id} value={wine.name}>
                        {wine.name} - {wine.winery}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Vinos Rosados">
                    {wines.filter(wine => wine.wine_type === 'rosado' && wine.is_active).map((wine) => (
                      <option key={wine.id} value={wine.name}>
                        {wine.name} - {wine.winery}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Vinos Espumosos">
                    {wines.filter(wine => wine.wine_type === 'espumoso' && wine.is_active).map((wine) => (
                      <option key={wine.id} value={wine.name}>
                        {wine.name} - {wine.winery}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Cooking Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Cocción
                </label>
                <input
                  type="text"
                  value={formData.cooking_method || ''}
                  onChange={(e) => setFormData({ ...formData, cooking_method: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="ej: Plancha, Horno, Fritura..."
                />
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredientes Principales
              </label>
              <textarea
                value={formData.ingredients?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ingredients: e.target.value.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0)
                })}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                placeholder="Ingredientes separados por comas: jamón ibérico, pan, tomate, aceite de oliva..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa los ingredientes con comas
              </p>
            </div>

            {/* Chef Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas del Chef
              </label>
              <textarea
                value={formData.chef_notes || ''}
                onChange={(e) => setFormData({ ...formData, chef_notes: e.target.value })}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                placeholder="Notas especiales del chef sobre preparación, presentación..."
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
                  checked={formData.is_vegetarian || false}
                  onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                  className="w-4 h-4 text-enigma-blue border-gray-300 rounded focus:ring-enigma-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Vegetariano</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_vegan || false}
                  onChange={(e) => setFormData({ ...formData, is_vegan: e.target.checked })}
                  className="w-4 h-4 text-enigma-blue border-gray-300 rounded focus:ring-enigma-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Vegano</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_gluten_free || false}
                  onChange={(e) => setFormData({ ...formData, is_gluten_free: e.target.checked })}
                  className="w-4 h-4 text-enigma-blue border-gray-300 rounded focus:ring-enigma-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Sin Gluten</span>
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
                  checked={formData.is_spicy || false}
                  onChange={(e) => setFormData({ ...formData, is_spicy: e.target.checked })}
                  className="w-4 h-4 text-enigma-blue border-gray-300 rounded focus:ring-enigma-blue"
                />
                <span className="ml-2 text-sm text-gray-700">Picante</span>
              </label>
            </div>
            
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
                  'Guardar Plato'
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
              placeholder="Buscar platos..."
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
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.display_name}
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
                filterVegetarian !== null || filterRecommended !== null
                  ? 'border-enigma-blue text-enigma-blue'
                  : 'border-gray-300 text-gray-600'
              } rounded-md hover:bg-gray-50`}
            >
              <Filter size={16} />
              Filtros
              {(filterVegetarian !== null || filterRecommended !== null) && (
                <span className="bg-enigma-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {[filterVegetarian, filterRecommended].filter(f => f !== null).length}
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
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Filtrar por tipo:</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterVegetarian === true}
                      onChange={() => setFilterVegetarian(true)}
                      className="w-4 h-4 text-enigma-blue border-gray-300 focus:ring-enigma-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700">Vegetariano</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterVegetarian === null}
                      onChange={() => setFilterVegetarian(null)}
                      className="w-4 h-4 text-enigma-blue border-gray-300 focus:ring-enigma-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todos</span>
                  </label>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recomendados:</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterRecommended === true}
                      onChange={() => setFilterRecommended(true)}
                      className="w-4 h-4 text-enigma-blue border-gray-300 focus:ring-enigma-blue"
                    />
                    <span className="ml-2 text-sm text-gray-700">Solo recomendados</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterRecommended === null}
                      onChange={() => setFilterRecommended(null)}
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
      
      {/* Dishes Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-enigma-blue" />
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No se encontraron platos con los criterios seleccionados.</p>
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
                    Características
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDishes.map((dish) => (
                  <tr 
                    key={dish.id} 
                    className={confirmDelete === dish.id ? 'bg-red-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {dish.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                      {dish.description && (
                        <div className="text-xs text-gray-500 max-w-xs truncate">{dish.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{dish.category_display_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatPrice(dish.price)}</div>
                      {dish.preparation_time && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {dish.preparation_time} min
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-24">
                        {dish.allergen_ids && dish.allergen_ids.length > 0 ? (
                          dish.allergen_ids.slice(0, 3).map((allergenId) => {
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
                        {dish.allergen_ids && dish.allergen_ids.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{dish.allergen_ids.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {dish.is_vegetarian && (
                          <span className="bg-green-100 text-green-800 p-1 rounded-full" title="Vegetariano">
                            <Leaf size={14} />
                          </span>
                        )}
                        
                        {dish.is_recommended && (
                          <span className="bg-red-100 text-red-800 p-1 rounded-full" title="Recomendado">
                            <Heart size={14} />
                          </span>
                        )}
                        
                        {dish.is_spicy && (
                          <span className="bg-orange-100 text-orange-800 p-1 rounded-full" title="Picante">
                            <Flame size={14} />
                          </span>
                        )}
                        
                        {dish.is_gluten_free && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Sin Gluten
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {confirmDelete === dish.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-xs text-red-600">¿Confirmar?</span>
                          <button 
                            onClick={() => handleDelete(dish.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            {isDeleting === dish.id ? (
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
                              setEditingId(dish.id);
                              setShowForm(true);
                              loadDishForEdit(dish.id);
                              
                              // Add id to URL
                              searchParams.set('id', dish.id.toString());
                              setSearchParams(searchParams);
                            }}
                            className="text-enigma-blue hover:text-opacity-70"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(dish.id)}
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

export default WebAdminPlatos;