// Validaciones Zod actualizadas según estructura real de DB
// Patrón: Schema Validation + Real Database Fields + Business Rules

import { z } from 'zod'

// Validaciones para esquema restaurante

// Schema para crear nueva reserva
export const NuevaReservaSchema = z.object({
  // Información del cliente (puede venir de cliente existente o nuevo)
  cliente_id: z.number().optional().nullable(),
  nombre_reserva: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  email_reserva: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  telefono_reserva: z
    .string()
    .regex(/^(\+34)?[6-9]\d{8}$/, 'Formato de teléfono español inválido')
    .transform(phone => phone.startsWith('+34') ? phone : `+34${phone}`),
  
  // Información de la reserva
  fecha_reserva: z
    .string()
    .refine(date => {
      const reservaDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return reservaDate >= today
    }, 'La fecha debe ser hoy o posterior'),
  hora_reserva: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido')
    .refine(time => {
      const [hours, minutes] = time.split(':').map(Number)
      const totalMinutes = hours * 60 + minutes
      // Horarios de servicio: 12:00-16:00 y 19:00-23:30
      return (totalMinutes >= 12 * 60 && totalMinutes <= 16 * 60) ||
             (totalMinutes >= 19 * 60 && totalMinutes <= 23 * 60 + 30)
    }, 'Horario fuera del servicio (12:00-16:00 o 19:00-23:30)'),
  
  numero_personas: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 persona')
    .max(20, 'Máximo 20 personas por reserva online'),
  numero_ninos: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo')
    .optional(),
  
  // Información opcional
  zona_preferida: z.number().int().optional().nullable(),
  ocasion_especial: z
    .string()
    .max(100, 'Máximo 100 caracteres')
    .optional(),
  peticiones_especiales: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional(),
  origen: z
    .enum(['web', 'telefono', 'presencial', 'terceros'])
    .default('web'),
})

// Schema para actualizar reserva
export const ActualizarReservaSchema = NuevaReservaSchema.partial().extend({
  id: z.number().int(),
  estado: z.enum(['pendiente', 'confirmada', 'sentada', 'completada', 'cancelada', 'no_show']).optional(),
  mesa_id: z.number().int().optional().nullable(),
  notas_internas: z.string().max(500).optional(),
})

// Schema para nueva mesa
export const NuevaMesaSchema = z.object({
  numero_mesa: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'El número de mesa debe ser positivo'),
  zona_id: z.number().int().optional().nullable(),
  capacidad: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'La capacidad debe ser al menos 1')
    .max(20, 'Capacidad máxima 20 personas'),
  capacidad_maxima: z
    .number()
    .int('Debe ser un número entero')
    .min(1)
    .optional()
    .nullable(),
  combinable: z.boolean().default(true),
  activa: z.boolean().default(true),
  posicion_x: z.number().optional().nullable(),
  posicion_y: z.number().optional().nullable(),
  forma: z
    .enum(['cuadrada', 'rectangular', 'circular', 'oval'])
    .default('cuadrada'),
  caracteristicas: z.record(z.any()).default({}),
  notas: z.string().max(500).optional(),
})

// Schema para actualizar mesa
export const ActualizarMesaSchema = NuevaMesaSchema.partial().extend({
  id: z.number().int(),
})

// Schema para nuevo cliente
export const NuevoClienteSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellidos: z
    .string()
    .max(150, 'Los apellidos no pueden exceder 150 caracteres')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(255)
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .regex(/^(\+34)?[6-9]\d{8}$/, 'Formato de teléfono español inválido')
    .optional()
    .or(z.literal('')),
  telefono_alternativo: z
    .string()
    .regex(/^(\+34)?[6-9]\d{8}$/, 'Formato de teléfono español inválido')
    .optional()
    .or(z.literal('')),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional(),
  direccion: z.string().max(500).optional(),
  ciudad: z.string().max(100).optional(),
  codigo_postal: z
    .string()
    .regex(/^\d{5}$/, 'Código postal español inválido')
    .optional(),
  pais: z.string().max(100).default('España'),
  empresa: z.string().max(255).optional(),
  notas: z.string().max(1000).optional(),
  preferencias: z.record(z.any()).default({}),
})

// Schema para actualizar cliente
export const ActualizarClienteSchema = NuevoClienteSchema.partial().extend({
  id: z.number().int(),
})

