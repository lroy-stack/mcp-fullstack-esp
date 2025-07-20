# Guía de Integración con Anthropic Claude

Este documento detalla cómo integrar la API de Anthropic Claude en servidores MCP Full Stack para funcionalidades avanzadas de IA como parseo de PRPs, generación de código y validación inteligente.

## Configuración Base de la API

### Variables de Entorno Requeridas

```bash
# API de Anthropic
ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_MAX_TOKENS=4000
ANTHROPIC_TEMPERATURE=0.1

# Para casos de uso específicos
ANTHROPIC_PRP_MODEL=claude-3-5-sonnet-20241022  # Para parseo PRPs
ANTHROPIC_CODE_MODEL=claude-3-5-sonnet-20241022  # Para generación código
ANTHROPIC_REVIEW_MODEL=claude-3-haiku-20240307   # Para reviews rápidos
```

### Cliente Base para Integración

```python
import os
import asyncio
import json
from typing import Dict, Any, Optional, List
import httpx
from datetime import datetime

class AnthropicClient:
    """Cliente para integración con API de Anthropic en servidores MCP."""
    
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.base_url = "https://api.anthropic.com/v1"
        self.default_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        self.max_tokens = int(os.getenv("ANTHROPIC_MAX_TOKENS", "4000"))
        self.temperature = float(os.getenv("ANTHROPIC_TEMPERATURE", "0.1"))
        
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")
    
    async def create_message(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Crear mensaje usando la API de Anthropic.
        
        Args:
            prompt: Prompt del usuario
            system_prompt: Prompt del sistema (opcional)
            model: Modelo a usar (usa default si no se especifica)
            max_tokens: Máximo de tokens (usa default si no se especifica)
            temperature: Temperatura para la generación
            
        Returns:
            Respuesta completa de la API
        """
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        
        messages = [{"role": "user", "content": prompt}]
        
        payload = {
            "model": model or self.default_model,
            "max_tokens": max_tokens or self.max_tokens,
            "messages": messages
        }
        
        if system_prompt:
            payload["system"] = system_prompt
            
        if temperature is not None:
            payload["temperature"] = temperature
        else:
            payload["temperature"] = self.temperature
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/messages",
                    headers=headers,
                    json=payload
                )
                
                if not response.is_success:
                    error_detail = await self._parse_error_response(response)
                    raise Exception(f"Anthropic API error: {response.status_code} - {error_detail}")
                
                return response.json()
                
            except httpx.TimeoutException:
                raise Exception("Anthropic API request timed out")
            except Exception as e:
                raise Exception(f"Anthropic API request failed: {str(e)}")
    
    async def _parse_error_response(self, response: httpx.Response) -> str:
        """Parsear respuesta de error de la API."""
        try:
            error_data = response.json()
            return error_data.get("error", {}).get("message", "Unknown error")
        except:
            return response.text
```

## Patrones de Uso en Servidores MCP Full Stack

### 1. Parseo de PRPs (Product Requirement Prompts)

