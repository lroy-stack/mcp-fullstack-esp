// Ejemplo: Sistema de Gestión de Modales con Stack y Context
// Patrón: Context + Stack Management + Portal + Escape Handling

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos para el sistema de modales
interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  options?: ModalOptions;
}

interface ModalOptions {
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  blockInteraction?: boolean;
  zIndexBase?: number;
  className?: string;
}

interface ModalContextType {
  modals: Modal[];
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, updates: Partial<Modal>) => void;
}

// Context
const ModalContext = createContext<ModalContextType | null>(null);

// Hook para usar el contexto de modales
export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Opciones por defecto
const DEFAULT_MODAL_OPTIONS: Required<ModalOptions> = {
  closeOnEscape: true,
  closeOnOverlayClick: true,
  blockInteraction: false,
  zIndexBase: 1000,
  className: '',
};

// Provider del contexto de modales
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<Modal[]>([]);

  const openModal = useCallback((modal: Omit<Modal, 'id'>) => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newModal: Modal = {
      ...modal,
      id,
      options: { ...DEFAULT_MODAL_OPTIONS, ...modal.options },
    };
    
    setModals(prev => [...prev, newModal]);
    return id;
  }, []);

  const closeModal = useCallback((id?: string) => {
    setModals(prev => {
      if (!id) {
        // Cerrar el modal más reciente
        return prev.slice(0, -1);
      }
      return prev.filter(modal => modal.id !== id);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const updateModal = useCallback((id: string, updates: Partial<Modal>) => {
    setModals(prev => 
      prev.map(modal => 
        modal.id === id 
          ? { ...modal, ...updates }
          : modal
      )
    );
  }, []);

  // Manejar escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.options?.closeOnEscape) {
          closeModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modals, closeModal]);

  // Bloquear scroll cuando hay modales
  useEffect(() => {
    const hasBlockingModal = modals.some(modal => modal.options?.blockInteraction);
    
    if (hasBlockingModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modals]);

  const contextValue: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  );
}

// Componente que renderiza todos los modales
function ModalRenderer() {
  const { modals, closeModal } = useModal();
  
  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {modals.map((modal, index) => {
        const zIndex = (modal.options?.zIndexBase || 1000) + index;
        
        return (
          <ModalOverlay
            key={modal.id}
            modal={modal}
            zIndex={zIndex}
            onClose={() => closeModal(modal.id)}
          />
        );
      })}
    </>,
    document.body
  );
}

// Componente overlay individual
function ModalOverlay({ 
  modal, 
  zIndex, 
  onClose 
}: { 
  modal: Modal; 
  zIndex: number; 
  onClose: () => void; 
}) {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && modal.options?.closeOnOverlayClick) {
      onClose();
    }
  };

  const ModalComponent = modal.component;

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 flex items-center justify-center p-4",
        "animate-in fade-in duration-200",
        modal.options?.className
      )}
      style={{ zIndex }}
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl max-w-full max-h-full overflow-auto",
          "animate-in zoom-in-95 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalComponent 
          {...modal.props} 
          onClose={onClose}
          modalId={modal.id}
        />
      </div>
    </div>
  );
}

// Hook para modales pre-configurados comunes
export function useCommonModals() {
  const { openModal, closeModal } = useModal();

  const confirmDialog = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    return openModal({
      component: ConfirmDialog,
      props: { title, message, onConfirm, onCancel },
      options: { closeOnEscape: true, closeOnOverlayClick: false }
    });
  }, [openModal]);

  const alertDialog = useCallback((title: string, message: string) => {
    return openModal({
      component: AlertDialog,
      props: { title, message },
      options: { closeOnEscape: true, closeOnOverlayClick: true }
    });
  }, [openModal]);

  const loadingModal = useCallback((message: string = 'Cargando...') => {
    return openModal({
      component: LoadingModal,
      props: { message },
      options: { 
        closeOnEscape: false, 
        closeOnOverlayClick: false,
        blockInteraction: true 
      }
    });
  }, [openModal]);

  return {
    confirmDialog,
    alertDialog,
    loadingModal,
    closeModal,
  };
}

// Componentes de modal pre-construidos
interface DialogProps {
  onClose: () => void;
  modalId: string;
}

function ConfirmDialog({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  onClose 
}: DialogProps & {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <div className="p-6 min-w-[400px]">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">{message}</p>
      
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

function AlertDialog({ 
  title, 
  message, 
  onClose 
}: DialogProps & {
  title: string;
  message: string;
}) {
  return (
    <div className="p-6 min-w-[350px]">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">{message}</p>
      
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

function LoadingModal({ 
  message,
  onClose 
}: DialogProps & {
  message: string;
}) {
  return (
    <div className="p-8 flex flex-col items-center gap-4 min-w-[300px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

// Componente de ejemplo de uso
export function ModalExample() {
  const { confirmDialog, alertDialog, loadingModal, closeModal } = useCommonModals();

  const handleConfirmExample = () => {
    confirmDialog(
      'Eliminar Reserva',
      '¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.',
      () => {
        console.log('Reserva eliminada');
        alertDialog('Éxito', 'La reserva ha sido eliminada correctamente.');
      },
      () => {
        console.log('Cancelado');
      }
    );
  };

  const handleLoadingExample = () => {
    const modalId = loadingModal('Procesando reserva...');
    
    setTimeout(() => {
      closeModal(modalId);
      alertDialog('Completado', 'La reserva ha sido procesada exitosamente.');
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleConfirmExample}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Mostrar Confirmación
      </button>
      
      <button
        onClick={handleLoadingExample}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Mostrar Loading
      </button>
    </div>
  );
}