# Servidor MCP Full Stack Developer - Guía de Implementación

Esta guía proporciona las reglas de oro, patrones de implementación y estándares para construir el Servidor MCP Full Stack Developer usando Node.js, TypeScript, Next.js, y la metodología PRP. Para QUÉ construir, consulta el documento INITIAL.md.

## Principios Fundamentales

**IMPORTANTE: DEBES seguir estos principios en todos los cambios de código y generaciones de PRP:**

### KISS (Keep It Simple, Stupid)

- La simplicidad debe ser un objetivo clave en el diseño
- Elige soluciones directas sobre complejas siempre que sea posible
- Las soluciones simples son más fáciles de entender, mantener y depurar
- **Aplicación**: Cada herramienta MCP debe tener una responsabilidad clara y bien definida

### YAGNI (You Aren't Gonna Need It)

- Evita construir funcionalidad por especulación
- Implementa características solo cuando son necesarias, no cuando anticipas que podrían ser útiles en el futuro
- **Aplicación**: Genera solo el código mínimo viable que resuelve el requerimiento específico del PRP

### Principio Abierto/Cerrado

- Las entidades de software deben estar abiertas para extensión pero cerradas para modificación
- Diseña sistemas para que nueva funcionalidad pueda agregarse con cambios mínimos al código existente
- **Aplicación**: El conocimiento base y herramientas MCP deben ser extensibles sin modificar código core

### Metodología PRP Primero

- **TODO desarrollo debe seguir la metodología PRP estrictamente**
- Un PRP es PRD + inteligencia de código curada + agente/runbook
- **Flujo obligatorio**: INITIAL.md → PRP completo → Implementación → Validación
- **Nunca saltarse pasos** - la calidad del resultado depende de la calidad del PRP

## Gestión de Paquetes y Herramientas

**CRÍTICO: Este proyecto usa npm para gestión de paquetes Node.js y tecnologías modernas de desarrollo.**

### Stack Tecnológico Obligatorio

```bash
# Framework principal
Next.js 14+ con App Router
TypeScript 5+ estricto
React 18+ con Server Components

# Base de datos y backend
Supabase (PostgreSQL + pgvector)
Neo4j para knowledge graphs
Prisma para ORM y migraciones

# UI y estilos
Tailwind CSS
Shadcn/ui como sistema de diseño base
Radix UI para componentes headless
Framer Motion para animaciones

# Autenticación y seguridad
Supabase Auth
Zod para validación de esquemas
bcrypt para hashing

# Testing
Jest para tests unitarios
Playwright para tests E2E
React Testing Library para componentes
MSW para mocking de APIs

# Desarrollo
ESLint + Prettier estricto
Husky para git hooks
lint-staged para pre-commit
```

### Comandos Esenciales del Proyecto

```bash
# Instalación y setup
npm install
npm run setup          # Configurar base de datos y variables de entorno

# Desarrollo
npm run dev            # Servidor desarrollo Next.js
npm run mcp:dev        # Servidor MCP en modo desarrollo
npm run db:push        # Aplicar cambios de esquema a Supabase
npm run db:generate    # Generar tipos TypeScript desde esquema

# Testing
npm run test           # Tests unitarios con Jest
npm run test:e2e       # Tests end-to-end con Playwright
npm run test:coverage  # Coverage completo

# Calidad de código
npm run lint           # ESLint
npm run type-check     # Verificación TypeScript
npm run format         # Prettier

# Producción
npm run build          # Build optimizado
npm run start          # Servidor producción
npm run deploy         # Despliegue automático
```

## Directorio de Destino del Servidor MCP

**CRÍTICO: El servidor MCP Full Stack DEBE crearse en este directorio específico:**

```bash
# CREAR nuevo directorio para el servidor MCP Full Stack
mkdir mcp-fullstack-developer
cd mcp-fullstack-developer

# Inicializar proyecto Node.js
npm init -y
git init
```

**⚠️ NUNCA modificar el directorio actual `/Users/lr0y/prp-completo-docs/mcp-crawl4ai-rag/` - este contiene documentación y ejemplos de referencia**

## Arquitectura del Proyecto

**IMPORTANTE: Esta es la estructura obligatoria que debe seguir todo código generado.**

