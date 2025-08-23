"use server";

import { adminDatabase } from "@/app/firebase/admin";
import { getUserProfileAction } from "./auth";
import {
	sendCertificatePendingEmail,
	sendCertificateProcessingEmail,
	sendCertificateReadyEmail,
	sendCertificateRejectedEmail,
	sendCertificateAdditionalInfoEmail,
} from "@/mails";
import { v2 as cloudinary } from "cloudinary";

export interface Certificate {
	id: string;
	type: string;
	requestedBy: string;
	emailToNotify: string; // Add email field for notifications
	requestedOn: string;
	status:
		| "pending"
		| "processing"
		| "ready"
		| "additionalInfo"
		| "completed"
		| "rejected";
	purpose: string;
	estimatedCompletion?: string;
	notes?: string;
	photoUrl?: string;
	completedOn?: string;
	rejectedReason?: string;
	createdAt: number;
	updatedAt: number;
	// PDF generation fields
	pdfUrl?: string; // URL of generated PDF certificate
	signatureUrl?: string; // URL of attached signature image
	hasSignature?: boolean; // Whether signature is attached
	generatedBy?: string; // Staff/admin who generated the certificate
	generatedOn?: string; // Date when certificate was generated
	// Additional fields for specific certificate types
	age?: string;
	address?: string;
	businessName?: string;
	businessLocation?: string;
	closureDate?: string;
	closureReason?: string;
	relationship?: string; // For bail certificates
	occupation?: string;
	income?: string;
	incomeYear?: string;
	employmentPeriod?: string;
	jobTitle?: string;
	nonResidenceDuration?: string;
	supportDetails?: string;
	allowanceAmount?: string;
	requiresPicture?: boolean; // For certificates that need 1x1 picture
}

export interface CreateCertificateData {
	type: string;
	requestedBy: string;
	emailToNotify: string; // Add email field for notifications
	purpose: string;
	estimatedCompletion?: string;
	notes?: string;
	photoUrl?: string;
	// PDF generation fields
	pdfUrl?: string;
	signatureUrl?: string;
	hasSignature?: boolean;
	generatedBy?: string;
	generatedOn?: string;
	// Additional fields for specific certificate types
	age?: string;
	address?: string;
	businessName?: string;
	businessLocation?: string;
	closureDate?: string;
	closureReason?: string;
	relationship?: string; // For bail certificates
	occupation?: string;
	income?: string;
	incomeYear?: string;
	employmentPeriod?: string;
	jobTitle?: string;
	nonResidenceDuration?: string;
	supportDetails?: string;
	allowanceAmount?: string;
	requiresPicture?: boolean; // For certificates that need 1x1 picture
}

export interface UpdateCertificateData extends Partial<CreateCertificateData> {
	id: string;
	status?: Certificate["status"];
	completedOn?: string;
	rejectedReason?: string;
	notes?: string; // Add notes field for additionalInfo status
}

// Get all certificates
export async function getAllCertificatesAction(): Promise<{
	success: boolean;
	certificates?: Certificate[];
	error?: string;
}> {
	try {
		const certificatesRef = adminDatabase.ref("certificates");
		const snapshot = await certificatesRef.get();

		if (!snapshot.exists()) {
			return { success: true, certificates: [] };
		}

		const certificates = snapshot.val();

		const certificatesList: Certificate[] = [];

		Object.entries(certificates).forEach(([id, certificate]: [string, any]) => {
			certificatesList.push({
				id,
				...certificate,
				status: certificate.status || "pending",
				createdAt: certificate.createdAt || 0,
				updatedAt: certificate.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		certificatesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, certificates: certificatesList };
	} catch (error) {
		console.error("Error fetching certificates:", error);
		return {
			success: false,
			error:
				"Failed to fetch certificates. Please check your connection and try again.",
		};
	}
}

// Get single certificate
export async function getCertificateAction(
	id: string
): Promise<{ success: boolean; certificate?: Certificate; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Certificate ID is required.",
			};
		}

		const certificateRef = adminDatabase.ref(`certificates/${id}`);
		const snapshot = await certificateRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Certificate not found.",
			};
		}

		const certificate = snapshot.val();
		return {
			success: true,
			certificate: {
				id,
				...certificate,
				status: certificate.status || "pending",
				createdAt: certificate.createdAt || 0,
				updatedAt: certificate.updatedAt || 0,
			},
		};
	} catch (error) {
		console.error("Error fetching certificate:", error);
		return {
			success: false,
			error:
				"Failed to fetch certificate. Please check your connection and try again.",
		};
	}
}

