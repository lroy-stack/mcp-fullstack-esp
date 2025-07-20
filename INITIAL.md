# Requerimientos Iniciales - Servidor MCP Full Stack Developer

## CARACTERÍSTICA:

Queremos crear el **Servidor MCP Full Stack Developer Definitivo** - un servidor MCP que actúa como un equipo de desarrollo completo, capaz de desarrollar aplicaciones Next.js de principio a fin.

**BASADO EN IMPLEMENTACIONES REALES Y PROBADAS:** Este servidor aprovecha el conocimiento específico del dominio extraído de implementaciones reales del **Gestor de Reservas Enigma** (ver `ejemplos/`) y patrones arquitectónicos validados en producción.

Este servidor MCP debe combinar:
- **Base de conocimiento RAG avanzada** usando Supabase + pgvector para búsqueda semántica
- **Knowledge Graph relacional** con Neo4j + Graphiti MCP para entender arquitecturas y relaciones
- **Metodología PRP** para desarrollo sistemático y predecible
- **Framework SuperClaude** con personas especializadas y comandos inteligentes
- **Crawling inteligente** para mantener conocimiento técnico actualizado
- **Conocimiento específico del dominio** extraído de implementaciones reales (`ejemplos/`)

El objetivo es que un LLM/agente IA conectado a este servidor pueda asistir al usuario para desarrollar una aplicación completa, actuando como un desarrollador senior especializado en múltiples áreas: backend, frontend, UI/UX, testing, seguridad, etc.

## EJEMPLOS DE REFERENCIA DISPONIBLES:

### **Sistema de Documentación Jerárquico**

**ORDEN DE CONSULTA**: CLAUDE.md → INITIAL.md → ai_docs/ → ejemplos/ → Context7

#### **Documentación Inmutable** (Reglas de Oro)
- **CLAUDE.md**: Principios fundamentales, guardrails automáticos, directorio destino
- **INITIAL.md**: Conceptualización completa del servidor MCP Full Stack (este documento)

#### **Guías Técnicas Especializadas** (ai_docs/)
- **33 documentos técnicos** organizados por categorías: Core MCP, Integración, Arquitectura, Testing, Claude Code
- **Cobertura completa**: Desde prerequisites hasta deployment en producción
- **Referencias cruzadas**: Sistema interconectado de guías especializadas

#### **Implementaciones Reales del Gestor de Reservas** (ejemplos/)
- **50+ Componentes React Especializados**: `ejemplos/components/` - Componentes probados en producción
- **Esquemas de BD Multi-Schema Reales**: `ejemplos/database/` - Estructura validada: `restaurante.*`, `personal.*`, `crm.*`, `operaciones.*`  
- **Patterns de Autenticación Supabase RLS**: `ejemplos/auth/` - Middleware y helpers validados
- **Testing Patterns del Dominio**: `ejemplos/testing/` - Tests unitarios, integración y E2E
- **Tipos TypeScript del Dominio**: `ejemplos/types/database.ts` - Interfaces validadas en producción
- **Custom Hooks Probados**: `ejemplos/hooks/` - Hooks especializados para el dominio

#### **Base de Conocimiento RAG Implementada** (src/)
- **Servidor MCP con Herramientas RAG**: `src/crawl4ai_mcp.py` - 14 herramientas MCP funcionales
- **Utilidades para Embeddings**: `src/utils.py` - Supabase + OpenAI para búsqueda semántica
- **Knowledge Graph Neo4j**: `knowledge_graphs/` - Validación y análisis arquitectónico

#### **Configuración y Scripts** (config/ y scripts/)
- **Templates de Variables**: Configuración completa para todos los ambientes
- **Scripts de Validación**: Verificación automatizada de prerequisites
- **Stack Tecnológico Validado**: Next.js 14 + Supabase + Prisma + Tailwind + Shadcn/ui

## CARACTERÍSTICAS ADICIONALES:

### **Sistema de Conocimiento Integral**
- **Crawling automático** de documentación técnica (Next.js, React, TypeScript, Supabase, etc.)
- **Base de conocimiento específica del proyecto** (ej: gestor de reservas para restaurante)
- **Ejemplos de código, componentes UI/UX, migraciones SQL, políticas RLS**
- **Patrones de arquitectura y mejores prácticas** almacenados como knowledge graph
- **Actualización continua** del conocimiento mediante crawling programado

