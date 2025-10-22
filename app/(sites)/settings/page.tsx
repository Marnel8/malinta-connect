"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useNotificationSettingsListener } from "@/hooks/use-notification-settings-listener";
import { useFCMToken } from "@/hooks/use-fcm-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Settings,
	Shield,
	Bell,
	Eye,
	EyeOff,
	Save,
	Loader2,
	CheckCircle,
	AlertCircle,
	Info,
	User,
	Palette,
	Globe,
	Calendar,
	Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	updatePassword,
	EmailAuthProvider,
	reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "@/app/firebase/firebase";

export default function SettingsPage() {
	const { user, userProfile } = useAuth();
	const { t, language, setLanguage } = useLanguage();
	const { toast } = useToast();
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const { systemNotificationsEnabled, loading: settingsLoading } = useNotificationSettingsListener();
	const { hasToken, clearToken } = useFCMToken();

	const [activeTab, setActiveTab] = useState("security");
	const [isLoading, setIsLoading] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [preferences, setPreferences] = useState({
		emailNotifications: true,
		pushNotifications: true,
		smsNotifications: false,
		language: language,
		timezone: "Asia/Manila",
		dateFormat: "MM/DD/YYYY",
		timeFormat: "12h",
	});

	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		if (!user) {
			router.push("/login");
		}
	}, [user, router]);

	useEffect(() => {
		setPreferences((prev) => ({
			...prev,
			language: language,
		}));
	}, [language]);

	// Load saved preferences from localStorage on component mount
	useEffect(() => {
		const savedPreferences = localStorage.getItem("userPreferences");
		if (savedPreferences) {
			try {
				const parsed = JSON.parse(savedPreferences);
				setPreferences((prev) => ({
					...prev,
					...parsed,
					language: language, // Always use current language from context
				}));
			} catch (error) {
				console.error("Error parsing saved preferences:", error);
			}
		}
	}, [language]);

	// Update push notifications preference based on system settings
	useEffect(() => {
		if (!settingsLoading) {
			setPreferences((prev) => ({
				...prev,
				pushNotifications: prev.pushNotifications && systemNotificationsEnabled
			}));
		}
	}, [systemNotificationsEnabled, settingsLoading]);

	const handlePasswordChange = (field: string, value: string) => {
		setPasswordData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePreferenceChange = (field: string, value: any) => {
		setPreferences((prev) => ({
			...prev,
			[field]: value,
		}));
		setHasUnsavedChanges(true);
	};

	const handleThemeChange = (isDark: boolean) => {
		setTheme(isDark ? "dark" : "light");
	};

	const handlePasswordUpdate = async () => {
		if (!user?.email) return;

		// Validate passwords
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			toast({
				title: "Password Mismatch",
				description: "New password and confirm password do not match.",
				variant: "destructive",
			});
			return;
		}

		if (passwordData.newPassword.length < 6) {
			toast({
				title: "Weak Password",
				description: "Password must be at least 6 characters long.",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		try {
			// Re-authenticate user before password change
			const credential = EmailAuthProvider.credential(
				user.email,
				passwordData.currentPassword
			);

			await reauthenticateWithCredential(user, credential);

			// Update password
			await updatePassword(user, passwordData.newPassword);

			toast({
				title: "Password Updated",
				description: "Your password has been updated successfully.",
				variant: "default",
			});

			// Clear form
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error: any) {
			console.error("Password update error:", error);

			let errorMessage = "Failed to update password. Please try again.";

			if (error.code === "auth/wrong-password") {
				errorMessage = "Current password is incorrect.";
			} else if (error.code === "auth/weak-password") {
				errorMessage =
					"New password is too weak. Please choose a stronger password.";
			} else if (error.code === "auth/requires-recent-login") {
				errorMessage = "Please log in again to change your password.";
			}

			toast({
				title: "Password Update Failed",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSavePreferences = async () => {
		try {
			setIsLoading(true);

			// Update language if it changed
			if (preferences.language !== language) {
				setLanguage(preferences.language as "en" | "tl");
			}

			// Handle push notification changes
			if (!preferences.pushNotifications && hasToken) {
				clearToken();
				toast({
					title: "Push Notifications Disabled",
					description: "You will no longer receive push notifications",
					variant: "default",
				});
			}

			// Save preferences to localStorage for persistence
			localStorage.setItem("userPreferences", JSON.stringify(preferences));

			// Reset unsaved changes flag
			setHasUnsavedChanges(false);

			toast({
				title: t("settings.success") || "Success",
				description:
					t("settings.preferencesUpdated") ||
					"Your preferences have been updated successfully.",
				variant: "default",
			});
		} catch (error) {
			toast({
				title: t("settings.error") || "Error",
				description:
					t("settings.preferencesUpdateFailed") ||
					"Failed to update preferences. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPreferences = () => {
		const defaultPreferences = {
			emailNotifications: true,
			pushNotifications: systemNotificationsEnabled, // Respect system settings
			smsNotifications: false,
			language: language,
			timezone: "Asia/Manila",
			dateFormat: "MM/DD/YYYY",
			timeFormat: "12h",
		};
		setPreferences(defaultPreferences);
		setHasUnsavedChanges(true);
		
		// Clear FCM token if push notifications are disabled
		if (!systemNotificationsEnabled && hasToken) {
			clearToken();
		}
		
		toast({
			title: t("settings.preferencesReset") || "Preferences Reset",
			description:
				t("settings.preferencesResetDesc") ||
				"Preferences have been reset to default values.",
			variant: "default",
		});
	};

	if (!user || !userProfile) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="space-y-6">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold tracking-tight">
						{t("settings.title") || "Settings"}
					</h1>
					<p className="text-muted-foreground mt-2">
						{t("settings.description") ||
							"Manage your account settings and preferences"}
					</p>
				</div>

				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-6"
				>
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="security" className="flex items-center gap-2">
							<Shield className="h-4 w-4" />
							<span className="hidden sm:inline">Security</span>
						</TabsTrigger>
						<TabsTrigger
							value="notifications"
							className="flex items-center gap-2"
						>
							<Bell className="h-4 w-4" />
							<span className="hidden sm:inline">Notifications</span>
						</TabsTrigger>
						<TabsTrigger
							value="preferences"
							className="flex items-center gap-2"
						>
							<Palette className="h-4 w-4" />
							<span className="hidden sm:inline">Preferences</span>
						</TabsTrigger>
						<TabsTrigger value="account" className="flex items-center gap-2">
							<User className="h-4 w-4" />
							<span className="hidden sm:inline">Account</span>
						</TabsTrigger>
					</TabsList>

					{/* Security Tab */}
					<TabsContent value="security">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="h-5 w-5" />
									{t("settings.security") || "Security Settings"}
								</CardTitle>
								<CardDescription>
									{t("settings.securityDesc") ||
										"Update your password and manage security settings"}
								</CardDescription>
							</CardHeader>

							<CardContent>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										handlePasswordUpdate();
									}}
									className="space-y-4"
								>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="currentPassword">
												{t("settings.currentPassword") || "Current Password"}
											</Label>
											<div className="relative">
												<Input
													id="currentPassword"
													type={showCurrentPassword ? "text" : "password"}
													value={passwordData.currentPassword}
													onChange={(e) =>
														handlePasswordChange(
															"currentPassword",
															e.target.value
														)
													}
													placeholder={
														t("settings.currentPasswordPlaceholder") ||
														"Enter current password"
													}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
													onClick={() =>
														setShowCurrentPassword(!showCurrentPassword)
													}
												>
													{showCurrentPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="newPassword">
												{t("settings.newPassword") || "New Password"}
											</Label>
											<div className="relative">
												<Input
													id="newPassword"
													type={showNewPassword ? "text" : "password"}
													value={passwordData.newPassword}
													onChange={(e) =>
														handlePasswordChange("newPassword", e.target.value)
													}
													placeholder={
														t("settings.newPasswordPlaceholder") ||
														"Enter new password"
													}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
													onClick={() => setShowNewPassword(!showNewPassword)}
												>
													{showNewPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
											<p className="text-xs text-muted-foreground">
												{t("settings.passwordRequirements") ||
													"Password must be at least 6 characters long"}
											</p>
										</div>

										<div className="space-y-2">
											<Label htmlFor="confirmPassword">
												{t("settings.confirmPassword") ||
													"Confirm New Password"}
											</Label>
											<div className="relative">
												<Input
													id="confirmPassword"
													type={showConfirmPassword ? "text" : "password"}
													value={passwordData.confirmPassword}
													onChange={(e) =>
														handlePasswordChange(
															"confirmPassword",
															e.target.value
														)
													}
													placeholder={
														t("settings.confirmPasswordPlaceholder") ||
														"Confirm new password"
													}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
													onClick={() =>
														setShowConfirmPassword(!showConfirmPassword)
													}
												>
													{showConfirmPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>

										<Button
											type="submit"
											disabled={
												isLoading ||
												!passwordData.currentPassword ||
												!passwordData.newPassword ||
												!passwordData.confirmPassword
											}
											className="w-full"
										>
											{isLoading ? (
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											) : (
												<Save className="h-4 w-4 mr-2" />
											)}
											{t("settings.updatePassword") || "Update Password"}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Notifications Tab */}
					<TabsContent value="notifications">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Bell className="h-5 w-5" />
									{t("settings.notifications") || "Notification Preferences"}
								</CardTitle>
								<CardDescription>
									{t("settings.notificationsDesc") ||
										"Choose how you want to receive notifications"}
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-6">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base flex items-center gap-2">
											<Mail className="h-4 w-4" />
											{t("settings.emailNotifications") ||
												"Email Notifications"}
										</Label>
										<p className="text-sm text-muted-foreground">
											{t("settings.emailNotificationsDesc") ||
												"Receive notifications via email for important updates"}
										</p>
									</div>
									<Switch
										checked={preferences.emailNotifications}
										onCheckedChange={(checked) =>
											handlePreferenceChange("emailNotifications", checked)
										}
									/>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base">
											{t("settings.pushNotifications") || "Push Notifications"}
										</Label>
										<p className="text-sm text-muted-foreground">
											{t("settings.pushNotificationsDesc") ||
												"Receive push notifications in your browser"}
										</p>
										{!systemNotificationsEnabled && (
											<p className="text-xs text-amber-600 mt-1">
												⚠️ Push notifications are disabled system-wide by administrators
											</p>
										)}
										{systemNotificationsEnabled && hasToken && (
											<p className="text-xs text-green-600 mt-1">
												✅ Push notifications are active
											</p>
										)}
										{systemNotificationsEnabled && !hasToken && (
											<p className="text-xs text-orange-600 mt-1">
												⚠️ Push notifications are enabled but not initialized
											</p>
										)}
									</div>
									<Switch
										checked={preferences.pushNotifications && systemNotificationsEnabled}
										onCheckedChange={(checked) => {
											if (!systemNotificationsEnabled) {
												toast({
													title: "Push Notifications Disabled",
													description: "Push notifications are disabled system-wide by administrators",
													variant: "destructive"
												});
												return;
											}
											handlePreferenceChange("pushNotifications", checked);
											if (!checked && hasToken) {
												clearToken();
												toast({
													title: "Push Notifications Disabled",
													description: "You will no longer receive push notifications",
													variant: "default"
												});
											}
										}}
										disabled={!systemNotificationsEnabled}
									/>
								</div>

								<Separator />

								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<Label className="text-base">
											{t("settings.smsNotifications") || "SMS Notifications"}
										</Label>
										<p className="text-sm text-muted-foreground">
											{t("settings.smsNotificationsDesc") ||
												"Receive notifications via SMS for urgent updates"}
										</p>
										<span className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400 px-2 py-1 rounded-md">
											{t("settings.comingSoon") || "Coming Soon"}
										</span>
									</div>
									<Switch
										checked={preferences.smsNotifications}
										onCheckedChange={(checked) =>
											handlePreferenceChange("smsNotifications", checked)
										}
										disabled={true}
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Preferences Tab */}
					<TabsContent value="preferences">
						<div className="grid gap-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Palette className="h-5 w-5" />
										{t("settings.display") || "Display Preferences"}
									</CardTitle>
									<CardDescription>
										{t("settings.displayDesc") ||
											"Customize your display settings"}
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label className="text-base">
												{t("settings.darkMode") || "Dark Mode"}
											</Label>
											<p className="text-sm text-muted-foreground">
												{t("settings.darkModeDesc") ||
													"Use dark theme for better visibility in low light"}
											</p>
										</div>
										<Switch
											checked={theme === "dark"}
											onCheckedChange={handleThemeChange}
										/>
									</div>

									<Separator />

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor="language"
												className="flex items-center gap-2"
											>
												<Globe className="h-4 w-4" />
												{t("settings.language") || "Language"}
											</Label>
											<Select
												value={preferences.language}
												onValueChange={(value) =>
													handlePreferenceChange("language", value)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="en">English</SelectItem>
													<SelectItem value="tl">Tagalog</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label htmlFor="timezone">Timezone</Label>
											<Select
												value={preferences.timezone}
												onValueChange={(value) =>
													handlePreferenceChange("timezone", value)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Asia/Manila">
														Asia/Manila (GMT+8)
													</SelectItem>
													<SelectItem value="UTC">UTC (GMT+0)</SelectItem>
													<SelectItem value="America/New_York">
														America/New_York (GMT-5)
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<Separator />

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label
												htmlFor="dateFormat"
												className="flex items-center gap-2"
											>
												<Calendar className="h-4 w-4" />
												{t("settings.dateFormat") || "Date Format"}
											</Label>
											<Select
												value={preferences.dateFormat}
												onValueChange={(value) =>
													handlePreferenceChange("dateFormat", value)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="MM/DD/YYYY">
														{t("settings.dateFormat.mmddyyyy") ||
															"MM/DD/YYYY (US)"}
													</SelectItem>
													<SelectItem value="DD/MM/YYYY">
														{t("settings.dateFormat.ddmmyyyy") ||
															"DD/MM/YYYY (International)"}
													</SelectItem>
													<SelectItem value="YYYY-MM-DD">
														{t("settings.dateFormat.yyyymmdd") ||
															"YYYY-MM-DD (ISO)"}
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label htmlFor="timeFormat">
												{t("settings.timeFormat") || "Time Format"}
											</Label>
											<Select
												value={preferences.timeFormat}
												onValueChange={(value) =>
													handlePreferenceChange("timeFormat", value)
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="12h">
														{t("settings.timeFormat.12h") || "12-hour (AM/PM)"}
													</SelectItem>
													<SelectItem value="24h">
														{t("settings.timeFormat.24h") ||
															"24-hour (Military)"}
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Account Tab */}
					<TabsContent value="account">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									{t("settings.accountInfo") || "Account Information"}
								</CardTitle>
								<CardDescription>
									{t("settings.accountInfoDesc") ||
										"Your account details and verification status"}
								</CardDescription>
							</CardHeader>

							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label className="flex items-center gap-2">
											<Mail className="h-4 w-4" />
											{t("settings.email") || "Email"}
										</Label>
										<p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
											{user.email}
										</p>
									</div>

									<div className="space-y-2">
										<Label>{t("settings.role") || "Role"}</Label>
										<div className="text-sm text-muted-foreground">
											<Badge variant="outline">
												{userProfile.role?.charAt(0).toUpperCase() +
													userProfile.role?.slice(1) || "User"}
											</Badge>
										</div>
									</div>

									<div className="space-y-2">
										<Label>
											{t("settings.verificationStatus") ||
												"Verification Status"}
										</Label>
										<div className="text-sm text-muted-foreground">
											<Badge
												variant={
													userProfile.verificationStatus === "verified"
														? "default"
														: userProfile.verificationStatus === "pending"
														? "secondary"
														: userProfile.verificationStatus === "rejected"
														? "destructive"
														: "outline"
												}
											>
												{userProfile.verificationStatus === "verified" ? (
													<CheckCircle className="h-3 w-3 mr-1" />
												) : userProfile.verificationStatus === "pending" ? (
													<AlertCircle className="h-3 w-3 mr-1" />
												) : userProfile.verificationStatus === "rejected" ? (
													<AlertCircle className="h-3 w-3 mr-1" />
												) : null}
												{userProfile.verificationStatus === "verified"
													? "Verified"
													: userProfile.verificationStatus === "pending"
													? "Pending"
													: userProfile.verificationStatus === "rejected"
													? "Rejected"
													: "Unknown"}
											</Badge>
										</div>
									</div>

									<div className="space-y-2">
										<Label className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											{t("settings.memberSince") || "Member Since"}
										</Label>
										<p className="text-sm text-muted-foreground">
											{userProfile.createdAt
												? new Date(userProfile.createdAt).toLocaleDateString()
												: "Unknown"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Save All Button */}
				<div className="flex justify-end pt-4 gap-4">
					{hasUnsavedChanges && (
						<div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
							<AlertCircle className="h-4 w-4" />
							{t("settings.unsavedChanges") || "You have unsaved changes"}
						</div>
					)}
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={handleResetPreferences}
							disabled={isLoading}
						>
							{t("settings.resetPreferences") || "Reset to Default"}
						</Button>
						<Button
							onClick={handleSavePreferences}
							disabled={isLoading || !hasUnsavedChanges}
							className="px-8"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							{t("settings.savePreferences") || "Save All Settings"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
