# Guía Completa de Comandos SuperClaude para Servidor MCP Full Stack

## 🎯 **Propósito**

Guía definitiva para usar el sistema SuperClaude de manera estructurada y eficiente en el desarrollo del **Servidor MCP Full Stack Developer**, aprovechando todas las personas, flags y MCPs disponibles.

## 📋 **Comandos Disponibles**

### **Comandos Locales (.claude/commands/)**

#### **`/crear-mcp-prp`** - Crear PRP Integral
```bash
# Sintaxis correcta
/crear-mcp-prp prp_fullstack_base --thinkhard --persona-architect --c7 --seq --plan

# Parámetros
- template: prp_fullstack_base (sin .md)
- flags_recomendados: --thinkhard --persona-architect --c7 --seq --plan
- tiempo_estimado: 30-45 minutos
- resultado: PRP de 300-500 líneas en PRPs/
```

#### **`/ejecutar-mcp-prp`** - Implementar PRP
```bash
# Sintaxis correcta
/ejecutar-mcp-prp nombre-del-prp-generado --persona-architect --ultrathink --plan

# Parámetros
- prp_file: nombre del PRP generado (sin .md)
- flags_recomendados: --persona-architect --ultrathink --plan --dry-run
- tiempo_estimado: 6-10 horas total
- resultado: Directorio mcp-fullstack-developer/ completo
```

#### **`/sync-knowledge`** - Sincronizar Knowledge Base
```bash
# Validar coherencia
/sync-knowledge validate --persona-analyzer --seq

# Actualizar conocimiento
/sync-knowledge update --persona-analyzer

# Sincronización completa
/sync-knowledge full --persona-analyzer --seq --c7
```

#### **`/crawl-context7`** - Actualizar Documentación
```bash
/crawl-context7 --c7 --think --persona-analyzer
```

#### **`/refine-framework`** - Optimizar Patrones
```bash
/refine-framework --persona-refactorer --iterate --improve
```

### **Comandos SuperClaude Core**

#### **Análisis y Investigación**
```bash
/analyze --code --arch --security --c7 --seq
/troubleshoot --investigate --seq --evidence --persona-analyzer
/scan --security --owasp --deps --validate --persona-security
```

#### **Desarrollo y Construcción**
```bash
/build --init --feature --react --api --magic --tdd
/design --api --ddd --microservices --seq --ultrathink
/test --coverage --e2e --pup --validate
```

#### **Calidad y Optimización**
```bash
/improve --quality --performance --security --iterate
/cleanup --code --all --dry-run
/deploy --env --validate --monitor --checkpoint
```

## 🎭 **Personas SuperClaude Aplicadas al MCP**

### **Fase de Arquitectura y Planificación**
```yaml
Persona: --persona-architect
Especialización: "Diseño de sistemas, arquitectura, decisiones tecnológicas"
Comandos_Principales:
  - "/crear-mcp-prp prp_fullstack_base --thinkhard --persona-architect"
  - "/design --api --seq --ultrathink --persona-architect" 
  - "/analyze --arch --seq --persona-architect"
Flags_Recomendados: ["--ultrathink", "--seq", "--c7", "--plan"]
Cuándo_Usar: "Parseo de PRPs, diseño de arquitectura, decisiones técnicas complejas"
MCPs_Sugeridos: "Sequential para análisis profundo, Context7 para patrones actuales"
```

### **Fase de Backend y APIs**
```yaml
Persona: --persona-backend
Especialización: "APIs, bases de datos, lógica de negocio, escalabilidad"
Comandos_Principales:
  - "/build --api --persona-backend --security --seq"
  - "/design --database --persona-backend --seq"
  - "/test --api --coverage --persona-backend"
Flags_Recomendados: ["--seq", "--security", "--think", "--validate"]
Cuándo_Usar: "Desarrollo de herramientas MCP, APIs Next.js, esquemas de BD"
MCPs_Sugeridos: "Sequential para lógica compleja, Context7 para patterns de API"
```

### **Fase de Frontend y UI**
```yaml
Persona: --persona-frontend
Especialización: "UI/UX, componentes React, accesibilidad"
Comandos_Principales:
  - "/build --react --persona-frontend --magic --c7"
  - "/design --ui --persona-frontend --magic"
  - "/improve --accessibility --persona-frontend --magic"
Flags_Recomendados: ["--magic", "--c7", "--think", "--validate"]
Cuándo_Usar: "Generación de componentes, interfaces de usuario, dashboards"
MCPs_Sugeridos: "Magic para componentes UI, Context7 para patterns React"
```