### Estructura de Directorios

```
/
├── src/                              # Código fuente principal
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Rutas autenticadas
│   │   ├── api/                      # API Routes
│   │   ├── globals.css               # Estilos globales
│   │   ├── layout.tsx                # Layout principal
│   │   └── page.tsx                  # Página principal
│   ├── components/                   # Componentes React
│   │   ├── ui/                       # Componentes base (shadcn/ui)
│   │   ├── forms/                    # Formularios especializados
│   │   ├── layouts/                  # Layouts reutilizables
│   │   └── domain/                   # Componentes específicos del dominio
│   ├── lib/                          # Utilidades y configuración
│   │   ├── auth.ts                   # Configuración autenticación
│   │   ├── db.ts                     # Cliente Supabase
│   │   ├── validations.ts            # Esquemas Zod
│   │   └── utils.ts                  # Utilidades generales
│   ├── hooks/                        # Custom React hooks
│   ├── types/                        # Definiciones TypeScript
│   └── mcp/                          # Servidor MCP
│       ├── server.ts                 # Servidor MCP principal
│       ├── tools/                    # Herramientas MCP
│       │   ├── parse-prp.ts         # Parseo de PRPs
│       │   ├── generate-component.ts # Generación componentes
│       │   ├── generate-api.ts      # Generación APIs
│       │   ├── search-knowledge.ts  # Búsqueda en knowledge base
│       │   └── query-graph.ts       # Consultas Neo4j
│       ├── knowledge/                # Sistema de conocimiento
│       │   ├── crawler.ts           # Web crawling
│       │   ├── embeddings.ts        # Generación embeddings
│       │   └── graph.ts             # Knowledge graph
│       └── utils/                    # Utilidades MCP
├── prisma/                           # Esquemas y migraciones
│   ├── schema.prisma                 # Esquema principal
│   └── migrations/                   # Migraciones SQL
├── tests/                            # Tests organizados
│   ├── __mocks__/                    # Mocks globales
│   ├── components/                   # Tests componentes
│   ├── pages/                        # Tests páginas
│   └── api/                          # Tests APIs
├── docs/                             # Documentación proyecto
│   ├── api/                          # Documentación APIs
│   ├── components/                   # Documentación componentes
│   └── deployment/                   # Guías despliegue
├── PRPs/                             # Product Requirement Prompts
│   ├── templates/                    # Templates PRP
│   └── implemented/                  # PRPs completados
└── config/                           # Configuraciones
    ├── tailwind.config.js            # Configuración Tailwind
    ├── next.config.js                # Configuración Next.js
    └── jest.config.js                # Configuración Jest
```

## Herramientas MCP: Especificaciones Técnicas

**CRÍTICO: Estas son las herramientas MCP que DEBEN implementarse. Cada una debe seguir estos patrones exactos.**

### 1. Herramientas de Análisis y Planificación

#### `parseFullStackPRP`
```typescript
interface ParsePRPInput {
  prpContent: string;
  projectContext?: ProjectContext;
}

interface ParsePRPOutput {
  frontend: {
    components: ComponentSpec[];
    pages: PageSpec[];
    styling: StylingRequirements;
    state: StateManagement;
  };
  backend: {
    apis: APISpec[];
    auth: AuthRequirements;
    middleware: MiddlewareSpec[];
  };
  database: {
    tables: TableSpec[];
    relationships: RelationshipSpec[];
    policies: RLSPolicy[];
  };
  deployment: DeploymentConfig;
  testing: TestingStrategy;
}

// REGLA: Usar Anthropic Claude para parseo, nunca regex
// REGLA: Extraer TODOS los requerimientos explícitos e implícitos
// REGLA: Generar especificaciones técnicas detalladas
```

#### `generateProjectArchitecture`
```typescript
interface ArchitectureInput {
  requirements: ParsePRPOutput;
  domain: ProjectDomain;
  constraints: TechnicalConstraints;
}

interface ArchitectureOutput {
  folderStructure: DirectoryTree;
  techStack: TechStackDecisions;
  componentHierarchy: ComponentTree;
  apiDesign: APIArchitecture;
  databaseDesign: DatabaseArchitecture;
  deploymentStrategy: DeploymentPlan;
}

// REGLA: Seguir estructura de directorios obligatoria
// REGLA: Usar solo tecnologías del stack aprobado
// REGLA: Aplicar patrones de arquitectura probados
```

