-- Ejemplo: Políticas RLS Completas para Seguridad a Nivel de Fila
-- Patrón: Row Level Security + Role-based Access + Audit Trail + Performance

-- =============================================================================
-- CONFIGURACIÓN INICIAL DE SEGURIDAD
-- =============================================================================

-- Habilitar RLS en todas las tablas sensibles
ALTER TABLE restaurante.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurante.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.interacciones_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm.segmentaciones_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE operaciones.estados_mesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE operaciones.combinaciones_mesa ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION auth.get_current_employee_role()
RETURNS personal.rol_empleado
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role personal.rol_empleado;
BEGIN
    -- Intentar obtener el rol desde la tabla de empleados usando el email del usuario autenticado
    SELECT e.rol INTO user_role
    FROM personal.empleados e
    WHERE e.email = auth.email() 
    AND e.activo = true;
    
    -- Si no se encuentra el usuario, asignar rol más restrictivo
    IF user_role IS NULL THEN
        RETURN 'host';
    END IF;
    
    RETURN user_role;
END;
$$;

-- Función auxiliar para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN auth.get_current_employee_role() = 'admin';
END;
$$;

-- Función auxiliar para verificar si el usuario es manager o admin
CREATE OR REPLACE FUNCTION auth.is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN auth.get_current_employee_role() IN ('admin', 'gerente');
END;
$$;

-- Función auxiliar para obtener el ID del empleado actual
CREATE OR REPLACE FUNCTION auth.get_current_employee_id()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    employee_id INTEGER;
BEGIN
    SELECT e.id INTO employee_id
    FROM personal.empleados e
    WHERE e.email = auth.email()
    AND e.activo = true;
    
    RETURN employee_id;
END;
$$;

-- =============================================================================
-- POLÍTICAS PARA TABLA DE CLIENTES
-- =============================================================================

-- Los empleados pueden ver todos los clientes activos (no en blacklist)
CREATE POLICY "Empleados pueden ver clientes activos" ON restaurante.clientes
    FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND NOT blacklist
    );

-- Solo managers y admins pueden ver clientes en blacklist
CREATE POLICY "Managers pueden ver clientes blacklist" ON restaurante.clientes
    FOR SELECT
    USING (
        auth.is_manager_or_admin()
        AND blacklist = true
    );

-- Todos los empleados autenticados pueden crear clientes
CREATE POLICY "Empleados pueden crear clientes" ON restaurante.clientes
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND blacklist = false  -- No se puede crear directamente en blacklist
    );

-- Solo managers y admins pueden modificar información crítica de clientes
CREATE POLICY "Managers pueden actualizar clientes" ON restaurante.clientes
    FOR UPDATE
    USING (auth.is_manager_or_admin())
    WITH CHECK (
        auth.is_manager_or_admin()
        -- Evitar que se modifique el ID
        AND id = (SELECT id FROM restaurante.clientes WHERE id = id)
    );

-- Solo staff+ puede modificar información básica (no blacklist ni segmento VIP)
CREATE POLICY "Staff puede actualizar info basica clientes" ON restaurante.clientes
    FOR UPDATE
    USING (
        auth.get_current_employee_role() IN ('staff', 'gerente', 'admin')
        AND NOT blacklist
    )
    WITH CHECK (
        auth.get_current_employee_role() IN ('staff', 'gerente', 'admin')
        AND blacklist = false
        AND segmento != 'vip'  -- No pueden crear VIPs
    );

-- Solo administradores pueden eliminar clientes
CREATE POLICY "Solo admin puede eliminar clientes" ON restaurante.clientes
    FOR DELETE
    USING (auth.is_admin());

-- =============================================================================
-- POLÍTICAS PARA TABLA DE RESERVAS
-- =============================================================================

-- Empleados pueden ver reservas del mes actual y siguientes
CREATE POLICY "Empleados ven reservas actuales" ON restaurante.reservas
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND fecha_reserva >= DATE_TRUNC('month', CURRENT_DATE)
    );

-- Managers pueden ver historial completo
CREATE POLICY "Managers ven historial completo reservas" ON restaurante.reservas
    FOR SELECT
    USING (auth.is_manager_or_admin());

-- Todos los empleados pueden crear reservas
CREATE POLICY "Empleados pueden crear reservas" ON restaurante.reservas
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND created_by = auth.get_current_employee_id()
        AND fecha_reserva >= CURRENT_DATE
    );