```python
class PRPParser:
    """Parser de PRPs usando Claude para análisis inteligente."""
    
    def __init__(self, anthropic_client: AnthropicClient):
        self.client = anthropic_client
        
    async def parse_fullstack_prp(
        self,
        prp_content: str,
        project_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Parsear un PRP Full Stack y extraer componentes estructurados.
        
        Args:
            prp_content: Contenido completo del PRP
            project_context: Contexto del proyecto (stack, constraints, etc.)
            
        Returns:
            Estructura parseada con frontend, backend, database, etc.
        """
        
        system_prompt = """
        Eres un experto en desarrollo Full Stack que parsea Product Requirement Prompts (PRPs).
        
        Tu tarea es analizar un PRP y extraer una estructura JSON detallada que incluya:
        - Componentes frontend (React + Next.js)
        - APIs backend necesarias
        - Esquemas de base de datos
        - Configuraciones de autenticación
        - Tests requeridos
        - Configuraciones de deployment
        
        Siempre retorna JSON válido siguiendo el esquema específico.
        """
        
        prompt = self._build_prp_parsing_prompt(prp_content, project_context)
        
        try:
            response = await self.client.create_message(
                prompt=prompt,
                system_prompt=system_prompt,
                model=os.getenv("ANTHROPIC_PRP_MODEL"),
                temperature=0.1  # Baja temperatura para consistencia
            )
            
            content = response["content"][0]["text"]
            
            # Extraer JSON de la respuesta
            json_start = content.find("{")
            json_end = content.rfind("}") + 1
            
            if json_start == -1 or json_end == 0:
                raise Exception("No JSON found in Claude response")
                
            json_content = content[json_start:json_end]
            parsed_prp = json.loads(json_content)
            
            # Validar estructura
            await self._validate_prp_structure(parsed_prp)
            
            return parsed_prp
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse Claude response as JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"PRP parsing failed: {str(e)}")
    
    def _build_prp_parsing_prompt(
        self, 
        prp_content: str, 
        project_context: Optional[Dict[str, Any]]
    ) -> str:
        """Construir prompt específico para parseo de PRP."""
        
        context_info = ""
        if project_context:
            context_info = f"""
            
            CONTEXTO DEL PROYECTO:
            - Stack: {project_context.get('stack', 'Next.js + Supabase + Neo4j')}
            - Dominio: {project_context.get('domain', 'General')}
            - Constraints: {project_context.get('constraints', [])}
            """
        
        return f"""
        Analiza el siguiente PRP Full Stack y extrae una estructura JSON detallada:
        
        {context_info}
        
        PRP A ANALIZAR:
        {prp_content}
        
        Retorna un JSON con esta estructura exacta:
        {{
            "frontend": {{
                "components": [
                    {{
                        "name": "ComponentName",
                        "type": "form|display|layout|interactive",
                        "props": {{}},
                        "styling": "tailwind|styled-components",
                        "dependencies": []
                    }}
                ],
                "pages": [
                    {{
                        "route": "/path",
                        "type": "public|protected|admin",
                        "components": [],
                        "seo": {{}}
                    }}
                ],
                "state_management": "zustand|redux|context",
                "routing": "app-router|pages-router"
            }},
            "backend": {{
                "apis": [
                    {{
                        "endpoint": "/api/path",
                        "method": "GET|POST|PUT|DELETE",
                        "auth_level": "public|user|admin",
                        "validation_schema": {{}},
                        "business_logic": "description"
                    }}
                ],
                "middleware": [],
                "auth_system": "supabase|nextauth|custom"
            }},
            "database": {{
                "tables": [
                    {{
                        "name": "table_name",
                        "fields": [
                            {{
                                "name": "field_name",
                                "type": "string|number|boolean|date",
                                "constraints": []
                            }}
                        ],
                        "relationships": []
                    }}
                ],
                "migrations": [],
                "rls_policies": []
            }},
            "testing": {{
                "unit_tests": [],
                "integration_tests": [],
                "e2e_tests": []
            }},
            "deployment": {{
                "platform": "vercel|netlify|aws",
                "environment_vars": [],
                "build_config": {{}}
            }},
            "ai_features": {{
                "rag_integration": boolean,
                "knowledge_graph": boolean,
                "ai_tools": []
            }}
        }}
        """
        
    async def _validate_prp_structure(self, parsed_prp: Dict[str, Any]):
        """Validar que la estructura del PRP parseado sea correcta."""
        required_sections = ["frontend", "backend", "database", "testing", "deployment"]
        
        for section in required_sections:
            if section not in parsed_prp:
                raise Exception(f"Missing required section: {section}")
```

### 2. Generación de Código Full Stack

