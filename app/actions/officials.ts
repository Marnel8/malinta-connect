"use server";

import { adminDatabase } from "../firebase/admin";
import { uploadToCloudinary, deleteFromCloudinary } from "../../cloudinary/cloudinary";

export interface Official {
  id: string;
  name: string;
  position: "captain" | "councilor" | "secretary" | "treasurer" | "skChairperson";
  term: string;
  birthday: string;
  email: string;
  phone: string;
  officeHours: string;
  committees: string[];
  biography: string;
  message: string;
  projects: string[];
  achievements: string[];
  photo: string;
  photoPublicId?: string;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
}

export async function getAllOfficialsAction(): Promise<{
  success: boolean;
  officials?: Official[];
  error?: string;
}> {
  try {
    const officialsRef = adminDatabase.ref("officials");
    const snapshot = await officialsRef.get();

    if (!snapshot.exists()) {
      return { success: true, officials: [] };
    }

    const officials = snapshot.val();
    const officialsList: Official[] = Object.values(officials);
    officialsList.sort((a: Official, b: Official) => (b.createdAt || 0) - (a.createdAt || 0));

    return { success: true, officials: officialsList };
  } catch (error) {
    console.error("Error fetching officials:", error);
    return {
      success: false,
      error: "Failed to fetch officials. Please try again.",
    };
  }
}

export async function getOfficialAction(
  id: string
): Promise<{ success: boolean; official?: Official; error?: string }> {
  try {
    const officialRef = adminDatabase.ref(`officials/${id}`);
    const snapshot = await officialRef.get();

    if (!snapshot.exists()) {
      return {
        success: false,
        error: "Official not found.",
      };
    }

    return {
      success: true,
      official: snapshot.val(),
    };
  } catch (error) {
    console.error("Error fetching official:", error);
    return {
      success: false,
      error: "Failed to fetch official. Please try again.",
    };
  }
}

export async function createOfficialAction(
  formData: FormData
): Promise<{ success: boolean; official?: Official; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const position = formData.get("position") as Official["position"];
    const term = formData.get("term") as string;
    const birthday = formData.get("birthday") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const officeHours = formData.get("officeHours") as string;
    const biography = formData.get("biography") as string;
    const message = formData.get("message") as string;
    const status = formData.get("status") as Official["status"];
    
    const committees = (formData.get("committees") as string || "")
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");
    
    const projects = (formData.get("projects") as string || "")
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p !== "");
    
    const achievements = (formData.get("achievements") as string || "")
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a !== "");

    // Handle photo upload
    let photo = "";
    let photoPublicId = "";
    
    const photoFile = formData.get("photo") as File;
    if (photoFile && photoFile.size > 0) {
      try {
        const buffer = Buffer.from(await photoFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(buffer, {
          folder: "officials",
          tags: ["official", "profile"],
        });
        photo = uploadResult.secure_url;
        photoPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error("Photo upload error:", uploadError);
        return {
          success: false,
          error: "Failed to upload photo. Please try again.",
        };
      }
    }

    const now = Date.now();
    const newOfficial: Official = {
      id: `official_${now}`,
      name,
      position,
      term,
      birthday,
      email,
      phone,
      officeHours,
      committees,
      biography,
      message,
      projects,
      achievements,
      photo,
      photoPublicId,
      status,
      createdAt: now,
      updatedAt: now,
    };

    const officialRef = adminDatabase.ref(`officials/${newOfficial.id}`);
    await officialRef.set(newOfficial);

    return { success: true, official: newOfficial };
  } catch (error) {
    console.error("Error creating official:", error);
    return {
      success: false,
      error: "Failed to create official. Please try again.",
    };
  }
}

