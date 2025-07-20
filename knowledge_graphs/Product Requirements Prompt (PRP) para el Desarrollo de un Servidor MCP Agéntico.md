# Product Requirements Prompt (PRP) para el Desarrollo de un Servidor MCP Agéntico

## 1. Objetivo

Desarrollar un servidor MCP (Model Context Protocol) agéntico desde cero, siguiendo las mejores prácticas de seguridad y gestión de errores, y prepararlo para despliegue en producción. Este servidor MCP servirá como un componente clave en una arquitectura de IA más amplia, facilitando la interacción contextual entre LLMs y diversas fuentes de datos y herramientas. El desarrollo se centrará en la implementación de una estrategia PRP (Product Requirements Prompts) para guiar a un agente de codificación (Claude Code) en la construcción de un sistema robusto y escalable, utilizando Supabase para la gestión de datos relacionales y Neo4j + Graphiti para la gestión de grafos de conocimiento y memoria agéntica.

## 2. Justificación

La creciente complejidad de los sistemas de IA y la necesidad de delegar tareas de desarrollo a agentes de codificación hacen que la ingeniería de contexto sea fundamental. Los PRPs abordan esta necesidad al proporcionar un "paquete" mínimo viable de inteligencia y contexto que un agente de IA necesita para producir código de calidad de producción en el primer intento. Este proyecto demuestra la aplicación práctica de la ingeniería de contexto a través de PRPs para construir un componente crítico de infraestructura de IA, validando la eficacia de esta metodología en entornos de desarrollo reales. La combinación de MCP, ingeniería de contexto y RAG agéntico permitirá la creación de agentes de IA más autónomos, capaces de entender el contexto general de su tarea y acceder a conocimiento externo y relacional de manera dinámica.

## 3. Contexto

### 3.1. Model Context Protocol (MCP)

MCP es un protocolo abierto que estandariza cómo las aplicaciones proporcionan contexto a los LLM. Actúa como una interfaz universal para que los modelos de IA se conecten a diferentes fuentes de datos y herramientas, similar a un puerto USB-C para aplicaciones de IA [1]. Facilita la construcción de agentes y flujos de trabajo complejos sobre LLM al ofrecer integraciones preconstruidas, flexibilidad para cambiar entre proveedores de LLM y mejores prácticas de seguridad de datos. La arquitectura de MCP es cliente-servidor, donde los hosts (ej. Claude Desktop, IDEs) se conectan a servidores MCP ligeros que exponen capacidades específicas y acceden a fuentes de datos locales o servicios remotos [1].

### 3.2. Ingeniería de Contexto

La ingeniería de contexto es el proceso de diseñar y optimizar instrucciones y contexto relevante para que los LLM y modelos avanzados de IA realicen sus tareas de manera efectiva [2]. Va más allá de la ingeniería de prompts tradicional al abarcar la arquitectura completa del contexto, incluyendo la gestión de cadenas de prompts, el ajuste de prompts del sistema, la incorporación de elementos dinámicos, la preparación de conocimiento relevante (RAG), la definición de herramientas para sistemas agénticos, la optimización de demostraciones de pocas tomas, la estructuración de entradas y salidas, y la gestión de memoria a corto y largo plazo [2]. El objetivo es optimizar la información proporcionada en la ventana de contexto del LLM, filtrando el ruido y asegurando la relevancia.

### 3.3. Product Requirements Prompts (PRP)

Un PRP es una metodología de prompt estructurada que proporciona a un agente de codificación de IA todo lo necesario para entregar una porción vertical de software funcional [3]. A diferencia de un PRD (Product Requirements Document) tradicional, que se enfoca en el "qué" y el "por qué" sin detallar el "cómo", un PRP añade tres capas críticas para la IA:

*   **Contexto**: Rutas de archivo y contenido precisos, versiones y contexto de la biblioteca, ejemplos de fragmentos de código. Los LLM generan código de mayor calidad con referencias directas en el prompt. Se recomienda el uso de un directorio `ai_docs/` para documentación de bibliotecas y otros documentos [3].
*   **Blueprint de Implementación**: Un plan detallado de cómo se debe construir la solución, incluyendo pseudocódigo, estructura de datos y algoritmos.
*   **Bucle de Validación**: Pruebas ejecutables y linters que el agente de IA puede ejecutar y corregir, asegurando que el código generado cumple con los estándares de calidad y funciona como se espera [3].

Las mejores prácticas para PRPs incluyen: el contexto es clave (incluir toda la documentación, ejemplos y advertencias necesarias), bucles de validación (proporcionar pruebas/linters ejecutables), densidad de información (usar palabras clave y patrones del código base) y éxito progresivo (empezar simple, validar, luego mejorar) [3].

### 3.4. RAG Agéntico

