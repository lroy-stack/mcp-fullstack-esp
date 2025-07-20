import React, { useState, useEffect, useMemo } from 'react';
// import { motion } from 'framer-motion'; // Removed to minimize animations
import { 
  Plus, Search, Filter, Edit, Trash2, X, 
  Loader2, ChevronDown, ChevronUp, Heart,
  RefreshCcw, Utensils, Check, Leaf, 
  Flame, Clock, Users, Eye, EyeOff, Grid3X3, List, Package, AlertTriangle,
  Star, Fish, Wheat
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { 
  WebDish, WebDishWithCategory, WebCategory,
  WebDishInsert, WebDishUpdate 
} from '../../types/web-database';
import { useWebDishes, useWebWines, useWebAllergens } from '../../hooks/web-admin/useWebContentManagement';
import AllergenSelector from '../../components/web-admin/AllergenSelector';

// Utility functions for category visual differentiation
const getCategoryIcon = (categoryName: string) => {
  switch (categoryName?.toLowerCase()) {
    case 'entrantes': return <Utensils className="h-4 w-4" />;
    case 'ensaladas': return <Leaf className="h-4 w-4" />;
    case 'croquetas': return <Package className="h-4 w-4" />;
    case 'entrantes-especiales': return <Star className="h-4 w-4" />;
    case 'carnes': return <Flame className="h-4 w-4" />;
    case 'pescados': return <Fish className="h-4 w-4" />;
    case 'arroz-pasta': return <Wheat className="h-4 w-4" />;
    case 'postres': return <Heart className="h-4 w-4" />;
    default: return <Utensils className="h-4 w-4" />;
  }
};

const getCategoryColor = (categoryName: string) => {
  switch (categoryName?.toLowerCase()) {
    case 'entrantes': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ensaladas': return 'bg-green-50 text-green-700 border-green-200';
    case 'croquetas': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'entrantes-especiales': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'carnes': return 'bg-red-50 text-red-700 border-red-200';
    case 'pescados': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'arroz-pasta': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'postres': return 'bg-pink-50 text-pink-700 border-pink-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getCategoryAccent = (categoryName: string) => {
  switch (categoryName?.toLowerCase()) {
    case 'entrantes': return 'border-blue-400';
    case 'ensaladas': return 'border-green-400';
    case 'croquetas': return 'border-orange-400';
    case 'entrantes-especiales': return 'border-purple-400';
    case 'carnes': return 'border-red-400';
    case 'pescados': return 'border-cyan-400';
    case 'arroz-pasta': return 'border-yellow-400';
    case 'postres': return 'border-pink-400';
    default: return 'border-gray-400';
  }
};

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showInactive, setShowInactive] = useState(true);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterVegetarian, setFilterVegetarian] = useState<boolean | null>(null);
  const [filterRecommended, setFilterRecommended] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<'name' | 'price' | 'category'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form state
  const [formData, setFormData] = useState<Partial<WebDishInsert>>({
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
      console.error('Error loading dish for edit:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof WebDishInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'El nombre es requerido';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'La categoría es requerida';
    }
    
    if (!formData.price || formData.price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await updateDish.mutateAsync({ 
          id: editingId, 
          updates: formData as WebDishUpdate 
        });
      } else {
        await createDish.mutateAsync(formData as WebDishInsert);
      }
      
      handleCloseForm();
      refetchDishes();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close form
  const handleCloseForm = () => {
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
    
    // Clear URL params
    if (searchParams.get('id')) {
      setSearchParams({});
    }
  };

  // Handle edit
  const handleEdit = (dish: WebDishWithCategory) => {
    setEditingId(dish.id);
    setShowForm(true);
    loadDishForEdit(dish.id);
    searchParams.set('id', dish.id.toString());
    setSearchParams(searchParams);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteDish.mutateAsync(id);
      setConfirmDelete(null);
      refetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Toggle sort
  const handleSort = (field: 'name' | 'price' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilterVegetarian(null);
    setFilterRecommended(null);
    setSortField('name');
    setSortDirection('asc');
    setShowInactive(true);
  };

  // Filtered and sorted dishes
  const filteredDishes = useMemo(() => {
    let filtered = [...dishes];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(dish => dish.category_name === selectedCategory);
    }
    
    // Vegetarian filter
    if (filterVegetarian !== null) {
      filtered = filtered.filter(dish => dish.is_vegetarian === filterVegetarian);
    }
    
    // Recommended filter
    if (filterRecommended !== null) {
      filtered = filtered.filter(dish => dish.is_recommended === filterRecommended);
    }
    
    // Active filter
    if (!showInactive) {
      filtered = filtered.filter(dish => dish.is_active);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          aValue = a.category_name || '';
          bValue = b.category_name || '';
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [dishes, searchTerm, selectedCategory, filterVegetarian, filterRecommended, sortField, sortDirection]);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-enigma-primary mb-4" />
          <p className="text-enigma-neutral-600">Cargando platos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-heading-2 text-enigma-neutral-900 flex items-center gap-2">
            <Utensils className="h-6 w-6 text-enigma-primary" />
            Gestión de Platos
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Administra el menú de platos del restaurante
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
            onClick={() => refetchDishes()}
            className="ios-button ios-button-sm ios-button-secondary"
          >
            <RefreshCcw size={16} />
          </button>
          
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            className="ios-button ios-button-primary"
          >
            <Plus size={16} />
            Nuevo Plato
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`overflow-hidden ios-card ${showFilters ? 'block' : 'hidden'}`}
      >
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar platos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ios-input pl-10"
              />
            </div>

            {/* Category filter with icons */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="ios-select"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.display_name}
                </option>
              ))}
            </select>

            {/* Vegetarian filter */}
            <select
              value={filterVegetarian === null ? '' : filterVegetarian.toString()}
              onChange={(e) => setFilterVegetarian(e.target.value === '' ? null : e.target.value === 'true')}
              className="ios-select"
            >
              <option value="">Todos los platos</option>
              <option value="true">Solo vegetarianos</option>
              <option value="false">No vegetarianos</option>
            </select>

            {/* Recommended filter */}
            <select
              value={filterRecommended === null ? '' : filterRecommended.toString()}
              onChange={(e) => setFilterRecommended(e.target.value === '' ? null : e.target.value === 'true')}
              className="ios-select"
            >
              <option value="">Todos</option>
              <option value="true">Solo recomendados</option>
              <option value="false">No recomendados</option>
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
              {filteredDishes.length} de {dishes.length} platos
              {dishes.filter(d => !d.is_active).length > 0 && (
                <span className="ml-2 text-enigma-neutral-500">
                  ({dishes.filter(d => !d.is_active).length} inactivos)
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
              <span className="text-body-sm text-enigma-neutral-700">Mostrar inactivos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Dishes Display */}
      {viewMode === 'grid' ? (
        // Grid View
        <div className="ios-grid">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className={`ios-card-product flex flex-col h-full border-l-4 ${getCategoryAccent(dish.category_name || '')}`}
            >
              {/* Card Header with Image */}
              <div className="card-header relative">
                {dish.image_url ? (
                  <img 
                    src={dish.image_url} 
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-enigma-neutral-100">
                    <Utensils className="h-16 w-16 text-enigma-neutral-300" />
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`ios-badge text-xs font-medium px-2 py-1 flex items-center gap-1 ${getCategoryColor(dish.category_name || '')}`}>
                    {getCategoryIcon(dish.category_name || '')}
                    {dish.category_display_name}
                  </span>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`ios-badge text-xs font-medium px-2 py-1 ${
                    dish.is_active 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {dish.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body flex-1 flex flex-col">
                {/* Title and Category */}
                <div className="mb-3">
                  <h3 className="card-title text-lg font-semibold text-enigma-neutral-900 mb-1">
                    {dish.name}
                  </h3>
                </div>
                
                {/* Price Section */}
                <div className="mb-3">
                  <div className="text-2xl font-bold text-enigma-accent">
                    {formatPrice(dish.price)}
                  </div>
                  {dish.preparation_time && (
                    <p className="text-sm text-enigma-neutral-600 flex items-center gap-1 mt-1">
                      <Clock size={14} />
                      {dish.preparation_time} min
                    </p>
                  )}
                </div>

                {/* Description */}
                {dish.description && (
                  <p className="text-sm text-enigma-neutral-600 mb-3 line-clamp-2 flex-1">
                    {dish.description}
                  </p>
                )}

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {dish.is_vegetarian && (
                    <span className="ios-badge ios-badge-secondary text-xs">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegetariano
                    </span>
                  )}
                  {dish.is_vegan && (
                    <span className="ios-badge ios-badge-secondary text-xs">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegano
                    </span>
                  )}
                  {dish.is_gluten_free && (
                    <span className="ios-badge ios-badge-primary text-xs">
                      Sin Gluten
                    </span>
                  )}
                  {dish.is_recommended && (
                    <span className="ios-badge ios-badge-accent text-xs">
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      Recomendado
                    </span>
                  )}
                  {dish.is_spicy && (
                    <span className="ios-badge ios-badge-danger text-xs">
                      <Flame className="h-3 w-3 mr-1" />
                      Picante
                    </span>
                  )}
                  {dish.allergen_ids && dish.allergen_ids.length > 0 && (
                    <div className="group relative">
                      <span className="ios-badge ios-badge-warning text-xs cursor-help">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {dish.allergen_ids.length} alérgenos
                      </span>
                      {/* Allergen Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                        <div className="bg-enigma-neutral-900 text-white text-xs rounded-lg p-2 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {dish.allergen_ids.map((allergenId) => {
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
                            await updateDish.mutateAsync({
                              id: dish.id,
                              updates: { is_recommended: !dish.is_recommended }
                            });
                          } catch (error) {
                            console.error('Error updating recommendation:', error);
                          }
                        }}
                        className={`ios-button-quick ${
                          dish.is_recommended 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={dish.is_recommended ? 'Quitar recomendación' : 'Marcar como recomendado'}
                      >
                        <Heart className={`h-4 w-4 ${dish.is_recommended ? 'fill-current' : ''}`} />
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateDish.mutateAsync({
                              id: dish.id,
                              updates: { is_active: !dish.is_active }
                            });
                          } catch (error) {
                            console.error('Error updating status:', error);
                          }
                        }}
                        className={`ios-button-quick ${
                          dish.is_active 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={dish.is_active ? 'Marcar como inactivo' : 'Marcar como activo'}
                      >
                        {dish.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Primary Actions Right */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(dish)}
                        className="ios-button ios-button-sm ios-button-ghost"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Editar</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(dish.id);
                        }}
                        className="ios-button-quick ios-button-danger"
                        title="Eliminar plato"
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
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="ios-card p-4 hover:shadow-ios-xl transition-shadow duration-150"
            >
              <div className={`flex items-start gap-4 border-l-4 ${getCategoryAccent(dish.category_name || '')} pl-4`}>
                {/* Image Thumbnail */}
                <div className="flex-shrink-0">
                  {dish.image_url ? (
                    <img 
                      src={dish.image_url} 
                      alt={dish.name}
                      className="w-16 h-16 rounded-ios object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-ios bg-enigma-neutral-100 flex items-center justify-center">
                      <Utensils className="h-8 w-8 text-enigma-neutral-400" />
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
                          {dish.name}
                        </h3>
                        <span className={`ios-badge text-xs flex items-center gap-1 ${getCategoryColor(dish.category_name || '')}`}>
                          {getCategoryIcon(dish.category_name || '')}
                          {dish.category_display_name}
                        </span>
                      </div>
                      
                      {/* Price */}
                      <div className="mt-1 text-lg font-bold text-enigma-accent">
                        {formatPrice(dish.price)}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`ios-badge text-xs ${
                      dish.is_active 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {dish.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  {/* Info Row */}
                  <div className="flex items-center gap-4 mb-3 text-sm text-enigma-neutral-600 flex-wrap">
                    {dish.preparation_time && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{dish.preparation_time} min</span>
                      </div>
                    )}
                    {dish.calories && (
                      <div>
                        <span className="text-enigma-neutral-500">Calorías:</span>{' '}
                        <span className="font-medium text-enigma-neutral-700">{dish.calories}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-enigma-neutral-500">Stock:</span>{' '}
                      <span className="font-medium text-enigma-neutral-700">{dish.stock_quantity || 'Sin límite'}</span>
                    </div>
                  </div>

                  {/* Badges and Actions Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {dish.is_vegetarian && (
                        <span className="ios-badge ios-badge-secondary text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegetariano
                        </span>
                      )}
                      {dish.is_vegan && (
                        <span className="ios-badge ios-badge-secondary text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegano
                        </span>
                      )}
                      {dish.is_gluten_free && (
                        <span className="ios-badge ios-badge-primary text-xs">
                          Sin Gluten
                        </span>
                      )}
                      {dish.is_recommended && (
                        <span className="ios-badge ios-badge-accent text-xs">
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                          Recomendado
                        </span>
                      )}
                      {dish.is_spicy && (
                        <span className="ios-badge ios-badge-danger text-xs">
                          <Flame className="h-3 w-3 mr-1" />
                          Picante {dish.spice_level > 0 && `(${dish.spice_level}/5)`}
                        </span>
                      )}
                      {dish.allergen_ids && dish.allergen_ids.length > 0 && (
                        <div className="group relative">
                          <span className="ios-badge ios-badge-warning text-xs cursor-help">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {dish.allergen_ids.length} alérgenos
                          </span>
                          {/* Allergen Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 pointer-events-none">
                            <div className="bg-enigma-neutral-900 text-white text-xs rounded-lg p-2 max-w-xs shadow-lg">
                              <div className="flex flex-wrap gap-2">
                                {dish.allergen_ids.map((allergenId) => {
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
                            await updateDish.mutateAsync({
                              id: dish.id,
                              updates: { is_recommended: !dish.is_recommended }
                            });
                          } catch (error) {
                            console.error('Error updating recommendation:', error);
                          }
                        }}
                        className={`ios-button ios-button-sm ${
                          dish.is_recommended 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200 border-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                        }`}
                        title={dish.is_recommended ? 'Quitar recomendación' : 'Marcar como recomendado'}
                      >
                        <Heart className={`h-4 w-4 ${dish.is_recommended ? 'fill-current' : ''}`} />
                        <span className="ml-1 hidden lg:inline">
                          {dish.is_recommended ? 'Recomendado' : 'Recomendar'}
                        </span>
                      </button>

                      {/* Toggle Active */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateDish.mutateAsync({
                              id: dish.id,
                              updates: { is_active: !dish.is_active }
                            });
                          } catch (error) {
                            console.error('Error updating status:', error);
                          }
                        }}
                        className={`ios-button ios-button-sm ${
                          dish.is_active 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200 border-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
                        }`}
                        title={dish.is_active ? 'Marcar como inactivo' : 'Marcar como activo'}
                      >
                        {dish.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <span className="ml-1 hidden lg:inline">
                          {dish.is_active ? 'Activo' : 'Activar'}
                        </span>
                      </button>

                      <div className="w-px h-6 bg-enigma-neutral-200 mx-1" />

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(dish)}
                        className="ios-button ios-button-sm ios-button-ghost"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Editar</span>
                      </button>
                      
                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(dish.id);
                        }}
                        className="ios-button ios-button-sm ios-button-danger"
                        title="Eliminar plato"
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
      {filteredDishes.length === 0 && (
        <div className="text-center py-12 ios-card">
          <Utensils className="mx-auto h-12 w-12 text-enigma-neutral-400 mb-4" />
          <h3 className="text-heading-3 text-enigma-neutral-900 mb-2">
            {searchTerm || selectedCategory || filterVegetarian !== null || filterRecommended !== null
              ? 'No se encontraron platos'
              : 'No hay platos registrados'
            }
          </h3>
          <p className="text-body text-enigma-neutral-600 mb-6">
            {searchTerm || selectedCategory || filterVegetarian !== null || filterRecommended !== null
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer plato al menú'
            }
          </p>
          {!searchTerm && !selectedCategory && filterVegetarian === null && filterRecommended === null && (
            <button
              onClick={() => setShowForm(true)}
              className="ios-button ios-button-primary"
            >
              Agregar Primer Plato
            </button>
          )}
        </div>
      )}

      {/* Dish Form Modal - Custom Implementation */}
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
                      {editingId ? 'Editar Plato' : 'Nuevo Plato'}
                    </h2>
                    <p className="text-sm text-enigma-neutral-600 mt-1">
                      {editingId ? 'Modifica los datos del plato seleccionado' : 'Añade un nuevo plato al menú'}
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
                          Nombre del Plato *
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`ios-input ${formErrors.name ? 'border-red-300' : ''}`}
                          placeholder="Ej: Jamón Ibérico de Bellota"
                        />
                        {formErrors.name && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Categoría *
                        </label>
                        <select
                          value={formData.category_id || ''}
                          onChange={(e) => handleInputChange('category_id', parseInt(e.target.value))}
                          className={`ios-select ${formErrors.category_id ? 'border-red-300' : ''}`}
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.display_name}
                            </option>
                          ))}
                        </select>
                        {formErrors.category_id && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.category_id}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Precio (€) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price || ''}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className={`ios-input ${formErrors.price ? 'border-red-300' : ''}`}
                          placeholder="24.50"
                        />
                        {formErrors.price && (
                          <p className="text-caption text-red-600 mt-1">{formErrors.price}</p>
                        )}
                      </div>

                      <div>
                        <label className="ios-label">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={3}
                          className="ios-textarea"
                          placeholder="Descripción detallada del plato..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="ios-label">
                            Tiempo de Preparación (min)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.preparation_time || ''}
                            onChange={(e) => handleInputChange('preparation_time', parseInt(e.target.value) || undefined)}
                            className="ios-input"
                            placeholder="25"
                          />
                        </div>

                        <div>
                          <label className="ios-label">
                            Calorías
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.calories || ''}
                            onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || undefined)}
                            className="ios-input"
                            placeholder="350"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                      <h3 className="text-heading-3 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2">
                        Detalles del Plato
                      </h3>
                      
                      <div>
                        <label className="ios-label">
                          Método de Cocción
                        </label>
                        <input
                          type="text"
                          value={formData.cooking_method || ''}
                          onChange={(e) => handleInputChange('cooking_method', e.target.value)}
                          className="ios-input"
                          placeholder="Plancha, Horno, Fritura..."
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Tamaño de Porción
                        </label>
                        <input
                          type="text"
                          value={formData.portion_size || ''}
                          onChange={(e) => handleInputChange('portion_size', e.target.value)}
                          className="ios-input"
                          placeholder="Individual, Para compartir..."
                        />
                      </div>

                      <div>
                        <label className="ios-label">
                          Maridaje Recomendado
                        </label>
                        <select
                          value={formData.wine_pairing || ''}
                          onChange={(e) => handleInputChange('wine_pairing', e.target.value)}
                          className="ios-select"
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="ios-label">
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.stock_quantity || ''}
                            onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                            className="ios-input"
                            placeholder="0 = Sin límite"
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

                      {/* Characteristics */}
                      <h4 className="text-heading-4 text-enigma-neutral-900 border-b border-enigma-neutral-200 pb-2 mt-6">
                        Características del Plato
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
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

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_vegetarian || false}
                            onChange={(e) => handleInputChange('is_vegetarian', e.target.checked)}
                            className="ios-checkbox"
                          />
                          <Leaf size={16} className="text-green-600" />
                          <span className="text-body text-enigma-neutral-900">Vegetariano</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_vegan || false}
                            onChange={(e) => handleInputChange('is_vegan', e.target.checked)}
                            className="ios-checkbox"
                          />
                          <Leaf size={16} className="text-green-600" />
                          <span className="text-body text-enigma-neutral-900">Vegano</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_gluten_free || false}
                            onChange={(e) => handleInputChange('is_gluten_free', e.target.checked)}
                            className="ios-checkbox"
                          />
                          <span className="text-body text-enigma-neutral-900">Sin Gluten</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_spicy || false}
                            onChange={(e) => handleInputChange('is_spicy', e.target.checked)}
                            className="ios-checkbox"
                          />
                          <Flame size={16} className="text-red-600" />
                          <span className="text-body text-enigma-neutral-900">Picante</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_active || false}
                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                            className="ios-checkbox"
                          />
                          <Eye size={16} className="text-blue-600" />
                          <span className="text-body text-enigma-neutral-900">Activo</span>
                        </label>
                      </div>

                      {/* Spice Level */}
                      {formData.is_spicy && (
                        <div>
                          <label className="ios-label">
                            Nivel de Picante (1-5)
                          </label>
                          <select
                            value={formData.spice_level || 0}
                            onChange={(e) => handleInputChange('spice_level', parseInt(e.target.value))}
                            className="ios-select"
                          >
                            <option value={0}>Sin picante</option>
                            <option value={1}>Suave</option>
                            <option value={2}>Moderado</option>
                            <option value={3}>Medio</option>
                            <option value={4}>Fuerte</option>
                            <option value={5}>Muy fuerte</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ingredients Section - Full Width */}
                  <div className="mt-6">
                    <label className="ios-label">
                      Ingredientes Principales
                    </label>
                    <textarea
                      value={formData.ingredients?.join(', ') || ''}
                      onChange={(e) => handleInputChange('ingredients', 
                        e.target.value.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0)
                      )}
                      rows={2}
                      className="ios-textarea"
                      placeholder="Ingredientes separados por comas: jamón ibérico, pan, tomate, aceite de oliva..."
                    />
                    <p className="text-caption text-enigma-neutral-500 mt-1">
                      Separa los ingredientes con comas
                    </p>
                  </div>

                  {/* Chef Notes */}
                  <div className="mt-4">
                    <label className="ios-label">
                      Notas del Chef
                    </label>
                    <textarea
                      value={formData.chef_notes || ''}
                      onChange={(e) => handleInputChange('chef_notes', e.target.value)}
                      rows={2}
                      className="ios-textarea"
                      placeholder="Notas especiales, sugerencias de presentación..."
                    />
                  </div>

                  {/* Allergens Section - Full Width */}
                  <div className="mt-6">
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
                            {editingId ? 'Actualizar Plato' : 'Crear Plato'}
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
                      ¿Eliminar plato?
                    </h3>
                    <p className="text-sm text-enigma-neutral-600 mt-1">
                      Esta acción no se puede deshacer. El plato se eliminará permanentemente del menú.
                    </p>
                  </div>
                </div>
                
                {/* Find the dish name to show */}
                {(() => {
                  const dish = dishes.find(d => d.id === confirmDelete);
                  return dish ? (
                    <div className="bg-enigma-neutral-50 rounded-ios p-4 mb-6">
                      <p className="text-sm font-medium text-enigma-neutral-900">
                        {dish.name}
                      </p>
                      <p className="text-sm text-enigma-neutral-600">
                        {dish.category_display_name} • {formatPrice(dish.price)}
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

export default WebAdminPlatos;