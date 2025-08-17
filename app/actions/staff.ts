"use server";

import { adminDatabase } from "@/app/firebase/admin";
import { UserProfile } from "./auth";

export interface StaffMember extends Omit<UserProfile, "permissions"> {
	role: "official" | "admin";
	department?: string;
	employeeId?: string;
	hireDate?: number;
	status: "active" | "inactive" | "suspended";
	permissions?: StaffPermissions;
}

export interface StaffPermissions {
	canManageUsers: boolean;
	canManageEvents: boolean;
	canManageCertificates: boolean;
	canManageAppointments: boolean;
	canViewAnalytics: boolean;
	canManageSettings: boolean;
	canManageBlotter: boolean;
	canManageOfficials: boolean;
	canManageResidents: boolean;
	canManageAnnouncements: boolean;
}

// Get all staff members
export async function getAllStaffAction(): Promise<{
	success: boolean;
	staff?: StaffMember[];
	error?: string;
}> {
	try {
		const usersRef = adminDatabase.ref("users");
		const snapshot = await usersRef.get();

		if (!snapshot.exists()) {
			return { success: true, staff: [] };
		}

		const users = snapshot.val();
		const staffMembers: StaffMember[] = [];

		Object.values(users).forEach((user: any) => {
			if (user.role === "admin" || user.role === "official") {
				staffMembers.push({
					...user,
					status: user.status || "active",
				});
			}
		});

		// Sort by creation date (newest first)
		staffMembers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, staff: staffMembers };
	} catch (error) {
		console.error("Error fetching staff:", error);
		return {
			success: false,
			error: "Failed to fetch staff members. Please try again.",
		};
	}
}

// Get single staff member
export async function getStaffMemberAction(
	uid: string
): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
	try {
		const userRef = adminDatabase.ref(`users/${uid}`);
		const snapshot = await userRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Staff member not found.",
			};
		}

		const user = snapshot.val();
		if (user.role !== "admin" && user.role !== "official") {
			return {
				success: false,
				error: "User is not a staff member.",
			};
		}

		return {
			success: true,
			staff: {
				...user,
				status: user.status || "active",
			},
		};
	} catch (error) {
		console.error("Error fetching staff member:", error);
		return {
			success: false,
			error: "Failed to fetch staff member. Please try again.",
		};
	}
}

// Create new staff member
export async function createStaffMemberAction(
	email: string,
	password: string,
	staffData: {
		firstName: string;
		lastName: string;
		role: "official" | "admin";
		phoneNumber?: string;
		address?: string;
		position?: string;
		department?: string;
		employeeId?: string;
		permissions?: StaffPermissions;
	}
): Promise<{ success: boolean; staff?: StaffMember; error?: string }> {
	try {
		// Import Firebase Auth Admin SDK
		const { getAuth } = await import("firebase-admin/auth");
		const auth = getAuth();

		// Create user in Firebase Auth
		const userRecord = await auth.createUser({
			email,
			password,
			emailVerified: true,
		});

		// Define default permissions based on role
		const defaultPermissions: StaffPermissions = {
			canManageUsers: staffData.role === "admin",
			canManageEvents: true,
			canManageCertificates: true,
			canManageAppointments: true,
			canViewAnalytics: staffData.role === "admin",
			canManageSettings: staffData.role === "admin",
			canManageBlotter: true,
			canManageOfficials: staffData.role === "admin",
			canManageResidents: staffData.role === "admin",
			canManageAnnouncements: true,
		};

		// Merge with provided permissions
		const permissions = {
			...defaultPermissions,
			...staffData.permissions,
		};

		// Create staff profile, filtering out undefined values
		const staffProfile: any = {
			uid: userRecord.uid,
			email,
			role: staffData.role,
			firstName: staffData.firstName,
			lastName: staffData.lastName,
			hireDate: Date.now(),
			status: "active",
			createdAt: Date.now(),
			updatedAt: Date.now(),
			permissions,
		};

		// Only add optional fields if they have values (not empty strings)
		if (staffData.phoneNumber && staffData.phoneNumber.trim()) staffProfile.phoneNumber = staffData.phoneNumber;
		if (staffData.address && staffData.address.trim()) staffProfile.address = staffData.address;
		if (staffData.position && staffData.position.trim()) staffProfile.position = staffData.position;
		if (staffData.department && staffData.department.trim()) staffProfile.department = staffData.department;
		if (staffData.employeeId && staffData.employeeId.trim()) staffProfile.employeeId = staffData.employeeId;

		// Save to database
		await adminDatabase.ref(`users/${userRecord.uid}`).set(staffProfile);

		return { success: true, staff: staffProfile };
	} catch (error: any) {
		console.error("Error creating staff member:", error);

		let errorMessage = "Failed to create staff member. Please try again.";
		if (error.code === "auth/email-already-exists") {
			errorMessage = "Email already exists. Please use a different email.";
		} else if (error.code === "auth/invalid-email") {
			errorMessage = "Invalid email address.";
		} else if (error.code === "auth/weak-password") {
			errorMessage = "Password is too weak. Please use a stronger password.";
		}

		return {
			success: false,
			error: errorMessage,
		};
	}
}

