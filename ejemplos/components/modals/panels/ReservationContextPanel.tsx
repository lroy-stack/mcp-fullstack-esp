import React, { useState } from 'react';
import { MessageSquare, AlertCircle, Clock, Users, MapPin, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import { TouchOptimizedCTA } from '@/components/ui/touch-optimized-cta';
import { IOSBadge } from '@/components/ui/ios-badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatReservationTime } from '@/utils/dateUtils';
import { StateActionButtons } from '../StateActionButtons';

interface ReservationContextPanelProps {
  reservationDetail: {
    id: number;
    origen?: string;
    fecha_reserva: string;
    hora_reserva: string;
    numero_personas: number;
    nombre_reserva: string;
    telefono_reserva?: string;
    email_reserva?: string;
    peticiones_especiales?: string;
    datos_adicionales?: any;
    mesa_id?: number;
    zona_preferida?: string;
    ocasion_especial?: string;
    alergias_comunicadas?: string;
    estado: string;
    created_at: string;
    updated_at: string;
  };
  onUpdateStatus?: (status: string) => void;
  onDeleteReservation?: () => void;
  isUpdating?: boolean;
  className?: string;
}

export const ReservationContextPanel: React.FC<ReservationContextPanelProps> = ({
  reservationDetail,
  onUpdateStatus,
  onDeleteReservation,
  isUpdating = false,
  className
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  // No longer need state for expanded/collapsed menu sections

  const getOriginColor = (origin: string) => {
    switch (origin) {
      case 'web':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'whatsapp':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'telefono':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'email':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'presencial':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'asistente_ia':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOriginIcon = (origin: string) => {
    switch (origin) {
      case 'web':
        return '🌐';
      case 'whatsapp':
        return '📱';
      case 'telefono':
        return '📞';
      case 'email':
        return '📧';
      case 'presencial':
        return '🏪';
      case 'asistente_ia':
        return '🤖';
      default:
        return '❓';
    }
  };

  const getOriginLabel = (origin: string) => {
    switch (origin) {
      case 'web':
        return 'Reserva Web';
      case 'whatsapp':
        return 'WhatsApp';
      case 'telefono':
        return 'Teléfono';
      case 'email':
        return 'Email';
      case 'presencial':
        return 'Presencial';
      case 'asistente_ia':
        return 'Asistente IA';
      default:
        return origin;
    }
  };


  return (
    <div className={cn("p-0 xl:p-6 xl:bg-enigma-neutral-50 space-y-4 xl:space-y-6 min-h-full", className)}>
      {/* Origin & Source */}
      <div className="space-y-3">
        <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
          Información del Canal
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span className="text-lg">{getOriginIcon(reservationDetail.origen)}</span>
          </div>
          <div className="flex-1">
            <IOSBadge 
              variant="default" 
              className={cn("text-xs", getOriginColor(reservationDetail.origen))}
            >
              {getOriginLabel(reservationDetail.origen)}
            </IOSBadge>
            <p className="ios-text-caption2 text-enigma-neutral-600 mt-1">
              {format(new Date(reservationDetail.created_at), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>


      {/* Special Requirements */}
      {(reservationDetail.ocasion_especial || reservationDetail.zona_preferida) && (
        <div className="space-y-3">
          <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
            Requisitos Especiales
          </h3>
          
          <div className="space-y-2">
            {reservationDetail.ocasion_especial && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-enigma-neutral-500" />
                <span className="ios-text-caption1 text-enigma-neutral-700">
                  {reservationDetail.ocasion_especial}
                </span>
              </div>
            )}
            
            {reservationDetail.zona_preferida && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-enigma-neutral-500" />
                <span className="ios-text-caption1 text-enigma-neutral-700">
                  Zona: {reservationDetail.zona_preferida}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Allergies & Dietary Notes */}
      {reservationDetail.alergias_comunicadas && (
        <div className="space-y-3">
          <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
            Alergias y Restricciones
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="ios-text-caption1 font-medium text-yellow-800 mb-1">
                  ⚠️ Importante para Cocina
                </p>
                <p className="ios-text-caption2 text-yellow-700">
                  {reservationDetail.alergias_comunicadas}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Additional Comments */}
      {reservationDetail.peticiones_especiales && (
        <div className="space-y-3">
          <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
            Peticiones Especiales
          </h3>
          
          <div className="bg-white rounded-lg border border-enigma-neutral-200 p-3">
            <div className="flex items-start gap-2">
              <MessageSquare size={16} className="text-enigma-neutral-500 mt-0.5 flex-shrink-0" />
              <p className="ios-text-caption1 text-enigma-neutral-700 leading-relaxed">
                {reservationDetail.peticiones_especiales}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Primary Actions */}
      {onUpdateStatus && (
        <div className="bg-white xl:bg-transparent rounded-2xl xl:rounded-none p-4 xl:p-0 border border-gray-200/50 xl:border-0 shadow-sm xl:shadow-none space-y-3">
          <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
            Acciones de Reserva
          </h3>
          
          <StateActionButtons
            currentStatus={reservationDetail.estado}
            onStatusUpdate={onUpdateStatus}
            loading={isUpdating}
            reservationId={reservationDetail.id}
          />
        </div>
      )}

      {/* Delete Reservation */}
      {onDeleteReservation && (
        <div className="bg-white xl:bg-transparent rounded-2xl xl:rounded-none p-4 xl:p-0 border border-gray-200/50 xl:border-0 shadow-sm xl:shadow-none space-y-3">
          <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
            Zona de Peligro
          </h3>
          
          {!showDeleteConfirmation ? (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200/50">
              <TouchOptimizedCTA
                variant="destructive"
                size="lg"
                icon={Trash2}
                iconPosition="left"
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full justify-start min-h-[56px] text-base font-medium shadow-sm"
              >
                Eliminar Reserva
              </TouchOptimizedCTA>
              <p className="ios-text-caption1 text-red-600 mt-3 text-center font-medium">
                Esta acción no se puede deshacer
              </p>
            </div>
          ) : (
            <div className="bg-red-50 rounded-xl p-5 border border-red-200/50 space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
                <p className="ios-text-body font-bold text-red-800 mb-3">
                  ¿Confirmar eliminación?
                </p>
                <p className="ios-text-footnote text-red-600 leading-relaxed">
                  Esta acción eliminará permanentemente la reserva de {reservationDetail.nombre_reserva}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <TouchOptimizedCTA
                  variant="outline"
                  size="lg"
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="border-gray-300 text-gray-700 min-h-[52px] font-medium"
                >
                  Cancelar
                </TouchOptimizedCTA>
                <TouchOptimizedCTA
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    onDeleteReservation();
                    setShowDeleteConfirmation(false);
                  }}
                  disabled={isUpdating}
                  className="min-h-[52px] font-medium shadow-md"
                >
                  Eliminar
                </TouchOptimizedCTA>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats - More Prominent */}
      <div className="space-y-3">
        <h3 className="ios-text-callout font-semibold text-enigma-neutral-900">
          Resumen Rápido
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg border border-enigma-neutral-200 p-3 md:p-4 text-center">
            <Users size={20} className="text-enigma-neutral-500 mx-auto mb-2" />
            <div className="ios-text-caption1 text-enigma-neutral-600 mb-1">Comensales</div>
            <div className="ios-text-body font-bold text-enigma-neutral-900">
              {reservationDetail.numero_personas}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-enigma-neutral-200 p-3 md:p-4 text-center">
            <Clock size={20} className="text-enigma-neutral-500 mx-auto mb-2" />
            <div className="ios-text-caption1 text-enigma-neutral-600 mb-1">Hora</div>
            <div className="ios-text-body font-bold text-enigma-neutral-900">
              {formatReservationTime(reservationDetail.hora_reserva)}
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Timeline - Compact */}
      <div className="space-y-2 md:space-y-3">
        <h3 className="ios-text-footnote md:ios-text-callout font-semibold text-enigma-neutral-900">
          Cronología
        </h3>
        
        <div className="bg-white rounded-lg border border-enigma-neutral-200 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="ios-text-caption2 text-enigma-neutral-600">
              Creada: {format(new Date(reservationDetail.created_at), 'dd/MM HH:mm')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-enigma-primary rounded-full flex-shrink-0"></div>
            <span className="ios-text-caption2 text-enigma-neutral-600">
              Reserva: {format(new Date(reservationDetail.fecha_reserva), 'dd/MM')} - {formatReservationTime(reservationDetail.hora_reserva)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationContextPanel;