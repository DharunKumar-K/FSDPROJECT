const { createClient } = require("@supabase/supabase-js");

let supabaseClient;

const getSupabaseClient = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when USE_SUPABASE=true");
    }

    if (!supabaseClient) {
        supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
    }

    return supabaseClient;
};

module.exports = {
    getSupabaseClient
};