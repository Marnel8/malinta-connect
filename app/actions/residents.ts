"use server";

import { adminDatabase, adminAuth } from "@/app/firebase/admin";
import { archiveRecord } from "@/lib/archive-manager";

export interface ResidentData {
	uid: string;
	personalInfo: {
		firstName: string;
		middleName?: string;
		lastName: string;
		suffix?: string;
		dateOfBirth: string;
		placeOfBirth: string;
		gender: "male" | "female" | "other";
		civilStatus: "single" | "married" | "widowed" | "divorced" | "separated";
	};
	contactInfo: {
		email: string;
		phoneNumber: string;
		alternateNumber?: string;
	};
	addressInfo: {
		houseNumber: string;
		street: string;
		purok: string;
		barangay: string;
		city: string;
		province: string;
		zipCode: string;
		fullAddress: string;
	};
	emergencyContact: {
		name: string;
		phoneNumber: string;
		relation: string;
	};
	verification: {
		idFrontPhotoUrl: string;
		idBackPhotoUrl: string;
		selfiePhotoUrl: string;
		status: "pending" | "verified" | "rejected";
		submittedAt: number;
		reviewedAt?: number;
		reviewedBy?: string;
		notes?: string;
	};
	registrationDate: number;
	status: "active" | "inactive";
}

export interface ResidentListItem {
	uid: string;
	name: string;
	email: string;
	phone: string;
	address: string;
	verificationStatus: "pending" | "verified" | "rejected";
	registeredOn: string;
	profileImageUrl?: string;
	age?: number;
	purok?: string;
	gender?: string;
}

export async function getResidentsAction(): Promise<{
	success: boolean;
	residents?: ResidentListItem[];
	error?: string;
}> {
	try {
		const residentsRef = adminDatabase.ref("residents");
		const snapshot = await residentsRef.get();

		if (!snapshot.exists()) {
			return { success: true, residents: [] };
		}

		const residentsData = snapshot.val();
		const residents: ResidentListItem[] = [];

		for (const uid in residentsData) {
			const resident: ResidentData = residentsData[uid];
			
			// Calculate age from date of birth
			const calculateAge = (dateOfBirth: string): number => {
				const today = new Date();
				const birthDate = new Date(dateOfBirth);
				let age = today.getFullYear() - birthDate.getFullYear();
				const monthDiff = today.getMonth() - birthDate.getMonth();
				if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
					age--;
				}
				return age;
			};

			const fullName = `${resident.personalInfo.firstName} ${
				resident.personalInfo.middleName
					? resident.personalInfo.middleName + " "
					: ""
			}${resident.personalInfo.lastName}${
				resident.personalInfo.suffix ? " " + resident.personalInfo.suffix : ""
			}`;

			// Clean the name by removing "N/A" parts
			const cleanName = fullName
				.replace(/\bn\/a\b/gi, '') // Remove standalone "N/A" (case-insensitive)
				.replace(/\s+/g, ' ') // Replace multiple spaces with single space
				.trim(); // Remove leading/trailing spaces

			residents.push({
				uid,
				name: cleanName,
				email: resident.contactInfo.email,
				phone: resident.contactInfo.phoneNumber,
				address: resident.addressInfo.fullAddress,
				verificationStatus: resident.verification.status,
				registeredOn: new Date(resident.registrationDate).toLocaleDateString(),
				profileImageUrl: resident.verification.selfiePhotoUrl,
				age: calculateAge(resident.personalInfo.dateOfBirth),
				purok: resident.addressInfo.purok,
				gender: resident.personalInfo.gender,
			});
		}

		// Sort by registration date (newest first)
		residents.sort(
			(a, b) =>
				new Date(b.registeredOn).getTime() - new Date(a.registeredOn).getTime()
		);

		return { success: true, residents };
	} catch (error) {
		console.error("Error fetching residents:", error);
		return { success: false, error: "Failed to fetch residents" };
	}
}

export async function getResidentDetailsAction(uid: string): Promise<{
	success: boolean;
	resident?: ResidentData;
	error?: string;
}> {
	try {
		const residentRef = adminDatabase.ref(`residents/${uid}`);
		const snapshot = await residentRef.get();

		if (!snapshot.exists()) {
			return { success: false, error: "Resident not found" };
		}

		const resident = snapshot.val() as ResidentData;
		return { success: true, resident };
	} catch (error) {
		console.error("Error fetching resident details:", error);
		return { success: false, error: "Failed to fetch resident details" };
	}
}

export async function updateResidentVerificationAction(
	uid: string,
	status: "verified" | "rejected",
	notes?: string,
	reviewerId?: string
): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const residentRef = adminDatabase.ref(`residents/${uid}`);
		const snapshot = await residentRef.get();

		if (!snapshot.exists()) {
			return { success: false, error: "Resident not found" };
		}

		const residentData = snapshot.val() as ResidentData;
		const residentName = `${residentData.personalInfo.firstName} ${residentData.personalInfo.lastName}`;

		const updates = {
			[`residents/${uid}/verification/status`]: status,
			[`residents/${uid}/verification/reviewedAt`]: Date.now(),
			[`residents/${uid}/verification/reviewedBy`]: reviewerId || "admin",
			[`residents/${uid}/verification/notes`]: notes || "",
			[`users/${uid}/verificationStatus`]: status, // Also update user profile verification status
			[`users/${uid}/updatedAt`]: Date.now(), // Update user profile timestamp
		};

		await adminDatabase.ref().update(updates);

		// Send push notification to the resident about their verification status
		try {
			const { sendResidentVerificationNotificationAction } = await import("@/app/actions/notifications");
			await sendResidentVerificationNotificationAction(
				uid,
				residentName,
				status,
				notes
			);
		} catch (notificationError) {
			console.error("Error sending verification notification:", notificationError);
			// Don't fail the entire operation if notification fails
		}

		// Send email notification to the resident about their verification status
		try {
			const { sendVerificationStatusEmail } = await import("@/mails");
			const verificationEmailData = {
				residentName,
				email: residentData.contactInfo.email,
				verificationDate: new Date().toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				}),
				notes: notes || "",
				contactPhone: process.env.CONTACT_PHONE || "",
				contactEmail: process.env.CONTACT_EMAIL || process.env.SMTP_USER || "",
			};

			await sendVerificationStatusEmail(
				residentData.contactInfo.email,
				status,
				verificationEmailData
			);
		} catch (emailError) {
			console.error("Error sending verification email:", emailError);
			// Don't fail the entire operation if email fails
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating resident verification:", error);
		return { success: false, error: "Failed to update verification status" };
	}
}

