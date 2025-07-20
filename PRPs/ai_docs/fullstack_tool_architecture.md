# Arquitectura Modular de Herramientas MCP Full Stack

## Propósito

Especificación completa de la arquitectura modular de herramientas MCP para el Servidor Full Stack Developer, basada en los patrones del repositorio `remote-mcp-server-with-auth-main`.

## Sistema de Registro Centralizado

### Archivo Principal: `src/tools/register-tools.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Props } from "../types";
import { registerFrontendTools } from "./frontend-tools";
import { registerBackendTools } from "./backend-tools";
import { registerArchitectureTools } from "./architecture-tools";
import { registerKnowledgeTools } from "./knowledge-tools";
import { registerTestingTools } from "./testing-tools";
import { registerSecurityTools } from "./security-tools";

/**
 * Registrar todas las herramientas MCP basado en permisos del usuario
 */
export function registerAllTools(server: McpServer, env: Env, props: Props) {
    // Herramientas de arquitectura - disponibles para todos
    registerArchitectureTools(server, env, props);
    
    // Herramientas de conocimiento - búsqueda disponible para todos
    registerKnowledgeTools(server, env, props);
    
    // Herramientas de desarrollo - requieren permisos de escritura
    if (hasWritePermission(props.login)) {
        registerFrontendTools(server, env, props);
        registerBackendTools(server, env, props);
        registerTestingTools(server, env, props);
    }
    
    // Herramientas de seguridad - solo para usuarios privilegiados
    if (hasAdminPermission(props.login)) {
        registerSecurityTools(server, env, props);
    }
}

// Niveles de permisos
const WRITE_USERS = new Set(['developer1', 'developer2']);
const ADMIN_USERS = new Set(['admin1', 'security-lead']);

function hasWritePermission(login: string): boolean {
    return WRITE_USERS.has(login) || ADMIN_USERS.has(login);
}

function hasAdminPermission(login: string): boolean {
    return ADMIN_USERS.has(login);
}
```

## Herramientas Frontend: `src/tools/frontend-tools.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Props } from "../types";
import { searchKnowledgeBase } from "../knowledge/search";
import { generateWithAI } from "../ai/generator";

// Esquemas de validación
const GenerateComponentSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['form', 'display', 'layout', 'interactive']),
    props: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean()
    })),
    styling: z.object({
        approach: z.enum(['tailwind', 'css-modules', 'styled-components']),
        theme: z.string().optional()
    }),
    accessibility: z.object({
        wcagLevel: z.enum(['A', 'AA', 'AAA']),
        ariaLabels: z.boolean()
    })
});

const GeneratePageSchema = z.object({
    route: z.string(),
    layout: z.enum(['default', 'dashboard', 'auth', 'landing']),
    components: z.array(z.string()),
    seo: z.object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string())
    }),
    auth: z.enum(['public', 'authenticated', 'admin'])
});

