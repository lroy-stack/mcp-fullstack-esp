# **Guía Comprensiva de Configuración SuperClaude**

Basado en análisis de archivos de configuración de Claude, aquí tienes una guía completa sobre qué usar con Claude, cuándo y dónde.

## **🎯 Vista General**

SuperClaude es un framework sofisticado de asistente de IA con 18 comandos, 4 servidores MCP, 9 Personas, y patrones extensos de optimización. Está diseñado para desarrollo basado en evidencia con seguridad, rendimiento y calidad como principios fundamentales.

---

## **🔧 Componentes Core del Sistema**

### **1. Archivos de Configuración Principales**
- **`.claude/settings.local.json`** - Permisos básicos de Claude y configuraciones
- **`.claude/shared/superclaude-core.yml`** - Filosofía core, estándares y workflows  
- **`.claude/shared/superclaude-mcp.yml`** - Detalles de integración de servidor MCP
- **`.claude/shared/superclaude-rules.yml`** - Prácticas de desarrollo y reglas
- **`.claude/shared/superclaude-Personas.yml`** - 9 Personas especializadas

### **2. Arquitectura de Comandos**
- **18 Comandos Core** con workflows inteligentes
- **Sistema de Flags Universal** con patrones de herencia
- **Gestión de Tareas** con arquitectura de dos niveles
- **Optimización de Rendimiento** incluyendo modo UltraCompressed

---

## **🎭 Personas: Cuándo y Dónde Usar**

### **Personas de Desarrollo**
```yaml
--persona-frontend: "Enfoque UI/UX, accesibilidad, componentes React/Vue"
  When: Construyendo interfaces de usuario, sistemas de diseño, trabajo de accesibilidad
  Use with: Magic MCP, testing Puppeteer, --magic flag
  
--persona-backend: "Diseño API, escalabilidad, ingeniería de confiabilidad"  
  When: Construyendo APIs, bases de datos, arquitectura de servidor
  Use with: Context7 para patrones, --seq para análisis complejo
  
--persona-architect: "Diseño de sistemas, escalabilidad, pensamiento a largo plazo"
  When: Diseñando arquitectura, tomando decisiones tecnológicas
  Use with: Sequential MCP, --ultrathink para sistemas complejos
```

### **Personas de Calidad**
```yaml
--persona-analyzer: "Análisis de causa raíz, investigación basada en evidencia"
  When: Debugeando problemas complejos, investigando problemas
  Use with: Todos los MCPs para análisis comprensivo
  
--persona-security: "Modelado de amenazas, evaluación de vulnerabilidades"
  When: Auditorías de seguridad, compliance, testing de penetración
  Use with: --scan --security, Sequential para análisis de amenazas
  
--persona-qa: "Testing, aseguramiento de calidad, casos extremos"
  When: Escribiendo pruebas, validación de calidad, análisis de cobertura
  Use with: Puppeteer para testing E2E, --coverage flag
  
--persona-performance: "Optimización, profiling, cuellos de botella"
  When: Problemas de rendimiento, oportunidades de optimización
  Use with: Métricas Puppeteer, --profile flag
```

### **Personas de Mejora**
```yaml
--persona-refactorer: "Calidad de código, deuda técnica, mantenibilidad"
  When: Limpiando código, reduciendo deuda técnica
  Use with: --improve --quality, análisis Sequential
  
--persona-mentor: "Enseñanza, documentación, transferencia de conocimiento"
  When: Creando tutoriales, explicando conceptos, onboarding
  Use with: Context7 para docs oficiales, --depth flag
```

---

## **🔌 Servidores MCP: Capacidades y Uso**

### **Context7 (Documentación de Librerías)**
```yaml
Purpose: "Documentación oficial de librerías y ejemplos"
When_to_Use:
  - Integración de librerías externas
  - Búsqueda de documentación API  
  - Investigación de patrones de framework
  - Verificación de compatibilidad de versiones
  
Command_Examples:
  - "/analyze --c7" (investigar patrones de librería)
  - "/build --react --c7" (React con docs oficiales)
  - "/explain --c7" (explicaciones de documentación oficial)
  
Best_For: "Metodología research-first, implementación basada en evidencia"
Token_Cost: "Bajo-Medio"
```

### **Sequential (Análisis Complejo)**
```yaml
Purpose: "Resolución de problemas multi-paso y pensamiento arquitectónico"
When_to_Use:
  - Diseño de sistemas complejos
  - Análisis de causa raíz
  - Investigación de rendimiento
  - Revisión de arquitectura
  
Command_Examples:
  - "/analyze --seq" (análisis profundo de sistema)
  - "/troubleshoot --seq" (investigación sistemática)
  - "/design --seq --ultrathink" (planificación arquitectónica)
  
Best_For: "Análisis técnico complejo, razonamiento sistemático"
Token_Cost: "Medio-Alto"
```

