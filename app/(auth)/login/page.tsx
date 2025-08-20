"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/login-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
	const { user, userProfile, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// If user is already authenticated, redirect them based on their role
		if (!loading && user && userProfile) {
			if (userProfile.role === "official" || userProfile.role === "admin") {
				router.push("/admin");
			} else {
				router.push("/");
			}
		}
	}, [user, userProfile, loading, router]);

	const handleLogin = () => {
		// This will be handled by the LoginForm component
		console.log("Login successful");
	};

	// Show loading spinner while checking authentication state
	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	// If user is already logged in, don't show login form
	if (user && userProfile) {
		return null; // Will redirect in useEffect
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
					{/* Login Form */}
					<div className="w-full max-w-md mx-auto">
						<Card className="shadow-xl border-0">
							<CardHeader className="text-center pb-6">
								<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
									<svg
										className="h-8 w-8 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
								</div>
								<CardTitle className="text-2xl font-bold text-gray-900">
									Welcome to Barangay Malinta
								</CardTitle>
								<CardDescription className="text-gray-600">
									Sign in to access your account
								</CardDescription>
							</CardHeader>
							<CardContent>
								<LoginForm onLogin={handleLogin} />
							</CardContent>
						</Card>

						<div className="mt-6 text-center text-sm text-gray-600 space-y-2">
							<p>
								Don't have an account?{" "}
								<Link href="/register" className="text-primary hover:underline font-medium">
									Register as a resident
								</Link>
							</p>
							<p>
								Having trouble? Contact support at{" "}
								<a
									href="mailto:support@barangay.gov"
									className="text-primary hover:underline"
								>
									support@barangay.gov
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
