# Esquema de Base de Datos Full Stack Developer MCP

## Propósito

Especificación completa del esquema de base de datos necesario para el Servidor MCP Full Stack Developer, evolucionando desde el esquema base RAG (`crawled_pages.sql`) hacia un sistema completo para desarrollo Full Stack.

## Esquema Base RAG (Punto de Partida)

```sql
-- Tablas base existentes con pgvector
sources (source_id, summary, total_word_count)
crawled_pages (id, url, content, embedding, metadata)
code_examples (id, url, content, summary, embedding)
```

## Esquema Extendido para Full Stack Developer

### 1. FRAMEWORKS Y TECNOLOGÍAS
```sql
CREATE TABLE development_frameworks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,            -- Next.js, React, TypeScript
    version VARCHAR(20) NOT NULL,          -- 14.0.0, 18.2.0, 5.3.0
    category VARCHAR(50) NOT NULL,         -- frontend, backend, tooling
    documentation_url VARCHAR(500),        -- URL oficial documentación
    key_features JSONB NOT NULL,           -- Features principales
    best_practices TEXT,                   -- Mejores prácticas consolidadas
    common_patterns JSONB,                 -- Patrones comunes de uso
    compatibility JSONB,                   -- Compatibilidad con otras tecnologías
    embedding VECTOR(1536),                -- Para búsqueda semántica
    crawled_at TIMESTAMP WITH TIME ZONE,   -- Última actualización
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. COMPONENTES UI/UX REUTILIZABLES
```sql
CREATE TABLE ui_components (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,            -- ReservationForm, DataTable
    type VARCHAR(50) NOT NULL,             -- form, display, layout, navigation
    framework VARCHAR(50) NOT NULL,        -- react, vue, angular
    domain VARCHAR(100),                   -- restaurant, ecommerce, healthcare
    description TEXT NOT NULL,
    code_implementation TEXT NOT NULL,     -- Código completo del componente
    props_interface TEXT,                  -- TypeScript interface
    usage_example TEXT,                    -- Ejemplo de uso
    styling_approach VARCHAR(50),          -- tailwind, css-modules, styled-components
    accessibility_score INTEGER,           -- Score WCAG (0-100)
    performance_metrics JSONB,             -- Métricas de rendimiento
    dependencies JSONB,                    -- Dependencias del componente
    tests TEXT,                            -- Tests unitarios incluidos
    storybook_story TEXT,                  -- Story de Storybook
    embedding VECTOR(1536),
    source_project_id BIGINT,              -- Proyecto de origen
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, framework, domain)
);
```

### 3. PATRONES DE API
```sql
CREATE TABLE api_patterns (
    id BIGSERIAL PRIMARY KEY,
    endpoint_pattern VARCHAR(200) NOT NULL, -- /api/[resource]/[action]
    http_method VARCHAR(10) NOT NULL,       -- GET, POST, PUT, DELETE
    category VARCHAR(50) NOT NULL,          -- crud, auth, webhook, streaming
    description TEXT NOT NULL,
    request_schema JSONB NOT NULL,          -- Esquema Zod de request
    response_schema JSONB NOT NULL,         -- Esquema Zod de response
    authentication_required BOOLEAN DEFAULT true,
    authorization_rules TEXT,               -- Reglas de autorización
    implementation_code TEXT NOT NULL,      -- Handler completo
    middleware_chain JSONB,                 -- Middleware aplicado
    error_handling JSONB,                   -- Manejo de errores
    rate_limiting JSONB,                    -- Configuración rate limit
    caching_strategy JSONB,                 -- Estrategia de caché
    performance_sla JSONB,                  -- SLA de rendimiento
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. ARQUITECTURAS DE PROYECTO
```sql
CREATE TABLE project_architectures (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,             -- Next.js + Supabase + Tailwind
    type VARCHAR(50) NOT NULL,              -- monolith, microservices, serverless
    domain VARCHAR(100),                    -- restaurant, ecommerce, saas
    description TEXT NOT NULL,
    folder_structure JSONB NOT NULL,        -- Estructura de carpetas
    tech_stack JSONB NOT NULL,              -- Stack tecnológico completo
    design_patterns JSONB,                  -- Patrones de diseño aplicados
    scalability_considerations TEXT,        -- Consideraciones de escalabilidad
    security_measures JSONB,                -- Medidas de seguridad
    deployment_config JSONB,                -- Configuración de despliegue
    performance_optimizations JSONB,        -- Optimizaciones aplicadas
    monitoring_setup JSONB,                 -- Setup de monitoreo
    cost_estimation JSONB,                  -- Estimación de costos
    embedding VECTOR(1536),
    validated_in_production BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. CONFIGURACIONES DE STACK
```sql
CREATE TABLE stack_configurations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,             -- MERN, T3, JAMstack
    components JSONB NOT NULL,              -- Componentes del stack
    environment_setup TEXT NOT NULL,        -- Setup del entorno
    dependencies JSONB NOT NULL,            -- package.json dependencies
    dev_dependencies JSONB NOT NULL,        -- devDependencies
    scripts JSONB NOT NULL,                 -- npm scripts
    environment_variables JSONB,            -- Variables de entorno requeridas
    docker_config TEXT,                     -- Dockerfile si aplica
    ci_cd_pipeline TEXT,                    -- Pipeline CI/CD
    testing_setup JSONB,                    -- Configuración de testing
    linting_config JSONB,                   -- ESLint, Prettier config
    build_optimization JSONB,               -- Optimizaciones de build
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. PROYECTOS GENERADOS
```sql
CREATE TABLE generated_projects (
    id BIGSERIAL PRIMARY KEY,
    project_name VARCHAR(200) NOT NULL,
    domain VARCHAR(100) NOT NULL,           -- restaurant, ecommerce, etc
    prp_content TEXT NOT NULL,              -- PRP original
    architecture_id BIGINT REFERENCES project_architectures(id),
    stack_config_id BIGINT REFERENCES stack_configurations(id),
    components_used JSONB,                  -- IDs de componentes usados
    apis_implemented JSONB,                 -- IDs de APIs implementadas
    generation_metadata JSONB,              -- Metadata de generación
    quality_metrics JSONB,                  -- Métricas de calidad
    performance_benchmarks JSONB,           -- Benchmarks de rendimiento
    user_feedback JSONB,                    -- Feedback del usuario
    iterations INTEGER DEFAULT 1,           -- Número de iteraciones
    status VARCHAR(50) DEFAULT 'generated', -- generated, deployed, production
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. PATRONES DE SEGURIDAD
```sql
CREATE TABLE security_patterns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,             -- SQL Injection Prevention
    category VARCHAR(50) NOT NULL,          -- authentication, authorization, validation
    severity_level VARCHAR(20) NOT NULL,    -- critical, high, medium, low
    description TEXT NOT NULL,
    vulnerability_description TEXT,         -- Descripción de vulnerabilidad
    implementation_code TEXT NOT NULL,      -- Código de implementación
    validation_rules JSONB,                 -- Reglas de validación
    test_cases TEXT,                        -- Casos de prueba
    owasp_category VARCHAR(50),             -- Categoría OWASP
    compliance_standards JSONB,             -- Estándares de compliance
    performance_impact VARCHAR(20),         -- none, low, medium, high
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. PATRONES DE TESTING
```sql
CREATE TABLE testing_patterns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,             -- Component Unit Testing
    test_type VARCHAR(50) NOT NULL,        -- unit, integration, e2e, performance
    framework VARCHAR(50) NOT NULL,         -- jest, playwright, cypress
    description TEXT NOT NULL,
    pattern_code TEXT NOT NULL,             -- Código del patrón
    setup_instructions TEXT,                -- Instrucciones de setup
    common_assertions JSONB,                -- Assertions comunes
    mocking_strategies JSONB,               -- Estrategias de mocking
    coverage_targets JSONB,                 -- Targets de cobertura
    best_practices TEXT,                    -- Mejores prácticas
    pitfalls_to_avoid TEXT,                 -- Errores a evitar
    ci_integration TEXT,                    -- Integración con CI
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. OPTIMIZACIONES DE RENDIMIENTO
```sql
CREATE TABLE performance_optimizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,             -- Lazy Loading Implementation
    category VARCHAR(50) NOT NULL,          -- frontend, backend, database, network
    impact_level VARCHAR(20) NOT NULL,      -- high, medium, low
    description TEXT NOT NULL,
    problem_description TEXT,               -- Problema que resuelve
    implementation_code TEXT NOT NULL,      -- Código de implementación
    before_metrics JSONB,                   -- Métricas antes
    after_metrics JSONB,                    -- Métricas después
    implementation_complexity VARCHAR(20),  -- simple, moderate, complex
    prerequisites JSONB,                    -- Prerequisitos
    trade_offs TEXT,                        -- Trade-offs
    monitoring_setup JSONB,                 -- Setup de monitoreo
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Índices y Funciones

### Índices para Búsqueda Eficiente
```sql
CREATE INDEX idx_frameworks_embedding ON development_frameworks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_components_embedding ON ui_components USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_api_patterns_embedding ON api_patterns USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_architectures_embedding ON project_architectures USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_components_domain ON ui_components(domain);
CREATE INDEX idx_components_type ON ui_components(type);
CREATE INDEX idx_projects_domain ON generated_projects(domain);
CREATE INDEX idx_projects_status ON generated_projects(status);
```

### Función de Búsqueda Avanzada
```sql
CREATE OR REPLACE FUNCTION search_development_knowledge(
    query_embedding VECTOR(1536),
    search_domain VARCHAR DEFAULT NULL,
    search_category VARCHAR DEFAULT NULL,
    result_limit INT DEFAULT 10
) RETURNS TABLE (
    source_table VARCHAR,
    item_id BIGINT,
    item_name VARCHAR,
    similarity FLOAT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    -- Buscar en frameworks
    SELECT 
        'frameworks'::VARCHAR as source_table,
        f.id as item_id,
        f.name as item_name,
        1 - (f.embedding <=> query_embedding) as similarity,
        jsonb_build_object(
            'category', f.category,
            'version', f.version,
            'key_features', f.key_features
        ) as metadata
    FROM development_frameworks f
    WHERE (search_category IS NULL OR f.category = search_category)
    
    UNION ALL
    
    -- Buscar en componentes UI
    SELECT 
        'ui_components'::VARCHAR,
        c.id,
        c.name,
        1 - (c.embedding <=> query_embedding),
        jsonb_build_object(
            'type', c.type,
            'framework', c.framework,
            'domain', c.domain,
            'accessibility_score', c.accessibility_score
        )
    FROM ui_components c
    WHERE (search_domain IS NULL OR c.domain = search_domain)
    
    UNION ALL
    
    -- Buscar en patrones de API
    SELECT 
        'api_patterns'::VARCHAR,
        a.id,
        a.endpoint_pattern,
        1 - (a.embedding <=> query_embedding),
        jsonb_build_object(
            'method', a.http_method,
            'category', a.category,
            'auth_required', a.authentication_required
        )
    FROM api_patterns a
    WHERE (search_category IS NULL OR a.category = search_category)
    
    ORDER BY similarity DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

## Políticas RLS para Multi-Tenancy

```sql
-- RLS para proyectos generados
ALTER TABLE generated_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_components ENABLE ROW LEVEL SECURITY;

-- Política ejemplo para proyectos generados
CREATE POLICY "Users can view own projects" ON generated_projects
    FOR SELECT USING (auth.uid() = (metadata->>'user_id')::uuid);

-- Política para componentes compartidos
CREATE POLICY "Public read access to components" ON ui_components
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create components" ON ui_components
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```