# Desarrollo de Herramientas MCP

Este documento define los patrones obligatorios para desarrollar herramientas MCP (Model Context Protocol) especializadas para el **Servidor MCP Full Stack Developer**.

## 🛠️ Arquitectura de Herramientas MCP

### **Stack de Desarrollo MCP**
```typescript
// Tecnologías OBLIGATORIAS para herramientas MCP
const MCP_DEVELOPMENT_STACK = {
  framework: "FastMCP",                    // Framework MCP oficial
  runtime: "Python 3.11+",               // Runtime principal
  validation: "Pydantic v2",              // Validación de datos
  async: "asyncio + aiohttp",            // Programación asíncrona
  database: "asyncpg + SQLModel",        // Database async
  testing: "pytest + pytest-asyncio",    // Testing framework
  deployment: "Docker + Cloud Run",      // Despliegue
} as const;
```

### **Herramientas Obligatorias (14 herramientas mínimas)**
```typescript
const REQUIRED_MCP_TOOLS = {
  // 🔍 Parsing & Analysis
  "parse-prp": "Analizar y procesar Product Requirement Prompts",
  "analyze-requirements": "Extraer y validar requerimientos técnicos",
  
  // 🏗️ Code Generation
  "generate-component": "Generar componentes React con Shadcn/ui",
  "generate-page": "Crear páginas Next.js App Router completas",
  "generate-api": "Generar API Routes con validación y auth",
  "generate-database": "Crear esquemas Prisma y migraciones",
  
  // 🔄 Full Stack Operations
  "setup-fullstack": "Configurar proyecto Next.js + Supabase completo",
  "deploy-application": "Desplegar aplicación a Vercel + Supabase",
  
  // 🧠 Knowledge Management
  "search-knowledge": "Buscar en base de conocimiento con RAG",
  "update-knowledge": "Actualizar base de conocimiento",
  "query-graph": "Consultar knowledge graph Neo4j",
  
  // 🔧 Development Tools
  "run-tests": "Ejecutar tests y generar reportes",
  "lint-fix": "Ejecutar linting y auto-fix",
  "optimize-performance": "Analizar y optimizar performance",
} as const;
```

## 🏗️ Base Architecture Pattern

### **MCP Tool Base Class**
```python
# Patrón base obligatorio para todas las herramientas MCP
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from fastmcp import FastMCP, Context
import asyncio
import logging

# Configuración base
class MCPToolConfig(BaseModel):
    name: str = Field(..., description="Nombre único de la herramienta")
    description: str = Field(..., description="Descripción para el LLM")
    version: str = Field(default="1.0.0", description="Versión de la herramienta")
    requires_auth: bool = Field(default=True, description="Requiere autenticación")
    rate_limit: int = Field(default=100, description="Límite de requests por hora")
    timeout: int = Field(default=30, description="Timeout en segundos")

class MCPToolBase:
    """Clase base obligatoria para todas las herramientas MCP"""
    
    def __init__(self, config: MCPToolConfig):
        self.config = config
        self.logger = logging.getLogger(f"mcp.{config.name}")
        self.knowledge_engine = None  # Se inicializa en setup()
        
    async def setup(self, context: Context) -> None:
        """Inicialización de la herramienta"""
        # 1. Inicializar conexiones
        await self._setup_database()
        await self._setup_knowledge_engine()
        await self._setup_external_services()
        
        # 2. Validar configuración
        await self._validate_config()
        
        self.logger.info(f"Tool {self.config.name} v{self.config.version} initialized")
    
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Método principal de ejecución - DEBE ser implementado"""
        raise NotImplementedError("execute() must be implemented by subclass")
    
    async def validate_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validación de entrada - OBLIGATORIO implementar"""
        raise NotImplementedError("validate_input() must be implemented")
    
    async def search_knowledge(self, query: str, context: Dict[str, Any]) -> List[Dict]:
        """Búsqueda en base de conocimiento - disponible para todas las herramientas"""
        if not self.knowledge_engine:
            return []
            
        return await self.knowledge_engine.search(
            query=query,
            domain=context.get('domain'),
            technology=context.get('technology'),
            max_results=5
        )
    
    async def update_knowledge(self, content: str, metadata: Dict[str, Any]) -> bool:
        """Actualizar base de conocimiento - disponible para todas las herramientas"""
        if not self.knowledge_engine:
            return False
            
        return await self.knowledge_engine.ingest(
            content=content,
            metadata=metadata,
            source='mcp_tool'
        )
    
    async def cleanup(self) -> None:
        """Limpieza de recursos"""
        try:
            if hasattr(self, 'db_pool'):
                await self.db_pool.close()
            if hasattr(self, 'http_session'):
                await self.http_session.close()
            self.logger.info(f"Tool {self.config.name} cleaned up successfully")
        except Exception as e:
            self.logger.error(f"Cleanup error: {e}")
    
    # Métodos privados para inicialización
    async def _setup_database(self) -> None:
        """Configurar conexión a base de datos"""
        pass  # Implementar según necesidades
    
    async def _setup_knowledge_engine(self) -> None:
        """Configurar motor de conocimiento RAG"""
        from .knowledge_engine import KnowledgeEngine
        self.knowledge_engine = KnowledgeEngine()
        await self.knowledge_engine.initialize()
    
    async def _setup_external_services(self) -> None:
        """Configurar servicios externos"""
        pass  # Implementar según necesidades
    
    async def _validate_config(self) -> None:
        """Validar configuración de la herramienta"""
        required_env = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
        missing = [env for env in required_env if not os.getenv(env)]
        if missing:
            raise ValueError(f"Missing required environment variables: {missing}")
```

