import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Props } from "./types";
import { GitHubHandler } from "./auth/github-handler";
import { closeDb } from "./database/connection";
import { registerAllTools } from "./tools/register-tools";

/**
 * CLASE PRINCIPAL DEL SERVIDOR MCP
 * 
 * Esta clase extiende McpAgent para crear un servidor MCP completo con:
 * - Autenticación GitHub OAuth
 * - Integración de base de datos PostgreSQL  
 * - Registro dinámico de herramientas basado en permisos
 * - Gestión de limpieza y recursos
 */
export class MyMCP extends McpAgent<Env, Record<string, never>, Props> {
	// Servidor MCP configurado con metadatos
	server = new McpServer({
		name: "PostgreSQL Database MCP Server",
		version: "1.0.0",
	});

	/**
	 * LIMPIEZA DE CONEXIONES DE BASE DE DATOS
	 * 
	 * Se ejecuta cuando el Durable Object se está cerrando
	 * Asegura que todas las conexiones de base de datos se cierren apropiadamente
	 */
	async cleanup(): Promise<void> {
		try {
			await closeDb();
			console.log('Conexiones de base de datos cerradas exitosamente');
		} catch (error) {
			console.error('Error durante limpieza de base de datos:', error);
		}
	}

	/**
	 * MANEJADOR DE ALARMA DE DURABLE OBJECTS
	 * 
	 * Se ejecuta automáticamente por el runtime de Cloudflare
	 * para tareas de mantenimiento y limpieza programadas
	 */
	async alarm(): Promise<void> {
		await this.cleanup();
	}

	/**
	 * INICIALIZACIÓN DEL SERVIDOR MCP
	 * 
	 * Registra todas las herramientas disponibles basándose en:
	 * - Permisos del usuario autenticado
	 * - Configuración del entorno
	 * - Reglas de seguridad definidas
	 */
	async init() {
		// Registrar todas las herramientas basándose en permisos de usuario
		registerAllTools(this.server, this.env, this.props);
	}
}

/**
 * CONFIGURACIÓN PRINCIPAL DEL PROVEEDOR OAUTH
 * 
 * Exporta la configuración del Worker de Cloudflare con:
 * - Endpoints de API para MCP y SSE
 * - Configuración de OAuth con GitHub
 * - Rutas de autorización y tokens
 * 
 * Endpoints disponibles:
 * - /sse: Server-Sent Events para comunicación en tiempo real
 * - /mcp: Protocolo MCP principal para herramientas
 * - /authorize: Autorización OAuth
 * - /register: Registro de clientes OAuth
 * - /token: Intercambio de tokens OAuth
 */
export default new OAuthProvider({
	apiHandlers: {
		'/sse': MyMCP.serveSSE('/sse') as any,
		'/mcp': MyMCP.serve('/mcp') as any,
	},
	authorizeEndpoint: "/authorize",
	clientRegistrationEndpoint: "/register",
	defaultHandler: GitHubHandler as any,
	tokenEndpoint: "/token",
});