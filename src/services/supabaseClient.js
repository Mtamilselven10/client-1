import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Check if credentials are meaningfully configured (not empty and not default placeholders)
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('your-project') &&
  !rawKey.includes('your-anon-publishable-key')
);

// Helpful development diagnostics
if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '%c[Supabase] Gandhi Shop is operating in local catalog/fallback mode.%c\nTo connect Supabase: copy .env.example to .env.local and enter your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    'color: #10b981; font-weight: bold;',
    'color: inherit;'
  );
}

// Client initialization: fallback to a safe placeholder client if unconfigured to avoid crash on load
export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder-project.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

/**
 * Health check helper to test Supabase connectivity
 * @returns {Promise<{ ok: boolean, configured: boolean, message: string, latencyMs?: number }>}
 */
export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      configured: false,
      message: 'Supabase credentials are not configured in .env.local',
    };
  }

  const startTime = performance.now();
  try {
    // Perform a lightweight ping to the database (or auth endpoint)
    const { error } = await supabase.from('categories').select('id', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - startTime);

    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet before Phase 2 migrations, which is still a reachable Supabase instance
      if (error.message && error.message.includes('relation "public.categories" does not exist')) {
        return {
          ok: true,
          configured: true,
          message: 'Connected to Supabase project (schema tables pending in Phase 2)',
          latencyMs,
        };
      }
      return {
        ok: false,
        configured: true,
        message: error.message || 'Supabase query error',
        latencyMs,
      };
    }

    return {
      ok: true,
      configured: true,
      message: 'Supabase is online and responding',
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      configured: true,
      message: err?.message || 'Network error reaching Supabase',
      latencyMs,
    };
  }
}

export const SUPABASE_CONFIG = {
  isConfigured: isSupabaseConfigured,
  urlDomain: isSupabaseConfigured ? new URL(rawUrl).hostname : 'Not Configured',
};

export default supabase;