// Create new certificate
export async function createCertificateAction(
	certificateData: CreateCertificateData
): Promise<{ success: boolean; certificateId?: string; error?: string }> {
	try {
		// Validate required fields
		if (
			!certificateData.type ||
			!certificateData.requestedBy ||
			!certificateData.emailToNotify ||
			!certificateData.purpose
		) {
			return {
				success: false,
				error:
					"Type, requested by, email to notify, and purpose are required fields.",
			};
		}

		// Generate meaningful reference number
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");

		// Get total certificate count to generate sequential number
		const certificatesRef = adminDatabase.ref("certificates");
		const snapshot = await certificatesRef.get();

		let totalCount = 0;
		if (snapshot.exists()) {
			totalCount = Object.keys(snapshot.val()).length;
		}

		const sequenceNumber = String(totalCount + 1).padStart(3, "0");
		const referenceNumber = `CERT-${year}-${month}${day}-${sequenceNumber}`;

		// Use the reference number as the database key
		const certificateRef = certificatesRef.child(referenceNumber);

		const certificate: Certificate = {
			...certificateData,
			id: referenceNumber, // Set the meaningful reference number
			requestedOn: new Date().toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
			status: "pending",
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await certificateRef.set(certificate);

		// Send push notification to admins about new certificate request
		try {
			const { sendNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			await sendNotificationAction({
				type: "certificate_update",
				targetRoles: ["admin", "official"],
				targetUids: [],
				data: {
					title: "New Certificate Request",
					body: `${certificateData.requestedBy} requested: ${certificateData.type}`,
					icon: "/images/malinta_logo.jpg",
					clickAction: "/admin/certificates",
					data: {
						certificateId: referenceNumber,
						certificateType: certificateData.type,
						requestedBy: certificateData.requestedBy,
						emailToNotify: certificateData.emailToNotify,
					},
				},
				priority: "normal",
			});
		} catch (notificationError) {
			console.error(
				"Error sending certificate notification:",
				notificationError
			);
			// Don't fail the entire operation if notification fails
		}

		return {
			success: true,
			certificateId: referenceNumber,
		};
	} catch (error) {
		console.error("Error creating certificate:", error);
		return {
			success: false,
			error:
				"Failed to create certificate. Please check your connection and try again.",
		};
	}
}

// Update certificate
export async function updateCertificateAction(
	certificateData: UpdateCertificateData
): Promise<{ success: boolean; error?: string }> {
	try {
		const { id, ...updateData } = certificateData;

		// Validate required fields
		if (!id) {
			return {
				success: false,
				error: "Certificate ID is required for updates.",
			};
		}

		const certificateRef = adminDatabase.ref(`certificates/${id}`);

		// Check if certificate exists
		const snapshot = await certificateRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error:
					"Certificate not found. It may have been deleted by another user.",
			};
		}

		// Update the certificate with new data and timestamp
		await certificateRef.update({
			...updateData,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating certificate:", error);
		return {
			success: false,
			error:
				"Failed to update certificate. Please check your connection and try again.",
		};
	}
}

// Delete certificate
export async function deleteCertificateAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Certificate ID is required for deletion.",
			};
		}

		const certificateRef = adminDatabase.ref(`certificates/${id}`);

		// Check if certificate exists
		const snapshot = await certificateRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error:
					"Certificate not found. It may have been deleted by another user.",
			};
		}

		// Delete the certificate
		await certificateRef.remove();

		return { success: true };
	} catch (error) {
		console.error("Error deleting certificate:", error);
		return {
			success: false,
			error:
				"Failed to delete certificate. Please check your connection and try again.",
		};
	}
}

