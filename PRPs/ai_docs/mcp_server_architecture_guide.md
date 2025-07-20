# Guía de Arquitectura de Servidores MCP

Arquitectura modular para servidores MCP Full Stack basada en implementaciones probadas del stack Next.js + Supabase + Neo4j.

## Patrón Base de Servidor MCP

```python
# Servidor MCP con capacidades Full Stack
from mcp.server.fastmcp import FastMCP
from utils import get_supabase_client, search_documents

app = FastMCP("Full Stack MCP Developer")

@app.tool()
async def generate_component(
    component_name: str,
    component_type: str,
    props: Optional[Dict] = None
) -> Dict[str, Any]:
    """Generar componente React basado en ejemplos probados."""
    
    # 1. Buscar patrones similares
    examples = await search_documents(
        f"React {component_type} {component_name}",
        domain="frontend"
    )
    
    # 2. Usar ejemplos como base
    return await create_component_from_examples(examples)
```

## Referencias a Implementaciones

### **Patrones de Herramientas MCP**
- **Archivo**: `exemplos/database-tools-es.ts`
- **Uso**: Patrones probados para herramientas de base de datos
- **Referencia**: Líneas 19-130 (registro de herramientas)

### **Integración con Anthropic**
- **Archivo**: `PRPs/ai_docs/anthropic_integration_guide.md`  
- **Uso**: Cliente y patrones de API
- **Referencia**: Secciones de AnthropicClient y PRPParser

### **Arquitectura Full Stack**
- **Archivo**: `PRPs/ai_docs/fullstack_tool_architecture.md`
- **Uso**: Arquitectura modular de herramientas
- **Referencia**: Sistema de registro centralizado

## Validación MCP

### **Testing de Herramientas**
- **Directorio**: `ejemplos/testing/`
- **Files**: `api.test.ts`, `component.test.tsx`, `e2e.spec.ts`
- **Uso**: Patrones de testing para herramientas MCP

### **Configuración de Entorno**
- **Archivo**: `config/templates/.env.mcp.template`
- **Uso**: Variables requeridas para servidor MCP
- **Validación**: `scripts/validate-setup.ts`

## Knowledge Graph Integration

### **Neo4j para Relaciones**
- **Archivo**: `PRPs/ai_docs/fullstack_knowledge_graph.md`
- **Uso**: Consultas Cypher para insights arquitectónicos
- **Ejemplos**: Patrones de consulta por tipo de relación

### **RAG con Supabase**
- **Archivo**: `PRPs/ai_docs/rag_knowledge_patterns.md`
- **Uso**: Búsqueda semántica con pgvector
- **Implementación**: `src/utils.py` funciones RAG

## Comandos y Workflows

### **SuperClaude Integration**
- **Archivo**: `PRPs/ai_docs/superclaude_commands_guide.md`
- **Uso**: Comandos específicos para desarrollo MCP
- **Patterns**: Personas y flags para cada fase

### **Prerequisites y Setup**
- **Archivo**: `PRPs/ai_docs/setup_prerequisites_guide.md`
- **Uso**: Configuración completa antes de implementar
- **Scripts**: Validación automatizada

Esta guía actúa como **índice referencial** - cada sección apunta a documentación existente en lugar de duplicar contenido.