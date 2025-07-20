# Sistema de Autenticación y Permisos Full Stack MCP

## Propósito

Especificación del sistema de autenticación y permisos granulares para el Servidor MCP Full Stack Developer, basado en GitHub OAuth del repositorio `remote-mcp-server-with-auth-main`.

## Arquitectura de Autenticación

### GitHub OAuth Flow

```typescript
// src/auth/github-handler.ts - Flujo OAuth completo
import { Octokit } from "@octokit/rest";
import { McpAgent } from "agents/mcp";

export class GitHubHandler {
    // 1. Authorization Request
    async handleAuthorize(request: Request, env: Env): Promise<Response> {
        const oauthReqInfo = await env.OAUTH_PROVIDER.parseAuthRequest(request);
        
        // Verificar si cliente ya está aprobado
        if (await clientIdAlreadyApproved(request, oauthReqInfo.clientId, env.COOKIE_ENCRYPTION_KEY)) {
            return redirectToGithub(request, oauthReqInfo, env, {});
        }
        
        // Mostrar diálogo de aprobación
        return renderApprovalDialog(request, { client, server, state });
    }
    
    // 2. GitHub Callback
    async handleCallback(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        
        // Intercambiar código por access token
        const accessToken = await this.exchangeCodeForToken(code, env);
        
        // Obtener información del usuario de GitHub
        const octokit = new Octokit({ auth: accessToken });
        const { data: user } = await octokit.rest.users.getAuthenticated();
        
        // Determinar permisos del usuario
        const permissions = getUserPermissions(user.login);
        
        // Completar autorización con props extendidos
        return env.OAUTH_PROVIDER.completeAuthorization({
            props: {
                login: user.login,
                name: user.name || user.login,
                email: user.email,
                accessToken,
                permissions,
                projectContext: await getProjectContext(user.login)
            } as Props,
            userId: user.login,
        });
    }
    
    private async exchangeCodeForToken(code: string, env: Env): Promise<string> {
        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                client_id: env.GITHUB_CLIENT_ID,
                client_secret: env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });
        
        const data = await response.json();
        return data.access_token;
    }
}
```

### Sistema de Permisos Extendido

```typescript
// src/types.ts - Tipos extendidos con permisos
export interface Props {
    // Datos de GitHub OAuth
    login: string;           // GitHub username
    name: string;            // Display name  
    email: string;           // Email address
    accessToken: string;     // GitHub access token
    
    // Permisos extendidos para Full Stack MCP
    permissions: Permission[];
    projectContext?: ProjectContext;
}

export enum Permission {
    // Permisos básicos
    READ_KNOWLEDGE = "read_knowledge",      // Buscar en knowledge base
    READ_COMPONENTS = "read_components",    // Ver componentes existentes
    
    // Permisos de desarrollo
    WRITE_FRONTEND = "write_frontend",      // Generar componentes/páginas
    WRITE_BACKEND = "write_backend",        // Generar APIs/esquemas
    WRITE_TESTS = "write_tests",            // Generar tests
    
    // Permisos avanzados
    ADMIN_DEPLOY = "admin_deploy",          // Desplegar a producción
    ADMIN_SECURITY = "admin_security",      // Configurar seguridad
    ADMIN_CONFIG = "admin_config",          // Modificar configuración
}

export interface ProjectContext {
    projectId: string;
    domain: string;              // restaurant, ecommerce, etc
    stack: string[];             // ['nextjs', 'supabase', 'tailwind']
    environment: 'development' | 'staging' | 'production';
}
```

### Configuración de Permisos por Usuario

