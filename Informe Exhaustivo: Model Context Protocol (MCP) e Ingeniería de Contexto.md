# Informe Exhaustivo: Model Context Protocol (MCP) e Ingeniería de Contexto

## Introducción

En la era actual de la inteligencia artificial, la capacidad de los modelos de lenguaje grandes (LLM) para interactuar eficazmente con el mundo real y generar resultados de alta calidad depende cada vez más de la riqueza y relevancia del contexto que se les proporciona. Este informe explora dos conceptos fundamentales que están revolucionando la forma en que interactuamos con los LLM y los agentes de IA: el Model Context Protocol (MCP) y la Ingeniería de Contexto. Además, se analizará cómo estas metodologías se entrelazan con la Generación Aumentada por Recuperación (RAG) agéntica para crear sistemas de IA más robustos, autónomos y capaces de operar en entornos de producción complejos.

## 1. Model Context Protocol (MCP)

El Model Context Protocol (MCP) emerge como una solución estandarizada para abordar el desafío de proporcionar contexto dinámico y relevante a los LLM. Concebido como un "puerto USB-C para aplicaciones de IA", MCP establece un protocolo abierto que estandariza la forma en que las aplicaciones suministran contexto a los modelos de lenguaje grandes [1]. Su objetivo principal es facilitar una integración fluida y eficiente entre los LLM y una diversidad de fuentes de datos y herramientas externas.

### 1.1. Propósito y Beneficios

La necesidad de MCP surge de la inherente limitación de los LLM para acceder y comprender información más allá de sus datos de entrenamiento. Para que los LLM puedan realizar tareas complejas, como la programación, la resolución de problemas o la toma de decisiones en tiempo real, requieren acceso a un contexto actualizado y específico del dominio. MCP aborda esta brecha al proporcionar:

*   **Integraciones Preconstruidas**: Una creciente biblioteca de conectores que permiten a los LLM interactuar directamente con sistemas existentes, como bases de datos, APIs, sistemas de archivos y herramientas de desarrollo. Esto reduce significativamente la complejidad de integrar los LLM en flujos de trabajo empresariales [1].
*   **Flexibilidad y Portabilidad**: La estandarización que ofrece MCP permite a los desarrolladores cambiar entre diferentes proveedores de LLM o modelos sin tener que reescribir la lógica de integración de contexto. Esto fomenta la interoperabilidad y reduce la dependencia de un único proveedor [1].
*   **Seguridad y Gobernanza de Datos**: MCP incorpora mejores prácticas para asegurar que los datos se manejen de forma segura dentro de la infraestructura del usuario. Esto es crucial para aplicaciones que manejan información sensible o propietaria, garantizando que el acceso al contexto se realice de manera controlada y auditable [1].

### 1.2. Arquitectura y Componentes

La arquitectura de MCP se basa en un modelo cliente-servidor, diseñado para ser ligero y modular. Los componentes clave incluyen [1]:

*   **Hosts MCP**: Son las aplicaciones que inician las solicitudes de contexto. Esto puede incluir IDEs (entornos de desarrollo integrados) como VS Code o Cursor, herramientas de IA como Claude Desktop, o cualquier otra aplicación que necesite proporcionar contexto a un LLM.
*   **Clientes MCP**: Son los módulos de protocolo que residen dentro de los Hosts MCP y mantienen conexiones uno a uno con los Servidores MCP. Actúan como el punto de contacto inicial para las solicitudes de contexto.
*   **Servidores MCP**: Son programas ligeros y especializados que exponen capacidades específicas a través del protocolo MCP estandarizado. Cada servidor puede estar diseñado para interactuar con un tipo particular de fuente de datos o herramienta, como un sistema de archivos, una base de datos o una API externa.
*   **Fuentes de Datos Locales**: Se refieren a los datos y servicios que residen en la máquina local del usuario, como archivos, bases de datos locales o servicios en ejecución. Los Servidores MCP pueden acceder a estas fuentes de forma segura.
*   **Servicios Remotos**: Son sistemas externos accesibles a través de Internet, típicamente mediante APIs. Los Servidores MCP también pueden conectarse a estos servicios para recuperar información o ejecutar acciones.

Esta arquitectura distribuida permite que el contexto se recupere de diversas fuentes de manera eficiente y segura, adaptándose a las necesidades específicas de cada aplicación de IA. La modularidad de los Servidores MCP facilita la extensión del sistema para incluir nuevas fuentes de contexto a medida que surgen nuevas necesidades.

