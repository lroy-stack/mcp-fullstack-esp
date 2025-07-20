import * as Sentry from "@sentry/cloudflare";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
	Props, 
	ListTablesSchema, 
	QueryDatabaseSchema, 
	ExecuteDatabaseSchema,
	createErrorResponse,
	createSuccessResponse
} from "../types";
import { validateSqlQuery, isWriteOperation, formatDatabaseError } from "../database/security";
import { withDatabase } from "../database/utils";

const ALLOWED_USERNAMES = new Set<string>([
	// Agregar nombres de usuario de GitHub de usuarios que deben tener acceso a operaciones de escritura en base de datos
	// Por ejemplo: 'tususuario', 'usuariocompañero'
	'coleam00'
]);

// Helper de manejo de errores para herramientas MCP con Sentry
function handleError(error: unknown): { content: Array<{ type: "text"; text: string; isError?: boolean }> } {
	const eventId = Sentry.captureException(error);

	const errorMessage = [
		"**Error**",
		"Hubo un problema con tu solicitud.",
		"Por favor reporta lo siguiente al equipo de soporte:",
		`**ID del Evento**: ${eventId}`,
		process.env.NODE_ENV !== "production"
			? error instanceof Error
				? error.message
				: String(error)
			: "",
	].join("\n\n");

	return {
		content: [
			{
				type: "text",
				text: errorMessage,
				isError: true,
			},
		],
	};
}

