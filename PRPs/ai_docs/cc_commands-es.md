# Comandos slash

> Controla el comportamiento de Claude durante una sesión interactiva con comandos slash.

## Comandos slash integrados

| Comando                   | Propósito                                                                        |
| :------------------------ | :----------------------------------------------------------------------------- |
| `/add-dir`                | Agregar directorios de trabajo adicionales                                             |
| `/bug`                    | Reportar bugs (envía conversación a Anthropic)                                  |
| `/clear`                  | Limpiar historial de conversación                                                     |
| `/compact [instructions]` | Compactar conversación con instrucciones de enfoque opcionales                          |
| `/config`                 | Ver/modificar configuración                                                      |
| `/cost`                   | Mostrar estadísticas de uso de tokens                                                    |
| `/doctor`                 | Verifica la salud de tu instalación Claude Code                             |
| `/help`                   | Obtener ayuda de uso                                                                 |
| `/init`                   | Inicializar proyecto con guía CLAUDE.md                                        |
| `/login`                  | Cambiar cuentas Anthropic                                                      |
| `/logout`                 | Cerrar sesión de tu cuenta Anthropic                                           |
| `/mcp`                    | Gestionar conexiones de servidor MCP y autenticación OAuth                         |
| `/memory`                 | Editar archivos de memoria CLAUDE.md                                                    |
| `/model`                  | Seleccionar o cambiar el modelo de IA                                                  |
| `/permissions`            | Ver o actualizar [permisos](/en/docs/claude-code/iam#configuring-permissions) |
| `/pr_comments`            | Ver comentarios de pull request                                                     |
| `/review`                 | Solicitar revisión de código                                                            |
| `/status`                 | Ver estados de cuenta y sistema                                               |
| `/terminal-setup`         | Instalar enlace de teclas Shift+Enter para nuevas líneas (solo iTerm2 y VSCode)          |
| `/vim`                    | Entrar modo vim para alternar entre modos insertar y comando                        |

## Comandos slash personalizados

Los comandos slash personalizados te permiten definir prompts de uso frecuente como archivos Markdown que Claude Code puede ejecutar. Los comandos se organizan por alcance (específicos del proyecto o personales) y soportan namespacing a través de estructuras de directorios.

### Sintaxis

```
/<prefix>:<command-name> [arguments]
```

#### Parámetros

| Parámetro        | Descripción                                                         |
| :--------------- | :------------------------------------------------------------------ |
| `<prefix>`       | Alcance del comando (`project` para específico del proyecto, `user` para personal) |
| `<command-name>` | Nombre derivado del nombre del archivo Markdown (sin extensión `.md`)   |
| `[arguments]`    | Argumentos opcionales pasados al comando                            |

### Tipos de comandos

#### Comandos de proyecto

Comandos almacenados en tu repositorio y compartidos con tu equipo.

**Ubicación**: `.claude/commands/`\
**Prefijo**: `/project:`

En el siguiente ejemplo, creamos el comando `/project:optimize`:

```bash
# Crear un comando de proyecto
mkdir -p .claude/commands
echo "Analyze this code for performance issues and suggest optimizations:" > .claude/commands/optimize.md
```

#### Comandos personales

Comandos disponibles en todos tus proyectos.

**Ubicación**: `~/.claude/commands/`\
**Prefijo**: `/user:`

En el siguiente ejemplo, creamos el comando `/user:security-review`:

```bash
# Crear un comando personal
mkdir -p ~/.claude/commands
echo "Review this code for security vulnerabilities:" > ~/.claude/commands/security-review.md
```

### Características

#### Namespacing

Organiza comandos en subdirectorios para crear comandos con namespace.

**Estructura**: `<prefix>:<namespace>:<command>`

Por ejemplo, un archivo en `.claude/commands/frontend/component.md` crea el comando `/project:frontend:component`

#### Argumentos

Pasa valores dinámicos a comandos usando el placeholder `$ARGUMENTS`.

Por ejemplo:

```bash
# Definición del comando
echo 'Fix issue #$ARGUMENTS following our coding standards' > .claude/commands/fix-issue.md

# Uso
> /project:fix-issue 123
```

#### Ejecución de comandos bash

Ejecuta comandos bash antes de que se ejecute el comando slash usando el prefijo `!`. La salida se incluye en el contexto del comando.

Por ejemplo:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit.
```

#### Referencias de archivos

Incluye contenidos de archivos en comandos usando el prefijo `@` para [referenciar archivos](/en/docs/claude-code/common-workflows#reference-files-and-directories).

Por ejemplo:

```markdown
# Referenciar un archivo específico

Review the implementation in @src/utils/helpers.js

# Referenciar múltiples archivos

Compare @src/old-version.js with @src/new-version.js
```

#### Modo pensamiento

Los comandos slash pueden activar pensamiento extendido incluyendo [palabras clave de pensamiento extendido](/en/docs/claude-code/common-workflows#use-extended-thinking).

### Formato de archivo

Los archivos de comando soportan:

- **Formato Markdown** (extensión `.md`)
- **YAML frontmatter** para metadatos:
  - `allowed-tools`: Lista de herramientas que el comando puede usar
  - `description`: Descripción breve del comando
- **Contenido dinámico** con comandos bash (`!`) y referencias de archivos (`@`)
- **Instrucciones de prompt** como contenido principal

## Comandos slash MCP

Los servidores MCP pueden exponer prompts como comandos slash que se vuelven disponibles en Claude Code. Estos comandos se descubren dinámicamente desde servidores MCP conectados.

### Formato de comando

Los comandos MCP siguen el patrón:

```
/mcp__<server-name>__<prompt-name> [arguments]
```

### Características

#### Descubrimiento dinámico

Los comandos MCP están automáticamente disponibles cuando:

- Un servidor MCP está conectado y activo
- El servidor expone prompts a través del protocolo MCP
- Los prompts se recuperan exitosamente durante la conexión

#### Argumentos

Los prompts MCP pueden aceptar argumentos definidos por el servidor:

```
# Sin argumentos
> /mcp__github__list_prs

# Con argumentos
> /mcp__github__pr_review 456
> /mcp__jira__create_issue "Bug title" high
```

#### Convenciones de nomenclatura

- Los nombres de servidor y prompt se normalizan
- Espacios y caracteres especiales se vuelven guiones bajos
- Los nombres se ponen en minúsculas para consistencia

### Gestionando conexiones MCP

Usa el comando `/mcp` para:

- Ver todos los servidores MCP configurados
- Verificar estado de conexión
- Autenticar con servidores habilitados OAuth
- Limpiar tokens de autenticación
- Ver herramientas y prompts disponibles de cada servidor

## Ver también

- [Modo interactivo](/en/docs/claude-code/interactive-mode) - Atajos, modos de entrada, y características interactivas
- [Referencia CLI](/en/docs/claude-code/cli-reference) - Banderas y opciones de línea de comandos
- [Configuraciones](/en/docs/claude-code/settings) - Opciones de configuración
- [Gestión de memoria](/en/docs/claude-code/memory) - Gestión de memoria de Claude entre sesiones