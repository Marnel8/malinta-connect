"use client";

import { useAuth } from "@/contexts/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SitesLogoutButton() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const { toast } = useToast();

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

	// Only show logout button if user is logged in
	if (!user) {
		return null;
	}

	return (
		<div className="bg-muted/30 border-b">
			<div className="container flex items-center justify-between py-2">
				<div className="text-sm text-muted-foreground">
					Welcome back, {user.email}
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleLogout}
					className="flex items-center gap-2"
				>
					<LogOut className="h-4 w-4" />
					Logout
				</Button>
			</div>
		</div>
	);
}