### **Input/Output Validation Pattern**
```python
# Patrón obligatorio para validación de entrada/salida
from pydantic import BaseModel, Field, validator
from typing import Any, Dict, List, Optional, Union
from enum import Enum

class DomainType(str, Enum):
    FRONTEND = "frontend"
    BACKEND = "backend" 
    FULLSTACK = "fullstack"
    DEVOPS = "devops"

class TechnologyType(str, Enum):
    NEXTJS = "nextjs"
    SUPABASE = "supabase"
    PRISMA = "prisma"
    TAILWIND = "tailwind"
    TYPESCRIPT = "typescript"

class ComplexityLevel(str, Enum):
    BEGINNER = "beginner"
    MEDIUM = "medium"
    ADVANCED = "advanced"

# Schema base para todas las herramientas
class MCPToolInput(BaseModel):
    """Schema base para input de herramientas MCP"""
    domain: DomainType = Field(..., description="Dominio de aplicación")
    technology: TechnologyType = Field(..., description="Tecnología principal")
    complexity: ComplexityLevel = Field(default=ComplexityLevel.MEDIUM)
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('context')
    def validate_context(cls, v):
        if v is None:
            return {}
        if not isinstance(v, dict):
            raise ValueError('Context must be a dictionary')
        return v

class MCPToolOutput(BaseModel):
    """Schema base para output de herramientas MCP"""
    success: bool = Field(..., description="Indica si la operación fue exitosa")
    data: Optional[Any] = Field(default=None, description="Datos de respuesta")
    error: Optional[str] = Field(default=None, description="Mensaje de error si aplica")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos adicionales")
    execution_time: Optional[float] = Field(default=None, description="Tiempo de ejecución en segundos")
    
    @validator('error')
    def validate_error_with_success(cls, v, values):
        if not values.get('success', True) and not v:
            raise ValueError('Error message required when success is False')
        return v
```

## 🔧 Herramientas Específicas - Patterns

