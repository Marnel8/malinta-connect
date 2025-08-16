import type React from "react";
import "@/app/globals.css";
import { Inter, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { LanguageProvider } from "@/contexts/language-context";
import { AuthProvider } from "@/contexts/auth-context";

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

	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
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
						<AuthProvider>
							<div className="flex min-h-screen flex-col">
								{/* <Header /> */}
								<main className="flex-1">{children}</main>
								{/* <Footer /> */}
							</div>
							<Toaster position="bottom-right" />
						</AuthProvider>
					</LanguageProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
