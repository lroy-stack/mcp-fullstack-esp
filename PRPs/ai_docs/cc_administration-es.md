# Gestión de Identidad y Acceso

> Aprende cómo configurar autenticación de usuario, autorización, y controles de acceso para Claude Code en tu organización.

## Métodos de autenticación

Configurar Claude Code requiere acceso a modelos Anthropic. Para equipos, puedes configurar acceso a Claude Code de tres maneras:

- API Anthropic vía la Consola Anthropic
- Amazon Bedrock
- Google Vertex AI

### Autenticación API Anthropic

**Para configurar acceso a Claude Code para tu equipo vía API Anthropic:**

1. Usar tu cuenta existente de Consola Anthropic o crear una nueva cuenta de Consola Anthropic
2. Puedes agregar usuarios a través de cualquiera de los métodos a continuación:
   - Invitar usuarios en lote desde la Consola (Console -> Settings -> Members -> Invite)
   - [Configurar SSO](https://support.anthropic.com/en/articles/10280258-setting-up-single-sign-on-on-the-api-console)
3. Al invitar usuarios, necesitan uno de los siguientes roles:
   - El rol "Claude Code" significa que los usuarios solo pueden crear claves API de Claude Code
   - El rol "Developer" significa que los usuarios pueden crear cualquier tipo de clave API
4. Cada usuario invitado necesita completar estos pasos:
   - Aceptar la invitación de la Consola
   - [Verificar requisitos del sistema](/en/docs/claude-code/setup#system-requirements)
   - [Instalar Claude Code](/en/docs/claude-code/setup#installation)
   - Iniciar sesión con credenciales de cuenta de la Consola

### Autenticación de proveedor en la nube

**Para configurar acceso a Claude Code para tu equipo vía Bedrock o Vertex:**

1. Seguir la [documentación Bedrock](/en/docs/claude-code/amazon-bedrock) o [documentación Vertex](/en/docs/claude-code/google-vertex-ai)
2. Distribuir las variables de entorno e instrucciones para generar credenciales de nube a tus usuarios. Lee más sobre cómo [gestionar configuración aquí](/en/docs/claude-code/settings).
3. Los usuarios pueden [instalar Claude Code](/en/docs/claude-code/setup#installation)

## Control de acceso y permisos

Soportamos permisos de grano fino para que puedas especificar exactamente qué se le permite hacer al agente (ej. ejecutar tests, ejecutar linter) y qué no se le permite hacer (ej. actualizar infraestructura de nube). Estas configuraciones de permisos pueden registrarse en control de versiones y distribuirse a todos los desarrolladores en tu organización, así como personalizarse por desarrolladores individuales.

### Sistema de permisos

Claude Code usa un sistema de permisos por niveles para balancear poder y seguridad:

| Tipo de Herramienta         | Ejemplo              | Aprobación Requerida | Comportamiento "Sí, no preguntar de nuevo"               |
| :---------------- | :------------------- | :---------------- | :-------------------------------------------- |
| Solo lectura         | Lecturas de archivo, LS, Grep | No                | N/A                                           |
| Comandos Bash     | Ejecución shell      | Sí               | Permanentemente por directorio de proyecto y comando |
| Modificación de Archivo | Editar/escribir archivos     | Sí               | Hasta final de sesión                             |

### Configurando permisos

Puedes ver y gestionar los permisos de herramientas de Claude Code con `/permissions`. Esta interfaz lista todas las reglas de permisos y el archivo settings.json del que provienen.

- Las reglas **Allow** permitirán a Claude Code usar la herramienta especificada sin aprobación manual adicional.
- Las reglas **Deny** evitarán que Claude Code use la herramienta especificada. Las reglas Deny tienen precedencia sobre las reglas Allow.
- Los **Directorios adicionales** extienden el acceso de archivos de Claude a directorios más allá del directorio de trabajo inicial.
- El **Modo predeterminado** controla el comportamiento de permisos de Claude al encontrar nuevas solicitudes.

Las reglas de permisos usan el formato: `Tool(especificador-opcional)`

Una regla que es solo el nombre de la herramienta coincide con cualquier uso de esa herramienta. Por ejemplo, agregar `Bash` a la lista de reglas allow permitiría a Claude Code usar la herramienta Bash sin requerir aprobación del usuario.

#### Modos de permisos

Claude Code soporta varios modos de permisos que pueden establecerse como `defaultMode` en [archivos de configuración](/en/docs/claude-code/settings#settings-files):

| Modo                | Descripción                                                                  |
| :------------------ | :--------------------------------------------------------------------------- |
| `default`           | Comportamiento estándar - pide permiso en primer uso de cada herramienta         |
| `acceptEdits`       | Acepta automáticamente permisos de edición de archivos para la sesión                  |
| `plan`              | Modo plan - Claude puede analizar pero no modificar archivos o ejecutar comandos      |
| `bypassPermissions` | Omite todos los prompts de permisos (requiere entorno seguro - ver advertencia abajo) |

#### Directorios de trabajo

Por defecto, Claude tiene acceso a archivos en el directorio donde fue lanzado. Puedes extender este acceso:

- **Durante inicio**: Usar argumento CLI `--add-dir <path>`
- **Durante sesión**: Usar comando slash `/add-dir`
- **Configuración persistente**: Agregar a `additionalDirectories` en [archivos de configuración](/en/docs/claude-code/settings#settings-files)

Los archivos en directorios adicionales siguen las mismas reglas de permisos que el directorio de trabajo original - se vuelven legibles sin prompts, y los permisos de edición de archivos siguen el modo de permisos actual.

#### Reglas de permisos específicas de herramientas

Algunas herramientas usan el especificador opcional para controles de permisos más específicos. Por ejemplo, una regla allow con `Bash(git diff:*)` permitiría comandos Bash que empiecen con `git diff`. Las siguientes herramientas soportan reglas de permisos con especificadores:

**Bash**

- `Bash(npm run build)` Coincide con el comando Bash exacto `npm run build`
- `Bash(npm run test:*)` Coincide con comandos Bash que empiecen con `npm run test`.

<Tip>
  Claude Code está consciente de operadores shell (como `&&`) así que una regla de coincidencia de prefijo como `Bash(safe-cmd:*)` no le dará permiso para ejecutar el comando `safe-cmd && other-cmd`
</Tip>

**Read & Edit**

Las reglas `Edit` aplican a todas las herramientas integradas que editan archivos. Claude hará un mejor esfuerzo para aplicar reglas `Read` a todas las herramientas integradas que leen archivos como Grep, Glob, y LS.

Las reglas Read & Edit siguen la especificación [gitignore](https://git-scm.com/docs/gitignore). Los patrones se resuelven relativos al directorio que contiene `.claude/settings.json`. Para referenciar una ruta absoluta, usar `//`. Para una ruta relativa a tu directorio home, usar `~/`.

- `Edit(docs/**)` Coincide con ediciones a archivos en el directorio `docs` de tu proyecto
- `Read(~/.zshrc)` Coincide con lecturas a tu archivo `~/.zshrc`
- `Edit(//tmp/scratch.txt)` Coincide con ediciones a `/tmp/scratch.txt`

**WebFetch**

- `WebFetch(domain:example.com)` Coincide con solicitudes fetch a example.com

**MCP**

- `mcp__puppeteer` Coincide con cualquier herramienta proporcionada por el servidor `puppeteer` (nombre configurado en Claude Code)
- `mcp__puppeteer__puppeteer_navigate` Coincide con la herramienta `puppeteer_navigate` proporcionada por el servidor `puppeteer`

### Configuraciones de política gestionada empresarial

Para implementaciones empresariales de Claude Code, soportamos configuraciones de política gestionada empresarial que tienen precedencia sobre configuraciones de usuario y proyecto. Esto permite a administradores del sistema hacer cumplir políticas de seguridad que los usuarios no pueden sobrescribir.

Los administradores del sistema pueden implementar políticas en:

- **macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`
- **Linux y Windows (vía WSL)**: `/etc/claude-code/managed-settings.json`

Estos archivos de política siguen el mismo formato que los [archivos de configuración](/en/docs/claude-code/settings#settings-files) regulares pero no pueden ser sobrescritos por configuraciones de usuario o proyecto. Esto asegura políticas de seguridad consistentes a través de tu organización.

### Precedencia de configuraciones

Cuando existen múltiples fuentes de configuraciones, se aplican en el siguiente orden (mayor a menor precedencia):

1. Políticas empresariales
2. Argumentos de línea de comandos
3. Configuraciones de proyecto local (`.claude/settings.local.json`)
4. Configuraciones de proyecto compartido (`.claude/settings.json`)
5. Configuraciones de usuario (`~/.claude/settings.json`)

Esta jerarquía asegura que las políticas organizacionales siempre se hagan cumplir mientras aún permite flexibilidad a nivel de proyecto y usuario donde sea apropiado.

### Control de permisos adicional con hooks

Los [hooks de Claude Code](/en/docs/claude-code/hooks) proporcionan una manera de registrar comandos shell personalizados para realizar evaluación de permisos en tiempo de ejecución. Cuando Claude Code hace una llamada a herramienta, los hooks PreToolUse se ejecutan antes de que el sistema de permisos se ejecute, y la salida del hook puede determinar si aprobar o denegar la llamada a herramienta en lugar del sistema de permisos.

## Gestión de credenciales

Claude Code soporta autenticación vía credenciales Claude.ai, credenciales API Anthropic, Bedrock Auth, y Vertex Auth. En macOS, las claves API, tokens OAuth, y otras credenciales se almacenan en macOS Keychain encriptado. Alternativamente, la configuración [apiKeyHelper](/en/docs/claude-code/settings#available-settings) puede establecerse a un script shell que devuelve una clave API. Por defecto, este helper se llama después de 5 minutos o en respuesta HTTP 401; especificar la variable de entorno `CLAUDE_CODE_API_KEY_HELPER_TTL_MS` define un intervalo de actualización personalizado.

# Gestionar costos efectivamente

> Aprende cómo rastrear y optimizar uso de tokens y costos al usar Claude Code.

Claude Code consume tokens para cada interacción. El costo promedio es $6 por desarrollador por día, con costos diarios manteniéndose por debajo de $12 para el 90% de usuarios.

Para uso de equipo, Claude Code cobra por consumo de tokens API. En promedio, Claude Code cuesta ~$50-60/desarrollador por mes con Sonnet 4 aunque hay gran varianza dependiendo de cuántas instancias están ejecutando los usuarios y si lo están usando en automatización.

## Rastrea tus costos

- Usar `/cost` para ver uso de sesión actual
- **Usuarios de Consola Anthropic**:
  - Verificar [uso histórico](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console) en la Consola Anthropic (requiere rol Admin o Billing)
  - Establecer [límites de gasto de workspace](https://support.anthropic.com/en/articles/9796807-creating-and-managing-workspaces) para el workspace Claude Code (requiere rol Admin)
- **Usuarios de plan Pro y Max**: El uso está incluido en tu suscripción

## Gestionando costos para equipos

Cuando uses API Anthropic, puedes limitar el gasto total del workspace Claude Code. Para configurar, [sigue estas instrucciones](https://support.anthropic.com/en/articles/9796807-creating-and-managing-workspaces). Los Admins pueden ver reportes de costo y uso [siguiendo estas instrucciones](https://support.anthropic.com/en/articles/9534590-cost-and-usage-reporting-in-console).

En Bedrock y Vertex, Claude Code no envía métricas desde tu nube. Para obtener métricas de costo, varias empresas grandes reportaron usar [LiteLLM](/en/docs/claude-code/bedrock-vertex-proxies#litellm), que es una herramienta de código abierto que ayuda a empresas [rastrear gasto por clave](https://docs.litellm.ai/docs/proxy/virtual_keys#tracking-spend). Este proyecto no está afiliado con Anthropic y no hemos auditado su seguridad.

## Reducir uso de tokens

- **Conversaciones compactas:**
  - Claude usa auto-compactar por defecto cuando el contexto excede 95% de capacidad
  - Alternar auto-compactar: Ejecutar `/config` y navegar a "Auto-compact enabled"
  - Usar `/compact` manualmente cuando el contexto se vuelva grande
  - Agregar instrucciones personalizadas: `/compact Focus on code samples and API usage`
  - Personalizar compactación agregando a CLAUDE.md:

    ```markdown
    # Summary instructions

    When you are using compact, please focus on test output and code changes
    ```

- **Escribir consultas específicas:** Evitar solicitudes vagas que activen escaneo innecesario

- **Desglosar tareas complejas:** Dividir tareas grandes en interacciones enfocadas

- **Limpiar historial entre tareas:** Usar `/clear` para resetear contexto

Los costos pueden variar significativamente basados en:

- Tamaño del codebase siendo analizado
- Complejidad de consultas
- Número de archivos siendo buscados o modificados
- Longitud del historial de conversación
- Frecuencia de compactar conversaciones
- Procesos en segundo plano (generación de haiku, resumen de conversación)

## Uso de tokens en segundo plano

Claude Code usa tokens para alguna funcionalidad en segundo plano incluso cuando está inactivo:

- **Generación de haiku**: Pequeños mensajes creativos que aparecen mientras escribes (aproximadamente 1 centavo por día)
- **Resumen de conversación**: Trabajos en segundo plano que resumen conversaciones previas para la característica `claude --resume`
- **Procesamiento de comandos**: Algunos comandos como `/cost` pueden generar solicitudes para verificar estado

Estos procesos en segundo plano consumen una pequeña cantidad de tokens (típicamente bajo $0.04 por sesión) incluso sin interacción activa.

<Note>
  Para implementaciones de equipo, recomendamos empezar con un grupo piloto pequeño para
  establecer patrones de uso antes de un despliegue más amplio.
</Note>