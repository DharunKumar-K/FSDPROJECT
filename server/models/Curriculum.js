const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Curriculum",
    table: "curriculum",
    timestamps: true,
    fields: {
        institutionType: "institution_type",
        class: "class",
        subject: "subject",
        department: "department",
        year: "year",
        semester: "semester",
        courseCode: "course_code",
        courseName: "course_name",
        units: "units",
        teacher: "teacher_id"
    },
    relations: {
        teacher: { model: () => require("./Teacher"), localField: "teacher", many: false }
    }
});