### **1. parse-prp Tool**
```python
# Herramienta para parsear Product Requirement Prompts
from typing import List, Dict, Any
import re
import json

class PRPSection(BaseModel):
    section_type: str = Field(..., description="Tipo de sección (OBJETIVO, TECH_STACK, etc.)")
    content: str = Field(..., description="Contenido de la sección")
    requirements: List[str] = Field(default_factory=list, description="Requerimientos extraídos")

class ParsePRPInput(MCPToolInput):
    prp_content: str = Field(..., description="Contenido del PRP a analizar", min_length=100)
    extract_requirements: bool = Field(default=True, description="Extraer requerimientos específicos")
    validate_structure: bool = Field(default=True, description="Validar estructura del PRP")

class ParsePRPOutput(MCPToolOutput):
    sections: List[PRPSection] = Field(default_factory=list)
    tech_stack: Dict[str, List[str]] = Field(default_factory=dict)
    requirements: List[str] = Field(default_factory=list)
    validation_errors: List[str] = Field(default_factory=list)

class ParsePRPTool(MCPToolBase):
    def __init__(self):
        config = MCPToolConfig(
            name="parse-prp",
            description="Analiza y extrae información estructurada de Product Requirement Prompts",
            version="1.0.0"
        )
        super().__init__(config)
    
    async def validate_input(self, input_data: Dict[str, Any]) -> ParsePRPInput:
        return ParsePRPInput(**input_data)
    
    async def execute(self, **kwargs) -> ParsePRPOutput:
        try:
            # 1. Validar entrada
            validated_input = await self.validate_input(kwargs)
            
            # 2. Buscar conocimiento relevante sobre PRPs
            knowledge_context = await self.search_knowledge(
                query="PRP structure analysis product requirements",
                context={'domain': validated_input.domain, 'technology': 'prp'}
            )
            
            # 3. Parsear estructura del PRP
            sections = await self._parse_prp_sections(validated_input.prp_content)
            
            # 4. Extraer tech stack
            tech_stack = await self._extract_tech_stack(sections, knowledge_context)
            
            # 5. Extraer requerimientos
            requirements = []
            if validated_input.extract_requirements:
                requirements = await self._extract_requirements(sections)
            
            # 6. Validar estructura
            validation_errors = []
            if validated_input.validate_structure:
                validation_errors = await self._validate_prp_structure(sections)
            
            # 7. Actualizar conocimiento con el análisis
            await self.update_knowledge(
                content=f"PRP Analysis: {validated_input.prp_content[:500]}...",
                metadata={
                    'tool': 'parse-prp',
                    'domain': validated_input.domain,
                    'sections_count': len(sections),
                    'requirements_count': len(requirements)
                }
            )
            
            return ParsePRPOutput(
                success=True,
                data={
                    'sections': sections,
                    'tech_stack': tech_stack,
                    'requirements': requirements,
                    'validation_errors': validation_errors
                },
                sections=sections,
                tech_stack=tech_stack,
                requirements=requirements,
                validation_errors=validation_errors
            )
            
        except Exception as e:
            self.logger.error(f"PRP parsing error: {e}")
            return ParsePRPOutput(
                success=False,
                error=str(e),
                sections=[],
                tech_stack={},
                requirements=[],
                validation_errors=[]
            )
    
    async def _parse_prp_sections(self, content: str) -> List[PRPSection]:
        """Parsear secciones del PRP usando patrones regex"""
        sections = []
        
        # Patrones para identificar secciones
        section_patterns = {
            'OBJETIVO': r'##\s*OBJETIVO[:\s]*(.*?)(?=##|\Z)',
            'TECH_STACK': r'##\s*TECH[_\s]*STACK[:\s]*(.*?)(?=##|\Z)',
            'FEATURES': r'##\s*FEATURES?[:\s]*(.*?)(?=##|\Z)',
            'REQUIREMENTS': r'##\s*REQUIREMENTS?[:\s]*(.*?)(?=##|\Z)',
            'IMPLEMENTATION': r'##\s*IMPLEMENTATION[:\s]*(.*?)(?=##|\Z)',
        }
        
        for section_type, pattern in section_patterns.items():
            matches = re.finditer(pattern, content, re.DOTALL | re.IGNORECASE)
            for match in matches:
                section_content = match.group(1).strip()
                if section_content:
                    # Extraer requerimientos de la sección
                    requirements = self._extract_section_requirements(section_content)
                    
                    sections.append(PRPSection(
                        section_type=section_type,
                        content=section_content,
                        requirements=requirements
                    ))
        
        return sections
    
    async def _extract_tech_stack(self, sections: List[PRPSection], context: List[Dict]) -> Dict[str, List[str]]:
        """Extraer tecnologías organizadas por categoría"""
        tech_stack = {
            'frontend': [],
            'backend': [],
            'database': [],
            'auth': [],
            'deployment': [],
            'testing': []
        }
        
        # Buscar en secciones TECH_STACK específicamente
        for section in sections:
            if section.section_type == 'TECH_STACK':
                # Usar contexto de conocimiento para identificar tecnologías
                tech_stack.update(await self._categorize_technologies(section.content, context))
        
        return tech_stack
    
    async def _extract_requirements(self, sections: List[PRPSection]) -> List[str]:
        """Extraer lista de requerimientos específicos"""
        requirements = []
        
        for section in sections:
            # Buscar patrones de requerimientos
            req_patterns = [
                r'[-*]\s*(.+?)(?=\n|$)',  # Lista con bullets
                r'\d+\.\s*(.+?)(?=\n|$)',  # Lista numerada
                r'DEBE\s+(.+?)(?=\n|$)',   # Requerimientos explícitos
                r'OBLIGATORIO[:\s]*(.+?)(?=\n|$)',  # Obligatorios
            ]
            
            for pattern in req_patterns:
                matches = re.finditer(pattern, section.content, re.IGNORECASE)
                for match in matches:
                    req = match.group(1).strip()
                    if len(req) > 10 and req not in requirements:  # Filtrar reqs muy cortos
                        requirements.append(req)
        
        return requirements
    
    async def _validate_prp_structure(self, sections: List[PRPSection]) -> List[str]:
        """Validar que el PRP tiene la estructura correcta"""
        errors = []
        
        # Secciones obligatorias
        required_sections = ['OBJETIVO', 'TECH_STACK']
        found_sections = [s.section_type for s in sections]
        
        for required in required_sections:
            if required not in found_sections:
                errors.append(f"Missing required section: {required}")
        
        # Validar contenido mínimo
        for section in sections:
            if len(section.content) < 50:
                errors.append(f"Section {section.section_type} has insufficient content")
        
        return errors
```

