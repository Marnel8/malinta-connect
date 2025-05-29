"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function FloatingSidebarTrigger() {
	const { state, isMobile } = useSidebar();
	if (isMobile || state === "expanded") return null;
	
	return (
		<SidebarTrigger 
			className="fixed top-4 left-4 z-50 h-10 w-10 bg-background shadow-lg border hover:bg-accent" 
		/>
	);
} 