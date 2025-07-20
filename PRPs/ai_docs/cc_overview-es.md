# Resumen de Claude Code

> Aprende sobre Claude Code, la herramienta de codificación agéntica que vive en tu terminal, entiende tu base de código y te ayuda a codificar más rápido a través de comandos en lenguaje natural.

Al integrarse directamente con tu entorno de desarrollo, Claude Code optimiza tu flujo de trabajo sin requerir servidores adicionales o configuración compleja.

## Uso básico

Para instalar Claude Code, usa NPM:

```bash
npm install -g @anthropic-ai/claude-code
```

Para instrucciones de instalación más detalladas, ve [Configurar Claude Code](/en/docs/claude-code/setup).

Para ejecutar Claude Code, simplemente llama al CLI `claude`:

```bash
claude
```

Luego puedes hacer prompts a Claude directamente desde la sesión REPL interactiva de Claude Code.

Para más instrucciones de uso, ve [Quickstart](/en/docs/claude-code/quickstart).

## ¿Por qué Claude Code?

### Acelera el desarrollo

Usa Claude Code para acelerar el desarrollo con las siguientes capacidades clave:

- Editar archivos y corregir bugs en toda tu base de código
- Responder preguntas sobre la arquitectura y lógica de tu código
- Ejecutar y corregir pruebas, linting y otros comandos
- Buscar en el historial de git, resolver conflictos de merge y crear commits y PRs
- Navegar documentación y recursos de internet usando búsqueda web

