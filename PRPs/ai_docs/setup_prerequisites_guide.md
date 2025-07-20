# Guía Completa de Prerequisites y Setup

## 🎯 **Propósito**

Guía paso a paso para configurar todos los servicios externos, variables de entorno y dependencias necesarias antes de ejecutar el servidor MCP Full Stack Developer.

## 📋 **Checklist de Prerequisites**

### **Servicios Obligatorios** ✅
- [ ] **GitHub OAuth Application** - Autenticación del servidor MCP
- [ ] **Supabase Project** - Base de datos PostgreSQL + pgvector
- [ ] **Neo4j Database** - Knowledge graph (local o cloud)
- [ ] **OpenAI API Key** - Embeddings y summaries
- [ ] **Anthropic API Key** - Parsing PRPs y generación

### **Servicios Opcionales** 📦
- [ ] **Sentry Project** - Monitoreo errores en producción
- [ ] **Email SMTP/IMAP** - Para apps Next.js con gestión email

## 🔧 **Setup Paso a Paso**

### **1. GitHub OAuth Application**

#### **Crear OAuth App**
```bash
# 1. Ir a GitHub Settings
https://github.com/settings/applications/new

# 2. Configurar aplicación
Application name: "MCP Full Stack Server [Tu Nombre]"
Homepage URL: https://tu-dominio.workers.dev
Authorization callback URL: https://tu-dominio.workers.dev/callback
```

#### **Obtener Credenciales**
```yaml
# Después de crear la app, copiar:
GITHUB_CLIENT_ID: "Ghp_xxxxxxxxxxxxxxxx"
GITHUB_CLIENT_SECRET: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Generar clave de encriptación de cookies
COOKIE_ENCRYPTION_KEY: "$(openssl rand -hex 32)"
```

#### **Configurar Permisos**
```yaml
# En la configuración de tu OAuth app:
Scopes_Requeridos:
  - read:user (información básica del usuario)
  - user:email (acceso al email del usuario)

# Opcional para funcionalidades avanzadas:
  - repo (si necesitas acceso a repositorios)
  - admin:org (si usas organizaciones)
```

### **2. Supabase Project Setup**

#### **Crear Proyecto**
```bash
# 1. Ir a Supabase Dashboard
https://supabase.com/dashboard

# 2. Crear nuevo proyecto
- Project name: "MCP Full Stack DB"
- Database password: [genera una contraseña segura]
- Region: [selecciona la más cercana]
```

#### **Configurar Extensions**
```sql
-- 1. Ir a Database > Extensions en Supabase Dashboard
-- 2. Habilitar estas extensions obligatorias:

-- Para embeddings vectoriales
CREATE EXTENSION IF NOT EXISTS vector;

-- Para funciones avanzadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

#### **Configurar Multi-Schema**
```sql
-- Crear schemas para diferentes dominios (referencia: .env.ejemplo.mcp)
CREATE SCHEMA IF NOT EXISTS restaurante;
CREATE SCHEMA IF NOT EXISTS personal;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS operaciones;
CREATE SCHEMA IF NOT EXISTS comunicaciones;
CREATE SCHEMA IF NOT EXISTS email;
CREATE SCHEMA IF NOT EXISTS notificaciones;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS gamificacion;
CREATE SCHEMA IF NOT EXISTS web;
CREATE SCHEMA IF NOT EXISTS ayuda;

-- Configurar RLS (Row Level Security)
ALTER SCHEMA public ENABLE ROW LEVEL SECURITY;
ALTER SCHEMA restaurante ENABLE ROW LEVEL SECURITY;
-- Repetir para cada schema
```

#### **Obtener Credenciales**
```yaml
# En Settings > API de tu proyecto Supabase:
SUPABASE_URL: "https://xxxxxxxxxx.supabase.co"
SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Formato DATABASE_URL para Cloudflare:
DATABASE_URL: "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### **3. Neo4j Database Setup**

