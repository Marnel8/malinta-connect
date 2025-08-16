"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "@/app/firebase/firebase";

export function QuickRegister() {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	const handleQuickRegister = async () => {
		setIsLoading(true);
		setError(null);
		setIsSuccess(false);

		try {
			// Create user with Firebase Auth directly (no server action)
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				"official@gmail.com",
				"official123456"
			);

			const user = userCredential.user;
			console.log("✅ User created:", user.uid);

			// Create user profile in database
			const userProfile = {
				uid: user.uid,
				email: "official@gmail.com",
				role: "official",
				firstName: "Official",
				lastName: "User",
				phoneNumber: "+63 912 345 6789",
				address: "Barangay Hall, Barangay Malinta, Los Baños, Laguna",
				position: "Barangay Official",
				createdAt: Date.now(),
				updatedAt: Date.now(),
				permissions: {
					canManageUsers: false,
					canManageEvents: true,
					canManageCertificates: true,
					canManageAppointments: true,
					canViewAnalytics: false,
					canManageSettings: false,
				},
			};

			// Save to database
			await set(ref(database, `users/${user.uid}`), userProfile);
			console.log("✅ User profile saved to database");

			setIsSuccess(true);
			toast({
				title: "Registration Successful!",
				description:
					"Official user created with email: official@gmail.com, password: official123456",
			});
		} catch (error: any) {
			console.error("Registration error:", error);

			let errorMessage = "An error occurred during registration.";

			if (error.code === "auth/email-already-in-use") {
				errorMessage =
					"User already exists. You can login with official@gmail.com / official123456";
			} else if (error.code === "auth/weak-password") {
				errorMessage = "Password is too weak.";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "Invalid email address.";
			}

			setError(errorMessage);
			toast({
				title: "Registration Failed",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
				<CheckCircle className="h-5 w-5" />
				<div>
					<p className="font-medium">User Created Successfully!</p>
					<p className="text-sm text-green-700">
						Email: official@gmail.com | Password: official123456
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="text-center">
				<h3 className="text-lg font-semibold">
					Quick Official User Registration
				</h3>
				<p className="text-sm text-muted-foreground">
					Creates an official user with predefined credentials
				</p>
			</div>

			<Button
				onClick={handleQuickRegister}
				disabled={isLoading}
				className="w-full"
				size="lg"
			>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Creating User...
					</>
				) : (
					<>
						<UserPlus className="mr-2 h-4 w-4" />
						Create Official User
					</>
				)}
			</Button>

			{error && (
				<div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
					<AlertCircle className="h-5 w-5" />
					<p className="text-sm">{error}</p>
				</div>
			)}

			<div className="text-center text-sm text-muted-foreground">
				<p>
					<strong>Email:</strong> official@gmail.com
				</p>
				<p>
					<strong>Password:</strong> official123456
				</p>
				<p>
					<strong>Role:</strong> Official (can access admin dashboard)
				</p>
			</div>
		</div>
	);
}