### **2. generate-component Tool**
```python
# Herramienta para generar componentes React
from pathlib import Path
import tempfile

class ComponentSpec(BaseModel):
    name: str = Field(..., description="Nombre del componente (PascalCase)")
    type: str = Field(..., description="Tipo: form|display|layout|interactive|data")
    props: List[Dict[str, Any]] = Field(default_factory=list, description="Props del componente")
    styling: Dict[str, str] = Field(default_factory=dict, description="Configuración de estilos")
    accessibility: Dict[str, Any] = Field(default_factory=dict, description="Configuración A11Y")

class GenerateComponentInput(MCPToolInput):
    component_spec: ComponentSpec = Field(..., description="Especificación del componente")
    output_directory: Optional[str] = Field(default=None, description="Directorio de salida")
    include_tests: bool = Field(default=True, description="Incluir archivos de test")
    include_stories: bool = Field(default=False, description="Incluir Storybook stories")

class GenerateComponentOutput(MCPToolOutput):
    component_path: str = Field(..., description="Ruta del componente generado")
    test_path: Optional[str] = Field(default=None, description="Ruta de los tests")
    story_path: Optional[str] = Field(default=None, description="Ruta de las stories")
    generated_files: List[str] = Field(default_factory=list, description="Archivos generados")

class GenerateComponentTool(MCPToolBase):
    def __init__(self):
        config = MCPToolConfig(
            name="generate-component",
            description="Genera componentes React con Shadcn/ui, TypeScript y tests",
            version="1.0.0"
        )
        super().__init__(config)
    
    async def validate_input(self, input_data: Dict[str, Any]) -> GenerateComponentInput:
        return GenerateComponentInput(**input_data)
    
    async def execute(self, **kwargs) -> GenerateComponentOutput:
        try:
            validated_input = await self.validate_input(kwargs)
            spec = validated_input.component_spec
            
            # 1. Buscar patrones de componentes similares
            knowledge_context = await self.search_knowledge(
                query=f"React component {spec.type} {spec.name} patterns",
                context={'domain': 'frontend', 'technology': 'react'}
            )
            
            # 2. Generar código del componente
            component_code = await self._generate_component_code(spec, knowledge_context)
            
            # 3. Generar tests si se solicita
            test_code = None
            if validated_input.include_tests:
                test_code = await self._generate_test_code(spec, component_code)
            
            # 4. Generar stories si se solicita
            story_code = None
            if validated_input.include_stories:
                story_code = await self._generate_story_code(spec, component_code)
            
            # 5. Escribir archivos
            output_dir = validated_input.output_directory or tempfile.mkdtemp()
            files_created = await self._write_component_files(
                spec, component_code, test_code, story_code, output_dir
            )
            
            # 6. Actualizar base de conocimiento
            await self.update_knowledge(
                content=f"Generated React component: {spec.name}\n{component_code[:500]}...",
                metadata={
                    'tool': 'generate-component',
                    'component_name': spec.name,
                    'component_type': spec.type,
                    'domain': 'frontend',
                    'technology': 'react'
                }
            )
            
            return GenerateComponentOutput(
                success=True,
                component_path=files_created['component'],
                test_path=files_created.get('test'),
                story_path=files_created.get('story'),
                generated_files=list(files_created.values()),
                data=files_created
            )
            
        except Exception as e:
            self.logger.error(f"Component generation error: {e}")
            return GenerateComponentOutput(
                success=False,
                error=str(e),
                component_path="",
                generated_files=[]
            )
    
    async def _generate_component_code(self, spec: ComponentSpec, context: List[Dict]) -> str:
        """Generar código del componente React usando patrones conocidos"""
        
        # Template base para componentes
        template = '''import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Props interface
interface {component_name}Props {{
  {props_interface}
  className?: string;
  children?: React.ReactNode;
}}

// Validation schema
const {component_name}Schema = z.object({{
  {validation_schema}
}});

type {component_name}Data = z.infer<typeof {component_name}Schema>;

export function {component_name}({{
  {props_destructuring}
  className,
  children
}}: {component_name}Props) {{
  // Hooks
  {hooks_section}
  
  // Handlers
  {handlers_section}
  
  // Render
  return (
    <div className={{cn("{base_classes}", className)}}>
      {component_content}
    </div>
  );
}}

// Tests
{test_exports}
'''
        
        # Generar cada sección usando el contexto de conocimiento
        props_interface = self._generate_props_interface(spec.props)
        validation_schema = self._generate_validation_schema(spec.props)
        props_destructuring = self._generate_props_destructuring(spec.props)
        hooks_section = self._generate_hooks_section(spec, context)
        handlers_section = self._generate_handlers_section(spec, context)
        component_content = self._generate_component_content(spec, context)
        base_classes = self._generate_base_classes(spec.styling)
        test_exports = self._generate_test_exports(spec)
        
        return template.format(
            component_name=spec.name,
            props_interface=props_interface,
            validation_schema=validation_schema,
            props_destructuring=props_destructuring,
            hooks_section=hooks_section,
            handlers_section=handlers_section,
            component_content=component_content,
            base_classes=base_classes,
            test_exports=test_exports
        )
```

