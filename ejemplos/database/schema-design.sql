-- Ejemplo: Diseño de Esquemas con IDs Organizados
-- Patrón: Organized IDs + Multi-Schema + Performance + Relationships

-- =============================================================================
-- CONFIGURACIÓN INICIAL
-- =============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configuración de búsqueda de esquemas
SET search_path = restaurante, personal, crm, operaciones, public;

-- =============================================================================
-- ESQUEMAS ORGANIZACIONALES
-- =============================================================================

-- Esquema principal del negocio
CREATE SCHEMA IF NOT EXISTS restaurante;
COMMENT ON SCHEMA restaurante IS 'Esquema principal: zonas, mesas, clientes, reservas';

-- Esquema de gestión de personal
CREATE SCHEMA IF NOT EXISTS personal;
COMMENT ON SCHEMA personal IS 'Gestión de empleados, roles y permisos';

-- Esquema de CRM avanzado
CREATE SCHEMA IF NOT EXISTS crm;
COMMENT ON SCHEMA crm IS 'CRM: interacciones, segmentaciones, campañas marketing';

-- Esquema de operaciones diarias
CREATE SCHEMA IF NOT EXISTS operaciones;
COMMENT ON SCHEMA operaciones IS 'Operaciones: estados mesa, combinaciones, logs';

-- =============================================================================
-- TIPOS PERSONALIZADOS
-- =============================================================================

-- Estados de reserva
CREATE TYPE restaurante.estado_reserva AS ENUM (
    'pendiente',
    'confirmada', 
    'sentada',
    'completada',
    'cancelada',
    'no_show'
);

-- Estados de mesa
CREATE TYPE operaciones.estado_mesa AS ENUM (
    'libre',
    'ocupada',
    'reservada',
    'limpieza',
    'fuera_servicio'
);

-- Roles de empleados
CREATE TYPE personal.rol_empleado AS ENUM (
    'admin',
    'gerente',
    'staff',
    'host'
);

-- Segmentos de clientes
CREATE TYPE crm.segmento_cliente AS ENUM (
    'vip',
    'regular',
    'nuevo',
    'inactivo',
    'problema'
);

-- Orígenes de reserva
CREATE TYPE restaurante.origen_reserva AS ENUM (
    'web',
    'whatsapp',
    'email',
    'asistente_ia',
    'presencial',
    'telefono'
);

-- =============================================================================
-- ESQUEMA RESTAURANTE - TABLAS PRINCIPALES
-- =============================================================================

-- Zonas del restaurante (IDs: 1-4)
CREATE TABLE restaurante.zonas (
    id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 4),
    codigo VARCHAR(3) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    capacidad_maxima INTEGER NOT NULL CHECK (capacidad_maxima > 0),
    activa BOOLEAN DEFAULT true,
    orden_display INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para zonas
CREATE INDEX idx_zonas_activa ON restaurante.zonas(activa);
CREATE INDEX idx_zonas_orden ON restaurante.zonas(orden_display);

-- Mesas del restaurante (IDs organizados por zona)
-- Justicia: 101-110, Campanari: 201-214, Principal: 301-307, VIP: 401-403
CREATE TABLE restaurante.mesas (
    id INTEGER PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    zona_id INTEGER NOT NULL REFERENCES restaurante.zonas(id),
    capacidad INTEGER NOT NULL CHECK (capacidad BETWEEN 1 AND 20),
    posicion_x DECIMAL(5,2),
    posicion_y DECIMAL(5,2),
    forma VARCHAR(20) DEFAULT 'rectangular',
    activa BOOLEAN DEFAULT true,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint para IDs organizados
    CONSTRAINT check_mesa_id_range CHECK (
        (zona_id = 1 AND id BETWEEN 101 AND 150) OR  -- Justicia
        (zona_id = 2 AND id BETWEEN 201 AND 250) OR  -- Campanari  
        (zona_id = 3 AND id BETWEEN 301 AND 350) OR  -- Principal
        (zona_id = 4 AND id BETWEEN 401 AND 450)     -- VIP
    )
);

