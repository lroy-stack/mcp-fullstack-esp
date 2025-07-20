import { z } from "zod";
import type { AuthRequest, OAuthHelpers, ClientInfo } from "@cloudflare/workers-oauth-provider";

/**
 * TIPOS Y INTERFACES PARA SERVIDOR MCP
 * 
 * Define todas las estructuras de datos, tipos TypeScript y esquemas Zod
 * utilizados en el servidor MCP para garantizar type safety y validación.
 */

// Contexto de usuario pasado a través de OAuth
export type Props = {
  login: string;        // Nombre de usuario de GitHub
  name: string;         // Nombre completo del usuario
  email: string;        // Email del usuario desde GitHub
  accessToken: string;  // Token de acceso OAuth para APIs de GitHub
};

// Entorno extendido con proveedor OAuth
export type ExtendedEnv = Env & { OAUTH_PROVIDER: OAuthHelpers };

// Parámetros para construcción de URL de autorización OAuth
export interface UpstreamAuthorizeParams {
  upstream_url: string;  // URL del proveedor OAuth (GitHub)
  client_id: string;     // ID de cliente de la aplicación GitHub
  scope: string;         // Permisos solicitados (ej: "user:email")
  redirect_uri: string;  // URI de redirección después de autorización
  state?: string;        // Estado opcional para seguridad CSRF
}

// Parámetros para intercambio de código por token OAuth
export interface UpstreamTokenParams {
  code: string | undefined;     // Código de autorización de GitHub
  upstream_url: string;         // URL para intercambio de token
  client_secret: string;        // Secret de cliente (CONFIDENCIAL)
  redirect_uri: string;         // URI de redirección registrada
  client_id: string;           // ID de cliente de la aplicación
}

// Configuración del diálogo de aprobación OAuth
export interface ApprovalDialogOptions {
  client: ClientInfo | null;    // Información del cliente OAuth
  server: {
    name: string;              // Nombre del servidor MCP
    logo?: string;             // URL del logo opcional
    description?: string;      // Descripción opcional
  };
  state: Record<string, any>;  // Estado de la sesión
  cookieName?: string;         // Nombre de cookie personalizado
  cookieSecret?: string | Uint8Array;  // Secret para firmar cookies
  cookieDomain?: string;       // Dominio de cookie
  cookiePath?: string;         // Path de cookie
  cookieMaxAge?: number;       // Tiempo de vida de cookie en segundos
}

// Resultado de parsing del formulario de aprobación
export interface ParsedApprovalResult {
  approved: boolean;           // Si el usuario aprobó el acceso
  scopes?: string[];          // Permisos aprobados
  client_id?: string;         // ID del cliente aprobado
  state?: Record<string, any>; // Estado mantenido durante flujo
}

/**
 * ESQUEMAS ZOD PARA VALIDACIÓN DE HERRAMIENTAS MCP
 * 
 * Estos esquemas definen y validan los parámetros de entrada
 * para cada herramienta MCP disponible en el servidor.
 */

// Esquema para herramienta de listar tablas
export const ListTablesSchema = z.object({
  // Sin parámetros - lista todas las tablas disponibles
});

// Esquema para herramienta de consulta de base de datos (solo lectura)
export const QueryDatabaseSchema = z.object({
  sql: z.string()
    .min(1, "La consulta SQL no puede estar vacía")
    .max(10000, "La consulta SQL es demasiado larga")
    .describe("Consulta SQL SELECT para ejecutar (solo operaciones de lectura)")
});

// Esquema para herramienta de ejecución de base de datos (lectura/escritura)
export const ExecuteDatabaseSchema = z.object({
  sql: z.string()
    .min(1, "La declaración SQL no puede estar vacía")
    .max(10000, "La declaración SQL es demasiado larga")
    .describe("Declaración SQL para ejecutar (INSERT, UPDATE, DELETE, DDL permitidos)")
});

/**
 * FUNCIONES HELPER PARA RESPUESTAS MCP
 * 
 * Estas funciones crean respuestas consistentes para las herramientas MCP
 * siguiendo el formato esperado por el protocolo.
 */

// Crear respuesta de error estandarizada
export function createErrorResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: `**Error**: ${message}`,
        isError: true,
      },
    ],
  };
}

// Crear respuesta de éxito estandarizada
export function createSuccessResponse(message: string, data?: any) {
  const text = data 
    ? `**Éxito**: ${message}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
    : `**Éxito**: ${message}`;
    
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}

/**
 * TIPOS PARA MANEJO DE ERRORES Y LOGGING
 * 
 * Estructuras para manejo consistente de errores y logging
 * a través del servidor MCP.
 */

// Tipo para errores de base de datos estructurados
export interface DatabaseError {
  code: string;           // Código de error SQL
  message: string;        // Mensaje de error legible
  detail?: string;        // Detalles adicionales del error
  hint?: string;          // Sugerencia para resolver el error
  position?: string;      // Posición en la consulta donde ocurrió el error
}

// Tipo para contexto de logging estructurado
export interface LogContext {
  userId: string;         // ID del usuario que ejecuta la acción
  action: string;         // Acción siendo ejecutada
  timestamp: Date;        // Timestamp de la acción
  metadata?: Record<string, any>;  // Metadatos adicionales
}

/**
 * CONSTANTES DE CONFIGURACIÓN
 */

// Tipos de operaciones SQL permitidas
export const SQL_OPERATION_TYPES = {
  READ: ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'] as const,
  WRITE: ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE'] as const,
} as const;

// Límites de configuración
export const LIMITS = {
  MAX_SQL_LENGTH: 10000,        // Longitud máxima de consulta SQL
  MAX_RESULTS: 1000,            // Máximo número de resultados
  QUERY_TIMEOUT: 30000,         // Timeout de consulta en ms
  MAX_CONNECTIONS: 10,          // Máximo conexiones concurrentes
} as const;