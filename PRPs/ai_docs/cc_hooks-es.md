# Hooks

> Personaliza y extiende el comportamiento de Claude Code registrando comandos de shell

# Introducción

Los hooks de Claude Code son comandos de shell definidos por el usuario que se ejecutan en varios puntos del ciclo de vida de Claude Code. Los hooks proporcionan control determinístico sobre el comportamiento de Claude Code, asegurando que ciertas acciones siempre sucedan en lugar de confiar en que el LLM elija ejecutarlas.

Casos de uso de ejemplo incluyen:

- **Notificaciones**: Personaliza cómo recibes notificaciones cuando Claude Code está esperando tu entrada o permiso para ejecutar algo.
- **Formateo automático**: Ejecuta `prettier` en archivos .ts, `gofmt` en archivos .go, etc. después de cada edición de archivo.
- **Registro**: Rastrea y cuenta todos los comandos ejecutados para cumplimiento o depuración.
- **Retroalimentación**: Proporciona retroalimentación automatizada cuando Claude Code produce código que no sigue las convenciones de tu base de código.
- **Permisos personalizados**: Bloquea modificaciones a archivos de producción o directorios sensibles.

Al codificar estas reglas como hooks en lugar de instrucciones de prompting, conviertes sugerencias en código a nivel de aplicación que se ejecuta cada vez que se espera que se ejecute.

<Warning>
  Los hooks ejecutan comandos de shell con todos tus permisos de usuario sin confirmación. Eres responsable de asegurar que tus hooks sean seguros y seguros. Anthropic no es responsable por ninguna pérdida de datos o daño al sistema resultante del uso de hooks. Revisa las [Consideraciones de Seguridad](#security-considerations).
</Warning>

## Inicio Rápido

En este inicio rápido, añadirás un hook que registra los comandos de shell que ejecuta Claude Code.

Prerrequisito del Inicio Rápido: Instala `jq` para procesamiento JSON en la línea de comandos.

### Paso 1: Abrir configuración de hooks

Ejecuta el [comando slash](/en/docs/claude-code/slash-commands) `/hooks` y selecciona el evento de hook `PreToolUse`.

Los hooks `PreToolUse` se ejecutan antes de las llamadas de herramientas y pueden bloquearlas mientras proporcionan retroalimentación a Claude sobre qué hacer diferente.

### Paso 2: Añadir un matcher

Selecciona `+ Add new matcher…` para ejecutar tu hook solo en llamadas de herramientas Bash.

Escribe `Bash` para el matcher.

### Paso 3: Añadir el hook

Selecciona `+ Add new hook…` e ingresa este comando:

```bash
jq -r '"\(.tool_input.command) - \(.tool_input.description // "No description")"' >> ~/.claude/bash-command-log.txt
```

### Paso 4: Guardar tu configuración

Para la ubicación de almacenamiento, selecciona `User settings` ya que estás registrando en tu directorio home. Este hook se aplicará entonces a todos los proyectos, no solo a tu proyecto actual.

Luego presiona Esc hasta que regreses al REPL. ¡Tu hook ahora está registrado!

### Paso 5: Verificar tu hook

Ejecuta `/hooks` nuevamente o verifica `~/.claude/settings.json` para ver tu configuración:

```json
"hooks": {
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "jq -r '\"\\(.tool_input.command) - \\(.tool_input.description // \"No description\")\"' >> ~/.claude/bash-command-log.txt"
        }
      ]
    }
  ]
}
```

## Configuración

Los hooks de Claude Code se configuran en tus [archivos de configuración](/en/docs/claude-code/settings):

- `~/.claude/settings.json` - Configuración de usuario
- `.claude/settings.json` - Configuración de proyecto
- `.claude/settings.local.json` - Configuración local de proyecto (no versionada)
- Configuración de política empresarial administrada

### Estructura

Los hooks se organizan por matchers, donde cada matcher puede tener múltiples hooks:

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here"
          }
        ]
      }
    ]
  }
}
```

- **matcher**: Patrón para coincidir con nombres de herramientas (solo aplicable para `PreToolUse` y `PostToolUse`)
  - Strings simples coinciden exactamente: `Write` coincide solo con la herramienta Write
  - Soporta regex: `Edit|Write` o `Notebook.*`
  - Si se omite o es string vacío, los hooks se ejecutan para todos los eventos coincidentes
- **hooks**: Array de comandos a ejecutar cuando el patrón coincide
  - `type`: Actualmente solo se soporta `"command"`
  - `command`: El comando bash a ejecutar
  - `timeout`: (Opcional) Cuánto tiempo debe ejecutarse un comando, en segundos, antes de cancelar todos los hooks en progreso.

## Eventos de Hook

### PreToolUse

Se ejecuta después de que Claude crea parámetros de herramienta y antes de procesar la llamada de herramienta.

**Matchers comunes:**

- `Task` - Tareas de agente
- `Bash` - Comandos de shell
- `Glob` - Coincidencia de patrones de archivo
- `Grep` - Búsqueda de contenido
- `Read` - Lectura de archivos
- `Edit`, `MultiEdit` - Edición de archivos
- `Write` - Escritura de archivos
- `WebFetch`, `WebSearch` - Operaciones web

### PostToolUse

Se ejecuta inmediatamente después de que una herramienta se completa exitosamente.

Reconoce los mismos valores de matcher que PreToolUse.

### Notification

Se ejecuta cuando Claude Code envía notificaciones.

### Stop

Se ejecuta cuando el agente principal de Claude Code ha terminado de responder.

### SubagentStop

Se ejecuta cuando un subagente de Claude Code (llamada de herramienta Task) ha terminado de responder.

## Entrada de Hook

Los hooks reciben datos JSON vía stdin que contienen información de sesión y datos específicos del evento:

```typescript
{
  // Campos comunes
  session_id: string
  transcript_path: string  // Ruta al JSON de conversación

  // Campos específicos del evento
  ...
}
```

### Entrada PreToolUse

El esquema exacto para `tool_input` depende de la herramienta.

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  }
}
```

