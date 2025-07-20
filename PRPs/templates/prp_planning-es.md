name: "Template PRP de Planificación - Generación de PRD con Diagramas"
description: |

## Propósito
Generar Documentos de Requerimientos de Producto (PRDs) comprensivos con diagramas visuales, convirtiendo ideas vagas en especificaciones detalladas listas para PRPs de implementación.

## Filosofía
1. **Investigar Primero**: Recopilar contexto antes de planificar
2. **Pensamiento Visual**: Usar diagramas para clarificar conceptos
3. **Validación Integrada**: Incluir desafíos y casos extremos
4. **Listo para Implementación**: La salida se alimenta directamente en otros PRPs

---

## Concepto Inicial
$ARGUMENTS

## Proceso de Planificación

### Fase 1: Expansión de Ideas e Investigación

#### Recopilación de Contexto
```yaml
research_areas:
  market_analysis:
    - competitors: [Investigar soluciones similares]
    - user_needs: [Identificar puntos de dolor]
    - trends: [Direcciones actuales de la industria]
  
  technical_research:
    - existing_solutions: [Cómo otros resuelven esto]
    - libraries: [Herramientas/frameworks disponibles]
    - patterns: [Enfoques de implementación comunes]
  
  internal_context:
    - current_system: [Cómo funciona hoy]
    - constraints: [Limitaciones técnicas/de negocio]
    - integration_points: [Con qué debe funcionar]
```

#### Exploración Inicial
```
RESEARCH soluciones similares:
  - WEB_SEARCH: "{concepto} ejemplos de implementación"
  - WEB_SEARCH: "{concepto} mejores prácticas"
  - WEB_SEARCH: "{concepto} patrones de arquitectura"

ANALYZE codebase existente:
  - FIND: Funcionalidades similares ya implementadas
  - IDENTIFY: Patrones a seguir
  - NOTE: Restricciones técnicas
```

### Fase 2: Generación de Estructura PRD

#### 1. Resumen Ejecutivo
```markdown
## Declaración del Problema
[Articulación clara del problema que se está resolviendo]

## Vista General de la Solución
[Descripción de alto nivel de la solución propuesta]

## Métricas de Éxito
- Métrica 1: [Resultado medible]
- Métrica 2: [Resultado medible]
- KPI: [Indicador clave de rendimiento]
```

#### 2. Historias de Usuario y Escenarios
```markdown
## Flujo de Usuario Primario
\```mermaid
graph LR
    A[Acción del Usuario] --> B{Punto de Decisión}
    B -->|Ruta 1| C[Resultado 1]
    B -->|Ruta 2| D[Resultado 2]
    D --> E[Estado Final]
    C --> E
\```

## Historias de Usuario
1. **Como [tipo de usuario]**, quiero [acción] para que [beneficio]
   - Criterios de Aceptación:
     - [ ] Criterio 1
     - [ ] Criterio 2
   - Casos Extremos:
     - [Caso extremo 1]
     - [Caso extremo 2]
```

#### 3. Arquitectura del Sistema
```markdown
## Arquitectura de Alto Nivel
\```mermaid
graph TB
    subgraph "Frontend"
        UI[Interfaz de Usuario]
        State[Manejo de Estado]
    end
    
    subgraph "Backend"
        API[Capa API]
        BL[Lógica de Negocio]
        DB[(Base de Datos)]
    end
    
    subgraph "External"
        EXT[Servicios Externos]
    end
    
    UI --> API
    API --> BL
    BL --> DB
    BL --> EXT
    State --> UI
\```

## Desglose de Componentes
- **Componentes Frontend**:
  - [Componente 1]: [Propósito]
  - [Componente 2]: [Propósito]

- **Servicios Backend**:
  - [Servicio 1]: [Propósito]
  - [Servicio 2]: [Propósito]

- **Modelos de Datos**:
  - [Modelo 1]: [Campos y relaciones]
  - [Modelo 2]: [Campos y relaciones]
```

#### 4. Especificaciones Técnicas
```markdown
## Diseño de API
\```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant A as API
    participant D as Base de Datos
    participant E as Servicio Externo
    
    U->>F: Inicia Acción
    F->>A: POST /api/endpoint
    A->>D: Consultar Datos
    D-->>A: Retornar Datos
    A->>E: Llamar API Externa
    E-->>A: Respuesta
    A-->>F: Resultado Procesado
    F-->>U: Mostrar Resultado
\```

## Endpoints
- **POST /api/[resource]**
  - Request: `{field1: type, field2: type}`
  - Response: `{status: string, data: {...}}`
  - Errores: `400 Bad Request`, `401 Unauthorized`

## Flujo de Datos
\```mermaid
flowchart TD
    A[Datos de Entrada] --> B{Validación}
    B -->|Válido| C[Procesamiento]
    B -->|Inválido| D[Respuesta de Error]
    C --> E[Transformar]
    E --> F[Almacenar]
    F --> G[Retornar Éxito]
\```
```

