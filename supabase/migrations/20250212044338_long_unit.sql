-- Add hotel_name column to chat_messages
ALTER TABLE chat_messages 
ADD COLUMN hotel_name text;

-- Create index for hotel_name
CREATE INDEX chat_messages_hotel_name_idx ON chat_messages(hotel_name);