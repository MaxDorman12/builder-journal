-- Create YouTube Videos table
CREATE TABLE IF NOT EXISTS youtube_videos (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    updated_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on youtube_videos" ON youtube_videos
    FOR ALL USING (true) WITH CHECK (true);

-- Enable real-time subscriptions for the table
ALTER PUBLICATION supabase_realtime ADD TABLE youtube_videos;

-- Add some helpful comments
COMMENT ON TABLE youtube_videos IS 'Stores family YouTube video information for cross-device syncing';
COMMENT ON COLUMN youtube_videos.id IS 'Unique identifier for the video entry';
COMMENT ON COLUMN youtube_videos.url IS 'YouTube video URL';
COMMENT ON COLUMN youtube_videos.title IS 'Display title for the video';
COMMENT ON COLUMN youtube_videos.description IS 'Video description';
COMMENT ON COLUMN youtube_videos.updated_by IS 'Family member who last updated this video';
COMMENT ON COLUMN youtube_videos.created_at IS 'When the video entry was first created';
COMMENT ON COLUMN youtube_videos.updated_at IS 'When the video entry was last updated';