-- Índices para mesas
CREATE INDEX idx_mesas_zona ON restaurante.mesas(zona_id);
CREATE INDEX idx_mesas_activa ON restaurante.mesas(activa);
CREATE INDEX idx_mesas_capacidad ON restaurante.mesas(capacidad);
CREATE INDEX idx_mesas_numero ON restaurante.mesas(numero);

-- Clientes (IDs: 1001+)
CREATE TABLE restaurante.clientes (
    id SERIAL PRIMARY KEY CHECK (id >= 1001),
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    fecha_nacimiento DATE,
    preferencias TEXT,
    alergias TEXT,
    notas TEXT,
    segmento crm.segmento_cliente DEFAULT 'nuevo',
    vip BOOLEAN DEFAULT false,
    blacklist BOOLEAN DEFAULT false,
    blacklist_razon TEXT,
    total_visitas INTEGER DEFAULT 0,
    ultima_visita TIMESTAMPTZ,
    valor_vida_estimado DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT check_telefono_formato CHECK (telefono ~ '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT check_email_formato CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_blacklist_razon CHECK (
        (blacklist = false) OR (blacklist = true AND blacklist_razon IS NOT NULL)
    )
);

-- Índices para clientes
CREATE INDEX idx_clientes_telefono ON restaurante.clientes(telefono);
CREATE INDEX idx_clientes_email ON restaurante.clientes(email);
CREATE INDEX idx_clientes_segmento ON restaurante.clientes(segmento);
CREATE INDEX idx_clientes_vip ON restaurante.clientes(vip);
CREATE INDEX idx_clientes_blacklist ON restaurante.clientes(blacklist);
CREATE INDEX idx_clientes_nombre_gin ON restaurante.clientes USING GIN (to_tsvector('spanish', nombre));

-- Reservas (IDs: 10001+)
CREATE TABLE restaurante.reservas (
    id SERIAL PRIMARY KEY CHECK (id >= 10001),
    cliente_id INTEGER NOT NULL REFERENCES restaurante.clientes(id),
    mesa_id INTEGER REFERENCES restaurante.mesas(id),
    estado restaurante.estado_reserva DEFAULT 'pendiente',
    origen restaurante.origen_reserva DEFAULT 'web',
    
    -- Información de la reserva
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    numero_personas INTEGER NOT NULL CHECK (numero_personas BETWEEN 1 AND 20),
    duracion_estimada_minutos INTEGER DEFAULT 120 CHECK (duracion_estimada_minutos > 0),
    
    -- Detalles adicionales
    zona_preferencia INTEGER REFERENCES restaurante.zonas(id),
    notas_especiales TEXT,
    ocasion_especial VARCHAR(100),
    
    -- Información de contacto (desnormalizada para performance)
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_email VARCHAR(255),
    
    -- Gestión de estado
    confirmada_en TIMESTAMPTZ,
    sentada_en TIMESTAMPTZ,
    completada_en TIMESTAMPTZ,
    cancelada_en TIMESTAMPTZ,
    razon_cancelacion TEXT,
    
    -- Metadatos
    created_by INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Validaciones complejas
    CONSTRAINT check_fecha_futura CHECK (
        fecha_reserva >= CURRENT_DATE OR 
        (fecha_reserva = CURRENT_DATE AND hora_reserva >= CURRENT_TIME)
    ),
    CONSTRAINT check_horario_servicio CHECK (
        (hora_reserva >= '12:00' AND hora_reserva <= '16:00') OR
        (hora_reserva >= '19:00' AND hora_reserva <= '23:30')
    ),
    CONSTRAINT check_estados_timestamp CHECK (
        (estado != 'confirmada' OR confirmada_en IS NOT NULL) AND
        (estado != 'sentada' OR sentada_en IS NOT NULL) AND  
        (estado != 'completada' OR completada_en IS NOT NULL) AND
        (estado != 'cancelada' OR cancelada_en IS NOT NULL)
    ),
    CONSTRAINT check_capacidad_mesa CHECK (
        mesa_id IS NULL OR 
        numero_personas <= (SELECT capacidad FROM restaurante.mesas WHERE id = mesa_id)
    )
);

