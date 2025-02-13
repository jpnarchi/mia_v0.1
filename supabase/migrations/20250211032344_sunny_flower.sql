/*
  # Fix payments and bookings relationship

  1. Changes
    - Drop existing payments table
    - Recreate payments table with proper foreign key relationship
    - Add indexes for better performance
    - Update RLS policies
*/

-- Drop existing payments table
DROP TABLE IF EXISTS payments;

-- Recreate payments table with proper relationship
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  booking_id uuid REFERENCES bookings(id) NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'mxn',
  status text NOT NULL DEFAULT 'pending',
  payment_intent_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_booking_id_idx ON payments(booking_id);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Recreate policies for payments
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

-- Recreate trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();