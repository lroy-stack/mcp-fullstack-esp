# Gestionar la memoria de Claude

> Aprende cómo gestionar la memoria de Claude Code entre sesiones con diferentes ubicaciones de memoria y mejores prácticas.

Claude Code puede recordar tus preferencias entre sesiones, como guías de estilo y comandos comunes en tu flujo de trabajo.

## Determinar tipo de memoria

Claude Code ofrece tres ubicaciones de memoria, cada una sirviendo un propósito diferente:

| Tipo de Memoria                | Ubicación              | Propósito                                  | Ejemplos de Casos de Uso                                                |
| -------------------------- | --------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| **Memoria de proyecto**         | `./CLAUDE.md`         | Instrucciones compartidas del equipo para el proyecto | Arquitectura del proyecto, estándares de codificación, flujos de trabajo comunes         |
| **Memoria de usuario**            | `~/.claude/CLAUDE.md` | Preferencias personales para todos los proyectos    | Preferencias de estilo de código, atajos de herramientas personales             |
| **Memoria de proyecto (local)** | `./CLAUDE.local.md`   | Preferencias personales específicas del proyecto    | _(Deprecado, ver abajo)_ Tus URLs sandbox, datos de prueba preferidos |

Todos los archivos de memoria se cargan automáticamente en el contexto de Claude Code cuando se lanza.

## Imports en CLAUDE.md

Los archivos CLAUDE.md pueden importar archivos adicionales usando sintaxis `@path/to/import`. El siguiente ejemplo importa 3 archivos:

```
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

Se permiten tanto rutas relativas como absolutas. En particular, importar archivos en el directorio home del usuario es una forma conveniente para que los miembros de tu equipo proporcionen instrucciones individuales que no se registren en el repositorio. Anteriormente CLAUDE.local.md servía un propósito similar, pero ahora está deprecado en favor de imports ya que funcionan mejor en múltiples git worktrees.

```
# Individual Preferences
- @~/.claude/my-project-instructions.md
```

Para evitar posibles colisiones, los imports no se evalúan dentro de spans de código markdown y bloques de código.

```
This code span will not be treated as an import: `@anthropic-ai/claude-code`
```

Los archivos importados pueden importar recursivamente archivos adicionales, con una profundidad máxima de 5 saltos. Puedes ver qué archivos de memoria se cargan ejecutando el comando `/memory`.

## Cómo Claude busca memorias

Claude Code lee memorias recursivamente: empezando en el cwd, Claude Code recurre hacia arriba hasta (pero sin incluir) el directorio raíz _/_ y lee cualquier archivo CLAUDE.md o CLAUDE.local.md que encuentre. Esto es especialmente conveniente cuando trabajas en repositorios grandes donde ejecutas Claude Code en _foo/bar/_, y tienes memorias tanto en _foo/CLAUDE.md_ como en _foo/bar/CLAUDE.md_.

Claude también descubrirá CLAUDE.md anidados en subárboles bajo tu directorio de trabajo actual. En lugar de cargarlos al lanzar, solo se incluyen cuando Claude lee archivos en esos subárboles.

## Agregar rápidamente memorias con el atajo `#`

La forma más rápida de agregar una memoria es empezar tu entrada con el carácter `#`:

```
# Always use descriptive variable names
```

Se te solicitará seleccionar en qué archivo de memoria almacenar esto.

## Editar directamente memorias con `/memory`

Usa el comando slash `/memory` durante una sesión para abrir cualquier archivo de memoria en tu editor del sistema para adiciones más extensas u organización.

## Configurar memoria del proyecto

Supongamos que quieres configurar un archivo CLAUDE.md para almacenar información importante del proyecto, convenciones, y comandos de uso frecuente.

Inicializa un CLAUDE.md para tu base de código con el siguiente comando:

```
> /init
```

<Tip>
  Consejos:

- Incluye comandos de uso frecuente (build, test, lint) para evitar búsquedas repetidas
- Documenta preferencias de estilo de código y convenciones de nomenclatura
- Agrega patrones arquitectónicos importantes específicos a tu proyecto
- Las memorias CLAUDE.md pueden usarse tanto para instrucciones compartidas con tu equipo como para tus preferencias individuales.
  </Tip>

## Mejores prácticas de memoria

- **Sé específico**: "Use 2-space indentation" es mejor que "Format code properly".
- **Usa estructura para organizar**: Formatea cada memoria individual como un punto de lista y agrupa memorias relacionadas bajo encabezados markdown descriptivos.
- **Revisa periódicamente**: Actualiza memorias conforme tu proyecto evoluciona para asegurar que Claude siempre esté usando la información y contexto más actualizado.