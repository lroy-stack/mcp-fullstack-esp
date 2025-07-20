# Patrones de Desarrollo de Herramientas MCP

Esta guía documenta patrones probados para desarrollar herramientas MCP especializadas en el contexto del stack Full Stack (Next.js + Supabase + Neo4j). Basada en implementaciones exitosas del servidor `crawl4ai_mcp.py` y adaptada para desarrollo empresarial.

## Arquitectura de Herramientas MCP

### Patrón Base para Herramientas MCP

```python
from mcp.server.fastmcp import FastMCP, Context
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import asyncio
import logging

# Configuración del servidor base
app = FastMCP("Full Stack MCP Developer")

# Modelo de validación usando Pydantic
class ToolInput(BaseModel):
    """Modelo base para input de herramientas MCP."""
    
    param1: str = Field(..., description="Parámetro obligatorio")
    param2: Optional[int] = Field(None, description="Parámetro opcional")
    options: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Opciones adicionales")

@app.tool()
async def example_tool(
    context: Context,
    param1: str,
    param2: Optional[int] = None,
    options: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Herramienta MCP de ejemplo con patrón completo.
    
    Args:
        context: Contexto MCP automático
        param1: Parámetro principal obligatorio
        param2: Parámetro opcional con default
        options: Opciones adicionales como diccionario
        
    Returns:
        Resultado estructurado con éxito/error
    """
    try:
        # 1. Validación de entrada
        if not param1 or not param1.strip():
            return {
                "success": False,
                "error": "param1 no puede estar vacío",
                "error_type": "validation_error"
            }
        
        # 2. Lógica principal de la herramienta
        result = await perform_tool_operation(param1, param2, options)
        
        # 3. Logging para debugging
        logger = logging.getLogger("mcp_tools")
        logger.info(f"Tool executed successfully: {param1}")
        
        # 4. Retorno estructurado exitoso
        return {
            "success": True,
            "data": result,
            "metadata": {
                "tool_name": "example_tool",
                "execution_time": "calculated_time",
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as error:
        # 5. Manejo robusto de errores
        return await handle_tool_error(error, "example_tool", {
            "param1": param1,
            "param2": param2,
            "options": options
        })

async def perform_tool_operation(param1: str, param2: Optional[int], options: Dict[str, Any]) -> Any:
    """Lógica principal separada para testing y mantenibilidad."""
    # Implementación específica aquí
    pass

async def handle_tool_error(error: Exception, tool_name: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """Manejo consistente de errores en herramientas MCP."""
    import traceback
    
    logger = logging.getLogger("mcp_tools")
    logger.error(f"Tool {tool_name} failed", extra={
        "error": str(error),
        "error_type": type(error).__name__,
        "traceback": traceback.format_exc(),
        "context": context
    })
    
    return {
        "success": False,
        "error": f"Tool {tool_name} failed: {str(error)}",
        "error_type": type(error).__name__,
        "tool_name": tool_name
    }
```

## Herramientas MCP para Desarrollo Full Stack

### 1. Herramientas de Generación de Componentes

