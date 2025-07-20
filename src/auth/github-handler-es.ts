// import { env } from "cloudflare:workers";
import type { AuthRequest } from "@cloudflare/workers-oauth-provider";
import { Hono } from "hono";
import { Octokit } from "octokit";
import type { Props, ExtendedEnv } from "../types";
import {
	clientIdAlreadyApproved,
	parseRedirectApproval,
	renderApprovalDialog,
	fetchUpstreamAuthToken,
	getUpstreamAuthorizeUrl,
} from "./oauth-utils";

/**
 * MANEJADOR DE AUTENTICACIÓN GITHUB PARA SERVIDOR MCP
 * 
 * Este módulo implementa el flujo completo de autenticación OAuth 2.0 con GitHub
 * para el servidor MCP, incluyendo:
 * - Autorización inicial del usuario
 * - Diálogo de aprobación de permisos
 * - Callback de GitHub con intercambio de tokens
 * - Integración con el proveedor OAuth de Cloudflare
 */

const app = new Hono<{ Bindings: ExtendedEnv }>();

/**
 * ENDPOINT DE AUTORIZACIÓN (/authorize)
 * 
 * Maneja la solicitud inicial de autorización OAuth.
 * Verifica si el cliente ya fue aprobado y muestra el diálogo si es necesario.
 */
app.get("/authorize", async (c) => {
	// Parsear información de la solicitud OAuth
	const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
	const { clientId } = oauthReqInfo;
	
	// Validar que se proporcione clientId
	if (!clientId) {
		return c.text("Solicitud inválida", 400);
	}

	// Verificar si el cliente ya fue aprobado previamente
	if (
		await clientIdAlreadyApproved(c.req.raw, oauthReqInfo.clientId, (c.env as any).COOKIE_ENCRYPTION_KEY)
	) {
		// Redirigir directamente a GitHub si ya está aprobado
		return redirectToGithub(c.req.raw, oauthReqInfo, c.env, {});
	}

	// Renderizar diálogo de aprobación para nuevo cliente
	return renderApprovalDialog(c.req.raw, {
		client: await c.env.OAUTH_PROVIDER.lookupClient(clientId),
		server: {
			description: "Este es un servidor MCP remoto demo usando GitHub para autenticación.",
			logo: "https://avatars.githubusercontent.com/u/314135?s=200&v=4",
			name: "Servidor MCP GitHub de Cloudflare",
		},
		state: { oauthReqInfo }, // Datos arbitrarios que fluyen a través del envío del formulario
	});
});

/**
 * ENDPOINT POST DE AUTORIZACIÓN (/authorize)
 * 
 * Procesa el envío del formulario de aprobación, valida la respuesta,
 * extrae el estado y genera headers Set-Cookie para omitir el diálogo la próxima vez.
 */
app.post("/authorize", async (c) => {
	// Validar envío de formulario, extraer estado y generar headers Set-Cookie
	const { state, headers } = await parseRedirectApproval(c.req.raw, (c.env as any).COOKIE_ENCRYPTION_KEY);
	
	if (!state.oauthReqInfo) {
		return c.text("Solicitud inválida", 400);
	}

	// Redirigir a GitHub con headers de aprobación
	return redirectToGithub(c.req.raw, state.oauthReqInfo, c.env, headers);
});

/**
 * FUNCIÓN DE REDIRECCIÓN A GITHUB
 * 
 * Construye la URL de autorización de GitHub y redirige al usuario.
 * Incluye todos los parámetros necesarios para el flujo OAuth.
 */
async function redirectToGithub(
	request: Request,
	oauthReqInfo: AuthRequest,
	env: Env,
	headers: Record<string, string> = {},
) {
	return new Response(null, {
		headers: {
			...headers,
			location: getUpstreamAuthorizeUrl({
				client_id: (env as any).GITHUB_CLIENT_ID,
				redirect_uri: new URL("/callback", request.url).href,
				scope: "read:user", // Permisos mínimos requeridos
				state: btoa(JSON.stringify(oauthReqInfo)), // Estado codificado
				upstream_url: "https://github.com/login/oauth/authorize",
			}),
		},
		status: 302,
	});
}

/**
 * ENDPOINT DE CALLBACK OAUTH (/callback)
 *
 * Esta ruta maneja el callback de GitHub después de la autenticación del usuario.
 * Realiza las siguientes operaciones:
 * 1. Intercambia el código temporal por un access token
 * 2. Obtiene información del usuario desde GitHub API
 * 3. Almacena metadatos del usuario y el token como 'props'
 * 4. Redirige al cliente de vuelta a su URL de callback
 */
app.get("/callback", async (c) => {
	// Obtener oauthReqInfo decodificado del parámetro state
	const oauthReqInfo = JSON.parse(atob(c.req.query("state") as string)) as AuthRequest;
	
	if (!oauthReqInfo.clientId) {
		return c.text("Estado inválido", 400);
	}

	// Intercambiar el código por un access token
	const [accessToken, errResponse] = await fetchUpstreamAuthToken({
		client_id: (c.env as any).GITHUB_CLIENT_ID,
		client_secret: (c.env as any).GITHUB_CLIENT_SECRET,
		code: c.req.query("code"),
		redirect_uri: new URL("/callback", c.req.url).href,
		upstream_url: "https://github.com/login/oauth/access_token",
	});
	
	if (errResponse) return errResponse;

	// Obtener información del usuario desde GitHub API
	const user = await new Octokit({ auth: accessToken }).rest.users.getAuthenticated();
	const { login, name, email } = user.data;

	// Completar autorización y devolver token al cliente MCP
	const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
		metadata: {
			label: name, // Etiqueta legible para el usuario
		},
		// Estas props estarán disponibles en this.props dentro de MyMCP
		props: {
			accessToken,  // Token para llamadas API de GitHub
			email,        // Email del usuario
			login,        // Nombre de usuario de GitHub
			name,         // Nombre completo
		} as Props,
		request: oauthReqInfo,
		scope: oauthReqInfo.scope,
		userId: login, // Usar login de GitHub como ID único
	});

	// Redirigir de vuelta al cliente MCP
	return Response.redirect(redirectTo);
});

// Exportar el manejador configurado
export { app as GitHubHandler };