# Flujos de trabajo comunes

> Aprende sobre flujos de trabajo comunes con Claude Code.

Cada tarea en este documento incluye instrucciones claras, comandos de ejemplo, y mejores prácticas para ayudarte a obtener el máximo de Claude Code.

## Entender nuevas bases de código

### Obtener una visión general rápida de la base de código

Supongamos que acabas de unirte a un nuevo proyecto y necesitas entender su estructura rápidamente.

<Steps>
  <Step title="Navegar al directorio raíz del proyecto">
    ```bash
    cd /path/to/project
    ```
  </Step>

  <Step title="Iniciar Claude Code">
    ```bash
    claude
    ```
  </Step>

  <Step title="Pedir una visión general de alto nivel">
    ```
    > give me an overview of this codebase
    ```
  </Step>

  <Step title="Profundizar en componentes específicos">
    ```
    > explain the main architecture patterns used here
    ```

    ```
    > what are the key data models?
    ```

    ```
    > how is authentication handled?
    ```

  </Step>
</Steps>

<Tip>
  Consejos:

- Comienza con preguntas amplias, luego reduce a áreas específicas
- Pregunta sobre convenciones de codificación y patrones usados en el proyecto
- Solicita un glosario de términos específicos del proyecto
  </Tip>

### Encontrar código relevante

Supongamos que necesitas localizar código relacionado con una característica o funcionalidad específica.

<Steps>
  <Step title="Pedir a Claude que encuentre archivos relevantes">
    ```
    > find the files that handle user authentication
    ```
  </Step>

  <Step title="Obtener contexto sobre cómo interactúan los componentes">
    ```
    > how do these authentication files work together?
    ```
  </Step>

  <Step title="Entender el flujo de ejecución">
    ```
    > trace the login process from front-end to database
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Sé específico sobre lo que estás buscando
- Usa lenguaje del dominio del proyecto
  </Tip>

---

## Corregir bugs eficientemente

Supongamos que has encontrado un mensaje de error y necesitas encontrar y corregir su origen.

<Steps>
  <Step title="Compartir el error con Claude">
    ```
    > I'm seeing an error when I run npm test
    ```
  </Step>

  <Step title="Pedir recomendaciones de corrección">
    ```
    > suggest a few ways to fix the @ts-ignore in user.ts
    ```
  </Step>

  <Step title="Aplicar la corrección">
    ```
    > update user.ts to add the null check you suggested
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Dile a Claude el comando para reproducir el problema y obtener un stack trace
- Menciona cualquier paso para reproducir el error
- Hazle saber a Claude si el error es intermitente o consistente
  </Tip>

---

## Refactorizar código

Supongamos que necesitas actualizar código antiguo para usar patrones y prácticas modernas.

<Steps>
  <Step title="Identificar código legacy para refactorizar">
    ```
    > find deprecated API usage in our codebase
    ```
  </Step>

  <Step title="Obtener recomendaciones de refactorización">
    ```
    > suggest how to refactor utils.js to use modern JavaScript features
    ```
  </Step>

  <Step title="Aplicar los cambios de forma segura">
    ```
    > refactor utils.js to use ES2024 features while maintaining the same behavior
    ```
  </Step>

  <Step title="Verificar la refactorización">
    ```
    > run tests for the refactored code
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Pide a Claude que explique los beneficios del enfoque moderno
- Solicita que los cambios mantengan compatibilidad hacia atrás cuando sea necesario
- Haz la refactorización en incrementos pequeños y comprobables
  </Tip>

---

## Trabajar con tests

Supongamos que necesitas agregar tests para código no cubierto.

<Steps>
  <Step title="Identificar código no probado">
    ```
    > find functions in NotificationsService.swift that are not covered by tests
    ```
  </Step>

  <Step title="Generar estructura de tests">
    ```
    > add tests for the notification service
    ```
  </Step>

  <Step title="Agregar casos de test significativos">
    ```
    > add test cases for edge conditions in the notification service
    ```
  </Step>

  <Step title="Ejecutar y verificar tests">
    ```
    > run the new tests and fix any failures
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Pide tests que cubran casos extremos y condiciones de error
- Solicita tanto tests unitarios como de integración cuando sea apropiado
- Haz que Claude explique la estrategia de testing
  </Tip>

---

## Crear pull requests

Supongamos que necesitas crear un pull request bien documentado para tus cambios.

