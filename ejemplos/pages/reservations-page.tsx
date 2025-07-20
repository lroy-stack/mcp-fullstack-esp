// Ejemplo: Página de Reservas con Formularios y Validación Zod
// Patrón: App Router + Server Actions + Zod Validation + Optimistic Updates + Error Boundaries

'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { createReservation, updateReservationStatus } from '../actions/reservations';
import { toast } from '@/hooks/use-toast';

// Esquema de validación Zod siguiendo reglas de negocio
const ReservationSchema = z.object({
  cliente_nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  cliente_telefono: z
    .string()
    .regex(/^(\+34)?[6-9]\d{8}$/, 'Formato de teléfono español inválido (ej: 612345678)')
    .transform(phone => phone.startsWith('+34') ? phone : `+34${phone}`),
  
  cliente_email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  numero_personas: z
    .number()
    .min(1, 'Mínimo 1 persona')
    .max(20, 'Máximo 20 personas para reservas online'),
  
  fecha_reserva: z
    .string()
    .refine(date => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'La fecha debe ser hoy o posterior'),
  
  hora_reserva: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .refine(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      // Horario de servicio: 12:00 - 16:00 y 19:00 - 23:30
      return (totalMinutes >= 12 * 60 && totalMinutes <= 16 * 60) ||
             (totalMinutes >= 19 * 60 && totalMinutes <= 23 * 60 + 30);
    }, 'Horario fuera del servicio (12:00-16:00 o 19:00-23:30)'),
  
  zona_preferencia: z
    .enum(['terraza_justicia', 'terraza_campanari', 'sala_principal', 'sala_vip', 'sin_preferencia'])
    .default('sin_preferencia'),
  
  notas_especiales: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
  
  origen: z
    .enum(['web', 'whatsapp', 'email', 'telefono', 'presencial'])
    .default('web')
});

type ReservationFormData = z.infer<typeof ReservationSchema>;

// Tipos para las reservas existentes
interface Reservation {
  id: number;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  numero_personas: number;
  fecha_reserva: string;
  hora_reserva: string;
  estado: 'pendiente' | 'confirmada' | 'sentada' | 'completada' | 'cancelada' | 'no_show';
  zona_preferencia: string;
  mesa_asignada?: {
    numero: string;
    zona: { nombre: string };
  };
  notas_especiales?: string;
  created_at: string;
}

// Componente de formulario de nueva reserva
function NewReservationForm() {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  
  const form = useForm<ReservationFormData>({
    resolver: zodResolver(ReservationSchema),
    defaultValues: {
      zona_preferencia: 'sin_preferencia',
      origen: 'web'
    }
  });

  const { mutate: createReservationMutation, isPending: isCreating } = useMutation({
    mutationFn: async (data: ReservationFormData) => {
      const result = await createReservation(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (newReservation) => {
      // Optimistic update
      queryClient.setQueryData(['reservations'], (old: Reservation[] = []) => 
        [newReservation, ...old]
      );
      
      form.reset();
      toast({
        title: "Reserva Creada",
        description: `Reserva para ${newReservation.cliente_nombre} creada exitosamente.`,
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error al Crear Reserva",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ReservationFormData) => {
    startTransition(() => {
      createReservationMutation(data);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Nueva Reserva
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información del Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_nombre">Nombre Completo *</Label>
                <Input
                  id="cliente_nombre"
                  {...form.register('cliente_nombre')}
                  placeholder="Juan Pérez"
                  className={form.formState.errors.cliente_nombre ? 'border-red-500' : ''}
                />
                {form.formState.errors.cliente_nombre && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.cliente_nombre.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cliente_telefono">Teléfono *</Label>
                <Input
                  id="cliente_telefono"
                  {...form.register('cliente_telefono')}
                  placeholder="612345678"
                  className={form.formState.errors.cliente_telefono ? 'border-red-500' : ''}
                />
                {form.formState.errors.cliente_telefono && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.cliente_telefono.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="cliente_email">Email (opcional)</Label>
                <Input
                  id="cliente_email"
                  type="email"
                  {...form.register('cliente_email')}
                  placeholder="juan@ejemplo.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Detalles de la reserva */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Detalles de la Reserva</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fecha_reserva">Fecha *</Label>
                <Input
                  id="fecha_reserva"
                  type="date"
                  {...form.register('fecha_reserva')}
                  min={new Date().toISOString().split('T')[0]}
                  className={form.formState.errors.fecha_reserva ? 'border-red-500' : ''}
                />
                {form.formState.errors.fecha_reserva && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.fecha_reserva.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="hora_reserva">Hora *</Label>
                <Input
                  id="hora_reserva"
                  type="time"
                  {...form.register('hora_reserva')}
                  className={form.formState.errors.hora_reserva ? 'border-red-500' : ''}
                />
                {form.formState.errors.hora_reserva && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.hora_reserva.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="numero_personas">Número de Personas *</Label>
                <Input
                  id="numero_personas"
                  type="number"
                  min="1"
                  max="20"
                  {...form.register('numero_personas', { valueAsNumber: true })}
                  className={form.formState.errors.numero_personas ? 'border-red-500' : ''}
                />
                {form.formState.errors.numero_personas && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.numero_personas.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="zona_preferencia">Zona de Preferencia</Label>
              <Select {...form.register('zona_preferencia')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona preferida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_preferencia">Sin Preferencia</SelectItem>
                  <SelectItem value="terraza_justicia">Terraza Justicia</SelectItem>
                  <SelectItem value="terraza_campanari">Terraza Campanari</SelectItem>
                  <SelectItem value="sala_principal">Sala Principal</SelectItem>
                  <SelectItem value="sala_vip">Sala VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notas_especiales">Notas Especiales</Label>
              <Textarea
                id="notas_especiales"
                {...form.register('notas_especiales')}
                placeholder="Alergias, celebraciones especiales, etc."
                rows={3}
                className="resize-none"
              />
              {form.formState.errors.notas_especiales && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.notas_especiales.message}
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending || isCreating}
            >
              Limpiar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isCreating}
              className="min-w-32"
            >
              {isPending || isCreating ? 'Creando...' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Lista de reservas existentes
function ReservationsList() {
  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const response = await fetch('/api/reservations?status=active');
      if (!response.ok) throw new Error('Error al cargar reservas');
      const data = await response.json();
      return data.reservations as Reservation[];
    },
    staleTime: 30000,
    refetchInterval: 60000, // Actualizar cada minuto
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-500';
      case 'confirmada': return 'bg-blue-500';
      case 'sentada': return 'bg-green-500';
      case 'completada': return 'bg-gray-500';
      case 'cancelada': return 'bg-red-500';
      case 'no_show': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reservas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las reservas. Por favor, recarga la página.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reservas de Hoy ({reservations.length})</span>
          <Badge variant="outline">{new Date().toLocaleDateString('es-ES')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay reservas para hoy</p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(reservation.estado)}`} />
                  <div>
                    <h4 className="font-medium">{reservation.cliente_nombre}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {reservation.hora_reserva}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {reservation.numero_personas}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {reservation.cliente_telefono}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {reservation.estado.replace('_', ' ')}
                  </Badge>
                  {reservation.mesa_asignada && (
                    <Badge variant="secondary">
                      Mesa {reservation.mesa_asignada.numero}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Página principal de reservas
export default function ReservationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="mt-2 text-gray-600">
            Crear nuevas reservas y gestionar las existentes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de nueva reserva */}
          <div>
            <NewReservationForm />
          </div>

          {/* Lista de reservas */}
          <div>
            <ReservationsList />
          </div>
        </div>
      </div>
    </div>
  );
}