import { createClient } from 'npm:@supabase/supabase-js@2.35.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function generateUsername(email: string) {
  const base = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
    .slice(0, 20);

  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}_${suffix}`;
}

Deno.serve(async req => {
  try {
    if (req.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405 });
    }

    const secret = req.headers.get('x-supabase-webhook-secret');
    if (!secret || secret !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 403 });
    }

    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      return new Response('Missing bearer token', { status: 401 });
    }

    const payload = await req.json();
    const user = payload.record;

    if (!user?.id || !user?.email) {
      return new Response('Invalid payload', { status: 400 });
    }

    const email = user.email.toLowerCase();

    // ---- metadata normalization ----
    const meta = user.user_metadata ?? {};
    const appMeta = user.app_metadata ?? {};

    const username = meta.username && meta.username.length >= 3 ? meta.username.toLowerCase() : generateUsername(email);

    const name = meta.fullName ?? meta.full_name ?? meta.name ?? null;

    const dob = meta.dob ? new Date(meta.dob).toISOString() : null;

    const emailConfirmedAt = user.email_confirmed_at ? new Date(user.email_confirmed_at).toISOString() : null;

    const insertPayload = {
      id: user.id,
      email,
      username,
      name,
      dob,
      emailConfirmedAt,
      createdAt: new Date(user.created_at).toISOString(),
    };

    const { error } = await supabase.from('User').insert(insertPayload);

    if (error && error.code !== '23505') {
      console.error('DB error:', error);
      return new Response('DB insert failed', { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Internal error', { status: 500 });
  }
});
