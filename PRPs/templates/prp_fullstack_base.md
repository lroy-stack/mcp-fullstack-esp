---
name: "Plantilla PRP Servidor MCP Full Stack Developer"
description: Esta plantilla está diseñada para proporcionar el Servidor MCP Full Stack Developer definitivo que actúa como un equipo de desarrollo completo, capaz de desarrollar aplicaciones Next.js de principio a fin con base de conocimiento RAG, knowledge graphs y especialización por dominio.
---

## Propósito

Plantilla optimizada para que agentes de IA implementen el **Servidor MCP Full Stack Developer Definitivo** que incluye:

- **Base de conocimiento RAG** con Supabase + pgvector para búsqueda semántica
- **Knowledge Graph relacional** con Neo4j para entender arquitecturas y patrones
- **Herramientas MCP especializadas** para desarrollo frontend/backend completo
- **Integración SuperClaude** con personas y comandos inteligentes
- **Especialización por dominio** para casos específicos (restaurante, ecommerce, etc.)
- **Crawling inteligente** para mantener conocimiento técnico actualizado

## Principios Fundamentales

1. **El Conocimiento es Poder**: Incluir base de conocimiento completa del dominio con ejemplos, componentes, APIs y patrones
2. **Metodología PRP Primero**: Todo desarrollo debe seguir la metodología PRP estrictamente para garantizar calidad
3. **Full Stack Completo**: Generar frontend + backend + database + tests + documentación automáticamente
4. **Aprendizaje Continuo**: Cada implementación mejora la base de conocimiento para futuras aplicaciones
5. **Calidad Empresarial**: Código listo para producción con seguridad, tests y optimizaciones integradas

---

## Objetivo

Construir el **Servidor MCP Full Stack Developer** para desarrollar aplicaciones Next.js completas con:

### **Aplicación [DOMINIO ESPECÍFICO]**
- [FUNCIONALIDAD PRINCIPAL] - describir la aplicación específica a desarrollar (ej: gestor de reservas para restaurante)
- **Frontend completo**: Componentes React, páginas, layouts, forms, dashboard
- **Backend robusto**: APIs Next.js, autenticación, validación, middleware
- **Base de datos optimizada**: Esquemas Prisma, migraciones, políticas RLS
- **Sistema RAG**: Búsqueda semántica de conocimiento específico del dominio
- **Knowledge Graph**: Relaciones arquitectónicas y patrones del dominio

### **Herramientas MCP Especializadas**
- `parseFullStackPRP`: Análisis completo de requerimientos frontend/backend/database
- `generateProjectArchitecture`: Arquitectura y estructura de proyecto completa
- `generateComponent`: Componentes React + tests + documentación + Storybook
- `generateAPIEndpoint`: APIs Next.js + validación Zod + middleware + tests
- `generateDatabaseSchema`: Esquemas Prisma + migraciones + políticas RLS
- `implementAuth`: Sistema autenticación completo con Supabase Auth
- `generateTests`: Tests unitarios + integración + E2E automáticos
- `searchKnowledge`: Búsqueda semántica en base de conocimiento del dominio
- `queryProjectGraph`: Consultas al knowledge graph para insights arquitectónicos
- `updateKnowledgeBase`: Aprendizaje continuo de nuevas implementaciones

## Por Qué

### **Revolución en Desarrollo de Software**
- **Velocidad 10x**: Reducir tiempo de desarrollo de meses a días manteniendo calidad empresarial
- **Calidad Garantizada**: Código generado sigue mejores prácticas automáticamente con tests incluidos
- **Conocimiento Especializado**: Base de datos de patrones y componentes específicos del dominio
- **Escalabilidad Inteligente**: Arquitectura diseñada para crecer con el negocio desde el día uno

### **Valor para el Desarrollador**
- **Asistente Senior**: Actúa como desarrollador Full Stack senior con años de experiencia
- **Especialización Instantánea**: Conocimiento profundo del dominio sin curva de aprendizaje
- **Calidad Consistente**: Estándares de código, seguridad y rendimiento aplicados automáticamente
- **Documentación Automática**: Documentación técnica y de usuario generada automáticamente

## Qué

### **Stack Tecnológico Completo**