### 2. Herramientas de Desarrollo Frontend

#### `generateComponent`
```typescript
interface ComponentInput {
  name: string;
  type: 'form' | 'display' | 'layout' | 'interactive';
  props: PropSpec[];
  styling: StylingSpec;
  accessibility: A11yRequirements;
}

interface ComponentOutput {
  component: {
    tsx: string;           // Código React + TypeScript
    types: string;         // Definiciones de tipos
    styles: string;        // Clases Tailwind
  };
  tests: {
    unit: string;          // Tests Jest + RTL
    integration: string;   // Tests de integración
    accessibility: string; // Tests a11y
  };
  storybook: string;       // Story de Storybook
  documentation: string;   // Documentación Markdown
}

// REGLA: SIEMPRE generar componentes con TypeScript estricto
// REGLA: SIEMPRE incluir tests automáticamente
// REGLA: SIEMPRE seguir patrones shadcn/ui
// REGLA: SIEMPRE incluir accesibilidad WCAG 2.1 AA
```

#### `generatePage`
```typescript
interface PageInput {
  route: string;
  layout: LayoutType;
  components: ComponentReference[];
  seo: SEORequirements;
  auth: AuthLevel;
}

interface PageOutput {
  page: string;            // Página Next.js
  layout: string;          // Layout específico si necesario
  metadata: string;        // Metadata y SEO
  loading: string;         // Loading UI
  error: string;           // Error boundaries
  tests: TestSuite;        // Tests E2E con Playwright
}

// REGLA: Usar Next.js App Router exclusivamente
// REGLA: Implementar Server Components cuando sea posible
// REGLA: Incluir loading states y error handling
// REGLA: Optimizar automáticamente para SEO
```

### 3. Herramientas de Desarrollo Backend

#### `generateAPI`
```typescript
interface APIInput {
  endpoint: string;
  method: HTTPMethod;
  auth: AuthRequirements;
  validation: ValidationSchema;
  business: BusinessLogic;
}

interface APIOutput {
  handler: string;         // API Route handler
  validation: string;      // Esquemas Zod
  middleware: string[];    // Middleware necesario
  tests: {
    unit: string;          // Tests unitarios
    integration: string;   // Tests integración
    security: string;      // Tests seguridad
  };
  documentation: string;   // OpenAPI spec
}

// REGLA: SIEMPRE validar input con Zod
// REGLA: SIEMPRE implementar rate limiting
// REGLA: SIEMPRE sanitizar errores en producción
// REGLA: SIEMPRE incluir logging estructurado
```

#### `generateDatabaseSchema`
```typescript
interface DatabaseInput {
  tables: TableDefinition[];
  relationships: Relationship[];
  security: SecurityRequirements;
  performance: PerformanceRequirements;
}

interface DatabaseOutput {
  schema: string;          // Prisma schema
  migrations: string[];    // Migraciones SQL
  types: string;           // Tipos TypeScript generados
  policies: string[];      // Políticas RLS
  seeds: string;           // Datos de prueba
}

// REGLA: SIEMPRE usar Prisma para ORM
// REGLA: SIEMPRE implementar RLS (Row Level Security)
// REGLA: SIEMPRE incluir índices de rendimiento
// REGLA: SIEMPRE validar integridad referencial
```

### 4. Herramientas de Conocimiento

#### `searchKnowledge`
```typescript
interface KnowledgeSearchInput {
  query: string;
  domain: ProjectDomain;
  type: 'component' | 'pattern' | 'solution' | 'documentation';
  context: SearchContext;
}

interface KnowledgeSearchOutput {
  results: SearchResult[];
  relevantPatterns: Pattern[];
  codeExamples: CodeExample[];
  recommendations: Recommendation[];
}

// REGLA: Usar embeddings de OpenAI para búsqueda semántica
// REGLA: Aplicar reranking para mejorar relevancia
// REGLA: Filtrar por dominio del proyecto
// REGLA: Incluir contexto en resultados
```