## 2. Ingeniería de Contexto

La Ingeniería de Contexto representa una evolución crítica en el campo de la interacción con los LLM, trascendiendo la noción tradicional de "ingeniería de prompts". Mientras que la ingeniería de prompts se centra en la formulación de instrucciones directas para un LLM, la ingeniería de contexto abarca un enfoque mucho más amplio y sistemático para diseñar y optimizar el entorno informacional en el que operan los modelos de IA [2].

### 2.1. Definición y Alcance

En esencia, la ingeniería de contexto es el proceso de diseñar y optimizar las instrucciones y el contexto relevante que se proporciona a los LLM y a los modelos avanzados de IA para que puedan realizar sus tareas de manera efectiva [2]. No se limita a los modelos basados en texto, sino que también se aplica a la optimización del contexto para modelos multimodales, que están ganando cada vez más relevancia. Este campo incluye una variedad de esfuerzos y procesos interrelacionados:

*   **Diseño y Gestión de Cadenas de Prompts**: La creación de secuencias de prompts que guían al LLM a través de tareas complejas, donde la salida de un prompt se convierte en la entrada para el siguiente.
*   **Ajuste de Instrucciones y Prompts del Sistema**: La optimización de las directrices generales y las instrucciones de comportamiento que definen el rol y las limitaciones del LLM.
*   **Gestión de Elementos Dinámicos del Prompt**: La incorporación de información variable y en tiempo real en los prompts, como entradas de usuario, fechas, horas o datos específicos de la sesión.
*   **Búsqueda y Preparación de Conocimiento Relevante (RAG)**: La integración de sistemas de recuperación de información para inyectar datos externos y actualizados en el contexto del LLM, mejorando su precisión y relevancia.
*   **Aumento de Consultas**: Técnicas para enriquecer las consultas iniciales del usuario con información adicional que ayuda al LLM a comprender mejor la intención y a generar respuestas más precisas.
*   **Definiciones e Instrucciones de Herramientas**: En el caso de sistemas agénticos, la especificación clara de las herramientas disponibles para el LLM y cómo debe utilizarlas para interactuar con el entorno o realizar acciones.
*   **Preparación y Optimización de Demostraciones de Pocas Tomas (Few-Shot Learning)**: La selección y presentación de ejemplos relevantes que demuestran el comportamiento deseado del LLM, permitiéndole aprender patrones y adaptarse a nuevas tareas con un mínimo de ejemplos.
*   **Estructuración de Entradas y Salidas**: La definición de formatos específicos (como delimitadores o esquemas JSON) para las entradas y salidas del LLM, lo que facilita el procesamiento automatizado y la integración con otros sistemas.
*   **Gestión de Memoria a Corto y Largo Plazo**: La implementación de mecanismos para que el LLM recuerde interacciones pasadas (memoria a corto plazo o contexto histórico) y acceda a bases de conocimiento persistentes (memoria a largo plazo, como almacenes vectoriales).

El objetivo primordial de la ingeniería de contexto es maximizar la calidad y la relevancia de la información contenida en la ventana de contexto del LLM, al mismo tiempo que se filtra el "ruido" o la información irrelevante. Esto requiere un enfoque sistemático y a menudo iterativo, con procesos formales para medir la efectividad de las tácticas empleadas [2].

### 2.2. Importancia en el Desarrollo de Agentes de IA

Para los agentes de IA, especialmente los agentes de codificación, la ingeniería de contexto es indispensable. Un agente de codificación no solo necesita comprender las instrucciones de una tarea, sino también el entorno de desarrollo completo: la estructura del proyecto, las dependencias, las convenciones de codificación, los estándares de seguridad y los resultados de las pruebas. La ingeniería de contexto permite a estos agentes:

*   **Operar con Mayor Precisión**: Al tener acceso a un contexto rico y bien estructurado, los agentes pueden generar código que se alinea mejor con los requisitos del proyecto y las mejores prácticas.
*   **Reducir Errores y Refactorizaciones**: Un contexto claro minimiza la ambigüedad, lo que lleva a menos errores y a la necesidad de menos iteraciones para corregir el código.
*   **Acelerar el Desarrollo**: Al proporcionar toda la información necesaria de antemano, los agentes pueden completar tareas más rápidamente y con mayor autonomía.
*   **Mejorar la Colaboración Humano-IA**: Un contexto bien definido actúa como un lenguaje común entre el desarrollador humano y el agente de IA, facilitando la delegación de tareas y la revisión del trabajo.