### Entrada PostToolUse

El esquema exacto para `tool_input` y `tool_response` depende de la herramienta.

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_response": {
    "filePath": "/path/to/file.txt",
    "success": true
  }
}
```

### Entrada Notification

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "message": "Task completed successfully",
  "title": "Claude Code"
}
```

### Entrada Stop y SubagentStop

`stop_hook_active` es true cuando Claude Code ya está continuando como resultado de un hook de stop. Verifica este valor o procesa la transcripción para prevenir que Claude Code se ejecute indefinidamente.

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl",
  "stop_hook_active": true
}
```

## Salida de Hook

Hay dos formas para que los hooks devuelvan salida de vuelta a Claude Code. La salida comunica si bloquear y cualquier retroalimentación que deba mostrarse a Claude y al usuario.

### Simple: Código de Salida

Los hooks comunican estado a través de códigos de salida, stdout y stderr:

- **Código de salida 0**: Éxito. `stdout` se muestra al usuario en modo transcripción (CTRL-R).
- **Código de salida 2**: Error de bloqueo. `stderr` se retroalimenta a Claude para procesar automáticamente. Ver comportamiento por evento de hook a continuación.
- **Otros códigos de salida**: Error no bloqueante. `stderr` se muestra al usuario y la ejecución continúa.

<Warning>
  Recordatorio: Claude Code no ve stdout si el código de salida es 0.
</Warning>

#### Comportamiento del Código de Salida 2

| Evento de Hook | Comportamiento                                  |
| -------------- | ----------------------------------------------- |
| `PreToolUse`   | Bloquea la llamada de herramienta, muestra error a Claude |
| `PostToolUse`  | Muestra error a Claude (la herramienta ya se ejecutó) |
| `Notification` | N/A, muestra stderr solo al usuario            |
| `Stop`         | Bloquea el paro, muestra error a Claude        |
| `SubagentStop` | Bloquea el paro, muestra error al subagente de Claude |

### Avanzado: Salida JSON

Los hooks pueden devolver JSON estructurado en `stdout` para control más sofisticado:

#### Campos JSON Comunes

Todos los tipos de hook pueden incluir estos campos opcionales:

```json
{
  "continue": true, // Si Claude debe continuar después de la ejecución del hook (predeterminado: true)
  "stopReason": "string" // Mensaje mostrado cuando continue es false
  "suppressOutput": true, // Ocultar stdout del modo transcripción (predeterminado: false)
}
```

Si `continue` es false, Claude deja de procesar después de que se ejecuten los hooks.

- Para `PreToolUse`, esto es diferente de `"decision": "block"`, que solo bloquea una llamada de herramienta específica y proporciona retroalimentación automática a Claude.
- Para `PostToolUse`, esto es diferente de `"decision": "block"`, que proporciona retroalimentación automatizada a Claude.
- Para `Stop` y `SubagentStop`, esto tiene precedencia sobre cualquier salida `"decision": "block"`.
- En todos los casos, `"continue" = false` tiene precedencia sobre cualquier salida `"decision": "block"`.

`stopReason` acompaña a `continue` con una razón mostrada al usuario, no mostrada a Claude.

#### Control de Decisión `PreToolUse`

Los hooks `PreToolUse` pueden controlar si una llamada de herramienta procede.

- "approve" evita el sistema de permisos. `reason` se muestra al usuario pero no a Claude.
- "block" previene que la llamada de herramienta se ejecute. `reason` se muestra a Claude.
- `undefined` lleva al flujo de permisos existente. `reason` se ignora.

```json
{
  "decision": "approve" | "block" | undefined,
  "reason": "Explicación para la decisión"
}
```

#### Control de Decisión `PostToolUse`

Los hooks `PostToolUse` pueden controlar si una llamada de herramienta procede.

- "block" solicita automáticamente a Claude con `reason`.
- `undefined` no hace nada. `reason` se ignora.

```json
{
  "decision": "block" | undefined,
  "reason": "Explicación para la decisión"
}
```

#### Control de Decisión `Stop`/`SubagentStop`

Los hooks `Stop` y `SubagentStop` pueden controlar si Claude debe continuar.

- "block" previene que Claude se detenga. Debes poblar `reason` para que Claude sepa cómo proceder.
- `undefined` permite que Claude se detenga. `reason` se ignora.

```json
{
  "decision": "block" | undefined,
  "reason": "Debe proporcionarse cuando Claude está bloqueado de detenerse"
}
```

#### Ejemplo de Salida JSON: Edición de Comando Bash

```python
#!/usr/bin/env python3
import json
import re
import sys

