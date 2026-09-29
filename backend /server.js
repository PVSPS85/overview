const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const FRONTEND_URL = process.env.FRONTEND_URL || '*'; // Should be restricted in prod

// Security Middleware
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '100kb' })); // Reasonable request body limit

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs for testing
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit to 5 contact requests per 15 minutes per IP
  message: { error: 'Too many messages sent. Please try again later.' }
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Base Supabase Client Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

// Helper to get an authenticated supabase client scoped to the request's user
const getAuthClient = (req) => {
  if (req.token) {
    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${req.token}` } }
    });
  }
  return createClient(supabaseUrl, supabaseKey); // Anonymous client
};

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
// GET Public Profile
app.get('/api/profile', async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { data, error } = await supabase.from('profile').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    res.status(200).json(data || {});
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET Public Current Resume
app.get('/api/resume/current', async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { data, error } = await supabase.from('resumes').select('*').eq('visibility', 'Published').order('published_at', { ascending: false }).limit(1).single();
    if (error && error.code !== 'PGRST116') throw error;
    res.status(200).json(data || null);
  } catch (error) {
    console.error('Error fetching current resume:', error.message);
    res.status(500).json({ error: 'Failed to fetch current resume' });
  }
});
// GET Public Certifications
app.get('/api/certifications', async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { data, error } = await supabase
      .from('certifications')
      .select('id, title, issuer, issue_date, category, mark, certificate_url, credential_url, published_at')
      .eq('visibility', 'Published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching public certifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

// GET Signed URL
app.get('/api/storage/signed-url', async (req, res) => {
  try {
    const { bucket, path } = req.query;
    if (!bucket || !path) return res.status(400).json({ error: 'Bucket and path required' });
    
    const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
    
    const id = path.split('/')[0];
    let table, field;
    if (bucket === 'certificates') { table = 'certifications'; field = 'certificate_url'; }
    else if (bucket === 'project-media') { table = 'projects'; field = 'cover_image_url'; }
    else if (bucket === 'profile-media') { table = 'profile'; field = 'profile_photo_url'; }
    else if (bucket === 'resumes') { table = 'resumes'; field = 'resume_url'; }
    else { return res.status(400).json({ error: 'Unsupported bucket' }); }
    
    let selectQuery = field;
    if (table !== 'profile') selectQuery += ', visibility';

    const { data: record, error: recordError } = await adminSupabase.from(table).select(selectQuery).eq('id', id).single();
    
    if (recordError || !record) return res.status(404).json({ error: 'Record not found' });
    if (record[field] !== path) return res.status(403).json({ error: 'Storage path does not belong to this record' });
    if (table !== 'profile' && record.visibility !== 'Published' && !req.token) return res.status(403).json({ error: 'Forbidden' });

    const { data, error } = await adminSupabase.storage.from(bucket).createSignedUrl(path, 3600);
    if (error) throw error;
    res.status(200).json({ signedUrl: data.signedUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// GET All Public Data in One Shot (profile + photo + resume + certifications with signed URLs)
// This replaces 5-7 separate requests with a single parallel call for fast page loads.
app.get('/api/public-data', async (req, res) => {
  try {
    const adminSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
    );

    // Fetch all data in parallel
    const [profileResult, resumeResult, certsResult] = await Promise.all([
      adminSupabase.from('profile').select('*').limit(1).maybeSingle(),
      adminSupabase.from('resumes').select('*').eq('visibility', 'Published').order('published_at', { ascending: false }).limit(1).maybeSingle(),
      adminSupabase.from('certifications')
        .select('id, title, issuer, issue_date, category, mark, certificate_url, credential_url, published_at')
        .eq('visibility', 'Published')
        .order('created_at', { ascending: false })
    ]);

    const profile = profileResult.data || null;
    const resume = resumeResult.data || null;
    const certs = certsResult.data || [];

    // Generate all signed URLs in parallel
    const signedUrlPromises = [];

    if (profile?.profile_photo_url) {
      signedUrlPromises.push(
        adminSupabase.storage.from('profile-media').createSignedUrl(profile.profile_photo_url, 3600)
          .then(r => ({ key: 'photoUrl', value: r.data?.signedUrl || null }))
          .catch(() => ({ key: 'photoUrl', value: null }))
      );
    }

    if (resume?.resume_url) {
      signedUrlPromises.push(
        adminSupabase.storage.from('resumes').createSignedUrl(resume.resume_url, 3600)
          .then(r => ({ key: 'resumeUrl', value: r.data?.signedUrl || null }))
          .catch(() => ({ key: 'resumeUrl', value: null }))
      );
    }

    for (const cert of certs) {
      if (cert.certificate_url) {
        signedUrlPromises.push(
          adminSupabase.storage.from('certificates').createSignedUrl(cert.certificate_url, 3600)
            .then(r => ({ key: `cert_${cert.id}`, value: r.data?.signedUrl || null }))
            .catch(() => ({ key: `cert_${cert.id}`, value: null }))
        );
      }
    }

    const signedResults = await Promise.all(signedUrlPromises);
    const urls = Object.fromEntries(signedResults.map(r => [r.key, r.value]));

    // Attach signed URLs to certs
    const certsWithUrls = certs.map(cert => ({
      ...cert,
      signedUrl: urls[`cert_${cert.id}`] || null
    }));

    res.status(200).json({
      profile,
      photoUrl: urls['photoUrl'] || null,
      resume,
      resumeUrl: urls['resumeUrl'] || null,
      certifications: certsWithUrls
    });
  } catch (error) {
    console.error('Error fetching public data:', error.message);
    res.status(500).json({ error: 'Failed to fetch public data' });
  }
});



// POST Contact Message
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 100) {
    return res.status(400).json({ error: 'Valid name is required' });
  }
  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 255) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (!message || typeof message !== 'string' || message.trim() === '' || message.length > 5000) {
    return res.status(400).json({ error: 'Valid message is required' });
  }

  try {
    const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY);
    // 1. Store in DB (pending)
    const { data: dbMsg, error: dbError } = await adminSupabase.from('contact_messages').insert({
      sender_name: name.trim(),
      sender_email: email.trim(),
      message: message.trim(),
      delivery_status: 'pending'
    }).select().single();

    if (dbError) throw dbError;

    // Send success to user immediately (don't wait for email)
    res.status(200).json({ message: 'Your message was received successfully.' });

    // 2. Attempt Email Delivery
    
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.CONTACT_DESTINATION_EMAIL) {
        await transporter.sendMail({
          from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
          to: process.env.CONTACT_DESTINATION_EMAIL,
          subject: 'New message from your portfolio',
          text: `Visitor Name: ${name}\nVisitor Email: ${email}\n\nMessage:\n${message}\n\nTimestamp: ${new Date().toISOString()}`
        });

        // 3. Mark success
        await adminSupabase.from('contact_messages')
          .update({ delivery_status: 'sent', delivered_at: new Date().toISOString() })
          .eq('id', dbMsg.id);
      } else {
        // Provider not configured, still mark failed
        await adminSupabase.from('contact_messages')
          .update({ delivery_status: 'failed', delivery_error: 'Email provider not fully configured' })
          .eq('id', dbMsg.id);
      }
    } catch (emailError) {
      console.error('Email delivery failed:', emailError);
      await adminSupabase.from('contact_messages')
        .update({ delivery_status: 'failed', delivery_error: emailError.message })
        .eq('id', dbMsg.id);
    }
  } catch (error) {
    console.error('Error handling contact message:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An error occurred while saving your message.' });
    }
  }
});


const uploadToSupabase = async (supabase, file, bucket, pathPrefix, maxSizeMB, allowedExts, allowedMimes) => {
  if (!file) return null;
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) throw new Error(`File size exceeds limit of ${maxSizeMB}MB`);
  if (!allowedMimes.includes(file.mimetype)) throw new Error(`Invalid MIME type: ${file.mimetype}`);

  const ext = file.originalname.split('.').pop().toLowerCase();
  if (!allowedExts.includes(ext)) throw new Error('Unsupported file extension.');
  if (ext === 'pdf' && file.mimetype !== 'application/pdf') throw new Error('MIME type mismatch.');

  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  });

  if (error) throw error;
  return path;
};

// ==========================================
// PROTECTED ENDPOINTS (ADMIN ONLY)
// ==========================================

// GET Admin Messages
app.get('/api/admin/messages', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching admin messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PUT Mark Message Read/Handled
app.put('/api/admin/messages/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { is_read } = req.body;
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ is_read })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating message:', error.message);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// DELETE Admin Message
app.delete('/api/admin/messages/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Helper function: Simple Validation for Projects
const validateProjectInput = (body) => {
  const { title, description, category, tech_stack, visibility } = body;
  const errors = [];
  
  if (!title || typeof title !== 'string' || title.trim() === '') errors.push('Title is required.');
  if (title && title.length > 255) errors.push('Title is too long.');
  if (!description || typeof description !== 'string' || description.trim() === '') errors.push('Description is required.');
  if (!category || typeof category !== 'string' || category.trim() === '') errors.push('Category is required.');
  if (!Array.isArray(tech_stack)) errors.push('Tech stack must be an array.');
  
  const validVisibilities = ['Published', 'Draft', 'Private'];
  if (!validVisibilities.includes(visibility)) errors.push('Invalid visibility state.');
  
  // URL validation
  const urlPattern = /^https?:\/\/.+/;
  if (body.github_url && !urlPattern.test(body.github_url)) errors.push('Invalid GitHub URL');
  if (body.live_demo_url && !urlPattern.test(body.live_demo_url)) errors.push('Invalid Live Demo URL');
  if (body.other_url && !urlPattern.test(body.other_url)) errors.push('Invalid Other URL');
  
  return errors;
};
// GET All Certifications (Admin)
app.get('/api/admin/certifications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { data, error } = await supabase.from('certifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

const validateCertInput = (body) => {
  const { title, issuer, issue_date, category, visibility } = body;
  const errors = [];
  if (!title || !title.trim()) errors.push('Title is required.');
  if (!issuer || !issuer.trim()) errors.push('Issuer is required.');
  if (!issue_date) errors.push('Issue date is required.');
  if (!category || !category.trim()) errors.push('Category is required.');
  if (!['Published', 'Draft', 'Private'].includes(visibility)) errors.push('Invalid visibility state.');
  return errors;
};

// POST Create Certification
app.post('/api/certifications', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const errors = validateCertInput(req.body);
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    const supabase = getAuthClient(req);
    const id = crypto.randomUUID();
    let certificate_url = null;
    
    if (req.file) {
      certificate_url = await uploadToSupabase(supabase, req.file, 'certificates', id, 10, ['jpg', 'jpeg', 'png', 'webp', 'pdf'], ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    }

    const newCert = {
      id,
      title: req.body.title.trim(),
      issuer: req.body.issuer.trim(),
      issue_date: req.body.issue_date,
      category: req.body.category.trim(),
      mark: req.body.title.substring(0,2).toUpperCase(),
      certificate_url,
      credential_url: req.body.credential_url || null,
      visibility: req.body.visibility,
      published_at: req.body.visibility === 'Published' ? new Date().toISOString() : null
    };

    const { data, error } = await supabase.from('certifications').insert([newCert]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating cert:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create certification' });
  }
});

// PUT Update Certification
app.put('/api/certifications/:id', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validateCertInput(req.body);
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    const supabase = getAuthClient(req);
    const { data: existing, error: fetchError } = await supabase.from('certifications').select('*').eq('id', id).single();
    if (fetchError || !existing) return res.status(404).json({ error: 'Certification not found' });

    let certificate_url = existing.certificate_url;
    if (req.file) {
      if (certificate_url) await supabase.storage.from('certificates').remove([certificate_url]);
      certificate_url = await uploadToSupabase(supabase, req.file, 'certificates', id, 10, ['jpg', 'jpeg', 'png', 'webp', 'pdf'], ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    }

    let publishedAt = existing.published_at;
    if (req.body.visibility === 'Published' && existing.visibility !== 'Published') publishedAt = new Date().toISOString();
    else if (req.body.visibility !== 'Published') publishedAt = null;

    const updated = {
      title: req.body.title.trim(),
      issuer: req.body.issuer.trim(),
      issue_date: req.body.issue_date,
      category: req.body.category.trim(),
      mark: req.body.title.substring(0,2).toUpperCase(),
      certificate_url,
      credential_url: req.body.credential_url || null,
      visibility: req.body.visibility,
      published_at: publishedAt
    };

    const { data, error } = await supabase.from('certifications').update(updated).eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating cert:', error.message);
    res.status(500).json({ error: error.message || 'Failed to update certification' });
  }
});

// DELETE Certification
app.delete('/api/certifications/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAuthClient(req);
    const { data: existing } = await supabase.from('certifications').select('certificate_url').eq('id', id).single();
    
    if (existing && existing.certificate_url) {
      const { error: delError } = await supabase.storage.from('certificates').remove([existing.certificate_url]);
      if (delError) console.error("Cleanup failure for cert file:", delError);
    }
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Certification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certification' });
  }
});

// ==========================================
// HACKATHONS ENDPOINTS
// ==========================================

const validateUrl = (url) => {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const validateHackathonInput = (body) => {
  const { event_name, event_year, project_name, role, result, tech_stack, event_link, project_link, visibility } = body;
  const errors = [];
  if (!event_name || !event_name.trim()) errors.push('Event name is required.');
  if (!event_year || !event_year.trim()) errors.push('Event year is required.');
  if (!project_name || !project_name.trim()) errors.push('Project name is required.');
  if (!role || !role.trim()) errors.push('Role is required.');
  if (result && result.length > 255) errors.push('Result is too long.');
  if (!tech_stack || !tech_stack.trim()) errors.push('Tech stack is required.');
  if (event_link && !validateUrl(event_link)) errors.push('Invalid event URL.');
  if (project_link && !validateUrl(project_link)) errors.push('Invalid project URL.');
  if (!['Published', 'Draft', 'Private'].includes(visibility)) errors.push('Invalid visibility state.');
  return errors;
};
const validateProfileInput = (body) => {
  const { full_name, headline, short_bio, availability_status, github_url, linkedin_url, email } = body;
  const errors = [];
  if (!full_name || !full_name.trim()) errors.push('Name is required.');
  if (!headline || !headline.trim()) errors.push('Headline is required.');
  if (short_bio && short_bio.length > 500) errors.push('Introduction is too long.');
  if (availability_status && availability_status.length > 100) errors.push('Status is too long.');

  const urlPattern = /^https?:\/\/.+/;
  if (github_url && !urlPattern.test(github_url)) errors.push('Invalid GitHub URL');
  if (linkedin_url && !urlPattern.test(linkedin_url)) errors.push('Invalid LinkedIn URL');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailPattern.test(email)) errors.push('Invalid email format');

  return errors;
};

// PUT Update Profile
app.put('/api/profile', requireAuth, requireAdmin, async (req, res) => {
  try {
    const errors = validateProfileInput(req.body);
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    const supabase = getAuthClient(req);
    const { data: existingProfile } = await supabase.from('profile').select('id').limit(1).maybeSingle();

    const updatedProfile = {
      full_name: req.body.full_name.trim(),
      headline: req.body.headline.trim(),
      short_bio: req.body.short_bio ? req.body.short_bio.trim() : '',
      availability_status: req.body.availability_status ? req.body.availability_status.trim() : null,
      github_url: req.body.github_url ? req.body.github_url.trim() : null,
      linkedin_url: req.body.linkedin_url ? req.body.linkedin_url.trim() : null,
      email: req.body.email ? req.body.email.trim() : null,
      about_title: req.body.about_title ? req.body.about_title.trim() : null,
      about_lead: req.body.about_lead ? req.body.about_lead.trim() : null,
      about_body: req.body.about_body ? req.body.about_body.trim() : null,
      technologies: req.body.technologies ? req.body.technologies.trim() : null,
      interests: req.body.interests ? req.body.interests.trim() : null,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingProfile) {
      const { data, error } = await supabase.from('profile').update(updatedProfile).eq('id', existingProfile.id).select().single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase.from('profile').insert([updatedProfile]).select().single();
      if (error) throw error;
      result = data;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('Profile update failed:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message || error });
  }
});

// POST Upload Profile Photo
app.post('/api/profile/photo', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const supabase = getAuthClient(req);
    // Get existing profile to determine ID
    const { data: existingProfile } = await supabase.from('profile').select('id, profile_photo_url').limit(1).maybeSingle();
    const id = existingProfile ? existingProfile.id : crypto.randomUUID();
    
    // Upload new photo
    const profile_photo_url = await uploadToSupabase(supabase, req.file, 'profile-media', id, 5, ['jpg', 'jpeg', 'png', 'webp'], ['image/jpeg', 'image/png', 'image/webp']);
    
    let result;
    if (existingProfile) {
      const oldUrl = existingProfile.profile_photo_url;
      const { data, error } = await supabase.from('profile').update({ profile_photo_url, updated_at: new Date().toISOString() }).eq('id', existingProfile.id).select().single();
      if (error) throw error;
      result = data;
      // Cleanup old photo
      if (oldUrl) {
        await supabase.storage.from('profile-media').remove([oldUrl]).catch(console.error);
      }
    } else {
      const { data, error } = await supabase.from('profile').insert([{ id, profile_photo_url }]).select().single();
      if (error) throw error;
      result = data;
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to upload profile photo' });
  }
});

// ==========================================
// RESUMES ENDPOINTS (Protected)
// ==========================================

// GET Admin Resumes
app.get('/api/admin/resumes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const supabase = getAuthClient(req);
    const { data, error } = await supabase.from('resumes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// POST Create Resume
app.post('/api/resumes', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Resume file is required' });
    const supabase = getAuthClient(req);
    const id = crypto.randomUUID();
    
    const resume_url = await uploadToSupabase(supabase, req.file, 'resumes', id, 10, ['pdf'], ['application/pdf']);
    
    const visibility = req.body.visibility || 'Draft';
    
    if (visibility === 'Published') {
      // Unpublish others
      await supabase.from('resumes').update({ visibility: 'Draft' }).eq('visibility', 'Published');
    }

    const newResume = {
      id,
      title: req.body.title ? req.body.title.trim() : 'Resume',
      resume_url,
      visibility,
      published_at: visibility === 'Published' ? new Date().toISOString() : null
    };

    const { data, error } = await supabase.from('resumes').insert([newResume]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create resume' });
  }
});

// PUT Update Resume
app.put('/api/resumes/:id', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAuthClient(req);
    
    const { data: existing, error: fetchError } = await supabase.from('resumes').select('*').eq('id', id).single();
    if (fetchError || !existing) return res.status(404).json({ error: 'Resume not found' });

    let resume_url = existing.resume_url;
    if (req.file) {
      if (resume_url) await supabase.storage.from('resumes').remove([resume_url]).catch(console.error);
      resume_url = await uploadToSupabase(supabase, req.file, 'resumes', id, 10, ['pdf'], ['application/pdf']);
    }

    const visibility = req.body.visibility || existing.visibility;
    let publishedAt = existing.published_at;

    if (visibility === 'Published' && existing.visibility !== 'Published') {
      await supabase.from('resumes').update({ visibility: 'Draft' }).eq('visibility', 'Published');
      publishedAt = new Date().toISOString();
    } else if (visibility !== 'Published') {
      publishedAt = null;
    }

    const updated = {
      title: req.body.title ? req.body.title.trim() : existing.title,
      resume_url,
      visibility,
      published_at: publishedAt,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('resumes').update(updated).eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update resume' });
  }
});

// DELETE Resume
app.delete('/api/resumes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getAuthClient(req);
    const { data: existing } = await supabase.from('resumes').select('resume_url').eq('id', id).single();
    
    if (existing && existing.resume_url) {
      await supabase.storage.from('resumes').remove([existing.resume_url]).catch(console.error);
    }
    const { error } = await supabase.from('resumes').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Unexpected server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Secure Backend server running on port ${PORT}`);
});
