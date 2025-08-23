"use server";

import { adminDatabase } from "@/app/firebase/admin";

export interface UserProfile {
	uid: string;
	email: string;
	role: "resident" | "official" | "admin";
	firstName?: string;
	middleName?: string; // Add missing field
	lastName?: string;
	suffix?: string; // Add missing field
	phoneNumber?: string;
	address?: string;
	position?: string;
	avatarUrl?: string; // Add avatar URL field
	createdAt: number;
	updatedAt: number;
	verificationStatus?: "pending" | "verified" | "rejected"; // Add verification status
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
			const userProfile = userSnapshot.val() as UserProfile;

			// If user doesn't have an avatar and is a resident, try to get it from resident data
			if (!userProfile.avatarUrl && userProfile.role === "resident") {
				const residentRef = adminDatabase.ref(
					`residents/${uid}/verification/selfiePhotoUrl`
				);
				const residentSnapshot = await residentRef.get();

				if (residentSnapshot.exists()) {
					userProfile.avatarUrl = residentSnapshot.val();
				}
			}

			return userProfile;
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
			verificationStatus: role === "resident" ? "pending" : "verified", // Set verification status
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

export async function updateUserAvatarAction(
	uid: string,
	avatarUrl: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const result = await updateUserProfileAction(uid, { avatarUrl });
		return result;
	} catch (error) {
		return {
			success: false,
			error: "Failed to update user avatar. Please try again.",
		};
	}
}

export async function updateUserAvatarWithUploadAction(
	uid: string,
	imageDataUrl: string
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
	try {
		// Import the upload action
		const { uploadAvatarAction } = await import("./uploads");

		// Upload the avatar image
		const uploadResult = await uploadAvatarAction(imageDataUrl, uid);

		if (!uploadResult.success || !uploadResult.url) {
			return {
				success: false,
				error: uploadResult.error || "Failed to upload avatar image",
			};
		}

		// Update the user profile with the new avatar URL
		const updateResult = await updateUserProfileAction(uid, {
			avatarUrl: uploadResult.url,
		});

		if (!updateResult.success) {
			return {
				success: false,
				error: updateResult.error || "Failed to update user profile",
			};
		}

		return {
			success: true,
			avatarUrl: uploadResult.url,
		};
	} catch (error) {
		console.error("Avatar update with upload failed:", error);
		return {
			success: false,
			error: "Failed to update avatar. Please try again.",
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
			// For residents, check if they are verified
			if (existingProfile.role === "resident") {
				// Get the latest verification status from residents collection
				const residentRef = adminDatabase.ref(
					`residents/${uid}/verification/status`
				);
				const residentSnapshot = await residentRef.get();

				if (residentSnapshot.exists()) {
					const verificationStatus = residentSnapshot.val();

					// Update the user profile with current verification status
					if (existingProfile.verificationStatus !== verificationStatus) {
						await updateUserProfileAction(uid, { verificationStatus });
						existingProfile.verificationStatus = verificationStatus;
					}

					// Check if resident is verified
					if (verificationStatus === "pending") {
						return {
							success: false,
							error:
								"Your account is pending verification. Please wait for admin approval before logging in.",
						};
					} else if (verificationStatus === "rejected") {
						return {
							success: false,
							error:
								"Your account verification was rejected. Please contact the barangay office for assistance.",
						};
					}
				}
			}

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

export async function getCurrentUserProfileAction(
	uid: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
	try {
		if (!uid) {
			return { success: false, error: "User ID is required" };
		}

		const profile = await getUserProfileAction(uid);

		if (profile) {
			return { success: true, user: profile };
		} else {
			return { success: false, error: "User profile not found" };
		}
	} catch (error) {
		return {
			success: false,
			error: "Failed to get current user profile. Please try again.",
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
			avatarUrl: data.selfiePhotoUrl, // Set selfie photo as default avatar
			verificationStatus: "pending", // Set verification status to pending
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

		// Send notification to admins about new resident registration
		try {
			const { sendNewResidentRegistrationNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			await sendNewResidentRegistrationNotificationAction(
				`${data.firstName} ${data.lastName}`,
				data.email,
				userRecord.uid
			);
		} catch (notificationError) {
			console.error(
				"Error sending new resident notification:",
				notificationError
			);
			// Don't fail the entire registration if notification fails
		}

		return { success: true };
	} catch (error: any) {
		console.error("Resident registration error:", error);

		let errorMessage =
			"An error occurred during registration. Please try again.";

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
