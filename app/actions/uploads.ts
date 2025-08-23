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
					format: "auto",
				},
			],
		});

		return { success: true, url: result.secure_url };
	} catch (error) {
		console.error("Good Moral photo upload failed:", error);
		return { success: false, error: "Failed to upload image" };
	}
}

export async function uploadResidentImagesAction(images: {
	idPhoto: string;
	selfiePhoto: string;
}): Promise<{
	success: boolean;
	idPhotoUrl?: string;
	selfiePhotoUrl?: string;
	error?: string;
}> {
	try {
		if (!images.idPhoto || !images.selfiePhoto) {
			return { success: false, error: "Both ID photo and selfie are required" };
		}

		if (
			typeof images.idPhoto !== "string" ||
			typeof images.selfiePhoto !== "string"
		) {
			return { success: false, error: "Invalid image data format" };
		}

		// Validate that the images are data URLs
		if (
			!images.idPhoto.startsWith("data:image/") ||
			!images.selfiePhoto.startsWith("data:image/")
		) {
			return {
				success: false,
				error: "Invalid image format. Images must be data URLs.",
			};
		}

		console.log("Starting image upload for resident...");
		console.log("ID Photo length:", images.idPhoto.length);
		console.log("Selfie Photo length:", images.selfiePhoto.length);

		// Upload ID photo
		console.log("Uploading ID photo...");
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
					format: "auto",
				},
			],
		});
		console.log("ID photo uploaded successfully:", idPhotoResult.secure_url);

		// Upload selfie photo
		console.log("Uploading selfie photo...");
		const selfiePhotoResult = await uploadToCloudinary(images.selfiePhoto, {
			folder: "malinta-connect/residents/selfies",
			resource_type: "image",
			tags: ["resident", "selfie", "verification"],
			transformation: [
				{
					width: 600,
					height: 600,
					crop: "fill",
					gravity: "face",
					quality: "auto",
					format: "auto",
				},
			],
		});
		console.log(
			"Selfie photo uploaded successfully:",
			selfiePhotoResult.secure_url
		);

		return {
			success: true,
			idPhotoUrl: idPhotoResult.secure_url,
			selfiePhotoUrl: selfiePhotoResult.secure_url,
		};
	} catch (error) {
		console.error("Resident images upload failed:", error);

		// Provide more specific error messages
		let errorMessage = "Failed to upload images";
		if (error instanceof Error) {
			if (error.message.includes("Cloudinary configuration error")) {
				errorMessage =
					"Image upload service is not configured. Please contact support.";
			} else if (error.message.includes("Invalid file format")) {
				errorMessage =
					"One or more images have an invalid format. Please use JPG, PNG, or WebP.";
			} else if (error.message.includes("File too large")) {
				errorMessage =
					"One or more images are too large. Please compress them and try again.";
			} else {
				errorMessage = error.message;
			}
		}

		return { success: false, error: errorMessage };
	}
}

export async function uploadAvatarAction(
	dataUrl: string,
	uid: string
): Promise<{ success: boolean; url?: string; error?: string }> {
	try {
		if (!dataUrl || typeof dataUrl !== "string") {
			return { success: false, error: "Invalid image data" };
		}

		// Validate that the image is a data URL
		if (!dataUrl.startsWith("data:image/")) {
			return {
				success: false,
				error: "Invalid image format. Image must be a data URL.",
			};
		}

		const result = await uploadToCloudinary(dataUrl, {
			folder: `malinta-connect/users/${uid}/avatars`,
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp"],
			tags: ["user", "avatar", "profile"],
			transformation: [
				{
					width: 400,
					height: 400,
					crop: "fill",
					gravity: "face",
					quality: "auto",
					format: "auto",
				},
			],
		});

		return { success: true, url: result.secure_url };
	} catch (error) {
		console.error("Avatar upload failed:", error);
		return { success: false, error: "Failed to upload avatar" };
	}
}
