-- Ejemplo: Triggers de Auditoría y Business Logic
-- Patrón: Event-Driven + Audit Trail + Data Validation + Performance

-- =============================================================================
-- CONFIGURACIÓN DE AUDITORÍA
-- =============================================================================

-- Crear esquema de auditoría si no existe
CREATE SCHEMA IF NOT EXISTS audit;

-- Tabla principal de auditoría
CREATE TABLE IF NOT EXISTS audit.logs (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    schema_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id TEXT DEFAULT auth.uid()::TEXT,
    user_email TEXT DEFAULT auth.email(),
    user_role TEXT DEFAULT auth.get_current_employee_role()::TEXT,
    ip_address INET DEFAULT inet_client_addr(),
    user_agent TEXT DEFAULT current_setting('request.headers.user-agent', true),
    session_id TEXT DEFAULT current_setting('request.jwt.claims', true)::JSONB->>'session_id',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para búsquedas eficientes
    CONSTRAINT check_record_id CHECK (
        (operation = 'INSERT' AND record_id IS NOT NULL) OR
        (operation = 'UPDATE' AND record_id IS NOT NULL) OR
        (operation = 'DELETE' AND record_id IS NOT NULL)
    )
);

-- Índices para la tabla de auditoría
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit.logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit.logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit.logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit.logs(table_name, record_id, timestamp);

