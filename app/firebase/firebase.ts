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
 * Robust FCM token request with multiple fallback strategies
 */
export async function requestForTokenRobust(
	vapidKey: string,
	uid?: string,
	role?: "admin" | "official" | "resident"
): Promise<string | null> {
	console.log("Starting robust FCM token request...");
	
	// Check FCM support first
	const supportStatus = getFCMSupportStatus();
	if (!supportStatus.supported) {
		console.log("Robust FCM: FCM not supported in this environment:", supportStatus.reasons.join(", "));
		return null;
	}
	
	// Strategy 1: Try simple token request first
	try {
		const token = await requestForTokenSimple(vapidKey, uid, role);
		if (token) {
			console.log("Robust FCM: Simple token request succeeded");
			return token;
		}
	} catch (error) {
		console.warn("Robust FCM: Simple token request failed:", error);
	}

	// Strategy 2: Try full token request
	try {
		const token = await requestForToken(vapidKey, uid, role);
		if (token) {
			console.log("Robust FCM: Full token request succeeded");
			return token;
		}
	} catch (error) {
		console.warn("Robust FCM: Full token request failed:", error);
	}

	// Strategy 3: Try with a delay and retry
	try {
		console.log("Robust FCM: Trying delayed retry...");
		await new Promise(resolve => setTimeout(resolve, 3000));
		const token = await requestForTokenSimple(vapidKey, uid, role);
		if (token) {
			console.log("Robust FCM: Delayed retry succeeded");
			return token;
		}
	} catch (error) {
		console.warn("Robust FCM: Delayed retry failed:", error);
	}

	console.log("Robust FCM: All strategies failed - notifications may not be available");
	return null;
}

/**
 * Simple FCM token request without service worker dependency
 */
export async function requestForTokenSimple(
	vapidKey: string,
	uid?: string,
	role?: "admin" | "official" | "resident"
): Promise<string | null> {
	console.log("Starting simple FCM token request...");
	
	const messaging = await getMessagingInstance();
	if (!messaging) {
		console.warn("Firebase messaging not supported in this environment");
		return null;
	}

	try {
		// Check if we're in a secure context
		if (typeof window !== "undefined" && !window.isSecureContext) {
			console.warn("FCM requires a secure context (HTTPS)");
			return null;
		}

		// Check notification permission
		if (Notification.permission !== "granted") {
			console.log("Requesting notification permission...");
			const permission = await Notification.requestPermission();
			if (permission !== "granted") {
				console.log("Notification permission denied:", permission);
				return null;
			}
		}

		console.log("Getting FCM token directly...");
		const token = await fbGetToken(messaging, { vapidKey });

		if (token) {
			console.log("FCM token retrieved successfully:", token.substring(0, 20) + "...");
			
			// Store token in localStorage
			if (uid && role) {
				storeFCMTokenInLocalStorage(token, uid, role);
				console.log("FCM token stored in localStorage");
			}

			// Store token in database
			if (uid && role) {
				try {
					const { storeFCMTokenAction } = await import("@/app/actions/notifications");
					const result = await storeFCMTokenAction(uid, token, role, "web");
					if (result.success) {
						console.log("FCM token stored in database successfully");
					} else {
						console.warn("Failed to store FCM token in database:", result.error);
					}
				} catch (error) {
					console.warn("Error storing FCM token in database:", error);
				}
			}

			return token;
		} else {
			console.log("No FCM token available");
			return null;
		}
	} catch (err) {
		console.warn("Error getting FCM token:", err);
		return null;
	}
}

/**
 * Request an FCM token and store it in the database (only works client-side).
 */
