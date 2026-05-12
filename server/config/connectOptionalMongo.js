const mongoose = require("mongoose");

const connectOptionalMongo = async (mongoUri) => {
    if (process.env.USE_SUPABASE === "true") {
        console.log("Supabase mode enabled - skipping MongoDB connection");
        return false;
    }

    await mongoose.connect(mongoUri);
    return true;
};

module.exports = connectOptionalMongo;
