"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft, MailCheck, MailWarning } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { toastError, toastSuccess } from "@/lib/toast-presets";

const formSchema = z.object({
	email: z
		.string({
			required_error: "Email address is required.",
		})
		.email("Please enter a valid email address."),
});

type StatusState = {
	type: "success" | "error";
	message: string;
} | null;

export default function ForgotPasswordPage() {
	const [status, setStatus] = useState<StatusState>(null);
	const [isPending, startTransition] = useTransition();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	const handleSubmit = (values: z.infer<typeof formSchema>) => {
		setStatus(null);

		startTransition(async () => {
			const result = await requestPasswordResetAction(values.email);

			if (result.success) {
				const message =
					result.message ||
					"Password reset link sent. Please check your inbox.";

				setStatus({ type: "success", message });
				toastSuccess({
					title: "Email sent",
					description: message,
				});
				form.reset();
			} else {
				const errorMessage =
					result.error ||
					"We couldn't send the reset link. Please try again later.";

				setStatus({ type: "error", message: errorMessage });
				toastError({
					title: "Reset failed",
					description: errorMessage,
				});
			}
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
			<div className="w-full max-w-md">
				<div className="mb-6 text-center">
					<Button
						variant="ghost"
						asChild
						className="text-muted-foreground hover:text-foreground"
					>
						<Link href="/login">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Login
						</Link>
					</Button>
				</div>

				<Card className="shadow-xl border-0">
					<CardHeader className="text-center pb-6">
						<div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-primary/20 flex items-center justify-center bg-white">
							<Image
								src="/images/malinta_logo.jpg"
								alt="Barangay Malinta Logo"
								width={80}
								height={80}
								className="object-cover rounded-full"
								priority
							/>
						</div>
						<CardTitle className="text-2xl font-bold text-gray-900">
							Forgot your password?
						</CardTitle>
						<CardDescription className="text-gray-600">
							Enter your email and we will send you a reset link.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{status && (
							<Alert variant={status.type === "error" ? "destructive" : "default"}>
								{status.type === "error" ? (
									<MailWarning className="h-4 w-4" />
								) : (
									<MailCheck className="h-4 w-4" />
								)}
								<AlertTitle>
									{status.type === "error" ? "Something went wrong" : "Check your inbox"}
								</AlertTitle>
								<AlertDescription>{status.message}</AlertDescription>
							</Alert>
						)}

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleSubmit)}
								className="space-y-6"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email address</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="you@email.com"
													{...field}
													disabled={isPending}
													className="transition-all focus-visible:ring-primary"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full transition-all duration-300 hover:shadow-md"
									disabled={isPending}
								>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Sending reset link...
										</>
									) : (
										"Send reset link"
									)}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				<div className="mt-6 text-center text-sm text-gray-600 space-y-2">
					<p>
						Remembered your password?{" "}
						<Link href="/login" className="text-primary hover:underline font-medium">
							Back to login
						</Link>
					</p>
					<p>
						Need help? Contact support at{" "}
						<a
							href="mailto:support@barangay.gov"
							className="text-primary hover:underline font-medium"
						>
							support@barangay.gov
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}

