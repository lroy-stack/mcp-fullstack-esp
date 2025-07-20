import React, { useState } from 'react';
import { Dialog, CustomDialogContent, DialogTitle, DialogDescription } from '@/components/ui/custom-dialog';
import { TouchOptimizedCTA } from '@/components/ui/touch-optimized-cta';
import { 
  useReservationDetail, 
  useAssignTable,
  useAddExperienceNote,
  useReservationSubscription
} from '@/hooks/useReservationDetail';
import { useReservationStateUpdate, type ReservationState } from '@/hooks/useReservationStateUpdate';
import { useReservationCompletion } from '@/hooks/useReservationCompletion';
import { useEliminarReserva } from '@/hooks/useReservasSimple';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Phone, MessageSquare, Mail } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ClientContactPanel } from './panels/ClientContactPanel';
import { ReservationStatusPanel } from './panels/ReservationStatusPanel';
import { ReservationContextPanel } from './panels/ReservationContextPanel';
import { EmailModal } from '@/components/email/EmailModal';

interface ReservationDetailModalProps {
  reservationId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToClient?: (clientId: number) => void;
}

export function ReservationDetailModal({
  reservationId,
  isOpen,
  onClose,
  onNavigateToClient
}: ReservationDetailModalProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // HOOKS DEBEN IR ANTES DE CUALQUIER EARLY RETURN
  const { data: reservationDetail, isLoading, error, refetch } = useReservationDetail(reservationId || 0);
  const updateReservationState = useReservationStateUpdate();
  const completeReservation = useReservationCompletion();
  const assignTable = useAssignTable();
  const addExperienceNote = useAddExperienceNote();
  const eliminarReserva = useEliminarReserva();
  const queryClient = useQueryClient();

  // Hook para actualizar fecha y hora de reserva
  const updateReservationDateTime = useMutation({
    mutationFn: async ({ fecha, hora }: { fecha: string; hora: string }) => {
      const { data, error } = await supabase
        .schema('restaurante')
        .from('reservas')
        .update({
          fecha_reserva: fecha,
          hora_reserva: hora,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation-detail', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Fecha y hora actualizadas correctamente');
    },
    onError: (error) => {
      console.error('Error actualizando fecha/hora:', error);
      toast.error('Error al actualizar la reserva');
    }
  });

  // Hook para actualizar detalles completos de reserva
  const updateReservationDetails = useMutation({
    mutationFn: async (details: {
      numero_personas: number;
      peticiones_especiales?: string;
      alergias_comunicadas?: string;
      zona_preferida?: number;
    }) => {
      const { data, error } = await supabase
        .schema('restaurante')
        .from('reservas')
        .update({
          numero_personas: details.numero_personas,
          peticiones_especiales: details.peticiones_especiales,
          alergias_comunicadas: details.alergias_comunicadas,
          zona_preferida: details.zona_preferida,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation-detail', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Detalles de reserva actualizados correctamente');
    },
    onError: (error) => {
      console.error('Error actualizando detalles de reserva:', error);
      toast.error('Error al actualizar los detalles de la reserva');
    }
  });
  
  
  // Activar subscription en tiempo real para esta reserva
  useReservationSubscription(reservationId || 0);

  // EARLY RETURN DESPUÉS DE TODOS LOS HOOKS
  if (!reservationId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <CustomDialogContent className="max-w-md">
          <div className="p-6 text-center">
            <p className="text-gray-600">No se especificó una reserva válida</p>
            <TouchOptimizedCTA 
              onClick={onClose}
              className="mt-4"
              variant="primary"
            >
              Cerrar
            </TouchOptimizedCTA>
          </div>
        </CustomDialogContent>
      </Dialog>
    );
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <CustomDialogContent className="max-w-md">
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-enigma-primary" />
            <p className="text-gray-600">Cargando detalles de la reserva...</p>
          </div>
        </CustomDialogContent>
      </Dialog>
    );
  }

  if (error || !reservationDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <CustomDialogContent className="max-w-md">
          <div className="p-6 text-center">
            <p className="text-red-600 mb-4">Error al cargar los detalles de la reserva</p>
            <TouchOptimizedCTA 
              onClick={onClose}
              variant="primary"
            >
              Cerrar
            </TouchOptimizedCTA>
          </div>
        </CustomDialogContent>
      </Dialog>
    );
  }

  // Event handlers
  const handleCall = () => {
    if (reservationDetail?.cliente?.telefono) {
      window.open(`tel:${reservationDetail.cliente.telefono}`);
    }
  };

  const handleMessage = () => {
    if (reservationDetail?.cliente?.telefono) {
      const whatsappUrl = `https://wa.me/${reservationDetail.cliente.telefono.replace(/[^0-9]/g, '')}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleEmail = () => {
    if (reservationDetail?.email_reserva || reservationDetail?.cliente?.email) {
      setShowEmailModal(true);
    } else {
      toast.error('No hay email disponible para esta reserva');
    }
  };

  const handleViewClient = () => {
    if (reservationDetail?.cliente?.id && onNavigateToClient) {
      onNavigateToClient(reservationDetail.cliente.id);
      onClose();
    }
  };

  const handleEditDateTime = (fecha: string, hora: string) => {
    updateReservationDateTime.mutate({ fecha, hora });
  };

  const handleEditReservationDetails = (details: {
    numero_personas: number;
    peticiones_especiales?: string;
    alergias_comunicadas?: string;
    zona_preferida?: number;
  }) => {
    updateReservationDetails.mutate(details);
  };

  const handleAddExperienceNote = async (note: string) => {
    await addExperienceNote.mutateAsync({
      reservationId: reservationId!,
      note
    });
    await refetch();
  };

  const handleTableAssigned = async (tableId: number) => {
    // Refrescar los datos de la reserva después de asignar/cambiar mesa
    await refetch();
  };

  const handleDeleteReservation = async () => {
    if (!reservationId) return;
    
    try {
      await eliminarReserva.mutateAsync(reservationId);
      toast.success('Reserva eliminada correctamente');
      onClose(); // Cerrar el modal después de eliminar
    } catch (error) {
      console.error('Error eliminando reserva:', error);
      toast.error('Error al eliminar la reserva');
    }
  };

  const handleStatusUpdate = async (status: string, reason?: string) => {
    try {
      // Para completar reserva, usar hook especializado con liberación automática de mesa
      if (status === 'completada') {
        console.log('🎯 Using specialized completion workflow for reservation:', reservationId);
        
        await completeReservation.mutateAsync({
          reservationId: reservationId!,
          freeTable: true, // Liberar mesa automáticamente
          newTableState: 'libre', // Mesa queda disponible
          completionNotes: reason || `Reserva completada desde modal de detalle`
        });
        
        // Forzar refetch del detalle para mostrar cambios
        await refetch();
        
        console.log('✅ Reservation completed with automatic table liberation');
        return;
      }
      
      // Para estados que requieren mesa, verificar asignación
      if (status === 'sentada') {
        if (!reservationDetail?.mesa_id) {
          toast.error('Debe asignar una mesa antes de sentar al cliente');
          return;
        }
        
        // Proceder con el cambio de estado directamente
        await updateReservationState.mutateAsync({
          reservationId: reservationId.toString(),
          newState: status as ReservationState
        });
        
        await refetch();
        return;
      }
      
      // Para otros estados, usar el hook estándar
      const isReversalCase = reservationDetail?.estado === 'no_show' && status === 'confirmada';
      
      await updateReservationState.mutateAsync({
        reservationId: reservationId.toString(),
        newState: status as ReservationState,
        isReversal: isReversalCase,
        reversalReason: reason
      });
      
      await refetch();
      
      console.log(`✅ Estado actualizado a: ${status}${isReversalCase ? ' (Reversión)' : ''}`);
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      toast.error('Error al actualizar el estado de la reserva');
    }
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <CustomDialogContent 
          className={cn(
            "max-w-none w-[95vw] h-[92vh] p-0 overflow-hidden",
            "bg-white rounded-3xl md:rounded-2xl xl:rounded-ios-2xl",
            "shadow-2xl border-0 md:border md:border-enigma-neutral-200",
            "md:w-[90vw] md:h-[88vh] lg:w-[85vw] lg:h-[85vh] xl:max-w-7xl xl:h-[85vh]",
            "flex flex-col"
          )}
        >
          {/* Accessibility - Hidden but accessible titles */}
          <div className="sr-only">
            <DialogTitle>
              Detalles de reserva #{reservationDetail.id}
            </DialogTitle>
            <DialogDescription>
              Modal con información completa de la reserva, estado actual y acciones disponibles
            </DialogDescription>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200/50 bg-white/95 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-10 md:h-10 bg-enigma-primary rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg md:text-base">
                  {reservationDetail.cliente?.nombre?.charAt(0) || 'R'}
                </span>
              </div>
              <div>
                <h2 className="ios-text-title2 md:ios-text-title3 font-bold text-enigma-neutral-900 tracking-tight">
                  Reserva #{reservationDetail.id}
                </h2>
                <p className="ios-text-footnote md:ios-text-caption1 text-enigma-neutral-600 font-medium">
                  {reservationDetail.cliente?.nombre || 'Cliente'} • {reservationDetail.fecha_reserva}
                </p>
              </div>
            </div>
            
            <TouchOptimizedCTA
              variant="ghost"
              size="md"
              onClick={onClose}
              icon={X}
              className="text-enigma-neutral-600 w-10 h-10 md:w-8 md:h-8 rounded-full"
            />
          </div>

          {/* Desktop Layout: Three Panel Layout */}
          <div className="hidden xl:flex flex-1 min-h-0">
            {/* Left Panel - Client Contact */}
            <div className="w-72 border-r border-enigma-neutral-200 flex-shrink-0 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <ClientContactPanel
                  client={reservationDetail.cliente}
                  onCall={handleCall}
                  onMessage={handleMessage}
                  onEmail={handleEmail}
                  onViewClient={handleViewClient}
                />
              </div>
            </div>

            {/* Center Panel - Reservation Status */}
            <div className="flex-1 min-w-0 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <ReservationStatusPanel
                  reservationDetail={reservationDetail}
                  onUpdateStatus={handleStatusUpdate}
                  onTableAssigned={handleTableAssigned}
                  onEditDateTime={handleEditDateTime}
                  onEditReservationDetails={handleEditReservationDetails}
                  onAddExperienceNote={handleAddExperienceNote}
                  isUpdating={updateReservationState.isPending || completeReservation.isPending || updateReservationDetails.isPending}
                />
              </div>
            </div>

            {/* Right Panel - Context & Details */}
            <div className="w-80 border-l border-enigma-neutral-200 flex-shrink-0 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <ReservationContextPanel
                  reservationDetail={reservationDetail}
                  onUpdateStatus={handleStatusUpdate}
                  onDeleteReservation={handleDeleteReservation}
                  isUpdating={updateReservationState.isPending || completeReservation.isPending || eliminarReserva.isPending}
                />
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Layout: Single Scrollable Panel */}
          <div className="xl:hidden flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 md:p-6 space-y-6">
              {/* Client Info Card */}
              <div className="bg-white shadow-sm border border-gray-200/50 rounded-2xl p-4 md:p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-enigma-primary rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xl">
                      {reservationDetail.cliente?.nombre?.charAt(0) || 'R'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="ios-text-title3 font-bold text-enigma-neutral-900 mb-1">
                      {reservationDetail.cliente?.nombre || reservationDetail.nombre_reserva}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-sm text-enigma-neutral-600">
                      {reservationDetail.cliente?.telefono && (
                        <span>📞 {reservationDetail.cliente.telefono}</span>
                      )}
                      {reservationDetail.cliente?.email && (
                        <span>📧 {reservationDetail.cliente.email}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Quick Contact Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <TouchOptimizedCTA
                    variant="outline"
                    size="lg"
                    icon={Phone}
                    onClick={handleCall}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 min-h-[56px] flex-col gap-1 transition-all duration-300"
                    disabled={!reservationDetail.telefono_reserva}
                  >
                    <span className="text-xs font-medium">Llamar</span>
                  </TouchOptimizedCTA>
                  <TouchOptimizedCTA
                    variant="outline"
                    size="lg"
                    icon={MessageSquare}
                    onClick={handleMessage}
                    className="border-green-300 text-green-700 hover:bg-green-50 min-h-[56px] flex-col gap-1 transition-all duration-300"
                    disabled={!reservationDetail.telefono_reserva}
                  >
                    <span className="text-xs font-medium">WhatsApp</span>
                  </TouchOptimizedCTA>
                  <TouchOptimizedCTA
                    variant="outline"
                    size="lg"
                    icon={Mail}
                    onClick={handleEmail}
                    className="border-red-300 text-red-700 hover:bg-red-50 min-h-[56px] flex-col gap-1 transition-all duration-300"
                    disabled={!reservationDetail.email_reserva}
                  >
                    <span className="text-xs font-medium">Email</span>
                  </TouchOptimizedCTA>
                </div>
              </div>

              {/* Reservation Status and Details */}
              <ReservationStatusPanel
                reservationDetail={reservationDetail}
                onUpdateStatus={handleStatusUpdate}
                onTableAssigned={handleTableAssigned}
                onEditDateTime={handleEditDateTime}
                onEditReservationDetails={handleEditReservationDetails}
                onAddExperienceNote={handleAddExperienceNote}
                isUpdating={updateReservationState.isPending || completeReservation.isPending || updateReservationDetails.isPending}
              />

              {/* Actions and Context */}
              <ReservationContextPanel
                reservationDetail={reservationDetail}
                onUpdateStatus={handleStatusUpdate}
                onDeleteReservation={handleDeleteReservation}
                isUpdating={updateReservationState.isPending || completeReservation.isPending || eliminarReserva.isPending}
              />
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>


      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        recipientEmail={reservationDetail.email_reserva || reservationDetail.cliente?.email || ''}
        recipientName={reservationDetail.cliente?.nombre || reservationDetail.nombre_reserva}
        reservationData={{
          id: reservationDetail.id,
          fecha_reserva: reservationDetail.fecha_reserva,
          hora_reserva: reservationDetail.hora_reserva,
          numero_personas: reservationDetail.numero_personas,
          estado: reservationDetail.estado,
          datos_adicionales: reservationDetail.datos_adicionales
        }}
      />
    </>
  );
}