-- Índices para reservas (críticos para performance)
CREATE INDEX idx_reservas_cliente ON restaurante.reservas(cliente_id);
CREATE INDEX idx_reservas_mesa ON restaurante.reservas(mesa_id);
CREATE INDEX idx_reservas_estado ON restaurante.reservas(estado);
CREATE INDEX idx_reservas_fecha ON restaurante.reservas(fecha_reserva);
CREATE INDEX idx_reservas_fecha_hora ON restaurante.reservas(fecha_reserva, hora_reserva);
CREATE INDEX idx_reservas_activas ON restaurante.reservas(estado, fecha_reserva) 
    WHERE estado IN ('pendiente', 'confirmada', 'sentada');
CREATE INDEX idx_reservas_sin_mesa ON restaurante.reservas(estado, fecha_reserva) 
    WHERE mesa_id IS NULL AND estado IN ('pendiente', 'confirmada');

-- =============================================================================
-- ESQUEMA PERSONAL - GESTIÓN DE EMPLEADOS
-- =============================================================================

-- Empleados (IDs: 100001+)
CREATE TABLE personal.empleados (
    id SERIAL PRIMARY KEY CHECK (id >= 100001),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    rol personal.rol_empleado NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_contratacion DATE DEFAULT CURRENT_DATE,
    fecha_baja DATE,
    salario_base DECIMAL(10,2),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT check_fecha_baja CHECK (fecha_baja IS NULL OR fecha_baja >= fecha_contratacion),
    CONSTRAINT check_email_formato CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_salario CHECK (salario_base IS NULL OR salario_base > 0)
);

-- Índices para empleados
CREATE INDEX idx_empleados_email ON personal.empleados(email);
CREATE INDEX idx_empleados_rol ON personal.empleados(rol);
CREATE INDEX idx_empleados_activo ON personal.empleados(activo);

-- =============================================================================
-- ESQUEMA CRM - GESTIÓN AVANZADA DE CLIENTES
-- =============================================================================

