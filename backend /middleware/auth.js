const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  
  // Verify token using Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
  
  req.user = user;
  req.token = token; // Attach token for downstream RLS queries
  next();
};

const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.token) {
    return res.status(401).json({ error: 'Unauthorized: No user context found' });
  }
  
  // Use scoped client to check if the user is an admin
  // RLS on admin_users allows selection only if the user is an admin
  const authClient = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${req.token}` } }
  });

  const { data: admin, error } = await authClient
    .from('admin_users')
    .select('id')
    .eq('id', req.user.id)
    .single();
    
  if (error || !admin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