```python
@app.tool()
async def generate_react_component(
    context: Context,
    component_name: str,
    component_type: str,  # form, display, layout, interactive
    props_schema: Optional[Dict[str, Any]] = None,
    styling_system: str = "tailwind",
    include_tests: bool = True,
    include_storybook: bool = True
) -> Dict[str, Any]:
    """
    Generar componente React completo con tests y documentación.
    
    Esta herramienta usa el knowledge base para encontrar patrones similares
    y genera código optimizado siguiendo mejores prácticas.
    """
    try:
        # 1. Buscar patrones similares en knowledge base
        from utils import search_code_examples
        
        similar_components = await search_code_examples(
            f"React component {component_type} {component_name}",
            domain="frontend",
            limit=5
        )
        
        # 2. Generar componente usando Claude/OpenAI
        from anthropic_integration_guide import AnthropicClient
        
        anthropic = AnthropicClient()
        component_code = await anthropic.generate_react_component({
            "name": component_name,
            "type": component_type,
            "props": props_schema,
            "styling": styling_system
        }, similar_components)
        
        # 3. Generar archivos adicionales si se requieren
        generated_files = {
            "component": component_code["component"],
            "types": component_code["types"]
        }
        
        if include_tests:
            generated_files["tests"] = component_code["tests"]
            
        if include_storybook:
            generated_files["storybook"] = component_code["storybook"]
        
        # 4. Actualizar knowledge base con el nuevo componente
        await update_component_knowledge(component_name, component_code)
        
        return {
            "success": True,
            "component_name": component_name,
            "files_generated": generated_files,
            "metadata": {
                "similar_patterns_found": len(similar_components),
                "styling_system": styling_system,
                "includes_tests": include_tests,
                "includes_storybook": include_storybook
            }
        }
        
    except Exception as error:
        return await handle_tool_error(error, "generate_react_component", {
            "component_name": component_name,
            "component_type": component_type
        })

async def update_component_knowledge(component_name: str, component_code: Dict[str, str]):
    """Actualizar knowledge base con nuevo componente para aprendizaje continuo."""
    from utils import add_code_examples_to_supabase
    
    # Extraer información del componente para knowledge base
    component_info = {
        "name": component_name,
        "code": component_code["component"],
        "type": "react_component",
        "domain": "frontend",
        "metadata": {
            "framework": "react",
            "styling": "tailwind",
            "typescript": True
        }
    }
    
    await add_code_examples_to_supabase([component_info])
```

### 2. Herramientas de Generación de APIs

```python
@app.tool()
async def generate_nextjs_api(
    context: Context,
    endpoint_path: str,
    http_method: str,  # GET, POST, PUT, DELETE
    auth_level: str = "user",  # public, user, admin
    request_schema: Optional[Dict[str, Any]] = None,
    response_schema: Optional[Dict[str, Any]] = None,
    database_operations: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generar endpoint de API Next.js completo con validación, auth y tests.
    
    Args:
        endpoint_path: Ruta del endpoint (ej: /api/users/[id])
        http_method: Método HTTP
        auth_level: Nivel de autenticación requerido
        request_schema: Esquema de validación para request
        response_schema: Esquema de validación para response
        database_operations: Lista de operaciones de BD necesarias
    """
    try:
        # 1. Buscar patrones de API similares
        from utils import search_code_examples
        
        api_patterns = await search_code_examples(
            f"Next.js API {http_method} {auth_level}",
            domain="backend",
            limit=5
        )
        
        # 2. Generar código del endpoint
        from anthropic_integration_guide import FullStackCodeGenerator, AnthropicClient
        
        anthropic = AnthropicClient()
        code_generator = FullStackCodeGenerator(anthropic)
        
        api_spec = {
            "endpoint": endpoint_path,
            "method": http_method,
            "auth_level": auth_level,
            "request_schema": request_schema,
            "response_schema": response_schema,
            "database_operations": database_operations or []
        }
        
        api_code = await code_generator.generate_api_endpoint(api_spec, api_patterns)
        
        # 3. Generar configuración de middleware si es necesario
        middleware_config = await generate_api_middleware_config(auth_level)
        
        # 4. Generar tests de integración
        integration_tests = await generate_api_integration_tests(
            endpoint_path, http_method, request_schema
        )
        
        return {
            "success": True,
            "endpoint_path": endpoint_path,
            "generated_files": {
                "api_handler": api_code["handler"],
                "validation_schema": api_code["validation"],
                "middleware_config": middleware_config,
                "integration_tests": integration_tests
            },
            "metadata": {
                "http_method": http_method,
                "auth_level": auth_level,
                "database_operations": len(database_operations or []),
                "similar_patterns_found": len(api_patterns)
            }
        }
        
    except Exception as error:
        return await handle_tool_error(error, "generate_nextjs_api", {
            "endpoint_path": endpoint_path,
            "http_method": http_method,
            "auth_level": auth_level
        })

async def generate_api_middleware_config(auth_level: str) -> str:
    """Generar configuración de middleware según nivel de auth."""
    
    if auth_level == "public":
        return "// No authentication required"
    elif auth_level == "user":
        return """
// User authentication required
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function authenticate(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Authentication required")
  }
  return session
}
"""
    elif auth_level == "admin":
        return """
// Admin authentication required
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function authenticateAdmin(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return session
}
"""
```

