# Visión general de implementación empresarial

> Aprende cómo Claude Code puede integrarse con varios servicios de terceros e infraestructura para cumplir con requisitos de implementación empresarial.

Esta página proporciona una visión general de opciones de implementación disponibles y te ayuda a elegir la configuración correcta para tu organización.

## Comparación de proveedores

<table>
  <thead>
    <tr>
      <th>Característica</th>
      <th>Anthropic</th>
      <th>Amazon Bedrock</th>
      <th>Google Vertex AI</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>Regiones</td>
      <td>[Países](https://www.anthropic.com/supported-countries) soportados</td>
      <td>Múltiples [regiones](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html) AWS</td>
      <td>Múltiples [regiones](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations) GCP</td>
    </tr>

    <tr>
      <td>Caché de prompts</td>
      <td>Habilitado por defecto</td>
      <td>Habilitado por defecto</td>
      <td>Contactar Google para habilitación</td>
    </tr>

    <tr>
      <td>Autenticación</td>
      <td>Clave API</td>
      <td>Credenciales AWS (IAM)</td>
      <td>Credenciales GCP (OAuth/Service Account)</td>
    </tr>

    <tr>
      <td>Seguimiento de costos</td>
      <td>Dashboard</td>
      <td>AWS Cost Explorer</td>
      <td>GCP Billing</td>
    </tr>

    <tr>
      <td>Características empresariales</td>
      <td>Equipos, monitoreo de uso</td>
      <td>Políticas IAM, CloudTrail</td>
      <td>Roles IAM, Cloud Audit Logs</td>
    </tr>

  </tbody>
</table>

## Proveedores de nube

<CardGroup cols={2}>
  <Card title="Amazon Bedrock" icon="aws" href="/en/docs/claude-code/amazon-bedrock">
    Usar modelos Claude a través de infraestructura AWS con autenticación basada en IAM y monitoreo nativo de AWS
  </Card>

  <Card title="Google Vertex AI" icon="google" href="/en/docs/claude-code/google-vertex-ai">
    Acceder a modelos Claude vía Google Cloud Platform con seguridad y cumplimiento de nivel empresarial
  </Card>
</CardGroup>

## Infraestructura corporativa

<CardGroup cols={2}>
  <Card title="Proxy Corporativo" icon="shield" href="/en/docs/claude-code/corporate-proxy">
    Configurar Claude Code para funcionar con servidores proxy de tu organización y requisitos SSL/TLS
  </Card>

  <Card title="LLM Gateway" icon="server" href="/en/docs/claude-code/llm-gateway">
    Implementar acceso centralizado a modelos con seguimiento de uso, presupuestos y logging de auditoría
  </Card>
</CardGroup>

## Visión general de configuración

Claude Code soporta opciones de configuración flexibles que te permiten combinar diferentes proveedores e infraestructura:

<Note>
  Entiende la diferencia entre:

- **Proxy corporativo**: Un proxy HTTP/HTTPS para enrutar tráfico (establecido vía `HTTPS_PROXY` o `HTTP_PROXY`)
- **LLM Gateway**: Un servicio que maneja autenticación y proporciona endpoints compatibles con proveedores (establecido vía `ANTHROPIC_BASE_URL`, `ANTHROPIC_BEDROCK_BASE_URL`, o `ANTHROPIC_VERTEX_BASE_URL`)

Ambas configuraciones pueden usarse en conjunto.
</Note>

### Usar Bedrock con proxy corporativo

Enrutar tráfico Bedrock a través de un proxy HTTP/HTTPS corporativo:

```bash
# Habilitar Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Configurar proxy corporativo
export HTTPS_PROXY='https://proxy.example.com:8080'
```

### Usar Bedrock con LLM Gateway

Usar un servicio gateway que proporciona endpoints compatibles con Bedrock:

```bash
# Habilitar Bedrock
export CLAUDE_CODE_USE_BEDROCK=1

# Configurar LLM gateway
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # Si gateway maneja auth AWS
```

### Usar Vertex AI con proxy corporativo

Enrutar tráfico Vertex AI a través de un proxy HTTP/HTTPS corporativo:

```bash
# Habilitar Vertex
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# Configurar proxy corporativo
export HTTPS_PROXY='https://proxy.example.com:8080'
```

### Usar Vertex AI con LLM Gateway

Combinar modelos Google Vertex AI con un LLM gateway para gestión centralizada:

```bash
# Habilitar Vertex
export CLAUDE_CODE_USE_VERTEX=1

# Configurar LLM gateway
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1  # Si gateway maneja auth GCP
```

### Configuración de autenticación

Claude Code usa `ANTHROPIC_AUTH_TOKEN` para headers `Authorization` y `Proxy-Authorization` cuando es necesario. Las banderas `SKIP_AUTH` (`CLAUDE_CODE_SKIP_BEDROCK_AUTH`, `CLAUDE_CODE_SKIP_VERTEX_AUTH`) se usan en escenarios LLM gateway donde el gateway maneja autenticación del proveedor.

## Elegir la configuración de implementación correcta

Considera estos factores al seleccionar tu enfoque de implementación:

### Acceso directo al proveedor

Mejor para organizaciones que:

- Quieren la configuración más simple
- Tienen infraestructura AWS o GCP existente
- Necesitan monitoreo y cumplimiento nativo del proveedor

### Proxy corporativo

Mejor para organizaciones que:

- Tienen requisitos de proxy corporativo existentes
- Necesitan monitoreo de tráfico y cumplimiento
- Deben enrutar todo el tráfico a través de rutas de red específicas

### LLM Gateway

Mejor para organizaciones que:

- Necesitan seguimiento de uso entre equipos
- Quieren cambiar dinámicamente entre modelos
- Requieren limitación de tasa personalizada o presupuestos
- Necesitan gestión de autenticación centralizada

## Depuración

Al depurar tu implementación:

- Usar el [comando slash](/en/docs/claude-code/slash-commands) `claude /status`. Este comando proporciona observabilidad de cualquier configuración de autenticación, proxy, y URL aplicada.
- Establecer variable de entorno `export ANTHROPIC_LOG=debug` para registrar solicitudes.

## Mejores prácticas para organizaciones

1. Recomendamos fuertemente invertir en documentación para que Claude Code entienda tu base de código. Muchas organizaciones hacen un archivo `CLAUDE.md` (que también referimos como memoria) en la raíz del repositorio que contiene la arquitectura del sistema, cómo ejecutar tests y otros comandos comunes, y mejores prácticas para contribuir a la base de código. Este archivo típicamente se registra en control de fuente para que todos los usuarios puedan beneficiarse de él. [Aprende más](/en/docs/claude-code/memory).
2. Si tienes un entorno de desarrollo personalizado, encontramos que crear una forma "un clic" para instalar Claude Code es clave para hacer crecer la adopción a través de una organización.
3. Anima a nuevos usuarios a probar Claude Code para Q&A de base de código, o en correcciones de bugs más pequeñas o solicitudes de características. Pide a Claude Code que haga un plan. Revisa las sugerencias de Claude y da retroalimentación si está fuera de rumbo. Con el tiempo, conforme los usuarios entiendan mejor este nuevo paradigma, entonces serán más efectivos dejando que Claude Code ejecute más agénticamente.
4. Los equipos de seguridad pueden configurar permisos gestionados para lo que Claude Code puede y no puede hacer, que no pueden ser sobrescritos por configuración local. [Aprende más](/en/docs/claude-code/security).
5. MCP es una gran forma de darle a Claude Code más información, como conectar a sistemas de gestión de tickets o logs de error. Recomendamos que un equipo central configure servidores MCP y registre una configuración `.mcp.json` en la base de código para que todos los usuarios se beneficien. [Aprende más](/en/docs/claude-code/mcp).

En Anthropic, confiamos en Claude Code para potenciar desarrollo a través de cada base de código de Anthropic. ¡Esperamos que disfrutes usar Claude Code tanto como nosotros!

## Próximos pasos

- [Configurar Amazon Bedrock](/en/docs/claude-code/amazon-bedrock) para implementación nativa AWS
- [Configurar Google Vertex AI](/en/docs/claude-code/google-vertex-ai) para implementación GCP
- [Implementar Proxy Corporativo](/en/docs/claude-code/corporate-proxy) para requisitos de red
- [Implementar LLM Gateway](/en/docs/claude-code/llm-gateway) para gestión empresarial
- [Configuraciones](/en/docs/claude-code/settings) para opciones de configuración y variables de entorno

# Claude Code en Amazon Bedrock

> Aprende sobre configurar Claude Code a través de Amazon Bedrock, incluyendo configuración, configuración IAM, y resolución de problemas.

## Prerrequisitos

Antes de configurar Claude Code con Bedrock, asegúrate de tener:

- Una cuenta AWS con acceso Bedrock habilitado
- Acceso a modelos Claude deseados (ej. Claude Sonnet 4) en Bedrock
- AWS CLI instalado y configurado (opcional - solo necesario si no tienes otro mecanismo para obtener credenciales)
- Permisos IAM apropiados

## Configuración

### 1. Habilitar acceso al modelo

Primero, asegúrate de tener acceso a los modelos Claude requeridos en tu cuenta AWS:

1. Navegar a la [consola Amazon Bedrock](https://console.aws.amazon.com/bedrock/)
2. Ir a **Model access** en la navegación izquierda
3. Solicitar acceso a modelos Claude deseados (ej. Claude Sonnet 4)
4. Esperar aprobación (usualmente instantánea para la mayoría de regiones)

### 2. Configurar credenciales AWS

Claude Code usa la cadena de credenciales por defecto del AWS SDK. Configura tus credenciales usando uno de estos métodos:

<Note>
  Claude Code actualmente no soporta gestión de credenciales dinámicas (como llamar automáticamente `aws sts assume-role`). Necesitarás ejecutar `aws configure`, `aws sso login`, o establecer las variables de entorno `AWS_` tú mismo.
</Note>

**Opción A: Configuración AWS CLI**

```bash
aws configure
```

**Opción B: Variables de entorno (clave de acceso)**

```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token
```

**Opción C: Variables de entorno (perfil SSO)**

```bash
aws sso login --profile=<your-profile-name>

export AWS_PROFILE=your-profile-name
```

### 3. Configurar Claude Code

Establecer las siguientes variables de entorno para habilitar Bedrock:

```bash
# Habilitar integración Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1  # o tu región preferida
```

<Note>
  `AWS_REGION` es una variable de entorno requerida. Claude Code no lee del archivo de configuración `.aws` para esta configuración.
</Note>

### 4. Configuración de modelo

Claude Code usa estos modelos por defecto para Bedrock:

| Tipo de modelo       | Valor por defecto                                  |
| :--------------- | :--------------------------------------------- |
| Modelo primario    | `us.anthropic.claude-3-7-sonnet-20250219-v1:0` |
| Modelo pequeño/rápido | `us.anthropic.claude-3-5-haiku-20241022-v1:0`  |

Para personalizar modelos, usar uno de estos métodos:

```bash
# Usando ID de perfil de inferencia
export ANTHROPIC_MODEL='us.anthropic.claude-opus-4-20250514-v1:0'
export ANTHROPIC_SMALL_FAST_MODEL='us.anthropic.claude-3-5-haiku-20241022-v1:0'

# Usando ARN de perfil de inferencia de aplicación
export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:your-account-id:application-inference-profile/your-model-id'
```

## Configuración IAM

Crear una política IAM con los permisos requeridos para Claude Code.

Para detalles, ver [documentación IAM Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html).

<Note>
  Recomendamos crear una cuenta AWS dedicada para Claude Code para simplificar seguimiento de costos y control de acceso.
</Note>

## Resolución de problemas

Si encuentras problemas de región:

- Verificar disponibilidad de modelo: `aws bedrock list-inference-profiles --region your-region`
- Cambiar a una región soportada: `export AWS_REGION=us-east-1`
- Considerar usar perfiles de inferencia para acceso entre regiones

Si recibes un error "on-demand throughput isn't supported":

- Especificar el modelo como un ID de [perfil de inferencia](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)

## Recursos adicionales

- [Documentación Bedrock](https://docs.aws.amazon.com/bedrock/)
- [Precios Bedrock](https://aws.amazon.com/bedrock/pricing/)
- [Perfiles de inferencia Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
- [Claude Code en Amazon Bedrock: Guía de Configuración Rápida](https://community.aws/content/2tXkZKrZzlrlu0KfH8gST5Dkppq/claude-code-on-amazon-bedrock-quick-setup-guide)

# Claude Code en Google Vertex AI

> Aprende sobre configurar Claude Code a través de Google Vertex AI, incluyendo configuración, configuración IAM, y resolución de problemas.

## Prerrequisitos

Antes de configurar Claude Code con Vertex AI, asegúrate de tener:

- Una cuenta Google Cloud Platform (GCP) con facturación habilitada
- Un proyecto GCP con API Vertex AI habilitada
- Acceso a modelos Claude deseados (ej. Claude Sonnet 4)
- Google Cloud SDK (`gcloud`) instalado y configurado
- Cuota asignada en región GCP deseada

<Warning>
  Vertex AI podría no soportar los modelos por defecto de Claude Code en regiones no-`us-east5`. Asegúrate de estar usando `us-east5` y tener cuota asignada, o cambiar a modelos soportados.
</Warning>

## Configuración

### 1. Habilitar API Vertex AI

Habilitar la API Vertex AI en tu proyecto GCP:

```bash
# Establecer tu ID de proyecto
gcloud config set project YOUR-PROJECT-ID

# Habilitar API Vertex AI
gcloud services enable aiplatform.googleapis.com
```

### 2. Solicitar acceso al modelo

Solicitar acceso a modelos Claude en Vertex AI:

1. Navegar al [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)
2. Buscar modelos "Claude"
3. Solicitar acceso a modelos Claude deseados (ej. Claude Sonnet 4)
4. Esperar aprobación (puede tomar 24-48 horas)

### 3. Configurar credenciales GCP

Claude Code usa autenticación estándar de Google Cloud.

Para más información, ver [documentación de autenticación Google Cloud](https://cloud.google.com/docs/authentication).

### 4. Configurar Claude Code

Establecer las siguientes variables de entorno:

```bash
# Habilitar integración Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID

# Opcional: Deshabilitar caché de prompts si es necesario
export DISABLE_PROMPT_CACHING=1
```

<Note>
  [Caché de prompts](/en/docs/build-with-claude/prompt-caching) se soporta automáticamente cuando especificas la bandera efímera `cache_control`. Para deshabilitarlo, establecer `DISABLE_PROMPT_CACHING=1`. Para límites de tasa elevados, contactar soporte Google Cloud.
</Note>

### 5. Configuración de modelo

Claude Code usa estos modelos por defecto para Vertex AI:

| Tipo de modelo       | Valor por defecto               |
| :--------------- | :-------------------------- |
| Modelo primario    | `claude-sonnet-4@20250514`  |
| Modelo pequeño/rápido | `claude-3-5-haiku@20241022` |

Para personalizar modelos:

```bash
export ANTHROPIC_MODEL='claude-opus-4@20250514'
export ANTHROPIC_SMALL_FAST_MODEL='claude-3-5-haiku@20241022'
```

## Configuración IAM

Otorgar los roles IAM requeridos para Claude Code.

Para detalles, ver [documentación IAM Vertex](https://cloud.google.com/vertex-ai/docs/general/access-control).

<Note>
  Recomendamos crear un proyecto GCP dedicado para Claude Code para simplificar seguimiento de costos y control de acceso.
</Note>

## Resolución de problemas

Si encuentras problemas de cuota:

- Verificar cuotas actuales o solicitar aumento de cuota a través de [Cloud Console](https://cloud.google.com/docs/quotas/view-manage)

Si encuentras errores 404 "model not found":

- Verificar que tienes acceso a la región especificada
- Confirmar que el modelo está Habilitado en [Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)

Si encuentras errores 429:

- Asegurar que el modelo primario y modelo pequeño/rápido están soportados en tu región seleccionada

## Recursos adicionales

- [Documentación Vertex AI](https://cloud.google.com/vertex-ai/docs)
- [Precios Vertex AI](https://cloud.google.com/vertex-ai/pricing)
- [Cuotas y límites Vertex AI](https://cloud.google.com/vertex-ai/docs/quotas)

# Configuración de proxy corporativo

> Aprende cómo configurar Claude Code para funcionar con servidores proxy corporativos, incluyendo configuración de variables de entorno, autenticación, y manejo de certificados SSL/TLS.

Claude Code soporta configuraciones estándar de proxy HTTP/HTTPS a través de variables de entorno. Esto te permite enrutar todo el tráfico de Claude Code a través de servidores proxy de tu organización para propósitos de seguridad, cumplimiento y monitoreo.

## Configuración básica de proxy

### Variables de entorno

Claude Code respeta variables de entorno de proxy estándar:

```bash
# Proxy HTTPS (recomendado)
export HTTPS_PROXY=https://proxy.example.com:8080

# Proxy HTTP (si HTTPS no está disponible)
export HTTP_PROXY=http://proxy.example.com:8080
```

<Note>
  Claude Code actualmente no soporta la variable de entorno `NO_PROXY`. Todo el tráfico será enrutado a través del proxy configurado.
</Note>

<Note>
  Claude Code no soporta proxies SOCKS.
</Note>

## Autenticación

### Autenticación básica

Si tu proxy requiere autenticación básica, incluye credenciales en la URL del proxy:

```bash
export HTTPS_PROXY=http://username:password@proxy.example.com:8080
```

<Warning>
  Evita hardcodear contraseñas en scripts. Usa variables de entorno o almacenamiento seguro de credenciales en su lugar.
</Warning>

<Tip>
  Para proxies que requieren autenticación avanzada (NTLM, Kerberos, etc.), considera usar un servicio LLM Gateway que soporte tu método de autenticación.
</Tip>

### Problemas de certificado SSL

Si tu proxy usa certificados SSL personalizados, puedes encontrar errores de certificado.

Asegúrate de establecer la ruta correcta del bundle de certificados:

```bash
export SSL_CERT_FILE=/path/to/certificate-bundle.crt
export NODE_EXTRA_CA_CERTS=/path/to/certificate-bundle.crt
```

## Requisitos de acceso de red

Claude Code requiere acceso a las siguientes URLs:

- `api.anthropic.com` - Endpoints API Claude
- `statsig.anthropic.com` - Telemetría y métricas
- `sentry.io` - Reporte de errores

Asegúrate de que estas URLs estén en lista blanca en tu configuración de proxy y reglas de firewall. Esto es especialmente importante cuando uses Claude Code en entornos containerizados o de red restringida.

## Recursos adicionales

- [Configuraciones Claude Code](/en/docs/claude-code/settings)
- [Referencia de variables de entorno](/en/docs/claude-code/settings#environment-variables)
- [Guía de resolución de problemas](/en/docs/claude-code/troubleshooting)

# Configuración de LLM gateway

> Aprende cómo configurar Claude Code con soluciones LLM gateway, incluyendo configuración LiteLLM, métodos de autenticación, y características empresariales como seguimiento de uso y gestión de presupuestos.

Los LLM gateways proporcionan una capa proxy centralizada entre Claude Code y proveedores de modelos, ofreciendo:

- **Autenticación centralizada** - Punto único para gestión de claves API
- **Seguimiento de uso** - Monitorear uso entre equipos y proyectos
- **Controles de costo** - Implementar presupuestos y límites de tasa
- **Logging de auditoría** - Rastrear todas las interacciones de modelo para cumplimiento
- **Enrutamiento de modelo** - Cambiar entre proveedores sin cambios de código

## Configuración LiteLLM

<Note>
  LiteLLM es un servicio proxy de terceros. Anthropic no respalda, mantiene, o audita la seguridad o funcionalidad de LiteLLM. Esta guía se proporciona con propósitos informativos y puede volverse desactualizada. Usar bajo tu propia discreción.
</Note>

### Prerrequisitos

- Claude Code actualizado a la versión más reciente
- LiteLLM Proxy Server implementado y accesible
- Acceso a modelos Claude a través de tu proveedor elegido

### Configuración básica LiteLLM

**Configurar Claude Code**:

#### Métodos de autenticación

##### Clave API estática

Método más simple usando una clave API fija:

```bash
# Establecer en entorno
export ANTHROPIC_AUTH_TOKEN=sk-litellm-static-key

# O en configuraciones Claude Code
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-litellm-static-key"
  }
}
```

Este valor se enviará como headers `Authorization` y `Proxy-Authorization`, aunque `Authorization` puede ser sobrescrito (ver Vertex "Client-specified credentials" abajo).

##### Clave API dinámica con helper

Para claves rotatorias o autenticación por usuario:

1. Crear un script helper de clave API:

```bash
#!/bin/bash
# ~/bin/get-litellm-key.sh

# Ejemplo: Obtener clave de vault
vault kv get -field=api_key secret/litellm/claude-code

# Ejemplo: Generar token JWT
jwt encode \
  --secret="${JWT_SECRET}" \
  --exp="+1h" \
  '{"user":"'${USER}'","team":"engineering"}'
```

2. Configurar configuraciones Claude Code para usar el helper:

```json
{
  "apiKeyHelper": "~/bin/get-litellm-key.sh"
}
```

3. Establecer intervalo de actualización de token:

```bash
# Actualizar cada hora (3600000 ms)
export CLAUDE_CODE_API_KEY_HELPER_TTL_MS=3600000
```

Este valor se enviará como headers `Authorization`, `Proxy-Authorization`, y `X-Api-Key`, aunque `Authorization` puede ser sobrescrito (ver [Google Vertex AI a través de LiteLLM](#google-vertex-ai-through-litellm)). El `apiKeyHelper` tiene menor precedencia que `ANTHROPIC_AUTH_TOKEN` o `ANTHROPIC_API_KEY`.

#### Endpoint unificado (recomendado)

Usando el [endpoint formato Anthropic](https://docs.litellm.ai/docs/anthropic_unified) de LiteLLM:

```bash
export ANTHROPIC_BASE_URL=https://litellm-server:4000
```

**Beneficios del endpoint unificado sobre endpoints pass-through:**

- Balanceo de carga
- Fallbacks
- Soporte consistente para seguimiento de costos y seguimiento de usuario final

#### Endpoints pass-through específicos del proveedor (alternativa)

##### API Anthropic a través de LiteLLM

Usando [endpoint pass-through](https://docs.litellm.ai/docs/pass_through/anthropic_completion):

```bash
export ANTHROPIC_BASE_URL=https://litellm-server:4000/anthropic
```

##### Amazon Bedrock a través de LiteLLM

Usando [endpoint pass-through](https://docs.litellm.ai/docs/pass_through/bedrock):

```bash
export ANTHROPIC_BEDROCK_BASE_URL=https://litellm-server:4000/bedrock
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1
export CLAUDE_CODE_USE_BEDROCK=1
```

##### Google Vertex AI a través de LiteLLM

Usando [endpoint pass-through](https://docs.litellm.ai/docs/pass_through/vertex_ai):

**Recomendado: Credenciales especificadas por proxy**

```bash
export ANTHROPIC_VERTEX_BASE_URL=https://litellm-server:4000/vertex_ai/v1
export ANTHROPIC_VERTEX_PROJECT_ID=your-gcp-project-id
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
```

**Alternativa: Credenciales especificadas por cliente**

Si prefieres usar credenciales GCP locales:

1. Autenticar con GCP localmente:

```bash
gcloud auth application-default login
```

2. Establecer entorno Claude Code:

```bash
export ANTHROPIC_VERTEX_BASE_URL=https://litellm-server:4000/vertex_ai/v1
export ANTHROPIC_VERTEX_PROJECT_ID=your-gcp-project-id
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
```

3. Actualizar configuración de header LiteLLM:

Asegurar que tu configuración LiteLLM tenga `general_settings.litellm_key_header_name` establecido a `Proxy-Authorization`, ya que el token GCP pass-through estará ubicado en el header `Authorization`.

### Selección de modelo

Por defecto, los modelos usarán aquellos especificados en [Configuración de modelo](/en/docs/claude-code/bedrock-vertex-proxies#model-configuration).

Si has configurado nombres de modelo personalizados en LiteLLM, establecer las variables de entorno mencionadas anteriormente a esos nombres personalizados.

Para información más detallada, referirse a la [documentación LiteLLM](https://docs.litellm.ai/).

## Recursos adicionales

- [Documentación LiteLLM](https://docs.litellm.ai/)
- [Configuraciones Claude Code](/en/docs/claude-code/settings)
- [Configuración proxy corporativo](/en/docs/claude-code/corporate-proxy)
- [Visión general integraciones de terceros](/en/docs/claude-code/third-party-integrations)

# Contenedores de desarrollo

> Aprende sobre el contenedor de desarrollo Claude Code para equipos que necesitan entornos consistentes y seguros.

La [configuración devcontainer](https://code.visualstudio.com/docs/devcontainers/containers) preconfigurada funciona perfectamente con la extensión Remote - Containers de VS Code y herramientas similares.

Las medidas de seguridad mejoradas del contenedor (aislamiento y reglas de firewall) te permiten ejecutar `claude --dangerously-skip-permissions` para omitir prompts de permisos para operación desatendida. Hemos incluido una [implementación de referencia](https://github.com/anthropics/claude-code/tree/main/.devcontainer) que puedes personalizar para tus necesidades.

<Warning>
  Mientras el devcontainer proporciona protecciones sustanciales, ningún sistema es
  completamente inmune a todos los ataques. Siempre mantén buenas prácticas de seguridad y
  monitorea las actividades de Claude.
</Warning>

## Características clave

- **Node.js listo para producción**: Construido en Node.js 20 con dependencias de desarrollo esenciales
- **Seguridad por diseño**: Firewall personalizado que restringe acceso de red solo a servicios necesarios
- **Herramientas amigables para desarrolladores**: Incluye git, ZSH con mejoras de productividad, fzf, y más
- **Integración perfecta VS Code**: Extensiones preconfiguradas y configuraciones optimizadas
- **Persistencia de sesión**: Preserva historial de comandos y configuraciones entre reinicios de contenedor
- **Funciona en todas partes**: Compatible con entornos de desarrollo macOS, Windows, y Linux

## Empezando en 4 pasos

1. Instalar VS Code y la extensión Remote - Containers
2. Clonar el repositorio [implementación de referencia Claude Code](https://github.com/anthropics/claude-code/tree/main/.devcontainer)
3. Abrir el repositorio en VS Code
4. Cuando se solicite, hacer clic en "Reopen in Container" (o usar Command Palette: Cmd+Shift+P → "Remote-Containers: Reopen in Container")

## Desglose de configuración

La configuración devcontainer consiste en tres componentes primarios:

- [**devcontainer.json**](https://github.com/anthropics/claude-code/blob/main/.devcontainer/devcontainer.json): Controla configuraciones de contenedor, extensiones, y montajes de volumen
- [**Dockerfile**](https://github.com/anthropics/claude-code/blob/main/.devcontainer/Dockerfile): Define la imagen del contenedor y herramientas instaladas
- [**init-firewall.sh**](https://github.com/anthropics/claude-code/blob/main/.devcontainer/init-firewall.sh): Establece reglas de seguridad de red

## Características de seguridad

El contenedor implementa un enfoque de seguridad multicapa con su configuración de firewall:

- **Control de acceso preciso**: Restringe conexiones salientes solo a dominios en lista blanca (registro npm, GitHub, API Anthropic, etc.)
- **Política default-deny**: Bloquea todo otro acceso de red externo
- **Verificación de inicio**: Valida reglas de firewall cuando el contenedor se inicializa
- **Aislamiento**: Crea un entorno de desarrollo seguro separado de tu sistema principal

## Opciones de personalización

La configuración devcontainer está diseñada para ser adaptable a tus necesidades:

- Agregar o remover extensiones VS Code basadas en tu flujo de trabajo
- Modificar asignaciones de recursos para diferentes entornos de hardware
- Ajustar permisos de acceso de red
- Personalizar configuraciones shell y herramientas de desarrollador

## Casos de uso de ejemplo

### Trabajo seguro de clientes

Usar devcontainers para aislar diferentes proyectos de clientes, asegurando que código y credenciales nunca se mezclen entre entornos.

### Onboarding de equipo

Nuevos miembros del equipo pueden obtener un entorno de desarrollo completamente configurado en minutos, con todas las herramientas y configuraciones necesarias preinstaladas.

### Entornos CI/CD consistentes

Replicar tu configuración devcontainer en pipelines CI/CD para asegurar que entornos de desarrollo y producción coincidan.

## Recursos relacionados

- [Documentación devcontainers VS Code](https://code.visualstudio.com/docs/devcontainers/containers)
- [Mejores prácticas de seguridad Claude Code](/en/docs/claude-code/security)
- [Configuración proxy corporativo](/en/docs/claude-code/corporate-proxy)