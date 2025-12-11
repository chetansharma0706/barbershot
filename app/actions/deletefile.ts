"use server";

import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export async function deleteImageKit(fileId: string) {
  try {
    if (!fileId) {
      throw new Error("fileId is required");
    }

    const res = await imagekit.deleteFile(fileId);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Delete ImageKit error:", error);

    return {
      success: false,
      error: error?.message || "Delete failed",
    };
  }
}
