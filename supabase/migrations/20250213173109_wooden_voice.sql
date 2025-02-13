/*
  # Create invoices table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `booking_id` (uuid, references bookings)
      - `invoice_type` (text)
      - `status` (text)
      - `amount` (numeric)
      - `tax_percentage` (numeric)
      - `billing_details` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `invoices` table
    - Add policies for authenticated users to manage their own invoices
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  booking_id uuid REFERENCES bookings NOT NULL,
  invoice_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL,
  tax_percentage numeric NOT NULL DEFAULT 16,
  billing_details jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX invoices_user_id_idx ON invoices(user_id);
CREATE INDEX invoices_booking_id_idx ON invoices(booking_id);
CREATE INDEX invoices_created_at_idx ON invoices(created_at);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();