### **Herramientas MCP Especializadas** (Basadas en Implementaciones Reales)
- **`parseFullStackPRP`** - Analizar PRPs y extraer requerimientos frontend/backend/database usando patrones validados
- **`generateProjectArchitecture`** - Crear arquitectura completa basada en estructura real de ejemplos/
- **`generateComponent`** - Generar componentes React usando patrones de ejemplos/components/ (50+ ejemplos)
- **`generateAPIEndpoint`** - Crear APIs Next.js usando patrones de ejemplos/auth/ y validaciones reales
- **`generateDatabaseSchema`** - Diseñar esquemas usando estructura multi-schema real de ejemplos/database/
- **`implementAuth`** - Sistema autenticación basado en ejemplos/auth/middleware.ts y RLS de Supabase
- **`generateTests`** - Crear tests usando patrones de ejemplos/testing/ (unitarios, integración, E2E)
- **`searchKnowledge`** - Búsqueda semántica en knowledge base local + ejemplos específicos del dominio
- **`queryProjectGraph`** - Consultas al knowledge graph usando datos de knowledge_graphs/
- **`updateKnowledgeBase`** - Aprendizaje continuo incorporando nuevas implementaciones

### **Integración con SuperClaude**
- **Personas especializadas** para cada tipo de tarea (frontend, backend, architecture, security, qa)
- **Comandos inteligentes** (/analyze, /build, /design, /test, /improve)
- **Workflows automatizados** que combinan múltiples herramientas
- **Flags contextuales** para optimizar el comportamiento según la tarea

### **Especialización en Dominios** (Conocimiento Específico del Gestor de Reservas)
- **Conocimiento específico** del gestor de reservas extraído de implementación real en `ejemplos/`
- **Componentes especializados** reales: 
  - `ejemplos/components/calendar/` - Sistema de calendario interactivo
  - `ejemplos/components/modals/` - 12 modales especializados del dominio
  - `ejemplos/components/dashboard/` - Dashboards y widgets del restaurante
  - `ejemplos/components/notifications/` - Sistema de notificaciones real
- **Patrones UI/UX** específicos validados en `ejemplos/components/` (50+ componentes)
- **Esquemas de base de datos** reales en `ejemplos/database/schema-design.sql`:
  - `restaurante.reservas` con campos: `nombre_reserva`, `email_reserva`, `telefono_reserva` 
  - `restaurante.mesas` con `numero_mesa`, `capacidad`, `zona_id`
  - `personal.empleados` con roles y permisos reales
  - `crm.*` y `operaciones.*` para gestión avanzada
- **Políticas de seguridad** reales en `ejemplos/database/rls-policies.sql` (RLS Supabase validado)

## EJEMPLOS Y DOCUMENTACIÓN:

### **Fuentes de Conocimiento Jerárquicas**

**ORDEN DE CONSULTA OBLIGATORIO**: CLAUDE.md → INITIAL.md → ai_docs/ → ejemplos/ → Context7

#### **1. Documentación Inmutable (SIEMPRE PRIMERO)**
- **CLAUDE.md**: Reglas de oro, guardrails automáticos, principios fundamentales
- **INITIAL.md**: Conceptualización completa y visión del proyecto

