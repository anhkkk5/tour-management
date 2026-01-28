"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Cloudinary configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ??
        process.env.CLOUD_KEY ??
        process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ??
        process.env.CLOUD_SECRET ??
        process.env.API_SECRET,
});
const streamUpload = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: options?.folder,
            resource_type: options?.resourceType ?? "auto",
        }, (error, result) => {
            if (result) {
                resolve(result);
            }
            else {
                reject(error);
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
};
const uploadToCloudinary = async (buffer, options) => {
    const result = await streamUpload(buffer, options);
    return {
        url: (result.secure_url ?? result.url),
        publicId: result.public_id,
    };
};
const deleteFromCloudinary = async (publicId) => {
    if (!publicId)
        return;
    await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: "image" });
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = uploadToCloudinary;
