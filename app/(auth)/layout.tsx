import type React from "react";
import "@/app/globals.css";
import { Inter, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/language-context";

// Font for body text
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

// Font for headings
const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-heading",
	display: "swap",
});

export const metadata = {
	title: "Barangay Malinta - Account Access",
	description:
		"Sign in or register for Barangay Malinta services - Los Baños, Laguna",
	generator: "v0.dev",
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"min-h-screen bg-background font-sans antialiased",
				inter.variable,
				montserrat.variable
			)}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="light"
				enableSystem
				disableTransitionOnChange
			>
				<LanguageProvider>
					<main className="min-h-screen">
						{children}
					</main>
					<Toaster />
				</LanguageProvider>
			</ThemeProvider>
		</div>
	);
}