#### **Opción A: Local con Docker (Recomendado para desarrollo)**
```bash
# 1. Crear docker-compose.yml para Neo4j
cat > docker-compose.neo4j.yml << EOF
version: '3.8'
services:
  neo4j:
    image: neo4j:5.15
    container_name: mcp-neo4j
    environment:
      NEO4J_AUTH: neo4j/fullstackmcp23
      NEO4J_PLUGINS: '["apoc", "graph-data-science"]'
      NEO4J_dbms_security_procedures_unrestricted: "gds.*,apoc.*"
    ports:
      - "7474:7474"  # Browser
      - "7687:7687"  # Bolt
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs

volumes:
  neo4j_data:
  neo4j_logs:
EOF

# 2. Iniciar Neo4j
docker-compose -f docker-compose.neo4j.yml up -d

# 3. Verificar instalación
open http://localhost:7474
# User: neo4j, Password: fullstackmcp23
```

#### **Opción B: Neo4j AuraDB Cloud (Recomendado para producción)**
```bash
# 1. Ir a Neo4j AuraDB
https://neo4j.com/cloud/aura/

# 2. Crear instancia gratuita
- Instance name: "MCP Knowledge Graph"
- Database name: "neo4j"
- Region: [selecciona la más cercana]

# 3. Guardar credenciales generadas
NEO4J_URI: "neo4j+s://xxxxxxxx.databases.neo4j.io"
NEO4J_USER: "neo4j"
NEO4J_PASSWORD: "[password-generado]"
```

#### **Configurar Knowledge Graph Schema**
```cypher
// Ejecutar estas queries en Neo4j Browser para setup inicial

// 1. Crear índices para performance
CREATE INDEX component_name_index FOR (c:Component) ON (c.name);
CREATE INDEX pattern_type_index FOR (p:Pattern) ON (p.type);
CREATE INDEX project_domain_index FOR (proj:Project) ON (proj.domain);

// 2. Crear constraints para integridad
CREATE CONSTRAINT component_name_unique FOR (c:Component) REQUIRE c.name IS UNIQUE;
CREATE CONSTRAINT pattern_name_unique FOR (p:Pattern) REQUIRE p.name IS UNIQUE;

// 3. Verificar setup
CALL db.indexes();
CALL db.constraints();
```

### **4. API Keys de Inteligencia Artificial**

#### **OpenAI API Key**
```bash
# 1. Ir a OpenAI Platform
https://platform.openai.com/api-keys

# 2. Crear nueva API key
- Name: "MCP Full Stack Server"
- Permissions: All (o específicos según necesidad)

# 3. Configurar límites de uso (recomendado)
- Monthly budget limit: $50 (ajustar según necesidad)
- Usage notifications: 80% del límite

# 4. Verificar key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-proj-tu-api-key"
```

#### **Anthropic API Key**
```bash
# 1. Ir a Anthropic Console
https://console.anthropic.com/settings/keys

# 2. Crear nueva API key
- Name: "MCP Full Stack Server"
- Usage limit: [configurar según necesidad]

# 3. Verificar key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-tu-api-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-haiku-20240307","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

### **5. Servicios Opcionales**

#### **Sentry Monitoring (Opcional)**
```bash
# 1. Crear cuenta en Sentry
https://sentry.io/signup/

# 2. Crear nuevo proyecto
- Platform: Cloudflare Workers
- Project name: "MCP Full Stack Server"
- Team: [tu equipo]

# 3. Obtener DSN
SENTRY_DSN: "https://xxxxxxxx@sentry.io/xxxxxxx"
```

#### **Email SMTP/IMAP (Para apps Next.js)**
```yaml
# Configuración de referencia (.env.ejemplo.mcp)
# Ejemplo con Hostinger (funcional)

SMTP_Configuration:
  SMTP_HOST: "smtp.hostinger.com"
  SMTP_PORT: 465
  SMTP_USER: "admin@tu-dominio.com"
  SMTP_PASS: "tu_contraseña_segura"
  SMTP_SENDER_NAME: "Tu App Name"

