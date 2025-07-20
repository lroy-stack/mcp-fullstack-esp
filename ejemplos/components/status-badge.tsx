// Ejemplo: Sistema de Badges de Estado con Colores y Animaciones
// Patrón: Component Variants + Conditional Styling + Animation + TypeScript

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// Configuración de variantes con CVA
const statusBadgeVariants = cva(
  // Clases base
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
  {
    variants: {
      status: {
        // Estados de Mesa
        libre: "bg-green-500 text-white hover:bg-green-600",
        ocupada: "bg-blue-600 text-white hover:bg-blue-700",
        reservada: "bg-orange-500 text-white hover:bg-orange-600",
        limpieza: "bg-yellow-500 text-white hover:bg-yellow-600",
        fuera_servicio: "bg-gray-500 text-white",
        
        // Estados de Reserva
        pendiente: "bg-yellow-400 text-gray-900 hover:bg-yellow-500",
        confirmada: "bg-blue-500 text-white hover:bg-blue-600",
        sentada: "bg-green-600 text-white hover:bg-green-700",
        completada: "bg-green-700 text-white",
        cancelada: "bg-red-500 text-white",
        no_show: "bg-gray-600 text-white",
        
        // Estados Genéricos
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        error: "bg-red-500 text-white hover:bg-red-600",
        info: "bg-blue-500 text-white hover:bg-blue-600",
        neutral: "bg-gray-500 text-white hover:bg-gray-600",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-xs px-2.5 py-1",
        lg: "text-sm px-3 py-1.5",
      },
      variant: {
        solid: "",
        outline: "bg-transparent border-2",
        ghost: "bg-transparent hover:bg-opacity-10",
      },
      pulse: {
        true: "animate-pulse",
        false: "",
      },
      glow: {
        true: "shadow-lg",
        false: "",
      }
    },
    compoundVariants: [
      // Outline variants
      {
        variant: "outline",
        status: "libre",
        class: "border-green-500 text-green-700 hover:bg-green-50",
      },
      {
        variant: "outline", 
        status: "ocupada",
        class: "border-blue-600 text-blue-700 hover:bg-blue-50",
      },
      {
        variant: "outline",
        status: "reservada", 
        class: "border-orange-500 text-orange-700 hover:bg-orange-50",
      },
      {
        variant: "outline",
        status: "pendiente",
        class: "border-yellow-400 text-yellow-700 hover:bg-yellow-50",
      },
      {
        variant: "outline",
        status: "confirmada",
        class: "border-blue-500 text-blue-700 hover:bg-blue-50",
      },
      
      // Ghost variants
      {
        variant: "ghost",
        status: "libre",
        class: "text-green-700 hover:bg-green-100",
      },
      {
        variant: "ghost",
        status: "ocupada", 
        class: "text-blue-700 hover:bg-blue-100",
      },
      
      // Glow effects para estados urgentes
      {
        glow: true,
        status: "reservada",
        class: "shadow-orange-500/50",
      },
      {
        glow: true,
        status: "pendiente",
        class: "shadow-yellow-400/50",
      },
    ],
    defaultVariants: {
      size: "default",
      variant: "solid",
      pulse: false,
      glow: false,
    },
  }
);

// Mapeo de estados a textos localizados
const STATUS_LABELS = {
  // Estados de Mesa
  libre: "Libre",
  ocupada: "Ocupada", 
  reservada: "Reservada",
  limpieza: "Limpieza",
  fuera_servicio: "Fuera de Servicio",
  
  // Estados de Reserva
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  sentada: "Sentada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_show: "No Show",
  
  // Estados Genéricos
  success: "Éxito",
  warning: "Advertencia",
  error: "Error",
  info: "Información",
  neutral: "Neutral",
} as const;

// Interface principal del componente
export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: keyof typeof STATUS_LABELS;
  label?: string; // Override del texto por defecto
  icon?: LucideIcon; // Icono opcional
  showPulse?: boolean; // Override del pulse
  showGlow?: boolean; // Override del glow
  urgencyMinutes?: number; // Para auto-pulse basado en urgencia
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ 
    className, 
    status, 
    size, 
    variant, 
    pulse, 
    glow, 
    label, 
    icon: Icon,
    showPulse,
    showGlow,
    urgencyMinutes,
    ...props 
  }, ref) => {
    // Auto-determinar pulse basado en urgencia
    const shouldPulse = showPulse ?? 
      (urgencyMinutes !== undefined && urgencyMinutes <= 15) ?? 
      pulse;
    
    // Auto-determinar glow basado en estado crítico
    const shouldGlow = showGlow ?? 
      (status === 'reservada' && urgencyMinutes !== undefined && urgencyMinutes <= 30) ??
      glow;
    
    // Determinar texto a mostrar
    const displayLabel = label ?? STATUS_LABELS[status];
    
    return (
      <span
        ref={ref}
        className={cn(
          statusBadgeVariants({ 
            status, 
            size, 
            variant, 
            pulse: shouldPulse, 
            glow: shouldGlow 
          }),
          className
        )}
        {...props}
      >
        {Icon && <Icon className="h-3 w-3" />}
        {displayLabel}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

// Componente especializado para urgencia de reservas
export interface ReservationUrgencyBadgeProps {
  reservationTime: string;
  status: 'pendiente' | 'confirmada' | 'sentada';
  className?: string;
}

export function ReservationUrgencyBadge({ 
  reservationTime, 
  status,
  className 
}: ReservationUrgencyBadgeProps) {
  const now = new Date();
  const reservation = new Date(reservationTime);
  const minutesUntil = Math.floor((reservation.getTime() - now.getTime()) / (1000 * 60));
  
  // Determinar configuración basada en urgencia
  let urgencyStatus: keyof typeof STATUS_LABELS = status;
  let shouldPulse = false;
  let shouldGlow = false;
  
  if (minutesUntil <= 0) {
    urgencyStatus = 'error';
    shouldPulse = true;
    shouldGlow = true;
  } else if (minutesUntil <= 15) {
    urgencyStatus = 'reservada';
    shouldPulse = true;
    shouldGlow = true;
  } else if (minutesUntil <= 30) {
    urgencyStatus = 'warning';
    shouldGlow = true;
  }
  
  return (
    <StatusBadge
      status={urgencyStatus}
      showPulse={shouldPulse}
      showGlow={shouldGlow}
      urgencyMinutes={minutesUntil}
      label={`${STATUS_LABELS[status]} (${minutesUntil}min)`}
      className={className}
    />
  );
}

// Componente para mostrar múltiples estados
export interface StatusBadgeGroupProps {
  statuses: Array<{
    status: keyof typeof STATUS_LABELS;
    label?: string;
    count?: number;
  }>;
  size?: VariantProps<typeof statusBadgeVariants>['size'];
  variant?: VariantProps<typeof statusBadgeVariants>['variant'];
  className?: string;
}

export function StatusBadgeGroup({ 
  statuses, 
  size = "default", 
  variant = "solid",
  className 
}: StatusBadgeGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {statuses.map((item, index) => (
        <StatusBadge
          key={`${item.status}-${index}`}
          status={item.status}
          size={size}
          variant={variant}
          label={
            item.count !== undefined 
              ? `${item.label ?? STATUS_LABELS[item.status]} (${item.count})`
              : item.label
          }
        />
      ))}
    </div>
  );
}

// Hook para generar estadísticas de estados
export function useStatusStats(items: Array<{ status: string }>) {
  const stats = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(stats).map(([status, count]) => ({
    status: status as keyof typeof STATUS_LABELS,
    count,
  }));
}

// Exportar todo lo necesario
export { statusBadgeVariants, STATUS_LABELS };