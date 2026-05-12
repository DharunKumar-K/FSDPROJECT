const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Submission",
    table: "submissions",
    defaults: {
        score: null
    },
    timestamps: true,
    fields: {
        activityId: "activity_id",
        studentId: "student_id",
        fileUrl: "file_url",
        notes: "notes",
        score: "score",
        status: "status"
    },
    relations: {
        activityId: { model: () => require("./Activity"), localField: "activityId", many: false },
        studentId: { model: () => require("./Student"), localField: "studentId", many: false }
    }
});
