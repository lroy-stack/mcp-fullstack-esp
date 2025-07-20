# Patrones de Arquitectura Full Stack MCP

Este documento contiene los patrones arquitectónicos fundamentales para implementar el **Servidor MCP Full Stack Developer** que actúa como un equipo de desarrollo completo.

## 🏗️ Stack Tecnológico Obligatorio

### **Frontend Stack**
```typescript
// Tecnologías OBLIGATORIAS - NO CAMBIAR
const FRONTEND_STACK = {
  framework: "Next.js 14+",           // App Router + Server Components
  language: "TypeScript 5+",          // Strict mode obligatorio
  styling: "Tailwind CSS",            // Utility-first CSS
  components: "Shadcn/ui + Radix UI", // Headless components base
  forms: "React Hook Form + Zod",     // Formularios con validación
  state: "Zustand",                   // Estado global simple
  animations: "Framer Motion",        // Animaciones declarativas
  icons: "Lucide React",              // Iconos consistentes
} as const;
```

### **Backend Stack**
```typescript
// APIs y servicios OBLIGATORIOS
const BACKEND_STACK = {
  runtime: "Next.js API Routes",      // App Router API handlers
  database: "Supabase + PostgreSQL", // BaaS con SQL completo
  orm: "Prisma",                      // Type-safe database access
  auth: "Supabase Auth",              // Auth completo multi-provider
  validation: "Zod",                  // Schema validation
  security: "RLS + Middleware",       // Row Level Security
  storage: "Supabase Storage",        // File storage
  realtime: "Supabase Realtime",     // WebSocket real-time
} as const;
```

### **Knowledge & AI Stack**
```typescript
// Sistema de conocimiento OBLIGATORIO
const KNOWLEDGE_STACK = {
  vectorDB: "Supabase + pgvector",    // Vector embeddings
  embeddings: "OpenAI text-embedding-3-small", // Embeddings generation
  llm: "Anthropic Claude",            // PRP processing
  knowledgeGraph: "Neo4j + Graphiti", // Architectural relationships
  search: "Hybrid (vector + keyword)", // Best of both worlds
  reranking: "Cross-encoder models",   // Result optimization
  crawling: "Crawl4AI",               // Documentation crawling
} as const;
```

### **Development & Testing Stack**
```typescript
// Herramientas de desarrollo OBLIGATORIAS
const DEV_STACK = {
  testing: {
    unit: "Jest + React Testing Library",
    integration: "Supertest",
    e2e: "Playwright",
    visual: "Chromatic + Storybook",
    accessibility: "jest-axe + axe-playwright",
    performance: "Lighthouse CI",
  },
  quality: {
    linting: "ESLint + TypeScript ESLint",
    formatting: "Prettier",
    commits: "Husky + lint-staged",
    types: "TypeScript strict mode",
  },
  deployment: {
    frontend: "Vercel",
    database: "Supabase Cloud",
    mcp: "Docker + Cloud Run",
    monitoring: "Sentry + Vercel Analytics",
  }
} as const;
```

## 🎯 Arquitectura por Capas

### **Capa 1: Presentación (Frontend)**
```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router                                        │
│  ├── app/                   # Páginas y layouts            │
│  │   ├── (auth)/           # Rutas autenticadas           │
│  │   ├── dashboard/        # Dashboard principal          │
│  │   ├── settings/         # Configuración usuario        │
│  │   └── api/             # API Routes                   │
│  ├── components/           # Componentes React             │
│  │   ├── ui/              # Shadcn/ui base components     │
│  │   ├── forms/           # Formularios específicos       │
│  │   ├── layouts/         # Layouts reutilizables         │
│  │   └── domain/          # Componentes del dominio       │
│  └── hooks/               # Custom React hooks            │
└─────────────────────────────────────────────────────────────┘
```

### **Capa 2: Lógica de Negocio (Backend)**
```
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes + Server Actions                       │
│  ├── app/api/              # API endpoints                 │
│  │   ├── auth/            # Autenticación                  │
│  │   ├── users/           # Gestión usuarios               │
│  │   ├── [domain]/        # APIs específicas dominio       │
│  │   └── webhooks/        # Webhooks externos              │
│  ├── lib/                 # Lógica de negocio              │
│  │   ├── auth.ts          # Configuración auth             │
│  │   ├── db.ts            # Cliente Supabase               │
│  │   ├── validations.ts   # Esquemas Zod                   │
│  │   └── utils.ts         # Utilidades compartidas         │
│  └── middleware.ts        # Middleware global              │
└─────────────────────────────────────────────────────────────┘
```

