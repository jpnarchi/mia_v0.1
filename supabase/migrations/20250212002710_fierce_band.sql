/*
  # Actualizar políticas RLS para privacidad de reservas

  1. Cambios
    - Eliminar políticas existentes de bookings
    - Crear nuevas políticas restrictivas por usuario
    - Asegurar que cada usuario solo pueda ver y gestionar sus propias reservas
  
  2. Seguridad
    - Habilitar RLS para bookings
    - Políticas específicas por usuario para SELECT, INSERT, UPDATE
    - No se permite DELETE para mantener el historial
*/

-- Eliminar políticas existentes de bookings
DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

-- Crear nuevas políticas restrictivas
CREATE POLICY "bookings_private_select"
ON bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "bookings_private_insert"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_private_update"
ON bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);