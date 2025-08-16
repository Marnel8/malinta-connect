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
import { ChevronRight, Calendar, Users, Megaphone } from "lucide-react";
import { ServicesSection } from "@/components/services-section";
import { useLanguage } from "@/contexts/language-context";

export default function Home() {
	const { t } = useLanguage();

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
			<section className="w-full py-12 md:py-24 lg:py-32">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
						<div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
							{t("home.events.title")}
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
							{t("home.events.subtitle")}
						</h2>
						<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
							{t("home.events.description")}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
						<Card className="overflow-hidden hover:shadow-md transition-all">
							<div className="relative h-48 w-full">
								<Image
									src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop"
									alt="Community Clean-up Drive"
									fill
									className="object-cover"
								/>
								<div className="absolute top-2 right-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
									May 15, 2025
								</div>
							</div>
							<CardHeader>
								<CardTitle>Barangay Clean-up Drive</CardTitle>
								<CardDescription>
									Join us for our monthly community clean-up initiative
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center text-sm">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span>7:00 AM - 11:00 AM @ Barangay Plaza</span>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									size="sm"
									className="w-full group"
									asChild
								>
									<Link href="/events">
										<span className="flex items-center">
											<Megaphone className="mr-2 h-4 w-4" />
											{t("events.viewMore")}
											<ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
										</span>
									</Link>
								</Button>
							</CardFooter>
						</Card>

						<Card className="overflow-hidden hover:shadow-md transition-all">
							<div className="relative h-48 w-full">
								<Image
									src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1170&auto=format&fit=crop"
									alt="Health Seminar"
									fill
									className="object-cover"
								/>
								<div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
									May 20, 2025
								</div>
							</div>
							<CardHeader>
								<CardTitle>Free Health Seminar and Check-up</CardTitle>
								<CardDescription>
									Learn about preventive healthcare and get a free check-up
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center text-sm">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span>9:00 AM - 3:00 PM @ Barangay Health Center</span>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									size="sm"
									className="w-full group"
									asChild
								>
									<Link href="/events">
										<span className="flex items-center">
											<Megaphone className="mr-2 h-4 w-4" />
											{t("events.viewMore")}
											<ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
										</span>
									</Link>
								</Button>
							</CardFooter>
						</Card>

						<Card>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div>
										<CardTitle>Water Service Interruption Notice</CardTitle>
										<CardDescription>
											{t("events.postedOn")}: April 25, 2025
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Please be informed that there will be a scheduled water
									service interruption on May 2, 2025, from 10:00 PM to 5:00 AM
									the following day. This is due to maintenance work on the main
									water lines.
								</p>
							</CardContent>
							<CardFooter>
								<Button
									variant="outline"
									size="sm"
									className="w-full group"
									asChild
								>
									<Link href="/events?tab=announcements">
										<span className="flex items-center">
											<Megaphone className="mr-2 h-4 w-4" />
											{t("events.readMore")}
											<ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
										</span>
									</Link>
								</Button>
							</CardFooter>
						</Card>
					</div>

					<div className="flex justify-center">
						<Button asChild size="lg">
							<Link href="/events">
								{t("home.events.viewAll")}
								<ChevronRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

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