### **3. search-knowledge Tool**
```python
# Herramienta especializada para búsqueda de conocimiento
class SearchKnowledgeInput(MCPToolInput):
    query: str = Field(..., description="Consulta de búsqueda", min_length=3)
    max_results: int = Field(default=10, description="Número máximo de resultados", le=50)
    use_reranking: bool = Field(default=True, description="Usar reranking de resultados")
    include_code: bool = Field(default=True, description="Incluir ejemplos de código")
    similarity_threshold: float = Field(default=0.7, description="Umbral de similitud", ge=0.0, le=1.0)

class SearchResult(BaseModel):
    id: str = Field(..., description="ID único del resultado")
    content: str = Field(..., description="Contenido del resultado")
    title: str = Field(..., description="Título del documento")
    url: Optional[str] = Field(default=None, description="URL origen si aplica")
    similarity: float = Field(..., description="Score de similitud")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos")

class SearchKnowledgeOutput(MCPToolOutput):
    results: List[SearchResult] = Field(default_factory=list)
    total_found: int = Field(default=0, description="Total de resultados encontrados")
    search_time: float = Field(default=0.0, description="Tiempo de búsqueda en segundos")
    context_summary: str = Field(default="", description="Resumen del contexto encontrado")

class SearchKnowledgeTool(MCPToolBase):
    def __init__(self):
        config = MCPToolConfig(
            name="search-knowledge",
            description="Busca información en la base de conocimiento usando RAG avanzado",
            version="1.0.0",
            rate_limit=200  # Búsquedas más frecuentes
        )
        super().__init__(config)
    
    async def execute(self, **kwargs) -> SearchKnowledgeOutput:
        start_time = time.time()
        
        try:
            validated_input = await self.validate_input(kwargs)
            
            # Ejecutar búsqueda RAG avanzada
            search_results = await self.knowledge_engine.advanced_search(
                query=validated_input.query,
                domain=validated_input.domain,
                technology=validated_input.technology,
                max_results=validated_input.max_results,
                use_reranking=validated_input.use_reranking,
                include_code=validated_input.include_code,
                similarity_threshold=validated_input.similarity_threshold
            )
            
            # Convertir a formato de salida
            results = [
                SearchResult(
                    id=r['id'],
                    content=r['content'],
                    title=r.get('title', ''),
                    url=r.get('url'),
                    similarity=r['similarity'],
                    metadata=r.get('metadata', {})
                )
                for r in search_results
            ]
            
            # Generar resumen del contexto
            context_summary = await self._generate_context_summary(results)
            
            search_time = time.time() - start_time
            
            return SearchKnowledgeOutput(
                success=True,
                results=results,
                total_found=len(results),
                search_time=search_time,
                context_summary=context_summary,
                data={'results': results, 'summary': context_summary}
            )
            
        except Exception as e:
            return SearchKnowledgeOutput(
                success=False,
                error=str(e),
                results=[],
                total_found=0,
                search_time=time.time() - start_time
            )
```

