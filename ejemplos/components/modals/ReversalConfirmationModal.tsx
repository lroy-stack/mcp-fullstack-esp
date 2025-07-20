import React, { useState } from 'react';
import { Dialog, CustomDialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/custom-dialog';
import { TouchOptimizedCTA, CTAGroup } from '@/components/ui/touch-optimized-cta';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReversalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  reservationInfo: {
    id: number;
    clientName: string;
    currentState: string;
    newState: string;
    time?: string;
    date?: string;
  };
  loading?: boolean;
}

export function ReversalConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  reservationInfo,
  loading = false
}: ReversalConfirmationModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Por favor, proporcione una razón para la reversión');
      return;
    }

    if (reason.trim().length < 10) {
      setError('La razón debe tener al menos 10 caracteres');
      return;
    }

    onConfirm(reason.trim());
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const getStateLabel = (state: string) => {
    const labels: Record<string, string> = {
      no_show: 'No Show',
      confirmada: 'Confirmada',
      cancelada: 'Cancelada',
      sentada: 'Sentada',
      completada: 'Completada',
      pendiente: 'Pendiente'
    };
    return labels[state] || state;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent className="max-w-lg bg-gradient-to-br from-white/95 to-gray-50/90 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Confirmar Reversión de Estado
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Esta acción revertirá el estado de la reserva
                </DialogDescription>
              </div>
            </div>
            <TouchOptimizedCTA
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500"
            >
              <X className="w-4 h-4" />
            </TouchOptimizedCTA>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Información de la reserva */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <h4 className="font-semibold text-gray-900 mb-3">Detalles de la Reversión</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reserva:</span>
                <span className="font-medium">#{reservationInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium">{reservationInfo.clientName}</span>
              </div>
              {reservationInfo.date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">{reservationInfo.date}</span>
                </div>
              )}
              {reservationInfo.time && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora:</span>
                  <span className="font-medium">{reservationInfo.time}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estado actual:</span>
                  <span className={cn(
                    'px-2 py-1 rounded-lg text-xs font-medium',
                    reservationInfo.currentState === 'no_show' 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  )}>
                    {getStateLabel(reservationInfo.currentState)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-600">Nuevo estado:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                    {getStateLabel(reservationInfo.newState)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Campo de razón */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium text-gray-900">
              Razón de la reversión <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Explique por qué se está revirtiendo este estado (ej: El cliente llegó tarde, Error al marcar, etc.)"
              className={cn(
                'min-h-[100px] resize-none',
                'bg-white/80 border-white/30 focus:bg-white/90',
                'focus:border-enigma-primary/50 transition-all duration-200',
                error && 'border-red-300 focus:border-red-400'
              )}
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Esta información quedará registrada en el historial de cambios
            </p>
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800">
                  Importante
                </p>
                <p className="text-sm text-yellow-700">
                  Esta acción quedará registrada en el sistema. Asegúrese de que la reversión 
                  está justificada antes de continuar.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <CTAGroup orientation="horizontal" spacing="md" className="pt-2">
            <TouchOptimizedCTA
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              fullWidth
            >
              Cancelar
            </TouchOptimizedCTA>
            <TouchOptimizedCTA
              variant="primary"
              onClick={handleConfirm}
              disabled={loading || !reason.trim()}
              loading={loading}
              icon={RotateCcw}
              iconPosition="left"
              fullWidth
            >
              Confirmar Reversión
            </TouchOptimizedCTA>
          </CTAGroup>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}