### **Magic (Componentes UI)**
```yaml
Purpose: "Generación de componentes UI e integración de sistema de diseño"
When_to_Use:
  - Construcción de componentes React/Vue
  - Implementación de sistema de diseño
  - Consistencia de patrones UI
  - Prototipado rápido
  
Command_Examples:
  - "/build --react --magic" (generación de componentes)
  - "/design --magic" (sistemas de diseño UI)
  - "/improve --accessibility --magic" (componentes accesibles)
  
Best_For: "Implementación de diseño consistente, componentes de calidad"
Token_Cost: "Medio"
```

### **Puppeteer (Automatización de Navegador)**
```yaml
Purpose: "Testing E2E, validación de rendimiento, automatización de navegador"
When_to_Use:
  - Testing end-to-end
  - Monitoreo de rendimiento
  - Validación visual
  - Testing de interacción de usuario
  
Command_Examples:
  - "/test --e2e --pup" (testing E2E)
  - "/analyze --performance --pup" (métricas de rendimiento)
  - "/scan --validate --pup" (validación visual)
  
Best_For: "Aseguramiento de calidad, validación de rendimiento, testing UX"
Token_Cost: "Bajo (basado en acciones)"
```

---

## **⚡ Comandos Clave y Cuándo Usar**

### **Comandos de Análisis**
```yaml
/analyze: "Análisis comprensivo de codebase"
  Flags: --code --arch --security --performance --c7 --seq
  When: Entendiendo codebase, identificando problemas, investigación
  
/troubleshoot: "Investigación sistemática de problemas"  
  Flags: --investigate --seq --evidence
  When: Debugeando problemas complejos, análisis de causa raíz
  
/scan: "Escaneo de seguridad, calidad y compliance"
  Flags: --security --owasp --deps --validate
  When: Auditorías de seguridad, evaluación de vulnerabilidades
```

### **Comandos de Desarrollo**
```yaml
/build: "Implementación de funcionalidades y creación de proyectos"
  Flags: --init --feature --react --api --magic --tdd
  When: Construyendo funcionalidades, creando proyectos, implementando
  
/design: "Diseño arquitectónico y planificación de sistemas"
  Flags: --api --ddd --microservices --seq --ultrathink
  When: Arquitectura de sistemas, diseño API, planificación
  
/test: "Testing comprensivo y validación"
  Flags: --coverage --e2e --pup --validate
  When: Aseguramiento de calidad, cobertura de pruebas, validación
```

### **Comandos de Calidad**  
```yaml
/improve: "Calidad de código y optimización de rendimiento"
  Flags: --quality --performance --security --iterate
  When: Refactoring, optimización, mejoras de calidad
  
/cleanup: "Deuda técnica y mantenimiento"
  Flags: --code --all --dry-run
  When: Removiendo código no utilizado, limpiando deuda técnica
```

### **Comandos de Operaciones**
```yaml
/deploy: "Despliegue de producción y operaciones"
  Flags: --env --validate --monitor --checkpoint
  When: Desplegando a producción, tareas operacionales
  
/migrate: "Migraciones de datos y esquema"
  Flags: --database --validate --dry-run --rollback
  When: Cambios de base de datos, migraciones de datos
```

---

## **🎛 Flags Universales: Siempre Disponibles**

### **Planificación y Ejecución**
```yaml
--plan: "Mostrar plan de ejecución antes de ejecutar"
--dry-run: "Previsualizar cambios sin ejecución"
--force: "Anular verificaciones de seguridad"
--interactive: "Proceso guiado paso a paso"
```

### **Modos de Pensamiento**
```yaml
--think: "Análisis multi-archivo (4K tokens)"
--think-hard: "Análisis arquitectónico profundo (10K tokens)"  
--ultrathink: "Rediseño de sistema crítico (32K tokens)"
```

### **Compresión y Rendimiento**
```yaml
--uc: "Modo UltraCompressed (~70% reducción de tokens)"
--profile: "Profiling de rendimiento detallado"
--watch: "Monitoreo continuo"
```

### **Control MCP**
```yaml
--c7: "Habilitar búsqueda de documentación Context7"
--seq: "Habilitar análisis complejo Sequential"
--magic: "Habilitar generación de componentes UI Magic"
--pup: "Habilitar automatización de navegador Puppeteer"
--all-mcp: "Habilitar todos los servidores MCP"
--no-mcp: "Deshabilitar todos los servidores MCP"
```

