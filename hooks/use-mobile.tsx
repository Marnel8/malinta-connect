"use client";

import { useEffect, useState } from "react";

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);

		const checkIfMobile = () => {
			if (typeof window !== "undefined") {
				setIsMobile(window.innerWidth < 768);
			}
		};

		// Initial check
		checkIfMobile();

		// Add event listener
		if (typeof window !== "undefined") {
			window.addEventListener("resize", checkIfMobile);

			// Clean up
			return () => window.removeEventListener("resize", checkIfMobile);
		}
	}, []);

	// Return false during SSR to prevent hydration mismatch
	if (!isClient) {
		return false;
	}

	return isMobile;
}
