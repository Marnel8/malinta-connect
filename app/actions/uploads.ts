"use server";

import { uploadToCloudinary } from "@/cloudinary/cloudinary";

export async function uploadGoodMoralPhotoAction(
	dataUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> {
	try {
		if (!dataUrl || typeof dataUrl !== "string") {
			return { success: false, error: "Invalid image data" };
		}

		const result = await uploadToCloudinary(dataUrl, {
			folder: "malinta-connect/certificates/good-moral",
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp"],
			tags: ["certificate", "good-moral", "1x1"],
		});

		return { success: true, url: result.secure_url };
	} catch (error) {
		console.error("Good Moral photo upload failed:", error);
		return { success: false, error: "Failed to upload image" };
	}
}
