"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "@/app/firebase/firebase";

const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(6, {
		message: "Password must be at least 6 characters.",
	}),
});

export function LoginForm({
	onLogin,
	onClose,
}: {
	onLogin: () => void;
	onClose?: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("resident");
	const { t } = useLanguage();
	const router = useRouter();
	const { toast } = useToast();
	const { updateUserProfile } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);

		try {
			// Sign in with Firebase directly (no server action)
			const userCredential = await signInWithEmailAndPassword(
				auth,
				values.email,
				values.password
			);
			const user = userCredential.user;

			// Get user profile from database
			const userRef = ref(database, `users/${user.uid}`);
			const userSnapshot = await get(userRef);

			let userRole = "resident";
			let userProfile = null;

			if (userSnapshot.exists()) {
				const userData = userSnapshot.val();
				userRole = userData.role || "resident";
				userProfile = userData;
			} else {
				// Create default profile for new users
				userProfile = {
					uid: user.uid,
					email: user.email || "",
					role: "resident",
					createdAt: Date.now(),
					updatedAt: Date.now(),
				};
			}

			// Store user profile and role in localStorage and update auth context
			localStorage.setItem(`userRole_${user.uid}`, userRole);
			localStorage.setItem(
				`userProfile_${user.uid}`,
				JSON.stringify(userProfile)
			);
			updateUserProfile(userProfile);

			// Redirect based on role
			if (userRole === "official" || userRole === "admin") {
				if (activeTab === "official") {
					// Close dialog before redirecting
					if (onClose) onClose();
					router.push("/admin");
				} else {
					// User tried to login as resident but is an official
					toast({
						title: "Access Denied",
						description:
							"This account is for officials only. Please use the official login tab.",
						variant: "destructive",
					});
					setIsLoading(false);
					return;
				}
			} else {
				if (activeTab === "resident") {
					// Close dialog before redirecting
					if (onClose) onClose();
					router.push("/");
				} else {
					// User tried to login as official but is a resident
					toast({
						title: "Access Denied",
						description:
							"This account is for residents only. Please use the resident login tab.",
						variant: "destructive",
					});
					setIsLoading(false);
					return;
				}
			}

			// Call onLogin callback
			onLogin();
		} catch (error: any) {
			console.error("Login error:", error);

			let errorMessage = "An error occurred during login. Please try again.";

			if (error.code === "auth/user-not-found") {
				errorMessage = "No account found with this email address.";
			} else if (error.code === "auth/wrong-password") {
				errorMessage = "Incorrect password. Please try again.";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "Invalid email address.";
			} else if (error.code === "auth/too-many-requests") {
				errorMessage = "Too many failed attempts. Please try again later.";
			}

			toast({
				title: "Login Failed",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
			<TabsList className="grid w-full grid-cols-2 mb-6">
				<TabsTrigger
					value="resident"
					className="transition-all data-[state=active]:shadow-md"
				>
					{t("login.resident")}
				</TabsTrigger>
				<TabsTrigger
					value="official"
					className="transition-all data-[state=active]:shadow-md"
				>
					{t("login.official")}
				</TabsTrigger>
			</TabsList>
			<TabsContent value="resident" className="animate-fade-in">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 pt-2"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("login.email")}</FormLabel>
									<FormControl>
										<Input
											placeholder="your.email@example.com"
											{...field}
											className="transition-all focus-visible:ring-primary"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("login.password")}</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											{...field}
											className="transition-all focus-visible:ring-primary"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="text-sm text-right">
							<Link
								href="/forgot-password"
								className="text-primary hover:underline"
							>
								{t("login.forgotPassword")}
							</Link>
						</div>
						<Button
							type="submit"
							className="w-full transition-all duration-300 hover:shadow-md"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("login.loggingIn")}
								</>
							) : (
								t("login.asResident")
							)}
						</Button>
						<div className="text-center text-sm text-muted-foreground mt-4">
							{t("login.registerPrompt")}{" "}
							<Link href="/register" className="text-primary hover:underline">
								{t("login.registerLink")}
							</Link>
						</div>
					</form>
				</Form>
			</TabsContent>
			<TabsContent value="official" className="animate-fade-in">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 pt-2"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("login.officialEmail")}</FormLabel>
									<FormControl>
										<Input
											placeholder="official.email@barangay.gov"
											{...field}
											className="transition-all focus-visible:ring-primary"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t("login.password")}</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											{...field}
											className="transition-all focus-visible:ring-primary"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="text-sm text-right">
							<Link
								href="/forgot-password"
								className="text-primary hover:underline"
							>
								{t("login.forgotPassword")}
							</Link>
						</div>
						<Button
							type="submit"
							className="w-full transition-all duration-300 hover:shadow-md"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("login.loggingIn")}
								</>
							) : (
								t("login.asOfficial")
							)}
						</Button>
					</form>
				</Form>
			</TabsContent>
		</Tabs>
	);
}
