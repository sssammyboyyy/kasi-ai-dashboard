import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
        console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will fail.")
        // Fallback to Anon key? No, that defeats the purpose.
        // If we return anon client here, we mask the error.
        // Better to let it fail or throw.
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.")
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
