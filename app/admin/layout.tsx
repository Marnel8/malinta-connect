import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FloatingSidebarTrigger } from "@/components/admin/floating-sidebar-trigger";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full bg-muted/30">
				<AdminSidebar />
				<main className="relative flex-1 overflow-y-auto">
					<FloatingSidebarTrigger />
					<div className="py-14">{children}</div>
				</main>
			</div>
		</SidebarProvider>
	);
}
