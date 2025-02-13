/*
  # Add hotel_name column to chat_messages

  1. Changes
    - Add hotel_name column to chat_messages table if it doesn't exist
    - Create index for hotel_name column if it doesn't exist
*/

DO $$ 
BEGIN
  -- Add hotel_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'chat_messages' 
    AND column_name = 'hotel_name'
  ) THEN
    ALTER TABLE chat_messages 
    ADD COLUMN hotel_name text;
  END IF;

  -- Create index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'chat_messages'
    AND indexname = 'chat_messages_hotel_name_idx'
  ) THEN
    CREATE INDEX chat_messages_hotel_name_idx ON chat_messages(hotel_name);
  END IF;
END $$;