import React, { useState, useEffect, useCallback } from 'react';
import { X, Clock, Users, Phone, Mail, User, CheckCircle, Search } from 'lucide-react';
import { IOSButton } from '@/components/ui/ios-button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuickTimelineReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime: string;
  onSuccess: () => void;
}

export function QuickTimelineReservationModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedTime,
  onSuccess 
}: QuickTimelineReservationModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    numero_personas: 2,
    notas: '',
    requisitos_dieteticos: ''
  });

  const [localSelectedTime, setLocalSelectedTime] = useState(selectedTime || '');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Sincronizar localSelectedTime cuando selectedTime cambie
  useEffect(() => {
    setLocalSelectedTime(selectedTime || '');
  }, [selectedTime]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Función para separar nombre completo en nombre y apellido
  const separateNameAndSurname = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    const nombre = parts[0] || '';
    const apellido = parts.slice(1).join(' ') || '';
    return { nombre, apellido };
  };

  // Buscar clientes existentes y reservas recientes
  const searchClients = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Buscar en tabla clientes
      const { data: clientsData, error: clientsError } = await supabase
        .schema('restaurante')
        .from('clientes')
        .select('id, nombre, apellidos, telefono, email, restricciones_dieteticas, notas_internas')
        .or(`nombre.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(3);

      if (clientsError) throw clientsError;

      // Buscar también en reservas recientes por nombre_reserva
      const { data: reservasData, error: reservasError } = await supabase
        .schema('restaurante')
        .from('reservas')
        .select('nombre_reserva, telefono_reserva, email_reserva')
        .or(`nombre_reserva.ilike.%${searchTerm}%,telefono_reserva.ilike.%${searchTerm}%,email_reserva.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(3);

      if (reservasError) throw reservasError;

      // Formatear resultados de clientes
      const formattedClients = (clientsData || []).map(client => ({
        ...client,
        type: 'client'
      }));

      // Formatear resultados de reservas (convertir nombre_reserva a nombre/apellidos)
      const formattedReservations = (reservasData || [])
        .filter(reserva => reserva.nombre_reserva) // Filtrar reservas sin nombre
        .map(reserva => {
          const { nombre, apellido } = separateNameAndSurname(reserva.nombre_reserva);
          return {
            id: `reserva_${reserva.nombre_reserva}`,
            nombre,
            apellidos: apellido,
            telefono: reserva.telefono_reserva,
            email: reserva.email_reserva,
            restricciones_dieteticas: '',
            notas_internas: '',
            type: 'reservation'
          };
        });

      // Combinar y eliminar duplicados por teléfono/email
      const allResults = [...formattedClients, ...formattedReservations];
      const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex(t => 
          (t.telefono && t.telefono === item.telefono) || 
          (t.email && t.email === item.email) ||
          (t.nombre === item.nombre && t.apellidos === item.apellidos)
        )
      ).slice(0, 5);

      setSearchSuggestions(uniqueResults);
      setShowSuggestions(uniqueResults.length > 0);
    } catch (error) {
      console.error('Error searching clients:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Manejar cambios en los inputs con búsqueda inteligente
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Activar búsqueda inteligente para campos de texto
    if (typeof value === 'string' && ['nombre', 'apellido', 'telefono', 'email'].includes(field)) {
      // Limpiar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Nuevo timeout para búsqueda
      const newTimeout = setTimeout(() => {
        searchClients(value);
      }, 300); // Esperar 300ms después de que el usuario deje de escribir

      setSearchTimeout(newTimeout);
    }
  };

  // Autocompletar formulario con cliente seleccionado
  const selectClient = (client: any) => {
    setFormData(prev => ({
      ...prev,
      nombre: client.nombre || '',
      apellido: client.apellidos || '',
      telefono: client.telefono || '',
      email: client.email || '',
      requisitos_dieteticos: client.restricciones_dieteticas || '',
      notas: client.notas_internas || ''
    }));
    setShowSuggestions(false);
    setSearchSuggestions([]);
    const sourceText = client.type === 'client' ? 'Cliente' : 'Datos de reserva reciente';
    toast.success(`${sourceText} ${client.nombre} ${client.apellidos || ''} autocompletado`);
  };

  // Limpiar timeout al desmontar componente
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Validar que el teléfono tenga prefijo internacional
  const isValidInternationalPhone = (phone: string) => {
    // Debe empezar con + seguido de al menos 1 dígito, o con 00 seguido de al menos 1 dígito
    // Y debe tener al menos 8 caracteres en total para ser un número válido
    const withPlus = /^\+\d{1,4}\s?\d{4,}$/.test(phone.replace(/\s/g, ''));
    const withZeros = /^00\d{1,4}\s?\d{4,}$/.test(phone.replace(/\s/g, ''));
    return withPlus || withZeros;
  };

  const isFormValid = () => {
    return formData.nombre.trim() && 
           formData.apellido.trim() && 
           formData.telefono.trim() && isValidInternationalPhone(formData.telefono) &&
           formData.email.trim() && formData.email.includes('@') &&
           formData.numero_personas > 0 &&
           localSelectedTime.trim(); // Requerir hora seleccionada
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    // Si no hay hora seleccionada, mostrar selector de hora
    if (!localSelectedTime) {
      setShowTimePicker(true);
      toast.error('Por favor selecciona una hora para la reserva');
      return;
    }

    setIsSubmitting(true);
    try {
      // Primero, intentar crear/actualizar el cliente en la tabla clientes
      try {
        const clientData = {
          nombre: formData.nombre,
          apellidos: formData.apellido,
          telefono: formData.telefono,
          email: formData.email,
          restricciones_dieteticas: formData.requisitos_dieteticos || null,
          notas_internas: formData.notas || null,
          fecha_ultima_reserva: format(selectedDate, 'yyyy-MM-dd'),
          activo: true,
          origen_registro: 'reserva_timeline'
        };

        // Buscar si ya existe un cliente con este teléfono o email
        const { data: existingClient } = await supabase
          .schema('restaurante')
          .from('clientes')
          .select('id')
          .or(`telefono.eq.${formData.telefono},email.eq.${formData.email}`)
          .single();

        if (existingClient) {
          // Actualizar cliente existente
          await supabase
            .schema('restaurante')
            .from('clientes')
            .update(clientData)
            .eq('id', existingClient.id);
        } else {
          // Crear nuevo cliente
          await supabase
            .schema('restaurante')
            .from('clientes')
            .insert([clientData]);
        }
      } catch (clientError) {
        console.log('Cliente no pudo ser creado/actualizado:', clientError);
        // No fallar la reserva por esto
      }

      // Crear la reserva usando localSelectedTime
      const reservationData = {
        fecha_reserva: format(selectedDate, 'yyyy-MM-dd'),
        hora_reserva: localSelectedTime,
        nombre_reserva: `${formData.nombre} ${formData.apellido}`,
        numero_personas: formData.numero_personas,
        telefono_reserva: formData.telefono,
        email_reserva: formData.email,
        notas_especiales: formData.notas || null,
        alergias_comunicadas: formData.requisitos_dieteticos || null,
        estado: 'pendiente',
        origen_reserva: 'presencial'
      };

      const { data, error } = await supabase
        .schema('restaurante')
        .from('reservas')
        .insert([reservationData])
        .select()
        .single();

      if (error) throw error;

      setShowSuccess(true);
      
      // Cerrar modal después de mostrar éxito
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onSuccess();
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast.error('Error al crear la reserva: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      numero_personas: 2,
      notas: '',
      requisitos_dieteticos: ''
    });
    setLocalSelectedTime(selectedTime || '');
    setShowTimePicker(false);
  };

  // Generar opciones de hora (13:00 - 23:00 en intervalos de 15 minutos)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 13; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    // Agregar 23:00
    times.push('23:00');
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleTimeSelect = (time: string) => {
    setLocalSelectedTime(time);
    setShowTimePicker(false);
  };

  const handleClose = () => {
    resetForm();
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div 
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-scale-in"
          style={{
            '--enigma-primary': '#237584',
            '--enigma-secondary': '#9FB289', 
            '--enigma-accent': '#CB5910'
          } as React.CSSProperties}
        >
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--enigma-secondary)' }}
          >
            <CheckCircle size={32} className="text-white" />
          </div>
          <h3 
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--enigma-primary)' }}
          >
            ¡Reserva Creada!
          </h3>
          <p 
            className="text-sm"
            style={{ color: 'var(--enigma-neutral-600)' }}
          >
            La reserva se ha registrado exitosamente para {formData.nombre} {formData.apellido}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl h-auto overflow-hidden shadow-2xl animate-scale-in"
        style={{
          '--enigma-primary': '#237584',
          '--enigma-secondary': '#9FB289', 
          '--enigma-accent': '#CB5910',
          '--enigma-neutral-900': '#1a1a1a',
          '--enigma-neutral-700': '#374151',
          '--enigma-neutral-500': '#6b7280',
          '--enigma-neutral-200': '#e5e7eb',
          '--enigma-neutral-100': '#f3f4f6',
          '--enigma-neutral-50': '#f9fafb'
        } as React.CSSProperties}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ 
            background: 'linear-gradient(135deg, var(--enigma-primary)08, var(--enigma-secondary)08)',
            borderColor: 'var(--enigma-neutral-200)'
          }}
        >
          <div>
            <h2 
              className="text-xl font-bold"
              style={{ color: 'var(--enigma-primary)' }}
            >
              Nueva Reserva
            </h2>
            <div className="flex items-center gap-3 mt-1">
              {localSelectedTime ? (
                <button
                  onClick={() => setShowTimePicker(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all"
                  style={{ backgroundColor: 'var(--enigma-primary)10' }}
                >
                  <Clock size={14} style={{ color: 'var(--enigma-primary)' }} />
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: 'var(--enigma-primary)' }}
                  >
                    {localSelectedTime}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowTimePicker(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all border-2 border-dashed"
                  style={{ 
                    backgroundColor: 'var(--enigma-neutral-50)',
                    borderColor: 'var(--enigma-neutral-300)',
                    color: 'var(--enigma-neutral-600)'
                  }}
                >
                  <Clock size={14} />
                  <span className="text-sm font-medium">
                    Seleccionar hora
                  </span>
                </button>
              )}
              <div 
                className="text-sm font-medium"
                style={{ color: 'var(--enigma-neutral-600)' }}
              >
                {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </div>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ 
              color: 'var(--enigma-neutral-500)',
              backgroundColor: 'var(--enigma-neutral-100)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Selector de Hora Modal */}
        {showTimePicker && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div 
              className="bg-white rounded-2xl p-6 m-4 w-full max-w-sm max-h-96 overflow-hidden"
              style={{
                '--enigma-primary': '#237584',
                '--enigma-neutral-600': '#6b7280'
              } as React.CSSProperties}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-lg font-bold"
                  style={{ color: 'var(--enigma-primary)' }}
                >
                  Seleccionar Hora
                </h3>
                <button
                  onClick={() => setShowTimePicker(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ color: 'var(--enigma-neutral-600)' }}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        localSelectedTime === time 
                          ? 'text-white' 
                          : 'hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: localSelectedTime === time 
                          ? 'var(--enigma-primary)' 
                          : 'var(--enigma-primary)10',
                        color: localSelectedTime === time 
                          ? 'white' 
                          : 'var(--enigma-primary)'
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="p-6">
          <div className="space-y-6">
            
            {/* Comensales - Compacto */}
            <div className="flex items-center justify-between">
              <label 
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: 'var(--enigma-neutral-700)' }}
              >
                <Users size={16} style={{ color: 'var(--enigma-primary)' }} />
                Comensales
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('numero_personas', Math.max(1, formData.numero_personas - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all text-lg font-bold"
                  style={{ 
                    borderColor: 'var(--enigma-primary)',
                    backgroundColor: 'var(--enigma-primary)10',
                    color: 'var(--enigma-primary)'
                  }}
                >
                  −
                </button>
                <div 
                  className="w-16 h-10 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--enigma-secondary)15' }}
                >
                  <span 
                    className="text-xl font-bold"
                    style={{ color: 'var(--enigma-primary)' }}
                  >
                    {formData.numero_personas}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('numero_personas', Math.min(23, formData.numero_personas + 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all text-lg font-bold"
                  style={{ 
                    borderColor: 'var(--enigma-primary)',
                    backgroundColor: 'var(--enigma-primary)10',
                    color: 'var(--enigma-primary)'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Información Personal */}
            <div className="space-y-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--enigma-neutral-700)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Search size={14} style={{ color: 'var(--enigma-primary)' }} />
                      Nombre *
                      {isSearching && (
                        <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-0 transition-all"
                    style={{ 
                      borderColor: 'var(--enigma-neutral-300)',
                      fontSize: '16px'
                    }}
                    placeholder="Ej: María"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--enigma-primary)';
                      // Si ya hay texto, mostrar sugerencias al enfocar
                      if (formData.nombre.length >= 2) {
                        searchClients(formData.nombre);
                      }
                    }}
                    onBlur={(e) => {
                      // Retrasar para permitir clicks en sugerencias
                      setTimeout(() => {
                        e.target.style.borderColor = 'var(--enigma-neutral-300)';
                        setShowSuggestions(false);
                      }, 200);
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--enigma-neutral-700)' }}
                  >
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-0 transition-all"
                    style={{ 
                      borderColor: 'var(--enigma-neutral-300)',
                      fontSize: '16px'
                    }}
                    placeholder="Ej: García"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--enigma-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--enigma-neutral-300)';
                    }}
                  />
                </div>
              </div>

              {/* Sugerencias de autocompletado */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div 
                  className="absolute z-10 w-full mt-1 bg-white border-2 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  style={{ 
                    borderColor: 'var(--enigma-primary)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="p-2">
                    <div 
                      className="text-xs font-semibold mb-2 px-2 py-1"
                      style={{ color: 'var(--enigma-primary)' }}
                    >
                      Clientes encontrados:
                    </div>
                    {searchSuggestions.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => selectClient(client)}
                        className="w-full text-left p-3 rounded-lg hover:bg-opacity-80 transition-all mb-1"
                        style={{ backgroundColor: 'var(--enigma-primary)08' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--enigma-primary)15';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--enigma-primary)08';
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div 
                              className="font-semibold text-sm"
                              style={{ color: 'var(--enigma-neutral-900)' }}
                            >
                              {client.nombre} {client.apellidos}
                            </div>
                            <div 
                              className="text-xs flex items-center gap-2 mt-1"
                              style={{ color: 'var(--enigma-neutral-600)' }}
                            >
                              {client.telefono && (
                                <span className="flex items-center gap-1">
                                  <Phone size={10} />
                                  {client.telefono}
                                </span>
                              )}
                              {client.email && (
                                <span className="flex items-center gap-1">
                                  <Mail size={10} />
                                  {client.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div 
                            className="text-xs px-2 py-1 rounded-md"
                            style={{ 
                              backgroundColor: client.type === 'client' ? 'var(--enigma-secondary)20' : 'var(--enigma-accent)20',
                              color: client.type === 'client' ? 'var(--enigma-secondary)' : 'var(--enigma-accent)'
                            }}
                          >
                            {client.type === 'client' ? 'Cliente' : 'Reserva reciente'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--enigma-neutral-700)' }}
                  >
                    <Phone size={14} style={{ color: 'var(--enigma-primary)', display: 'inline', marginRight: '6px' }} />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={`w-full p-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-0 transition-all ${
                      formData.telefono && !isValidInternationalPhone(formData.telefono) 
                        ? 'border-red-400' 
                        : ''
                    }`}
                    style={{ 
                      borderColor: formData.telefono && !isValidInternationalPhone(formData.telefono) 
                        ? '#f87171' 
                        : 'var(--enigma-neutral-300)',
                      fontSize: '16px'
                    }}
                    placeholder="Ej: +34 634 567 890"
                    onFocus={(e) => {
                      if (!formData.telefono || isValidInternationalPhone(formData.telefono)) {
                        e.target.style.borderColor = 'var(--enigma-primary)';
                      }
                    }}
                    onBlur={(e) => {
                      if (formData.telefono && !isValidInternationalPhone(formData.telefono)) {
                        e.target.style.borderColor = '#f87171';
                      } else {
                        e.target.style.borderColor = 'var(--enigma-neutral-300)';
                      }
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                  {formData.telefono && !isValidInternationalPhone(formData.telefono) && (
                    <p className="text-xs mt-1" style={{ color: '#ef4444' }}>
                      Debe incluir prefijo internacional (+34, +1, +33, etc. o 0034, 001, 0033, etc.)
                    </p>
                  )}
                </div>

                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--enigma-neutral-700)' }}
                  >
                    <Mail size={14} style={{ color: 'var(--enigma-primary)', display: 'inline', marginRight: '6px' }} />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-0 transition-all"
                    style={{ 
                      borderColor: 'var(--enigma-neutral-300)',
                      fontSize: '16px'
                    }}
                    placeholder="maria@gmail.com"
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--enigma-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--enigma-neutral-300)';
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--enigma-neutral-700)' }}
                  >
                    Requisitos dietéticos <span style={{ color: 'var(--enigma-neutral-500)' }}>(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.requisitos_dieteticos}
                    onChange={(e) => handleInputChange('requisitos_dieteticos', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-0 transition-all"
                    style={{ 
                      borderColor: 'var(--enigma-neutral-300)',
                      fontSize: '16px'
                    }}
                    placeholder="Ej: Vegano, sin gluten..."
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--enigma-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--enigma-neutral-300)';
                    }}
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--enigma-neutral-700)' }}
                  >
                    Notas especiales <span style={{ color: 'var(--enigma-neutral-500)' }}>(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.notas}
                    onChange={(e) => handleInputChange('notas', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 text-sm focus:outline-none focus:ring-0 transition-all"
                    style={{ 
                      borderColor: 'var(--enigma-neutral-300)',
                      fontSize: '16px'
                    }}
                    placeholder="Ej: Mesa tranquila, cumpleaños..."
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--enigma-primary)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--enigma-neutral-300)';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-5 border-t"
          style={{ 
            background: 'linear-gradient(135deg, var(--enigma-neutral-25), white)',
            borderColor: 'var(--enigma-neutral-200)'
          }}
        >
          <div className="flex gap-4">
            <button
              onClick={handleClose}
              className="flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all text-base"
              style={{ 
                borderColor: 'var(--enigma-neutral-300)',
                color: 'var(--enigma-neutral-600)',
                backgroundColor: 'white'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--enigma-neutral-50)';
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="flex-1 py-4 px-6 rounded-xl font-semibold transition-all text-base text-white"
              style={{ 
                backgroundColor: isFormValid() ? 'var(--enigma-primary)' : 'var(--enigma-neutral-300)',
                opacity: isFormValid() ? 1 : 0.6,
                cursor: isFormValid() ? 'pointer' : 'not-allowed'
              }}
              onTouchStart={(e) => {
                if (isFormValid() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--enigma-primary)dd';
                  e.currentTarget.style.transform = 'scale(0.98)';
                }
              }}
              onTouchEnd={(e) => {
                if (isFormValid() && !isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--enigma-primary)';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </div>
              ) : (
                'Crear Reserva'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}