RAG agéntico es una evolución de la Generación Aumentada por Recuperación (RAG) que incorpora agentes de IA para facilitar el proceso de recuperación y generación [4]. A diferencia del RAG tradicional, que se basa en el procesamiento por lotes y la sumarización de datos estáticos, el RAG agéntico utiliza agentes autónomos que pueden decidir dinámicamente qué herramienta o fuente de datos consultar, adaptándose a entornos dinámicos y datos que cambian con frecuencia [4]. Esto permite a los sistemas de IA ser más independientes, flexibles y capaces de manejar flujos de trabajo complejos y de varios pasos. Los sistemas RAG agénticos añaden agentes de IA al pipeline de RAG para aumentar la precisión y la capacidad de respuesta, especialmente en escenarios donde se requiere un conocimiento profundo y actualizado [4].

### 3.5. Tecnologías Clave

*   **Supabase**: Plataforma de desarrollo de Postgres que ofrece una base de datos Postgres, autenticación, APIs instantáneas, funciones Edge, suscripciones en tiempo real, almacenamiento e incrustaciones de vectores. Se posiciona como una alternativa de código abierto a Firebase [5].
*   **Neo4j + Graphiti**: Neo4j es una base de datos de grafos que almacena datos como una red de nodos conectados, ideal para descubrir insights ocultos y adaptarse a relaciones cambiantes [6]. Graphiti es un framework para construir y consultar grafos de conocimiento conscientes del tiempo, diseñado para agentes de IA. Permite la integración continua de interacciones de usuario, datos empresariales y externos en un grafo coherente y consultable, con actualizaciones incrementales en tiempo real y un modelo de datos bi-temporal [7]. Graphiti también ofrece un servidor MCP para que los asistentes de IA interactúen con sus capacidades de grafo de conocimiento [7].
*   **Claude Code**: Herramienta de codificación agéntica de Anthropic que se integra en la terminal y los IDEs. Utiliza el modelo Claude Opus 4 para una profunda conciencia del código base, permitiendo editar archivos y ejecutar comandos directamente en el entorno de desarrollo. Ofrece inteligencia potente, integración fluida en el flujo de trabajo y control del usuario, siendo ideal para la incorporación de código, la transformación de problemas en pull requests y la realización de ediciones complejas [8].

## 4. Blueprint de Implementación

El servidor MCP agéntico se construirá como una aplicación en un contenedor Docker, utilizando las siguientes tecnologías y principios:

### 4.1. Arquitectura General

El servidor MCP actuará como un intermediario entre los LLMs (específicamente Claude Code) y las fuentes de datos (Supabase y Neo4j/Graphiti). Se diseñará para ser modular y escalable, permitiendo la fácil adición de nuevas fuentes de contexto y herramientas.

```mermaid
graph TD
    A[LLM / Agente de Codificación (Claude Code)] -->|Solicitud de Contexto/Tarea| B(Servidor MCP Agéntico)
    B -->|Consulta de Datos Relacionales| C[Supabase (Postgres)]
    B -->|Consulta de Grafo de Conocimiento| D[Neo4j + Graphiti]
    C -->|Datos Relacionales| B
    D -->|Conocimiento Relacional/Contexto| B
    B -->|Respuesta/Contexto Enriquecido| A
    subgraph Contenedor Docker
        B
    end
```

### 4.2. Componentes del Servidor MCP

*   **API RESTful**: Para recibir solicitudes de contexto de los LLMs y devolver respuestas enriquecidas. Se utilizará un framework web ligero (ej. Flask o FastAPI) para construir esta API.
*   **Módulo de Integración Supabase**: Para interactuar con la base de datos Postgres de Supabase. Esto incluirá la gestión de esquemas, la inserción/recuperación de datos y la ejecución de consultas.
*   **Módulo de Integración Neo4j/Graphiti**: Para interactuar con el grafo de conocimiento. Esto implicará la definición de esquemas de grafos, la inserción de nodos y relaciones, y la ejecución de consultas Cypher o a través de la API de Graphiti.
*   **Módulo de Procesamiento de Contexto**: Encargado de orquestar las consultas a Supabase y Neo4j/Graphiti, combinar la información y formatearla de manera que sea útil para el LLM, siguiendo los principios de la ingeniería de contexto y los PRPs.
*   **Módulo de Seguridad**: Implementación de autenticación y autorización para las solicitudes entrantes, asegurando que solo los agentes autorizados puedan acceder al contexto.
*   **Manejo de Errores**: Implementación robusta de manejo de errores y logging para garantizar la estabilidad y facilitar la depuración.

### 4.3. Flujo de Trabajo Agéntico con PRP