IMAP_Configuration:
  IMAP_HOST: "imap.hostinger.com"
  IMAP_PORT: 993
  IMAP_USER: "admin@tu-dominio.com"
  IMAP_PASSWORD: "tu_contraseña_segura"

# Aliases de email funcionales
EMAIL_ALIASES:
  - gestion@tu-dominio.com
  - reportes@tu-dominio.com
  - hola@tu-dominio.com
  - noreply@tu-dominio.com
  - info@tu-dominio.com
  - facturacion@tu-dominio.com
```

## 📁 **Templates de Variables de Entorno**

### **Template 1: Cloudflare Workers (.dev.vars)**
```bash
# Copia este template a .dev.vars en tu servidor MCP
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
COOKIE_ENCRYPTION_KEY=tu_32_byte_hex_key

ANTHROPIC_API_KEY=sk-ant-tu-anthropic-key
ANTHROPIC_MODEL=claude-3-5-haiku-latest

DATABASE_URL=postgresql://postgres:password@host:5432/db
SENTRY_DSN=https://tu-sentry-dsn@sentry.io/project-id
NODE_ENV=development
```

### **Template 2: Servidor MCP (.env)**
```bash
# Configuración del servidor MCP base
TRANSPORT=sse
HOST=localhost
PORT=8051

OPENAI_API_KEY=sk-proj-tu-openai-key
MODEL_CHOICE=gpt-4o-mini

USE_CONTEXTUAL_EMBEDDINGS=true
USE_HYBRID_SEARCH=true
USE_AGENTIC_RAG=true
USE_RERANKING=true
USE_KNOWLEDGE_GRAPH=true

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=fullstackmcp23
```

### **Template 3: Apps Next.js (.env.local)**
```bash
# Configuración para aplicaciones Next.js generadas por el MCP
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
POSTGRES_PASSWORD=tu_postgres_password
JWT_SECRET=tu_jwt_secret_generado

# Multi-schema database
PGRST_DB_SCHEMAS=public,storage,graphql_public,operaciones,restaurante,crm,personal,comunicaciones,email,notificaciones,analytics,gamificacion,web,ayuda

# Email configuration (si aplicable)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=admin@tu-dominio.com
SMTP_PASS=tu_password
SMTP_SENDER_NAME=Tu App

IMAP_HOST=imap.hostinger.com
IMAP_PORT=993
IMAP_USER=admin@tu-dominio.com
IMAP_PASSWORD=tu_password

# Desarrollo
SITE_URL=http://localhost:3000
API_EXTERNAL_URL=http://localhost:8000
NODE_ENV=development
```

## ✅ **Scripts de Validación**

### **Script de Validación Automática**
```bash
#!/bin/bash
# validate-setup.sh

echo "🔍 Validando Prerequisites del MCP Full Stack Server..."

# Verificar GitHub OAuth
echo "📱 Verificando GitHub OAuth..."
if [ -z "$GITHUB_CLIENT_ID" ] || [ -z "$GITHUB_CLIENT_SECRET" ]; then
    echo "❌ Variables GitHub OAuth no configuradas"
    exit 1
fi

# Verificar Supabase
echo "🗄️ Verificando Supabase..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Variables Supabase no configuradas"
    exit 1
fi

# Test conexión Supabase
curl -s -H "apikey: $SUPABASE_SERVICE_KEY" "$SUPABASE_URL/rest/v1/" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Conexión Supabase exitosa"
else
    echo "❌ Error conectando a Supabase"
    exit 1
fi

# Verificar Neo4j
echo "🕸️ Verificando Neo4j..."
if [ -z "$NEO4J_URI" ] || [ -z "$NEO4J_PASSWORD" ]; then
    echo "❌ Variables Neo4j no configuradas"
    exit 1
fi

# Verificar API Keys
echo "🤖 Verificando API Keys..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OpenAI API Key no configurada"
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "❌ Anthropic API Key no configurada"
    exit 1
fi

echo "✅ Todos los prerequisites configurados correctamente!"
echo "🚀 Listo para ejecutar el servidor MCP Full Stack"
```

### **Script de Test de Conectividad**
```typescript
// test-connections.ts
interface ConnectionTest {
  service: string;
  status: 'success' | 'error';
  message: string;
  latency?: number;
}

async function testAllConnections(): Promise<ConnectionTest[]> {
  const results: ConnectionTest[] = [];
  
  // Test Supabase
  try {
    const start = Date.now();
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY! }
    });
    const latency = Date.now() - start;
    
    results.push({
      service: 'Supabase',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? 'Conexión exitosa' : `Error: ${response.status}`,
      latency
    });
  } catch (error) {
    results.push({
      service: 'Supabase',
      status: 'error',
      message: `Error de conexión: ${error.message}`
    });
  }
  
  // Test OpenAI
  try {
    const start = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    const latency = Date.now() - start;
    
    results.push({
      service: 'OpenAI',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? 'API Key válida' : `Error: ${response.status}`,
      latency
    });
  } catch (error) {
    results.push({
      service: 'OpenAI',
      status: 'error',
      message: `Error de conexión: ${error.message}`
    });
  }
  
  // Test Anthropic
  try {
    const start = Date.now();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    const latency = Date.now() - start;
    
    results.push({
      service: 'Anthropic',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? 'API Key válida' : `Error: ${response.status}`,
      latency
    });
  } catch (error) {
    results.push({
      service: 'Anthropic',
      status: 'error',
      message: `Error de conexión: ${error.message}`
    });
  }
  
  return results;
}

// Ejecutar tests
testAllConnections().then(results => {
  console.log('🔍 Resultados de Tests de Conectividad:\n');
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    const latency = result.latency ? ` (${result.latency}ms)` : '';
    console.log(`${icon} ${result.service}: ${result.message}${latency}`);
  });
  
  const allSuccess = results.every(r => r.status === 'success');
  console.log(allSuccess ? '\n🚀 Todo listo para el MCP Server!' : '\n⚠️ Corregir errores antes de continuar');
});
```

## 🚨 **Troubleshooting Común**

### **Error: GitHub OAuth no funciona**
```yaml
Problema: Callback URL inválida
Solución: 
  - Verificar que la URL coincida exactamente
  - No incluir trailing slash
  - Usar HTTPS en producción

Problema: Scopes insuficientes
Solución:
  - Verificar permisos read:user y user:email
  - Regenerar tokens si es necesario
```

### **Error: Supabase connection failed**
```yaml
Problema: RLS políticas bloqueando acceso
Solución:
  - Usar SERVICE_ROLE_KEY para operaciones administrativas
  - Verificar políticas RLS correctamente configuradas

Problema: Extension pgvector no encontrada
Solución:
  - Ir a Database > Extensions
  - Habilitar "vector" extension
  - Reiniciar aplicación
```

### **Error: Neo4j connection timeout**
```yaml
Problema: Docker container no iniciado
Solución:
  - docker-compose -f docker-compose.neo4j.yml up -d
  - Verificar logs: docker logs mcp-neo4j

Problema: Credenciales incorrectas
Solución:
  - Verificar NEO4J_USER=neo4j
  - Verificar NEO4J_PASSWORD matches docker config
```

### **Error: API Keys inválidas**
```yaml
Problema: Rate limits excedidos
Solución:
  - Verificar billing en OpenAI/Anthropic
  - Configurar límites de uso apropiados

Problema: Permissions insuficientes
Solución:
  - Regenerar API keys con permisos completos
  - Verificar organización correcta
```

---

**Resultado**: Setup completo y validado listo para ejecutar el servidor MCP Full Stack Developer con todas las dependencias funcionando correctamente.