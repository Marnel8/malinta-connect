import { ref, set, get } from "firebase/database";
import { database } from "@/app/firebase/firebase";
import { User } from "firebase/auth";

export interface UserProfile {
	uid: string;
	email: string;
	role: "resident" | "official" | "admin";
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	address?: string;
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

export async function createUserProfile(
	user: User,
	role: "resident" | "official" | "admin" = "resident",
	additionalData: Partial<UserProfile> = {}
): Promise<void> {
	try {
		const userProfile: UserProfile = {
			uid: user.uid,
			email: user.email || "",
			role,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			...additionalData,
		};

		await set(ref(database, `users/${user.uid}`), userProfile);
	} catch (error) {
		console.error("Error creating user profile:", error);
		throw error;
	}
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
	try {
		const userRef = ref(database, `users/${uid}`);
		const userSnapshot = await get(userRef);

		if (userSnapshot.exists()) {
			return userSnapshot.val() as UserProfile;
		}

		return null;
	} catch (error) {
		console.error("Error getting user profile:", error);
		return null;
	}
}

export async function updateUserProfile(
	uid: string,
	updates: Partial<UserProfile>
): Promise<void> {
	try {
		const userRef = ref(database, `users/${uid}`);
		const currentProfile = await getUserProfile(uid);

		if (currentProfile) {
			const updatedProfile = {
				...currentProfile,
				...updates,
				updatedAt: Date.now(),
			};

			await set(userRef, updatedProfile);
		}
	} catch (error) {
		console.error("Error updating user profile:", error);
		throw error;
	}
}

export async function checkUserRole(uid: string): Promise<string | null> {
	try {
		const profile = await getUserProfile(uid);
		return profile?.role || null;
	} catch (error) {
		console.error("Error checking user role:", error);
		return null;
	}
}
