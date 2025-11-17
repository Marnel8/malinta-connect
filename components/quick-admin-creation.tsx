"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Loader2, Crown, AlertTriangle } from "lucide-react";
import { toastError, toastSuccess } from "@/lib/toast-presets";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";
import { createUserProfileAction } from "@/app/actions/auth";

export function QuickAdminCreation() {
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("admin@barangay.gov");
	const [password, setPassword] = useState("admin123456");

	const handleCreateAdmin = async () => {
		if (!email || !password) {
			toastError({
				title: "Missing information",
				description: "Please provide both email and password.",
			});
			return;
		}

		setIsLoading(true);

		try {
			// Create user with Firebase Auth
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;

			// Create admin profile using server action
			const profileResult = await createUserProfileAction(
				user.uid,
				user.email || "",
				"admin",
				{
					firstName: "Admin",
					lastName: "User",
					position: "System Administrator",
				}
			);

			if (profileResult.success) {
				toastSuccess({
					title: "Admin account created",
					description: `Admin account created successfully for ${email}.`,
				});

				// Clear form
				setEmail("admin@barangay.gov");
				setPassword("admin123456");
			} else {
				toastError({
					title: "Profile creation failed",
					description: profileResult.error || "Failed to create admin profile.",
				});
			}
		} catch (error: any) {
			console.error("Admin creation error:", error);

			let errorMessage = "An error occurred while creating the admin account.";

			if (error.code === "auth/email-already-in-use") {
				errorMessage = "An account with this email already exists.";
			} else if (error.code === "auth/weak-password") {
				errorMessage =
					"Password is too weak. Please choose a stronger password.";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "Invalid email address.";
			}

			toastError({
				title: "Admin creation failed",
				description: errorMessage,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
					<Crown className="h-6 w-6 text-yellow-600" />
				</div>
				<CardTitle className="text-xl">Quick Admin Creation</CardTitle>
				<CardDescription>
					Create an admin account for development/testing purposes
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="admin-email">Admin Email</Label>
					<Input
						id="admin-email"
						type="email"
						placeholder="admin@barangay.gov"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="font-mono text-sm"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="admin-password">Admin Password</Label>
					<Input
						id="admin-password"
						type="password"
						placeholder="admin123456"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="font-mono text-sm"
					/>
				</div>

				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
					<div className="flex items-start space-x-2">
						<AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
						<div className="text-sm text-yellow-800">
							<strong>Warning:</strong> This creates a real admin account with
							full system access. Only use for development/testing.
						</div>
					</div>
				</div>

				<Button
					onClick={handleCreateAdmin}
					disabled={isLoading}
					className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating Admin Account...
						</>
					) : (
						<>
							<Crown className="mr-2 h-4 w-4" />
							Create Admin Account
						</>
					)}
				</Button>

				<div className="text-xs text-center text-gray-500">
					Default credentials: admin@barangay.gov / admin123456
				</div>
			</CardContent>
		</Card>
	);
}
