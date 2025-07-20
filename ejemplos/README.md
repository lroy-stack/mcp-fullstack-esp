# Ejemplos MCP Full Stack Developer

Ejemplos de código actualizados según la estructura real de la base de datos Enigma. Estos ejemplos demuestran las mejores prácticas para construir aplicaciones full-stack con Next.js, Supabase y TypeScript.

## 🏗️ Estructura Real de la Base de Datos

### Esquemas Principales

```sql
restaurante.*    -- Negocio principal: zonas, mesas, clientes, reservas
personal.*       -- Gestión de personal: empleados con roles
crm.*           -- CRM avanzado: interacciones, segmentaciones, campañas
operaciones.*   -- Operaciones diarias: estados_mesa, combinaciones
```

### Campos Reales de Tablas Principales

#### `restaurante.mesas`
```typescript
{
  id: number
  numero_mesa: number        // ⚠️ No "numero"
  zona_id: number
  capacidad: number
  capacidad_maxima: number
  combinable: boolean
  activa: boolean
  posicion_x: number
  posicion_y: number
  forma: string
  caracteristicas: JSON
  fusion_group_id: number
  fusion_state: string
}
```

#### `restaurante.reservas`
```typescript
{
  id: number
  cliente_id: number
  nombre_reserva: string     // ⚠️ No "cliente_nombre"
  email_reserva: string      // ⚠️ No "cliente_email"
  telefono_reserva: string   // ⚠️ No "cliente_telefono"
  fecha_reserva: string
  hora_reserva: string
  numero_personas: number
  numero_ninos: number
  mesa_id: number
  zona_preferida: number
  ocasion_especial: string
  peticiones_especiales: string
  estado: enum
}
```

#### `personal.empleados`
```typescript
{
  id: number
  user_id: string
  nombre: string
  email: string
  rol: 'admin' | 'gerente' | 'staff' | 'host'
  activo: boolean
  tiene_acceso_sistema: boolean
}
```

## 🚀 Configuración de Desarrollo

### 1. Variables de Entorno

Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Para Docker Stack Local

```bash
# URLs para desarrollo con Docker
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=tu_anon_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
```

### 3. Para Supabase Cloud

```bash
# URLs para Supabase Cloud
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_cloud
```

## 📁 Estructura de Archivos

```
ejemplos/
├── .env.example                 # Configuración de ejemplo
├── .env.docker                  # Configuración Docker
├── types/
│   └── database.ts              # Tipos TypeScript actualizados
├── lib/
│   ├── supabase.ts             # Cliente multi-schema
│   └── validations.ts          # Validaciones Zod actualizadas
├── components/
│   ├── reservation-form.tsx    # Formulario con campos reales
│   └── table-grid.tsx          # Grid con numero_mesa
├── hooks/
│   ├── use-realtime-data.ts    # Real-time multi-schema
│   └── use-optimistic-updates.ts
├── pages/
│   ├── dashboard-page.tsx      # Server Components
│   ├── reservations-page.tsx   # CRUD completo
│   └── analytics-page.tsx      # Métricas de negocio
├── database/
│   ├── schema-design.sql       # Esquema actualizado
│   ├── rls-policies.sql        # Políticas RLS reales
│   └── functions.sql           # Funciones de DB
├── auth/
│   ├── middleware.ts           # Middleware Next.js
│   └── auth-helpers.ts         # Context de autenticación
└── testing/
    ├── component.test.tsx      # Tests de componentes
    ├── api.test.ts             # Tests de API
    └── e2e.spec.ts             # Tests E2E
```

## 🔧 Configuración Multi-Schema

### Cliente Supabase

```typescript
import { SupabaseClientFactory } from '@/lib/supabase'

// Cliente para esquema restaurante
const restaurante = SupabaseClientFactory.restaurante()

// Cliente para esquema personal
const personal = SupabaseClientFactory.personal()

// Cliente administrativo
const admin = SupabaseClientFactory.admin('restaurante')
```

### Headers Requeridos

```typescript
// Para queries multi-schema
headers: {
  'Accept-Profile': 'restaurante',
  'Content-Profile': 'restaurante',
}
```

## 📝 Ejemplos de Uso

### 1. Crear Reserva

```typescript
import { NuevaReservaSchema } from '@/lib/validations'
import { SupabaseClientFactory } from '@/lib/supabase'

const client = SupabaseClientFactory.restaurante()

const nuevaReserva = {
  nombre_reserva: "Juan Pérez",           // Campo real
  telefono_reserva: "+34612345678",      // Campo real
  email_reserva: "juan@ejemplo.com",     // Campo real
  numero_personas: 4,
  fecha_reserva: "2024-12-25",
  hora_reserva: "14:00",
  origen: "web"
}

// Validar con Zod
const validData = NuevaReservaSchema.parse(nuevaReserva)

// Insertar en DB
const { data, error } = await client
  .from('reservas')
  .insert(validData)
```

