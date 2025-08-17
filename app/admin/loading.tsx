import { Loader2, Shield } from "lucide-react";

export default function AdminLoading() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30">
			<div className="flex flex-col items-center space-y-4">
				<div className="relative">
					<Shield className="h-12 w-12 text-primary" />
					<Loader2 className="h-6 w-6 animate-spin text-primary absolute inset-0 m-auto" />
				</div>
				<div className="text-center">
					<h2 className="text-lg font-semibold text-foreground">
						Loading Admin Dashboard
					</h2>
					<p className="text-sm text-muted-foreground">
						Checking authentication...
					</p>
				</div>
			</div>
		</div>
	);
}
