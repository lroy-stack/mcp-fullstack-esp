import React, { useState, useMemo } from 'react';
import { Search, X, AlertTriangle } from 'lucide-react';
import { useWebAllergens } from '../../hooks/web-admin/useWebContentManagement';
import type { WebAllergen } from '../../types/web-database';

interface AllergenSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  maxSelection?: number;
  showSearch?: boolean;
  compact?: boolean;
  className?: string;
}

export const AllergenSelector: React.FC<AllergenSelectorProps> = ({
  selectedIds = [],
  onChange,
  disabled = false,
  maxSelection,
  showSearch = true,
  compact = false,
  className = ''
}) => {
  const { allergens, allergensLoading } = useWebAllergens();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter allergens based on search term
  const filteredAllergens = useMemo(() => {
    if (!searchTerm) return allergens;
    return allergens.filter(allergen =>
      allergen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergen.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergen.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allergens, searchTerm]);

  // Get selected allergens for display
  const selectedAllergens = useMemo(() => {
    return allergens.filter(allergen => selectedIds.includes(allergen.id));
  }, [allergens, selectedIds]);

  const handleToggleAllergen = (allergenId: number) => {
    if (disabled) return;

    const newSelectedIds = selectedIds.includes(allergenId)
      ? selectedIds.filter(id => id !== allergenId)
      : [...selectedIds, allergenId];

    // Check max selection limit
    if (maxSelection && newSelectedIds.length > maxSelection) {
      return;
    }

    onChange(newSelectedIds);
  };

  const handleRemoveAllergen = (allergenId: number) => {
    if (disabled) return;
    onChange(selectedIds.filter(id => id !== allergenId));
  };

  const clearSelection = () => {
    if (disabled) return;
    onChange([]);
  };

  if (allergensLoading) {
    return (
      <div className={`border border-enigma-neutral-300 rounded-ios p-4 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-enigma-primary"></div>
          <span className="ml-2 text-enigma-neutral-600">Cargando alérgenos...</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {/* Selected allergens display */}
        {selectedAllergens.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedAllergens.map((allergen) => (
              <span
                key={allergen.id}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-ios border"
                style={{ 
                  backgroundColor: allergen.color + '20',
                  borderColor: allergen.color,
                  color: allergen.color 
                }}
              >
                <span className="font-semibold text-xs">{allergen.code}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergen(allergen.id)}
                    className="hover:bg-black/10 rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Compact selector */}
        <select
          multiple
          value={selectedIds.map(String)}
          onChange={(e) => {
            const newIds = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
            onChange(newIds);
          }}
          disabled={disabled}
          className="w-full p-2 border border-enigma-neutral-300 rounded-ios text-sm"
        >
          {allergens.map((allergen) => (
            <option key={allergen.id} value={allergen.id}>
              {allergen.name} ({allergen.code})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`border border-enigma-neutral-300 rounded-ios ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-enigma-neutral-200 bg-enigma-neutral-50">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-enigma-neutral-900">
            Alérgenos {selectedIds.length > 0 && `(${selectedIds.length} seleccionados)`}
          </h4>
          {selectedIds.length > 0 && !disabled && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-enigma-neutral-600 hover:text-enigma-primary"
            >
              Limpiar todo
            </button>
          )}
        </div>
        {maxSelection && (
          <p className="text-xs text-enigma-neutral-500 mt-1">
            Máximo {maxSelection} alérgenos
          </p>
        )}
      </div>

      {/* Search */}
      {showSearch && allergens.length > 6 && (
        <div className="p-3 border-b border-enigma-neutral-200">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400" />
            <input
              type="text"
              placeholder="Buscar alérgenos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={disabled}
              className="w-full pl-10 pr-4 py-2 border border-enigma-neutral-300 rounded-ios text-sm focus:ring-2 focus:ring-enigma-primary/20 focus:border-enigma-primary"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-enigma-neutral-400 hover:text-enigma-neutral-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected allergens preview */}
      {selectedAllergens.length > 0 && (
        <div className="p-3 bg-enigma-neutral-50 border-b border-enigma-neutral-200">
          <p className="text-xs text-enigma-neutral-600 mb-2">Alérgenos seleccionados:</p>
          <div className="flex flex-wrap gap-2">
            {selectedAllergens.map((allergen) => (
              <span
                key={allergen.id}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-ios"
                style={{ 
                  backgroundColor: allergen.color + '20',
                  color: allergen.color 
                }}
              >
                <span className="font-semibold text-sm">{allergen.name}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergen(allergen.id)}
                    className="hover:bg-black/10 rounded-full p-0.5 ml-1"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Allergen list */}
      <div className="p-3">
        {filteredAllergens.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-enigma-neutral-500">
              {searchTerm ? 'No se encontraron alérgenos' : 'No hay alérgenos disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredAllergens.map((allergen) => {
              const isSelected = selectedIds.includes(allergen.id);
              const isDisabledByLimit = !isSelected && maxSelection && selectedIds.length >= maxSelection;
              
              return (
                <label
                  key={allergen.id}
                  className={`
                    flex items-center p-2 rounded-ios border cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-enigma-primary/10 border-enigma-primary' 
                      : 'border-enigma-neutral-200 hover:bg-enigma-neutral-50'
                    }
                    ${(disabled || isDisabledByLimit) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleAllergen(allergen.id)}
                    disabled={disabled || isDisabledByLimit}
                    className="sr-only"
                  />
                  
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-xs"
                      style={{ backgroundColor: allergen.color }}
                    >
                      {allergen.code.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-enigma-neutral-900">
                          {allergen.name}
                        </span>
                        <span 
                          className="px-1.5 py-0.5 text-xs rounded font-mono"
                          style={{ 
                            backgroundColor: allergen.color + '20',
                            color: allergen.color 
                          }}
                        >
                          {allergen.code}
                        </span>
                      </div>
                      {allergen.description && (
                        <p className="text-xs text-enigma-neutral-600 truncate">
                          {allergen.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Checkbox indicator */}
                    <div className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center
                      ${isSelected 
                        ? 'bg-enigma-primary border-enigma-primary' 
                        : 'border-enigma-neutral-300'
                      }
                    `}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Warning for common allergens */}
      {selectedAllergens.some(a => ['GLU', 'LAC', 'HUE', 'FRU'].includes(a.code)) && (
        <div className="p-3 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <p className="text-xs text-yellow-700">
              Este producto contiene alérgenos comunes. Asegúrate de verificar la información.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllergenSelector;