# Agregar Claude Code a tu IDE

> Aprende cómo agregar Claude Code a tu IDE favorito

Claude Code se integra perfectamente con Entornos de Desarrollo Integrado (IDEs) 
populares para mejorar tu flujo de trabajo de codificación. Esta integración te 
permite aprovechar las capacidades de Claude directamente dentro de tu entorno 
de desarrollo preferido.

## IDEs Soportados

Claude Code actualmente soporta dos familias principales de IDEs:

- **Visual Studio Code** (incluyendo forks populares como Cursor y Windsurf)
- **JetBrains IDEs** (incluyendo PyCharm, WebStorm, IntelliJ, y GoLand)

## Características

- **Lanzamiento rápido**: Usa `Cmd+Esc` (Mac) o `Ctrl+Esc` (Windows/Linux) para abrir
  Claude Code directamente desde tu editor, o haz clic en el botón Claude Code en la
  interfaz
- **Visualización de diferencias**: Los cambios de código se pueden mostrar directamente en el visor 
  de diferencias del IDE en lugar de la terminal. Puedes configurar esto en `/config`
- **Contexto de selección**: La selección/pestaña actual en el IDE se comparte automáticamente
  con Claude Code
- **Atajos de referencia de archivos**: Usa `Cmd+Option+K` (Mac) o `Alt+Ctrl+K`
  (Linux/Windows) para insertar referencias de archivos (ej., @File#L1-99)
- **Compartir diagnósticos**: Errores de diagnóstico (lint, sintaxis, etc.) del IDE
  se comparten automáticamente con Claude mientras trabajas

## Instalación

### VS Code

1. Abrir VSCode
2. Abrir la terminal integrada
3. Ejecutar `claude` - la extensión se auto-instalará

En adelante también puedes usar el comando `/ide` en cualquier terminal externa para
conectar al IDE.

<Note>
  Estas instrucciones de instalación también aplican para forks de VS Code como Cursor y
  Windsurf.
</Note>

### JetBrains IDEs

Instala el
[plugin Claude Code](https://docs.anthropic.com/s/claude-code-jetbrains) desde
el marketplace y reinicia tu IDE.

<Note>
  El plugin también puede auto-instalarse cuando ejecutes `claude` en la terminal
  integrada. El IDE debe reiniciarse completamente para que tome efecto.
</Note>

<Warning>
  **Limitaciones de Desarrollo Remoto**: Cuando uses JetBrains Remote Development,
  debes instalar el plugin en el host remoto vía `Settings > Plugin (Host)`.
</Warning>

## Configuración

Ambas integraciones funcionan con el sistema de configuración de Claude Code. Para habilitar
características específicas del IDE:

1. Conecta Claude Code a tu IDE ejecutando `claude` en la terminal integrada
2. Ejecuta el comando `/config`
3. Establece la herramienta de diferencias a `auto` para detección automática del IDE
4. Claude Code automáticamente usará el visor apropiado basado en tu IDE

Si estás usando una terminal externa (no la terminal integrada del IDE), aún puedes
conectar a tu IDE usando el comando `/ide` después de lanzar Claude
Code. Esto te permite beneficiarte de las características de integración IDE incluso cuando ejecutes
Claude desde una aplicación de terminal separada. Esto funciona tanto para VS Code como para
JetBrains IDEs.

<Note>
  Cuando uses una terminal externa, para asegurar que Claude tenga acceso predeterminado a los
  mismos archivos que tu IDE, inicia Claude desde el mismo directorio que la
  raíz del proyecto de tu IDE.
</Note>

## Solución de Problemas

### Extensión de VS Code no se instala

- Asegúrate de estar ejecutando Claude Code desde la terminal integrada de VS Code
- Asegúrate de que el CLI correspondiente a tu IDE esté instalado:
  - Para VS Code: el comando `code` debe estar disponible
  - Para Cursor: el comando `cursor` debe estar disponible
  - Para Windsurf: el comando `windsurf` debe estar disponible
  - Si no está instalado, usa `Cmd+Shift+P` (Mac) o `Ctrl+Shift+P` (Windows/Linux)
    y busca "Shell Command: Install 'code' command in PATH" (o el
    equivalente para tu IDE)
- Verifica que VS Code tenga permisos para instalar extensiones

### Plugin JetBrains no funciona

- Asegúrate de estar ejecutando Claude Code desde el directorio raíz del proyecto
- Verifica que el plugin JetBrains esté habilitado en la configuración del IDE
- Reinicia completamente el IDE. Puede que necesites hacer esto múltiples veces
- Para JetBrains Remote Development, asegúrate de que el plugin Claude Code esté
  instalado en el host remoto y no localmente en el cliente

Para ayuda adicional, consulta nuestra
[guía de solución de problemas](/en/docs/claude-code/troubleshooting) o contacta
soporte.

# Claude Code SDK

> Aprende sobre la integración programática de Claude Code en tus aplicaciones con el Claude Code SDK.

El Claude Code SDK permite ejecutar Claude Code como un subproceso, proporcionando una forma de construir asistentes de codificación potenciados por IA y herramientas que aprovechan las capacidades de Claude.

El SDK está disponible para uso de línea de comandos, TypeScript, y Python.

## Autenticación

El Claude Code SDK soporta múltiples métodos de autenticación:

### Clave API de Anthropic

Para usar el Claude Code SDK directamente con la API de Anthropic, recomendamos crear una clave API dedicada:

1. Crear una clave API de Anthropic en la [Consola de Anthropic](https://console.anthropic.com/)
2. Luego, establecer la variable de entorno `ANTHROPIC_API_KEY`. Recomendamos almacenar esta clave de forma segura (ej., usando un [secreto](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) de Github)

### Credenciales de API de terceros

El SDK también soporta proveedores de API de terceros:

- **Amazon Bedrock**: Establecer variable de entorno `CLAUDE_CODE_USE_BEDROCK=1` y configurar credenciales AWS
- **Google Vertex AI**: Establecer variable de entorno `CLAUDE_CODE_USE_VERTEX=1` y configurar credenciales Google Cloud

Para instrucciones detalladas de configuración para proveedores de terceros, consulta la documentación de [Amazon Bedrock](/en/docs/claude-code/amazon-bedrock) y [Google Vertex AI](/en/docs/claude-code/google-vertex-ai).

## Uso básico del SDK

El Claude Code SDK te permite usar Claude Code en modo no interactivo desde tus aplicaciones.

### Línea de comandos

Aquí tienes algunos ejemplos básicos para el SDK de línea de comandos:

```bash
# Ejecutar un prompt único y salir (modo print)
$ claude -p "Write a function to calculate Fibonacci numbers"

# Usar un pipe para proporcionar stdin
$ echo "Explain this code" | claude -p

# Salida en formato JSON con metadatos
$ claude -p "Generate a hello world function" --output-format json

# Transmitir salida JSON conforme llega
$ claude -p "Build a React component" --output-format stream-json
```

### TypeScript

El SDK de TypeScript está incluido en el paquete principal [`@anthropic-ai/claude-code`](https://www.npmjs.com/package/@anthropic-ai/claude-code) en NPM:

```ts
import { query, type SDKMessage } from "@anthropic-ai/claude-code";

const messages: SDKMessage[] = [];

for await (const message of query({
  prompt: "Write a haiku about foo.py",
  abortController: new AbortController(),
  options: {
    maxTurns: 3,
  },
})) {
  messages.push(message);
}

console.log(messages);
```

El SDK de TypeScript acepta todos los argumentos soportados por el SDK de línea de comandos, así como:

| Argumento                     | Descripción                         | Predeterminado                                                       |
| :--------------------------- | :---------------------------------- | :------------------------------------------------------------ |
| `abortController`            | Controlador de abort                    | `new AbortController()`                                       |
| `cwd`                        | Directorio de trabajo actual           | `process.cwd()`                                               |
| `executable`                 | Qué runtime de JavaScript usar     | `node` cuando se ejecuta con Node.js, `bun` cuando se ejecuta con Bun |
| `executableArgs`             | Argumentos a pasar al ejecutable | `[]`                                                          |
| `pathToClaudeCodeExecutable` | Ruta al ejecutable Claude Code  | Ejecutable que viene con `@anthropic-ai/claude-code`        |

### Python

El SDK de Python está disponible como [`claude-code-sdk`](https://github.com/anthropics/claude-code-sdk-python) en PyPI:

```bash
pip install claude-code-sdk
```

**Prerrequisitos:**

- Python 3.10+
- Node.js
- Claude Code CLI: `npm install -g @anthropic-ai/claude-code`

Uso básico:

```python
import anyio
from claude_code_sdk import query, ClaudeCodeOptions, Message

async def main():
    messages: list[Message] = []

    async for message in query(
        prompt="Write a haiku about foo.py",
        options=ClaudeCodeOptions(max_turns=3)
    ):
        messages.append(message)

    print(messages)

anyio.run(main)
```

El SDK de Python acepta todos los argumentos soportados por el SDK de línea de comandos a través de la clase `ClaudeCodeOptions`:

```python
from claude_code_sdk import query, ClaudeCodeOptions
from pathlib import Path

options = ClaudeCodeOptions(
    max_turns=3,
    system_prompt="You are a helpful assistant",
    cwd=Path("/path/to/project"),  # Puede ser string o Path
    allowed_tools=["Read", "Write", "Bash"],
    permission_mode="acceptEdits"
)

async for message in query(prompt="Hello", options=options):
    print(message)
```

## Uso avanzado

La documentación a continuación usa el SDK de línea de comandos como ejemplo, pero también puede usarse con los SDKs de TypeScript y Python.

### Conversaciones multi-turno

Para conversaciones multi-turno, puedes reanudar conversaciones o continuar desde la sesión más reciente:

```bash
# Continuar la conversación más reciente
$ claude --continue

# Continuar y proporcionar un prompt nuevo
$ claude --continue "Now refactor this for better performance"

# Reanudar una conversación específica por ID de sesión
$ claude --resume 550e8400-e29b-41d4-a716-446655440000

# Reanudar en modo print (no interactivo)
$ claude -p --resume 550e8400-e29b-41d4-a716-446655440000 "Update the tests"

# Continuar en modo print (no interactivo)
$ claude -p --continue "Add error handling"
```

### Prompts de sistema personalizados

Puedes proporcionar prompts de sistema personalizados para guiar el comportamiento de Claude:

```bash
# Sobrescribir prompt de sistema (solo funciona con --print)
$ claude -p "Build a REST API" --system-prompt "You are a senior backend engineer. Focus on security, performance, and maintainability."

# Prompt de sistema con requerimientos específicos
$ claude -p "Create a database schema" --system-prompt "You are a database architect. Use PostgreSQL best practices and include proper indexing."
```

También puedes agregar instrucciones al prompt de sistema predeterminado:

```bash
# Agregar prompt de sistema (solo funciona con --print)
$ claude -p "Build a REST API" --append-system-prompt "After writing code, be sure to code review yourself."
```

### Configuración MCP

El Model Context Protocol (MCP) te permite extender Claude Code con herramientas y recursos adicionales de servidores externos. Usando la bandera `--mcp-config`, puedes cargar servidores MCP que proporcionen capacidades especializadas como acceso a bases de datos, integraciones API, o herramientas personalizadas.

Crear un archivo de configuración JSON con tus servidores MCP:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/files"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-github-token"
      }
    }
  }
}
```

Luego úsalo con Claude Code:

```bash
# Cargar servidores MCP desde configuración
$ claude -p "List all files in the project" --mcp-config mcp-servers.json

# Importante: Las herramientas MCP deben permitirse explícitamente usando --allowedTools
# Las herramientas MCP siguen el formato: mcp__$serverName__$toolName
$ claude -p "Search for TODO comments" \
  --mcp-config mcp-servers.json \
  --allowedTools "mcp__filesystem__read_file,mcp__filesystem__list_directory"

# Usar una herramienta MCP para manejar prompts de permisos en modo no interactivo
$ claude -p "Deploy the application" \
  --mcp-config mcp-servers.json \
  --allowedTools "mcp__permissions__approve" \
  --permission-prompt-tool mcp__permissions__approve
```

<Note>
  Cuando uses herramientas MCP, debes permitirlas explícitamente usando la bandera `--allowedTools`. Los nombres de herramientas MCP siguen el patrón `mcp__<serverName>__<toolName>` donde:

- `serverName` es la clave de tu archivo de configuración MCP
- `toolName` es la herramienta específica proporcionada por ese servidor

Esta medida de seguridad asegura que las herramientas MCP solo se usen cuando están explícitamente permitidas.

Si especificas solo el nombre del servidor (ej., `mcp__<serverName>`), todas las herramientas de ese servidor estarán permitidas.

Los patrones glob (ej., `mcp__go*`) no están soportados.
</Note>

### Herramienta personalizada de prompt de permisos

Opcionalmente, usa `--permission-prompt-tool` para pasar una herramienta MCP que usaremos para verificar si el usuario otorga permisos al modelo para invocar una herramienta dada. Cuando el modelo invoca una herramienta ocurre lo siguiente:

1. Primero verificamos configuraciones de permisos: todos los [archivos settings.json](/en/docs/claude-code/settings), así como `--allowedTools` y `--disallowedTools` pasados al SDK; si uno de estos permite o niega la llamada a la herramienta, procedemos con la llamada a la herramienta
2. De lo contrario, invocamos la herramienta MCP que proporcionaste en `--permission-prompt-tool`

La herramienta MCP `--permission-prompt-tool` recibe el nombre de la herramienta y entrada, y debe devolver un payload JSON-stringificado con el resultado. El payload debe ser uno de:

```ts
// llamada a herramienta está permitida
{
  "behavior": "allow",
  "updatedInput": {...}, // entrada actualizada, o simplemente devolver la entrada original
}

// llamada a herramienta está denegada
{
  "behavior": "deny",
  "message": "..." // string legible explicando por qué se denegó el permiso
}
```

Por ejemplo, una implementación de herramienta MCP de prompt de permisos de TypeScript podría verse así:

```ts
const server = new McpServer({
  name: "Test permission prompt MCP Server",
  version: "0.0.1",
});

server.tool(
  "approval_prompt",
  'Simulate a permission check - approve if the input contains "allow", otherwise deny',
  {
    tool_name: z.string().describe("The tool requesting permission"),
    input: z.object({}).passthrough().describe("The input for the tool"),
  },
  async ({ tool_name, input }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            JSON.stringify(input).includes("allow")
              ? {
                  behavior: "allow",
                  updatedInput: input,
                }
              : {
                  behavior: "deny",
                  message: "Permission denied by test approval_prompt tool",
                },
          ),
        },
      ],
    };
  },
);
```

Para usar esta herramienta, agrega tu servidor MCP (ej. con `--mcp-config`), luego invoca el SDK así:

```sh
claude -p "..." \
  --permission-prompt-tool mcp__test-server__approval_prompt \
  --mcp-config my-config.json
```

Notas de uso:

- Usa `updatedInput` para decirle al modelo que el prompt de permisos mutó su entrada; de lo contrario, establece `updatedInput` a la entrada original, como en el ejemplo anterior. Por ejemplo, si la herramienta muestra un diff de edición de archivo al usuario y le permite editar el diff manualmente, la herramienta de prompt de permisos debe devolver esa edición actualizada.
- El payload debe estar JSON-stringificado

## Opciones CLI disponibles

El SDK aprovecha todas las opciones CLI disponibles en Claude Code. Aquí están las clave para uso del SDK:

| Bandera                       | Descripción                                                                                            | Ejemplo                                                                                                                   |
| :------------------------- | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `--print`, `-p`            | Ejecutar en modo no interactivo                                                                            | `claude -p "query"`                                                                                                       |
| `--output-format`          | Especificar formato de salida (`text`, `json`, `stream-json`)                                                  | `claude -p --output-format json`                                                                                          |
| `--resume`, `-r`           | Reanudar una conversación por ID de sesión                                                                    | `claude --resume abc123`                                                                                                  |
| `--continue`, `-c`         | Continuar la conversación más reciente                                                                  | `claude --continue`                                                                                                       |
| `--verbose`                | Habilitar logging verboso                                                                                 | `claude --verbose`                                                                                                        |
| `--max-turns`              | Limitar turnos agénticos en modo no interactivo                                                            | `claude --max-turns 3`                                                                                                    |
| `--system-prompt`          | Sobrescribir prompt de sistema (solo con `--print`)                                                           | `claude --system-prompt "Custom instruction"`                                                                             |
| `--append-system-prompt`   | Agregar a prompt de sistema (solo con `--print`)                                                          | `claude --append-system-prompt "Custom instruction"`                                                                      |
| `--allowedTools`           | Lista separada por espacios de herramientas permitidas, o <br /><br /> string de lista separada por comas de herramientas permitidas | `claude --allowedTools mcp__slack mcp__filesystem`<br /><br />`claude --allowedTools "Bash(npm install),mcp__filesystem"` |
| `--disallowedTools`        | Lista separada por espacios de herramientas denegadas, o <br /><br /> string de lista separada por comas de herramientas denegadas   | `claude --disallowedTools mcp__splunk mcp__github`<br /><br />`claude --disallowedTools "Bash(git commit),mcp__github"`   |
| `--mcp-config`             | Cargar servidores MCP desde un archivo JSON                                                                      | `claude --mcp-config servers.json`                                                                                        |
| `--permission-prompt-tool` | Herramienta MCP para manejar prompts de permisos (solo con `--print`)                                         | `claude --permission-prompt-tool mcp__auth__prompt`                                                                       |

Para una lista completa de opciones CLI y características, consulta la documentación de [referencia CLI](/en/docs/claude-code/cli-reference).

## Formatos de salida

El SDK soporta múltiples formatos de salida:

### Salida de texto (predeterminado)

Devuelve solo el texto de respuesta:

```bash
$ claude -p "Explain file src/components/Header.tsx"
# Salida: This is a React component showing...
```

### Salida JSON

Devuelve datos estructurados incluyendo metadatos:

```bash
$ claude -p "How does the data layer work?" --output-format json
```

Formato de respuesta:

```json
{
  "type": "result",
  "subtype": "success",
  "total_cost_usd": 0.003,
  "is_error": false,
  "duration_ms": 1234,
  "duration_api_ms": 800,
  "num_turns": 6,
  "result": "The response text here...",
  "session_id": "abc123"
}
```

### Salida JSON streaming

Transmite cada mensaje conforme se recibe:

```bash
$ claude -p "Build an application" --output-format stream-json
```

Cada conversación comienza con un mensaje de sistema `init` inicial, seguido por una lista de mensajes de usuario y asistente, seguido por un mensaje de sistema `result` final con estadísticas. Cada mensaje se emite como un objeto JSON separado.

## Esquema de mensajes

Los mensajes devueltos desde la API JSON están estrictamente tipados según el siguiente esquema:

```ts
type SDKMessage =
  // Un mensaje del asistente
  | {
      type: "assistant";
      message: Message; // desde Anthropic SDK
      session_id: string;
    }

  // Un mensaje del usuario
  | {
      type: "user";
      message: MessageParam; // desde Anthropic SDK
      session_id: string;
    }

  // Emitido como el último mensaje
  | {
      type: "result";
      subtype: "success";
      duration_ms: float;
      duration_api_ms: float;
      is_error: boolean;
      num_turns: int;
      result: string;
      session_id: string;
      total_cost_usd: float;
    }

  // Emitido como el último mensaje, cuando hemos alcanzado el número máximo de turnos
  | {
      type: "result";
      subtype: "error_max_turns" | "error_during_execution";
      duration_ms: float;
      duration_api_ms: float;
      is_error: boolean;
      num_turns: int;
      session_id: string;
      total_cost_usd: float;
    }

  // Emitido como el primer mensaje al inicio de una conversación
  | {
      type: "system";
      subtype: "init";
      apiKeySource: string;
      cwd: string;
      session_id: string;
      tools: string[];
      mcp_servers: {
        name: string;
        status: string;
      }[];
      model: string;
      permissionMode: "default" | "acceptEdits" | "bypassPermissions" | "plan";
    };