```python
class FullStackCodeGenerator:
    """Generador de código Full Stack usando Claude."""
    
    def __init__(self, anthropic_client: AnthropicClient):
        self.client = anthropic_client
        
    async def generate_react_component(
        self,
        component_spec: Dict[str, Any],
        examples: Optional[List[Dict]] = None
    ) -> Dict[str, str]:
        """
        Generar componente React completo con tests.
        
        Args:
            component_spec: Especificación del componente
            examples: Ejemplos similares del knowledge base
            
        Returns:
            Código del componente, tests, y documentación
        """
        
        system_prompt = """
        Eres un experto desarrollador React/Next.js especializado en generar componentes de alta calidad.
        
        Genera componentes siguiendo estas reglas:
        - TypeScript estricto
        - Tailwind CSS para estilos
        - React Hook Form + Zod para formularios
        - Accesibilidad WCAG 2.1 AA
        - Tests unitarios con React Testing Library
        - Documentación con JSDoc
        - Patrones de composición cuando sea apropiado
        
        Retorna código listo para producción.
        """
        
        prompt = self._build_component_generation_prompt(component_spec, examples)
        
        response = await self.client.create_message(
            prompt=prompt,
            system_prompt=system_prompt,
            model=os.getenv("ANTHROPIC_CODE_MODEL"),
            temperature=0.2
        )
        
        content = response["content"][0]["text"]
        
        # Extraer diferentes secciones del código generado
        return self._extract_code_sections(content)
    
    async def generate_api_endpoint(
        self,
        api_spec: Dict[str, Any],
        examples: Optional[List[Dict]] = None
    ) -> Dict[str, str]:
        """
        Generar endpoint de API Next.js completo.
        
        Args:
            api_spec: Especificación del endpoint
            examples: Ejemplos similares del knowledge base
            
        Returns:
            Código del endpoint, validación, tests
        """
        
        system_prompt = """
        Eres un experto desarrollador backend especializado en APIs Next.js.
        
        Genera endpoints siguiendo estas reglas:
        - TypeScript estricto
        - Validación con Zod
        - Manejo robusto de errores
        - Autenticación y autorización apropiadas
        - Rate limiting donde sea necesario
        - Logging estructurado
        - Tests de integración
        - Documentación OpenAPI
        
        Usa patrones probados de Next.js App Router.
        """
        
        prompt = self._build_api_generation_prompt(api_spec, examples)
        
        response = await self.client.create_message(
            prompt=prompt,
            system_prompt=system_prompt,
            model=os.getenv("ANTHROPIC_CODE_MODEL"),
            temperature=0.2
        )
        
        content = response["content"][0]["text"]
        
        return self._extract_api_sections(content)
    
    def _build_component_generation_prompt(
        self, 
        spec: Dict[str, Any], 
        examples: Optional[List[Dict]]
    ) -> str:
        """Construir prompt para generación de componente."""
        
        examples_section = ""
        if examples:
            examples_section = f"""
            
            EJEMPLOS SIMILARES DEL KNOWLEDGE BASE:
            {json.dumps(examples, indent=2)}
            """
        
        return f"""
        Genera un componente React completo basado en esta especificación:
        
        ESPECIFICACIÓN:
        - Nombre: {spec['name']}
        - Tipo: {spec['type']}
        - Props: {json.dumps(spec.get('props', {}), indent=2)}
        - Styling: {spec.get('styling', 'tailwind')}
        - Dependencias: {spec.get('dependencies', [])}
        
        {examples_section}
        
        ESTRUCTURA DE RESPUESTA:
        
        ## Componente Principal
        ```typescript
        // Código del componente aquí
        ```
        
        ## Types
        ```typescript
        // Definiciones de tipos aquí
        ```
        
        ## Tests
        ```typescript
        // Tests unitarios aquí
        ```
        
        ## Storybook
        ```typescript
        // Story de Storybook aquí
        ```
        
        ## Documentación
        ```markdown
        # Documentación del componente aquí
        ```
        """
        
    def _extract_code_sections(self, content: str) -> Dict[str, str]:
        """Extraer secciones de código de la respuesta de Claude."""
        sections = {}
        
        # Regex patterns para extraer secciones
        import re
        
        patterns = {
            "component": r"## Componente Principal\n```typescript\n(.*?)\n```",
            "types": r"## Types\n```typescript\n(.*?)\n```",
            "tests": r"## Tests\n```typescript\n(.*?)\n```",
            "storybook": r"## Storybook\n```typescript\n(.*?)\n```",
            "documentation": r"## Documentación\n```markdown\n(.*?)\n```"
        }
        
        for section_name, pattern in patterns.items():
            match = re.search(pattern, content, re.DOTALL)
            if match:
                sections[section_name] = match.group(1).strip()
        
        return sections
```