#### 5. Estrategia de Implementación
```markdown
## Fases de Desarrollo
\```mermaid
graph LR
    A[Fundación] --> B[Funcionalidades Core]
    B --> C[Integración]
    C --> D[Testing]
    D --> E[Despliegue]
    
    A -.- F[Esquema de BD<br/>Framework API<br/>Autenticación]
    B -.- G[Lógica de Negocio<br/>Endpoints API<br/>UI Básica]
    C -.- H[Servicios Externos<br/>Integración UI Completa<br/>Manejo de Errores]
    D -.- I[Pruebas Unitarias<br/>Pruebas de Integración<br/>Pruebas de Rendimiento]
    E -.- J[Documentación<br/>Monitoreo<br/>Lanzamiento]
\```

## Prioridad de Implementación
1. **Fundación**: Infraestructura core y configuración
2. **Funcionalidades MVP**: Funcionalidad mínima viable
3. **Funcionalidades Mejoradas**: Capacidades adicionales
4. **Pulido**: Mejoras de rendimiento y UX
5. **Listo para Producción**: Testing completo y despliegue
```

### Fase 3: Desafío y Validación

#### Análisis del Abogado del Diablo
```yaml
challenges:
  technical_risks:
    - risk: "Rendimiento a escala"
      mitigation: "Implementar capa de caché"
    
    - risk: "Confiabilidad de API de terceros"
      mitigation: "Construir mecanismos de fallback"
  
  business_risks:
    - risk: "Adopción de usuarios"
      mitigation: "Rollout por fases con bucles de feedback"
    
    - risk: "Scope creep"
      mitigation: "Definición estricta de MVP"
  
  edge_cases:
    - scenario: "Sin conectividad de red"
      handling: "Modo offline con sincronización"
    
    - scenario: "Actualizaciones concurrentes"
      handling: "Bloqueo optimista"
```

#### Criterios de Éxito
```markdown
## Definición de Hecho
- [ ] Todas las historias de usuario implementadas
- [ ] Cobertura de pruebas > 80%
- [ ] Benchmarks de rendimiento cumplidos
- [ ] Revisión de seguridad pasada
- [ ] Documentación completa

## Resultados Medibles
- Métrica 1: [Valor objetivo]
- Métrica 2: [Valor objetivo]
- Satisfacción del usuario: [Puntaje objetivo]
```

### Fase 4: Validación y Salida

#### Checklist Pre-Implementación
```
VALIDATE supuestos:
  - Factibilidad técnica confirmada
  - Disponibilidad de recursos verificada
  - Dependencias identificadas
  - Riesgos documentados con mitigaciones

REVIEW con stakeholders:
  - Alineación de negocio confirmada
  - Enfoque técnico aprobado
  - Timeline aceptable
  - Métricas de éxito acordadas
```

#### Formato de Salida
El PRD final debe estar estructurado como:

1. **Resumen Ejecutivo** (1 página)
2. **Requerimientos Detallados** (con diagramas)
3. **Arquitectura Técnica** (con diagramas)
4. **Plan de Implementación** (con timeline)
5. **Apéndices** (investigación, alternativas consideradas)

### Comandos de Validación

```bash
# Verificar completitud del PRD
grep -E "(TODO|TBD|FIXME)" generated_prd.md

# Verificar sintaxis de diagramas
mermaid-cli -i generated_prd.md -o prd_diagrams.pdf

# Validar estructura
python validate_prd_structure.py generated_prd.md
```

## Anti-Patrones a Evitar
- ❌ Requerimientos vagos sin criterios de aceptación
- ❌ Casos extremos y escenarios de error faltantes
- ❌ Diagramas que no coinciden con el texto
- ❌ Jerga técnica sin explicación
- ❌ Timelines irreales
- ❌ Sin métricas de éxito

## Indicadores de Éxito
- ✅ Otro desarrollador podría implementar solo con este PRD
- ✅ Todos los stakeholders entienden el plan
- ✅ Los riesgos están identificados con mitigaciones
- ✅ Ruta clara del estado actual al estado deseado
- ✅ Los diagramas clarifican en lugar de confundir

## Ejemplo de Uso del Template

Entrada: "Construir un sistema de notificaciones para nuestra app"

La salida incluiría:
- Diagramas de flujo de usuario para diferentes tipos de notificaciones
- Arquitectura del sistema mostrando patrones pub/sub
- Diagramas de secuencia para entrega en tiempo real
- Esquema de base de datos para preferencias de notificación
- Especificaciones API para endpoints de notificación
- Fases de implementación y prioridades
- Casos extremos como usuarios offline, rate limiting
- Métricas de éxito como tasa de entrega, engagement del usuario

El PRD resultante se convierte en la entrada `$ARGUMENTS` para PRPs de implementación como BASE_PRP o SPEC_PRP.