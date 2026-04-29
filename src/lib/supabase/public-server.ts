import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export type PublicReadSupabase = {
  supabase: SupabaseClient;
  isServiceRole: boolean;
};

/**
 * Public-read Supabase client for `/site/*` pages.
 *
 * - Prefers `SUPABASE_SERVICE_ROLE_KEY` (server-only) when present to avoid anon RLS blocking.
 * - Falls back to anon key, which requires correct RLS policies for published reads.
 */
export function createPublicReadClient(): PublicReadSupabase {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const key = serviceRoleKey || anonKey;
  const isServiceRole = Boolean(serviceRoleKey);

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return { supabase, isServiceRole };
}
