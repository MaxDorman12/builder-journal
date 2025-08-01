-- Updated Supabase Database Migration SQL
-- Run this in your Supabase SQL Editor to add missing columns to journal_entries table

-- Add missing columns to journal_entries table
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS mood_rating INTEGER DEFAULT 3;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS great_for TEXT[] DEFAULT '{}';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_busy BOOLEAN DEFAULT FALSE;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS area_type TEXT DEFAULT 'town';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS would_return_reason TEXT DEFAULT '';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS would_return BOOLEAN DEFAULT TRUE;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS has_free_parking_available BOOLEAN DEFAULT FALSE;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS parking_cost TEXT DEFAULT '';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_paid_activity BOOLEAN DEFAULT FALSE;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS activity_cost TEXT DEFAULT '';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Family';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Update existing entries to set defaults where NULL
UPDATE journal_entries SET 
  date = created_at WHERE date IS NULL;
UPDATE journal_entries SET 
  location = location_name WHERE location IS NULL AND location_name IS NOT NULL;
UPDATE journal_entries SET 
  location = '' WHERE location IS NULL;
UPDATE journal_entries SET 
  mood_rating = 3 WHERE mood_rating IS NULL;
UPDATE journal_entries SET 
  great_for = '{}' WHERE great_for IS NULL;
UPDATE journal_entries SET 
  is_busy = FALSE WHERE is_busy IS NULL;
UPDATE journal_entries SET 
  area_type = 'town' WHERE area_type IS NULL;
UPDATE journal_entries SET 
  would_return_reason = '' WHERE would_return_reason IS NULL;
UPDATE journal_entries SET 
  would_return = TRUE WHERE would_return IS NULL;
UPDATE journal_entries SET 
  has_free_parking_available = FALSE WHERE has_free_parking_available IS NULL;
UPDATE journal_entries SET 
  parking_cost = '' WHERE parking_cost IS NULL;
UPDATE journal_entries SET 
  is_paid_activity = FALSE WHERE is_paid_activity IS NULL;
UPDATE journal_entries SET 
  activity_cost = '' WHERE activity_cost IS NULL;
UPDATE journal_entries SET 
  author = 'Family' WHERE author IS NULL;
UPDATE journal_entries SET 
  likes = 0 WHERE likes IS NULL;
UPDATE journal_entries SET 
  comments = '[]' WHERE comments IS NULL;
UPDATE journal_entries SET 
  tags = '{}' WHERE tags IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood_rating ON journal_entries(mood_rating);
CREATE INDEX IF NOT EXISTS idx_journal_entries_area_type ON journal_entries(area_type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_author ON journal_entries(author);

-- Done! Journal entries table now has all required fields with defaults.
