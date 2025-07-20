# Ejemplos MCP Full Stack

Colección modular de ejemplos probados para desarrollo de servidores MCP.

## Organización por Funcionalidad

### **Herramientas de Base de Datos**
- `../database-tools-es.ts` - Herramientas MCP PostgreSQL completas
- `../database-tools-sentry-es.ts` - Versión con monitoreo
- `../database/` - Esquemas SQL, RLS policies, triggers

### **Componentes Frontend**
- `../components/calendar/` - Sistema de calendario (5 componentes)
- `../components/modals/` - Modales especializados (12 tipos)
- `../components/notifications/` - Sistema de notificaciones (8 componentes)

### **Autenticación y Middleware**  
- `../auth/middleware.ts` - Middleware Supabase validado
- `../auth/auth-helpers.ts` - Helpers de autenticación

### **Testing Patterns**
- `../testing/api.test.ts` - Tests API Next.js
- `../testing/component.test.tsx` - Tests componentes React
- `../testing/e2e.spec.ts` - Tests end-to-end Playwright

## Uso en Herramientas MCP

### **Patrón de Referencia**
```python
# En herramienta MCP, buscar ejemplos similares
from utils import search_code_examples

examples = await search_code_examples(
    "React modal component",
    domain="frontend",
    source_filter="ejemplos/components/modals"
)

# Usar ejemplos como base para generación
component_code = await generate_from_examples(examples)
```

### **Referencias Directas**
- **Database Tools**: Usar `../database-tools-es.ts` como template base
- **Component Patterns**: Referenciar `../components/` por tipo específico  
- **Auth Integration**: Aplicar patterns de `../auth/`
- **Testing Strategy**: Seguir structure de `../testing/`

## Índice por Dominio

### **Backend (APIs y Base de Datos)**
```
ejemplos/
├── database-tools-es.ts          # Herramientas MCP BD
├── database/
│   ├── schema-design.sql         # Esquemas multi-schema
│   ├── rls-policies.sql          # Políticas Row Level Security  
│   └── triggers.sql              # Triggers automatizados
└── auth/
    ├── middleware.ts             # Middleware autenticación
    └── auth-helpers.ts           # Helpers Supabase
```

### **Frontend (Componentes React)**
```
ejemplos/components/
├── calendar/                     # Sistema calendario
├── modals/                       # Modales especializados
├── notifications/                # Sistema notificaciones
└── web-admin/                    # Interfaces administrativas
```

### **Testing y Validación**
```
ejemplos/testing/
├── api.test.ts                   # Testing APIs
├── component.test.tsx            # Testing componentes
└── e2e.spec.ts                   # Testing end-to-end
```

Este directorio actúa como **biblioteca de referencias** para herramientas MCP - todos los ejemplos son código real y probado del proyecto.