# Patrones de Diseño y Arquitectura para MCP Full Stack

Este documento detalla los patrones de diseño y arquitectura implementados en los ejemplos del servidor MCP Full Stack Developer, siguiendo las especificaciones de CLAUDE.md.

## Índice

1. [Patrones de Arquitectura](#patrones-de-arquitectura)
2. [Patrones de Diseño Frontend](#patrones-de-diseño-frontend)
3. [Patrones de Backend](#patrones-de-backend)
4. [Patrones de Base de Datos](#patrones-de-base-de-datos)
5. [Patrones de Seguridad](#patrones-de-seguridad)
6. [Patrones de Testing](#patrones-de-testing)
7. [Patrones de Performance](#patrones-de-performance)

---

## Patrones de Arquitectura

### 1. Multi-Schema Database Organization

**Problema**: Organizar datos complejos de manera escalable y mantenible.

**Solución**: Separación en esquemas especializados con IDs organizados.

```sql
-- Esquemas organizacionales
restaurante.*     # Negocio principal: zonas, mesas, clientes, reservas
personal.*        # Gestión de personal: empleados con roles
crm.*            # CRM avanzado: interacciones, segmentaciones, campañas
operaciones.*    # Operaciones diarias: estados_mesa, combinaciones
```

**Beneficios**:
- Separación clara de responsabilidades
- Facilita el mantenimiento y escalabilidad
- Permite permisos granulares por esquema
- IDs organizados mejoran la comprensión del sistema

**Ejemplo de Implementación**:
```typescript
// hooks/use-realtime-data.ts - línea 45
const config = {
  table: 'reservas',
  schema: 'restaurante',  // Esquema específico
  filter: 'status=eq.active'
};
```

### 2. Event-Driven Architecture con Real-time

**Problema**: Sincronización de estado entre múltiples usuarios y componentes.

**Solución**: Sistema de eventos con Supabase Real-time y triggers de base de datos.

```typescript
// Patrón Observer con Supabase
const { data, state } = useRealtimeData({
  table: 'estados_mesa',
  schema: 'operaciones'
}, {
  onUpdate: (payload) => {
    // Trigger automático cuando cambia estado de mesa
    updateOptimistically('update', payload);
  }
});
```

**Componentes**:
- **Publishers**: Triggers de base de datos
- **Subscribers**: Hooks React con real-time
- **Event Bus**: Supabase Real-time channels
- **State Management**: TanStack Query + Optimistic Updates

### 3. Layered Architecture

**Estructura**:
```
Presentation Layer     # Pages & Components
├── Business Logic     # Custom Hooks & Services  
├── Data Access        # API Routes & Database Functions
└── Infrastructure     # Supabase, Auth, External APIs
```

**Implementación**:
```typescript
// pages/reservations-page.tsx - Presentation
export default function ReservationsPage() {
  const { data } = useReservationData(); // Business Logic
  return <ReservationsList data={data} />;
}

// hooks/use-reservation-data.ts - Business Logic
export function useReservationData() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: () => api.getReservations() // Data Access
  });
}
```

---

## Patrones de Diseño Frontend

### 1. Container/Presenter Pattern

**Problema**: Separar lógica de negocio de la presentación.

**Solución**: Componentes containers que manejan estado y lógica, componentes presentacionales puros.

```typescript
// Container Component
function ReservationFormContainer() {
  const { mutate, isLoading } = useCreateReservation();
  const { hasPermission } = useAuth();
  
  return (
    <ReservationFormPresenter 
      onSubmit={mutate}
      isLoading={isLoading}
      canCreate={hasPermission('reservations.create')}
    />
  );
}

// Presenter Component
function ReservationFormPresenter({ onSubmit, isLoading, canCreate }) {
  // Solo lógica de UI, sin side effects
  return <form onSubmit={onSubmit}>...</form>;
}
```

### 2. Compound Components Pattern

**Problema**: Crear componentes flexibles y reutilizables.

**Implementación**:
```typescript
// components/tables/TableGrid.tsx
export function TableGrid({ children, onTableClick }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="table-grid">
        {children}
      </div>
    </DndProvider>
  );
}

TableGrid.Zone = function TableZone({ children, zoneName }) {
  return (
    <div className="table-zone">
      <h3>{zoneName}</h3>
      {children}
    </div>
  );
};

TableGrid.Table = function TableCard({ table, onTableClick }) {
  return <TableCard table={table} onClick={onTableClick} />;
};

// Uso
<TableGrid>
  <TableGrid.Zone zoneName="Terraza Justicia">
    <TableGrid.Table table={table1} />
    <TableGrid.Table table={table2} />
  </TableGrid.Zone>
</TableGrid>
```

### 3. Custom Hooks Pattern

**Problema**: Reutilizar lógica de estado compleja entre componentes.

**Solución**: Hooks especializados que encapsulan lógica específica.

```typescript
// hooks/use-optimistic-updates.ts
export function useOptimisticUpdates<T>() {
  const [state, setState] = useState<OptimisticState>();
  
  const optimisticCreate = useCallback(async (
    queryKey: string[],
    newData: T,
    serverOperation: () => Promise<T>
  ) => {
    // Aplicar cambio optimista inmediatamente
    queryClient.setQueryData(queryKey, (old: T[]) => [newData, ...old]);
    
    try {
      const result = await serverOperation();
      // Reemplazar con resultado real del servidor
      queryClient.setQueryData(queryKey, (old: T[]) => 
        old.map(item => item.id === newData.id ? result : item)
      );
      return result;
    } catch (error) {
      // Revertir cambio optimista
      queryClient.setQueryData(queryKey, (old: T[]) => 
        old.filter(item => item.id !== newData.id)
      );
      throw error;
    }
  }, []);
  
  return { optimisticCreate, optimisticUpdate, optimisticDelete };
}
```

### 4. Higher-Order Components (HOC) Pattern

**Problema**: Añadir funcionalidad cross-cutting a componentes.

```typescript
// auth/auth-helpers.ts - línea 580
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasRole } = useAuth();
    
    if (!isAuthenticated) {
      return <LoginForm />;
    }
    
    if (requiredRoles && !hasRole(requiredRoles)) {
      return <UnauthorizedMessage />;
    }
    
    return <Component {...props} />;
  };
}

// Uso
const ProtectedAnalytics = withAuth(AnalyticsPage, ['manager', 'admin']);
```

---

## Patrones de Backend

### 1. Repository Pattern con Supabase

**Problema**: Abstraer acceso a datos y facilitar testing.

```typescript
// services/reservation-repository.ts
export class ReservationRepository {
  constructor(private supabase: SupabaseClient) {}
  
  async findByDate(date: string): Promise<Reservation[]> {
    const { data, error } = await this.supabase
      .from('reservas')
      .select(`
        *,
        cliente:restaurante.clientes(*),
        mesa:restaurante.mesas(*, zona:restaurante.zonas(*))
      `)
      .eq('fecha_reserva', date)
      .order('hora_reserva');
      
    if (error) throw new DatabaseError(error.message);
    return data as Reservation[];
  }
  
  async create(reservation: CreateReservationData): Promise<Reservation> {
    const { data, error } = await this.supabase
      .from('reservas')
      .insert(reservation)
      .select()
      .single();
      
    if (error) throw new DatabaseError(error.message);
    return data as Reservation;
  }
}
```

### 2. Service Layer Pattern

**Problema**: Encapsular lógica de negocio compleja.

```typescript
// services/reservation-service.ts
export class ReservationService {
  constructor(
    private repo: ReservationRepository,
    private tableService: TableService,
    private notificationService: NotificationService
  ) {}
  
  async createReservation(data: CreateReservationData): Promise<Reservation> {
    // 1. Validar datos de negocio
    await this.validateBusinessRules(data);
    
    // 2. Crear reserva
    const reservation = await this.repo.create(data);
    
    // 3. Intentar asignación automática de mesa
    if (data.autoAssignTable) {
      await this.tableService.autoAssign(reservation.id);
    }
    
    // 4. Enviar notificaciones
    await this.notificationService.sendConfirmation(reservation);
    
    return reservation;
  }
  
  private async validateBusinessRules(data: CreateReservationData) {
    // Validaciones específicas del dominio
    if (data.numero_personas > 20) {
      throw new BusinessError('Máximo 20 personas por reserva online');
    }
    
    if (!this.isValidServiceHour(data.hora_reserva)) {
      throw new BusinessError('Horario fuera de servicio');
    }
  }
}
```

### 3. Command Query Responsibility Segregation (CQRS)

**Problema**: Optimizar lecturas y escrituras por separado.

```typescript
// commands/create-reservation.command.ts
export class CreateReservationCommand {
  constructor(private service: ReservationService) {}
  
  async execute(data: CreateReservationData): Promise<CommandResult> {
    try {
      const reservation = await this.service.createReservation(data);
      
      return {
        success: true,
        data: reservation,
        events: [
          new ReservationCreatedEvent(reservation),
          new AuditLogEvent('reservation_created', reservation.id)
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// queries/get-reservations.query.ts
export class GetReservationsQuery {
  constructor(private repo: ReservationRepository) {}
  
  async execute(filters: ReservationFilters): Promise<QueryResult> {
    const reservations = await this.repo.findByFilters(filters);
    
    return {
      data: reservations,
      meta: {
        total: reservations.length,
        hasMore: reservations.length >= filters.limit
      }
    };
  }
}
```

### 4. Factory Pattern para Validaciones

```typescript
// validation/validation-factory.ts
export class ValidationFactory {
  static createValidator(type: string): Validator {
    switch (type) {
      case 'reservation':
        return new ReservationValidator();
      case 'client':
        return new ClientValidator();
      case 'table':
        return new TableValidator();
      default:
        throw new Error(`Unknown validation type: ${type}`);
    }
  }
}

export class ReservationValidator implements Validator {
  validate(data: any): ValidationResult {
    const schema = z.object({
      cliente_nombre: z.string().min(2).max(100),
      numero_personas: z.number().min(1).max(20),
      fecha_reserva: z.string().refine(date => {
        return new Date(date) >= new Date();
      }, 'Fecha debe ser futura')
    });
    
    return schema.safeParse(data);
  }
}
```

---

## Patrones de Base de Datos

### 1. Row Level Security (RLS) Pattern

**Problema**: Seguridad granular a nivel de fila basada en roles.

```sql
-- database/rls-policies.sql
-- Patrón: Políticas dinámicas basadas en contexto
CREATE POLICY "empleados_ven_reservas_activas" ON restaurante.reservas
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND fecha_reserva >= CURRENT_DATE - INTERVAL '7 days'
        AND (
            -- Staff puede ver reservas recientes
            auth.get_current_employee_role() IN ('staff', 'gerente', 'admin')
            OR
            -- Hosts solo ven reservas de hoy
            (auth.get_current_employee_role() = 'host' AND fecha_reserva = CURRENT_DATE)
        )
    );
```

### 2. Audit Trail Pattern

**Problema**: Rastrear todos los cambios en el sistema.

```sql
-- database/triggers.sql - línea 45
CREATE OR REPLACE FUNCTION audit.log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.logs (
        table_name,
        operation,
        record_id,
        old_values,
        new_values,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.get_current_employee_id()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### 3. Stored Procedures for Business Logic

**Problema**: Centralizar lógica compleja en la base de datos.

```sql
-- database/functions.sql - línea 45
CREATE OR REPLACE FUNCTION operaciones.verificar_disponibilidad_mesa(
    p_mesa_id INTEGER,
    p_fecha_hora_inicio TIMESTAMPTZ,
    p_duracion_minutos INTEGER DEFAULT 120
)
RETURNS TABLE(disponible BOOLEAN, razon TEXT, sugerencias JSONB) AS $$
DECLARE
    mesa_activa BOOLEAN;
    conflictos INTEGER;
BEGIN
    -- Verificar que la mesa está activa
    SELECT activa INTO mesa_activa 
    FROM restaurante.mesas 
    WHERE id = p_mesa_id;
    
    IF NOT mesa_activa THEN
        RETURN QUERY SELECT false, 'Mesa fuera de servicio', 
                     operaciones.sugerir_mesas_alternativas(p_mesa_id);
        RETURN;
    END IF;
    
    -- Verificar conflictos de horario
    SELECT COUNT(*) INTO conflictos
    FROM restaurante.reservas r
    WHERE r.mesa_id = p_mesa_id
    AND r.fecha_reserva = p_fecha_hora_inicio::DATE
    AND r.estado IN ('confirmada', 'sentada')
    AND (
        (p_fecha_hora_inicio, p_fecha_hora_inicio + (p_duracion_minutos || ' minutes')::INTERVAL) 
        OVERLAPS 
        (r.hora_reserva, r.hora_reserva + (r.duracion_estimada_minutos || ' minutes')::INTERVAL)
    );
    
    IF conflictos > 0 THEN
        RETURN QUERY SELECT false, 'Mesa ocupada', 
                     operaciones.sugerir_horarios_alternativos(p_mesa_id, p_fecha_hora_inicio::DATE);
    ELSE
        RETURN QUERY SELECT true, 'Mesa disponible', '[]'::JSONB;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 4. Soft Delete Pattern

```sql
-- Patrón para eliminación lógica
ALTER TABLE restaurante.clientes ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE restaurante.clientes ADD COLUMN deleted_by INTEGER REFERENCES personal.empleados(id);

-- View que excluye registros eliminados
CREATE VIEW restaurante.clientes_activos AS
SELECT * FROM restaurante.clientes 
WHERE deleted_at IS NULL;

-- RLS policy que respeta soft delete
CREATE POLICY "clientes_no_eliminados" ON restaurante.clientes
    FOR SELECT
    USING (deleted_at IS NULL);
```

---

## Patrones de Seguridad

### 1. Defense in Depth

**Implementación en múltiples capas**:

```typescript
// Capa 1: Middleware de Next.js
export async function middleware(request: NextRequest) {
  // Verificación de autenticación
  const session = await getSession(request);
  if (!session) return redirectToLogin(request);
  
  // Verificación de roles
  const hasAccess = await checkRouteAccess(pathname, session.user);
  if (!hasAccess) return redirectToUnauthorized(request);
  
  // Rate limiting
  const rateLimitOk = await checkRateLimit(request, session.user);
  if (!rateLimitOk) return rateLimitResponse();
  
  return NextResponse.next();
}

// Capa 2: API Route validation
export async function POST(request: Request) {
  // Validación de entrada
  const body = await request.json();
  const validatedData = ReservationSchema.safeParse(body);
  if (!validatedData.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  // Verificación de permisos específicos
  const canCreate = await checkPermission(user, 'reservations.create');
  if (!canCreate) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Lógica de negocio
}

// Capa 3: RLS en base de datos (automática)
```

### 2. Principle of Least Privilege

```typescript
// auth/auth-helpers.ts - línea 640
const ROLE_PERMISSIONS = {
  'host': [
    'reservations.read',
    'clients.read',
    'tables.read'
  ],
  'staff': [
    'reservations.read', 'reservations.write',
    'clients.read', 'clients.write',
    'tables.read', 'tables.write'
  ],
  'gerente': [
    'reservations.*',
    'clients.*',
    'tables.*',
    'analytics.read'
  ],
  'admin': ['*'] // Todos los permisos
};

export function hasPermission(user: AuthUser, permission: string): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission) || userPermissions.includes('*');
}
```

### 3. Input Validation Pattern

```typescript
// Validación en múltiples niveles
export const ReservationSchema = z.object({
  cliente_nombre: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
    
  cliente_telefono: z
    .string()
    .regex(/^(\+34)?[6-9]\d{8}$/, 'Formato teléfono español inválido')
    .transform(phone => phone.startsWith('+34') ? phone : `+34${phone}`),
    
  numero_personas: z
    .number()
    .min(1, 'Mínimo 1 persona')
    .max(20, 'Máximo 20 personas'),
    
  fecha_reserva: z
    .string()
    .refine(date => new Date(date) >= new Date(), 'Fecha debe ser futura'),
    
  hora_reserva: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato hora inválido')
    .refine(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      return (totalMinutes >= 12 * 60 && totalMinutes <= 16 * 60) ||
             (totalMinutes >= 19 * 60 && totalMinutes <= 23 * 60 + 30);
    }, 'Horario fuera de servicio')
});
```

---

## Patrones de Testing

### 1. Test Pyramid Pattern

```
     /\
    /  \    E2E Tests (Playwright)
   /____\   - User journeys
  /      \  - Cross-browser
 /        \ - Performance
/__________\
Integration   API Tests (MSW)
Tests         - API contracts
              - Database integration
              - Authentication flows
              
Unit Tests    Component Tests (RTL)
- Components  - User interactions  
- Hooks       - Accessibility
- Utils       - Error states
```

### 2. Page Object Model (E2E)

```typescript
// testing/e2e.spec.ts - línea 200
class ReservationPage {
  constructor(private page: Page) {}
  
  async createReservation(data: ReservationData) {
    await this.page.click('[data-testid="new-reservation-button"]');
    await this.fillForm(data);
    await this.page.click('[data-testid="submit-reservation-button"]');
    await this.waitForSuccess();
  }
  
  private async fillForm(data: ReservationData) {
    await this.page.fill('[data-testid="cliente-nombre-input"]', data.nombre);
    await this.page.fill('[data-testid="cliente-telefono-input"]', data.telefono);
    // ... más campos
  }
  
  private async waitForSuccess() {
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
  }
}
```

### 3. Mock Service Worker Pattern

```typescript
// __mocks__/api-handlers.ts
export const reservationHandlers = [
  rest.get('/api/reservations', (req, res, ctx) => {
    const status = req.url.searchParams.get('status');
    let reservations = mockReservations;
    
    if (status) {
      reservations = reservations.filter(r => r.status === status);
    }
    
    return res(ctx.json({ success: true, reservations }));
  }),
  
  rest.post('/api/reservations', async (req, res, ctx) => {
    const newReservation = await req.json();
    
    // Simular validación
    if (!newReservation.cliente_nombre) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Nombre requerido' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({ 
        success: true, 
        reservation: { id: Date.now(), ...newReservation }
      })
    );
  })
];
```

---

## Patrones de Performance

### 1. Cache-First Pattern

```typescript
// hooks/use-data-cache.ts - línea 150
const CACHE_STRATEGIES = {
  'aggressive': {
    staleTime: 30 * 60 * 1000,    // 30 minutos
    gcTime: 60 * 60 * 1000,       // 1 hora
    refetchOnWindowFocus: false
  },
  'real-time': {
    staleTime: 0,                 // Siempre stale
    gcTime: 1 * 60 * 1000,        // 1 minuto
    refetchInterval: 30000        // 30 segundos
  }
};

export function useDataCache(config: CacheConfig) {
  const strategy = CACHE_STRATEGIES[config.strategy];
  
  return useQuery({
    queryKey: config.queryKey,
    queryFn: config.queryFn,
    ...strategy,
    // Prefetch automático de datos relacionados
    onSuccess: (data) => {
      if (config.enablePrefetch) {
        prefetchRelatedData(data);
      }
    }
  });
}
```

### 2. Optimistic Updates Pattern

```typescript
// hooks/use-optimistic-updates.ts - línea 120
export function useOptimisticUpdates<T>() {
  const optimisticCreate = useCallback(async (
    queryKey: string[],
    newData: T,
    serverOperation: () => Promise<T>
  ) => {
    // 1. Actualización optimista inmediata
    queryClient.setQueryData(queryKey, (old: T[] = []) => [newData, ...old]);
    
    try {
      // 2. Operación en servidor
      const serverResult = await serverOperation();
      
      // 3. Reemplazar con resultado real
      queryClient.setQueryData(queryKey, (old: T[] = []) =>
        old.map(item => item.id === newData.id ? serverResult : item)
      );
      
      return serverResult;
    } catch (error) {
      // 4. Rollback en caso de error
      queryClient.setQueryData(queryKey, (old: T[] = []) =>
        old.filter(item => item.id !== newData.id)
      );
      throw error;
    }
  }, []);
  
  return { optimisticCreate };
}
```

### 3. Virtual Scrolling Pattern

```typescript
// Para listas grandes de reservas
import { FixedSizeList as List } from 'react-window';

function ReservationsList({ reservations }: { reservations: Reservation[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ReservationCard reservation={reservations[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={reservations.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### 4. Code Splitting Pattern

```typescript
// Lazy loading de páginas pesadas
const AnalyticsPage = lazy(() => import('./pages/analytics-page'));
const ReportsPage = lazy(() => import('./pages/reports-page'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/analytics" element={
          <Suspense fallback={<AnalyticsLoading />}>
            <AnalyticsPage />
          </Suspense>
        } />
        <Route path="/reports" element={
          <Suspense fallback={<ReportsLoading />}>
            <ReportsPage />
          </Suspense>
        } />
      </Routes>
    </Router>
  );
}
```

---

## Conclusiones

Los patrones implementados en este proyecto proporcionan:

1. **Escalabilidad**: Arquitectura modular que permite crecimiento
2. **Mantenibilidad**: Separación clara de responsabilidades
3. **Seguridad**: Múltiples capas de protección
4. **Performance**: Optimizaciones en cada nivel
5. **Testabilidad**: Estructura que facilita testing
6. **Reusabilidad**: Componentes y hooks reutilizables

Estos patrones deben ser aplicados consistentemente y adaptados según las necesidades específicas de cada implementación.