# Define reglas de validación como una lista de tuplas (patrón regex, mensaje)
VALIDATION_RULES = [
    (
        r"\bgrep\b(?!.*\|)",
        "Use 'rg' (ripgrep) instead of 'grep' for better performance and features",
    ),
    (
        r"\bfind\s+\S+\s+-name\b",
        "Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance",
    ),
]


def validate_command(command: str) -> list[str]:
    issues = []
    for pattern, message in VALIDATION_RULES:
        if re.search(pattern, command):
            issues.append(message)
    return issues


try:
    input_data = json.load(sys.stdin)
except json.JSONDecodeError as e:
    print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
    sys.exit(1)

tool_name = input_data.get("tool_name", "")
tool_input = input_data.get("tool_input", {})
command = tool_input.get("command", "")

if tool_name != "Bash" or not command:
    sys.exit(1)

# Validar el comando
issues = validate_command(command)

if issues:
    for message in issues:
        print(f"• {message}", file=sys.stderr)
    # Código de salida 2 bloquea la llamada de herramienta y muestra stderr a Claude
    sys.exit(2)
```

## Trabajando con Herramientas MCP

Los hooks de Claude Code funcionan sin problemas con [herramientas Model Context Protocol (MCP)](/en/docs/claude-code/mcp). Cuando los servidores MCP proporcionan herramientas, aparecen con un patrón de nomenclatura especial que puedes coincidir en tus hooks.

### Nomenclatura de Herramientas MCP

Las herramientas MCP siguen el patrón `mcp__<server>__<tool>`, por ejemplo:

- `mcp__memory__create_entities` - Herramienta de crear entidades del servidor Memory
- `mcp__filesystem__read_file` - Herramienta de leer archivo del servidor Filesystem
- `mcp__github__search_repositories` - Herramienta de búsqueda del servidor GitHub

### Configurando Hooks para Herramientas MCP

Puedes dirigirte a herramientas MCP específicas o servidores MCP completos:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__memory__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Memory operation initiated' >> ~/mcp-operations.log"
          }
        ]
      },
      {
        "matcher": "mcp__.*__write.*",
        "hooks": [
          {
            "type": "command",
            "command": "/home/user/scripts/validate-mcp-write.py"
          }
        ]
      }
    ]
  }
}
```

