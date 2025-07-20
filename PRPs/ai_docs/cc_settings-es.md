# Configuraciones de Claude Code

> Configura Claude Code con configuraciones globales y a nivel de proyecto, y variables de entorno.

Claude Code ofrece una variedad de configuraciones para configurar su comportamiento según tus necesidades. Puedes configurar Claude Code ejecutando el comando `/config` cuando uses el REPL interactivo.

## Archivos de configuración

El archivo `settings.json` es nuestro mecanismo oficial para configurar Claude Code a través de configuraciones jerárquicas:

- **Configuraciones de usuario** se definen en `~/.claude/settings.json` y se aplican a todos los proyectos.
- **Configuraciones de proyecto** se guardan en tu directorio de proyecto:
  - `.claude/settings.json` para configuraciones que se versionan en control de código y se comparten con tu equipo
  - `.claude/settings.local.json` para configuraciones que no se versionan, útiles para preferencias personales y experimentación. Claude Code configurará git para ignorar `.claude/settings.local.json` cuando se cree.
- Para despliegues empresariales de Claude Code, también soportamos **configuraciones de política administrada empresarial**. Estas tienen precedencia sobre configuraciones de usuario y proyecto. Los administradores del sistema pueden desplegar políticas en `/Library/Application Support/ClaudeCode/managed-settings.json` en macOS y `/etc/claude-code/managed-settings.json` en Linux y Windows vía WSL.

```JSON Example settings.json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl:*)"
    ]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  }
}
```

### Configuraciones disponibles

`settings.json` soporta varias opciones:

| Clave                 | Descripción                                                                                                                                                                                                    | Ejemplo                         |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `apiKeyHelper`        | Script personalizado, que se ejecutará en `/bin/sh`, para generar un valor de autenticación. Este valor generalmente se enviará como headers `X-Api-Key`, `Authorization: Bearer`, y `Proxy-Authorization: Bearer` para solicitudes del modelo | `/bin/generate_temp_api_key.sh` |
| `cleanupPeriodDays`   | Cuánto tiempo retener localmente las transcripciones de chat (predeterminado: 30 días)                                                                                                                        | `20`                            |
| `env`                 | Variables de entorno que se aplicarán a cada sesión                                                                                                                                                            | `{"FOO": "bar"}`                |
| `includeCoAuthoredBy` | Si incluir la línea `co-authored-by Claude` en commits git y pull requests (predeterminado: `true`)                                                                                                           | `false`                         |
| `permissions`         | Ver tabla a continuación para estructura de permisos.                                                                                                                                                         |                                 |

### Configuraciones de permisos