### 2. Obtener Mesas con Zona

```typescript
const { data: mesas } = await client
  .from('mesas')
  .select(`
    id,
    numero_mesa,                          // Campo real
    capacidad,
    activa,
    zona:zonas!inner(
      id,
      nombre,
      codigo
    )
  `)
  .eq('activa', true)
```

### 3. Real-time con Schema

```typescript
import { useRealtimeData } from '@/hooks/use-realtime-data'

const { data, state } = useRealtimeData({
  table: 'reservas',
  schema: 'restaurante',                  // Schema específico
  filter: 'estado=eq.confirmada'
}, {
  onUpdate: (payload) => {
    console.log('Reserva actualizada:', payload)
  }
})
```

## 🔐 Autenticación y Permisos

### RLS Policies Reales

```sql
-- Empleados activos pueden ver reservas
CREATE POLICY "empleados_ven_reservas" ON restaurante.reservas
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM personal.empleados e 
      WHERE e.user_id = auth.uid() 
      AND e.activo = true 
      AND e.tiene_acceso_sistema = true
    )
  );
```

### Verificación de Permisos

```typescript
import { QueryHelpers } from '@/lib/supabase'

// Obtener empleado con permisos
const { data: empleado } = await QueryHelpers.getEmpleadoConPermisos(userId)

if (empleado?.permisos.includes('reservas.write')) {
  // Usuario puede crear/editar reservas
}
```

## 🧪 Testing

### Test de Componentes

```bash
npm run test                    # Tests unitarios
npm run test:coverage          # Con coverage
```

### Test de API

```bash
npm run test:api               # Tests de endpoints
```

### Test E2E

```bash
npm run test:e2e               # Tests end-to-end
```

## 🚦 Validación de Datos

### Campos Obligatorios

```typescript
// Para reservas
nombre_reserva: string         // Obligatorio, 2-200 chars
telefono_reserva: string       // Obligatorio, formato español
numero_personas: number        // Obligatorio, 1-20
fecha_reserva: string          // Obligatorio, formato YYYY-MM-DD
hora_reserva: string           // Obligatorio, horario de servicio

// Para mesas
numero_mesa: number            // Obligatorio, único
capacidad: number              // Obligatorio, > 0
zona_id: number               // Opcional
```

### Validaciones de Negocio

```typescript
// Horarios de servicio: 12:00-16:00 y 19:00-23:30
// Máximo 20 personas por reserva online
// Teléfonos formato español: +34XXXXXXXXX
// Fechas futuras o presentes
```

## 🔄 Real-time Updates

### Suscripciones Configuradas

```typescript
// Estados de mesa en tiempo real
setupRealtimeSubscription(
  'operaciones',
  'estados_mesa',
  (payload) => updateTableState(payload)
)

// Nuevas reservas
setupRealtimeSubscription(
  'restaurante', 
  'reservas',
  (payload) => updateReservations(payload),
  'estado=eq.confirmada'
)
```

## 📊 Analytics y Métricas

### Queries de Ejemplo

```typescript
// Reservas por día
const { data } = await client.rpc('get_reservas_por_dia', {
  fecha_inicio: '2024-01-01',
  fecha_fin: '2024-12-31'
})

// Ocupación por zona
const { data } = await client.rpc('get_ocupacion_zona', {
  zona_id: 1,
  fecha: '2024-12-25'
})
```

## ⚡ Optimizaciones

### Performance

- **Virtual Scrolling** para listas grandes
- **Lazy Loading** de componentes pesados
- **Optimistic Updates** para UX fluida
- **Cache Strategy** con TanStack Query

### SEO

- **Server Components** para SSR
- **Metadata API** de Next.js 14
- **Structured Data** para reservas

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Servidor desarrollo
npm run build                 # Build producción
npm run start                 # Servidor producción

# Base de datos
npm run db:push               # Aplicar cambios schema
npm run db:generate           # Generar tipos TS

# Calidad
npm run lint                  # ESLint
npm run type-check            # TypeScript
npm run format                # Prettier

# Testing
npm run test:watch            # Tests en modo watch
npm run test:ui               # UI de testing
```

## 📚 Recursos Adicionales

- [Documentación Supabase](https://supabase.com/docs)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

## 🤝 Contribución

1. Seguir estructura de archivos establecida
2. Usar tipos TypeScript estrictos
3. Incluir tests para nuevas funcionalidades
4. Documentar cambios en este README
5. No exponer credenciales o datos sensibles

---

**Nota Importante**: Todos los ejemplos están actualizados según la estructura real de la base de datos. Los nombres de campos y esquemas coinciden exactamente con la implementación en producción.