```

Pronto publicaremos estos tipos en un formato compatible con JSONSchema. Usamos versionado semántico para el paquete principal Claude Code para comunicar cambios de ruptura a este formato.

Los tipos `Message` y `MessageParam` están disponibles en los SDKs de Anthropic. Por ejemplo, consulta los SDKs de Anthropic [TypeScript](https://github.com/anthropics/anthropic-sdk-typescript) y [Python](https://github.com/anthropics/anthropic-sdk-python/).

## Formatos de entrada

El SDK soporta múltiples formatos de entrada:

### Entrada de texto (predeterminado)

El texto de entrada puede proporcionarse como argumento:

```bash
$ claude -p "Explain this code"
```

O el texto de entrada puede pasarse vía stdin:

```bash
$ echo "Explain this code" | claude -p
```

### Entrada JSON streaming

Un flujo de mensajes proporcionado vía `stdin` donde cada mensaje representa un turno del usuario. Esto permite múltiples turnos de una conversación sin relanzar el binario `claude` y permite proporcionar orientación al modelo mientras está procesando una solicitud.

Cada mensaje es un objeto JSON 'Mensaje de usuario', siguiendo el mismo formato que el esquema de mensaje de salida. Los mensajes se formatean usando el formato [jsonl](https://jsonlines.org/) donde cada línea de entrada es un objeto JSON completo. La entrada JSON streaming requiere `-p` y `--output-format stream-json`.

Actualmente esto está limitado a mensajes de usuario solo de texto.

```bash
$ echo '{"type":"user","message":{"role":"user","content":[{"type":"text","text":"Explain this code"}]}}' | claude -p --output-format=stream-json --input-format=stream-json --verbose
```

## Ejemplos

### Integración de script simple

```bash
#!/bin/bash