```typescript
// src/auth/permissions.ts
const USER_PERMISSIONS: Record<string, Permission[]> = {
    // Desarrolladores Full Stack con acceso completo
    'developer1': [
        Permission.READ_KNOWLEDGE,
        Permission.READ_COMPONENTS,
        Permission.WRITE_FRONTEND,
        Permission.WRITE_BACKEND,
        Permission.WRITE_TESTS,
    ],
    
    // Desarrolladores Frontend especializados
    'frontend-dev1': [
        Permission.READ_KNOWLEDGE,
        Permission.READ_COMPONENTS,
        Permission.WRITE_FRONTEND,
        Permission.WRITE_TESTS,
    ],
    
    // Desarrolladores Backend especializados
    'backend-dev1': [
        Permission.READ_KNOWLEDGE,
        Permission.READ_COMPONENTS,
        Permission.WRITE_BACKEND,
        Permission.WRITE_TESTS,
    ],
    
    // Arquitectos de sistema
    'architect1': [
        Permission.READ_KNOWLEDGE,
        Permission.READ_COMPONENTS,
        Permission.WRITE_FRONTEND,
        Permission.WRITE_BACKEND,
        Permission.WRITE_TESTS,
        Permission.ADMIN_CONFIG,
    ],
    
    // Administradores con todos los permisos
    'admin1': Object.values(Permission),
    'security-lead': Object.values(Permission),
    
    // Usuarios de solo lectura (default)
    '*': [
        Permission.READ_KNOWLEDGE,
        Permission.READ_COMPONENTS,
    ]
};

export function getUserPermissions(login: string): Permission[] {
    return USER_PERMISSIONS[login] || USER_PERMISSIONS['*'];
}

export function hasPermission(props: Props, permission: Permission): boolean {
    return props.permissions.includes(permission);
}

export function requirePermission(props: Props, permission: Permission): void {
    if (!hasPermission(props, permission)) {
        throw new Error(`Permission denied: ${permission} required`);
    }
}
```

### Aplicación de Permisos en Herramientas

```typescript
// src/tools/backend-tools.ts - Ejemplo de aplicación de permisos
export function registerBackendTools(server: McpServer, env: Env, props: Props) {
    // Solo registrar herramientas si tiene permisos de backend
    if (!hasPermission(props, Permission.WRITE_BACKEND)) {
        console.log(`User ${props.login} does not have backend permissions`);
        return;
    }
    
    server.tool(
        "generateAPIEndpoint",
        "Genera endpoints API con validación y tests",
        GenerateAPISchema,
        async (input) => {
            try {
                // Doble verificación de permisos en tiempo de ejecución
                requirePermission(props, Permission.WRITE_BACKEND);
                
                // Verificar contexto del proyecto si es necesario
                if (input.environment === 'production') {
                    requirePermission(props, Permission.ADMIN_DEPLOY);
                }
                
                // Lógica de generación...
                const apiCode = await generateAPICode(input, props.projectContext);
                
                return createSuccessResponse(apiCode, "API Endpoint Generated");
                
            } catch (error) {
                if (error.message.includes('Permission denied')) {
                    return createErrorResponse(
                        "Permisos insuficientes para generar APIs",
                        { required: Permission.WRITE_BACKEND, user: props.login }
                    );
                }
                
                return createErrorResponse(`Error generando API: ${error.message}`);
            }
        }
    );
}
```

### Middleware de Autenticación

```typescript
// src/auth/middleware.ts
export class AuthMiddleware {
    static async validateRequest(request: Request, env: Env): Promise<Props | null> {
        try {
            // Extraer token de headers o cookies
            const token = this.extractToken(request);
            if (!token) return null;
            
            // Validar token con GitHub
            const octokit = new Octokit({ auth: token });
            const { data: user } = await octokit.rest.users.getAuthenticated();
            
            // Construir props con permisos
            const permissions = getUserPermissions(user.login);
            const projectContext = await getProjectContext(user.login);
            
            return {
                login: user.login,
                name: user.name || user.login,
                email: user.email,
                accessToken: token,
                permissions,
                projectContext
            };
            
        } catch (error) {
            console.error('Authentication failed:', error);
            return null;
        }
    }
    
    private static extractToken(request: Request): string | null {
        // Extraer de Authorization header
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        // Extraer de cookies (para sesiones web)
        const cookies = this.parseCookies(request.headers.get('Cookie') || '');
        return cookies.access_token || null;
    }
    
    private static parseCookies(cookieString: string): Record<string, string> {
        const cookies: Record<string, string> = {};
        cookieString.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
        });
        return cookies;
    }
}
```

