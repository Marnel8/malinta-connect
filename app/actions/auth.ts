"use server";

import { adminDatabase } from "@/app/firebase/admin";

export interface UserProfile {
	uid: string;
	email: string;
	role: "resident" | "official" | "admin";
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	address?: string;
	position?: string;
	createdAt: number;
	updatedAt: number;
	permissions?: {
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
	};
}

export async function logoutAction(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		// Server action can't directly call Firebase client-side functions
		// The actual logout will be handled on the client side
		// This action is kept for consistency with the API structure
		return { success: true };
	} catch (error) {
		return { success: false, error: "Failed to logout. Please try again." };
	}
}

export async function getUserProfileAction(
	uid: string
): Promise<UserProfile | null> {
	try {
		const userRef = adminDatabase.ref(`users/${uid}`);
		const userSnapshot = await userRef.get();

		if (userSnapshot.exists()) {
			return userSnapshot.val() as UserProfile;
		}

		return null;
	} catch (error) {
		// Return error instead of logging
		return null;
	}
}

export async function createUserProfileAction(
	uid: string,
	email: string,
	role: "resident" | "official" | "admin" = "resident",
	additionalData: Partial<UserProfile> = {}
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
	try {
		// Create user profile
		const userProfile: UserProfile = {
			uid,
			email,
			role,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			...additionalData,
		};

		// Add role-specific fields
		if (role === "admin" || role === "official") {
			if (!userProfile.permissions) {
				userProfile.permissions = {
					canManageUsers: role === "admin",
					canManageEvents: true,
					canManageCertificates: true,
					canManageAppointments: true,
					canViewAnalytics: role === "admin",
					canManageSettings: role === "admin",
					canManageBlotter: true,
					canManageOfficials: true,
					canManageResidents: true,
					canManageAnnouncements: true,
				};
			}
		}

		// Save to database
		await adminDatabase.ref(`users/${uid}`).set(userProfile);

		return { success: true, user: userProfile };
	} catch (error) {
		return {
			success: false,
			error: "Failed to create user profile. Please try again.",
		};
	}
}

export async function updateUserProfileAction(
	uid: string,
	updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
	try {
		const userRef = adminDatabase.ref(`users/${uid}`);
		const currentProfile = await getUserProfileAction(uid);

		if (currentProfile) {
			const updatedProfile = {
				...currentProfile,
				...updates,
				updatedAt: Date.now(),
			};

			await userRef.set(updatedProfile);
			return { success: true };
		} else {
			return {
				success: false,
				error: "User profile not found. Please try logging in again.",
			};
		}
	} catch (error) {
		return {
			success: false,
			error: "Failed to update user profile. Please try again.",
		};
	}
}

export async function checkUserRoleAction(uid: string): Promise<string | null> {
	try {
		const profile = await getUserProfileAction(uid);
		return profile?.role || null;
	} catch (error) {
		return null;
	}
}

export async function ensureUserProfileAction(
	uid: string,
	email: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
	try {
		// Check if user profile exists
		const existingProfile = await getUserProfileAction(uid);

		if (existingProfile) {
			return { success: true, user: existingProfile };
		}

		// Create default profile for new users
		return await createUserProfileAction(uid, email, "resident");
	} catch (error) {
		return {
			success: false,
			error: "Failed to get user profile. Please try again.",
		};
	}
}
