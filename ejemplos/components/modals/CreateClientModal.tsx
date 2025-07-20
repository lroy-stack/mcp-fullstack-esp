import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IOSButton } from '@/components/ui/ios-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useCreateClient, useUpdateClient } from '@/hooks/useClientDetail';
import { useClientExistenceCheck } from '@/hooks/useClientExistenceCheck';
import { ClientExistenceAlert } from '@/components/modals/ClientExistenceAlert';
import { X, Calendar as CalendarIcon, User, Mail, Phone, MapPin, Building, Utensils, AlertTriangle, Heart, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Cliente } from '@/types/database';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated?: (clientId: number) => void;
}

interface ClientFormData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  telefono_alternativo: string;
  fecha_nacimiento: Date | undefined;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  pais: string;
  empresa: string;
  cargo: string;
  preferencias_comida: string;
  restricciones_dieteticas: string;
  alergias: string;
  vinos_preferidos: string;
  ocasiones_especiales: string;
  acepta_marketing: boolean;
  acepta_whatsapp: boolean;
  acepta_email: boolean;
  idioma_preferido: string;
  notas_internas: string;
}

const initialFormData: ClientFormData = {
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  telefono_alternativo: '',
  fecha_nacimiento: undefined,
  direccion: '',
  ciudad: '',
  codigo_postal: '',
  pais: 'España',
  empresa: '',
  cargo: '',
  preferencias_comida: '',
  restricciones_dieteticas: '',
  alergias: '',
  vinos_preferidos: '',
  ocasiones_especiales: '',
  acepta_marketing: false,
  acepta_whatsapp: false,
  acepta_email: true,
  idioma_preferido: 'es',
  notas_internas: ''
};

