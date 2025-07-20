import React, { useState, useEffect } from 'react';
import { Dialog, CustomDialogContent, DialogTitle, DialogDescription } from '@/components/ui/custom-dialog';
import { ClientDetailCard } from '@/components/clients/ClientDetailCard';
import { IOSButton } from '@/components/ui/ios-button';
import { TouchOptimizedCTA } from '@/components/ui/touch-optimized-cta';
import { 
  useClientDetail, 
  useUpdateClient, 
  useToggleVIPStatus, 
  useAddClientNote,
  useDeleteClient 
} from '@/hooks/useClientDetail';
import { X, Phone, MessageSquare, Edit, Plus, Trash2, AlertTriangle, Calendar as CalendarIcon, User, Mail, MapPin, Building, Utensils, Heart, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientDetailModalProps {
  clientId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToReservations?: (clientId: number) => void;
}

export function ClientDetailModal({
  clientId,
  isOpen,
  onClose,
  onNavigateToReservations
}: ClientDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editData, setEditData] = useState<any>({});

  const { data: clientDetail, isLoading, error } = useClientDetail(clientId || 0);
  const updateClient = useUpdateClient();
  const toggleVIP = useToggleVIPStatus();
  const addNote = useAddClientNote();
  const deleteClient = useDeleteClient();

  // Función centralizada para resetear todos los estados
  const resetAllStates = () => {
    setIsEditing(false);
    setShowAddNote(false);
    setShowDeleteWarning(false);
    setNewNote('');
    setEditData({});
  };

  // useEffect para resetear estados cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      // Resetear estados inmediatamente sin setTimeout para evitar persistencia
      resetAllStates();
    }
  }, [isOpen]);

  // useEffect para resetear estados cuando cambia el cliente
  useEffect(() => {
    if (clientId && isOpen) {
      resetAllStates();
    }
  }, [clientId, isOpen]);

  if (!clientId) return null;

  const handleCall = () => {
    if (clientDetail?.telefono) {
      window.open(`tel:${clientDetail.telefono}`);
    }
  };

  const handleMessage = () => {
    if (clientDetail?.telefono) {
      const whatsappUrl = `https://wa.me/${clientDetail.telefono.replace(/[^0-9]/g, '')}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEditStart = () => {
    setEditData({
      nombre: clientDetail?.nombre || '',
      apellidos: clientDetail?.apellidos || '',
      email: clientDetail?.email || '',
      telefono: clientDetail?.telefono || '',
      telefono_alternativo: clientDetail?.telefono_alternativo || '',
      fecha_nacimiento: clientDetail?.fecha_nacimiento || '',
      direccion: clientDetail?.direccion || '',
      ciudad: clientDetail?.ciudad || '',
      codigo_postal: clientDetail?.codigo_postal || '',
      pais: clientDetail?.pais || '',
      empresa: clientDetail?.empresa || '',
      cargo: clientDetail?.cargo || '',
      preferencias_comida: clientDetail?.preferencias_comida || '',
      restricciones_dieteticas: clientDetail?.restricciones_dieteticas || '',
      alergias: clientDetail?.alergias || '',
      vinos_preferidos: clientDetail?.vinos_preferidos || '',
      ocasiones_especiales: clientDetail?.ocasiones_especiales || '',
      acepta_marketing: clientDetail?.acepta_marketing || false,
      acepta_whatsapp: clientDetail?.acepta_whatsapp || false,
      acepta_email: clientDetail?.acepta_email || true,
      idioma_preferido: clientDetail?.idioma_preferido || 'es',
      notas_internas: clientDetail?.notas_internas || ''
    });
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    try {
      await updateClient.mutateAsync({
        clientId: clientId,
        updates: editData
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleToggleVIP = async () => {
    if (clientDetail) {
      await toggleVIP.mutateAsync({
        clientId: clientDetail.id,
        isVIP: clientDetail.es_vip
      });
    }
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addNote.mutateAsync({
        clientId: clientId,
        note: newNote.trim()
      });
      setNewNote('');
      setShowAddNote(false);
    }
  };

  const handleViewHistory = () => {
    if (onNavigateToReservations) {
      onNavigateToReservations(clientId);
      handleClose();
    }
  };

  const handleDeleteClient = async () => {
    if (clientDetail) {
      try {
        await deleteClient.mutateAsync(clientDetail.id);
        // Resetear estados y cerrar modal
        resetAllStates();
        onClose();
      } catch (error) {
        console.error('Error deleting client:', error);
        // Solo ocultar la advertencia en caso de error
        setShowDeleteWarning(false);
      }
    }
  };

  // Función para manejar el cierre del modal
  const handleClose = () => {
    onClose();
  };

  return (
    <>
    <Dialog 
      open={isOpen} 
      onOpenChange={handleClose}
      modal={true}
    >
      <CustomDialogContent 
        className={cn(
          "max-w-none w-[95vw] h-[92vh] p-0 overflow-hidden",
          "bg-white rounded-3xl md:rounded-2xl xl:rounded-ios-2xl",
          "shadow-2xl border-0 md:border md:border-enigma-neutral-200",
          "md:w-[90vw] md:h-[88vh] lg:w-[85vw] lg:h-[85vh] xl:max-w-6xl xl:h-[85vh]",
          "flex flex-col"
        )}
      >
        {/* Accessibility - Hidden but accessible titles */}
        <div className="sr-only">
          <DialogTitle>
            {isEditing ? 'Editar Cliente' : `Detalle del Cliente ${clientDetail?.nombre || ''}`}
          </DialogTitle>
          <DialogDescription>
            Modal con información completa del cliente, datos de contacto y opciones de edición
          </DialogDescription>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200/50 bg-white/95 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-10 md:h-10 bg-enigma-primary rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg md:text-base">
                {clientDetail?.nombre?.charAt(0) || 'C'}
              </span>
            </div>
            <div>
              <h2 className="ios-text-title2 md:ios-text-title3 font-bold text-enigma-neutral-900 tracking-tight">
                {isEditing ? 'Editar Cliente' : 'Detalle del Cliente'}
              </h2>
              <p className="ios-text-footnote md:ios-text-caption1 text-enigma-neutral-600 font-medium">
                {clientDetail?.nombre || 'Cliente'} {clientDetail?.apellidos ? `• ${clientDetail.apellidos}` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                {/* Contact Action Buttons - Touch Optimized */}
                <TouchOptimizedCTA
                  variant="outline"
                  size="md"
                  icon={Phone}
                  onClick={handleCall}
                  className="w-10 h-10 md:w-8 md:h-8 border-green-300 text-green-700 hover:bg-green-50 rounded-full p-0"
                  disabled={!clientDetail?.telefono}
                />
                <TouchOptimizedCTA
                  variant="outline"
                  size="md"
                  icon={MessageSquare}
                  onClick={handleMessage}
                  className="w-10 h-10 md:w-8 md:h-8 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-full p-0"
                  disabled={!clientDetail?.telefono}
                />
                <TouchOptimizedCTA
                  variant="outline"
                  size="md"
                  icon={Edit}
                  onClick={handleEditStart}
                  className="w-10 h-10 md:w-8 md:h-8 border-enigma-teal text-enigma-teal hover:bg-enigma-teal/10 rounded-full p-0"
                />
                <TouchOptimizedCTA
                  variant="outline"
                  size="md"
                  icon={Trash2}
                  onClick={() => {
                    console.log('🗑️ Click en botón eliminar');
                    setShowDeleteWarning(true);
                  }}
                  className="w-10 h-10 md:w-8 md:h-8 border-enigma-accent text-enigma-accent hover:bg-enigma-accent/10 rounded-full p-0"
                />
              </>
            )}
            
            <TouchOptimizedCTA
              variant="ghost"
              size="md"
              onClick={handleClose}
              icon={X}
              className="text-enigma-neutral-600 w-10 h-10 md:w-8 md:h-8 rounded-full"
            />
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 md:p-6">
          {/* Modern Delete Confirmation Overlay - Estilo ReservationDetailModal */}
          {showDeleteWarning && clientDetail && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-[480px] shadow-2xl">
                <div className="p-6">
                  {/* Header con icono */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                      <AlertTriangle size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Eliminar Cliente</h3>
                      <p className="text-gray-500">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  
                  {/* Info del cliente */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-gray-900 mb-1">
                      Cliente: {clientDetail.nombre} {clientDetail.apellidos || ''}
                    </p>
                    {clientDetail.email && (
                      <p className="text-sm text-gray-600">Email: {clientDetail.email}</p>
                    )}
                    {clientDetail.telefono && (
                      <p className="text-sm text-gray-600">Teléfono: {clientDetail.telefono}</p>
                    )}
                    {(clientDetail.total_reservas || 0) > 0 && (
                      <div className="flex items-center mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <AlertTriangle size={16} className="text-orange-500 mr-2" />
                        <p className="text-sm text-orange-700 font-medium">
                          Este cliente tiene {clientDetail.total_reservas} reserva(s) registrada(s)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Pregunta de confirmación */}
                  <p className="text-gray-700 mb-4 font-medium">
                    ¿Estás seguro de que quieres eliminar este cliente?
                  </p>
                  
                  {/* Lista compacta */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Esta acción eliminará:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>• Toda la información personal del cliente</div>
                      <div>• Historial de reservas y visitas</div>
                      <div>• Notas y preferencias guardadas</div>
                      <div>• Referencias en el sistema CRM</div>
                    </div>
                  </div>
                  
                  {/* Botones horizontales - Touch Optimized */}
                  <div className="flex gap-3">
                    <TouchOptimizedCTA
                      variant="outline"
                      size="lg"
                      onClick={() => setShowDeleteWarning(false)}
                      disabled={deleteClient.isPending}
                      className="flex-1 min-h-[52px] border-gray-300 text-gray-700"
                      fullWidth
                    >
                      Cancelar
                    </TouchOptimizedCTA>
                    <TouchOptimizedCTA
                      variant="destructive"
                      size="lg"
                      onClick={() => {
                        console.log('✅ Confirmando eliminación de cliente');
                        handleDeleteClient();
                      }}
                      loading={deleteClient.isPending}
                      disabled={deleteClient.isPending}
                      className="flex-1 min-h-[52px] bg-red-500 hover:bg-red-600 text-white"
                      fullWidth
                    >
                      {deleteClient.isPending ? 'Eliminando...' : 'Sí, Eliminar'}
                    </TouchOptimizedCTA>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600">Error al cargar los datos del cliente</p>
            </div>
          )}

          {clientDetail && !isEditing && !showDeleteWarning && (
            <ClientDetailCard
              client={clientDetail}
              reservations={clientDetail.reservations}
              onEditClient={handleEditStart}
              onViewFullHistory={handleViewHistory}
              onToggleVIP={handleToggleVIP}
              onCallClient={handleCall}
              onMessageClient={handleMessage}
              className="border-0 shadow-none"
            />
          )}

          {isEditing && clientDetail && (
            <div className="space-y-8 mt-6">
              {/* Información Personal */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
                  <User className="h-5 w-5 text-enigma-primary" />
                  <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                    Información Personal
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-enigma-neutral-700 font-medium">
                      Nombre <span className="text-enigma-accent">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={editData.nombre}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                      className="ios-input"
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="text-enigma-neutral-700 font-medium">
                      Apellidos <span className="text-enigma-accent">*</span>
                    </Label>
                    <Input
                      id="apellidos"
                      value={editData.apellidos}
                      onChange={(e) => setEditData({ ...editData, apellidos: e.target.value })}
                      className="ios-input"
                      placeholder="Apellidos del cliente"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-enigma-neutral-700 font-medium">
                    Fecha de Nacimiento (opcional)
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enigma-neutral-400" />
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={editData.fecha_nacimiento ? (editData.fecha_nacimiento.includes('T') ? editData.fecha_nacimiento.split('T')[0] : editData.fecha_nacimiento) : ''}
                      onChange={(e) => setEditData({ ...editData, fecha_nacimiento: e.target.value })}
                      className="ios-input pl-10"
                      max={format(new Date(), 'yyyy-MM-dd')}
                      min="1900-01-01"
                    />
                  </div>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-enigma-neutral-700 font-medium">
                      Email <span className="text-enigma-accent">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enigma-neutral-400" />
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="ios-input pl-10"
                        placeholder="cliente@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-enigma-neutral-700 font-medium">
                      Teléfono <span className="text-enigma-accent">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enigma-neutral-400" />
                      <Input
                        id="telefono"
                        value={editData.telefono}
                        onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                        className="ios-input pl-10"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono_alternativo" className="text-enigma-neutral-700 font-medium">
                    Teléfono Alternativo (opcional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-enigma-neutral-400" />
                    <Input
                      id="telefono_alternativo"
                      value={editData.telefono_alternativo}
                      onChange={(e) => setEditData({ ...editData, telefono_alternativo: e.target.value })}
                      className="ios-input pl-10"
                      placeholder="+34 600 000 001"
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-enigma-neutral-200">
                  <MapPin className="h-5 w-5 text-enigma-primary" />
                  <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
                    Dirección (opcional)
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-enigma-neutral-700 font-medium">
                      Dirección
                    </Label>
                    <Input
                      id="direccion"
                      value={editData.direccion}
                      onChange={(e) => setEditData({ ...editData, direccion: e.target.value })}
                      className="ios-input"
                      placeholder="Calle, número, piso, puerta"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ciudad" className="text-enigma-neutral-700 font-medium">
                        Ciudad
                      </Label>
                      <Input
                        id="ciudad"
                        value={editData.ciudad}
                        onChange={(e) => setEditData({ ...editData, ciudad: e.target.value })}
                        className="ios-input"
                        placeholder="Madrid"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="codigo_postal" className="text-enigma-neutral-700 font-medium">
                        Código Postal
                      </Label>
                      <Input
                        id="codigo_postal"
                        value={editData.codigo_postal}
                        onChange={(e) => setEditData({ ...editData, codigo_postal: e.target.value })}
                        className="ios-input"
                        placeholder="28001"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pais" className="text-enigma-neutral-700 font-medium">
                        País
                      </Label>
                      <Input
                        id="pais"
                        value={editData.pais}
                        onChange={(e) => setEditData({ ...editData, pais: e.target.value })}
                        className="ios-input"
                        placeholder="España"
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
                    Información Profesional (opcional)
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa" className="text-enigma-neutral-700 font-medium">
                      Empresa
                    </Label>
                    <Input
                      id="empresa"
                      value={editData.empresa}
                      onChange={(e) => setEditData({ ...editData, empresa: e.target.value })}
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
                      value={editData.cargo}
                      onChange={(e) => setEditData({ ...editData, cargo: e.target.value })}
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
                    Preferencias Gastronómicas (opcional)
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferencias_comida" className="text-enigma-neutral-700 font-medium">
                      Preferencias de Comida
                    </Label>
                    <Textarea
                      id="preferencias_comida"
                      value={editData.preferencias_comida}
                      onChange={(e) => setEditData({ ...editData, preferencias_comida: e.target.value })}
                      className="ios-input resize-none"
                      rows={2}
                      placeholder="Platos favoritos, cocina preferida, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="restricciones_dieteticas" className="text-enigma-neutral-700 font-medium">
                      Restricciones Dietéticas
                    </Label>
                    <Textarea
                      id="restricciones_dieteticas"
                      value={editData.restricciones_dieteticas}
                      onChange={(e) => setEditData({ ...editData, restricciones_dieteticas: e.target.value })}
                      className="ios-input resize-none"
                      rows={2}
                      placeholder="Vegetariano, vegano, sin gluten, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alergias" className="text-enigma-neutral-700 font-medium">
                      Alergias
                    </Label>
                    <div className="relative">
                      <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-enigma-accent" />
                      <Textarea
                        id="alergias"
                        value={editData.alergias}
                        onChange={(e) => setEditData({ ...editData, alergias: e.target.value })}
                        className="ios-input resize-none pl-10"
                        rows={2}
                        placeholder="Frutos secos, mariscos, lactosa, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vinos_preferidos" className="text-enigma-neutral-700 font-medium">
                        Vinos Preferidos
                      </Label>
                      <Textarea
                        id="vinos_preferidos"
                        value={editData.vinos_preferidos}
                        onChange={(e) => setEditData({ ...editData, vinos_preferidos: e.target.value })}
                        className="ios-input resize-none"
                        rows={2}
                        placeholder="Tipos de vino, bodegas, maridajes preferidos"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ocasiones_especiales" className="text-enigma-neutral-700 font-medium">
                        Ocasiones Especiales
                      </Label>
                      <Textarea
                        id="ocasiones_especiales"
                        value={editData.ocasiones_especiales}
                        onChange={(e) => setEditData({ ...editData, ocasiones_especiales: e.target.value })}
                        className="ios-input resize-none"
                        rows={2}
                        placeholder="Aniversarios, celebraciones, eventos importantes"
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
                    Configuración y Preferencias (opcional)
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idioma_preferido" className="text-enigma-neutral-700 font-medium">
                      Idioma Preferido
                    </Label>
                    <Select 
                      value={editData.idioma_preferido} 
                      onValueChange={(value) => setEditData({ ...editData, idioma_preferido: value })}
                    >
                      <SelectTrigger className="ios-input">
                        <SelectValue placeholder="Seleccionar idioma" />
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
                          checked={editData.acepta_email}
                          onCheckedChange={(checked) => setEditData({ ...editData, acepta_email: checked })}
                        />
                        <Label htmlFor="acepta_email" className="text-sm text-enigma-neutral-700">
                          Acepta comunicaciones por email
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="acepta_whatsapp"
                          checked={editData.acepta_whatsapp}
                          onCheckedChange={(checked) => setEditData({ ...editData, acepta_whatsapp: checked })}
                        />
                        <Label htmlFor="acepta_whatsapp" className="text-sm text-enigma-neutral-700">
                          Acepta mensajes por WhatsApp
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id="acepta_marketing"
                          checked={editData.acepta_marketing}
                          onCheckedChange={(checked) => setEditData({ ...editData, acepta_marketing: checked })}
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
                    Notas Internas (opcional)
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notas_internas" className="text-enigma-neutral-700 font-medium">
                    Notas y Comentarios
                  </Label>
                  <Textarea
                    id="notas_internas"
                    value={editData.notas_internas}
                    onChange={(e) => setEditData({ ...editData, notas_internas: e.target.value })}
                    className="ios-input resize-none"
                    rows={3}
                    placeholder="Información adicional, observaciones del personal, etc."
                  />
                </div>
              </div>

              {/* Botones de Acción - Touch Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-enigma-neutral-200">
                <TouchOptimizedCTA
                  variant="primary"
                  size="lg"
                  onClick={handleEditSave}
                  loading={updateClient.isPending}
                  disabled={updateClient.isPending}
                  className="flex-1 min-h-[52px] bg-enigma-primary hover:bg-enigma-primary/90 text-white"
                  fullWidth
                >
                  {updateClient.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </TouchOptimizedCTA>
                <TouchOptimizedCTA
                  variant="outline"
                  size="lg"
                  onClick={handleEditCancel}
                  disabled={updateClient.isPending}
                  className="flex-1 min-h-[52px] border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-50"
                  fullWidth
                >
                  Cancelar
                </TouchOptimizedCTA>
              </div>
            </div>
          )}

          {/* Add Note Section */}
          {showAddNote && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="ios-text-headline mb-3">Agregar Nota</h4>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Escribe una nota sobre este cliente..."
                className="ios-input mb-3"
                rows={3}
              />
              <div className="flex gap-3">
                <TouchOptimizedCTA
                  variant="primary"
                  size="md"
                  onClick={handleAddNote}
                  loading={addNote.isPending}
                  disabled={addNote.isPending || !newNote.trim()}
                  className="min-h-[44px]"
                >
                  {addNote.isPending ? 'Guardando...' : 'Guardar Nota'}
                </TouchOptimizedCTA>
                <TouchOptimizedCTA
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNote('');
                  }}
                  className="min-h-[44px]"
                >
                  Cancelar
                </TouchOptimizedCTA>
              </div>
            </div>
          )}

          {/* Add Note Button */}
          {!isEditing && !showAddNote && (
            <div className="mt-4 flex justify-center">
              <TouchOptimizedCTA
                variant="ghost"
                size="md"
                icon={Plus}
                iconPosition="left"
                onClick={() => setShowAddNote(true)}
                className="text-enigma-teal min-h-[44px]"
              >
                Agregar Nota
              </TouchOptimizedCTA>
            </div>
          )}
          </div>
        </div>

      </CustomDialogContent>
    </Dialog>

    </>
  );
}