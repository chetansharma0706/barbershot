"use server";

import { getUploadAuthParams } from "@imagekit/next/server";

export async function getImagekitAuth() {
  try {
    // Debug logs (remove in prod)
    console.log("🔍 Checking env variables...");
    console.log("Public Key exists:", !!process.env.IMAGEKIT_PUBLIC_KEY);
    console.log("Private Key exists:", !!process.env.IMAGEKIT_PRIVATE_KEY);

    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error("❌ Missing IMAGEKIT_PRIVATE_KEY");
      throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");
    }

    if (!process.env.IMAGEKIT_PUBLIC_KEY) {
      console.error("❌ Missing IMAGEKIT_PUBLIC_KEY");
      throw new Error("IMAGEKIT_PUBLIC_KEY is not configured");
    }

    console.log("🔄 Generating auth params...");

    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });

    console.log("✅ Auth params generated successfully.");

    return {
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    };
  } catch (error) {
    console.error("❌ ImageKit auth error:", error);

    return {
      error: "Failed to generate ImageKit auth params",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