### Contexto de Proyecto

```typescript
// src/auth/project-context.ts
interface ProjectConfig {
    domain: string;
    defaultStack: string[];
    environments: string[];
    deploymentTargets: string[];
}

const PROJECT_CONFIGS: Record<string, ProjectConfig> = {
    'restaurant-management': {
        domain: 'restaurant',
        defaultStack: ['nextjs', 'supabase', 'tailwind', 'prisma'],
        environments: ['development', 'staging', 'production'],
        deploymentTargets: ['vercel', 'cloudflare']
    },
    'ecommerce-platform': {
        domain: 'ecommerce',
        defaultStack: ['nextjs', 'stripe', 'supabase', 'tailwind'],
        environments: ['development', 'staging', 'production'],
        deploymentTargets: ['vercel', 'aws']
    }
};

export async function getProjectContext(login: string): Promise<ProjectContext | undefined> {
    // Determinar proyecto actual del usuario
    const userProjects = await getUserProjects(login);
    const currentProject = userProjects.find(p => p.active);
    
    if (!currentProject) return undefined;
    
    const config = PROJECT_CONFIGS[currentProject.type];
    if (!config) return undefined;
    
    return {
        projectId: currentProject.id,
        domain: config.domain,
        stack: config.defaultStack,
        environment: currentProject.environment || 'development'
    };
}
```

### Rate Limiting y Seguridad

```typescript
// src/auth/rate-limiting.ts
export class RateLimiter {
    private static readonly LIMITS = {
        [Permission.READ_KNOWLEDGE]: { requests: 100, window: 60 }, // 100 req/min
        [Permission.WRITE_FRONTEND]: { requests: 20, window: 60 },  // 20 req/min
        [Permission.WRITE_BACKEND]: { requests: 10, window: 60 },   // 10 req/min
        [Permission.ADMIN_DEPLOY]: { requests: 5, window: 60 },     // 5 req/min
    };
    
    static async checkLimit(
        userId: string, 
        permission: Permission, 
        storage: KVNamespace
    ): Promise<boolean> {
        const limit = this.LIMITS[permission];
        if (!limit) return true;
        
        const key = `rate_limit:${userId}:${permission}`;
        const count = await storage.get(key);
        const currentCount = count ? parseInt(count) : 0;
        
        if (currentCount >= limit.requests) {
            return false; // Rate limit exceeded
        }
        
        // Increment counter
        await storage.put(
            key, 
            (currentCount + 1).toString(), 
            { expirationTtl: limit.window }
        );
        
        return true;
    }
}
```

### Auditoría y Logging

```typescript
// src/auth/audit.ts
export class AuditLogger {
    static async logToolUsage(
        props: Props,
        toolName: string,
        input: any,
        result: 'success' | 'error',
        details?: any
    ): Promise<void> {
        const auditEvent = {
            timestamp: new Date().toISOString(),
            userId: props.login,
            userName: props.name,
            toolName,
            permissions: props.permissions,
            projectContext: props.projectContext,
            input: this.sanitizeInput(input),
            result,
            details: details || {},
            ip: this.getClientIP(),
            userAgent: this.getUserAgent()
        };
        
        // Log to console for development
        console.log('Audit Event:', JSON.stringify(auditEvent, null, 2));
        
        // Send to external logging service in production
        if (process.env.NODE_ENV === 'production') {
            await this.sendToAuditService(auditEvent);
        }
    }
    
    private static sanitizeInput(input: any): any {
        // Remove sensitive data from audit logs
        const sanitized = { ...input };
        delete sanitized.password;
        delete sanitized.secret;
        delete sanitized.token;
        return sanitized;
    }
}
```