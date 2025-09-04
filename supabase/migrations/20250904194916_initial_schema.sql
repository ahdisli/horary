-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create horary_queries table
CREATE TABLE IF NOT EXISTS horary_queries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  chart_data JSONB,
  interpretation JSONB,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  query_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planetary_positions table
CREATE TABLE IF NOT EXISTS planetary_positions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query_id UUID REFERENCES horary_queries(id) ON DELETE CASCADE,
  planet_name TEXT NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  zodiac_sign TEXT NOT NULL,
  degree INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  second INTEGER NOT NULL,
  retrograde BOOLEAN DEFAULT FALSE,
  house_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create aspects table
CREATE TABLE IF NOT EXISTS aspects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query_id UUID REFERENCES horary_queries(id) ON DELETE CASCADE,
  planet1 TEXT NOT NULL,
  planet2 TEXT NOT NULL,
  aspect_type TEXT NOT NULL,
  orb DECIMAL(5, 2) NOT NULL,
  exact BOOLEAN DEFAULT FALSE,
  applying BOOLEAN DEFAULT FALSE,
  separating BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_horary_queries_user_id ON horary_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_horary_queries_created_at ON horary_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_planetary_positions_query_id ON planetary_positions(query_id);
CREATE INDEX IF NOT EXISTS idx_aspects_query_id ON aspects(query_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE horary_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE planetary_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for horary_queries table
CREATE POLICY "Users can view own queries" ON horary_queries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own queries" ON horary_queries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queries" ON horary_queries FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for planetary_positions table
CREATE POLICY "Users can view planetary positions for own queries" ON planetary_positions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM horary_queries 
      WHERE horary_queries.id = planetary_positions.query_id 
      AND horary_queries.user_id = auth.uid()
    )
  );

-- RLS Policies for aspects table
CREATE POLICY "Users can view aspects for own queries" ON aspects 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM horary_queries 
      WHERE horary_queries.id = aspects.query_id 
      AND horary_queries.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horary_queries_updated_at BEFORE UPDATE ON horary_queries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