---

## **📋 Sistema de Gestión de Tareas**

### **Arquitectura de Dos Niveles**
```yaml
Level_1_Tasks: "Funcionalidades de alto nivel (./claudedocs/tasks/)"
  Purpose: "Persistencia de sesión, branching git, seguimiento de requerimientos"
  Scope: "Funcionalidades que abarcan múltiples sesiones"
  
Level_2_Todos: "Pasos accionables inmediatos (TodoWrite/TodoRead)"  
  Purpose: "Seguimiento de ejecución en tiempo real dentro de sesión"
  Scope: "Acciones específicas de sesión actual"
```

### **Reglas de Auto-Trigger**
```yaml
Complex_Operations: "3+ pasos → Auto-trigger TodoList"
High_Risk: "Cambios de base de datos, despliegues → REQUIRE todos"
Long_Tasks: "Más de 30 minutos → AUTO-TRIGGER todos"
Multi_File: "6+ archivos → AUTO-TRIGGER para coordinación"
```

---

## **🔒 Configuración de Seguridad**

### **Integración OWASP Top 10**
- **Cobertura A01-A10** con patrones de detección automatizada
- **Escaneo CVE** para vulnerabilidades conocidas  
- **Seguridad de Dependencias** con compliance de licencias
- **Seguridad de Configuración** incluyendo detección de secretos hardcodeados

### **Uso de Comandos de Seguridad**
```yaml
/scan --security --owasp: "Escaneo completo OWASP Top 10"
/analyze --security --seq: "Análisis profundo de seguridad"  
/improve --security --harden: "Endurecimiento de seguridad"
```

---

## **⚡ Optimización de Rendimiento**

### **Modo UltraCompressed**
```yaml
Activation: "--uc flag | palabras clave 'compress' | Auto a >75% contexto"
Benefits: "~70% reducción de tokens | Respuestas más rápidas | Eficiencia de costos"
Use_When: "Codebases grandes | Sesiones largas | Restricciones de presupuesto de tokens"
```

### **Caché MCP**
```yaml
Context7: "1 hora TTL | Documentación de librerías"
Sequential: "Duración de sesión | Resultados de análisis"  
Magic: "2 horas TTL | Templates de componentes"
Parallel_Execution: "Llamadas MCP independientes se ejecutan simultáneamente"
```

---

## **🚀 Workflows de Inicio Rápido**

### **Configuración de Nuevo Proyecto**
```bash
/build --init --feature --react --magic --c7
# Crea proyecto React con componentes Magic y documentación Context7
```

### **Auditoría de Seguridad**
```bash
/scan --security --owasp --deps --strict
/analyze --security --seq
/improve --security --harden
```

### **Investigación de Rendimiento**
```bash
/analyze --performance --pup --profile
/troubleshoot --seq --evidence  
/improve --performance --iterate
```

### **Desarrollo de Funcionalidades**
```bash
/analyze --code --c7
/design --api --seq
/build --feature --tdd --magic
/test --coverage --e2e --pup
```

---

## **📊 Mejores Prácticas**

### **Desarrollo Basado en Evidencia**
- **Lenguaje Requerido**: "puede|podría|potencialmente|típicamente|medido|documentado"
- **Lenguaje Prohibido**: "mejor|óptimo|más rápido|seguro|mejor|siempre|nunca"
- **Estándares de Investigación**: Context7 para librerías externas, fuentes oficiales requeridas

### **Estándares de Calidad**  
- **Seguridad Git**: workflow Status→branch→fetch→pull
- **Testing**: Patrones TDD, cobertura comprensiva
- **Seguridad**: Tolerancia cero para vulnerabilidades

### **Guías de Rendimiento**
- **Simple→Sonnet | Complejo→Sonnet-4 | Crítico→Opus-4**
- **Herramientas nativas > MCP para tareas simples**
- **Ejecución paralela para operaciones independientes**

---

## **🎯 Cuándo Usar Qué: Matriz de Decisiones**

