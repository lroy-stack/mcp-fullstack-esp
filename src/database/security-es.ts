import type { SqlValidationResult } from "../types";

/**
 * MÓDULO DE SEGURIDAD PARA BASE DE DATOS - SERVIDOR MCP
 * 
 * Este módulo implementa protecciones críticas de seguridad para operaciones
 * de base de datos, incluyendo:
 * - Protección contra inyección SQL
 * - Validación de tipos de operaciones
 * - Formateo seguro de errores
 * - Filtrado de información sensible
 */

/**
 * PROTECCIÓN CONTRA INYECCIÓN SQL
 * 
 * Validación básica de palabras clave SQL peligrosas.
 * IMPORTANTE: Esta es una verificación simple - en producción debes usar consultas parametrizadas
 * 
 * @param sql - Consulta SQL a validar
 * @returns Resultado de validación con estado y mensaje de error si aplica
 */
export function validateSqlQuery(sql: string): SqlValidationResult {
	const trimmedSql = sql.trim().toLowerCase();
	
	// Verificar consultas vacías
	if (!trimmedSql) {
		return { isValid: false, error: "La consulta SQL no puede estar vacía" };
	}
	
	// Verificar patrones obviamente peligrosos
	const dangerousPatterns = [
		/;\s*drop\s+/i,                                    // DROP después de ;
		/^drop\s+/i,                                       // DROP al inicio de consulta
		/;\s*delete\s+.*\s+where\s+1\s*=\s*1/i,           // DELETE masivo
		/;\s*update\s+.*\s+set\s+.*\s+where\s+1\s*=\s*1/i, // UPDATE masivo
		/;\s*truncate\s+/i,                                // TRUNCATE después de ;
		/^truncate\s+/i,                                   // TRUNCATE al inicio
		/;\s*alter\s+/i,                                   // ALTER después de ;
		/^alter\s+/i,                                      // ALTER al inicio
		/;\s*create\s+/i,                                  // CREATE después de ;
		/;\s*grant\s+/i,                                   // GRANT (permisos)
		/;\s*revoke\s+/i,                                  // REVOKE (permisos)
		/xp_cmdshell/i,                                    // Comando shell SQL Server
		/sp_executesql/i,                                  // Ejecución dinámica SQL Server
	];
	
	// Verificar cada patrón peligroso
	for (const pattern of dangerousPatterns) {
		if (pattern.test(sql)) {
			return { 
				isValid: false, 
				error: "La consulta contiene patrones SQL potencialmente peligrosos" 
			};
		}
	}
	
	// Consulta validada exitosamente
	return { isValid: true };
}

/**
 * VERIFICAR SI UNA CONSULTA SQL ES OPERACIÓN DE ESCRITURA
 * 
 * Determina si una consulta SQL modifica datos o estructura de la base de datos.
 * Útil para aplicar diferentes niveles de permisos.
 * 
 * @param sql - Consulta SQL a verificar
 * @returns true si es operación de escritura, false si es solo lectura
 */
export function isWriteOperation(sql: string): boolean {
	const trimmedSql = sql.trim().toLowerCase();
	
	// Palabras clave que indican operaciones de escritura
	const writeKeywords = [
		'insert',    // Insertar datos
		'update',    // Actualizar datos
		'delete',    // Eliminar datos
		'create',    // Crear objetos de BD
		'drop',      // Eliminar objetos de BD
		'alter',     // Modificar estructura
		'truncate',  // Vaciar tabla
		'grant',     // Otorgar permisos
		'revoke',    // Revocar permisos
		'commit',    // Confirmar transacción
		'rollback'   // Revertir transacción
	];
	
	// Verificar si la consulta inicia con alguna palabra clave de escritura
	return writeKeywords.some(keyword => trimmedSql.startsWith(keyword));
}

/**
 * FORMATEAR ERROR DE BASE DE DATOS DE FORMA SEGURA
 * 
 * Formatea errores de base de datos para mostrar al usuario, ocultando
 * información sensible como credenciales, detalles de conexión, etc.
 * 
 * @param error - Error capturado de operación de base de datos
 * @returns Mensaje de error seguro y legible para el usuario
 */
export function formatDatabaseError(error: unknown): string {
	if (error instanceof Error) {
		// Ocultar detalles sensibles de conexión
		if (error.message.includes('password')) {
			return "Falló la autenticación de base de datos. Por favor verifica tus credenciales.";
		}
		
		if (error.message.includes('timeout')) {
			return "La conexión a la base de datos expiró. Por favor intenta de nuevo.";
		}
		
		if (error.message.includes('connection') || error.message.includes('connect')) {
			return "No se pudo conectar a la base de datos. Por favor verifica tu cadena de conexión.";
		}
		
		// Para otros errores, mostrar mensaje pero sin detalles internos
		return `Error de base de datos: ${error.message}`;
	}
	
	// Error desconocido - mensaje genérico seguro
	return "Ocurrió un error desconocido en la base de datos.";
}

/**
 * FUNCIONES ADICIONALES DE SEGURIDAD
 */

/**
 * Verificar si el usuario tiene permisos de escritura basado en su login de GitHub
 * 
 * @param userLogin - Login de GitHub del usuario
 * @param allowedUsers - Set de usuarios con permisos de escritura
 * @returns true si el usuario tiene permisos de escritura
 */
export function hasWritePermissions(userLogin: string, allowedUsers: Set<string>): boolean {
	return allowedUsers.has(userLogin);
}

/**
 * Limpiar consulta SQL removiendo comentarios y espacios extra
 * 
 * @param sql - Consulta SQL original
 * @returns Consulta SQL limpia
 */
export function sanitizeSqlQuery(sql: string): string {
	return sql
		.replace(/--.*$/gm, '')      // Remover comentarios de línea
		.replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios de bloque
		.replace(/\s+/g, ' ')        // Normalizar espacios
		.trim();                     // Remover espacios al inicio/final
}

/**
 * Validar límites de consulta para prevenir ataques de denegación de servicio
 * 
 * @param sql - Consulta SQL a validar
 * @param maxLength - Longitud máxima permitida
 * @returns Resultado de validación
 */
export function validateQueryLimits(sql: string, maxLength: number = 10000): SqlValidationResult {
	if (sql.length > maxLength) {
		return {
			isValid: false,
			error: `La consulta SQL es demasiado larga (${sql.length} caracteres, máximo ${maxLength})`
		};
	}
	
	return { isValid: true };
}

/**
 * CONSTANTES DE SEGURIDAD
 */

// Límites por defecto
export const SECURITY_LIMITS = {
	MAX_SQL_LENGTH: 10000,           // Longitud máxima de consulta
	MAX_RESULTS: 1000,               // Máximo número de resultados
	QUERY_TIMEOUT_MS: 30000,         // Timeout de consulta en milisegundos
	MAX_CONNECTIONS: 10,             // Máximo conexiones concurrentes
} as const;

// Patrones de consultas permitidas solo para lectura
export const READ_ONLY_PATTERNS = [
	/^select\s+/i,
	/^show\s+/i,
	/^describe\s+/i,
	/^explain\s+/i,
	/^with\s+/i,  // Common Table Expressions que empiecen con WITH
] as const;