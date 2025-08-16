"use server";

import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, database } from "@/app/firebase/firebase";

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
	};
}

export async function signInAction(email: string, password: string) {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Get user profile from database
		const userRef = ref(database, `users/${user.uid}`);
		const userSnapshot = await get(userRef);

		if (userSnapshot.exists()) {
			const userData = userSnapshot.val() as UserProfile;
			return { success: true, user: userData, firebaseUser: user };
		} else {
			// User doesn't exist in database, treat as resident
			const defaultProfile: UserProfile = {
				uid: user.uid,
				email: user.email || "",
				role: "resident",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};
			return { success: true, user: defaultProfile, firebaseUser: user };
		}
	} catch (error: any) {
		console.error("Sign in error:", error);

		let errorMessage = "An error occurred during sign in. Please try again.";

		if (error.code === "auth/user-not-found") {
			errorMessage = "No account found with this email address.";
		} else if (error.code === "auth/wrong-password") {
			errorMessage = "Incorrect password. Please try again.";
		} else if (error.code === "auth/invalid-email") {
			errorMessage = "Invalid email address.";
		} else if (error.code === "auth/too-many-requests") {
			errorMessage = "Too many failed attempts. Please try again later.";
		}

		return { success: false, error: errorMessage };
	}
}

export async function createUserAction(
	email: string,
	password: string,
	role: "resident" | "official" | "admin" = "resident",
	additionalData: Partial<UserProfile> = {}
) {
	try {
		// Create user with Firebase Auth
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Create user profile
		const userProfile: UserProfile = {
			uid: user.uid,
			email: user.email || "",
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
				};
			}
		}

		// Save to database
		await set(ref(database, `users/${user.uid}`), userProfile);

		return { success: true, user: userProfile, firebaseUser: user };
	} catch (error: any) {
		console.error("User creation error:", error);

		let errorMessage =
			"An error occurred during user creation. Please try again.";

		if (error.code === "auth/email-already-in-use") {
			errorMessage = "An account with this email already exists.";
		} else if (error.code === "auth/weak-password") {
			errorMessage = "Password is too weak. Please choose a stronger password.";
		} else if (error.code === "auth/invalid-email") {
			errorMessage = "Invalid email address.";
		}

		return { success: false, error: errorMessage };
	}
}

export async function getUserProfileAction(
	uid: string
): Promise<UserProfile | null> {
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

export async function updateUserProfileAction(
	uid: string,
	updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
	try {
		const userRef = ref(database, `users/${uid}`);
		const currentProfile = await getUserProfileAction(uid);

		if (currentProfile) {
			const updatedProfile = {
				...currentProfile,
				...updates,
				updatedAt: Date.now(),
			};

			await set(userRef, updatedProfile);
			return { success: true };
		} else {
			return { success: false, error: "User profile not found" };
		}
	} catch (error) {
		console.error("Error updating user profile:", error);
		return { success: false, error: "Failed to update user profile" };
	}
}

export async function checkUserRoleAction(uid: string): Promise<string | null> {
	try {
		const profile = await getUserProfileAction(uid);
		return profile?.role || null;
	} catch (error) {
		console.error("Error checking user role:", error);
		return null;
	}
}

export async function logoutAction(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		await signOut(auth);
		return { success: true };
	} catch (error: any) {
		console.error("Logout error:", error);
		return { success: false, error: "Failed to logout. Please try again." };
	}
}