### **Capa 3: Datos y Persistencia**
```
┌─────────────────────────────────────────────────────────────┐
│                   DATA PERSISTENCE LAYER                   │
├─────────────────────────────────────────────────────────────┤
│  Supabase + PostgreSQL + Neo4j                            │
│  ├── prisma/              # ORM y esquemas                 │
│  │   ├── schema.prisma    # Definición esquemas            │
│  │   └── migrations/      # Migraciones versionadas        │
│  ├── supabase/            # Configuración Supabase         │
│  │   ├── config.toml      # Configuración local            │
│  │   ├── migrations/      # Migraciones SQL                │
│  │   └── seed.sql         # Datos iniciales                │
│  └── neo4j/               # Knowledge graph                │
│      ├── schema.cypher    # Schema de nodos y relaciones   │
│      └── queries/         # Queries Cypher comunes         │
└─────────────────────────────────────────────────────────────┘
```

### **Capa 4: Sistema de Conocimiento (RAG + KG)**
```
┌─────────────────────────────────────────────────────────────┐
│                   KNOWLEDGE SYSTEM LAYER                   │
├─────────────────────────────────────────────────────────────┤
│  RAG System + Knowledge Graph + MCP Tools                 │
│  ├── mcp/                 # Servidor MCP                   │
│  │   ├── server.ts        # Servidor MCP principal         │
│  │   ├── tools/           # Herramientas especializadas    │
│  │   │   ├── parse-prp.ts      # PRP processing           │
│  │   │   ├── generate-*.ts     # Code generation          │
│  │   │   ├── search-*.ts       # Knowledge search         │
│  │   │   └── query-graph.ts    # Graph queries            │
│  │   ├── knowledge/        # Sistema conocimiento          │
│  │   │   ├── crawler.ts    # Web crawling                  │
│  │   │   ├── embeddings.ts # Vector embeddings             │
│  │   │   ├── rag.ts        # RAG implementation            │
│  │   │   └── graph.ts      # Knowledge graph ops          │
│  │   └── utils/           # Utilidades MCP                 │
│  └── knowledge_graphs/    # Neo4j específico               │
│      ├── validators/      # Validadores de código          │
│      ├── parsers/         # AST parsers                    │
│      └── analyzers/       # Analizadores de código         │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Patrones de Implementación Obligatorios

### **1. Componente React Pattern**
```typescript
// PATRÓN OBLIGATORIO para todos los componentes
interface ComponentProps {
  // Props siempre tipadas y documentadas
  id?: string;
  className?: string;
  children?: React.ReactNode;
  // Props específicas del componente
  [key: string]: unknown;
}

export function ExampleComponent({ 
  id, 
  className, 
  children,
  ...props 
}: ComponentProps) {
  // 1. Hooks al inicio
  const [state, setState] = useState<StateType>(initialState);
  const { data, isLoading, error } = useQuery(...);
  
  // 2. Handlers y computations
  const handleSubmit = useCallback(async (data: FormData) => {
    try {
      await submitAction(data);
      toast.success('Success message');
    } catch (error) {
      toast.error('Error message');
    }
  }, []);
  
  // 3. Conditional rendering checks
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBoundary error={error} />;
  
  // 4. Main render
  return (
    <div id={id} className={cn("base-classes", className)}>
      {children}
    </div>
  );
}

// OBLIGATORIO: Tests para cada componente
describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
  
  it('handles interactions', async () => {
    const user = userEvent.setup();
    render(<ExampleComponent />);
    await user.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### **2. API Route Pattern**
```typescript
// PATRÓN OBLIGATORIO para todas las APIs
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { rateLimit } from '@/lib/rate-limit';

// 1. Schema de validación
const RequestSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
  field3: z.string().optional(),
});

const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 2. Rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // 3. Autenticación
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 4. Validación de entrada
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // 5. Autorización específica
    const hasPermission = await checkPermission(
      session.user.id,
      'required-permission'
    );
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // 6. Lógica de negocio
    const result = await businessLogic(validatedData, session.user.id);

    // 7. Logging de auditoría
    await auditLog({
      userId: session.user.id,
      action: 'api-action',
      resource: 'resource-name',
      metadata: { ...validatedData }
    });

    // 8. Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    // 9. Error handling
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **3. Database Schema Pattern**
```typescript
// PATRÓN OBLIGATORIO para esquemas Prisma
model User {
  // 1. ID siempre UUID
  id        String   @id @default(uuid())
  
  // 2. Timestamps obligatorios
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // 3. Campos de negocio
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  
  // 4. Relaciones tipadas
  posts     Post[]
  profile   Profile?
  
  // 5. Índices de rendimiento
  @@index([email])
  @@index([createdAt])
  @@map("users")
}

// 6. RLS Policies obligatorias (Supabase)
-- Users can view own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update own data
CREATE POLICY "users_update_own" ON users  
  FOR UPDATE USING (auth.uid()::text = id);
```

### **4. Herramienta MCP Pattern**
```typescript
// PATRÓN OBLIGATORIO para herramientas MCP
interface MCPToolConfig {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
}

export class FullStackMCPTool {
  constructor(private config: MCPToolConfig) {}
  
  async execute<T extends z.infer<typeof this.config.inputSchema>>(
    input: T
  ): Promise<z.infer<typeof this.config.outputSchema>> {
    // 1. Validar entrada
    const validatedInput = this.config.inputSchema.parse(input);
    
    // 2. Buscar conocimiento relevante
    const knowledgeContext = await this.searchKnowledge(validatedInput);
    
    // 3. Ejecutar lógica principal
    const result = await this.executeCore(validatedInput, knowledgeContext);
    
    // 4. Validar salida
    const validatedOutput = this.config.outputSchema.parse(result);
    
    // 5. Actualizar knowledge base
    await this.updateKnowledge(validatedInput, validatedOutput);
    
    return validatedOutput;
  }
  
  private async searchKnowledge(input: unknown) {
    // Implementación búsqueda RAG
  }
  
  private async executeCore(input: unknown, context: unknown) {
    // Lógica específica de la herramienta
  }
  
  private async updateKnowledge(input: unknown, output: unknown) {
    // Actualización de base de conocimiento
  }
}
```

## 🛡️ Patrones de Seguridad Obligatorios

### **1. Autenticación Pattern**
```typescript
// Middleware de autenticación obligatorio
export async function authMiddleware(request: NextRequest) {
  const session = await getServerSession();
  
  // Rutas públicas permitidas
  const publicPaths = ['/api/auth', '/api/health'];
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Verificar autenticación
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Verificar sesión válida
  const user = await getUserById(session.user.id);
  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
  
  return NextResponse.next();
}
```

### **2. Validación Pattern**
```typescript
// Validación de entrada obligatoria
export function createValidationMiddleware<T extends z.ZodSchema>(schema: T) {
  return async (data: unknown): Promise<z.infer<T>> => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid input', error.issues);
      }
      throw error;
    }
  };
}

