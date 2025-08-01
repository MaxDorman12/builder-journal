-- Enable Supabase Real-time for all tables
-- Run this in your Supabase SQL Editor to enable real-time sync

-- Enable real-time replication for journal_entries
ALTER PUBLICATION supabase_realtime ADD TABLE journal_entries;

-- Enable real-time replication for map_pins  
ALTER PUBLICATION supabase_realtime ADD TABLE map_pins;

-- Enable real-time replication for wishlist_items
ALTER PUBLICATION supabase_realtime ADD TABLE wishlist_items;

-- Enable real-time replication for charlie_data
ALTER PUBLICATION supabase_realtime ADD TABLE charlie_data;

-- Done! Real-time sync should now work across all devices.
