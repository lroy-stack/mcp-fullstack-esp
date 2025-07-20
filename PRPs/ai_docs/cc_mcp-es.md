# Model Context Protocol (MCP)

> Aprende cómo configurar MCP con Claude Code.

Model Context Protocol (MCP) es un protocolo abierto que permite a los LLMs acceder a herramientas y fuentes de datos externas. Para más detalles sobre MCP, consulta la [documentación de MCP](https://modelcontextprotocol.io/introduction).

<Warning>
  Usa servidores MCP de terceros bajo tu propio riesgo. Asegúrate de confiar en los servidores MCP, y ten especial cuidado al usar servidores MCP que se comunican con internet, ya que estos pueden exponerte a riesgos de inyección de prompts.
</Warning>

## Configurar servidores MCP

<Steps>
  <Step title="Añadir un Servidor MCP stdio">
    ```bash
    # Sintaxis básica
    claude mcp add <name> <command> [args...]

    # Ejemplo: Añadir un servidor local
    claude mcp add my-server -e API_KEY=123 -- /path/to/server arg1 arg2
    ```

  </Step>

  <Step title="Añadir un Servidor MCP SSE">
    ```bash
    # Sintaxis básica
    claude mcp add --transport sse <name> <url>

    # Ejemplo: Añadir un servidor SSE
    claude mcp add --transport sse sse-server https://example.com/sse-endpoint

    # Ejemplo: Añadir un servidor SSE con headers personalizados
    claude mcp add --transport sse api-server https://api.example.com/mcp --header "X-API-Key: your-key"
    ```

  </Step>

  <Step title="Añadir un Servidor MCP HTTP">
    ```bash
    # Sintaxis básica
    claude mcp add --transport http <name> <url>

    # Ejemplo: Añadir un servidor HTTP streamable
    claude mcp add --transport http http-server https://example.com/mcp

    # Ejemplo: Añadir un servidor HTTP con header de autenticación
    claude mcp add --transport http secure-server https://api.example.com/mcp --header "Authorization: Bearer your-token"
    ```

  </Step>

  <Step title="Gestionar tus servidores MCP">
    ```bash
    # Listar todos los servidores configurados
    claude mcp list

    # Obtener detalles de un servidor específico
    claude mcp get my-server

    # Eliminar un servidor
    claude mcp remove my-server
    ```

  </Step>
</Steps>

<Tip>
  Tips:

- Usa la flag `-s` o `--scope` para especificar dónde se almacena la configuración:
  - `local` (predeterminado): Disponible solo para ti en el proyecto actual (se llamaba `project` en versiones anteriores)
  - `project`: Compartido con todos en el proyecto vía archivo `.mcp.json`
  - `user`: Disponible para ti en todos los proyectos (se llamaba `global` en versiones anteriores)
- Establece variables de entorno con flags `-e` o `--env` (ej., `-e KEY=value`)
- Configura el timeout de inicio del servidor MCP usando la variable de entorno MCP_TIMEOUT (ej., `MCP_TIMEOUT=10000 claude` establece un timeout de 10 segundos)
- Verifica el estado del servidor MCP en cualquier momento usando el comando `/mcp` dentro de Claude Code
- MCP sigue una arquitectura cliente-servidor donde Claude Code (el cliente) puede conectarse a múltiples servidores especializados
- Claude Code soporta SSE (Server-Sent Events) y servidores HTTP streamables para comunicación en tiempo real
- Usa `/mcp` para autenticarte con servidores remotos que requieren autenticación OAuth 2.0
  </Tip>

## Entendiendo los scopes de servidores MCP

Los servidores MCP pueden configurarse en tres niveles de scope diferentes, cada uno sirviendo propósitos distintos para gestionar accesibilidad y compartición de servidores. Entender estos scopes te ayuda a determinar la mejor forma de configurar servidores para tus necesidades específicas.

### Jerarquía y precedencia de scopes

Las configuraciones de servidores MCP siguen una jerarquía clara de precedencia. Cuando existen servidores con el mismo nombre en múltiples scopes, el sistema resuelve conflictos priorizando servidores de scope local primero, seguido por servidores de scope de proyecto, y finalmente servidores de scope de usuario. Este diseño asegura que las configuraciones personales puedan anular las compartidas cuando sea necesario.

### Scope local

Los servidores de scope local representan el nivel de configuración predeterminado y se almacenan en tu configuración de usuario específica del proyecto. Estos servidores permanecen privados para ti y solo son accesibles cuando trabajas dentro del directorio del proyecto actual. Este scope es ideal para servidores de desarrollo personal, configuraciones experimentales, o servidores que contienen credenciales sensibles que no deberían compartirse.

```bash
# Añadir un servidor de scope local (predeterminado)
claude mcp add my-private-server /path/to/server

# Especificar explícitamente scope local
claude mcp add my-private-server -s local /path/to/server
```

### Scope de proyecto

Los servidores de scope de proyecto habilitan colaboración en equipo almacenando configuraciones en un archivo `.mcp.json` en el directorio raíz de tu proyecto. Este archivo está diseñado para ser versionado en control de versiones, asegurando que todos los miembros del equipo tengan acceso a las mismas herramientas y servicios MCP. Cuando añades un servidor de scope de proyecto, Claude Code automáticamente crea o actualiza este archivo con la estructura de configuración apropiada.

```bash
# Añadir un servidor de scope de proyecto
claude mcp add shared-server -s project /path/to/server
```

El archivo `.mcp.json` resultante sigue un formato estandarizado:

```json
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```

Por razones de seguridad, Claude Code solicita aprobación antes de usar servidores de scope de proyecto desde archivos `.mcp.json`. Si necesitas resetear estas opciones de aprobación, usa el comando `claude mcp reset-project-choices`.

### Scope de usuario

Los servidores de scope de usuario proporcionan accesibilidad entre proyectos, haciéndolos disponibles en todos los proyectos en tu máquina mientras permanecen privados para tu cuenta de usuario. Este scope funciona bien para servidores de utilidades personales, herramientas de desarrollo, o servicios que usas frecuentemente en diferentes proyectos.

```bash
# Añadir un servidor de usuario
claude mcp add my-user-server -s user /path/to/server
```

### Eligiendo el scope correcto

Selecciona tu scope basado en:

- **Scope local**: Servidores personales, configuraciones experimentales, o credenciales sensibles específicas a un proyecto
- **Scope de proyecto**: Servidores compartidos por el equipo, herramientas específicas del proyecto, o servicios requeridos para colaboración
- **Scope de usuario**: Utilidades personales necesarias en múltiples proyectos, herramientas de desarrollo, o servicios usados frecuentemente

## Autenticarse con servidores MCP remotos

Muchos servidores MCP remotos requieren autenticación. Claude Code soporta flujo de autenticación OAuth 2.0 para conexión segura a estos servidores.

<Steps>
  <Step title="Añadir un servidor remoto que requiere autenticación">
    ```bash
    # Añadir un servidor SSE o HTTP que requiere OAuth
    claude mcp add --transport sse github-server https://api.github.com/mcp
    ```
  </Step>

  <Step title="Autenticarse usando el comando /mcp">
    Dentro de Claude Code, usa el comando `/mcp` para gestionar autenticación:

    ```
    > /mcp
    ```

    Esto abre un menú interactivo donde puedes:

    * Ver estado de conexión para todos los servidores
    * Autenticarte con servidores que requieren OAuth
    * Limpiar autenticación existente
    * Ver capacidades del servidor

  </Step>

  <Step title="Completar el flujo OAuth">
    Cuando seleccionas "Authenticate" para un servidor:

    1. Tu navegador se abre automáticamente al proveedor OAuth
    2. Completa la autenticación en tu navegador
    3. Claude Code recibe y almacena de forma segura el token de acceso
    4. La conexión del servidor se vuelve activa

  </Step>
</Steps>

<Tip>
  Tips:

- Los tokens de autenticación se almacenan de forma segura y se refrescan automáticamente
- Usa "Clear authentication" en el menú `/mcp` para revocar acceso
- Si tu navegador no se abre automáticamente, copia la URL proporcionada
- La autenticación OAuth funciona con transportes SSE y HTTP
  </Tip>

## Conectarse a un servidor MCP Postgres

Supongamos que quieres dar a Claude acceso de solo lectura a una base de datos PostgreSQL para consultas e inspección de esquema.

<Steps>
  <Step title="Añadir el servidor MCP Postgres">
    ```bash
    claude mcp add postgres-server /path/to/postgres-mcp-server --connection-string "postgresql://user:pass@localhost:5432/mydb"
    ```
  </Step>

  <Step title="Consultar tu base de datos con Claude">
    ```
    > describe the schema of our users table
    ```

    ```
    > what are the most recent orders in the system?
    ```

    ```
    > show me the relationship between customers and invoices
    ```

  </Step>
</Steps>

<Tip>
  Tips:

- El servidor MCP Postgres proporciona acceso de solo lectura por seguridad
- Claude puede ayudarte a explorar la estructura de la base de datos y ejecutar consultas analíticas
- Puedes usar esto para entender rápidamente esquemas de base de datos en proyectos desconocidos
- Asegúrate de que tu string de conexión use credenciales apropiadas con permisos mínimos requeridos
  </Tip>

## Añadir servidores MCP desde configuración JSON

Supongamos que tienes una configuración JSON para un servidor MCP individual que quieres añadir a Claude Code.

<Steps>
  <Step title="Añadir un servidor MCP desde JSON">
    ```bash
    # Sintaxis básica
    claude mcp add-json <name> '<json>'

    # Ejemplo: Añadir un servidor stdio con configuración JSON
    claude mcp add-json weather-api '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'
    ```

  </Step>

  <Step title="Verificar que el servidor fue añadido">
    ```bash
    claude mcp get weather-api
    ```
  </Step>
</Steps>

<Tip>
  Tips:

- Asegúrate de que el JSON esté correctamente escapado en tu shell
- El JSON debe cumplir con el esquema de configuración del servidor MCP
- Puedes usar `-s global` para añadir el servidor a tu configuración global en lugar de la específica del proyecto
  </Tip>

## Importar servidores MCP desde Claude Desktop

Supongamos que ya has configurado servidores MCP en Claude Desktop y quieres usar los mismos servidores en Claude Code sin reconfigurarlos manualmente.

<Steps>
  <Step title="Importar servidores desde Claude Desktop">
    ```bash
    # Sintaxis básica
    claude mcp add-from-claude-desktop
    ```
  </Step>

  <Step title="Seleccionar qué servidores importar">
    Después de ejecutar el comando, verás un diálogo interactivo que te permite seleccionar qué servidores quieres importar.
  </Step>

  <Step title="Verificar que los servidores fueron importados">
    ```bash
    claude mcp list
    ```
  </Step>
</Steps>

<Tip>
  Tips:

- Esta funcionalidad solo funciona en macOS y Windows Subsystem for Linux (WSL)
- Lee el archivo de configuración de Claude Desktop desde su ubicación estándar en esas plataformas
- Usa la flag `-s global` para añadir servidores a tu configuración global
- Los servidores importados tendrán los mismos nombres que en Claude Desktop
- Si ya existen servidores con los mismos nombres, obtendrán un sufijo numérico (ej., `server_1`)
  </Tip>

## Usar Claude Code como un servidor MCP

Supongamos que quieres usar Claude Code mismo como un servidor MCP al que otras aplicaciones puedan conectarse, proporcionándoles las herramientas y capacidades de Claude.

<Steps>
  <Step title="Iniciar Claude como un servidor MCP">
    ```bash
    # Sintaxis básica
    claude mcp serve
    ```
  </Step>

  <Step title="Conectarse desde otra aplicación">
    Puedes conectarte al servidor MCP de Claude Code desde cualquier cliente MCP, como Claude Desktop. Si estás usando Claude Desktop, puedes añadir el servidor MCP de Claude Code usando esta configuración:

    ```json
    {
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
    ```

  </Step>
</Steps>

<Tip>
  Tips:

- El servidor proporciona acceso a las herramientas de Claude como View, Edit, LS, etc.
- En Claude Desktop, intenta pedirle a Claude que lea archivos en un directorio, haga ediciones, y más.
- Nota que este servidor MCP simplemente está exponiendo las herramientas de Claude Code a tu cliente MCP, por lo que tu propio cliente es responsable de implementar confirmación del usuario para llamadas de herramientas individuales.
  </Tip>

## Usar recursos MCP

Los servidores MCP pueden exponer recursos que puedes referenciar usando menciones @, similar a cómo referencias archivos.

### Referenciar recursos MCP

<Steps>
  <Step title="Listar recursos disponibles">
    Escribe `@` en tu prompt para ver recursos disponibles de todos los servidores MCP conectados. Los recursos aparecen junto a archivos en el menú de autocompletado.
  </Step>

  <Step title="Referenciar un recurso específico">
    Usa el formato `@server:protocol://resource/path` para referenciar un recurso:

    ```
    > Can you analyze @github:issue://123 and suggest a fix?
    ```

    ```
    > Please review the API documentation at @docs:file://api/authentication
    ```

  </Step>

  <Step title="Referencias múltiples de recursos">
    Puedes referenciar múltiples recursos en un solo prompt:

    ```
    > Compare @postgres:schema://users with @docs:file://database/user-model
    ```

  </Step>
</Steps>

<Tip>
  Tips:

- Los recursos se obtienen automáticamente y se incluyen como adjuntos cuando se referencian
- Las rutas de recursos son fuzzy-searchables en el autocompletado de mención @
- Claude Code automáticamente proporciona herramientas para listar y leer recursos MCP cuando los servidores los soportan
- Los recursos pueden contener cualquier tipo de contenido que el servidor MCP proporcione (texto, JSON, datos estructurados, etc.)
  </Tip>

## Usar prompts MCP como comandos slash

Los servidores MCP pueden exponer prompts que se vuelven disponibles como comandos slash en Claude Code.

### Ejecutar prompts MCP

<Steps>
  <Step title="Descubrir prompts disponibles">
    Escribe `/` para ver todos los comandos disponibles, incluyendo los de servidores MCP. Los prompts MCP aparecen con el formato `/mcp__servername__promptname`.
  </Step>

  <Step title="Ejecutar un prompt sin argumentos">
    ```
    > /mcp__github__list_prs
    ```
  </Step>

  <Step title="Ejecutar un prompt con argumentos">
    Muchos prompts aceptan argumentos. Pásalos separados por espacios después del comando:

    ```
    > /mcp__github__pr_review 456
    ```

    ```
    > /mcp__jira__create_issue "Bug in login flow" high
    ```

  </Step>
</Steps>

<Tip>
  Tips:

- Los prompts MCP se descubren dinámicamente desde servidores conectados
- Los argumentos se analizan basándose en los parámetros definidos del prompt
- Los resultados del prompt se inyectan directamente en la conversación
- Los nombres de servidor y prompt se normalizan (los espacios se vuelven guiones bajos)
  </Tip>