### 3. Herramientas de Base de Datos

```python
@app.tool()
async def generate_database_schema(
    context: Context,
    table_name: str,
    fields: List[Dict[str, Any]],
    relationships: Optional[List[Dict[str, Any]]] = None,
    enable_rls: bool = True,
    generate_migrations: bool = True
) -> Dict[str, Any]:
    """
    Generar esquema de base de datos completo con Prisma, migraciones y RLS.
    
    Args:
        table_name: Nombre de la tabla
        fields: Lista de campos con tipo y constraints
        relationships: Relaciones con otras tablas
        enable_rls: Habilitar Row Level Security
        generate_migrations: Generar archivos de migración
    """
    try:
        # 1. Buscar esquemas similares en knowledge base
        from utils import search_documents
        
        similar_schemas = await search_documents(
            f"database schema {table_name}",
            domain="database",
            limit=3
        )
        
        # 2. Generar esquema Prisma
        prisma_schema = await generate_prisma_schema_code(
            table_name, fields, relationships
        )
        
        # 3. Generar migración SQL
        migration_sql = ""
        if generate_migrations:
            migration_sql = await generate_migration_sql_code(
                table_name, fields, relationships
            )
        
        # 4. Generar políticas RLS
        rls_policies = ""
        if enable_rls:
            rls_policies = await generate_rls_policies_code(
                table_name, fields
            )
        
        # 5. Generar tipos TypeScript
        typescript_types = await generate_typescript_types_code(
            table_name, fields, relationships
        )
        
        # 6. Generar datos semilla (seed)
        seed_data = await generate_seed_data_code(table_name, fields)
        
        return {
            "success": True,
            "table_name": table_name,
            "generated_files": {
                "prisma_schema": prisma_schema,
                "migration_sql": migration_sql,
                "rls_policies": rls_policies,
                "typescript_types": typescript_types,
                "seed_data": seed_data
            },
            "metadata": {
                "fields_count": len(fields),
                "relationships_count": len(relationships or []),
                "rls_enabled": enable_rls,
                "similar_schemas_found": len(similar_schemas)
            }
        }
        
    except Exception as error:
        return await handle_tool_error(error, "generate_database_schema", {
            "table_name": table_name,
            "fields_count": len(fields)
        })

async def generate_prisma_schema_code(
    table_name: str, 
    fields: List[Dict[str, Any]], 
    relationships: Optional[List[Dict[str, Any]]]
) -> str:
    """Generar código de esquema Prisma."""
    
    # Generar campos
    fields_code = []
    for field in fields:
        field_line = f"  {field['name']} {field['type']}"
        
        if field.get('primary_key'):
            field_line += " @id"
        if field.get('unique'):
            field_line += " @unique"
        if field.get('default'):
            field_line += f" @default({field['default']})"
        if field.get('auto_increment'):
            field_line += " @default(autoincrement())"
            
        fields_code.append(field_line)
    
    # Generar relaciones
    relations_code = []
    if relationships:
        for rel in relationships:
            rel_line = f"  {rel['name']} {rel['type']}"
            if rel.get('foreign_key'):
                rel_line += f" @relation(fields: [{rel['foreign_key']}], references: [id])"
            relations_code.append(rel_line)
    
    # Combinar todo
    schema_code = f"""
model {table_name.capitalize()} {{
{chr(10).join(fields_code)}
{chr(10).join(relations_code) if relations_code else ''}

  @@map("{table_name}")
}}
"""
    
    return schema_code.strip()
```

