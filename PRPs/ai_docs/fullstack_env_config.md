# Variables de Entorno y Configuración Full Stack MCP

## Propósito

Especificación completa de todas las variables de entorno y configuraciones necesarias para el Servidor MCP Full Stack Developer.

## Configuración por Categorías

### 1. Autenticación y Seguridad

```bash
# === GITHUB OAUTH ===
# OAuth App Configuration (del repo referencia)
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret

# Cookie Security (HMAC signing)
COOKIE_ENCRYPTION_KEY=tu_32_byte_encryption_key_generado_con_openssl

# Session Management
SESSION_SECRET=tu_session_secret_muy_largo_y_seguro
SESSION_TIMEOUT_HOURS=24

# API Security
API_RATE_LIMIT_REQUESTS_PER_MINUTE=60
API_RATE_LIMIT_BURST=100
JWT_SECRET=tu_jwt_secret_para_apis_internas
```

### 2. Bases de Datos

```bash
# === POSTGRESQL PRINCIPAL ===
# Base de datos principal con pgvector para embeddings
DATABASE_URL=postgresql://usuario:password@host:5432/mcp_fullstack_db
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT_SECONDS=30
DATABASE_SSL_MODE=require

# === SUPABASE ===
# Para aplicaciones generadas por el MCP
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuración de conexión Supabase
SUPABASE_DB_PASSWORD=tu_supabase_db_password
SUPABASE_MAX_CONNECTIONS=20

# === NEO4J KNOWLEDGE GRAPH ===
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=tu_neo4j_password_seguro
NEO4J_DATABASE=neo4j
NEO4J_MAX_CONNECTION_POOL_SIZE=50
NEO4J_CONNECTION_TIMEOUT_MS=30000
```

### 3. APIs Externas

```bash
# === OPENAI ===
# Para embeddings y generación de código
OPENAI_API_KEY=sk-tu-api-key-openai
OPENAI_MODEL_EMBEDDINGS=text-embedding-3-small
OPENAI_MODEL_CHAT=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.1
OPENAI_TIMEOUT_MS=60000

# === ANTHROPIC CLAUDE ===
# Para parseo de PRPs y generación avanzada
ANTHROPIC_API_KEY=sk-ant-tu-api-key-anthropic
CLAUDE_MODEL=claude-3-sonnet-20240229
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.1
CLAUDE_TIMEOUT_MS=120000

# === COHERE (OPCIONAL) ===
# Para reranking de resultados RAG
COHERE_API_KEY=tu_cohere_api_key
COHERE_MODEL_RERANK=rerank-english-v2.0
```

### 4. Plataformas de Deployment

```bash
# === VERCEL ===
VERCEL_TOKEN=tu_vercel_token
VERCEL_TEAM_ID=tu_team_id_vercel
VERCEL_ORG_ID=tu_org_id_vercel
VERCEL_PROJECT_ID=tu_project_id_por_defecto

# === CLOUDFLARE ===
CLOUDFLARE_API_TOKEN=tu_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=tu_account_id_cloudflare
CLOUDFLARE_ZONE_ID=tu_zone_id_para_dns

# === CLOUDFLARE WORKERS ===
# Para el servidor MCP en Workers
CLOUDFLARE_WORKERS_SUBDOMAIN=tu-subdomain
OAUTH_KV_NAMESPACE_ID=tu_kv_namespace_id

# === AWS (OPCIONAL) ===
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=tu-bucket-para-assets
```

### 5. Configuración del Servidor MCP

```bash
# === SERVIDOR MCP ===
MCP_SERVER_NAME="Full Stack Developer MCP"
MCP_SERVER_VERSION="2.0.0"
MCP_TRANSPORT=sse
HOST=0.0.0.0
PORT=8051

# === DURABLE OBJECTS ===
# Para Cloudflare Workers
DURABLE_OBJECT_CLASS=FullStackMCP
DURABLE_OBJECT_SCRIPT_NAME=fullstack-mcp

# === WEBSOCKETS ===
WS_HEARTBEAT_INTERVAL_MS=30000
WS_CONNECTION_TIMEOUT_MS=60000
WS_MAX_CONNECTIONS=1000
```