#### **Frontend (Next.js + React)**
```typescript
// Tecnologías obligatorias
- Next.js 14+ con App Router
- React 18+ con Server Components
- TypeScript 5+ estricto
- Tailwind CSS para estilos
- Shadcn/ui como sistema de diseño
- React Hook Form + Zod para formularios
- Framer Motion para animaciones
- Zustand para estado global
```

#### **Backend (Next.js API + Supabase)**
```typescript
// APIs y servicios
- Next.js API Routes con App Router
- Supabase para autenticación y base de datos
- Prisma ORM para esquemas y migraciones
- Zod para validación de esquemas
- Middleware personalizado para auth y logging
- Rate limiting y protecciones de seguridad
```

#### **Testing y Calidad**
```bash
# Suite de testing completa
- Jest para tests unitarios
- React Testing Library para componentes
- Playwright para tests E2E
- MSW para mocking de APIs
- ESLint + Prettier para calidad de código
- Husky + lint-staged para pre-commit hooks
```

### **Criterios de Éxito Completos**

#### **Funcionalidad Core**
- [ ] Aplicación Next.js completa funciona end-to-end
- [ ] Todas las páginas principales implementadas y navegables
- [ ] Formularios con validación funcionan correctamente
- [ ] APIs responden correctamente con datos válidos
- [ ] Base de datos con datos de prueba funcional
- [ ] Autenticación y autorización funcionan correctamente

#### **Servidor MCP**
- [ ] Servidor MCP pasa validación con MCP Inspector
- [ ] Todas las herramientas MCP responden correctamente
- [ ] Base de conocimiento RAG funcional con búsquedas
- [ ] Knowledge graph con relaciones y consultas
- [ ] Crawling automático de documentación funciona
- [ ] Integración SuperClaude con personas y comandos

#### **Calidad de Código**
- [ ] TypeScript compila sin errores ni warnings
- [ ] ESLint y Prettier pasan sin errores
- [ ] Cobertura de tests >= 80% en todos los componentes
- [ ] Tests E2E pasan para flujos principales
- [ ] Performance Score >= 90 en Lighthouse
- [ ] Accessibility Score >= 95 en tests automatizados

## Todo el Contexto Necesario

### Documentación Técnica Detallada (MUST READ)

**JERARQUÍA DE CONSULTA**: CLAUDE.md → INITIAL.md → ai_docs/ → ejemplos/ → Context7

```yaml
# DOCUMENTACIÓN INMUTABLE (SIEMPRE LEER PRIMERO)
Core_Documentation:
  - CLAUDE.md: "Reglas de oro inmutables, guardrails automáticos, directorio destino"
  - INITIAL.md: "Conceptualización completa del servidor MCP Full Stack"

# GUÍAS CORE MCP (LECTURA OBLIGATORIA)  
Core_MCP_Guides:
  - ai_docs/mcp_server_architecture_guide: "Índice arquitectónico con implementaciones"
  - ai_docs/superclaude_commands_guide: "Comandos, personas, flags y flujos MCP"
  - ai_docs/mcp_development_guardrails: "Checkpoints automáticos por fase"
  - ai_docs/setup_prerequisites_guide: "Prerequisites con validación automatizada"

# GUÍAS DE INTEGRACIÓN (DESARROLLO ESPECÍFICO)
Integration_Guides:
  - ai_docs/mcp_patterns_fullstack: "Patrones MCP para stack Next.js + Supabase + Neo4j"
  - ai_docs/anthropic_integration_guide: "Claude API para parseo PRPs y generación"
  - ai_docs/fullstack_knowledge_graph: "Neo4j para insights arquitectónicos"
  - ai_docs/rag_knowledge_patterns: "Búsqueda semántica con Supabase + pgvector"
  - ai_docs/nextjs_mcp_integration: "Integración con Next.js App Router y Server Components"

# GUÍAS DE ARQUITECTURA (DISEÑO TÉCNICO)
Architecture_Guides:
  - ai_docs/fullstack_tool_architecture: "Arquitectura modular de herramientas MCP"
  - ai_docs/fullstack_architecture_patterns: "Patrones arquitectónicos probados"
  - ai_docs/fullstack_auth_permissions: "Autenticación y permisos granulares"
  - ai_docs/fullstack_database_schema: "Diseño esquemas multi-schema"
  - ai_docs/fullstack_env_config: "Configuración variables de entorno"

# GUÍAS DE TESTING Y CALIDAD (VALIDACIÓN)
Testing_Quality_Guides:
  - ai_docs/mcp_testing_validation_guide: "Testing específico para herramientas MCP"
  - ai_docs/mcp_tool_development: "Desarrollo herramientas MCP especializadas"
  - ai_docs/mcp_tool_development_patterns: "Patterns avanzados para herramientas"

# GUÍAS CLAUDE CODE (ECOSISTEMA)
Claude_Code_Guides:
  - ai_docs/build_with_claude_code-es: "Integración con Claude Code framework"
  - ai_docs/cc_commands-es: "Comandos específicos de Claude Code"
  - ai_docs/cc_mcp-es: "MCP dentro del ecosistema Claude Code"

# ANÁLISIS Y CONTEXTS ESPECÍFICOS
Analysis_Context_Guides:
  - ai_docs/enigma_analysis: "Análisis implementación real del gestor de reservas"
  - ai_docs/context7_references: "Referencias Context7 como fuente complementaria"

# NOTA: Todas las guías están organizadas por categorías para consulta según necesidad específica
```