### **Fase de Testing y QA**
```yaml
Persona: --persona-qa
Especialización: "Testing, aseguramiento de calidad, casos extremos"
Comandos_Principales:
  - "/test --coverage --persona-qa --pup --validate"
  - "/scan --validate --persona-qa --pup"
  - "/analyze --quality --persona-qa --coverage"
Flags_Recomendados: ["--coverage", "--pup", "--validate", "--think"]
Cuándo_Usar: "Tests automáticos, validación E2E, quality gates"
MCPs_Sugeridos: "Puppeteer para testing E2E, Sequential para test strategies"
```

### **Fase de Seguridad y Auditoría**
```yaml
Persona: --persona-security
Especialización: "Seguridad, vulnerabilidades, compliance"
Comandos_Principales:
  - "/scan --security --persona-security --owasp"
  - "/analyze --security --persona-security --seq"
  - "/improve --security --persona-security"
Flags_Recomendados: ["--security", "--owasp", "--validate", "--seq"]
Cuándo_Usar: "Auditorías de seguridad, autenticación, políticas RLS"
MCPs_Sugeridos: "Sequential para análisis de amenazas, Context7 para security patterns"
```

### **Fase de Análisis y Debugging**
```yaml
Persona: --persona-analyzer
Especialización: "Análisis de causa raíz, investigación basada en evidencia"
Comandos_Principales:
  - "/troubleshoot --investigate --persona-analyzer --seq"
  - "/analyze --code --persona-analyzer --evidence"
  - "/sync-knowledge validate --persona-analyzer --seq"
Flags_Recomendados: ["--seq", "--investigate", "--evidence", "--think"]
Cuándo_Usar: "Debugging problemas complejos, análisis de knowledge base"
MCPs_Sugeridos: "Sequential para investigación sistemática, Context7 para research"
```

## ⚡ **Flags Universales Críticos**

### **Modos de Pensamiento**
```yaml
--think: 
  descripción: "Análisis multi-archivo (4K tokens)"
  cuándo_usar: "Tareas estándar de desarrollo"
  ejemplo: "/build --react --think"

--thinkhard:
  descripción: "Análisis arquitectónico profundo (10K tokens)"
  cuándo_usar: "Creación de PRPs, diseño de arquitectura"
  ejemplo: "/crear-mcp-prp prp_fullstack_base --thinkhard"

--ultrathink:
  descripción: "Rediseño de sistemas críticos (32K tokens)"
  cuándo_usar: "Arquitectura compleja, sistemas críticos"
  ejemplo: "/ejecutar-mcp-prp nombre-prp --ultrathink"
```

### **Control de MCPs**
```yaml
--c7:
  descripción: "Habilitar Context7 para documentación actualizada"
  cuándo_usar: "Validar mejores prácticas, research de patterns"
  ejemplo: "/crear-mcp-prp prp_fullstack_base --c7"

--seq:
  descripción: "Habilitar Sequential para análisis paso a paso"
  cuándo_usar: "Análisis complejo, debugging, arquitectura"
  ejemplo: "/analyze --arch --seq"

--magic:
  descripción: "Habilitar Magic para generación de componentes UI"
  cuándo_usar: "Desarrollo frontend, componentes React"
  ejemplo: "/build --react --magic"

--pup:
  descripción: "Habilitar Puppeteer para testing E2E"
  cuándo_usar: "Tests automatizados, validación visual"
  ejemplo: "/test --e2e --pup"

--all-mcp:
  descripción: "Habilitar todos los MCPs disponibles"
  cuándo_usar: "Tareas complejas que requieren múltiples capacidades"
  ejemplo: "/ejecutar-mcp-prp nombre-prp --all-mcp"
```

### **Planificación y Control**
```yaml
--plan:
  descripción: "Mostrar plan de ejecución antes de ejecutar"
  cuándo_usar: "SIEMPRE recomendado para validar pasos"
  ejemplo: "/build --api --plan"

--dry-run:
  descripción: "Preview cambios sin ejecutar"
  cuándo_usar: "Validar cambios antes de aplicar"
  ejemplo: "/ejecutar-mcp-prp nombre-prp --dry-run"

--interactive:
  descripción: "Proceso guiado paso a paso"
  cuándo_usar: "Primeras implementaciones, aprendizaje"
  ejemplo: "/crear-mcp-prp prp_fullstack_base --interactive"
```

