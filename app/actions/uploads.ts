"use server";

import { uploadToCloudinary } from "@/cloudinary/cloudinary";

// Helper function to get image dimensions from data URL
async function getImageDimensions(
	dataUrl: string
): Promise<{ width: number; height: number } | null> {
	try {
		// Extract base64 data from data URL
		const base64Data = dataUrl.split(",")[1];
		if (!base64Data) return null;

		const buffer = Buffer.from(base64Data, "base64");

		// Check for PNG signature (89 50 4E 47)
		if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
			// PNG: width and height are at bytes 16-23
			const width = buffer.readUInt32BE(16);
			const height = buffer.readUInt32BE(20);
			return { width, height };
		}

		// Check for JPEG signature (FF D8)
		if (buffer[0] === 0xff && buffer[1] === 0xd8) {
			let offset = 2;
			while (offset < buffer.length) {
				// Find SOF marker (0xFFC0, 0xFFC1, 0xFFC2, etc.)
				if (buffer[offset] === 0xff && buffer[offset + 1] >= 0xc0 && buffer[offset + 1] <= 0xc3) {
					const height = buffer.readUInt16BE(offset + 5);
					const width = buffer.readUInt16BE(offset + 7);
					return { width, height };
				}
				// Skip to next marker
				const segmentLength = buffer.readUInt16BE(offset + 2);
				offset += 2 + segmentLength;
				if (offset >= buffer.length) break;
			}
		}

		// Check for WebP signature (RIFF...WEBP)
		if (
			buffer[0] === 0x52 &&
			buffer[1] === 0x49 &&
			buffer[2] === 0x46 &&
			buffer[3] === 0x46 &&
			buffer[8] === 0x57 &&
			buffer[9] === 0x45 &&
			buffer[10] === 0x42 &&
			buffer[11] === 0x50
		) {
			// Look for VP8 or VP8L chunk
			let offset = 12;
			while (offset < buffer.length - 8) {
				const chunkType = buffer.toString("ascii", offset, offset + 4);
				if (chunkType === "VP8 ") {
					// VP8 format
					const width = buffer.readUInt16LE(offset + 10) & 0x3fff;
					const height = buffer.readUInt16LE(offset + 12) & 0x3fff;
					return { width, height };
				} else if (chunkType === "VP8L") {
					// VP8L format
					const bits = buffer.readUInt32LE(offset + 5);
					const width = (bits & 0x3fff) + 1;
					const height = ((bits >> 14) & 0x3fff) + 1;
					return { width, height };
				}
				const chunkSize = buffer.readUInt32LE(offset + 4);
				offset += 8 + chunkSize + (chunkSize % 2);
			}
		}

		return null;
	} catch (error) {
		console.error("Error reading image dimensions:", error);
		return null;
	}
}

export async function uploadGoodMoralPhotoAction(
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

		// Server-side validation: Check if image can be resized to 1x1
		const dimensions = await getImageDimensions(dataUrl);
		if (dimensions) {
			const { width, height } = dimensions;
			const aspectRatio = width / height;
			const minDimension = Math.min(width, height);

			// Accept images that can be resized: aspect ratio 0.5-2.0, min 200px on shortest side
			if (aspectRatio < 0.5 || aspectRatio > 2.0 || minDimension < 200) {
				return {
					success: false,
					error: `Image cannot be resized to 1x1. Image is ${width}x${height} pixels (aspect ratio: ${aspectRatio.toFixed(3)}). Minimum 200px on shortest side required, aspect ratio must be between 0.5-2.0.`,
				};
			}
		} else {
			// If we can't read dimensions, still proceed but log a warning
			console.warn("Could not read image dimensions for validation, proceeding with upload");
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
					crop: "fit",
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