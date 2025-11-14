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
	idFrontPhoto: string;
	idBackPhoto: string;
	selfiePhoto: string;
}): Promise<{
	success: boolean;
	idFrontPhotoUrl?: string;
	idBackPhotoUrl?: string;
	selfiePhotoUrl?: string;
	error?: string;
}> {
	try {
		if (!images.idFrontPhoto || !images.idBackPhoto || !images.selfiePhoto) {
			return {
				success: false,
				error: "Front ID, back ID, and selfie photos are required",
			};
		}

		if (
			typeof images.idFrontPhoto !== "string" ||
			typeof images.idBackPhoto !== "string" ||
			typeof images.selfiePhoto !== "string"
		) {
			return { success: false, error: "Invalid image data format" };
		}

		// Validate that the images are data URLs
		if (
			!images.idFrontPhoto.startsWith("data:image/") ||
			!images.idBackPhoto.startsWith("data:image/") ||
			!images.selfiePhoto.startsWith("data:image/")
		) {
			return {
				success: false,
				error: "Invalid image format. Images must be data URLs.",
			};
		}

		console.log("Starting image upload for resident...");
		console.log("ID Front Photo length:", images.idFrontPhoto.length);
		console.log("ID Back Photo length:", images.idBackPhoto.length);
		console.log("Selfie Photo length:", images.selfiePhoto.length);

		// Upload ID front photo
		console.log("Uploading ID front photo...");
		const idFrontPhotoResult = await uploadToCloudinary(images.idFrontPhoto, {
			folder: "malinta-connect/residents/id-photos/front",
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp"],
			tags: ["resident", "id-photo-front", "verification"],
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
		console.log(
			"ID front photo uploaded successfully:",
			idFrontPhotoResult.secure_url
		);

		// Upload ID back photo
		console.log("Uploading ID back photo...");
		const idBackPhotoResult = await uploadToCloudinary(images.idBackPhoto, {
			folder: "malinta-connect/residents/id-photos/back",
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp"],
			tags: ["resident", "id-photo-back", "verification"],
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
		console.log(
			"ID back photo uploaded successfully:",
			idBackPhotoResult.secure_url
		);

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
			idFrontPhotoUrl: idFrontPhotoResult.secure_url,
			idBackPhotoUrl: idBackPhotoResult.secure_url,
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

export async function uploadBlotterProofImageAction(
	dataUrl: string
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
			folder: "malinta-connect/blotter/proof-images",
			resource_type: "image",
			allowed_formats: ["jpg", "jpeg", "png", "webp"],
			tags: ["blotter", "proof", "evidence"],
			transformation: [
				{
					width: 1200,
					height: 1200,
					crop: "limit",
					quality: "auto",
					format: "auto",
				},
			],
		});

		return { success: true, url: result.secure_url };
	} catch (error) {
		console.error("Blotter proof image upload failed:", error);
		return { success: false, error: "Failed to upload proof image" };
	}
}