## Herramientas de Knowledge Management

### 4. Herramientas de Búsqueda y RAG

```python
@app.tool()
async def search_knowledge_base(
    context: Context,
    query: str,
    domain: str = "fullstack",  # frontend, backend, database, testing
    result_type: str = "code_examples",  # code_examples, documentation, patterns
    limit: int = 10,
    similarity_threshold: float = 0.7
) -> Dict[str, Any]:
    """
    Buscar en knowledge base usando embeddings semánticos.
    
    Esta herramienta usa Supabase + pgvector para búsqueda semántica
    y aplica reranking para mejorar relevancia.
    """
    try:
        from utils import search_documents, search_code_examples
        
        # 1. Buscar según tipo de resultado
        if result_type == "code_examples":
            results = await search_code_examples(
                query, domain=domain, limit=limit
            )
        else:
            results = await search_documents(
                query, domain=domain, limit=limit
            )
        
        # 2. Filtrar por threshold de similitud
        filtered_results = [
            result for result in results 
            if result.get("similarity_score", 0) >= similarity_threshold
        ]
        
        # 3. Aplicar reranking si hay suficientes resultados
        if len(filtered_results) > 3:
            filtered_results = await apply_cross_encoder_reranking(
                query, filtered_results
            )
        
        # 4. Formatear resultados para uso MCP
        formatted_results = []
        for result in filtered_results:
            formatted_results.append({
                "content": result["content"],
                "relevance_score": result.get("similarity_score", 0),
                "source": result["metadata"].get("source", "unknown"),
                "domain": result["metadata"].get("domain", domain),
                "type": result["metadata"].get("type", result_type),
                "last_updated": result["metadata"].get("last_updated")
            })
        
        return {
            "success": True,
            "query": query,
            "results": formatted_results,
            "metadata": {
                "total_found": len(results),
                "after_filtering": len(filtered_results),
                "domain": domain,
                "result_type": result_type,
                "similarity_threshold": similarity_threshold
            }
        }
        
    except Exception as error:
        return await handle_tool_error(error, "search_knowledge_base", {
            "query": query,
            "domain": domain,
            "result_type": result_type
        })

async def apply_cross_encoder_reranking(query: str, results: List[Dict]) -> List[Dict]:
    """Aplicar reranking usando cross-encoder para mejor relevancia."""
    
    try:
        from sentence_transformers import CrossEncoder
        
        # Inicializar cross-encoder (usar modelo cache si está disponible)
        model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        
        # Preparar pares query-documento
        query_doc_pairs = []
        for result in results:
            query_doc_pairs.append([query, result["content"]])
        
        # Calcular scores de relevancia
        relevance_scores = model.predict(query_doc_pairs)
        
        # Combinar scores con resultados
        for i, result in enumerate(results):
            result["rerank_score"] = float(relevance_scores[i])
        
        # Ordenar por relevancia
        return sorted(results, key=lambda x: x["rerank_score"], reverse=True)
        
    except Exception as e:
        # Si falla reranking, devolver resultados originales
        logging.warning(f"Reranking failed: {e}")
        return results
```

### 5. Herramientas de Knowledge Graph

