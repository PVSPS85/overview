-- ==============================================================================
-- MIGRATION: Create contact_messages table and apply Row Level Security policies
-- ==============================================================================

-- 1. Create the table idempotently
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  delivery_status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add any columns that might be missing if the table existed from an older version
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE contact_messages ADD COLUMN delivery_status TEXT DEFAULT 'pending';
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    BEGIN
        ALTER TABLE contact_messages ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    BEGIN
        ALTER TABLE contact_messages ADD COLUMN delivery_error TEXT;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;

    BEGIN
        ALTER TABLE contact_messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- 3. Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create trigger for automatic updated_at timestamp (re-runs idempotently)
DROP TRIGGER IF EXISTS update_contact_messages_modtime ON contact_messages;
CREATE TRIGGER update_contact_messages_modtime 
  BEFORE UPDATE ON contact_messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_column();

-- 5. Drop existing policies to prevent conflicts, then re-create them
DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin has full access to contact messages" ON contact_messages;

-- 6. Apply strictly scoped RLS Policies

-- Public can ONLY insert, cannot select/update/delete.
CREATE POLICY "Public can insert contact messages" 
  ON contact_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Admins have full access to their inbox.
CREATE POLICY "Admin has full access to contact messages" 
  ON contact_messages 
  FOR ALL 
  USING (is_admin());
