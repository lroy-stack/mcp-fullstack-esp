import React from 'react';
import { IOSBadge } from '@/components/ui/ios-badge';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface AvailabilityIndicatorProps {
  totalCapacity: number;
  currentOccupancy: number;
  timeSlot: string;
  reservationCount: number;
  className?: string;
}

export function AvailabilityIndicator({ 
  totalCapacity, 
  currentOccupancy, 
  timeSlot,
  reservationCount,
  className = "" 
}: AvailabilityIndicatorProps) {
  const occupancyPercentage = (currentOccupancy / totalCapacity) * 100;
  
  const getAvailabilityStatus = () => {
    if (occupancyPercentage === 0) {
      return {
        status: 'available',
        label: 'Disponible',
        color: '#9FB289',
        icon: CheckCircle,
        description: 'Totalmente libre'
      };
    } else if (occupancyPercentage <= 50) {
      return {
        status: 'low',
        label: 'Disponible',
        color: '#34C759',
        icon: CheckCircle,
        description: 'Buena disponibilidad'
      };
    } else if (occupancyPercentage <= 75) {
      return {
        status: 'moderate',
        label: 'Moderado',
        color: '#FF9500',
        icon: Clock,
        description: 'Disponibilidad limitada'
      };
    } else if (occupancyPercentage < 100) {
      return {
        status: 'busy',
        label: 'Ocupado',
        color: '#CB5910',
        icon: AlertCircle,
        description: 'Casi completo'
      };
    } else {
      return {
        status: 'full',
        label: 'Completo',
        color: '#FF3B30',
        icon: AlertCircle,
        description: 'Sin disponibilidad'
      };
    }
  };

  const availability = getAvailabilityStatus();
  const IconComponent = availability.icon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Indicador visual principal */}
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${availability.color}20` }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: availability.color }}
          />
        </div>
        
        <IOSBadge 
          variant="custom" 
          size="sm"
          style={{ 
            backgroundColor: `${availability.color}15`,
            color: availability.color,
            borderColor: `${availability.color}30`
          }}
        >
          <IconComponent size={12} className="mr-1" />
          {availability.label}
        </IOSBadge>
      </div>

      {/* Información detallada */}
      <div className="text-right">
        <div className="flex items-center gap-1 text-enigma-neutral-600">
          <Users size={12} />
          <span className="ios-text-caption1">
            {currentOccupancy}/{totalCapacity}
          </span>
        </div>
        
        {reservationCount > 0 && (
          <span className="ios-text-caption2 text-enigma-neutral-500">
            {reservationCount} reserva{reservationCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="flex-1 max-w-20">
        <div className="w-full h-2 bg-enigma-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${Math.min(occupancyPercentage, 100)}%`,
              backgroundColor: availability.color
            }}
          />
        </div>
        <div className="ios-text-caption2 text-enigma-neutral-500 text-center mt-1">
          {Math.round(occupancyPercentage)}%
        </div>
      </div>
    </div>
  );
}

// Componente simplificado para espacios más pequeños
export function CompactAvailabilityIndicator({ 
  totalCapacity, 
  currentOccupancy, 
  className = "" 
}: Omit<AvailabilityIndicatorProps, 'timeSlot' | 'reservationCount'>) {
  const occupancyPercentage = (currentOccupancy / totalCapacity) * 100;
  
  const getColor = () => {
    if (occupancyPercentage === 0) return '#9FB289';
    if (occupancyPercentage <= 50) return '#34C759';
    if (occupancyPercentage <= 75) return '#FF9500';
    if (occupancyPercentage < 100) return '#CB5910';
    return '#FF3B30';
  };

  const color = getColor();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="ios-text-caption1 text-enigma-neutral-600">
        {currentOccupancy}/{totalCapacity}
      </span>
    </div>
  );
}