-- Tabla para configuración de auditoría
CREATE TABLE IF NOT EXISTS audit.config (
    table_name TEXT PRIMARY KEY,
    schema_name TEXT NOT NULL,
    audit_insert BOOLEAN DEFAULT true,
    audit_update BOOLEAN DEFAULT true,
    audit_delete BOOLEAN DEFAULT true,
    sensitive_fields TEXT[] DEFAULT '{}',
    retention_days INTEGER DEFAULT 365,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FUNCIÓN GENÉRICA DE AUDITORÍA
-- =============================================================================

-- Función principal para logging de auditoría
CREATE OR REPLACE FUNCTION audit.log_data_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    audit_config_row audit.config%ROWTYPE;
    record_id_value INTEGER;
    changed_fields_array TEXT[] := '{}';
    field_name TEXT;
    old_val TEXT;
    new_val TEXT;
    sensitive_fields TEXT[] := '{}';
BEGIN
    -- Obtener configuración de auditoría para esta tabla
    SELECT * INTO audit_config_row
    FROM audit.config
    WHERE table_name = TG_TABLE_NAME 
    AND schema_name = TG_TABLE_SCHEMA;
    
    -- Si no hay configuración o está deshabilitada, salir
    IF audit_config_row IS NULL OR NOT audit_config_row.enabled THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Verificar si esta operación debe ser auditada
    IF (TG_OP = 'INSERT' AND NOT audit_config_row.audit_insert) OR
       (TG_OP = 'UPDATE' AND NOT audit_config_row.audit_update) OR
       (TG_OP = 'DELETE' AND NOT audit_config_row.audit_delete) THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Obtener ID del registro
    CASE TG_OP
        WHEN 'INSERT' THEN record_id_value := NEW.id;
        WHEN 'UPDATE' THEN record_id_value := NEW.id;
        WHEN 'DELETE' THEN record_id_value := OLD.id;
    END CASE;
    
    -- Obtener campos sensibles
    sensitive_fields := COALESCE(audit_config_row.sensitive_fields, '{}');
    
    -- Para UPDATE, identificar campos que cambiaron
    IF TG_OP = 'UPDATE' THEN
        FOR field_name IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = TG_TABLE_SCHEMA 
            AND table_name = TG_TABLE_NAME
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', field_name, field_name) 
            INTO old_val, new_val 
            USING OLD, NEW;
            
            IF old_val IS DISTINCT FROM new_val THEN
                changed_fields_array := array_append(changed_fields_array, field_name);
            END IF;
        END LOOP;
        
        -- Si no hay cambios, no auditar
        IF array_length(changed_fields_array, 1) IS NULL THEN
            RETURN NEW;
        END IF;
    END IF;
    
    -- Insertar log de auditoría
    INSERT INTO audit.logs (
        table_name,
        schema_name,
        operation,
        record_id,
        old_values,
        new_values,
        changed_fields
    ) VALUES (
        TG_TABLE_NAME,
        TG_TABLE_SCHEMA,
        TG_OP,
        record_id_value,
        CASE 
            WHEN TG_OP = 'DELETE' THEN 
                -- Filtrar campos sensibles en DELETE
                (SELECT jsonb_object_agg(key, 
                    CASE WHEN key = ANY(sensitive_fields) THEN '[REDACTED]' ELSE value END
                ) FROM jsonb_each_text(to_jsonb(OLD)))
            WHEN TG_OP = 'UPDATE' THEN 
                -- Solo campos que cambiaron en UPDATE
                (SELECT jsonb_object_agg(key, 
                    CASE WHEN key = ANY(sensitive_fields) THEN '[REDACTED]' ELSE value END
                ) FROM jsonb_each_text(to_jsonb(OLD)) WHERE key = ANY(changed_fields_array))
            ELSE NULL 
        END,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 
                -- Filtrar campos sensibles en INSERT
                (SELECT jsonb_object_agg(key, 
                    CASE WHEN key = ANY(sensitive_fields) THEN '[REDACTED]' ELSE value END
                ) FROM jsonb_each_text(to_jsonb(NEW)))
            WHEN TG_OP = 'UPDATE' THEN 
                -- Solo campos que cambiaron en UPDATE
                (SELECT jsonb_object_agg(key, 
                    CASE WHEN key = ANY(sensitive_fields) THEN '[REDACTED]' ELSE value END
                ) FROM jsonb_each_text(to_jsonb(NEW)) WHERE key = ANY(changed_fields_array))
            ELSE NULL 
        END,
        changed_fields_array
    );
    
    RETURN COALESCE(NEW, OLD);
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar la operación principal
        RAISE WARNING 'Error en trigger de auditoría para %.%: %', TG_TABLE_SCHEMA, TG_TABLE_NAME, SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$;

-- =============================================================================
-- TRIGGERS DE BUSINESS LOGIC
-- =============================================================================

-- Trigger para validar y actualizar estadísticas de clientes
CREATE OR REPLACE FUNCTION restaurante.actualizar_estadisticas_cliente_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    cliente_stats RECORD;
BEGIN
    -- Solo procesar cuando el estado cambia a 'completada'
    IF TG_OP = 'UPDATE' AND NEW.estado = 'completada' AND 
       (OLD.estado IS NULL OR OLD.estado != 'completada') THEN
        
        -- Calcular estadísticas actualizadas del cliente
        SELECT 
            COUNT(*) as total_visitas,
            MAX(fecha_reserva) as ultima_visita,
            AVG(numero_personas) as promedio_personas,
            SUM(numero_personas * 45.00) as valor_vida_estimado  -- Ticket promedio €45
        INTO cliente_stats
        FROM restaurante.reservas
        WHERE cliente_id = NEW.cliente_id
        AND estado = 'completada';
        
        -- Actualizar estadísticas del cliente
        UPDATE restaurante.clientes 
        SET 
            total_visitas = cliente_stats.total_visitas,
            ultima_visita = NEW.completada_en,
            valor_vida_estimado = COALESCE(cliente_stats.valor_vida_estimado, 0),
            -- Actualizar segmento basado en comportamiento
            segmento = CASE 
                WHEN cliente_stats.total_visitas >= 10 AND cliente_stats.valor_vida_estimado > 500 THEN 'vip'::crm.segmento_cliente
                WHEN cliente_stats.total_visitas >= 5 THEN 'regular'::crm.segmento_cliente
                WHEN cliente_stats.total_visitas >= 1 THEN 'nuevo'::crm.segmento_cliente
                ELSE segmento  -- Mantener segmento actual
            END,
            updated_at = NOW()
        WHERE id = NEW.cliente_id;
        
        -- Crear interacción automática en CRM
        INSERT INTO crm.interacciones_cliente (
            cliente_id,
            empleado_id,
            tipo,
            descripcion,
            resultado
        ) VALUES (
            NEW.cliente_id,
            auth.get_current_employee_id(),
            'visita_completada',
            'Visita completada - Reserva #' || NEW.id || ' para ' || NEW.numero_personas || ' personas',
            'exitosa'
        );
    END IF;
    
    -- Validaciones adicionales para cambios de estado
    IF TG_OP = 'UPDATE' AND OLD.estado != NEW.estado THEN
        
        -- Validar transiciones de estado válidas
        IF NOT restaurante.es_transicion_estado_valida(OLD.estado, NEW.estado) THEN
            RAISE EXCEPTION 'Transición de estado inválida: % -> %', OLD.estado, NEW.estado;
        END IF;
        
        -- Actualizar timestamps automáticamente
        CASE NEW.estado
            WHEN 'confirmada' THEN NEW.confirmada_en := COALESCE(NEW.confirmada_en, NOW());
            WHEN 'sentada' THEN NEW.sentada_en := COALESCE(NEW.sentada_en, NOW());
            WHEN 'completada' THEN NEW.completada_en := COALESCE(NEW.completada_en, NOW());
            WHEN 'cancelada' THEN NEW.cancelada_en := COALESCE(NEW.cancelada_en, NOW());
            ELSE -- No hacer nada para otros estados
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Función auxiliar para validar transiciones de estado
CREATE OR REPLACE FUNCTION restaurante.es_transicion_estado_valida(
    estado_anterior restaurante.estado_reserva,
    estado_nuevo restaurante.estado_reserva
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Matriz de transiciones válidas
    RETURN CASE estado_anterior
        WHEN 'pendiente' THEN estado_nuevo IN ('confirmada', 'cancelada')
        WHEN 'confirmada' THEN estado_nuevo IN ('sentada', 'cancelada', 'no_show')
        WHEN 'sentada' THEN estado_nuevo IN ('completada', 'cancelada')
        WHEN 'completada' THEN estado_nuevo = 'completada'  -- Solo administradores pueden cambiar
        WHEN 'cancelada' THEN estado_nuevo = 'cancelada'    -- Estado final
        WHEN 'no_show' THEN estado_nuevo = 'no_show'        -- Estado final
        ELSE false
    END;
END;
$$;

-- Trigger para gestionar estados de mesa automáticamente
CREATE OR REPLACE FUNCTION operaciones.gestionar_estados_mesa_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    nuevo_estado operaciones.estado_mesa;
BEGIN
    -- Solo procesar si hay una mesa asignada y el estado de reserva cambió
    IF TG_OP = 'UPDATE' AND NEW.mesa_id IS NOT NULL AND 
       (OLD.estado IS DISTINCT FROM NEW.estado) THEN
        
        -- Determinar nuevo estado de mesa basado en estado de reserva
        nuevo_estado := CASE NEW.estado
            WHEN 'confirmada' THEN 'reservada'::operaciones.estado_mesa
            WHEN 'sentada' THEN 'ocupada'::operaciones.estado_mesa
            WHEN 'completada' THEN 'limpieza'::operaciones.estado_mesa
            WHEN 'cancelada' THEN 'libre'::operaciones.estado_mesa
            WHEN 'no_show' THEN 'libre'::operaciones.estado_mesa
            ELSE NULL
        END;
        
        -- Insertar nuevo estado de mesa si corresponde
        IF nuevo_estado IS NOT NULL THEN
            INSERT INTO operaciones.estados_mesa (
                mesa_id,
                estado,
                reserva_id,
                empleado_id,
                notas
            ) VALUES (
                NEW.mesa_id,
                nuevo_estado,
                NEW.id,
                auth.get_current_employee_id(),
                'Estado automático por cambio de reserva a: ' || NEW.estado
            );
        END IF;
    END IF;
    
    -- Si se asigna una mesa por primera vez
    IF TG_OP = 'UPDATE' AND OLD.mesa_id IS NULL AND NEW.mesa_id IS NOT NULL THEN
        INSERT INTO operaciones.estados_mesa (
            mesa_id,
            estado,
            reserva_id,
            empleado_id,
            notas
        ) VALUES (
            NEW.mesa_id,
            CASE NEW.estado
                WHEN 'confirmada' THEN 'reservada'::operaciones.estado_mesa
                WHEN 'sentada' THEN 'ocupada'::operaciones.estado_mesa
                ELSE 'reservada'::operaciones.estado_mesa
            END,
            NEW.id,
            auth.get_current_employee_id(),
            'Mesa asignada a reserva #' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para validaciones de mesa y capacidad
CREATE OR REPLACE FUNCTION restaurante.validar_mesa_capacidad_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    mesa_info RECORD;
    conflicto_record RECORD;
BEGIN
    -- Solo validar si hay mesa asignada
    IF NEW.mesa_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener información de la mesa
    SELECT m.capacidad, m.activa, z.nombre as zona_nombre
    INTO mesa_info
    FROM restaurante.mesas m
    JOIN restaurante.zonas z ON m.zona_id = z.id
    WHERE m.id = NEW.mesa_id;
    
    -- Verificar que la mesa existe y está activa
    IF mesa_info IS NULL THEN
        RAISE EXCEPTION 'Mesa % no encontrada', NEW.mesa_id;
    END IF;
    
    IF NOT mesa_info.activa THEN
        RAISE EXCEPTION 'Mesa % está fuera de servicio', NEW.mesa_id;
    END IF;
    
    -- Verificar capacidad (permitir hasta 20% más por flexibilidad)
    IF NEW.numero_personas > (mesa_info.capacidad * 1.2) THEN
        RAISE EXCEPTION 'Mesa % (capacidad %) no puede acomodar % personas. Máximo permitido: %', 
            NEW.mesa_id, 
            mesa_info.capacidad, 
            NEW.numero_personas,
            (mesa_info.capacidad * 1.2)::INTEGER;
    END IF;
    
    -- Verificar conflictos de horario solo para estados que requieren mesa física
    IF NEW.estado IN ('confirmada', 'sentada') THEN
        SELECT r.id, r.cliente_nombre, r.hora_reserva, r.estado
        INTO conflicto_record
        FROM restaurante.reservas r
        WHERE r.mesa_id = NEW.mesa_id
        AND r.fecha_reserva = NEW.fecha_reserva
        AND r.estado IN ('confirmada', 'sentada')
        AND r.id != NEW.id
        AND (
            -- Verificar solapamiento de horarios
            (NEW.hora_reserva, NEW.hora_reserva + (NEW.duracion_estimada_minutos || ' minutes')::INTERVAL) 
            OVERLAPS 
            (r.hora_reserva, r.hora_reserva + (r.duracion_estimada_minutos || ' minutes')::INTERVAL)
        )
        LIMIT 1;
        
        IF conflicto_record IS NOT NULL THEN
            RAISE EXCEPTION 'Mesa % ya está ocupada el % a las % por % (Reserva #%)', 
                NEW.mesa_id,
                NEW.fecha_reserva,
                conflicto_record.hora_reserva,
                conflicto_record.cliente_nombre,
                conflicto_record.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- =============================================================================
-- TRIGGERS DE PERFORMANCE Y MANTENIMIENTO
-- =============================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger para limpieza automática de datos temporales
CREATE OR REPLACE FUNCTION admin.cleanup_temp_data_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    -- Ejecutar limpieza cada 100 inserts en audit.logs
    IF TG_TABLE_NAME = 'logs' AND (NEW.id % 100) = 0 THEN
        
        -- Limpiar logs de auditoría antiguos (más de 90 días)
        DELETE FROM audit.logs 
        WHERE timestamp < NOW() - INTERVAL '90 days';
        
        GET DIAGNOSTICS cleanup_count = ROW_COUNT;
        
        IF cleanup_count > 0 THEN
            RAISE LOG 'Limpieza automática: % registros de auditoría eliminados', cleanup_count;
        END IF;
        
        -- Limpiar estados de mesa antiguos (mantener solo el más reciente por mesa)
        WITH estados_recientes AS (
            SELECT DISTINCT ON (mesa_id) id
            FROM operaciones.estados_mesa
            ORDER BY mesa_id, inicio_estado DESC
        ),
        estados_a_eliminar AS (
            DELETE FROM operaciones.estados_mesa
            WHERE id NOT IN (SELECT id FROM estados_recientes)
            AND inicio_estado < NOW() - INTERVAL '7 days'
            RETURNING id
        )
        SELECT COUNT(*) INTO cleanup_count FROM estados_a_eliminar;
        
        IF cleanup_count > 0 THEN
            RAISE LOG 'Limpieza automática: % estados de mesa antiguos eliminados', cleanup_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- =============================================================================
-- APLICACIÓN DE TRIGGERS
-- =============================================================================

-- Triggers de auditoría
CREATE TRIGGER audit_clientes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON restaurante.clientes
    FOR EACH ROW EXECUTE FUNCTION audit.log_data_changes();

CREATE TRIGGER audit_reservas_trigger
    AFTER INSERT OR UPDATE OR DELETE ON restaurante.reservas
    FOR EACH ROW EXECUTE FUNCTION audit.log_data_changes();

CREATE TRIGGER audit_empleados_trigger
    AFTER INSERT OR UPDATE OR DELETE ON personal.empleados
    FOR EACH ROW EXECUTE FUNCTION audit.log_data_changes();

-- Triggers de business logic
CREATE TRIGGER actualizar_estadisticas_cliente_trigger
    AFTER UPDATE ON restaurante.reservas
    FOR EACH ROW EXECUTE FUNCTION restaurante.actualizar_estadisticas_cliente_trigger();

CREATE TRIGGER gestionar_estados_mesa_trigger
    AFTER UPDATE ON restaurante.reservas
    FOR EACH ROW EXECUTE FUNCTION operaciones.gestionar_estados_mesa_trigger();

CREATE TRIGGER validar_mesa_capacidad_trigger
    BEFORE INSERT OR UPDATE ON restaurante.reservas
    FOR EACH ROW EXECUTE FUNCTION restaurante.validar_mesa_capacidad_trigger();

-- Triggers de updated_at
CREATE TRIGGER update_zonas_updated_at 
    BEFORE UPDATE ON restaurante.zonas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesas_updated_at 
    BEFORE UPDATE ON restaurante.mesas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON restaurante.clientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservas_updated_at 
    BEFORE UPDATE ON restaurante.reservas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empleados_updated_at 
    BEFORE UPDATE ON personal.empleados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger de limpieza automática
CREATE TRIGGER cleanup_temp_data_trigger
    AFTER INSERT ON audit.logs
    FOR EACH ROW EXECUTE FUNCTION admin.cleanup_temp_data_trigger();

-- =============================================================================
-- CONFIGURACIÓN INICIAL DE AUDITORÍA
-- =============================================================================

-- Configurar auditoría para tablas principales
INSERT INTO audit.config (table_name, schema_name, sensitive_fields, retention_days) VALUES
('clientes', 'restaurante', ARRAY['telefono', 'email'], 365),
('reservas', 'restaurante', ARRAY['cliente_telefono', 'cliente_email'], 365),
('empleados', 'personal', ARRAY['email', 'telefono', 'salario_base'], 730),
('interacciones_cliente', 'crm', ARRAY[], 180),
('estados_mesa', 'operaciones', ARRAY[], 90)
ON CONFLICT (table_name) DO UPDATE SET
    sensitive_fields = EXCLUDED.sensitive_fields,
    retention_days = EXCLUDED.retention_days,
    updated_at = NOW();

-- =============================================================================
-- FUNCIONES DE GESTIÓN DE TRIGGERS
-- =============================================================================

-- Función para habilitar/deshabilitar triggers de auditoría
CREATE OR REPLACE FUNCTION admin.toggle_audit_triggers(
    p_enable BOOLEAN DEFAULT true
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    trigger_record RECORD;
    result_msg TEXT := '';
    action_text TEXT := CASE WHEN p_enable THEN 'ENABLE' ELSE 'DISABLE' END;
BEGIN
    -- Buscar todos los triggers de auditoría
    FOR trigger_record IN
        SELECT 
            t.tgname as trigger_name,
            c.relname as table_name,
            n.nspname as schema_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname LIKE '%audit%'
        AND n.nspname IN ('restaurante', 'personal', 'crm', 'operaciones')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I %s TRIGGER %I', 
            trigger_record.schema_name,
            trigger_record.table_name,
            action_text,
            trigger_record.trigger_name
        );
        
        result_msg := result_msg || format('%s trigger %s en %s.%s' || E'\n',
            action_text,
            trigger_record.trigger_name,
            trigger_record.schema_name,
            trigger_record.table_name
        );
    END LOOP;
    
    RETURN result_msg;
END;
$$;

-- Función para verificar estado de triggers
CREATE OR REPLACE FUNCTION admin.check_trigger_status()
RETURNS TABLE(
    schema_name TEXT,
    table_name TEXT,
    trigger_name TEXT,
    trigger_enabled BOOLEAN,
    trigger_type TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::TEXT,
        c.relname::TEXT,
        t.tgname::TEXT,
        t.tgenabled = 'O',  -- 'O' = enabled, 'D' = disabled
        CASE 
            WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
            WHEN t.tgtype & 4 = 4 THEN 'AFTER'
            ELSE 'INSTEAD OF'
        END::TEXT
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname IN ('restaurante', 'personal', 'crm', 'operaciones', 'audit')
    AND NOT t.tgisinternal
    ORDER BY n.nspname, c.relname, t.tgname;
END;
$$;

-- =============================================================================
-- TESTING Y VALIDACIÓN
-- =============================================================================

-- Función para testear triggers
CREATE OR REPLACE FUNCTION admin.test_triggers()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    test_cliente_id INTEGER;
    test_reserva_id INTEGER;
    audit_count INTEGER;
    result_msg TEXT := '';
BEGIN
    -- Test 1: Crear cliente de prueba y verificar auditoría
    INSERT INTO restaurante.clientes (nombre, telefono, email)
    VALUES ('Test Cliente', '+34612345678', 'test@example.com')
    RETURNING id INTO test_cliente_id;
    
    SELECT COUNT(*) INTO audit_count
    FROM audit.logs
    WHERE table_name = 'clientes' 
    AND operation = 'INSERT'
    AND record_id = test_cliente_id;
    
    result_msg := result_msg || format('Test auditoría cliente: %s' || E'\n',
        CASE WHEN audit_count > 0 THEN 'PASS' ELSE 'FAIL' END
    );
    
    -- Test 2: Crear reserva y verificar estadísticas
    INSERT INTO restaurante.reservas (
        cliente_id, fecha_reserva, hora_reserva, numero_personas,
        cliente_nombre, cliente_telefono, estado
    ) VALUES (
        test_cliente_id, CURRENT_DATE + 1, '14:00', 2,
        'Test Cliente', '+34612345678', 'pendiente'
    ) RETURNING id INTO test_reserva_id;
    
    -- Cambiar estado a completada para activar trigger de estadísticas
    UPDATE restaurante.reservas 
    SET estado = 'completada', completada_en = NOW()
    WHERE id = test_reserva_id;
    
    -- Verificar que se actualizaron estadísticas
    SELECT total_visitas INTO audit_count
    FROM restaurante.clientes
    WHERE id = test_cliente_id;
    
    result_msg := result_msg || format('Test estadísticas cliente: %s' || E'\n',
        CASE WHEN audit_count = 1 THEN 'PASS' ELSE 'FAIL' END
    );
    
    -- Limpiar datos de prueba
    DELETE FROM restaurante.reservas WHERE id = test_reserva_id;
    DELETE FROM restaurante.clientes WHERE id = test_cliente_id;
    DELETE FROM audit.logs WHERE record_id = test_cliente_id;
    
    result_msg := result_msg || 'Datos de prueba limpiados';
    
    RETURN result_msg;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Limpiar en caso de error
        DELETE FROM restaurante.reservas WHERE cliente_id = test_cliente_id;
        DELETE FROM restaurante.clientes WHERE id = test_cliente_id;
        RETURN 'ERROR: ' || SQLERRM;
END;
$$;

-- Comentarios de documentación
COMMENT ON FUNCTION audit.log_data_changes() IS 'Función genérica para auditoría con filtrado de campos sensibles';
COMMENT ON FUNCTION restaurante.actualizar_estadisticas_cliente_trigger() IS 'Actualiza estadísticas y segmentación de clientes automáticamente';
COMMENT ON FUNCTION operaciones.gestionar_estados_mesa_trigger() IS 'Gestiona estados de mesa basado en cambios de reservas';
COMMENT ON FUNCTION admin.toggle_audit_triggers() IS 'Habilita o deshabilita triggers de auditoría en masa';
COMMENT ON FUNCTION admin.test_triggers() IS 'Ejecuta tests básicos de funcionamiento de triggers';

-- Ejecutar test inicial
SELECT admin.test_triggers();