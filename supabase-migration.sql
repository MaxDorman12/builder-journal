-- Supabase Database Migration SQL
-- Run this in your Supabase SQL Editor to create all necessary tables

-- 1. Journal Entries Table
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[], -- Array of image URLs
  videos TEXT[], -- Array of video URLs
  location_name TEXT,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Map Pins Table  
CREATE TABLE IF NOT EXISTS map_pins (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  type TEXT DEFAULT 'visited', -- 'visited' or 'planned'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Charlie Data Table (single row for Charlie's info)
CREATE TABLE IF NOT EXISTS charlie_data (
  id TEXT PRIMARY KEY DEFAULT 'charlie',
  image TEXT,
  description TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default Charlie data if it doesn't exist
INSERT INTO charlie_data (id, image, description) 
VALUES (
  'charlie',
  '',
  'No family adventure is complete without our beloved four-legged companion, Charlie! This loyal and energetic member of the Dorman family brings joy and excitement to every journey we embark on across Scotland.

Whether it''s hiking through the Scottish Highlands, exploring sandy beaches along the coast, or discovering dog-friendly trails in the countryside, Charlie is always ready for the next adventure with his tail wagging and spirit high.

His favorite activities include chasing sticks by the lochs, making friends with other dogs at campsites, and of course, being the star of many of our family photos. Charlie truly makes every adventure more memorable! 🐾'
) ON CONFLICT (id) DO NOTHING;

-- 5. Enable Row Level Security (RLS) for all tables
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE charlie_data ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for public access (since this is a family journal)
-- Journal Entries Policies
CREATE POLICY "Enable read access for all users" ON journal_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON journal_entries FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON journal_entries FOR DELETE USING (true);

-- Map Pins Policies
CREATE POLICY "Enable read access for all users" ON map_pins FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON map_pins FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON map_pins FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON map_pins FOR DELETE USING (true);

-- Wishlist Items Policies
CREATE POLICY "Enable read access for all users" ON wishlist_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON wishlist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON wishlist_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON wishlist_items FOR DELETE USING (true);

-- Charlie Data Policies
CREATE POLICY "Enable read access for all users" ON charlie_data FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON charlie_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON charlie_data FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON charlie_data FOR DELETE USING (true);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_map_pins_location ON map_pins(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_priority ON wishlist_items(priority, completed);

-- Done! Your Supabase database is ready for the family journal.