# Función simple para ejecutar Claude y verificar código de salida
run_claude() {
    local prompt="$1"
    local output_format="${2:-text}"

    if claude -p "$prompt" --output-format "$output_format"; then
        echo "Success!"
    else
        echo "Error: Claude failed with exit code $?" >&2
        return 1
    fi
}

# Ejemplos de uso
run_claude "Write a Python function to read CSV files"
run_claude "Optimize this database query" "json"
```

### Procesando archivos con Claude

```bash
# Procesar un archivo a través de Claude
$ cat mycode.py | claude -p "Review this code for bugs"

# Procesar múltiples archivos
$ for file in *.js; do
    echo "Processing $file..."
    claude -p "Add JSDoc comments to this file:" < "$file" > "${file}.documented"
done

# Usar Claude en un pipeline
$ grep -l "TODO" *.py | while read file; do
    claude -p "Fix all TODO items in this file" < "$file"
done
```

### Gestión de sesiones

```bash
# Iniciar una sesión y capturar el ID de sesión
$ claude -p "Initialize a new project" --output-format json | jq -r '.session_id' > session.txt

# Continuar con la misma sesión
$ claude -p --resume "$(cat session.txt)" "Add unit tests"
```

## Mejores prácticas

1. **Usar formato de salida JSON** para parsing programático de respuestas:

   ```bash
   # Parsear respuesta JSON con jq
   result=$(claude -p "Generate code" --output-format json)
   code=$(echo "$result" | jq -r '.result')
   cost=$(echo "$result" | jq -r '.cost_usd')
   ```

2. **Manejar errores graciosamente** - verificar códigos de salida y stderr:

   ```bash
   if ! claude -p "$prompt" 2>error.log; then
       echo "Error occurred:" >&2
       cat error.log >&2
       exit 1
   fi
   ```

3. **Usar gestión de sesiones** para mantener contexto en conversaciones multi-turno

4. **Considerar timeouts** para operaciones de larga duración:

   ```bash
   timeout 300 claude -p "$complex_prompt" || echo "Timed out after 5 minutes"
   ```

5. **Respetar límites de tasa** cuando hagas múltiples solicitudes agregando retrasos entre llamadas

## Aplicaciones del mundo real

El Claude Code SDK habilita integraciones poderosas con tu flujo de trabajo de desarrollo. Un ejemplo notable son las [Claude Code GitHub Actions](/en/docs/claude-code/github-actions), que usa el SDK para proporcionar revisión automatizada de código, creación de PR, y capacidades de triaje de issues directamente en tu flujo de trabajo de GitHub.

## Recursos relacionados

- [Uso y controles CLI](/en/docs/claude-code/cli-reference) - Documentación CLI completa
- [Integración GitHub Actions](/en/docs/claude-code/github-actions) - Automatiza tu flujo de trabajo de GitHub con Claude
- [Flujos de trabajo comunes](/en/docs/claude-code/common-workflows) - Guías paso a paso para casos de uso comunes

# Referencia CLI

> Referencia completa para la interfaz de línea de comandos de Claude Code, incluyendo comandos y banderas.

## Comandos CLI

| Comando                            | Descripción                                    | Ejemplo                                                            |
| :--------------------------------- | :--------------------------------------------- | :----------------------------------------------------------------- |
| `claude`                           | Iniciar REPL interactivo                         | `claude`                                                           |
| `claude "query"`                   | Iniciar REPL con prompt inicial                 | `claude "explain this project"`                                    |
| `claude -p "query"`                | Query vía SDK, luego salir                       | `claude -p "explain this function"`                                |
| `cat file \| claude -p "query"`    | Procesar contenido via pipe                          | `cat logs.txt \| claude -p "explain"`                              |
| `claude -c`                        | Continuar conversación más reciente              | `claude -c`                                                        |
| `claude -c -p "query"`             | Continuar vía SDK                               | `claude -c -p "Check for type errors"`                             |
| `claude -r "<session-id>" "query"` | Reanudar sesión por ID                           | `claude -r "abc123" "Finish this PR"`                              |
| `claude update`                    | Actualizar a la versión más reciente                       | `claude update`                                                    |
| `claude mcp`                       | Configurar servidores Model Context Protocol (MCP) | Consulta la [documentación Claude Code MCP](/en/docs/claude-code/mcp). |

## Banderas CLI

Personaliza el comportamiento de Claude Code con estas banderas de línea de comandos:

| Bandera                             | Descripción                                                                                                                                              | Ejemplo                                                     |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| `--add-dir`                      | Agregar directorios de trabajo adicionales para que Claude pueda acceder (valida que cada ruta exista como directorio)                                                      | `claude --add-dir ../apps ../lib`                           |
| `--allowedTools`                 | Una lista de herramientas que deben permitirse sin pedir permiso al usuario, además de [archivos settings.json](/en/docs/claude-code/settings)    | `"Bash(git log:*)" "Bash(git diff:*)" "Read"`               |
| `--disallowedTools`              | Una lista de herramientas que deben denegarse sin pedir permiso al usuario, además de [archivos settings.json](/en/docs/claude-code/settings) | `"Bash(git log:*)" "Bash(git diff:*)" "Edit"`               |
| `--print`, `-p`                  | Imprimir respuesta sin modo interactivo (consulta [documentación SDK](/en/docs/claude-code/sdk) para detalles de uso programático)                               | `claude -p "query"`                                         |
| `--output-format`                | Especificar formato de salida para modo print (opciones: `text`, `json`, `stream-json`)                                                                            | `claude -p "query" --output-format json`                    |
| `--input-format`                 | Especificar formato de entrada para modo print (opciones: `text`, `stream-json`)                                                                                     | `claude -p --output-format json --input-format stream-json` |
| `--verbose`                      | Habilitar logging verboso, muestra salida completa turno por turno (útil para depuración tanto en modo print como interactivo)                                       | `claude --verbose`                                          |
| `--max-turns`                    | Limitar el número de turnos agénticos en modo no interactivo                                                                                                | `claude -p --max-turns 3 "query"`                           |
| `--model`                        | Establece el modelo para la sesión actual con un alias para el modelo más reciente (`sonnet` o `opus`) o el nombre completo del modelo                                    | `claude --model claude-sonnet-4-20250514`                   |
| `--permission-mode`              | Comenzar en un [modo de permisos](iam#permission-modes) especificado                                                                                             | `claude --permission-mode plan`                             |
| `--permission-prompt-tool`       | Especificar una herramienta MCP para manejar prompts de permisos en modo no interactivo                                                                                 | `claude -p --permission-prompt-tool mcp_auth_tool "query"`  |
| `--resume`                       | Reanudar una sesión específica por ID, o elegir en modo interactivo                                                                                      | `claude --resume abc123 "query"`                            |
| `--continue`                     | Cargar la conversación más reciente en el directorio actual                                                                                               | `claude --continue`                                         |
| `--dangerously-skip-permissions` | Omitir prompts de permisos (usar con precaución)                                                                                                               | `claude --dangerously-skip-permissions`                     |

<Tip>
  La bandera `--output-format json` es particularmente útil para scripting y
  automatización, permitiéndote parsear las respuestas de Claude programáticamente.
</Tip>

Para información detallada sobre modo print (`-p`) incluyendo formatos de salida,
streaming, logging verboso, y uso programático, consulta la
[documentación SDK](/en/docs/claude-code/sdk).

## Ver también

- [Modo interactivo](/en/docs/claude-code/interactive-mode) - Atajos, modos de entrada, y características interactivas
- [Comandos slash](/en/docs/claude-code/slash-commands) - Comandos de sesión interactiva
- [Guía de inicio rápido](/en/docs/claude-code/quickstart) - Empezando con Claude Code
- [Flujos de trabajo comunes](/en/docs/claude-code/common-workflows) - Flujos de trabajo y patrones avanzados
- [Configuraciones](/en/docs/claude-code/settings) - Opciones de configuración
- [Documentación SDK](/en/docs/claude-code/sdk) - Uso programático e integraciones

# Modo interactivo

> Referencia completa para atajos de teclado, modos de entrada, y características interactivas en sesiones de Claude Code.

## Atajos de teclado

### Controles generales

| Atajo         | Descripción                        | Contexto                    |
| :--------------- | :--------------------------------- | :------------------------- |
| `Ctrl+C`         | Cancelar entrada o generación actual | Interrupción estándar         |
| `Ctrl+D`         | Salir de sesión Claude Code           | Señal EOF                 |
| `Ctrl+L`         | Limpiar pantalla de terminal              | Mantiene historial de conversación |
| `Up/Down arrows` | Navegar historial de comandos           | Recordar entradas previas     |
| `Esc` + `Esc`    | Editar mensaje anterior              | Doble-escape para modificar    |

### Entrada multilínea

| Método         | Atajo       | Contexto                 |
| :------------- | :------------- | :---------------------- |
| Escape rápido   | `\` + `Enter`  | Funciona en todas las terminales  |
| Predeterminado macOS  | `Option+Enter` | Predeterminado en macOS        |
| Configuración terminal | `Shift+Enter`  | Después de `/terminal-setup` |
| Modo pegar     | Pegar directamente | Para bloques de código, logs   |

### Comandos rápidos

| Atajo     | Descripción                        | Notas                                                     |
| :----------- | :--------------------------------- | :-------------------------------------------------------- |
| `#` al inicio | Atajo de memoria - agregar a CLAUDE.md | Pide selección de archivo                                |
| `/` al inicio | Comando slash                      | Consulta [comandos slash](/en/docs/claude-code/slash-commands) |

