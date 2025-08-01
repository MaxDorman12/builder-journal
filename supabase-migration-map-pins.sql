-- Update map_pins table to include all MapPin interface fields

-- Add missing columns to map_pins table
ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS mood_rating INTEGER DEFAULT 5 CHECK (mood_rating >= 1 AND mood_rating <= 5);
ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS journal_entry_id TEXT;
ALTER TABLE map_pins ADD COLUMN IF NOT EXISTS images TEXT DEFAULT '[]'; -- JSON array as text

-- Add foreign key constraint for journal_entry_id if journal_entries table exists
-- ALTER TABLE map_pins ADD CONSTRAINT fk_map_pins_journal_entry 
--   FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_map_pins_journal_entry_id ON map_pins(journal_entry_id);
