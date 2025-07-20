# Guardrails de Desarrollo MCP

Sistema de checkpoints y validaciones para asegurar calidad en cada fase del desarrollo de servidores MCP Full Stack.

## Fase 0: Validación Prerequisites (OBLIGATORIO)

### **Checkpoint**: Configuración Base
```bash
# Ejecutar ANTES de cualquier implementación
/analyze --config --persona-architect --validate --interactive
```

**Criterios de Validación**:
- ✅ Variables de entorno configuradas (`scripts/validate-setup.ts`)
- ✅ Supabase + pgvector accesible
- ✅ Neo4j responding
- ✅ API keys Anthropic/OpenAI válidas
- ✅ Referencias a `ejemplos/` resueltas

**Script Automático**: `scripts/validate-setup.ts`  
**Umbral Mínimo**: 100% servicios críticos funcionando

---

## Fase 1: Análisis PRP (45-60 min)

### **Checkpoint**: Parseo y Validación PRP
```bash
/crear-mcp-prp prp_fullstack_base --thinkhard --persona-architect --c7 --seq --plan
```

**Validaciones Automáticas**:
1. **Estructura PRP Completa**
   - ✅ Secciones frontend/backend/database definidas
   - ✅ Herramientas MCP especificadas (mínimo 10)
   - ✅ Referencias a `ejemplos/` incluidas
   - ✅ Criterios de éxito medibles

2. **Coherencia Técnica**
   - ✅ Stack tecnológico consistente (Next.js + Supabase + Neo4j)
   - ✅ Patrones referencian `PRPs/ai_docs/` específicos
   - ✅ Ejemplos apuntan a código real en `ejemplos/`

**Criterios de Paso**:
- Score PRP ≥ 90/100
- Referencias válidas 100%
- Plan implementación >10 tareas específicas

**Guardrails de Bloqueo**:
- ❌ Referencias rotas a documentación
- ❌ Patrones no encontrados en ejemplos
- ❌ Stack tecnológico inconsistente

---

## Fase 2: Arquitectura y Foundation (90-120 min)

### **Checkpoint**: Estructura Base Servidor MCP
```bash
/build --init --persona-architect --seq --c7 --plan
```

**Validaciones de Estructura**:
1. **Directorios Obligatorios**
   - ✅ `src/tools/` (herramientas MCP)
   - ✅ `src/auth/` (autenticación)
   - ✅ `src/database/` (conexiones BD)
   - ✅ `src/knowledge/` (RAG + Knowledge Graph)

2. **Archivos Core**
   - ✅ `src/index.ts` (servidor MCP principal)
   - ✅ `src/types.ts` (tipos compartidos)
   - ✅ `package.json` (dependencias MCP)
   - ✅ `.env.example` (variables documentadas)

**Script de Validación**:
```typescript
// Ejecutar automáticamente
npm run validate-structure
```

**Criterios de Paso**:
- TypeScript compila sin errores
- Dependencias MCP instaladas correctamente
- Estructura sigue patterns de `ejemplos/database-tools-es.ts`

---

## Fase 3: Implementación Herramientas MCP (180-240 min)

### **Checkpoint**: Herramientas Funcionales
```bash
/build --api --persona-backend --seq --security --think --plan
```

**Validaciones por Herramienta**:

#### **3.1 Herramientas de Generación**
- ✅ `generateComponent`: usa patterns de `ejemplos/components/`
- ✅ `generateAPIEndpoint`: valida con Zod, incluye auth
- ✅ `generateDatabaseSchema`: RLS policies, migraciones
- ✅ `implementAuth`: integra con Supabase Auth

#### **3.2 Herramientas de Knowledge**  
- ✅ `searchKnowledge`: búsqueda semántica funcional
- ✅ `queryProjectGraph`: consultas Neo4j respondiendo
- ✅ `updateKnowledgeBase`: persistencia en Supabase

**Tests Automáticos**:
```bash
# Cada herramienta debe pasar
npm test src/tools/
npm run test:integration
```

**Criterios de Paso**:
- 100% herramientas responden a llamadas MCP
- Validación de input con Zod
- Manejo de errores robusto
- Logging estructurado implementado

**Guardrails de Seguridad**:
- ❌ SQL injection posible
- ❌ Auth bypass detectado  
- ❌ Secrets expuestos en logs
- ❌ Rate limiting ausente

---

## Fase 4: Integración RAG y Knowledge Graph (120-180 min)

### **Checkpoint**: Sistemas de Conocimiento
```bash
/build --knowledge --persona-architect --seq --validate
```

**Validaciones RAG**:
1. **Supabase + pgvector**
   - ✅ Embeddings generándose correctamente
   - ✅ Búsqueda semántica retorna resultados relevantes
   - ✅ Threshold de similitud configurado (≥0.7)
   - ✅ Reranking mejora relevancia

2. **Knowledge Graph Neo4j**
   - ✅ Conexión estable a Neo4j
   - ✅ Consultas Cypher ejecutándose
   - ✅ Relaciones arquitectónicas mapeadas
   - ✅ Insights generándose automáticamente