export function CreateClientModal({ isOpen, onClose, onClientCreated }: CreateClientModalProps) {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedExistingClient, setSelectedExistingClient] = useState<Cliente | null>(null);
  const [forceCreateNew, setForceCreateNew] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  
  // Hook para verificación de existencia con debounce
  const { isChecking, result: existenceResult } = useClientExistenceCheck(
    formData.email,
    formData.telefono,
    800 // 800ms de debounce
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    // Validaciones obligatorias
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    // Apellidos obligatorios
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    // Email obligatorio y con formato válido
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Teléfono obligatorio
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (formData.telefono.length < 9) {
      newErrors.telefono = 'El teléfono debe tener al menos 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const clientData = {
        ...formData,
        fecha_nacimiento: formData.fecha_nacimiento 
          ? format(formData.fecha_nacimiento, 'yyyy-MM-dd') 
          : undefined
      };

      let clientId: number;
      
      if (isUpdateMode && selectedExistingClient) {
        // Actualizar cliente existente
        await updateClient.mutateAsync({
          clientId: selectedExistingClient.id,
          updates: clientData
        });
        clientId = selectedExistingClient.id;
      } else {
        // Crear nuevo cliente
        clientId = await createClient.mutateAsync(clientData);
      }
      
      // Reset form and state
      resetForm();
      
      // Notify parent and close
      if (onClientCreated && clientId) {
        onClientCreated(clientId);
      }
      onClose();
    } catch (error) {
      console.error(`Error ${isUpdateMode ? 'updating' : 'creating'} client:`, error);
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Reset force create new when user changes email or phone
    if ((field === 'email' || field === 'telefono') && forceCreateNew) {
      setForceCreateNew(false);
    }
  };
  
  // Efecto para manejar la detección automática de clientes
  useEffect(() => {
    if (!existenceResult || forceCreateNew) {
      setIsUpdateMode(false);
      setSelectedExistingClient(null);
      return;
    }
    
    // Auto-seleccionar cliente para actualización si hay coincidencia simple
    if (existenceResult.shouldUpdate && !existenceResult.hasConflict) {
      handleSelectUpdate(existenceResult.existingClient!);
    }
  }, [existenceResult, forceCreateNew]);
  
  // Handlers para las acciones de la alerta
  const handleSelectUpdate = (client: Cliente) => {
    setIsUpdateMode(true);
    setSelectedExistingClient(client);
    
    // Pre-llenar formulario con datos existentes, manteniendo los campos editados
    setFormData(prev => ({
      nombre: prev.nombre || client.nombre || '',
      apellidos: prev.apellidos || client.apellidos || '',
      email: prev.email || client.email || '',
      telefono: prev.telefono || client.telefono || '',
      telefono_alternativo: client.telefono_alternativo || '',
      fecha_nacimiento: client.fecha_nacimiento ? new Date(client.fecha_nacimiento) : undefined,
      direccion: client.direccion || '',
      ciudad: client.ciudad || '',
      codigo_postal: client.codigo_postal || '',
      pais: client.pais || 'España',
      empresa: client.empresa || '',
      cargo: client.cargo || '',
      preferencias_comida: client.preferencias_comida || '',
      restricciones_dieteticas: client.restricciones_dieteticas || '',
      alergias: client.alergias || '',
      vinos_preferidos: client.vinos_preferidos || '',
      ocasiones_especiales: client.ocasiones_especiales || '',
      acepta_marketing: client.acepta_marketing || false,
      acepta_whatsapp: client.acepta_whatsapp || false,
      acepta_email: client.acepta_email !== false, // Default true
      idioma_preferido: client.idioma_preferido || 'es',
      notas_internas: client.notas_internas || ''
    }));
  };
  
  const handleSelectCreateNew = () => {
    setForceCreateNew(true);
    setIsUpdateMode(false);
    setSelectedExistingClient(null);
  };
  
  const handleResolveConflict = (emailClient: Cliente, phoneClient: Cliente) => {
    setShowConflictModal(true);
    // La lógica del modal de conflicto se implementará más adelante
  };
  
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsUpdateMode(false);
    setSelectedExistingClient(null);
    setForceCreateNew(false);
    setShowConflictModal(false);
  };

  const handleClose = () => {
    if (!createClient.isPending && !updateClient.isPending) {
      resetForm();
      onClose();
    }
  };
  
  // Determinar el estado del botón de envío
  const isSubmitting = createClient.isPending || updateClient.isPending;
  const submitButtonText = isSubmitting 
    ? (isUpdateMode ? 'Actualizando...' : 'Creando Cliente...')
    : (isUpdateMode ? 'Actualizar Cliente' : 'Crear Cliente');
  
  // Determinar el título del modal
  const modalTitle = isUpdateMode 
    ? `Actualizar Cliente: ${selectedExistingClient?.nombre} ${selectedExistingClient?.apellidos}`
    : 'Crear Nuevo Cliente';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0 border-b border-enigma-neutral-200">
          <DialogTitle className="ios-text-title2 font-bold text-enigma-neutral-900 flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-ios",
              isUpdateMode 
                ? "bg-enigma-secondary/10" 
                : "bg-enigma-primary/10"
            )}>
              {isUpdateMode ? (
                <RefreshCw className="h-5 w-5 text-enigma-secondary" />
              ) : (
                <User className="h-5 w-5 text-enigma-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-lg">{modalTitle}</div>
              {isUpdateMode && selectedExistingClient && (
                <div className="ios-text-caption1 text-enigma-neutral-600 font-normal">
                  Cliente #{selectedExistingClient.id} • {selectedExistingClient.es_vip ? 'VIP' : 'Regular'}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Alerta de Cliente Existente */}
          {existenceResult && !forceCreateNew && (
            <ClientExistenceAlert
              result={existenceResult}
              onSelectUpdate={handleSelectUpdate}
              onSelectCreateNew={handleSelectCreateNew}
              onResolveConflict={handleResolveConflict}
              className="mb-6"
            />
          )}
          
          {/* Indicador de verificación */}
          {isChecking && (
            <div className="flex items-center gap-2 text-enigma-neutral-600 ios-text-caption1 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-enigma-primary border-t-transparent"></div>
              Verificando si el cliente ya existe...
            </div>
          )}

          {/* Información Personal */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
              <User className="h-5 w-5 text-enigma-primary" />
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Información Personal
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="nombre" className="text-enigma-neutral-700 font-semibold text-base">
                  Nombre <span className="text-enigma-accent">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={cn(
                    "ios-input h-14 text-base px-4",
                    errors.nombre && "border-enigma-accent focus:border-enigma-accent"
                  )}
                  placeholder="Ej: Juan Carlos, María José, Antonio..."
                />
                {errors.nombre && (
                  <p className="text-sm text-enigma-accent">{errors.nombre}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="apellidos" className="text-enigma-neutral-700 font-semibold text-base">
                  Apellidos <span className="text-enigma-accent">*</span>
                </Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className={cn(
                    "ios-input h-14 text-base px-4",
                    errors.apellidos && "border-enigma-accent focus:border-enigma-accent"
                  )}
                  placeholder="Ej: García López, Rodríguez Martín..."
                />
                {errors.apellidos && (
                  <p className="text-sm text-enigma-accent">{errors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="fecha_nacimiento" className="text-enigma-neutral-700 font-semibold text-base">
                Fecha de Nacimiento <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
              </Label>
              <DatePicker
                value={formData.fecha_nacimiento}
                onChange={(date) => handleInputChange('fecha_nacimiento', date)}
                placeholder="Seleccionar fecha de nacimiento"
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
                className="w-full"
              />
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
              <Phone className="h-5 w-5 text-enigma-primary" />
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Información de Contacto
              </h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-enigma-neutral-700 font-semibold text-base">
                  Email <span className="text-enigma-accent">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-enigma-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn(
                      "ios-input h-14 text-base pl-12 pr-4",
                      errors.email && "border-enigma-accent focus:border-enigma-accent"
                    )}
                    placeholder="juan.perez@gmail.com, maria@empresa.com..."
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-enigma-accent">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="telefono" className="text-enigma-neutral-700 font-semibold text-base">
                  Teléfono <span className="text-enigma-accent">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-enigma-neutral-400" />
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={cn(
                      "ios-input h-14 text-base pl-12 pr-4",
                      errors.telefono && "border-enigma-accent focus:border-enigma-accent"
                    )}
                    placeholder="+34 612 345 678, 91 123 45 67..."
                  />
                </div>
                {errors.telefono && (
                  <p className="text-sm text-enigma-accent">{errors.telefono}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="telefono_alternativo" className="text-enigma-neutral-700 font-semibold text-base">
                Teléfono Alternativo <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-enigma-neutral-400" />
                <Input
                  id="telefono_alternativo"
                  value={formData.telefono_alternativo}
                  onChange={(e) => handleInputChange('telefono_alternativo', e.target.value)}
                  className="ios-input h-14 text-base pl-12 pr-4"
                  placeholder="Teléfono del trabajo, casa, familiar..."
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
              <MapPin className="h-5 w-5 text-enigma-primary" />
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Dirección
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="direccion" className="text-enigma-neutral-700 font-semibold text-base">
                  Dirección <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="ios-input h-14 text-base px-4"
                  placeholder="Calle Gran Vía 28, 3º A - Madrid Centro..."
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="ciudad" className="text-enigma-neutral-700 font-semibold text-base">
                    Ciudad
                  </Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    className="ios-input h-14 text-base px-4"
                    placeholder="Madrid, Barcelona, Valencia..."
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="codigo_postal" className="text-enigma-neutral-700 font-semibold text-base">
                    Código Postal
                  </Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => handleInputChange('codigo_postal', e.target.value)}
                    className="ios-input h-14 text-base px-4"
                    placeholder="28001, 08001, 46001..."
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="pais" className="text-enigma-neutral-700 font-semibold text-base">
                    País
                  </Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={(e) => handleInputChange('pais', e.target.value)}
                    className="ios-input h-14 text-base px-4"
                    placeholder="España, Francia, Italia, Portugal..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
              <Building className="h-5 w-5 text-enigma-primary" />
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Información Profesional
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-enigma-neutral-700 font-medium">
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  className="ios-input"
                  placeholder="Nombre de la empresa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cargo" className="text-enigma-neutral-700 font-medium">
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  className="ios-input"
                  placeholder="Director, Manager, etc."
                />
              </div>
            </div>
          </div>

          {/* Preferencias Gastronómicas */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
              <Utensils className="h-5 w-5 text-enigma-primary" />
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Preferencias Gastronómicas
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="preferencias_comida" className="text-enigma-neutral-700 font-semibold text-base">
                  Preferencias de Comida <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
                </Label>
                <Textarea
                  id="preferencias_comida"
                  value={formData.preferencias_comida}
                  onChange={(e) => handleInputChange('preferencias_comida', e.target.value)}
                  className="ios-input resize-none text-base px-4 py-3"
                  rows={3}
                  placeholder="Paella, sushi, comida mediterránea, cocina tradicional española..."
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="restricciones_dieteticas" className="text-enigma-neutral-700 font-semibold text-base">
                  Restricciones Dietéticas <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
                </Label>
                <Textarea
                  id="restricciones_dieteticas"
                  value={formData.restricciones_dieteticas}
                  onChange={(e) => handleInputChange('restricciones_dieteticas', e.target.value)}
                  className="ios-input resize-none text-base px-4 py-3"
                  rows={3}
                  placeholder="Vegetariano, vegano, sin gluten, sin lácteos, kosher, halal..."
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="alergias" className="text-enigma-neutral-700 font-semibold text-base">
                  Alergias <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
                </Label>
                <div className="relative">
                  <AlertTriangle className="absolute left-4 top-4 h-5 w-5 text-enigma-accent" />
                  <Textarea
                    id="alergias"
                    value={formData.alergias}
                    onChange={(e) => handleInputChange('alergias', e.target.value)}
                    className="ios-input resize-none text-base pl-12 pr-4 py-3"
                    rows={3}
                    placeholder="Frutos secos, mariscos, lactosa, huevos, soja, gluten..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="vinos_preferidos" className="text-enigma-neutral-700 font-semibold text-base">
                    Vinos Preferidos <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
                  </Label>
                  <Textarea
                    id="vinos_preferidos"
                    value={formData.vinos_preferidos}
                    onChange={(e) => handleInputChange('vinos_preferidos', e.target.value)}
                    className="ios-input resize-none text-base px-4 py-3"
                    rows={3}
                    placeholder="Rioja, Ribera del Duero, Champagne, Cava, Albariño..."
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="ocasiones_especiales" className="text-enigma-neutral-700 font-semibold text-base">
                    Ocasiones Especiales <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
                  </Label>
                  <Textarea
                    id="ocasiones_especiales"
                    value={formData.ocasiones_especiales}
                    onChange={(e) => handleInputChange('ocasiones_especiales', e.target.value)}
                    className="ios-input resize-none text-base px-4 py-3"
                    rows={3}
                    placeholder="Aniversario de boda 15 marzo, cumpleaños hijo 8 julio..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuración y Preferencias */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
              <Clock className="h-5 w-5 text-enigma-primary" />
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Configuración y Preferencias
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="idioma_preferido" className="text-enigma-neutral-700 font-semibold text-base">
                  Idioma Preferido <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
                </Label>
                <Select 
                  value={formData.idioma_preferido} 
                  onValueChange={(value) => handleInputChange('idioma_preferido', value)}
                >
                  <SelectTrigger className="ios-input h-14 text-base px-4">
                    <SelectValue placeholder="Seleccionar idioma de preferencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label className="text-enigma-neutral-700 font-medium">
                  Preferencias de Comunicación
                </Label>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="acepta_email"
                      checked={formData.acepta_email}
                      onCheckedChange={(checked) => handleInputChange('acepta_email', checked)}
                    />
                    <Label htmlFor="acepta_email" className="text-sm text-enigma-neutral-700">
                      Acepta comunicaciones por email
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="acepta_whatsapp"
                      checked={formData.acepta_whatsapp}
                      onCheckedChange={(checked) => handleInputChange('acepta_whatsapp', checked)}
                    />
                    <Label htmlFor="acepta_whatsapp" className="text-sm text-enigma-neutral-700">
                      Acepta mensajes por WhatsApp
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="acepta_marketing"
                      checked={formData.acepta_marketing}
                      onCheckedChange={(checked) => handleInputChange('acepta_marketing', checked)}
                    />
                    <Label htmlFor="acepta_marketing" className="text-sm text-enigma-neutral-700">
                      Acepta recibir ofertas y promociones
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notas Internas */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
              <Heart className="h-5 w-5 text-enigma-primary" />
              <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                Notas Internas
              </h3>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="notas_internas" className="text-enigma-neutral-700 font-semibold text-base">
                Notas y Comentarios <span className="text-enigma-neutral-500 font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="notas_internas"
                value={formData.notas_internas}
                onChange={(e) => handleInputChange('notas_internas', e.target.value)}
                className="ios-input resize-none text-base px-4 py-3"
                rows={4}
                placeholder="Cliente muy puntual, prefiere mesa junto a ventana, viene siempre con su familia los domingos..."
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-enigma-neutral-200">
            <IOSButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className={cn(
                "flex-1 text-white text-lg font-semibold h-14 px-6",
                isUpdateMode 
                  ? "bg-enigma-secondary hover:bg-enigma-secondary/90"
                  : "bg-enigma-primary hover:bg-enigma-primary/90"
              )}
            >
              {submitButtonText}
            </IOSButton>
            <IOSButton
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-2 border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-50 text-lg font-semibold h-14 px-6"
            >
              Cancelar
            </IOSButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}