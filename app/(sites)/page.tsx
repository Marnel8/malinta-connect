"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChevronRight, Users } from "lucide-react";
import { ServicesSection } from "@/components/services-section";
import { EventsSection } from "@/components/events-section";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	requestForToken,
	getNotificationPermissionStatus,
	requestNotificationPermission,
} from "../firebase/firebase";
import { useFCMToken } from "@/hooks/use-fcm-token";

export default function Home() {
	const { t } = useLanguage();
	const { user, userProfile, loading } = useAuth();
	const router = useRouter();
	const { updateToken, hasToken } = useFCMToken();

	// Auto-redirect based on user role
	useEffect(() => {
		if (!loading && user && userProfile) {
			console.log(userProfile.role);
			// Redirect based on role
			switch (userProfile.role) {
				case "admin":
					router.push("/admin");
					break;
				case "official":
					router.push("/admin");
					break;
				case "resident":
					// Residents stay on home page
					break;
				default:
					// Default case - stay on home page
					break;
			}
		}
	}, [user, userProfile, loading, router]);

	// Request FCM token for push notifications
	useEffect(() => {
		const getFCMToken = async () => {
			// Only request token if user is logged in
			if (!user || !userProfile) return;

			const vapidKey =
				"BF8znRkgIl7BViEBpWTHJ-8thC1qiXgVpCVefXZV5z-Zc26v0xYhTS53WcPQRQ1v81VdhIT3fBf0d8e07L2ROSM";

			// Check current permission status
			const currentPermission = getNotificationPermissionStatus();
			console.log("Current notification permission:", currentPermission);

			if (currentPermission === "denied") {
				console.log(
					"Notification permission denied. User needs to enable it manually."
				);
				return;
			}

			const token = await requestForToken(vapidKey, user.uid, userProfile.role);
			if (token) {
				console.log("FCM Token received and stored successfully");
				// Update the token in the hook
				if (user?.uid && userProfile?.role) {
					updateToken(token, user.uid, userProfile.role);
				}
			} else {
				console.log(
					"Failed to get FCM token - this may be due to permission issues"
				);
			}
		};

		getFCMToken();
	}, [user, userProfile, updateToken]); // Add dependencies to re-run when user changes

	// State for notification permission
	const [notificationStatus, setNotificationStatus] = useState<
		"granted" | "denied" | "default"
	>("default");

	// Update notification status when component mounts
	useEffect(() => {
		setNotificationStatus(getNotificationPermissionStatus());
	}, []);

	// Update notification status when FCM token changes
	useEffect(() => {
		if (hasToken) {
			setNotificationStatus("granted");
		}
	}, [hasToken]);

	// Show loading while checking auth state
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
			</div>
		);
	}

	// If user is admin or official, don't render the home page content
	// (they will be redirected)
	if (
		user &&
		userProfile &&
		(userProfile.role === "admin" || userProfile.role === "official")
	) {
		return null;
	}

	return (
		<div className="flex flex-col">
			{/* Hero Section with Image Background and White Overlay */}
			<section className="relative w-full min-h-[650px] flex items-center">
				{/* Background Image */}
				<div className="absolute inset-0 z-0">
					<Image
						src="https://images.unsplash.com/photo-1542887800-faca0261c9e1?q=80&w=1974&auto=format&fit=crop"
						alt="Barangay Malinta Background"
						fill
						className="object-cover"
						priority
					/>
				</div>

				{/* White Overlay with gradient - dark mode compatible */}
				<div className="absolute inset-0 z-10 bg-gradient-to-r from-white/95 via-white/90 to-white/80 dark:from-black/95 dark:via-black/90 dark:to-black/80"></div>

				{/* Content */}
				<div className="container relative z-20 px-4 md:px-6 py-16 md:py-24">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
						<div className="md:col-span-7 md:col-start-1">
							<div className="flex items-center gap-4 mb-6">
								<div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white dark:border-gray-800 shadow-md">
									<Image
										src="/images/malinta_logo.jpg"
										alt="Barangay Malinta Logo"
										fill
										className="object-cover"
									/>
								</div>
								<div className="bg-primary/10 rounded-full py-1.5 px-4">
									<span className="text-sm font-medium text-primary">
										Bayan ng Los Baños, Laguna
									</span>
								</div>
							</div>

							<p className="text-xl md:text-2xl text-foreground/80 font-medium mb-4 max-w-2xl">
								{t("home.hero.title")}
							</p>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
								<span className="text-gradient dark:text-white">
									Barangay Malinta
								</span>
							</h1>

							<p className="text-muted-foreground text-lg max-w-2xl mb-8">
								{t("home.hero.subtitle")}
							</p>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button asChild size="lg" className="rounded-md shadow-sm px-8">
									<Link href="/certificates">
										{t("home.hero.getStarted")}
										<ChevronRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
								<Button
									variant="outline"
									size="lg"
									asChild
									className="rounded-md px-8 dark:border-gray-700 dark:hover:bg-gray-800"
								>
									<Link href="/about">{t("home.hero.learnMore")}</Link>
								</Button>
							</div>
						</div>

						<div className="md:col-span-5 flex justify-center">
							<div className="relative w-full max-w-[400px] aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
								<Image
									src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=1170&auto=format&fit=crop"
									alt="Barangay Malinta Community"
									fill
									className="object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
								<div className="absolute bottom-0 left-0 right-0 p-4">
									<p className="text-sm font-medium text-white dark:text-gray-100">
										Serving our community since 1986
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Notification Permission Status - Only show for logged-in residents */}
			{user && userProfile?.role === "resident" && (
				<section className="w-full py-8 bg-muted/50">
					<div className="container px-4 md:px-6">
						<div className="max-w-2xl mx-auto">
							<Card className="border-2">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg flex items-center gap-2">
										🔔 Notification Settings
									</CardTitle>
									<CardDescription>
										Stay updated with important announcements and updates
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Status:</span>
											<span
												className={`text-sm px-2 py-1 rounded-full ${
													notificationStatus === "granted"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: notificationStatus === "denied"
														? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
														: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
												}`}
											>
												{notificationStatus === "granted" && "✅ Enabled"}
												{notificationStatus === "denied" && "❌ Disabled"}
												{notificationStatus === "default" && "⏳ Not Set"}
											</span>
										</div>

										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">FCM Token:</span>
											<span
												className={`text-sm px-2 py-1 rounded-full ${
													hasToken
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
												}`}
											>
												{hasToken ? "✅ Active" : "❌ Not Registered"}
											</span>
										</div>

										{notificationStatus === "default" && (
											<div className="text-sm text-muted-foreground">
												Click "Enable Notifications" to receive updates about
												your requests, announcements, and events.
											</div>
										)}

										{notificationStatus === "denied" && (
											<div className="text-sm text-muted-foreground">
												Notifications are currently disabled. To enable them,
												click the lock icon in your browser's address bar and
												allow notifications.
											</div>
										)}

										{notificationStatus === "granted" && (
											<div className="text-sm text-green-700 dark:text-green-300">
												✅ You're all set! You'll receive notifications for
												important updates.
											</div>
										)}
									</div>
								</CardContent>
								<CardFooter>
									{notificationStatus === "default" && (
										<Button
											onClick={async () => {
												const permission =
													await requestNotificationPermission();
												setNotificationStatus(permission);
											}}
											className="w-full"
										>
											Enable Notifications
										</Button>
									)}
									{notificationStatus === "denied" && (
										<Button
											variant="outline"
											onClick={() =>
												window.open(
													"https://support.google.com/chrome/answer/3220216?hl=en",
													"_blank"
												)
											}
											className="w-full"
										>
											How to Enable Notifications
										</Button>
									)}
								</CardFooter>
							</Card>
						</div>
					</div>
				</section>
			)}

			{/* Registered Voters Count Section */}
			<section className="w-full py-16 bg-gradient-to-r from-primary/5 to-primary/10 border-y border-primary/10">
				<div className="container px-4 md:px-6">
					<div className="max-w-3xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden">
						<div className="flex flex-col md:flex-row items-center">
							<div className="bg-primary w-full md:w-auto p-8 md:p-12 flex justify-center items-center">
								<Users className="h-16 w-16 md:h-20 md:w-20 text-primary-foreground" />
							</div>
							<div className="p-8 md:p-12 flex flex-col items-center md:items-start">
								<h3 className="text-lg font-medium text-muted-foreground mb-1">
									Total Registered Voters
								</h3>
								<div className="flex items-baseline gap-1">
									<span className="font-bold text-5xl md:text-6xl tracking-tight text-primary">
										5,248
									</span>
									<span className="text-sm font-medium text-muted-foreground mt-2 bg-muted px-2 py-0.5 rounded-full">
										Updated May 2025
									</span>
								</div>
								<p className="text-muted-foreground text-sm mt-4 text-center md:text-left">
									As of the latest COMELEC data, Barangay Malinta has a growing
									and engaged voter population.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Services Section */}
			<ServicesSection />

			{/* Elected Officials Preview Section */}
			<section className="w-full py-12 md:py-24 lg:py-32 bg-muted relative overflow-hidden">
				<div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
				<div className="container px-4 md:px-6 relative">
					<div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
						<div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
							{t("home.officials.title")}
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
							{t("home.officials.subtitle")}
						</h2>
						<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
							{t("home.officials.description")}
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-10">
						<Card className="col-span-full lg:col-span-1 overflow-hidden hover:shadow-md transition-all">
							<div className="relative h-64 w-full">
								<Image
									src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1287&auto=format&fit=crop"
									alt="Barangay Captain"
									fill
									className="object-cover"
									objectPosition="center top"
								/>
							</div>
							<CardHeader>
								<CardTitle>{t("officials.captain")}: Juan Dela Cruz</CardTitle>
								<CardDescription>
									{t("officials.currentTerm")}: 2022-2025
								</CardDescription>
							</CardHeader>
							<CardContent>
								<h3 className="font-medium mb-2">
									{t("home.officials.message")}
								</h3>
								<p className="text-sm text-muted-foreground">
									"Our administration is committed to creating a safe,
									progressive, and inclusive community for all residents.
									Together, we can build a better barangay for ourselves and for
									future generations."
								</p>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									size="sm"
									className="w-full group"
									asChild
								>
									<Link href="/officials">
										<span className="flex items-center">
											<Users className="mr-2 h-4 w-4" />
											{t("officials.viewProfile")}
											<ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
										</span>
									</Link>
								</Button>
							</CardFooter>
						</Card>

						<div className="col-span-full lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card className="overflow-hidden hover:shadow-md transition-all">
								<CardHeader>
									<CardTitle>Maria Santos</CardTitle>
									<CardDescription>
										Committee on Health and Sanitation
									</CardDescription>
								</CardHeader>
								<CardContent className="flex items-center gap-4">
									<div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
										<Image
											src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1287&auto=format&fit=crop"
											alt="Councilor Maria Santos"
											fill
											className="object-cover"
										/>
									</div>
									<div className="text-sm text-muted-foreground">
										Leading initiatives for community health programs and
										sanitation improvements throughout the barangay.
									</div>
								</CardContent>
							</Card>

							<Card className="overflow-hidden hover:shadow-md transition-all">
								<CardHeader>
									<CardTitle>Pedro Reyes</CardTitle>
									<CardDescription>Committee on Education</CardDescription>
								</CardHeader>
								<CardContent className="flex items-center gap-4">
									<div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
										<Image
											src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1170&auto=format&fit=crop"
											alt="Councilor Pedro Reyes"
											fill
											className="object-cover"
										/>
									</div>
									<div className="text-sm text-muted-foreground">
										Spearheading educational programs and scholarship
										opportunities for barangay youth.
									</div>
								</CardContent>
							</Card>

							<Card className="overflow-hidden hover:shadow-md transition-all">
								<CardHeader>
									<CardTitle>Ana Lim</CardTitle>
									<CardDescription>
										Committee on Women and Family
									</CardDescription>
								</CardHeader>
								<CardContent className="flex items-center gap-4">
									<div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
										<Image
											src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1361&auto=format&fit=crop"
											alt="Councilor Ana Lim"
											fill
											className="object-cover"
										/>
									</div>
									<div className="text-sm text-muted-foreground">
										Advocating for women's rights and implementing family
										welfare programs in the community.
									</div>
								</CardContent>
							</Card>

							<Card className="overflow-hidden hover:shadow-md transition-all">
								<CardHeader>
									<CardTitle>Roberto Garcia</CardTitle>
									<CardDescription>Committee on Infrastructure</CardDescription>
								</CardHeader>
								<CardContent className="flex items-center gap-4">
									<div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
										<Image
											src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1287&auto=format&fit=crop"
											alt="Councilor Roberto Garcia"
											fill
											className="object-cover"
										/>
									</div>
									<div className="text-sm text-muted-foreground">
										Overseeing infrastructure projects to improve roads,
										drainage systems, and public facilities.
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					<div className="flex justify-center">
						<Button asChild size="lg">
							<Link href="/officials">
								{t("home.officials.viewAll")}
								<ChevronRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Events and Announcements Preview */}
			<EventsSection />

			{/* How It Works Section */}
			<section className="w-full py-12 md:py-24 lg:py-32 bg-muted relative overflow-hidden">
				<div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
				<div className="container px-4 md:px-6 relative">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
							{t("howItWorks.title")}
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
							{t("howItWorks.subtitle")}
						</h2>
						<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
							{t("howItWorks.description")}
						</p>
					</div>
					<div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
								<span className="text-2xl font-bold">1</span>
							</div>
							<h3 className="text-xl font-bold">
								{t("howItWorks.step1.title")}
							</h3>
							<p className="text-muted-foreground">
								{t("howItWorks.step1.description")}
							</p>
						</div>
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
								<span className="text-2xl font-bold">2</span>
							</div>
							<h3 className="text-xl font-bold">
								{t("howItWorks.step2.title")}
							</h3>
							<p className="text-muted-foreground">
								{t("howItWorks.step2.description")}
							</p>
						</div>
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
								<span className="text-2xl font-bold">3</span>
							</div>
							<h3 className="text-xl font-bold">
								{t("howItWorks.step3.title")}
							</h3>
							<p className="text-muted-foreground">
								{t("howItWorks.step3.description")}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
								{t("cta.title")}
							</h2>
							<p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed opacity-90">
								{t("cta.description")}
							</p>
						</div>
						<div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
							<Button
								size="lg"
								variant="secondary"
								className="w-full focus-ring"
							>
								<Link href="/certificates">{t("cta.requestCertificate")}</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="w-full bg-transparent border-white hover:bg-white/10 focus-ring"
							>
								<Link href="/appointments">{t("cta.scheduleAppointment")}</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
