"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@/components/user-button";
import { LanguageSelector } from "@/components/language-selector";
import { cn } from "@/lib/utils";
import {
	Home,
	FileText,
	Calendar,
	MessageSquare,
	Menu,
	Megaphone,
	Users,
	ChevronDown,
	Settings,
	BarChart3,
	ClipboardList,
	Shield,
	UserCheck,
} from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetTitle,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { getCurrentUserProfileAction } from "@/app/actions/auth";
import { UserProfile } from "@/app/actions/auth";
import dynamic from "next/dynamic";

function HeaderContent() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { t } = useLanguage();
	const { user, userProfile, loading } = useAuth();
	const [currentUserProfile, setCurrentUserProfile] =
		useState<UserProfile | null>(null);
	const [profileLoading, setProfileLoading] = useState(true);

	const isAdmin = currentUserProfile?.role === "admin";
	const isOfficial = currentUserProfile?.role === "official";
	const isResident = currentUserProfile?.role === "resident";

	// Fetch user profile when user changes
	useEffect(() => {
		const fetchUserProfile = async () => {
			if (user?.uid) {
				setProfileLoading(true);
				try {
					const result = await getCurrentUserProfileAction(user.uid);
					if (result.success && result.user) {
						setCurrentUserProfile(result.user);
					} else {
						console.error("Failed to fetch user profile:", result.error);
					}
				} catch (error) {
					console.error("Error fetching user profile:", error);
				} finally {
					setProfileLoading(false);
				}
			} else {
				setCurrentUserProfile(null);
				setProfileLoading(false);
			}
		};

		fetchUserProfile();
	}, [user?.uid]);

	// Main navigation items
	const mainNavigation = [{ name: t("nav.home"), href: "/", icon: Home }];

	// Services dropdown items
	const servicesNavigation = [
		{ name: t("nav.certificates"), href: "/certificates", icon: FileText },
		{ name: t("nav.appointments"), href: "/appointments", icon: Calendar },
		{ name: t("nav.blotter"), href: "/blotter", icon: MessageSquare },
	];

	// Community dropdown items
	const communityNavigation = [
		{ name: t("nav.events"), href: "/events", icon: Megaphone },
		{ name: t("nav.officials"), href: "/officials", icon: Users },
	];

	// Admin navigation items (only shown to officials and admins)
	const adminNavigation = [
		{ name: "Dashboard", href: "/admin", icon: BarChart3 },
		{ name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
		{ name: "Announcements", href: "/admin/announcements", icon: Megaphone },
		{ name: "Appointments", href: "/admin/appointments", icon: Calendar },
		{ name: "Blotter", href: "/admin/blotter", icon: ClipboardList },
		{ name: "Certificates", href: "/admin/certificates", icon: FileText },
		{ name: "Events", href: "/admin/events", icon: Megaphone },
		{ name: "Officials", href: "/admin/officials", icon: Shield },
		{ name: "Residents", href: "/admin/residents", icon: UserCheck },
		{ name: "Settings", href: "/admin/settings", icon: Settings },
		{ name: "Staff", href: "/admin/staff", icon: Users },
	];

	// All navigation items for mobile menu
	const allNavigation = [
		...mainNavigation,
		...servicesNavigation,
		...communityNavigation,
		...(isAdmin || isOfficial ? adminNavigation : []),
	];

	useEffect(() => {
		const handleScroll = () => {
			if (typeof window !== "undefined") {
				setScrolled(window.scrollY > 10);
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("scroll", handleScroll);
			return () => window.removeEventListener("scroll", handleScroll);
		}
	}, []);

	// For the Services dropdown, add a check to highlight the dropdown trigger when any of its items are active
	const isServicesActive = servicesNavigation.some(
		(item) => pathname === item.href
	);

	// For the Community dropdown, add a check to highlight the dropdown trigger when any of its items are active
	const isCommunityActive = communityNavigation.some(
		(item) => pathname === item.href
	);

	// For the Admin dropdown, add a check to highlight the dropdown trigger when any of its items are active
	const isAdminActive = adminNavigation.some((item) => pathname === item.href);

	// Don't render anything while loading to prevent SSR issues
	if (profileLoading) {
		return (
			<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-16 items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
						<div className="flex flex-col gap-2">
							<div className="h-6 w-32 bg-muted animate-pulse rounded" />
							<div className="h-3 w-24 bg-muted animate-pulse rounded" />
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded bg-muted animate-pulse" />
						<div className="h-8 w-8 rounded bg-muted animate-pulse" />
						<div className="h-8 w-8 rounded bg-muted animate-pulse" />
					</div>
				</div>
			</header>
		);
	}

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
				scrolled && "shadow-subtle"
			)}
		>
			<div className="container flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="lg:hidden">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="pr-0">
							<SheetTitle className="sr-only">Navigation Menu</SheetTitle>
							<div className="px-7">
								<Link
									href="/"
									className="flex items-center gap-2 font-semibold"
									onClick={() => setOpen(false)}
								>
									<div className="relative h-10 w-10 overflow-hidden rounded-full">
										<Image
											src="/images/malinta_logo.jpg"
											alt="Barangay Malinta Logo"
											fill
											className="object-cover"
										/>
									</div>
									<span className="text-xl font-bold text-gradient">
										Barangay Malinta
									</span>
								</Link>
							</div>
							<nav className="flex flex-col gap-4 px-2 pt-8">
								{allNavigation.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setOpen(false)}
										className={cn(
											"flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
											pathname === item.href
												? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
												: "transparent"
										)}
									>
										<item.icon
											className={cn(
												"h-5 w-5",
												pathname === item.href && "text-primary"
											)}
										/>
										{item.name}
									</Link>
								))}
							</nav>
						</SheetContent>
					</Sheet>
					<Link href="/" className="hidden md:flex items-center gap-2">
						<div className="relative h-10 w-10 overflow-hidden rounded-full">
							<Image
								src="/images/malinta_logo.jpg"
								alt="Barangay Malinta Logo"
								fill
								className="object-cover"
							/>
						</div>
						<div className="flex flex-col">
							<span className="text-xl font-bold text-gradient">
								Barangay Malinta
							</span>
							<span className="text-xs text-muted-foreground">
								Los Baños, Laguna
							</span>
						</div>
					</Link>
				</div>
				<nav className="hidden lg:flex lg:gap-6">
					{/* Main navigation */}
					{mainNavigation.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"group flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
								pathname === item.href
									? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary"
									: "text-muted-foreground"
							)}
						>
							<item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
							<span className="relative">
								{item.name}
								<span
									className={cn(
										"absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full",
										pathname === item.href ? "w-full" : ""
									)}
								></span>
							</span>
						</Link>
					))}

					{/* Services dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className={cn(
									"h-8 gap-1 px-2 relative",
									isServicesActive && "text-primary font-medium"
								)}
							>
								<span className="text-sm font-medium">{t("nav.services")}</span>
								<ChevronDown className="h-4 w-4" />
								{isServicesActive && (
									<span className="absolute -bottom-[13px] left-0 h-0.5 w-full bg-primary"></span>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center">
							{servicesNavigation.map((item) => (
								<DropdownMenuItem key={item.href} asChild>
									<Link
										href={item.href}
										className={cn(
											"flex items-center gap-2 w-full",
											pathname === item.href &&
												"bg-accent/50 font-medium text-accent-foreground"
										)}
									>
										<item.icon className="h-4 w-4" />
										<span>{item.name}</span>
									</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Community dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className={cn(
									"h-8 gap-1 px-2 relative",
									isCommunityActive && "text-primary font-medium"
								)}
							>
								<span className="text-sm font-medium">
									{t("nav.community")}
								</span>
								<ChevronDown className="h-4 w-4" />
								{isCommunityActive && (
									<span className="absolute -bottom-[13px] left-0 h-0.5 w-full bg-primary"></span>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center">
							{communityNavigation.map((item) => (
								<DropdownMenuItem key={item.href} asChild>
									<Link
										href={item.href}
										className={cn(
											"flex items-center gap-2 w-full",
											pathname === item.href &&
												"bg-accent/50 font-medium text-accent-foreground"
										)}
									>
										<item.icon className="h-4 w-4" />
										<span>{item.name}</span>
									</Link>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Admin dropdown (only shown to officials and admins) */}
					{(isAdmin || isOfficial) && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className={cn(
										"h-8 gap-1 px-2 relative",
										isAdminActive && "text-primary font-medium"
									)}
								>
									<span className="text-sm font-medium">Admin</span>
									<ChevronDown className="h-4 w-4" />
									{isAdminActive && (
										<span className="absolute -bottom-[13px] left-0 h-0.5 w-full bg-primary"></span>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center">
								{adminNavigation.map((item) => (
									<DropdownMenuItem key={item.href} asChild>
										<Link
											href={item.href}
											className={cn(
												"flex items-center gap-2 w-full",
												pathname === item.href &&
													"bg-accent/50 font-medium text-accent-foreground"
											)}
										>
											<item.icon className="h-4 w-4" />
											<span>{item.name}</span>
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</nav>
				<div className="flex items-center gap-2">
					<LanguageSelector />
					<ModeToggle />
					<UserButton />
				</div>
			</div>
		</header>
	);
}

// Export the component with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(HeaderContent), {
	ssr: false,
	loading: () => (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
					<div className="flex flex-col gap-2">
						<div className="h-6 w-32 bg-muted animate-pulse rounded" />
						<div className="h-3 w-24 bg-muted animate-pulse rounded" />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-8 w-8 rounded bg-muted animate-pulse" />
					<div className="h-8 w-8 rounded bg-muted animate-pulse" />
					<div className="h-8 w-8 rounded bg-muted animate-pulse" />
				</div>
			</div>
		</header>
	),
});
