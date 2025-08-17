"use client";

import { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface PermissionGuardProps {
	children: ReactNode;
	requiredPermissions?: string[];
	fallback?: ReactNode;
	showAccessDenied?: boolean;
}

export function PermissionGuard({
	children,
	requiredPermissions = [],
	fallback,
	showAccessDenied = true,
}: PermissionGuardProps) {
	const { userProfile } = useAuth();

	// Check if user has admin role
	const isAdmin = userProfile?.role === "admin";

	// Check if user has any of the required permissions
	const hasPermission =
		isAdmin ||
		requiredPermissions.some(
			(permission) =>
				userProfile?.permissions?.[
					permission as keyof typeof userProfile.permissions
				]
		);

	if (hasPermission) {
		return <>{children}</>;
	}

	if (fallback) {
		return <>{fallback}</>;
	}

	if (!showAccessDenied) {
		return null;
	}

	return (
		<div className="p-6">
			<Card>
				<CardContent className="flex items-center justify-center py-16">
					<div className="text-center">
						<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold">Access Denied</h3>
						<p className="text-muted-foreground">
							You don't have permission to access this feature.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Convenience components for common permission checks
export function CanManageUsers({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canManageUsers"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}

export function CanManageEvents({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canManageEvents"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}

export function CanManageCertificates({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canManageCertificates"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}

export function CanManageAppointments({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canManageAppointments"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}

export function CanManageBlotter({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canManageBlotter"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}

export function CanManageResidents({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canManageResidents"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}

export function CanViewAnalytics({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canViewAnalytics"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}

export function CanManageSettings({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: ReactNode;
}) {
	return (
		<PermissionGuard
			requiredPermissions={["canManageSettings"]}
			fallback={fallback}
		>
			{children}
		</PermissionGuard>
	);
}
