import type React from "react";
import "@/app/globals.css";
import { Inter, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/contexts/language-context";
import { SitesLogoutButton } from "@/components/sites-logout-button";

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
	title: "Barangay Malinta - Los Baños, Laguna",
	description:
		"Official portal of Barangay Malinta, Los Baños, Laguna. Access barangay services online.",
	generator: "v0.dev",
};

export default function SiteLayout({
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
					<div className="flex min-h-screen flex-col">
						<Header />
						{/* Logout button for logged-in users */}
						<SitesLogoutButton />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
					<Toaster position="bottom-right" />
				</LanguageProvider>
			</ThemeProvider>
		</div>
	);
}
