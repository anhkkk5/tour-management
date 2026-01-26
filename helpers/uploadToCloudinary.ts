import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ??
    process.env.CLOUD_KEY ??
    process.env.API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET ??
    process.env.CLOUD_SECRET ??
    process.env.API_SECRET,
});

// Extend Express Request type to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>;
}

type UploadToCloudinaryOptions = {
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
};

const streamUpload = (
  buffer: Buffer,
  options?: UploadToCloudinaryOptions,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder,
        resource_type: options?.resourceType ?? "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const uploadToCloudinary = async (
  buffer: Buffer,
  options?: UploadToCloudinaryOptions,
): Promise<{ url: string; publicId: string }> => {
  const result: UploadApiResponse = await streamUpload(buffer, options);
  return {
    url: (result.secure_url ?? result.url) as string,
    publicId: result.public_id,
  };
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

export default uploadToCloudinary;
