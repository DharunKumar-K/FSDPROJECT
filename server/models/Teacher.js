const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Teacher",
    table: "teachers",
    defaults: {
        institutionType: "college",
        role: "teacher",
        subjects: []
    },
    fields: {
        name: "name",
        teacherId: "teacher_id",
        institutionType: "institution_type",
        department: "department",
        subject: "subject",
        subjects: "subjects",
        email: "email",
        password: "password",
        role: "role"
    },
    aliases: {
        username: "teacherId"
    },
    passwordField: "password"
});
