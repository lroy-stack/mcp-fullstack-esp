-- Ejemplo: Funciones PostgreSQL para Business Logic
-- Patrón: Stored Procedures + Business Rules + Performance + Error Handling

-- =============================================================================
-- FUNCIONES DE DISPONIBILIDAD Y VALIDACIÓN
-- =============================================================================

-- Función para verificar disponibilidad de mesa con validación completa
CREATE OR REPLACE FUNCTION operaciones.verificar_disponibilidad_mesa(
    p_mesa_id INTEGER,
    p_fecha_hora_inicio TIMESTAMPTZ,
    p_duracion_minutos INTEGER DEFAULT 120
)
RETURNS TABLE(
    disponible BOOLEAN,
    razon TEXT,
    conflictos JSONB,
    sugerencias JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    mesa_existe BOOLEAN;
    mesa_activa BOOLEAN;
    mesa_capacidad INTEGER;
    conflicto_record RECORD;
    sugerencias_array JSONB := '[]'::JSONB;
    conflictos_array JSONB := '[]'::JSONB;
    fecha_hora_fin TIMESTAMPTZ;
BEGIN
    -- Calcular hora de finalización
    fecha_hora_fin := p_fecha_hora_inicio + (p_duracion_minutos || ' minutes')::INTERVAL;
    
    -- Verificar que la mesa existe y está activa
    SELECT 
        m.id IS NOT NULL,
        COALESCE(m.activa, false),
        COALESCE(m.capacidad, 0)
    INTO mesa_existe, mesa_activa, mesa_capacidad
    FROM restaurante.mesas m
    WHERE m.id = p_mesa_id;
    
    -- Si la mesa no existe
    IF NOT mesa_existe THEN
        RETURN QUERY SELECT 
            false, 
            'Mesa no encontrada',
            '[]'::JSONB,
            '[]'::JSONB;
        RETURN;
    END IF;
    
    -- Si la mesa no está activa
    IF NOT mesa_activa THEN
        RETURN QUERY SELECT 
            false,
            'Mesa fuera de servicio',
            '[]'::JSONB,
            operaciones.generar_sugerencias_mesas_similares(p_mesa_id, p_fecha_hora_inicio, p_duracion_minutos);
        RETURN;
    END IF;
    
    -- Verificar conflictos de horario
    FOR conflicto_record IN
        SELECT 
            r.id,
            r.cliente_nombre,
            r.hora_reserva,
            r.duracion_estimada_minutos,
            r.estado
        FROM restaurante.reservas r
        WHERE r.mesa_id = p_mesa_id
        AND r.fecha_reserva = p_fecha_hora_inicio::DATE
        AND r.estado IN ('confirmada', 'sentada', 'pendiente')
        AND (
            -- Verificar solapamiento de horarios
            (p_fecha_hora_inicio::TIME, fecha_hora_fin::TIME) OVERLAPS 
            (r.hora_reserva, r.hora_reserva + (r.duracion_estimada_minutos || ' minutes')::INTERVAL)
        )
    LOOP
        conflictos_array := conflictos_array || jsonb_build_object(
            'reserva_id', conflicto_record.id,
            'cliente', conflicto_record.cliente_nombre,
            'hora_inicio', conflicto_record.hora_reserva,
            'hora_fin', conflicto_record.hora_reserva + (conflicto_record.duracion_estimada_minutos || ' minutes')::INTERVAL,
            'estado', conflicto_record.estado
        );
    END LOOP;
    
    -- Si hay conflictos, no está disponible
    IF jsonb_array_length(conflictos_array) > 0 THEN
        -- Generar sugerencias de horarios alternativos
        sugerencias_array := operaciones.sugerir_horarios_alternativos(
            p_mesa_id, 
            p_fecha_hora_inicio::DATE, 
            p_duracion_minutos
        );
        
        RETURN QUERY SELECT 
            false,
            'Mesa ocupada en horario solicitado',
            conflictos_array,
            sugerencias_array;
        RETURN;
    END IF;
    
    -- Mesa disponible
    RETURN QUERY SELECT 
        true,
        'Mesa disponible',
        '[]'::JSONB,
        '[]'::JSONB;
END;
$$;

-- Función para sugerir mesas similares
CREATE OR REPLACE FUNCTION operaciones.generar_sugerencias_mesas_similares(
    p_mesa_id INTEGER,
    p_fecha_hora TIMESTAMPTZ,
    p_duracion_minutos INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    mesa_capacidad INTEGER;
    mesa_zona INTEGER;
    sugerencia RECORD;
    result JSONB := '[]'::JSONB;
BEGIN
    -- Obtener características de la mesa solicitada
    SELECT m.capacidad, m.zona_id 
    INTO mesa_capacidad, mesa_zona
    FROM restaurante.mesas m 
    WHERE m.id = p_mesa_id;
    
    -- Buscar mesas similares disponibles
    FOR sugerencia IN
        SELECT 
            m.id,
            m.numero,
            m.capacidad,
            z.nombre as zona_nombre,
            ABS(m.capacidad - mesa_capacidad) as diferencia_capacidad
        FROM restaurante.mesas m
        JOIN restaurante.zonas z ON m.zona_id = z.id
        WHERE m.activa = true
        AND m.id != p_mesa_id
        AND NOT EXISTS (
            SELECT 1 FROM restaurante.reservas r
            WHERE r.mesa_id = m.id
            AND r.fecha_reserva = p_fecha_hora::DATE
            AND r.estado IN ('confirmada', 'sentada', 'pendiente')
            AND (
                (p_fecha_hora::TIME, p_fecha_hora::TIME + (p_duracion_minutos || ' minutes')::INTERVAL) 
                OVERLAPS 
                (r.hora_reserva, r.hora_reserva + (r.duracion_estimada_minutos || ' minutes')::INTERVAL)
            )
        )
        ORDER BY 
            CASE WHEN m.zona_id = mesa_zona THEN 0 ELSE 1 END,  -- Priorizar misma zona
            diferencia_capacidad,  -- Capacidad similar
            m.capacidad
        LIMIT 5
    LOOP
        result := result || jsonb_build_object(
            'mesa_id', sugerencia.id,
            'numero', sugerencia.numero,
            'capacidad', sugerencia.capacidad,
            'zona', sugerencia.zona_nombre,
            'diferencia_capacidad', sugerencia.diferencia_capacidad
        );
    END LOOP;
    
    RETURN result;
END;
$$;

-- Función para sugerir horarios alternativos
CREATE OR REPLACE FUNCTION operaciones.sugerir_horarios_alternativos(
    p_mesa_id INTEGER,
    p_fecha DATE,
    p_duracion_minutos INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    horario_record RECORD;
    result JSONB := '[]'::JSONB;
    hora_inicio TIME;
    hora_fin TIME;
    intervalos_servicio TIME[][] := ARRAY[
        ARRAY['12:00'::TIME, '16:00'::TIME],  -- Almuerzo
        ARRAY['19:00'::TIME, '23:30'::TIME]   -- Cena
    ];
    intervalo TIME[];
BEGIN
    -- Iterar sobre los intervalos de servicio
    FOREACH intervalo SLICE 1 IN ARRAY intervalos_servicio
    LOOP
        hora_inicio := intervalo[1];
        hora_fin := intervalo[2] - (p_duracion_minutos || ' minutes')::INTERVAL;
        
        -- Buscar slots libres en intervalos de 30 minutos
        WHILE hora_inicio <= hora_fin LOOP
            -- Verificar si el horario está libre
            IF NOT EXISTS (
                SELECT 1 FROM restaurante.reservas r
                WHERE r.mesa_id = p_mesa_id
                AND r.fecha_reserva = p_fecha
                AND r.estado IN ('confirmada', 'sentada', 'pendiente')
                AND (
                    (hora_inicio, hora_inicio + (p_duracion_minutos || ' minutes')::INTERVAL) 
                    OVERLAPS 
                    (r.hora_reserva, r.hora_reserva + (r.duracion_estimada_minutos || ' minutes')::INTERVAL)
                )
            ) THEN
                result := result || jsonb_build_object(
                    'hora_inicio', hora_inicio,
                    'hora_fin', hora_inicio + (p_duracion_minutos || ' minutes')::INTERVAL,
                    'disponible', true
                );
            END IF;
            
            -- Avanzar en intervalos de 30 minutos
            hora_inicio := hora_inicio + '30 minutes'::INTERVAL;
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$;

-- =============================================================================
-- FUNCIONES DE GESTIÓN DE RESERVAS
-- =============================================================================

-- Función para asignar mesa automáticamente
CREATE OR REPLACE FUNCTION restaurante.asignar_mesa_automatica(
    p_reserva_id INTEGER,
    p_forzar_asignacion BOOLEAN DEFAULT false
)
RETURNS TABLE(
    exito BOOLEAN,
    mesa_asignada INTEGER,
    mensaje TEXT,
    score DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    reserva_record RECORD;
    mejor_mesa RECORD;
    score_mesa DECIMAL;
BEGIN
    -- Obtener información de la reserva
    SELECT 
        r.id,
        r.numero_personas,
        r.fecha_reserva,
        r.hora_reserva,
        r.duracion_estimada_minutos,
        r.zona_preferencia,
        r.estado,
        r.mesa_id
    INTO reserva_record
    FROM restaurante.reservas r
    WHERE r.id = p_reserva_id;
    
    -- Verificar que la reserva existe
    IF reserva_record.id IS NULL THEN
        RETURN QUERY SELECT false, NULL::INTEGER, 'Reserva no encontrada', 0::DECIMAL;
        RETURN;
    END IF;
    
    -- Verificar estado de la reserva
    IF reserva_record.estado NOT IN ('pendiente', 'confirmada') AND NOT p_forzar_asignacion THEN
        RETURN QUERY SELECT false, reserva_record.mesa_id, 'Reserva no está en estado válido para asignación', 0::DECIMAL;
        RETURN;
    END IF;
    
    -- Buscar la mejor mesa disponible
    SELECT 
        m.id,
        m.numero,
        m.capacidad,
        m.zona_id,
        -- Algoritmo de scoring para asignación
        (
            -- Puntos por capacidad óptima (penalizar mucho exceso, poco déficit)
            CASE 
                WHEN m.capacidad = reserva_record.numero_personas THEN 100
                WHEN m.capacidad > reserva_record.numero_personas THEN 90 - (m.capacidad - reserva_record.numero_personas) * 10
                ELSE 50 - (reserva_record.numero_personas - m.capacidad) * 20  -- Penalizar déficit
            END
            +
            -- Puntos por zona preferida
            CASE 
                WHEN reserva_record.zona_preferencia IS NULL THEN 20
                WHEN m.zona_id = reserva_record.zona_preferencia THEN 30
                ELSE 10
            END
            +
            -- Puntos por disponibilidad futura (evitar mesas muy demandadas)
            (
                SELECT 20 - COUNT(*) * 2
                FROM restaurante.reservas r2
                WHERE r2.mesa_id = m.id
                AND r2.fecha_reserva BETWEEN reserva_record.fecha_reserva AND reserva_record.fecha_reserva + INTERVAL '7 days'
                AND r2.estado IN ('confirmada', 'pendiente')
            )::INTEGER
        ) as score
    INTO mejor_mesa
    FROM restaurante.mesas m
    WHERE m.activa = true
    AND m.capacidad >= reserva_record.numero_personas  -- Capacidad mínima
    AND NOT EXISTS (
        -- Verificar que no tenga conflictos
        SELECT 1 FROM restaurante.reservas r2
        WHERE r2.mesa_id = m.id
        AND r2.fecha_reserva = reserva_record.fecha_reserva
        AND r2.estado IN ('confirmada', 'sentada', 'pendiente')
        AND r2.id != reserva_record.id
        AND (
            (reserva_record.hora_reserva, reserva_record.hora_reserva + (reserva_record.duracion_estimada_minutos || ' minutes')::INTERVAL) 
            OVERLAPS 
            (r2.hora_reserva, r2.hora_reserva + (r2.duracion_estimada_minutos || ' minutes')::INTERVAL)
        )
    )
    ORDER BY score DESC, m.capacidad ASC
    LIMIT 1;
    
    -- Verificar si se encontró una mesa
    IF mejor_mesa.id IS NULL THEN
        RETURN QUERY SELECT 
            false, 
            NULL::INTEGER, 
            'No hay mesas disponibles para ' || reserva_record.numero_personas || ' personas en el horario solicitado',
            0::DECIMAL;
        RETURN;
    END IF;
    
    -- Asignar la mesa
    UPDATE restaurante.reservas 
    SET 
        mesa_id = mejor_mesa.id,
        updated_at = NOW()
    WHERE id = p_reserva_id;
    
    RETURN QUERY SELECT 
        true, 
        mejor_mesa.id, 
        'Mesa ' || mejor_mesa.numero || ' asignada exitosamente',
        mejor_mesa.score;
END;
$$;

-- Función para calcular ingresos estimados
CREATE OR REPLACE FUNCTION restaurante.calcular_ingresos_estimados(
    p_fecha_inicio DATE DEFAULT CURRENT_DATE,
    p_fecha_fin DATE DEFAULT CURRENT_DATE,
    p_zona_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    fecha DATE,
    zona_nombre TEXT,
    total_reservas INTEGER,
    personas_total INTEGER,
    ingreso_estimado DECIMAL,
    ocupacion_promedio DECIMAL
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    ticket_promedio DECIMAL := 45.00;  -- Ticket promedio por persona
BEGIN
    RETURN QUERY
    WITH datos_diarios AS (
        SELECT 
            r.fecha_reserva,
            z.id as zona_id,
            z.nombre as zona_nombre,
            COUNT(*) as reservas,
            SUM(r.numero_personas) as personas,
            SUM(r.numero_personas) * ticket_promedio as ingreso_est,
            ROUND(
                (COUNT(*) * 100.0 / (
                    SELECT COUNT(*) 
                    FROM restaurante.mesas m2 
                    WHERE m2.zona_id = z.id AND m2.activa = true
                )), 2
            ) as ocupacion_pct
        FROM restaurante.reservas r
        JOIN restaurante.mesas m ON r.mesa_id = m.id
        JOIN restaurante.zonas z ON m.zona_id = z.id
        WHERE r.fecha_reserva BETWEEN p_fecha_inicio AND p_fecha_fin
        AND r.estado IN ('confirmada', 'sentada', 'completada')
        AND (p_zona_id IS NULL OR z.id = p_zona_id)
        GROUP BY r.fecha_reserva, z.id, z.nombre
    )
    SELECT 
        dd.fecha_reserva,
        dd.zona_nombre,
        dd.reservas::INTEGER,
        dd.personas::INTEGER,
        dd.ingreso_est,
        dd.ocupacion_pct
    FROM datos_diarios dd
    ORDER BY dd.fecha_reserva, dd.zona_nombre;
END;
$$;

-- =============================================================================
-- FUNCIONES DE ANÁLISIS Y REPORTES
-- =============================================================================

-- Función para análisis de patrones de reserva
CREATE OR REPLACE FUNCTION analytics.analizar_patrones_reserva(
    p_periodo_dias INTEGER DEFAULT 30
)
RETURNS TABLE(
    patron TEXT,
    metrica TEXT,
    valor DECIMAL,
    contexto JSONB
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    fecha_inicio DATE := CURRENT_DATE - (p_periodo_dias || ' days')::INTERVAL;
BEGIN
    -- Patrón de horarios más populares
    RETURN QUERY
    SELECT 
        'horarios_populares'::TEXT,
        'reservas_por_hora'::TEXT,
        COUNT(*)::DECIMAL,
        jsonb_build_object(
            'hora', r.hora_reserva,
            'porcentaje', ROUND((COUNT(*) * 100.0 / (
                SELECT COUNT(*) FROM restaurante.reservas r2 
                WHERE r2.fecha_reserva >= fecha_inicio
                AND r2.estado IN ('confirmada', 'completada')
            )), 2)
        )
    FROM restaurante.reservas r
    WHERE r.fecha_reserva >= fecha_inicio
    AND r.estado IN ('confirmada', 'completada')
    GROUP BY r.hora_reserva
    ORDER BY COUNT(*) DESC
    LIMIT 5;
    
    -- Patrón de tamaño de grupos
    RETURN QUERY
    SELECT 
        'tamano_grupos'::TEXT,
        'personas_por_reserva'::TEXT,
        AVG(r.numero_personas),
        jsonb_build_object(
            'tamano_grupo', r.numero_personas,
            'frecuencia', COUNT(*),
            'porcentaje', ROUND((COUNT(*) * 100.0 / (
                SELECT COUNT(*) FROM restaurante.reservas r2 
                WHERE r2.fecha_reserva >= fecha_inicio
                AND r2.estado IN ('confirmada', 'completada')
            )), 2)
        )
    FROM restaurante.reservas r
    WHERE r.fecha_reserva >= fecha_inicio
    AND r.estado IN ('confirmada', 'completada')
    GROUP BY r.numero_personas
    ORDER BY COUNT(*) DESC;
    
    -- Patrón de días de la semana
    RETURN QUERY
    SELECT 
        'dias_semana'::TEXT,
        'reservas_por_dia'::TEXT,
        COUNT(*)::DECIMAL,
        jsonb_build_object(
            'dia_semana', EXTRACT(DOW FROM r.fecha_reserva),
            'nombre_dia', TO_CHAR(r.fecha_reserva, 'Day'),
            'promedio_diario', ROUND(COUNT(*)::DECIMAL / (p_periodo_dias / 7.0), 1)
        )
    FROM restaurante.reservas r
    WHERE r.fecha_reserva >= fecha_inicio
    AND r.estado IN ('confirmada', 'completada')
    GROUP BY EXTRACT(DOW FROM r.fecha_reserva), TO_CHAR(r.fecha_reserva, 'Day')
    ORDER BY COUNT(*) DESC;
END;
$$;

-- Función para calcular métricas de rendimiento
CREATE OR REPLACE FUNCTION analytics.calcular_metricas_rendimiento(
    p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    result JSONB := '{}'::JSONB;
    total_reservas INTEGER;
    reservas_completadas INTEGER;
    no_shows INTEGER;
    cancelaciones INTEGER;
    tiempo_promedio_ocupacion INTERVAL;
    ocupacion_promedio DECIMAL;
BEGIN
    -- Métricas básicas de reservas
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE estado = 'completada'),
        COUNT(*) FILTER (WHERE estado = 'no_show'),
        COUNT(*) FILTER (WHERE estado = 'cancelada')
    INTO total_reservas, reservas_completadas, no_shows, cancelaciones
    FROM restaurante.reservas
    WHERE fecha_reserva BETWEEN p_fecha_inicio AND p_fecha_fin;
    
    -- Tiempo promedio de ocupación de mesas
    SELECT AVG(em.inicio_estado - em2.inicio_estado)
    INTO tiempo_promedio_ocupacion
    FROM operaciones.estados_mesa em
    JOIN operaciones.estados_mesa em2 ON em.mesa_id = em2.mesa_id 
        AND em2.inicio_estado < em.inicio_estado
    WHERE em.estado = 'libre' 
    AND em2.estado = 'ocupada'
    AND em.inicio_estado::DATE BETWEEN p_fecha_inicio AND p_fecha_fin;
    
    -- Calcular ocupación promedio
    WITH ocupacion_diaria AS (
        SELECT 
            fecha_reserva,
            COUNT(DISTINCT mesa_id) * 100.0 / (
                SELECT COUNT(*) FROM restaurante.mesas WHERE activa = true
            ) as ocupacion_dia
        FROM restaurante.reservas
        WHERE fecha_reserva BETWEEN p_fecha_inicio AND p_fecha_fin
        AND estado IN ('confirmada', 'sentada', 'completada')
        GROUP BY fecha_reserva
    )
    SELECT AVG(ocupacion_dia) INTO ocupacion_promedio FROM ocupacion_diaria;
    
    -- Construir resultado JSON
    result := jsonb_build_object(
        'periodo', jsonb_build_object(
            'inicio', p_fecha_inicio,
            'fin', p_fecha_fin,
            'dias', p_fecha_fin - p_fecha_inicio + 1
        ),
        'reservas', jsonb_build_object(
            'total', total_reservas,
            'completadas', reservas_completadas,
            'no_shows', no_shows,
            'canceladas', cancelaciones,
            'tasa_completamiento', CASE 
                WHEN total_reservas > 0 THEN ROUND((reservas_completadas * 100.0 / total_reservas), 2)
                ELSE 0 
            END,
            'tasa_no_show', CASE 
                WHEN total_reservas > 0 THEN ROUND((no_shows * 100.0 / total_reservas), 2)
                ELSE 0 
            END
        ),
        'ocupacion', jsonb_build_object(
            'promedio_porcentaje', ROUND(COALESCE(ocupacion_promedio, 0), 2),
            'tiempo_promedio_mesa', EXTRACT(EPOCH FROM COALESCE(tiempo_promedio_ocupacion, '0'::INTERVAL)) / 60.0
        )
    );
    
    RETURN result;
END;
$$;

-- =============================================================================
-- FUNCIONES DE MANTENIMIENTO Y OPTIMIZACIÓN
-- =============================================================================

-- Función para limpiar datos antiguos
CREATE OR REPLACE FUNCTION admin.limpiar_datos_antiguos(
    p_dias_auditoria INTEGER DEFAULT 90,
    p_dias_estados_mesa INTEGER DEFAULT 30,
    p_dias_interacciones INTEGER DEFAULT 365
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    registros_eliminados INTEGER := 0;
    resultado TEXT := '';
BEGIN
    -- Limpiar logs de auditoría antiguos
    DELETE FROM audit.logs 
    WHERE timestamp < NOW() - (p_dias_auditoria || ' days')::INTERVAL;
    
    GET DIAGNOSTICS registros_eliminados = ROW_COUNT;
    resultado := resultado || 'Logs auditoría eliminados: ' || registros_eliminados || E'\n';
    
    -- Limpiar estados de mesa antiguos (manteniendo el más reciente por mesa)
    WITH estados_a_mantener AS (
        SELECT DISTINCT ON (mesa_id) id
        FROM operaciones.estados_mesa
        ORDER BY mesa_id, inicio_estado DESC
    )
    DELETE FROM operaciones.estados_mesa
    WHERE id NOT IN (SELECT id FROM estados_a_mantener)
    AND inicio_estado < NOW() - (p_dias_estados_mesa || ' days')::INTERVAL;
    
    GET DIAGNOSTICS registros_eliminados = ROW_COUNT;
    resultado := resultado || 'Estados mesa eliminados: ' || registros_eliminados || E'\n';
    
    -- Limpiar interacciones CRM muy antiguas
    DELETE FROM crm.interacciones_cliente 
    WHERE created_at < NOW() - (p_dias_interacciones || ' days')::INTERVAL;
    
    GET DIAGNOSTICS registros_eliminados = ROW_COUNT;
    resultado := resultado || 'Interacciones CRM eliminadas: ' || registros_eliminados || E'\n';
    
    -- Actualizar estadísticas de tablas
    ANALYZE restaurante.reservas;
    ANALYZE operaciones.estados_mesa;
    ANALYZE crm.interacciones_cliente;
    
    resultado := resultado || 'Estadísticas de tablas actualizadas';
    
    RETURN resultado;
END;
$$;

-- Función para reindexar tablas críticas
CREATE OR REPLACE FUNCTION admin.reindexar_tablas_criticas()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    tabla RECORD;
    resultado TEXT := '';
BEGIN
    -- Lista de tablas críticas para reindexar
    FOR tabla IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname IN ('restaurante', 'operaciones', 'crm')
        AND tablename IN ('reservas', 'estados_mesa', 'interacciones_cliente')
    LOOP
        EXECUTE 'REINDEX TABLE ' || tabla.schemaname || '.' || tabla.tablename;
        resultado := resultado || 'Reindexado: ' || tabla.schemaname || '.' || tabla.tablename || E'\n';
    END LOOP;
    
    RETURN resultado;
END;
$$;

-- =============================================================================
-- FUNCIONES DE TESTING Y VALIDACIÓN
-- =============================================================================

-- Función para validar integridad de datos
CREATE OR REPLACE FUNCTION admin.validar_integridad_datos()
RETURNS TABLE(
    tabla TEXT,
    tipo_validacion TEXT,
    registros_problema INTEGER,
    descripcion TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    -- Reservas sin cliente válido
    RETURN QUERY
    SELECT 
        'reservas'::TEXT,
        'cliente_invalido'::TEXT,
        COUNT(*)::INTEGER,
        'Reservas con cliente_id que no existe en tabla clientes'::TEXT
    FROM restaurante.reservas r
    WHERE NOT EXISTS (
        SELECT 1 FROM restaurante.clientes c WHERE c.id = r.cliente_id
    );
    
    -- Reservas con mesa inválida
    RETURN QUERY
    SELECT 
        'reservas'::TEXT,
        'mesa_invalida'::TEXT,
        COUNT(*)::INTEGER,
        'Reservas con mesa_id que no existe o está inactiva'::TEXT
    FROM restaurante.reservas r
    WHERE r.mesa_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM restaurante.mesas m 
        WHERE m.id = r.mesa_id AND m.activa = true
    );
    
    -- Estados de mesa sin mesa válida
    RETURN QUERY
    SELECT 
        'estados_mesa'::TEXT,
        'mesa_invalida'::TEXT,
        COUNT(*)::INTEGER,
        'Estados de mesa con mesa_id que no existe'::TEXT
    FROM operaciones.estados_mesa em
    WHERE NOT EXISTS (
        SELECT 1 FROM restaurante.mesas m WHERE m.id = em.mesa_id
    );
    
    -- Clientes duplicados por teléfono
    RETURN QUERY
    SELECT 
        'clientes'::TEXT,
        'telefono_duplicado'::TEXT,
        COUNT(*)::INTEGER,
        'Clientes con teléfono duplicado'::TEXT
    FROM (
        SELECT telefono, COUNT(*) as cnt
        FROM restaurante.clientes
        WHERE telefono IS NOT NULL
        GROUP BY telefono
        HAVING COUNT(*) > 1
    ) duplicados;
END;
$$;

-- Comentarios de documentación
COMMENT ON FUNCTION operaciones.verificar_disponibilidad_mesa IS 'Verifica disponibilidad de mesa con validación completa de horarios y sugerencias';
COMMENT ON FUNCTION restaurante.asignar_mesa_automatica IS 'Asigna automáticamente la mejor mesa disponible usando algoritmo de scoring';
COMMENT ON FUNCTION analytics.analizar_patrones_reserva IS 'Analiza patrones de comportamiento en las reservas';
COMMENT ON FUNCTION analytics.calcular_metricas_rendimiento IS 'Calcula métricas KPI del restaurante';
COMMENT ON FUNCTION admin.limpiar_datos_antiguos IS 'Limpia datos históricos según políticas de retención';
COMMENT ON FUNCTION admin.validar_integridad_datos IS 'Valida integridad referencial y detecta inconsistencias';