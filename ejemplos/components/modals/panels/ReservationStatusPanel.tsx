import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, Edit2, Check, X, AlertTriangle, Star, Table, ChefHat, Wine, Euro, User, MessageSquare, Utensils } from 'lucide-react';
import { TouchOptimizedCTA } from '@/components/ui/touch-optimized-cta';
import { IOSBadge } from '@/components/ui/ios-badge';
import { IOSButton } from '@/components/ui/ios-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatReservationTime } from '@/utils/dateUtils';
import { getTableDisplayNameFromData } from '@/utils/tableUtils';
import { extraerSeleccionesMenu } from '@/types/database';
import { QuickTableAssignment } from '@/components/tables/QuickTableAssignment';
import { useTablesWithStates } from '@/hooks/useTableStates';

interface ReservationStatusPanelProps {
  reservationDetail: {
    id: number;
    fecha_reserva: string;
    hora_reserva: string;
    numero_personas: number;
    estado: string;
    mesa_id?: number;
    nombre_reserva: string;
    telefono?: string;
    email?: string;
    comentarios?: string;
    peticiones_especiales?: string;
    alergias_comunicadas?: string;
    zona_preferida?: number;
    datos_adicionales?: any;
    created_at: string;
    updated_at: string;
  };
  onUpdateStatus: (newStatus: string) => void;
  onTableAssigned?: (tableId: number) => void;
  onEditDateTime: (fecha: string, hora: string) => void;
  onEditReservationDetails?: (details: {
    numero_personas: number;
    peticiones_especiales?: string;
    alergias_comunicadas?: string;
    zona_preferida?: number;
  }) => void;
  onAddExperienceNote: (note: string) => void;
  isUpdating?: boolean;
  className?: string;
}