```python
@app.tool()
async def query_knowledge_graph(
    context: Context,
    query_type: str,  # dependencies, patterns, impacts, recommendations
    entity_name: str,
    entity_type: str = "component",  # component, api, schema, pattern
    depth: int = 2,
    include_metadata: bool = True
) -> Dict[str, Any]:
    """
    Consultar knowledge graph Neo4j para relaciones arquitectónicas.
    
    Args:
        query_type: Tipo de consulta a realizar
        entity_name: Nombre de la entidad a consultar
        entity_type: Tipo de entidad
        depth: Profundidad de relaciones a explorar
        include_metadata: Incluir metadata de nodos y relaciones
    """
    try:
        # 1. Validar configuración Neo4j
        if not validate_neo4j_connection():
            return {
                "success": False,
                "error": "Neo4j not configured. Check NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD",
                "error_type": "configuration_error"
            }
        
        # 2. Construir consulta Cypher según tipo
        cypher_query, params = build_cypher_query(
            query_type, entity_name, entity_type, depth
        )
        
        # 3. Ejecutar consulta en Neo4j
        from knowledge_graphs.neo4j_client import execute_cypher_query
        
        results = await execute_cypher_query(cypher_query, params)
        
        # 4. Procesar resultados
        processed_results = process_graph_results(results, include_metadata)
        
        # 5. Generar insights arquitectónicos
        insights = await generate_architectural_insights(
            query_type, entity_name, processed_results
        )
        
        return {
            "success": True,
            "query_type": query_type,
            "entity": {
                "name": entity_name,
                "type": entity_type
            },
            "results": processed_results,
            "insights": insights,
            "metadata": {
                "depth": depth,
                "nodes_found": len(processed_results.get("nodes", [])),
                "relationships_found": len(processed_results.get("relationships", []))
            }
        }
        
    except Exception as error:
        return await handle_tool_error(error, "query_knowledge_graph", {
            "query_type": query_type,
            "entity_name": entity_name,
            "entity_type": entity_type
        })

def build_cypher_query(query_type: str, entity_name: str, entity_type: str, depth: int) -> tuple:
    """Construir consulta Cypher específica según el tipo."""
    
    base_queries = {
        "dependencies": f"""
            MATCH (n:{entity_type.capitalize()} {{name: $entity_name}})
            OPTIONAL MATCH (n)-[r:DEPENDS_ON*1..{depth}]->(dep)
            RETURN n, r, dep, type(r) as rel_type
        """,
        
        "patterns": f"""
            MATCH (n:{entity_type.capitalize()} {{name: $entity_name}})
            OPTIONAL MATCH (n)-[:IMPLEMENTS|USES]->(pattern:Pattern)
            RETURN n, pattern, pattern.description, pattern.examples
        """,
        
        "impacts": f"""
            MATCH (n:{entity_type.capitalize()} {{name: $entity_name}})
            OPTIONAL MATCH (dependent)-[r:DEPENDS_ON*1..{depth}]->(n)
            RETURN n, dependent, r, labels(dependent) as types
        """,
        
        "recommendations": f"""
            MATCH (n:{entity_type.capitalize()} {{name: $entity_name}})
            OPTIONAL MATCH (n)-[:SIMILAR_TO]-(similar)
            OPTIONAL MATCH (similar)-[:IMPLEMENTS]->(recommendation:Pattern)
            WHERE recommendation.confidence > 0.8
            RETURN recommendation, recommendation.description, recommendation.benefits
        """
    }
    
    query = base_queries.get(query_type, base_queries["dependencies"])
    params = {"entity_name": entity_name}
    
    return query, params

async def generate_architectural_insights(
    query_type: str, 
    entity_name: str, 
    results: Dict[str, Any]
) -> List[str]:
    """Generar insights arquitectónicos basados en resultados del grafo."""
    
    insights = []
    
    nodes_count = len(results.get("nodes", []))
    relationships_count = len(results.get("relationships", []))
    
    if query_type == "dependencies":
        if nodes_count > 5:
            insights.append(f"{entity_name} tiene una alta complejidad de dependencias ({nodes_count} nodos)")
        if relationships_count > 10:
            insights.append("Considerar refactoring para reducir acoplamiento")
            
    elif query_type == "impacts":
        if nodes_count > 3:
            insights.append(f"Cambios en {entity_name} afectarían {nodes_count} componentes")
            insights.append("Recomendado: tests de regresión extensivos antes de modificar")
            
    elif query_type == "patterns":
        patterns_found = len([n for n in results.get("nodes", []) if n.get("type") == "Pattern"])
        if patterns_found == 0:
            insights.append(f"{entity_name} no sigue patrones arquitectónicos conocidos")
            insights.append("Recomendado: aplicar patrones establecidos para mejorar mantenibilidad")
    
    return insights
```