// Update staff member
export async function updateStaffMemberAction(
	uid: string,
	updates: {
		firstName?: string;
		lastName?: string;
		phoneNumber?: string;
		address?: string;
		position?: string;
		department?: string;
		employeeId?: string;
		status?: "active" | "inactive" | "suspended";
		permissions?: StaffPermissions;
	}
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get current staff member
		const currentStaffResult = await getStaffMemberAction(uid);
		if (!currentStaffResult.success || !currentStaffResult.staff) {
			return {
				success: false,
				error: "Staff member not found.",
			};
		}

		// Prepare update data, excluding permissions for separate handling
		const { permissions, ...otherUpdates } = updates;
		const updateData: any = {
			updatedAt: Date.now(),
		};

		// Only add fields that have values (not undefined or empty strings)
		Object.entries(otherUpdates).forEach(([key, value]) => {
			if (value !== undefined && value !== "" && (typeof value !== 'string' || value.trim())) {
				updateData[key] = value;
			}
		});

		// If updating permissions, set the new permissions
		if (permissions) {
			updateData.permissions = permissions;
		}

		// Update in database
		await adminDatabase.ref(`users/${uid}`).update(updateData);

		return { success: true };
	} catch (error) {
		console.error("Error updating staff member:", error);
		return {
			success: false,
			error: "Failed to update staff member. Please try again.",
		};
	}
}

// Delete staff member
export async function deleteStaffMemberAction(
	uid: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Import Firebase Auth Admin SDK
		const { getAuth } = await import("firebase-admin/auth");
		const auth = getAuth();

		// Delete from Firebase Auth
		await auth.deleteUser(uid);

		// Delete from database
		await adminDatabase.ref(`users/${uid}`).remove();

		return { success: true };
	} catch (error: any) {
		console.error("Error deleting staff member:", error);

		let errorMessage = "Failed to delete staff member. Please try again.";
		if (error.code === "auth/user-not-found") {
			// Still try to remove from database
			try {
				await adminDatabase.ref(`users/${uid}`).remove();
				return { success: true };
			} catch (dbError) {
				errorMessage = "Staff member not found.";
			}
		}

		return {
			success: false,
			error: errorMessage,
		};
	}
}

// Toggle staff member status
export async function toggleStaffStatusAction(
	uid: string,
	status: "active" | "inactive" | "suspended"
): Promise<{ success: boolean; error?: string }> {
	try {
		await adminDatabase.ref(`users/${uid}`).update({
			status,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating staff status:", error);
		return {
			success: false,
			error: "Failed to update staff status. Please try again.",
		};
	}
}

// Update staff permissions
export async function updateStaffPermissionsAction(
	uid: string,
	permissions: StaffPermissions
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get current staff member to verify they exist
		const currentStaffResult = await getStaffMemberAction(uid);
		if (!currentStaffResult.success || !currentStaffResult.staff) {
			return {
				success: false,
				error: "Staff member not found.",
			};
		}

		// Update in database
		await adminDatabase.ref(`users/${uid}`).update({
			permissions,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating staff permissions:", error);
		return {
			success: false,
			error: "Failed to update permissions. Please try again.",
		};
	}
}