| **Escenario** | **Persona** | **MCP** | **Comando** | **Flags** |
|--------------|-------------|---------|-------------|-----------|
| **Nueva Funcionalidad React** | `--persona-frontend` | `--magic --c7` | `/build --feature` | `--react --tdd` |
| **Diseño API** | `--persona-architect` | `--seq --c7` | `/design --api` | `--ddd --ultrathink` |
| **Auditoría de Seguridad** | `--persona-security` | `--seq` | `/scan --security` | `--owasp --strict` |
| **Problema de Rendimiento** | `--persona-performance` | `--pup --seq` | `/analyze --performance` | `--profile --iterate` |
| **Investigación de Bug** | `--persona-analyzer` | `--all-mcp` | `/troubleshoot` | `--investigate --seq` |
| **Limpieza de Código** | `--persona-refactorer` | `--seq` | `/improve --quality` | `--iterate --threshold` |
| **Testing E2E** | `--persona-qa` | `--pup` | `/test --e2e` | `--coverage --validate` |
| **Documentación** | `--persona-mentor` | `--c7` | `/document --user` | `--examples --visual` |
| **Despliegue de Producción** | `--persona-security` | `--seq` | `/deploy --env prod` | `--validate --monitor` |

---

## **🔍 Detalles de Configuración Avanzada**

### **Filosofía Core**
```yaml
Philosophy: "Código>docs | Simple→complejo | Seguridad→evidencia→calidad"
Communication: "Formato | Símbolos: →|&|:|» | Estructurado>prosa"
Workflow: "TodoRead()→TodoWrite(3+)→Execute | Seguimiento en tiempo real"
Stack: "React|TS|Vite + Node|Express|PostgreSQL + Git|ESLint|Jest"
```

### **Estándares Basados en Evidencia**
```yaml
Prohibited_Language: "mejor|óptimo|más rápido|seguro|mejor|mejorado|mejorado|siempre|nunca|garantizado"
Required_Language: "puede|podría|potencialmente|típicamente|a menudo|a veces|medido|documentado"
Evidence_Requirements: "las pruebas confirman|las métricas muestran|los benchmarks prueban|los datos indican|la documentación establece"
Citations: "Documentación oficial requerida | Compatibilidad de versión verificada | Fuentes documentadas"
```

### **Economía de Tokens y Optimización**
```yaml
Model_Selection: "Simple→sonnet | Complejo→sonnet-4 | Crítico→opus-4"
Optimization_Targets: "Eficiencia | Respuestas basadas en evidencia | Entregables estructurados"
Template_System: "@include shared/*.yml | 70% reducción lograda"
Symbols: "→(lleva a) |(separador) &(combinar) :(definir) »(secuencia) @(ubicación)"
```

### **Auto-Activación Inteligente**
```yaml
File_Type_Detection: 
  tsx_jsx: "→persona frontend"
  py_js: "→stack apropiado"
  sql: "→operaciones de datos"
  Docker: "→workflows devops"
  test: "→persona qa"
  api: "→enfoque backend"

Keyword_Triggers:
  bug_error_issue: "→persona analyzer"
  optimize_performance: "→persona performance"
  secure_auth_vulnerability: "→persona security"
  refactor_clean: "→persona refactorer"
  explain_document_tutorial: "→persona mentor"
  design_architecture: "→persona architect"
```

---

## **📁 Estructura de Directorios y Organización de Archivos**

### **Rutas de Documentación**
```yaml
Claude_Docs: ".claudedocs/"
Reports: ".claudedocs/reports/"
Metrics: ".claudedocs/metrics/"
Summaries: ".claudedocs/summaries/"
Checkpoints: ".claudedocs/checkpoints/"
Tasks: ".claudedocs/tasks/"

Project_Documentation: "docs/"
API_Docs: "docs/api/"
User_Docs: "docs/user/"
Developer_Docs: "docs/dev/"
```

### **Estructura de Archivos de Configuración**
```yaml
Main_Config: ".claude/settings.local.json"
Shared_Configs: ".claude/shared/"
Command_Patterns: ".claude/commands/shared/"
Personas: ".claude/shared/superclaude-Personas.yml"
MCP_Integration: ".claude/shared/superclaude-mcp.yml"
```

---

Este sistema de configuración proporciona poder y flexibilidad sin precedentes para desarrollo asistido por IA. Usa las Personas para hacer coincidir expertise con tu tarea, aprovecha los servidores MCP para capacidades especializadas, y aplica los flags apropiados para resultados óptimos.

## **🚀 Primeros Pasos**

1. **Elige tu persona** basado en el tipo de trabajo que estás haciendo
2. **Selecciona servidores MCP apropiados** para tus necesidades específicas  
3. **Usa el comando correcto** con flags relevantes
4. **Aplica prácticas basadas en evidencia** a lo largo del desarrollo
5. **Aprovecha el modo UltraCompressed** para eficiencia cuando sea necesario

El sistema está diseñado para ser inteligente, adaptativo, y enfocado en entregar soluciones de alta calidad basadas en evidencia mientras mantiene estándares de seguridad y rendimiento.