export const ReservationStatusPanel: React.FC<ReservationStatusPanelProps> = ({
  reservationDetail,
  onUpdateStatus,
  onTableAssigned,
  onEditDateTime,
  onEditReservationDetails,
  onAddExperienceNote,
  isUpdating = false,
  className
}) => {
  const { data: tables = [] } = useTablesWithStates();
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
  const [editFecha, setEditFecha] = useState(reservationDetail.fecha_reserva);
  const [editHora, setEditHora] = useState(reservationDetail.hora_reserva);
  const [experienceNote, setExperienceNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  
  // Estados para edición de detalles de reserva
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editPersonas, setEditPersonas] = useState(reservationDetail.numero_personas);
  const [editPeticiones, setEditPeticiones] = useState(reservationDetail.peticiones_especiales || '');
  const [editAlergias, setEditAlergias] = useState(reservationDetail.alergias_comunicadas || '');
  const [editZona, setEditZona] = useState(reservationDetail.zona_preferida);

  // Mapeo de zonas según configuración actual del restaurante
  const ZONE_NAMES = {
    1: "Exterior", // Zona exterior/terraza
    2: "Interior"  // Zona interior/sala
  };

  const handleSaveDateTime = () => {
    onEditDateTime(editFecha, editHora);
    setIsEditingDateTime(false);
  };

  const handleCancelDateTime = () => {
    setEditFecha(reservationDetail.fecha_reserva);
    setEditHora(reservationDetail.hora_reserva);
    setIsEditingDateTime(false);
  };

  const handleSaveDetails = () => {
    if (onEditReservationDetails) {
      onEditReservationDetails({
        numero_personas: editPersonas,
        peticiones_especiales: editPeticiones.trim() || undefined,
        alergias_comunicadas: editAlergias.trim() || undefined,
        zona_preferida: editZona
      });
    }
    setIsEditingDetails(false);
  };

  const handleCancelDetails = () => {
    setEditPersonas(reservationDetail.numero_personas);
    setEditPeticiones(reservationDetail.peticiones_especiales || '');
    setEditAlergias(reservationDetail.alergias_comunicadas || '');
    setEditZona(reservationDetail.zona_preferida);
    setIsEditingDetails(false);
  };

  const handleAddNote = () => {
    if (experienceNote.trim()) {
      onAddExperienceNote(experienceNote);
      setExperienceNote('');
      setShowAddNote(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_progreso':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      case 'en_progreso':
        return 'En Progreso';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada':
        return <Check size={16} />;
      case 'pendiente':
        return <Clock size={16} />;
      case 'cancelada':
        return <X size={16} />;
      case 'completada':
        return <Star size={16} />;
      case 'en_progreso':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className={cn("p-0 xl:p-6 space-y-4 xl:space-y-6 min-h-full", className)}>
      {/* Header Status */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
            getStatusColor(reservationDetail.estado)
          )}>
            {getStatusIcon(reservationDetail.estado)}
          </div>
        </div>
        
        <h2 className="ios-text-title2 font-bold text-enigma-neutral-900 mb-2">
          {reservationDetail.nombre_reserva}
        </h2>
        
        <IOSBadge 
          variant="default" 
          className={cn("text-sm px-3 py-1", getStatusColor(reservationDetail.estado))}
        >
          {getStatusLabel(reservationDetail.estado)}
        </IOSBadge>
      </div>

      {/* Reservation Details */}
      <div className="space-y-4">
        {/* Date & Time */}
        <div className="bg-white xl:bg-enigma-neutral-50 rounded-2xl xl:rounded-xl p-4 xl:p-4 border border-gray-200/50 xl:border-enigma-neutral-200 shadow-sm xl:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
              Fecha y Hora
            </h3>
            <TouchOptimizedCTA
              variant="ghost"
              size="sm"
              icon={Edit2}
              onClick={() => setIsEditingDateTime(true)}
              className="text-enigma-primary"
            />
          </div>
          
          {isEditingDateTime ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ios-text-caption1 font-medium text-enigma-neutral-700 mb-1 block">
                    Fecha
                  </label>
                  <Input
                    type="date"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                    className="ios-input"
                  />
                </div>
                <div>
                  <label className="ios-text-caption1 font-medium text-enigma-neutral-700 mb-1 block">
                    Hora
                  </label>
                  <Input
                    type="time"
                    value={editHora}
                    onChange={(e) => setEditHora(e.target.value)}
                    className="ios-input"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <TouchOptimizedCTA
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDateTime}
                  className="flex-1"
                >
                  Cancelar
                </TouchOptimizedCTA>
                <TouchOptimizedCTA
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDateTime}
                  icon={Check}
                  className="flex-1"
                  disabled={isUpdating}
                >
                  Guardar
                </TouchOptimizedCTA>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-enigma-neutral-500" />
                <span className="ios-text-body font-medium text-enigma-neutral-900">
                  {format(new Date(reservationDetail.fecha_reserva), 'EEEE, dd MMMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-enigma-neutral-500" />
                <span className="ios-text-body font-medium text-enigma-neutral-900">
                  {formatReservationTime(reservationDetail.hora_reserva)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reservation Details - Expandido con edición */}
        <div className="bg-white xl:bg-enigma-neutral-50 rounded-2xl xl:rounded-xl p-4 xl:p-4 border border-gray-200/50 xl:border-enigma-neutral-200 shadow-sm xl:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
              Detalles de la Reserva
            </h3>
            {onEditReservationDetails && (
              <TouchOptimizedCTA
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => setIsEditingDetails(true)}
                className="text-enigma-primary"
                disabled={isEditingDetails}
              />
            )}
          </div>

          {isEditingDetails ? (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* Número de personas */}
              <div>
                <label className="ios-text-caption1 sm:ios-text-callout font-medium text-enigma-neutral-700 mb-2 flex items-center gap-2">
                  <Users size={14} className="sm:size-4" />
                  Número de comensales
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={editPersonas}
                  onChange={(e) => setEditPersonas(parseInt(e.target.value) || 1)}
                  className="ios-input min-h-[48px]"
                />
              </div>

              {/* Zona preferida */}
              <div>
                <label className="ios-text-caption1 sm:ios-text-callout font-medium text-enigma-neutral-700 mb-2 flex items-center gap-2">
                  <MapPin size={14} className="sm:size-4" />
                  Zona preferida
                </label>
                <Select onValueChange={(value) => setEditZona(parseInt(value))} value={editZona?.toString()}>
                  <SelectTrigger className="ios-select min-h-[48px] text-base sm:text-sm">
                    <SelectValue placeholder="Seleccionar zona (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    <SelectItem value="1" className="min-h-[48px] text-base sm:text-sm cursor-pointer">Exterior</SelectItem>
                    <SelectItem value="2" className="min-h-[48px] text-base sm:text-sm cursor-pointer">Interior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Peticiones especiales */}
              <div>
                <label className="ios-text-caption1 sm:ios-text-callout font-medium text-enigma-neutral-700 mb-2 flex items-center gap-2">
                  <MessageSquare size={14} className="sm:size-4" />
                  Peticiones especiales
                </label>
                <Textarea
                  value={editPeticiones}
                  onChange={(e) => setEditPeticiones(e.target.value)}
                  placeholder="Comentarios adicionales, solicitudes especiales..."
                  className="ios-textarea resize-none min-h-[80px]"
                  rows={3}
                />
              </div>

              {/* Alergias comunicadas */}
              <div>
                <label className="ios-text-caption1 sm:ios-text-callout font-medium text-enigma-neutral-700 mb-2 flex items-center gap-2">
                  <Utensils size={14} className="sm:size-4" />
                  Alergias y restricciones
                </label>
                <Textarea
                  value={editAlergias}
                  onChange={(e) => setEditAlergias(e.target.value)}
                  placeholder="Ej: Sin gluten, vegetariano, alergias..."
                  className="ios-textarea resize-none min-h-[60px]"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2 sm:pt-4">
                <TouchOptimizedCTA
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDetails}
                  className="flex-1 min-h-[48px] sm:min-h-[52px] text-base sm:text-sm"
                >
                  Cancelar
                </TouchOptimizedCTA>
                <TouchOptimizedCTA
                  variant="primary"
                  size="sm"
                  onClick={handleSaveDetails}
                  icon={Check}
                  className="flex-1 min-h-[48px] sm:min-h-[52px] text-base sm:text-sm"
                  disabled={isUpdating}
                >
                  Guardar Cambios
                </TouchOptimizedCTA>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Comensales y Mesa */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-enigma-primary/10 rounded-full flex items-center justify-center">
                    <Users size={20} className="text-enigma-primary" />
                  </div>
                  <span className="ios-text-body font-medium text-enigma-neutral-900">
                    {reservationDetail.numero_personas} comensales
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Table size={20} className="text-blue-600" />
                    </div>
                    <span className="ios-text-body font-medium text-enigma-neutral-900">
                      {reservationDetail.mesa_id 
                        ? (() => {
                            const mesa = tables.find(t => t.id.toString() === reservationDetail.mesa_id.toString());
                            return mesa 
                              ? getTableDisplayNameFromData(mesa.numero_mesa, mesa.zona_id)
                              : `Mesa ${reservationDetail.mesa_id}`;
                          })()
                        : 'Sin mesa asignada'
                      }
                    </span>
                  </div>
                  
                  <QuickTableAssignment
                    reservationId={reservationDetail.id}
                    currentTableId={reservationDetail.mesa_id}
                    reservationSize={reservationDetail.numero_personas}
                    onTableAssigned={onTableAssigned}
                  />
                </div>

                {/* Zona preferida */}
                {reservationDetail.zona_preferida && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                      <MapPin size={20} className="text-orange-600" />
                    </div>
                    <span className="ios-text-body font-medium text-enigma-neutral-900">
                      Zona preferida: {ZONE_NAMES[reservationDetail.zona_preferida] || `Zona ${reservationDetail.zona_preferida}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Peticiones especiales - Prominente */}
              {(reservationDetail.peticiones_especiales || reservationDetail.alergias_comunicadas) && (
                <div className="mt-4 p-4 bg-gradient-to-r from-enigma-accent/5 to-enigma-accent/10 rounded-xl border border-enigma-accent/20">
                  <h4 className="ios-text-callout font-semibold text-enigma-accent mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Información Especial
                  </h4>
                  <div className="space-y-3">
                    {reservationDetail.peticiones_especiales && (
                      <div>
                        <span className="ios-text-caption1 font-medium text-enigma-neutral-700 block mb-1">
                          Peticiones especiales:
                        </span>
                        <p className="ios-text-footnote text-enigma-neutral-800 leading-relaxed">
                          {reservationDetail.peticiones_especiales}
                        </p>
                      </div>
                    )}
                    {reservationDetail.alergias_comunicadas && (
                      <div>
                        <span className="ios-text-caption1 font-medium text-enigma-neutral-700 block mb-1">
                          Alergias y restricciones:
                        </span>
                        <p className="ios-text-footnote text-enigma-neutral-800 leading-relaxed">
                          {reservationDetail.alergias_comunicadas}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu Selections - Prominent Display */}
        {(() => {
          const { vinos, platos, totalEstimado } = extraerSeleccionesMenu(reservationDetail.datos_adicionales);
          const hasMenuSelections = vinos.length > 0 || platos.length > 0;
          
          if (!hasMenuSelections) return null;
          
          return (
            <div className="bg-white xl:bg-gradient-to-br xl:from-enigma-primary/5 xl:to-enigma-secondary/5 rounded-2xl xl:rounded-xl p-4 md:p-6 border border-gray-200/50 xl:border-enigma-primary/20 shadow-sm xl:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h3 className="ios-text-callout md:ios-text-body font-bold text-enigma-neutral-900 flex items-center gap-3">
                  <div className="w-10 h-10 xl:w-8 xl:h-8 bg-enigma-primary/10 rounded-full flex items-center justify-center">
                    <ChefHat size={20} className="xl:size-4 text-enigma-primary" />
                  </div>
                  Menú Seleccionado
                </h3>
                {totalEstimado > 0 && (
                  <div className="flex items-center gap-2 bg-enigma-accent px-4 py-2 xl:px-3 xl:py-1 rounded-full shadow-sm">
                    <Euro size={16} className="xl:size-3 text-white" />
                    <span className="ios-text-footnote xl:ios-text-callout font-bold text-white">
                      {totalEstimado.toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Platos */}
                {platos.length > 0 && (
                  <div className="bg-white xl:bg-white/80 rounded-xl xl:rounded-lg p-4 border border-gray-100 xl:border-0 shadow-sm xl:shadow-none">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-enigma-primary/10 rounded-full flex items-center justify-center">
                        <ChefHat size={16} className="text-enigma-primary" />
                      </div>
                      <span className="ios-text-footnote md:ios-text-callout font-semibold text-enigma-neutral-800">
                        Platos ({platos.length})
                      </span>
                    </div>
                    <div className="space-y-3 xl:space-y-2">
                      {platos.map((plato, index) => (
                        <div key={index} className="flex justify-between items-center py-2 xl:py-1 px-3 xl:px-0 bg-gray-50 xl:bg-transparent rounded-lg xl:rounded-none">
                          <span className="ios-text-footnote xl:ios-text-caption1 text-enigma-neutral-700 font-medium">
                            • {plato.name}
                          </span>
                          <span className="ios-text-footnote xl:ios-text-caption1 font-bold text-enigma-primary">
                            €{plato.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Vinos */}
                {vinos.length > 0 && (
                  <div className="bg-white xl:bg-white/80 rounded-xl xl:rounded-lg p-4 border border-gray-100 xl:border-0 shadow-sm xl:shadow-none">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                        <Wine size={16} className="text-red-600" />
                      </div>
                      <span className="ios-text-footnote md:ios-text-callout font-semibold text-enigma-neutral-800">
                        Vinos ({vinos.length})
                      </span>
                    </div>
                    <div className="space-y-3 xl:space-y-2">
                      {vinos.map((vino, index) => (
                        <div key={index} className="flex justify-between items-start py-2 xl:py-1 px-3 xl:px-0 bg-gray-50 xl:bg-transparent rounded-lg xl:rounded-none">
                          <div className="flex-1 min-w-0">
                            <span className="ios-text-footnote xl:ios-text-caption1 text-enigma-neutral-700 font-medium block">
                              • {vino.name}
                            </span>
                            <span className="ios-text-caption2 text-enigma-neutral-500">
                              {vino.winery} - {vino.wine_type}
                            </span>
                          </div>
                          <span className="ios-text-footnote xl:ios-text-caption1 font-bold text-red-600 ml-2">
                            €{vino.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Info note for staff */}
              <div className="mt-4 p-3 bg-enigma-secondary/10 rounded-lg border border-enigma-secondary/20">
                <p className="ios-text-caption1 text-enigma-secondary text-center font-medium">
                  💡 Productos pre-seleccionados por el cliente al reservar
                </p>
              </div>
            </div>
          );
        })()}

        {/* Comments */}
        {reservationDetail.comentarios && (
          <div className="bg-enigma-neutral-50 rounded-xl p-4 border border-enigma-neutral-200">
            <h3 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-2">
              Comentarios
            </h3>
            <p className="ios-text-footnote text-enigma-neutral-700 leading-relaxed">
              {reservationDetail.comentarios}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Moved to right panel */}
      <div className="space-y-4">
        
        {/* Experience Note */}
        {showAddNote ? (
          <div className="bg-enigma-neutral-50 rounded-xl p-4 border border-enigma-neutral-200">
            <h3 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-3">
              Agregar Nota de Experiencia
            </h3>
            <div className="space-y-3">
              <textarea
                value={experienceNote}
                onChange={(e) => setExperienceNote(e.target.value)}
                placeholder="Describe la experiencia del cliente..."
                className="ios-textarea w-full min-h-[80px] resize-none"
              />
              <div className="flex gap-2">
                <TouchOptimizedCTA
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddNote(false)}
                  className="flex-1"
                >
                  Cancelar
                </TouchOptimizedCTA>
                <TouchOptimizedCTA
                  variant="primary"
                  size="sm"
                  onClick={handleAddNote}
                  icon={Check}
                  className="flex-1"
                  disabled={!experienceNote.trim() || isUpdating}
                >
                  Agregar
                </TouchOptimizedCTA>
              </div>
            </div>
          </div>
        ) : (
          <TouchOptimizedCTA
            variant="ghost"
            size="md"
            icon={Star}
            onClick={() => setShowAddNote(true)}
            className="w-full text-enigma-primary"
          >
            Agregar Nota de Experiencia
          </TouchOptimizedCTA>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-enigma-neutral-200">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="ios-text-caption2 text-enigma-neutral-500">ID:</span>
            <span className="ios-text-caption2 text-enigma-neutral-600 font-medium">
              #{reservationDetail.id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="ios-text-caption2 text-enigma-neutral-500">Creada:</span>
            <span className="ios-text-caption2 text-enigma-neutral-600 font-medium">
              {format(new Date(reservationDetail.created_at), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="ios-text-caption2 text-enigma-neutral-500">Actualizada:</span>
            <span className="ios-text-caption2 text-enigma-neutral-600 font-medium">
              {format(new Date(reservationDetail.updated_at), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationStatusPanel;