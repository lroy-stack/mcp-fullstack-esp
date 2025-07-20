# Patrones de Desarrollo MCP Full Stack

Este documento contiene patrones probados para desarrollar servidores Model Context Protocol (MCP) integrados con el stack Full Stack (Next.js + Supabase + Neo4j), basados en implementaciones exitosas y adaptados para el ecosistema completo.

## Arquitectura Principal de Servidor MCP Full Stack

### Patrón de Servidor MCP con RAG y Knowledge Graph

```python
# Servidor MCP avanzado con capacidades RAG y Knowledge Graph
from mcp.server.fastmcp import FastMCP, Context
from typing import List, Dict, Any, Optional
import asyncio
import os

class FullStackMCP:
    """Servidor MCP con capacidades Full Stack Development."""
    
    def __init__(self):
        self.app = FastMCP("FullStack MCP Developer")
        self.supabase_client = None
        self.neo4j_driver = None
        self.knowledge_base = {}
        
    async def initialize(self):
        """Inicializar conexiones y recursos del servidor."""
        await self._setup_supabase()
        await self._setup_neo4j()
        await self._load_knowledge_base()
        self._register_tools()
        
    async def _setup_supabase(self):
        """Configurar cliente Supabase para RAG."""
        from utils import get_supabase_client
        self.supabase_client = await get_supabase_client()
        
    async def _setup_neo4j(self):
        """Configurar driver Neo4j para Knowledge Graph."""
        # Configuración Neo4j para relaciones arquitectónicas
        pass
        
    def _register_tools(self):
        """Registrar todas las herramientas MCP especializadas."""
        self._register_architectural_tools()
        self._register_development_tools()
        self._register_knowledge_tools()
```

### Patrón de Herramientas MCP Especializadas

```python
# Herramienta MCP para desarrollo Full Stack
@app.tool()
async def generate_component(
    context: Context,
    component_type: str,
    name: str,
    props: Optional[Dict[str, Any]] = None,
    styling: str = "tailwind"
) -> str:
    """
    Generar componente React con tests y documentación.
    
    Args:
        component_type: Tipo de componente (form, display, layout, interactive)
        name: Nombre del componente
        props: Propiedades del componente
        styling: Sistema de estilos (tailwind, styled-components)
    """
    try:
        # 1. Buscar patrones similares en knowledge base
        similar_patterns = await search_component_patterns(
            component_type, name, context
        )
        
        # 2. Generar código basado en patrones encontrados
        component_code = await generate_react_component(
            name, component_type, props, styling, similar_patterns
        )
        
        # 3. Generar tests automáticos
        test_code = await generate_component_tests(
            name, component_type, props
        )
        
        # 4. Actualizar knowledge base
        await update_component_knowledge(
            name, component_type, component_code
        )
        
        return {
            "component": component_code,
            "tests": test_code,
            "documentation": await generate_component_docs(name, props),
            "storybook": await generate_storybook_story(name, props)
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "generate_component")
```

### Patrón de Integración RAG para Desarrollo

```python
# Búsqueda semántica en knowledge base del dominio
@app.tool()
async def search_knowledge(
    context: Context,
    query: str,
    domain: str = "fullstack",
    result_type: str = "code_examples"
) -> List[Dict[str, Any]]:
    """
    Buscar conocimiento específico del dominio con embeddings.
    
    Args:
        query: Consulta de búsqueda
        domain: Dominio específico (frontend, backend, database)
        result_type: Tipo de resultado (code_examples, patterns, docs)
    """
    try:
        # 1. Generar embeddings de la consulta
        from utils import search_documents, search_code_examples
        
        if result_type == "code_examples":
            results = await search_code_examples(
                query, domain=domain, limit=10
            )
        else:
            results = await search_documents(
                query, domain=domain, limit=10
            )
            
        # 2. Aplicar reranking para mejor relevancia
        ranked_results = await apply_cross_encoder_reranking(
            query, results
        )
        
        # 3. Formatear resultados para contexto MCP
        formatted_results = []
        for result in ranked_results[:5]:
            formatted_results.append({
                "content": result["content"],
                "relevance_score": result["score"],
                "source": result["metadata"]["source"],
                "domain": result["metadata"]["domain"],
                "type": result["metadata"]["type"]
            })
            
        return formatted_results
        
    except Exception as error:
        return await handle_mcp_error(error, "search_knowledge")
```

### Patrón de Knowledge Graph para Arquitectura

```python
# Consultas al knowledge graph para insights arquitectónicos
@app.tool()
async def query_project_graph(
    context: Context,
    query_type: str,
    entity_name: str,
    relationship_depth: int = 2
) -> Dict[str, Any]:
    """
    Consultar knowledge graph para relaciones arquitectónicas.
    
    Args:
        query_type: Tipo de consulta (dependencies, patterns, impacts)
        entity_name: Nombre de la entidad (component, api, schema)
        relationship_depth: Profundidad de relaciones a explorar
    """
    try:
        # 1. Construir consulta Cypher basada en tipo
        cypher_queries = {
            "dependencies": """
                MATCH (n {name: $entity_name})-[r*1..$depth]-(related)
                RETURN n, r, related, type(r) as relationship_type
            """,
            "patterns": """
                MATCH (n {name: $entity_name})-[:IMPLEMENTS|USES]->(pattern)
                WHERE pattern:Pattern
                RETURN pattern, pattern.description, pattern.examples
            """,
            "impacts": """
                MATCH (n {name: $entity_name})<-[:DEPENDS_ON*1..$depth]-(dependent)
                RETURN dependent, labels(dependent) as types
            """
        }
        
        # 2. Ejecutar consulta en Neo4j
        from knowledge_graphs.neo4j_client import execute_cypher_query
        
        results = await execute_cypher_query(
            cypher_queries[query_type],
            {"entity_name": entity_name, "depth": relationship_depth}
        )
        
        # 3. Generar insights arquitectónicos
        insights = await generate_architectural_insights(results)
        
        return {
            "entity": entity_name,
            "query_type": query_type,
            "relationships": results,
            "insights": insights,
            "recommendations": await generate_architecture_recommendations(
                entity_name, results
            )
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "query_project_graph")
```

## Patrones de Integración con Stack Full Stack

### Patrón de Generación de APIs Next.js

```python
@app.tool()
async def generate_api_endpoint(
    context: Context,
    endpoint_path: str,
    method: str,
    auth_level: str = "user",
    validation_schema: Optional[Dict] = None
) -> Dict[str, str]:
    """
    Generar API endpoint de Next.js con validación y auth.
    
    Args:
        endpoint_path: Ruta del endpoint (/api/users/[id])
        method: Método HTTP (GET, POST, PUT, DELETE)
        auth_level: Nivel de auth (public, user, admin)
        validation_schema: Esquema Zod para validación
    """
    try:
        # 1. Buscar patrones de API similares
        similar_apis = await search_knowledge(
            f"Next.js API {method} {auth_level}",
            domain="backend",
            result_type="code_examples"
        )
        
        # 2. Generar código del endpoint
        api_code = await generate_nextjs_api(
            endpoint_path, method, auth_level, validation_schema, similar_apis
        )
        
        # 3. Generar middleware necesario
        middleware_code = await generate_api_middleware(auth_level)
        
        # 4. Generar tests de integración
        test_code = await generate_api_tests(
            endpoint_path, method, validation_schema
        )
        
        return {
            "api_handler": api_code,
            "middleware": middleware_code,
            "tests": test_code,
            "validation_schema": await generate_zod_schema(validation_schema),
            "documentation": await generate_api_docs(endpoint_path, method)
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "generate_api_endpoint")
```

### Patrón de Esquemas de Base de Datos

```python
@app.tool()
async def generate_database_schema(
    context: Context,
    table_name: str,
    fields: List[Dict[str, Any]],
    relationships: Optional[List[Dict]] = None,
    rls_policies: bool = True
) -> Dict[str, str]:
    """
    Generar esquema Prisma con migraciones y políticas RLS.
    
    Args:
        table_name: Nombre de la tabla
        fields: Lista de campos con tipos y constraints
        relationships: Relaciones con otras tablas
        rls_policies: Generar políticas Row Level Security
    """
    try:
        # 1. Buscar patrones de esquema similares
        similar_schemas = await search_knowledge(
            f"database schema {table_name}",
            domain="database",
            result_type="patterns"
        )
        
        # 2. Generar esquema Prisma
        prisma_schema = await generate_prisma_schema(
            table_name, fields, relationships, similar_schemas
        )
        
        # 3. Generar migraciones SQL
        migration_sql = await generate_migration_sql(
            table_name, fields, relationships
        )
        
        # 4. Generar políticas RLS si se requieren
        rls_sql = ""
        if rls_policies:
            rls_sql = await generate_rls_policies(table_name, fields)
            
        # 5. Generar tipos TypeScript
        typescript_types = await generate_database_types(
            table_name, fields, relationships
        )
        
        return {
            "prisma_schema": prisma_schema,
            "migration_sql": migration_sql,
            "rls_policies": rls_sql,
            "typescript_types": typescript_types,
            "seed_data": await generate_seed_data(table_name, fields)
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "generate_database_schema")
```

## Patrones de Autenticación y Seguridad

### Patrón de Implementación de Auth

```python
@app.tool()
async def implement_auth_system(
    context: Context,
    auth_provider: str = "supabase",
    auth_methods: List[str] = ["email", "oauth"],
    role_system: bool = True
) -> Dict[str, str]:
    """
    Implementar sistema de autenticación completo.
    
    Args:
        auth_provider: Proveedor de auth (supabase, nextauth)
        auth_methods: Métodos de auth habilitados
        role_system: Implementar sistema de roles
    """
    try:
        # 1. Buscar patrones de auth del stack
        auth_patterns = await search_knowledge(
            f"{auth_provider} authentication {' '.join(auth_methods)}",
            domain="auth",
            result_type="patterns"
        )
        
        # 2. Generar configuración de auth
        auth_config = await generate_auth_config(
            auth_provider, auth_methods, auth_patterns
        )
        
        # 3. Generar middleware de auth
        auth_middleware = await generate_auth_middleware(
            auth_provider, role_system
        )
        
        # 4. Generar hooks de React para auth
        auth_hooks = await generate_auth_hooks(
            auth_provider, auth_methods
        )
        
        # 5. Generar componentes de auth
        auth_components = await generate_auth_components(
            auth_provider, auth_methods
        )
        
        return {
            "auth_config": auth_config,
            "middleware": auth_middleware,
            "hooks": auth_hooks,
            "components": auth_components,
            "types": await generate_auth_types(role_system)
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "implement_auth_system")
```

## Patrones de Testing y Validación

### Patrón de Generación de Tests

```python
@app.tool()
async def generate_comprehensive_tests(
    context: Context,
    test_target: str,
    test_types: List[str] = ["unit", "integration", "e2e"],
    coverage_threshold: int = 80
) -> Dict[str, str]:
    """
    Generar suite completa de tests.
    
    Args:
        test_target: Objetivo a testear (component, api, page)
        test_types: Tipos de test a generar
        coverage_threshold: Umbral mínimo de cobertura
    """
    try:
        generated_tests = {}
        
        # 1. Buscar patrones de testing específicos
        for test_type in test_types:
            test_patterns = await search_knowledge(
                f"{test_type} testing {test_target}",
                domain="testing",
                result_type="code_examples"
            )
            
            # 2. Generar tests específicos por tipo
            if test_type == "unit":
                generated_tests["unit"] = await generate_unit_tests(
                    test_target, test_patterns
                )
            elif test_type == "integration":
                generated_tests["integration"] = await generate_integration_tests(
                    test_target, test_patterns
                )
            elif test_type == "e2e":
                generated_tests["e2e"] = await generate_e2e_tests(
                    test_target, test_patterns
                )
                
        # 3. Generar configuración de test runner
        test_config = await generate_test_configuration(
            test_types, coverage_threshold
        )
        
        # 4. Generar scripts de CI/CD para tests
        ci_scripts = await generate_ci_test_scripts(test_types)
        
        return {
            **generated_tests,
            "test_config": test_config,
            "ci_scripts": ci_scripts,
            "coverage_config": await generate_coverage_config(coverage_threshold)
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "generate_comprehensive_tests")
```

## Patrones de Manejo de Errores y Logging

### Patrón de Manejo de Errores MCP

```python
async def handle_mcp_error(
    error: Exception, 
    operation: str,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Manejar errores de manera consistente en herramientas MCP.
    
    Args:
        error: Excepción capturada
        operation: Nombre de la operación que falló
        context: Contexto adicional para debugging
    """
    import traceback
    
    # 1. Log del error completo para debugging
    error_details = {
        "operation": operation,
        "error_type": type(error).__name__,
        "error_message": str(error),
        "traceback": traceback.format_exc(),
        "context": context or {}
    }
    
    # Log estructurado
    import logging
    logger = logging.getLogger("fullstack_mcp")
    logger.error(f"MCP operation failed: {operation}", extra=error_details)
    
    # 2. Determinar tipo de error y respuesta apropiada
    if "database" in str(error).lower():
        user_message = "Error de base de datos. Verifica la conexión y consulta."
    elif "auth" in str(error).lower():
        user_message = "Error de autenticación. Verifica permisos."
    elif "network" in str(error).lower():
        user_message = "Error de red. Verifica conectividad."
    else:
        user_message = f"Error en {operation}. Consulta logs para detalles."
    
    # 3. Retornar respuesta estructurada
    return {
        "success": False,
        "error": {
            "operation": operation,
            "message": user_message,
            "type": type(error).__name__,
            "timestamp": datetime.now().isoformat()
        },
        "suggestions": await generate_error_suggestions(error, operation)
    }
```

## Mejores Prácticas Full Stack

### Validación y Sanitización

```python
# Patrón de validación usando Zod (TypeScript) y Pydantic (Python)
from pydantic import BaseModel, validator
from typing import Optional, List

class ComponentGenerationRequest(BaseModel):
    """Modelo de validación para generación de componentes."""
    
    name: str
    component_type: str
    props: Optional[Dict[str, Any]] = None
    styling: str = "tailwind"
    
    @validator('name')
    def validate_component_name(cls, v):
        """Validar nombre de componente sigue convenciones."""
        import re
        if not re.match(r'^[A-Z][a-zA-Z0-9]*$', v):
            raise ValueError('Component name must be PascalCase')
        return v
    
    @validator('component_type')
    def validate_component_type(cls, v):
        """Validar tipo de componente es válido."""
        valid_types = ['form', 'display', 'layout', 'interactive']
        if v not in valid_types:
            raise ValueError(f'Component type must be one of: {valid_types}')
        return v
```

### Gestión de Contexto y Memoria

```python
# Gestión optimizada de contexto para mantener ventana limpia
class ContextManager:
    """Manager para optimizar uso de contexto en MCP."""
    
    def __init__(self):
        self.context_limit = 100000  # tokens
        self.priority_queue = []
        
    async def add_to_context(
        self, 
        content: str, 
        priority: int = 1,
        content_type: str = "general"
    ):
        """Agregar contenido al contexto con priorización."""
        
        # 1. Calcular tokens aproximados
        token_count = len(content.split()) * 1.3  # Estimación
        
        # 2. Verificar si excede límite
        if self._get_total_tokens() + token_count > self.context_limit:
            await self._cleanup_low_priority_content()
        
        # 3. Agregar con metadata
        context_item = {
            "content": content,
            "priority": priority,
            "type": content_type,
            "token_count": token_count,
            "timestamp": datetime.now()
        }
        
        self.priority_queue.append(context_item)
        
    async def _cleanup_low_priority_content(self):
        """Limpiar contenido de baja prioridad para liberar espacio."""
        
        # Ordenar por prioridad (mayor prioridad = más importante)
        self.priority_queue.sort(key=lambda x: (-x["priority"], x["timestamp"]))
        
        # Mantener solo los elementos de mayor prioridad
        total_tokens = 0
        kept_items = []
        
        for item in self.priority_queue:
            if total_tokens + item["token_count"] < self.context_limit * 0.8:
                kept_items.append(item)
                total_tokens += item["token_count"]
            else:
                break
                
        self.priority_queue = kept_items
```

## Integración con Herramientas Externas

### Patrón de Crawling Inteligente

```python
@app.tool()
async def crawl_and_update_knowledge(
    context: Context,
    urls: List[str],
    domain: str,
    update_frequency: str = "daily"
) -> Dict[str, Any]:
    """
    Crawlear URLs y actualizar knowledge base automáticamente.
    
    Args:
        urls: Lista de URLs a crawlear
        domain: Dominio de conocimiento (frontend, backend, etc.)
        update_frequency: Frecuencia de actualización
    """
    try:
        from utils import crawl_urls, add_documents_to_supabase
        
        # 1. Crawlear URLs con Crawl4AI
        crawled_content = await crawl_urls(urls)
        
        # 2. Procesar y estructurar contenido
        processed_content = await process_crawled_content(
            crawled_content, domain
        )
        
        # 3. Generar embeddings y agregar a Supabase
        await add_documents_to_supabase(processed_content)
        
        # 4. Actualizar knowledge graph con nuevas relaciones
        await update_knowledge_graph(processed_content, domain)
        
        # 5. Programar próxima actualización
        await schedule_next_crawl(urls, domain, update_frequency)
        
        return {
            "crawled_urls": len(urls),
            "documents_added": len(processed_content),
            "knowledge_updated": True,
            "next_crawl": await calculate_next_crawl_time(update_frequency)
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "crawl_and_update_knowledge")
```

Este documento proporciona los patrones principales para construir servidores MCP integrados con el stack Full Stack completo, asegurando desarrollo eficiente y de alta calidad.