const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Course",
    table: "courses",
    defaults: {
        institutionType: "college",
        enrolledStudents: []
    },
    timestamps: true,
    fields: {
        teacherId: "teacher_id",
        title: "title",
        code: "code",
        institutionType: "institution_type",
        department: "department",
        year: "year",
        semester: "semester",
        section: "section",
        enrolledStudents: "enrolled_students"
    },
    relations: {
        teacherId: { model: () => require("./Teacher"), localField: "teacherId", many: false },
        enrolledStudents: { model: () => require("./Student"), localField: "enrolledStudents", many: true }
    }
});
