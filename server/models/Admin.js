const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const useSupabase = process.env.USE_SUPABASE === "true";

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (candidate, hash) => {
    return await bcrypt.compare(candidate, hash);
};

if (useSupabase) {
    const { getSupabaseClient } = require("../config/supabase");
    const supabase = getSupabaseClient();
    const ADMIN_TABLE = "admins";

    const mapRowToAdmin = (row) => {
        if (!row) return null;

        const admin = new AdminRecord({
            id: row.id,
            _id: row.id,
            name: row.name,
            adminId: row.admin_id,
            institutionType: row.institution_type,
            email: row.email,
            password: row.password,
            role: row.role || "admin"
        });

        return admin;
    };

    class AdminRecord {
        constructor(data = {}) {
            Object.assign(this, data);
            if (!this._id && this.id) {
                this._id = this.id;
            }
        }

        async comparePassword(candidatePassword) {
            return comparePassword(candidatePassword, this.password);
        }

        async save() {
            const payload = {
                name: this.name,
                admin_id: this.adminId,
                institution_type: this.institutionType,
                email: this.email,
                password: await hashPassword(this.password),
                role: this.role || "admin"
            };

            const { data, error } = await supabase
                .from(ADMIN_TABLE)
                .insert(payload)
                .select("*")
                .single();

            if (error) {
                throw new Error(error.message);
            }

            Object.assign(this, mapRowToAdmin(data));
            return this;
        }

        static async findOne(query) {
            let builder = supabase.from(ADMIN_TABLE).select("*");

            if (query?.adminId) {
                builder = builder.eq("admin_id", query.adminId);
            } else if (query?.email) {
                builder = builder.eq("email", query.email);
            } else if (query?.$or?.length) {
                const conditions = [];
                for (const clause of query.$or) {
                    if (clause.adminId) {
                        conditions.push(`admin_id.eq.${clause.adminId}`);
                    }
                    if (clause.email) {
                        conditions.push(`email.eq.${clause.email}`);
                    }
                }

                if (!conditions.length) {
                    return null;
                }

                const { data, error } = await supabase
                    .from(ADMIN_TABLE)
                    .select("*")
                    .or(conditions.join(","))
                    .limit(1);

                if (error || !data || !data.length) {
                    return null;
                }

                return mapRowToAdmin(data[0]);
            } else {
                return null;
            }

            const { data, error } = await builder.limit(1);
            if (error || !data || !data.length) {
                return null;
            }

            return mapRowToAdmin(data[0]);
        }
    }

    module.exports = AdminRecord;
    return;
}

const AdminSchema = new mongoose.Schema({
    name: String,
    adminId: String,
    institutionType: {
        type: String,
        enum: ["school", "college"]
    },
    email: String,
    password: String,
    role: {
        type: String,
        default: "admin"
    }
});

// Hash password before saving
AdminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await hashPassword(this.password);
});

// Method to compare password for login
AdminSchema.methods.comparePassword = async function (candidatePassword) {
    return await comparePassword(candidatePassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
