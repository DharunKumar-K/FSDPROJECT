const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Admin",
    table: "admins",
    defaults: {
        role: "admin"
    },
    fields: {
        name: "name",
        adminId: "admin_id",
        institutionType: "institution_type",
        email: "email",
        password: "password",
        role: "role"
    },
    aliases: {
        username: "adminId"
    },
    passwordField: "password"
});