Claude Code proporciona un conjunto comprensivo de [herramientas](/en/docs/claude-code/settings#tools-available-to-claude) para interactuar con tu entorno de desarrollo, incluyendo operaciones de archivos, búsqueda de código, navegación web y más. Entender estas herramientas te ayuda a aprovechar las capacidades completas de Claude Code.

### Seguridad y privacidad por diseño

La seguridad de tu código es primordial. La arquitectura de Claude Code asegura:

- **Conexión directa a API**: Tus consultas van directamente a la API de Anthropic sin servidores intermediarios
- **Funciona donde trabajas**: Opera directamente en tu terminal
- **Entiende el contexto**: Mantiene conciencia de toda la estructura de tu proyecto
- **Toma acción**: Realiza operaciones reales como editar archivos y crear commits

### Integración empresarial

Claude Code se integra sin problemas con plataformas de IA empresariales. Puedes conectar a [Amazon Bedrock o Google Vertex AI](/en/docs/claude-code/third-party-integrations) para implementaciones seguras y conformes que cumplan los requisitos de tu organización.

## Próximos pasos

<CardGroup>
  <Card title="Setup" icon="download" href="/en/docs/claude-code/setup">
    Instalar y autenticar Claude Code
  </Card>

  <Card title="Quickstart" icon="rocket" href="/en/docs/claude-code/quickstart">
    Ver Claude Code en acción con ejemplos prácticos
  </Card>

  <Card title="Commands" icon="terminal" href="/en/docs/claude-code/cli-reference">
    Aprender sobre comandos CLI y controles
  </Card>

  <Card title="Configuration" icon="gear" href="/en/docs/claude-code/settings">
    Personalizar Claude Code para tu flujo de trabajo
  </Card>
</CardGroup>

## Recursos adicionales

<CardGroup>
  <Card title="Common workflows" icon="graduation-cap" href="/en/docs/claude-code/common-workflows">
    Guías paso a paso para flujos de trabajo comunes
  </Card>

  <Card title="Resolución de Problemas" icon="wrench" href="/en/docs/claude-code/troubleshooting">
    Soluciones para problemas comunes con Claude Code
  </Card>

  <Card title="Bedrock & Vertex integrations" icon="cloud" href="/en/docs/claude-code/bedrock-vertex-proxies">
    Configurar Claude Code con Amazon Bedrock o Google Vertex AI
  </Card>

  <Card title="Reference implementation" icon="code" href="https://github.com/anthropics/claude-code/tree/main/.devcontainer">
    Clona nuestra implementación de referencia de contenedor de desarrollo.
  </Card>
</CardGroup>

# Configurar Claude Code

> Instalar, autenticar y comenzar a usar Claude Code en tu máquina de desarrollo.

## Requisitos del sistema

- **Sistemas Operativos**: macOS 10.15+, Ubuntu 20.04+/Debian 10+, o Windows vía WSL
- **Hardware**: 4GB RAM mínimo
- **Software**:
  - Node.js 18+
  - [git](https://git-scm.com/downloads) 2.23+ (opcional)
  - [GitHub](https://cli.github.com/) o [GitLab](https://gitlab.com/gitlab-org/cli) CLI para flujos de trabajo de PR (opcional)
- **Red**: Conexión a internet requerida para autenticación y procesamiento de IA
- **Ubicación**: Disponible solo en [países soportados](https://www.anthropic.com/supported-countries)

## Instalar y autenticar

<Steps>
  <Step title="Instalar Claude Code">
    Instala [NodeJS 18+](https://nodejs.org/en/download), luego ejecuta:

    ```sh
    npm install -g @anthropic-ai/claude-code
    ```

    <Warning>
      NO uses `sudo npm install -g` ya que esto puede llevar a problemas de permisos y 
      riesgos de seguridad. Si encuentras errores de permisos, ve [configurar Claude
      Code](/en/docs/claude-code/troubleshooting#linux-permission-issues) para soluciones recomendadas.
    </Warning>

  </Step>

  <Step title="Navegar a tu proyecto">
    ```bash
    cd tu-directorio-de-proyecto
    ```
  </Step>

  <Step title="Iniciar Claude Code">
    ```bash
    claude
    ```
  </Step>

  <Step title="Completar autenticación">
    Claude Code ofrece múltiples opciones de autenticación:

    1. **Consola de Anthropic**: La opción por defecto. Conecta a través de la Consola de Anthropic y
       completa el proceso OAuth. Requiere facturación activa en [console.anthropic.com](https://console.anthropic.com).
    2. **App de Claude (con plan Pro o Max)**: Suscríbete al [plan Pro o Max](https://www.anthropic.com/pricing) de Claude para una suscripción unificada que incluye tanto Claude Code como la interfaz web. Obtén más valor al mismo precio mientras gestionas tu cuenta en un lugar. Inicia sesión con tu cuenta de Claude.ai. Durante el lanzamiento, elige la opción que coincida con tu tipo de suscripción.
    3. **Plataformas empresariales**: Configura Claude Code para usar
       [Amazon Bedrock o Google Vertex AI](/en/docs/claude-code/bedrock-vertex-proxies)
       para implementaciones empresariales con tu infraestructura cloud existente.

  </Step>
</Steps>

## Inicializar tu proyecto

Para usuarios primerizos, recomendamos:

<Steps>
  <Step title="Iniciar Claude Code">
    ```bash
    claude
    ```
  </Step>

  <Step title="Ejecutar un comando simple">
    ```
    > resume este proyecto
    ```
  </Step>

  <Step title="Generar una guía de proyecto CLAUDE.md">
    ```
    /init
    ```
  </Step>

  <Step title="Hacer commit del archivo CLAUDE.md generado">
    Pide a Claude que haga commit del archivo CLAUDE.md generado a tu repositorio.
  </Step>
</Steps>

## Solución de problemas

### Solución de problemas de instalación WSL

Actualmente, Claude Code no ejecuta directamente en Windows, y en su lugar requiere WSL.

Podrías encontrar los siguientes problemas en WSL:

**Problemas de detección de OS/plataforma**: Si recibes un error durante la instalación, WSL podría estar usando `npm` de Windows. Intenta:

- Ejecutar `npm config set os linux` antes de la instalación
- Instalar con `npm install -g @anthropic-ai/claude-code --force --no-os-check` (NO uses `sudo`)

**Errores de Node no encontrado**: Si ves `exec: node: not found` al ejecutar `claude`, tu entorno WSL podría estar usando una instalación de Node.js de Windows. Puedes confirmar esto con `which npm` y `which node`, que deberían apuntar a rutas de Linux comenzando con `/usr/` en lugar de `/mnt/c/`. Para arreglar esto, intenta instalar Node vía el gestor de paquetes de tu distribución Linux o vía [`nvm`](https://github.com/nvm-sh/nvm).

## Optimizar la configuración de tu terminal

Claude Code funciona mejor cuando tu terminal está configurado correctamente. Sigue estas pautas para optimizar tu experiencia.

**Shells soportados**:

- Bash
- Zsh
- Fish

### Temas y apariencia

Claude no puede controlar el tema de tu terminal. Eso se maneja por tu aplicación de terminal. Puedes hacer coincidir el tema de Claude Code con tu terminal durante la incorporación o en cualquier momento vía el comando `/config`

### Saltos de línea

Tienes varias opciones para ingresar saltos de línea en Claude Code:

- **Escape rápido**: Escribe `\` seguido de Enter para crear una nueva línea
- **Atajo de teclado**: Presiona Option+Enter (Meta+Enter) con la configuración apropiada

Para configurar Option+Enter en tu terminal:

**Para Mac Terminal.app:**

1. Abre Settings → Profiles → Keyboard
2. Marca "Use Option as Meta Key"

**Para iTerm2 y terminal de VSCode:**

1. Abre Settings → Profiles → Keys
2. Bajo General, configura Left/Right Option key a "Esc+"

**Consejo para usuarios de iTerm2 y VSCode**: Ejecuta `/terminal-setup` dentro de Claude Code para configurar automáticamente Shift+Enter como una alternativa más intuitiva.

### Configuración de notificaciones

Nunca te pierdas cuando Claude complete una tarea con la configuración apropiada de notificaciones:

#### Notificaciones de campana del terminal

Habilita alertas de sonido cuando las tareas se completen:

```sh
claude config set --global preferredNotifChannel terminal_bell
```

**Para usuarios de macOS**: No olvides habilitar permisos de notificación en System Settings → Notifications → \[Tu App de Terminal].

#### Notificaciones del sistema iTerm 2

Para alertas de iTerm 2 cuando las tareas se completen:

1. Abre iTerm 2 Preferences
2. Navega a Profiles → Terminal
3. Habilita "Silence bell" y Filter Alerts → "Send escape sequence-generated alerts"
4. Configura tu retraso de notificación preferido

Nota que estas notificaciones son específicas de iTerm 2 y no están disponibles en el Terminal por defecto de macOS.

#### Hooks de notificación personalizados

Para manejo avanzado de notificaciones, puedes crear [hooks de notificación](/en/docs/claude-code/hooks#notification) para ejecutar tu propia lógica.

### Manejar entradas grandes

Cuando trabajas con código extenso o instrucciones largas:

- **Evita pegado directo**: Claude Code puede tener dificultades con contenido pegado muy largo
- **Usa flujos de trabajo basados en archivos**: Escribe contenido a un archivo y pide a Claude que lo lea
- **Ten en cuenta las limitaciones de VS Code**: El terminal de VS Code es particularmente propenso a truncar pegados largos

### Modo Vim

Claude Code soporta un subconjunto de keybindings de Vim que puede habilitarse con `/vim` o configurarse vía `/config`.

El subconjunto soportado incluye:

- Cambio de modo: `Esc` (a NORMAL), `i`/`I`, `a`/`A`, `o`/`O` (a INSERT)
- Navegación: `h`/`j`/`k`/`l`, `w`/`e`/`b`, `0`/`$`/`^`, `gg`/`G`
- Edición: `x`, `dw`/`de`/`db`/`dd`/`D`, `cw`/`ce`/`cb`/`cc`/`C`, `.` (repetir)

# Quickstart

> ¡Bienvenido a Claude Code!

Esta guía de inicio rápido te tendrá usando asistencia de codificación impulsada por IA en solo unos minutos. Al final, entenderás cómo usar Claude Code para tareas de desarrollo comunes.

## Antes de comenzar

Asegúrate de tener:

- [Claude Code instalado](/en/docs/claude-code/setup)
- Una terminal o símbolo del sistema abierto
- Un proyecto de código con el que trabajar

## Paso 1: Iniciar tu primera sesión

Abre tu terminal en cualquier directorio de proyecto e inicia Claude Code:

```bash
cd /ruta/a/tu/proyecto
claude
```

Verás el prompt de Claude Code dentro de una nueva sesión interactiva:

```
✻ ¡Bienvenido a Claude Code!

...

> Prueba "crear un util logging.py que..."
```

## Paso 2: Hacer tu primera pregunta

Comencemos entendiendo tu base de código. Prueba uno de estos comandos:

```
> ¿qué hace este proyecto?
```

Claude analizará tus archivos y proporcionará un resumen. También puedes hacer preguntas más específicas:

```
> ¿qué tecnologías usa este proyecto?
```

```
> ¿dónde está el punto de entrada principal?
```

```
> explica la estructura de carpetas
```

<Note>
  Claude Code lee tus archivos según sea necesario - no tienes que añadir contexto manualmente.
</Note>

## Paso 3: Hacer tu primer cambio de código

Ahora hagamos que Claude Code haga algo de codificación real. Prueba una tarea simple:

```
> añadir una función hello world al archivo principal
```

Claude Code:

1. Encontrará el archivo apropiado
2. Te mostrará los cambios propuestos
3. Pedirá tu aprobación
4. Hará la edición

<Note>
  Claude Code siempre pide permiso antes de modificar archivos. Puedes aprobar cambios individuales o habilitar el modo "Aceptar todo" para una sesión.
</Note>

## Paso 4: Usar Git con Claude Code

Claude Code hace las operaciones de Git conversacionales:

```
> ¿qué archivos he cambiado?
```

```
> hacer commit de mis cambios con un mensaje descriptivo
```

También puedes pedir operaciones de Git más complejas:

```
> crear una nueva rama llamada feature/quickstart
```

```
> mostrarme los últimos 5 commits
```

```
> ayúdame a resolver conflictos de merge
```

## Paso 5: Corregir un bug o añadir una funcionalidad

Claude es competente en debugging e implementación de funcionalidades.

Describe lo que quieres en lenguaje natural:

```
> añadir validación de entrada al formulario de registro de usuario
```

O corregir problemas existentes:

```
> hay un bug donde los usuarios pueden enviar formularios vacíos - arréglalo
```

Claude Code:

- Localizará el código relevante
- Entenderá el contexto
- Implementará una solución
- Ejecutará pruebas si están disponibles

## Paso 6: Probar otros flujos de trabajo comunes

Hay varias formas de trabajar con Claude:

**Refactorizar código**

```
> refactorizar el módulo de autenticación para usar async/await en lugar de callbacks
```

**Escribir pruebas**

```
> escribir pruebas unitarias para las funciones de calculadora
```

**Actualizar documentación**

```
> actualizar el README con instrucciones de instalación
```

**Revisión de código**

```
> revisar mis cambios y sugerir mejoras
```

<Tip>
  **Recuerda**: Claude Code es tu programador de par de IA. Háblale como lo harías con un colega útil - describe lo que quieres lograr, y te ayudará a llegar ahí.
</Tip>

## Comandos esenciales

Aquí están los comandos más importantes para uso diario:

| Comando             | Qué hace                          | Ejemplo                             |
| ------------------- | --------------------------------- | ----------------------------------- |
| `claude`            | Iniciar modo interactivo          | `claude`                            |
| `claude "tarea"`    | Ejecutar una tarea única          | `claude "arreglar el error de build"` |
| `claude -p "consulta"` | Ejecutar consulta única, luego salir | `claude -p "explicar esta función"` |
| `claude -c`         | Continuar conversación más reciente | `claude -c`                         |
| `claude -r`         | Reanudar conversación anterior    | `claude -r`                         |
| `claude commit`     | Crear un commit de Git            | `claude commit`                     |
| `/clear`            | Limpiar historial de conversación | `> /clear`                          |
| `/help`             | Mostrar comandos disponibles      | `> /help`                           |
| `exit` o Ctrl+C     | Salir de Claude Code              | `> exit`                            |

## Consejos pro para principiantes

<AccordionGroup>
  <Accordion title="Sé específico con tus solicitudes">
    En lugar de: "arreglar el bug"

    Prueba: "arreglar el bug de login donde los usuarios ven una pantalla en blanco después de ingresar credenciales incorrectas"

  </Accordion>

  <Accordion title="Usa instrucciones paso a paso">
    Divide tareas complejas en pasos:

    ```
    > 1. crear un nuevo endpoint de API para perfiles de usuario
    ```

    ```
    > 2. añadir validación para campos requeridos
    ```

    ```
    > 3. escribir pruebas para el endpoint
    ```

  </Accordion>

  <Accordion title="Deja que Claude explore primero">
    Antes de hacer cambios, deja que Claude entienda tu código:

    ```
    > analizar el esquema de la base de datos
    ```

    ```
    > ¿cómo funciona el manejo de errores en esta app?
    ```

  </Accordion>

  <Accordion title="Ahorra tiempo con atajos">
    * Usa Tab para completar comandos
    * Presiona ↑ para historial de comandos
    * Escribe `/` para ver todos los comandos slash
  </Accordion>
</AccordionGroup>

## ¿Qué sigue?

Ahora que has aprendido lo básico, explora funcionalidades más avanzadas:

<CardGroup cols={3}>
  <Card title="CLI reference" icon="terminal" href="/en/docs/claude-code/cli-reference">
    Dominar todos los comandos y opciones
  </Card>

  <Card title="Configuration" icon="gear" href="/en/docs/claude-code/settings">
    Personalizar Claude Code para tu flujo de trabajo
  </Card>

  <Card title="Common workflows" icon="graduation-cap" href="/en/docs/claude-code/common-workflows">
    Aprender técnicas avanzadas
  </Card>
</CardGroup>

## Obtener ayuda

- **En Claude Code**: Escribe `/help` o pregunta "¿cómo...?"
- **Documentación**: ¡Estás aquí! Navega otras guías
- **Comunidad**: Únete a nuestro [Discord](https://www.anthropic.com/discord) para consejos y soporte