### **Calidad y Validación**
```yaml
--coverage:
  descripción: "Cobertura de tests mínima 80%"
  cuándo_usar: "Testing, validación de calidad"
  ejemplo: "/test --coverage"

--security:
  descripción: "Validaciones de seguridad OWASP"
  cuándo_usar: "Auditorías, desarrollo seguro"
  ejemplo: "/scan --security"

--validate:
  descripción: "Validación de calidad integral"
  cuándo_usar: "Quality gates, deployment checks"
  ejemplo: "/deploy --validate"
```

## 🔄 **Flujo Secuencial Recomendado**

### **Fase 0: Validación Prerequisites (15-30 min) - OBLIGATORIO**
```bash
# 1. Validar configuración completa
/analyze --config --persona-architect --validate --interactive

# 2. Test de conectividad a servicios
/test --connectivity --persona-analyzer --validate

# 3. Setup guiado si hay problemas
/build --setup --persona-architect --interactive --plan
```

**Criterios obligatorios para continuar**:
- ✅ GitHub OAuth App configurada y accesible
- ✅ Supabase project respondiendo con pgvector habilitado
- ✅ Neo4j database conectada (local o cloud)
- ✅ OpenAI API Key válida con créditos disponibles
- ✅ Anthropic API Key válida con créditos disponibles
- ✅ Variables de entorno con formato correcto

### **Fase 1: Preparación y Planificación (45-60 min)**
```bash
# 1. Validar knowledge base (solo si Fase 0 completada)
/sync-knowledge validate --persona-analyzer --seq

# 2. Crear PRP integral
/crear-mcp-prp prp_fullstack_base \
  --thinkhard \
  --persona-architect \
  --c7 \
  --seq \
  --plan \
  --interactive

# 3. Validar PRP generado
/analyze --code nombre-del-prp-generado --persona-architect --plan
```

### **Fase 2: Foundation y Arquitectura (90-120 min)**
```bash
# 1. Implementar estructura base
/ejecutar-mcp-prp nombre-del-prp-generado \
  --persona-architect \
  --ultrathink \
  --plan \
  --dry-run

# 2. Validar foundation
/analyze --arch --persona-architect --seq --validate

# 3. Setup inicial completo
/build --init \
  --persona-architect \
  --seq \
  --c7 \
  --plan
```

### **Fase 3: Backend y Herramientas MCP (180-240 min)**
```bash
# 1. Diseñar arquitectura de herramientas
/design --api \
  --persona-backend \
  --seq \
  --ultrathink \
  --plan

# 2. Implementar herramientas MCP
/build --api \
  --persona-backend \
  --seq \
  --security \
  --think \
  --plan

# 3. Validar herramientas
/test --api \
  --persona-qa \
  --coverage \
  --validate
```

### **Fase 4: Frontend y UI (120-180 min)**
```bash
# 1. Diseñar sistema de componentes
/design --ui \
  --persona-frontend \
  --magic \
  --c7 \
  --plan

# 2. Implementar componentes
/build --react \
  --persona-frontend \
  --magic \
  --c7 \
  --think \
  --plan

# 3. Validar accesibilidad y rendimiento
/improve --accessibility \
  --persona-frontend \
  --magic \
  --validate
```

### **Fase 5: Testing Integral (90-120 min)**
```bash
# 1. Tests unitarios y de integración
/test --coverage \
  --persona-qa \
  --validate \
  --plan

# 2. Tests E2E
/test --e2e \
  --persona-qa \
  --pup \
  --validate

# 3. Validación de calidad completa
/scan --validate \
  --persona-qa \
  --security \
  --coverage
```

### **Fase 6: Seguridad y Deployment (60-90 min)**
```bash
# 1. Auditoría de seguridad
/scan --security \
  --persona-security \
  --owasp \
  --validate

# 2. Preparar deployment
/deploy --env \
  --persona-architect \
  --validate \
  --plan \
  --dry-run

# 3. Sincronización final del knowledge base
/sync-knowledge full \
  --persona-analyzer \
  --seq \
  --c7
```