### 3. Validación Inteligente y Review de Código

```python
class IntelligentValidator:
    """Validador inteligente usando Claude para review de código."""
    
    def __init__(self, anthropic_client: AnthropicClient):
        self.client = anthropic_client
        
    async def validate_implementation(
        self,
        implementation: Dict[str, str],
        specifications: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validar implementación contra especificaciones usando Claude.
        
        Args:
            implementation: Código implementado
            specifications: Especificaciones originales
            context: Contexto adicional del proyecto
            
        Returns:
            Resultado de validación con issues y sugerencias
        """
        
        system_prompt = """
        Eres un experto senior en desarrollo Full Stack que revisa código para asegurar calidad empresarial.
        
        Analiza el código implementado contra las especificaciones y evalúa:
        - Cumplimiento de requisitos
        - Calidad del código y mejores prácticas
        - Seguridad y vulnerabilidades
        - Performance y optimizaciones
        - Accesibilidad y UX
        - Mantenibilidad y escalabilidad
        - Cobertura de tests
        
        Proporciona feedback constructivo y específico.
        """
        
        prompt = self._build_validation_prompt(implementation, specifications, context)
        
        response = await self.client.create_message(
            prompt=prompt,
            system_prompt=system_prompt,
            model=os.getenv("ANTHROPIC_REVIEW_MODEL"),  # Modelo más rápido para reviews
            temperature=0.1
        )
        
        content = response["content"][0]["text"]
        
        return self._parse_validation_results(content)
    
    async def suggest_improvements(
        self,
        code: str,
        code_type: str,
        performance_metrics: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Sugerir mejoras específicas para el código.
        
        Args:
            code: Código a analizar
            code_type: Tipo de código (component, api, schema, etc.)
            performance_metrics: Métricas de performance si están disponibles
            
        Returns:
            Lista de sugerencias de mejora
        """
        
        system_prompt = """
        Eres un consultor senior de desarrollo que sugiere mejoras específicas y accionables.
        
        Enfócate en:
        - Optimizaciones de performance concretas
        - Mejoras de seguridad específicas
        - Refactoring para mejor mantenibilidad
        - Patrones más robustos
        - Mejor UX/DX
        
        Prioriza sugerencias por impacto y esfuerzo.
        """
        
        metrics_section = ""
        if performance_metrics:
            metrics_section = f"""
            
            MÉTRICAS DE PERFORMANCE:
            {json.dumps(performance_metrics, indent=2)}
            """
        
        prompt = f"""
        Analiza este código {code_type} y sugiere mejoras específicas:
        
        {metrics_section}
        
        CÓDIGO A ANALIZAR:
        ```
        {code}
        ```
        
        Retorna sugerencias en formato JSON:
        {{
            "suggestions": [
                {{
                    "category": "performance|security|maintainability|ux|dx",
                    "priority": "high|medium|low",
                    "title": "Título corto de la sugerencia",
                    "description": "Descripción detallada",
                    "code_example": "Ejemplo de código mejorado",
                    "impact": "Descripción del impacto",
                    "effort": "low|medium|high"
                }}
            ]
        }}
        """
        
        response = await self.client.create_message(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2
        )
        
        content = response["content"][0]["text"]
        
        # Extraer JSON de sugerencias
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        
        if json_start != -1 and json_end > 0:
            try:
                suggestions_data = json.loads(content[json_start:json_end])
                return suggestions_data.get("suggestions", [])
            except json.JSONDecodeError:
                pass
        
        return []
```

## Integración con Herramientas MCP

### Herramienta MCP para Parseo de PRPs

