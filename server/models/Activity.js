const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Activity",
    table: "activities",
    defaults: {
        type: "Assignment",
        maxScore: 100
    },
    fields: {
        courseId: "course_id",
        studentId: "student_id",
        title: "title",
        description: "description",
        type: "type",
        deadline: "deadline",
        maxScore: "max_score"
    },
    relations: {
        courseId: { model: () => require("./Course"), localField: "courseId", many: false }
    }
});