**Scripts de Validación**:
```bash
# Validar RAG
node scripts/test-rag-search.js

# Validar Knowledge Graph  
node scripts/test-neo4j-queries.js
```

**Criterios de Paso**:
- Búsquedas RAG <2s respuesta
- Knowledge Graph <5s consultas complejas
- 100% cobertura de dominios (frontend/backend/database)

---

## Fase 5: Frontend y UI (120-180 min)

### **Checkpoint**: Interfaces Generadas
```bash
/build --react --persona-frontend --magic --c7 --think --plan
```

**Validaciones Frontend**:
1. **Componentes Generados**
   - ✅ TypeScript estricto, sin 'any'
   - ✅ Props validadas con interfaces
   - ✅ Estilos Tailwind CSS aplicados
   - ✅ Accesibilidad WCAG 2.1 AA

2. **Páginas Next.js**
   - ✅ App Router utilizado
   - ✅ Server Components donde apropiado
   - ✅ Loading states implementados
   - ✅ Error boundaries configurados

**Tests de Calidad**:
```bash
# Accessibility testing
npm run test:a11y

# Visual regression  
npm run test:visual

# Performance
npm run lighthouse
```

**Criterios de Paso**:
- Lighthouse Score ≥90
- Accessibility Score ≥95  
- 0 errores TypeScript
- Responsive design funcional

---

## Fase 6: Testing Integral (90-120 min)

### **Checkpoint**: Coverage y Calidad
```bash
/test --coverage --persona-qa --validate --plan
```

**Suite de Testing Completa**:

#### **6.1 Tests Unitarios**
- ✅ Herramientas MCP: 100% funciones core
- ✅ Componentes React: eventos, props, estado
- ✅ Utilidades: parsers, validators, helpers

#### **6.2 Tests Integración**
- ✅ APIs Next.js: request/response cycles
- ✅ Base datos: queries, transactions, RLS
- ✅ Auth: flujos completos login/logout

#### **6.3 Tests E2E**
- ✅ Flujos usuario críticos
- ✅ Generación código end-to-end
- ✅ Performance bajo carga

**Umbrales Obligatorios**:
- Coverage general: ≥80%
- Coverage herramientas MCP: ≥95%
- Tests E2E: 100% flujos críticos pasan
- Performance: APIs <500ms, UI <2s

---

## Fase 7: Seguridad y Deployment (60-90 min)

### **Checkpoint**: Validación Seguridad
```bash
/scan --security --persona-security --owasp --validate
```

**Auditoría de Seguridad**:

#### **7.1 OWASP Top 10**
- ✅ No inyección SQL detectada
- ✅ Auth y autorización robustas  
- ✅ Datos sensibles protegidos
- ✅ Componentes sin vulnerabilidades conocidas

#### **7.2 Específicos MCP**
- ✅ Validación input herramientas MCP
- ✅ Rate limiting por herramienta
- ✅ Sanitización respuestas AI
- ✅ Secrets management correcto

**Tools de Validación**:
```bash
# Security scanning
npm audit --audit-level high
npm run security:scan

# MCP Inspector
npx @modelcontextprotocol/inspector
```

**Criterios de Paso**:
- 0 vulnerabilidades críticas/altas
- MCP Inspector validation: 100%
- Penetration testing: PASS
- Compliance checks: PASS

---

## Checkpoints de Bloqueo Automáticos

### **Nivel 1: Errores Críticos**
```yaml
Bloqueo_Inmediato:
  - TypeScript compilation errors
  - Tests failing >5%
  - Security vulnerabilities critical/high  
  - MCP tools not responding
  - Database connection failures
```

### **Nivel 2: Warnings de Calidad**
```yaml
Warning_Revisión:
  - Coverage <80%
  - Performance degradation >20%
  - Accessibility score <90%
  - Memory leaks detected
  - Rate limits not configured
```

### **Nivel 3: Optimizaciones Recomendadas**
```yaml
Mejoras_Sugeridas:
  - Bundle size optimization
  - Database query optimization  
  - Caching strategies
  - Error message improvements
  - Documentation updates
```

## Scripts de Validación Automática

### **Comando Master de Validación**
```bash
# Ejecutar todas las validaciones en secuencia
npm run validate:all

# O por fases específicas
npm run validate:phase-1  # Prerequisites
npm run validate:phase-3  # MCP Tools  
npm run validate:phase-6  # Testing
npm run validate:phase-7  # Security
```

### **Integración CI/CD**
```yaml
# .github/workflows/mcp-validation.yml
name: MCP Guardrails Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate Prerequisites
        run: npm run validate:prerequisites
      - name: Validate MCP Tools
        run: npm run validate:mcp-tools  
      - name: Security Scan
        run: npm run validate:security
```

Este sistema de guardrails asegura que cada fase del desarrollo MCP mantenga estándares de calidad empresarial y funcionalidad robusta.