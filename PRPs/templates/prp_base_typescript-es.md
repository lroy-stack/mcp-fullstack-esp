name: "Template PRP Base v2 - Rico en Contexto con Bucles de Validación"
description: |

## Propósito

Template optimizado para agentes de IA para implementar funcionalidades con contexto suficiente y capacidades de auto-validación para lograr código funcional a través de refinamiento iterativo.

## Principios Core

1. **El Contexto es Rey**: Incluir TODA la documentación necesaria, ejemplos y advertencias
2. **Bucles de Validación**: Proporcionar pruebas/lints ejecutables que la IA pueda ejecutar y corregir
3. **Denso en Información**: Usar palabras clave y patrones del codebase
4. **Éxito Progresivo**: Empezar simple, validar, luego mejorar

---

## Objetivo

[Qué necesita ser construido - ser específico sobre el estado final y deseos]

## Por Qué

- [Valor de negocio e impacto del usuario]
- [Integración con funcionalidades existentes]
- [Problemas que esto resuelve y para quién]

## Qué

[Comportamiento visible al usuario y requerimientos técnicos]

### Criterios de Éxito

- [ ] [Resultados específicos medibles]

## Todo el Contexto Necesario

### Documentación y Referencias (listar todo el contexto necesario para implementar la funcionalidad)

```yaml
# DEBE LEER - Incluir estos en tu ventana de contexto
- url: [URL oficial de docs Next.js/React]
  why: [Secciones/métodos específicos que necesitarás]

- file: [path/to/example.tsx]
  why: [Patrón a seguir, gotchas a evitar]

- doc: [URL documentación de librería]
  section: [Sección específica sobre errores comunes]
  critical: [Insight clave que previene errores comunes]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs que el usuario ha pegado en el proyecto]
```

### Árbol de Codebase actual (ejecutar `tree` en la raíz del proyecto) para obtener una vista general del codebase

```bash

```

### Árbol de Codebase deseado con archivos a agregar y responsabilidad del archivo

```bash

```

### Gotchas Conocidos de nuestro codebase y Peculiaridades de Librerías

```typescript
// CRÍTICO: [Nombre de librería] requiere [configuración específica]
// Ejemplo: Next.js 15 App Router - Route handlers deben exportar funciones nombradas
// Ejemplo: directiva 'use client' debe estar en la parte superior del archivo, afecta todo el árbol de componentes
// Ejemplo: Server Components no pueden usar APIs del navegador o event handlers
// Ejemplo: Usamos modo estricto de TypeScript y requerimos tipado apropiado
```

## Blueprint de Implementación

### Modelos de datos y estructura

Crear los modelos de datos core, aseguramos type safety y consistencia.

```typescript
Ejemplos:
 - Esquemas Zod para validación
 - Interfaces/tipos TypeScript
 - Tipos de esquema de base de datos
 - Tipos de respuesta API
 - Tipos de props de componentes

```

### Lista de tareas a completar para cumplir el PRP en el orden que deben completarse

```yaml
Tarea 1:
MODIFY app/layout.tsx:
  - FIND pattern: "export default function RootLayout"
  - INJECT in metadata object
  - PRESERVE children prop typing

CREATE app/(dashboard)/layout.tsx:
  - MIRROR pattern from: app/layout.tsx
  - MODIFY for dashboard-specific layout
  - KEEP TypeScript typing patterns identical

...(...)

Tarea N:
...

```

### Pseudocódigo por tarea según sea necesario agregado a cada tarea

```typescript

# Tarea 1
// Pseudocódigo con detalles CRÍTICOS no escribir código completo
export default async function NewFeature({ params }: { params: { id: string } }) {
    // PATRÓN: Siempre validar params primero (ver lib/validation.ts)
    const validated = validateParams(params)  // throws ValidationError
    
    // GOTCHA: Esta librería requiere error boundaries apropiados
    try {
        // PATRÓN: Usar patrón existente de data fetching
        const data = await fetchData(validated.id)  // ver lib/data.ts
        
        // CRÍTICO: Server Components pueden hacer fetch de datos directamente
        return (
            <div>
                {/* PATRÓN: Usar patrones de componentes existentes */}
                <DataDisplay data={data} />
            </div>
        )
    } catch (error) {
        // PATRÓN: Manejo de errores estandarizado
        return <ErrorBoundary error={error} />  // ver components/error-boundary.tsx
    }
}
```