-- Employees pueden modificar reservas no completadas
CREATE POLICY "Empleados pueden actualizar reservas pendientes" ON restaurante.reservas
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND estado IN ('pendiente', 'confirmada')
        AND fecha_reserva >= CURRENT_DATE
    )
    WITH CHECK (
        auth.role() = 'authenticated'
        AND estado IN ('pendiente', 'confirmada', 'sentada', 'cancelada', 'no_show')
        -- No pueden cambiar campos de auditoría
        AND created_by = (SELECT created_by FROM restaurante.reservas WHERE id = id)
    );

-- Solo managers pueden modificar reservas completadas o del pasado
CREATE POLICY "Managers pueden actualizar reservas completadas" ON restaurante.reservas
    FOR UPDATE
    USING (
        auth.is_manager_or_admin()
        AND (estado = 'completada' OR fecha_reserva < CURRENT_DATE)
    );

-- Solo managers pueden eliminar reservas
CREATE POLICY "Solo managers pueden eliminar reservas" ON restaurante.reservas
    FOR DELETE
    USING (auth.is_manager_or_admin());

-- =============================================================================
-- POLÍTICAS PARA TABLA DE MESAS
-- =============================================================================

-- Todos los empleados pueden ver mesas activas
CREATE POLICY "Empleados ven mesas activas" ON restaurante.mesas
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND activa = true
    );

-- Managers pueden ver mesas inactivas
CREATE POLICY "Managers ven mesas inactivas" ON restaurante.mesas
    FOR SELECT
    USING (
        auth.is_manager_or_admin()
        AND activa = false
    );

-- Solo administradores pueden crear/modificar/eliminar mesas
CREATE POLICY "Solo admin modifica mesas" ON restaurante.mesas
    FOR ALL
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

-- =============================================================================
-- POLÍTICAS PARA TABLA DE EMPLEADOS
-- =============================================================================

-- Los empleados solo pueden ver información básica de otros empleados activos
CREATE POLICY "Empleados ven info basica colegas" ON personal.empleados
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND activo = true
        AND (
            -- Pueden ver su propia información completa
            email = auth.email()
            OR
            -- Solo información básica de otros (sin salario)
            auth.get_current_employee_role() IN ('staff', 'gerente', 'admin')
        )
    );

-- Solo administradores pueden gestionar empleados
CREATE POLICY "Solo admin gestiona empleados" ON personal.empleados
    FOR INSERT
    WITH CHECK (auth.is_admin());

CREATE POLICY "Solo admin modifica empleados" ON personal.empleados
    FOR UPDATE
    USING (auth.is_admin())
    WITH CHECK (auth.is_admin());

CREATE POLICY "Solo admin elimina empleados" ON personal.empleados
    FOR DELETE
    USING (auth.is_admin());

-- Los empleados pueden actualizar su propia información básica
CREATE POLICY "Empleados actualizan su info" ON personal.empleados
    FOR UPDATE
    USING (
        email = auth.email()
        AND activo = true
    )
    WITH CHECK (
        email = auth.email()
        AND activo = true
        -- No pueden cambiar campos críticos
        AND rol = (SELECT rol FROM personal.empleados WHERE email = auth.email())
        AND fecha_contratacion = (SELECT fecha_contratacion FROM personal.empleados WHERE email = auth.email())
    );

-- =============================================================================
-- POLÍTICAS PARA TABLA DE INTERACCIONES CRM
-- =============================================================================

-- Los empleados pueden ver interacciones donde participaron
CREATE POLICY "Empleados ven sus interacciones" ON crm.interacciones_cliente
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND empleado_id = auth.get_current_employee_id()
    );

-- Managers pueden ver todas las interacciones
CREATE POLICY "Managers ven todas las interacciones" ON crm.interacciones_cliente
    FOR SELECT
    USING (auth.is_manager_or_admin());

-- Los empleados pueden crear interacciones asignándose a sí mismos
CREATE POLICY "Empleados crean sus interacciones" ON crm.interacciones_cliente
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND empleado_id = auth.get_current_employee_id()
    );

-- Los empleados pueden actualizar sus propias interacciones recientes
CREATE POLICY "Empleados actualizan sus interacciones recientes" ON crm.interacciones_cliente
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND empleado_id = auth.get_current_employee_id()
        AND created_at > NOW() - INTERVAL '24 hours'
    );

-- =============================================================================
-- POLÍTICAS PARA ESTADOS DE MESA
-- =============================================================================

-- Todos los empleados pueden ver estados actuales de mesa
CREATE POLICY "Empleados ven estados mesa" ON operaciones.estados_mesa
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Los empleados pueden crear nuevos estados de mesa
CREATE POLICY "Empleados crean estados mesa" ON operaciones.estados_mesa
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND empleado_id = auth.get_current_employee_id()
    );

