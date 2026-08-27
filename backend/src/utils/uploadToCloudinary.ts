import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import cloudinary from "../config/cloudinary.config.js";

interface UploadResult {
  secure_url?: string;
  public_id?: string;
  error?: string;
}

interface DeleteResult {
  success?: boolean;
  error?: string;
}

export const uploadToCloudinary = (file: Buffer): Promise<UploadResult> =>
  new Promise((resolve) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "PennyWise_uploads",
        allowed_formats: ["jpg", "png", "jpeg"],
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          resolve({
            error: error.message,
          });
        }

        resolve({
          secure_url: result?.secure_url,
          public_id: result?.public_id,
        });
      },
    );
    uploadStream.end(file);
  });

export const deleteFromCloudinary = (
  public_id: string,
): Promise<DeleteResult> =>
  new Promise((resolve) => {
    cloudinary.uploader.destroy(
      public_id,
      (error: UploadApiErrorResponse | undefined) => {
        if (error) {
          resolve({
            error: error.message,
          });
        }
        resolve({
          success: true,
        });
      },
    );
  });
