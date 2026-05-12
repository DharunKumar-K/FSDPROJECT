require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { getSupabaseClient } = require("../config/supabase");

const tables = [
    "submissions",
    "attendance",
    "activities",
    "sessions",
    "courses",
    "curriculum",
    "students",
    "teachers",
    "admins"
];

async function clearAll() {
    const supabase = getSupabaseClient();
    for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (error) {
            console.error(`Failed to clear ${table}:`, error.message);
        } else {
            console.log(`Cleared: ${table}`);
        }
    }
    console.log("Done.");
}

clearAll();
