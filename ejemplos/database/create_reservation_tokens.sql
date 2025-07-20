-- Tabla para tokens de gestión de reservas por clientes
-- Permite a los clientes modificar sus reservas mediante enlaces únicos

CREATE TABLE IF NOT EXISTS restaurante.reservation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id INTEGER NOT NULL REFERENCES restaurante.reservas(id) ON DELETE CASCADE,
  token VARCHAR(128) UNIQUE NOT NULL,
  expires_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint para evitar múltiples tokens activos por reserva
  CONSTRAINT unique_active_token_per_reservation UNIQUE (reserva_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reservation_tokens_token ON restaurante.reservation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reservation_tokens_reserva_id ON restaurante.reservation_tokens(reserva_id);
CREATE INDEX IF NOT EXISTS idx_reservation_tokens_expires_at ON restaurante.reservation_tokens(expires_at);

-- Función para limpiar tokens expirados (opcional, para mantenimiento)
CREATE OR REPLACE FUNCTION restaurante.cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM restaurante.reservation_tokens 
  WHERE expires_at < CURRENT_DATE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS para seguridad
ALTER TABLE restaurante.reservation_tokens ENABLE ROW LEVEL SECURITY;

-- Permitir SELECT por token (para validación)
CREATE POLICY "Allow public token validation" ON restaurante.reservation_tokens
  FOR SELECT USING (true);

-- Permitir INSERT/UPDATE solo a usuarios autenticados (para el gestor)
CREATE POLICY "Allow authenticated token management" ON restaurante.reservation_tokens
  FOR ALL USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE restaurante.reservation_tokens IS 'Tokens únicos para gestión de reservas por clientes';
COMMENT ON COLUMN restaurante.reservation_tokens.token IS 'Token único de 128 caracteres para autenticación sin contraseña';
COMMENT ON COLUMN restaurante.reservation_tokens.expires_at IS 'Fecha de expiración del token (normalmente la fecha de la reserva)';
COMMENT ON FUNCTION restaurante.cleanup_expired_tokens() IS 'Función de mantenimiento para eliminar tokens expirados';