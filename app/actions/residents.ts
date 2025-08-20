"use server";

import { adminDatabase } from "@/app/firebase/admin";

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
    idPhotoUrl: string;
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
      residents.push({
        uid,
        name: `${resident.personalInfo.firstName} ${resident.personalInfo.middleName ? resident.personalInfo.middleName + ' ' : ''}${resident.personalInfo.lastName}${resident.personalInfo.suffix ? ' ' + resident.personalInfo.suffix : ''}`,
        email: resident.contactInfo.email,
        phone: resident.contactInfo.phoneNumber,
        address: resident.addressInfo.fullAddress,
        verificationStatus: resident.verification.status,
        registeredOn: new Date(resident.registrationDate).toLocaleDateString(),
        profileImageUrl: resident.verification.selfiePhotoUrl,
      });
    }

    // Sort by registration date (newest first)
    residents.sort((a, b) => new Date(b.registeredOn).getTime() - new Date(a.registeredOn).getTime());

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

    const updates = {
      [`residents/${uid}/verification/status`]: status,
      [`residents/${uid}/verification/reviewedAt`]: Date.now(),
      [`residents/${uid}/verification/reviewedBy`]: reviewerId || "admin",
      [`residents/${uid}/verification/notes`]: notes || "",
    };

    await adminDatabase.ref().update(updates);

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
    // Delete from residents
    await adminDatabase.ref(`residents/${uid}`).remove();
    
    // Delete from users
    await adminDatabase.ref(`users/${uid}`).remove();

    // Note: In a real app, you might also want to delete from Firebase Auth
    // This would require the Firebase Admin SDK auth module

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
      const fullName = `${resident.personalInfo.firstName} ${resident.personalInfo.middleName ? resident.personalInfo.middleName + ' ' : ''}${resident.personalInfo.lastName}${resident.personalInfo.suffix ? ' ' + resident.personalInfo.suffix : ''}`;
      
      // Apply search filter
      if (query && query.trim() !== "") {
        const searchTerm = query.toLowerCase();
        const matchesName = fullName.toLowerCase().includes(searchTerm);
        const matchesEmail = resident.contactInfo.email.toLowerCase().includes(searchTerm);
        const matchesPhone = resident.contactInfo.phoneNumber.toLowerCase().includes(searchTerm);
        const matchesAddress = resident.addressInfo.fullAddress.toLowerCase().includes(searchTerm);
        
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesAddress) {
          continue;
        }
      }

      // Apply status filter
      if (statusFilter && statusFilter !== "all" && resident.verification.status !== statusFilter) {
        continue;
      }

      residents.push({
        uid,
        name: fullName,
        email: resident.contactInfo.email,
        phone: resident.contactInfo.phoneNumber,
        address: resident.addressInfo.fullAddress,
        verificationStatus: resident.verification.status,
        registeredOn: new Date(resident.registrationDate).toLocaleDateString(),
        profileImageUrl: resident.verification.selfiePhotoUrl,
      });
    }

    // Sort by registration date (newest first)
    residents.sort((a, b) => new Date(b.registeredOn).getTime() - new Date(a.registeredOn).getTime());

    return { success: true, residents };
  } catch (error) {
    console.error("Error searching residents:", error);
    return { success: false, error: "Failed to search residents" };
  }
}
