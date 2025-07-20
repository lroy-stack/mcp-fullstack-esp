// Ejemplo: Componente Card estilo iOS con Design System
// Patrón: Component Variants + iOS Design + Conditional Props + Forward Ref

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Configuración de variantes del Card iOS
const iosCardVariants = cva(
  // Clases base - estilo iOS
  [
    "relative overflow-hidden transition-all duration-200 ease-out",
    "bg-white/95 backdrop-blur-xl border border-gray-200/50",
    "shadow-sm hover:shadow-md active:scale-[0.98]",
    // iOS specific styling
    "supports-[backdrop-filter]:bg-white/80"
  ],
  {
    variants: {
      size: {
        sm: "p-3 rounded-lg",
        default: "p-4 rounded-xl", 
        lg: "p-6 rounded-2xl",
        xl: "p-8 rounded-3xl",
      },
      variant: {
        default: "",
        elevated: "shadow-lg shadow-gray-900/10",
        outlined: "border-2 border-gray-300 shadow-none",
        ghost: "bg-transparent border-none shadow-none backdrop-blur-none",
        glass: "bg-white/70 border-white/20 shadow-xl backdrop-blur-2xl",
      },
      interactive: {
        true: "cursor-pointer hover:bg-gray-50/50 active:bg-gray-100/50",
        false: "",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed pointer-events-none",
        false: "",
      },
      glow: {
        true: "shadow-xl shadow-blue-500/20",
        false: "",
      }
    },
    compoundVariants: [
      // Elevated + Interactive combinations
      {
        variant: "elevated",
        interactive: true,
        class: "hover:shadow-xl hover:shadow-gray-900/15 active:shadow-lg",
      },
      // Glass + Interactive combinations  
      {
        variant: "glass",
        interactive: true,
        class: "hover:bg-white/80 active:bg-white/90",
      },
      // Outlined + Interactive combinations
      {
        variant: "outlined", 
        interactive: true,
        class: "hover:border-gray-400 active:border-gray-500",
      },
    ],
    defaultVariants: {
      size: "default",
      variant: "default", 
      interactive: false,
      disabled: false,
      glow: false,
    },
  }
);

// Props del componente
export interface IOSCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iosCardVariants> {
  asChild?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
}

// Componente Card con forwardRef
export const IOSCard = forwardRef<HTMLDivElement, IOSCardProps>(
  ({ 
    className, 
    size, 
    variant, 
    interactive, 
    disabled, 
    glow,
    asChild = false,
    loading = false,
    header,
    footer,
    badge,
    children,
    onClick,
    ...props 
  }, ref) => {
    // Loading skeleton
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            iosCardVariants({ size, variant: "ghost" }),
            "animate-pulse bg-gray-200",
            className
          )}
          {...props}
        >
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      );
    }

    // Determinar si es interactivo
    const isInteractive = interactive || !!onClick;

    const cardContent = (
      <>
        {/* Badge posicionado absolutamente */}
        {badge && (
          <div className="absolute top-3 right-3 z-10">
            {badge}
          </div>
        )}

        {/* Header */}
        {header && (
          <div className="mb-4 pr-8">
            {header}
          </div>
        )}

        {/* Contenido principal */}
        <div className={cn(header && "mt-4", footer && "mb-4")}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            {footer}
          </div>
        )}
      </>
    );

    return (
      <div
        ref={ref}
        className={cn(
          iosCardVariants({ 
            size, 
            variant, 
            interactive: isInteractive, 
            disabled, 
            glow 
          }),
          className
        )}
        onClick={disabled ? undefined : onClick}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        onKeyDown={isInteractive ? (e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            e.preventDefault();
            onClick(e as any);
          }
        } : undefined}
        {...props}
      >
        {cardContent}
      </div>
    );
  }
);

IOSCard.displayName = "IOSCard";

// Componentes especializados
export const IOSCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
  }
>(({ className, title, subtitle, icon, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start gap-3", className)}
    {...props}
  >
    {icon && (
      <div className="flex-shrink-0 mt-0.5">
        {icon}
      </div>
    )}
    <div className="flex-1 min-w-0">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  </div>
));

IOSCardHeader.displayName = "IOSCardHeader";

export const IOSCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-gray-700", className)}
    {...props}
  />
));

IOSCardContent.displayName = "IOSCardContent";

export const IOSCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    actions?: React.ReactNode;
  }
>(({ className, actions, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between gap-4",
      className
    )}
    {...props}
  >
    <div className="flex-1">
      {children}
    </div>
    {actions && (
      <div className="flex-shrink-0">
        {actions}
      </div>
    )}
  </div>
));

IOSCardFooter.displayName = "IOSCardFooter";

// Hook para animaciones de card
export function useIOSCardAnimation() {
  const [isPressed, setIsPressed] = React.useState(false);

  const handleTouchStart = React.useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    setIsPressed(false);
  }, []);

  const animationProps = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleTouchStart,
    onMouseUp: handleTouchEnd,
    onMouseLeave: handleTouchEnd,
    style: {
      transform: isPressed ? 'scale(0.98)' : 'scale(1)',
      transition: 'transform 0.1s ease-out',
    }
  };

  return { isPressed, animationProps };
}

// Ejemplos de uso
export function IOSCardExamples() {
  const { animationProps } = useIOSCardAnimation();

  return (
    <div className="space-y-6 p-6">
      {/* Card básico */}
      <IOSCard>
        <IOSCardHeader 
          title="Reserva #1234"
          subtitle="Mesa 5 - Terraza"
          icon={<div className="w-8 h-8 bg-blue-500 rounded-full" />}
        />
        <IOSCardContent>
          <p>Juan Pérez - 4 personas</p>
          <p className="text-sm text-gray-500 mt-1">Hoy 20:00</p>
        </IOSCardContent>
      </IOSCard>

      {/* Card interactivo */}
      <IOSCard 
        interactive 
        onClick={() => console.log('Card clicked')}
        {...animationProps}
      >
        <IOSCardHeader title="Mesa 12" subtitle="Disponible" />
        <IOSCardContent>
          <p>Capacidad: 6 personas</p>
        </IOSCardContent>
        <IOSCardFooter actions={
          <button className="text-blue-600 text-sm font-medium">
            Asignar
          </button>
        }>
          <span className="text-xs text-gray-500">Zona VIP</span>
        </IOSCardFooter>
      </IOSCard>

      {/* Card elevado con glow */}
      <IOSCard 
        variant="elevated" 
        glow 
        badge={<span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Urgente</span>}
      >
        <IOSCardHeader title="Reserva VIP" subtitle="Requiere atención" />
        <IOSCardContent>
          <p>Cliente premium con solicitudes especiales</p>
        </IOSCardContent>
      </IOSCard>

      {/* Card glass */}
      <IOSCard variant="glass" size="lg">
        <IOSCardHeader title="Métricas del Día" />
        <IOSCardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-gray-600">Reservas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-sm text-gray-600">Ocupación</p>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Card loading */}
      <IOSCard loading />

      {/* Card disabled */}
      <IOSCard disabled interactive>
        <IOSCardHeader title="Mesa Fuera de Servicio" />
        <IOSCardContent>
          <p>Esta mesa está temporalmente fuera de servicio</p>
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}