// Schema para nueva zona
export const NuevaZonaSchema = z.object({
  codigo: z
    .string()
    .min(1, 'El código es requerido')
    .max(10, 'El código no puede exceder 10 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Solo letras mayúsculas y números'),
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().max(500).optional(),
  ubicacion: z.string().max(200).optional(),
  capacidad: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'La capacidad debe ser al menos 1'),
  activa: z.boolean().default(true),
  orden: z.number().int().min(1).optional(),
  caracteristicas: z.record(z.any()).default({}),
  foto_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

// Schema para actualizar zona
export const ActualizarZonaSchema = NuevaZonaSchema.partial().extend({
  id: z.number().int(),
})

// Schema para empleado
export const NuevoEmpleadoSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(255),
  rol: z.enum(['admin', 'gerente', 'staff', 'host']),
  activo: z.boolean().default(true),
  tiene_acceso_sistema: z.boolean().default(true),
  telefono: z
    .string()
    .regex(/^(\+34)?[6-9]\d{8}$/, 'Formato de teléfono español inválido')
    .optional()
    .or(z.literal('')),
  fecha_contratacion: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional(),
  salario: z.number().positive().optional().nullable(),
  notas: z.string().max(1000).optional(),
})

// Schema para actualizar empleado
export const ActualizarEmpleadoSchema = NuevoEmpleadoSchema.partial().extend({
  id: z.number().int(),
})

// Schema para cambio de estado de mesa
export const CambioEstadoMesaSchema = z.object({
  mesa_id: z.number().int(),
  estado: z.enum(['libre', 'ocupada', 'reservada', 'limpieza', 'fuera_servicio']),
  notas: z.string().max(500).optional(),
  reserva_id: z.number().int().optional().nullable(),
})

// Schema para asignación de mesa
export const AsignacionMesaSchema = z.object({
  reserva_id: z.number().int(),
  mesa_id: z.number().int(),
  forzar_asignacion: z.boolean().default(false),
})

// Schema para filtros de búsqueda
export const FiltrosReservasSchema = z.object({
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  estado: z.enum(['pendiente', 'confirmada', 'sentada', 'completada', 'cancelada', 'no_show']).optional(),
  zona_id: z.number().int().optional(),
  mesa_id: z.number().int().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export const FiltrosMesasSchema = z.object({
  zona_id: z.number().int().optional(),
  activa: z.boolean().optional(),
  capacidad_min: z.number().int().min(1).optional(),
  capacidad_max: z.number().int().max(20).optional(),
  disponible: z.boolean().optional(),
  fecha: z.string().optional(),
  hora: z.string().optional(),
})

// Schema para paginación
export const PaginacionSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
})

// Funciones de validación útiles

export function validarFormatoTelefono(telefono: string): boolean {
  return /^(\+34)?[6-9]\d{8}$/.test(telefono)
}

export function validarHorarioServicio(hora: string): boolean {
  const [hours, minutes] = hora.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes
  return (totalMinutes >= 12 * 60 && totalMinutes <= 16 * 60) ||
         (totalMinutes >= 19 * 60 && totalMinutes <= 23 * 60 + 30)
}

export function validarFechaFutura(fecha: string): boolean {
  const reservaDate = new Date(fecha)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return reservaDate >= today
}

export function normalizarTelefono(telefono: string): string {
  return telefono.startsWith('+34') ? telefono : `+34${telefono}`
}

// Tipos derivados de los schemas
export type NuevaReservaData = z.infer<typeof NuevaReservaSchema>
export type ActualizarReservaData = z.infer<typeof ActualizarReservaSchema>
export type NuevaMesaData = z.infer<typeof NuevaMesaSchema>
export type ActualizarMesaData = z.infer<typeof ActualizarMesaSchema>
export type NuevoClienteData = z.infer<typeof NuevoClienteSchema>
export type ActualizarClienteData = z.infer<typeof ActualizarClienteSchema>
export type NuevaZonaData = z.infer<typeof NuevaZonaSchema>
export type ActualizarZonaData = z.infer<typeof ActualizarZonaSchema>
export type NuevoEmpleadoData = z.infer<typeof NuevoEmpleadoSchema>
export type ActualizarEmpleadoData = z.infer<typeof ActualizarEmpleadoSchema>
export type CambioEstadoMesaData = z.infer<typeof CambioEstadoMesaSchema>
export type AsignacionMesaData = z.infer<typeof AsignacionMesaSchema>
export type FiltrosReservasData = z.infer<typeof FiltrosReservasSchema>
export type FiltrosMesasData = z.infer<typeof FiltrosMesasSchema>
export type PaginacionData = z.infer<typeof PaginacionSchema>