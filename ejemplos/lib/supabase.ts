// Cliente Supabase configurado para multi-schema
// Patrón: Multi-Schema Support + Environment Configuration + Type Safety

import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database, SchemaName } from '@/types/database'

// Configuración de esquemas disponibles
export const AVAILABLE_SCHEMAS: SchemaName[] = [
  'public',
  'restaurante', 
  'personal',
  'crm',
  'operaciones'
]

export const DEFAULT_SCHEMA: SchemaName = 'restaurante'

// URLs y claves desde variables de entorno
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://localhost:8000'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

// Cliente para componentes del cliente (browser)
export function createSupabaseClient(schema: SchemaName = DEFAULT_SCHEMA) {
  return createClientComponentClient<Database>({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    options: {
      global: {
        headers: {
          'Accept-Profile': schema,
          'Content-Profile': schema,
        },
      },
      db: {
        schema: schema,
      },
    },
  })
}

// Cliente para componentes del servidor (server-side)
export function createSupabaseServerClient(schema: SchemaName = DEFAULT_SCHEMA) {
  const cookieStore = cookies()
  
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    options: {
      global: {
        headers: {
          'Accept-Profile': schema,
          'Content-Profile': schema,
        },
      },
      db: {
        schema: schema,
      },
    },
  })
}

