"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: ("admin" | "official")[];
	redirectTo?: string;
}

export function ProtectedRoute({
	children,
	requiredRoles = ["admin", "official"],
	redirectTo = "/login",
}: ProtectedRouteProps) {
	const { user, userProfile, loading } = useAuth();
	const router = useRouter();
	const [isAuthorized, setIsAuthorized] = useState(false);

	useEffect(() => {
		if (!loading) {
			if (!user) {
				// User not logged in, redirect to login
				router.push(redirectTo);
				return;
			}

			if (!userProfile) {
				// User profile not loaded yet, wait
				return;
			}

			// Check if user has required role
			const userRole = userProfile.role;
			const hasRequiredRole = requiredRoles.includes(
				userRole as "admin" | "official"
			);

			if (!hasRequiredRole) {
				// User doesn't have required role
				setIsAuthorized(false);
				return;
			}

			// User is authorized
			setIsAuthorized(true);
		}
	}, [user, userProfile, loading, requiredRoles, redirectTo, router]);

	// Show loading while checking authentication
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Checking authentication...</p>
				</div>
			</div>
		);
	}

	// User not logged in - will redirect in useEffect
	if (!user) {
		return null;
	}

	// User doesn't have required role
	if (!isAuthorized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
							<AlertTriangle className="h-8 w-8 text-red-600" />
						</div>
						<CardTitle className="text-xl text-red-600">
							Access Denied
						</CardTitle>
						<CardDescription>
							You don't have permission to access this area.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="text-center text-sm text-muted-foreground">
							<p>
								Current role:{" "}
								<span className="font-medium">
									{userProfile?.role || "Unknown"}
								</span>
							</p>
							<p>
								Required roles:{" "}
								<span className="font-medium">
									{requiredRoles.join(" or ")}
								</span>
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => router.push("/")}
								className="flex-1"
							>
								Go to Home
							</Button>
							<Button onClick={() => router.push("/login")} className="flex-1">
								Login as Admin
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// User is authorized, render children
	return <>{children}</>;
}