En resumen, la ingeniería de contexto transforma la interacción con los LLM de una simple "conversación" a una orquestación estratégica de información, herramientas y procesos, lo que es fundamental para construir sistemas de IA de nivel de producción.

## 3. Product Requirements Prompts (PRP)

Los Product Requirements Prompts (PRP) son una metodología innovadora que capitaliza los principios de la ingeniería de contexto para guiar a los agentes de codificación de IA en la creación de software de calidad de producción. Desarrollados en el verano de 2024, los PRPs van más allá de los documentos de requisitos de producto (PRD) tradicionales al integrar capas de contexto y validación específicas para la interacción con la IA [3].

### 3.1. PRP vs. PRD Tradicional

Un PRD convencional se enfoca en definir el "qué" (funcionalidad del producto) y el "por qué" (valor para el cliente y el negocio), dejando el "cómo" (implementación técnica) a los equipos de ingeniería. Si bien esta separación es útil en el desarrollo tradicional, resulta insuficiente para los agentes de IA, que requieren una comprensión más profunda del entorno técnico y las expectativas de implementación. Un PRP mantiene las secciones de objetivo y justificación de un PRD, pero añade tres capas cruciales para la IA [3]:

*   **Contexto**: Esta es la capa más distintiva del PRP. Incluye rutas de archivo precisas, contenido de archivos relevantes, versiones de bibliotecas, contexto de dependencias y ejemplos de fragmentos de código. La premisa es que los LLM generan código de mayor calidad cuando se les proporcionan referencias directas y específicas en el prompt, en lugar de descripciones vagas. Se recomienda encarecidamente el uso de un directorio `ai_docs/` para almacenar documentación de bibliotecas, APIs y otros recursos que el agente de IA pueda necesitar para su tarea [3].
*   **Blueprint de Implementación**: A diferencia de un PRD que evita los detalles de implementación, un PRP proporciona un plan detallado de cómo se espera que se construya la solución. Esto puede incluir pseudocódigo, descripciones de estructuras de datos, algoritmos sugeridos y patrones de diseño. Este blueprint actúa como una guía técnica para el agente de IA, asegurando que la implementación se alinee con la visión arquitectónica deseada.
*   **Bucle de Validación**: Esta capa es fundamental para garantizar la calidad del código generado. Consiste en pruebas ejecutables (unitarias, de integración, de extremo a extremo) y herramientas de linting que el agente de IA puede ejecutar de forma autónoma. El agente utiliza los resultados de estas validaciones para identificar errores, refactorizar el código y asegurar que cumple con los estándares de calidad y funciona según lo previsto. Este bucle de retroalimentación automatizado es clave para la capacidad del agente de producir código "listo para producción" en la primera pasada [3].

### 3.2. Mejores Prácticas para PRPs

Para maximizar la efectividad de los PRPs, se deben seguir ciertas mejores prácticas [3]:

*   **El Contexto es Clave**: Proporcionar toda la documentación, ejemplos y advertencias necesarias. Cuanto más rico y preciso sea el contexto, mejor será el resultado del agente de IA.
*   **Bucles de Validación Robustos**: Incluir pruebas y linters ejecutables que el agente de IA pueda ejecutar y corregir. Esto automatiza gran parte del proceso de control de calidad.
*   **Densidad de Información**: Utilizar palabras clave y patrones que resuenen con el código base existente. Esto ayuda al agente a comprender el estilo y las convenciones del proyecto.
*   **Éxito Progresivo**: Comenzar con tareas simples y validarlas antes de avanzar a funcionalidades más complejas. Este enfoque iterativo permite al agente aprender y adaptarse, construyendo sobre éxitos anteriores.

En resumen, un PRP es un "paquete mínimo viable" de inteligencia y contexto que un agente de IA necesita para generar código de producción en la primera pasada. Al estructurar los requisitos de esta manera, los desarrolladores pueden delegar tareas de codificación con mayor confianza y eficiencia.

## 4. RAG Agéntico: Potenciando la Generación de Contexto

