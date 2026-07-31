import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  // Graceful fallback to local disk storage
  console.warn("Cloudinary configuration missing in .env.local. Falling back to public/uploads/ local directory.");
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "gizmogrid_products"
): Promise<UploadResult> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed"));
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        )
        .end(fileBuffer);
    });
  }

  // Option B: Restrict local disk fallback to development mode only (never triggered in production)
  if (process.env.NODE_ENV === "production") {
    console.error("CRITICAL: Cloudinary credentials missing in production. Ephemeral disk storage is disabled to prevent image link breaking.");
    throw new Error("Cloudinary credentials are required in production. Local file fallback is restricted to development mode to prevent data loss on serverless/ephemeral environments.");
  }

  // Fallback: Store locally
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(fileName) || ".png";
    const baseName = path.basename(fileName, fileExt).replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const uniqueName = `${baseName}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, fileBuffer);

    return {
      url: `/uploads/${uniqueName}`,
      publicId: `local_${uniqueName.split(".")[0]}`,
    };
  } catch (err) {
    console.error("Local upload fallback execution failed:", err);
    throw new Error("Failed to upload image locally");
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (isCloudinaryConfigured && !publicId.startsWith("local_")) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (err) {
      console.error("Cloudinary delete asset call error:", err);
      return false;
    }
  }

  // Fallback: Delete from local disk
  if (publicId.startsWith("local_")) {
    try {
      const filename = publicId.replace("local_", "");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        const match = files.find((f) => f.startsWith(filename));
        if (match) {
          fs.unlinkSync(path.join(uploadDir, match));
          return true;
        }
      }
    } catch (err) {
      console.error("Local file delete call error:", err);
    }
  }

  return true;
}