## 🧪 Testing Patterns

### **Herramienta Testing Pattern**
```python
# Patrón obligatorio para testing de herramientas MCP
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock

class TestMCPToolBase:
    """Clase base para testing de herramientas MCP"""
    
    @pytest.fixture
    async def tool_instance(self):
        """Fixture para instancia de herramienta"""
        tool = self.get_tool_class()()
        await tool.setup(MagicMock())
        yield tool
        await tool.cleanup()
    
    @pytest.fixture
    def mock_knowledge_engine(self):
        """Mock del motor de conocimiento"""
        mock = AsyncMock()
        mock.search.return_value = []
        mock.ingest.return_value = True
        return mock
    
    def get_tool_class(self):
        """Debe ser implementado por cada test de herramienta"""
        raise NotImplementedError
    
    async def test_tool_initialization(self, tool_instance):
        """Test básico de inicialización"""
        assert tool_instance.config.name
        assert tool_instance.config.description
        assert tool_instance.logger
    
    async def test_input_validation(self, tool_instance):
        """Test de validación de entrada"""
        # Test con input válido
        valid_input = self.get_valid_input()
        result = await tool_instance.validate_input(valid_input)
        assert result
        
        # Test con input inválido
        invalid_input = self.get_invalid_input()
        with pytest.raises(ValueError):
            await tool_instance.validate_input(invalid_input)
    
    async def test_execution_success(self, tool_instance):
        """Test de ejecución exitosa"""
        valid_input = self.get_valid_input()
        result = await tool_instance.execute(**valid_input)
        
        assert result.success is True
        assert result.error is None
        assert result.data is not None
    
    async def test_execution_error_handling(self, tool_instance):
        """Test de manejo de errores"""
        # Simular error en ejecución
        error_input = self.get_error_input()
        result = await tool_instance.execute(**error_input)
        
        assert result.success is False
        assert result.error is not None
    
    # Métodos que deben ser implementados por cada test específico
    def get_valid_input(self) -> Dict[str, Any]:
        raise NotImplementedError
    
    def get_invalid_input(self) -> Dict[str, Any]:
        raise NotImplementedError
    
    def get_error_input(self) -> Dict[str, Any]:
        raise NotImplementedError

# Ejemplo de test específico
class TestParsePRPTool(TestMCPToolBase):
    def get_tool_class(self):
        return ParsePRPTool
    
    def get_valid_input(self):
        return {
            'domain': 'fullstack',
            'technology': 'nextjs',
            'prp_content': '''
## OBJETIVO
Crear una aplicación de reservas para restaurante

## TECH_STACK
- Frontend: Next.js 14 + TypeScript
- Backend: Supabase + PostgreSQL
- UI: Tailwind CSS + Shadcn/ui

## FEATURES
- Sistema de autenticación
- Gestión de reservas
- Dashboard administrativo
            '''.strip()
        }
    
    def get_invalid_input(self):
        return {
            'domain': 'invalid_domain',
            'prp_content': 'Too short'
        }
    
    def get_error_input(self):
        return {
            'domain': 'fullstack',
            'technology': 'nextjs',
            'prp_content': 'Content that will cause parsing error'
        }
```

## 🚀 Deployment & Performance

### **FastMCP Server Setup**
```python
# Configuración obligatoria del servidor MCP
from fastmcp import FastMCP
from contextlib import asynccontextmanager

# Lista de todas las herramientas
TOOLS = [
    ParsePRPTool(),
    GenerateComponentTool(),
    GeneratePageTool(),
    GenerateAPITool(),
    SearchKnowledgeTool(),
    # ... más herramientas
]

@asynccontextmanager
async def lifespan(app: FastMCP):
    """Gestión del ciclo de vida del servidor"""
    # Startup
    for tool in TOOLS:
        await tool.setup(app.context)
    yield
    # Shutdown
    for tool in TOOLS:
        await tool.cleanup()

# Crear servidor MCP
mcp = FastMCP(
    name="fullstack-developer-mcp",
    version="1.0.0",
    lifespan=lifespan
)

# Registrar todas las herramientas
for tool in TOOLS:
    mcp.add_tool(tool)

if __name__ == "__main__":
    mcp.run()
```

---

**Estos patrones son OBLIGATORIOS para el desarrollo de herramientas MCP consistentes, confiables y de alta calidad en el Servidor Full Stack Developer.**