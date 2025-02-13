/*
  # Crear tablas de pagos y reservas

  1. Nuevas Tablas
    - `bookings`
      - `id` (uuid, primary key)
      - `confirmation_code` (text, unique)
      - `user_id` (uuid, foreign key)
      - `hotel_name` (text)
      - `check_in` (date)
      - `check_out` (date)
      - `room_type` (text)
      - `total_price` (numeric)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `booking_id` (uuid, foreign key)
      - `amount` (numeric)
      - `currency` (text)
      - `status` (text)
      - `payment_intent_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Relaciones
    - `payments.booking_id` -> `bookings.id`
    - `payments.user_id` -> `users.id`
    - `bookings.user_id` -> `users.id`

  3. Seguridad
    - Habilitar RLS en ambas tablas
    - Políticas para permitir a los usuarios ver y gestionar sus propios registros
*/

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  hotel_name text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  room_type text NOT NULL,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  booking_id uuid REFERENCES bookings NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'mxn',
  status text NOT NULL DEFAULT 'pending',
  payment_intent_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas para bookings
CREATE POLICY "bookings_select_policy"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_policy"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_policy"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para payments
CREATE POLICY "payments_select_policy"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_policy"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payments_update_policy"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers para actualizar updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();