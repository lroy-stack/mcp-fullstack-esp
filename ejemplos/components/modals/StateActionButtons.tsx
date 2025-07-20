import React from 'react';
import { TouchOptimizedCTA } from '@/components/ui/touch-optimized-cta';
import { CheckCircle, XCircle, UserCheck, CheckSquare, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAutoConfirmReservation } from '@/hooks/useAutoConfirmReservation';
import { useAutoCompleteReservation } from '@/hooks/useAutoCompleteReservation';
import { useAutoCancelReservation } from '@/hooks/useAutoCancelReservation';

interface StateActionButtonsProps {
  currentStatus: string;
  onStatusUpdate: (status: string) => void;
  onBeforeStatusUpdate?: (status: string) => boolean | Promise<boolean>;
  loading?: boolean;
  disabled?: boolean;
  reservationId?: number; // Add reservationId for automated confirmation
}

export function StateActionButtons({
  currentStatus,
  onStatusUpdate,
  onBeforeStatusUpdate,
  loading = false,
  disabled = false,
  reservationId
}: StateActionButtonsProps) {
  // Hooks for automated email actions
  const { confirmAndSendEmail, isConfirming } = useAutoConfirmReservation();
  const { completeAndSendEmail, isCompleting } = useAutoCompleteReservation();
  const { cancelAndSendApologyEmail, isCancelling } = useAutoCancelReservation();
  const availableActions = {
    pendiente: [
      { status: 'confirmada', label: 'Confirmar y Enviar Email', icon: CheckCircle, variant: 'secondary' as const },
      { status: 'cancelada_restaurante', label: 'Cancelar y Enviar Disculpa', icon: XCircle, variant: 'destructive' as const }
    ],
    confirmada: [
      { status: 'sentada', label: 'Sentar Cliente', icon: UserCheck, variant: 'primary' as const },
      { status: 'no_show', label: 'No Show', icon: AlertTriangle, variant: 'destructive' as const }
    ],
    sentada: [
      { status: 'completada', label: 'Completar y Enviar Email de Reseña', icon: CheckSquare, variant: 'primary' as const }
    ],
    completada: [
      { status: 'sentada', label: 'Reabrir', icon: RotateCcw, variant: 'secondary' as const }
    ],
    cancelada_restaurante: [
      { status: 'confirmada', label: 'Restaurar', icon: RotateCcw, variant: 'secondary' as const }
    ],
    cancelada_usuario: [
      { status: 'confirmada', label: 'Restaurar', icon: RotateCcw, variant: 'secondary' as const }
    ],
    no_show: [
      { status: 'confirmada', label: 'Restaurar', icon: RotateCcw, variant: 'secondary' as const }
    ]
  }[currentStatus] || [];

  if (availableActions.length === 0) {
    return (
      <div className="bg-white xl:bg-white rounded-xl xl:rounded-lg p-4 border-0 xl:border xl:border-enigma-neutral-200 shadow-none xl:shadow-sm">
        <div className="text-center py-4">
          <p className="text-enigma-neutral-600 ios-text-footnote font-medium">No hay acciones disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white xl:bg-white rounded-xl xl:rounded-lg p-0 xl:p-4 border-0 xl:border xl:border-enigma-neutral-200 shadow-none xl:shadow-sm">
      <div className="space-y-3">
        {availableActions.map((action) => (
          <TouchOptimizedCTA
            key={action.status}
            variant={action.variant}
            size="lg"
            icon={action.icon}
            iconPosition="left"
            onClick={async () => {
              if (onBeforeStatusUpdate) {
                const canProceed = await onBeforeStatusUpdate(action.status);
                if (!canProceed) return;
              }
              
              // Automated email actions based on status
              if (action.status === 'confirmada' && reservationId) {
                // Confirmation with email
                try {
                  await confirmAndSendEmail({
                    reservationId,
                    sendEmail: true
                  });
                  // The hook handles success notifications and cache invalidation
                  if (onStatusUpdate) {
                    onStatusUpdate('confirmada');
                  }
                } catch (error) {
                  console.error('Error in automated confirmation:', error);
                  // Error already shown in hook, don't update status
                }
              } else if (action.status === 'completada' && reservationId) {
                // Complete with review email
                try {
                  await completeAndSendEmail({
                    reservationId,
                    sendEmail: true
                  });
                  // The hook handles success notifications and cache invalidation
                  if (onStatusUpdate) {
                    onStatusUpdate('completada');
                  }
                } catch (error) {
                  console.error('Error in automated completion:', error);
                  // Error already shown in hook, don't update status
                }
              } else if (action.status === 'cancelada_restaurante' && reservationId) {
                // Restaurant cancellation with apology email
                try {
                  await cancelAndSendApologyEmail({
                    reservationId,
                    cancelationType: 'cancelada_restaurante',
                    sendEmail: true,
                    cancelationReason: 'Motivos operativos del restaurante'
                  });
                  // The hook handles success notifications and cache invalidation
                  if (onStatusUpdate) {
                    onStatusUpdate('cancelada_restaurante');
                  }
                } catch (error) {
                  console.error('Error in automated cancellation:', error);
                  // Error already shown in hook, don't update status
                }
              } else {
                // Regular status update for other statuses
                onStatusUpdate(action.status);
              }
            }}
            disabled={loading || disabled || isConfirming || isCompleting || isCancelling}
            loading={loading || 
              (isConfirming && action.status === 'confirmada') || 
              (isCompleting && action.status === 'completada') || 
              (isCancelling && action.status === 'cancelada_restaurante')
            }
            className="w-full min-h-[56px] xl:min-h-[52px] justify-start text-base xl:text-sm font-semibold shadow-sm xl:shadow-none rounded-xl xl:rounded-md transition-all duration-300"
          >
            {action.label}
          </TouchOptimizedCTA>
        ))}
      </div>
    </div>
  );
}