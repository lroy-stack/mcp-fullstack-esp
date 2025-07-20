import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { IOSBadge } from '@/components/ui/ios-badge';
import { 
  Search, X, User, Crown, Mail, Check, 
  AlertCircle, ChevronDown 
} from 'lucide-react';
import { 
  useClientEmailSearch, 
  ClientEmailResult, 
  isValidEmail,
  formatEmailDisplay 
} from '@/hooks/useClientEmailSearch';

interface EmailInputWithAutocompleteProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxRecipients?: number;
}

export default function EmailInputWithAutocomplete({
  value = [],
  onChange,
  placeholder = "Introduce emails...",
  className,
  disabled = false,
  multiple = true,
  maxRecipients = 10
}: EmailInputWithAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar clientes mientras el usuario escribe
  const { 
    clients, 
    isLoading, 
    isError, 
    hasResults 
  } = useClientEmailSearch(inputValue, {
    enabled: inputValue.length >= 2 && isDropdownOpen,
    maxResults: 8
  });

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar teclas (Enter, Escape, Arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && clients[selectedIndex]) {
        // Seleccionar cliente de la lista
        selectClient(clients[selectedIndex]);
      } else if (inputValue.trim()) {
        // Añadir email manualmente
        addEmailManually();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (clients.length > 0) {
        setSelectedIndex(prev => Math.min(prev + 1, clients.length - 1));
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
      return;
    }

    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Eliminar último email si input está vacío
      const newEmails = [...value];
      newEmails.pop();
      onChange(newEmails);
      return;
    }

    if (e.key === ',' || e.key === ';' || e.key === ' ') {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmailManually();
      }
      return;
    }
  };

  // Añadir email manualmente (sin autocompletado)
  const addEmailManually = () => {
    const email = inputValue.trim();
    
    if (!email) return;

    if (!isValidEmail(email)) {
      // TODO: Mostrar error de validación
      console.warn('Email inválido:', email);
      return;
    }

    if (value.includes(email)) {
      // TODO: Mostrar que ya existe
      console.warn('Email ya añadido:', email);
      setInputValue('');
      return;
    }

    if (value.length >= maxRecipients) {
      // TODO: Mostrar límite alcanzado
      console.warn('Límite de destinatarios alcanzado');
      return;
    }

    const newEmails = multiple ? [...value, email] : [email];
    onChange(newEmails);
    setInputValue('');
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  // Seleccionar cliente del autocompletado
  const selectClient = (client: ClientEmailResult) => {
    if (value.includes(client.email)) {
      console.warn('Cliente ya añadido:', client.email);
      setInputValue('');
      setIsDropdownOpen(false);
      return;
    }

    if (value.length >= maxRecipients) {
      console.warn('Límite de destinatarios alcanzado');
      return;
    }

    const newEmails = multiple ? [...value, client.email] : [client.email];
    onChange(newEmails);
    setInputValue('');
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  // Eliminar email específico
  const removeEmail = (emailToRemove: string) => {
    const newEmails = value.filter(email => email !== emailToRemove);
    onChange(newEmails);
  };

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsDropdownOpen(newValue.length >= 2);
    setSelectedIndex(-1);
  };

  // Manejar focus del input
  const handleInputFocus = () => {
    if (inputValue.length >= 2) {
      setIsDropdownOpen(true);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Contenedor principal con emails seleccionados */}
      <div className={cn(
        "min-h-[42px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2",
        "focus-within:ring-2 focus-within:ring-enigma-primary focus-within:ring-offset-2",
        "flex flex-wrap items-center gap-2",
        disabled && "bg-gray-50 opacity-50 cursor-not-allowed"
      )}>
        {/* Emails seleccionados */}
        {value.map((email, index) => (
          <IOSBadge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 text-sm"
          >
            <Mail size={12} />
            <span className="max-w-[150px] truncate">{email}</span>
            {!disabled && (
              <button
                onClick={() => removeEmail(email)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </IOSBadge>
        ))}
        
        {/* Input para nuevo email */}
        <div className="flex-1 min-w-[120px]">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={value.length === 0 ? placeholder : ""}
            className="border-0 shadow-none p-0 h-auto focus-visible:ring-0"
            disabled={disabled || (value.length >= maxRecipients)}
          />
        </div>

        {/* Indicador de búsqueda */}
        {inputValue.length >= 2 && (
          <div className="flex items-center text-gray-400">
            {isLoading ? (
              <div className="animate-spin">
                <Search size={14} />
              </div>
            ) : (
              <Search size={14} />
            )}
          </div>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {isDropdownOpen && inputValue.length >= 2 && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1",
            "bg-white border border-gray-200 rounded-lg shadow-lg",
            "max-h-60 overflow-y-auto"
          )}
        >
          {isLoading && (
            <div className="p-3 flex items-center gap-2 text-gray-500">
              <div className="animate-spin">
                <Search size={16} />
              </div>
              <span className="text-sm">Buscando clientes...</span>
            </div>
          )}

          {isError && (
            <div className="p-3 flex items-center gap-2 text-red-500">
              <AlertCircle size={16} />
              <span className="text-sm">Error al buscar clientes</span>
            </div>
          )}

          {!isLoading && !isError && clients.length === 0 && inputValue.length >= 2 && (
            <div className="p-3">
              <div className="text-sm text-gray-500 mb-2">
                No se encontraron clientes
              </div>
              {isValidEmail(inputValue) && (
                <button
                  onClick={addEmailManually}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center gap-2 text-sm"
                >
                  <Mail size={16} className="text-gray-400" />
                  <span>Añadir "{inputValue}" como nuevo contacto</span>
                </button>
              )}
            </div>
          )}

          {!isLoading && !isError && clients.length > 0 && (
            <>
              {clients.map((client, index) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0",
                    "flex items-center gap-3 transition-colors",
                    selectedIndex === index && "bg-enigma-primary/10"
                  )}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-enigma-primary to-enigma-primary/80 flex items-center justify-center">
                      {client.isVip ? (
                        <Crown size={14} className="text-white" />
                      ) : (
                        <User size={14} className="text-white" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {client.displayName}
                      </span>
                      {client.isVip && (
                        <IOSBadge variant="outline" className="text-xs">
                          VIP
                        </IOSBadge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {client.email}
                    </div>
                  </div>

                  {value.includes(client.email) && (
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                  )}
                </button>
              ))}
              
              {/* Opción para añadir manualmente si es email válido */}
              {isValidEmail(inputValue) && !clients.some(c => c.email.toLowerCase() === inputValue.toLowerCase()) && (
                <button
                  onClick={addEmailManually}
                  className={cn(
                    "w-full text-left p-3 hover:bg-gray-50 border-t border-gray-200",
                    "flex items-center gap-3 text-sm text-gray-600"
                  )}
                >
                  <Mail size={16} className="text-gray-400" />
                  <span>Añadir "{inputValue}" como nuevo contacto</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Contador de destinatarios */}
      {multiple && value.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {value.length} / {maxRecipients} destinatarios
        </div>
      )}
    </div>
  );
}