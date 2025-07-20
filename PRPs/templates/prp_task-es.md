---
Destinado para tareas de Jira/GitHub u otros sistemas de gestión de tareas para desglosar y planificar la implementación.
---

# Template de Tarea v2 - Denso en Información con Bucles de Validación

> Tareas concisas y ejecutables con contexto embebido y comandos de validación

## Formato

```
[ACTION] path/to/file:
  - [OPERATION]: [DETAILS]
  - VALIDATE: [COMMAND]
  - IF_FAIL: [DEBUG_HINT]
```

## Palabras clave de acciones para usar al crear tareas para descripciones concisas y significativas

- **READ**: Entender patrones existentes
- **CREATE**: Nuevo archivo con contenido específico
- **UPDATE**: Modificar archivo existente
- **DELETE**: Remover archivo/código
- **FIND**: Buscar patrones
- **TEST**: Verificar comportamiento
- **FIX**: Debugear y reparar

## Sección de Contexto Crítico

```yaml
# Incluir estos ANTES de las tareas cuando el contexto es crucial
context:
  docs:
    - url: [documentación de API]
      focus: [método/sección específica]

  patterns:
    - file: existing/example.py
      copy: [nombre del patrón]

  gotchas:
    - issue: "La librería X requiere Y"
      fix: "Siempre hacer Z primero"
```

## Ejemplos de Tareas con Validación

### Tareas de Configuración

```
READ src/config/settings.py:
  - UNDERSTAND: Estructura de configuración actual
  - FIND: Patrón de configuración del modelo
  - NOTE: Config usa pydantic BaseSettings

READ tests/test_models.py:
  - UNDERSTAND: Patrón de prueba para modelos
  - FIND: Enfoque de configuración de fixtures
  - NOTE: Usa pytest-asyncio para pruebas async
```

### Tareas de Implementación

````
UPDATE path/to/file:
  - FIND: MODEL_REGISTRY = {
  - ADD: "new-model": NewModelClass,
  - VALIDATE: python -c "from path/to/file import MODEL_REGISTRY; assert 'new-model' in MODEL_REGISTRY"
  - IF_FAIL: Verificar declaración de import para NewModelClass

CREATE path/to/file:
  - COPY_PATTERN: path/to/other/file
  - IMPLEMENT:
   - [Descripción detallada de lo que necesita ser implementado basado en inteligencia del codebase]
  - VALIDATE: uv run pytest path/to/file -v

UPDATE path/to/file:
  - FIND: app.include_router(
  - ADD_AFTER:
    ```python
    from .endpoints import new_model_router
    app.include_router(new_model_router, prefix="/api/v1")
    ```
  - VALIDATE: uv run pytest path/to/file -v
````

## Checkpoints de Validación

```
CHECKPOINT syntax:
  - RUN: ruff check && mypy .
  - FIX: Cualquier problema reportado
  - CONTINUE: Solo cuando esté limpio

CHECKPOINT tests:
  - RUN: uv run pytest path/to/file -v
  - REQUIRE: Todos pasando
  - DEBUG: uv run pytest -vvs path/to/file/failing_test.py
  - CONTINUE: Solo cuando todo esté verde

CHECKPOINT integration:
  - START: docker-compose up -d
  - RUN: ./scripts/integration_test.sh
  - EXPECT: "All tests passed"
  - CLEANUP: docker-compose down
```

## Patrones de Debug

```
DEBUG import_error:
  - CHECK: El archivo existe en la ruta
  - CHECK: __init__.py en todos los directorios padre
  - TRY: python -c "import path/to/file"
  - FIX: Agregar a PYTHONPATH o corregir import

DEBUG test_failure:
  - RUN: uv run pytest -vvs path/to/test.py::test_name
  - ADD: print(f"Debug: {variable}")
  - IDENTIFY: Problema de assertion vs implementación
  - FIX: Actualizar test o corregir código

DEBUG api_error:
  - CHECK: Servidor ejecutándose (ps aux | grep uvicorn)
  - TEST: curl http://localhost:8000/health
  - READ: Logs del servidor para stack trace
  - FIX: Basado en error específico
```

## Ejemplos de tareas comunes

### Agregar Nueva Funcionalidad

```
1. READ funcionalidad similar existente
2. CREATE nuevo archivo de funcionalidad (COPY patrón)
3. UPDATE registry/router para incluir
4. CREATE pruebas para funcionalidad
5. TEST todas las pruebas pasan
6. FIX cualquier problema de linting/tipos
7. TEST integración funciona
```

### Corregir Bug

```
1. CREATE prueba que falla que reproduce el bug
2. TEST confirmar que la prueba falla
3. READ código relevante para entender
4. UPDATE código con corrección
5. TEST confirmar que la prueba ahora pasa
6. TEST ninguna otra prueba rota
7. UPDATE changelog
```

### Refactorizar Código

```
1. TEST las pruebas actuales pasan (baseline)
2. CREATE nueva estructura (no eliminar la vieja aún)
3. UPDATE un uso a la nueva estructura
4. TEST todavía pasa
5. UPDATE usos restantes incrementalmente
6. DELETE estructura vieja
7. TEST suite completa pasa
```

## Tips para Tareas Efectivas

- Usar VALIDATE después de cada cambio
- Incluir hints IF_FAIL para problemas comunes
- Referenciar números de línea específicos o patrones
- Mantener comandos de validación simples y rápidos
- Encadenar tareas relacionadas con dependencias claras
- Siempre incluir pasos de rollback/deshacer para cambios riesgosos