### Ejemplos de Referencia Locales (USAR ANTES que Context7)

**IMPORTANTE: SIEMPRE consultar ejemplos locales ANTES que documentación externa**

```yaml
# BIBLIOTECA DE EJEMPLOS MCP - PRIMERA PRIORIDAD
MCP_Examples:
  - ejemplos/mcp/README: "Índice completo de ejemplos MCP organizados"
  - ejemplos/database-tools-es: "Herramientas MCP PostgreSQL completas"
  - ejemplos/database-tools-sentry-es: "Versión con monitoreo Sentry"

# COMPONENTES FRONTEND PROBADOS  
Frontend_Examples:
  - ejemplos/components/calendar/: "5 componentes calendario interactivo"
  - ejemplos/components/modals/: "12 modales especializados con validation"
  - ejemplos/components/notifications/: "8 componentes sistema notificaciones"
  - ejemplos/components/dashboard/: "Widgets y dashboards especializados"

# BASE DE DATOS REAL
Database_Examples:
  - ejemplos/database/schema-design.sql: "Estructura completa multi-domain"
  - ejemplos/database/rls-policies.sql: "Políticas Row Level Security reales"
  - ejemplos/database/triggers.sql: "Triggers automatizados validados"

# AUTENTICACIÓN PROBADA
Auth_Examples:
  - ejemplos/auth/middleware.ts: "Middleware Supabase validado"
  - ejemplos/auth/auth-helpers.ts: "Helpers de autenticación"

# TESTING PATTERNS
Testing_Examples:
  - ejemplos/testing/api.test.ts: "Patterns testing APIs"
  - ejemplos/testing/component.test.tsx: "Testing componentes React"
  - ejemplos/testing/e2e.spec.ts: "Tests end-to-end Playwright"

# TIPOS Y HOOKS
Development_Examples:
  - ejemplos/types/database.ts: "Tipos TypeScript del dominio"
  - ejemplos/hooks/: "Custom hooks especializados"
  - ejemplos/lib/: "Utilidades y configuraciones"
```

### Arquitectura Base de Referencia (Implementaciones Reales)

```yaml
# CÓDIGO BASE MCP - ESTUDIAR SEGUNDO
- file: src/crawl4ai_mcp.py
  why: Servidor MCP base con 14 herramientas RAG, lifecycle, error handling

- file: src/utils.py  
  why: Utilidades para embeddings, chunking, base de datos, validación

# DOCUMENTACIÓN INMUTABLE - ESTUDIAR TERCERO
- file: CLAUDE.md
  why: Estándares de código, arquitectura, testing, seguridad que NO PUEDEN cambiar

- file: INITIAL.md
  why: Requerimientos completos, arquitectura propuesta, casos de uso
```

### Patrones de Implementación Específicos (Basados en Ejemplos Reales)