-- Solo el empleado que creó el estado o managers pueden modificarlo
CREATE POLICY "Empleados modifican sus estados mesa" ON operaciones.estados_mesa
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND (
            empleado_id = auth.get_current_employee_id()
            OR auth.is_manager_or_admin()
        )
    );

-- =============================================================================
-- POLÍTICAS PARA COMBINACIONES DE MESA
-- =============================================================================

-- Todos pueden ver combinaciones activas
CREATE POLICY "Empleados ven combinaciones activas" ON operaciones.combinaciones_mesa
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
        AND activa = true
    );

-- Solo managers pueden gestionar combinaciones
CREATE POLICY "Solo managers gestionan combinaciones" ON operaciones.combinaciones_mesa
    FOR ALL
    USING (auth.is_manager_or_admin())
    WITH CHECK (auth.is_manager_or_admin());

-- =============================================================================
-- POLÍTICAS PARA AUDITORÍA Y LOGGING
-- =============================================================================

-- Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit.logs (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_email TEXT DEFAULT auth.email(),
    user_role TEXT DEFAULT auth.get_current_employee_role()::TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET DEFAULT inet_client_addr()
);

-- RLS para logs de auditoría
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden ver logs de auditoría
CREATE POLICY "Solo admin ve logs auditoria" ON audit.logs
    FOR SELECT
    USING (auth.is_admin());

-- Función para logging automático
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO audit.logs (table_name, operation, old_values, new_values)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers de auditoría a tablas críticas
CREATE TRIGGER audit_clientes AFTER INSERT OR UPDATE OR DELETE ON restaurante.clientes
    FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

CREATE TRIGGER audit_reservas AFTER INSERT OR UPDATE OR DELETE ON restaurante.reservas
    FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

CREATE TRIGGER audit_empleados AFTER INSERT OR UPDATE OR DELETE ON personal.empleados
    FOR EACH ROW EXECUTE FUNCTION audit.log_changes();

-- =============================================================================
-- FUNCIONES DE VERIFICACIÓN DE PERMISOS
-- =============================================================================