export async function updateResidentStatusAction(
	uid: string,
	status: "active" | "inactive"
): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const residentRef = adminDatabase.ref(`residents/${uid}/status`);
		await residentRef.set(status);

		return { success: true };
	} catch (error) {
		console.error("Error updating resident status:", error);
		return { success: false, error: "Failed to update resident status" };
	}
}

export async function deleteResidentAction(uid: string): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const residentRef = adminDatabase.ref(`residents/${uid}`);
		const userRef = adminDatabase.ref(`users/${uid}`);

		const [residentSnapshot, userSnapshot] = await Promise.all([
			residentRef.get(),
			userRef.get(),
		]);

		if (!residentSnapshot.exists()) {
			return { success: false, error: "Resident not found" };
		}

		const resident = residentSnapshot.val() as ResidentData;
		const user = userSnapshot.exists() ? userSnapshot.val() : null;

		try {
			await adminAuth.updateUser(uid, { disabled: true });
		} catch (authError) {
			console.warn("Failed to disable resident auth account:", authError);
		}

		const paths: Record<string, unknown> = {
			[`residents/${uid}`]: resident,
		};

		if (user) {
			paths[`users/${uid}`] = user;
		}

		await archiveRecord({
			entity: "residents",
			id: uid,
			paths,
			preview: {
				name: `${resident.personalInfo.firstName} ${resident.personalInfo.lastName}`.trim(),
				email: resident.contactInfo.email,
				status: resident.status,
				verificationStatus: resident.verification.status,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting resident:", error);
		return { success: false, error: "Failed to delete resident" };
	}
}

export async function searchResidentsAction(
	query: string,
	statusFilter?: string,
	typeFilter?: string
): Promise<{
	success: boolean;
	residents?: ResidentListItem[];
	error?: string;
}> {
	try {
		const residentsRef = adminDatabase.ref("residents");
		const snapshot = await residentsRef.get();

		if (!snapshot.exists()) {
			return { success: true, residents: [] };
		}

		const residentsData = snapshot.val();
		let residents: ResidentListItem[] = [];

		for (const uid in residentsData) {
			const resident: ResidentData = residentsData[uid];
			const fullName = `${resident.personalInfo.firstName} ${
				resident.personalInfo.middleName
					? resident.personalInfo.middleName + " "
					: ""
			}${resident.personalInfo.lastName}${
				resident.personalInfo.suffix ? " " + resident.personalInfo.suffix : ""
			}`;

			// Clean the name by removing "N/A" parts
			const cleanName = fullName
				.replace(/\bn\/a\b/gi, '') // Remove standalone "N/A" (case-insensitive)
				.replace(/\s+/g, ' ') // Replace multiple spaces with single space
				.trim(); // Remove leading/trailing spaces

			// Apply search filter
			if (query && query.trim() !== "") {
				const searchTerm = query.toLowerCase();
				const matchesName = cleanName.toLowerCase().includes(searchTerm);
				const matchesEmail = resident.contactInfo.email
					.toLowerCase()
					.includes(searchTerm);
				const matchesPhone = resident.contactInfo.phoneNumber
					.toLowerCase()
					.includes(searchTerm);
				const matchesAddress = resident.addressInfo.fullAddress
					.toLowerCase()
					.includes(searchTerm);

				if (!matchesName && !matchesEmail && !matchesPhone && !matchesAddress) {
					continue;
				}
			}

			// Apply status filter
			if (
				statusFilter &&
				statusFilter !== "all" &&
				resident.verification.status !== statusFilter
			) {
				continue;
			}

			// Calculate age from date of birth
			const calculateAge = (dateOfBirth: string): number => {
				const today = new Date();
				const birthDate = new Date(dateOfBirth);
				let age = today.getFullYear() - birthDate.getFullYear();
				const monthDiff = today.getMonth() - birthDate.getMonth();
				if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
					age--;
				}
				return age;
			};

			residents.push({
				uid,
				name: cleanName,
				email: resident.contactInfo.email,
				phone: resident.contactInfo.phoneNumber,
				address: resident.addressInfo.fullAddress,
				verificationStatus: resident.verification.status,
				registeredOn: new Date(resident.registrationDate).toLocaleDateString(),
				profileImageUrl: resident.verification.selfiePhotoUrl,
				age: calculateAge(resident.personalInfo.dateOfBirth),
				purok: resident.addressInfo.purok,
				gender: resident.personalInfo.gender,
			});
		}

		// Sort by registration date (newest first)
		residents.sort(
			(a, b) =>
				new Date(b.registeredOn).getTime() - new Date(a.registeredOn).getTime()
		);

		return { success: true, residents };
	} catch (error) {
		console.error("Error searching residents:", error);
		return { success: false, error: "Failed to search residents" };
	}
}