## 📊 **Criterios de Validación por Fase**

### **Validación de PRP**
```yaml
Comando: "/analyze --code nombre-prp --persona-architect --plan"
Criterios_Mínimos:
  - ✅ PRP incluye referencias específicas a ejemplos/
  - ✅ Plan de implementación >10 tareas detalladas
  - ✅ Referencias Context7 están actualizadas
  - ✅ Herramientas MCP especificadas (14+)
  - ✅ Arquitectura técnica completa definida
Score_Mínimo: 90/100
```

### **Validación Foundation**
```yaml
Comando: "/analyze --arch --validate --persona-architect"
Criterios_Mínimos:
  - ✅ Estructura directorios sigue CLAUDE.md
  - ✅ TypeScript config estricto configurado
  - ✅ Dependencias MCP instaladas correctamente
  - ✅ Variables de entorno definidas
  - ✅ Git repository inicializado correctamente
Score_Mínimo: 95/100
```

### **Validación Backend**
```yaml
Comando: "/test --api --coverage --persona-qa"
Criterios_Mínimos:
  - ✅ 14+ herramientas MCP responden correctamente
  - ✅ Autenticación GitHub OAuth funciona
  - ✅ Base de datos conexiones establecidas
  - ✅ APIs Next.js generan responses válidas
  - ✅ Coverage backend ≥80%
Score_Mínimo: 85/100
```

### **Validación Frontend**
```yaml
Comando: "/test --e2e --pup --validate --persona-qa"
Criterios_Mínimos:
  - ✅ Componentes renderan sin errores
  - ✅ Formularios validan correctamente
  - ✅ Accessibility score ≥95 (WCAG 2.1 AA)
  - ✅ Performance Lighthouse ≥90
  - ✅ Responsive design funciona
Score_Mínimo: 85/100
```

### **Validación Seguridad**
```yaml
Comando: "/scan --security --owasp --persona-security"
Criterios_Mínimos:
  - ✅ Sin vulnerabilidades críticas o altas
  - ✅ Autenticación y autorización robustas
  - ✅ Políticas RLS configuradas correctamente
  - ✅ Rate limiting implementado
  - ✅ Input validation en todas las APIs
Score_Mínimo: 90/100
```

### **Validación Final**
```yaml
Comando: "/deploy --validate --persona-architect --dry-run"
Criterios_Mínimos:
  - ✅ MCP Inspector valida servidor sin errores
  - ✅ Tests E2E completos pasan 100%
  - ✅ Aplicación funciona end-to-end
  - ✅ Performance y seguridad optimizadas
  - ✅ Documentación auto-generada completa
Score_Mínimo: 90/100
```

## 🚨 **Troubleshooting y Resolución de Problemas**

### **Problema: PRP Incompleto o Genérico**
```yaml
Síntomas:
  - PRP generado <200 líneas
  - Referencias genéricas sin paths específicos
  - Falta contexto de ejemplos locales
Solución:
  comando: "/crear-mcp-prp prp_fullstack_base --thinkhard --c7 --persona-architect --depth=5 --interactive"
  verificación: "/analyze --code nombre-prp --persona-architect --validate"
```

### **Problema: Foundation Incompleta**
```yaml
Síntomas:
  - Estructura directorios incorrecta
  - Dependencias faltantes o incorrectas
  - Configuración TypeScript no estricta
Solución:
  análisis: "/analyze --arch --persona-architect --seq --investigate"
  corrección: "/build --init --force --persona-architect --plan"
  validación: "/test --validate --dry-run"
```

### **Problema: Herramientas MCP No Responden**
```yaml
Síntomas:
  - MCP Inspector reporta errores
  - Herramientas no registradas correctamente
  - Problemas de conexión con Claude
Solución:
  investigación: "/troubleshoot --investigate --persona-analyzer --seq"
  corrección: "/build --api --force --persona-backend --seq"
  validación: "/scan --validate --persona-security"
```

### **Problema: Tests Fallando**
```yaml
Síntomas:
  - Coverage <80%
  - Tests E2E fallan
  - Errores de renderizado
Solución:
  análisis: "/troubleshoot --investigate --persona-qa --pup --seq"
  corrección: "/test --coverage --force --persona-qa --pup"
  validación: "/improve --quality --persona-qa --validate"
```