#### `queryProjectGraph`
```typescript
interface GraphQueryInput {
  query: string;
  nodeTypes: NodeType[];
  relationships: RelationType[];
  filters: GraphFilter[];
}

interface GraphQueryOutput {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  insights: ArchitecturalInsight[];
  recommendations: string[];
}

// REGLA: Usar Cypher para consultas Neo4j
// REGLA: Limitar resultados para evitar sobrecarga
// REGLA: Incluir métricas de relevancia
// REGLA: Generar insights arquitectónicos
```

## Integración con SuperClaude

**CRÍTICO: El servidor MCP DEBE integrarse perfectamente con el framework SuperClaude.**

### Mapeo de Personas

```yaml
Tareas_Frontend:
  persona: "--persona-frontend"
  herramientas: ["generateComponent", "generatePage", "searchKnowledge"]
  comandos: ["/build --feature --react", "/design --ui"]
  flags: ["--magic", "--c7"]

Tareas_Backend:
  persona: "--persona-backend"
  herramientas: ["generateAPI", "generateDatabaseSchema"]
  comandos: ["/build --api", "/design --database"]
  flags: ["--seq", "--security"]

Tareas_Arquitectura:
  persona: "--persona-architect"
  herramientas: ["parseFullStackPRP", "generateProjectArchitecture", "queryProjectGraph"]
  comandos: ["/analyze --arch", "/design --system"]
  flags: ["--ultrathink", "--seq"]

Tareas_Testing:
  persona: "--persona-qa"
  herramientas: ["generateTests", "validateQuality"]
  comandos: ["/test --coverage", "/validate --quality"]
  flags: ["--pup", "--strict"]

Tareas_Seguridad:
  persona: "--persona-security"
  herramientas: ["auditSecurity", "validateAuth"]
  comandos: ["/scan --security", "/analyze --vulnerabilities"]
  flags: ["--owasp", "--strict"]
```

### Workflows Automatizados

```yaml
Desarrollo_Completo:
  trigger: "PRP de nueva funcionalidad"
  steps:
    1: "parseFullStackPRP(prp) --persona-architect"
    2: "generateProjectArchitecture(requirements) --seq"
    3: "generateComponent(specs) --persona-frontend --magic"
    4: "generateAPI(endpoints) --persona-backend --security"
    5: "generateTests(all) --persona-qa --coverage"
    6: "validateQuality(codebase) --strict"

Optimización_Existente:
  trigger: "PRP de mejora"
  steps:
    1: "searchKnowledge(current_patterns) --c7"
    2: "analyzePerformance() --persona-performance"
    3: "generateOptimizations() --iterate"
    4: "validateImprovements() --benchmark"
```

## Estándares de Desarrollo

### Calidad de Código Obligatoria

```typescript
// REGLA: TypeScript estricto siempre
interface ExampleComponent {
  id: string;                    // Nunca 'any' o tipos implícitos
  title: string;
  onClick: (id: string) => void; // Funciones tipadas
  children?: React.ReactNode;    // Props opcionales explícitas
}

// REGLA: Validación Zod en todas las APIs
const CreateReservationSchema = z.object({
  customerId: z.string().uuid(),
  datetime: z.date().min(new Date()),
  partySize: z.number().min(1).max(20),
  notes: z.string().optional()
});

// REGLA: Error handling comprensivo
try {
  const result = await api.createReservation(data);
  return { success: true, data: result };
} catch (error) {
  logger.error('Failed to create reservation', { error, data });
  return { success: false, error: 'Failed to create reservation' };
}
```

### Seguridad Obligatoria

```sql
-- REGLA: RLS en todas las tablas sensibles
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = customer_id OR 
                   EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage all reservations" ON reservations
  FOR ALL USING (EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid()));
```

```typescript
// REGLA: Validación de entrada en todas las APIs
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validatedData = CreateReservationSchema.safeParse(body);
  
  if (!validatedData.success) {
    return NextResponse.json({ 
      error: 'Invalid input', 
      details: validatedData.error.issues 
    }, { status: 400 });
  }

  // Procesar datos validados...
}
```

### Testing Obligatorio