export async function updateOfficialAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; official?: Official; error?: string }> {
  try {
    const name = formData.get("name") as string;
    const position = formData.get("position") as Official["position"];
    const term = formData.get("term") as string;
    const birthday = formData.get("birthday") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const officeHours = formData.get("officeHours") as string;
    const biography = formData.get("biography") as string;
    const message = formData.get("message") as string;
    const status = formData.get("status") as Official["status"];
    
    const committees = (formData.get("committees") as string || "")
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");
    
    const projects = (formData.get("projects") as string || "")
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p !== "");
    
    const achievements = (formData.get("achievements") as string || "")
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a !== "");

    const currentOfficialRef = adminDatabase.ref(`officials/${id}`);
    const currentSnapshot = await currentOfficialRef.get();
    const currentOfficial = currentSnapshot.val();

    let photo = currentOfficial.photo;
    let photoPublicId = currentOfficial.photoPublicId;
    
    // Handle new photo upload
    const photoFile = formData.get("photo") as File;
    if (photoFile && photoFile.size > 0) {
      try {
        // Delete old photo if exists
        if (currentOfficial.photoPublicId) {
          try {
            await deleteFromCloudinary(currentOfficial.photoPublicId);
          } catch (deleteError) {
            console.warn("Failed to delete old photo:", deleteError);
          }
        }

        // Upload new photo
        const buffer = Buffer.from(await photoFile.arrayBuffer());
        const uploadResult = await uploadToCloudinary(buffer, {
          folder: "officials",
          tags: ["official", "profile"],
        });
        photo = uploadResult.secure_url;
        photoPublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error("Photo upload error:", uploadError);
        return {
          success: false,
          error: "Failed to upload photo. Please try again.",
        };
      }
    }

    const updatedOfficial: Partial<Official> = {
      name,
      position,
      term,
      birthday,
      email,
      phone,
      officeHours,
      committees,
      biography,
      message,
      projects,
      achievements,
      photo,
      photoPublicId,
      status,
      updatedAt: Date.now(),
    };

    await currentOfficialRef.update(updatedOfficial);

    return { 
      success: true, 
      official: { ...currentOfficial, ...updatedOfficial } as Official 
    };
  } catch (error) {
    console.error("Error updating official:", error);
    return {
      success: false,
      error: "Failed to update official. Please try again.",
    };
  }
}

export async function deleteOfficialAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const officialRef = adminDatabase.ref(`officials/${id}`);
    const snapshot = await officialRef.get();
    
    if (!snapshot.exists()) {
      return {
        success: false,
        error: "Official not found.",
      };
    }

    const official = snapshot.val();

    // Delete photo from Cloudinary if exists
    if (official.photoPublicId) {
      try {
        await deleteFromCloudinary(official.photoPublicId);
      } catch (deleteError) {
        console.warn("Failed to delete photo from Cloudinary:", deleteError);
      }
    }

    await officialRef.remove();

    return { success: true };
  } catch (error) {
    console.error("Error deleting official:", error);
    return {
      success: false,
      error: "Failed to delete official. Please try again.",
    };
  }
}

export async function searchOfficialsAction(
  query: string,
  positionFilter: string = "all",
  statusFilter: string = "all"
): Promise<{ success: boolean; officials?: Official[]; error?: string }> {
  try {
    const officialsRef = adminDatabase.ref("officials");
    const snapshot = await officialsRef.get();

    if (!snapshot.exists()) {
      return { success: true, officials: [] };
    }

    const officials = snapshot.val();
    let officialsList: Official[] = Object.values(officials);

    if (query) {
      officialsList = officialsList.filter((official: Official) =>
        official.name.toLowerCase().includes(query.toLowerCase()) ||
        official.email.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (positionFilter !== "all") {
      officialsList = officialsList.filter((official: Official) =>
        official.position === positionFilter
      );
    }

    if (statusFilter !== "all") {
      officialsList = officialsList.filter((official: Official) =>
        official.status === statusFilter
      );
    }

    officialsList.sort((a: Official, b: Official) => (b.createdAt || 0) - (a.createdAt || 0));

    return { success: true, officials: officialsList };
  } catch (error) {
    console.error("Error searching officials:", error);
    return {
      success: false,
      error: "Failed to search officials. Please try again.",
    };
  }
}
