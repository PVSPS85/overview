-- ==============================================================================
-- PRANAV'S PERSONAL PROFESSIONAL IDENTITY PLATFORM - DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- Admin Users (Authorization)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile Information
CREATE TABLE profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL DEFAULT 'Pranav',
  headline TEXT NOT NULL,
  short_bio TEXT NOT NULL,
  availability_status TEXT DEFAULT 'Available to collaborate',
  profile_photo_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL,
  cover_image_url TEXT,
  project_date DATE,
  github_url TEXT,
  live_demo_url TEXT,
  organization TEXT,
  other_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'Published', -- 'Published', 'Draft', 'Private'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  category TEXT NOT NULL,
  mark TEXT NOT NULL,
  certificate_url TEXT,
  credential_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'Published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Hackathons
CREATE TABLE hackathons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  event_year TEXT NOT NULL,
  project_name TEXT NOT NULL,
  role TEXT NOT NULL,
  result TEXT,
  tech_stack TEXT NOT NULL,
  description TEXT,
  event_link TEXT,
  project_link TEXT,
  visibility TEXT NOT NULL DEFAULT 'Published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  achievement_date DATE,
  category TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'Published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Resumes
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  resume_url TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'Published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  delivery_status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Helper Function: Check Admin Status
-- ------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------
-- Public Read Access (Only for Published Content)
-- ------------------------------------------

CREATE POLICY "Public can view profile" ON profile FOR SELECT USING (true);

CREATE POLICY "Public can view published projects" ON projects 
  FOR SELECT USING (visibility = 'Published');

CREATE POLICY "Public can view published certifications" ON certifications 
  FOR SELECT USING (visibility = 'Published');

CREATE POLICY "Public can view published hackathons" ON hackathons 
  FOR SELECT USING (visibility = 'Published');

CREATE POLICY "Public can view published achievements" ON achievements 
  FOR SELECT USING (visibility = 'Published');

CREATE POLICY "Public can view published resumes" ON resumes 
  FOR SELECT USING (visibility = 'Published');

CREATE POLICY "Public can insert contact messages" ON contact_messages 
  FOR INSERT WITH CHECK (true);

-- ------------------------------------------
-- Admin Full Access (Requires is_admin() = true)
-- ------------------------------------------

CREATE POLICY "Admin has full access to admin_users" ON admin_users
  FOR ALL USING (is_admin());

CREATE POLICY "Admin has full access to profile" ON profile 
  FOR ALL USING (is_admin());

CREATE POLICY "Admin has full access to projects" ON projects 
  FOR ALL USING (is_admin());

CREATE POLICY "Admin has full access to certifications" ON certifications 
  FOR ALL USING (is_admin());

CREATE POLICY "Admin has full access to hackathons" ON hackathons 
  FOR ALL USING (is_admin());

CREATE POLICY "Admin has full access to achievements" ON achievements 
  FOR ALL USING (is_admin());

CREATE POLICY "Admin has full access to resumes" ON resumes 
  FOR ALL USING (is_admin());

CREATE POLICY "Admin has full access to contact messages" ON contact_messages 
  FOR ALL USING (is_admin());

-- ==========================================
-- 3. AUTOMATIC TIMESTAMPS
-- ==========================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_modtime BEFORE UPDATE ON profile FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_certifications_modtime BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_hackathons_modtime BEFORE UPDATE ON hackathons FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_achievements_modtime BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_resumes_modtime BEFORE UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 4. SUPABASE STORAGE (BUCKETS & POLICIES)
-- ==========================================

-- Create Private Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('certificates', 'certificates', false),
('project-media', 'project-media', false),
('profile-media', 'profile-media', false),
('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Note: storage.objects table should have RLS enabled by default in Supabase

CREATE POLICY "Admin full access to project-media" ON storage.objects
  FOR ALL USING (bucket_id = 'project-media' AND is_admin());

CREATE POLICY "Admin full access to certificates" ON storage.objects
  FOR ALL USING (bucket_id = 'certificates' AND is_admin());

CREATE POLICY "Admin full access to profile-media" ON storage.objects
  FOR ALL USING (bucket_id = 'profile-media' AND is_admin());

CREATE POLICY "Admin full access to resumes" ON storage.objects
  FOR ALL USING (bucket_id = 'resumes' AND is_admin());

-- Public access is intentionally omitted because we will use short-lived signed URLs.
