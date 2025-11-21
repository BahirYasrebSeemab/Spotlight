import { supabase } from "@/src/lib/supabase";

export async function generateUniqueUsername(email: string) {
  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, '');

  // check if exists
  const { data: existing } = await supabase.from('User').select('username').eq('username', base).single();

  if (!existing) return base;

  // username exists → append numbers
  let counter = 1;
  while (true) {
    const candidate = `${base}${counter}`;

    const { data: exists } = await supabase.from('User').select('username').eq('username', candidate).single();

    if (!exists) return candidate;

    counter++;
  }
}
