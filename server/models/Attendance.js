const { createSupabaseModel } = require("../lib/supabaseModel");

module.exports = createSupabaseModel({
    name: "Attendance",
    table: "attendance",
    defaults: {
        status: "Present"
    },
    fields: {
        studentId: "student_id",
        sessionId: "session_id",
        checkInTime: "check_in_time",
        status: "status"
    },
    relations: {
        studentId: { model: () => require("./Student"), localField: "studentId", many: false },
        sessionId: { model: () => require("./Session"), localField: "sessionId", many: false }
    }
});