La Generación Aumentada por Recuperación (RAG) ha demostrado ser una técnica poderosa para mejorar la precisión y la relevancia de las respuestas de los LLM al permitirles acceder a información externa y actualizada. El RAG agéntico lleva este concepto un paso más allá, incorporando agentes de IA en el pipeline de recuperación y generación, lo que resulta en sistemas más dinámicos, adaptables y capaces de manejar flujos de trabajo complejos [4].

### 4.1. Evolución del RAG Tradicional al RAG Agéntico

El RAG tradicional típicamente implica la recuperación de documentos o fragmentos de texto relevantes de una base de conocimiento estática y su posterior alimentación al LLM como contexto. Si bien es efectivo, este enfoque puede ser limitado cuando se trata de datos que cambian con frecuencia o cuando la tarea requiere una comprensión profunda y multifacética de la información. Los sistemas RAG agénticos superan estas limitaciones al [4]:

*   **Incorporar Agentes Autónomos**: En lugar de una simple recuperación, los agentes de IA toman decisiones dinámicas sobre qué herramientas o fuentes de datos consultar. Pueden orquestar múltiples pasos de recuperación, refinar consultas y adaptar su estrategia en función de la información obtenida.
*   **Manejo de Datos Dinámicos**: A diferencia del RAG tradicional que a menudo se basa en el procesamiento por lotes y la sumarización de datos estáticos, el RAG agéntico puede integrar continuamente interacciones de usuario, datos empresariales estructurados y no estructurados, e información externa en tiempo real. Esto es crucial para aplicaciones que requieren contexto actualizado al minuto.
*   **Flujos de Trabajo Multi-Paso**: Los agentes pueden descomponer una consulta compleja en sub-tareas, ejecutar herramientas específicas para cada sub-tarea (como buscar en una base de datos, consultar una API o analizar un grafo de conocimiento) y luego sintetizar los resultados para generar una respuesta coherente y completa.

### 4.2. Cómo el RAG Agéntico Potencia la Ingeniería de Contexto y los PRPs

La sinergia entre el RAG agéntico, la ingeniería de contexto y los PRPs es profunda. El RAG agéntico proporciona el mecanismo dinámico para que los agentes de IA accedan y utilicen el contexto que la ingeniería de contexto ha diseñado y que los PRPs han especificado. Específicamente:

*   **Contexto Dinámico y Relevante**: Los agentes de RAG pueden recuperar información de diversas fuentes (bases de datos, grafos de conocimiento, documentación en línea) en el momento de la necesidad, asegurando que el LLM siempre tenga el contexto más relevante y actualizado. Esto es vital para los PRPs, que dependen de un contexto preciso para guiar la generación de código.
*   **Acceso a Conocimiento Relacional**: La integración con bases de datos de grafos como Neo4j y frameworks como Graphiti permite a los agentes de RAG acceder a conocimiento relacional. Esto significa que el agente no solo recupera hechos aislados, sino que también comprende las conexiones y relaciones entre esos hechos, lo que es invaluable para tareas de codificación que requieren una comprensión arquitectónica o de dependencias complejas.
*   **Capacidad de Auto-Corrección y Adaptación**: Al tener la capacidad de interactuar con herramientas y fuentes de datos a través de agentes, el LLAG puede validar su propia comprensión del contexto y corregir su curso si la información inicial es insuficiente o incorrecta. Esto mejora la robustez de la ejecución de los PRPs.
*   **Orquestación de Herramientas**: Los agentes de RAG pueden orquestar el uso de múltiples herramientas y fuentes de datos para construir un contexto completo. Por ejemplo, un agente podría usar Supabase para obtener datos de usuario, luego Neo4j/Graphiti para entender las relaciones de esos usuarios con otros componentes del sistema, y finalmente usar Claude Code para generar código basado en este contexto enriquecido.

En resumen, el RAG agéntico es el motor que permite que la visión de la ingeniería de contexto y los PRPs se haga realidad, proporcionando a los LLM la capacidad de acceder, procesar y utilizar información de manera inteligente y autónoma.

## 5. Arquitectura Combinada para el Desarrollo con Supabase, Neo4j + Graphiti y Claude Code

La combinación de MCP, ingeniería de contexto, PRPs y RAG agéntico, junto con tecnologías específicas como Supabase, Neo4j + Graphiti y Claude Code, forma una arquitectura potente para el desarrollo de software asistido por IA. Esta sección detalla cómo estos componentes pueden integrarse para crear un entorno de desarrollo eficiente y robusto.

### 5.1. Visión General de la Arquitectura