```yaml
# PATTERNS DE IMPLEMENTACIÓN (Basados en Ejemplos Reales)
Implementation_Patterns:
  # COMPONENTES REACT - Patterns del Gestor de Reservas
  Component_Pattern:
    reference: "ejemplos/components/"
    practices:
      - "TypeScript estricto con interfaces del dominio"
      - "Props validation usando tipos de ejemplos/types/database.ts"
      - "Error boundaries para robustez"
      - "Loading states para UX"
      - "Tests unitarios + accessibility"

  # APIs NEXT.JS - Patterns Supabase Multi-Schema  
  API_Pattern:
    reference: "ejemplos/auth/ y ejemplos/database/"
    practices:
      - "Headers multi-schema: Accept-Profile, Content-Profile"
      - "Validación con Zod usando esquemas de ejemplos/lib/validations.ts"
      - "Autenticación RLS con políticas de ejemplos/database/rls-policies.sql"
      - "Middleware real de ejemplos/auth/middleware.ts"

  # BASE DE DATOS - Diseño Multi-Schema Real
  Database_Pattern:
    reference: "ejemplos/database/schema-design.sql"
    practices:
      - "Esquemas multi-schema: restaurante.*, personal.*, crm.*, operaciones.*"
      - "Campos reales: numero_mesa (NO 'numero'), nombre_reserva (NO 'cliente_nombre')"
      - "Políticas RLS granulares en ejemplos/database/rls-policies.sql"
      - "Tipos TypeScript sincronizados en ejemplos/types/database.ts"
```

### Integración SuperClaude

```yaml
# MAPEO DE PERSONAS - Usar apropiadamente
Frontend_Development:
  persona: "--persona-frontend"
  tools: ["generateComponent", "generatePage", "generateForm"]
  
Backend_Development:
  persona: "--persona-backend"  
  tools: ["generateAPIEndpoint", "generateDatabaseSchema"]
  
Architecture_Design:
  persona: "--persona-architect"
  tools: ["parseFullStackPRP", "generateProjectArchitecture"]
  
Quality_Assurance:
  persona: "--persona-qa"
  tools: ["generateTests", "validateQuality"]
```

## Estructura de Proyecto Objetivo

### **Directorio de Destino**
```bash
# CREAR nuevo directorio para el servidor MCP Full Stack
mkdir mcp-fullstack-developer
cd mcp-fullstack-developer

# Inicializar proyecto Node.js
npm init -y
git init
```

### **Estructura Completa de Directorios**
```bash
mcp-fullstack-developer/
├── src/                              # Código fuente TypeScript
│   ├── index.ts                      # Servidor MCP principal (patrón del repo referencia)
│   ├── index_sentry.ts              # Versión con monitoreo Sentry
│   ├── types.ts                     # Tipos TypeScript globales + Props extendidos
│   ├── auth/                        # Sistema de autenticación
│   │   ├── github-handler.ts        # GitHub OAuth flow (del repo referencia)
│   │   ├── permissions.ts           # Sistema de permisos granulares
│   │   └── middleware.ts            # Middleware de autenticación
│   ├── tools/                       # Herramientas MCP modulares
│   │   ├── register-tools.ts        # Registro centralizado (patrón referencia)
│   │   ├── frontend-tools.ts        # generateComponent, generatePage
│   │   ├── backend-tools.ts         # generateAPIEndpoint, generateDatabaseSchema
│   │   ├── architecture-tools.ts    # parseFullStackPRP, generateProjectArchitecture
│   │   ├── knowledge-tools.ts       # searchKnowledge, queryProjectGraph
│   │   ├── testing-tools.ts         # generateTests, validateQuality
│   │   └── security-tools.ts        # Herramientas de seguridad (admin only)
│   ├── database/                    # Gestión de bases de datos
│   │   ├── connection.ts            # Conexiones PostgreSQL + Neo4j
│   │   ├── security.ts              # Validación SQL, RLS
│   │   └── utils.ts                 # Utilidades de BD
│   ├── knowledge/                   # Sistema de conocimiento
│   │   ├── crawler.ts               # Web crawling inteligente
│   │   ├── embeddings.ts            # Generación embeddings OpenAI
│   │   ├── search.ts                # Búsqueda semántica RAG
│   │   └── graph.ts                 # Knowledge graph Neo4j
│   └── ai/                          # Generación con AI
│       ├── generator.ts             # Interfaz Claude/OpenAI
│       └── prompts.ts               # Templates de prompts
├── prisma/                          # Esquemas y migraciones
│   ├── schema.prisma                # Esquema principal con pgvector
│   └── migrations/                  # Migraciones SQL
├── tests/                           # Tests completos
│   ├── unit/                        # Tests unitarios por herramienta
│   ├── integration/                 # Tests de integración MCP
│   └── e2e/                         # Tests end-to-end
├── config/                          # Configuraciones
│   ├── wrangler.jsonc              # Cloudflare Workers (del repo referencia)
│   ├── tsconfig.json               # TypeScript config
│   └── jest.config.js              # Testing config
├── docs/                           # Documentación del servidor
│   ├── api/                        # Documentación APIs
│   └── tools/                      # Documentación herramientas MCP
├── scripts/                        # Scripts de desarrollo
│   ├── setup-env.sh               # Setup variables de entorno
│   ├── validate-config.ts         # Validación configuración
│   └── deploy.sh                  # Script de despliegue
├── .env.example                   # Template variables de entorno
├── .env.local                     # Variables locales (gitignore)
├── package.json                   # Dependencias Node.js
├── README.md                      # Documentación del proyecto
└── .gitignore                     # Git ignore
```

