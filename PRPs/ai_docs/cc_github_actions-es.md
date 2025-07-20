# Claude Code GitHub Actions

> Aprende sobre la integración de Claude Code en tu flujo de trabajo de desarrollo con Claude Code GitHub Actions

Claude Code GitHub Actions aporta automatización impulsada por IA a tu flujo de trabajo de GitHub. Con una simple mención `@claude` en cualquier PR o issue, Claude puede analizar tu código, crear pull requests, implementar funcionalidades y corregir bugs - todo mientras sigue los estándares de tu proyecto.

<Info>
  Claude Code GitHub Actions se encuentra actualmente en beta. Las funcionalidades pueden evolucionar mientras refinamos la experiencia.
</Info>

<Note>
  Claude Code GitHub Actions está construido sobre el [Claude Code SDK](/en/docs/claude-code/sdk), que habilita la integración programática de Claude Code en tus aplicaciones. Puedes usar el SDK para construir flujos de trabajo de automatización personalizados más allá de GitHub Actions.
</Note>

## ¿Por qué usar Claude Code GitHub Actions?

- **Creación instantánea de PR**: Describe lo que necesitas, y Claude crea un PR completo con todos los cambios necesarios
- **Implementación automatizada de código**: Convierte issues en código funcional con un solo comando
- **Sigue tus estándares**: Claude respeta tus pautas `CLAUDE.md` y patrones de código existentes
- **Configuración simple**: Comienza en minutos con nuestro instalador y clave API
- **Seguro por defecto**: Tu código permanece en los runners de GitHub

## ¿Qué puede hacer Claude?

Claude Code proporciona GitHub Actions poderosas que transforman cómo trabajas con código:

### Claude Code Action

Esta GitHub Action te permite ejecutar Claude Code dentro de tus flujos de trabajo de GitHub Actions. Puedes usar esto para construir cualquier flujo de trabajo personalizado sobre Claude Code.