## Herramientas de Testing y Validación

### 6. Herramientas de Generación de Tests

```python
@app.tool()
async def generate_comprehensive_tests(
    context: Context,
    target_name: str,
    target_type: str,  # component, api, schema, page
    test_types: List[str] = ["unit", "integration"],  # unit, integration, e2e
    coverage_threshold: int = 80,
    include_accessibility: bool = True
) -> Dict[str, Any]:
    """
    Generar suite completa de tests para un objetivo específico.
    
    Args:
        target_name: Nombre del objetivo a testear
        target_type: Tipo del objetivo
        test_types: Tipos de test a generar
        coverage_threshold: Umbral mínimo de cobertura
        include_accessibility: Incluir tests de accesibilidad
    """
    try:
        # 1. Buscar patrones de testing similares
        from utils import search_code_examples
        
        test_patterns = {}
        for test_type in test_types:
            patterns = await search_code_examples(
                f"{test_type} testing {target_type} {target_name}",
                domain="testing",
                limit=3
            )
            test_patterns[test_type] = patterns
        
        # 2. Generar tests por tipo
        generated_tests = {}
        
        for test_type in test_types:
            if test_type == "unit":
                generated_tests["unit"] = await generate_unit_tests(
                    target_name, target_type, test_patterns["unit"]
                )
            elif test_type == "integration":
                generated_tests["integration"] = await generate_integration_tests(
                    target_name, target_type, test_patterns["integration"]
                )
            elif test_type == "e2e":
                generated_tests["e2e"] = await generate_e2e_tests(
                    target_name, target_type, test_patterns.get("e2e", [])
                )
        
        # 3. Generar tests de accesibilidad si se requieren
        if include_accessibility and target_type in ["component", "page"]:
            generated_tests["accessibility"] = await generate_accessibility_tests(
                target_name, target_type
            )
        
        # 4. Generar configuración de test runner
        test_config = await generate_test_runner_config(
            test_types, coverage_threshold
        )
        
        return {
            "success": True,
            "target": {
                "name": target_name,
                "type": target_type
            },
            "generated_tests": generated_tests,
            "test_config": test_config,
            "metadata": {
                "test_types": test_types,
                "coverage_threshold": coverage_threshold,
                "accessibility_included": include_accessibility,
                "patterns_used": sum(len(patterns) for patterns in test_patterns.values())
            }
        }
        
    except Exception as error:
        return await handle_tool_error(error, "generate_comprehensive_tests", {
            "target_name": target_name,
            "target_type": target_type,
            "test_types": test_types
        })

async def generate_unit_tests(target_name: str, target_type: str, patterns: List[Dict]) -> str:
    """Generar tests unitarios específicos."""
    
    if target_type == "component":
        return f"""
import {{ render, screen, fireEvent, waitFor }} from '@testing-library/react'
import {{ vi }} from 'vitest'
import {{ {target_name} }} from './{target_name}'

describe('{target_name}', () => {{
  it('should render without crashing', () => {{
    render(<{target_name} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  }})

  it('should handle user interactions correctly', async () => {{
    const mockHandler = vi.fn()
    render(<{target_name} onAction={{mockHandler}} />)
    
    const actionButton = screen.getByRole('button', {{ name: /action/i }})
    fireEvent.click(actionButton)
    
    await waitFor(() => {{
      expect(mockHandler).toHaveBeenCalledTimes(1)
    }})
  }})

  it('should display correct content', () => {{
    const props = {{ title: 'Test Title', content: 'Test Content' }}
    render(<{target_name} {{...props}} />)
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  }})
}})
"""
    
    elif target_type == "api":
        return f"""
import {{ describe, it, expect, beforeEach, vi }} from 'vitest'
import {{ createMocks }} from 'node-mocks-http'
import handler from './api/{target_name}'

describe('/api/{target_name}', () => {{
  beforeEach(() => {{
    vi.clearAllMocks()
  }})

  it('should handle GET requests', async () => {{
    const {{ req, res }} = createMocks({{ method: 'GET' }})
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('success', true)
  }})

  it('should validate request body for POST requests', async () => {{
    const {{ req, res }} = createMocks({{
      method: 'POST',
      body: {{ /* invalid data */ }}
    }})
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(400)
  }})

  it('should require authentication', async () => {{
    const {{ req, res }} = createMocks({{ method: 'POST' }})
    // No auth headers
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(401)
  }})
}})
"""
    
    return f"// Unit tests for {target_type} {target_name}"
```

