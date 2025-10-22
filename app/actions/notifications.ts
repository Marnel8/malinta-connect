"use server";

import { adminDatabase } from "@/app/firebase/admin";

export interface FCMToken {
	token: string;
	uid: string;
	role: "admin" | "official" | "resident";
	deviceType: "web" | "mobile";
	lastUpdated: number;
	active: boolean;
}

export interface NotificationData {
	title: string;
	body: string;
	icon?: string;
	data?: Record<string, any>;
	clickAction?: string;
}

export interface NotificationRequest {
	type:
		| "resident_verification"
		| "resident_registration"
		| "appointment_update"
		| "certificate_update"
		| "announcement"
		| "event_update"
		| "request_update";
	targetRoles: ("admin" | "official" | "resident")[];
	targetUids?: string[]; // Specific users to notify
	data: NotificationData;
	priority: "high" | "normal";
}

// Store FCM token for a user
export async function storeFCMTokenAction(
	uid: string,
	token: string,
	role: "admin" | "official" | "resident",
	deviceType: "web" | "mobile" = "web"
): Promise<{ success: boolean; error?: string }> {
	try {
		const tokenData: FCMToken = {
			token,
			uid,
			role,
			deviceType,
			lastUpdated: Date.now(),
			active: true,
		};

		// Store token with UID as key for easy lookup
		await adminDatabase.ref(`fcmTokens/${uid}`).set(tokenData);

		// Also store in reverse lookup for role-based notifications
		await adminDatabase.ref(`fcmTokensByRole/${role}/${uid}`).set({
			token,
			lastUpdated: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error storing FCM token:", error);
		return { success: false, error: "Failed to store FCM token" };
	}
}

// Get all FCM tokens for specific roles
export async function getFCMTokensByRoleAction(
	roles: ("admin" | "official" | "resident")[]
): Promise<{ success: boolean; tokens?: string[]; error?: string }> {
	try {
		const tokens: string[] = [];

		for (const role of roles) {
			const roleRef = adminDatabase.ref(`fcmTokensByRole/${role}`);
			const snapshot = await roleRef.get();

			if (snapshot.exists()) {
				const roleTokens = snapshot.val();
				Object.values(roleTokens).forEach((tokenData: any) => {
					if (tokenData.token) {
						tokens.push(tokenData.token);
					}
				});
			}
		}

		return { success: true, tokens: [...new Set(tokens)] }; // Remove duplicates
	} catch (error) {
		console.error("Error getting FCM tokens by role:", error);
		return { success: false, error: "Failed to get FCM tokens" };
	}
}

// Get FCM tokens for specific users
export async function getFCMTokensByUidsAction(
	uids: string[]
): Promise<{ success: boolean; tokens?: string[]; error?: string }> {
	try {
		const tokens: string[] = [];

		for (const uid of uids) {
			const tokenRef = adminDatabase.ref(`fcmTokens/${uid}`);
			const snapshot = await tokenRef.get();

			if (snapshot.exists()) {
				const tokenData = snapshot.val() as FCMToken;
				// Only include active tokens that are not too old (older than 30 days)
				const tokenAge = Date.now() - tokenData.lastUpdated;
				const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

				if (tokenData.active && tokenData.token && tokenAge < maxAge) {
					tokens.push(tokenData.token);
				} else if (tokenAge >= maxAge) {
					// Mark old tokens as inactive
					await adminDatabase.ref(`fcmTokens/${uid}`).update({ active: false });
					console.log(`Marked old token for UID ${uid} as inactive`);
				}
			}
		}

		return { success: true, tokens };
	} catch (error) {
		console.error("Error getting FCM tokens by UIDs:", error);
		return { success: false, error: "Failed to get FCM tokens" };
	}
}

// Send notification to specific users or roles
export async function sendNotificationAction(
	notificationRequest: NotificationRequest
): Promise<{ success: boolean; error?: string }> {
	try {
		// Check if system notifications are enabled
		const settingsRef = adminDatabase.ref("settings/notifications");
		const settingsSnapshot = await settingsRef.get();
		
		if (settingsSnapshot.exists()) {
			const settings = settingsSnapshot.val();
			if (!settings.systemNotifications) {
				console.log("System notifications are disabled, skipping push notification");
				return { success: true }; // Not an error, just disabled
			}
		}

		const { getMessaging } = await import("firebase-admin/messaging");
		const { adminApp } = await import("@/app/firebase/admin");

		const messaging = getMessaging(adminApp);
		let tokens: string[] = [];

		// Get tokens based on target
		if (
			notificationRequest.targetUids &&
			notificationRequest.targetUids.length > 0
		) {
			const result = await getFCMTokensByUidsAction(
				notificationRequest.targetUids
			);
			if (result.success && result.tokens) {
				tokens = result.tokens;
			}
		} else if (notificationRequest.targetRoles.length > 0) {
			const result = await getFCMTokensByRoleAction(
				notificationRequest.targetRoles
			);
			if (result.success && result.tokens) {
				tokens = result.tokens;
			}
		}

		// If no specific tokens found, try to get tokens by role as fallback
		if (tokens.length === 0) {
			console.log(
				"No specific FCM tokens found, trying role-based fallback..."
			);

			// For certificate updates, try to notify all residents
			if (notificationRequest.type === "certificate_update") {
				const fallbackResult = await getFCMTokensByRoleAction(["resident"]);
				if (fallbackResult.success && fallbackResult.tokens) {
					tokens = fallbackResult.tokens;
					console.log(
						`Found ${tokens.length} resident tokens for fallback notification`
					);
				}
			}

			// For other types, try to notify admins
			else if (
				notificationRequest.type === "resident_registration" ||
				notificationRequest.type === "resident_verification"
			) {
				const fallbackResult = await getFCMTokensByRoleAction(["admin"]);
				if (fallbackResult.success && fallbackResult.tokens) {
					tokens = fallbackResult.tokens;
					console.log(
						`Found ${tokens.length} admin tokens for fallback notification`
					);
				}
			}
		}

		if (tokens.length === 0) {
			console.log("No FCM tokens found for notification");
			return { success: true }; // Not an error, just no recipients
		}

		// Prepare the message
		const message = {
			notification: {
				title: notificationRequest.data.title,
				body: notificationRequest.data.body,
			},
			data: {
				type: notificationRequest.type,
				priority: notificationRequest.priority,
				timestamp: Date.now().toString(),
				...(notificationRequest.data.icon && {
					icon: notificationRequest.data.icon,
				}),
				...(notificationRequest.data.clickAction && {
					clickAction: notificationRequest.data.clickAction,
				}),
				...(notificationRequest.data.data || {}),
			},
			tokens,
		};

		// Send the notification
		const response = await messaging.sendEachForMulticast(message);

		// Log results
		console.log(
			`Notification sent successfully: ${response.successCount} success, ${response.failureCount} failure`
		);

		// Clean up invalid tokens
		if (response.failureCount > 0) {
			const invalidTokens: string[] = [];
			response.responses.forEach((resp, idx) => {
				if (!resp.success && tokens[idx]) {
					console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
					invalidTokens.push(tokens[idx]);
				}
			});

			// Clean up invalid tokens from database
			if (invalidTokens.length > 0) {
				console.log(`Cleaning up ${invalidTokens.length} invalid tokens...`);
				await cleanupInvalidTokensAction(invalidTokens);
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Error sending notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
}

// Clean up invalid FCM tokens
async function cleanupInvalidTokensAction(
	invalidTokens: string[]
): Promise<void> {
	try {
		// Get all tokens and find matching UIDs
		const fcmTokensRef = adminDatabase.ref("fcmTokens");
		const snapshot = await fcmTokensRef.get();

		if (!snapshot.exists()) return;

		const allTokens = snapshot.val();
		const updates: Record<string, null | boolean> = {};

		for (const uid in allTokens) {
			const tokenData = allTokens[uid] as FCMToken;
			if (invalidTokens.includes(tokenData.token)) {
				// Mark token as inactive instead of deleting
				updates[`fcmTokens/${uid}/active`] = false;
				updates[`fcmTokensByRole/${tokenData.role}/${uid}`] = null;
			}
		}

		if (Object.keys(updates).length > 0) {
			await adminDatabase.ref().update(updates);
			console.log(
				`Cleaned up ${Object.keys(updates).length / 2} invalid tokens`
			);
		}
	} catch (error) {
		console.error("Error cleaning up invalid tokens:", error);
	}
}

// Store notification history
async function storeNotificationHistoryAction(
	historyData: NotificationRequest & {
		sentAt: number;
		successCount: number;
		failureCount: number;
		totalTokens: number;
	}
): Promise<void> {
	try {
		const historyRef = adminDatabase.ref("notificationHistory").push();
		await historyRef.set(historyData);
	} catch (error) {
		console.error("Error storing notification history:", error);
	}
}

// Remove FCM token (for logout)
export async function removeFCMTokenAction(
	uid: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get current token data to find role
		const tokenRef = adminDatabase.ref(`fcmTokens/${uid}`);
		const snapshot = await tokenRef.get();

		if (snapshot.exists()) {
			const tokenData = snapshot.val() as FCMToken;

			// Remove from both locations
			const updates = {
				[`fcmTokens/${uid}`]: null,
				[`fcmTokensByRole/${tokenData.role}/${uid}`]: null,
			};

			await adminDatabase.ref().update(updates);
		}

		return { success: true };
	} catch (error) {
		console.error("Error removing FCM token:", error);
		return { success: false, error: "Failed to remove FCM token" };
	}
}

// Helper function for resident-specific notifications
export async function sendResidentVerificationNotificationAction(
	residentUid: string,
	residentName: string,
	status: "verified" | "rejected",
	notes?: string
): Promise<{ success: boolean; error?: string }> {
	const notificationData: NotificationData = {
		title: "Account Verification Update",
		body:
			status === "verified"
				? `Congratulations ${residentName}! Your account has been verified.`
				: `Your account verification was not approved. ${
						notes ? `Reason: ${notes}` : ""
				  }`,
		icon: "/images/malinta_logo.jpg",
		clickAction: "/",
		data: {
			residentUid,
			verificationStatus: status,
			...(notes && { notes }),
		},
	};

	return await sendNotificationAction({
		type: "resident_verification",
		targetUids: [residentUid],
		targetRoles: [],
		data: notificationData,
		priority: "high",
	});
}

// Helper function for new resident registration notifications to admins
export async function sendNewResidentRegistrationNotificationAction(
	residentName: string,
	residentEmail: string,
	residentUid: string
): Promise<{ success: boolean; error?: string }> {
	const notificationData: NotificationData = {
		title: "New Resident Registration",
		body: `${residentName} (${residentEmail}) has registered and is pending verification.`,
		icon: "/images/malinta_logo.jpg",
		clickAction: `/admin/residents`,
		data: {
			residentUid,
			residentName,
			residentEmail,
		},
	};

	return await sendNotificationAction({
		type: "resident_registration",
		targetRoles: ["admin", "official"],
		targetUids: [],
		data: notificationData,
		priority: "normal",
	});
}

// Helper function for announcement notifications to all residents
export async function sendAnnouncementNotificationAction(
	title: string,
	content: string,
	announcementId: string
): Promise<{ success: boolean; error?: string }> {
	const notificationData: NotificationData = {
		title: "New Announcement",
		body: title,
		icon: "/images/malinta_logo.jpg",
		clickAction: `/announcements`,
		data: {
			announcementId,
			title,
			content: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
		},
	};

	return await sendNotificationAction({
		type: "announcement",
		targetRoles: ["resident"],
		targetUids: [],
		data: notificationData,
		priority: "normal",
	});
}

// Helper function for event notifications to all residents
export async function sendEventNotificationAction(
	eventName: string,
	eventDate: string,
	eventId: string
): Promise<{ success: boolean; error?: string }> {
	const notificationData: NotificationData = {
		title: "New Event",
		body: `${eventName} - ${eventDate}`,
		icon: "/images/malinta_logo.jpg",
		clickAction: `/events`,
		data: {
			eventId,
			eventName,
			eventDate,
		},
	};

	return await sendNotificationAction({
		type: "event_update",
		targetRoles: ["resident"],
		targetUids: [],
		data: notificationData,
		priority: "normal",
	});
}

// Helper function for appointment status updates to specific residents
export async function sendAppointmentUpdateNotificationAction(
	residentUid: string,
	residentName: string,
	appointmentTitle: string,
	status: "confirmed" | "cancelled" | "completed",
	appointmentId: string
): Promise<{ success: boolean; error?: string }> {
	const statusMessages = {
		confirmed: "Your appointment has been confirmed!",
		cancelled: "Your appointment has been cancelled.",
		completed: "Your appointment has been marked as completed.",
	};

	const notificationData: NotificationData = {
		title: "Appointment Update",
		body: `${appointmentTitle}: ${statusMessages[status]}`,
		icon: "/images/malinta_logo.jpg",
		clickAction: `/appointments`,
		data: {
			appointmentId,
			appointmentTitle,
			status,
			residentUid,
		},
	};

	return await sendNotificationAction({
		type: "appointment_update",
		targetUids: [residentUid],
		targetRoles: [],
		data: notificationData,
		priority: "high",
	});
}

// Helper function for certificate status updates to specific residents
export async function sendCertificateUpdateNotificationAction(
	residentUid: string,
	residentName: string,
	certificateType: string,
	status:
		| "pending"
		| "processing"
		| "ready"
		| "additionalInfo"
		| "completed"
		| "rejected",
	certificateId: string,
	notes?: string
): Promise<{ success: boolean; error?: string }> {
	const statusMessages = {
		pending:
			"Your certificate request has been submitted and is pending review.",
		processing: "Your certificate request is now being processed.",
		ready: "Your certificate is ready for pickup!",
		additionalInfo: `Additional information is needed: ${
			notes || "Please check your email for details."
		}`,
		completed: "Your certificate request has been completed.",
		rejected: `Your certificate request was not approved. ${
			notes ? `Reason: ${notes}` : ""
		}`,
	};

	const notificationData: NotificationData = {
		title: "Certificate Update",
		body: `${certificateType}: ${statusMessages[status]}`,
		icon: "/images/malinta_logo.jpg",
		clickAction: `/certificates`,
		data: {
			certificateId,
			certificateType,
			status,
			residentUid,
			...(notes && { notes }),
		},
	};

	return await sendNotificationAction({
		type: "certificate_update",
		targetUids: [residentUid],
		targetRoles: [],
		data: notificationData,
		priority: status === "ready" || status === "rejected" ? "high" : "normal",
	});
}

// Helper function for blotter case updates to specific residents
export async function sendBlotterUpdateNotificationAction(
	residentUid: string,
	residentName: string,
	caseType: string,
	status: "processing" | "resolved" | "closed",
	caseId: string,
	notes?: string
): Promise<{ success: boolean; error?: string }> {
	const statusMessages = {
		processing: "Your case is now being processed.",
		resolved: "Your case has been resolved!",
		closed: "Your case has been closed.",
	};

	const notificationData: NotificationData = {
		title: "Case Update",
		body: `${caseType}: ${statusMessages[status]}`,
		icon: "/images/malinta_logo.jpg",
		clickAction: `/blotter`,
		data: {
			caseId,
			caseType,
			status,
			residentUid,
			...(notes && { notes }),
		},
	};

	return await sendNotificationAction({
		type: "request_update",
		targetUids: [residentUid],
		targetRoles: [],
		data: notificationData,
		priority: status === "resolved" ? "high" : "normal",
	});
}

