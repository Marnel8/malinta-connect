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

export interface ResidentRegistrationData {
	// Personal Information
	firstName: string;
	middleName?: string;
	lastName: string;
	suffix?: string;
	dateOfBirth: string;
	placeOfBirth: string;
	gender: "male" | "female" | "other";
	civilStatus: "single" | "married" | "widowed" | "divorced" | "separated";
	
	// Contact Information
	email: string;
	phoneNumber: string;
	alternateNumber?: string;
	
	// Address Information
	houseNumber: string;
	street: string;
	purok: string;
	barangay: string;
	city: string;
	province: string;
	zipCode: string;
	
	// Emergency Contact
	emergencyContactName: string;
	emergencyContactNumber: string;
	emergencyContactRelation: string;
	
	// Account Information
	password: string;
	
	// Photo URLs
	idPhotoUrl: string;
	selfiePhotoUrl: string;
}

export async function registerResidentAction(
	data: ResidentRegistrationData
): Promise<{ success: boolean; error?: string }> {
	try {
		// Import Firebase admin auth
		const { getAuth } = await import("firebase-admin/auth");
		const { adminApp } = await import("@/app/firebase/admin");
		
		const auth = getAuth(adminApp);

		// Create user with Firebase Auth
		const userRecord = await auth.createUser({
			email: data.email,
			password: data.password,
			displayName: `${data.firstName} ${data.lastName}`,
		});

		// Create detailed user profile
		const userProfile: UserProfile = {
			uid: userRecord.uid,
			email: data.email,
			role: "resident",
			firstName: data.firstName,
			middleName: data.middleName,
			lastName: data.lastName,
			suffix: data.suffix,
			phoneNumber: data.phoneNumber,
			address: `${data.houseNumber} ${data.street}, ${data.purok}, ${data.barangay}, ${data.city}, ${data.province} ${data.zipCode}`,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		// Save user profile to database
		await adminDatabase.ref(`users/${userRecord.uid}`).set(userProfile);

		// Save detailed resident information
		const residentData = {
			uid: userRecord.uid,
			personalInfo: {
				firstName: data.firstName,
				middleName: data.middleName,
				lastName: data.lastName,
				suffix: data.suffix,
				dateOfBirth: data.dateOfBirth,
				placeOfBirth: data.placeOfBirth,
				gender: data.gender,
				civilStatus: data.civilStatus,
			},
			contactInfo: {
				email: data.email,
				phoneNumber: data.phoneNumber,
				alternateNumber: data.alternateNumber,
			},
			addressInfo: {
				houseNumber: data.houseNumber,
				street: data.street,
				purok: data.purok,
				barangay: data.barangay,
				city: data.city,
				province: data.province,
				zipCode: data.zipCode,
				fullAddress: `${data.houseNumber} ${data.street}, ${data.purok}, ${data.barangay}, ${data.city}, ${data.province} ${data.zipCode}`,
			},
			emergencyContact: {
				name: data.emergencyContactName,
				phoneNumber: data.emergencyContactNumber,
				relation: data.emergencyContactRelation,
			},
			verification: {
				idPhotoUrl: data.idPhotoUrl,
				selfiePhotoUrl: data.selfiePhotoUrl,
				status: "pending", // Will be reviewed by admin
				submittedAt: Date.now(),
			},
			registrationDate: Date.now(),
			status: "active",
		};

		// Save detailed resident data
		await adminDatabase.ref(`residents/${userRecord.uid}`).set(residentData);

		return { success: true };
	} catch (error: any) {
		console.error("Resident registration error:", error);
		
		let errorMessage = "An error occurred during registration. Please try again.";
		
		if (error.code === "auth/email-already-exists") {
			errorMessage = "An account with this email already exists.";
		} else if (error.code === "auth/invalid-email") {
			errorMessage = "Invalid email address.";
		} else if (error.code === "auth/weak-password") {
			errorMessage = "Password is too weak. Please choose a stronger password.";
		}
		
		return {
			success: false,
			error: errorMessage,
		};
	}
}
