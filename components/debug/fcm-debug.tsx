"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFCMToken } from "@/hooks/use-fcm-token";

export function FCMDebug() {
	const [tokens, setTokens] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [permissionStatus, setPermissionStatus] = useState<string>("checking");
	const { token: localToken, uid: localUid, role: localRole, isValid: localTokenValid } = useFCMToken();

	// Check permission status on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			setPermissionStatus(Notification.permission);
		}
	}, []);

	const checkTokens = async () => {
		setLoading(true);
		try {
			const { debugFCMTokensAction } = await import(
				"@/app/actions/notifications"
			);
			const result = await debugFCMTokensAction();
			setTokens(result);
		} catch (error) {
			console.error("Error checking tokens:", error);
		} finally {
			setLoading(false);
		}
	};

	const sendTestNotification = async () => {
		setLoading(true);
		try {
			const { sendNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			const result = await sendNotificationAction({
				type: "announcement",
				targetRoles: ["admin", "official", "resident"],
				targetUids: [],
				data: {
					title: "Test Notification",
					body: "This is a test notification to verify the system is working!",
					icon: "/images/malinta_logo.jpg",
					clickAction: "/",
				},
				priority: "normal",
			});

			console.log("Test notification result:", result);
			alert(
				result.success
					? "Test notification sent!"
					: "Failed to send notification"
			);
		} catch (error) {
			console.error("Error sending test notification:", error);
			alert("Error sending test notification");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-4xl">
			<CardHeader>
				<CardTitle>FCM Token Debug</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Notification Permission Status */}
				<div className="p-4 bg-muted rounded-lg">
					<h3 className="font-semibold mb-2">Notification Permission Status:</h3>
					<div className="flex items-center gap-2">
						<span className={`px-2 py-1 rounded-full text-sm font-medium ${
							permissionStatus === "granted" 
								? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
								: permissionStatus === "denied"
								? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
								: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
						}`}>
							{permissionStatus === "granted" && "✅ Granted"}
							{permissionStatus === "denied" && "❌ Denied"}
							{permissionStatus === "default" && "⏳ Not Set"}
							{permissionStatus === "checking" && "⏳ Checking..."}
						</span>
						{permissionStatus === "default" && (
							<Button 
								size="sm"
								onClick={async () => {
									try {
										const permission = await Notification.requestPermission();
										setPermissionStatus(permission);
									} catch (error) {
										console.error("Error requesting permission:", error);
									}
								}}
							>
								Request Permission
							</Button>
						)}
					</div>
				</div>

				<div className="flex gap-2">
					<Button onClick={checkTokens} disabled={loading}>
						{loading ? "Checking..." : "Check FCM Tokens"}
					</Button>
					<Button
						onClick={sendTestNotification}
						disabled={loading}
						variant="outline"
					>
						{loading ? "Sending..." : "Send Test Notification"}
					</Button>
				</div>

				{tokens && (
					<div className="space-y-4">
						<div>
							<h3 className="font-semibold mb-2">Tokens by Role:</h3>
							{Object.keys(tokens.tokensByRole || {}).length === 0 ? (
								<Badge variant="destructive">No tokens found by role</Badge>
							) : (
								<div className="space-y-2">
									{Object.entries(tokens.tokensByRole || {}).map(
										([role, users]: [string, any]) => (
											<div key={role} className="border p-2 rounded">
												<Badge variant="secondary">{role}</Badge>
												<span className="ml-2">
													{Object.keys(users || {}).length} user(s)
												</span>
											</div>
										)
									)}
								</div>
							)}
						</div>

						<div>
							<h3 className="font-semibold mb-2">All Tokens:</h3>
							{Object.keys(tokens.allTokens || {}).length === 0 ? (
								<Badge variant="destructive">No tokens found</Badge>
							) : (
								<div className="space-y-2">
									{Object.entries(tokens.allTokens || {}).map(
										([uid, tokenData]: [string, any]) => (
											<div key={uid} className="border p-2 rounded text-sm">
												<div>
													<strong>UID:</strong> {uid}
												</div>
												<div>
													<strong>Role:</strong> {tokenData.role}
												</div>
												<div>
													<strong>Active:</strong>{" "}
													{tokenData.active ? "Yes" : "No"}
												</div>
												<div>
													<strong>Device:</strong> {tokenData.deviceType}
												</div>
												<div>
													<strong>Token:</strong>{" "}
													{tokenData.token?.substring(0, 20)}...
												</div>
											</div>
										)
									)}
								</div>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