### **Setup Inicial del Proyecto**
```bash
# 1. CREAR estructura base
mkdir -p src/{auth,tools,database,knowledge,ai}
mkdir -p {prisma/migrations,tests/{unit,integration,e2e},config,docs/{api,tools},scripts}

# 2. INSTALAR dependencias principales
npm install @modelcontextprotocol/sdk @cloudflare/workers-oauth-provider
npm install @octokit/rest zod prisma @prisma/client
npm install openai @anthropic-ai/sdk neo4j-driver

# 3. INSTALAR dependencias de desarrollo
npm install -D typescript @types/node vitest wrangler
npm install -D eslint prettier husky lint-staged

# 4. CONFIGURAR scripts package.json
npm pkg set scripts.dev="wrangler dev"
npm pkg set scripts.build="tsc"
npm pkg set scripts.test="vitest"
npm pkg set scripts.deploy="wrangler deploy"
npm pkg set scripts.lint="eslint src/ --ext .ts"
npm pkg set scripts.type-check="tsc --noEmit"

# 5. INICIALIZAR configuraciones
npx tsc --init
npx prisma init
echo "node_modules/\n.env.local\n*.log" > .gitignore
```

### **Comandos de Validación**
```bash
# Validar estructura del proyecto
ls -la src/tools/  # Debe mostrar 6 archivos de herramientas
ls -la config/     # Debe contener wrangler.jsonc, tsconfig.json

# Validar dependencias
npm list @modelcontextprotocol/sdk  # Verificar MCP SDK instalado
npm list typescript                 # Verificar TypeScript

# Validar configuración
npm run type-check                  # TypeScript debe compilar sin errores
npx wrangler types                  # Generar tipos Cloudflare

# Validar servidor MCP básico
npm run dev                         # Iniciar servidor local
curl http://localhost:8787/mcp      # Verificar endpoint MCP responde
```

## Prerequisites y Configuración Inicial

### **⚠️ OBLIGATORIO: Setup Antes de Ejecutar**

**IMPORTANTE**: Estos prerequisites DEBEN completarse antes de ejecutar cualquier comando de creación o implementación del PRP.

#### **Servicios Externos Requeridos**

##### **1. GitHub OAuth Application**
```yaml
Requerido_Para: Autenticación del servidor MCP
Setup_URL: https://github.com/settings/applications/new
Configuración:
  - Application name: "MCP Full Stack Server"
  - Homepage URL: https://tu-dominio.workers.dev
  - Authorization callback URL: https://tu-dominio.workers.dev/callback
Variables_Generadas:
  - GITHUB_CLIENT_ID: "Ghp_tu_client_id"
  - GITHUB_CLIENT_SECRET: "tu_client_secret_generado"
```

##### **2. Supabase Project**
```yaml
Requerido_Para: Base de datos PostgreSQL + pgvector + Auth
Setup_URL: https://supabase.com/dashboard
Configuración:
  - Crear nuevo proyecto
  - Habilitar extensión pgvector
  - Configurar RLS policies
  - Generar service role key
Variables_Generadas:
  - SUPABASE_URL: "https://tu-proyecto.supabase.co"
  - SUPABASE_SERVICE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  - SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

##### **3. Neo4j Database**
```yaml
Requerido_Para: Knowledge Graph y relaciones arquitectónicas
Opciones:
  Local: Docker container (recomendado para desarrollo)
  Cloud: Neo4j AuraDB (recomendado para producción)