// Update certificate status
export async function updateCertificateStatusAction(
	id: string,
	status: Certificate["status"],
	additionalData?: {
		completedOn?: string;
		rejectedReason?: string;
		notes?: string;
	}
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Certificate ID is required.",
			};
		}

		if (!status) {
			return {
				success: false,
				error: "Status is required.",
			};
		}

		const certificateRef = adminDatabase.ref(`certificates/${id}`);

		// Check if certificate exists
		const snapshot = await certificateRef.get();
		if (!snapshot.exists()) {
			console.error("Certificate not found in database:", id);
			return {
				success: false,
				error:
					"Certificate not found. It may have been deleted by another user.",
			};
		}

		const certificate = snapshot.val();
		const updateData: any = {
			status,
			updatedAt: Date.now(),
		};

		// Add additional data based on status
		if (status === "completed" && additionalData?.completedOn) {
			updateData.completedOn = additionalData.completedOn;
		}

		if (status === "rejected" && additionalData?.rejectedReason) {
			updateData.rejectedReason = additionalData.rejectedReason;
		}

		if (status === "additionalInfo" && additionalData?.notes) {
			updateData.notes = additionalData.notes;
		}

		// Update the status
		await certificateRef.update(updateData);

		// Send email notification based on status change
		try {
			await sendCertificateStatusEmail(id, status, certificate, additionalData);
		} catch (emailError) {
			console.error("Failed to send status update email:", emailError);
			// Don't fail the status update if email fails
		}

		// Send push notification to resident about certificate status update
		try {
			const { sendCertificateUpdateNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			await sendCertificateUpdateNotificationAction(
				certificate.requestedBy, // This should be UID in a real implementation
				certificate.requestedBy, // Resident name
				certificate.type,
				status,
				id,
				additionalData?.rejectedReason || additionalData?.notes
			);
		} catch (notificationError) {
			console.error(
				"Error sending certificate update notification:",
				notificationError
			);
			// Don't fail the entire operation if notification fails
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating certificate status:", error);
		return {
			success: false,
			error:
				"Failed to update certificate status. Please check your connection and try again.",
		};
	}
}

// Helper function to send certificate status emails
async function sendCertificateStatusEmail(
	id: string,
	status: Certificate["status"],
	certificate: any,
	additionalData?: {
		completedOn?: string;
		rejectedReason?: string;
		notes?: string;
	}
): Promise<void> {
	try {
		// Get email from certificate data or fall back to user profile
		let userEmail = certificate.emailToNotify;
		if (!userEmail) {
			try {
				const userProfile = await getUserProfileAction(certificate.requestedBy);
				userEmail = userProfile?.email;
			} catch (error) {
				console.error("Error getting user profile:", error);
			}
		}

		if (!userEmail) {
			console.error("User email not found for certificate:", id);
			return;
		}

		// Format dates
		const requestDate = new Date(certificate.requestedOn).toLocaleDateString(
			"en-US",
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			}
		);

		// Prepare certificate data for email
		const certificateData = {
			userName: certificate.requestedBy || userEmail, // Use requestedBy as name or fallback to email
			referenceNumber: id,
			certificateType: certificate.type,
			requestDate: requestDate,
			purpose: certificate.purpose,
			additionalRequirements: certificate.notes
				? [certificate.notes]
				: undefined,
			contactPhone: process.env.CONTACT_PHONE || "+63 912 345 6789",
			contactEmail: process.env.CONTACT_EMAIL || "info@malinta-connect.com",
		};

		// Send appropriate email based on status
		switch (status) {
			case "pending":
				await sendCertificatePendingEmail(userEmail, certificateData);
				break;

			case "processing":
				const processingData = {
					...certificateData,
					processingStartDate: new Date().toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					estimatedCompletionDate:
						certificate.estimatedCompletion || "3-5 business days",
					estimatedDays: "3-5",
				};
				await sendCertificateProcessingEmail(userEmail, processingData);
				break;

			case "ready":
				const readyData = {
					...certificateData,
					approvalDate: new Date().toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
					processingTime: "3-5",
					pickupLocation:
						process.env.PICKUP_LOCATION || "Malinta Barangay Hall, Main Office",
					pickupHours: process.env.PICKUP_HOURS || "8:00 AM - 5:00 PM",
				};
				await sendCertificateReadyEmail(userEmail, readyData);
				break;

			case "completed":
				// For completed status, we could send a different email or reuse ready email
				const completedData = {
					...certificateData,
					approvalDate:
						additionalData?.completedOn ||
						new Date().toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						}),
					processingTime: "3-5",
					pickupLocation:
						process.env.PICKUP_LOCATION || "Malinta Barangay Hall, Main Office",
					pickupHours: process.env.PICKUP_HOURS || "8:00 AM - 5:00 PM",
				};
				await sendCertificateReadyEmail(userEmail, completedData);
				break;

			case "rejected":
				const rejectedData = {
					...certificateData,
					rejectedReason:
						additionalData?.rejectedReason || "No reason provided",
				};
				await sendCertificateRejectedEmail(userEmail, rejectedData);
				break;

			case "additionalInfo":
				const additionalInfoData = {
					...certificateData,
					additionalInfoRequest:
						additionalData?.notes || "Additional information required",
				};
				await sendCertificateAdditionalInfoEmail(userEmail, additionalInfoData);
				break;

			default:
				break;
		}
	} catch (error) {
		console.error("Error sending certificate status email:", error);
		throw error;
	}
}

