name: "Base PRP Template v2 - Rico en Contexto con Bucles de Validación"
description: |

## Propósito

Template optimizado para agentes de IA para implementar funcionalidades con suficiente contexto y capacidades de auto-validación para lograr código funcionando a través de refinamiento iterativo.

## Principios Core

1. **El Contexto es Rey**: Incluye TODA la documentación necesaria, ejemplos y advertencias
2. **Bucles de Validación**: Proporciona pruebas/lints ejecutables que la IA puede ejecutar y corregir
3. **Denso en Información**: Usa palabras clave y patrones de la base de código
4. **Éxito Progresivo**: Comienza simple, valida, luego mejora

---

## Objetivo

[Qué necesita ser construido - sé específico sobre el estado final y deseos]

## Por qué

- [Valor de negocio e impacto del usuario]
- [Integración con funcionalidades existentes]
- [Problemas que esto resuelve y para quién]

## Qué

[Comportamiento visible del usuario y requisitos técnicos]

### Criterios de Éxito

- [ ] [Resultados específicos medibles]

## Todo el Contexto Necesario

### Documentación y Referencias (lista todo el contexto necesario para implementar la funcionalidad)

```yaml
# DEBE LEER - Incluye estos en tu ventana de contexto
- url: [URL de docs de API oficial]
  why: [Secciones/métodos específicos que necesitarás]

- file: [ruta/al/ejemplo.py]
  why: [Patrón a seguir, problemas conocidos a evitar]

- doc: [URL de documentación de biblioteca]
  section: [Sección específica sobre errores comunes]
  critical: [Insight clave que previene errores comunes]

- docfile: [PRPs/ai_docs/archivo.md]
  why: [docs que el usuario ha pegado en el proyecto]
```

### Árbol de base de código actual (ejecuta `tree` en la raíz del proyecto) para obtener una visión general de la base de código

```bash

```

### Árbol de base de código deseado con archivos a añadir y responsabilidad del archivo

```bash

```

### Problemas Conocidos de nuestra base de código y Peculiaridades de Biblioteca

```python
# CRÍTICO: [Nombre de biblioteca] requiere [configuración específica]
# Ejemplo: FastAPI requiere funciones async para endpoints
# Ejemplo: Este ORM no soporta inserciones por lotes de más de 1000 registros
# Ejemplo: Usamos pydantic v2 y
```

## Blueprint de Implementación

### Modelos de datos y estructura

Crear los modelos de datos core, aseguramos seguridad de tipos y consistencia.

```python
Ejemplos:
 - modelos orm
 - modelos pydantic
 - esquemas pydantic
 - validadores pydantic

```

### Lista de tareas a completar para cumplir el PRP en el orden que deben ser completadas

```yaml
Tarea 1:
MODIFY src/existing_module.py:
  - FIND pattern: "class OldImplementation"
  - INJECT after line containing "def __init__"
  - PRESERVE existing method signatures

CREATE src/new_feature.py:
  - MIRROR pattern from: src/similar_feature.py
  - MODIFY class name and core logic
  - KEEP error handling pattern identical

...(...)

Tarea N:
...

```

### Pseudocódigo por tarea según sea necesario añadido a cada tarea

```python

# Tarea 1
# Pseudocódigo con detalles CRÍTICOS no escribir código completo
async def new_feature(param: str) -> Result:
    # PATRÓN: Siempre validar entrada primero (ver src/validators.py)
    validated = validate_input(param)  # raises ValidationError

    # PROBLEMA CONOCIDO: Esta biblioteca requiere pool de conexiones
    async with get_connection() as conn:  # ver src/db/pool.py
        # PATRÓN: Usar decorador de retry existente
        @retry(attempts=3, backoff=exponential)
        async def _inner():
            # CRÍTICO: API retorna 429 si >10 req/sec
            await rate_limiter.acquire()
            return await external_api.call(validated)

        result = await _inner()

    # PATRÓN: Formato de respuesta estandarizado
    return format_response(result)  # ver src/utils/responses.py
```

### Puntos de Integración

```yaml
DATABASE:
  - migration: "Add column 'feature_enabled' to users table"
  - index: "CREATE INDEX idx_feature_lookup ON users(feature_id)"

CONFIG:
  - add to: config/settings.py
  - pattern: "FEATURE_TIMEOUT = int(os.getenv('FEATURE_TIMEOUT', '30'))"

ROUTES:
  - add to: src/api/routes.py
  - pattern: "router.include_router(feature_router, prefix='/feature')"
```

## Bucle de Validación

### Nivel 1: Sintaxis y Estilo

```bash
# Ejecuta estos PRIMERO - corrige cualquier error antes de proceder
ruff check src/new_feature.py --fix  # Auto-corregir lo que sea posible
mypy src/new_feature.py              # Verificación de tipos

# Esperado: Sin errores. Si hay errores, LEE el error y corrige.
```

### Nivel 2: Pruebas Unitarias cada nueva funcionalidad/archivo/función usa patrones de prueba existentes

```python
# CREAR test_new_feature.py con estos casos de prueba:
def test_happy_path():
    """Funcionalidad básica funciona"""
    result = new_feature("valid_input")
    assert result.status == "success"

def test_validation_error():
    """Entrada inválida lanza ValidationError"""
    with pytest.raises(ValidationError):
        new_feature("")

def test_external_api_timeout():
    """Maneja timeouts graciosamente"""
    with mock.patch('external_api.call', side_effect=TimeoutError):
        result = new_feature("valid")
        assert result.status == "error"
        assert "timeout" in result.message
```

```bash
# Ejecutar e iterar hasta que pase:
uv run pytest test_new_feature.py -v
# Si falla: Leer error, entender causa raíz, corregir código, re-ejecutar (nunca mockear para pasar)
```

### Nivel 3: Prueba de Integración

```bash
# Iniciar el servicio
uv run python -m src.main --dev

# Probar el endpoint
curl -X POST http://localhost:8000/feature \
  -H "Content-Type: application/json" \
  -d '{"param": "test_value"}'

# Esperado: {"status": "success", "data": {...}}
# Si hay error: Revisar logs en logs/app.log para stack trace
```

### Nivel 4: Despliegue y Validación Creativa

```bash
# Servidores MCP u otros métodos de validación creativos
# Ejemplos:
# - Pruebas de carga con datos realistas
# - Pruebas de journey de usuario end-to-end
# - Benchmarking de rendimiento
# - Escaneo de seguridad
# - Validación de documentación

# Validación personalizada específica para la funcionalidad
# [Añadir métodos de validación creativos aquí]
```

## Checklist de validación final

- [ ] Todas las pruebas pasan: `uv run pytest tests/ -v`
- [ ] Sin errores de linting: `uv run ruff check src/`
- [ ] Sin errores de tipos: `uv run mypy src/`
- [ ] Prueba manual exitosa: [curl/comando específico]
- [ ] Casos de error manejados graciosamente
- [ ] Los logs son informativos pero no verbosos
- [ ] Documentación actualizada si es necesario

---

## Anti-Patrones a Evitar

- ❌ No crear nuevos patrones cuando los existentes funcionan
- ❌ No omitir validación porque "debería funcionar"
- ❌ No ignorar pruebas que fallan - corrígelas
- ❌ No usar funciones sync en contexto async
- ❌ No hardcodear valores que deberían ser configuración
- ❌ No capturar todas las excepciones - sé específico