```typescript
// REGLA: Tests para cada componente
describe('ReservationForm', () => {
  it('should render all required fields', () => {
    render(<ReservationForm />);
    expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/party size/i)).toBeInTheDocument();
  });

  it('should validate input correctly', async () => {
    const onSubmit = jest.fn();
    render(<ReservationForm onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
    });
  });
});

// REGLA: Tests E2E para flujos críticos
test('user can create reservation', async ({ page }) => {
  await page.goto('/reservations/new');
  await page.fill('[data-testid="customer-select"]', 'john@example.com');
  await page.fill('[data-testid="date-picker"]', '2024-12-25');
  await page.fill('[data-testid="party-size"]', '4');
  await page.click('[data-testid="submit-button"]');
  
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Patterns de Implementación

### Componentes React

```typescript
// PATRÓN OBLIGATORIO: Componente con todas las mejores prácticas
interface ReservationFormProps {
  initialData?: Partial<Reservation>;
  onSubmit: (data: CreateReservationData) => Promise<void>;
  onCancel?: () => void;
}

export function ReservationForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: ReservationFormProps) {
  const form = useForm<CreateReservationData>({
    resolver: zodResolver(CreateReservationSchema),
    defaultValues: initialData
  });

  const handleSubmit = async (data: CreateReservationData) => {
    try {
      await onSubmit(data);
      toast.success('Reservation created successfully');
    } catch (error) {
      toast.error('Failed to create reservation');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <CustomerSelect {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create Reservation'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
```

### APIs Next.js

```typescript
// PATRÓN OBLIGATORIO: API con validación, auth y error handling
export async function POST(request: Request) {
  try {
    // 1. Autenticación
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // 2. Validación de entrada
    const body = await request.json();
    const validatedData = CreateReservationSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    // 3. Autorización (si necesaria)
    const hasPermission = await checkUserPermission(
      session.user.id, 
      'create_reservation'
    );
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 4. Lógica de negocio
    const reservation = await createReservation({
      ...validatedData.data,
      createdBy: session.user.id
    });

    // 5. Logging
    logger.info('Reservation created', {
      reservationId: reservation.id,
      userId: session.user.id
    });

    // 6. Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: reservation
    });

  } catch (error) {
    // 7. Error handling
    logger.error('Failed to create reservation', { error });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Variables de Entorno y Configuración

### Archivo .env.local Requerido

```bash
# Base de datos principal
DATABASE_URL="postgresql://user:pass@localhost:5432/fullstack_mcp"
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu_anon_key"
SUPABASE_SERVICE_KEY="tu_service_role_key"

# Knowledge Graph
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="tu_password"

# APIs externas
OPENAI_API_KEY="sk-tu-api-key"
ANTHROPIC_API_KEY="sk-ant-tu-api-key"

# Autenticación
NEXTAUTH_SECRET="tu_secret_muy_seguro"
NEXTAUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID="tu_github_client_id"
GITHUB_CLIENT_SECRET="tu_github_client_secret"

# Servidor MCP
MCP_SERVER_PORT=3001
MCP_TRANSPORT="sse"

# Características
NODE_ENV="development"
ENABLE_CRAWLING="true"
ENABLE_KNOWLEDGE_GRAPH="true"
CRAWL_INTERVAL_HOURS="24"
```

## Mejores Prácticas de Desarrollo

### Flujo de Desarrollo Obligatorio

1. **Analizar PRP completamente** antes de escribir código
2. **Generar arquitectura** usando `generateProjectArchitecture`
3. **Crear componentes** con `generateComponent` incluyendo tests
4. **Implementar APIs** con `generateAPI` incluyendo validación
5. **Ejecutar tests** automáticamente en cada cambio
6. **Validar calidad** con ESLint, TypeScript y tests de seguridad
7. **Documentar automáticamente** todos los cambios

### Comandos de Verificación

```bash
# Antes de cada commit
npm run lint           # ESLint debe pasar sin errores
npm run type-check     # TypeScript debe pasar sin errores
npm run test           # Todos los tests deben pasar
npm run test:e2e       # Tests E2E críticos deben pasar

# Antes de deploy
npm run build          # Build debe completarse sin errores
npm run test:coverage  # Coverage debe ser >= 80%
```

### Logging y Monitoreo

```typescript
// REGLA: Logging estructurado obligatorio
import { logger } from '@/lib/logger';

// En APIs
logger.info('API request', {
  method: request.method,
  url: request.url,
  userId: session?.user?.id,
  timestamp: new Date().toISOString()
});

// En errores
logger.error('Operation failed', {
  operation: 'createReservation',
  error: error.message,
  stack: error.stack,
  context: { userId, data }
});

// En métricas de negocio
logger.metric('reservation.created', {
  reservationId: reservation.id,
  customerId: reservation.customerId,
  revenue: reservation.estimatedRevenue
});
```

## Conocimiento Específico del Dominio (INMUTABLE)

**ANTES de usar Context7 o documentación externa, SIEMPRE consultar ejemplos locales:**

### **Referencias Obligatorias de Ejemplos Locales** (PRIMERA PRIORIDAD)
- **`ejemplos/README.md`**: Configuración real del proyecto y stack tecnológico validado
- **`ejemplos/components/`**: 50+ componentes React probados en producción del gestor de reservas
- **`ejemplos/database/`**: Esquemas SQL reales multi-schema (`restaurante.*`, `personal.*`, `crm.*`, `operaciones.*`)
- **`ejemplos/auth/`**: Middleware Supabase RLS real (`middleware.ts`, `auth-helpers.ts`)
- **`ejemplos/types/database.ts`**: Tipos TypeScript del dominio validados en producción
- **`ejemplos/testing/`**: Patterns de testing específicos del dominio (unitarios, integración, E2E)
- **`ejemplos/hooks/`**: Custom hooks especializados para el dominio del restaurante

### **Patrones Específicos del Gestor de Reservas** (OBLIGATORIOS)

#### **Esquemas de Base de Datos Reales** (`ejemplos/database/schema-design.sql`)
```sql
-- USAR CAMPOS REALES, NO INVENTAR
restaurante.reservas:
  - nombre_reserva    -- ⚠️ NO "cliente_nombre" 
  - email_reserva     -- ⚠️ NO "cliente_email"
  - telefono_reserva  -- ⚠️ NO "cliente_telefono"
  - numero_personas, numero_ninos, estado

restaurante.mesas:
  - numero_mesa       -- ⚠️ NO "numero"
  - capacidad, capacidad_maxima, zona_id
  - combinable, activa, posicion_x, posicion_y

personal.empleados:
  - user_id, nombre, email, rol
  - activo, tiene_acceso_sistema
```

#### **Configuración Multi-Schema** (`ejemplos/lib/supabase.ts`)
```typescript
// Headers OBLIGATORIOS para queries multi-schema
headers: {
  'Accept-Profile': 'restaurante',    // Schema para lectura
  'Content-Profile': 'restaurante',   // Schema para escritura
}

// Clientes especializados por schema
const restaurante = SupabaseClientFactory.restaurante()
const personal = SupabaseClientFactory.personal() 
const admin = SupabaseClientFactory.admin('restaurante')
```

#### **Políticas RLS Reales** (`ejemplos/database/rls-policies.sql`)
```sql
-- Empleados activos pueden ver reservas
CREATE POLICY "empleados_ven_reservas" ON restaurante.reservas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM personal.empleados e 
      WHERE e.user_id = auth.uid() 
      AND e.activo = true 
      AND e.tiene_acceso_sistema = true
    )
  );
```

### **Componentes del Dominio Validados** (`ejemplos/components/`)

#### **Componentes Especializados Probados**
- **Calendar System**: `ejemplos/components/calendar/` (5 componentes de calendario)
- **Modals Especializados**: `ejemplos/components/modals/` (12 modales del dominio)
- **Dashboard Widgets**: `ejemplos/components/dashboard/` (3 dashboards especializados)
- **Notification System**: `ejemplos/components/notifications/` (8 componentes de notificaciones)
- **Email System**: `ejemplos/components/email/` (Templates y modales de email)

#### **Patterns de Componentes Reales**
```typescript
// Ejemplo: ReservationForm con validación real
import { NuevaReservaSchema } from '@/lib/validations'  // Zod real
import { SupabaseClientFactory } from '@/lib/supabase'  // Cliente real

// Usar campos REALES del esquema
const nuevaReserva = {
  nombre_reserva: "Juan Pérez",           // Campo real
  telefono_reserva: "+34612345678",      // Campo real  
  email_reserva: "juan@ejemplo.com",     // Campo real
  numero_personas: 4,
  fecha_reserva: "2024-12-25",
  hora_reserva: "14:00"
}
```

### **Knowledge Base RAG del Dominio**

#### **Base de Conocimiento Implementada** (`src/`)
- **Servidor MCP con 14 Herramientas**: `src/crawl4ai_mcp.py` - RAG funcional
- **Utilidades para Embeddings**: `src/utils.py` - Supabase + OpenAI para búsqueda semántica
- **Knowledge Graph Neo4j**: `knowledge_graphs/` - Análisis arquitectónico y validación
- **Documentación AI Especializada**: `PRPs/ai_docs/` - 16 documentos técnicos del dominio

#### **Búsqueda Semántica del Dominio** (USAR SIEMPRE)
```python
# Buscar componentes similares del gestor de reservas
search_results = await search_knowledge(
    query="React component reservation form validation",
    domain="restaurant",
    source_filter="ejemplos"
)

# Buscar patrones de BD específicos del restaurante
db_patterns = await query_knowledge_graph(
    query="database schema restaurant reservations tables relationships"
)
```

### **Variables de Entorno y Configuración Reales** (`ejemplos/.env.example`)

#### **Para Docker Stack Local**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
```

#### **Para Supabase Cloud** 
```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_cloud
```

### **Testing Patterns del Dominio** (`ejemplos/testing/`)

#### **Tests Reales Implementados**
```typescript
// Component testing con datos reales
const mockReserva = {
  nombre_reserva: "Test Cliente",       // Campos reales
  email_reserva: "test@ejemplo.com",
  telefono_reserva: "+34612345678",
  numero_personas: 4
}

// API testing con esquemas reales  
await request(app)
  .post('/api/restaurante/reservas')
  .set('Accept-Profile', 'restaurante')    // Headers reales
  .send(nuevaReserva)
  .expect(201)
```

## Guardrails de Desarrollo (CHECKPOINTS AUTOMÁTICOS)

**CRÍTICO: Estos checkpoints DEBEN ejecutarse automáticamente en cada fase:**

### **Fase 0: Validación Prerequisites (OBLIGATORIO)**
```bash
# EJECUTAR ANTES de cualquier implementación
/analyze --config --persona-architect --validate --interactive
```
**Umbral**: 100% servicios críticos funcionando (Supabase, Neo4j, APIs)

### **Fase 1: Validación PRP**
```bash
/crear-mcp-prp prp_fullstack_base --thinkhard --persona-architect --c7 --seq --plan
```
**Umbral**: Score PRP ≥ 90/100, Referencias válidas 100%

### **Fase 2: Validación Foundation**
```bash
/analyze --arch --validate --persona-architect
```
**Umbral**: TypeScript compila sin errores, estructura sigue CLAUDE.md

### **Fase 3: Validación Backend**
```bash
/test --api --coverage --persona-qa --validate
```
**Umbral**: 14+ herramientas MCP responden, Coverage ≥80%

### **Fase 4: Validación Frontend**
```bash
/test --e2e --pup --validate --persona-qa
```
**Umbral**: Accessibility ≥95%, Performance Lighthouse ≥90

### **Fase 5: Validación Security**
```bash
/scan --security --owasp --persona-security --validate
```
**Umbral**: 0 vulnerabilidades críticas/altas, MCP Inspector 100%

**BLOQUEO AUTOMÁTICO**: Si cualquier fase no cumple umbrales, DETENER desarrollo hasta corregir

## Sistema de Documentación Técnica

**IMPORTANTE: Documentación especializada organizada por categorías:**

### **Guías Core MCP** (`PRPs/ai_docs/`)
- `mcp_server_architecture_guide.md` - Índice arquitectónico con implementaciones
- `superclaude_commands_guide.md` - Comandos, personas, flags y flujos MCP
- `setup_prerequisites_guide.md` - Prerequisites con validación automatizada
- `mcp_development_guardrails.md` - Checkpoints detallados por fase
- `mcp_testing_validation_guide.md` - Testing específico para herramientas MCP

### **Guías de Integración** (`PRPs/ai_docs/`)
- `anthropic_integration_guide.md` - Claude API para parseo PRPs y generación
- `fullstack_knowledge_graph.md` - Neo4j para insights arquitectónicos
- `rag_knowledge_patterns.md` - Búsqueda semántica con Supabase + pgvector
- `mcp_patterns_fullstack.md` - Patrones MCP para stack Next.js + Supabase
- `nextjs_mcp_integration.md` - Integración específica con Next.js

### **Guías de Arquitectura** (`PRPs/ai_docs/`)
- `fullstack_tool_architecture.md` - Arquitectura modular de herramientas
- `fullstack_architecture_patterns.md` - Patrones arquitectónicos probados
- `fullstack_auth_permissions.md` - Autenticación y permisos granulares
- `fullstack_database_schema.md` - Diseño de esquemas multi-schema
- `fullstack_env_config.md` - Configuración de variables de entorno

### **Guías Claude Code** (`PRPs/ai_docs/`)
- `build_with_claude_code-es.md` - Integración con Claude Code framework
- `cc_commands-es.md` - Comandos específicos de Claude Code
- `cc_mcp-es.md` - MCP dentro del ecosistema Claude Code
- `cc_memory-es.md` - Gestión de memoria y contexto
- `cc_troubleshoot-es.md` - Troubleshooting y resolución de problemas

**FLUJO DE CONSULTA**: Para cualquier problema técnico, consultar primero las guías core, luego las especializadas.

## Implementaciones de Referencia

**PRIMERA PRIORIDAD: Siempre consultar implementaciones reales antes que documentación externa:**

### **Ejemplos Validados** (`ejemplos/`)
- `ejemplos/mcp/README.md` - Índice de ejemplos MCP organizados
- `ejemplos/database-tools-es.ts` - Herramientas MCP PostgreSQL completas
- `ejemplos/components/` - 50+ componentes React probados en producción
- `ejemplos/database/` - Esquemas SQL reales multi-schema validados
- `ejemplos/auth/` - Middleware Supabase RLS real funcionando
- `ejemplos/testing/` - Patterns de testing específicos del dominio

### **Knowledge Base RAG** (`src/`)
- `src/crawl4ai_mcp.py` - Servidor MCP con 14 herramientas RAG funcionales
- `src/utils.py` - Utilidades para embeddings y búsqueda semántica
- `knowledge_graphs/` - Análisis arquitectónico con Neo4j validado

## Reglas de Oro Inmutables

1. **NUNCA comprometer la seguridad** - validación y auth en todo
2. **NUNCA generar código sin tests** - cobertura mínima 80%
3. **NUNCA usar 'any' en TypeScript** - tipos estrictos siempre
4. **NUNCA saltarse la metodología PRP** - calidad depende del proceso
5. **NUNCA deployar sin validación** - CI/CD debe pasar completamente
6. **NUNCA modificar el directorio de documentación actual** - solo crear nuevo en `mcp-fullstack-developer/`
7. **SIEMPRE seguir la estructura de directorios** - consistencia crítica
8. **SIEMPRE incluir documentación** - código autodocumentado
9. **SIEMPRE optimizar para rendimiento** - lazy loading, caché, etc.
10. **SIEMPRE considerar accesibilidad** - WCAG 2.1 AA mínimo
11. **SIEMPRE aprender de implementaciones** - actualizar knowledge base
12. **SIEMPRE consultar ejemplos locales ANTES que documentación externa** - conocimiento validado primero
13. **SIEMPRE usar esquemas y campos reales** - no inventar nombres, usar `ejemplos/database/`
14. **SIEMPRE ejecutar guardrails automáticos** - checkpoints obligatorios por fase

---

**Este documento es la fuente de verdad inmutable para todo desarrollo. En caso de pérdida de contexto, SIEMPRE volver a este documento para reanudar el trabajo correctamente. Cualquier código que no siga estos estándares debe ser rechazado y regenerado.**