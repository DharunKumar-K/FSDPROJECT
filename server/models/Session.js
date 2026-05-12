const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Session",
    table: "sessions",
    defaults: {
        isActive: true
    },
    timestamps: true,
    fields: {
        courseId: "course_id",
        date: "date",
        topic: "topic",
        sessionCode: "session_code",
        qrCodeString: "qr_code_string",
        isActive: "is_active"
    },
    relations: {
        courseId: { model: () => require("./Course"), localField: "courseId", many: false }
    }
});
