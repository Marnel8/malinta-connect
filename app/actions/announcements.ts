"use server";

import { adminDatabase } from "@/app/firebase/admin";
import { archiveRecord } from "@/lib/archive-manager";
import {
	sendAnnouncementCreatedEmail,
	type AnnouncementEmailData,
} from "@/mails";

export interface Announcement {
	id: string;
	title: string;
	description: string;
	category: "Event" | "Notice" | "Important" | "Emergency";
	image?: string;
	status: "published" | "draft" | "expired";
	visibility: "public" | "residents";
	author: string;
	publishedOn: string;
	expiresOn: string;
	createdAt: number;
	updatedAt: number;
}

export interface CreateAnnouncementData {
	title: string;
	description: string;
	category: "Event" | "Notice" | "Important" | "Emergency";
	image?: string;
	visibility: "public" | "residents";
	author: string;
	expiresOn: string;
}

export interface UpdateAnnouncementData
	extends Partial<CreateAnnouncementData> {
	id: string;
	image?: string;
	status?: "published" | "draft" | "expired";
}

// Create new announcement
export async function createAnnouncementAction(
	announcementData: CreateAnnouncementData
): Promise<{ success: boolean; announcementId?: string; error?: string }> {
	try {
		// Validate required fields
		if (
			!announcementData.title ||
			!announcementData.description ||
			!announcementData.category ||
			!announcementData.visibility ||
			!announcementData.author ||
			!announcementData.expiresOn
		) {
			return {
				success: false,
				error: "All required fields must be filled out.",
			};
		}

		// Generate meaningful reference number
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");

		// Get total announcement count to generate sequential number
		const announcementsRef = adminDatabase.ref("announcements");
		const snapshot = await announcementsRef.get();

		let totalCount = 0;
		if (snapshot.exists()) {
			totalCount = Object.keys(snapshot.val()).length;
		}

		const sequenceNumber = String(totalCount + 1).padStart(3, "0");
		const referenceNumber = `ANN-${year}-${month}${day}-${sequenceNumber}`;

		const newAnnouncementRef = announcementsRef.push();

		const announcement: Omit<Announcement, "id"> = {
			...announcementData,
			status: "draft",
			publishedOn: now.toISOString().split("T")[0], // YYYY-MM-DD format
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await newAnnouncementRef.set(announcement);

		// Send push notification to residents about new announcement
		try {
			const { sendAnnouncementNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			await sendAnnouncementNotificationAction(
				announcementData.title,
				announcementData.description,
				referenceNumber
			);
		} catch (notificationError) {
			console.error(
				"Error sending announcement notification:",
				notificationError
			);
			// Don't fail the entire operation if notification fails
		}

		// Send email notification to all residents about new announcement
		try {
			// Get all resident emails
			const residentsRef = adminDatabase.ref("residents");
			const residentsSnapshot = await residentsRef.get();
			const residentEmails: string[] = [];

			if (residentsSnapshot.exists()) {
				const residents = residentsSnapshot.val();
				Object.values(residents).forEach((resident: any) => {
					if (resident?.contactInfo?.email) {
						residentEmails.push(resident.contactInfo.email);
					}
				});
			}

			if (residentEmails.length > 0) {
				const emailData: AnnouncementEmailData = {
					announcementTitle: announcementData.title,
					announcementDescription: announcementData.description,
					announcementCategory: announcementData.category,
					author: announcementData.author,
					publishedOn: announcement.publishedOn,
					expiresOn: announcementData.expiresOn,
					referenceNumber,
					contactPhone: process.env.CONTACT_PHONE || "+63 912 345 6789",
					contactEmail: process.env.CONTACT_EMAIL || "info@malinta-connect.com",
				};

				await sendAnnouncementCreatedEmail(residentEmails, emailData);
			}
		} catch (emailError) {
			console.error("Failed to send announcement created email:", emailError);
			// Don't fail the entire operation if email fails
		}

		return {
			success: true,
			announcementId: referenceNumber,
		};
	} catch (error) {
		console.error("Error creating announcement:", error);
		return {
			success: false,
			error:
				"Failed to create announcement. Please check your connection and try again.",
		};
	}
}

// Get all announcements
export async function getAllAnnouncementsAction(): Promise<{
	success: boolean;
	announcements?: Announcement[];
	error?: string;
}> {
	try {
		const announcementsRef = adminDatabase.ref("announcements");
		const snapshot = await announcementsRef.get();

		if (!snapshot.exists()) {
			return { success: true, announcements: [] };
		}

		const announcements = snapshot.val();
		const announcementsList: Announcement[] = [];

		Object.entries(announcements).forEach(
			([id, announcement]: [string, any]) => {
				announcementsList.push({
					id,
					...announcement,
					status: announcement.status || "draft",
					createdAt: announcement.createdAt || 0,
					updatedAt: announcement.updatedAt || 0,
				});
			}
		);

		// Sort by creation date (newest first)
		announcementsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, announcements: announcementsList };
	} catch (error) {
		console.error("Error fetching announcements:", error);
		return {
			success: false,
			error:
				"Failed to fetch announcements. Please check your connection and try again.",
		};
	}
}

// Get single announcement
export async function getAnnouncementAction(
	id: string
): Promise<{ success: boolean; announcement?: Announcement; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Announcement ID is required.",
			};
		}

		const announcementRef = adminDatabase.ref(`announcements/${id}`);
		const snapshot = await announcementRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Announcement not found.",
			};
		}

		const announcement = snapshot.val();
		return {
			success: true,
			announcement: {
				id,
				...announcement,
				status: announcement.status || "draft",
				createdAt: announcement.createdAt || 0,
				updatedAt: announcement.updatedAt || 0,
			},
		};
	} catch (error) {
		console.error("Error fetching announcement:", error);
		return {
			success: false,
			error:
				"Failed to fetch announcement. Please check your connection and try again.",
		};
	}
}