#### **2. Guías Técnicas Especializadas (SEGUNDA PRIORIDAD)**
- **ai_docs/**: 33 documentos técnicos organizados por categorías
- **Cobertura completa**: Core MCP, Integración, Arquitectura, Testing, Claude Code
- **Sistema referencial**: Interconexión entre guías especializadas

#### **3. Implementaciones Reales (TERCERA PRIORIDAD)**
- **ejemplos/**: Gestor de reservas Enigma validado en producción
- **src/**: Base RAG implementada con herramientas de búsqueda semántica
- **knowledge_graphs/**: Análisis arquitectónico con Neo4j
- **Patterns Validados**: ejemplos/components/, ejemplos/database/, ejemplos/auth/

#### **4. Documentación Externa (CUARTA PRIORIDAD)**
- **Context7**: Referencias como fuente complementaria
- **Documentación oficial**: Next.js, React, TypeScript, Tailwind CSS, Shadcn/ui
- **Supabase**: Auth, Database, RLS, Edge Functions, Realtime
- **Testing**: Jest, Cypress, Playwright, React Testing Library

### **Proyecto de Referencia: Gestor de Reservas** (Implementación Real)
- **Arquitectura de referencia** real en ejemplos/ - Sistema multi-schema validado
- **Componentes especializados** reales en ejemplos/components/ - 50+ componentes probados
- **Flujos de usuario** implementados: booking, gestión, analytics
- **Esquemas de base de datos** reales en ejemplos/database/ - PostgreSQL multi-schema
- **Casos de uso comunes** validados en ejemplos/testing/ - Tests E2E funcionales

### **Ejemplos de Integración** (Implementaciones Validadas)
- **Flujos completos** desde PRP hasta aplicación desplegada
- **Patrones de código** reutilizables documentados en ejemplos/
- **Tests automatizados** reales en ejemplos/testing/ para cada tipo de componente
- **Optimizaciones de rendimiento** específicas implementadas en ejemplos/hooks/

## OTRAS CONSIDERACIONES:

### **Arquitectura Técnica**
- **Directorio Destino**: El servidor MCP Full Stack se crea en `mcp-fullstack-developer/` (nuevo directorio)
- **Base**: Evolución del conocimiento de mcp-crawl4ai-rag como referencia
- **Stack principal**: Next.js + TypeScript + Supabase + Neo4j
- **Transporte**: FastMCP con soporte SSE y stdio
- **Autenticación**: GitHub OAuth para acceso seguro
- **Despliegue**: Cloudflare Workers para escalabilidad

### **Metodología de Desarrollo**
- **Seguir estrictamente la metodología PRP** para desarrollo sistemático
- **Una tarea por archivo** para mantener separación de responsabilidades
- **Usar LLMs (Anthropic Claude)** para parseo de PRPs, no regex complejo
- **Aprendizaje continuo** - cada implementación mejora la base de conocimiento

### **Variables de Entorno Requeridas**
```bash
# APIs externas
OPENAI_API_KEY=tu_clave_openai_para_embeddings
ANTHROPIC_API_KEY=tu_clave_anthropic_para_parseo
CLAUDE_MODEL=claude-3-sonnet-20240229

# Bases de datos
SUPABASE_URL=tu_url_supabase
SUPABASE_SERVICE_KEY=tu_service_key_supabase
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=tu_password_neo4j

# Configuración del servidor
TRANSPORT=sse
HOST=0.0.0.0
PORT=8051

# Características RAG
USE_CONTEXTUAL_EMBEDDINGS=true
USE_HYBRID_SEARCH=true
USE_AGENTIC_RAG=true
USE_RERANKING=true
USE_KNOWLEDGE_GRAPH=true
```

### **Calidad y Estándares**
- **Testing automático** - generar tests para cada componente/API
- **TypeScript estricto** - tipos seguros en todo el código
- **Seguridad by design** - validación, sanitización, políticas RLS
- **Rendimiento optimizado** - lazy loading, caché, optimizaciones
- **Documentación automática** - generar docs desde código y PRPs

### **Escalabilidad y Mantenimiento**
- **Arquitectura modular** - herramientas MCP independientes
- **Knowledge base actualizable** - crawling automático y manual
- **Versionado de conocimiento** - tracking de cambios en documentación
- **Métricas y monitoreo** - tracking de rendimiento y calidad

### **Integración con Ecosistema**
- **Compatible con Claude Code** y framework SuperClaude
- **Integrable con otros MCPs** (Graphiti, Context7, Sequential, Magic)
- **Extensible** - fácil agregar nuevos dominios y herramientas
- **Reutilizable** - patrones aplicables a otros tipos de aplicaciones

## Arquitectura Propuesta del Knowledge Graph

### **Nodos Principales**
```cypher
// Proyecto y módulos
(:Project {name: "gestor-reservas", type: "restaurant-management"})
(:Module {name: "reservations", purpose: "booking-system"})
(:Module {name: "customers", purpose: "customer-management"})
(:Module {name: "staff", purpose: "staff-scheduling"})

// Componentes y APIs
(:Component {name: "ReservationForm", type: "form", framework: "react"})
(:APIEndpoint {path: "/api/reservations", method: "POST", auth: "required"})
(:DatabaseTable {name: "reservations", engine: "postgresql"})

// Patrones y mejores prácticas
(:UIPattern {name: "reservation-modal", complexity: "medium"})
(:SecurityPattern {name: "rls-multi-tenant", level: "enterprise"})
```

### **Relaciones Clave**
```cypher
// Dependencias técnicas
(Component)-[:USES_COMPONENT]->(Component)
(Component)-[:CALLS_API]->(APIEndpoint)
(APIEndpoint)-[:QUERIES_TABLE]->(DatabaseTable)

// Patrones de diseño
(Component)-[:IMPLEMENTS_PATTERN]->(UIPattern)
(APIEndpoint)-[:FOLLOWS_PATTERN]->(SecurityPattern)

// Conocimiento derivado
(Implementation)-[:LEARNED_FROM]->(Project)
(Pattern)-[:EXTRACTED_FROM]->(Implementation)
```

---

**Resultado Esperado**: Un servidor MCP que transforme el desarrollo de aplicaciones web, reduciendo el tiempo de development en 80% mientras mantiene la máxima calidad, seguridad y mejores prácticas. El desarrollador simplemente describe lo que necesita en un PRP y obtiene una aplicación completa, testada y lista para producción.