### 6. Features y Comportamiento

```bash
# === FEATURES RAG ===
ENABLE_CONTEXTUAL_EMBEDDINGS=true
ENABLE_HYBRID_SEARCH=true
ENABLE_AGENTIC_RAG=true
ENABLE_RERANKING=true
USE_COHERE_RERANKING=false

# === KNOWLEDGE GRAPH ===
ENABLE_KNOWLEDGE_GRAPH=true
GRAPHITI_API_KEY=tu_graphiti_key_opcional
KNOWLEDGE_GRAPH_UPDATE_INTERVAL_HOURS=6

# === CRAWLING AUTOMÁTICO ===
ENABLE_AUTO_CRAWLING=true
CRAWL_INTERVAL_HOURS=24
CRAWL_PRIORITY_DOMAINS=nextjs.org,supabase.com,context7.com,reactjs.org
MAX_CRAWL_DEPTH=3
CRAWL_TIMEOUT_MS=30000
CRAWL_USER_AGENT="FullStackMCP/2.0 (Educational Purpose)"

# === APRENDIZAJE CONTINUO ===
ENABLE_AUTO_LEARNING=true
LEARNING_THRESHOLD=0.85
FEEDBACK_INTEGRATION=true
AUTO_UPDATE_KNOWLEDGE_BASE=true
```

### 7. Monitoreo y Observabilidad

```bash
# === SENTRY (OPCIONAL) ===
SENTRY_DSN=https://tu-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.05

# === LOGGING ===
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_PERFORMANCE_LOGGING=true
ENABLE_AUDIT_LOGGING=true

# === MÉTRICAS ===
ENABLE_PROMETHEUS_METRICS=true
METRICS_PORT=9090
METRICS_PATH=/metrics

# === HEALTH CHECKS ===
HEALTH_CHECK_INTERVAL_MS=30000
HEALTH_CHECK_TIMEOUT_MS=5000
```

### 8. Límites y Quotas

```bash
# === RATE LIMITING ===
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=100
RATE_LIMIT_WINDOW_MS=60000

# === LÍMITES DE GENERACIÓN ===
MAX_COMPONENT_SIZE_KB=100
MAX_PROJECT_SIZE_MB=500
MAX_GENERATION_TIME_SECONDS=300
MAX_CONCURRENT_GENERATIONS=5

# === LÍMITES DE MEMORIA ===
MAX_MEMORY_USAGE_MB=1024
MAX_CACHE_SIZE_MB=256
MAX_EMBEDDING_CACHE_ENTRIES=10000
```

### 9. Configuración de Desarrollo

```bash
# === DESARROLLO ===
NODE_ENV=development
ENABLE_HOT_RELOAD=true
ENABLE_DEBUG_MODE=false
MOCK_EXTERNAL_APIS=false

# === TESTING ===
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/mcp_test
ENABLE_TEST_MODE=false
TEST_TIMEOUT_MS=30000

# === DEBUGGING ===
DEBUG_NAMESPACES=mcp:*,fullstack:*
VERBOSE_LOGGING=false
TRACE_REQUESTS=false
```

### 10. Configuración de Cache

```bash
# === REDIS (OPCIONAL) ===
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=tu_redis_password
REDIS_DB=0
REDIS_MAX_CONNECTIONS=20

# === CACHE CONFIGURACIÓN ===
CACHE_TTL_EMBEDDINGS_HOURS=168    # 1 semana
CACHE_TTL_KNOWLEDGE_HOURS=24      # 1 día
CACHE_TTL_COMPONENTS_HOURS=72     # 3 días
CACHE_TTL_APIS_HOURS=24           # 1 día

# === CACHE KEYS ===
CACHE_PREFIX=fullstack_mcp
CACHE_VERSION=v2
```

## Archivos de Configuración

### `.env.example` (Template)

