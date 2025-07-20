import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, X, 
  Loader2, Save, AlertCircle, Check, 
  ChevronDown, ChevronUp, Leaf, Wheat, Heart,
  RefreshCcw, Star, Eye
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { 
  WebMenuItem, WebCategory, WebAllergen, WebBeverage,
  WebMenuItemInsert, WebMenuItemUpdate 
} from '../../types/web-database';
import { useWebContentManagement } from '../../hooks/web-admin/useWebContentManagement';
import { supabaseWeb } from '../../integrations/supabase/client';
import WebAdminDishForm from '../../components/web-admin/WebAdminDishForm';

// Interfaz para plato personalizado temporal
interface PlatoPersonalizado extends Omit<WebMenuItem, 'id' | 'created_at' | 'updated_at'> {
  isCustom: true;
  tempId: string;
  vino_recomendado?: string;
}

// Interfaz para sugerencias del día
interface SugerenciaDelDia {
  tipo: 'dia' | 'semana' | 'especial';
  titulo: string;
  platos: (WebMenuItem | PlatoPersonalizado | null)[];
  descripcion: string;
  created_at?: string;
}

const WebAdminDishes: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use web content management hook
  const { 
    menuItems: platos, 
    categories: categorias, 
    allergens: alergenos,
    beverages: bebidas,
    menuItemsLoading,
    categoriesLoading,
    allergensLoading,
    refetchMenuItems,
    refetchCategories,
    refetchAllergens
  } = useWebContentManagement();
  
  const isLoading = menuItemsLoading || categoriesLoading || allergensLoading;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [filterVegan, setFilterVegan] = useState(false);
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);
  
  // Form state for validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSuccess, setFormSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Sugerencias del día
  const [tipoSugerencia, setTipoSugerencia] = useState<'dia' | 'semana' | 'especial'>('dia');
  const [tituloSugerencia, setTituloSugerencia] = useState('');
  const [platosSugeridos, setPlatosSugeridos] = useState<(WebMenuItem | PlatoPersonalizado | null)[]>([null, null, null]);
  const [descripcionSugerencia, setDescripcionSugerencia] = useState('');
  const [showPublishedSuggestions, setShowPublishedSuggestions] = useState(false);
  const [publishedSuggestions, setPublishedSuggestions] = useState<SugerenciaDelDia | null>(null);
  
  // Estado para el formulario de plato personalizado
  const [showCustomDishForm, setShowCustomDishForm] = useState(false);
  const [customDishForm, setCustomDishForm] = useState<Partial<PlatoPersonalizado>>({
    name: '',
    description: '',
    price: 0,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_recommended: false,
    status: 'active',
    isCustom: true,
    tempId: '',
    vino_recomendado: undefined
  });
  
  // Check for query params on initial load
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setEditingId(idParam);
      setShowForm(true);
    }
  }, [searchParams]);

  // Apply filters to dishes
  const filteredPlatos = useMemo(() => {
    return platos
      .filter(plato => {
        // Search term filter
        if (searchTerm && !plato.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !(plato.description?.toLowerCase().includes(searchTerm.toLowerCase()))) {
          return false;
        }
        
        // Category filter
        if (selectedCategoria && plato.category_id !== selectedCategoria) {
          return false;
        }
        
        // Dietary filters
        if (filterVegetarian && !plato.is_vegetarian) {
          return false;
        }
        
        if (filterVegan && !plato.is_vegan) {
          return false;
        }
        
        if (filterGlutenFree && !plato.is_gluten_free) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          return sortDirection === 'asc'
            ? a.price - b.price
            : b.price - a.price;
        }
      });
  }, [
    platos, 
    searchTerm, 
    selectedCategoria, 
    filterVegetarian, 
    filterVegan, 
    filterGlutenFree, 
    sortField, 
    sortDirection
  ]);
  
  // Handle form submission callback
  const handleFormSaved = async () => {
    // Refresh platos data using hook
    await refetchMenuItems();
    
    // Reset editing state
    setShowForm(false);
    setEditingId(null);
    
    // Clear URL param
    if (searchParams.has('id')) {
      searchParams.delete('id');
      setSearchParams(searchParams);
    }
  };
  
  // Delete a dish
  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    
    try {
      setIsDeleting(id);
      setConfirmDelete(null);
      
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      // Delete the dish from web schema
      const { error } = await supabase
        .from('web.menu_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh the platos list using hook
      await refetchMenuItems();
      
      // If we were editing this dish, close the form
      if (editingId === id) {
        setShowForm(false);
        setEditingId(null);
        
        // Clear id from URL if present
        if (searchParams.has('id')) {
          searchParams.delete('id');
          setSearchParams(searchParams);
        }
      }
      
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Error al eliminar el plato');
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  // Toggle sorting
  const toggleSort = (field: 'name' | 'price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get category name by id
  const getCategoryName = (id: string | null) => {
    if (!id) return 'Sin categoría';
    const category = categorias.find(c => c.id === id);
    return category ? category.name : 'Sin categoría';
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategoria(null);
    setFilterVegetarian(false);
    setFilterVegan(false);
    setFilterGlutenFree(false);
    setSortField('name');
    setSortDirection('asc');
  };

  // Handle sugerencia del día
  const handlePlatoSugeridoChange = (index: number, id: string) => {
    const plato = platos.find(p => p.id === id);
    if (!plato) return;
    
    const updatedPlatosSugeridos = [...platosSugeridos];
    updatedPlatosSugeridos[index] = plato;
    setPlatosSugeridos(updatedPlatosSugeridos);
  };
  
  const handleRemovePlatoSugerido = (index: number) => {
    const updatedPlatosSugeridos = [...platosSugeridos];
    updatedPlatosSugeridos[index] = null;
    setPlatosSugeridos(updatedPlatosSugeridos);
  };
  
  const handleSaveSugerencias = async () => {
    try {
      setIsSubmitting(true);
      
      // Validar que hay al menos un plato seleccionado
      if (!platosSugeridos.some(p => p !== null)) {
        alert('Debes seleccionar al menos un plato para las sugerencias');
        return;
      }

      const nuevaSugerencia: SugerenciaDelDia = {
        tipo: tipoSugerencia,
        titulo: tituloSugerencia,
        platos: platosSugeridos,
        descripcion: descripcionSugerencia,
        created_at: new Date().toISOString()
      };

      // Guardar las sugerencias en web.settings
      const { error } = await supabase
        .from('web.settings')
        .upsert({
          key: 'daily_suggestions',
          value: nuevaSugerencia,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Actualizar estado local
      setPublishedSuggestions(nuevaSugerencia);
      
      // Mostrar mensaje de éxito
      alert('Sugerencias guardadas correctamente');
      
      // Limpiar formulario
      handleClearSugerencias();
    } catch (error) {
      console.error('Error al guardar las sugerencias:', error);
      alert('Error al guardar las sugerencias');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClearSugerencias = () => {
    setTipoSugerencia('dia');
    setTituloSugerencia('');
    setPlatosSugeridos([null, null, null]);
    setDescripcionSugerencia('');
  };

  // Cargar sugerencias publicadas
  useEffect(() => {
    const cargarSugerencias = async () => {
      try {
        if (!supabase) return;
        
        const { data, error } = await supabase
          .from('web.settings')
          .select('value')
          .eq('key', 'daily_suggestions')
          .single();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data?.value) {
          setPublishedSuggestions(data.value as SugerenciaDelDia);
        }
      } catch (error) {
        console.error('Error al cargar sugerencias:', error);
      }
    };
    
    cargarSugerencias();
  }, []);

  // Cargar sugerencia para editar
  const handleEditSugerencia = (sugerencia: SugerenciaDelDia) => {
    setTipoSugerencia(sugerencia.tipo);
    setTituloSugerencia(sugerencia.titulo);
    setPlatosSugeridos(sugerencia.platos);
    setDescripcionSugerencia(sugerencia.descripcion);
    setShowPublishedSuggestions(false);
  };

  // Eliminar sugerencia publicada
  const handleDeleteSugerencia = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar las sugerencias publicadas?')) {
      try {
        const { error } = await supabase
          .from('web.settings')
          .delete()
          .eq('key', 'daily_suggestions');
          
        if (error) throw error;
        
        setPublishedSuggestions(null);
        setShowPublishedSuggestions(false);
      } catch (error) {
        console.error('Error al eliminar sugerencias:', error);
        alert('Error al eliminar las sugerencias');
      }
    }
  };

  // Función para agregar plato personalizado
  const handleAddCustomDish = () => {
    if (!customDishForm.name || !customDishForm.price) {
      alert('El nombre y el precio son obligatorios');
      return;
    }

    const newCustomDish: PlatoPersonalizado = {
      ...customDishForm as PlatoPersonalizado,
      tempId: `custom-${Date.now()}`
    };

    // Buscar el primer espacio disponible en platosSugeridos
    const index = platosSugeridos.findIndex(p => p === null);
    if (index === -1) {
      alert('Ya hay 3 platos sugeridos. Elimina uno primero.');
      return;
    }

    const updatedPlatos = [...platosSugeridos];
    updatedPlatos[index] = newCustomDish;
    setPlatosSugeridos(updatedPlatos);

    // Limpiar formulario y cerrar modal
    setCustomDishForm({
      name: '',
      description: '',
      price: 0,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_recommended: false,
      status: 'active',
      isCustom: true,
      tempId: '',
      vino_recomendado: undefined
    });
    setShowCustomDishForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-serif text-enigma-blue">Gestión de Platos</h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-enigma-blue text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-opacity-90 transition-colors"
          >
            {showForm ? (
              <>
                <X size={18} />
                Cancelar
              </>
            ) : (
              <>
                <Plus size={18} />
                Nuevo Plato
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Form for adding/editing dishes */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <WebAdminDishForm 
            platoId={editingId || undefined}
            onSave={handleFormSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
              
              // Clear id from URL if present
              if (searchParams.has('id')) {
                searchParams.delete('id');
                setSearchParams(searchParams);
              }
            }}
          />
        </motion.div>
      )}
      
      {/* Search, filters, and sorting */}
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
          
          {/* Filter actions */}
          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategoria || ''}
                onChange={(e) => setSelectedCategoria(e.target.value || null)}
                className="p-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue appearance-none"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 p-2 border ${
                filterVegetarian || filterVegan || filterGlutenFree
                  ? 'border-enigma-blue text-enigma-blue'
                  : 'border-gray-300 text-gray-600'
              } rounded-md hover:bg-gray-50`}
            >
              <Filter size={16} />
              Filtros
              {(filterVegetarian || filterVegan || filterGlutenFree) && (
                <span className="bg-enigma-blue text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {(filterVegetarian ? 1 : 0) + (filterVegan ? 1 : 0) + (filterGlutenFree ? 1 : 0)}
                </span>
              )}
            </button>
            
            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 p-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50"
            >
              <RefreshCcw size={16} />
              Resetear
            </button>
          </div>
        </div>
        
        {/* Filtros adicionales */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t"
          >
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterVegetarian(!filterVegetarian)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                  filterVegetarian
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Leaf size={14} />
                Vegetariano
              </button>
              
              <button
                onClick={() => setFilterVegan(!filterVegan)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                  filterVegan
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Leaf size={14} />
                Vegano
              </button>
              
              <button
                onClick={() => setFilterGlutenFree(!filterGlutenFree)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                  filterGlutenFree
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Wheat size={14} />
                Sin Gluten
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Sección de Sugerencias del Día */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-enigma-blue flex items-center">
            <Star className="mr-2" size={20} />
            Sugerencias del Día
          </h2>
          
          {/* Botón para ver sugerencias publicadas */}
          {publishedSuggestions && (
            <button
              onClick={() => setShowPublishedSuggestions(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Eye size={18} />
              Ver publicadas
            </button>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Tipo de sugerencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de sugerencia
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTipoSugerencia('dia')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  tipoSugerencia === 'dia'
                    ? 'bg-enigma-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sugerencia del Día
              </button>
              <button
                onClick={() => setTipoSugerencia('semana')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  tipoSugerencia === 'semana'
                    ? 'bg-enigma-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Menú de la Semana
              </button>
              <button
                onClick={() => setTipoSugerencia('especial')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  tipoSugerencia === 'especial'
                    ? 'bg-enigma-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Menú Especial
              </button>
            </div>
          </div>
          
          {/* Título personalizado */}
          <div>
            <label htmlFor="titulo_sugerencia" className="block text-sm font-medium text-gray-700 mb-2">
              Título personalizado
            </label>
            <input
              type="text"
              id="titulo_sugerencia"
              value={tituloSugerencia}
              onChange={(e) => setTituloSugerencia(e.target.value)}
              placeholder={`Ej: ${
                tipoSugerencia === 'dia' 
                  ? 'Sugerencias del chef para hoy'
                  : tipoSugerencia === 'semana'
                    ? 'Menú de la semana'
                    : 'Menú especial de temporada'
              }`}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
            />
          </div>
          
          {/* Selección de platos sugeridos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Platos sugeridos (máximo 3)
              </label>
              <button
                onClick={() => setShowCustomDishForm(true)}
                className="text-sm text-enigma-blue hover:text-opacity-70 flex items-center gap-1"
              >
                <Plus size={16} />
                Crear plato personalizado
              </button>
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={platosSugeridos[index]?.id || (platosSugeridos[index] as any)?.tempId || ''}
                    onChange={(e) => handlePlatoSugeridoChange(index, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  >
                    <option value="">Seleccionar plato {index + 1}</option>
                    {platos.map((plato) => (
                      <option key={plato.id} value={plato.id}>
                        {plato.name} - {formatPrice(plato.price)}
                      </option>
                    ))}
                  </select>
                  {platosSugeridos[index] && (
                    <button
                      onClick={() => handleRemovePlatoSugerido(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Descripción adicional */}
          <div>
            <label htmlFor="descripcion_sugerencia" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción adicional (opcional)
            </label>
            <textarea
              id="descripcion_sugerencia"
              value={descripcionSugerencia}
              onChange={(e) => setDescripcionSugerencia(e.target.value)}
              placeholder="Añade una descripción o nota especial sobre las sugerencias..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue h-24"
            />
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClearSugerencias}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Limpiar sugerencias
            </button>
            <button
              onClick={handleSaveSugerencias}
              disabled={isSubmitting}
              className="px-4 py-2 bg-enigma-blue text-white rounded-md hover:bg-opacity-90 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar sugerencias
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de sugerencias publicadas */}
      {showPublishedSuggestions && publishedSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-enigma-blue flex items-center">
                  <Star className="mr-2" size={20} />
                  Sugerencias Publicadas
                </h3>
                <button
                  onClick={() => setShowPublishedSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {publishedSuggestions.tipo === 'dia' 
                    ? 'Sugerencia del Día'
                    : publishedSuggestions.tipo === 'semana'
                      ? 'Menú de la Semana'
                      : 'Menú Especial'
                  }
                </span>
              </div>
              
              <h4 className="text-lg font-medium mb-2">
                {publishedSuggestions.titulo}
              </h4>
              
              {publishedSuggestions.descripcion && (
                <p className="text-gray-600 mb-6 italic">
                  {publishedSuggestions.descripcion}
                </p>
              )}
              
              <div className="space-y-4 mb-6">
                {publishedSuggestions.platos.filter(Boolean).map((plato, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="font-medium">{plato?.name}</h5>
                      {plato?.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {plato.description}
                        </p>
                      )}
                    </div>
                    <span className="font-medium text-enigma-blue">
                      {formatPrice(plato?.price || 0)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleDeleteSugerencia}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
                <button
                  onClick={() => handleEditSugerencia(publishedSuggestions)}
                  className="px-4 py-2 bg-enigma-blue text-white rounded-md hover:bg-opacity-90 flex items-center gap-2"
                >
                  <Edit size={18} />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para crear plato personalizado */}
      {showCustomDishForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-enigma-blue">
                  Crear Plato Personalizado
                </h3>
                <button
                  onClick={() => setShowCustomDishForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Nombre del plato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del plato*
                  </label>
                  <input
                    type="text"
                    value={customDishForm.name}
                    onChange={(e) => setCustomDishForm({...customDishForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                    placeholder="Ej: Entrecot a la pimienta"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={customDishForm.description}
                    onChange={(e) => setCustomDishForm({...customDishForm, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue h-24"
                    placeholder="Describe el plato y sus ingredientes principales..."
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio*
                  </label>
                  <input
                    type="number"
                    value={customDishForm.price || ''}
                    onChange={(e) => setCustomDishForm({...customDishForm, price: parseFloat(e.target.value) || 0})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Características */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Características
                  </label>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={customDishForm.is_vegetarian}
                        onChange={(e) => setCustomDishForm({...customDishForm, is_vegetarian: e.target.checked})}
                        className="rounded border-gray-300 text-enigma-blue focus:ring-enigma-blue"
                      />
                      <span className="ml-2 text-sm text-gray-600">Vegetariano</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={customDishForm.is_vegan}
                        onChange={(e) => setCustomDishForm({...customDishForm, is_vegan: e.target.checked})}
                        className="rounded border-gray-300 text-enigma-blue focus:ring-enigma-blue"
                      />
                      <span className="ml-2 text-sm text-gray-600">Vegano</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={customDishForm.is_gluten_free}
                        onChange={(e) => setCustomDishForm({...customDishForm, is_gluten_free: e.target.checked})}
                        className="rounded border-gray-300 text-enigma-blue focus:ring-enigma-blue"
                      />
                      <span className="ml-2 text-sm text-gray-600">Sin Gluten</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowCustomDishForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCustomDish}
                  className="px-4 py-2 bg-enigma-blue text-white rounded-md hover:bg-opacity-90 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Agregar plato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dishes Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-enigma-blue" />
          </div>
        ) : filteredPlatos.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">No se encontraron platos con los criterios seleccionados.</p>
            <button 
              onClick={resetFilters}
              className="text-enigma-blue hover:underline"
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
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Nombre
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center gap-2">
                      Precio
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
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
                {filteredPlatos.map(plato => (
                  <tr key={plato.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {plato.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{plato.name}</div>
                      {plato.description && (
                        <div className="text-xs text-gray-500 max-w-xs truncate">{plato.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(plato.category_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatPrice(plato.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {plato.is_vegetarian && (
                          <span className="inline-flex items-center p-1 bg-green-100 text-green-800 rounded" title="Vegetariano">
                            <Leaf size={12} />
                          </span>
                        )}
                        {plato.is_vegan && (
                          <span className="inline-flex items-center p-1 bg-green-100 text-green-800 rounded" title="Vegano">
                            <Leaf size={12} />
                          </span>
                        )}
                        {plato.is_gluten_free && (
                          <span className="inline-flex items-center p-1 bg-amber-100 text-amber-800 rounded" title="Sin Gluten">
                            <Wheat size={12} />
                          </span>
                        )}
                        {plato.is_recommended && (
                          <span className="inline-flex items-center p-1 bg-red-100 text-red-800 rounded" title="Recomendado">
                            <Heart size={12} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(plato.id);
                            setShowForm(true);
                            
                            // Add id to URL
                            searchParams.set('id', plato.id);
                            setSearchParams(searchParams);
                          }}
                          className="text-enigma-blue hover:text-opacity-70"
                        >
                          <Edit size={18} />
                        </button>
                        {confirmDelete === plato.id ? (
                          <span className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDelete(plato.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={isDeleting === plato.id}
                            >
                              {isDeleting === plato.id ? (
                                <Loader2 className="animate-spin" size={18} />
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
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(plato.id)}
                            disabled={isDeleting === plato.id}
                            className={`text-red-500 hover:text-red-700 ${isDeleting === plato.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isDeleting === plato.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        )}
                      </div>
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

export default WebAdminDishes;