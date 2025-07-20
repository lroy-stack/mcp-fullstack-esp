import React, { useState, useEffect } from 'react';
import { 
  Loader2, Save, AlertCircle, Check, 
  X, Leaf, Wheat, Heart, Tag 
} from 'lucide-react';
import type { 
  WebMenuItem, WebCategory, WebAllergen, WebBeverage,
  WebMenuItemInsert, WebMenuItemUpdate 
} from '../../types/web-database';
import { supabase } from '../../lib/supabase';
import { useWebContentManagement } from '../../hooks/web-admin/useWebContentManagement';

interface WebAdminDishFormProps {
  platoId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const WebAdminDishForm: React.FC<WebAdminDishFormProps> = ({ 
  platoId, 
  onSave, 
  onCancel 
}) => {
  // Use web content management hook
  const {
    categories,
    categoriesLoading,
    allergens,
    allergensLoading,
    beverages, // Includes wines
    beveragesLoading
  } = useWebContentManagement();
  
  // Local state
  const [isLoading, setIsLoading] = useState(platoId ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wines, setWines] = useState<WebBeverage[]>([]);
  
  const [formData, setFormData] = useState<Partial<WebMenuItem>>({
    name: '',
    description: '',
    price: 0,
    category_id: null,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_recommended: false,
    allergen_ids: [],
    status: 'active'
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSuccess, setFormSuccess] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  // Filter wines from beverages
  useEffect(() => {
    const wineList = beverages.filter(beverage => 
      beverage.category?.toLowerCase().includes('vino') || 
      beverage.category?.toLowerCase().includes('wine')
    );
    setWines(wineList);
  }, [beverages]);

  // Load dish details if editing
  useEffect(() => {
    const loadDishData = async () => {
      if (!platoId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase
          .from('web.menu_items')
          .select('*')
          .eq('id', platoId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setFormData({
            id: data.id,
            name: data.name,
            description: data.description || '',
            price: data.price,
            category_id: data.category_id,
            is_vegetarian: data.is_vegetarian,
            is_vegan: data.is_vegan,
            is_gluten_free: data.is_gluten_free,
            is_recommended: data.is_recommended,
            allergen_ids: data.allergen_ids || [],
            status: data.status || 'active'
          });
          
          // Set selected allergens for checkboxes
          setSelectedAllergens(data.allergen_ids || []);
        }
      } catch (error) {
        console.error('Error loading dish data:', error);
        setFormErrors({
          submit: 'Error al cargar los datos del plato. Por favor, inténtalo de nuevo.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDishData();
  }, [platoId]);
  
  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (formData.price === undefined || formData.price <= 0) {
      errors.price = 'El precio debe ser mayor que 0';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'La categoría es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormSuccess('');
      setFormErrors({});
      
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      // Prepare data for submission
      const submitData: WebMenuItemInsert | WebMenuItemUpdate = {
        name: formData.name!,
        description: formData.description,
        price: formData.price!,
        category_id: formData.category_id!,
        is_vegetarian: formData.is_vegetarian || false,
        is_vegan: formData.is_vegan || false,
        is_gluten_free: formData.is_gluten_free || false,
        is_recommended: formData.is_recommended || false,
        allergen_ids: selectedAllergens,
        status: formData.status || 'active',
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (platoId) {
        // Update existing dish
        const { data, error } = await supabase
          .from('web.menu_items')
          .update(submitData)
          .eq('id', platoId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        setFormSuccess('Plato actualizado correctamente');
      } else {
        // Create new dish
        const { data, error } = await supabase
          .from('web.menu_items')
          .insert([{
            ...submitData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        setFormSuccess('Plato creado correctamente');
      }
      
      // Inform parent after a delay
      setTimeout(() => {
        onSave();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving dish:', error);
      setFormErrors({ 
        submit: error.message || 'Error al guardar el plato. Por favor, inténtalo de nuevo.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle allergen in the array
  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId);
      } else {
        return [...prev, allergenId];
      }
    });
  };
  
  // Toggle checkbox state
  const toggleCheckbox = (field: keyof WebMenuItem) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Form header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif text-enigma-blue">
          {platoId ? 'Editar Plato' : 'Nuevo Plato'}
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Loading state */}
      {(isLoading || categoriesLoading || allergensLoading) ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-enigma-blue" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success message */}
          {formSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
              <Check className="mr-2 flex-shrink-0" size={18} />
              {formSuccess}
            </div>
          )}
          
          {/* Error message */}
          {formErrors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
              <AlertCircle className="mr-2 flex-shrink-0" size={18} />
              {formErrors.submit}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-enigma-blue border-b pb-2">
                Información Básica
              </h3>
              
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre*
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-2 border ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                  placeholder="ej: Tataki de Atún"
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                  placeholder="Descripción del plato..."
                />
              </div>
              
              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (€)*
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price !== undefined ? formData.price : ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setFormData({ ...formData, price: isNaN(value) ? 0 : value });
                  }}
                  className={`w-full p-2 border ${
                    formErrors.price ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                  placeholder="ej: 12.90"
                />
                {formErrors.price && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>
                )}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría*
                </label>
                <select
                  id="category_id"
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                  className={`w-full p-2 border ${
                    formErrors.category_id ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {formErrors.category_id && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.category_id}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-enigma-blue"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>
            
            {/* Characteristics */}
            <div className="space-y-4">
              <h3 className="font-medium text-enigma-blue border-b pb-2">
                Características
              </h3>
              
              <div className="space-y-3">
                {/* Vegetarian */}
                <div className="flex items-center">
                  <input
                    id="is_vegetarian"
                    type="checkbox"
                    checked={formData.is_vegetarian || false}
                    onChange={() => toggleCheckbox('is_vegetarian')}
                    className="w-4 h-4 text-enigma-blue focus:ring-enigma-blue border-gray-300 rounded"
                  />
                  <label htmlFor="is_vegetarian" className="ml-2 block text-sm text-gray-700 flex items-center">
                    <Leaf size={16} className="mr-1 text-green-500" />
                    Vegetariano
                  </label>
                </div>
                
                {/* Vegan */}
                <div className="flex items-center">
                  <input
                    id="is_vegan"
                    type="checkbox"
                    checked={formData.is_vegan || false}
                    onChange={() => toggleCheckbox('is_vegan')}
                    className="w-4 h-4 text-enigma-blue focus:ring-enigma-blue border-gray-300 rounded"
                  />
                  <label htmlFor="is_vegan" className="ml-2 block text-sm text-gray-700 flex items-center">
                    <Leaf size={16} className="mr-1 text-green-700" />
                    Vegano
                  </label>
                </div>
                
                {/* Gluten Free */}
                <div className="flex items-center">
                  <input
                    id="is_gluten_free"
                    type="checkbox"
                    checked={formData.is_gluten_free || false}
                    onChange={() => toggleCheckbox('is_gluten_free')}
                    className="w-4 h-4 text-enigma-blue focus:ring-enigma-blue border-gray-300 rounded"
                  />
                  <label htmlFor="is_gluten_free" className="ml-2 block text-sm text-gray-700 flex items-center">
                    <Wheat size={16} className="mr-1 text-amber-500" />
                    Sin Gluten
                  </label>
                </div>
                
                {/* Recommended */}
                <div className="flex items-center">
                  <input
                    id="is_recommended"
                    type="checkbox"
                    checked={formData.is_recommended || false}
                    onChange={() => toggleCheckbox('is_recommended')}
                    className="w-4 h-4 text-enigma-blue focus:ring-enigma-blue border-gray-300 rounded"
                  />
                  <label htmlFor="is_recommended" className="ml-2 block text-sm text-gray-700 flex items-center">
                    <Heart size={16} className="mr-1 text-red-500" />
                    Recomendado
                  </label>
                </div>
              </div>
              
              {/* Allergens */}
              <div>
                <h3 className="font-medium text-enigma-blue border-b pb-2 mb-3">
                  Alérgenos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {allergens.map(alergeno => (
                    <div key={alergeno.id} className="flex items-center">
                      <input
                        id={`alergeno_${alergeno.id}`}
                        type="checkbox"
                        checked={selectedAllergens.includes(alergeno.id)}
                        onChange={() => toggleAllergen(alergeno.id)}
                        className="w-4 h-4 text-enigma-blue focus:ring-enigma-blue border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`alergeno_${alergeno.id}`}
                        className="ml-2 block text-sm text-gray-700 flex items-center"
                        title={alergeno.description || ''}
                      >
                        <Tag 
                          size={14} 
                          className={`mr-1`} 
                          style={{ color: alergeno.color || '#f97316' }}
                        />
                        {alergeno.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-enigma-blue text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Plato
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WebAdminDishForm;