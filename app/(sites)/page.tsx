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
} from "../firebase/firebase";
import { useFCMToken } from "@/hooks/use-fcm-token";
import { getAllOfficialsAction, type Official } from "@/app/actions/officials";

export default function Home() {
	const { t } = useLanguage();
	const { user, userProfile, loading } = useAuth();
	const router = useRouter();
	const { updateToken, hasToken } = useFCMToken();
	const [officials, setOfficials] = useState<Official[]>([]);
	const [officialsLoading, setOfficialsLoading] = useState(true);

	// Fetch officials data
	const fetchOfficials = async () => {
		try {
			setOfficialsLoading(true);
			const result = await getAllOfficialsAction();
			if (result.success && result.officials) {
				// Filter only active officials and sort by position priority
				const activeOfficials = result.officials
					.filter(official => official.status === "active")
					.sort((a, b) => {
						const positionOrder = { captain: 1, secretary: 2, treasurer: 3, skChairperson: 4, councilor: 5 };
						return (positionOrder[a.position] || 6) - (positionOrder[b.position] || 6);
					});
				setOfficials(activeOfficials);
			}
		} catch (error) {
			console.error("Error fetching officials:", error);
		} finally {
			setOfficialsLoading(false);
		}
	};

	// Load officials on component mount
	useEffect(() => {
		fetchOfficials();
	}, []);

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

			const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
			
			if (!vapidKey) {
				console.error("VAPID key not configured. Please add NEXT_PUBLIC_FIREBASE_VAPID_KEY to your environment variables.");
				return;
			}

			const token = await requestForToken(vapidKey, user.uid, userProfile.role);
			if (token) {
				console.log("FCM Token received and stored successfully");
				// Update the token in the hook
				if (user?.uid && userProfile?.role) {
					updateToken(token, user.uid, userProfile.role);
				}
			}
		};

		getFCMToken();
	}, [user, userProfile, updateToken]);


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
			<section className="relative w-full min-h-screen flex items-center">
				{/* Background Image */}
				<div className="absolute inset-0 z-0">
					<Image
						src="/images/front.jpg"
						alt="Barangay Malinta Background"
						fill
						className="object-cover"
						priority
					/>
				</div>

				{/* White Overlay with gradient - dark mode compatible */}
				<div className="absolute inset-0 z-10 bg-gradient-to-r from-white/65 via-white/90 to-white/80 dark:from-black/95 dark:via-black/90 dark:to-black/80"></div>

				{/* Content */}
				<div className="container relative z-20 px-4 md:px-6 py-16 md:py-24">
					<div className="grid grid-cols-1 md:grid-cols-14 lg:grid-cols-12 gap-8 items-center">
						<div className="md:col-span-5">
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

						<div className="w-full md:col-span-7 flex justify-center">
							<div className="relative w-full max-w-[800px] max-h-[380px] aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
								<Image
									src="/images/group_pic.jpg"
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

					{officialsLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
						</div>
					) : officials.length === 0 ? (
						<div className="text-center py-12">
							<Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
							<p className="text-muted-foreground">
								No officials information available at the moment.
							</p>
						</div>
					) : (
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-10">
							{/* Captain Card - Featured */}
							{officials.find(official => official.position === "captain") && (
								<Card className="col-span-full lg:col-span-1 overflow-hidden hover:shadow-md transition-all">
									<div className="relative h-64 w-full">
										<Image
											src={officials.find(official => official.position === "captain")?.photo || "/placeholder-user.jpg"}
											alt="Barangay Captain"
											fill
											className="object-cover"
											objectPosition="center top"
										/>
									</div>
									<CardHeader>
										<CardTitle>
											{t("officials.captain")}: {officials.find(official => official.position === "captain")?.name}
										</CardTitle>
										<CardDescription>
											{t("officials.currentTerm")}: {officials.find(official => official.position === "captain")?.term}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<h3 className="font-medium mb-2">
											{t("home.officials.message")}
										</h3>
										<p className="text-sm text-muted-foreground">
											{officials.find(official => official.position === "captain")?.message || 
											 "Our administration is committed to creating a safe, progressive, and inclusive community for all residents. Together, we can build a better barangay for ourselves and for future generations."}
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
							)}

							{/* Other Officials */}
							<div className="col-span-full lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
								{officials
									.filter(official => official.position !== "captain")
									.slice(0, 4) // Show only first 4 non-captain officials
									.map((official) => (
									<Card key={official.id} className="overflow-hidden hover:shadow-md transition-all">
										<CardHeader>
											<CardTitle>{official.name}</CardTitle>
											<CardDescription>
												{t(`officials.${official.position}`)}
												{official.committees && official.committees.length > 0 && (
													<span className="block text-xs mt-1">
														{official.committees[0]}
													</span>
												)}
											</CardDescription>
										</CardHeader>
										<CardContent className="flex items-center gap-4">
											<div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
												<Image
													src={official.photo || "/placeholder-user.jpg"}
													alt={official.name}
													fill
													className="object-cover"
												/>
											</div>
											<div className="text-sm text-muted-foreground">
												{official.biography ? 
													official.biography.substring(0, 100) + (official.biography.length > 100 ? "..." : "") :
													`Serving the community as ${t(`officials.${official.position}`).toLowerCase()}.`
												}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					)}
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
