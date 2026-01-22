/**
 * src/core/database/admin.ts
 * The "God Mode" Supabase Client.
 * Uses SERVICE_ROLE_KEY to bypass RLS for system-level operations.
 * Usage: Used by Agents (Swarm, Auditor, Rainmaker) - NOT public routes.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
    if (adminClient) return adminClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            '🚨 FATAL: Missing SUPABASE_SERVICE_ROLE_KEY. Admin operations will fail.'
        );
    }

    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return adminClient;
}