-- Interacciones con clientes (IDs: 200001+)
CREATE TABLE crm.interacciones_cliente (
    id SERIAL PRIMARY KEY CHECK (id >= 200001),
    cliente_id INTEGER NOT NULL REFERENCES restaurante.clientes(id),
    empleado_id INTEGER REFERENCES personal.empleados(id),
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    resultado VARCHAR(100),
    seguimiento_requerido BOOLEAN DEFAULT false,
    fecha_seguimiento DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Segmentaciones de clientes (IDs: 200101+)
CREATE TABLE crm.segmentaciones_cliente (
    id SERIAL PRIMARY KEY CHECK (id >= 200101),
    nombre VARCHAR(100) NOT NULL,
    criterios JSONB NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ESQUEMA OPERACIONES - GESTIÓN DIARIA
-- =============================================================================

-- Estados actuales de mesas (IDs: 300001+)
CREATE TABLE operaciones.estados_mesa (
    id SERIAL PRIMARY KEY CHECK (id >= 300001),
    mesa_id INTEGER NOT NULL REFERENCES restaurante.mesas(id),
    estado operaciones.estado_mesa NOT NULL,
    reserva_id INTEGER REFERENCES restaurante.reservas(id),
    inicio_estado TIMESTAMPTZ DEFAULT NOW(),
    empleado_id INTEGER REFERENCES personal.empleados(id),
    notas TEXT,
    
    -- Solo un estado activo por mesa
    UNIQUE(mesa_id, inicio_estado)
);

-- Índices para estados de mesa
CREATE INDEX idx_estados_mesa_id ON operaciones.estados_mesa(mesa_id);
CREATE INDEX idx_estados_mesa_estado ON operaciones.estados_mesa(estado);
CREATE INDEX idx_estados_mesa_reserva ON operaciones.estados_mesa(reserva_id);

-- Combinaciones de mesas (IDs: 300101+)
CREATE TABLE operaciones.combinaciones_mesa (
    id SERIAL PRIMARY KEY CHECK (id >= 300101),
    nombre VARCHAR(100) NOT NULL,
    mesas_ids INTEGER[] NOT NULL,
    capacidad_total INTEGER NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Validaciones
    CONSTRAINT check_mesas_cantidad CHECK (array_length(mesas_ids, 1) >= 2),
    CONSTRAINT check_mesas_validas CHECK (
        NOT EXISTS (
            SELECT 1 FROM unnest(mesas_ids) AS mesa_id 
            WHERE mesa_id NOT IN (SELECT id FROM restaurante.mesas WHERE activa = true)
        )
    )
);

-- =============================================================================
-- FUNCIONES Y TRIGGERS
-- =============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_zonas_updated_at BEFORE UPDATE ON restaurante.zonas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mesas_updated_at BEFORE UPDATE ON restaurante.mesas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON restaurante.clientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON restaurante.reservas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON personal.empleados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para validar horarios de reserva
CREATE OR REPLACE FUNCTION restaurante.validar_horario_reserva()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar que no hay solapamiento de reservas en la misma mesa
    IF NEW.mesa_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM restaurante.reservas 
            WHERE mesa_id = NEW.mesa_id 
            AND fecha_reserva = NEW.fecha_reserva
            AND estado IN ('confirmada', 'sentada')
            AND id != COALESCE(NEW.id, -1)
            AND (
                -- Solapamiento de horarios (considerando duración)
                (NEW.hora_reserva, NEW.hora_reserva + (NEW.duracion_estimada_minutos || ' minutes')::INTERVAL) 
                OVERLAPS 
                (hora_reserva, hora_reserva + (duracion_estimada_minutos || ' minutes')::INTERVAL)
            )
        ) THEN
            RAISE EXCEPTION 'Mesa % ya tiene reserva en horario que solapa con %-%', 
                NEW.mesa_id, NEW.hora_reserva, 
                NEW.hora_reserva + (NEW.duracion_estimada_minutos || ' minutes')::INTERVAL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validación de horarios
CREATE TRIGGER validar_horario_reserva 
    BEFORE INSERT OR UPDATE ON restaurante.reservas
    FOR EACH ROW EXECUTE FUNCTION restaurante.validar_horario_reserva();

-- Función para actualizar estadísticas de cliente
CREATE OR REPLACE FUNCTION restaurante.actualizar_estadisticas_cliente()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar total de visitas y última visita cuando se completa una reserva
    IF NEW.estado = 'completada' AND (OLD.estado IS NULL OR OLD.estado != 'completada') THEN
        UPDATE restaurante.clientes 
        SET 
            total_visitas = total_visitas + 1,
            ultima_visita = NEW.completada_en
        WHERE id = NEW.cliente_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para estadísticas de cliente
CREATE TRIGGER actualizar_estadisticas_cliente 
    AFTER UPDATE ON restaurante.reservas
    FOR EACH ROW EXECUTE FUNCTION restaurante.actualizar_estadisticas_cliente();

-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

-- Insertar zonas
INSERT INTO restaurante.zonas (id, codigo, nombre, descripcion, capacidad_maxima, orden_display) VALUES
(1, 'JUS', 'Terraza Justicia', 'Terraza exterior en Calle Justicia 6A', 28, 1),
(2, 'CAM', 'Terraza Campanari', 'Terraza con vista al campanario', 36, 2),
(3, 'SAL', 'Sala Principal', 'Sala interior con barra', 18, 3),
(4, 'VIP', 'Sala VIP', 'Sala privada para eventos especiales', 16, 4);

-- Insertar mesas de ejemplo (algunas por zona)
INSERT INTO restaurante.mesas (id, numero, zona_id, capacidad, posicion_x, posicion_y) VALUES
-- Terraza Justicia
(101, 'T1', 1, 2, 1.0, 1.0),
(102, 'T2', 1, 4, 3.0, 1.0),
(103, 'T3', 1, 2, 5.0, 1.0),
-- Terraza Campanari  
(201, 'T20', 2, 4, 1.0, 1.0),
(202, 'T21', 2, 6, 3.0, 1.0),
(203, 'T22', 2, 2, 5.0, 1.0),
-- Sala Principal
(301, 'S1', 3, 2, 1.0, 1.0),
(302, 'S2', 3, 4, 3.0, 1.0),
-- Sala VIP
(401, 'S10', 4, 8, 1.0, 1.0),
(402, 'S11', 4, 6, 3.0, 1.0);

-- Insertar empleado administrador
INSERT INTO personal.empleados (nombre, email, rol) VALUES
('Administrador Sistema', 'admin@enigmaconalma.com', 'admin');

-- =============================================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =============================================================================

COMMENT ON TABLE restaurante.zonas IS 'Zonas del restaurante con IDs 1-4';
COMMENT ON TABLE restaurante.mesas IS 'Mesas con IDs organizados: 101-150 (Justicia), 201-250 (Campanari), 301-350 (Principal), 401-450 (VIP)';
COMMENT ON TABLE restaurante.clientes IS 'Clientes con IDs desde 1001';
COMMENT ON TABLE restaurante.reservas IS 'Reservas con IDs desde 10001, incluye validación de horarios y capacidad';
COMMENT ON TABLE personal.empleados IS 'Empleados con IDs desde 100001';
COMMENT ON TABLE crm.interacciones_cliente IS 'Interacciones CRM con IDs desde 200001';
COMMENT ON TABLE operaciones.estados_mesa IS 'Estados actuales de mesas con IDs desde 300001';

-- =============================================================================
-- ANÁLISIS Y OPTIMIZACIÓN
-- =============================================================================

-- View para reservas activas con información completa
CREATE VIEW restaurante.v_reservas_activas AS
SELECT 
    r.id,
    r.cliente_nombre,
    r.cliente_telefono,
    r.fecha_reserva,
    r.hora_reserva,
    r.numero_personas,
    r.estado,
    m.numero as mesa_numero,
    z.nombre as zona_nombre,
    r.created_at
FROM restaurante.reservas r
LEFT JOIN restaurante.mesas m ON r.mesa_id = m.id
LEFT JOIN restaurante.zonas z ON m.zona_id = z.id
WHERE r.estado IN ('pendiente', 'confirmada', 'sentada')
AND r.fecha_reserva >= CURRENT_DATE;

-- View para ocupación de mesas en tiempo real
CREATE VIEW operaciones.v_ocupacion_mesas AS
SELECT 
    m.id,
    m.numero,
    z.nombre as zona,
    m.capacidad,
    COALESCE(em.estado, 'libre') as estado_actual,
    em.inicio_estado,
    r.cliente_nombre,
    r.numero_personas
FROM restaurante.mesas m
LEFT JOIN restaurante.zonas z ON m.zona_id = z.id
LEFT JOIN LATERAL (
    SELECT estado, inicio_estado, reserva_id
    FROM operaciones.estados_mesa 
    WHERE mesa_id = m.id 
    ORDER BY inicio_estado DESC 
    LIMIT 1
) em ON true
LEFT JOIN restaurante.reservas r ON em.reserva_id = r.id
WHERE m.activa = true;

-- Estadísticas de performance
SELECT 
    schemaname,
    tablename,
    n_tup_ins + n_tup_upd + n_tup_del as total_operations,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE schemaname IN ('restaurante', 'personal', 'crm', 'operaciones')
ORDER BY total_operations DESC;