// Sanitización de salida obligatoria
export function sanitizeOutput(data: unknown, userRole: UserRole): unknown {
  // Remover campos sensibles basado en rol
  if (userRole !== 'ADMIN') {
    return omit(data, ['internalId', 'systemMetadata']);
  }
  return data;
}
```

### **3. Rate Limiting Pattern**
```typescript
// Rate limiting obligatorio para APIs
export async function rateLimit(
  request: NextRequest,
  limit: number = 100,
  window: number = 3600
) {
  const identifier = getClientIdentifier(request);
  const key = `rate_limit:${identifier}`;
  
  const current = await redis.get(key);
  
  if (current && parseInt(current) >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: Date.now() + (window * 1000)
    };
  }
  
  const remaining = await redis.incr(key);
  if (remaining === 1) {
    await redis.expire(key, window);
  }
  
  return {
    success: true,
    remaining: limit - remaining,
    resetTime: Date.now() + (window * 1000)
  };
}
```

## 📊 Patrones de Performance

### **1. Caching Strategy**
```typescript
// Estrategia de caché obligatoria
export const cacheConfig = {
  // Static content - cache aggressively
  static: {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 86400 // 1 day
  },
  
  // API responses - cache moderately  
  api: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 60 // 1 minute
  },
  
  // User-specific data - cache briefly
  user: {
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 30 // 30 seconds
  }
};
```

### **2. Database Optimization**
```sql
-- Índices obligatorios para performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_posts_user_id ON posts(user_id);
CREATE INDEX CONCURRENTLY idx_posts_created_at ON posts(created_at DESC);

-- Índices compuestos para queries complejas
CREATE INDEX CONCURRENTLY idx_posts_user_status_date 
ON posts(user_id, status, created_at DESC);
```

### **3. Bundle Optimization**
```typescript
// Configuración Next.js obligatoria
const nextConfig = {
  // Optimizaciones de bundle
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },
  
  // Análisis de bundle
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true'
  },
  
  // Compresión de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 31536000
  }
};
```

## 🎯 Criterios de Validación

### **Performance Requirements**
- [ ] Lighthouse Score >= 90 (Performance)
- [ ] First Contentful Paint <= 1.5s
- [ ] Largest Contentful Paint <= 2.5s
- [ ] Cumulative Layout Shift <= 0.1
- [ ] Time to Interactive <= 3.0s

### **Accessibility Requirements**
- [ ] WCAG 2.1 AA compliance
- [ ] Axe accessibility score >= 95%
- [ ] Keyboard navigation completa
- [ ] Screen reader compatibility
- [ ] Color contrast >= 4.5:1

### **Security Requirements**
- [ ] OWASP Top 10 compliance
- [ ] CSP headers configurados
- [ ] HTTPS obligatorio
- [ ] Input validation 100%
- [ ] RLS policies implementadas

### **Quality Requirements**
- [ ] TypeScript strict mode
- [ ] Test coverage >= 80%
- [ ] ESLint sin errores
- [ ] Prettier formatting
- [ ] Documentación completa

---

**Estos patrones son OBLIGATORIOS y NO NEGOCIABLES. Cualquier código que no siga estos estándares debe ser rechazado y regenerado siguiendo los patrones correctos.**