La arquitectura propuesta se centra en un servidor MCP agéntico que actúa como el cerebro central para la gestión del contexto y la orquestación de datos. Este servidor se ejecuta en un contenedor Docker, facilitando su despliegue y escalabilidad. Claude Code, como agente de codificación principal, interactúa con este servidor para obtener el contexto necesario para sus tareas de desarrollo.

```mermaid
graph TD
    A[Desarrollador Humano / Agente Superior] -->|Define PRPs| B(PRP - Product Requirements Prompt)
    B -->|Guía de Desarrollo| C[Claude Code (Agente de Codificación)]
    C -->|Solicitud de Contexto/Acción| D(Servidor MCP Agéntico)
    D -->|Consulta de Datos Relacionales| E[Supabase (Postgres)]
    D -->|Consulta de Grafo de Conocimiento| F[Neo4j + Graphiti]
    E -->|Datos Relacionales| D
    F -->|Conocimiento Relacional/Contexto| D
    D -->|Contexto Enriquecido/Resultados| C
    C -->|Genera/Valida Código| G[Código de Producción]
    subgraph Entorno Contenerizado (Docker)
        D
    end
    subgraph Fuentes de Conocimiento y Datos
        E
        F
    end
```

### 5.2. Componentes y su Interacción

*   **PRP (Product Requirements Prompt)**: Es el punto de partida. Define la tarea de desarrollo, el objetivo, la justificación, el contexto detallado (rutas de archivo, versiones de librerías, ejemplos de código), un blueprint de implementación y un bucle de validación (pruebas, linters). Este documento es el "contrato" entre el desarrollador humano (o agente superior) y Claude Code [3].
*   **Claude Code (Agente de Codificación)**: Es el LLM/agente principal encargado de ejecutar la tarea de desarrollo. Recibe el PRP y lo utiliza como su guía principal. Claude Code está diseñado para tener una "conciencia profunda del código base" y puede interactuar directamente con el entorno de desarrollo (terminal, IDE) para leer archivos, ejecutar comandos y realizar ediciones [8].
*   **Servidor MCP Agéntico**: Este es el componente central de la arquitectura. Se implementa como un servicio ligero dentro de un contenedor Docker. Sus funciones principales son:
    *   **API RESTful**: Expone endpoints para que Claude Code (u otros agentes/aplicaciones) soliciten contexto o realicen acciones. Esta API es el punto de entrada para todas las interacciones contextuales.
    *   **Módulo de Integración Supabase**: Se encarga de la comunicación con la base de datos Postgres de Supabase [5]. Permite al servidor MCP recuperar datos relacionales (ej. configuraciones de usuario, datos de negocio) y persistir información sobre el estado del desarrollo o los resultados de las tareas.
    *   **Módulo de Integración Neo4j + Graphiti**: Gestiona la interacción con el grafo de conocimiento [6, 7]. Este módulo permite al servidor MCP:
        *   **Construir y Actualizar el Grafo**: A partir de la documentación del proyecto, el código base, los logs de ejecución y las interacciones del agente, se construye un grafo de conocimiento dinámico que representa las relaciones entre entidades (funciones, clases, módulos, dependencias, requisitos, pruebas).
        *   **Consultar el Grafo**: Permite realizar consultas complejas para obtener contexto relacional. Por ejemplo, identificar todos los módulos afectados por un cambio en una función específica, o encontrar todas las pruebas relacionadas con un requisito particular.
        *   **Memoria Agéntica**: Graphiti, al ser consciente del tiempo, permite que el grafo actúe como una memoria a largo plazo para el agente, registrando el historial de decisiones, errores y soluciones, lo que facilita el aprendizaje y la auto-corrección [7].
    *   **Módulo de Procesamiento de Contexto**: Orquesta las consultas a Supabase y Neo4j/Graphiti, combina la información recuperada y la formatea de manera óptima para la ventana de contexto de Claude Code. Este módulo aplica los principios de la ingeniería de contexto para filtrar el ruido y resaltar la información más relevante.
    *   **Módulo de Seguridad**: Implementa mecanismos de autenticación y autorización para proteger el acceso al servidor MCP y a las fuentes de datos subyacentes.
*   **Fuentes de Conocimiento y Datos**: Supabase y Neo4j + Graphiti actúan como los repositorios de datos. Supabase maneja datos estructurados y relacionales, mientras que Neo4j + Graphiti gestiona el conocimiento relacional y la memoria agéntica a través de grafos.