### **Problema: Performance Issues**
```yaml
Síntomas:
  - Lighthouse score <90
  - Respuestas lentas de APIs
  - Bundle size excesivo
Solución:
  análisis: "/analyze --performance --persona-performance --seq"
  optimización: "/improve --performance --persona-performance --iterate"
  validación: "/test --performance --pup --validate"
```

### **Problema: Prerequisites No Configurados**
```yaml
Síntomas:
  - Comandos fallan con errores de conexión
  - Variables de entorno no encontradas
  - APIs retornan errores de autenticación
Solución:
  diagnóstico: "/analyze --config --persona-architect --validate --interactive"
  setup_guiado: "/build --setup --persona-architect --interactive --plan"
  verificación: "/test --connectivity --persona-analyzer --validate"
```

### **Problema: GitHub OAuth Issues**
```yaml
Síntomas:
  - Error "invalid_client" en autenticación
  - Callback URL mismatch
  - Scopes insuficientes
Solución:
  verificación: "/analyze --auth --persona-security --validate"
  reconfiguración: "/build --oauth --persona-security --interactive"
  documentación: "Consultar PRPs/ai_docs/setup_prerequisites_guide.md"
```

### **Problema: Database Connectivity**
```yaml
Síntomas:
  - Supabase connection timeout
  - Neo4j authentication failed
  - pgvector extension not found
Solución:
  diagnóstico: "/troubleshoot --database --persona-analyzer --seq --investigate"
  corrección: "/build --database --persona-backend --force --interactive"
  validación: "/test --database --persona-backend --validate"
```

### **Problema: API Keys Inválidas**
```yaml
Síntomas:
  - OpenAI/Anthropic API errors
  - Rate limits excedidos
  - Billing issues
Solución:
  verificación: "/analyze --apikeys --persona-analyzer --validate"
  renovación: "/build --apikeys --persona-architect --interactive"
  monitoreo: "/analyze --usage --persona-analyzer --seq"
```

## 🔄 **Comandos de Sincronización y Mantenimiento**

### **Sincronización Regular**
```bash
# Diaria - validación rápida
/sync-knowledge validate --persona-analyzer --quick

# Semanal - actualización incremental  
/sync-knowledge update --persona-analyzer --c7

# Mensual - sincronización completa
/sync-knowledge full --persona-analyzer --seq --c7 --deep
```

### **Crawling Context7 Especializado**
```bash
# Actualizar patterns específicos
/crawl-context7 --domains="nextjs.org,supabase.com,prisma.io" --c7 --think

# Verificar breaking changes
/crawl-context7 --check-breaking --c7 --persona-analyzer

# Actualización completa documentación
/crawl-context7 --full --c7 --seq --persona-analyzer
```

### **Refinamiento de Framework**
```bash
# Optimizar patterns existentes
/refine-framework --patterns --persona-refactorer --iterate

# Detectar código obsoleto
/refine-framework --cleanup --persona-refactorer --analyze

# Mejorar performance general
/refine-framework --performance --persona-performance --optimize
```

## 📈 **KPIs y Métricas de Éxito**

### **Métricas de Desarrollo**
```yaml
Tiempo_Total_Desarrollo: "6-10 horas (reducción 80% vs tradicional)"
Calidad_Código: "Score ≥90/100 en todas las fases"
Coverage_Tests: "≥80% automático"
Performance: "Lighthouse ≥90"
Security: "Sin vulnerabilidades críticas/altas"
```

### **Métricas de Knowledge Base**
```yaml
Coherencia_General: ">90% (crítico: <80%)"
Freshness_Embeddings: ">85% (warning: <70%)"
Coverage_Knowledge_Graph: ">95% (target: 100%)"
Context7_Alignment: ">80% (informativo)"
```

### **Métricas de Funcionalidad MCP**
```yaml
Herramientas_MCP_Funcionales: "14+ todas respondiendo"
MCP_Inspector_Validation: "100% sin errores"
Claude_Desktop_Integration: "Conecta sin problemas"
Generación_Aplicaciones: "End-to-end funcional"
```

---

**Resultado**: Una guía completa que transforma el desarrollo del Servidor MCP de un proceso complejo a un workflow estructurado y predecible, usando SuperClaude de manera óptima para lograr resultados de calidad empresarial en tiempo récord.