1.  **Definición del PRP**: El desarrollador humano o un agente de nivel superior creará un PRP detallado para una tarea específica de desarrollo (ej. "Implementar módulo de autenticación de usuario"). Este PRP incluirá el objetivo, la justificación, el contexto relevante (documentación, ejemplos de código, versiones de librerías), un blueprint de implementación y un bucle de validación.
2.  **Ejecución del PRP por Claude Code**: Claude Code recibirá el PRP. Utilizará su capacidad de "conciencia profunda del código base" para entender el contexto proporcionado en el PRP.
3.  **Interacción con el Servidor MCP**: Durante la ejecución de la tarea, Claude Code (o el código que genere) interactuará con el servidor MCP para obtener contexto adicional o persistir información. Por ejemplo, podría consultar el grafo de conocimiento en Neo4j/Graphiti para entender las relaciones entre diferentes componentes del sistema o almacenar información sobre el progreso de la tarea en Supabase.
4.  **Generación y Validación de Código**: Claude Code generará el código basándose en el blueprint de implementación del PRP. Luego, ejecutará el "bucle de validación" definido en el PRP (pruebas unitarias, pruebas de integración, linters) para verificar la calidad y funcionalidad del código. Si las pruebas fallan, Claude Code utilizará el feedback para refactorizar y corregir el código.
5.  **Iteración y Refinamiento**: Este proceso se repetirá hasta que el código cumpla con los criterios de éxito definidos en el PRP y pase todas las validaciones.

## 5. Bucle de Validación

El bucle de validación para este proyecto incluirá:

### 5.1. Nivel 1: Pruebas Unitarias y de Integración

*   **Pruebas Unitarias**: Para cada módulo del servidor MCP (API, integración Supabase, integración Neo4j/Graphiti, procesamiento de contexto), se escribirán pruebas unitarias exhaustivas para asegurar que cada componente funciona correctamente de forma aislada.
*   **Pruebas de Integración**: Se desarrollarán pruebas para verificar la interacción entre los diferentes módulos del servidor MCP y con las bases de datos externas (Supabase y Neo4j).

### 5.2. Nivel 2: Pruebas de Seguridad

*   **Análisis de Vulnerabilidades**: Se utilizarán herramientas automatizadas para escanear el código en busca de vulnerabilidades comunes (ej. inyección SQL, XSS).
*   **Pruebas de Autenticación/Autorización**: Se verificarán los mecanismos de seguridad implementados para asegurar que solo los agentes autorizados puedan acceder a los recursos y que los permisos se apliquen correctamente.

### 5.3. Nivel 3: Pruebas de Rendimiento y Escalabilidad

*   **Pruebas de Carga**: Se simulará una carga de trabajo alta para evaluar el rendimiento del servidor MCP bajo estrés.
*   **Pruebas de Escalabilidad**: Se verificará la capacidad del servidor para escalar horizontalmente y manejar un aumento en el número de solicitudes y el volumen de datos.

### 5.4. Nivel 4: Validación de Contexto y RAG Agéntico

*   **Pruebas de Relevancia del Contexto**: Se diseñarán pruebas para asegurar que el módulo de procesamiento de contexto recupera y formatea la información más relevante para el LLM, basándose en diferentes escenarios de consulta.
*   **Evaluación de la Generación de Código con PRP**: Se evaluará la calidad del código generado por Claude Code utilizando PRPs, comparándolo con el código escrito por humanos y midiendo la adherencia a las mejores prácticas y los requisitos del PRP.

## 6. Referencias

[1] Model Context Protocol. *Introduction*. Disponible en: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

[2] Prompt Engineering Guide. *Context Engineering Guide*. Disponible en: [https://www.promptingguide.ai/guides/context-engineering-guide](https://www.promptingguide.ai/guides/context-engineering-guide)

[3] Wirasm. *PRPs-agentic-eng: Prompts, workflows and more for agentic engineering*. Disponible en: [https://github.com/Wirasm/PRPs-agentic-eng](https://github.com/Wirasm/PRPs-agentic-eng)

[4] IBM. *What is Agentic RAG?*. Disponible en: [https://www.ibm.com/think/topics/agentic-rag](https://www.ibm.com/think/topics/agentic-rag)

[5] Supabase. *The Postgres Development Platform*. Disponible en: [https://supabase.com/](https://supabase.com/)

[6] Neo4j. *Neo4j Graph Database & Analytics*. Disponible en: [https://neo4j.com/](https://neo4j.com/)

[7] getzep. *graphiti: Build Real-Time Knowledge Graphs for AI Agents*. Disponible en: [https://github.com/getzep/graphiti](https://github.com/getzep/graphiti)

[8] Anthropic. *Claude Code: Deep Coding at Terminal Velocity*. Disponible en: [https://www.anthropic.com/claude-code](https://www.anthropic.com/claude-code)