### 5.3. Flujo de Trabajo Detallado

1.  **Inicio de Tarea**: El desarrollador define un PRP para una nueva funcionalidad o corrección de errores. Este PRP se carga en el entorno de Claude Code.
2.  **Análisis del PRP por Claude Code**: Claude Code lee el PRP, comprendiendo el objetivo, el contexto inicial y el blueprint de implementación.
3.  **Recuperación de Contexto (RAG Agéntico)**: Cuando Claude Code necesita información adicional (ej. detalles de una API, cómo interactúa un módulo con otro, historial de errores similares), envía una solicitud al Servidor MCP Agéntico. El servidor, utilizando sus módulos de integración, consulta Supabase (para datos estructurados) y Neo4j/Graphiti (para conocimiento relacional y memoria agéntica). Los agentes internos del servidor MCP orquestan estas consultas, refinan la información y la devuelven a Claude Code.
4.  **Generación de Código**: Con el contexto enriquecido, Claude Code genera el código fuente, scripts de configuración o cualquier otro artefacto necesario, siguiendo el blueprint de implementación del PRP.
5.  **Validación y Refinamiento (Bucle de Validación)**: Claude Code ejecuta las pruebas y linters especificados en el PRP. Los resultados de estas validaciones se retroalimentan a Claude Code. Si hay fallos, Claude Code utiliza el contexto de los errores y el grafo de conocimiento (a través del servidor MCP) para depurar y refactorizar el código. Este ciclo se repite hasta que todas las validaciones pasen.
6.  **Persistencia de Conocimiento**: Durante el proceso, el Servidor MCP puede persistir nuevos conocimientos en Neo4j/Graphiti (ej. nuevas relaciones descubiertas, patrones de error/solución) o actualizar datos en Supabase (ej. progreso de la tarea, métricas de rendimiento del agente).
7.  **Entrega**: Una vez que el código pasa todas las validaciones, Claude Code lo prepara para la integración (ej. creando un Pull Request), completando la tarea definida en el PRP.

## Conclusión

La convergencia del Model Context Protocol, la Ingeniería de Contexto, los Product Requirements Prompts y el RAG agéntico representa un cambio de paradigma en el desarrollo de software asistido por IA. Al proporcionar a los LLM un contexto rico, dinámico y relacional, y al equiparlos con la capacidad de interactuar inteligentemente con diversas fuentes de conocimiento, podemos delegar tareas de desarrollo con una confianza sin precedentes. La arquitectura propuesta, que integra Supabase para datos relacionales, Neo4j + Graphiti para grafos de conocimiento y Claude Code como agente de codificación, demuestra un camino viable hacia la creación de sistemas de IA que no solo escriben código, sino que lo hacen con una comprensión profunda del dominio, las mejores prácticas y los requisitos de producción. Este enfoque no solo acelera el ciclo de desarrollo, sino que también eleva la calidad y la robustez del software generado por IA, marcando el comienzo de una nueva era en la programación agéntica.

## Referencias

[1] Model Context Protocol. *Introduction*. Disponible en: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

[2] Prompt Engineering Guide. *Context Engineering Guide*. Disponible en: [https://www.promptingguide.ai/guides/context-engineering-guide](https://www.promptingguide.ai/guides/context-engineering-guide)

[3] Wirasm. *PRPs-agentic-eng: Prompts, workflows and more for agentic engineering*. Disponible en: [https://github.com/Wirasm/PRPs-agentic-eng](https://github.com/Wirasm/PRPs-agentic-eng)

[4] IBM. *What is Agentic RAG?*. Disponible en: [https://www.ibm.com/think/topics/agentic-rag](https://www.ibm.com/think/topics/agentic-rag)

[5] Supabase. *The Postgres Development Platform*. Disponible en: [https://supabase.com/](https://supabase.com/)

[6] Neo4j. *Neo4j Graph Database & Analytics*. Disponible en: [https://neo4j.com/](https://neo4j.com/)

[7] getzep. *graphiti: Build Real-Time Knowledge Graphs for AI Agents*. Disponible en: [https://github.com/getzep/graphiti](https://github.com/getzep/graphiti)

[8] Anthropic. *Claude Code: Deep Coding at Terminal Velocity*. Disponible en: [https://www.anthropic.com/claude-code](https://www.anthropic.com/claude-code)


