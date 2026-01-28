"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFields = exports.uploadSingle = void 0;
const uploadToCloudinary_1 = __importDefault(require("../helpers/uploadToCloudinary"));
const FIELD_FOLDER_MAP = {
    thumbnail: "tours/thumbnail",
    images: "tours/images",
};
const resolveFolder = (req, field) => {
    if (field === "thumbnail" &&
        !req.params?.slugTour &&
        req.originalUrl.includes("/tour_category/")) {
        return "topicTours/thumbnail";
    }
    return FIELD_FOLDER_MAP[field] ?? "others";
};
const asStringArray = (value) => {
    if (value === undefined || value === null)
        return [];
    if (Array.isArray(value))
        return value.filter((x) => typeof x === "string");
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed)
            return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.filter((x) => typeof x === "string");
            }
        }
        catch {
            // ignore
        }
        return [value];
    }
    return [];
};
const uploadSingle = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }
        const field = req.file.fieldname;
        const folder = resolveFolder(req, field);
        const result = await (0, uploadToCloudinary_1.default)(req.file.buffer, {
            folder,
            resourceType: "image",
        });
        req.body[field] = result.url;
        req.body[`${field}PublicId`] = result.publicId;
    }
    catch (error) {
        return next(error);
    }
    next();
};
exports.uploadSingle = uploadSingle;
const uploadFields = async (req, res, next) => {
    if (!req.files) {
        return next();
    }
    const filesByField = req.files;
    const arrayFields = new Set(["images"]);
    for (const key of Object.keys(filesByField)) {
        const files = filesByField[key];
        const shouldBeArray = arrayFields.has(key) || files.length > 1;
        const existingUrls = shouldBeArray ? asStringArray(req.body[key]) : [];
        const existingPublicIds = shouldBeArray
            ? asStringArray(req.body[`${key}PublicIds`])
            : [];
        // Khởi tạo giá trị cho từng field
        if (shouldBeArray) {
            req.body[key] = existingUrls;
            req.body[`${key}PublicIds`] = existingPublicIds;
        }
        for (const file of files) {
            try {
                const folder = resolveFolder(req, key);
                const result = await (0, uploadToCloudinary_1.default)(file.buffer, {
                    folder,
                    resourceType: "image",
                });
                if (shouldBeArray) {
                    req.body[key].push(result.url);
                    req.body[`${key}PublicIds`].push(result.publicId);
                }
                else {
                    req.body[key] = result.url;
                    req.body[`${key}PublicId`] = result.publicId;
                }
            }
            catch (error) {
                return next(error);
            }
        }
    }
    next();
};
exports.uploadFields = uploadFields;
