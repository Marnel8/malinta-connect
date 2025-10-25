"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFCMToken } from '@/hooks/use-fcm-token';
import { useAdminNotificationSettingsListener } from '@/hooks/use-admin-notification-settings-listener';
import { requestForTokenRobust } from '@/app/firebase/firebase';

export function AdminFCMInitializer({ children }: { children: React.ReactNode }) {
	const { user, userProfile, loading } = useAuth();
	const { updateToken, clearToken } = useFCMToken();
  const { systemNotificationsEnabled, loading: settingsLoading } = useAdminNotificationSettingsListener();

	// Request FCM token for admin users
	useEffect(() => {
		const getFCMToken = async () => {
			// Only request token if user is logged in and has a profile
			if (!user || !userProfile || loading || settingsLoading) return;

			// If system notifications are disabled, clear any existing token
			if (!systemNotificationsEnabled) {
				console.log("Admin FCM: System notifications disabled, clearing token");
				clearToken();
				return;
			}

			const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
			
			if (!vapidKey) {
				console.warn("VAPID key not configured. FCM notifications will not be available.");
				return;
			}

			console.log("Admin FCM: Requesting token for user:", user.uid, "role:", userProfile.role);

			try {
				// Use robust token request with multiple fallback strategies
				const token = await requestForTokenRobust(vapidKey, user.uid, userProfile.role);
				
				if (token) {
					console.log("Admin FCM: Token received and stored successfully");
					// Update the token in the hook
					if (user?.uid && userProfile?.role) {
						updateToken(token, user.uid, userProfile.role);
					}
				} else {
					console.log("Admin FCM: Token request failed - notifications may not be available due to browser permissions or security settings");
				}
			} catch (error) {
				// Handle any unexpected errors gracefully
				console.warn("Admin FCM: Unexpected error during token request:", error);
				console.log("Admin FCM: Notifications may not be available due to browser restrictions");
			}
		};

		getFCMToken();
	}, [user, userProfile, loading, settingsLoading, systemNotificationsEnabled, updateToken, clearToken]);

	return <>{children}</>;
}
