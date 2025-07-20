import React from 'react';
import { Plus, Clock, Users } from 'lucide-react';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';

interface TimeSlot {
  time: string;
  available: boolean;
  reservations: Array<{
    id: string;
    clientName: string;
    guests: number;
    duration: number;
    status: string;
  }>;
}

interface TimeSlotGridProps {
  date: Date;
  timeSlots: TimeSlot[];
  onSlotClick: (time: string) => void;
  onReservationClick: (reservationId: string) => void;
}

export function TimeSlotGrid({ 
  date, 
  timeSlots, 
  onSlotClick, 
  onReservationClick 
}: TimeSlotGridProps) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmada': return '#9FB289';
      case 'pendiente_confirmacion': return '#FF9500';
      case 'completada': return '#34C759';
      case 'cancelada_usuario': return '#6B7280';
      case 'cancelada_restaurante': return '#6B7280';
      case 'no_show': return '#FF3B30';
      default: return '#6B7280';
    }
  };

  const getAvailabilityStatus = (slot: TimeSlot) => {
    const totalGuests = slot.reservations.reduce((sum, res) => sum + res.guests, 0);
    const maxCapacity = 50; // Capacidad total del restaurante
    
    if (totalGuests === 0) return { status: 'available', label: 'Disponible', color: '#9FB289' };
    if (totalGuests < maxCapacity * 0.7) return { status: 'moderate', label: 'Disponible', color: '#FF9500' };
    if (totalGuests < maxCapacity) return { status: 'busy', label: 'Ocupado', color: '#CB5910' };
    return { status: 'full', label: 'Completo', color: '#FF3B30' };
  };

  return (
    <div className="space-y-2">
      {timeSlots.map((slot) => {
        const availability = getAvailabilityStatus(slot);
        
        return (
          <div
            key={slot.time}
            className={`
              rounded-ios border-2 transition-all duration-200 group
              ${slot.available 
                ? 'border-enigma-neutral-200 hover:border-enigma-primary/50 cursor-pointer' 
                : 'border-enigma-neutral-100'
              }
              ${slot.reservations.length > 0 ? 'bg-white' : 'bg-enigma-neutral-50/50'}
            `}
          >
            {/* Time Header */}
            <div className="flex items-center justify-between p-4 border-b border-enigma-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-ios bg-enigma-primary/10 flex items-center justify-center">
                  <Clock size={20} className="text-enigma-primary" />
                </div>
                <div>
                  <div className="ios-text-callout font-bold text-enigma-neutral-900">
                    {slot.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <IOSBadge 
                      variant="custom" 
                      size="sm"
                      style={{ 
                        backgroundColor: `${availability.color}20`,
                        color: availability.color,
                        borderColor: `${availability.color}30`
                      }}
                    >
                      {availability.label}
                    </IOSBadge>
                    {slot.reservations.length > 0 && (
                      <span className="ios-text-caption1 text-enigma-neutral-500">
                        {slot.reservations.reduce((sum, res) => sum + res.guests, 0)} comensales
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {slot.available && (
                <IOSButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onSlotClick(slot.time)}
                  className={`
                    flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity
                    text-enigma-primary hover:bg-enigma-primary/10
                  `}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Nueva Reserva</span>
                </IOSButton>
              )}
            </div>

            {/* Reservations */}
            {slot.reservations.length > 0 ? (
              <div className="p-4 space-y-3">
                {slot.reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    onClick={() => onReservationClick(reservation.id)}
                    className="p-3 rounded-ios border cursor-pointer transition-all duration-200 hover:shadow-ios-sm ios-touch-feedback"
                    style={{ 
                      backgroundColor: `${getStatusColor(reservation.status)}10`,
                      borderColor: `${getStatusColor(reservation.status)}30`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStatusColor(reservation.status) }}
                        />
                        <div>
                          <div className="ios-text-callout font-semibold text-enigma-neutral-900">
                            {reservation.clientName}
                          </div>
                          <div className="flex items-center gap-2 ios-text-footnote text-enigma-neutral-600">
                            <Users size={12} />
                            <span>{reservation.guests} personas</span>
                            <span>•</span>
                            <span>{reservation.duration} min</span>
                          </div>
                        </div>
                      </div>
                      
                      <IOSBadge 
                        variant="custom" 
                        size="sm"
                        style={{ 
                          backgroundColor: getStatusColor(reservation.status),
                          color: 'white'
                        }}
                      >
                        {reservation.status === 'confirmada' ? 'Confirmada' :
                         reservation.status === 'pendiente_confirmacion' ? 'Pendiente' :
                         reservation.status === 'completada' ? 'Completada' :
                         reservation.status}
                      </IOSBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty slot
              <div 
                className="p-8 text-center cursor-pointer hover:bg-enigma-primary/5 transition-colors"
                onClick={() => slot.available && onSlotClick(slot.time)}
              >
                <div className="w-12 h-12 rounded-ios bg-enigma-neutral-200 flex items-center justify-center mx-auto mb-3 group-hover:bg-enigma-primary/20 transition-colors">
                  <Plus size={20} className="text-enigma-neutral-400 group-hover:text-enigma-primary transition-colors" />
                </div>
                <p className="ios-text-footnote text-enigma-neutral-500 mb-1">
                  Sin reservas
                </p>
                {slot.available && (
                  <p className="ios-text-caption1 text-enigma-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Click para agregar reserva
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}