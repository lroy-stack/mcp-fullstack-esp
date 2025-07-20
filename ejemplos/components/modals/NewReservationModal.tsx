import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReservationForm } from '@/components/forms/ReservationForm';
import { X } from 'lucide-react';
import { IOSButton } from '@/components/ui/ios-button';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewReservationModal({
  isOpen,
  onClose,
  onSuccess
}: NewReservationModalProps) {
  
  const handleReservationSuccess = () => {
    // Cerrar modal después de crear la reserva exitosamente
    onClose();
    
    // Notificar al componente padre si hay un callback
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="ios-text-title2">
              Nueva Reserva
            </DialogTitle>
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </IOSButton>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          <ReservationForm
            onSuccess={handleReservationSuccess}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}