| Claves                         | Descripción                                                                                                                                        | Ejemplo                          |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------- |
| `allow`                        | Array de [reglas de permisos](/en/docs/claude-code/iam#configuring-permissions) para permitir uso de herramientas                               | `[ "Bash(git diff:*)" ]`         |
| `deny`                         | Array de [reglas de permisos](/en/docs/claude-code/iam#configuring-permissions) para denegar uso de herramientas                               | `[ "WebFetch", "Bash(curl:*)" ]` |
| `additionalDirectories`        | [Directorios de trabajo](iam#working-directories) adicionales a los que Claude tiene acceso                                                      | `[ "../docs/" ]`                 |
| `defaultMode`                  | [Modo de permisos](iam#permission-modes) predeterminado al abrir Claude Code                                                                     | `"allowEdits"`                   |
| `disableBypassPermissionsMode` | Establecer en `"disable"` para prevenir que se active el modo `bypassPermissions`. Ver [configuraciones de política administrada](iam#enterprise-managed-policy-settings) | `"disable"`                      |

### Precedencia de configuraciones

Las configuraciones se aplican en orden de precedencia:

1. Políticas empresariales (ver [documentación IAM](/en/docs/claude-code/iam#enterprise-managed-policy-settings))
2. Argumentos de línea de comandos
3. Configuraciones locales de proyecto
4. Configuraciones compartidas de proyecto
5. Configuraciones de usuario

## Variables de entorno

Claude Code soporta las siguientes variables de entorno para controlar su comportamiento:

<Note>
  Todas las variables de entorno también pueden configurarse en [`settings.json`](#configuraciones-disponibles). Esto es útil como una forma de establecer automáticamente variables de entorno para cada sesión, o para desplegar un conjunto de variables de entorno para todo tu equipo u organización.
</Note>

| Variable                                   | Propósito                                                                                                                                         |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ANTHROPIC_API_KEY`                        | Clave API enviada como header `X-Api-Key`, típicamente para el SDK de Claude (para uso interactivo, ejecuta `/login`)                           |
| `ANTHROPIC_AUTH_TOKEN`                     | Valor personalizado para los headers `Authorization` y `Proxy-Authorization` (el valor que establezcas aquí será prefijado con `Bearer `)        |
| `ANTHROPIC_CUSTOM_HEADERS`                 | Headers personalizados que quieres añadir a la solicitud (en formato `Name: Value`)                                                             |
| `ANTHROPIC_MODEL`                          | Nombre del modelo personalizado a usar (ver [Configuración de Modelo](/en/docs/claude-code/bedrock-vertex-proxies#model-configuration))         |
| `ANTHROPIC_SMALL_FAST_MODEL`               | Nombre del [modelo clase Haiku para tareas en segundo plano](/en/docs/claude-code/costs)                                                        |
| `BASH_DEFAULT_TIMEOUT_MS`                  | Timeout predeterminado para comandos bash de larga duración                                                                                      |
| `BASH_MAX_TIMEOUT_MS`                      | Timeout máximo que el modelo puede establecer para comandos bash de larga duración                                                               |
| `BASH_MAX_OUTPUT_LENGTH`                   | Número máximo de caracteres en salidas bash antes de ser truncadas en el medio                                                                   |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | Regresar al directorio de trabajo original después de cada comando Bash                                                                          |
| `CLAUDE_CODE_API_KEY_HELPER_TTL_MS`        | Intervalo en milisegundos en el que las credenciales deben refrescarse (cuando se usa `apiKeyHelper`)                                           |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS`            | Establecer el número máximo de tokens de salida para la mayoría de solicitudes                                                                   |
| `CLAUDE_CODE_USE_BEDROCK`                  | Usar Bedrock (ver [Bedrock & Vertex](/en/docs/claude-code/bedrock-vertex-proxies))                                                               |
| `CLAUDE_CODE_USE_VERTEX`                   | Usar Vertex (ver [Bedrock & Vertex](/en/docs/claude-code/bedrock-vertex-proxies))                                                                |
| `CLAUDE_CODE_SKIP_BEDROCK_AUTH`            | Omitir autenticación AWS para Bedrock (ej. cuando se usa un gateway LLM)                                                                         |
| `CLAUDE_CODE_SKIP_VERTEX_AUTH`             | Omitir autenticación Google para Vertex (ej. cuando se usa un gateway LLM)                                                                       |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Equivalente a establecer `DISABLE_AUTOUPDATER`, `DISABLE_BUG_COMMAND`, `DISABLE_ERROR_REPORTING`, y `DISABLE_TELEMETRY`                         |
| `DISABLE_AUTOUPDATER`                      | Establecer en `1` para deshabilitar el actualizador automático                                                                                   |
| `DISABLE_BUG_COMMAND`                      | Establecer en `1` para deshabilitar el comando `/bug`                                                                                            |
| `DISABLE_COST_WARNINGS`                    | Establecer en `1` para deshabilitar mensajes de advertencia de costo                                                                             |
| `DISABLE_ERROR_REPORTING`                  | Establecer en `1` para optar por no participar en reportes de error de Sentry                                                                    |
| `DISABLE_NON_ESSENTIAL_MODEL_CALLS`        | Establecer en `1` para deshabilitar llamadas de modelo para rutas no críticas como texto de sabor                                               |
| `DISABLE_TELEMETRY`                        | Establecer en `1` para optar por no participar en telemetría de Statsig (nota que los eventos de Statsig no incluyen datos de usuario como código, rutas de archivos, o comandos bash) |
| `HTTP_PROXY`                               | Especificar servidor proxy HTTP para conexiones de red                                                                                           |
| `HTTPS_PROXY`                              | Especificar servidor proxy HTTPS para conexiones de red                                                                                          |
| `MAX_THINKING_TOKENS`                      | Forzar un presupuesto de pensamiento para el modelo                                                                                              |
| `MCP_TIMEOUT`                              | Timeout en milisegundos para inicio de servidor MCP                                                                                              |
| `MCP_TOOL_TIMEOUT`                         | Timeout en milisegundos para ejecución de herramientas MCP                                                                                       |
| `MAX_MCP_OUTPUT_TOKENS`                    | Número máximo de tokens permitidos en respuestas de herramientas MCP (predeterminado: 25000)                                                    |

## Opciones de configuración

Estamos en el proceso de migrar la configuración global a `settings.json`.

`claude config` será deprecado en lugar de [settings.json](#archivos-de-configuración)

Para gestionar tus configuraciones, usa los siguientes comandos:

- Listar configuraciones: `claude config list`
- Ver una configuración: `claude config get <key>`
- Cambiar una configuración: `claude config set <key> <value>`
- Añadir a una configuración (para listas): `claude config add <key> <value>`
- Eliminar de una configuración (para listas): `claude config remove <key> <value>`

Por defecto `config` cambia tu configuración de proyecto. Para gestionar tu configuración global, usa la flag `--global` (o `-g`).

### Configuración global

Para establecer una configuración global, usa `claude config set -g <key> <value>`:

| Clave                   | Descripción                                                      | Ejemplo                                                                    |
| :---------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------- |
| `autoUpdates`           | Si habilitar actualizaciones automáticas (predeterminado: `true`) | `false`                                                                    |
| `preferredNotifChannel` | Dónde quieres recibir notificaciones (predeterminado: `iterm2`)  | `iterm2`, `iterm2_with_bell`, `terminal_bell`, o `notifications_disabled` |
| `theme`                 | Tema de color                                                    | `dark`, `light`, `light-daltonized`, o `dark-daltonized`                  |
| `verbose`               | Si mostrar salidas completas de bash y comandos (predeterminado: `false`) | `true`                                                                     |

## Herramientas disponibles para Claude

Claude Code tiene acceso a un conjunto de herramientas poderosas que le ayudan a entender y modificar tu base de código:

| Herramienta      | Descripción                                          | Permiso Requerido |
| :--------------- | :--------------------------------------------------- | :------------------ |
| **Agent**        | Ejecuta un sub-agente para manejar tareas complejas de múltiples pasos | No                  |
| **Bash**         | Ejecuta comandos de shell en tu entorno              | Sí                 |
| **Edit**         | Hace ediciones dirigidas a archivos específicos     | Sí                 |
| **Glob**         | Encuentra archivos basados en coincidencia de patrones | No                  |
| **Grep**         | Busca patrones en contenidos de archivos            | No                  |
| **LS**           | Lista archivos y directorios                        | No                  |
| **MultiEdit**    | Realiza múltiples ediciones en un solo archivo atomicamente | Sí                 |
| **NotebookEdit** | Modifica celdas de notebooks Jupyter                | Sí                 |
| **NotebookRead** | Lee y muestra contenidos de notebooks Jupyter       | No                  |
| **Read**         | Lee los contenidos de archivos                      | No                  |
| **TodoRead**     | Lee la lista de tareas de la sesión actual          | No                  |
| **TodoWrite**    | Crea y gestiona listas de tareas estructuradas      | No                  |
| **WebFetch**     | Obtiene contenido de una URL especificada           | Sí                 |
| **WebSearch**    | Realiza búsquedas web con filtrado de dominio       | Sí                 |
| **Write**        | Crea o sobrescribe archivos                          | Sí                 |

Las reglas de permisos pueden configurarse usando `/allowed-tools` o en [configuraciones de permisos](/en/docs/claude-code/settings#configuraciones-disponibles).

### Extendiendo herramientas con hooks

Puedes ejecutar comandos personalizados antes o después de que cualquier herramienta se ejecute usando [hooks de Claude Code](/en/docs/claude-code/hooks).

Por ejemplo, podrías ejecutar automáticamente un formateador de Python después de que Claude modifique archivos Python, o prevenir modificaciones a archivos de configuración de producción bloqueando operaciones Write a ciertas rutas.

## Ver también

- [Identity and Access Management](/en/docs/claude-code/iam#configuring-permissions) - Aprende sobre el sistema de permisos de Claude Code
- [IAM y control de acceso](/en/docs/claude-code/iam#enterprise-managed-policy-settings) - Gestión de políticas empresariales
- [Resolución de Problemas](/en/docs/claude-code/troubleshooting#auto-updater-issues) - Soluciones para problemas comunes de configuración