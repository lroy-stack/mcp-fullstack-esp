import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatReservationTime } from '@/utils/dateUtils';
import { Clock, Users, Plus } from 'lucide-react';
import { QuickTimelineReservationModal } from './QuickTimelineReservationModal';
import { useCalendarResponsive } from '@/hooks/useCalendarResponsive';

interface TimelineSlot {
  time: string;
  label: string;
  type: 'lunch' | 'dinner' | 'break';
  available: boolean;
}

interface ReservationData {
  id: number;
  hora_reserva: string;
  nombre_reserva: string;
  numero_personas: number;
}

interface TimelineDayProps {
  day: Date;
  reservations: ReservationData[];
  onCreateReservation?: (date: string, time: string) => void;
  onReservationSuccess?: () => void;
  onReservationClick?: (reservationId: number) => void;
}

export const TimelineDay: React.FC<TimelineDayProps> = ({ 
  day, 
  reservations,
  onCreateReservation,
  onReservationSuccess,
  onReservationClick 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { isMobile } = useCalendarResponsive();

  // Debug: Mostrar datos de reservas recibidas
  useEffect(() => {
    console.log('📊 TimelineDay - Reservas recibidas:', reservations.length);
    console.log('📊 Detalle de reservas:', reservations.map(r => ({
      id: r.id,
      nombre: r.nombre_reserva,
      hora_original: r.hora_reserva,
      hora_formateada: formatReservationTime(r.hora_reserva),
      personas: r.numero_personas
    })));
  }, [reservations]);

  // Horarios reales del restaurante con intervalos de 15 minutos
  const timeSlots: TimelineSlot[] = [
    // Turno de comida: 13:00 - 16:00 (intervalos de 15 min)
    { time: '13:00', label: 'Comida', type: 'lunch', available: true },
    { time: '13:15', label: '', type: 'lunch', available: true },
    { time: '13:30', label: '', type: 'lunch', available: true },
    { time: '13:45', label: '', type: 'lunch', available: true },
    { time: '14:00', label: '', type: 'lunch', available: true },
    { time: '14:15', label: '', type: 'lunch', available: true },
    { time: '14:30', label: '', type: 'lunch', available: true },
    { time: '14:45', label: '', type: 'lunch', available: true },
    { time: '15:00', label: '', type: 'lunch', available: true },
    { time: '15:15', label: '', type: 'lunch', available: true },
    { time: '15:30', label: '', type: 'lunch', available: true },
    { time: '15:45', label: '', type: 'lunch', available: true },
    
    // Descanso: 16:00 - 18:30
    { time: '16:00', label: 'Descanso', type: 'break', available: false },
    { time: '16:15', label: '', type: 'break', available: false },
    { time: '16:30', label: '', type: 'break', available: false },
    { time: '16:45', label: '', type: 'break', available: false },
    { time: '17:00', label: '', type: 'break', available: false },
    { time: '17:15', label: '', type: 'break', available: false },
    { time: '17:30', label: '', type: 'break', available: false },
    { time: '17:45', label: '', type: 'break', available: false },
    { time: '18:00', label: '', type: 'break', available: false },
    { time: '18:15', label: '', type: 'break', available: false },
    
    // Turno de cena: 18:30 - 23:00 (intervalos de 15 min)
    { time: '18:30', label: 'Cena', type: 'dinner', available: true },
    { time: '18:45', label: '', type: 'dinner', available: true },
    { time: '19:00', label: '', type: 'dinner', available: true },
    { time: '19:15', label: '', type: 'dinner', available: true },
    { time: '19:30', label: '', type: 'dinner', available: true },
    { time: '19:45', label: '', type: 'dinner', available: true },
    { time: '20:00', label: '', type: 'dinner', available: true },
    { time: '20:15', label: '', type: 'dinner', available: true },
    { time: '20:30', label: '', type: 'dinner', available: true },
    { time: '20:45', label: '', type: 'dinner', available: true },
    { time: '21:00', label: '', type: 'dinner', available: true },
    { time: '21:15', label: '', type: 'dinner', available: true },
    { time: '21:30', label: '', type: 'dinner', available: true },
    { time: '21:45', label: '', type: 'dinner', available: true },
    { time: '22:00', label: '', type: 'dinner', available: true },
    { time: '22:15', label: '', type: 'dinner', available: true },
    { time: '22:30', label: '', type: 'dinner', available: true },
    { time: '22:45', label: '', type: 'dinner', available: true },
  ];

  // Obtener reservas para cada horario con validaciones defensivas
  const getReservationsForTime = (time: string) => {
    return reservations.filter(reserva => {
      // Validaciones defensivas
      if (!reserva.hora_reserva) {
        console.log('⚠️ Reserva sin hora_reserva:', reserva.id, reserva.nombre_reserva);
        return false;
      }
      
      const reservaTime = formatReservationTime(reserva.hora_reserva);
      
      // Verificar si el formateo falló
      if (reservaTime === '--:--' || !reservaTime) {
        console.log('⚠️ Hora malformada en reserva:', reserva.id, 'hora_original:', reserva.hora_reserva);
        return false;
      }
      
      const matches = reservaTime === time;
      if (matches) {
        console.log('✅ Reserva encontrada para slot', time, ':', reserva.id, reserva.nombre_reserva);
      }
      
      return matches;
    });
  };

  // Manejar click para crear reserva
  const handleCreateReservation = (time: string) => {
    if (onCreateReservation && time) {
      // Si se proporciona la función Y hay tiempo específico, usarla (compatibilidad hacia atrás)
      const dateString = format(day, 'yyyy-MM-dd');
      onCreateReservation(dateString, time);
    } else {
      // Usar el modal por defecto - si no hay tiempo, dejar vacío para que el usuario elija
      setSelectedTime(time);
      setIsModalOpen(true);
    }
  };

  // Manejar éxito de reserva
  const handleReservationSuccess = () => {
    setIsModalOpen(false);
    setSelectedTime('');
    if (onReservationSuccess) {
      onReservationSuccess();
    }
  };

  const getSlotColor = (slot: TimelineSlot) => {
    if (!slot.available) {
      return {
        bg: 'var(--enigma-neutral-100)',
        border: 'var(--enigma-neutral-200)',
        text: 'var(--enigma-neutral-400)'
      };
    }
    
    switch (slot.type) {
      case 'lunch':
        return {
          bg: '#CB591010',
          border: 'var(--enigma-accent)',
          text: 'var(--enigma-accent)'
        };
      case 'dinner':
        return {
          bg: '#23758410',
          border: 'var(--enigma-primary)',
          text: 'var(--enigma-primary)'
        };
      default:
        return {
          bg: 'white',
          border: 'var(--enigma-neutral-200)',
          text: 'var(--enigma-neutral-500)'
        };
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header del día */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--enigma-neutral-200)' }}>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--enigma-primary)' }}>
              {format(day, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </h3>
            <p className="text-sm" style={{ color: 'var(--enigma-neutral-500)' }}>
              {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} programadas
            </p>
          </div>
          <button
            onClick={() => handleCreateReservation('')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: 'var(--enigma-primary)' }}
          >
            <Plus size={16} />
            Nueva Reserva
          </button>
        </div>

      {/* Timeline Responsive */}
      <div className="flex-1 overflow-auto p-4">
        {isMobile ? (
          // Vista Vertical para Móvil
          <div 
            className="timeline-grid-mobile"
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr',
              gap: '1px',
              minHeight: '100%'
            }}
          >
            {timeSlots.map((slot, index) => {
              const slotReservations = getReservationsForTime(slot.time);
              const colors = getSlotColor(slot);
              
              return (
                <React.Fragment key={slot.time}>
                  {/* Columna de tiempo - Móvil */}
                  <div 
                    className="flex flex-col items-center justify-center p-3 rounded-l-lg border"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                      minHeight: '60px'
                    }}
                  >
                    <span className="text-sm font-bold">{slot.time}</span>
                    {slot.label && (
                      <span className="text-xs mt-1 opacity-70">{slot.label}</span>
                    )}
                  </div>

                  {/* Columna de reservas - Móvil */}
                  <div 
                    className="p-3 border rounded-r-lg relative group"
                    style={{
                      backgroundColor: slotReservations.length > 0 ? colors.bg : 'white',
                      borderColor: colors.border,
                      minHeight: '60px'
                    }}
                  >
                    {slotReservations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {slotReservations.map((reserva) => (
                          <button
                            key={reserva.id}
                            onClick={(e) => {
                              console.log('🖱️ Click en reserva - ID:', reserva.id, 'Handler existe:', !!onReservationClick);
                              e.preventDefault();
                              e.stopPropagation();
                              if (onReservationClick) {
                                onReservationClick(reserva.id);
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm hover:shadow-md transition-all"
                            style={{
                              backgroundColor: 'white',
                              borderColor: colors.border,
                              color: colors.text
                            }}
                          >
                            <span className="font-medium">{reserva.nombre_reserva}</span>
                            <div className="flex items-center gap-1 text-xs opacity-70">
                              <Users size={12} />
                              {reserva.numero_personas}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      slot.available && (
                        <button
                          onClick={() => handleCreateReservation(slot.time)}
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-r-lg"
                          style={{ backgroundColor: colors.bg }}
                        >
                          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.text }}>
                            <Plus size={14} />
                            Crear reserva
                          </div>
                        </button>
                      )
                    )}

                    {!slot.available && slotReservations.length === 0 && (
                      <div className="flex items-center justify-center h-full text-sm opacity-50">
                        Horario cerrado
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          // Vista Horizontal para Tablet/Desktop
          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'
            }}
          >
            {timeSlots.map((slot) => {
              const slotReservations = getReservationsForTime(slot.time);
              const colors = getSlotColor(slot);
              
              return (
                <div
                  key={slot.time}
                  className="border rounded-lg relative group overflow-hidden"
                  style={{
                    backgroundColor: slotReservations.length > 0 ? colors.bg : 'white',
                    borderColor: colors.border,
                    minHeight: '140px'
                  }}
                >
                  {/* Header con hora dentro de cada tarjeta */}
                  <div 
                    className="p-3 border-b flex flex-col items-center justify-center"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                      minHeight: '50px'
                    }}
                  >
                    <span className="text-sm font-bold">{slot.time}</span>
                    {slot.label && (
                      <span className="text-xs mt-1 opacity-70">{slot.label}</span>
                    )}
                  </div>

                  {/* Contenido de reservas */}
                  <div className="p-3 flex-1">
                    {slotReservations.length > 0 ? (
                      <div className="space-y-2">
                        {slotReservations.map((reserva) => (
                          <button
                            key={reserva.id}
                            onClick={(e) => {
                              console.log('🖱️ Click en reserva - ID:', reserva.id, 'Handler existe:', !!onReservationClick);
                              e.preventDefault();
                              e.stopPropagation();
                              if (onReservationClick) {
                                onReservationClick(reserva.id);
                              }
                            }}
                            className="w-full flex flex-col gap-1 px-2 py-2 rounded-lg border text-sm hover:shadow-md transition-all"
                            style={{
                              backgroundColor: 'white',
                              borderColor: colors.border,
                              color: colors.text
                            }}
                          >
                            <span className="font-medium truncate text-xs">{reserva.nombre_reserva}</span>
                            <div className="flex items-center justify-center gap-1 text-xs opacity-70">
                              <Users size={10} />
                              {reserva.numero_personas}
                            </div>
                          </button>
                        ))}
                        {/* Botón + para slots ocupados */}
                        <button
                          onClick={() => handleCreateReservation(slot.time)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          style={{ backgroundColor: colors.text }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      slot.available ? (
                        <button
                          onClick={() => handleCreateReservation(slot.time)}
                          className="absolute inset-x-3 inset-y-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                          style={{ backgroundColor: colors.bg }}
                        >
                          <div className="flex flex-col items-center gap-1 text-xs font-medium" style={{ color: colors.text }}>
                            <Plus size={16} />
                            <span>Crear reserva</span>
                          </div>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs opacity-50">
                          Cerrado
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Modal de reserva rápida */}
      <QuickTimelineReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={day}
        selectedTime={selectedTime}
        onSuccess={handleReservationSuccess}
      />
    </>
  );
};