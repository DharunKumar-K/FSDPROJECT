const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { getSupabaseClient } = require("../config/supabase");

const supabase = () => getSupabaseClient();

const isPlainObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);

const toStringValue = (value) => {
    if (value && typeof value === "object") {
        if (typeof value.toJSON === "function") {
            const jsonValue = value.toJSON();
            if (jsonValue !== value) return toStringValue(jsonValue);
        }
        if (typeof value.valueOf === "function") {
            const primitive = value.valueOf();
            if (primitive !== value) return toStringValue(primitive);
        }
        if ("value" in value) {
            return toStringValue(value.value);
        }
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (value === null || value === undefined) {
        return value;
    }

    return String(value);
};

const makeId = (value) => {
    const idValue = toStringValue(value || crypto.randomUUID());
    return {
        value: idValue,
        toString() {
            return this.value;
        },
        valueOf() {
            return this.value;
        },
        toJSON() {
            return this.value;
        },
        equals(other) {
            return toStringValue(other) === this.value;
        }
    };
};

const cloneDeep = (value) => {
    if (value instanceof Date) {
        return new Date(value.getTime());
    }

    if (value && typeof value === "object" && typeof value.equals === "function" && typeof value.toJSON === "function") {
        return value.toJSON();
    }

    if (Array.isArray(value)) {
        return value.map(cloneDeep);
    }

    if (value && typeof value === "object") {
        if (typeof value.toJSON === "function" && Object.keys(value).length === 0) {
            return cloneDeep(value.toJSON());
        }

        const result = {};
        for (const [key, entry] of Object.entries(value)) {
            result[key] = cloneDeep(entry);
        }
        return result;
    }

    return value;
};

const getByPath = (object, path) => {
    if (!path) return object;
    return path.split(".").reduce((current, key) => (current == null ? undefined : current[key]), object);
};

const setByPath = (object, path, value) => {
    const parts = path.split(".");
    let current = object;

    for (let index = 0; index < parts.length - 1; index += 1) {
        const key = parts[index];
        if (current[key] == null) {
            current[key] = {};
        }
        current = current[key];
    }

    current[parts[parts.length - 1]] = value;
};

const normalizeComparable = (value) => {
    if (value && typeof value === "object") {
        if (typeof value.equals === "function" && typeof value.toString === "function") {
            return value.toString();
        }
        if (typeof value.toJSON === "function") {
            const jsonValue = value.toJSON();
            if (jsonValue !== value) return normalizeComparable(jsonValue);
        }
        if (typeof value.valueOf === "function") {
            const primitive = value.valueOf();
            if (primitive !== value) return normalizeComparable(primitive);
        }
        if ("value" in value) {
            return normalizeComparable(value.value);
        }
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    return value;
};

const equalValues = (left, right) => {
    const normalizedLeft = normalizeComparable(left);
    const normalizedRight = normalizeComparable(right);

    if (Array.isArray(normalizedLeft)) {
        return normalizedLeft.some((entry) => equalValues(entry, normalizedRight));
    }

    if (Array.isArray(normalizedRight)) {
        return normalizedRight.some((entry) => equalValues(normalizedLeft, entry));
    }

    return String(normalizedLeft) === String(normalizedRight);
};

const matchesValue = (actual, expected, record) => {
    if (isPlainObject(expected)) {
        if (Object.prototype.hasOwnProperty.call(expected, "$in")) {
            return expected.$in.some((value) => equalValues(actual, value));
        }
        if (Object.prototype.hasOwnProperty.call(expected, "$ne")) {
            return !equalValues(actual, expected.$ne);
        }
        if (Object.prototype.hasOwnProperty.call(expected, "$eq")) {
            return equalValues(actual, expected.$eq);
        }
        if (Object.prototype.hasOwnProperty.call(expected, "$exists")) {
            const exists = actual !== undefined && actual !== null;
            return expected.$exists ? exists : !exists;
        }
        if (Object.prototype.hasOwnProperty.call(expected, "$or")) {
            return expected.$or.some((clause) => matchesQuery(record, clause));
        }
        // Fallback: shallow comparison for direct object equality.
        return JSON.stringify(normalizeComparable(actual)) === JSON.stringify(normalizeComparable(expected));
    }

    if (Array.isArray(actual)) {
        return actual.some((entry) => equalValues(entry, expected));
    }

    return equalValues(actual, expected);
};

const matchesQuery = (record, query = {}) => {
    if (!query || !Object.keys(query).length) return true;

    if (Array.isArray(query.$or)) {
        const orMatches = query.$or.some((clause) => matchesQuery(record, clause));
        if (!orMatches) return false;
    }

    return Object.entries(query).every(([key, expected]) => {
        if (key === "$or") return true;
        const actual = key === "_id" ? record._id : getByPath(record, key);
        return matchesValue(actual, expected, record);
    });
};

const parseSelect = (select) => {
    if (!select) return null;
    if (Array.isArray(select)) return select;
    if (typeof select === "string") {
        return select
            .split(/\s+/)
            .map((part) => part.trim())
            .filter(Boolean);
    }
    return null;
};

const applySelect = (record, select) => {
    const fields = parseSelect(select);
    if (!fields || !fields.length) {
        return record;
    }

    const hasExclusions = fields.some((field) => field.startsWith("-"));
    const clone = cloneDeep(record);

    if (hasExclusions) {
        for (const field of fields) {
            if (!field.startsWith("-")) continue;
            const key = field.slice(1);
            delete clone[key];
            if (key === "_id") delete clone._id;
        }
        return clone;
    }

    const selected = {};
    for (const field of fields) {
        const value = getByPath(clone, field);
        if (value !== undefined) {
            setByPath(selected, field, value);
        }
    }

    if (!fields.includes("_id") && clone._id !== undefined) {
        selected._id = clone._id;
    }

    return selected;
};

const applySort = (records, sortSpec) => {
    if (!sortSpec || (typeof sortSpec === "object" && !Object.keys(sortSpec).length)) {
        return records;
    }

    const sortEntries = typeof sortSpec === "string"
        ? [[sortSpec, 1]]
        : Object.entries(sortSpec);

    return records.slice().sort((left, right) => {
        for (const [field, direction] of sortEntries) {
            const leftValue = normalizeComparable(getByPath(left, field));
            const rightValue = normalizeComparable(getByPath(right, field));

            if (leftValue === rightValue) continue;

            const comparison = leftValue > rightValue ? 1 : -1;
            return direction === -1 ? -comparison : comparison;
        }
        return 0;
    });
};

const applyUpdateDocument = (record, filter, update) => {
    const next = cloneDeep(record);
    const operations = update && update.$set ? update.$set : update;

    for (const [path, value] of Object.entries(operations || {})) {
        if (path.includes(".$.")) {
            const [arrayPath, nestedPath] = path.split(".$.");
            const matchField = `${arrayPath}.unit`;
            const matchValue = getByPath(filter, matchField);
            const targetArray = getByPath(next, arrayPath);
            if (Array.isArray(targetArray)) {
                const targetItem = targetArray.find((item) => equalValues(item.unit, matchValue));
                if (targetItem) {
                    setByPath(targetItem, nestedPath, value);
                }
            }
            continue;
        }

        if (path.includes(".")) {
            setByPath(next, path, value);
        } else {
            next[path] = value;
        }
    }

    return next;
};

const buildRow = (record, fields, aliases, passwordField) => {
    const row = {};
    const plain = cloneDeep(record);

    for (const [jsField, dbField] of Object.entries(fields)) {
        if (jsField === "_id" || jsField === "id") continue;
        const value = plain[jsField];
        if (value !== undefined) {
            row[dbField] = cloneDeep(value);
        }
    }

    for (const [alias, target] of Object.entries(aliases)) {
        if (plain[alias] !== undefined && row[fields[target]] === undefined) {
            row[fields[target]] = cloneDeep(plain[alias]);
        }
    }

    if (passwordField && plain[passwordField] !== undefined) {
        row[fields[passwordField]] = plain[passwordField];
    }

    if (plain._id) {
        row.id = toStringValue(plain._id);
    } else if (plain.id) {
        row.id = toStringValue(plain.id);
    }

    return row;
};

const buildRecord = (row, fields, aliases, timestamps, passwordField) => {
    const record = {};
    const normalizedRow = cloneDeep(row);

    for (const [jsField, dbField] of Object.entries(fields)) {
        if (dbField in normalizedRow) {
            let val = normalizedRow[dbField];
            // Supabase may return jsonb columns as strings — parse them
            if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
                try { val = JSON.parse(val); } catch (_) {}
            }
            record[jsField] = cloneDeep(val);
        }
    }

    for (const [alias, target] of Object.entries(aliases)) {
        if (record[target] !== undefined && record[alias] === undefined) {
            record[alias] = cloneDeep(record[target]);
        }
    }

    if (normalizedRow.id !== undefined) {
        record.id = makeId(normalizedRow.id);
        record._id = makeId(normalizedRow.id);
    }

    if (timestamps) {
        if (normalizedRow.created_at !== undefined) {
            record.createdAt = cloneDeep(normalizedRow.created_at);
        }
        if (normalizedRow.updated_at !== undefined) {
            record.updatedAt = cloneDeep(normalizedRow.updated_at);
        }
    }

    if (passwordField && record[passwordField] === undefined && normalizedRow[fields[passwordField]] !== undefined) {
        record[passwordField] = normalizedRow[fields[passwordField]];
    }

    record.__isPersisted = true;
    record.__originalPassword = passwordField ? record[passwordField] : undefined;
    return record;
};

const createSupabaseModel = (config) => {
    const {
        table,
        fields,
        aliases = {},
        defaults = {},
        passwordField = null,
        relations = {},
        timestamps = false,
        name = "Record"
    } = config;

    const fieldMap = { ...fields };
    const aliasMap = { ...aliases };

    const normalizeInput = (input = {}) => {
        const normalized = {};
        for (const [key, value] of Object.entries(input || {})) {
            if (key.startsWith("__")) continue;
            const canonicalKey = aliasMap[key] || key;
            normalized[canonicalKey] = value;
        }
        return normalized;
    };

    class SupabaseQuery {
        constructor(model, query = {}, projection = null, single = false) {
            this.model = model;
            this.query = normalizeInput(query);
            this.projection = projection;
            this.single = single;
            this.sortSpec = null;
            this.limitCount = null;
            this.populateSpecs = [];
        }

        select(projection) {
            this.projection = projection;
            return this;
        }

        sort(spec) {
            this.sortSpec = spec;
            return this;
        }

        limit(count) {
            this.limitCount = count;
            return this;
        }

        populate(pathOrSpec, select) {
            if (typeof pathOrSpec === "string") {
                this.populateSpecs.push({ path: pathOrSpec, select: typeof select === "string" ? select : undefined });
            } else if (isPlainObject(pathOrSpec)) {
                this.populateSpecs.push(pathOrSpec);
            }
            return this;
        }

        async exec() {
            const rows = await fetchRows(this.query);
            let records = rows.map((row) => hydrate(row)).filter((record) => matchesQuery(record, this.query));
            records = applySort(records, this.sortSpec);
            if (typeof this.limitCount === "number") {
                records = records.slice(0, this.limitCount);
            }
            if (this.populateSpecs.length) {
                records = await applyRelations(records, this.populateSpecs);
            }
            if (this.projection) {
                records = records.map((record) => applySelect(record, this.projection));
            }
            if (this.single) {
                return records[0] || null;
            }
            return records;
        }

        then(resolve, reject) {
            return this.exec().then(resolve, reject);
        }

        catch(reject) {
            return this.exec().catch(reject);
        }

        finally(handler) {
            return this.exec().finally(handler);
        }
    }

    class SupabaseRecord {
        constructor(data = {}) {
            const normalized = normalizeInput({ ...defaults, ...cloneDeep(data) });
            Object.assign(this, normalized);
            if (this._id) {
                this._id = makeId(this._id);
                this.id = this._id;
            } else if (this.id) {
                this._id = makeId(this.id);
                this.id = this._id;
            }
            this.__isPersisted = Boolean(normalized._id || normalized.id);
            if (passwordField && this[passwordField] !== undefined) {
                this.__originalPassword = this[passwordField];
            }
        }

        async comparePassword(candidatePassword) {
            if (!passwordField) {
                throw new Error(`${name} does not support password comparison`);
            }
            if (!this[passwordField]) return false;
            return bcrypt.compare(candidatePassword, this[passwordField]);
        }

        async save() {
            const row = buildRow(this, fieldMap, aliasMap, passwordField);
            if (timestamps) {
                const now = new Date().toISOString();
                if (!row.created_at && !this.__isPersisted) {
                    row.created_at = now;
                }
                row.updated_at = now;
            }

            if (passwordField && this[passwordField] !== undefined) {
                const currentPassword = this[passwordField];
                const originalPassword = this.__originalPassword;
                const passwordLooksHashed = typeof currentPassword === "string" && currentPassword.startsWith("$2");
                if (!passwordLooksHashed || currentPassword !== originalPassword) {
                    const salt = await bcrypt.genSalt(10);
                    row[fieldMap[passwordField]] = await bcrypt.hash(currentPassword, salt);
                    this[passwordField] = row[fieldMap[passwordField]];
                }
            }

            if (!row.id) {
                row.id = toStringValue(this._id || crypto.randomUUID());
            }

            const { data, error } = await supabase().from(table).upsert(row, { onConflict: "id" }).select("*").single();
            if (error) {
                throw new Error(error.message);
            }

            const next = hydrate(data);
            Object.assign(this, next);
            this.__isPersisted = true;
            if (passwordField) {
                this.__originalPassword = this[passwordField];
            }
            return this;
        }

        toJSON() {
            const plain = cloneDeep(this);
            if (plain._id && typeof plain._id.toJSON === "function") {
                plain._id = plain._id.toJSON();
            }
            if (plain.id && typeof plain.id.toJSON === "function") {
                plain.id = plain.id.toJSON();
            }
            delete plain.__isPersisted;
            delete plain.__originalPassword;
            return plain;
        }

        static create(doc) {
            return new this(doc).save();
        }

        static find(query = {}, projection = null) {
            return new SupabaseQuery(this, query, projection, false);
        }

        static findOne(query = {}, projection = null) {
            return new SupabaseQuery(this, query, projection, true);
        }

        static findById(id, projection = null) {
            return new SupabaseQuery(this, { _id: id }, projection, true);
        }

        static async countDocuments(query = {}) {
            const rows = await fetchRows(normalizeInput(query));
            return rows
                .map((row) => hydrate(row))
                .filter((record) => matchesQuery(record, normalizeInput(query)))
                .length;
        }

        static async findByIdAndDelete(id) {
            const idStr = toStringValue(id);
            const { data, error } = await supabase().from(table).delete().eq("id", idStr).select("*").single();
            if (error) return null;
            return data ? hydrate(data) : null;
        }

        static async deleteMany(query = {}) {
            const rows = await fetchRows(normalizeInput(query));
            const matches = rows
                .map((row) => hydrate(row))
                .filter((record) => matchesQuery(record, normalizeInput(query)));

            for (const record of matches) {
                await supabase().from(table).delete().eq("id", toStringValue(record._id || record.id));
            }

            return { deletedCount: matches.length };
        }

        static async insertMany(documents = []) {
            const created = [];
            for (const document of documents) {
                created.push(await new this(document).save());
            }
            return created;
        }

        static async findOneAndUpdate(filter = {}, update = {}, options = {}) {
            const rows = await fetchRows(normalizeInput(filter));
            const normalizedFilter = normalizeInput(filter);
            const row = rows.find((entry) => matchesQuery(hydrate(entry), normalizedFilter));
            if (!row) {
                return null;
            }

            const updated = applyUpdateDocument(hydrate(row), normalizedFilter, update);
            const saved = await new this(updated).save();
            return options.new === false ? hydrate(row) : saved;
        }

        static async updateOne(filter = {}, update = {}) {
            const updated = await this.findOneAndUpdate(filter, update, { new: true });
            return { acknowledged: Boolean(updated), modifiedCount: updated ? 1 : 0 };
        }

        static async createIndexes() {
            return true;
        }
    }

    const hydrate = (row) => {
        const recordData = buildRecord(row, fieldMap, aliasMap, timestamps, passwordField);
        const record = new SupabaseRecord(recordData);
        record.__isPersisted = true;
        if (passwordField && record[passwordField] !== undefined) {
            record.__originalPassword = record[passwordField];
        }
        Object.defineProperty(record, "constructorName", { value: name, enumerable: false, configurable: true });
        return record;
    };

    const applyRelations = async (records, populateSpecs) => {
        if (!populateSpecs || !populateSpecs.length) return records;

        const isArray = Array.isArray(records);
        const list = isArray ? records : [records];

        for (const spec of populateSpecs) {
            const relation = relations[spec.path];
            if (!relation) continue;

            const relationModel = relation.model();
            const localField = relation.localField || spec.path;

            if (relation.many) {
                // Collect all IDs across all records, batch-fetch once
                const allIds = [];
                for (const rec of list) {
                    const raw = getByPath(rec, localField);
                    if (raw == null) continue;
                    const ids = Array.isArray(raw) ? raw : [raw];
                    ids.forEach(id => allIds.push(toStringValue(id)));
                }
                const uniqueIds = [...new Set(allIds)];
                let relatedQuery = relationModel.find({ _id: { $in: uniqueIds } });
                if (spec.select) relatedQuery = relatedQuery.select(spec.select);
                if (spec.populate) relatedQuery = relatedQuery.populate(spec.populate);
                let relatedDocs = await relatedQuery;
                if (!Array.isArray(relatedDocs)) relatedDocs = relatedDocs ? [relatedDocs] : [];
                const byId = new Map(relatedDocs.map(d => [toStringValue(d._id), d]));

                for (const rec of list) {
                    const raw = getByPath(rec, localField);
                    if (raw == null) { setByPath(rec, spec.path, []); continue; }
                    const ids = Array.isArray(raw) ? raw : [raw];
                    let docs = ids.map(id => byId.get(toStringValue(id))).filter(Boolean);
                    if (spec.match) docs = docs.filter(d => matchesQuery(d, spec.match));
                    setByPath(rec, spec.path, docs);
                }
            } else {
                // Collect all unique IDs, batch-fetch once
                const allIds = [];
                for (const rec of list) {
                    const raw = getByPath(rec, localField);
                    if (raw != null) allIds.push(toStringValue(raw));
                }
                const uniqueIds = [...new Set(allIds)];
                if (!uniqueIds.length) {
                    list.forEach(rec => setByPath(rec, spec.path, null));
                    continue;
                }
                let relatedQuery = relationModel.find({ _id: { $in: uniqueIds } });
                if (spec.select) relatedQuery = relatedQuery.select(spec.select);
                if (spec.populate) relatedQuery = relatedQuery.populate(spec.populate);
                let relatedDocs = await relatedQuery;
                if (!Array.isArray(relatedDocs)) relatedDocs = relatedDocs ? [relatedDocs] : [];
                const byId = new Map(relatedDocs.map(d => [toStringValue(d._id), d]));

                for (const rec of list) {
                    const raw = getByPath(rec, localField);
                    if (raw == null) { setByPath(rec, spec.path, null); continue; }
                    const match = byId.get(toStringValue(raw)) || null;
                    setByPath(rec, spec.path, match);
                }
            }
        }

        return isArray ? list : list[0];
    };

    const buildSupabaseFilter = (query, builder) => {
        const normalized = normalizeInput(query);
        for (const [key, expected] of Object.entries(normalized)) {
            if (key === "$or") continue;
            const dbField = key === "_id" ? "id" : (fieldMap[key] || key);
            if (isPlainObject(expected)) {
                if ("$in" in expected) {
                    const vals = expected.$in.map(v => toStringValue(v));
                    builder = builder.in(dbField, vals);
                } else if ("$ne" in expected) {
                    builder = builder.neq(dbField, toStringValue(expected.$ne));
                } else if ("$eq" in expected) {
                    builder = builder.eq(dbField, toStringValue(expected.$eq));
                }
            } else if (Array.isArray(expected)) {
                builder = builder.in(dbField, expected.map(v => toStringValue(v)));
            } else if (expected !== undefined && expected !== null) {
                builder = builder.eq(dbField, toStringValue(expected));
            }
        }
        return builder;
    };

    const fetchRows = async (query = {}) => {
        let builder = supabase().from(table).select("*");
        builder = buildSupabaseFilter(query, builder);
        const { data, error } = await builder;
        if (error) {
            throw new Error(error.message);
        }
        return data || [];
    };

    return SupabaseRecord;
};

module.exports = {
    createSupabaseModel,
    makeId,
    toStringValue,
    normalizeComparable,
    matchesQuery
};
