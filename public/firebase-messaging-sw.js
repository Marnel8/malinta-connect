// Firebase Cloud Messaging Service Worker
// This file is required for FCM to work properly
// It must be placed in the root of your domain (public directory)

// Import and configure Firebase
importScripts(
	"https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js"
);
importScripts(
	"https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js"
);

// Firebase configuration - matches the main app configuration
const firebaseConfig = {
	apiKey: "AIzaSyBikZaDVZB1OjPxE3DEQ-0rj_CcEBeAZgM",
	authDomain: "malinta-connect.firebaseapp.com",
	projectId: "malinta-connect",
	storageBucket: "malinta-connect.firebasestorage.app",
	messagingSenderId: "660399403341",
	appId: "1:660399403341:web:66e44c464ca7dc4582c704",
	databaseURL: "https://malinta-connect-default-rtdb.firebaseio.com/",
};

try {
	// Initialize Firebase only if it hasn't been initialized
	if (!firebase.apps.length) {
		firebase.initializeApp(firebaseConfig);
	}

	// Initialize Firebase Cloud Messaging
	const messaging = firebase.messaging();

	// Handle background messages
	messaging.onBackgroundMessage((payload) => {
		console.log("Received background message:", payload);

		// Customize notification based on type
		const notificationTitle = payload.notification?.title || "New Message";
		const notificationType = payload.data?.type || "general";

		let clickAction = "/";
		if (payload.data?.clickAction) {
			clickAction = payload.data.clickAction;
		} else {
			// Set default click actions based on notification type
			switch (notificationType) {
				case "resident_verification":
					clickAction = "/";
					break;
				case "resident_registration":
					clickAction = "/admin/residents";
					break;
				case "appointment_update":
					clickAction = "/appointments";
					break;
				case "certificate_update":
					clickAction = "/certificates";
					break;
				case "announcement":
					clickAction = "/announcements";
					break;
				case "event_update":
					clickAction = "/events";
					break;
				case "request_update":
					clickAction = "/blotter";
					break;
				default:
					clickAction = "/";
			}
		}

		const notificationOptions = {
			body: payload.notification?.body || "You have a new message",
			icon: payload.data?.icon || "/images/malinta_logo.jpg",
			tag: notificationType, // Group similar notifications
			requireInteraction: payload.data?.priority === "high",
			data: {
				url: clickAction,
				type: notificationType,
				timestamp: payload.data?.timestamp || Date.now().toString(),
			},
		};

		self.registration.showNotification(notificationTitle, notificationOptions);
	});
} catch (error) {
	console.error("Firebase initialization error in service worker:", error);
}

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
	console.log("Notification clicked:", event);

	event.notification.close();

	// Get the URL to open from notification data
	const urlToOpen = event.notification.data?.url || "/";

	// Handle notification click - open specific page or focus existing window
	event.waitUntil(
		clients
			.matchAll({
				type: "window",
				includeUncontrolled: true,
			})
			.then((clientList) => {
				// Check if there's already a window/tab open
				for (const client of clientList) {
					if (client.url.includes(self.location.origin) && "focus" in client) {
						// Navigate to the target URL and focus the window
						client.navigate(urlToOpen);
						return client.focus();
					}
				}

				// If no window is open, open a new one
				if (clients.openWindow) {
					return clients.openWindow(urlToOpen);
				}
			})
	);
});

// Handle service worker installation
self.addEventListener("install", (event) => {
	console.log("Service Worker installing...");
	self.skipWaiting();
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
	console.log("Service Worker activating...");
	event.waitUntil(self.clients.claim());
});