```bash
# Copy this file to .env.local and fill in your values

# === REQUIRED: GitHub OAuth ===
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
COOKIE_ENCRYPTION_KEY=generate_with_openssl_rand_-hex_32

# === REQUIRED: Database ===
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_fullstack
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key

# === REQUIRED: AI APIs ===
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# === OPTIONAL: Knowledge Graph ===
NEO4J_URI=bolt://localhost:7687
NEO4J_PASSWORD=your_neo4j_password

# === OPTIONAL: Deployment ===
VERCEL_TOKEN=your_vercel_token
CLOUDFLARE_API_TOKEN=your_cloudflare_token

# === OPTIONAL: Monitoring ===
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### `wrangler.toml` (Cloudflare Workers)

```toml
name = "fullstack-mcp"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
name = "fullstack-mcp-prod"

[env.development]
name = "fullstack-mcp-dev"

[[kv_namespaces]]
binding = "OAUTH_KV"
id = "your_kv_namespace_id"

[[durable_objects.bindings]]
name = "FULLSTACK_MCP"
class_name = "FullStackMCP"

[[migrations]]
tag = "v1"
new_classes = ["FullStackMCP"]

[vars]
MCP_SERVER_NAME = "Full Stack Developer MCP"
MCP_SERVER_VERSION = "2.0.0"
ENABLE_KNOWLEDGE_GRAPH = "true"
ENABLE_AUTO_CRAWLING = "true"
```

### `docker-compose.yml` (Desarrollo Local)

```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: mcp_fullstack
      POSTGRES_USER: mcp_user
      POSTGRES_PASSWORD: mcp_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  neo4j:
    image: neo4j:5.15
    environment:
      NEO4J_AUTH: neo4j/your_password
      NEO4J_PLUGINS: '["apoc", "graph-data-science"]'
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  neo4j_data:
  redis_data:
```

## Scripts de Setup

### `setup-env.sh`

```bash
#!/bin/bash
# Script para configurar variables de entorno

echo "🚀 Setting up Full Stack MCP environment..."

# Verificar dependencias
command -v openssl >/dev/null 2>&1 || { echo "OpenSSL required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }

# Generar keys de seguridad
echo "🔐 Generating security keys..."
COOKIE_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -base64 64)
JWT_SECRET=$(openssl rand -base64 32)

# Crear archivo .env.local
cat > .env.local << EOF
# Generated by setup-env.sh on $(date)

# Security Keys (DO NOT SHARE)
COOKIE_ENCRYPTION_KEY=${COOKIE_KEY}
SESSION_SECRET=${SESSION_SECRET}
JWT_SECRET=${JWT_SECRET}

# Development settings
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=true

# Add your API keys below:
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
# DATABASE_URL=
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
EOF

echo "✅ Environment setup complete!"
echo "📝 Please edit .env.local and add your API keys"
echo "🐳 Run 'docker-compose up -d' to start local services"
```

### Validación de Configuración

```typescript
// scripts/validate-config.ts
interface ConfigValidation {
    required: string[];
    optional: string[];
    format: Record<string, RegExp>;
}

const CONFIG_RULES: ConfigValidation = {
    required: [
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET', 
        'COOKIE_ENCRYPTION_KEY',
        'DATABASE_URL',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY'
    ],
    optional: [
        'NEO4J_URI',
        'VERCEL_TOKEN',
        'SENTRY_DSN'
    ],
    format: {
        'DATABASE_URL': /^postgresql:\/\/.+/,
        'OPENAI_API_KEY': /^sk-.+/,
        'ANTHROPIC_API_KEY': /^sk-ant-.+/,
        'COOKIE_ENCRYPTION_KEY': /^[a-f0-9]{64}$/
    }
};

function validateConfig(): boolean {
    let isValid = true;
    
    // Verificar variables requeridas
    for (const key of CONFIG_RULES.required) {
        if (!process.env[key]) {
            console.error(`❌ Missing required environment variable: ${key}`);
            isValid = false;
        }
    }
    
    // Verificar formatos
    for (const [key, pattern] of Object.entries(CONFIG_RULES.format)) {
        const value = process.env[key];
        if (value && !pattern.test(value)) {
            console.error(`❌ Invalid format for ${key}`);
            isValid = false;
        }
    }
    
    if (isValid) {
        console.log('✅ Configuration validation passed');
    }
    
    return isValid;
}
```