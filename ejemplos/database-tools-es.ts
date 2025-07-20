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
	// Agregar nombres de usuario GitHub de usuarios que deben tener acceso a operaciones de escritura de base de datos
	// Por ejemplo: 'tunombreusuario', 'nombrecompañerotrabajo'
	'coleam00'
]);

export function registerDatabaseTools(server: McpServer, env: Env, props: Props) {
	// Herramienta 1: Listar Tablas - Disponible para todos los usuarios autenticados
	server.tool(
		"listTables",
		"Obtener una lista de todas las tablas en la base de datos junto con su información de columnas. Usar esto primero para entender la estructura de la base de datos antes de consultar.",
		ListTablesSchema,
		async () => {
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
						// Usar nombres de propiedades snake_case como los retorna la consulta SQL
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
								text: `**Tablas de Base de Datos y Esquema**\n\n${JSON.stringify(tableInfo, null, 2)}\n\n**Total tablas encontradas:** ${tableInfo.length}\n\n**Nota:** Usar la herramienta \`queryDatabase\` para ejecutar consultas SELECT, o la herramienta \`executeDatabase\` para operaciones de escritura (si tienes acceso de escritura).`
							}
						]
					};
				});
			} catch (error) {
				console.error('Error listTables:', error);
				return createErrorResponse(
					`Error obteniendo esquema de base de datos: ${formatDatabaseError(error)}`
				);
			}
		}
	);

	// Herramienta 2: Consultar Base de Datos - Disponible para todos los usuarios autenticados (solo lectura)
	server.tool(
		"queryDatabase",
		"Ejecutar una consulta SQL de solo lectura contra la base de datos PostgreSQL. Esta herramienta solo permite declaraciones SELECT y otras operaciones de lectura. Todos los usuarios autenticados pueden usar esta herramienta.",
		QueryDatabaseSchema,
		async ({ sql }) => {
			try {
				// Validar la consulta SQL
				const validation = validateSqlQuery(sql);
				if (!validation.isValid) {
					return createErrorResponse(`Consulta SQL inválida: ${validation.error}`);
				}
				
				// Verificar si es una operación de escritura
				if (isWriteOperation(sql)) {
					return createErrorResponse(
						"Operaciones de escritura no están permitidas con esta herramienta. Usar la herramienta `executeDatabase` si tienes permisos de escritura (requiere acceso especial de nombre de usuario GitHub)."
					);
				}
				
				return await withDatabase((env as any).DATABASE_URL, async (db) => {
					const results = await db.unsafe(sql);
					
					return {
						content: [
							{
								type: "text",
								text: `**Resultados de Consulta**\n\`\`\`sql\n${sql}\n\`\`\`\n\n**Resultados:**\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n\n**Filas retornadas:** ${Array.isArray(results) ? results.length : 1}`
							}
						]
					};
				});
			} catch (error) {
				console.error('Error queryDatabase:', error);
				return createErrorResponse(`Error consulta base de datos: ${formatDatabaseError(error)}`);
			}
		}
	);

	// Herramienta 3: Ejecutar Base de Datos - Solo disponible para usuarios privilegiados (operaciones de escritura)
	if (ALLOWED_USERNAMES.has(props.login)) {
		server.tool(
			"executeDatabase",
			"Ejecutar cualquier declaración SQL contra la base de datos PostgreSQL, incluyendo operaciones INSERT, UPDATE, DELETE y DDL. Esta herramienta está restringida a usuarios específicos de GitHub y puede realizar transacciones de escritura. **USAR CON PRECAUCIÓN** - esto puede modificar o eliminar datos.",
			ExecuteDatabaseSchema,
			async ({ sql }) => {
				try {
					// Validar la declaración SQL
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
									text: `**${operationType} Ejecutada Exitosamente**\n\`\`\`sql\n${sql}\n\`\`\`\n\n**Resultados:**\n\`\`\`json\n${JSON.stringify(results, null, 2)}\n\`\`\`\n\n${isWrite ? '**⚠️ Base de datos fue modificada**' : `**Filas retornadas:** ${Array.isArray(results) ? results.length : 1}`}\n\n**Ejecutado por:** ${props.login} (${props.name})`
								}
							]
						};
					});
				} catch (error) {
					console.error('Error executeDatabase:', error);
					return createErrorResponse(`Error ejecución base de datos: ${formatDatabaseError(error)}`);
				}
			}
		);
	}
}