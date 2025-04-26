import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full bg-muted/30">
				<AdminSidebar />
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</SidebarProvider>
	);
}
