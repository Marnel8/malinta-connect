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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
			<div className="w-full max-w-md">
				{/* Back to Home Button */}
				<div className="mb-6 text-center">
					<Button
						variant="ghost"
						asChild
						className="text-muted-foreground hover:text-foreground"
					>
						<Link href="/">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Link>
					</Button>
				</div>

				<Card className="shadow-xl border-0">
					<CardHeader className="text-center pb-6">
						<div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-primary/20 flex items-center justify-center">
							<Image
								src="/images/malinta_logo.jpg"
								alt="Barangay Malinta Logo"
								width={80}
								height={80}
								className="object-cover rounded-full"
							/>
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
						<Link
							href="/register"
							className="text-primary hover:underline font-medium"
						>
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
	);
}