[Ver repositorio →](https://github.com/anthropics/claude-code-action)

### Claude Code Action (Base)

La fundación para construir flujos de trabajo de GitHub personalizados con Claude. Este framework extensible te da acceso completo a las capacidades de Claude para crear automatización personalizada.

[Ver repositorio →](https://github.com/anthropics/claude-code-base-action)

## Configuración

## Configuración rápida

La forma más fácil de configurar esta action es a través de Claude Code en la terminal. Solo abre claude y ejecuta `/install-github-app`.

Este comando te guiará a través de la configuración de la app de GitHub y los secrets requeridos.

<Note>
  * Debes ser un administrador del repositorio para instalar la app de GitHub y añadir secrets
  * Este método de inicio rápido solo está disponible para usuarios directos de la API de Anthropic. Si estás usando AWS Bedrock o Google Vertex AI, por favor consulta la sección [Uso con AWS Bedrock y Google Vertex AI](#using-with-aws-bedrock-%26-google-vertex-ai).
</Note>

## Configuración manual

Si el comando `/install-github-app` falla o prefieres la configuración manual, por favor sigue estas instrucciones de configuración manual:

1. **Instala la app de GitHub Claude** en tu repositorio: [https://github.com/apps/claude](https://github.com/apps/claude)
2. **Añade ANTHROPIC_API_KEY** a los secrets de tu repositorio ([Aprende cómo usar secrets en GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions))
3. **Copia el archivo de workflow** desde [examples/claude.yml](https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml) en el directorio `.github/workflows/` de tu repositorio

<Tip>
  Después de completar la configuración rápida o manual, prueba la action etiquetando `@claude` en un comentario de issue o PR!
</Tip>

## Casos de uso de ejemplo

Claude Code GitHub Actions puede ayudarte con una variedad de tareas. Para ejemplos completos y funcionales, consulta el [directorio de ejemplos](https://github.com/anthropics/claude-code-action/tree/main/examples).

### Convertir issues en PRs

En un comentario de issue:

```
@claude implementa esta funcionalidad basada en la descripción del issue
```

Claude analizará el issue, escribirá el código y creará un PR para revisión.

### Obtener ayuda de implementación

En un comentario de PR:

```
@claude ¿cómo debería implementar autenticación de usuario para este endpoint?
```

Claude analizará tu código y proporcionará orientación específica de implementación.

### Corregir bugs rápidamente

En un issue:

```yaml
@claude corrige el TypeError en el componente del dashboard de usuario
```

Claude localizará el bug, implementará una solución y creará un PR.

## Mejores Prácticas

### Configuración CLAUDE.md

Crea un archivo `CLAUDE.md` en la raíz de tu repositorio para definir pautas de estilo de código, criterios de revisión, reglas específicas del proyecto y patrones preferidos. Este archivo guía el entendimiento de Claude sobre los estándares de tu proyecto.

### Consideraciones de seguridad

<Warning>
  ¡Nunca hagas commit de claves API directamente en tu repositorio!
</Warning>

Siempre usa GitHub Secrets para claves API:

- Añade tu clave API como un secret del repositorio llamado `ANTHROPIC_API_KEY`
- Refiérela en workflows: `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}`
- Limita los permisos de la action solo a lo necesario
- Revisa las sugerencias de Claude antes de hacer merge

Siempre usa GitHub Secrets (ej., `${{ secrets.ANTHROPIC_API_KEY }}`) en lugar de hardcodear claves API directamente en tus archivos de workflow.

### Optimizando el rendimiento

Usa templates de issue para proporcionar contexto, mantén tu `CLAUDE.md` conciso y enfocado, y configura timeouts apropiados para tus workflows.

### Costos de CI

Al usar Claude Code GitHub Actions, ten en cuenta los costos asociados:

**Costos de GitHub Actions:**

- Claude Code se ejecuta en runners hospedados por GitHub, que consumen tus minutos de GitHub Actions
- Consulta [la documentación de facturación de GitHub](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions) para precios detallados y límites de minutos

**Costos de API:**

- Cada interacción de Claude consume tokens de API basados en la longitud de prompts y respuestas
- El uso de tokens varía según la complejidad de la tarea y el tamaño de la base de código
- Consulta [la página de precios de Claude](https://www.anthropic.com/api) para tarifas actuales de tokens

**Tips de optimización de costos:**

- Usa comandos `@claude` específicos para reducir llamadas API innecesarias
- Configura límites `max_turns` apropiados para prevenir iteraciones excesivas
- Establece `timeout_minutes` razonables para evitar workflows descontrolados
- Considera usar controles de concurrencia de GitHub para limitar ejecuciones paralelas

## Ejemplos de configuración

Para configuraciones de workflow listas para usar para diferentes casos de uso, incluyendo:

- Configuración básica de workflow para comentarios de issue y PR
- Revisiones automatizadas de código en pull requests
- Implementaciones personalizadas para necesidades específicas

Visita el [directorio de ejemplos](https://github.com/anthropics/claude-code-action/tree/main/examples) en el repositorio Claude Code Action.

<Tip>
  El repositorio de ejemplos incluye workflows completos y probados que puedes copiar directamente en tu directorio `.github/workflows/`.
</Tip>

## Uso con AWS Bedrock y Google Vertex AI

Para entornos empresariales, puedes usar Claude Code GitHub Actions con tu propia infraestructura de nube. Este enfoque te da control sobre la residencia de datos y facturación mientras mantienes la misma funcionalidad.

### Prerrequisitos

Antes de configurar Claude Code GitHub Actions con proveedores de nube, necesitas:

#### Para Google Cloud Vertex AI:

1. Un Proyecto de Google Cloud con Vertex AI habilitado
2. Workload Identity Federation configurado para GitHub Actions
3. Una cuenta de servicio con los permisos requeridos
4. Una GitHub App (recomendado) o usar el GITHUB_TOKEN por defecto

#### Para AWS Bedrock:

1. Una cuenta AWS con Amazon Bedrock habilitado
2. Proveedor de Identidad OIDC de GitHub configurado en AWS
3. Un rol IAM con permisos de Bedrock
4. Una GitHub App (recomendado) o usar el GITHUB_TOKEN por defecto

<Steps>
  <Step title="Crear una GitHub App personalizada (Recomendado para Proveedores 3P)">
    Para mejor control y seguridad al usar proveedores 3P como Vertex AI o Bedrock, recomendamos crear tu propia GitHub App:

    1. Ve a [https://github.com/settings/apps/new](https://github.com/settings/apps/new)
    2. Completa la información básica:
       * **Nombre de GitHub App**: Elige un nombre único (ej., "YourOrg Claude Assistant")
       * **URL de Homepage**: El sitio web de tu organización o la URL del repositorio
    3. Configura los ajustes de la app:
       * **Webhooks**: Desmarcar "Active" (no necesario para esta integración)
    4. Establece los permisos requeridos:
       * **Permisos de repositorio**:
         * Contents: Read & Write
         * Issues: Read & Write
         * Pull requests: Read & Write
    5. Haz clic en "Create GitHub App"
    6. Después de la creación, haz clic en "Generate a private key" y guarda el archivo `.pem` descargado
    7. Anota tu App ID desde la página de configuración de la app
    8. Instala la app en tu repositorio:
       * Desde la página de configuración de tu app, haz clic en "Install App" en la barra lateral izquierda
       * Selecciona tu cuenta u organización
       * Elige "Only select repositories" y selecciona el repositorio específico
       * Haz clic en "Install"
    9. Añade la clave privada como un secret a tu repositorio:
       * Ve a Settings de tu repositorio → Secrets and variables → Actions
       * Crea un nuevo secret llamado `APP_PRIVATE_KEY` con el contenido del archivo `.pem`
    10. Añade el App ID como un secret:

    * Crea un nuevo secret llamado `APP_ID` con el ID de tu GitHub App

    <Note>
      Esta app se usará con la action [actions/create-github-app-token](https://github.com/actions/create-github-app-token) para generar tokens de autenticación en tus workflows.
    </Note>

    **Alternativa para API de Anthropic o si no quieres configurar tu propia Github app**: Usa la app oficial de Anthropic:

    1. Instala desde: [https://github.com/apps/claude](https://github.com/apps/claude)
    2. No se necesita configuración adicional para autenticación

  </Step>

  <Step title="Configurar autenticación del proveedor de nube">
    Elige tu proveedor de nube y configura autenticación segura:

    <AccordionGroup>
      <Accordion title="AWS Bedrock">
        **Configurar AWS para permitir que GitHub Actions se autentique de forma segura sin almacenar credenciales.**

        > **Nota de Seguridad**: Usa configuraciones específicas del repositorio y otorga solo los permisos mínimos requeridos.

        **Configuración Requerida**:

        1. **Habilitar Amazon Bedrock**:
           * Solicita acceso a modelos Claude en Amazon Bedrock
           * Para modelos cross-region, solicita acceso en todas las regiones requeridas

        2. **Configurar Proveedor de Identidad OIDC de GitHub**:
           * URL del proveedor: `https://token.actions.githubusercontent.com`
           * Audiencia: `sts.amazonaws.com`

        3. **Crear Rol IAM para GitHub Actions**:
           * Tipo de entidad confiable: Web identity
           * Proveedor de identidad: `token.actions.githubusercontent.com`
           * Permisos: política `AmazonBedrockFullAccess`
           * Configurar política de confianza para tu repositorio específico

        **Valores Requeridos**:

        Después de la configuración, necesitarás:

        * **AWS\_ROLE\_TO\_ASSUME**: El ARN del rol IAM que creaste

        <Tip>
          OIDC es más seguro que usar claves de acceso AWS estáticas porque las credenciales son temporales y se rotan automáticamente.
        </Tip>

        Consulta [la documentación de AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html) para instrucciones detalladas de configuración OIDC.
      </Accordion>

      <Accordion title="Google Vertex AI">
        **Configurar Google Cloud para permitir que GitHub Actions se autentique de forma segura sin almacenar credenciales.**

        > **Nota de Seguridad**: Usa configuraciones específicas del repositorio y otorga solo los permisos mínimos requeridos.

        **Configuración Requerida**:

        1. **Habilitar APIs** en tu proyecto de Google Cloud:
           * IAM Credentials API
           * Security Token Service (STS) API
           * Vertex AI API

        2. **Crear recursos de Workload Identity Federation**:
           * Crear un Workload Identity Pool
           * Añadir un proveedor OIDC de GitHub con:
             * Emisor: `https://token.actions.githubusercontent.com`
             * Mapeos de atributos para repositorio y propietario
             * **Recomendación de seguridad**: Usar condiciones de atributo específicas del repositorio

        3. **Crear una Cuenta de Servicio**:
           * Otorgar solo el rol `Vertex AI User`
           * **Recomendación de seguridad**: Crear una cuenta de servicio dedicada por repositorio

        4. **Configurar bindings IAM**:
           * Permitir al Workload Identity Pool impersonar la cuenta de servicio
           * **Recomendación de seguridad**: Usar conjuntos principales específicos del repositorio

        **Valores Requeridos**:

        Después de la configuración, necesitarás:

        * **GCP\_WORKLOAD\_IDENTITY\_PROVIDER**: El nombre completo del recurso del proveedor
        * **GCP\_SERVICE\_ACCOUNT**: La dirección de email de la cuenta de servicio

        <Tip>
          Workload Identity Federation elimina la necesidad de claves de cuenta de servicio descargables, mejorando la seguridad.
        </Tip>

        Para instrucciones detalladas de configuración, consulta la [documentación de Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation).
      </Accordion>
    </AccordionGroup>

  </Step>

  <Step title="Añadir Secrets Requeridos">
    Añade los siguientes secrets a tu repositorio (Settings → Secrets and variables → Actions):

    #### Para API de Anthropic (Directo):

    1. **Para Autenticación API**:
       * `ANTHROPIC_API_KEY`: Tu clave API de Anthropic desde [console.anthropic.com](https://console.anthropic.com)

    2. **Para GitHub App (si usas tu propia app)**:
       * `APP_ID`: El ID de tu GitHub App
       * `APP_PRIVATE_KEY`: El contenido de la clave privada (.pem)

    #### Para Google Cloud Vertex AI

    1. **Para Autenticación GCP**:
       * `GCP_WORKLOAD_IDENTITY_PROVIDER`
       * `GCP_SERVICE_ACCOUNT`

    2. **Para GitHub App (si usas tu propia app)**:
       * `APP_ID`: El ID de tu GitHub App
       * `APP_PRIVATE_KEY`: El contenido de la clave privada (.pem)

    #### Para AWS Bedrock

    1. **Para Autenticación AWS**:
       * `AWS_ROLE_TO_ASSUME`

    2. **Para GitHub App (si usas tu propia app)**:
       * `APP_ID`: El ID de tu GitHub App
       * `APP_PRIVATE_KEY`: El contenido de la clave privada (.pem)

  </Step>

  <Step title="Crear archivos de workflow">
    Crea archivos de workflow de GitHub Actions que se integren con tu proveedor de nube. Los ejemplos a continuación muestran configuraciones completas para AWS Bedrock y Google Vertex AI:

    <AccordionGroup>
      <Accordion title="Workflow de AWS Bedrock">
        **Prerrequisitos:**

        * Acceso a AWS Bedrock habilitado con permisos de modelo Claude
        * GitHub configurado como proveedor de identidad OIDC en AWS
        * Rol IAM con permisos de Bedrock que confía en GitHub Actions

        **Secrets de GitHub requeridos:**

        | Nombre del Secret    | Descripción                                       |
        | -------------------- | ------------------------------------------------- |
        | `AWS_ROLE_TO_ASSUME` | ARN del rol IAM para acceso a Bedrock            |
        | `APP_ID`             | Tu ID de GitHub App (desde configuración de app)            |
        | `APP_PRIVATE_KEY`    | La clave privada que generaste para tu GitHub App |

        ```yaml
        name: Claude PR Action

        permissions:
          contents: write
          pull-requests: write
          issues: write
          id-token: write

        on:
          issue_comment:
            types: [created]
          pull_request_review_comment:
            types: [created]
          issues:
            types: [opened, assigned]

        jobs:
          claude-pr:
            if: |
              (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
              (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
              (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
            runs-on: ubuntu-latest
            env:
              AWS_REGION: us-west-2
            steps:
              - name: Checkout repository
                uses: actions/checkout@v4

              - name: Generate GitHub App token
                id: app-token
                uses: actions/create-github-app-token@v2
                with:
                  app-id: ${{ secrets.APP_ID }}
                  private-key: ${{ secrets.APP_PRIVATE_KEY }}

              - name: Configure AWS Credentials (OIDC)
                uses: aws-actions/configure-aws-credentials@v4
                with:
                  role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
                  aws-region: us-west-2

              - uses: ./.github/actions/claude-pr-action
                with:
                  trigger_phrase: "@claude"
                  timeout_minutes: "60"
                  github_token: ${{ steps.app-token.outputs.token }}
                  use_bedrock: "true"
                  model: "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
        ```

        <Tip>
          El formato del ID de modelo para Bedrock incluye el prefijo de región (ej., `us.anthropic.claude...`) y sufijo de versión.
        </Tip>
      </Accordion>

      <Accordion title="Workflow de Google Vertex AI">
        **Prerrequisitos:**

        * API de Vertex AI habilitada en tu proyecto GCP
        * Workload Identity Federation configurado para GitHub
        * Cuenta de servicio con permisos de Vertex AI

        **Secrets de GitHub requeridos:**

        | Nombre del Secret                | Descripción                                       |
        | -------------------------------- | ------------------------------------------------- |
        | `GCP_WORKLOAD_IDENTITY_PROVIDER` | Nombre del recurso del proveedor de workload identity          |
        | `GCP_SERVICE_ACCOUNT`            | Email de cuenta de servicio con acceso a Vertex AI       |
        | `APP_ID`                         | Tu ID de GitHub App (desde configuración de app)            |
        | `APP_PRIVATE_KEY`                | La clave privada que generaste para tu GitHub App |

        ```yaml
        name: Claude PR Action

        permissions:
          contents: write
          pull-requests: write
          issues: write
          id-token: write

        on:
          issue_comment:
            types: [created]
          pull_request_review_comment:
            types: [created]
          issues:
            types: [opened, assigned]

        jobs:
          claude-pr:
            if: |
              (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
              (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
              (github.event_name == 'issues' && contains(github.event.issue.body, '@claude'))
            runs-on: ubuntu-latest
            steps:
              - name: Checkout repository
                uses: actions/checkout@v4

              - name: Generate GitHub App token
                id: app-token
                uses: actions/create-github-app-token@v2
                with:
                  app-id: ${{ secrets.APP_ID }}
                  private-key: ${{ secrets.APP_PRIVATE_KEY }}

              - name: Authenticate to Google Cloud
                id: auth
                uses: google-github-actions/auth@v2
                with:
                  workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
                  service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

              - uses: ./.github/actions/claude-pr-action
                with:
                  trigger_phrase: "@claude"
                  timeout_minutes: "60"
                  github_token: ${{ steps.app-token.outputs.token }}
                  use_vertex: "true"
                  model: "claude-3-7-sonnet@20250219"
                env:
                  ANTHROPIC_VERTEX_PROJECT_ID: ${{ steps.auth.outputs.project_id }}
                  CLOUD_ML_REGION: us-east5
                  VERTEX_REGION_CLAUDE_3_7_SONNET: us-east5
        ```

        <Tip>
          El ID del proyecto se obtiene automáticamente del paso de autenticación de Google Cloud, por lo que no necesitas hardcodearlo.
        </Tip>
      </Accordion>
    </AccordionGroup>

  </Step>
</Steps>

## Resolución de Problemas

### Claude no responde a comandos @claude

Verifica que la GitHub App esté instalada correctamente, comprueba que los workflows estén habilitados, asegúrate de que la clave API esté configurada en los secrets del repositorio, y confirma que el comentario contiene `@claude` (no `/claude`).

### CI no se ejecuta en los commits de Claude

Asegúrate de estar usando la GitHub App o app personalizada (no el usuario Actions), verifica que los triggers del workflow incluyan los eventos necesarios, y verifica que los permisos de la app incluyan triggers de CI.

### Errores de autenticación

Confirma que la clave API es válida y tiene permisos suficientes. Para Bedrock/Vertex, verifica la configuración de credenciales y asegúrate de que los secrets estén nombrados correctamente en los workflows.

## Configuración avanzada

### Parámetros de la action

La Claude Code Action soporta estos parámetros clave:

| Parámetro           | Descripción                    | Requerido |
| ------------------- | ------------------------------ | --------- |
| `prompt`            | El prompt para enviar a Claude   | Sí\*    |
| `prompt_file`       | Ruta al archivo que contiene el prompt | Sí\*    |
| `anthropic_api_key` | Clave API de Anthropic              | Sí\*\*  |
| `max_turns`         | Máximo de turnos de conversación     | No       |
| `timeout_minutes`   | Timeout de ejecución              | No       |

\*Se requiere `prompt` o `prompt_file`\
\*\*Requerido para API directa de Anthropic, no para Bedrock/Vertex

### Métodos alternativos de integración

Aunque el comando `/install-github-app` es el enfoque recomendado, también puedes:

- **GitHub App Personalizada**: Para organizaciones que necesitan nombres de usuario branded o flujos de autenticación personalizados. Crea tu propia GitHub App con permisos requeridos (contents, issues, pull requests) y usa la action actions/create-github-app-token para generar tokens en tus workflows.
- **GitHub Actions Manuales**: Configuración directa de workflow para máxima flexibilidad
- **Configuración MCP**: Carga dinámica de servidores Model Context Protocol

Consulta el [repositorio Claude Code Action](https://github.com/anthropics/claude-code-action) para documentación detallada.

### Personalizando el comportamiento de Claude

Puedes configurar el comportamiento de Claude de dos maneras:

1. **CLAUDE.md**: Define estándares de codificación, criterios de revisión y reglas específicas del proyecto en un archivo `CLAUDE.md` en la raíz de tu repositorio. Claude seguirá estas pautas al crear PRs y responder a solicitudes. Consulta nuestra [documentación de Memory](/en/docs/claude-code/memory) para más detalles.
2. **Prompts personalizados**: Usa el parámetro `prompt` en el archivo de workflow para proporcionar instrucciones específicas del workflow. Esto te permite personalizar el comportamiento de Claude para diferentes workflows o tareas.

Claude seguirá estas pautas al crear PRs y responder a solicitudes.