export async function requestForToken(
	vapidKey: string,
	uid?: string,
	role?: "admin" | "official" | "resident"
): Promise<string | null> {
	console.log("Starting FCM token request process...");
	
	const messaging = await getMessagingInstance();
	if (!messaging) {
		console.warn("Firebase messaging not supported in this environment");
		return null;
	}

	try {
		// Check if we're in a secure context (required for notifications and service workers)
		if (typeof window !== "undefined" && !window.isSecureContext) {
			console.warn("FCM requires a secure context (HTTPS). Service workers and push notifications don't work on HTTP.");
			return null;
		}

		// First, check if we have permission
		console.log("Current notification permission:", Notification.permission);
		
		if (Notification.permission === "default") {
			console.log("Requesting notification permission...");
			const permission = await Notification.requestPermission();
			console.log("Permission request result:", permission);
			
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

		// Skip service worker registration for now and try to get token directly
		console.log("Attempting to get FCM token without service worker registration...");
		
		// Set up foreground message handling first
		console.log("Setting up foreground message handling...");
		try {
			await setupForegroundMessageHandling();
		} catch (fgError) {
			console.warn("Foreground message handling setup failed:", fgError);
		}

		console.log("Getting FCM token with VAPID key...");
		let token: string | null = null;
		
		try {
			token = await fbGetToken(messaging, { vapidKey });
		} catch (tokenError) {
			console.warn("Direct token request failed:", tokenError);
			
			// Try with service worker registration as fallback
			console.log("Trying with service worker registration...");
			try {
				await ensureServiceWorkerRegistered();
				await new Promise(resolve => setTimeout(resolve, 2000));
				token = await fbGetToken(messaging, { vapidKey });
			} catch (swError) {
				console.warn("Service worker registration also failed:", swError);
				console.log("FCM token request failed - this may be due to browser permissions or security settings. Notifications may not be available.");
				return null; // Return null instead of throwing error
			}
		}

		if (token) {
			console.log(
				"FCM token retrieved successfully:",
				token.substring(0, 20) + "..."
			);

			// Store token in localStorage for app-wide access
			if (uid && role) {
				storeFCMTokenInLocalStorage(token, uid, role);
				console.log("FCM token stored in localStorage");
			}

			// Store token in database if we have user info
			if (uid && role) {
				try {
					const { storeFCMTokenAction } = await import(
						"@/app/actions/notifications"
					);
					const result = await storeFCMTokenAction(uid, token, role, "web");
					if (result.success) {
						console.log("FCM token stored in database successfully");
					} else {
						console.warn("Failed to store FCM token in database:", result.error);
					}
				} catch (error) {
					console.warn("Error storing FCM token in database:", error);
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
		console.warn("Error getting FCM token:", err);
		console.warn("Error details:", {
			name: err instanceof Error ? err.name : "Unknown",
			message: err instanceof Error ? err.message : String(err),
			stack: err instanceof Error ? err.stack : undefined
		});
		return null;
	}
}

// Helper function to check notification permission status
export function getNotificationPermissionStatus():
	| "granted"
	| "denied"
	| "default" {
	if (typeof window === "undefined") return "denied";
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

// Helper function to check if FCM is supported in the current environment
export function isFCMSupported(): boolean {
	if (typeof window === "undefined") return false;
	
	// Check for required APIs
	const hasServiceWorker = "serviceWorker" in navigator;
	const hasNotification = "Notification" in window;
	const hasPushManager = "PushManager" in window;
	const isSecureContext = window.isSecureContext;
	
	return hasServiceWorker && hasNotification && hasPushManager && isSecureContext;
}

// Helper function to get FCM support status with details
export function getFCMSupportStatus(): {
	supported: boolean;
	reasons: string[];
} {
	if (typeof window === "undefined") {
		return { supported: false, reasons: ["Not in browser environment"] };
	}
	
	const reasons: string[] = [];
	
	if (!("serviceWorker" in navigator)) {
		reasons.push("Service workers not supported");
	}
	
	if (!("Notification" in window)) {
		reasons.push("Notifications not supported");
	}
	
	if (!("PushManager" in window)) {
		reasons.push("Push messaging not supported");
	}
	
	if (!window.isSecureContext) {
		reasons.push("Not in secure context (HTTPS required)");
	}
	
	return {
		supported: reasons.length === 0,
		reasons
	};
}

// Helper function to ensure service worker is registered
export async function ensureServiceWorkerRegistered(): Promise<void> {
	if (typeof window === "undefined") return;

	try {
		// Check if service worker is supported and available
		if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker) {
			// First, try to get existing registration
			let registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
			
			if (!registration) {
				console.log("Registering Firebase messaging service worker...");
				
				try {
					// Wait for the service worker to be ready
					registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
						scope: "/"
					});
					
					// Wait for the service worker to be activated
					await navigator.serviceWorker.ready;
					console.log("Service worker registered and activated successfully");
				} catch (swError) {
					console.warn("Service worker registration failed:", swError);
					// Try alternative registration approach
					try {
						registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
						await navigator.serviceWorker.ready;
						console.log("Service worker registered with alternative approach");
					} catch (altError) {
						console.warn("Alternative service worker registration also failed:", altError);
						throw altError;
					}
				}
			} else {
				console.log("Service worker already registered");
				// Ensure it's activated
				await navigator.serviceWorker.ready;
			}
		} else {
			console.warn("Service workers are not supported in this browser or environment");
			throw new Error("Service workers not supported");
		}
	} catch (error) {
		console.warn("Error registering service worker:", error);
		throw error;
	}
}

// Helper function to set up foreground message handling
export async function setupForegroundMessageHandling(): Promise<void> {
	if (typeof window === "undefined") return;

	try {
		const messaging = await getMessagingInstance();
		if (!messaging) {
			console.warn("Firebase messaging not supported");
			return;
		}

		// Handle foreground messages
		const { onMessage } = await import("firebase/messaging");
		
		onMessage(messaging, (payload) => {
			console.log("Received foreground message:", payload);
			
			// Show notification when app is in foreground
			if (payload.notification) {
				const notificationTitle = payload.notification.title || "New Message";
				const notificationBody = payload.notification.body || "You have a new message";
				
				console.log("Creating foreground notification:", notificationTitle, notificationBody);
				
				// Create and show notification
				if (Notification.permission === "granted") {
					try {
						const notification = new Notification(notificationTitle, {
							body: notificationBody,
							icon: payload.notification.icon || "/images/malinta_logo.jpg",
							tag: payload.data?.type || "general",
							requireInteraction: payload.data?.priority === "high",
							data: {
								url: payload.data?.clickAction || "/",
								type: payload.data?.type || "general",
								timestamp: payload.data?.timestamp || Date.now().toString(),
							},
						});

						console.log("Foreground notification created successfully");

						// Handle notification click
						notification.onclick = (event) => {
							console.log("Foreground notification clicked");
							event.preventDefault();
							window.focus();
							
							const urlToOpen = notification.data?.url || "/";
							if (urlToOpen !== window.location.pathname) {
								window.location.href = urlToOpen;
							}
							
							notification.close();
						};

						// Auto-close after 5 seconds if not clicked
						setTimeout(() => {
							notification.close();
						}, 5000);

					} catch (notificationError) {
						console.warn("Error creating foreground notification:", notificationError);
					}
				} else {
					console.warn("Notification permission not granted, cannot show foreground notification");
				}
			} else {
				console.log("No notification payload in message");
			}
		});

		console.log("Foreground message handling set up successfully");
	} catch (error) {
		console.warn("Error setting up foreground message handling:", error);
	}
}