## Ejemplos

### Formateo de Código

Formatear automáticamente código después de modificaciones de archivo:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "/home/user/scripts/format-code.sh"
          }
        ]
      }
    ]
  }
}
```

### Notification

Personalizar la notificación que se envía cuando Claude Code solicita permiso o cuando la entrada del prompt se ha vuelto inactiva.

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/my_custom_notifier.py"
          }
        ]
      }
    ]
  }
}
```

## Consideraciones de Seguridad

### Descargo de Responsabilidad

**USA BAJO TU PROPIO RIESGO**: Los hooks de Claude Code ejecutan comandos de shell arbitrarios en tu sistema automáticamente. Al usar hooks, reconoces que:

- Eres únicamente responsable de los comandos que configures
- Los hooks pueden modificar, eliminar o acceder a cualquier archivo al que tu cuenta de usuario pueda acceder
- Los hooks maliciosos o mal escritos pueden causar pérdida de datos o daño al sistema
- Anthropic no proporciona garantía y no asume responsabilidad por ningún daño resultante del uso de hooks
- Deberías probar exhaustivamente los hooks en un entorno seguro antes del uso en producción

Siempre revisa y entiende cualquier comando de hook antes de añadirlos a tu configuración.

### Mejores Prácticas de Seguridad

Aquí tienes algunas prácticas clave para escribir hooks más seguros:

1. **Valida y sanitiza entradas** - Nunca confíes ciegamente en los datos de entrada
2. **Siempre cita variables de shell** - Usa `"$VAR"` no `$VAR`
3. **Bloquea traversal de rutas** - Verifica `..` en rutas de archivo
4. **Usa rutas absolutas** - Especifica rutas completas para scripts
5. **Omite archivos sensibles** - Evita `.env`, `.git/`, claves, etc.

### Seguridad de Configuración

Las ediciones directas a hooks en archivos de configuración no surten efecto inmediatamente. Claude Code:

1. Captura una instantánea de hooks al inicio
2. Usa esta instantánea durante toda la sesión
3. Advierte si los hooks se modifican externamente
4. Requiere revisión en el menú `/hooks` para que los cambios se apliquen

Esto previene que modificaciones maliciosas de hooks afecten tu sesión actual.

## Detalles de Ejecución de Hook

- **Timeout**: Límite de ejecución de 60 segundos por defecto, configurable por comando.
  - Si cualquier comando individual agota el tiempo, todos los hooks en progreso se cancelan.
- **Paralelización**: Todos los hooks coincidentes se ejecutan en paralelo
- **Entorno**: Se ejecuta en el directorio actual con el entorno de Claude Code
- **Entrada**: JSON vía stdin
- **Salida**:
  - PreToolUse/PostToolUse/Stop: Progreso mostrado en transcripción (Ctrl-R)
  - Notification: Registrado solo en debug (`--debug`)

## Depuración

Para solucionar problemas con hooks:

1. Verifica si el menú `/hooks` muestra tu configuración
2. Verifica que tus [archivos de configuración](/en/docs/claude-code/settings) sean JSON válido
3. Prueba comandos manualmente
4. Verifica códigos de salida
5. Revisa expectativas de formato de stdout y stderr
6. Asegura escape adecuado de comillas
7. Usa `claude --debug` para depurar tus hooks. La salida de un hook exitoso aparece como se muestra a continuación.

```
[DEBUG] Executing hooks for PostToolUse:Write
[DEBUG] Getting matching hook commands for PostToolUse with query: Write
[DEBUG] Found 1 hook matchers in settings
[DEBUG] Matched 1 hooks for query "Write"
[DEBUG] Found 1 hook commands to execute
[DEBUG] Executing hook command: <Your command> with timeout 60000ms
[DEBUG] Hook command completed with status 0: <Your stdout>
```

Los mensajes de progreso aparecen en modo transcripción (Ctrl-R) mostrando:

- Qué hook se está ejecutando
- Comando siendo ejecutado
- Estado de éxito/fallo
- Mensajes de salida o error