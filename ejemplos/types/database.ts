// Tipos TypeScript actualizados según estructura real de DB
// Patrón: Database Types + Real Schema + Multi-Schema Support

export type Database = {
  public: {
    Tables: {
      // Tablas del esquema public
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
  restaurante: {
    Tables: {
      zonas: {
        Row: {
          id: number
          codigo: string
          nombre: string
          descripcion: string | null
          ubicacion: string | null
          capacidad: number
          activa: boolean
          orden: number
          caracteristicas: Json
          foto_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          codigo: string
          nombre: string
          descripcion?: string | null
          ubicacion?: string | null
          capacidad: number
          activa?: boolean
          orden?: number
          caracteristicas?: Json
          foto_url?: string | null
        }
        Update: {
          codigo?: string
          nombre?: string
          descripcion?: string | null
          ubicacion?: string | null
          capacidad?: number
          activa?: boolean
          orden?: number
          caracteristicas?: Json
          foto_url?: string | null
        }
      }
      mesas: {
        Row: {
          id: number
          numero_mesa: number
          zona_id: number | null
          capacidad: number
          capacidad_maxima: number | null
          combinable: boolean | null
          activa: boolean | null
          posicion_x: number | null
          posicion_y: number | null
          forma: string | null
          caracteristicas: Json
          notas: string | null
          created_at: string
          updated_at: string
          capacidad_maxima_fusion: number | null
          fusion_group_id: number | null
          fusion_state: 'individual' | 'fusion_master' | 'fusion_slave' | 'blocked'
        }
        Insert: {
          numero_mesa: number
          zona_id?: number | null
          capacidad: number
          capacidad_maxima?: number | null
          combinable?: boolean | null
          activa?: boolean | null
          posicion_x?: number | null
          posicion_y?: number | null
          forma?: string | null
          caracteristicas?: Json
          notas?: string | null
          capacidad_maxima_fusion?: number | null
          fusion_group_id?: number | null
          fusion_state?: 'individual' | 'fusion_master' | 'fusion_slave' | 'blocked'
        }
        Update: {
          numero_mesa?: number
          zona_id?: number | null
          capacidad?: number
          capacidad_maxima?: number | null
          combinable?: boolean | null
          activa?: boolean | null
          posicion_x?: number | null
          posicion_y?: number | null
          forma?: string | null
          caracteristicas?: Json
          notas?: string | null
          capacidad_maxima_fusion?: number | null
          fusion_group_id?: number | null
          fusion_state?: 'individual' | 'fusion_master' | 'fusion_slave' | 'blocked'
        }
      }
      clientes: {
        Row: {
          id: number
          nombre: string
          apellidos: string | null
          email: string | null
          telefono: string | null
          telefono_alternativo: string | null
          fecha_nacimiento: string | null
          direccion: string | null
          ciudad: string | null
          codigo_postal: string | null
          pais: string | null
          empresa: string | null
          notas: string | null
          preferencias: Json
          segmentacion: string | null
          valor_cliente: number | null
          fecha_registro: string
          ultima_visita: string | null
          numero_visitas: number
          gasto_total: number | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          nombre: string
          apellidos?: string | null
          email?: string | null
          telefono?: string | null
          telefono_alternativo?: string | null
          fecha_nacimiento?: string | null
          direccion?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          pais?: string | null
          empresa?: string | null
          notas?: string | null
          preferencias?: Json
          segmentacion?: string | null
          valor_cliente?: number | null
          ultima_visita?: string | null
          numero_visitas?: number
          gasto_total?: number | null
          activo?: boolean
        }
        Update: {
          nombre?: string
          apellidos?: string | null
          email?: string | null
          telefono?: string | null
          telefono_alternativo?: string | null
          fecha_nacimiento?: string | null
          direccion?: string | null
          ciudad?: string | null
          codigo_postal?: string | null
          pais?: string | null
          empresa?: string | null
          notas?: string | null
          preferencias?: Json
          segmentacion?: string | null
          valor_cliente?: number | null
          ultima_visita?: string | null
          numero_visitas?: number
          gasto_total?: number | null
          activo?: boolean
        }
      }
      reservas: {
        Row: {
          id: number
          cliente_id: number | null
          nombre_reserva: string
          email_reserva: string | null
          telefono_reserva: string
          fecha_reserva: string
          hora_reserva: string
          duracion_estimada: number | null
          numero_personas: number
          numero_ninos: number | null
          mesa_id: number | null
          mesa_asignada_en: string | null
          zona_preferida: number | null
          mesas_combinadas: number[] | null
          estado: 'pendiente' | 'confirmada' | 'sentada' | 'completada' | 'cancelada' | 'no_show'
          ocasion_especial: string | null
          peticiones_especiales: string | null
          origen: string | null
          confirmada_en: string | null
          cancelada_en: string | null
          motivo_cancelacion: string | null
          notas_internas: string | null
          precio_estimado: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          cliente_id?: number | null
          nombre_reserva: string
          email_reserva?: string | null
          telefono_reserva: string
          fecha_reserva: string
          hora_reserva: string
          duracion_estimada?: number | null
          numero_personas: number
          numero_ninos?: number | null
          mesa_id?: number | null
          zona_preferida?: number | null
          ocasion_especial?: string | null
          peticiones_especiales?: string | null
          origen?: string | null
          notas_internas?: string | null
          precio_estimado?: number | null
        }
        Update: {
          cliente_id?: number | null
          nombre_reserva?: string
          email_reserva?: string | null
          telefono_reserva?: string
          fecha_reserva?: string
          hora_reserva?: string
          duracion_estimada?: number | null
          numero_personas?: number
          numero_ninos?: number | null
          mesa_id?: number | null
          zona_preferida?: number | null
          estado?: 'pendiente' | 'confirmada' | 'sentada' | 'completada' | 'cancelada' | 'no_show'
          ocasion_especial?: string | null
          peticiones_especiales?: string | null
          origen?: string | null
          notas_internas?: string | null
          precio_estimado?: number | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      estado_reserva: 'pendiente' | 'confirmada' | 'sentada' | 'completada' | 'cancelada' | 'no_show'
    }
  }
  personal: {
    Tables: {
      empleados: {
        Row: {
          id: number
          user_id: string | null
          nombre: string
          email: string
          rol: 'admin' | 'gerente' | 'staff' | 'host'
          activo: boolean
          tiene_acceso_sistema: boolean
          telefono: string | null
          fecha_contratacion: string | null
          salario: number | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string | null
          nombre: string
          email: string
          rol: 'admin' | 'gerente' | 'staff' | 'host'
          activo?: boolean
          tiene_acceso_sistema?: boolean
          telefono?: string | null
          fecha_contratacion?: string | null
          salario?: number | null
          notas?: string | null
        }
        Update: {
          user_id?: string | null
          nombre?: string
          email?: string
          rol?: 'admin' | 'gerente' | 'staff' | 'host'
          activo?: boolean
          tiene_acceso_sistema?: boolean
          telefono?: string | null
          fecha_contratacion?: string | null
          salario?: number | null
          notas?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      rol_empleado: 'admin' | 'gerente' | 'staff' | 'host'
    }
  }
  operaciones: {
    Tables: {
      estados_mesa: {
        Row: {
          id: number
          mesa_id: number
          estado: string
          cambio_realizado_por: number | null
          fecha_cambio: string
          notas: string | null
          reserva_id: number | null
        }
        Insert: {
          mesa_id: number
          estado: string
          cambio_realizado_por?: number | null
          notas?: string | null
          reserva_id?: number | null
        }
        Update: {
          mesa_id?: number
          estado?: string
          cambio_realizado_por?: number | null
          notas?: string | null
          reserva_id?: number | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Tipos derivados para uso común
export type Zona = Database['restaurante']['Tables']['zonas']['Row']
export type Mesa = Database['restaurante']['Tables']['mesas']['Row']
export type Cliente = Database['restaurante']['Tables']['clientes']['Row']
export type Reserva = Database['restaurante']['Tables']['reservas']['Row']
export type Empleado = Database['personal']['Tables']['empleados']['Row']
export type EstadoMesa = Database['operaciones']['Tables']['estados_mesa']['Row']

// Tipos para inserts
export type NuevaZona = Database['restaurante']['Tables']['zonas']['Insert']
export type NuevaMesa = Database['restaurante']['Tables']['mesas']['Insert']
export type NuevoCliente = Database['restaurante']['Tables']['clientes']['Insert']
export type NuevaReserva = Database['restaurante']['Tables']['reservas']['Insert']
export type NuevoEmpleado = Database['personal']['Tables']['empleados']['Insert']

// Tipos para updates
export type ActualizarZona = Database['restaurante']['Tables']['zonas']['Update']
export type ActualizarMesa = Database['restaurante']['Tables']['mesas']['Update']
export type ActualizarCliente = Database['restaurante']['Tables']['clientes']['Update']
export type ActualizarReserva = Database['restaurante']['Tables']['reservas']['Update']
export type ActualizarEmpleado = Database['personal']['Tables']['empleados']['Update']

// Tipos de relaciones con joins
export type MesaConZona = Mesa & {
  zona: Zona | null
}

export type ReservaCompleta = Reserva & {
  cliente: Cliente | null
  mesa: MesaConZona | null
}

export type ReservaConMesaYZona = Reserva & {
  mesa: {
    id: number
    numero_mesa: number
    capacidad: number
    zona: {
      id: number
      nombre: string
      codigo: string
    } | null
  } | null
}

// Enum de estados
export type EstadoReserva = Database['restaurante']['Enums']['estado_reserva']
export type RolEmpleado = Database['personal']['Enums']['rol_empleado']

// Tipo para JSON genérico
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Tipos para configuración de esquemas
export type SchemaName = 'public' | 'restaurante' | 'personal' | 'crm' | 'operaciones'

// Configuración de cliente Supabase con esquemas
export interface SupabaseClientConfig {
  url: string
  anonKey: string
  schema?: SchemaName
}

// Tipos de respuesta para APIs
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filtros comunes para queries
export interface FiltrosReservas {
  fecha_desde?: string
  fecha_hasta?: string
  estado?: EstadoReserva
  zona_id?: number
  mesa_id?: number
}

export interface FiltrosMesas {
  zona_id?: number
  activa?: boolean
  capacidad_min?: number
  capacidad_max?: number
  disponible?: boolean
}