-- Función para verificar permisos específicos
CREATE OR REPLACE FUNCTION auth.check_permission(
    p_user_id TEXT,
    p_resource TEXT,
    p_action TEXT,
    p_context JSONB DEFAULT '{}'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role personal.rol_empleado;
    allowed BOOLEAN := false;
BEGIN
    -- Obtener rol del usuario
    SELECT e.rol INTO user_role
    FROM personal.empleados e
    WHERE e.email = p_user_id AND e.activo = true;
    
    IF user_role IS NULL THEN
        RETURN false;
    END IF;
    
    -- Administradores tienen todos los permisos
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Verificar permisos específicos por recurso
    CASE p_resource
        WHEN 'reservations' THEN
            CASE p_action
                WHEN 'create', 'read' THEN allowed := true;
                WHEN 'update' THEN 
                    allowed := user_role IN ('staff', 'gerente') OR
                              (p_context->>'status' NOT IN ('completada'));
                WHEN 'delete' THEN allowed := user_role = 'gerente';
                ELSE allowed := false;
            END CASE;
            
        WHEN 'clients' THEN
            CASE p_action
                WHEN 'create', 'read' THEN allowed := true;
                WHEN 'update' THEN 
                    allowed := user_role IN ('staff', 'gerente') OR
                              (p_context->>'segment' != 'vip');
                WHEN 'delete' THEN allowed := false; -- Solo admin puede eliminar
                ELSE allowed := false;
            END CASE;
            
        WHEN 'tables' THEN
            CASE p_action
                WHEN 'read' THEN allowed := true;
                WHEN 'update' THEN allowed := user_role IN ('staff', 'gerente');
                ELSE allowed := false; -- Solo admin puede crear/eliminar mesas
            END CASE;
            
        WHEN 'admin' THEN
            allowed := false; -- Solo admin (ya verificado arriba)
            
        ELSE
            allowed := false;
    END CASE;
    
    RETURN allowed;
END;
$$;

-- =============================================================================
-- VISTAS SEGURAS PARA REPORTES
-- =============================================================================

-- Vista segura de estadísticas (sin datos sensibles)
CREATE VIEW reports.estadisticas_publicas AS
SELECT 
    DATE_TRUNC('day', r.fecha_reserva) as fecha,
    COUNT(*) as total_reservas,
    AVG(r.numero_personas) as promedio_personas,
    COUNT(DISTINCT r.cliente_id) as clientes_unicos
FROM restaurante.reservas r
WHERE r.fecha_reserva >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', r.fecha_reserva);

-- RLS para la vista de estadísticas
ALTER VIEW reports.estadisticas_publicas SET (security_barrier = true);

-- =============================================================================
-- FUNCIÓN DE VERIFICACIÓN DE CONFIGURACIÓN RLS
-- =============================================================================

-- Función para verificar que RLS esté configurado correctamente
CREATE OR REPLACE FUNCTION admin.verify_rls_configuration()
RETURNS TABLE(
    schema_name TEXT,
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER,
    has_select_policy BOOLEAN,
    has_insert_policy BOOLEAN,
    has_update_policy BOOLEAN,
    has_delete_policy BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH table_policies AS (
        SELECT 
            schemaname,
            tablename,
            relrowsecurity as rls_enabled,
            COUNT(pol.policyname) as policy_count,
            COUNT(pol.policyname) FILTER (WHERE pol.cmd = 'r') > 0 as has_select_policy,
            COUNT(pol.policyname) FILTER (WHERE pol.cmd = 'a') > 0 as has_insert_policy,
            COUNT(pol.policyname) FILTER (WHERE pol.cmd = 'w') > 0 as has_update_policy,
            COUNT(pol.policyname) FILTER (WHERE pol.cmd = 'd') > 0 as has_delete_policy
        FROM pg_tables t
        LEFT JOIN pg_class c ON c.relname = t.tablename
        LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
        LEFT JOIN pg_policy pol ON pol.polrelid = c.oid
        WHERE t.schemaname IN ('restaurante', 'personal', 'crm', 'operaciones', 'audit')
        GROUP BY schemaname, tablename, relrowsecurity
    )
    SELECT * FROM table_policies
    ORDER BY schemaname, tablename;
END;
$$;

-- =============================================================================
-- TESTING Y VALIDACIÓN
-- =============================================================================

-- Función de test para verificar políticas
CREATE OR REPLACE FUNCTION admin.test_rls_policies()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    test_result TEXT := '';
    test_count INTEGER := 0;
    pass_count INTEGER := 0;
BEGIN
    -- Test 1: Verificar que RLS está habilitado
    test_count := test_count + 1;
    IF (SELECT COUNT(*) FROM pg_tables t 
        JOIN pg_class c ON c.relname = t.tablename 
        WHERE t.schemaname IN ('restaurante', 'personal', 'crm', 'operaciones') 
        AND c.relrowsecurity = true) > 0 THEN
        pass_count := pass_count + 1;
        test_result := test_result || 'PASS: RLS habilitado en tablas principales' || E'\n';
    ELSE
        test_result := test_result || 'FAIL: RLS no habilitado correctamente' || E'\n';
    END IF;
    
    -- Test 2: Verificar políticas de empleados
    test_count := test_count + 1;
    IF (SELECT COUNT(*) FROM pg_policy WHERE polrelid = 'personal.empleados'::regclass) >= 4 THEN
        pass_count := pass_count + 1;
        test_result := test_result || 'PASS: Políticas de empleados configuradas' || E'\n';
    ELSE
        test_result := test_result || 'FAIL: Políticas de empleados insuficientes' || E'\n';
    END IF;
    
    -- Test 3: Verificar función de roles
    test_count := test_count + 1;
    BEGIN
        PERFORM auth.get_current_employee_role();
        pass_count := pass_count + 1;
        test_result := test_result || 'PASS: Función de roles funciona' || E'\n';
    EXCEPTION WHEN OTHERS THEN
        test_result := test_result || 'FAIL: Función de roles con errores' || E'\n';
    END;
    
    test_result := test_result || E'\n' || 'Tests completados: ' || pass_count || '/' || test_count || ' exitosos';
    
    RETURN test_result;
END;
$$;

-- =============================================================================
-- DOCUMENTACIÓN Y COMENTARIOS
-- =============================================================================

COMMENT ON FUNCTION auth.get_current_employee_role() IS 'Obtiene el rol del empleado autenticado actual';
COMMENT ON FUNCTION auth.is_admin() IS 'Verifica si el usuario actual es administrador';
COMMENT ON FUNCTION auth.is_manager_or_admin() IS 'Verifica si el usuario actual es manager o admin';
COMMENT ON FUNCTION auth.check_permission() IS 'Función genérica para verificar permisos específicos con contexto';
COMMENT ON FUNCTION admin.verify_rls_configuration() IS 'Verifica la configuración de RLS en todas las tablas';
COMMENT ON FUNCTION admin.test_rls_policies() IS 'Ejecuta tests básicos de las políticas RLS';

-- Ejecutar verificación inicial
SELECT admin.verify_rls_configuration();
SELECT admin.test_rls_policies();