<Steps>
  <Step title="Resumir tus cambios">
    ```
    > summarize the changes I've made to the authentication module
    ```
  </Step>

  <Step title="Generar un PR con Claude">
    ```
    > create a pr
    ```
  </Step>

  <Step title="Revisar y refinar">
    ```
    > enhance the PR description with more context about the security improvements
    ```
  </Step>

  <Step title="Agregar detalles de testing">
    ```
    > add information about how these changes were tested
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Pide a Claude directamente que haga un PR para ti
- Revisa el PR generado por Claude antes de enviarlo
- Pide a Claude que resalte riesgos potenciales o consideraciones
  </Tip>

## Manejar documentación

Supongamos que necesitas agregar o actualizar documentación para tu código.

<Steps>
  <Step title="Identificar código sin documentar">
    ```
    > find functions without proper JSDoc comments in the auth module
    ```
  </Step>

  <Step title="Generar documentación">
    ```
    > add JSDoc comments to the undocumented functions in auth.js
    ```
  </Step>

  <Step title="Revisar y mejorar">
    ```
    > improve the generated documentation with more context and examples
    ```
  </Step>

  <Step title="Verificar documentación">
    ```
    > check if the documentation follows our project standards
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Especifica el estilo de documentación que quieres (JSDoc, docstrings, etc.)
- Pide ejemplos en la documentación
- Solicita documentación para APIs públicas, interfaces, y lógica compleja
  </Tip>

---

## Trabajar con imágenes

Supongamos que necesitas trabajar con imágenes en tu base de código, y quieres ayuda de Claude analizando contenido de imágenes.

<Steps>
  <Step title="Agregar una imagen a la conversación">
    Puedes usar cualquiera de estos métodos:

    1. Arrastrar y soltar una imagen en la ventana de Claude Code
    2. Copiar una imagen y pegarla en el CLI con ctrl+v (No usar cmd+v)
    3. Proporcionar una ruta de imagen a Claude. Ej., "Analyze this image: /path/to/your/image.png"

  </Step>

  <Step title="Pedir a Claude que analice la imagen">
    ```
    > What does this image show?
    ```

    ```
    > Describe the UI elements in this screenshot
    ```

    ```
    > Are there any problematic elements in this diagram?
    ```

  </Step>

  <Step title="Usar imágenes para contexto">
    ```
    > Here's a screenshot of the error. What's causing it?
    ```

    ```
    > This is our current database schema. How should we modify it for the new feature?
    ```

  </Step>

  <Step title="Obtener sugerencias de código desde contenido visual">
    ```
    > Generate CSS to match this design mockup
    ```

    ```
    > What HTML structure would recreate this component?
    ```

  </Step>
</Steps>

<Tip>
  Consejos:

- Usa imágenes cuando las descripciones de texto serían poco claras o engorrosas
- Incluye capturas de pantalla de errores, diseños UI, o diagramas para mejor contexto
- Puedes trabajar con múltiples imágenes en una conversación
- El análisis de imágenes funciona con diagramas, capturas de pantalla, mockups, y más
  </Tip>

---

## Referenciar archivos y directorios

Usa @ para incluir rápidamente archivos o directorios sin esperar a que Claude los lea.

