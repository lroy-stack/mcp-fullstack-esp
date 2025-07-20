import React, { useState, useEffect } from 'react';
import { X, Clock, Users, Phone, Mail, Calendar, MapPin, Plus, AlertCircle } from 'lucide-react';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface QuickReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime?: string;
  onSuccess: () => void;
}

export function QuickReservationModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedTime, 
  onSuccess 
}: QuickReservationModalProps) {
  const [step, setStep] = useState<'time' | 'details' | 'confirm'>('time');
  const [formData, setFormData] = useState({
    fecha: format(selectedDate, 'yyyy-MM-dd'),
    hora: selectedTime || '',
    comensales: 2,
    duracion: 120, // 2 horas por defecto
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    notas: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        fecha: format(selectedDate, 'yyyy-MM-dd'),
        hora: selectedTime || ''
      }));
      setStep(selectedTime ? 'details' : 'time');
    }
  }, [isOpen, selectedDate, selectedTime]);

  if (!isOpen) return null;

  // Generar slots de tiempo disponibles
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, hora: time }));
    setStep('details');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Aquí iría la lógica de creación de reserva
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular API call
      
      toast({
        title: "Reserva creada exitosamente",
        description: `Reserva para ${formData.nombre} el ${format(selectedDate, "d 'de' MMMM", { locale: es })} a las ${formData.hora}`,
      });
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Error al crear la reserva",
        description: "Inténtalo de nuevo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('time');
    setFormData({
      fecha: format(selectedDate, 'yyyy-MM-dd'),
      hora: '',
      comensales: 2,
      duracion: 120,
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      notas: ''
    });
  };

  const renderTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="ios-text-title2 font-bold text-enigma-neutral-900 mb-2">
          Seleccionar Hora
        </h3>
        <p className="ios-text-callout text-enigma-neutral-600">
          {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => handleTimeSelect(time)}
            className={`
              p-3 rounded-ios border-2 transition-all duration-200 ios-touch-feedback
              ${formData.hora === time
                ? 'border-enigma-primary bg-enigma-primary text-white shadow-ios'
                : 'border-enigma-neutral-200 bg-white text-enigma-neutral-900 hover:border-enigma-primary/50 hover:bg-enigma-primary/5'
              }
            `}
          >
            <div className="ios-text-callout font-semibold">{time}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="ios-text-title2 font-bold text-enigma-neutral-900 mb-2">
          Datos de la Reserva
        </h3>
        <div className="flex items-center justify-center gap-4 text-enigma-neutral-600">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span className="ios-text-footnote">{format(selectedDate, "d MMM", { locale: es })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span className="ios-text-footnote">{formData.hora}</span>
          </div>
        </div>
      </div>

      {/* Número de comensales y duración */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block ios-text-footnote font-semibold text-enigma-neutral-700 mb-2">
            Comensales
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, comensales: Math.max(1, prev.comensales - 1) }))}
              className="w-10 h-10 rounded-ios bg-enigma-neutral-100 flex items-center justify-center hover:bg-enigma-neutral-200 transition-colors"
            >
              <span className="text-enigma-neutral-600 font-semibold">−</span>
            </button>
            <div className="flex-1 text-center">
              <span className="ios-text-title3 font-bold text-enigma-primary">{formData.comensales}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, comensales: Math.min(12, prev.comensales + 1) }))}
              className="w-10 h-10 rounded-ios bg-enigma-neutral-100 flex items-center justify-center hover:bg-enigma-neutral-200 transition-colors"
            >
              <span className="text-enigma-neutral-600 font-semibold">+</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block ios-text-footnote font-semibold text-enigma-neutral-700 mb-2">
            Duración
          </label>
          <select
            value={formData.duracion}
            onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) }))}
            className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary focus:ring-2 focus:ring-enigma-primary/20 ios-text-callout"
          >
            <option value={60}>1 hora</option>
            <option value={90}>1.5 horas</option>
            <option value={120}>2 horas</option>
            <option value={150}>2.5 horas</option>
            <option value={180}>3 horas</option>
          </select>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="space-y-4">
        <h4 className="ios-text-headline font-semibold text-enigma-neutral-900">
          Información del Cliente
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block ios-text-footnote font-semibold text-enigma-neutral-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary focus:ring-2 focus:ring-enigma-primary/20 ios-text-callout"
              placeholder="Nombre"
              required
            />
          </div>
          
          <div>
            <label className="block ios-text-footnote font-semibold text-enigma-neutral-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
              className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary focus:ring-2 focus:ring-enigma-primary/20 ios-text-callout"
              placeholder="Apellido"
              required
            />
          </div>
        </div>

        <div>
          <label className="block ios-text-footnote font-semibold text-enigma-neutral-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
            className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary focus:ring-2 focus:ring-enigma-primary/20 ios-text-callout"
            placeholder="+34 600 000 000"
            required
          />
        </div>

        <div>
          <label className="block ios-text-footnote font-semibold text-enigma-neutral-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary focus:ring-2 focus:ring-enigma-primary/20 ios-text-callout"
            placeholder="cliente@email.com"
          />
        </div>

        <div>
          <label className="block ios-text-footnote font-semibold text-enigma-neutral-700 mb-2">
            Notas especiales
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
            className="w-full p-3 rounded-ios border border-enigma-neutral-300 focus:border-enigma-primary focus:ring-2 focus:ring-enigma-primary/20 ios-text-callout"
            placeholder="Alergias, celebraciones, preferencias..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-enigma-primary/10 rounded-ios-lg flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} className="text-enigma-primary" />
        </div>
        <h3 className="ios-text-title2 font-bold text-enigma-neutral-900 mb-2">
          Confirmar Reserva
        </h3>
        <p className="ios-text-callout text-enigma-neutral-600">
          Revisa los datos antes de crear la reserva
        </p>
      </div>

      <IOSCard variant="default" className="bg-enigma-primary/5 border-enigma-primary/20">
        <IOSCardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="ios-text-footnote text-enigma-neutral-600">Cliente:</span>
              <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                {formData.nombre} {formData.apellido}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="ios-text-footnote text-enigma-neutral-600">Fecha:</span>
              <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="ios-text-footnote text-enigma-neutral-600">Hora:</span>
              <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                {formData.hora}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="ios-text-footnote text-enigma-neutral-600">Comensales:</span>
              <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                {formData.comensales} personas
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="ios-text-footnote text-enigma-neutral-600">Duración:</span>
              <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                {formData.duracion / 60} hora{formData.duracion > 60 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="ios-text-footnote text-enigma-neutral-600">Teléfono:</span>
              <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                {formData.telefono}
              </span>
            </div>
            
            {formData.email && (
              <div className="flex items-center justify-between">
                <span className="ios-text-footnote text-enigma-neutral-600">Email:</span>
                <span className="ios-text-callout font-semibold text-enigma-neutral-900">
                  {formData.email}
                </span>
              </div>
            )}
            
            {formData.notas && (
              <div className="pt-2 border-t border-enigma-neutral-200">
                <span className="ios-text-footnote text-enigma-neutral-600">Notas:</span>
                <p className="ios-text-footnote text-enigma-neutral-700 mt-1 leading-relaxed">
                  {formData.notas}
                </p>
              </div>
            )}
          </div>
        </IOSCardContent>
      </IOSCard>

      <div className="bg-enigma-accent/10 rounded-ios p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-enigma-accent flex-shrink-0 mt-0.5" />
        <div>
          <p className="ios-text-footnote text-enigma-accent font-semibold mb-1">
            Estado inicial: Pendiente de confirmación
          </p>
          <p className="ios-text-caption1 text-enigma-neutral-600">
            La reserva se creará con estado "Pendiente" y podrás confirmarla posteriormente.
          </p>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    if (step === 'time') return formData.hora !== '';
    if (step === 'details') return formData.nombre && formData.apellido && formData.telefono;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-ios">
      <IOSCard variant="elevated" className="w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-ios-2xl animate-scale-in">
        <IOSCardHeader className="border-b border-enigma-neutral-200/50 bg-gradient-to-r from-enigma-primary/5 to-enigma-secondary/5">
          <div className="flex items-center justify-between">
            <IOSCardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-enigma-primary rounded-ios flex items-center justify-center">
                <Plus size={20} className="text-white" />
              </div>
              <span className="ios-text-headline font-bold text-enigma-neutral-900">
                Nueva Reserva
              </span>
            </IOSCardTitle>
            
            <IOSButton 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 hover:bg-enigma-neutral-100"
            >
              <X size={20} className="text-enigma-neutral-600" />
            </IOSButton>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[
              { key: 'time', label: 'Hora' },
              { key: 'details', label: 'Datos' },
              { key: 'confirm', label: 'Confirmar' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.key} className="flex items-center gap-2">
                <div className={`
                  w-8 h-8 rounded-ios flex items-center justify-center text-xs font-bold transition-all
                  ${step === stepInfo.key 
                    ? 'bg-enigma-primary text-white' 
                    : index < ['time', 'details', 'confirm'].indexOf(step)
                      ? 'bg-enigma-secondary text-white'
                      : 'bg-enigma-neutral-200 text-enigma-neutral-500'
                  }
                `}>
                  {index + 1}
                </div>
                <span className={`ios-text-caption1 ${
                  step === stepInfo.key ? 'text-enigma-primary font-semibold' : 'text-enigma-neutral-500'
                }`}>
                  {stepInfo.label}
                </span>
                {index < 2 && <div className="w-4 h-px bg-enigma-neutral-200" />}
              </div>
            ))}
          </div>
        </IOSCardHeader>

        <IOSCardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 'time' && renderTimeSelection()}
          {step === 'details' && renderDetailsForm()}
          {step === 'confirm' && renderConfirmation()}
        </IOSCardContent>

        {/* Footer */}
        <div className="border-t border-enigma-neutral-200/50 p-4 bg-ios-background">
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-2">
              {step !== 'time' && (
                <IOSButton 
                  variant="outline" 
                  onClick={() => {
                    if (step === 'details') setStep('time');
                    if (step === 'confirm') setStep('details');
                  }}
                  className="border-enigma-neutral-300 text-enigma-neutral-600"
                >
                  Anterior
                </IOSButton>
              )}
              
              <IOSButton 
                variant="ghost" 
                onClick={onClose}
                className="text-enigma-neutral-500"
              >
                Cancelar
              </IOSButton>
            </div>

            <IOSButton
              variant="primary"
              onClick={() => {
                if (step === 'time') setStep('details');
                else if (step === 'details') setStep('confirm');
                else handleSubmit();
              }}
              disabled={!canProceed() || isSubmitting}
              className="bg-enigma-primary hover:bg-enigma-primary/90"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </div>
              ) : step === 'confirm' ? (
                'Crear Reserva'
              ) : (
                'Continuar'
              )}
            </IOSButton>
          </div>
        </div>
      </IOSCard>
    </div>
  );
}