## Mejores Prácticas y Patrones Avanzados

### Gestión de Estado de Herramientas

```python
class ToolStateManager:
    """Manager para estado compartido entre herramientas MCP."""
    
    def __init__(self):
        self.shared_state = {}
        self.tool_cache = {}
        
    async def get_cached_result(self, tool_name: str, params_hash: str) -> Optional[Dict[str, Any]]:
        """Obtener resultado cacheado de herramienta."""
        cache_key = f"{tool_name}:{params_hash}"
        return self.tool_cache.get(cache_key)
    
    async def cache_result(self, tool_name: str, params_hash: str, result: Dict[str, Any]):
        """Cachear resultado de herramienta."""
        cache_key = f"{tool_name}:{params_hash}"
        self.tool_cache[cache_key] = {
            "result": result,
            "timestamp": datetime.now(),
            "ttl": 3600  # 1 hora
        }
    
    async def cleanup_expired_cache(self):
        """Limpiar cache expirado."""
        now = datetime.now()
        expired_keys = []
        
        for key, data in self.tool_cache.items():
            if (now - data["timestamp"]).seconds > data["ttl"]:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.tool_cache[key]

# Instancia global del manager
tool_state_manager = ToolStateManager()
```

### Logging y Monitoreo de Herramientas

```python
import structlog
from datetime import datetime
from typing import Dict, Any

def setup_tool_logging():
    """Configurar logging estructurado para herramientas MCP."""
    
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

def log_tool_execution(tool_name: str, params: Dict[str, Any], result: Dict[str, Any], execution_time: float):
    """Log estructurado de ejecución de herramientas."""
    
    logger = structlog.get_logger("mcp_tools")
    
    log_data = {
        "tool_name": tool_name,
        "execution_time_ms": execution_time * 1000,
        "success": result.get("success", False),
        "params_hash": hash(str(sorted(params.items()))),
        "result_size": len(str(result)),
        "timestamp": datetime.now().isoformat()
    }
    
    if result.get("success"):
        logger.info("Tool executed successfully", **log_data)
    else:
        logger.error("Tool execution failed", 
                    error=result.get("error", "Unknown error"),
                    **log_data)

# Decorator para logging automático
def log_tool_execution_decorator(func):
    """Decorator para logging automático de herramientas."""
    
    async def wrapper(*args, **kwargs):
        tool_name = func.__name__
        start_time = time.time()
        
        try:
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            log_tool_execution(tool_name, kwargs, result, execution_time)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            error_result = {"success": False, "error": str(e)}
            
            log_tool_execution(tool_name, kwargs, error_result, execution_time)
            
            raise
    
    return wrapper
```

Esta documentación proporciona patrones robustos y probados para desarrollar herramientas MCP específicas para el stack Full Stack, con énfasis en calidad empresarial, mantenibilidad y extensibilidad.