<Steps>
  <Step title="Referenciar un archivo único">
    ```
    > Explain the logic in @src/utils/auth.js
    ```

    Esto incluye el contenido completo del archivo en la conversación.

  </Step>

  <Step title="Referenciar un directorio">
    ```
    > What's the structure of @src/components?
    ```

    Esto proporciona un listado de directorio con información de archivos.

  </Step>

  <Step title="Referenciar recursos MCP">
    ```
    > Show me the data from @github:repos/owner/repo/issues
    ```

    Esto obtiene datos de servidores MCP conectados usando el formato @server:resource. Ver [recursos MCP](/en/docs/claude-code/mcp#use-mcp-resources) para detalles.

  </Step>
</Steps>

<Tip>
  Consejos:

- Las rutas de archivos pueden ser relativas o absolutas
- Las referencias de archivos @ agregan CLAUDE.md en el directorio del archivo y directorios padre al contexto
- Las referencias de directorios muestran listados de archivos, no contenidos
- Puedes referenciar múltiples archivos en un mensaje único (ej., "@file1.js and @file2.js")
  </Tip>

---

## Usar pensamiento extendido

Supongamos que estás trabajando en decisiones arquitectónicas complejas, bugs desafiantes, o planeando implementaciones de múltiples pasos que requieren razonamiento profundo.

<Steps>
  <Step title="Proporcionar contexto y pedir a Claude que piense">
    ```
    > I need to implement a new authentication system using OAuth2 for our API. Think deeply about the best approach for implementing this in our codebase.
    ```

    Claude recopilará información relevante de tu base de código y
    usará pensamiento extendido, que será visible en la interfaz.

  </Step>

  <Step title="Refinar el pensamiento con prompts de seguimiento">
    ```
    > think about potential security vulnerabilities in this approach
    ```

    ```
    > think harder about edge cases we should handle
    ```

  </Step>
</Steps>

<Tip>
  Consejos para obtener el máximo valor del pensamiento extendido:

El pensamiento extendido es más valioso para tareas complejas como:

- Planear cambios arquitectónicos complejos
- Depurar problemas intrincados
- Crear planes de implementación para nuevas características
- Entender bases de código complejas
- Evaluar compromisos entre diferentes enfoques

La forma en que solicitas pensamiento resulta en niveles variables de profundidad de pensamiento:

- "think" activa pensamiento extendido básico
- frases intensificadoras como "think more", "think a lot", "think harder", o "think longer" activan pensamiento más profundo

Para más consejos de prompting de pensamiento extendido, ver [Consejos de pensamiento extendido](/en/docs/build-with-claude/prompt-engineering/extended-thinking-tips).
</Tip>

<Note>
  Claude mostrará su proceso de pensamiento como texto gris en cursiva arriba de la
  respuesta.
</Note>

---

## Reanudar conversaciones previas

Supongamos que has estado trabajando en una tarea con Claude Code y necesitas continuar donde lo dejaste en una sesión posterior.

Claude Code proporciona dos opciones para reanudar conversaciones previas:

- `--continue` para continuar automáticamente la conversación más reciente
- `--resume` para mostrar un selector de conversaciones

<Steps>
  <Step title="Continuar la conversación más reciente">
    ```bash
    claude --continue
    ```

    Esto inmediatamente reanuda tu conversación más reciente sin prompts.

  </Step>

  <Step title="Continuar en modo no interactivo">
    ```bash
    claude --continue --print "Continue with my task"
    ```

    Usa `--print` con `--continue` para reanudar la conversación más reciente en modo no interactivo, perfecto para scripts o automatización.

  </Step>

  <Step title="Mostrar selector de conversaciones">
    ```bash
    claude --resume
    ```

    Esto muestra un selector de conversaciones interactivo mostrando:

    * Tiempo de inicio de conversación
    * Prompt inicial o resumen de conversación
    * Conteo de mensajes

    Usa flechas de dirección para navegar y presiona Enter para seleccionar una conversación.

  </Step>
</Steps>

<Tip>
  Consejos:

- El historial de conversaciones se almacena localmente en tu máquina
- Usa `--continue` para acceso rápido a tu conversación más reciente
- Usa `--resume` cuando necesites seleccionar una conversación pasada específica
- Al reanudar, verás todo el historial de conversación antes de continuar
- La conversación reanudada comienza con el mismo modelo y configuración que la original

Cómo funciona:

1. **Almacenamiento de Conversaciones**: Todas las conversaciones se guardan automáticamente localmente con su historial completo de mensajes
2. **Deserialización de Mensajes**: Al reanudar, todo el historial de mensajes se restaura para mantener contexto
3. **Estado de Herramientas**: El uso de herramientas y resultados de la conversación previa se preserva
4. **Restauración de Contexto**: La conversación reanuda con todo el contexto previo intacto

Ejemplos:

```bash
# Continuar conversación más reciente
claude --continue

# Continuar conversación más reciente con prompt específico
claude --continue --print "Show me our progress"

# Mostrar selector de conversaciones
claude --resume

# Continuar conversación más reciente en modo no interactivo
claude --continue --print "Run the tests again"
```

</Tip>

---

## Ejecutar sesiones paralelas de Claude Code con Git worktrees

Supongamos que necesitas trabajar en múltiples tareas simultáneamente con aislamiento completo de código entre instancias de Claude Code.

<Steps>
  <Step title="Entender Git worktrees">
    Los Git worktrees te permiten hacer checkout de múltiples ramas del mismo
    repositorio en directorios separados. Cada worktree tiene su propio directorio
    de trabajo con archivos aislados, mientras comparten la misma historia Git. Aprende
    más en la [documentación oficial Git worktree
    ](https://git-scm.com/docs/git-worktree).
  </Step>

  <Step title="Crear un nuevo worktree">
    ```bash
    # Crear un nuevo worktree con una nueva rama
    git worktree add ../project-feature-a -b feature-a

    # O crear un worktree con una rama existente
    git worktree add ../project-bugfix bugfix-123
    ```

    Esto crea un nuevo directorio con una copia de trabajo separada de tu repositorio.

  </Step>

  <Step title="Ejecutar Claude Code en cada worktree">
    ```bash
    # Navegar a tu worktree
    cd ../project-feature-a

    # Ejecutar Claude Code en este entorno aislado
    claude
    ```

  </Step>

  <Step title="Ejecutar Claude en otro worktree">
    ```bash
    cd ../project-bugfix
    claude
    ```
  </Step>

  <Step title="Gestionar tus worktrees">
    ```bash
    # Listar todos los worktrees
    git worktree list

    # Remover un worktree cuando termines
    git worktree remove ../project-feature-a
    ```

  </Step>
</Steps>

<Tip>
  Consejos:

- Cada worktree tiene su propio estado de archivos independiente, haciéndolo perfecto para sesiones paralelas de Claude Code
- Los cambios hechos en un worktree no afectarán otros, evitando que las instancias de Claude interfieran entre sí
- Todos los worktrees comparten la misma historia Git y conexiones remotas
- Para tareas de larga duración, puedes tener Claude trabajando en un worktree mientras continúas desarrollo en otro
- Usa nombres de directorio descriptivos para identificar fácilmente para qué tarea es cada worktree
- Recuerda inicializar tu entorno de desarrollo en cada nuevo worktree según la configuración de tu proyecto. Dependiendo de tu stack, esto podría incluir:
  _ Proyectos JavaScript: Ejecutar instalación de dependencias (`npm install`, `yarn`)
  _ Proyectos Python: Configurar entornos virtuales o instalar con gestores de paquetes \* Otros lenguajes: Seguir el proceso de configuración estándar de tu proyecto
  </Tip>

---

## Usar Claude como una utilidad estilo unix

### Agregar Claude a tu proceso de verificación

Supongamos que quieres usar Claude Code como linter o revisor de código.

**Agregar Claude a tu script de build:**

```json
// package.json
{
    ...
    "scripts": {
        ...
        "lint:claude": "claude -p 'you are a linter. please look at the changes vs. main and report any issues related to typos. report the filename and line number on one line, and a description of the issue on the second line. do not return any other text.'"
    }
}
```

<Tip>
  Consejos:

- Usa Claude para revisión automatizada de código en tu pipeline CI/CD
- Personaliza el prompt para verificar problemas específicos relevantes a tu proyecto
- Considera crear múltiples scripts para diferentes tipos de verificación
  </Tip>

### Pipe in, pipe out

Supongamos que quieres hacer pipe de datos a Claude, y obtener datos de vuelta en formato estructurado.

**Hacer pipe de datos a través de Claude:**

```bash
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt
```

<Tip>
  Consejos:

- Usa pipes para integrar Claude en scripts shell existentes
- Combina con otras herramientas Unix para flujos de trabajo poderosos
- Considera usar --output-format para salida estructurada
  </Tip>

### Controlar formato de salida

Supongamos que necesitas la salida de Claude en un formato específico, especialmente cuando integras Claude Code en scripts u otras herramientas.

<Steps>
  <Step title="Usar formato texto (predeterminado)">
    ```bash
    cat data.txt | claude -p 'summarize this data' --output-format text > summary.txt
    ```

    Esto emite solo la respuesta de texto plano de Claude (comportamiento predeterminado).

  </Step>

  <Step title="Usar formato JSON">
    ```bash
    cat code.py | claude -p 'analyze this code for bugs' --output-format json > analysis.json
    ```

    Esto emite un array JSON de mensajes con metadatos incluyendo costo y duración.

  </Step>

  <Step title="Usar formato JSON streaming">
    ```bash
    cat log.txt | claude -p 'parse this log file for errors' --output-format stream-json
    ```

    Esto emite una serie de objetos JSON en tiempo real mientras Claude procesa la solicitud. Cada mensaje es un objeto JSON válido, pero la salida completa no es JSON válido si se concatena.

  </Step>
</Steps>

<Tip>
  Consejos:

- Usa `--output-format text` para integraciones simples donde solo necesitas la respuesta de Claude
- Usa `--output-format json` cuando necesites el log completo de conversación
- Usa `--output-format stream-json` para salida en tiempo real de cada turno de conversación
  </Tip>

---

## Crear comandos slash personalizados

Claude Code soporta comandos slash personalizados que puedes crear para ejecutar rápidamente prompts o tareas específicas.

Para más detalles, ver la página de referencia [Comandos slash](/en/docs/claude-code/slash-commands).

### Crear comandos específicos del proyecto

Supongamos que quieres crear comandos slash reutilizables para tu proyecto que todos los miembros del equipo puedan usar.

<Steps>
  <Step title="Crear un directorio de comandos en tu proyecto">
    ```bash
    mkdir -p .claude/commands
    ```
  </Step>

  <Step title="Crear un archivo Markdown para cada comando">
    ```bash
    echo "Analyze the performance of this code and suggest three specific optimizations:" > .claude/commands/optimize.md
    ```
  </Step>

  <Step title="Usar tu comando personalizado en Claude Code">
    ```
    > /project:optimize
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Los nombres de comandos se derivan del nombre del archivo (ej., `optimize.md` se vuelve `/project:optimize`)
- Puedes organizar comandos en subdirectorios (ej., `.claude/commands/frontend/component.md` se vuelve `/project:frontend:component`)
- Los comandos de proyecto están disponibles para todos los que clonen el repositorio
- El contenido del archivo Markdown se vuelve el prompt enviado a Claude cuando se invoca el comando
  </Tip>

### Agregar argumentos de comando con \$ARGUMENTS

Supongamos que quieres crear comandos slash flexibles que puedan aceptar entrada adicional de usuarios.

<Steps>
  <Step title="Crear un archivo de comando con el placeholder $ARGUMENTS">
    ```bash
    echo "Find and fix issue #$ARGUMENTS. Follow these steps: 1.
    Understand the issue described in the ticket 2. Locate the relevant code in
    our codebase 3. Implement a solution that addresses the root cause 4. Add
    appropriate tests 5. Prepare a concise PR description" >
    .claude/commands/fix-issue.md
    ```
  </Step>

  <Step title="Usar el comando con un número de issue">
    En tu sesión Claude, usa el comando con argumentos.

    ```
    > /project:fix-issue 123
    ```

    Esto reemplazará \$ARGUMENTS con "123" en el prompt.

  </Step>
</Steps>

<Tip>
  Consejos:

- El placeholder \$ARGUMENTS se reemplaza con cualquier texto que siga al comando
- Puedes posicionar \$ARGUMENTS en cualquier lugar en tu template de comando
- Otras aplicaciones útiles: generar casos de test para funciones específicas, crear documentación para componentes, revisar código en archivos particulares, o traducir contenido a idiomas especificados
  </Tip>

### Crear comandos slash personales

Supongamos que quieres crear comandos slash personales que funcionen en todos tus proyectos.

<Steps>
  <Step title="Crear un directorio de comandos en tu carpeta home">
    ```bash
    mkdir -p ~/.claude/commands
    ```
  </Step>

  <Step title="Crear un archivo Markdown para cada comando">
    ```bash
    echo "Review this code for security vulnerabilities, focusing on:" >
    ~/.claude/commands/security-review.md
    ```
  </Step>

  <Step title="Usar tu comando personalizado personal">
    ```
    > /user:security-review
    ```
  </Step>
</Steps>

<Tip>
  Consejos:

- Los comandos personales tienen prefijo `/user:` en lugar de `/project:`
- Los comandos personales solo están disponibles para ti y no se comparten con tu equipo
- Los comandos personales funcionan en todos tus proyectos
- Puedes usar estos para flujos de trabajo consistentes a través de diferentes bases de código
  </Tip>

---

## Próximos pasos

<Card title="Implementación de referencia Claude Code" icon="code" href="https://github.com/anthropics/claude-code/tree/main/.devcontainer">
  Clona nuestra implementación de referencia de contenedor de desarrollo.
</Card>