// Cliente con service role (para operaciones administrativas)
export function createSupabaseAdminClient(schema: SchemaName = DEFAULT_SCHEMA) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      headers: {
        'Accept-Profile': schema,
        'Content-Profile': schema,
      },
    },
    db: {
      schema: schema,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Factory para crear clientes con diferentes esquemas
export class SupabaseClientFactory {
  // Cliente para el esquema restaurante (principal)
  static restaurante() {
    return createSupabaseClient('restaurante')
  }

  // Cliente para el esquema personal (empleados)
  static personal() {
    return createSupabaseClient('personal')
  }

  // Cliente para el esquema CRM
  static crm() {
    return createSupabaseClient('crm')
  }

  // Cliente para el esquema operaciones
  static operaciones() {
    return createSupabaseClient('operaciones')
  }

  // Cliente para esquema público
  static public() {
    return createSupabaseClient('public')
  }

  // Cliente administrativo con service role
  static admin(schema: SchemaName = 'restaurante') {
    return createSupabaseAdminClient(schema)
  }

  // Cliente de servidor
  static server(schema: SchemaName = 'restaurante') {
    return createSupabaseServerClient(schema)
  }
}

// Helper para queries cross-schema
export class CrossSchemaClient {
  private clients: Map<SchemaName, ReturnType<typeof createSupabaseClient>>

  constructor() {
    this.clients = new Map()
    
    // Inicializar clientes para cada esquema
    AVAILABLE_SCHEMAS.forEach(schema => {
      this.clients.set(schema, createSupabaseClient(schema))
    })
  }

  // Obtener cliente para un esquema específico
  getClient(schema: SchemaName) {
    const client = this.clients.get(schema)
    if (!client) {
      throw new Error(`No client found for schema: ${schema}`)
    }
    return client
  }

  // Query que involucra múltiples esquemas
  async queryMultiSchema<T = any>(queries: Array<{
    schema: SchemaName
    query: (client: ReturnType<typeof createSupabaseClient>) => Promise<{ data: T[] | null, error: any }>
  }>) {
    const results = await Promise.all(
      queries.map(async ({ schema, query }) => {
        const client = this.getClient(schema)
        const result = await query(client)
        return { schema, ...result }
      })
    )

    return results
  }
}

// Helpers para queries comunes
export class QueryHelpers {
  // Query con joins entre esquemas (simulado)
  static async getReservaCompleta(reservaId: number) {
    const restauranteClient = SupabaseClientFactory.restaurante()
    
    // Query principal de reserva
    const { data: reserva, error: reservaError } = await restauranteClient
      .from('reservas')
      .select(`
        *,
        mesa:mesas!inner(
          id,
          numero_mesa,
          capacidad,
          zona:zonas!inner(
            id,
            nombre,
            codigo
          )
        )
      `)
      .eq('id', reservaId)
      .single()

    if (reservaError) {
      return { data: null, error: reservaError }
    }

    // Si hay cliente_id, obtener datos del cliente
    let cliente = null
    if (reserva.cliente_id) {
      const { data: clienteData } = await restauranteClient
        .from('clientes')
        .select('*')
        .eq('id', reserva.cliente_id)
        .single()
      
      cliente = clienteData
    }

    return {
      data: {
        ...reserva,
        cliente
      },
      error: null
    }
  }

  // Query de mesas con estado actual
  static async getMesasConEstado(zonaId?: number) {
    const restauranteClient = SupabaseClientFactory.restaurante()
    const operacionesClient = SupabaseClientFactory.operaciones()

    // Obtener mesas
    let mesasQuery = restauranteClient
      .from('mesas')
      .select(`
        *,
        zona:zonas!inner(
          id,
          nombre,
          codigo
        )
      `)
      .eq('activa', true)

    if (zonaId) {
      mesasQuery = mesasQuery.eq('zona_id', zonaId)
    }

    const { data: mesas, error: mesasError } = await mesasQuery

    if (mesasError || !mesas) {
      return { data: null, error: mesasError }
    }

    // Obtener estados actuales de las mesas
    const mesaIds = mesas.map(mesa => mesa.id)
    const { data: estados } = await operacionesClient
      .from('estados_mesa')
      .select('*')
      .in('mesa_id', mesaIds)
      .order('fecha_cambio', { ascending: false })

    // Combinar mesas con sus estados más recientes
    const mesasConEstado = mesas.map(mesa => {
      const estadoActual = estados?.find(estado => estado.mesa_id === mesa.id)
      return {
        ...mesa,
        estado_actual: estadoActual?.estado || 'libre'
      }
    })

    return { data: mesasConEstado, error: null }
  }

  // Query de empleados con permisos
  static async getEmpleadoConPermisos(userId: string) {
    const personalClient = SupabaseClientFactory.personal()

    const { data: empleado, error } = await personalClient
      .from('empleados')
      .select('*')
      .eq('user_id', userId)
      .eq('activo', true)
      .eq('tiene_acceso_sistema', true)
      .single()

    if (error || !empleado) {
      return { data: null, error: error || new Error('Empleado no encontrado') }
    }

    // Mapear permisos según rol
    const permisos = getPermisosPorRol(empleado.rol)

    return {
      data: {
        ...empleado,
        permisos
      },
      error: null
    }
  }
}

// Helper para permisos por rol
function getPermisosPorRol(rol: string): string[] {
  const permisosPorRol: Record<string, string[]> = {
    admin: [
      'reservas.*', 'mesas.*', 'clientes.*', 'empleados.*', 
      'zonas.*', 'analytics.*', 'settings.*'
    ],
    gerente: [
      'reservas.*', 'mesas.*', 'clientes.*', 
      'analytics.read', 'settings.read'
    ],
    staff: [
      'reservas.read', 'reservas.write', 'mesas.read', 'mesas.write',
      'clientes.read', 'clientes.write'
    ],
    host: [
      'reservas.read', 'reservas.write', 'clientes.read', 'mesas.read'
    ]
  }

  return permisosPorRol[rol] || []
}

// Configuración de real-time
export function setupRealtimeSubscription(
  schema: SchemaName,
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  const client = createSupabaseClient(schema)
  
  let subscription = client
    .channel(`${schema}.${table}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: schema, 
        table: table,
        filter: filter 
      }, 
      callback
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Singleton para el cliente multi-schema
export const crossSchemaClient = new CrossSchemaClient()

// Exportar clientes por defecto
export const supabase = SupabaseClientFactory.restaurante()
export const supabasePersonal = SupabaseClientFactory.personal()
export const supabaseOperaciones = SupabaseClientFactory.operaciones()