-- Crear tabla para carpetas personalizadas del usuario
CREATE TABLE IF NOT EXISTS comunicaciones.carpetas_usuario (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre varchar(100) NOT NULL,
  color varchar(7), -- Hex color code
  icono varchar(50), -- Lucide icon name
  descripcion text,
  orden integer DEFAULT 0,
  es_sistema boolean DEFAULT false, -- Para distinguir carpetas del sistema
  activa boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT carpetas_usuario_nombre_unico UNIQUE (user_id, nombre),
  CONSTRAINT carpetas_usuario_nombre_no_vacio CHECK (length(trim(nombre)) > 0),
  CONSTRAINT carpetas_usuario_color_hex CHECK (color ~ '^#[0-9A-Fa-f]{6}$' OR color IS NULL)
);

-- Índices para performance
CREATE INDEX idx_carpetas_usuario_user_id ON comunicaciones.carpetas_usuario (user_id, activa, orden);
CREATE INDEX idx_carpetas_usuario_nombre ON comunicaciones.carpetas_usuario (user_id, nombre) WHERE activa = true;

-- RLS Policies
ALTER TABLE comunicaciones.carpetas_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_acceso_carpetas_propias" ON comunicaciones.carpetas_usuario
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION comunicaciones.actualizar_carpetas_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_carpetas_usuario_updated_at
  BEFORE UPDATE ON comunicaciones.carpetas_usuario
  FOR EACH ROW EXECUTE FUNCTION comunicaciones.actualizar_carpetas_updated_at();

-- Insertar carpetas del sistema por defecto para desarrollo
INSERT INTO comunicaciones.carpetas_usuario (user_id, nombre, color, icono, descripcion, es_sistema, orden)
SELECT 
  auth.uid(),
  nombre,
  color,
  icono,
  descripcion,
  true,
  orden
FROM (VALUES
  ('Entrada', '#237584', 'Inbox', 'Bandeja de entrada principal', 1),
  ('Enviados', '#9FB289', 'Send', 'Emails enviados', 2),
  ('Borradores', '#8E8E93', 'FileText', 'Mensajes sin enviar', 3),
  ('Spam', '#FF3B30', 'AlertCircle', 'Correo no deseado', 4),
  ('Papelera', '#FF3B30', 'Trash2', 'Emails eliminados', 5)
) AS carpetas_sistema(nombre, color, icono, descripcion, orden)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, nombre) DO NOTHING;

-- Función para obtener carpetas de un usuario
CREATE OR REPLACE FUNCTION comunicaciones.obtener_carpetas_usuario(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  nombre varchar,
  color varchar,
  icono varchar,
  descripcion text,
  orden integer,
  es_sistema boolean,
  cantidad_emails bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nombre,
    c.color,
    c.icono,
    c.descripcion,
    c.orden,
    c.es_sistema,
    COALESCE(COUNT(b.id), 0) as cantidad_emails
  FROM comunicaciones.carpetas_usuario c
  LEFT JOIN comunicaciones.buzones_usuario b 
    ON b.user_id = c.user_id 
    AND b.nombre_carpeta = c.nombre 
    AND b.es_eliminado = false
  WHERE c.user_id = p_user_id 
    AND c.activa = true
  GROUP BY c.id, c.nombre, c.color, c.icono, c.descripcion, c.orden, c.es_sistema
  ORDER BY c.orden, c.nombre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;