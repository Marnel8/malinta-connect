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
			transformation: [
				{
					width: 400,
					height: 400,
					crop: "fill",
					gravity: "face",
					quality: "auto",
					format: "auto"
				}
			]
		});

		return { success: true, url: result.secure_url };
	} catch (error) {
		console.error("Good Moral photo upload failed:", error);
		return { success: false, error: "Failed to upload image" };
	}
}

export async function uploadResidentImagesAction(
	images: {
		idPhoto: string;
		selfiePhoto: string;
	}
): Promise<{ 
	success: boolean; 
	idPhotoUrl?: string; 
	selfiePhotoUrl?: string; 
	error?: string 
}> {
	try {
		if (!images.idPhoto || !images.selfiePhoto) {
			return { success: false, error: "Both ID photo and selfie are required" };
		}

		if (typeof images.idPhoto !== "string" || typeof images.selfiePhoto !== "string") {
			return { success: false, error: "Invalid image data format" };
		}

		// Upload ID photo
		const idPhotoResult = await uploadToCloudinary(images.idPhoto, {
			folder: "malinta-connect/residents/id-photos",
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp"],
			tags: ["resident", "id-photo", "verification"],
			transformation: [
				{
					width: 800,
					height: 600,
					crop: "limit",
					quality: "auto",
					format: "auto"
				}
			]
		});

		// Upload selfie photo
		const selfiePhotoResult = await uploadToCloudinary(images.selfiePhoto, {
			folder: "malinta-connect/residents/selfies",
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp"],
			tags: ["resident", "selfie", "verification"],
			transformation: [
				{
					width: 600,
					height: 600,
					crop: "fill",
					gravity: "face",
					quality: "auto",
					format: "auto"
				}
			]
		});

		return { 
			success: true, 
			idPhotoUrl: idPhotoResult.secure_url,
			selfiePhotoUrl: selfiePhotoResult.secure_url
		};
	} catch (error) {
		console.error("Resident images upload failed:", error);
		return { success: false, error: "Failed to upload images" };
	}
}