## Modo vim

Habilita edición estilo vim con comando `/vim` o configura permanentemente vía `/config`.

### Cambio de modo

| Comando | Acción                      | Desde modo |
| :------ | :-------------------------- | :-------- |
| `Esc`   | Entrar modo NORMAL           | INSERT    |
| `i`     | Insertar antes del cursor        | NORMAL    |
| `I`     | Insertar al inicio de línea | NORMAL    |
| `a`     | Insertar después del cursor         | NORMAL    |
| `A`     | Insertar al final de línea       | NORMAL    |
| `o`     | Abrir línea abajo             | NORMAL    |
| `O`     | Abrir línea arriba             | NORMAL    |

### Navegación (modo NORMAL)

| Comando         | Acción                    |
| :-------------- | :------------------------ |
| `h`/`j`/`k`/`l` | Mover izquierda/abajo/arriba/derecha   |
| `w`             | Siguiente palabra                 |
| `e`             | Final de palabra               |
| `b`             | Palabra anterior             |
| `0`             | Inicio de línea         |
| `$`             | Final de línea               |
| `^`             | Primer carácter no blanco |
| `gg`            | Inicio de entrada        |
| `G`             | Final de entrada              |

### Edición (modo NORMAL)

| Comando        | Acción                  |
| :------------- | :---------------------- |
| `x`            | Eliminar carácter        |
| `dd`           | Eliminar línea             |
| `D`            | Eliminar hasta final de línea   |
| `dw`/`de`/`db` | Eliminar palabra/hasta final/atrás |
| `cc`           | Cambiar línea             |
| `C`            | Cambiar hasta final de línea   |
| `cw`/`ce`/`cb` | Cambiar palabra/hasta final/atrás |
| `.`            | Repetir último cambio      |

<Tip>
  Configura tu comportamiento preferido de salto de línea en configuraciones de terminal. Ejecuta `/terminal-setup` para instalar enlace Shift+Enter para terminales iTerm2 y VSCode.
</Tip>

## Historial de comandos

Claude Code mantiene historial de comandos para la sesión actual:

- El historial se almacena por directorio de trabajo
- Se limpia con comando `/clear`
- Usa flechas Arriba/Abajo para navegar (consulta atajos de teclado arriba)
- **Ctrl+R**: Búsqueda inversa a través del historial (si es soportado por terminal)
- **Nota**: La expansión de historial (`!`) está deshabilitada por defecto

## Ver también

- [Comandos slash](/en/docs/claude-code/slash-commands) - Comandos de sesión interactiva
- [Referencia CLI](/en/docs/claude-code/cli-reference) - Banderas y opciones de línea de comandos
- [Configuraciones](/en/docs/claude-code/settings) - Opciones de configuración
- [Gestión de memoria](/en/docs/claude-code/memory) - Gestión de archivos CLAUDE.md