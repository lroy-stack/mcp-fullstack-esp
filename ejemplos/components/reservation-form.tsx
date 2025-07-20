// Ejemplo: Formulario de Reserva Next.js con Shadcn/ui y Zod
// Patrón: Form + Validation + Server Actions + Optimistic Updates

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createReservation } from '@/app/actions/reservations';

// Schema de validación Zod actualizado según estructura real de DB
const ReservationSchema = z.object({
  nombre_reserva: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(200),
  email_reserva: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono_reserva: z.string().regex(/^(\+34)?[6-9]\d{8}$/, 'Formato de teléfono español inválido'),
  numero_personas: z.number().min(1, 'Mínimo 1 persona').max(20, 'Máximo 20 personas'),
  numero_ninos: z.number().min(0, 'No puede ser negativo').optional(),
  fecha_reserva: z.string().min(1, 'Fecha es requerida'),
  hora_reserva: z.string().min(1, 'Hora es requerida').refine(time => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes >= 12 * 60 && totalMinutes <= 16 * 60) ||
           (totalMinutes >= 19 * 60 && totalMinutes <= 23 * 60 + 30);
  }, 'Horario fuera del servicio (12:00-16:00 o 19:00-23:30)'),
  zona_preferida: z.number().int().optional().nullable(),
  ocasion_especial: z.string().max(100, 'Máximo 100 caracteres').optional(),
  peticiones_especiales: z.string().max(500, 'Máximo 500 caracteres').optional(),
  origen: z.enum(['web', 'telefono', 'presencial', 'terceros']).default('web'),
});

type ReservationFormData = z.infer<typeof ReservationSchema>;

interface ReservationFormProps {
  onSuccess?: (reservation: any) => void;
  defaultValues?: Partial<ReservationFormData>;
  className?: string;
}

export function ReservationForm({ 
  onSuccess, 
  defaultValues,
  className = "" 
}: ReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(ReservationSchema),
    defaultValues: {
      nombre_reserva: '',
      email_reserva: '',
      telefono_reserva: '',
      numero_personas: 2,
      numero_ninos: 0,
      fecha_reserva: '',
      hora_reserva: '',
      zona_preferida: null,
      ocasion_especial: '',
      peticiones_especiales: '',
      origen: 'web',
      ...defaultValues,
    },
  });

  const onSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Server Action call con campos reales de DB
      const result = await createReservation({
        nombre_reserva: data.nombre_reserva,
        email_reserva: data.email_reserva || null,
        telefono_reserva: data.telefono_reserva.startsWith('+34') ? data.telefono_reserva : `+34${data.telefono_reserva}`,
        numero_personas: data.numero_personas,
        numero_ninos: data.numero_ninos || 0,
        fecha_reserva: data.fecha_reserva,
        hora_reserva: data.hora_reserva,
        zona_preferida: data.zona_preferida,
        ocasion_especial: data.ocasion_especial || null,
        peticiones_especiales: data.peticiones_especiales || null,
        origen: data.origen,
        estado: 'pendiente',
      });

      if (result.success) {
        toast({
          title: "Reserva Creada",
          description: `Reserva para ${data.nombre_reserva} creada exitosamente.`,
        });
        
        form.reset();
        onSuccess?.(result.data);
      } else {
        throw new Error(result.error || 'Error al crear reserva');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Error inesperado',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Nueva Reserva
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre Completo</Label>
              <Input
                id="customerName"
                placeholder="Juan Pérez"
                {...form.register('customerName')}
                aria-describedby="customerName-error"
              />
              {form.formState.errors.customerName && (
                <p id="customerName-error" className="text-sm text-red-600">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                {...form.register('email')}
                aria-describedby="email-error"
              />
              {form.formState.errors.email && (
                <p id="email-error" className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+34 666 123 456"
                {...form.register('phone')}
                aria-describedby="phone-error"
              />
              {form.formState.errors.phone && (
                <p id="phone-error" className="text-sm text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="partySize">Número de Personas</Label>
              <Select 
                value={form.watch('partySize')?.toString()} 
                onValueChange={(value) => form.setValue('partySize', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {num} {num === 1 ? 'persona' : 'personas'}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.partySize && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.partySize.message}
                </p>
              )}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...form.register('date')}
                aria-describedby="date-error"
              />
              {form.formState.errors.date && (
                <p id="date-error" className="text-sm text-red-600">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Select 
                value={form.watch('time')} 
                onValueChange={(value) => form.setValue('time', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {/* Horarios de 12:00 a 23:30 cada 30 minutos */}
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = Math.floor(12 + i / 2);
                    const minute = i % 2 === 0 ? '00' : '30';
                    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                    return (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {form.formState.errors.time && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Solicitudes Especiales */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Solicitudes Especiales (Opcional)</Label>
            <Textarea
              id="specialRequests"
              placeholder="Alergias, celebraciones, preferencias de mesa..."
              rows={3}
              {...form.register('specialRequests')}
              aria-describedby="specialRequests-error"
            />
            {form.formState.errors.specialRequests && (
              <p id="specialRequests-error" className="text-sm text-red-600">
                {form.formState.errors.specialRequests.message}
              </p>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creando...' : 'Crear Reserva'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}