```python
@app.tool()
async def parse_fullstack_prp_with_claude(
    context: Context,
    prp_content: str,
    project_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Parsear PRP Full Stack usando Claude para análisis inteligente.
    
    Args:
        prp_content: Contenido completo del PRP
        project_context: Contexto del proyecto
        
    Returns:
        Estructura parseada del PRP
    """
    try:
        anthropic_client = AnthropicClient()
        prp_parser = PRPParser(anthropic_client)
        
        parsed_prp = await prp_parser.parse_fullstack_prp(
            prp_content, project_context
        )
        
        # Log del parseo exitoso
        import logging
        logger = logging.getLogger("fullstack_mcp")
        logger.info(f"PRP parsed successfully: {len(prp_content)} chars")
        
        return {
            "success": True,
            "parsed_prp": parsed_prp,
            "metadata": {
                "content_length": len(prp_content),
                "sections_found": list(parsed_prp.keys()),
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as error:
        return await handle_mcp_error(error, "parse_fullstack_prp_with_claude")
```

## Mejores Prácticas y Consideraciones

### Rate Limiting y Gestión de Cuotas

```python
import asyncio
from datetime import datetime, timedelta
from typing import Dict

class RateLimiter:
    """Rate limiter para API de Anthropic."""
    
    def __init__(self, requests_per_minute: int = 50):
        self.requests_per_minute = requests_per_minute
        self.requests = []
        
    async def wait_if_needed(self):
        """Esperar si es necesario para respetar rate limits."""
        now = datetime.now()
        
        # Limpiar requests antiguos (>1 minuto)
        self.requests = [
            req_time for req_time in self.requests 
            if now - req_time < timedelta(minutes=1)
        ]
        
        # Si estamos en el límite, esperar
        if len(self.requests) >= self.requests_per_minute:
            oldest_request = min(self.requests)
            wait_time = 60 - (now - oldest_request).total_seconds()
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        # Registrar esta request
        self.requests.append(now)
```

### Error Handling Robusto

```python
class AnthropicErrorHandler:
    """Manejador de errores específico para API de Anthropic."""
    
    @staticmethod
    def handle_api_error(error_response: Dict[str, Any]) -> str:
        """Manejar errores específicos de la API de Anthropic."""
        
        error = error_response.get("error", {})
        error_type = error.get("type", "unknown")
        error_message = error.get("message", "Unknown error")
        
        if error_type == "invalid_request_error":
            return f"Request inválido: {error_message}"
        elif error_type == "authentication_error":
            return "Error de autenticación: verifica ANTHROPIC_API_KEY"
        elif error_type == "permission_error":
            return "Sin permisos: verifica límites de cuenta"
        elif error_type == "not_found_error":
            return f"Recurso no encontrado: {error_message}"
        elif error_type == "rate_limit_error":
            return "Rate limit excedido: intenta más tarde"
        elif error_type == "api_error":
            return f"Error interno de API: {error_message}"
        elif error_type == "overloaded_error":
            return "API sobrecargada: intenta más tarde"
        else:
            return f"Error desconocido: {error_message}"
```

### Monitoreo y Logging

```python
import logging
from datetime import datetime

def setup_anthropic_logging():
    """Configurar logging específico para integraciones Anthropic."""
    
    logger = logging.getLogger("anthropic_integration")
    logger.setLevel(logging.INFO)
    
    # Handler para archivos
    file_handler = logging.FileHandler("anthropic_api.log")
    file_handler.setLevel(logging.INFO)
    
    # Formato de log
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    
    return logger

# Uso en funciones
async def log_api_usage(
    operation: str, 
    tokens_used: int, 
    cost_estimate: float,
    execution_time: float
):
    """Log de uso de API para monitoreo."""
    
    logger = logging.getLogger("anthropic_integration")
    
    logger.info(f"API Usage - Operation: {operation}")
    logger.info(f"Tokens used: {tokens_used}")
    logger.info(f"Cost estimate: ${cost_estimate:.4f}")
    logger.info(f"Execution time: {execution_time:.2f}s")
```

Esta guía proporciona todo lo necesario para integrar efectivamente la API de Anthropic Claude en servidores MCP Full Stack, con patrones probados y mejores prácticas para desarrollo empresarial.