export function registerDatabaseToolsWithSentry(server: McpServer, env: Env, props: Props) {
	// Herramienta 1: Listar Tablas - Disponible para todos los usuarios autenticados
	server.tool(
		"listTables",
		"Obtener una lista de todas las tablas en la base de datos junto con información de sus columnas. Usa esto primero para entender la estructura de la base de datos antes de consultar.",
		ListTablesSchema,
		async () => {
			return await Sentry.startNewTrace(async () => {
				return await Sentry.startSpan({
					name: "mcp.tool/listTables",
					attributes: {
						'mcp.tool.name': 'listTables',
						'mcp.user.login': props.login,
					},
				}, async (span) => {
					// Establecer contexto de usuario
					Sentry.setUser({
						username: props.login,
						email: props.email,
					});

					try {
						return await withDatabase((env as any).DATABASE_URL, async (db) => {
							// Consulta única para obtener toda la información de tablas y columnas (usando tu consulta funcional)
							const columns = await db.unsafe(`
								SELECT 
									table_name, 
									column_name, 
									data_type, 
									is_nullable,
									column_default
								FROM information_schema.columns 
								WHERE table_schema = 'public' 
								ORDER BY table_name, ordinal_position
							`);
							
							// Agrupar columnas por tabla
							const tableMap = new Map();
							for (const col of columns) {
								// Usar nombres de propiedades snake_case como son devueltos por la consulta SQL
								if (!tableMap.has(col.table_name)) {
									tableMap.set(col.table_name, {
										name: col.table_name,
										schema: 'public',
										columns: []
									});
								}
								tableMap.get(col.table_name).columns.push({
									name: col.column_name,
									type: col.data_type,
									nullable: col.is_nullable === 'YES',
									default: col.column_default
								});
							}
							
							const tableInfo = Array.from(tableMap.values());
							
							return {
								content: [
									{
										type: "text",
										text: `**Tablas y Esquema de Base de Datos**\n\n${JSON.stringify(tableInfo, null, 2)}\n\n**Total de tablas encontradas:** ${tableInfo.length}\n\n**Nota:** Usa la herramienta \`queryDatabase\` para ejecutar consultas SELECT, o la herramienta \`executeDatabase\` para operaciones de escritura (si tienes acceso de escritura).`
									}
								]
							};
						});
					} catch (error) {
						console.error('Error en listTables:', error);
						span.setStatus({ code: 2 }); // error
						return handleError(error);
					}
				});
			});
		}
	);

	// Herramienta 2: Consultar Base de Datos - Disponible para todos los usuarios autenticados (solo lectura)
	server.tool(
		"queryDatabase",
		"Ejecutar una consulta SQL de solo lectura contra la base de datos PostgreSQL. Esta herramienta solo permite declaraciones SELECT y otras operaciones de lectura. Todos los usuarios autenticados pueden usar esta herramienta.",
		QueryDatabaseSchema,
		async ({ sql }) => {
			return await Sentry.startNewTrace(async () => {
				return await Sentry.startSpan({
					name: "mcp.tool/queryDatabase",
					attributes: {
						'mcp.tool.name': 'queryDatabase',
						'mcp.user.login': props.login,
						'mcp.sql.query': sql.substring(0, 100), // Truncar por seguridad
					},
				}, async (span) => {
					// Establecer contexto de usuario
					Sentry.setUser({
						username: props.login,
						email: props.email,
					});

					try {
						// Validar la consulta SQL
						const validation = validateSqlQuery(sql);
						if (!validation.isValid) {
							return createErrorResponse(`Consulta SQL inválida: ${validation.error}`);
						}
						
						// Verificar si es una operación de escritura
						if (isWriteOperation(sql)) {
							return createErrorResponse(
								"Las operaciones de escritura no están permitidas con esta herramienta. Usa la herramienta `executeDatabase` si tienes permisos de escritura (requiere acceso especial de nombre de usuario de GitHub)."
							);
						}
						
						return await withDatabase((env as any).DATABASE_URL, async (db) => {
							const results = await db.unsafe(sql);
							
							return {
								content: [
									{
										type: "text",
										text: `**Resultados de Consulta**\n\`\`\`sql\n${sql}\n\`\`\`\n\n**Resultados:**\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n\n**Filas devueltas:** ${Array.isArray(results) ? results.length : 1}`
									}
								]
							};
						});
					} catch (error) {
						console.error('Error en queryDatabase:', error);
						span.setStatus({ code: 2 }); // error
						return handleError(error);
					}
				});
			});
		}
	);

	// Herramienta 3: Ejecutar Base de Datos - Solo disponible para usuarios privilegiados (operaciones de escritura)
	if (ALLOWED_USERNAMES.has(props.login)) {
		server.tool(
			"executeDatabase",
			"Ejecutar cualquier declaración SQL contra la base de datos PostgreSQL, incluyendo operaciones INSERT, UPDATE, DELETE y DDL. Esta herramienta está restringida a usuarios específicos de GitHub y puede realizar transacciones de escritura. **USAR CON PRECAUCIÓN** - esto puede modificar o eliminar datos.",
			ExecuteDatabaseSchema,
			async ({ sql }) => {
				return await Sentry.startNewTrace(async () => {
					return await Sentry.startSpan({
						name: "mcp.tool/executeDatabase",
						attributes: {
							'mcp.tool.name': 'executeDatabase',
							'mcp.user.login': props.login,
							'mcp.sql.query': sql.substring(0, 100), // Truncar por seguridad
							'mcp.sql.is_write': isWriteOperation(sql),
						},
					}, async (span) => {
						// Establecer contexto de usuario
						Sentry.setUser({
							username: props.login,
							email: props.email,
						});

						try {
							// Validar la consulta SQL
							const validation = validateSqlQuery(sql);
							if (!validation.isValid) {
								return createErrorResponse(`Declaración SQL inválida: ${validation.error}`);
							}
							
							return await withDatabase((env as any).DATABASE_URL, async (db) => {
								const results = await db.unsafe(sql);
								
								const isWrite = isWriteOperation(sql);
								const operationType = isWrite ? "Operación de Escritura" : "Operación de Lectura";
								
								return {
									content: [
										{
											type: "text",
											text: `**${operationType} Ejecutada Exitosamente**\n\`\`\`sql\n${sql}\n\`\`\`\n\n**Resultados:**\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n\n${isWrite ? '**⚠️ Base de datos fue modificada**' : `**Filas devueltas:** ${Array.isArray(results) ? results.length : 1}`}\n\n**Ejecutado por:** ${props.login} (${props.name})`
										}
									]
								};
							});
						} catch (error) {
							console.error('Error en executeDatabase:', error);
							span.setStatus({ code: 2 }); // error
							return handleError(error);
						}
					});
				});
			}
		);
	}
}