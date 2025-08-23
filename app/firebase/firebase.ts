// app/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import {
	getMessaging,
	isSupported,
	type Messaging,
	getToken as fbGetToken,
} from "firebase/messaging";

// Firebase config
const firebaseConfig = {
	apiKey: "AIzaSyBikZaDVZB1OjPxE3DEQ-0rj_CcEBeAZgM",
	authDomain: "malinta-connect.firebaseapp.com",
	projectId: "malinta-connect",
	storageBucket: "malinta-connect.firebasestorage.app",
	messagingSenderId: "660399403341",
	appId: "1:660399403341:web:66e44c464ca7dc4582c704",
	databaseURL: "https://malinta-connect-default-rtdb.firebaseio.com/",
};

// Initialize core SDKs
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

// --- Messaging (browser-only) ---
let messagingPromise: Promise<Messaging | null> | null = null;

export function getMessagingInstance(): Promise<Messaging | null> {
	if (typeof window === "undefined") return Promise.resolve(null);

	if (!messagingPromise) {
		messagingPromise = isSupported().then((supported) => {
			if (supported) {
				return getMessaging(app);
			} else {
				console.warn("Firebase Messaging is not supported in this browser.");
				return null;
			}
		});
	}
	return messagingPromise;
}

/**
 * Request an FCM token and store it in the database (only works client-side).
 */
export async function requestForToken(
	vapidKey: string,
	uid?: string,
	role?: "admin" | "official" | "resident"
): Promise<string | null> {
	const messaging = await getMessagingInstance();
	if (!messaging) return null;

	try {
		// First, check if we have permission
		if (Notification.permission === "default") {
			console.log("Requesting notification permission...");
			const permission = await Notification.requestPermission();
			if (permission !== "granted") {
				console.log("Notification permission denied:", permission);
				return null;
			}
		} else if (Notification.permission !== "granted") {
			console.log(
				"Notification permission not granted:",
				Notification.permission
			);
			return null;
		}

		console.log("Getting FCM token...");
		const token = await fbGetToken(messaging, { vapidKey });

		if (token) {
			console.log(
				"FCM token retrieved successfully:",
				token.substring(0, 20) + "..."
			);

			// Store token in localStorage for app-wide access
			if (uid && role) {
				storeFCMTokenInLocalStorage(token, uid, role);
			}

			// Store token if we have user info
			if (uid && role) {
				try {
					const { storeFCMTokenAction } = await import(
						"@/app/actions/notifications"
					);
					const result = await storeFCMTokenAction(uid, token, role, "web");
					if (result.success) {
						console.log("FCM token stored successfully");
					} else {
						console.error("Failed to store FCM token:", result.error);
					}
				} catch (error) {
					console.error("Error storing FCM token:", error);
				}
			}

			return token;
		} else {
			console.log(
				"No registration token available. Request permission to generate one."
			);
			return null;
		}
	} catch (err) {
		console.error("Error getting FCM token:", err);
		return null;
	}
}

// Helper function to check notification permission status
export function getNotificationPermissionStatus():
	| "granted"
	| "denied"
	| "default" {
	return Notification.permission;
}

// Helper function to request notification permission
export async function requestNotificationPermission(): Promise<
	"granted" | "denied" | "default"
> {
	if (Notification.permission === "default") {
		return await Notification.requestPermission();
	}
	return Notification.permission;
}

// Helper function to store FCM token in localStorage
export function storeFCMTokenInLocalStorage(
	token: string,
	uid: string,
	role: string
): void {
	if (typeof window !== "undefined") {
		localStorage.setItem("fcmToken", token);
		localStorage.setItem("fcmTokenUid", uid);
		localStorage.setItem("fcmTokenRole", role);
		localStorage.setItem("fcmTokenTimestamp", Date.now().toString());
	}
}

// Helper function to get FCM token from localStorage
export function getFCMTokenFromLocalStorage(): {
	token: string | null;
	uid: string | null;
	role: string | null;
	timestamp: number | null;
} {
	if (typeof window === "undefined") {
		return { token: null, uid: null, role: null, timestamp: null };
	}

	return {
		token: localStorage.getItem("fcmToken"),
		uid: localStorage.getItem("fcmTokenUid"),
		role: localStorage.getItem("fcmTokenRole"),
		timestamp: localStorage.getItem("fcmTokenTimestamp")
			? parseInt(localStorage.getItem("fcmTokenTimestamp")!)
			: null,
	};
}

// Helper function to remove FCM token from localStorage
export function removeFCMTokenFromLocalStorage(): void {
	if (typeof window !== "undefined") {
		localStorage.removeItem("fcmToken");
		localStorage.removeItem("fcmTokenUid");
		localStorage.removeItem("fcmTokenRole");
		localStorage.removeItem("fcmTokenTimestamp");
	}
}

// Helper function to check if FCM token is valid (not expired)
export function isFCMTokenValid(): boolean {
	if (typeof window === "undefined") return false;

	const { token, timestamp } = getFCMTokenFromLocalStorage();
	if (!token || !timestamp) return false;

	// Token expires after 7 days (604800000 ms)
	const tokenAge = Date.now() - timestamp;
	const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

	return tokenAge < maxAge;
}
