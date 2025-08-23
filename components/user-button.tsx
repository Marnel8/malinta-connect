"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, User, Settings, LogOut, Bell } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function UserButtonContent() {
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const { t } = useLanguage();
	const { user, userProfile, loading, logout } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

	const handleLogin = () => {
		setIsLoginOpen(false);
	};

	const handleLogout = async () => {
		try {
			// Sign out from Firebase
			await signOut(auth);

			// Clear local auth state
			logout();
			router.push("/");
			toast({
				title: "Logged Out",
				description: "You have been successfully logged out.",
				variant: "default",
			});
		} catch (error) {
			console.error("Logout error:", error);
			toast({
				title: "Logout Failed",
				description: "An error occurred during logout. Please try again.",
				variant: "destructive",
			});
		}
	};

	const getInitials = (firstName?: string, lastName?: string) => {
		if (firstName && lastName) {
			return `${firstName.charAt(0)}${lastName.charAt(0)}`;
		}
		if (user?.email) {
			return user.email.charAt(0).toUpperCase();
		}
		return "U";
	};

	const getAvatarUrl = () => {
		// First priority: user profile avatar
		if (userProfile?.avatarUrl) {
			return userProfile.avatarUrl;
		}

		// Second priority: placeholder image
		return "/placeholder-user.jpg";
	};

	const getAvatarAlt = () => {
		if (userProfile?.firstName && userProfile?.lastName) {
			return `${userProfile.firstName} ${userProfile.lastName}`;
		}
		return user?.email || "User";
	};

	const handleAvatarError = (
		event: React.SyntheticEvent<HTMLImageElement, Event>
	) => {
		// Fallback to placeholder if avatar fails to load
		event.currentTarget.src = "/placeholder-user.jpg";
	};

	if (!user) {
		return (
			<>
				<Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
					<DialogTrigger asChild>
						<Button
							variant="default"
							className="transition-all duration-300 hover:shadow-md"
						>
							<LogIn className="mr-2 h-4 w-4" />
							{t("login")}
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>{t("login.title")}</DialogTitle>
							<DialogDescription>{t("login.description")}</DialogDescription>
						</DialogHeader>
						<LoginForm
							onLogin={handleLogin}
							onClose={() => setIsLoginOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	return (
		<div className="flex items-center gap-2">
			{/* Notification Bell - Commented out for now
			<Button variant="ghost" size="icon" className="relative">
				<Bell className="h-5 w-5" />
				<Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
					3
				</Badge>
				<span className="sr-only">{t("notifications")}</span>
			</Button>
			*/}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-8 w-8 rounded-full">
						<Avatar className="h-8 w-8 transition-transform duration-300 hover:scale-110">
							<AvatarImage
								src={getAvatarUrl()}
								alt={getAvatarAlt()}
								onError={handleAvatarError}
							/>
							<AvatarFallback>
								{getInitials(userProfile?.firstName, userProfile?.lastName)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{userProfile
									? `${userProfile.firstName || ""} ${
											userProfile.lastName || ""
									  }`
									: user.email}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{user.email}
							</p>
							{userProfile?.role && (
								<p className="text-xs leading-none text-primary font-medium">
									{userProfile.role.charAt(0).toUpperCase() +
										userProfile.role.slice(1)}
								</p>
							)}
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link href="/profile" className="cursor-pointer">
								<User className="mr-2 h-4 w-4" />
								<span>{t("profile")}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href="/settings" className="cursor-pointer">
								<Settings className="mr-2 h-4 w-4" />
								<span>{t("settings")}</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
						<LogOut className="mr-2 h-4 w-4" />
						<span>{t("logout")}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

// Export the component with dynamic import to prevent SSR issues
export const UserButton = dynamic(() => Promise.resolve(UserButtonContent), {
	ssr: false,
	loading: () => (
		<div className="flex items-center gap-2">
			<div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
		</div>
	),
});