export function registerFrontendTools(server: McpServer, env: Env, props: Props) {
    // generateComponent
    server.tool(
        "generateComponent",
        "Genera componentes React con TypeScript, tests y documentación",
        GenerateComponentSchema,
        async (input) => {
            try {
                // 1. Buscar componentes similares en knowledge base
                const similarComponents = await searchKnowledgeBase({
                    query: `React component ${input.type} ${input.name}`,
                    domain: "frontend",
                    limit: 5
                });
                
                // 2. Generar componente usando AI + contexto
                const component = await generateWithAI({
                    prompt: "generate_react_component",
                    context: { input, similarComponents },
                    model: env.CLAUDE_MODEL
                });
                
                // 3. Validar y formatear resultado
                return {
                    content: [{
                        type: "text",
                        text: `**Componente Generado: ${input.name}**\n\n\`\`\`typescript\n${component.tsx}\n\`\`\`\n\n**Tests:**\n\`\`\`typescript\n${component.tests}\n\`\`\`\n\n**Tipos:**\n\`\`\`typescript\n${component.types}\n\`\`\``
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error generando componente: ${error.message}`,
                        isError: true
                    }]
                };
            }
        }
    );
    
    // generatePage
    server.tool(
        "generatePage",
        "Genera páginas Next.js completas con App Router",
        GeneratePageSchema,
        async (input) => {
            try {
                const pageGeneration = await generateWithAI({
                    prompt: "generate_nextjs_page",
                    context: { input },
                    model: env.CLAUDE_MODEL
                });
                
                return {
                    content: [{
                        type: "text",
                        text: `**Página Generada: ${input.route}**\n\n\`\`\`typescript\n${pageGeneration.page}\n\`\`\`\n\n**Layout:**\n\`\`\`typescript\n${pageGeneration.layout}\n\`\`\`\n\n**Tests E2E:**\n\`\`\`typescript\n${pageGeneration.tests}\n\`\`\``
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error generando página: ${error.message}`,
                        isError: true
                    }]
                };
            }
        }
    );
    
    // generateForm
    server.tool(
        "generateForm",
        "Genera formularios con validación Zod y React Hook Form",
        z.object({
            name: z.string(),
            fields: z.array(z.object({
                name: z.string(),
                type: z.string(),
                validation: z.object({}).optional()
            })),
            submission: z.object({
                endpoint: z.string(),
                method: z.enum(['POST', 'PUT', 'PATCH'])
            })
        }),
        async (input) => {
            // Implementación similar...
        }
    );
}
```

## Herramientas Backend: `src/tools/backend-tools.ts`

```typescript
const GenerateAPISchema = z.object({
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    auth: z.enum(['public', 'authenticated', 'admin']),
    validation: z.object({
        body: z.object({}).optional(),
        params: z.object({}).optional(),
        query: z.object({}).optional()
    }),
    database: z.object({
        table: z.string(),
        operation: z.enum(['select', 'insert', 'update', 'delete'])
    }).optional()
});

const GenerateDatabaseSchema = z.object({
    table: z.string(),
    fields: z.array(z.object({
        name: z.string(),
        type: z.string(),
        constraints: z.array(z.string()).optional()
    })),
    relationships: z.array(z.object({
        table: z.string(),
        type: z.enum(['one-to-one', 'one-to-many', 'many-to-many'])
    })).optional(),
    rls: z.boolean().default(true)
});

export function registerBackendTools(server: McpServer, env: Env, props: Props) {
    // generateAPIEndpoint
    server.tool(
        "generateAPIEndpoint",
        "Genera endpoints API Next.js con validación y tests",
        GenerateAPISchema,
        async (input) => {
            // Verificar permisos
            if (!hasWritePermission(props.login)) {
                return createErrorResponse("Permisos insuficientes para generar APIs");
            }
            
            // Búsqueda de patrones similares
            const apiPatterns = await searchKnowledgeBase({
                query: `API ${input.method} ${input.endpoint} pattern`,
                domain: "backend",
                limit: 3
            });
            
            // Generación
            const apiCode = await generateWithAI({
                prompt: "generate_nextjs_api",
                context: { input, patterns: apiPatterns },
                model: env.CLAUDE_MODEL
            });
            
            return {
                content: [{
                    type: "text",
                    text: `**API Endpoint: ${input.method} ${input.endpoint}**\n\n\`\`\`typescript\n${apiCode.handler}\n\`\`\`\n\n**Validación:**\n\`\`\`typescript\n${apiCode.validation}\n\`\`\`\n\n**Tests:**\n\`\`\`typescript\n${apiCode.tests}\n\`\`\``
                }]
            };
        }
    );
    
    // generateDatabaseSchema
    server.tool(
        "generateDatabaseSchema",
        "Genera esquemas Prisma con migraciones y políticas RLS",
        GenerateDatabaseSchema,
        async (input) => {
            const schemaCode = await generateWithAI({
                prompt: "generate_prisma_schema",
                context: { input },
                model: env.CLAUDE_MODEL
            });
            
            return {
                content: [{
                    type: "text",
                    text: `**Esquema: ${input.table}**\n\n\`\`\`prisma\n${schemaCode.schema}\n\`\`\`\n\n**Migración:**\n\`\`\`sql\n${schemaCode.migration}\n\`\`\`\n\n**Políticas RLS:**\n\`\`\`sql\n${schemaCode.rls}\n\`\`\``
                }]
            };
        }
    );
}
```

## Herramientas de Arquitectura: `src/tools/architecture-tools.ts`

```typescript
const ParsePRPSchema = z.object({
    prpContent: z.string(),
    domain: z.string().optional(),
    complexity: z.enum(['simple', 'medium', 'complex']).default('medium')
});

export function registerArchitectureTools(server: McpServer, env: Env, props: Props) {
    // parseFullStackPRP
    server.tool(
        "parseFullStackPRP",
        "Analiza PRPs y extrae requerimientos frontend/backend/database",
        ParsePRPSchema,
        async (input) => {
            // Análisis con Claude
            const analysis = await generateWithAI({
                prompt: "parse_fullstack_prp",
                context: { prp: input.prpContent, domain: input.domain },
                model: env.CLAUDE_MODEL
            });
            
            return {
                content: [{
                    type: "text",
                    text: `**Análisis PRP Completo**\n\n**Frontend:**\n${JSON.stringify(analysis.frontend, null, 2)}\n\n**Backend:**\n${JSON.stringify(analysis.backend, null, 2)}\n\n**Database:**\n${JSON.stringify(analysis.database, null, 2)}`
                }]
            };
        }
    );
    
    // generateProjectArchitecture
    server.tool(
        "generateProjectArchitecture",
        "Genera arquitectura completa basada en requerimientos",
        z.object({
            requirements: z.object({}),
            domain: z.string(),
            constraints: z.object({}).optional()
        }),
        async (input) => {
            // Implementación...
        }
    );
}
```

## Herramientas de Conocimiento: `src/tools/knowledge-tools.ts`

```typescript
export function registerKnowledgeTools(server: McpServer, env: Env, props: Props) {
    // searchKnowledge
    server.tool(
        "searchKnowledge",
        "Búsqueda semántica en base de conocimiento del dominio",
        z.object({
            query: z.string(),
            domain: z.string().optional(),
            type: z.enum(['component', 'pattern', 'solution', 'documentation']).optional(),
            limit: z.number().default(10)
        }),
        async (input) => {
            const results = await searchKnowledgeBase(input);
            
            return {
                content: [{
                    type: "text",
                    text: `**Resultados de Búsqueda para: "${input.query}"**\n\n${results.map(r => `**${r.title}** (${r.similarity.toFixed(3)})\n${r.content.substring(0, 200)}...\n`).join('\n')}`
                }]
            };
        }
    );
    
    // queryProjectGraph
    server.tool(
        "queryProjectGraph",
        "Consultas al knowledge graph usando Neo4j",
        z.object({
            query: z.string(),
            nodeTypes: z.array(z.string()).optional(),
            relationshipTypes: z.array(z.string()).optional()
        }),
        async (input) => {
            // Implementación consulta Neo4j...
        }
    );
}
```

## Patrones de Implementación

### Patrón Base para Todas las Herramientas

```typescript
// Patrón estándar para implementar herramientas MCP
async function standardToolPattern(input: ValidatedInput): Promise<MCPResponse> {
    try {
        // 1. Validación adicional específica
        await validateDomainSpecificRules(input);
        
        // 2. Búsqueda de contexto en knowledge base
        const context = await searchKnowledgeBase({
            query: input.query,
            domain: input.domain
        });
        
        // 3. Generación usando AI + contexto
        const result = await generateWithAI({
            prompt: getPromptTemplate(input.type),
            context: { input, knowledgeContext: context },
            model: env.CLAUDE_MODEL
        });
        
        // 4. Post-procesamiento y validación
        const validatedResult = await validateGeneratedCode(result);
        
        // 5. Actualización de knowledge base
        await updateKnowledgeBase(validatedResult, input);
        
        // 6. Respuesta estructurada
        return {
            content: [{
                type: "text",
                text: formatResult(validatedResult)
            }]
        };
        
    } catch (error) {
        return createErrorResponse(`Error en ${toolName}: ${error.message}`);
    }
}
```

### Error Handling Consistente

```typescript
function createErrorResponse(message: string, details?: any): MCPResponse {
    return {
        content: [{
            type: "text",
            text: `**Error**\n\n${message}${details ? `\n\n**Detalles:**\n\`\`\`json\n${JSON.stringify(details, null, 2)}\n\`\`\`` : ''}`,
            isError: true
        }]
    };
}

function createSuccessResponse(result: any, title: string): MCPResponse {
    return {
        content: [{
            type: "text",
            text: `**${title}**\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
        }]
    };
}
```