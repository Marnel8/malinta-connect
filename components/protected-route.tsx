"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
	children: ReactNode;
	requiredRole?: "official" | "admin" | "resident";
	fallbackPath?: string;
}

export function ProtectedRoute({
	children,
	requiredRole = "resident",
	fallbackPath = "/",
}: ProtectedRouteProps) {
	const { user, userProfile, loading } = useAuth();
	const router = useRouter();
	const [roleLoading, setRoleLoading] = useState(true);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
			return;
		}

		if (user && userProfile) {
			setRoleLoading(false);
		}
	}, [user, userProfile, loading, router]);

	useEffect(() => {
		if (user && userProfile && !roleLoading) {
			const userRole = userProfile.role;

			// Check if user has required role
			if (requiredRole === "admin" && userRole !== "admin") {
				router.push(fallbackPath);
				return;
			}

			if (
				requiredRole === "official" &&
				!["official", "admin"].includes(userRole)
			) {
				router.push(fallbackPath);
				return;
			}

			if (
				requiredRole === "resident" &&
				["official", "admin"].includes(userRole)
			) {
				// Officials trying to access resident pages
				router.push("/admin");
				return;
			}
		}
	}, [user, userProfile, roleLoading, requiredRole, router, fallbackPath]);

	// Show loading while checking authentication and role
	if (loading || roleLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin" />
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// If not authenticated, don't render anything (will redirect)
	if (!user) {
		return null;
	}

	// If no user profile or user doesn't have required role, don't render
	if (
		!userProfile ||
		(requiredRole === "admin" && userProfile.role !== "admin") ||
		(requiredRole === "official" &&
			!["official", "admin"].includes(userProfile.role)) ||
		(requiredRole === "resident" &&
			["official", "admin"].includes(userProfile.role))
	) {
		return null;
	}

	return <>{children}</>;
}