// Update announcement
export async function updateAnnouncementAction(
	updateData: UpdateAnnouncementData
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!updateData.id) {
			return {
				success: false,
				error: "Announcement ID is required.",
			};
		}

		const announcementRef = adminDatabase.ref(`announcements/${updateData.id}`);
		const snapshot = await announcementRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Announcement not found.",
			};
		}

		const updatePayload: Partial<Announcement> = {
			...updateData,
			updatedAt: Date.now(),
		};

		// If status is being updated to published, set publishedOn
		if (updateData.status === "published") {
			updatePayload.publishedOn = new Date().toISOString().split("T")[0];
		}

		await announcementRef.update(updatePayload);

		return { success: true };
	} catch (error) {
		console.error("Error updating announcement:", error);
		return {
			success: false,
			error:
				"Failed to update announcement. Please check your connection and try again.",
		};
	}
}

// Delete announcement
export async function deleteAnnouncementAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Announcement ID is required.",
			};
		}

		const announcementRef = adminDatabase.ref(`announcements/${id}`);
		const snapshot = await announcementRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Announcement not found.",
			};
		}

		const announcement = snapshot.val();

		await archiveRecord({
			entity: "announcements",
			id,
			paths: {
				[`announcements/${id}`]: announcement,
			},
			preview: {
				title: announcement.title,
				status: announcement.status || "draft",
				author: announcement.author,
				category: announcement.category,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting announcement:", error);
		return {
			success: false,
			error:
				"Failed to delete announcement. Please check your connection and try again.",
		};
	}
}

// Publish announcement
export async function publishAnnouncementAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Announcement ID is required.",
			};
		}

		const announcementRef = adminDatabase.ref(`announcements/${id}`);
		const snapshot = await announcementRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Announcement not found.",
			};
		}

		await announcementRef.update({
			status: "published",
			publishedOn: new Date().toISOString().split("T")[0],
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error publishing announcement:", error);
		return {
			success: false,
			error:
				"Failed to publish announcement. Please check your connection and try again.",
		};
	}
}

// Unpublish announcement
export async function unpublishAnnouncementAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Announcement ID is required.",
			};
		}

		const announcementRef = adminDatabase.ref(`announcements/${id}`);
		const snapshot = await announcementRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Announcement not found.",
			};
		}

		await announcementRef.update({
			status: "draft",
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error unpublishing announcement:", error);
		return {
			success: false,
			error:
				"Failed to unpublish announcement. Please check your connection and try again.",
		};
	}
}

// Get public published announcements for client-side display
export async function getPublicAnnouncementsAction(): Promise<{
	success: boolean;
	announcements?: Announcement[];
	error?: string;
}> {
	try {
		const announcementsRef = adminDatabase.ref("announcements");
		const snapshot = await announcementsRef.get();

		if (!snapshot.exists()) {
			return { success: true, announcements: [] };
		}

		const announcements = snapshot.val();
		const publicAnnouncements: Announcement[] = [];

		Object.entries(announcements).forEach(
			([id, announcement]: [string, any]) => {
				// Only include published announcements that are public
				if (
					announcement.status === "published" &&
					announcement.visibility === "public"
				) {
					publicAnnouncements.push({
						id,
						...announcement,
						status: announcement.status || "published",
						createdAt: announcement.createdAt || 0,
						updatedAt: announcement.updatedAt || 0,
					});
				}
			}
		);

		// Sort by published date (newest first)
		publicAnnouncements.sort((a, b) => {
			const dateA = new Date(a.publishedOn).getTime();
			const dateB = new Date(b.publishedOn).getTime();
			return dateB - dateA;
		});

		return { success: true, announcements: publicAnnouncements };
	} catch (error) {
		console.error("Error fetching public announcements:", error);
		return {
			success: false,
			error:
				"Failed to fetch announcements. Please check your connection and try again.",
		};
	}
}
