import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — backend features disabled.');
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

const EMAIL_DOMAIN = '@sb3019.local';
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000;

function toEmail(username) {
  return username.toLowerCase().trim() + EMAIL_DOMAIN;
}

function toUsername(email) {
  return email?.replace(EMAIL_DOMAIN, '') || null;
}

export async function getUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return {
    id: session.user.id,
    username: toUsername(session.user.email),
  };
}

export async function isLoggedIn() {
  const user = await getUser();
  return !!user;
}

export async function signup(username, password) {
  const email = toEmail(username);

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Username already taken' };
    }
    return { error: error.message };
  }

  await supabase.from('campaign_volunteers').upsert({
    id: data.user.id,
    username: username.toLowerCase().trim(),
  });

  return { user: { id: data.user.id, username: username.toLowerCase().trim() } };
}

export async function login(username, password) {
  const rateCheck = await checkRateLimit(username);
  if (!rateCheck.allowed) {
    return { error: `Too many attempts. Try again in ${rateCheck.retryMinutes} minutes.` };
  }

  const email = toEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  await logLoginAttempt(username, !error);

  if (error) {
    return { error: 'Wrong username or password' };
  }

  return { user: { id: data.user.id, username: toUsername(data.user.email) } };
}

export async function logout() {
  await supabase.auth.signOut();
}

async function checkRateLimit(username) {
  const cutoff = new Date(Date.now() - ATTEMPT_WINDOW_MS).toISOString();
  const { data, error } = await supabase
    .from('campaign_login_attempts')
    .select('id')
    .eq('username', username.toLowerCase().trim())
    .eq('success', false)
    .gte('created_at', cutoff);

  if (error || !data) return { allowed: true };

  const failures = data.length;
  if (failures >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryMinutes: Math.ceil((ATTEMPT_WINDOW_MS - (Date.now() - new Date(cutoff).getTime())) / 60000) || 1,
    };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - failures };
}

async function logLoginAttempt(username, success) {
  await supabase.from('campaign_login_attempts').insert({
    username: username.toLowerCase().trim(),
    success,
  });
}

export async function logActivity(type, data = {}) {
  const user = await getUser();
  if (!user) return;
  const { error } = await supabase.from('campaign_activity').insert({
    volunteer_id: user.id,
    type,
    data,
  });
  if (error) console.error('[logActivity]', error.message);
}