Variables_Generadas:
  - NEO4J_URI: "bolt://localhost:7687" o "neo4j+s://tu-instancia.databases.neo4j.io"
  - NEO4J_USER: "neo4j"
  - NEO4J_PASSWORD: "tu_password_seguro"
```

##### **4. API Keys de AI**
```yaml
OpenAI_API_Key:
  Requerido_Para: Embeddings (text-embedding-3-small) y summaries
  Setup_URL: https://platform.openai.com/api-keys
  Variable: OPENAI_API_KEY="sk-proj-tu-api-key"

Anthropic_API_Key:
  Requerido_Para: Parsing de PRPs y generación avanzada
  Setup_URL: https://console.anthropic.com/settings/keys
  Variable: ANTHROPIC_API_KEY="sk-ant-tu-api-key"
```

##### **5. Servicios Opcionales**
```yaml
Sentry_Monitoring:
  Requerido_Para: Monitoreo de errores en producción
  Setup_URL: https://sentry.io/settings/projects/
  Variable: SENTRY_DSN="https://tu-dsn@sentry.io/project-id"

Email_SMTP_IMAP:
  Requerido_Para: Aplicaciones Next.js con gestión de email
  Referencia: .env.ejemplo.mcp (configuración Hostinger completa)
  Variables: SMTP_HOST, SMTP_USER, SMTP_PASS, IMAP_HOST, IMAP_USER, IMAP_PASSWORD
```

#### **Archivos de Configuración de Referencia**

##### **Para el Servidor MCP (Cloudflare Workers)**
```yaml
Archivo_Referencia: .dev.vars.example
Variables_Críticas:
  - GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET
  - COOKIE_ENCRYPTION_KEY (32 bytes hex)
  - ANTHROPIC_API_KEY
  - DATABASE_URL (PostgreSQL full permissions)
  - SENTRY_DSN (opcional)
```

##### **Para Aplicaciones Next.js Generadas**
```yaml
Archivo_Referencia: .env.ejemplo.mcp
Variables_Críticas:
  - Stack Supabase completo con JWT tokens
  - Multi-schema DB: restaurante, personal, crm, operaciones, etc.
  - Email SMTP + IMAP configuración completa
  - Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### **Comandos de Validación Prerequisites**

#### **Paso 0: Validar Setup Completo (OBLIGATORIO)**
```bash
# Verificar que todos los prerequisites están configurados
/analyze --config --persona-architect --validate --interactive

# Comando alternativo para setup guiado
/build --setup --persona-architect --interactive --plan
```

**Este comando DEBE ejecutarse ANTES de crear o implementar el PRP y verificará**:
- ✅ Conectividad GitHub OAuth
- ✅ Supabase project accesible
- ✅ Neo4j database respondiendo
- ✅ API keys válidas y con créditos
- ✅ Variables de entorno con formato correcto

### **Comandos de Ejecución**

#### **Paso 1: Crear PRP (Solo si Paso 0 completado)**
```bash
# Ejecutar este comando para generar el PRP específico
/crear-mcp-prp prp_fullstack_base --thinkhard --persona-architect --c7 --seq --plan
```

#### **Paso 2: Implementar PRP (Solo si Paso 1 completado)**
```bash
# Ejecutar este comando para implementar el servidor MCP completo
/ejecutar-mcp-prp [nombre-del-prp-generado] --persona-architect --ultrathink --plan
```

### **Flujo de Desarrollo Secuencial**

#### **Fase 1: Preparación y Planificación** (45-60 min)
```yaml
Comandos_SuperClaude:
  - /sync-knowledge validate --persona-analyzer --seq
  - /crear-mcp-prp prp_fullstack_base --thinkhard --persona-architect --c7 --seq --plan
  - /analyze --code [nombre-prp] --persona-architect --validate

Persona_Principal: --persona-architect
Flags_Críticos: [--thinkhard, --c7, --seq, --plan]
MCPs_Requeridos: [Context7, Sequential]

Tareas_Específicas:
  1. Validar coherencia del knowledge base local
  2. Generar PRP integral con referencias específicas
  3. Validar PRP contra criterios de calidad (≥90/100)
```

