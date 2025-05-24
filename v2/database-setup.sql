-- Database setup script for HVAC AI Demo Supabase integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  api_key TEXT,
  system_prompt TEXT,
  custom_system_prompt TEXT,
  theme TEXT,
  chat_mode TEXT,
  custom_chat_settings JSONB,
  selected_preset TEXT,
  deleted_chats_max INTEGER,
  active_chat_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats Table
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id TEXT REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  is_html BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts List Table
CREATE TABLE IF NOT EXISTS parts_list (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  part_name TEXT,
  description TEXT,
  quantity INTEGER,
  price NUMERIC,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deleted Chats Table
CREATE TABLE IF NOT EXISTS deleted_chats (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  chat_data JSONB,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_chats ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for chats
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" ON chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" ON chats
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for chat_messages
CREATE POLICY "Users can view messages from their chats" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their chats" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their chats" ON chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their chats" ON chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

-- Create policies for parts_list
CREATE POLICY "Users can view their own parts" ON parts_list
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parts" ON parts_list
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parts" ON parts_list
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own parts" ON parts_list
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for deleted_chats
CREATE POLICY "Users can view their own deleted chats" ON deleted_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deleted chats" ON deleted_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deleted chats" ON deleted_chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deleted chats" ON deleted_chats
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chats_user_id_idx ON chats(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_chat_id_idx ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS parts_list_user_id_idx ON parts_list(user_id);
CREATE INDEX IF NOT EXISTS deleted_chats_user_id_idx ON deleted_chats(user_id);
