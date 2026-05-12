const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Student",
    table: "students",
    defaults: {
        institutionType: "college",
        role: "student"
    },
    fields: {
        name: "name",
        registerNo: "register_no",
        institutionType: "institution_type",
        department: "department",
        year: "year",
        semester: "semester",
        email: "email",
        password: "password",
        role: "role"
    },
    aliases: {
        username: "registerNo"
    },
    passwordField: "password"
});