#### **Fase 2: Foundation y Arquitectura** (90-120 min)
```yaml
Comandos_SuperClaude:
  - /ejecutar-mcp-prp [nombre-prp] --persona-architect --ultrathink --plan --dry-run
  - /build --init --persona-architect --seq --c7 --plan
  - /analyze --arch --persona-architect --seq --validate

Persona_Principal: --persona-architect
Flags_Críticos: [--ultrathink, --seq, --c7, --plan]
MCPs_Requeridos: [Context7, Sequential]

Tareas_Específicas:
  1. Crear estructura de directorios según CLAUDE.md
  2. Configurar TypeScript estricto y dependencias MCP
  3. Setup inicial de bases de datos (PostgreSQL + Neo4j)
  4. Configurar autenticación GitHub OAuth base
```

#### **Fase 3: Backend y Herramientas MCP** (180-240 min)
```yaml
Comandos_SuperClaude:
  - /design --api --persona-backend --seq --ultrathink --plan
  - /build --api --persona-backend --seq --security --think --plan
  - /test --api --persona-qa --coverage --validate

Persona_Principal: --persona-backend
Flags_Críticos: [--seq, --security, --think, --coverage]
MCPs_Requeridos: [Sequential]

Tareas_Específicas:
  1. Implementar 14+ herramientas MCP especializadas
  2. Crear sistema de registro centralizado de tools
  3. Configurar autenticación y permisos granulares
  4. Implementar knowledge base RAG con Supabase + pgvector
  5. Setup knowledge graph Neo4j con relaciones
```

#### **Fase 4: Frontend y UI** (120-180 min)
```yaml
Comandos_SuperClaude:
  - /design --ui --persona-frontend --magic --c7 --plan
  - /build --react --persona-frontend --magic --c7 --think --plan
  - /improve --accessibility --persona-frontend --magic --validate

Persona_Principal: --persona-frontend
Flags_Críticos: [--magic, --c7, --think, --validate]
MCPs_Requeridos: [Magic, Context7]

Tareas_Específicas:
  1. Diseñar sistema de componentes basado en ejemplos/
  2. Implementar dashboard de gestión del servidor MCP
  3. Crear interfaces para configuración y monitoreo
  4. Validar accesibilidad WCAG 2.1 AA (≥95%)
```

#### **Fase 5: Testing Integral** (90-120 min)
```yaml
Comandos_SuperClaude:
  - /test --coverage --persona-qa --validate --plan
  - /test --e2e --persona-qa --pup --validate
  - /scan --validate --persona-qa --security --coverage

Persona_Principal: --persona-qa
Flags_Críticos: [--coverage, --pup, --validate, --security]
MCPs_Requeridos: [Puppeteer]

Tareas_Específicas:
  1. Tests unitarios para todas las herramientas MCP
  2. Tests de integración para flujos completos
  3. Tests E2E con Puppeteer para validación visual
  4. Validación de cobertura ≥80% automática
```

#### **Fase 6: Seguridad y Deployment** (60-90 min)
```yaml
Comandos_SuperClaude:
  - /scan --security --persona-security --owasp --validate
  - /deploy --env --persona-architect --validate --plan --dry-run
  - /sync-knowledge full --persona-analyzer --seq --c7

Persona_Principal: --persona-security
Flags_Críticos: [--security, --owasp, --validate, --plan]
MCPs_Requeridos: [Sequential, Context7]

Tareas_Específicas:
  1. Auditoría de seguridad completa (OWASP)
  2. Validación MCP Inspector sin errores
  3. Preparación para deployment en Cloudflare Workers
  4. Sincronización final del knowledge base
```

---

## Resultado Final Esperado

### **Servidor MCP Avanzado**  
- ✅ 14+ herramientas MCP especializadas para desarrollo Full Stack
- ✅ Base de conocimiento RAG con búsqueda semántica
- ✅ Knowledge graph con relaciones arquitectónicas
- ✅ Integración SuperClaude con personas y workflows
- ✅ Crawling automático para conocimiento actualizado

### **Calidad Empresarial**
- ✅ Sistema de autenticación GitHub OAuth con permisos granulares
- ✅ Arquitectura modular extensible basada en patrones probados
- ✅ Base de datos especializada para conocimiento Full Stack
- ✅ Monitoreo y logging estructurado en producción
- ✅ Despliegue automatizado en Cloudflare Workers

## Criterios de Validación y Quality Gates

### **Validación por Fase (Basada en SuperClaude)**