// Get certificates by status
export async function getCertificatesByStatusAction(
	status: Certificate["status"]
): Promise<{ success: boolean; certificates?: Certificate[]; error?: string }> {
	try {
		const certificatesRef = adminDatabase.ref("certificates");
		const snapshot = await certificatesRef
			.orderByChild("status")
			.equalTo(status)
			.get();

		if (!snapshot.exists()) {
			return { success: true, certificates: [] };
		}

		const certificates = snapshot.val();
		const certificatesList: Certificate[] = [];

		Object.entries(certificates).forEach(([id, certificate]: [string, any]) => {
			certificatesList.push({
				id,
				...certificate,
				status: certificate.status || "pending",
				createdAt: certificate.createdAt || 0,
				updatedAt: certificate.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		certificatesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, certificates: certificatesList };
	} catch (error) {
		console.error("Error fetching certificates by status:", error);
		return {
			success: false,
			error: "Failed to fetch certificates by status. Please try again.",
		};
	}
}

// Search certificates
export async function searchCertificatesAction(
	query: string
): Promise<{ success: boolean; certificates?: Certificate[]; error?: string }> {
	try {
		if (!query || query.trim().length === 0) {
			return getAllCertificatesAction();
		}

		const certificatesRef = adminDatabase.ref("certificates");
		const snapshot = await certificatesRef.get();

		if (!snapshot.exists()) {
			return { success: true, certificates: [] };
		}

		const certificates = snapshot.val();
		const certificatesList: Certificate[] = [];
		const searchQuery = query.toLowerCase().trim();

		Object.entries(certificates).forEach(([id, certificate]: [string, any]) => {
			const matchesSearch =
				certificate.type?.toLowerCase().includes(searchQuery) ||
				certificate.requestedBy?.toLowerCase().includes(searchQuery) ||
				certificate.purpose?.toLowerCase().includes(searchQuery) ||
				id.toLowerCase().includes(searchQuery);

			if (matchesSearch) {
				certificatesList.push({
					id,
					...certificate,
					status: certificate.status || "pending",
					createdAt: certificate.createdAt || 0,
					updatedAt: certificate.updatedAt || 0,
				});
			}
		});

		// Sort by creation date (newest first)
		certificatesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, certificates: certificatesList };
	} catch (error) {
		console.error("Error searching certificates:", error);
		return {
			success: false,
			error: "Failed to search certificates. Please try again.",
		};
	}
}

// Get count of certificates by status
export async function getCertificatesCountAction(): Promise<{
	success: boolean;
	counts?: {
		total: number;
		pending: number;
		processing: number;
		ready: number;
		completed: number;
		rejected: number;
		additionalInfo: number;
	};
	error?: string;
}> {
	try {
		const certificatesRef = adminDatabase.ref("certificates");
		const snapshot = await certificatesRef.get();

		if (!snapshot.exists()) {
			return {
				success: true,
				counts: {
					total: 0,
					pending: 0,
					processing: 0,
					ready: 0,
					completed: 0,
					rejected: 0,
					additionalInfo: 0,
				},
			};
		}

		const certificates = snapshot.val();
		const counts = {
			total: 0,
			pending: 0,
			processing: 0,
			ready: 0,
			completed: 0,
			rejected: 0,
			additionalInfo: 0,
		};

		Object.values(certificates).forEach((certificate: any) => {
			counts.total++;
			const status = certificate.status || "pending";
			if (status in counts) {
				counts[status as keyof typeof counts]++;
			}
		});

		return { success: true, counts };
	} catch (error) {
		console.error("Error fetching certificate counts:", error);
		return {
			success: false,
			error: "Failed to fetch certificate counts. Please try again.",
		};
	}
}

// Check email system status (server action)
export async function checkEmailSystemStatusAction(): Promise<{
	success: boolean;
	status: "connected" | "failed" | "unknown";
	error?: string;
}> {
	try {
		// Import email functions only on the server side
		const { verifySMTPConnection } = await import("@/mails");
		const isConnected = await verifySMTPConnection();

		return {
			success: true,
			status: isConnected ? "connected" : "failed",
		};
	} catch (error) {
		console.error("Email system check failed:", error);
		return {
			success: false,
			status: "failed",
			error: "Failed to check email system status",
		};
	}
}

// Temporary function to fix existing certificates with wrong ID format
export async function fixCertificateIdsAction(): Promise<{
	success: boolean;
	fixedCount?: number;
	error?: string;
}> {
	try {
		const certificatesRef = adminDatabase.ref("certificates");
		const snapshot = await certificatesRef.get();

		if (!snapshot.exists()) {
			return { success: true, fixedCount: 0 };
		}

		const certificates = snapshot.val();
		let fixedCount = 0;

		for (const [key, certificate] of Object.entries(certificates)) {
			const cert = certificate as any;

			// If the certificate has an ID field that doesn't match the key
			if (cert.id && cert.id !== key) {
				// Create new certificate with correct key
				await certificatesRef.child(cert.id).set(cert);

				// Remove old certificate
				await certificatesRef.child(key).remove();

				fixedCount++;
			}
		}

		return { success: true, fixedCount };
	} catch (error) {
		console.error("Error fixing certificate IDs:", error);
		return {
			success: false,
			error: "Failed to fix certificate IDs",
		};
	}
}

// Generate and upload certificate PDF
export async function generateCertificatePDFAction(
	certificateId: string,
	signatureFile?: File,
	generatedBy?: string
): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
	try {
		// Get certificate data
		const certificateResult = await getCertificateAction(certificateId);
		if (!certificateResult.success || !certificateResult.certificate) {
			return {
				success: false,
				error: "Certificate not found",
			};
		}

		const certificate = certificateResult.certificate;

		// Configure Cloudinary
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});

		let signatureUrl = certificate.signatureUrl;
		let hasSignature = certificate.hasSignature || false;

		// Upload signature if provided
		if (signatureFile) {
			try {
				const bytes = await signatureFile.arrayBuffer();
				const buffer = Buffer.from(bytes);
				const base64Data = buffer.toString("base64");
				const dataURI = `data:${signatureFile.type};base64,${base64Data}`;

				const signatureUploadResult = await cloudinary.uploader.upload(
					dataURI,
					{
						folder: "malinta-connect/signatures",
						public_id: `signature_${certificateId}_${Date.now()}`,
						resource_type: "image",
					}
				);

				signatureUrl = signatureUploadResult.secure_url;
				hasSignature = true;
			} catch (signatureError) {
				console.error("Error uploading signature:", signatureError);
				// Continue without signature if upload fails
			}
		}

		// Update certificate with signature info and generation details
		const updateData: any = {
			hasSignature,
			generatedBy: generatedBy || "System",
			generatedOn: new Date().toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		};

		if (signatureUrl) {
			updateData.signatureUrl = signatureUrl;
		}

		await updateCertificateAction({
			id: certificateId,
			...updateData,
		});

		return {
			success: true,
			pdfUrl: signatureUrl, // For now, return signature URL until we implement full PDF generation
		};
	} catch (error) {
		console.error("Error generating certificate PDF:", error);
		return {
			success: false,
			error: "Failed to generate certificate PDF",
		};
	}
}

// Upload signature for certificate
export async function uploadSignatureAction(
	certificateId: string,
	signatureFile: File
): Promise<{ success: boolean; signatureUrl?: string; error?: string }> {
	try {
		// Configure Cloudinary
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});

		const bytes = await signatureFile.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const base64Data = buffer.toString("base64");
		const dataURI = `data:${signatureFile.type};base64,${base64Data}`;

		const uploadResult = await cloudinary.uploader.upload(dataURI, {
			folder: "malinta-connect/signatures",
			public_id: `signature_${certificateId}_${Date.now()}`,
			resource_type: "image",
		});

		// Update certificate with signature
		await updateCertificateAction({
			id: certificateId,
			signatureUrl: uploadResult.secure_url,
			hasSignature: true,
		});

		return {
			success: true,
			signatureUrl: uploadResult.secure_url,
		};
	} catch (error) {
		console.error("Error uploading signature:", error);
		return {
			success: false,
			error: "Failed to upload signature",
		};
	}
}