### Puntos de Integración

```yaml
DATABASE:
  - migration: "Add table 'feature_data' with proper indexes"
  - client: "@/lib/database/client"
  - pattern: "createClient() for client components, createServerClient() for server components"

CONFIG:
  - add to: .env.local
  - pattern: "NEXT_PUBLIC_* for client-side env vars"
  - pattern: "FEATURE_TIMEOUT = process.env.FEATURE_TIMEOUT || '30000'"

ROUTES:
  - file structure: app/feature-name/page.tsx
  - api routes: app/api/feature-name/route.ts
  - middleware: middleware.ts (root level)
```

## Bucle de Validación

### Nivel 1: Sintaxis y Estilo

```bash
# Ejecutar estos PRIMERO - corregir cualquier error antes de proceder
npm run lint                    # verificaciones ESLint
npx tsc --noEmit               # verificación de tipos TypeScript
npm run format                 # formateo Prettier

# Esperado: Sin errores. Si hay errores, LEER el error y corregir.
```

### Nivel 2: Pruebas Unitarias cada nueva funcionalidad/archivo/función usar patrones de prueba existentes

```typescript
// CREAR __tests__/new-feature.test.tsx con estos casos de prueba:
import { render, screen } from '@testing-library/react'
import { NewFeature } from '@/components/new-feature'

describe('NewFeature', () => {
  test('renders without crashing', () => {
    render(<NewFeature />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  test('handles invalid input gracefully', () => {
    render(<NewFeature invalidProp="" />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  test('calls API with correct parameters', async () => {
    const mockFetch = jest.fn()
    global.fetch = mockFetch
    
    render(<NewFeature />)
    // ... probar interacción API
  })
})
```

```bash
# Ejecutar e iterar hasta que pase:
npm test new-feature.test.tsx
# Si falla: Leer error, entender causa raíz, corregir código, re-ejecutar (nunca mockear para pasar)
```

### Nivel 3: Prueba de Integración

```bash
# Iniciar el servidor dev
npm run dev

# Probar que la página carga
curl http://localhost:3000/dashboard/users
# Esperado: Respuesta HTML con tabla de usuarios

# Probar el endpoint API
curl -X POST http://localhost:3000/api/feature \
  -H "Content-Type: application/json" \
  -d '{"param": "test_value"}'

# Esperado: {"status": "success", "data": {...}}
# Si error: Verificar consola del navegador y terminal de Next.js para mensajes de error
```

### Nivel 4: Despliegue y Validación Creativa

```bash
# Verificación de build de producción
npm run build

# Esperado: Build exitoso sin errores
# Problemas comunes:
# - "Module not found" → Verificar paths de import
# - "Hydration mismatch" → Asegurar que servidor/cliente rendericen el mismo contenido
# - Errores de tipo → Ejecutar tsc para identificar

# Probar build de producción
npm run start

# Métodos de validación creativos:
# - Testing E2E con Playwright/Cypress
# - Testing de rendimiento con Lighthouse
# - Testing de accesibilidad con axe
# - Análisis de tamaño de bundle
# - Validación SEO

# Validación personalizada específica a la funcionalidad
# [Agregar métodos de validación creativos aquí]
```

## Checklist de validación final

- [ ] Todas las pruebas pasan: `npm test`
- [ ] Sin errores de linting: `npm run lint`
- [ ] Sin errores de tipo: `npx tsc --noEmit`
- [ ] Prueba manual exitosa: [curl/comando específico]
- [ ] Casos de error manejados graciosamente
- [ ] Los logs son informativos pero no verbosos
- [ ] Documentación actualizada si es necesario

---

## Anti-Patrones a Evitar

- ❌ No crear nuevos patrones cuando los existentes funcionan
- ❌ No saltar validación porque "debería funcionar"
- ❌ No ignorar pruebas que fallan - corregirlas
- ❌ No usar 'use client' innecesariamente - adoptar Server Components
- ❌ No hardcodear valores que deberían ser config
- ❌ No capturar todas las excepciones - ser específico