#### **Validación PRP (Fase 1)**
```yaml
Comando_Validación: "/analyze --code [nombre-prp] --persona-architect --validate"
Score_Mínimo: 90/100
Criterios_Obligatorios:
  - ✅ PRP incluye referencias específicas a ejemplos/ (no genéricas)
  - ✅ Plan de implementación >10 tareas detalladas
  - ✅ Referencias Context7 están actualizadas
  - ✅ Herramientas MCP especificadas (14+ tools)
  - ✅ Arquitectura técnica completa definida
  - ✅ Comandos SuperClaude correctos incluidos
```

#### **Validación Foundation (Fase 2)**
```yaml
Comando_Validación: "/analyze --arch --validate --persona-architect"
Score_Mínimo: 95/100
Criterios_Obligatorios:
  - ✅ Estructura directorios sigue CLAUDE.md exactamente
  - ✅ TypeScript config estricto (no 'any' permitido)
  - ✅ Dependencias MCP instaladas y funcionando
  - ✅ Variables de entorno definidas completamente
  - ✅ Git repository y .gitignore configurados
```

#### **Validación Backend (Fase 3)**
```yaml
Comando_Validación: "/test --api --coverage --persona-qa --validate"
Score_Mínimo: 85/100
Criterios_Obligatorios:
  - ✅ 14+ herramientas MCP responden correctamente
  - ✅ Autenticación GitHub OAuth funciona end-to-end
  - ✅ Base de datos conexiones establecidas (PostgreSQL + Neo4j)
  - ✅ APIs Next.js generan responses válidas
  - ✅ Coverage backend ≥80% automáticamente
```

#### **Validación Frontend (Fase 4)**
```yaml
Comando_Validación: "/test --e2e --pup --validate --persona-qa"
Score_Mínimo: 85/100
Criterios_Obligatorios:
  - ✅ Componentes renderan sin errores
  - ✅ Formularios validan correctamente
  - ✅ Accessibility score ≥95 (WCAG 2.1 AA)
  - ✅ Performance Lighthouse ≥90
  - ✅ Responsive design funciona en todos los breakpoints
```

#### **Validación Security (Fase 6)**
```yaml
Comando_Validación: "/scan --security --owasp --persona-security --validate"
Score_Mínimo: 90/100
Criterios_Obligatorios:
  - ✅ Sin vulnerabilidades críticas o altas detectadas
  - ✅ Autenticación y autorización robustas
  - ✅ Políticas RLS configuradas correctamente
  - ✅ Rate limiting implementado en todas las APIs
  - ✅ Input validation en todos los endpoints
```

#### **Validación Final (Deployment)**
```yaml
Comando_Validación: "/deploy --validate --persona-architect --dry-run"
Score_Mínimo: 90/100
Criterios_Obligatorios:
  - ✅ MCP Inspector valida servidor sin errores
  - ✅ Tests E2E completos pasan 100%
  - ✅ Aplicación funciona end-to-end
  - ✅ Performance y seguridad optimizadas
  - ✅ Documentación auto-generada completa
  - ✅ Knowledge base sincronizado y coherente
```

### **KPIs de Éxito del Proyecto**

```yaml
Tiempo_Desarrollo: "6-10 horas total (reducción 80% vs tradicional)"
Calidad_Código: "Score ≥90/100 en todas las fases"
Herramientas_MCP: "14+ tools funcionales y validadas"
Coverage_Tests: "≥80% automático en toda la aplicación"
Performance: "Lighthouse ≥90 en todas las páginas"
Security: "Sin vulnerabilidades críticas/altas"
Accessibility: "WCAG 2.1 AA ≥95% compliance"
Knowledge_Base: ">90% coherencia entre fuentes"
```

### **Troubleshooting Automatizado**

Para problemas comunes, consultar `PRPs/ai_docs/superclaude_commands_guide.md` sección "Troubleshooting y Resolución de Problemas" que incluye:

- **PRP Incompleto**: Comando con `--depth=5 --interactive`
- **Foundation Issues**: Análisis con `--investigate` y corrección `--force`
- **MCP Tools Failing**: Troubleshooting con `--seq` y validación
- **Tests Failing**: Debugging con `--coverage --pup` y corrección iterativa
- **Performance Issues**: Análisis y optimización con `--performance`

---

**El resultado es un servidor MCP que actúa como un equipo de desarrollo Full Stack senior completo, capaz de generar aplicaciones de calidad empresarial en días en lugar de meses, con aprendizaje continuo y especialización por dominio.**